<?php
/**
 * GearForge Child Theme functions: enqueues styles, renders student hero banner & BCT legal footer links.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', static function (): void {
    wp_enqueue_style('storefront-style', get_template_directory_uri() . '/style.css', [], '1.0.0');
    wp_enqueue_style('gearforge-child-style', get_stylesheet_uri(), ['storefront-style'], '1.0.0');
});

add_action('wp', static function (): void {
    if (is_page(['so-sanh-cau-hinh', 'tra-cuu-don-hang'])) {
        remove_action('storefront_sidebar', 'storefront_get_sidebar', 10);
    }
});

add_filter('body_class', static function (array $classes): array {
    if (is_page(['so-sanh-cau-hinh', 'tra-cuu-don-hang'])) {
        $classes[] = 'page-template-template-fullwidth-php';
    }
    return $classes;
});

add_filter('woocommerce_placeholder_img_src', static function (string $src): string {
    global $product;
    $img = 'laptop.svg';
    if ($product instanceof WC_Product) {
        $terms = wp_get_post_terms($product->get_id(), 'product_cat', ['fields' => 'slugs']);
        if (is_array($terms)) {
            $joined = implode(',', $terms);
            if (str_contains($joined, 'pc')) {
                $img = 'pc.svg';
            } elseif (!str_contains($joined, 'laptop')) {
                $img = 'accessory.svg';
            }
        }
    }
    return get_stylesheet_directory_uri() . '/assets/img/' . $img;
});

add_action('storefront_before_content', static function (): void {
    if (!is_front_page() && !is_shop()) {
        return;
    }
    ?>
    <div class="col-full">
        <div class="gf-hero-banner">
            <h2>GearForge – Laptop, PC &amp; Phụ kiện chuẩn Sinh viên ĐHQG TP.HCM</h2>
            <p>So sánh trực quan tối đa 3 cấu hình Laptop/PC, bộ lọc CPU/RAM/GPU chuyên sâu và hỗ trợ Trả góp Sinh viên 0% lãi (3–6–12 tháng) bảo mật chuẩn Nghị định 13/2023/NĐ-CP.</p>
            <div class="gf-hero-actions">
                <a class="gf-btn gf-btn-secondary" href="<?php echo esc_url(home_url('/shop/')); ?>">Khám phá ≥ 500 sản phẩm</a>
                <a class="gf-btn gf-btn-primary" href="<?php echo esc_url(home_url('/so-sanh-cau-hinh/')); ?>">Mở Bảng So Sánh (Compare Specs)</a>
            </div>
        </div>
    </div>
    <?php
});

add_action('wp_footer', static function (): void {
    if (is_admin()) {
        return;
    }
    ?>
    <div class="gf-legal-footer-bar">
        <span><strong>GearForge Việt Nam</strong> – Hệ thống TMĐT B2C Laptop, PC &amp; Phụ kiện (EC312)</span>
        <span style="margin:0 8px;">|</span>
        <a href="<?php echo esc_url(home_url('/chinh-sach-bao-hanh/')); ?>">Chính sách bảo hành</a>
        <a href="<?php echo esc_url(home_url('/chinh-sach-doi-tra/')); ?>">Chính sách đổi trả 7 ngày</a>
        <a href="<?php echo esc_url(home_url('/chinh-sach-bao-mat-nd13/')); ?>">Bảo mật dữ liệu NĐ 13/2023</a>
        <a href="<?php echo esc_url(home_url('/dieu-khoan-su-dung/')); ?>">Điều khoản &amp; Đã thông báo BCT (Mẫu)</a>
    </div>
    <?php
}, 20);
