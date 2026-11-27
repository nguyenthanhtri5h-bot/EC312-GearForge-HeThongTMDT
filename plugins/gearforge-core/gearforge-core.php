<?php
/**
 * Plugin Name: GearForge Core
 * Plugin URI:  https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT
 * Description: Custom Microkernel Plugin cho Hệ thống TMĐT GearForge (EC312 - UIT): Trả góp Sinh viên 3-6-12 tháng, Mã hóa NĐ 13/2023, Duyệt 2 lớp, So sánh cấu hình, Fraud Guard, Sandbox 3DS, Serial Number, RMA & Hóa đơn PDF T-VAN.
 * Version:     1.0.0
 * Author:      Nhóm 7 - EC312 UIT
 * Requires PHP: 8.2
 * WC requires at least: 8.0
 * WC tested up to: 11.3
 * Text Domain: gearforge-core
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('GF_CORE_VERSION')) {
    define('GF_CORE_VERSION', '1.0.2');
}
if (!defined('GF_CORE_PATH')) {
    define('GF_CORE_PATH', plugin_dir_path(__FILE__));
}
if (!defined('GF_CORE_URL')) {
    define('GF_CORE_URL', plugin_dir_url(__FILE__));
}
if (!defined('GF_VAULT_DIR')) {
    $env_vault_dir = getenv('GF_VAULT_DIR');
    define('GF_VAULT_DIR', $env_vault_dir ? $env_vault_dir : '/var/www/gf-vault');
}

require_once GF_CORE_PATH . 'includes/class-gf-activator.php';

if (!function_exists('gf_core_check_rate_limit')) {
    /**
     * Lightweight per-endpoint Layer 7 rate limiter scoped strictly to Role 4 routes.
     * Uses REMOTE_ADDR (never spoofable proxy headers) + optional user identity.
     *
     * @return true|WP_Error
     */
    function gf_core_check_rate_limit(string $scope, int $limit, int $window_sec = 60, string $identity = '', bool $force_in_cli = false) {
        if (PHP_SAPI === 'cli' && !$force_in_cli) {
            return true;
        }

        $remote_ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        $subject   = $identity !== '' ? $identity : $remote_ip;
        $key       = 'gf_rl_' . md5($scope . '|' . $subject);

        $record = get_transient($key);
        $now    = time();

        if (!is_array($record) || ($record['reset'] ?? 0) <= $now) {
            set_transient($key, ['count' => 1, 'reset' => $now + $window_sec], $window_sec);
            return true;
        }

        $count = (int) ($record['count'] ?? 0) + 1;
        if ($count > $limit) {
            $retry_after = max(1, (int) $record['reset'] - $now);
            return new WP_Error(
                'gf_rate_limited',
                sprintf('Quá nhiều yêu cầu (%s). Vui lòng thử lại sau %d giây.', $scope, $retry_after),
                ['retry_after' => $retry_after]
            );
        }

        $ttl = max(1, (int) $record['reset'] - $now);
        set_transient($key, ['count' => $count, 'reset' => (int) $record['reset']], $ttl);
        return true;
    }
}

if (!function_exists('gf_core_rate_limit_rest_response')) {
    /**
     * Convert a gf_rate_limited WP_Error into an HTTP 429 WP_REST_Response.
     */
    function gf_core_rate_limit_rest_response(WP_Error $error): WP_REST_Response {
        $data        = $error->get_error_data();
        $retry_after = is_array($data) && !empty($data['retry_after']) ? (int) $data['retry_after'] : 60;
        $response    = new WP_REST_Response(
            ['code' => $error->get_error_code(), 'message' => $error->get_error_message()],
            429
        );
        $response->header('Retry-After', (string) $retry_after);
        return $response;
    }
}

if (!class_exists('GF_Core')) {
    final class GF_Core {
        private static bool $bootstrapped = false;

        public const ORDER_STATUS_MAP = [
            'pending'         => 'PENDING_PAYMENT',
            'gf-installment'  => 'PENDING_INSTALLMENT_APPROVAL',
            'processing'      => 'PROCESSING',
            'gf-serial'       => 'SERIAL_ASSIGNED',
            'gf-serial-ready' => 'SERIAL_ASSIGNED',
            'gf-shipping'     => 'SHIPPING',
            'gf-delivered'    => 'DELIVERED',
            'completed'       => 'COMPLETED',
            'cancelled'       => 'CANCELLED',
            'refunded'        => 'REFUNDED',
            'on-hold'         => 'PENDING_PAYMENT',
        ];

        public static function activate(): void {
            GF_Activator::activate();
            $rbac_file = GF_CORE_PATH . 'includes/class-gf-rbac.php';
            if (!class_exists('GF_RBAC') && file_exists($rbac_file)) {
                require_once $rbac_file;
            }
            if (class_exists('GF_RBAC')) {
                GF_RBAC::register_roles_and_caps();
            }
        }

        public static function declare_hpos_compatibility(): void {
            if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
                \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
                \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, false);
            }
        }

        public static function bootstrap(): void {
            if (self::$bootstrapped) {
                return;
            }
            self::$bootstrapped = true;

            $modules = [
                // Role 4 core modules (self-initializing via ::init() at EOF where applicable)
                'includes/class-gf-installment-calc.php',
                'includes/class-gf-vault-crypto.php',
                'includes/class-gf-installment-review.php',
                'includes/class-gf-payment-sandbox.php',
                'includes/class-gf-serial-manager.php',
                'includes/class-gf-invoice-pdf.php',
                'includes/class-gf-rma-manager.php',
                'admin/class-gf-admin-pages.php',
                // Rescued shared modules
                'includes/class-gf-rbac.php',
                'includes/class-gf-fraud-guard.php',
                'includes/class-gf-compare-specs.php',
            ];

            foreach ($modules as $relative_path) {
                $full_path = GF_CORE_PATH . $relative_path;
                if (file_exists($full_path)) {
                    require_once $full_path;
                }
            }

            if (class_exists('WC_Payment_Gateway')) {
                $wc_gw = GF_CORE_PATH . 'includes/class-gf-gateway-sandbox-wc.php';
                if (file_exists($wc_gw)) {
                    require_once $wc_gw;
                }
                add_filter('woocommerce_payment_gateways', [self::class, 'register_wc_gateway']);
            }

            if (class_exists('GF_RBAC')) {
                GF_RBAC::init();
            }
            if (class_exists('GF_Compare_Specs')) {
                GF_Compare_Specs::init();
                add_shortcode('gearforge_compare', [GF_Compare_Specs::class, 'render_shortcode']);
            }

            add_action('init', [self::class, 'register_custom_order_statuses'], 20);
            add_filter('wc_order_statuses', [self::class, 'add_custom_order_statuses'], 20);
            add_action('wp_enqueue_scripts', [self::class, 'enqueue_frontend_assets']);
            add_action('rest_api_init', [self::class, 'register_bridge_rest_routes']);

            add_action('wp_ajax_gf_submit_installment_app', [self::class, 'ajax_submit_installment_app']);
            add_action('wp_ajax_nopriv_gf_submit_installment_app', [self::class, 'ajax_require_login']);

            add_shortcode('gearforge_installment_widget', [self::class, 'render_installment_shortcode']);
            add_shortcode('gearforge_oms_tracking', [self::class, 'render_oms_shortcode']);

            add_action('woocommerce_single_product_summary', [self::class, 'render_product_installment_preview'], 25);
            add_action('woocommerce_after_shop_loop_item', [self::class, 'render_loop_product_badges'], 5);
            add_action('woocommerce_after_shop_loop_item', [self::class, 'render_loop_compare_button'], 15);
            add_action('woocommerce_order_details_before_order_table', [self::class, 'render_my_account_oms_stepper'], 10, 1);
        }

        public static function register_wc_gateway(array $gateways): array {
            if (class_exists('GF_Gateway_Sandbox_WC') && !in_array('GF_Gateway_Sandbox_WC', $gateways, true)) {
                $gateways[] = 'GF_Gateway_Sandbox_WC';
            }
            return $gateways;
        }

        public static function register_custom_order_statuses(): void {
            $statuses = [
                'wc-gf-installment'  => 'Chờ duyệt trả góp SV',
                'wc-gf-serial-ready' => 'Đã gắn S/N xuất kho',
                'wc-gf-shipping'     => 'Đang giao hàng',
                'wc-gf-delivered'    => 'Đã giao (Kích hoạt BH)',
            ];
            foreach ($statuses as $slug => $label) {
                if (get_post_status_object($slug) !== null) {
                    continue;
                }
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
            $custom = [
                'wc-gf-installment'  => 'Chờ duyệt trả góp SV',
                'wc-gf-serial-ready' => 'Đã gắn S/N xuất kho',
                'wc-gf-shipping'     => 'Đang giao hàng',
                'wc-gf-delivered'    => 'Đã giao (Kích hoạt BH)',
            ];
            $merged = [];
            foreach ($order_statuses as $key => $label) {
                $merged[$key] = $label;
                if ($key === 'wc-pending') {
                    $merged['wc-gf-installment'] = $custom['wc-gf-installment'];
                }
                if ($key === 'wc-processing') {
                    $merged['wc-gf-serial-ready'] = $custom['wc-gf-serial-ready'];
                    $merged['wc-gf-shipping']     = $custom['wc-gf-shipping'];
                    $merged['wc-gf-delivered']    = $custom['wc-gf-delivered'];
                }
            }
            foreach ($custom as $slug => $label) {
                if (!isset($merged[$slug])) {
                    $merged[$slug] = $label;
                }
            }
            return $merged;
        }

        public static function map_order_status(string $wc_status): string {
            $clean = str_replace('wc-', '', $wc_status);
            return self::ORDER_STATUS_MAP[$clean] ?? 'CREATED';
        }

        public static function enqueue_frontend_assets(): void {
            wp_enqueue_style('gearforge-frontend', GF_CORE_URL . 'assets/css/gearforge-frontend.css', [], GF_CORE_VERSION);
            wp_enqueue_script('gearforge-frontend', GF_CORE_URL . 'assets/js/gearforge-frontend.js', ['jquery'], GF_CORE_VERSION, true);
            wp_localize_script('gearforge-frontend', 'gfConfig', [
                'ajaxUrl'    => admin_url('admin-ajax.php'),
                'restUrl'    => esc_url_raw(rest_url('gearforge/v1')),
                'restNonce'  => wp_create_nonce('wp_rest'),
                'ajaxNonce'  => wp_create_nonce('gf_frontend_nonce'),
                'compareUrl' => home_url('/so-sanh-cau-hinh/'),
                'maxCompare' => 3,
            ]);
        }

        public static function register_bridge_rest_routes(): void {
            register_rest_route('gearforge/v1', '/warranty/request', [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [self::class, 'rest_warranty_bridge'],
                'permission_callback' => static fn(): bool => is_user_logged_in(),
                'args'                => [
                    'order_id'      => ['required' => true, 'validate_callback' => static fn($v): bool => is_numeric($v) && (int) $v > 0],
                    'serial_number' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                    'reason'        => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
                ],
            ]);
        }

        public static function rest_warranty_bridge(WP_REST_Request $request): WP_REST_Response {
            $order_id = (int) $request->get_param('order_id');
            $sn       = strtoupper(sanitize_text_field((string) $request->get_param('serial_number')));
            $reason   = sanitize_textarea_field((string) $request->get_param('reason'));
            $order    = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
            if (!$order || (int) $order->get_customer_id() !== get_current_user_id()) {
                return new WP_REST_Response(['error' => 'Đơn hàng không thuộc về bạn.'], 403);
            }
            if (!class_exists('GF_RMA_Manager')) {
                return new WP_REST_Response(['error' => 'Module RMA chưa sẵn sàng.'], 503);
            }
            $res = GF_RMA_Manager::submit_request($order_id, get_current_user_id(), 'WARRANTY', $reason, $sn);
            if (is_wp_error($res)) {
                return new WP_REST_Response(['error' => $res->get_error_message(), 'code' => $res->get_error_code()], 400);
            }
            return new WP_REST_Response(['status' => 'ok', 'rma_id' => $res, 'message' => "Đã tiếp nhận yêu cầu bảo hành #{$res} cho S/N {$sn}."], 201);
        }

        public static function ajax_require_login(): void {
            wp_send_json_error(['message' => 'Vui lòng đăng nhập tài khoản sinh viên trước khi nộp hồ sơ.'], 401);
        }

        public static function ajax_submit_installment_app(): void {
            if (!is_user_logged_in()) {
                self::ajax_require_login();
            }
            check_ajax_referer('gf_frontend_nonce', 'nonce');
            $user_id    = get_current_user_id();
            $product_id = (int) ($_POST['product_id'] ?? 0);
            $months     = (int) ($_POST['months'] ?? 6);
            $down_pct   = (float) ($_POST['downpayment_pct'] ?? 20);
            $phone      = preg_replace('/[\s.\-()]+/', '', trim((string) ($_POST['phone'] ?? '')));
            if ($phone !== '' && strpos($phone, '+84') === 0) {
                $phone = '0' . substr($phone, 3);
            } elseif ($phone !== '' && strpos($phone, '84') === 0 && strlen($phone) >= 11) {
                $phone = '0' . substr($phone, 2);
            }
            $client_ip  = class_exists('GF_Fraud_Guard') ? GF_Fraud_Guard::get_client_ip() : sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
            $cccd_raw   = preg_replace('/\D+/', '', (string) ($_POST['cccd_number'] ?? ''));

            if (class_exists('GF_Fraud_Guard')) {
                $rl = GF_Fraud_Guard::check_rate_limit('installment_submit', $user_id);
                if (is_wp_error($rl)) {
                    wp_send_json_error(['message' => $rl->get_error_message()], 429);
                }
                $bl = GF_Fraud_Guard::check_blacklist([
                    'IP'        => $client_ip,
                    'USER'      => (string) $user_id,
                    'PHONE'     => $phone,
                    'CCCD_HASH' => class_exists('GF_Installment_Review') ? GF_Installment_Review::hash_cccd($cccd_raw) : hash('sha256', $cccd_raw),
                ]);
                if (is_wp_error($bl)) {
                    wp_send_json_error(['message' => $bl->get_error_message()], 403);
                }
            }

            $product = function_exists('wc_get_product') && $product_id > 0 ? wc_get_product($product_id) : null;
            if (!$product) {
                wp_send_json_error(['message' => 'Không tìm thấy sản phẩm để tạo đơn trả góp.'], 400);
            }

            $calc = GF_Installment_Calc::calculate((float) $product->get_price(), $down_pct, $months);
            if (is_wp_error($calc)) {
                wp_send_json_error(['message' => $calc->get_error_message()], 400);
            }

            $order = wc_create_order(['customer_id' => $user_id]);
            $order->add_product($product, 1);
            $user = get_userdata($user_id);
            if ($user) {
                $order->set_billing_first_name($user->display_name ?: $user->user_login);
                $order->set_billing_email($user->user_email);
            }
            if ($phone !== '') {
                $order->set_billing_phone($phone);
            }
            $order->set_payment_method('gearforge_sandbox');
            $order->set_payment_method_title('Trả góp Sinh viên GearForge + Sandbox 3DS');
            $order->calculate_totals();
            $order->set_status('wc-gf-installment', 'Khởi tạo đơn hàng trả góp sinh viên.');
            $order->save();
            $order_id = $order->get_id();

            $app_id = GF_Installment_Review::submit_application([
                'order_id'              => $order_id,
                'user_id'               => $user_id,
                'plan_id'               => (int) $calc['plan_id'],
                'student_code'          => (string) ($_POST['student_code'] ?? ''),
                'student_edu_email'     => (string) ($_POST['student_edu_email'] ?? ''),
                'cccd_number'           => $cccd_raw,
                'phone'                 => $phone,
                'client_ip'             => $client_ip,
                'downpayment_amount'    => (float) $calc['downpayment_amount'],
                'monthly_amount'        => (float) $calc['monthly_amount'],
                'consent_nd13_accepted' => !empty($_POST['consent_nd13_accepted']) ? 1 : 0,
            ], $_FILES['cccd_file'] ?? [], $_FILES['student_card_file'] ?? []);

            if (is_wp_error($app_id)) {
                $order->delete(true);
                $err_status = $app_id->get_error_code() === 'gf_blacklisted' ? 403 : 400;
                wp_send_json_error(['message' => $app_id->get_error_message(), 'code' => $app_id->get_error_code()], $err_status);
            }

            wp_send_json_success([
                'app_id'       => $app_id,
                'order_id'     => $order_id,
                'message'      => "Đã tiếp nhận hồ sơ #{$app_id} cho đơn #{$order_id}.",
                'tracking_url' => add_query_arg('order_id', $order_id, home_url('/tra-cuu-don-hang/')),
            ], 201);
        }

        public static function render_installment_shortcode(array $atts = []): string {
            global $wpdb;
            $atts       = shortcode_atts(['product_id' => 0], $atts);
            $product_id = (int) $atts['product_id'] ?: get_the_ID();
            $product    = function_exists('wc_get_product') && $product_id ? wc_get_product($product_id) : null;
            $price      = $product ? (float) $product->get_price() : 0.0;
            $plans      = method_exists(GF_Installment_Calc::class, 'get_active_plans')
                ? GF_Installment_Calc::get_active_plans()
                : ($wpdb->get_results("SELECT plan_id, plan_name, duration_months, min_downpayment_pct, monthly_interest_pct, admin_fee FROM {$wpdb->prefix}gf_installment_plans WHERE is_active = 1 ORDER BY duration_months ASC", ARRAY_A) ?: []);

            ob_start();
            include GF_CORE_PATH . 'templates/installment-widget.php';
            return (string) ob_get_clean();
        }

        public static function render_oms_shortcode(array $atts = []): string {
            $atts     = shortcode_atts(['order_id' => 0], $atts);
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
            if (!is_array($calc_3m)) {
                return;
            }
            echo '<div class="gf-product-installment-cta">';
            echo '<div class="gf-cta-badge">Ưu đãi Sinh viên: Trả góp 0% (3 tháng) chỉ từ <strong>' . esc_html(number_format($calc_3m['monthly_amount'], 0, ',', '.')) . 'đ/tháng</strong></div>';
            echo '<div class="gf-cta-actions"><button type="button" class="gf-btn gf-btn-secondary gf-add-compare" data-product-id="' . esc_attr((string) $product->get_id()) . '">+ So sánh cấu hình</button></div></div>';
            echo do_shortcode('[gearforge_installment_widget product_id="' . (int) $product->get_id() . '"]');
        }

        public static function render_loop_product_badges(): void {
            global $product;
            if (!$product instanceof WC_Product) {
                return;
            }
            $price = (float) $product->get_price();
            $specs = array_filter([
                $product->get_attribute('pa_cpu') ?: $product->get_attribute('CPU'),
                $product->get_attribute('pa_ram') ?: $product->get_attribute('RAM'),
                $product->get_attribute('pa_gpu') ?: $product->get_attribute('GPU'),
            ]);
            if (!empty($specs)) {
                echo '<div class="gf-card-specs">';
                foreach ($specs as $sp) {
                    echo '<span class="gf-spec-chip">' . esc_html($sp) . '</span>';
                }
                echo '</div>';
            }
            if ($price >= 3000000) {
                $calc = GF_Installment_Calc::calculate($price, 20, 3);
                if (is_array($calc)) {
                    echo '<div class="gf-card-installment-tag">Góp SV 0%: ' . esc_html(number_format($calc['monthly_amount'], 0, ',', '.')) . 'đ/th</div>';
                }
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
}

register_activation_hook(__FILE__, ['GF_Core', 'activate']);
add_action('before_woocommerce_init', ['GF_Core', 'declare_hpos_compatibility']);
add_action('plugins_loaded', ['GF_Core', 'bootstrap'], 20);
