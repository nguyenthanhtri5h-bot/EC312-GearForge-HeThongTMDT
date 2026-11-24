<?php
/**
 * OMS Order & 2-Layer Installment Progress Stepper + S/N Warranty Request (UC-08, UC-09).
 * Available vars: $order_id (int)
 */

if (!defined('ABSPATH')) {
    exit;
}

$order_id      = isset($order_id) ? (int) $order_id : 0;
$myaccount_url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_login_url();
$oms_base_url  = home_url('/tra-cuu-don-hang/');

$map_status = static function (string $wc_status): string {
    if (class_exists('GF_Core')) {
        return GF_Core::map_order_status($wc_status);
    }
    $clean = str_replace('wc-', '', $wc_status);
    $fallback_map = [
        'pending'         => 'PENDING_PAYMENT',
        'gf-installment'  => 'PENDING_INSTALLMENT_APPROVAL',
        'processing'      => 'PROCESSING',
        'gf-serial-ready' => 'SERIAL_ASSIGNED',
        'gf-shipping'     => 'SHIPPING',
        'gf-delivered'    => 'DELIVERED',
        'completed'       => 'COMPLETED',
        'cancelled'       => 'CANCELLED',
        'refunded'        => 'REFUNDED',
        'on-hold'         => 'PENDING_PAYMENT',
    ];
    return $fallback_map[$clean] ?? 'CREATED';
};

if (!is_user_logged_in()) {
    echo '<div class="gf-empty-state">Vui lòng <a href="' . esc_url($myaccount_url ?: wp_login_url()) . '">đăng nhập tài khoản sinh viên</a> để tra cứu đơn hàng và tiến độ trả góp OMS.</div>';
    return;
}

if ($order_id <= 0) {
    $my_orders = function_exists('wc_get_orders') ? wc_get_orders(['customer_id' => get_current_user_id(), 'limit' => 10, 'orderby' => 'date', 'order' => 'DESC']) : [];
    ?>
    <div class="gf-oms-box">
        <div class="gf-oms-header">
            <div>
                <h3>Tra cứu tiến độ Đơn hàng &amp; Hồ sơ Trả góp</h3>
                <p class="gf-subheading">Nhập mã đơn hàng để xem 7 chặng xử lý OMS, mã Serial thiết bị (S/N) và hóa đơn VAT.</p>
            </div>
        </div>
        <form method="get" action="<?php echo esc_url($oms_base_url); ?>" class="gf-rma-form gf-oms-lookup-form">
            <label for="gf-lookup-order-id" class="screen-reader-text">Mã đơn hàng</label>
            <input type="number" id="gf-lookup-order-id" name="order_id" min="1" inputmode="numeric" placeholder="Nhập mã đơn hàng (VD: 543)..." required />
            <button type="submit" class="gf-btn gf-btn-primary gf-btn-sm">Tra cứu ngay</button>
        </form>
        <?php if (!empty($my_orders)): ?>
            <div class="gf-recent-orders">
                <h4>Đơn hàng gần đây của bạn</h4>
                <ul class="gf-order-list">
                    <?php foreach ($my_orders as $mo): ?>
                        <li>
                            <a href="<?php echo esc_url(add_query_arg('order_id', $mo->get_id(), $oms_base_url)); ?>">
                                Đơn #<?php echo esc_html((string) $mo->get_id()); ?>
                            </a>
                            <span class="gf-status-code"><?php echo esc_html($map_status($mo->get_status())); ?></span>
                            <span class="gf-mono"><?php echo esc_html(number_format((float) $mo->get_total(), 0, ',', '.')); ?>đ</span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return;
}

$order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
if (!$order) {
    echo '<div class="gf-empty-state">Không tìm thấy đơn hàng #' . esc_html((string) $order_id) . '. Vui lòng kiểm tra lại mã đơn hàng.</div>';
    return;
}

$can_review = class_exists('GF_RBAC') && GF_RBAC::can_review_installments();
if (
    !current_user_can('manage_woocommerce')
    && !$can_review
    && (int) $order->get_customer_id() !== get_current_user_id()
) {
    echo '<div class="gf-empty-state">403 Forbidden: Bạn không có quyền truy cập đơn hàng này.</div>';
    return;
}

global $wpdb;
$domain_status = $map_status($order->get_status());
$app = $wpdb->get_row(
    $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d ORDER BY app_id DESC LIMIT 1", $order_id),
    ARRAY_A
);
$serials = $wpdb->get_results(
    $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d", $order_id),
    ARRAY_A
);

$steps = [
    ['key' => 'CREATED',                      'label' => '1. Khởi tạo'],
    ['key' => 'PENDING_INSTALLMENT_APPROVAL', 'label' => '2. Duyệt / TT'],
    ['key' => 'PROCESSING',                   'label' => '3. Chuẩn bị'],
    ['key' => 'SERIAL_ASSIGNED',              'label' => '4. Gắn S/N'],
    ['key' => 'SHIPPING',                     'label' => '5. Đang giao'],
    ['key' => 'DELIVERED',                    'label' => '6. Đã giao'],
    ['key' => 'COMPLETED',                    'label' => '7. Hoàn tất'],
];

$order_keys = array_column($steps, 'key');
$active_idx = array_search($domain_status, $order_keys, true);
if ($domain_status === 'PENDING_PAYMENT') {
    $active_idx = 1;
}
$progress_pct = ($active_idx !== false) ? (int) round((($active_idx + 1) / count($steps)) * 100) : 0;
$invoice_url  = class_exists('GF_Invoice_PDF') ? GF_Invoice_PDF::get_download_url($order_id) : '#';
?>
<div class="gf-oms-box">
    <div class="gf-oms-header">
        <div>
            <h3>Tiến độ đơn hàng #<?php echo esc_html((string) $order_id); ?></h3>
            <p class="gf-subheading">Trạng thái hiện tại: <code class="gf-status-code"><?php echo esc_html($domain_status); ?></code></p>
        </div>
        <?php if ($invoice_url !== '#'): ?>
            <a target="_blank" rel="noopener noreferrer" href="<?php echo esc_url($invoice_url); ?>" class="gf-btn gf-btn-ghost gf-btn-sm">
                Tải Hóa đơn PDF (T-VAN)
            </a>
        <?php endif; ?>
    </div>

    <?php if (in_array($domain_status, ['CANCELLED', 'REFUNDED'], true)): ?>
        <div class="gf-alert-danger" role="alert">
            Đơn hàng đang ở trạng thái: <strong><?php echo esc_html($domain_status); ?></strong>
        </div>
    <?php else: ?>
        <div
            class="gf-oms-progress-wrap"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="<?php echo esc_attr((string) $progress_pct); ?>"
            aria-label="Tiến độ xử lý đơn hàng OMS"
        >
            <div class="gf-oms-progress-bar" style="width:<?php echo esc_attr((string) $progress_pct); ?>%;"></div>
        </div>
        <div class="gf-stepper" role="list" aria-label="7 bước xử lý đơn hàng OMS">
            <?php foreach ($steps as $idx => $st): ?>
                <?php
                $is_done    = ($active_idx !== false && $idx <= $active_idx);
                $is_current = ($active_idx !== false && $idx === $active_idx);
                $step_cls   = trim(($is_done ? 'is-done ' : '') . ($is_current ? 'is-current' : ''));
                ?>
                <div class="gf-step <?php echo esc_attr($step_cls); ?>" role="listitem" <?php echo $is_current ? 'aria-current="step"' : ''; ?>>
                    <div class="gf-step-dot"><?php echo esc_html((string) ($idx + 1)); ?></div>
                    <div class="gf-step-label"><?php echo esc_html($st['label']); ?></div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($app)): ?>
        <div class="gf-installment-progress">
            <h4>Hồ sơ Trả góp Sinh viên #<?php echo esc_html((string) $app['app_id']); ?></h4>
            <p class="gf-mono-summary">
                <span>Trạng thái: <code class="gf-status-code"><?php echo esc_html((string) $app['status']); ?></code></span>
                <span>Trả trước: <strong class="gf-mono"><?php echo esc_html(number_format((float) $app['downpayment_amount'], 0, ',', '.')); ?>đ</strong></span>
                <span>Góp/tháng: <strong class="gf-mono"><?php echo esc_html(number_format((float) $app['monthly_amount'], 0, ',', '.')); ?>đ</strong></span>
            </p>
            <div class="gf-2layer-badges">
                <span class="gf-layer-badge <?php echo !empty($app['l1_verified_at']) ? 'is-ok' : 'is-wait'; ?>">Lớp 1: CCCD &amp; Thẻ SV</span>
                <span class="gf-layer-badge <?php echo !empty($app['l2_verified_at']) ? 'is-ok' : 'is-wait'; ?>">Lớp 2: SĐT &amp; .edu.vn</span>
                <span class="gf-layer-badge <?php echo ($app['status'] ?? '') === 'ACTIVE_INSTALLMENT' ? 'is-ok' : 'is-wait'; ?>">Thanh toán trả trước 3DS</span>
            </div>
            <?php if (($app['status'] ?? '') === 'REJECTED'): ?>
                <div class="gf-alert-danger" role="alert" style="margin-top:12px;">
                    Hồ sơ trả góp đã bị từ chối<?php echo !empty($app['reject_reason']) ? ': <strong>' . esc_html((string) $app['reject_reason']) . '</strong>' : '.'; ?>
                </div>
            <?php elseif (($app['status'] ?? '') === 'APPROVED_WAITING_DOWNPAYMENT' && class_exists('GF_Payment_Sandbox')): ?>
                <?php
                $pay_url = method_exists(GF_Payment_Sandbox::class, 'get_sandbox_checkout_url')
                    ? GF_Payment_Sandbox::get_sandbox_checkout_url($order_id, (int) round((float) $app['downpayment_amount']), 'VNPAY', 'downpayment')
                    : GF_Payment_Sandbox::create_sandbox_payment_session($order_id, 'vnpay', 'downpayment');
                if (is_wp_error($pay_url)) {
                    $pay_url = '#';
                }
                ?>
                <div class="gf-oms-pay-action">
                    <a href="<?php echo esc_url($pay_url); ?>" class="gf-btn gf-btn-primary">
                        Thanh toán trả trước (<?php echo esc_html(number_format((float) $app['downpayment_amount'], 0, ',', '.')); ?>đ)
                    </a>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if (!empty($serials)): ?>
        <div class="gf-serial-panel">
            <h4>Mã Serial Number (S/N) &amp; Yêu cầu Bảo hành (UC-09)</h4>
            <ul class="gf-sn-list">
                <?php foreach ($serials as $sn): ?>
                    <li>
                        <code class="gf-mono"><?php echo esc_html((string) ($sn['serial_number'] ?? '')); ?></code>
                        <span>Hạn bảo hành đến <strong class="gf-mono"><?php echo esc_html((string) ($sn['warranty_end_date'] ?? '')); ?></strong></span>
                    </li>
                <?php endforeach; ?>
            </ul>
            <form id="gf-rma-form" class="gf-rma-form" data-order-id="<?php echo esc_attr((string) $order_id); ?>">
                <label for="gf-rma-sn" class="screen-reader-text">Mã Serial Number</label>
                <input type="text" id="gf-rma-sn" name="serial_number" placeholder="Nhập đúng mã S/N trên thân máy..." required />
                <label for="gf-rma-reason" class="screen-reader-text">Mô tả tình trạng bảo hành</label>
                <input type="text" id="gf-rma-reason" name="reason" placeholder="Mô tả tình trạng cần bảo hành / đổi trả..." required />
                <button type="submit" class="gf-btn gf-btn-ghost gf-btn-sm">Gửi yêu cầu bảo hành</button>
                <span id="gf-rma-msg" role="status" aria-live="polite"></span>
            </form>
        </div>
    <?php endif; ?>
</div>
