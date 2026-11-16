<?php
/**
 * Idempotent GearForge WordPress + WooCommerce environment setup helper.
 * Usage: wp eval-file /var/www/gf-data/provision_gearforge.php --allow-root
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "WordPress context required.\n");
    exit(1);
}

// 1. Create required GearForge pages idempotently
$pages = [
    'so-sanh-cau-hinh' => [
        'title'   => 'So sánh cấu hình Laptop / PC (Compare Specs)',
        'content' => '[gearforge_compare]',
    ],
    'tra-cuu-don-hang' => [
        'title'   => 'Theo dõi đơn hàng & Hồ sơ trả góp (OMS)',
        'content' => '[gearforge_oms_tracking]',
    ],
    'chinh-sach-bao-hanh' => [
        'title'   => 'Chính sách Bảo hành chính hãng GearForge',
        'content' => '<p>GearForge bảo hành chính hãng 12–36 tháng theo từng thiết bị và đối chiếu chính xác mã Serial Number (S/N) / Service Tag gắn trên đơn hàng xuất kho.</p>',
    ],
    'chinh-sach-doi-tra' => [
        'title'   => 'Chính sách Đổi mới & Hoàn trả 7 ngày',
        'content' => '<p>Hỗ trợ đổi mới 1-1 trong 7 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất và trùng khớp mã Serial Number đã bàn giao.</p>',
    ],
    'chinh-sach-bao-mat-nd13' => [
        'title'   => 'Chính sách Bảo mật Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP)',
        'content' => '<p>GearForge tuân thủ Nghị định 13/2023/NĐ-CP: chỉ thu thập hồ sơ CCCD/Thẻ sinh viên khi có sự đồng ý rõ ràng (Consent), mã hóa AES-256-CBC và lưu trữ ngoài thư mục web công khai.</p>',
    ],
    'dieu-khoan-su-dung' => [
        'title'   => 'Điều khoản sử dụng & Thông báo Bộ Công Thương',
        'content' => '<p>Website TMĐT B2C GearForge (Đồ án EC312 – UIT ĐHQG TP.HCM). Đơn vị vận hành mẫu tuân thủ quy trình thông báo Bộ Công Thương và chuẩn dữ liệu hóa đơn VAT (T-VAN).</p>',
    ],
];

foreach ($pages as $slug => $cfg) {
    if (!get_page_by_path($slug)) {
        wp_insert_post([
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_name'    => $slug,
            'post_title'   => $cfg['title'],
            'post_content' => $cfg['content'],
        ]);
        echo "Created page /{$slug}/\n";
    }
}

// 2. Create BACKTOSCHOOL student coupon (TC-09)
if (class_exists('WC_Coupon')) {
    $existing_coupon_id = wc_get_coupon_id_by_code('BACKTOSCHOOL');
    if (!$existing_coupon_id) {
        $coupon = new WC_Coupon();
        $coupon->set_code('BACKTOSCHOOL');
        $coupon->set_discount_type('fixed_cart');
        $coupon->set_amount(500000);
        $coupon->set_minimum_amount(10000000);
        $coupon->set_description('Ưu đãi sinh viên mùa tựu trường ĐHQG TP.HCM - Giảm 500.000đ cho đơn từ 10 triệu');
        $coupon->save();
        echo "Created coupon BACKTOSCHOOL\n";
    }
}

// 3. Create 3 standard EC312 test accounts if missing
$test_pass = getenv('GF_TEST_USER_PASS') ?: wp_generate_password(16, true);
$users = [
    [
        'login' => 'student_test',
        'email' => 'student@gm.uit.edu.vn',
        'role'  => 'customer',
        'name'  => 'Nguyen Van Sinh Vien',
        'meta'  => ['gf_student_edu_email' => '24521838@gm.uit.edu.vn', 'gf_edu_verified' => 1],
    ],
    [
        'login' => 'reviewer_test',
        'email' => 'reviewer@gearforge.local',
        'role'  => 'installment_reviewer',
        'name'  => 'Chuyen Vien Duyet Ho So',
        'meta'  => [],
    ],
    [
        'login' => 'staff_test',
        'email' => 'staff@gearforge.local',
        'role'  => 'order_staff',
        'name'  => 'Nhan Vien Kho Don Hang',
        'meta'  => [],
    ],
];

foreach ($users as $u) {
    if (!username_exists($u['login'])) {
        $uid = wp_create_user($u['login'], $test_pass, $u['email']);
        if (!is_wp_error($uid)) {
            wp_update_user(['ID' => $uid, 'display_name' => $u['name'], 'role' => $u['role']]);
            foreach ($u['meta'] as $mk => $mv) {
                update_user_meta($uid, $mk, $mv);
            }
            echo "Created test user {$u['login']} ({$u['role']})\n";
        }
    }
}

// Ensure WooCommerce pages exist
if (class_exists('WC_Install')) {
    WC_Install::create_pages();
    echo "Ensured WooCommerce core pages.\n";
}
