<?php
/**
 * OMS Order & 2-Layer Installment Progress Stepper + S/N Warranty Request (UC-08, UC-09).
 * Available vars: $order_id (int)
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!is_user_logged_in()) {
    echo '<div class="gf-empty-state">Vui lòng <a href="' . esc_url(wc_get_page_permalink('myaccount')) . '">đăng nhập tài khoản sinh viên</a> để tra cứu đơn hàng và tiến độ trả góp OMS.</div>';
    return;
}

if ($order_id <= 0) {
    $my_orders = function_exists('wc_get_orders') ? wc_get_orders(['customer_id' => get_current_user_id(), 'limit' => 10, 'orderby' => 'date', 'order' => 'DESC']) : [];
    ?>
    <div class="gf-oms-box">
        <div class="gf-oms-header">
            <div>
                <span class="gf-eyebrow">GearForge OMS Tracking</span>
                <h3>Tra cứu tiến độ Đơn hàng &amp; Hồ sơ Trả góp Sinh viên</h3>
            </div>
        </div>
        <form method="get" action="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>" class="gf-rma-form" style="margin-bottom:16px;">
            <input type="number" name="order_id" min="1" placeholder="Nhập mã đơn hàng (VD: 543)..." required />
            <button type="submit" class="gf-btn gf-btn-primary gf-btn-sm">Tra cứu đơn hàng</button>
        </form>
        <?php if (!empty($my_orders)): ?>
            <h4>Đơn hàng gần đây của bạn</h4>
            <ul>
                <?php foreach ($my_orders as $mo): ?>
                    <li>
                        <a href="<?php echo esc_url(add_query_arg('order_id', $mo->get_id(), home_url('/tra-cuu-don-hang/'))); ?>">
                            Đơn #<?php echo esc_html((string) $mo->get_id()); ?>
                        </a> — Trạng thái: <code><?php echo esc_html(GF_Core::map_order_status($mo->get_status())); ?></code>
                        (<?php echo esc_html(number_format((float) $mo->get_total(), 0, ',', '.')); ?>đ)
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    </div>
    <?php
    return;
}

$order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
if (!$order) {
    echo '<div class="gf-empty-state">Không tìm thấy thông tin đơn hàng #' . esc_html((string) $order_id) . '. Vui lòng kiểm tra lại mã đơn hàng.</div>';
    return;
}

if (
    !current_user_can('manage_woocommerce')
    && !GF_RBAC::can_review_installments()
    && (int) $order->get_customer_id() !== get_current_user_id()
) {
    echo '<div class="gf-empty-state">403 Forbidden: Bạn không có quyền xem đơn hàng này.</div>';
    return;
}

global $wpdb;
$domain_status = GF_Core::map_order_status($order->get_status());
$app = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d ORDER BY app_id DESC LIMIT 1",
        $order_id
    ),
    ARRAY_A
);
$serials = GF_Serial_Manager::get_order_serials($order_id);

$steps = [
    ['key' => 'CREATED',                      'label' => '1. Khởi tạo'],
    ['key' => 'PENDING_INSTALLMENT_APPROVAL', 'label' => '2. Chờ duyệt / TT'],
    ['key' => 'PROCESSING',                   'label' => '3. Đang chuẩn bị'],
    ['key' => 'SERIAL_ASSIGNED',              'label' => '4. Đã gắn S/N'],
    ['key' => 'SHIPPING',                     'label' => '5. Đang giao'],
    ['key' => 'DELIVERED',                    'label' => '6. Đã giao (BH)'],
    ['key' => 'COMPLETED',                    'label' => '7. Hoàn tất'],
];

$order_keys  = array_column($steps, 'key');
$active_idx  = array_search($domain_status, $order_keys, true);
if ($domain_status === 'PENDING_PAYMENT') {
    $active_idx = 1;
}
?>
<div class="gf-oms-box">
    <div class="gf-oms-header">
        <div>
            <span class="gf-eyebrow">GearForge OMS Tracking</span>
            <h3>Tiến độ đơn hàng #<?php echo esc_html((string) $order_id); ?></h3>
        </div>
        <a target="_blank" href="<?php echo esc_url(GF_Invoice_PDF::get_download_url($order_id)); ?>" class="gf-btn gf-btn-secondary gf-btn-sm">
            Tải Hóa đơn PDF (T-VAN)
        </a>
    </div>

    <?php if (in_array($domain_status, ['CANCELLED', 'REFUNDED'], true)): ?>
        <div class="gf-alert-danger">Đơn hàng đang ở trạng thái: <strong><?php echo esc_html($domain_status); ?></strong></div>
    <?php else: ?>
        <div class="gf-stepper">
            <?php foreach ($steps as $idx => $st): ?>
                <?php $cls = ($active_idx !== false && $idx <= $active_idx) ? 'is-done' : ''; ?>
                <div class="gf-step <?php echo esc_attr($cls); ?>">
                    <div class="gf-step-dot"><?php echo esc_html((string) ($idx + 1)); ?></div>
                    <div class="gf-step-label"><?php echo esc_html($st['label']); ?></div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <?php if ($app): ?>
        <div class="gf-installment-progress">
            <h4>Tiến độ Hồ sơ Trả góp Sinh viên #<?php echo esc_html((string) $app['app_id']); ?></h4>
            <p>
                Trạng thái hiện tại: <code class="gf-status-code"><?php echo esc_html($app['status']); ?></code>
                | Trả trước: <strong><?php echo esc_html(number_format((float) $app['downpayment_amount'], 0, ',', '.')); ?>đ</strong>
                | Góp hàng tháng: <strong><?php echo esc_html(number_format((float) $app['monthly_amount'], 0, ',', '.')); ?>đ</strong>
            </p>
            <div class="gf-2layer-badges">
                <span class="gf-layer-badge <?php echo $app['l1_verified_at'] ? 'is-ok' : ''; ?>">Lớp 1: CCCD &amp; Thẻ SV</span>
                <span class="gf-layer-badge <?php echo $app['l2_verified_at'] ? 'is-ok' : ''; ?>">Lớp 2: SĐT &amp; .edu.vn</span>
                <span class="gf-layer-badge <?php echo $app['status'] === 'ACTIVE_INSTALLMENT' ? 'is-ok' : ''; ?>">Thanh toán trả trước 3DS</span>
            </div>
            <?php if ($app['status'] === 'APPROVED_WAITING_DOWNPAYMENT'): ?>
                <?php $pay_url = GF_Payment_Sandbox::get_sandbox_checkout_url($order_id, (int) round((float) $app['downpayment_amount']), 'VNPAY', 'downpayment'); ?>
                <div style="margin-top:12px;">
                    <a href="<?php echo esc_url($pay_url); ?>" class="gf-btn gf-btn-primary">
                        Thanh toán tiền trả trước (<?php echo esc_html(number_format((float) $app['downpayment_amount'], 0, ',', '.')); ?>đ) qua Sandbox 3DS
                    </a>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($serials)): ?>
        <div class="gf-serial-panel">
            <h4>Mã Serial Number (S/N) &amp; Yêu cầu Bảo hành / Đổi trả (UC-09)</h4>
            <ul>
                <?php foreach ($serials as $sn): ?>
                    <li>Serial Number: <code><?php echo esc_html($sn['serial_number']); ?></code> — Hạn bảo hành đến <strong><?php echo esc_html((string) $sn['warranty_end_date']); ?></strong></li>
                <?php endforeach; ?>
            </ul>
            <form id="gf-rma-form" class="gf-rma-form" data-order-id="<?php echo esc_attr((string) $order_id); ?>">
                <input type="text" name="serial_number" placeholder="Nhập đúng mã S/N trên thân máy..." required />
                <input type="text" name="reason" placeholder="Mô tả tình trạng lỗi cần bảo hành / đổi trả..." required />
                <button type="submit" class="gf-btn gf-btn-secondary gf-btn-sm">Gửi yêu cầu Bảo hành theo S/N</button>
                <span id="gf-rma-msg"></span>
            </form>
        </div>
    <?php endif; ?>
</div>
