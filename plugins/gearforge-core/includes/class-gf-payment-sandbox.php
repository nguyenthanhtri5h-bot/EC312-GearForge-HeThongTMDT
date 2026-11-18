<?php
/**
 * Sandbox Payment Gateway Adapter (VNPay, MoMo, Fundiin) with 3D-Secure OTP & HMAC IPN.
 *
 * Handles downpayment checkout after 2-layer approval (APPROVED_WAITING_DOWNPAYMENT)
 * and transitions orders to PROCESSING / ACTIVE_INSTALLMENT upon verified IPN callback.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Payment_Sandbox {

    private const SANDBOX_OTP       = '123456';
    private const SUPPORTED_GATEWAY = ['vnpay', 'momo', 'fundiin'];

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
        add_action('template_redirect', [self::class, 'handle_sandbox_3ds_page']);
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/payment-sandbox/ipn', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_ipn_callback'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('gearforge/v1', '/oms-status/(?P<order_id>\d+)', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [self::class, 'handle_oms_status_request'],
            'permission_callback' => [self::class, 'check_order_access_permission'],
        ]);
    }

    /**
     * Prevent IDOR on /oms-status/{order_id}: allow only the order owner or store operators.
     */
    public static function check_order_access_permission(WP_REST_Request $request): bool {
        if (!is_user_logged_in()) {
            return false;
        }

        if (current_user_can('manage_woocommerce') || current_user_can('gf_review_installments')) {
            return true;
        }

        if (!function_exists('wc_get_order')) {
            return false;
        }

        $order = wc_get_order((int) $request->get_param('order_id'));
        if (!$order) {
            return false;
        }

        $current_user_id = get_current_user_id();
        return $current_user_id > 0 && (int) $order->get_customer_id() === $current_user_id;
    }

    /**
     * Build a signed Sandbox 3D-Secure checkout URL for an order or installment downpayment.
     *
     * @return string|WP_Error
     */
    public static function create_sandbox_payment_session(int $order_id, string $provider = 'vnpay', string $mode = 'downpayment') {
        $provider = strtolower($provider);
        if (!in_array($provider, self::SUPPORTED_GATEWAY, true)) {
            return new WP_Error('gf_unsupported_gateway', 'Cổng thanh toán Sandbox chỉ hỗ trợ vnpay, momo hoặc fundiin.');
        }

        $amount = self::resolve_payable_amount($order_id, $mode);
        if (is_wp_error($amount)) {
            return $amount;
        }

        $nonce_sig = self::compute_hmac_signature($order_id, $amount, $provider, $mode);

        return add_query_arg(
            [
                'gf_sandbox_3ds' => '1',
                'order_id'       => $order_id,
                'provider'       => $provider,
                'mode'           => $mode,
                'amount'         => $amount,
                'sig'            => $nonce_sig,
            ],
            home_url('/')
        );
    }

    /**
     * Render interactive Sandbox 3D-Secure OTP verification page when ?gf_sandbox_3ds=1.
     */
    public static function handle_sandbox_3ds_page(): void {
        if (empty($_GET['gf_sandbox_3ds'])) {
            return;
        }

        $order_id = (int) ($_GET['order_id'] ?? 0);
        $provider = sanitize_key($_GET['provider'] ?? 'vnpay');
        $mode     = sanitize_key($_GET['mode'] ?? 'downpayment');
        $amount   = (int) ($_GET['amount'] ?? 0);
        $sig      = sanitize_text_field($_GET['sig'] ?? '');

        if (!self::verify_hmac_signature($order_id, $amount, $provider, $mode, $sig)) {
            wp_die('Chữ ký phiên thanh toán Sandbox không hợp lệ (HMAC mismatch).', '403 Forbidden', ['response' => 403]);
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gf_otp_code'])) {
            check_admin_referer('gf_3ds_submit_' . $order_id);
            $otp = sanitize_text_field($_POST['gf_otp_code']);

            if ($otp !== self::SANDBOX_OTP) {
                $error_msg = 'Mã OTP 3D-Secure không chính xác (Mã test hợp lệ: 123456).';
            } else {
                $txn_ref = strtoupper($provider) . '-' . gmdate('YmdHis') . '-' . $order_id;
                $result  = self::finalize_verified_payment($order_id, $amount, $provider, $mode, $txn_ref);
                if (!is_wp_error($result)) {
                    wp_safe_redirect(add_query_arg('gf_paid', '1', home_url('/')));
                    exit;
                }
                $error_msg = $result->get_error_message();
            }
        }

        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>GearForge Sandbox 3D-Secure</title></head>';
        echo '<body style="font-family:sans-serif;max-width:460px;margin:48px auto;padding:24px;border:1px solid #ddd;border-radius:8px;">';
        echo '<h2>Cổng Thanh toán Sandbox (' . esc_html(strtoupper($provider)) . ' 3D-Secure)</h2>';
        echo '<p>Đơn hàng: <strong>#' . $order_id . '</strong> | Chế độ: <code>' . esc_html($mode) . '</code></p>';
        echo '<p>Số tiền thanh toán: <strong style="color:#d9534f;">' . number_format($amount) . ' VNĐ</strong></p>';
        if (!empty($error_msg)) {
            echo '<p style="color:#c9302c;font-weight:bold;">' . esc_html($error_msg) . '</p>';
        }
        echo '<form method="post">';
        wp_nonce_field('gf_3ds_submit_' . $order_id);
        echo '<label>Nhập mã OTP 3D-Secure (mặc định test: <code>123456</code>):</label><br/>';
        echo '<input type="text" name="gf_otp_code" value="123456" style="width:100%;padding:8px;margin:8px 0;" required />';
        echo '<button type="submit" style="width:100%;padding:10px;background:#0d6efd;color:#fff;border:none;border-radius:4px;cursor:pointer;">Xác nhận Thanh toán Sandbox</button>';
        echo '</form></body></html>';
        exit;
    }

    /**
     * REST IPN Webhook handler verifying HMAC signature before updating order & installment states.
     */
    public static function handle_ipn_callback(WP_REST_Request $request) {
        $params   = $request->get_json_params() ?: $request->get_params();
        $order_id = (int) ($params['order_id'] ?? 0);
        $amount   = (int) ($params['amount'] ?? 0);
        $provider = sanitize_key($params['provider'] ?? 'vnpay');
        $mode     = sanitize_key($params['mode'] ?? 'downpayment');
        $txn_ref  = sanitize_text_field($params['transaction_ref'] ?? '');
        $sig      = sanitize_text_field($params['signature'] ?? '');

        if (!self::verify_hmac_signature($order_id, $amount, $provider, $mode, $sig)) {
            return new WP_REST_Response(['code' => 'gf_invalid_hmac', 'message' => 'Chữ ký IPN không hợp lệ.'], 403);
        }

        $result = self::finalize_verified_payment($order_id, $amount, $provider, $mode, $txn_ref);
        if (is_wp_error($result)) {
            return new WP_REST_Response(['code' => $result->get_error_code(), 'message' => $result->get_error_message()], 400);
        }

        return rest_ensure_response(['status' => 'success', 'order_id' => $order_id, 'transaction_ref' => $txn_ref]);
    }

    /**
     * REST OMS Status endpoint combining OrderStatus, InstallmentApplicationStatus & Serial Numbers.
     */
    public static function handle_oms_status_request(WP_REST_Request $request) {
        global $wpdb;

        $order_id = (int) $request->get_param('order_id');
        $order    = function_exists('wc_get_order') ? wc_get_order($order_id) : null;

        if (!$order) {
            return new WP_REST_Response(['code' => 'gf_order_not_found', 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        $app     = class_exists('GF_Installment_Review') ? GF_Installment_Review::get_application_by_order($order_id) : null;
        $serials = $wpdb->get_col(
            $wpdb->prepare("SELECT serial_number FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d", $order_id)
        );

        return rest_ensure_response([
            'order_id'           => $order_id,
            'order_status'       => $order->get_status(),
            'installment_status' => $app ? $app['status'] : null,
            'transaction_ref'    => $order->get_meta('_gf_transaction_ref') ?: null,
            'serial_numbers'     => $serials ?: [],
        ]);
    }

    /**
     * Update WooCommerce Order to PROCESSING and Installment Application to ACTIVE_INSTALLMENT.
     *
     * @return true|WP_Error
     */
    public static function finalize_verified_payment(int $order_id, int $amount, string $provider, string $mode, string $txn_ref) {
        global $wpdb;

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_Error('gf_order_not_found', 'Không tìm thấy đơn hàng WooCommerce.');
        }

        if ($mode === 'downpayment') {
            $app = GF_Installment_Review::get_application_by_order($order_id);
            if (!$app || $app['status'] !== 'APPROVED_WAITING_DOWNPAYMENT') {
                return new WP_Error('gf_app_not_approved', 'Hồ sơ trả góp chưa được duyệt qua 2 lớp để thanh toán tiền cọc.');
            }

            $wpdb->update(
                "{$wpdb->prefix}gf_installment_applications",
                ['status' => 'ACTIVE_INSTALLMENT'],
                ['app_id' => (int) $app['app_id']],
                ['%s'],
                ['%d']
            );
        }

        $order->update_meta_data('_gf_transaction_ref', $txn_ref);
        $order->update_meta_data('_gf_payment_provider', strtoupper($provider));
        $order->update_meta_data('_gf_paid_amount', $amount);
        $order->payment_complete($txn_ref);
        $order->add_order_note(sprintf('GearForge Sandbox (%s): Đã nhận %s VNĐ. Mã GD: %s', strtoupper($provider), number_format($amount), $txn_ref));
        $order->save();

        return true;
    }

    public static function compute_hmac_signature(int $order_id, int $amount, string $provider, string $mode): string {
        $secret  = self::get_hmac_secret();
        $payload = "{$order_id}|{$amount}|{$provider}|{$mode}";
        return hash_hmac('sha256', $payload, $secret);
    }

    public static function verify_hmac_signature(int $order_id, int $amount, string $provider, string $mode, string $sig): bool {
        if ($order_id <= 0 || $amount <= 0 || $sig === '') {
            return false;
        }
        $expected = self::compute_hmac_signature($order_id, $amount, $provider, $mode);
        return hash_equals($expected, $sig);
    }

    private static function resolve_payable_amount(int $order_id, string $mode) {
        if ($mode === 'downpayment') {
            $app = GF_Installment_Review::get_application_by_order($order_id);
            if (!$app) {
                return new WP_Error('gf_app_not_found', 'Không tìm thấy hồ sơ trả góp gắn với đơn hàng.');
            }
            return (int) round((float) $app['downpayment_amount']);
        }

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_Error('gf_order_not_found', 'Không tìm thấy đơn hàng.');
        }
        return (int) round((float) $order->get_total());
    }

    private static function get_hmac_secret(): string {
        $key = getenv('GF_VAULT_ENCRYPTION_KEY');
        return $key ? $key : wp_salt('auth');
    }
}

GF_Payment_Sandbox::init();
