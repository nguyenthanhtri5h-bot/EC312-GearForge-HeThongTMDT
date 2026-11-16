<?php
/**
 * Sandbox Payment Gateway Adapter (VNPay / MoMo / Fundiin 3D-Secure OTP & HMAC IPN Verification).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Payment_Sandbox {
    public static function init(): void {
        add_filter('woocommerce_payment_gateways', [self::class, 'register_gateway']);
        add_action('template_redirect', [self::class, 'maybe_render_sandbox_3ds_page']);
        add_action('wp_ajax_gf_sandbox_3ds_verify', [self::class, 'handle_3ds_verification']);
        add_action('wp_ajax_nopriv_gf_sandbox_3ds_verify', [self::class, 'handle_3ds_verification']);
    }

    public static function register_gateway(array $gateways): array {
        if (class_exists('WC_Payment_Gateway')) {
            require_once GF_CORE_PATH . 'includes/class-gf-gateway-sandbox-wc.php';
            $gateways[] = 'GF_Gateway_Sandbox_WC';
        }
        return $gateways;
    }

    private static function get_hmac_secret(): string {
        $sec = getenv('GF_SANDBOX_HMAC_SECRET');
        if (is_string($sec) && $sec !== '' && !str_starts_with($sec, 'replace_with_')) {
            return $sec;
        }
        return defined('AUTH_SALT') ? (string) AUTH_SALT : 'gf_local_sandbox_fallback_salt';
    }

    public static function sign_payload(int $order_id, int $amount, string $provider, string $mode = 'full'): string {
        return hash_hmac('sha256', "{$order_id}|{$amount}|{$provider}|{$mode}", self::get_hmac_secret());
    }

    public static function get_sandbox_checkout_url(int $order_id, int $amount, string $provider = 'VNPAY', string $mode = 'full'): string {
        $mode = $mode === 'downpayment' ? 'downpayment' : 'full';
        $sig  = self::sign_payload($order_id, $amount, $provider, $mode);
        return add_query_arg([
            'gf_sandbox_3ds' => '1',
            'order_id'       => $order_id,
            'amount'         => $amount,
            'provider'       => strtoupper($provider),
            'mode'           => $mode,
            'sig'            => $sig,
        ], home_url('/'));
    }

    public static function maybe_render_sandbox_3ds_page(): void {
        if (empty($_GET['gf_sandbox_3ds'])) {
            return;
        }

        $order_id = (int) ($_GET['order_id'] ?? 0);
        $amount   = (int) ($_GET['amount'] ?? 0);
        $provider = strtoupper(sanitize_key((string) ($_GET['provider'] ?? 'VNPAY')));
        $mode     = sanitize_key((string) ($_GET['mode'] ?? 'full')) === 'downpayment' ? 'downpayment' : 'full';
        $sig      = sanitize_text_field((string) ($_GET['sig'] ?? ''));

        $expected_sig = self::sign_payload($order_id, $amount, $provider, $mode);
        if (!hash_equals($expected_sig, $sig) || $order_id <= 0 || $amount <= 0) {
            wp_die('403 Forbidden: Chữ ký giao dịch Sandbox không hợp lệ (HMAC Verification Failed).', '403 Forbidden', ['response' => 403]);
        }

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            wp_die('404 Not Found: Không tìm thấy đơn hàng.', '404 Not Found', ['response' => 404]);
        }

        status_header(200);
        header('Content-Type: text/html; charset=utf-8');
        ?>
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>GearForge Sandbox 3D-Secure – <?php echo esc_html($provider); ?></title>
            <style>
                body { font-family: Inter, system-ui, sans-serif; background: #0f172a; color: #e2e8f0; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:16px; }
                .box { background: #1e293b; border: 1px solid #334155; border-radius: 14px; max-width: 440px; width: 100%; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.45); }
                .badge { display:inline-block; background:#0284c7; color:#fff; font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; margin-bottom:12px; }
                h2 { margin:0 0 8px; color:#fff; font-size:20px; }
                .meta { background:#0f172a; border-radius:10px; padding:14px; margin:16px 0; font-size:14px; line-height:1.7; }
                label { display:block; font-size:13px; margin-bottom:6px; color:#94a3b8; }
                input, select { width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:#fff; font-size:15px; margin-bottom:14px; }
                button { width:100%; padding:12px; border:none; border-radius:8px; background:#22c55e; color:#052e16; font-weight:700; font-size:15px; cursor:pointer; }
                button:hover { background:#4ade80; }
                .hint { font-size:12px; color:#94a3b8; margin-top:10px; }
            </style>
        </head>
        <body>
            <div class="box">
                <span class="badge">SANDBOX 3D-SECURE TESTNET</span>
                <h2>Cổng Thanh Toán <?php echo esc_html($provider); ?></h2>
                <p style="margin:0;color:#94a3b8;font-size:14px;">Xác thực giao dịch cho đơn hàng GearForge #<?php echo esc_html((string) $order_id); ?></p>
                <div class="meta">
                    <div><strong>Loại thanh toán:</strong> <?php echo $mode === 'downpayment' ? 'Tiền trả trước Trả góp SV' : 'Thanh toán toàn bộ đơn hàng'; ?></div>
                    <div><strong>Số tiền thanh toán:</strong> <span style="color:#38bdf8;font-weight:700;"><?php echo esc_html(number_format($amount, 0, ',', '.')); ?> VNĐ</span></div>
                    <div><strong>Thẻ/Ví test:</strong> 9704198526191432198 (NCB / Fundiin Test)</div>
                </div>
                <form method="post" action="<?php echo esc_url(admin_url('admin-ajax.php')); ?>">
                    <input type="hidden" name="action" value="gf_sandbox_3ds_verify" />
                    <input type="hidden" name="order_id" value="<?php echo esc_attr((string) $order_id); ?>" />
                    <input type="hidden" name="amount" value="<?php echo esc_attr((string) $amount); ?>" />
                    <input type="hidden" name="provider" value="<?php echo esc_attr($provider); ?>" />
                    <input type="hidden" name="mode" value="<?php echo esc_attr($mode); ?>" />
                    <input type="hidden" name="sig" value="<?php echo esc_attr($sig); ?>" />
                    <label for="gf_otp">Nhập mã OTP 3D-Secure (Mặc định test: <strong>123456</strong>)</label>
                    <input id="gf_otp" name="otp" type="text" value="123456" required maxlength="6" />
                    <button type="submit">Xác nhận Thanh toán &amp; Gửi Callback IPN</button>
                </form>
                <p class="hint">Hệ thống kiểm tra chữ ký HMAC-SHA256 và mô phỏng callback IPN về WooCommerce.</p>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    public static function handle_3ds_verification(): void {
        $order_id = (int) ($_POST['order_id'] ?? 0);
        $amount   = (int) ($_POST['amount'] ?? 0);
        $provider = strtoupper(sanitize_key((string) ($_POST['provider'] ?? 'VNPAY')));
        $mode     = sanitize_key((string) ($_POST['mode'] ?? 'full')) === 'downpayment' ? 'downpayment' : 'full';
        $sig      = sanitize_text_field((string) ($_POST['sig'] ?? ''));
        $otp      = sanitize_text_field((string) ($_POST['otp'] ?? ''));

        $expected_sig = self::sign_payload($order_id, $amount, $provider, $mode);
        if (!hash_equals($expected_sig, $sig)) {
            wp_die('403 Forbidden: Sai chữ ký HMAC IPN.', '403 Forbidden', ['response' => 403]);
        }
        if ($otp !== '123456') {
            wp_die('Mã OTP 3D-Secure không đúng (Test OTP là 123456). Vui lòng quay lại thử lại.', 'OTP Failed', ['response' => 400]);
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_die('404 Not Found', '404 Not Found', ['response' => 404]);
        }

        if ($mode === 'downpayment') {
            global $wpdb;
            $app = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT app_id, downpayment_amount, status FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d AND status = 'APPROVED_WAITING_DOWNPAYMENT' ORDER BY app_id DESC LIMIT 1",
                    $order_id
                ),
                ARRAY_A
            );
            if (!$app || (int) round((float) $app['downpayment_amount']) !== $amount) {
                wp_die('400 Bad Request: Hồ sơ không ở trạng thái chờ thanh toán trả trước hoặc sai số tiền.', '400 Bad Request', ['response' => 400]);
            }
        } else {
            if (!in_array($order->get_status(), ['pending', 'on-hold'], true) || (int) round((float) $order->get_total()) !== $amount) {
                wp_die('400 Bad Request: Đơn hàng đã được xử lý hoặc số tiền thanh toán không khớp.', '400 Bad Request', ['response' => 400]);
            }
        }

        $tx_id = sprintf('GF-%s-%d-%s', $provider, $order_id, substr(bin2hex(random_bytes(4)), 0, 8));
        $order->update_meta_data('_gf_sandbox_tx_id', $tx_id);
        $order->update_meta_data('_gf_sandbox_provider', $provider);
        $order->payment_complete($tx_id);

        if ($mode === 'downpayment') {
            global $wpdb;
            $wpdb->update(
                "{$wpdb->prefix}gf_installment_applications",
                ['status' => 'ACTIVE_INSTALLMENT'],
                ['order_id' => $order_id, 'status' => 'APPROVED_WAITING_DOWNPAYMENT'],
                ['%s'],
                ['%d', '%s']
            );
            $order->update_status('processing', sprintf('Đã nhận tiền trả trước qua %s Sandbox (3DS). Mã GD: %s. Hồ sơ chuyển sang ACTIVE_INSTALLMENT.', $provider, $tx_id));
        } else {
            $order->update_status('processing', sprintf('Thanh toán thành công qua %s Sandbox (3DS). Mã GD: %s.', $provider, $tx_id));
        }
        $order->save();

        wp_safe_redirect(add_query_arg('gf_paid', '1', $order->get_view_order_url()));
        exit;
    }
}
