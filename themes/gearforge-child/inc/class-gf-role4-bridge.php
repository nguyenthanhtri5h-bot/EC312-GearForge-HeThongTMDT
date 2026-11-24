<?php
/**
 * Theme REST Bridge connecting Role 3 React Installment Drawer to Role 4 REST APIs.
 */

if (!defined('ABSPATH')) {
    exit;
}

final class GF_Role4_Bridge {
    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void {
        register_rest_route('gf/v1', '/installment/start', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_start_installment_order'],
            'permission_callback' => static fn(): bool => is_user_logged_in() && current_user_can('read'),
            'args'                => [
                'product_id' => ['required' => true, 'type' => 'integer', 'minimum' => 1, 'sanitize_callback' => 'absint'],
                'qty'        => ['required' => false, 'type' => 'integer', 'default' => 1, 'minimum' => 1, 'maximum' => 3, 'sanitize_callback' => 'absint'],
            ],
        ]);
    }

    /**
     * Find an existing unpaid draft order for the same user + product so retry attempts
     * stay idempotent instead of accumulating orphan pending orders.
     */
    private static function find_reusable_draft_order(int $user_id, int $product_id): ?WC_Order {
        if (!function_exists('wc_get_orders')) {
            return null;
        }
        $candidates = wc_get_orders([
            'customer_id' => $user_id,
            'status'      => ['pending'],
            'limit'       => 10,
            'orderby'     => 'date',
            'order'       => 'DESC',
            'meta_query'  => [
                ['key' => '_gf_installment_draft', 'value' => '1', 'compare' => '='],
            ],
        ]);
        foreach ($candidates as $candidate) {
            if (!$candidate instanceof WC_Order) {
                continue;
            }
            if (class_exists('GF_Installment_Review') && GF_Installment_Review::get_application_by_order($candidate->get_id())) {
                continue;
            }
            foreach ($candidate->get_items() as $item) {
                if ($item instanceof WC_Order_Item_Product && (int) $item->get_product_id() === $product_id) {
                    return $candidate;
                }
            }
        }
        return null;
    }

    /**
     * Create a validated pending WooCommerce order under MySQL advisory lock so Role 4's
     * /gearforge/v1/installment-apply validates ownership, stock, and encrypted identity docs.
     */
    public static function handle_start_installment_order(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_create_order') || !function_exists('wc_get_product')) {
            return new WP_REST_Response(['code' => 'gf_wc_missing', 'message' => 'WooCommerce chưa sẵn sàng.'], 500);
        }

        $user_id    = get_current_user_id();
        $product_id = max(0, (int) $request->get_param('product_id'));
        $qty        = max(1, min(3, (int) ($request->get_param('qty') ?: 1)));
        if ($product_id <= 0) {
            return new WP_REST_Response(['code' => 'gf_invalid_product', 'message' => 'Mã sản phẩm không hợp lệ.'], 400);
        }

        if (function_exists('gf_core_check_rate_limit')) {
            $rl_user = gf_core_check_rate_limit('installment_start_u', 15, 60, 'u' . $user_id);
            if (is_wp_error($rl_user)) {
                return gf_core_rate_limit_rest_response($rl_user);
            }
            $rl_ip = gf_core_check_rate_limit('installment_start_ip', 30, 60);
            if (is_wp_error($rl_ip)) {
                return gf_core_rate_limit_rest_response($rl_ip);
            }
        }

        $product = wc_get_product($product_id);
        if (!$product instanceof WC_Product || $product->get_status() !== 'publish') {
            return new WP_REST_Response(['code' => 'gf_invalid_product', 'message' => 'Sản phẩm không tồn tại hoặc ngừng kinh doanh.'], 404);
        }
        if (!$product->is_purchasable() || !$product->is_in_stock() || !$product->has_enough_stock($qty)) {
            return new WP_REST_Response(['code' => 'gf_out_of_stock', 'message' => 'Sản phẩm hiện không đủ tồn kho.'], 409);
        }
        if ((int) round((float) $product->get_price()) < 3000000) {
            return new WP_REST_Response(['code' => 'gf_below_min_price', 'message' => 'Trả góp áp dụng cho đơn từ 3.000.000đ trở lên.'], 400);
        }

        global $wpdb;
        $lock_name = "gf_start_{$user_id}_{$product_id}";
        $locked    = (int) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 3)', $lock_name));
        if ($locked !== 1) {
            return new WP_REST_Response(['code' => 'gf_lock_busy', 'message' => 'Đang khởi tạo đơn hàng, vui lòng thử lại.'], 429);
        }

        try {
            $reusable = self::find_reusable_draft_order($user_id, $product_id);
            if ($reusable instanceof WC_Order) {
                $reusable->calculate_totals();
                $reusable->save();
                return new WP_REST_Response([
                    'order_id' => $reusable->get_id(),
                    'total'    => (float) $reusable->get_total(),
                    'status'   => $reusable->get_status(),
                    'reused'   => true,
                ], 200);
            }

            $user  = wp_get_current_user();
            $order = wc_create_order(['customer_id' => $user_id, 'status' => 'pending']);
            if (is_wp_error($order) || !$order instanceof WC_Order) {
                return new WP_REST_Response(['code' => 'gf_order_create_failed', 'message' => 'Không thể khởi tạo đơn hàng trả góp.'], 500);
            }

            $order->add_product($product, $qty);
            $order->set_billing_email($user->user_email ?: '');
            $order->set_billing_first_name($user->display_name ?: $user->user_login);
            $order->set_payment_method('gearforge_sandbox');
            $order->set_payment_method_title('Trả góp Sinh viên GearForge');
            $order->update_meta_data('_gf_installment_draft', '1');
            $order->calculate_totals();
            $order->save();

            return new WP_REST_Response([
                'order_id' => $order->get_id(),
                'total'    => (float) $order->get_total(),
                'status'   => $order->get_status(),
                'reused'   => false,
            ], 201);
        } finally {
            $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
        }
    }
}

GF_Role4_Bridge::init();
