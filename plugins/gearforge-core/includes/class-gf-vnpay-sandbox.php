<?php
/**
 * Official VNPay Sandbox 2.1.0 Gateway Adapter (Return URL, IPN & Active QueryDR).
 *
 * When `vnp_TmnCode` and `vnp_HashSecret` are configured via env or WP options,
 * routes `vnpay` sessions (both `downpayment` and `full`) to VNPay's hosted
 * `sandbox.vnpayment.vn` checkout; otherwise GF_Payment_Sandbox falls back to
 * the local 3D-Secure emulator seamlessly.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_VNPay_Sandbox {

    private const DEFAULT_PAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    private const DEFAULT_API_URL = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
    private const OPTION_ENABLED  = 'gf_vnpay_enabled';
    private const OPTION_TMN_CODE = 'gf_vnpay_tmn_code';
    private const OPTION_SECRET   = 'gf_vnpay_hash_secret';

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
        add_action('template_redirect', [self::class, 'handle_return_redirect']);
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/vnpay-ipn', [
            'methods'             => [WP_REST_Server::READABLE, WP_REST_Server::CREATABLE],
            'callback'            => [self::class, 'handle_ipn_callback'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Resolve effective VNPay configuration (env takes precedence over WP options).
     *
     * @return array{enabled:bool,tmn_code:string,hash_secret:string,pay_url:string,api_url:string,source:string}
     */
    public static function get_config(): array {
        $env_tmn    = trim((string) getenv('GF_VNPAY_TMN_CODE'));
        $env_secret = trim((string) getenv('GF_VNPAY_HASH_SECRET'));
        $opt_tmn    = trim((string) get_option(self::OPTION_TMN_CODE, ''));
        $opt_secret = trim((string) get_option(self::OPTION_SECRET, ''));
        $enabled    = (string) get_option(self::OPTION_ENABLED, '1') !== '0';

        $source = 'none';
        if ($env_tmn !== '' && $env_secret !== '') {
            $source = 'env';
        } elseif ($opt_tmn !== '' && $opt_secret !== '') {
            $source = 'option';
        }

        return [
            'enabled'     => $enabled,
            'tmn_code'    => $env_tmn !== '' ? $env_tmn : $opt_tmn,
            'hash_secret' => $env_secret !== '' ? $env_secret : $opt_secret,
            'pay_url'     => trim((string) getenv('GF_VNPAY_PAY_URL')) ?: self::DEFAULT_PAY_URL,
            'api_url'     => trim((string) getenv('GF_VNPAY_API_URL')) ?: self::DEFAULT_API_URL,
            'source'      => $source,
        ];
    }

    public static function is_configured(): bool {
        $cfg = self::get_config();
        return $cfg['enabled'] && $cfg['tmn_code'] !== '' && $cfg['hash_secret'] !== '';
    }

    public static function get_return_url(): string {
        return add_query_arg(['gf_vnpay_return' => '1'], home_url('/'));
    }

    public static function get_ipn_url(): string {
        return rest_url('gearforge/v1/vnpay-ipn');
    }

    /**
     * Build a signed VNPay Sandbox 2.1.0 hosted checkout URL for an order.
     *
     * @return string|WP_Error
     */
    public static function build_checkout_url(int $order_id, int $amount, string $mode = 'downpayment', string $bank_code = '') {
        $cfg = self::get_config();
        if (!$cfg['enabled'] || $cfg['tmn_code'] === '' || $cfg['hash_secret'] === '') {
            return new WP_Error('gf_vnpay_not_configured', 'Chưa cấu hình vnp_TmnCode / vnp_HashSecret.');
        }

        $tz          = new DateTimeZone('Asia/Ho_Chi_Minh');
        $now         = new DateTimeImmutable('now', $tz);
        $create_date = $now->format('YmdHis');
        $expire_date = $now->modify('+15 minutes')->format('YmdHis');
        $suffix      = $create_date . str_pad((string) wp_rand(0, 99), 2, '0', STR_PAD_LEFT);
        $txn_ref     = "GF_{$order_id}_{$mode}_{$suffix}";

        $ip_addr = sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'));
        if (!filter_var($ip_addr, FILTER_VALIDATE_IP)) {
            $ip_addr = '127.0.0.1';
        }

        $input = [
            'vnp_Version'    => '2.1.0',
            'vnp_TmnCode'    => $cfg['tmn_code'],
            'vnp_Amount'     => $amount * 100,
            'vnp_Command'    => 'pay',
            'vnp_CreateDate' => $create_date,
            'vnp_CurrCode'   => 'VND',
            'vnp_IpAddr'     => $ip_addr,
            'vnp_Locale'     => 'vn',
            'vnp_OrderInfo'  => "Thanh toan GearForge don {$order_id} {$mode}",
            'vnp_OrderType'  => 'other',
            'vnp_ReturnUrl'  => self::get_return_url(),
            'vnp_TxnRef'     => $txn_ref,
            'vnp_ExpireDate' => $expire_date,
        ];

        if ($bank_code !== '') {
            $input['vnp_BankCode'] = strtoupper(sanitize_key($bank_code));
        }

        if (function_exists('wc_get_order')) {
            $order = wc_get_order($order_id);
            if ($order) {
                $order->update_meta_data('_gf_vnp_last_txn', $txn_ref);
                $order->update_meta_data('_gf_vnp_last_create_date', $create_date);
                $order->update_meta_data('_gf_vnp_last_mode', $mode);
                $order->save();
            }
        }

        $signed = self::sign_params($input, $cfg['hash_secret']);
        return $cfg['pay_url'] . '?' . $signed['query'] . 'vnp_SecureHash=' . $signed['hash'];
    }

    /**
     * Verify HMAC-SHA512 `vnp_SecureHash` over sorted `vnp_*` parameters.
     */
    public static function verify_vnpay_signature(array $params): bool {
        $cfg           = self::get_config();
        $received_hash = strtolower(sanitize_text_field((string) ($params['vnp_SecureHash'] ?? '')));
        if ($cfg['hash_secret'] === '' || $received_hash === '') {
            return false;
        }

        $vnp_params = [];
        foreach ($params as $key => $value) {
            if (strpos((string) $key, 'vnp_') === 0 && $key !== 'vnp_SecureHash' && $key !== 'vnp_SecureHashType') {
                $vnp_params[(string) $key] = (string) wp_unslash($value);
            }
        }

        if (empty($vnp_params)) {
            return false;
        }

        $signed = self::sign_params($vnp_params, $cfg['hash_secret']);
        return hash_equals(strtolower($signed['hash']), $received_hash);
    }

    /**
     * Parse order_id and mode from a GearForge VNPay `vnp_TxnRef`.
     *
     * @return array{order_id:int,mode:string}|null
     */
    public static function parse_txn_ref(string $txn_ref): ?array {
        if (preg_match('/^GF_(\d+)_(downpayment|full)_(\d+)$/', trim($txn_ref), $m)) {
            return [
                'order_id' => (int) $m[1],
                'mode'     => $m[2],
            ];
        }
        return null;
    }

    /**
     * Handle Server-to-Server VNPay IPN callback (`RspCode` 00/01/02/04/97/99).
     */
    public static function handle_ipn_callback(WP_REST_Request $request): WP_REST_Response {
        if (function_exists('gf_core_check_rate_limit')) {
            $rl = gf_core_check_rate_limit('vnpay_ipn', 60, 60);
            if (is_wp_error($rl)) {
                return new WP_REST_Response(['RspCode' => '99', 'Message' => 'Too many requests'], 429);
            }
        }

        $params = $request->get_params();
        if (!self::verify_vnpay_signature($params)) {
            return new WP_REST_Response(['RspCode' => '97', 'Message' => 'Invalid signature'], 200);
        }

        $txn_ref = sanitize_text_field((string) ($params['vnp_TxnRef'] ?? ''));
        $parsed  = self::parse_txn_ref($txn_ref);
        if (!$parsed) {
            return new WP_REST_Response(['RspCode' => '01', 'Message' => 'Order not found'], 200);
        }

        $order_id = $parsed['order_id'];
        $mode     = $parsed['mode'];
        $order    = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_REST_Response(['RspCode' => '01', 'Message' => 'Order not found'], 200);
        }

        $paid_amount = (int) round(((float) ($params['vnp_Amount'] ?? 0)) / 100);
        $expected    = self::resolve_expected_amount($order_id, $mode);
        if ($expected <= 0 || $paid_amount !== $expected) {
            return new WP_REST_Response(['RspCode' => '04', 'Message' => 'Invalid amount'], 200);
        }

        if (GF_Payment_Sandbox::is_order_already_paid($order_id)) {
            return new WP_REST_Response(['RspCode' => '02', 'Message' => 'Order already confirmed'], 200);
        }

        $resp_code  = sanitize_text_field((string) ($params['vnp_ResponseCode'] ?? ''));
        $txn_status = sanitize_text_field((string) ($params['vnp_TransactionStatus'] ?? ''));
        $vnp_txn_no = sanitize_text_field((string) ($params['vnp_TransactionNo'] ?? $txn_ref));

        if ($resp_code === '00' && ($txn_status === '' || $txn_status === '00')) {
            $res = GF_Payment_Sandbox::finalize_verified_payment($order_id, $paid_amount, 'vnpay', $mode, $vnp_txn_no ?: $txn_ref);
            if (is_wp_error($res)) {
                return new WP_REST_Response(['RspCode' => '99', 'Message' => $res->get_error_message()], 200);
            }
            return new WP_REST_Response(['RspCode' => '00', 'Message' => 'Confirm Success'], 200);
        }

        $order->add_order_note(sprintf('VNPay Sandbox IPN báo giao dịch chưa thành công (ResponseCode=%s, TxnRef=%s).', $resp_code, $txn_ref));
        $order->save();
        return new WP_REST_Response(['RspCode' => '00', 'Message' => 'Confirm Success'], 200);
    }

    /**
     * Handle browser return from `sandbox.vnpayment.vn` (`?gf_vnpay_return=1`).
     */
    public static function handle_return_redirect(): void {
        if (empty($_GET['gf_vnpay_return'])) {
            return;
        }

        $params = $_GET;
        if (!self::verify_vnpay_signature($params)) {
            wp_die('Chữ ký vnp_SecureHash từ VNPay không hợp lệ.', '403 Forbidden', ['response' => 403]);
        }

        $txn_ref = sanitize_text_field(wp_unslash((string) ($params['vnp_TxnRef'] ?? '')));
        $parsed  = self::parse_txn_ref($txn_ref);
        if (!$parsed) {
            wp_die('Không xác định được mã đơn hàng từ vnp_TxnRef.', '400 Bad Request', ['response' => 400]);
        }

        $order_id   = $parsed['order_id'];
        $mode       = $parsed['mode'];
        $resp_code  = sanitize_text_field(wp_unslash((string) ($params['vnp_ResponseCode'] ?? '')));
        $txn_status = sanitize_text_field(wp_unslash((string) ($params['vnp_TransactionStatus'] ?? '')));
        $vnp_amount = (int) round(((float) ($params['vnp_Amount'] ?? 0)) / 100);
        $vnp_txn_no = sanitize_text_field(wp_unslash((string) ($params['vnp_TransactionNo'] ?? $txn_ref)));
        $pay_date   = sanitize_text_field(wp_unslash((string) ($params['vnp_PayDate'] ?? '')));

        $tracking_url = apply_filters(
            'gf_sandbox_success_redirect_url',
            add_query_arg(['order_id' => $order_id, 'gf_paid' => '1'], home_url('/tra-cuu-don-hang/')),
            $order_id
        );

        if (GF_Payment_Sandbox::is_order_already_paid($order_id)) {
            wp_safe_redirect($tracking_url);
            exit;
        }

        if ($resp_code === '00' && ($txn_status === '' || $txn_status === '00')) {
            // Confirm server-to-server via QueryDR using stored _gf_vnp_last_create_date when reachable
            $qdr = self::query_vnpay_transaction($order_id, $txn_ref);
            if (is_array($qdr) && ($qdr['confirmed'] ?? false) === false && ($qdr['authoritative'] ?? false) === true) {
                self::render_return_status_page($order_id, false, 'VNPay QueryDR không xác nhận giao dịch thành công (' . ($qdr['message'] ?? '') . ').');
            }

            $res = GF_Payment_Sandbox::finalize_verified_payment($order_id, $vnp_amount, 'vnpay', $mode, $vnp_txn_no ?: $txn_ref);
            if (!is_wp_error($res) || $res->get_error_code() === 'gf_already_paid') {
                wp_safe_redirect($tracking_url);
                exit;
            }
            self::render_return_status_page($order_id, false, $res->get_error_message());
        }

        $msg = $resp_code === '24'
            ? 'Bạn đã hủy giao dịch thanh toán trên cổng VNPay Sandbox (Mã 24).'
            : sprintf('Giao dịch VNPay Sandbox chưa hoàn tất (Mã phản hồi: %s).', $resp_code ?: 'UNKNOWN');
        self::render_return_status_page($order_id, false, $msg);
    }

    /**
     * Call VNPay `querydr` API server-to-server to verify and reconcile a pending order.
     *
     * @return array{confirmed:bool,authoritative:bool,message:string,raw?:array}
     */
    public static function query_vnpay_transaction(int $order_id, string $txn_ref = '', string $txn_date = ''): array {
        $cfg = self::get_config();
        if (!$cfg['enabled'] || $cfg['tmn_code'] === '' || $cfg['hash_secret'] === '') {
            return ['confirmed' => false, 'authoritative' => false, 'message' => 'VNPay not configured'];
        }

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return ['confirmed' => false, 'authoritative' => true, 'message' => 'Order not found'];
        }

        if ($txn_ref === '') {
            $txn_ref = (string) $order->get_meta('_gf_vnp_last_txn');
        }
        if ($txn_date === '') {
            $txn_date = (string) $order->get_meta('_gf_vnp_last_create_date');
        }
        if ($txn_ref === '' || $txn_date === '') {
            return ['confirmed' => false, 'authoritative' => false, 'message' => 'Missing VNPay transaction metadata'];
        }

        $tz          = new DateTimeZone('Asia/Ho_Chi_Minh');
        $create_date = (new DateTimeImmutable('now', $tz))->format('YmdHis');
        $req_id      = wp_generate_uuid4();
        $ip_addr     = sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'));
        if (!filter_var($ip_addr, FILTER_VALIDATE_IP)) {
            $ip_addr = '127.0.0.1';
        }
        $order_info  = "QueryDR GearForge don {$order_id}";

        $hash_input = implode('|', [
            $req_id,
            '2.1.0',
            'querydr',
            $cfg['tmn_code'],
            $txn_ref,
            $txn_date,
            $create_date,
            $ip_addr,
            $order_info,
        ]);

        $payload = [
            'vnp_RequestId'       => $req_id,
            'vnp_Version'         => '2.1.0',
            'vnp_Command'         => 'querydr',
            'vnp_TmnCode'         => $cfg['tmn_code'],
            'vnp_TxnRef'          => $txn_ref,
            'vnp_OrderInfo'       => $order_info,
            'vnp_TransactionDate' => $txn_date,
            'vnp_CreateDate'      => $create_date,
            'vnp_IpAddr'          => $ip_addr,
            'vnp_SecureHash'      => hash_hmac('sha512', $hash_input, $cfg['hash_secret']),
        ];

        $resp = wp_remote_post($cfg['api_url'], [
            'timeout' => 12,
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => wp_json_encode($payload),
        ]);

        if (is_wp_error($resp)) {
            return ['confirmed' => false, 'authoritative' => false, 'message' => $resp->get_error_message()];
        }

        $body = json_decode((string) wp_remote_retrieve_body($resp), true);
        if (!is_array($body)) {
            return ['confirmed' => false, 'authoritative' => false, 'message' => 'Invalid JSON from VNPay QueryDR'];
        }

        $rsp_code   = (string) ($body['vnp_ResponseCode'] ?? '');
        $txn_status = (string) ($body['vnp_TransactionStatus'] ?? '');
        $confirmed  = ($rsp_code === '00' && $txn_status === '00');

        return [
            'confirmed'     => $confirmed,
            'authoritative' => true,
            'message'       => (string) ($body['vnp_Message'] ?? "ResponseCode={$rsp_code}"),
            'raw'           => $body,
        ];
    }

    /**
     * Active reconciliation helper called by /payment-sandbox/query/{order_id} when an order is still PENDING.
     */
    public static function reconcile_order(int $order_id): bool {
        if (!self::is_configured() || GF_Payment_Sandbox::is_order_already_paid($order_id)) {
            return false;
        }
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return false;
        }
        $txn_ref = (string) $order->get_meta('_gf_vnp_last_txn');
        $mode    = (string) $order->get_meta('_gf_vnp_last_mode') ?: 'downpayment';
        if ($txn_ref === '') {
            return false;
        }

        $qdr = self::query_vnpay_transaction($order_id, $txn_ref);
        if (!($qdr['confirmed'] ?? false) || empty($qdr['raw'])) {
            return false;
        }

        $raw        = $qdr['raw'];
        $amount     = (int) round(((float) ($raw['vnp_Amount'] ?? 0)) / 100);
        $vnp_txn_no = sanitize_text_field((string) ($raw['vnp_TransactionNo'] ?? $txn_ref));
        if ($amount <= 0) {
            $amount = self::resolve_expected_amount($order_id, $mode);
        }

        $res = GF_Payment_Sandbox::finalize_verified_payment($order_id, $amount, 'vnpay', $mode, $vnp_txn_no ?: $txn_ref);
        return $res === true;
    }

    private static function sign_params(array $params, string $secret): array {
        ksort($params);
        $query     = '';
        $hash_data = '';
        $first     = true;
        foreach ($params as $key => $value) {
            $pair = urlencode((string) $key) . '=' . urlencode((string) $value);
            $hash_data .= $first ? $pair : ('&' . $pair);
            $first      = false;
            $query     .= $pair . '&';
        }
        return [
            'query' => $query,
            'hash'  => hash_hmac('sha512', $hash_data, $secret),
        ];
    }

    private static function resolve_expected_amount(int $order_id, string $mode): int {
        if ($mode === 'downpayment' && class_exists('GF_Installment_Review')) {
            $app = GF_Installment_Review::get_application_by_order($order_id);
            return $app ? (int) round((float) $app['downpayment_amount']) : 0;
        }
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        return $order ? (int) round((float) $order->get_total()) : 0;
    }

    private static function render_return_status_page(int $order_id, bool $ok, string $message): void {
        $retry_url = add_query_arg(['order_id' => $order_id], home_url('/tra-cuu-don-hang/'));
        header('Content-Type: text/html; charset=utf-8');
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        echo '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Kết quả VNPay Sandbox</title></head>';
        echo '<body style="font-family:\'Inter\',system-ui,sans-serif;max-width:480px;margin:48px auto;padding:24px;border:1px solid ' . ($ok ? '#28a745' : '#dc3545') . ';border-radius:8px;">';
        echo '<h2 style="color:' . ($ok ? '#1e7e34' : '#b91c1c') . ';">' . ($ok ? 'Thanh toán thành công' : 'Giao dịch chưa hoàn tất') . '</h2>';
        echo '<p>Đơn hàng: <strong>#' . $order_id . '</strong></p>';
        echo '<p>' . esc_html($message) . '</p>';
        echo '<a href="' . esc_url($retry_url) . '" style="display:inline-block;margin-top:12px;padding:10px 16px;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:4px;">Quay lại Tra cứu đơn hàng #' . $order_id . '</a>';
        echo '</body></html>';
        exit;
    }
}

GF_VNPay_Sandbox::init();
