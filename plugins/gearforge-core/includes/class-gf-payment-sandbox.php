<?php
/**
 * Sandbox Payment Gateway Adapter (VNPay, MoMo, Fundiin) with 3D-Secure OTP, TTL & Idempotent IPN.
 *
 * Security & Reliability Hardening:
 * - Adds expiration timestamp (exp, 15 min TTL) into HMAC-SHA256 signature.
 * - Enforces idempotency check in finalize_verified_payment() to prevent IPN replay attacks.
 * - Enforces ownership check (anti-IDOR) on /oms-status/{order_id}.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Payment_Sandbox {

    private const SANDBOX_OTP       = '123456';
    private const SESSION_TTL_SEC   = 900; // 15 minutes
    private const SUPPORTED_GATEWAY = ['vnpay', 'momo', 'fundiin'];

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
        add_action('template_redirect', [self::class, 'handle_sandbox_3ds_page']);
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/payment-sandbox/session', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_create_session_rest'],
            'permission_callback' => [self::class, 'check_order_access_permission'],
            'args'                => [
                'order_id' => ['required' => true, 'type' => 'integer'],
                'provider' => ['required' => false, 'type' => 'string', 'default' => 'vnpay'],
                'mode'     => ['required' => false, 'type' => 'string', 'default' => 'downpayment'],
            ],
        ]);

        register_rest_route('gearforge/v1', '/payment-sandbox/ipn', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_ipn_callback'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('gearforge/v1', '/payment-sandbox/query/(?P<order_id>\d+)', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [self::class, 'handle_query_dr'],
            'permission_callback' => [self::class, 'check_order_access_permission'],
        ]);

        register_rest_route('gearforge/v1', '/oms-status/(?P<order_id>\d+)', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [self::class, 'handle_oms_status_request'],
            'permission_callback' => [self::class, 'check_order_access_permission'],
        ]);
    }

    /**
     * REST callback for POST /wp-json/gearforge/v1/payment-sandbox/session.
     * Issues a time-limited, HMAC-signed Sandbox 3D-Secure URL for Frontend Checkout/OMS.
     */
    public static function handle_create_session_rest(WP_REST_Request $request) {
        $order_id = (int) $request->get_param('order_id');
        $provider = sanitize_key((string) ($request->get_param('provider') ?: 'vnpay'));
        $mode     = sanitize_key((string) ($request->get_param('mode') ?: 'downpayment'));

        $checkout_url = self::create_sandbox_payment_session($order_id, $provider, $mode);
        if (is_wp_error($checkout_url)) {
            $status = $checkout_url->get_error_code() === 'gf_already_paid' ? 409 : 400;
            return new WP_REST_Response(
                ['code' => $checkout_url->get_error_code(), 'message' => $checkout_url->get_error_message()],
                $status
            );
        }

        $amount = self::resolve_payable_amount($order_id, $mode);

        return new WP_REST_Response(
            [
                'order_id'        => $order_id,
                'provider'        => $provider,
                'mode'            => $mode,
                'amount'          => is_wp_error($amount) ? 0 : (int) $amount,
                'idempotency_key' => "GF_{$order_id}_{$mode}",
                'expires_in'      => self::SESSION_TTL_SEC,
                'checkout_url'    => $checkout_url,
            ],
            201
        );
    }

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
     * Build a time-limited, HMAC-signed Sandbox 3D-Secure checkout URL.
     * Blocks creating a second payment session if the order is already paid.
     *
     * @return string|WP_Error
     */
    public static function create_sandbox_payment_session(int $order_id, string $provider = 'vnpay', string $mode = 'downpayment') {
        $provider = strtolower($provider);
        $mode     = strtolower($mode);
        if (!in_array($provider, self::SUPPORTED_GATEWAY, true)) {
            return new WP_Error('gf_unsupported_gateway', 'Cổng thanh toán Sandbox chỉ hỗ trợ vnpay, momo hoặc fundiin.');
        }

        if (!in_array($mode, ['downpayment', 'full'], true)) {
            return new WP_Error('gf_invalid_payment_mode', 'Chế độ thanh toán chỉ hỗ trợ downpayment hoặc full.');
        }

        if (self::is_order_already_paid($order_id)) {
            return new WP_Error('gf_already_paid', 'Đơn hàng này đã thanh toán thành công, không thể tạo phiên thanh toán lần 2.');
        }

        if ($mode === 'downpayment') {
            $app = class_exists('GF_Installment_Review') ? GF_Installment_Review::get_application_by_order($order_id) : null;
            if (!$app) {
                return new WP_Error('gf_app_not_found', 'Không tìm thấy hồ sơ trả góp gắn với đơn hàng.');
            }
            if ($app['status'] !== 'APPROVED_WAITING_DOWNPAYMENT') {
                return new WP_Error('gf_app_not_approved', 'Hồ sơ trả góp chưa được duyệt qua 2 lớp để thanh toán tiền cọc.');
            }
        }

        $amount = self::resolve_payable_amount($order_id, $mode);
        if (is_wp_error($amount)) {
            return $amount;
        }

        $exp       = time() + self::SESSION_TTL_SEC;
        $nonce_sig = self::compute_hmac_signature('3ds', $order_id, $amount, $provider, $mode, $exp);

        return add_query_arg(
            [
                'gf_sandbox_3ds'  => '1',
                'order_id'        => $order_id,
                'provider'        => $provider,
                'mode'            => $mode,
                'amount'          => $amount,
                'idempotency_key' => "GF_{$order_id}_{$mode}",
                'exp'             => $exp,
                'sig'             => $nonce_sig,
            ],
            home_url('/')
        );
    }

    public static function handle_sandbox_3ds_page(): void {
        if (empty($_GET['gf_sandbox_3ds'])) {
            return;
        }

        $order_id = (int) ($_GET['order_id'] ?? 0);
        $provider = sanitize_key($_GET['provider'] ?? 'vnpay');
        $mode     = sanitize_key($_GET['mode'] ?? 'downpayment');
        $amount   = (int) ($_GET['amount'] ?? 0);
        $exp      = (int) ($_GET['exp'] ?? 0);
        $sig      = sanitize_text_field(wp_unslash($_GET['sig'] ?? ''));

        if (!self::verify_hmac_signature('3ds', $order_id, $amount, $provider, $mode, $exp, $sig)) {
            wp_die('Phiên thanh toán Sandbox đã hết hạn hoặc chữ ký HMAC không hợp lệ.', '403 Forbidden', ['response' => 403]);
        }

        // Prevent double charge if IPN already settled the order while customer lost internet
        if (self::is_order_already_paid($order_id)) {
            $order   = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
            $txn_ref = $order ? (string) $order->get_meta('_gf_transaction_ref') : '';
            header('Content-Type: text/html; charset=utf-8');
            echo '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Đã thanh toán thành công</title></head>';
            echo '<body style="font-family:sans-serif;max-width:480px;margin:48px auto;padding:24px;border:1px solid #28a745;border-radius:8px;background:#f4fbf6;">';
            echo '<h2 style="color:#1e7e34;">Đơn hàng #' . $order_id . ' đã thanh toán thành công!</h2>';
            echo '<p>Hệ thống đã nhận xác nhận giao dịch qua kênh đối soát IPN (Mã GD: <code>' . esc_html($txn_ref ?: 'N/A') . '</code>).</p>';
            echo '<p>Phiên thanh toán này đã được khóa tự động để đảm bảo bạn <strong>không bị trừ tiền lần 2</strong>.</p>';
            echo '<a href="' . esc_url(home_url('/')) . '" style="display:inline-block;margin-top:12px;padding:10px 16px;background:#1e7e34;color:#fff;text-decoration:none;border-radius:4px;">Quay về Trang chủ GearForge</a>';
            echo '</body></html>';
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gf_otp_code'])) {
            check_admin_referer('gf_3ds_submit_' . $order_id);
            $otp = sanitize_text_field(wp_unslash($_POST['gf_otp_code']));

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

    public static function handle_ipn_callback(WP_REST_Request $request) {
        $params   = $request->get_json_params() ?: $request->get_params();
        $order_id = (int) ($params['order_id'] ?? 0);
        $amount   = (int) ($params['amount'] ?? 0);
        $provider = sanitize_key($params['provider'] ?? 'vnpay');
        $mode     = sanitize_key($params['mode'] ?? 'downpayment');
        $exp      = (int) ($params['exp'] ?? 0);
        $txn_ref  = sanitize_text_field($params['transaction_ref'] ?? '');
        $sig      = sanitize_text_field($params['signature'] ?? '');

        if ($txn_ref === '' || !self::verify_hmac_signature('ipn', $order_id, $amount, $provider, $mode, $exp, $sig, $txn_ref)) {
            return new WP_REST_Response(['code' => 'gf_invalid_hmac', 'message' => 'Chữ ký IPN không hợp lệ hoặc đã hết hạn.'], 403);
        }

        $result = self::finalize_verified_payment($order_id, $amount, $provider, $mode, $txn_ref);
        if (is_wp_error($result)) {
            return new WP_REST_Response(['code' => $result->get_error_code(), 'message' => $result->get_error_message()], 400);
        }

        return rest_ensure_response(['status' => 'success', 'order_id' => $order_id, 'transaction_ref' => $txn_ref]);
    }

    /**
     * Active Reconciliation (QueryDR): allows frontend/admin to verify real payment status after network drop.
     */
    public static function handle_query_dr(WP_REST_Request $request) {
        $order_id = (int) $request->get_param('order_id');
        $order    = function_exists('wc_get_order') ? wc_get_order($order_id) : null;

        if (!$order) {
            return new WP_REST_Response(['code' => 'gf_order_not_found', 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        $app        = class_exists('GF_Installment_Review') ? GF_Installment_Review::get_application_by_order($order_id) : null;
        $txn_ref    = (string) $order->get_meta('_gf_transaction_ref');
        $saved_mode = (string) $order->get_meta('_gf_payment_mode');
        $mode       = $saved_mode !== ''
            ? $saved_mode
            : (($app && !in_array($app['status'], ['REJECTED', 'BLACKLISTED'], true)) ? 'downpayment' : 'full');
        $is_paid    = self::is_order_already_paid($order_id);

        return rest_ensure_response([
            'order_id'           => $order_id,
            'payment_state'      => $is_paid ? 'PAID' : 'PENDING',
            'can_retry_payment'  => !$is_paid,
            'idempotency_key'    => 'GF_' . $order_id . '_' . $mode,
            'transaction_ref'    => $txn_ref ?: null,
            'provider'           => $order->get_meta('_gf_payment_provider') ?: null,
            'paid_amount'        => $is_paid ? (int) $order->get_meta('_gf_paid_amount') : 0,
            'order_status'       => $order->get_status(),
            'installment_status' => $app ? $app['status'] : null,
        ]);
    }

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
        $can_invoice = !in_array($order->get_status(), ['cancelled', 'failed'], true) && class_exists('GF_Invoice_PDF');

        return rest_ensure_response([
            'order_id'             => $order_id,
            'order_status'         => $order->get_status(),
            'installment_status'   => $app ? $app['status'] : null,
            'transaction_ref'      => $order->get_meta('_gf_transaction_ref') ?: null,
            'serial_numbers'       => $serials ?: [],
            'invoice_download_url' => $can_invoice ? GF_Invoice_PDF::get_download_url($order_id) : null,
        ]);
    }

    /**
     * Idempotent payment finalizer with MySQL advisory lock to prevent concurrent double-processing.
     *
     * @return true|WP_Error
     */
    public static function finalize_verified_payment(int $order_id, int $amount, string $provider, string $mode, string $txn_ref) {
        global $wpdb;

        $provider = strtolower($provider);
        $mode     = strtolower($mode);
        if (!in_array($provider, self::SUPPORTED_GATEWAY, true) || !in_array($mode, ['downpayment', 'full'], true)) {
            return new WP_Error('gf_invalid_payment_params', 'Thông tin cổng thanh toán hoặc chế độ không hợp lệ.');
        }

        $lock_name = "gf_pay_{$order_id}";
        $locked    = (int) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 5)', $lock_name));
        if ($locked !== 1) {
            return new WP_Error('gf_lock_timeout', 'Giao dịch đang được xử lý, vui lòng thử lại.');
        }

        try {
            $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
            if (!$order) {
                return new WP_Error('gf_order_not_found', 'Không tìm thấy đơn hàng WooCommerce.');
            }

            $existing_txn = (string) $order->get_meta('_gf_transaction_ref');
            if ($existing_txn !== '' || $order->is_paid()) {
                return new WP_Error('gf_already_paid', 'Đơn hàng đã được ghi nhận thanh toán trước đó (Idempotency guard).');
            }

            $expected_amount = self::resolve_payable_amount($order_id, $mode);
            if (is_wp_error($expected_amount)) {
                return $expected_amount;
            }
            if ($amount !== (int) $expected_amount) {
                return new WP_Error('gf_amount_mismatch', 'Số tiền thanh toán không khớp với giá trị đơn hàng / khoản trả trước.');
            }

            if ($mode === 'downpayment') {
                $app = GF_Installment_Review::get_application_by_order($order_id);
                if (!$app || $app['status'] !== 'APPROVED_WAITING_DOWNPAYMENT') {
                    return new WP_Error('gf_app_not_approved', 'Hồ sơ trả góp chưa được duyệt qua 2 lớp để thanh toán tiền cọc.');
                }

                $affected = $wpdb->query(
                    $wpdb->prepare(
                        "UPDATE {$wpdb->prefix}gf_installment_applications
                         SET status = 'ACTIVE_INSTALLMENT'
                         WHERE app_id = %d AND status = 'APPROVED_WAITING_DOWNPAYMENT'",
                        (int) $app['app_id']
                    )
                );
                if ($affected !== 1) {
                    return new WP_Error('gf_concurrent_payment', 'Trạng thái hồ sơ đã thay đổi trong lúc thanh toán.');
                }
            }

            $order->update_meta_data('_gf_transaction_ref', $txn_ref);
            $order->update_meta_data('_gf_payment_provider', strtoupper($provider));
            $order->update_meta_data('_gf_payment_mode', $mode);
            $order->update_meta_data('_gf_paid_amount', $amount);
            $order->payment_complete($txn_ref);
            $order->add_order_note(sprintf('GearForge Sandbox (%s): Đã nhận %s VNĐ. Mã GD: %s', strtoupper($provider), number_format($amount), $txn_ref));
            $order->save();

            return true;
        } finally {
            $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
        }
    }

    public static function compute_hmac_signature(string $context, int $order_id, int $amount, string $provider, string $mode, int $exp, string $txn_ref = ''): string {
        $secret  = self::get_hmac_secret();
        $payload = $context === 'ipn'
            ? "ipn|{$order_id}|{$amount}|{$provider}|{$mode}|{$exp}|{$txn_ref}"
            : "3ds|{$order_id}|{$amount}|{$provider}|{$mode}|{$exp}";
        return hash_hmac('sha256', $payload, $secret);
    }

    public static function verify_hmac_signature(string $context, int $order_id, int $amount, string $provider, string $mode, int $exp, string $sig, string $txn_ref = ''): bool {
        if ($order_id <= 0 || $amount <= 0 || $sig === '' || $exp < time()) {
            return false;
        }
        $expected = self::compute_hmac_signature($context, $order_id, $amount, $provider, $mode, $exp, $txn_ref);
        return hash_equals($expected, $sig);
    }

    public static function is_order_already_paid(int $order_id): bool {
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return false;
        }
        return (string) $order->get_meta('_gf_transaction_ref') !== '' || $order->is_paid();
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
        if (!$key || $key === 'replace_with_32_byte_hex_key_in_env') {
            $key = wp_salt('auth');
        }
        return hash_hmac('sha256', 'gf_sandbox_hmac_v1', $key, true);
    }
}

GF_Payment_Sandbox::init();
