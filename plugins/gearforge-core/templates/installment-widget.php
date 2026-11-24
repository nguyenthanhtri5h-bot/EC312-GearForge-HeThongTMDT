<?php
/**
 * Student Installment Calculator & Application Widget (UC-10) with NĐ 13/2023 Consent Banner.
 * Available vars: $product_id (int), $price (float), $plans (array)
 */

if (!defined('ABSPATH')) {
    exit;
}

$product_id    = isset($product_id) ? (int) $product_id : 0;
$price         = isset($price) ? (float) $price : 0.0;
$plans         = isset($plans) && is_array($plans) ? $plans : [];
$initial_price = $price > 0 ? $price : 20000000;

$plan_months    = !empty($plans) ? array_map(static fn(array $pl): int => (int) ($pl['duration_months'] ?? 0), $plans) : [3, 6, 12];
$default_months = in_array(6, $plan_months, true) ? 6 : ($plan_months[0] ?: 6);

if (class_exists('GF_Installment_Calc')) {
    $initial_calc = GF_Installment_Calc::calculate($initial_price, 30, $default_months);
} else {
    $fallback_rates = [3 => 0.0, 6 => 1.2, 12 => 1.5];
    $rate           = $fallback_rates[$default_months] ?? 1.2;
    $down           = round($initial_price * 0.30, 0);
    $loan           = max(0.0, $initial_price - $down);
    $monthly        = $default_months > 0 ? round(($loan * (1 + ($rate / 100) * $default_months)) / $default_months, -3) : 0;
    $initial_calc   = [
        'downpayment_amount' => (int) $down,
        'loan_principal'     => (int) $loan,
        'monthly_amount'     => (int) $monthly,
    ];
}

$myaccount_url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_login_url();
?>
<div id="gf-installment-widget" class="gf-installment-widget" data-price="<?php echo esc_attr((string) $initial_price); ?>" data-product-id="<?php echo esc_attr((string) $product_id); ?>">
    <div class="gf-widget-head">
        <div>
            <h3>Tính &amp; Đăng ký Trả góp Sinh viên</h3>
            <p class="gf-widget-sub">Lựa chọn tỷ lệ trả trước và kỳ hạn 3–6–12 tháng; duyệt trực tuyến qua CCCD, Thẻ SV và email <code>.edu.vn</code>.</p>
        </div>
        <span class="gf-status-badge is-ok">0% lãi kỳ hạn 3 tháng</span>
    </div>

    <div class="gf-calc-grid">
        <div class="gf-field">
            <label for="gf-downpayment-pct">Tỷ lệ trả trước</label>
            <div class="gf-pill-selector" role="group" aria-label="Chọn tỷ lệ trả trước">
                <button type="button" class="gf-pill-btn" data-target="#gf-downpayment-pct" data-value="20" aria-pressed="false">20%</button>
                <button type="button" class="gf-pill-btn is-active" data-target="#gf-downpayment-pct" data-value="30" aria-pressed="true">30% (Gợi ý)</button>
                <button type="button" class="gf-pill-btn" data-target="#gf-downpayment-pct" data-value="50" aria-pressed="false">50%</button>
            </div>
            <select id="gf-downpayment-pct" class="gf-calc-input gf-sr-select" aria-hidden="true" tabindex="-1">
                <option value="20">20% (Tối thiểu)</option>
                <option value="30" selected>30% (Khuyên dùng)</option>
                <option value="50">50%</option>
            </select>
        </div>
        <div class="gf-field">
            <label for="gf-term-months">Kỳ hạn trả góp</label>
            <div class="gf-pill-selector" role="group" aria-label="Chọn kỳ hạn trả góp">
                <?php if (!empty($plans)): ?>
                    <?php foreach ($plans as $pl): ?>
                        <?php
                        $m        = (int) ($pl['duration_months'] ?? 6);
                        $rate_pct = (string) ($pl['monthly_interest_pct'] ?? '0');
                        $active   = $m === $default_months;
                        ?>
                        <button
                            type="button"
                            class="gf-pill-btn <?php echo $active ? 'is-active' : ''; ?>"
                            data-target="#gf-term-months"
                            data-value="<?php echo esc_attr((string) $m); ?>"
                            aria-pressed="<?php echo $active ? 'true' : 'false'; ?>"
                        >
                            <?php echo esc_html((string) $m); ?> tháng (<?php echo esc_html($rate_pct); ?>%)
                        </button>
                    <?php endforeach; ?>
                <?php else: ?>
                    <button type="button" class="gf-pill-btn" data-target="#gf-term-months" data-value="3" aria-pressed="false">3 tháng (0%)</button>
                    <button type="button" class="gf-pill-btn is-active" data-target="#gf-term-months" data-value="6" aria-pressed="true">6 tháng (1.2%)</button>
                    <button type="button" class="gf-pill-btn" data-target="#gf-term-months" data-value="12" aria-pressed="false">12 tháng (1.5%)</button>
                <?php endif; ?>
            </div>
            <select id="gf-term-months" class="gf-calc-input gf-sr-select" aria-hidden="true" tabindex="-1">
                <?php if (!empty($plans)): ?>
                    <?php foreach ($plans as $pl): ?>
                        <?php $m = (int) ($pl['duration_months'] ?? 6); ?>
                        <option value="<?php echo esc_attr((string) $m); ?>" <?php selected($m, $default_months); ?>>
                            <?php echo esc_html((string) $m); ?> tháng (<?php echo esc_html((string) ($pl['monthly_interest_pct'] ?? '0')); ?>%/tháng)
                        </option>
                    <?php endforeach; ?>
                <?php else: ?>
                    <option value="3">3 tháng (0% lãi)</option>
                    <option value="6" selected>6 tháng (1.2%/tháng)</option>
                    <option value="12">12 tháng (1.5%/tháng)</option>
                <?php endif; ?>
            </select>
        </div>
    </div>

    <div class="gf-ratio-track" aria-hidden="true">
        <div id="gf-ratio-down" class="gf-ratio-fill" style="width:30%;"></div>
    </div>

    <div class="gf-calc-summary" aria-live="polite">
        <div class="gf-sum-item">
            <span>Trả trước khi nhận</span>
            <strong id="gf-res-down"><?php echo esc_html(number_format((float) $initial_calc['downpayment_amount'], 0, ',', '.')); ?>đ</strong>
        </div>
        <div class="gf-sum-item">
            <span>Khoản vay còn lại</span>
            <strong id="gf-res-loan"><?php echo esc_html(number_format((float) $initial_calc['loan_principal'], 0, ',', '.')); ?>đ</strong>
        </div>
        <div class="gf-sum-item gf-sum-highlight">
            <span>Ước tính mỗi tháng</span>
            <strong id="gf-res-monthly"><?php echo esc_html(number_format((float) $initial_calc['monthly_amount'], 0, ',', '.')); ?>đ/th</strong>
        </div>
    </div>

    <?php if (!is_user_logged_in()): ?>
        <div class="gf-login-notice">
            Vui lòng <a href="<?php echo esc_url($myaccount_url ?: wp_login_url()); ?>">đăng nhập tài khoản sinh viên</a> để tải lên hồ sơ CCCD và Thẻ sinh viên.
        </div>
    <?php elseif ($product_id > 0): ?>
        <form id="gf-installment-app-form" class="gf-app-form" enctype="multipart/form-data">
            <input type="hidden" name="action" value="gf_submit_installment_app" />
            <input type="hidden" name="nonce" value="<?php echo esc_attr(wp_create_nonce('gf_frontend_nonce')); ?>" />
            <input type="hidden" name="product_id" value="<?php echo esc_attr((string) $product_id); ?>" />
            <input type="hidden" name="downpayment_pct" id="gf-form-down-pct" value="30" />
            <input type="hidden" name="months" id="gf-form-months" value="<?php echo esc_attr((string) $default_months); ?>" />

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-student-code">Mã số sinh viên (MSSV) *</label>
                    <input type="text" id="gf-student-code" name="student_code" autocomplete="off" placeholder="VD: 24521838" required />
                </div>
                <div class="gf-field">
                    <label for="gf-edu-email">Email sinh viên (.edu.vn) *</label>
                    <input type="email" id="gf-edu-email" name="student_edu_email" autocomplete="email" placeholder="mssv@gm.uit.edu.vn" required />
                </div>
            </div>

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-cccd-number">Số CCCD (12 chữ số) *</label>
                    <input type="text" id="gf-cccd-number" name="cccd_number" inputmode="numeric" pattern="\d{12}" maxlength="12" placeholder="07920xxxxxxx" required />
                </div>
                <div class="gf-field">
                    <label for="gf-phone">SĐT xác thực Lớp 2 *</label>
                    <input type="tel" id="gf-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="09xxxxxxxx" required />
                </div>
            </div>

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-cccd-file">Ảnh CCCD gắn chip (JPG/PNG/PDF &le; 5MB) *</label>
                    <input type="file" id="gf-cccd-file" name="cccd_file" accept=".jpg,.jpeg,.png,.pdf" required />
                </div>
                <div class="gf-field">
                    <label for="gf-svcard-file">Ảnh Thẻ Sinh viên (JPG/PNG/PDF &le; 5MB) *</label>
                    <input type="file" id="gf-svcard-file" name="student_card_file" accept=".jpg,.jpeg,.png,.pdf" required />
                </div>
            </div>

            <div class="gf-consent-banner" role="region" aria-labelledby="gf-consent-heading">
                <div id="gf-consent-heading" class="gf-consent-title">Cam kết Bảo vệ Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP)</div>
                <p>
                    GearForge chỉ thu thập, <strong>mã hóa AES-256-CBC</strong> và lưu trữ tách biệt ảnh CCCD, Thẻ sinh viên cùng Email <code>.edu.vn</code> nhằm mục đích duy nhất là thẩm định hồ sơ trả góp sinh viên 2 lớp. Dữ liệu được phân quyền nghiêm ngặt (chỉ Chuyên viên duyệt hồ sơ được giải mã) và tự động hủy sau 30 ngày nếu hồ sơ bị từ chối hoặc sau khi hoàn tất nghĩa vụ theo quy định pháp luật.
                </p>
                <label class="gf-consent-check" for="gf-consent-nd13">
                    <input type="checkbox" id="gf-consent-nd13" name="consent_nd13_accepted" value="1" />
                    <span>Tôi đã đọc và đồng ý cho GearForge xử lý dữ liệu hồ sơ theo Điều khoản trên <strong>(Bắt buộc)</strong>.</span>
                </label>
            </div>

            <div id="gf-app-feedback" class="gf-app-feedback" role="status" aria-live="polite" style="display:none;"></div>

            <button type="submit" id="gf-submit-installment-btn" class="gf-btn gf-btn-primary gf-btn-block" disabled>
                Nộp hồ sơ Trả góp Sinh viên
            </button>
        </form>
    <?php endif; ?>
</div>
