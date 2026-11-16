<?php
/**
 * GearForge Child Theme functions: fonts, left filter sidebar, Bento flagship hero, VND mini-cart & BCT footer.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', static function (): void {
    wp_enqueue_style(
        'gearforge-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap',
        [],
        null
    );
    wp_enqueue_style('storefront-style', get_template_directory_uri() . '/style.css', [], '1.0.0');
    wp_enqueue_style('gearforge-child-style', get_stylesheet_uri(), ['storefront-style', 'gearforge-fonts'], '2.0.0');
});

// Use fullwidth on Single Product, Cart, Checkout, Account & Compare/OMS tools; LEFT sidebar on Shop/Category archives
add_filter('body_class', static function (array $classes): array {
    if (is_product() || is_cart() || is_checkout() || is_account_page() || is_page(['so-sanh-cau-hinh', 'tra-cuu-don-hang'])) {
        $classes[] = 'page-template-template-fullwidth-php';
        return array_diff($classes, ['right-sidebar', 'left-sidebar']);
    }
    return array_map(static fn(string $c): string => $c === 'right-sidebar' ? 'left-sidebar' : $c, $classes);
}, 99);

add_action('wp', static function (): void {
    remove_action('woocommerce_before_shop_loop', 'storefront_woocommerce_pagination', 30);
    if (is_product() || is_cart() || is_checkout() || is_account_page() || is_page(['so-sanh-cau-hinh', 'tra-cuu-don-hang'])) {
        remove_action('storefront_sidebar', 'storefront_get_sidebar', 10);
    }
});

// Override Storefront pluggable header brand output with crisp SVG + concise title
if (!function_exists('storefront_site_title_or_logo')) {
    function storefront_site_title_or_logo(bool $echo = true): string {
        $svg = '<svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect width="28" height="28" rx="7" fill="#0066FF"/><path d="M8 9H20V12H11V14.5H18V17.5H11V20H8V9Z" fill="white"/></svg>';
        $tag = (is_front_page() || is_home()) ? 'h1' : 'div';
        $html = sprintf(
            '<%1$s class="beta site-title"><a href="%2$s" rel="home">%3$s<span>GearForge</span><span class="gf-brand-sub">UIT Hardware</span></a></%1$s>',
            $tag,
            esc_url(home_url('/')),
            $svg
        );
        if (!$echo) {
            return $html;
        }
        echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        return $html;
    }
}

add_filter('woocommerce_product_single_add_to_cart_text', static function (): string {
    return 'Thêm vào giỏ hàng';
});

// Default catalog sort to flagship hardware first & localize Vietnamese loop copy
add_filter('woocommerce_default_catalog_orderby', static function (): string {
    return 'price-desc';
});

add_filter('get_product_search_form', static function (string $form): string {
    $form = str_replace('Search products&hellip;', 'Tìm Laptop, PC, GPU, RAM...', $form);
    return str_replace('placeholder="Search', 'placeholder="Tìm kiếm', $form);
});

// Replace generic "SALE!" badge and English loop labels cleanly
add_filter('woocommerce_sale_flash', static function (): string {
    return '<span class="onsale">Ưu đãi SV</span>';
});

add_filter('woocommerce_product_add_to_cart_text', static function (string $text, WC_Product $product): string {
    return ($product->is_type('simple') && $product->is_purchasable() && $product->is_in_stock())
        ? 'Thêm vào giỏ'
        : $text;
}, 10, 2);

add_filter('woocommerce_page_title', static function (string $title): string {
    return is_shop() ? 'Danh mục Laptop, PC & Phụ kiện' : $title;
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
    if (!is_front_page() && !is_shop() && !is_product_category()) {
        return;
    }
    $hero_img = get_stylesheet_directory_uri() . '/assets/img/laptop.svg';
    $cur_term = is_product_category() ? get_queried_object() : null;
    $cur_slug = ($cur_term instanceof WP_Term) ? $cur_term->slug : 'all';
    $segments = [
        ['slug' => 'all',              'label' => 'Tất cả (520 SP)',     'url' => home_url('/shop/')],
        ['slug' => 'laptop-van-phong', 'label' => 'Laptop Văn phòng',    'url' => home_url('/product-category/laptop/laptop-van-phong/')],
        ['slug' => 'laptop-gaming',    'label' => 'Laptop Gaming',       'url' => home_url('/product-category/laptop/laptop-gaming/')],
        ['slug' => 'laptop-do-hoa',    'label' => 'Laptop Đồ họa',       'url' => home_url('/product-category/laptop/laptop-do-hoa/')],
        ['slug' => 'pc-nguyen-bo',     'label' => 'PC Nguyên bộ',        'url' => home_url('/product-category/pc-nguyen-bo/')],
        ['slug' => 'phu-kien',         'label' => 'Phụ kiện & Gear',     'url' => home_url('/product-category/phu-kien/')],
    ];
    ?>
    <div class="col-full gf-bento-shell">
        <?php if (!is_paged() && (is_front_page() || is_shop())): ?>
        <div class="gf-bento-grid">
            <div class="gf-hero-main">
                <div>
                    <span class="gf-hero-tag">ĐHQG TP.HCM • Hardware Flagship</span>
                    <h2>Laptop &amp; PC chuẩn sinh viên — So sánh cấu hình, trả góp 0%</h2>
                    <p>Đối chiếu 3 máy cạnh nhau theo CPU, RAM, GPU. Hồ sơ CCCD &amp; Thẻ SV mã hóa AES-256 chuẩn Nghị định 13/2023/NĐ-CP.</p>
                    <div class="gf-hero-actions">
                        <a class="gf-btn gf-btn-primary" href="<?php echo esc_url(home_url('/product-category/laptop/')); ?>">Xem Laptop Sinh viên</a>
                        <a class="gf-btn gf-btn-secondary" href="<?php echo esc_url(home_url('/so-sanh-cau-hinh/')); ?>">Bảng Compare Specs</a>
                    </div>
                </div>
                <div class="gf-hero-visual">
                    <img src="<?php echo esc_url($hero_img); ?>" alt="GearForge Laptop Showcase" />
                </div>
            </div>
            <div class="gf-hero-side">
                <div class="gf-utility-card">
                    <div>
                        <h3>Trả góp Sinh viên 3–6–12 tháng</h3>
                        <p>Trả trước từ 20%, lãi suất 0% kỳ hạn 3 tháng. Duyệt hồ sơ 2 lớp (Giấy tờ + .edu.vn) qua Sandbox 3D-Secure.</p>
                    </div>
                    <a class="gf-utility-link" href="<?php echo esc_url(home_url('/product-category/laptop/laptop-gaming/')); ?>">Chọn máy &amp; tính góp ngay &rarr;</a>
                </div>
                <div class="gf-utility-card">
                    <div>
                        <h3>Bảo hành chuẩn S/N &amp; Hóa đơn T-VAN</h3>
                        <p>Mỗi Laptop/PC gắn mã Serial Number duy nhất khi xuất kho và hỗ trợ tra cứu tiến độ OMS 7 bước.</p>
                    </div>
                    <a class="gf-utility-link" href="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>">Tra cứu đơn hàng OMS &rarr;</a>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <nav class="gf-segment-bar" aria-label="Danh mục nhanh">
            <?php foreach ($segments as $seg): ?>
                <a class="gf-segment-pill <?php echo $cur_slug === $seg['slug'] ? 'is-active' : ''; ?>" href="<?php echo esc_url($seg['url']); ?>">
                    <?php echo esc_html($seg['label']); ?>
                </a>
            <?php endforeach; ?>
        </nav>
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
    <script>
    (function () {
        try {
            var cleared = false;
            for (var i = sessionStorage.length - 1; i >= 0; i--) {
                var k = sessionStorage.key(i);
                if (k && k.indexOf('wc_fragments') === 0) {
                    var v = sessionStorage.getItem(k) || '';
                    if (v.indexOf('&#36;') !== -1 || v.indexOf('$0.00') !== -1) {
                        sessionStorage.removeItem(k);
                        cleared = true;
                    }
                }
            }
            if (cleared && window.jQuery) {
                window.jQuery(document.body).trigger('wc_fragment_refresh');
            }
        } catch (e) {}
    })();
    </script>
    <?php
}, 20);
