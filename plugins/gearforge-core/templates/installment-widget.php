<?php
/**
 * Student Installment Calculator & Application Widget (UC-10) with mandatory NĐ 13/2023 Consent Banner.
 * Available vars: $product_id (int), $price (float), $plans (array)
 */

if (!defined('ABSPATH')) {
    exit;
}

$initial_price = $price > 0 ? $price : 20000000;
$initial_calc  = GF_Installment_Calc::calculate($initial_price, 30, 6);
?>
<div id="gf-installment-widget" class="gf-installment-widget" data-price="<?php echo esc_attr((string) $initial_price); ?>" data-product-id="<?php echo esc_attr((string) $product_id); ?>">
    <div class="gf-widget-head">
        <span class="gf-eyebrow">Dành riêng cho Sinh viên UIT / ĐHQG</span>
        <h3>Công cụ Tính &amp; Đăng ký Trả góp Sinh viên (3 – 6 – 12 tháng)</h3>
    </div>

    <div class="gf-calc-grid">
        <div class="gf-field">
            <label for="gf-downpayment-pct">Tỷ lệ trả trước</label>
            <select id="gf-downpayment-pct" class="gf-calc-input">
                <option value="20">20% (Tối thiểu)</option>
                <option value="30" selected>30% (Khuyên dùng)</option>
                <option value="50">50%</option>
            </select>
        </div>
        <div class="gf-field">
            <label for="gf-term-months">Kỳ hạn trả góp</label>
            <select id="gf-term-months" class="gf-calc-input">
                <?php if (!empty($plans)): ?>
                    <?php foreach ($plans as $pl): ?>
                        <option value="<?php echo esc_attr((string) $pl['duration_months']); ?>" <?php selected((int) $pl['duration_months'], 6); ?>>
                            <?php echo esc_html($pl['plan_name']); ?> (<?php echo esc_html((string) $pl['monthly_interest_pct']); ?>%/th)
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

    <div class="gf-calc-summary">
        <div class="gf-sum-item">
            <span>Trả trước ngay</span>
            <strong id="gf-res-down"><?php echo esc_html(number_format($initial_calc['downpayment_amount'], 0, ',', '.')); ?>đ</strong>
        </div>
        <div class="gf-sum-item">
            <span>Gốc vay còn lại</span>
            <strong id="gf-res-loan"><?php echo esc_html(number_format($initial_calc['loan_principal'], 0, ',', '.')); ?>đ</strong>
        </div>
        <div class="gf-sum-item gf-sum-highlight">
            <span>Góp hàng tháng</span>
            <strong id="gf-res-monthly"><?php echo esc_html(number_format($initial_calc['monthly_amount'], 0, ',', '.')); ?>đ/th</strong>
        </div>
    </div>

    <?php if (!is_user_logged_in()): ?>
        <div class="gf-login-notice">
            Vui lòng <a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>">đăng nhập tài khoản sinh viên</a> để tải lên hồ sơ CCCD &amp; Thẻ sinh viên.
        </div>
    <?php elseif ($product_id > 0): ?>
        <form id="gf-installment-app-form" class="gf-app-form" enctype="multipart/form-data">
            <input type="hidden" name="action" value="gf_submit_installment_app" />
            <input type="hidden" name="nonce" value="<?php echo esc_attr(wp_create_nonce('gf_frontend_nonce')); ?>" />
            <input type="hidden" name="product_id" value="<?php echo esc_attr((string) $product_id); ?>" />
            <input type="hidden" name="downpayment_pct" id="gf-form-down-pct" value="30" />
            <input type="hidden" name="months" id="gf-form-months" value="6" />

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-student-code">Mã số sinh viên (MSSV) *</label>
                    <input type="text" id="gf-student-code" name="student_code" placeholder="VD: 24521838" required />
                </div>
                <div class="gf-field">
                    <label for="gf-edu-email">Email sinh viên (.edu.vn) *</label>
                    <input type="email" id="gf-edu-email" name="student_edu_email" placeholder="mssv@gm.uit.edu.vn" required />
                </div>
            </div>

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-cccd-number">Số CCCD (12 số) *</label>
                    <input type="text" id="gf-cccd-number" name="cccd_number" pattern="\d{12}" maxlength="12" placeholder="07920xxxxxxx" required />
                </div>
                <div class="gf-field">
                    <label for="gf-phone">SĐT xác thực Lớp 2 *</label>
                    <input type="tel" id="gf-phone" name="phone" placeholder="09xxxxxxxx" required />
                </div>
            </div>

            <div class="gf-form-row">
                <div class="gf-field">
                    <label for="gf-cccd-file">Ảnh CCCD gắn chip (JPG/PNG/PDF ≤ 5MB) *</label>
                    <input type="file" id="gf-cccd-file" name="cccd_file" accept=".jpg,.jpeg,.png,.pdf" required />
                </div>
                <div class="gf-field">
                    <label for="gf-svcard-file">Ảnh Thẻ Sinh viên (JPG/PNG/PDF ≤ 5MB) *</label>
                    <input type="file" id="gf-svcard-file" name="student_card_file" accept=".jpg,.jpeg,.png,.pdf" required />
                </div>
            </div>

            <div class="gf-consent-banner">
                <div class="gf-consent-title">Thông báo Xử lý Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP)</div>
                <p>
                    GearForge cam kết chỉ thu thập, <strong>mã hóa AES-256-CBC</strong> và lưu trữ tách biệt (ngoài thư mục công khai) hình ảnh CCCD, Thẻ sinh viên cùng Email <code>.edu.vn</code> nhằm mục đích duy nhất là thẩm định hồ sơ trả góp sinh viên 2 lớp. Dữ liệu được phân quyền nghiêm ngặt (chỉ Chuyên viên duyệt hồ sơ mới được giải mã).
                </p>
                <label class="gf-consent-check">
                    <input type="checkbox" id="gf-consent-nd13" name="consent_nd13_accepted" value="1" />
                    <span>Tôi đã đọc, hiểu rõ và đồng ý với Điều khoản bảo vệ dữ liệu cá nhân nêu trên <strong>(Bắt buộc)</strong>.</span>
                </label>
            </div>

            <div id="gf-app-feedback" class="gf-app-feedback" style="display:none;"></div>

            <button type="submit" id="gf-submit-installment-btn" class="gf-btn gf-btn-primary gf-btn-block" disabled>
                Nộp hồ sơ Trả góp Sinh viên (Duyệt 2 lớp)
            </button>
        </form>
    <?php endif; ?>
</div>
