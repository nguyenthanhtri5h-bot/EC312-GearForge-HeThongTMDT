<?php
/**
 * Plugin Name: GearForge Core
 * Description: Custom EC312 module for GearForge (Student Installment 3-6-12m, AES-256 ID Vault, 2-Layer Review, Compare Specs, Fraud Guard, Serial Number Tracking & T-VAN PDF Invoice).
 * Version: 1.0.0
 * Author: GearForge UIT EC312 Team
 * Requires PHP: 8.2
 * WC requires at least: 8.0
 * WC tested up to: 11.3
 * Text Domain: gearforge-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GF_CORE_VERSION', '1.0.0');
define('GF_CORE_PATH', plugin_dir_path(__FILE__));
define('GF_CORE_URL', plugin_dir_url(__FILE__));

require_once GF_CORE_PATH . 'includes/class-gf-rbac.php';
require_once GF_CORE_PATH . 'includes/class-gf-activator.php';
require_once GF_CORE_PATH . 'includes/class-gf-fraud-guard.php';
require_once GF_CORE_PATH . 'includes/class-gf-installment-calc.php';
require_once GF_CORE_PATH . 'includes/class-gf-vault-crypto.php';
require_once GF_CORE_PATH . 'includes/class-gf-compare-specs.php';
require_once GF_CORE_PATH . 'includes/class-gf-installment-review.php';
require_once GF_CORE_PATH . 'includes/class-gf-payment-sandbox.php';
require_once GF_CORE_PATH . 'includes/class-gf-serial-manager.php';
require_once GF_CORE_PATH . 'includes/class-gf-invoice-pdf.php';
require_once GF_CORE_PATH . 'admin/class-gf-admin-pages.php';

register_activation_hook(__FILE__, ['GF_Activator', 'activate']);

final class GF_Core {
    /**
     * Domain-standardized OrderStatus map aligned with Tu dien thuat ngu.
     */
    public const ORDER_STATUS_MAP = [
        'pending'        => 'PENDING_PAYMENT',
        'gf-installment' => 'PENDING_INSTALLMENT_APPROVAL',
        'processing'     => 'PROCESSING',
        'gf-serial-ready'=> 'SERIAL_ASSIGNED',
        'gf-shipping'    => 'SHIPPING',
        'gf-delivered'   => 'DELIVERED',
        'completed'      => 'COMPLETED',
        'cancelled'      => 'CANCELLED',
        'refunded'       => 'REFUNDED',
        'on-hold'        => 'PENDING_PAYMENT',
    ];

    public static function init(): void {
        add_action('before_woocommerce_init', [self::class, 'declare_hpos_compatibility']);
        add_action('init', [self::class, 'register_custom_order_statuses']);
        add_filter('wc_order_statuses', [self::class, 'add_custom_order_statuses']);
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_frontend_assets']);
        add_action('rest_api_init', [self::class, 'register_rest_routes']);

        GF_RBAC::init();
        GF_Compare_Specs::init();
        GF_Installment_Review::init();
        GF_Vault_Crypto::init();
        GF_Payment_Sandbox::init();
        GF_Serial_Manager::init();
        GF_Invoice_PDF::init();
        GF_Admin_Pages::init();

        add_shortcode('gearforge_compare', [GF_Compare_Specs::class, 'render_shortcode']);
        add_shortcode('gearforge_installment_widget', [self::class, 'render_installment_shortcode']);
        add_shortcode('gearforge_oms_tracking', [self::class, 'render_oms_shortcode']);

        add_action('woocommerce_single_product_summary', [self::class, 'render_product_installment_preview'], 25);
        add_action('woocommerce_after_shop_loop_item', [self::class, 'render_loop_product_badges'], 5);
        add_action('woocommerce_after_shop_loop_item', [self::class, 'render_loop_compare_button'], 15);
        add_action('woocommerce_order_details_before_order_table', [self::class, 'render_my_account_oms_stepper'], 10, 1);
    }

    public static function declare_hpos_compatibility(): void {
        if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, false);
        }
    }

    public static function register_custom_order_statuses(): void {
        $statuses = [
            'wc-gf-installment'  => 'Chờ duyệt trả góp SV',
            'wc-gf-serial-ready' => 'Đã gắn S/N xuất kho',
            'wc-gf-shipping'     => 'Đang giao hàng',
            'wc-gf-delivered'    => 'Đã giao (Kích hoạt BH)',
        ];
        foreach ($statuses as $slug => $label) {
            register_post_status($slug, [
                'label'                     => $label,
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                'label_count'               => _n_noop("$label (%s)", "$label (%s)"),
            ]);
        }
    }

    public static function add_custom_order_statuses(array $order_statuses): array {
        $new_statuses = [];
        foreach ($order_statuses as $key => $label) {
            $new_statuses[$key] = $label;
            if ($key === 'wc-pending') {
                $new_statuses['wc-gf-installment'] = 'Chờ duyệt trả góp SV';
            }
            if ($key === 'wc-processing') {
                $new_statuses['wc-gf-serial-ready'] = 'Đã gắn S/N xuất kho';
                $new_statuses['wc-gf-shipping']     = 'Đang giao hàng';
                $new_statuses['wc-gf-delivered']    = 'Đã giao (Kích hoạt BH)';
            }
        }
        return $new_statuses;
    }

    public static function map_order_status(string $wc_status): string {
        $clean = str_replace('wc-', '', $wc_status);
        return self::ORDER_STATUS_MAP[$clean] ?? 'CREATED';
    }

    public static function enqueue_frontend_assets(): void {
        wp_enqueue_style(
            'gearforge-frontend',
            GF_CORE_URL . 'assets/css/gearforge-frontend.css',
            [],
            GF_CORE_VERSION
        );
        wp_enqueue_script(
            'gearforge-frontend',
            GF_CORE_URL . 'assets/js/gearforge-frontend.js',
            ['jquery'],
            GF_CORE_VERSION,
            true
        );
        wp_localize_script('gearforge-frontend', 'gfConfig', [
            'ajaxUrl'   => admin_url('admin-ajax.php'),
            'restUrl'   => esc_url_raw(rest_url('gearforge/v1')),
            'restNonce' => wp_create_nonce('wp_rest'),
            'ajaxNonce' => wp_create_nonce('gf_frontend_nonce'),
            'compareUrl'=> home_url('/so-sanh-cau-hinh/'),
            'maxCompare'=> 3,
        ]);
    }

    public static function register_rest_routes(): void {
        register_rest_route('gearforge/v1', '/installment-calc', [
            'methods'             => 'GET',
            'callback'            => [GF_Installment_Calc::class, 'rest_calculate'],
            'permission_callback' => '__return_true',
            'args'                => [
                'price'    => ['required' => true, 'validate_callback' => static fn($v): bool => is_numeric($v) && (float) $v > 0],
                'down_pct' => ['required' => false, 'default' => 20, 'validate_callback' => static fn($v): bool => is_numeric($v) && (float) $v >= 0 && (float) $v <= 80],
                'months'   => ['required' => false, 'default' => 6, 'validate_callback' => static fn($v): bool => in_array((int) $v, [3, 6, 12], true)],
            ],
        ]);

        register_rest_route('gearforge/v1', '/oms-status/(?P<order_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [self::class, 'rest_get_oms_status'],
            'permission_callback' => [self::class, 'can_view_order_rest'],
            'args'                => [
                'order_id' => ['required' => true, 'validate_callback' => static fn($v): bool => is_numeric($v) && (int) $v > 0],
            ],
        ]);

        register_rest_route('gearforge/v1', '/installment/submit', [
            'methods'             => 'POST',
            'callback'            => [GF_Installment_Review::class, 'rest_submit_application'],
            'permission_callback' => static fn(): bool => is_user_logged_in(),
        ]);

        register_rest_route('gearforge/v1', '/warranty/request', [
            'methods'             => 'POST',
            'callback'            => [GF_Serial_Manager::class, 'rest_request_warranty'],
            'permission_callback' => static fn(): bool => is_user_logged_in(),
            'args'                => [
                'order_id'      => ['required' => true, 'validate_callback' => static fn($v): bool => is_numeric($v) && (int) $v > 0],
                'serial_number' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                'reason'        => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
            ],
        ]);
    }

    public static function can_view_order_rest(WP_REST_Request $request): bool {
        if (!is_user_logged_in()) {
            return false;
        }
        $order_id = (int) $request->get_param('order_id');
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return false;
        }
        return current_user_can('manage_woocommerce')
            || current_user_can(GF_RBAC::CAP_REVIEW_INSTALLMENTS)
            || (int) $order->get_customer_id() === get_current_user_id();
    }

    public static function rest_get_oms_status(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $order_id = (int) $request->get_param('order_id');
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_REST_Response(['error' => 'Order not found'], 404);
        }

        $app = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT app_id, plan_id, student_code, student_edu_email, downpayment_amount, monthly_amount, status, l1_verified_at, l2_verified_at, reject_reason
                 FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d ORDER BY app_id DESC LIMIT 1",
                $order_id
            ),
            ARRAY_A
        );

        $serials = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT product_id, serial_number, warranty_months, warranty_end_date, assigned_at
                 FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d",
                $order_id
            ),
            ARRAY_A
        );

        return new WP_REST_Response([
            'order_id'               => $order_id,
            'wc_status'              => $order->get_status(),
            'domain_order_status'    => self::map_order_status($order->get_status()),
            'total'                  => (float) $order->get_total(),
            'installment_application'=> $app ?: null,
            'serial_numbers'         => $serials ?: [],
        ], 200);
    }

    public static function render_installment_shortcode(array $atts = []): string {
        $atts = shortcode_atts(['product_id' => 0], $atts);
        $product_id = (int) $atts['product_id'] ?: get_the_ID();
        $product = function_exists('wc_get_product') && $product_id ? wc_get_product($product_id) : null;
        $price = $product ? (float) $product->get_price() : 0.0;
        $plans = GF_Installment_Calc::get_active_plans();

        ob_start();
        include GF_CORE_PATH . 'templates/installment-widget.php';
        return (string) ob_get_clean();
    }

    public static function render_oms_shortcode(array $atts = []): string {
        $atts = shortcode_atts(['order_id' => 0], $atts);
        $order_id = (int) ($atts['order_id'] ?: ($_GET['order_id'] ?? 0));
        ob_start();
        include GF_CORE_PATH . 'templates/oms-tracking-stepper.php';
        return (string) ob_get_clean();
    }

    public static function render_product_installment_preview(): void {
        global $product;
        if (!$product instanceof WC_Product) {
            return;
        }
        $price = (float) $product->get_price();
        if ($price <= 0) {
            return;
        }
        $calc_3m = GF_Installment_Calc::calculate($price, 20, 3);
        echo '<div class="gf-product-installment-cta">';
        echo '<div class="gf-cta-badge">Ưu đãi Sinh viên: Trả góp 0% (3 tháng) chỉ từ <strong>' . esc_html(number_format($calc_3m['monthly_amount'], 0, ',', '.')) . 'đ/tháng</strong></div>';
        echo '<div class="gf-cta-actions">';
        echo '<button type="button" class="gf-btn gf-btn-secondary gf-add-compare" data-product-id="' . esc_attr((string) $product->get_id()) . '">+ So sánh cấu hình</button>';
        echo '</div></div>';
        echo do_shortcode('[gearforge_installment_widget product_id="' . (int) $product->get_id() . '"]');
    }

    public static function render_loop_product_badges(): void {
        global $product;
        if (!$product instanceof WC_Product) {
            return;
        }
        $price = (float) $product->get_price();
        $cpu = $product->get_attribute('pa_cpu') ?: $product->get_attribute('CPU');
        $ram = $product->get_attribute('pa_ram') ?: $product->get_attribute('RAM');
        $gpu = $product->get_attribute('pa_gpu') ?: $product->get_attribute('GPU');

        $specs = array_filter([$cpu, $ram, $gpu]);
        if (!empty($specs)) {
            echo '<div class="gf-card-specs">';
            foreach ($specs as $sp) {
                echo '<span class="gf-spec-chip">' . esc_html($sp) . '</span>';
            }
            echo '</div>';
        }
        if ($price >= 3000000) {
            $calc = GF_Installment_Calc::calculate($price, 20, 3);
            echo '<div class="gf-card-installment-tag">Góp SV 0%: ' . esc_html(number_format($calc['monthly_amount'], 0, ',', '.')) . 'đ/th</div>';
        }
    }

    public static function render_loop_compare_button(): void {
        global $product;
        if (!$product instanceof WC_Product) {
            return;
        }
        echo '<button type="button" class="gf-btn-compare-card gf-add-compare" data-product-id="' . esc_attr((string) $product->get_id()) . '">+ So sánh cấu hình</button>';
    }

    public static function render_my_account_oms_stepper(WC_Order $order): void {
        $order_id = $order->get_id();
        include GF_CORE_PATH . 'templates/oms-tracking-stepper.php';
    }
}

add_action('plugins_loaded', ['GF_Core', 'init']);
