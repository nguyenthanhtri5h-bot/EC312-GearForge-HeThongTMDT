<?php
/**
 * WooCommerce Payment Gateway Wrapper for GearForge Sandbox (VNPay / MoMo / Fundiin 3D-Secure).
 */

if (!defined('ABSPATH') || !class_exists('WC_Payment_Gateway')) {
    return;
}

class GF_Gateway_Sandbox_WC extends WC_Payment_Gateway {
    public function __construct() {
        $this->id                 = 'gearforge_sandbox';
        $this->method_title       = 'GearForge Sandbox (VNPay / MoMo / Fundiin 3DS)';
        $this->method_description = 'Cổng thanh toán thử nghiệm hỗ trợ 3D-Secure cho VNPay, MoMo và Fundiin BNPL.';
        $this->has_fields         = true;

        $this->init_form_fields();
        $this->init_settings();

        $this->title       = $this->get_option('title', 'Thanh toán trực tuyến Sandbox (VNPay / MoMo / Fundiin 3DS)');
        $this->description = $this->get_option('description', 'Chọn kênh thanh toán thử nghiệm hỗ trợ bảo mật 3D-Secure.');
        $this->enabled     = $this->get_option('enabled', 'yes');

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields(): void {
        $this->form_fields = [
            'enabled' => [
                'title'   => 'Kích hoạt',
                'type'    => 'checkbox',
                'label'   => 'Bật cổng thanh toán GearForge Sandbox',
                'default' => 'yes',
            ],
            'title' => [
                'title'   => 'Tiêu đề hiển thị',
                'type'    => 'text',
                'default' => 'Thanh toán trực tuyến (VNPay / MoMo / Fundiin Sandbox 3DS)',
            ],
        ];
    }

    public function payment_fields(): void {
        if ($this->description) {
            echo '<p>' . esc_html($this->description) . '</p>';
        }
        ?>
        <div class="gf-sandbox-channel-select" style="margin-top:8px;">
            <label><input type="radio" name="gf_sandbox_provider" value="VNPAY" checked /> VNPay-QR / Thẻ nội địa (3D-Secure)</label><br />
            <label><input type="radio" name="gf_sandbox_provider" value="MOMO" /> Ví MoMo Sandbox</label><br />
            <label><input type="radio" name="gf_sandbox_provider" value="FUNDIIN" /> Fundiin BNPL (Mua trước trả sau)</label>
        </div>
        <?php
    }

    public function process_payment($order_id): array {
        $order = wc_get_order($order_id);
        if (!$order) {
            return ['result' => 'fail'];
        }
        $provider = strtoupper(sanitize_key((string) ($_POST['gf_sandbox_provider'] ?? 'VNPAY')));
        $order->update_meta_data('_gf_sandbox_provider', $provider);
        $order->update_status('pending', sprintf('Chờ xác thực 3D-Secure qua %s Sandbox.', $provider));
        $order->save();

        WC()->cart?->empty_cart();

        if (method_exists(GF_Payment_Sandbox::class, 'get_sandbox_checkout_url')) {
            $redirect = GF_Payment_Sandbox::get_sandbox_checkout_url($order_id, (int) round((float) $order->get_total()), $provider, 'full');
        } else {
            $session = GF_Payment_Sandbox::create_sandbox_payment_session($order_id, strtolower($provider), 'full');
            $redirect = is_wp_error($session) ? $order->get_checkout_order_received_url() : $session;
        }
        return [
            'result'   => 'success',
            'redirect' => $redirect,
        ];
    }
}
