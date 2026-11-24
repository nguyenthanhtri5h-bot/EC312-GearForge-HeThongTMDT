<?php
/**
 * GearForge Child Theme functions (Blocksy Child — Precision Commerce 2026):
 * Typography, Blocksy sidebar/layout alignment, Mobile off-canvas filter drawer,
 * Bento hero & category segment strip, studio hardware image routing,
 * deterministic diverse catalog ordering, and Vietnamese WooCommerce localization.
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GF_CHILD_VERSION', '4.1.0');

/**
 * Resolve category- and keyword-aware studio hardware image URL across 8 visuals.
 */
function gf_resolve_studio_image_url(?WC_Product $product = null): string {
    if (!$product instanceof WC_Product) {
        $global_product = $GLOBALS['product'] ?? null;
        if ($global_product instanceof WC_Product) {
            $product = $global_product;
        } else {
            $post = get_post();
            if ($post instanceof WP_Post && $post->post_type === 'product' && function_exists('wc_get_product')) {
                $loaded = wc_get_product($post->ID);
                if ($loaded instanceof WC_Product) {
                    $product = $loaded;
                }
            }
        }
    }

    $img = 'laptop-ultrabook.jpg';
    if ($product instanceof WC_Product) {
        $pid    = (int) $product->get_id();
        $terms  = wp_get_post_terms($pid, 'product_cat', ['fields' => 'slugs']);
        $joined = is_array($terms) ? strtolower(implode(',', $terms)) : '';
        $title  = strtolower($product->get_name());

        if (str_contains($joined, 'man-hinh') || preg_match('/(màn hình|monitor|oled|240hz|165hz)/u', $title)) {
            $img = 'monitor-oled.jpg';
        } elseif (str_contains($joined, 'pc') || str_starts_with($title, 'pc ')) {
            if (preg_match('/(mini|dorm|starter|office|compact|tiết kiệm)/u', $title)) {
                $pc_mini = ['pc-mini-itx.jpg', 'pc-minimal.jpg'];
                $img     = $pc_mini[$pid % 2];
            } elseif (preg_match('/(aio|nước|water|nova|creator|ai render|studio|64gb|4070|cad|workstation)/u', $title)) {
                $pc_pro = ['pc-watercool.jpg', 'campus-bk-cad.jpg', 'pc-workstation.jpg'];
                $img    = $pc_pro[$pid % 3];
            } else {
                $pc_pool = ['pc-workstation.jpg', 'pc-minimal.jpg', 'pc-watercool.jpg', 'pc-mini-itx.jpg'];
                $img     = $pc_pool[$pid % 4];
            }
        } elseif (
            str_contains($joined, 'phu-kien')
            || str_contains($joined, 'balo')
            || str_contains($joined, 'ban-phim-co')
            || str_contains($joined, 'chuot-gaming')
            || str_contains($joined, 'ram-ssd')
            || str_contains($joined, 'tai-nghe')
            || (!str_contains($joined, 'laptop') && preg_match('/(balo|chuột|bàn phím|tai nghe|hub|lót chuột|tản nhiệt|sạc|cáp|giá đỡ|ram |ssd |túi)/u', $title))
        ) {
            if (preg_match('/(balo|túi|sạc|cáp|gan|giá đỡ|đế tản nhiệt)/u', $title) || str_contains($joined, 'balo')) {
                $img = 'gear-backpack.jpg';
            } elseif (preg_match('/(tai nghe|headset|loa|mic|hub|dock|ram |ssd )/u', $title) || str_contains($joined, 'tai-nghe') || str_contains($joined, 'ram-ssd')) {
                $img = 'gear-audio-hub.jpg';
            } elseif (preg_match('/(bàn phím|keyboard|chuột|mouse|lót chuột)/u', $title) || str_contains($joined, 'ban-phim-co') || str_contains($joined, 'chuot-gaming')) {
                $img = 'gear-peripherals.jpg';
            } else {
                $gear_pool = ['gear-peripherals.jpg', 'gear-audio-hub.jpg', 'gear-backpack.jpg'];
                $img       = $gear_pool[$pid % 3];
            }
        } elseif (preg_match('/(katana|cyborg|gf63|modern)/u', $title)) {
            $kat_pool = ['laptop-katana.jpg', 'laptop-rog-rgb.jpg'];
            $img      = $kat_pool[$pid % 2];
        } elseif (preg_match('/(tuf|loq|victus|nitro|g5)/u', $title)) {
            $mid_pool = ['laptop-rog-rgb.jpg', 'laptop-gaming.jpg', 'laptop-katana.jpg'];
            $img      = $mid_pool[$pid % 3];
        } elseif (
            str_contains($joined, 'gaming')
            || preg_match('/(rog|legion|predator|gaming)/u', $title)
        ) {
            $gam_pool = ['laptop-rog-rgb.jpg', 'laptop-gaming.jpg', 'campus-uit-ai.jpg', 'laptop-katana.jpg'];
            $img      = $gam_pool[$pid % 4];
        } elseif (preg_match('/(macbook|gram|zenbook|oled|creator|đồ họa|studio|air )/u', $title) || str_contains($joined, 'do-hoa')) {
            $cre_pool = ['laptop-creator.jpg', 'laptop-ultrabook.jpg'];
            $img      = $cre_pool[$pid % 2];
        } else {
            $lap_pool = ['laptop-ultrabook.jpg', 'laptop-creator.jpg', 'campus-uit-ai.jpg'];
            $img      = $lap_pool[$pid % 3];
        }
    }

    return get_stylesheet_directory_uri() . '/assets/img/' . $img;
}

/**
 * Determine whether current view is a focused fullwidth transactional/tool page.
 */
function gf_is_focused_flow_page(): bool {
    return (function_exists('is_product') && is_product())
        || (function_exists('is_cart') && is_cart())
        || (function_exists('is_checkout') && is_checkout())
        || (function_exists('is_account_page') && is_account_page())
        || is_page(['so-sanh-cau-hinh', 'tra-cuu-don-hang']);
}

/**
 * Resolve Flagship React 19 view mode:
 * - 'showcase' on `/` (Brand Introduction & 3D Ecosystem Showcase + 4 Flagship Spotlight cards)
 * - 'shop' on `/shop/` and `/product-category/*` (Dedicated 520-Product Cosmic Storefront)
 * - null on single product, cart, checkout, tool pages, and admin.
 */
function gf_get_flagship_page_mode(): ?string {
    if (is_admin()) {
        return null;
    }
    $req_path = (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $trimmed  = trim($req_path, '/');
    if ($trimmed === '' || $trimmed === 'index.php') {
        if (isset($_GET['view']) && $_GET['view'] === 'shop') {
            return 'shop';
        }
        return 'showcase';
    }
    if ($trimmed === 'shop' || preg_match('#^shop(/page/\d+)?$#i', $trimmed)) {
        return 'shop';
    }
    if (preg_match('#^product-category/([^/?\#]+)#i', $trimmed)) {
        return 'shop';
    }
    if ($trimmed === 'he-sinh-thai') {
        return 'ecosystem';
    }
    if ($trimmed === 'cau-hinh-mau') {
        return 'gallery';
    }
    return null;
}

function gf_is_flagship_front_request(): bool {
    return gf_get_flagship_page_mode() !== null;
}

/**
 * Determine whether current view is the WooCommerce catalog archive with filter drawer.
 */
function gf_is_catalog_archive(): bool {
    if (gf_is_flagship_front_request()) {
        return false;
    }
    return (function_exists('is_shop') && is_shop())
        || (function_exists('is_product_category') && is_product_category())
        || (function_exists('is_product_taxonomy') && is_product_taxonomy())
        || (is_search() && get_query_var('post_type') === 'product');
}

add_filter('pre_handle_404', static function (bool $handled, $wp_query): bool {
    if (gf_get_flagship_page_mode() !== null) {
        if ($wp_query instanceof WP_Query) {
            $wp_query->is_404 = false;
        }
        return true;
    }
    return $handled;
}, 10, 2);

add_action('template_redirect', static function (): void {
    $mode = gf_get_flagship_page_mode();
    if ($mode === null) {
        return;
    }
    global $wp_query;
    if ($wp_query instanceof WP_Query) {
        $wp_query->is_404 = false;
    }
    status_header(200);
}, 1);

add_filter('document_title_parts', static function (array $parts): array {
    $mode = gf_get_flagship_page_mode();
    if ($mode === 'ecosystem') {
        $parts['title'] = 'Hệ sinh thái & Công cụ chọn máy – GearForge';
    } elseif ($mode === 'gallery') {
        $parts['title'] = 'Góc máy thực tế ĐHQG-HCM – GearForge';
    } elseif ($mode === 'shop') {
        $parts['title'] = 'Cửa hàng Laptop, PC & Gaming Gear – GearForge';
    } elseif (function_exists('is_cart') && is_cart()) {
        $parts['title'] = 'Giỏ hàng – GearForge';
    } elseif (function_exists('is_checkout') && is_checkout()) {
        $parts['title'] = 'Thanh toán – GearForge';
    } elseif (function_exists('is_account_page') && is_account_page()) {
        $parts['title'] = 'Tài khoản Sinh viên – GearForge';
    }
    return $parts;
}, 99);

add_filter('the_title', static function (string $title, int $post_id = 0): string {
    if (is_admin() || !in_the_loop() || !is_main_query()) {
        return $title;
    }
    if (function_exists('is_cart') && is_cart() && $post_id === (int) wc_get_page_id('cart')) {
        return 'Giỏ hàng của bạn';
    }
    if (function_exists('is_checkout') && is_checkout() && $post_id === (int) wc_get_page_id('checkout')) {
        return 'Thanh toán & Xác nhận đơn';
    }
    if (function_exists('is_account_page') && is_account_page() && $post_id === (int) wc_get_page_id('myaccount')) {
        return 'Tài khoản Sinh viên';
    }
    return $title;
}, 20, 2);

add_filter('template_include', static function (string $template): string {
    if (gf_is_flagship_front_request()) {
        $front_tpl = get_stylesheet_directory() . '/front-page.php';
        if (file_exists($front_tpl)) {
            return $front_tpl;
        }
    }
    return $template;
}, 99);

add_filter('show_admin_bar', static function (bool $show): bool {
    return gf_is_flagship_front_request() ? false : $show;
}, 99);

add_action('wp', static function (): void {
    if (gf_is_flagship_front_request() && class_exists('GF_Compare_Specs')) {
        remove_action('wp_footer', ['GF_Compare_Specs', 'render_floating_tray']);
    }
}, 20);

add_filter('script_loader_tag', static function (string $tag, string $handle, string $src): string {
    if ($handle !== 'gearforge-flagship-app') {
        return $tag;
    }
    if (preg_match('/<script\b(?=[^>]*\bsrc=)(?![^>]*\btype=)/i', $tag)) {
        return (string) preg_replace('/<script\b(?=[^>]*\bsrc=)/i', '<script type="module"', $tag, 1);
    }
    return (string) preg_replace('/(<script\b[^>]*\bsrc=[^>]*\btype=["\'])text\/javascript(["\'])/i', '$1module$2', $tag, 1);
}, 10, 3);

add_action('wp_enqueue_scripts', static function (): void {
    if (gf_is_flagship_front_request()) {
        wp_enqueue_style(
            'gearforge-flagship-fonts',
            'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@600;700&display=swap',
            [],
            null
        );

        $flagship_dir = get_stylesheet_directory() . '/assets/flagship/';
        $flagship_uri = get_stylesheet_directory_uri() . '/assets/flagship/';
        $css_ver      = file_exists($flagship_dir . 'flagship.css') ? (string) filemtime($flagship_dir . 'flagship.css') : GF_CHILD_VERSION;
        $js_ver       = file_exists($flagship_dir . 'flagship.js') ? (string) filemtime($flagship_dir . 'flagship.js') : GF_CHILD_VERSION;

        wp_enqueue_style('gearforge-flagship-app', $flagship_uri . 'flagship.css', ['gearforge-flagship-fonts'], $css_ver);
        wp_enqueue_script('gearforge-flagship-app', $flagship_uri . 'flagship.js', [], $js_ver, true);
        wp_add_inline_script(
            'gearforge-flagship-app',
            'window.gfFlagshipBoot = ' . wp_json_encode(gf_flagship_build_boot_data(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';',
            'before'
        );
        return;
    }

    wp_enqueue_style(
        'gearforge-fonts',
        'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap',
        [],
        null
    );

    $deps = ['gearforge-fonts'];
    if (wp_style_is('ct-main-styles', 'registered') || wp_style_is('ct-main-styles', 'enqueued')) {
        $deps[] = 'ct-main-styles';
    }
    if (wp_style_is('ct-woocommerce-styles', 'registered') || wp_style_is('ct-woocommerce-styles', 'enqueued')) {
        $deps[] = 'ct-woocommerce-styles';
    }

    wp_enqueue_style('gearforge-child-style', get_stylesheet_uri(), $deps, GF_CHILD_VERSION);

    $cosmic_sec_path = get_stylesheet_directory() . '/assets/css/cosmic-secondary.css';
    if (file_exists($cosmic_sec_path)) {
        $sec_deps = ['gearforge-child-style'];
        if (wp_style_is('gearforge-frontend', 'registered') || wp_style_is('gearforge-frontend', 'enqueued')) {
            $sec_deps[] = 'gearforge-frontend';
        }
        wp_enqueue_style(
            'gearforge-cosmic-secondary',
            get_stylesheet_directory_uri() . '/assets/css/cosmic-secondary.css',
            $sec_deps,
            (string) filemtime($cosmic_sec_path)
        );
    }

    $cosmic_fx_path = get_stylesheet_directory() . '/assets/js/cosmic-fx.js';
    if (file_exists($cosmic_fx_path)) {
        wp_enqueue_script(
            'gearforge-cosmic-fx',
            get_stylesheet_directory_uri() . '/assets/js/cosmic-fx.js',
            [],
            (string) filemtime($cosmic_fx_path),
            true
        );
    }

    if (gf_is_catalog_archive() && is_active_sidebar('sidebar-woocommerce')) {
        $drawer_js = <<<'JS'
document.addEventListener('DOMContentLoaded', function () {
  var openBtn = document.getElementById('gf-filter-toggle-btn');
  var closeBtn = document.getElementById('gf-filter-close-btn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('gf-filter-backdrop');
  if (!openBtn || !sidebar || !backdrop) return;

  function setDrawer(open) {
    sidebar.classList.toggle('is-gf-drawer-open', open);
    document.body.classList.toggle('gf-drawer-lock', open);
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    backdrop.hidden = !open;
    if (open && closeBtn) {
      closeBtn.focus();
    } else if (!open) {
      openBtn.focus();
    }
  }

  openBtn.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) {
    closeBtn.addEventListener('click', function () { setDrawer(false); });
  }
  backdrop.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('is-gf-drawer-open')) {
      setDrawer(false);
    }
  });
});
JS;
        wp_register_script('gearforge-filter-drawer', '', [], GF_CHILD_VERSION, true);
        wp_enqueue_script('gearforge-filter-drawer');
        wp_add_inline_script('gearforge-filter-drawer', $drawer_js);
    }
}, 30);

// Purge all conflicting Blocksy/WOOF/Woo stylesheets on Flagship front page while preserving gfConfig & wc-add-to-cart-params.
function gf_flagship_purge_conflicting_styles(): void {
    if (!gf_is_flagship_front_request()) {
        return;
    }
    global $wp_styles;
    if ($wp_styles instanceof WP_Styles) {
        $allowed = ['gearforge-flagship-fonts', 'gearforge-flagship-app'];
        foreach ((array) $wp_styles->queue as $handle) {
            if (!in_array((string) $handle, $allowed, true)) {
                wp_dequeue_style((string) $handle);
                wp_deregister_style((string) $handle);
            }
        }
    }
    wp_dequeue_script('ct-scripts');
}
add_action('wp_enqueue_scripts', 'gf_flagship_purge_conflicting_styles', 999);
add_action('wp_print_styles', 'gf_flagship_purge_conflicting_styles', 999);
add_action('wp_print_footer_scripts', 'gf_flagship_purge_conflicting_styles', 1);

// Align Blocksy sidebar position cleanly: left on catalog, none (fullwidth) on product/cart/checkout/tools.
add_filter('blocksy:general:sidebar-position', static function (string $position): string {
    if (gf_is_focused_flow_page()) {
        return 'none';
    }
    if (gf_is_catalog_archive() && is_active_sidebar('sidebar-woocommerce')) {
        return 'left';
    }
    return $position;
}, 20);

// Add page-{slug} body classes so gearforge-frontend.css & JS consistently hide #gf-compare-tray on tool pages.
add_filter('body_class', static function (array $classes): array {
    if (!gf_is_flagship_front_request() && !is_admin()) {
        $classes[] = 'gf-cosmic-secondary';
    }
    if (is_singular()) {
        $post = get_queried_object();
        if ($post instanceof WP_Post && $post->post_name !== '') {
            $classes[] = 'page-' . sanitize_html_class($post->post_name);
        }
    }
    if (gf_is_catalog_archive() && is_active_sidebar('sidebar-woocommerce')) {
        $classes[] = 'gf-has-filter-drawer';
    }
    return $classes;
}, 20);

add_action('wp_head', static function (): void {
    if (gf_is_flagship_front_request() || is_admin()) {
        return;
    }
    $icon = get_stylesheet_directory_uri() . '/assets/flagship/vibe/gearforge-emblem-128.png';
    echo '<link rel="icon" type="image/png" href="' . esc_url($icon) . '" />' . "\n";
}, 5);

add_action('wp_body_open', static function (): void {
    if (gf_is_flagship_front_request() || is_admin()) {
        return;
    }
    $asset_vibe   = get_stylesheet_directory_uri() . '/assets/flagship/vibe/';
    $wordmark_url = $asset_vibe . 'gearforge-wordmark-3d.png';
    $cart_url     = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/');
    $account_url  = (function_exists('wc_get_page_permalink') && wc_get_page_permalink('myaccount')) ? wc_get_page_permalink('myaccount') : home_url('/my-account/');
    $compare_url  = home_url('/so-sanh-cau-hinh/');
    $oms_url      = home_url('/tra-cuu-don-hang/');
    $cart_count   = (function_exists('WC') && WC()->cart) ? (int) WC()->cart->get_cart_contents_count() : 0;

    $cmp_ids = [];
    if (class_exists('GF_Compare_Specs')) {
        $cmp_ids = GF_Compare_Specs::get_session_ids();
    } elseif (!empty($_COOKIE['gf_compare_ids'])) {
        $cmp_ids = array_filter(array_map('intval', explode(',', sanitize_text_field((string) $_COOKIE['gf_compare_ids']))));
    }
    $cmp_count = count(array_slice(array_unique($cmp_ids), 0, 3));
    $cur_path  = trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/');
    ?>
    <header class="gf-sec-hd" role="banner">
        <div class="gf-sec-hd-inner">
            <a class="gf-sec-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="GearForge Trang chủ">
                <img class="gf-sec-logo-img" src="<?php echo esc_url($wordmark_url); ?>" alt="GearForge 3D Wordmark" />
                <span class="gf-sec-brand-pill">ĐHQG-HCM</span>
            </a>

            <nav class="gf-sec-nav" aria-label="Điều hướng chính">
                <a class="gf-sec-nav-link" href="<?php echo esc_url(home_url('/')); ?>">Trang chủ</a>
                <a class="gf-sec-nav-link" href="<?php echo esc_url(home_url('/shop/')); ?>">Sản phẩm</a>
                <a class="gf-sec-nav-link" href="<?php echo esc_url(home_url('/he-sinh-thai/')); ?>">Hệ sinh thái</a>
                <a class="gf-sec-nav-link" href="<?php echo esc_url(home_url('/cau-hinh-mau/')); ?>">Góc máy SV</a>
                <a class="gf-sec-nav-link <?php echo $cur_path === 'so-sanh-cau-hinh' ? 'is-active' : ''; ?>" href="<?php echo esc_url($compare_url); ?>">So sánh</a>
                <a class="gf-sec-nav-link <?php echo $cur_path === 'tra-cuu-don-hang' ? 'is-active' : ''; ?>" href="<?php echo esc_url($oms_url); ?>">Tra cứu đơn</a>
            </nav>

            <div class="gf-sec-actions">
                <a class="gf-sec-action-btn" href="<?php echo esc_url($compare_url); ?>" aria-label="Khay so sánh cấu hình">
                    <span class="gf-sec-action-label">So sánh</span>
                    <span class="gf-sec-count"><?php echo esc_html((string) $cmp_count); ?></span>
                </a>
                <a class="gf-sec-action-btn is-primary" href="<?php echo esc_url($cart_url); ?>" aria-label="Giỏ hàng GearForge">
                    <span class="gf-sec-action-label">Giỏ hàng</span>
                    <span class="gf-sec-count"><?php echo esc_html((string) $cart_count); ?></span>
                </a>
                <a class="gf-sec-action-btn gf-sec-account-btn" href="<?php echo esc_url($account_url); ?>" aria-label="Tài khoản Sinh viên">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true">
                        <path d="M20 21a8 8 0 0 0-16 0"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="gf-sec-action-label"><?php echo is_user_logged_in() ? 'Tài khoản' : 'Đăng nhập'; ?></span>
                </a>
                <button type="button" id="gf-sec-burger-btn" class="gf-sec-burger" aria-expanded="false" aria-controls="gf-sec-mobile-drawer" aria-label="Mở menu điều hướng">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <nav id="gf-sec-mobile-drawer" class="gf-sec-mobile-drawer" aria-label="Menu di động" hidden>
        <a href="<?php echo esc_url(home_url('/')); ?>"><span>Trang chủ GearForge</span><span>→</span></a>
        <a href="<?php echo esc_url(home_url('/shop/')); ?>"><span>Tất cả sản phẩm</span><span>→</span></a>
        <a href="<?php echo esc_url(home_url('/he-sinh-thai/')); ?>"><span>Hệ sinh thái &amp; Công cụ</span><span>→</span></a>
        <a href="<?php echo esc_url(home_url('/cau-hinh-mau/')); ?>"><span>Góc máy Sinh viên ĐHQG</span><span>→</span></a>
        <a href="<?php echo esc_url($compare_url); ?>"><span>So sánh cấu hình (3 máy)</span><span><?php echo esc_html((string) $cmp_count); ?></span></a>
        <a href="<?php echo esc_url($oms_url); ?>"><span>Tra cứu đơn &amp; Bảo hành</span><span>→</span></a>
        <a href="<?php echo esc_url($cart_url); ?>"><span>Giỏ hàng &amp; Thanh toán</span><span><?php echo esc_html((string) $cart_count); ?></span></a>
        <a href="<?php echo esc_url($account_url); ?>"><span>Tài khoản Sinh viên</span><span>→</span></a>
    </nav>
    <?php
}, 5);

add_action('wp_footer', static function (): void {
    if (gf_is_flagship_front_request() || is_admin()) {
        return;
    }
    $wordmark_url = get_stylesheet_directory_uri() . '/assets/flagship/vibe/gearforge-wordmark-3d.png';
    ?>
    <footer class="gf-sec-ft" role="contentinfo">
        <div class="gf-sec-ft-inner">
            <div class="gf-sec-ft-brand">
                <a class="gf-sec-brand" href="<?php echo esc_url(home_url('/')); ?>">
                    <img class="gf-sec-logo-img" src="<?php echo esc_url($wordmark_url); ?>" alt="GearForge" />
                </a>
                <p>Hệ thống Laptop, PC Workstation &amp; Gaming Gear dành cho Sinh viên ĐHQG TP.HCM — Trả góp 0% kỳ hạn 3 tháng qua email .edu.vn, giao KTX trong 2 giờ &amp; bảo hành điện tử theo Serial.</p>
            </div>

            <div>
                <h4>Chính sách &amp; Hỗ trợ</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>">Chính sách bảo hành &amp; Đổi trả</a></li>
                    <li><a href="<?php echo esc_url(home_url('/checkout/')); ?>">Chính sách bảo vệ dữ liệu cá nhân</a></li>
                    <li><a href="<?php echo esc_url(home_url('/he-sinh-thai/')); ?>">Quy chế Trả góp 0% Sinh viên</a></li>
                    <li><a href="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>">Thanh toán bảo mật &amp; Hóa đơn VAT</a></li>
                </ul>
            </div>

            <div>
                <h4>Khám phá nhanh</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/shop/')); ?>">Tất cả sản phẩm chính hãng</a></li>
                    <li><a href="<?php echo esc_url(home_url('/so-sanh-cau-hinh/')); ?>">So sánh cấu hình (3 thiết bị)</a></li>
                    <li><a href="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>">Tra cứu đơn hàng &amp; Bảo hành</a></li>
                    <li><a href="<?php echo esc_url(home_url('/my-account/')); ?>">Tài khoản &amp; Đơn hàng của tôi</a></li>
                </ul>
            </div>
        </div>

        <div class="gf-sec-ft-bottom">
            <span>© 2026 GearForge Vietnam — Trung tâm Laptop, PC &amp; Gear Sinh viên ĐHQG-HCM.</span>
            <span>KTX Khu B ĐHQG-HCM • Giao nhanh 2h nội khu • Zalo OA Hỗ trợ SV</span>
        </div>
    </footer>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
      var btn = document.getElementById('gf-sec-burger-btn');
      var drawer = document.getElementById('gf-sec-mobile-drawer');
      if (!btn || !drawer) return;
      function toggle(force) {
        var open = typeof force === 'boolean' ? force : drawer.hidden;
        drawer.hidden = !open;
        drawer.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      btn.addEventListener('click', function () { toggle(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !drawer.hidden) toggle(false);
      });
    });
    </script>
    <?php
}, 30);

// Render Mobile Off-Canvas Filter Drawer trigger inside Blocksy .woo-listing-top bar.
add_action('woocommerce_before_shop_loop', static function (): void {
    if (!gf_is_catalog_archive() || !is_active_sidebar('sidebar-woocommerce')) {
        return;
    }
    ?>
    <button type="button" id="gf-filter-toggle-btn" class="gf-filter-toggle-btn" aria-expanded="false" aria-controls="sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4"></path>
        </svg>
        <span>Bộ lọc</span>
    </button>
    <?php
}, 15);

add_action('blocksy:sidebar:start', static function (): void {
    if (!gf_is_catalog_archive() || !is_active_sidebar('sidebar-woocommerce')) {
        return;
    }
    ?>
    <div class="gf-drawer-head">
        <span>Bộ lọc cấu hình &amp; giá</span>
        <button type="button" id="gf-filter-close-btn" class="gf-drawer-close" aria-label="Đóng bộ lọc">&times;</button>
    </div>
    <?php
}, 5);

add_action('wp_footer', static function (): void {
    if (!gf_is_catalog_archive() || !is_active_sidebar('sidebar-woocommerce')) {
        return;
    }
    echo '<div id="gf-filter-backdrop" class="gf-filter-backdrop" hidden></div>';
}, 20);

// MONA Mesh Hero + Visual Category Strip on Front/Shop/Category inside Blocksy .ct-container.
add_action('blocksy:content:top', static function (): void {
    if (!is_front_page() && !(function_exists('is_shop') && is_shop()) && !(function_exists('is_product_category') && is_product_category())) {
        return;
    }
    $img_base = get_stylesheet_directory_uri() . '/assets/img/';
    $hero_img = $img_base . 'laptop-creator.jpg';
    $cur_term = (function_exists('is_product_category') && is_product_category()) ? get_queried_object() : null;
    $cur_slug = ($cur_term instanceof WP_Term) ? $cur_term->slug : 'all';
    $segments = [
        ['slug' => 'all',              'label' => 'Tất cả sản phẩm',  'thumb' => $img_base . 'laptop-creator.jpg',   'url' => home_url('/shop/')],
        ['slug' => 'laptop-van-phong', 'label' => 'Laptop Văn phòng', 'thumb' => $img_base . 'laptop-ultrabook.jpg', 'url' => home_url('/product-category/laptop/laptop-van-phong/')],
        ['slug' => 'laptop-gaming',    'label' => 'Laptop Gaming',    'thumb' => $img_base . 'laptop-gaming.jpg',    'url' => home_url('/product-category/laptop/laptop-gaming/')],
        ['slug' => 'laptop-do-hoa',    'label' => 'Laptop Đồ họa',    'thumb' => $img_base . 'laptop-katana.jpg',    'url' => home_url('/product-category/laptop/laptop-do-hoa/')],
        ['slug' => 'pc-nguyen-bo',     'label' => 'PC Workstation',   'thumb' => $img_base . 'pc-minimal.jpg',       'url' => home_url('/product-category/pc-nguyen-bo/')],
        ['slug' => 'phu-kien',         'label' => 'Phụ kiện & Gear',  'thumb' => $img_base . 'gear-peripherals.jpg', 'url' => home_url('/product-category/phu-kien/')],
    ];
    ?>
    <div class="ct-container gf-bento-shell">
        <?php if (!is_paged() && (is_front_page() || (function_exists('is_shop') && is_shop()))): ?>
        <div class="gf-bento-grid">
            <div class="gf-hero-main">
                <div class="gf-hero-copy">
                    <span class="gf-hero-kicker">Đặc quyền Sinh viên ĐHQG TP.HCM</span>
                    <h1>Chọn đúng cấu hình học tập &amp; đồ họa, <span class="gf-text-grad">trả góp 0%</span></h1>
                    <p>So sánh tối đa 3 thiết bị theo CPU, RAM, GPU trên cùng một bảng và tính lịch trả góp 3–6–12 tháng minh bạch trước khi đặt mua.</p>
                    <div class="gf-hero-actions">
                        <a class="gf-btn gf-btn-primary" href="<?php echo esc_url(home_url('/product-category/laptop/')); ?>">Khám phá Laptop</a>
                        <a class="gf-btn gf-btn-secondary" href="<?php echo esc_url(home_url('/so-sanh-cau-hinh/')); ?>">So sánh cấu hình</a>
                    </div>
                    <div class="gf-hero-metrics" aria-label="Cam kết hệ thống GearForge">
                        <span class="gf-metric-pill"><strong>Chính hãng</strong> Laptop, PC &amp; Gear</span>
                        <span class="gf-metric-pill"><strong>0%</strong> Lãi suất 3 tháng</span>
                        <span class="gf-metric-pill"><strong>100%</strong> Bảo hành Serial &amp; VAT</span>
                    </div>
                </div>
                <div class="gf-hero-visual">
                    <img src="<?php echo esc_url($hero_img); ?>" alt="Laptop Studio OLED tại GearForge" width="800" height="500" />
                    <div class="gf-hero-float-badge">
                        <span class="gf-pulse-dot" aria-hidden="true"></span>
                        <span>Ưu đãi .edu.vn &bull; Giao KTX 2 giờ</span>
                    </div>
                </div>
            </div>
            <div class="gf-hero-side">
                <div class="gf-utility-card">
                    <div>
                        <h2>Trả góp Sinh viên 3–6–12 tháng</h2>
                        <p>Trả trước từ 20%, miễn lãi kỳ hạn 3 tháng. Xác thực trực tuyến qua CCCD, Thẻ SV và email .edu.vn.</p>
                    </div>
                    <a class="gf-utility-link" href="<?php echo esc_url(home_url('/product-category/laptop/laptop-gaming/')); ?>">Chọn máy tính thử ngay</a>
                </div>
                <div class="gf-utility-card">
                    <div>
                        <h2>Bảo hành theo Serial Number &amp; Hóa đơn VAT</h2>
                        <p>Mỗi máy xuất kho đi kèm mã S/N riêng và tra cứu tiến độ đơn hàng trực tiếp theo mã đơn.</p>
                    </div>
                    <a class="gf-utility-link" href="<?php echo esc_url(home_url('/tra-cuu-don-hang/')); ?>">Tra cứu đơn hàng</a>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <nav class="gf-segment-bar" aria-label="Phân loại thiết bị">
            <?php foreach ($segments as $seg): ?>
                <?php $active = ($cur_slug === $seg['slug']) ? 'is-active' : ''; ?>
                <a class="gf-segment-pill <?php echo esc_attr($active); ?>" href="<?php echo esc_url($seg['url']); ?>">
                    <img class="gf-seg-thumb" src="<?php echo esc_url($seg['thumb']); ?>" alt="" width="28" height="28" aria-hidden="true" />
                    <span><?php echo esc_html($seg['label']); ?></span>
                </a>
            <?php endforeach; ?>
        </nav>
    </div>
    <?php
}, 10);

// Interleave diverse Laptops & PCs on default Shop/Category page 1 instead of accessories or identical batches.
add_filter('posts_clauses', static function (array $clauses, WP_Query $query): array {
    global $wpdb;
    if (is_admin() || !$query->is_main_query()) {
        return $clauses;
    }
    $is_woo_archive = (function_exists('is_shop') && is_shop()) || (function_exists('is_product_category') && is_product_category());
    if ($is_woo_archive && empty($_GET['orderby']) && !is_search()) {
        $lookup = "{$wpdb->prefix}wc_product_meta_lookup";
        if (!str_contains((string) $clauses['join'], 'gf_price_lookup')) {
            $clauses['join'] .= " LEFT JOIN {$lookup} gf_price_lookup ON gf_price_lookup.product_id = {$wpdb->posts}.ID ";
        }
        $clauses['orderby'] = "CASE WHEN COALESCE(gf_price_lookup.max_price, 0) >= 12000000 THEN 0 ELSE 1 END ASC, MOD({$wpdb->posts}.ID, 31) ASC, MOD({$wpdb->posts}.ID, 7) ASC, {$wpdb->posts}.ID DESC";
    }
    return $clauses;
}, 20, 2);

// Route category-aware studio hardware assets across Blocksy media & WooCommerce hooks.
add_filter('woocommerce_placeholder_img_src', static function (): string {
    return gf_resolve_studio_image_url();
}, 20);

add_filter('woocommerce_placeholder_img', static function (string $html): string {
    if ($html !== '' && !str_contains($html, 'woocommerce-placeholder')) {
        return $html;
    }
    $product = ($GLOBALS['product'] ?? null) instanceof WC_Product ? $GLOBALS['product'] : null;
    $alt     = $product ? $product->get_name() : 'GearForge Studio Hardware';
    $src     = gf_resolve_studio_image_url($product);
    return sprintf(
        '<img src="%1$s" alt="%2$s" class="wp-post-image gf-studio-img" style="aspect-ratio: 16/10;" loading="lazy" decoding="async" />',
        esc_url($src),
        esc_attr($alt)
    );
}, 20);

add_filter('woocommerce_product_get_image', static function (string $image, WC_Product $product): string {
    if ($product->get_image_id() && !str_contains($image, 'woocommerce-placeholder')) {
        return $image;
    }
    if (!str_contains($image, 'woocommerce-placeholder') && $image !== '') {
        return $image;
    }
    $src = gf_resolve_studio_image_url($product);
    $img_tag = sprintf(
        '<img src="%1$s" alt="%2$s" class="wp-post-image gf-studio-img" style="aspect-ratio: 16/10;" loading="lazy" decoding="async" />',
        esc_url($src),
        esc_attr($product->get_name())
    );
    $replaced = preg_replace('/<img\b[^>]*>/i', $img_tag, $image, 1);
    return is_string($replaced) && $replaced !== '' ? $replaced : $img_tag;
}, 20, 2);

add_filter('woocommerce_single_product_image_thumbnail_html', static function (string $html): string {
    if (!str_contains($html, 'woocommerce-placeholder')) {
        return $html;
    }
    $product = ($GLOBALS['product'] ?? null) instanceof WC_Product ? $GLOBALS['product'] : null;
    $src     = gf_resolve_studio_image_url($product);
    $alt     = $product ? $product->get_name() : 'GearForge Studio Hardware';
    $img_tag = sprintf(
        '<img src="%1$s" alt="%2$s" class="wp-post-image gf-studio-img gf-single-studio-img" style="aspect-ratio: 16/10;" fetchpriority="high" decoding="async" />',
        esc_url($src),
        esc_attr($alt)
    );
    $replaced = preg_replace('/<img\b[^>]*woocommerce-placeholder[^>]*>/i', $img_tag, $html);
    return is_string($replaced) && $replaced !== '' ? $replaced : $html;
}, 20);

add_filter('woocommerce_cart_item_thumbnail', static function (string $thumbnail, array $cart_item): string {
    $cart_product = $cart_item['data'] ?? null;
    if (!($cart_product instanceof WC_Product)) {
        return $thumbnail;
    }
    if ($cart_product->get_image_id() && !str_contains($thumbnail, 'woocommerce-placeholder')) {
        return $thumbnail;
    }
    $src     = gf_resolve_studio_image_url($cart_product);
    $img_tag = sprintf(
        '<img src="%1$s" alt="%2$s" class="wp-post-image gf-studio-img" style="aspect-ratio: 16/10;" loading="lazy" decoding="async" />',
        esc_url($src),
        esc_attr($cart_product->get_name())
    );
    $replaced = preg_replace('/<img\b[^>]*>/i', $img_tag, $thumbnail, 1);
    return is_string($replaced) && $replaced !== '' ? $replaced : $img_tag;
}, 20, 2);

add_filter('woocommerce_get_availability_text', static function (string $availability, WC_Product $product): string {
    if (!$product->is_in_stock()) {
        return 'Hết hàng';
    }
    if ($product->managing_stock()) {
        $qty = $product->get_stock_quantity();
        if ($qty !== null && $qty > 0) {
            return sprintf('Còn %d sản phẩm', (int) $qty);
        }
    }
    return 'Còn hàng';
}, 20, 2);

// Show real savings badge only on genuinely discounted items.
add_filter('woocommerce_sale_flash', static function (string $html, WP_Post $post, WC_Product $product): string {
    $reg  = (float) $product->get_regular_price();
    $sale = (float) $product->get_sale_price();
    if ($reg > 0 && $sale > 0 && $sale < $reg) {
        $pct = (int) round((($reg - $sale) / $reg) * 100);
        return '<span class="onsale" data-shape="type-2">-' . esc_html((string) $pct) . '%</span>';
    }
    return '';
}, 20, 3);

// Fallback loop spec chips + installment hint + Compare CTA only when GF_Core plugin is inactive.
if (!class_exists('GF_Core')) {
    add_action('woocommerce_after_shop_loop_item_title', static function (): void {
        global $product;
        if (!($product instanceof WC_Product)) {
            return;
        }
        $chips = [];
        foreach (['pa_cpu', 'pa_ram', 'pa_gpu'] as $tax) {
            $val = $product->get_attribute($tax);
            if (is_string($val) && $val !== '') {
                $chips[] = trim(explode(',', $val)[0]);
            }
        }
        if (!empty($chips)) {
            echo '<div class="gf-loop-specs">';
            foreach (array_slice($chips, 0, 3) as $chip) {
                echo '<span class="gf-loop-chip">' . esc_html($chip) . '</span>';
            }
            echo '</div>';
        }
        $price = (float) $product->get_price();
        if ($price >= 5000000) {
            $monthly_3m = ($price * 0.8) / 3;
            echo '<div class="gf-loop-installment">Trả góp SV 0%: ' . esc_html(number_format($monthly_3m, 0, ',', '.')) . 'đ/th (3 kỳ)</div>';
        }
    }, 6);

    add_action('woocommerce_after_shop_loop_item', static function (): void {
        global $product;
        if (!($product instanceof WC_Product)) {
            return;
        }
        $terms  = wp_get_post_terms($product->get_id(), 'product_cat', ['fields' => 'slugs']);
        $joined = is_array($terms) ? implode(',', $terms) : '';
        if (str_contains($joined, 'phu-kien')) {
            return;
        }
        echo '<a href="' . esc_url(home_url('/so-sanh-cau-hinh/')) . '" class="gf-loop-compare-btn" data-product-id="' . esc_attr((string) $product->get_id()) . '">+ So sánh</a>';
    }, 15);
}

// Vietnamese WooCommerce catalog, cart & checkout labels.
add_filter('woocommerce_default_catalog_orderby', static fn(): string => 'menu_order');

add_filter('woocommerce_catalog_orderby', static function (): array {
    return [
        'menu_order' => 'Đề xuất phù hợp',
        'popularity' => 'Phổ biến nhất',
        'date'       => 'Mới cập nhật',
        'price'      => 'Giá thấp đến cao',
        'price-desc' => 'Giá cao đến thấp',
    ];
});

add_filter('woocommerce_product_single_add_to_cart_text', static fn(): string => 'Thêm vào giỏ hàng');

add_filter('woocommerce_product_add_to_cart_text', static function (string $text, WC_Product $product): string {
    return ($product->is_type('simple') && $product->is_purchasable() && $product->is_in_stock())
        ? 'Thêm vào giỏ'
        : $text;
}, 10, 2);

add_filter('woocommerce_page_title', static function (string $title): string {
    return (function_exists('is_shop') && is_shop()) ? 'Laptop, PC & Thiết bị Công nghệ' : $title;
});

add_filter('get_product_search_form', static function (string $form): string {
    return str_replace('Search products&hellip;', 'Tìm Laptop, PC, GPU, RAM...', $form);
});

add_filter('woocommerce_order_button_text', static fn(): string => 'Đặt hàng ngay');

function gf_translate_ui_text(string $translated, string $text, string $domain): string {
    if (!in_array($domain, ['woocommerce', 'blocksy', 'woocommerce-products-filter'], true)) {
        return $translated;
    }
    return match ($text) {
        'Filter'                        => 'Lọc giá',
        'Price:'                        => 'Khoảng giá:',
        'Showing the single result'     => 'Hiển thị 1 sản phẩm',
        'Showing all %d results'        => 'Hiển thị tất cả %d sản phẩm',
        'Add to cart'                   => 'Thêm vào giỏ',
        'View cart'                     => 'Xem giỏ hàng',
        'Cart'                          => 'Giỏ hàng',
        'Checkout'                      => 'Thanh toán',
        'My account'                    => 'Tài khoản Sinh viên',
        'Proceed to checkout'           => 'Tiến hành thanh toán',
        'Update cart'                   => 'Cập nhật giỏ hàng',
        'Cart totals'                   => 'Tổng cộng giỏ hàng',
        'Your cart is currently empty.' => 'Giỏ hàng của bạn hiện đang trống.',
        'Return to shop'                => 'Quay lại Cửa hàng',
        'Quantity'                      => 'Số lượng',
        'Qty'                           => 'SL',
        'Shipping'                      => 'Vận chuyển',
        'Billing details'               => 'Thông tin nhận hàng',
        'Billing &amp; Shipping'        => 'Thông tin giao nhận',
        'Your order'                    => 'Đơn hàng của bạn',
        'Additional information'        => 'Ghi chú bổ sung',
        'Product'                       => 'Sản phẩm',
        'Price'                         => 'Đơn giá',
        'Subtotal'                      => 'Tạm tính',
        'Subtotal:'                     => 'Tạm tính:',
        'Total'                         => 'Tổng cộng',
        'Total:'                        => 'Tổng cộng:',
        'Have a coupon?'                => 'Có mã ưu đãi Sinh viên?',
        'Click here to enter your code' => 'Nhấn để nhập mã (VD: BACKTOSCHOOL)',
        'Apply coupon'                  => 'Áp dụng mã',
        'Coupon:'                       => 'Mã ưu đãi:',
        'Coupon code'                   => 'Nhập mã ưu đãi...',
        'First name'                    => 'Họ',
        'Last name'                     => 'Tên',
        'Phone'                         => 'Số điện thoại',
        'Email address'                 => 'Địa chỉ email',
        'Country / Region'              => 'Quốc gia / Khu vực',
        'Street address'                => 'Địa chỉ nhận hàng',
        'House number and street name'  => 'Số nhà, tên đường / Tên KTX',
        'Apartment, suite, unit, etc.'  => 'Phòng / Tòa nhà / Ghi chú thêm',
        'Town / City'                   => 'Tỉnh / Thành phố',
        'Postcode / ZIP'                => 'Mã bưu chính',
        'optional'                      => 'không bắt buộc',
        'Order notes'                   => 'Ghi chú đơn hàng',
        'Notes about your order, e.g. special notes for delivery.' => 'Ví dụ: Giao KTX Khu B tòa BA1, gọi trước 15 phút...',
        'Order summary'                 => 'Tóm tắt đơn hàng',
        'Cash on delivery'              => 'Thanh toán khi nhận hàng (COD)',
        'Pay with cash upon delivery.'  => 'Thanh toán tiền mặt hoặc chuyển khoản khi nhận máy trực tiếp.',
        'Place order'                   => 'Đặt hàng ngay',
        'Dashboard'                     => 'Bảng điều khiển',
        'Orders'                        => 'Đơn hàng của bạn',
        'Downloads'                     => 'Hóa đơn / Tải về',
        'Addresses'                     => 'Địa chỉ giao hàng',
        'Account details'               => 'Thông tin tài khoản',
        'Log out'                       => 'Đăng xuất',
        'Login'                         => 'Đăng nhập',
        'Log in'                        => 'Đăng nhập',
        'Register'                      => 'Đăng ký',
        'Username or email address'     => 'Tên đăng nhập hoặc Email',
        'Password'                      => 'Mật khẩu',
        'Remember me'                   => 'Ghi nhớ đăng nhập',
        'Lost your password?'           => 'Quên mật khẩu?',
        default                         => $translated,
    };
}

add_filter('gettext', 'gf_translate_ui_text', 20, 3);

add_filter('gettext_with_context', static function (string $translated, string $text, string $context, string $domain): string {
    return gf_translate_ui_text($translated, $text, $domain);
}, 20, 4);

add_filter('ngettext', static function (string $translation, string $single, string $plural, int $number, string $domain): string {
    if ($domain !== 'woocommerce') {
        return $translation;
    }
    if (str_starts_with($single, 'Showing all %1$d')) {
        return 'Hiển thị tất cả %1$d sản phẩm';
    }
    if (str_starts_with($single, 'Showing %1$d')) {
        return 'Hiển thị %1$d–%2$d / %3$d sản phẩm';
    }
    return $translation;
}, 20, 5);

add_filter('ngettext_with_context', static function (string $translation, string $single, string $plural, int $number, string $context, string $domain): string {
    if ($domain === 'woocommerce' && str_starts_with($single, 'Showing %1$d')) {
        return 'Hiển thị %1$d–%2$d / %3$d sản phẩm';
    }
    return $translation;
}, 20, 6);

add_filter('woocommerce_default_address_fields', static function (array $fields): array {
    $map = [
        'first_name' => ['Họ và tên đệm', 'VD: Nguyễn Văn'],
        'last_name'  => ['Tên', 'VD: An'],
        'country'    => ['Quốc gia / Khu vực', ''],
        'address_1'  => ['Địa chỉ nhận hàng / KTX', 'Số nhà, tên đường hoặc KTX Khu A / Khu B'],
        'address_2'  => ['Phòng / Tòa nhà (tuỳ chọn)', 'VD: Tòa BA1, Phòng 402'],
        'city'       => ['Tỉnh / Thành phố', 'VD: TP. Thủ Đức, TP.HCM'],
        'postcode'   => ['Mã bưu chính', 'VD: 700000'],
    ];
    foreach ($map as $key => [$label, $placeholder]) {
        if (isset($fields[$key])) {
            $fields[$key]['label'] = $label;
            if ($placeholder !== '') {
                $fields[$key]['placeholder'] = $placeholder;
            }
        }
    }
    return $fields;
});

add_filter('woocommerce_account_menu_items', static function (array $items): array {
    return array_merge($items, array_intersect_key([
        'dashboard'       => 'Bảng điều khiển',
        'orders'          => 'Đơn hàng của bạn',
        'downloads'       => 'Hóa đơn điện tử',
        'edit-address'    => 'Địa chỉ giao KTX',
        'edit-account'    => 'Thông tin tài khoản',
        'customer-logout' => 'Đăng xuất',
    ], $items));
});

add_filter('woocommerce_gateway_title', static function (string $title, string $id): string {
    return $id === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : $title;
}, 10, 2);

add_filter('woocommerce_gateway_description', static function (string $desc, string $id): string {
    return $id === 'cod' ? 'Thanh toán tiền mặt hoặc chuyển khoản QR khi kỹ thuật viên giao máy tận tay.' : $desc;
}, 10, 2);

/* ==========================================================================
   GearForge Flagship React 19 Bridge & Live WooCommerce AJAX Endpoints
   ========================================================================== */

/**
 * Ensure WooCommerce session & cart are initialized during admin-ajax or front-page boot.
 */
function gf_flagship_ensure_wc_cart(): void {
    if (!function_exists('WC')) {
        return;
    }
    $wc = WC();
    if ($wc->cart === null && function_exists('wc_load_cart')) {
        wc_load_cart();
    }
}

/**
 * Resolve product studio image URL (preferring real non-placeholder attachment when present).
 */
function gf_flagship_product_image(WC_Product $product): string {
    $img_id = (int) $product->get_image_id();
    if ($img_id > 0) {
        $url = wp_get_attachment_image_url($img_id, 'medium_large') ?: wp_get_attachment_image_url($img_id, 'full');
        if (is_string($url) && $url !== '' && !str_contains($url, 'woocommerce-placeholder')) {
            return $url;
        }
    }
    return gf_resolve_studio_image_url($product);
}

/**
 * Extract structured hardware specs from WooCommerce attributes, post meta, and title fallback.
 */
function gf_flagship_extract_specs(WC_Product $product): array {
    $pid   = (int) $product->get_id();
    $title = $product->get_name();

    $read_attr = static function (string $slug, string $label, string $meta_key) use ($product, $pid): string {
        $val = $product->get_attribute($slug);
        if ($val === '') {
            $val = $product->get_attribute($label);
        }
        if ($val === '' && $meta_key !== '') {
            $meta = get_post_meta($pid, $meta_key, true);
            if (is_string($meta) && $meta !== '') {
                $val = $meta;
            }
        }
        return trim((string) explode(',', (string) $val)[0]);
    };

    $cpu     = $read_attr('pa_cpu', 'CPU', '_gf_cpu');
    $ram     = $read_attr('pa_ram', 'RAM', '_gf_ram');
    $gpu     = $read_attr('pa_gpu', 'GPU', '_gf_gpu');
    $storage = $read_attr('pa_o-cung', 'Ổ cứng', '_gf_storage');
    $screen  = $read_attr('pa_man-hinh', 'Màn hình', '_gf_screen');
    $weight  = $read_attr('pa_trong-luong', 'Trọng lượng', '_gf_weight');

    if ($cpu === '' && preg_match('/\b(Core Ultra\s*[579](?:\s*\d{3}[A-Z]*)?|Intel Core i[3579][-\s]\d{4,5}[A-Z]*|Ryzen AI\s*\d(?:\s*[A-Z0-9]+)?|Ryzen\s*[579][-\s]\d{4}[A-Z]*|Apple\s*M[1-4](?:\s*(?:Pro|Max))?)\b/iu', $title, $m)) {
        $cpu = trim($m[1]);
    }
    if ($ram === '' && preg_match('/\b(8GB|16GB|24GB|32GB|64GB|128GB)\b/i', $title, $m)) {
        $ram = strtoupper($m[1]);
    }
    if ($gpu === '' && preg_match('/\b(RTX\s*(?:2050|3050|3060|3070|3080|4050|4060|4070|4080|4090|5060|5070|5080|5090)(?:\s*(?:Ti|SUPER))?|GTX\s*1650|RX\s*\d{4}[A-Z]*|Radeon\s*[0-9A-Z]+|Intel\s*Arc)\b/iu', $title, $m)) {
        $gpu = trim($m[1]);
    }
    if ($storage === '' && preg_match('/\b(256GB|512GB|1TB|2TB|4TB)\s*(?:NVMe|SSD)?\b/i', $title, $m)) {
        $storage = strtoupper($m[1]) . ' NVMe';
    }

    return [
        'cpu'     => $cpu !== '' ? $cpu : 'Đang cập nhật',
        'ram'     => $ram !== '' ? $ram : '16GB DDR5',
        'gpu'     => $gpu !== '' ? $gpu : 'Card tích hợp',
        'storage' => $storage !== '' ? $storage : '512GB NVMe',
        'screen'  => $screen !== '' ? $screen : '15.6" FHD/OLED',
        'weight'  => $weight !== '' ? $weight : '1.7 kg',
    ];
}

/**
 * Serialize a WooCommerce product into the GearForgeProduct TypeScript contract.
 */
function gf_flagship_serialize_product(WC_Product $product): array {
    $pid       = (int) $product->get_id();
    $price     = (float) $product->get_price();
    $reg_price = (float) $product->get_regular_price();
    $sale      = (float) $product->get_sale_price();
    $terms     = get_the_terms($pid, 'product_cat');
    $cat_name  = 'Thiết bị Công nghệ';
    $cat_slug  = 'all';

    if (is_array($terms) && !empty($terms)) {
        $chosen = $terms[0];
        foreach ($terms as $term) {
            if ($term instanceof WP_Term && $term->slug !== 'uncategorized' && $term->parent > 0) {
                $chosen = $term;
                break;
            }
        }
        if ($chosen instanceof WP_Term) {
            $cat_name = html_entity_decode(wp_strip_all_tags($chosen->name), ENT_QUOTES, 'UTF-8');
            $cat_slug = $chosen->slug;
        }
    }

    $monthly_3m = 0;
    if ($price > 0) {
        if (class_exists('GF_Installment_Calc')) {
            $calc       = GF_Installment_Calc::calculate($price, 20, 3);
            $monthly_3m = (int) ($calc['monthly_amount'] ?? 0);
        } else {
            $monthly_3m = (int) round(($price * 0.8) / 3, -3);
        }
    }

    $raw_status   = $product->get_stock_status();
    $stock_status = in_array($raw_status, ['instock', 'outofstock', 'onbackorder'], true) ? $raw_status : 'instock';

    return [
        'id'           => $pid,
        'name'         => html_entity_decode(wp_strip_all_tags($product->get_name()), ENT_QUOTES, 'UTF-8'),
        'slug'         => $product->get_slug(),
        'permalink'    => get_permalink($pid) ?: home_url('/shop/'),
        'price'        => $price,
        'regularPrice' => $reg_price > 0 ? $reg_price : $price,
        'salePrice'    => ($sale > 0 && $reg_price > 0 && $sale < $reg_price) ? $sale : null,
        'image'        => gf_flagship_product_image($product),
        'category'     => $cat_name,
        'categorySlug' => $cat_slug,
        'specs'        => gf_flagship_extract_specs($product),
        'stockStatus'  => $stock_status,
        'stockQty'     => $product->managing_stock() ? $product->get_stock_quantity() : null,
        'monthly3m'    => $monthly_3m,
    ];
}

/**
 * Hydrate active compare IDs into CompareItem[] for initial boot.
 */
function gf_flagship_serialize_compare_items(array $ids): array {
    if (!function_exists('wc_get_product')) {
        return [];
    }
    $items = [];
    foreach (array_slice($ids, 0, 3) as $pid) {
        $product = wc_get_product((int) $pid);
        if (!$product instanceof WC_Product) {
            continue;
        }
        $price   = (float) $product->get_price();
        $items[] = [
            'id'             => (int) $pid,
            'name'           => $product->get_name(),
            'price'          => $price,
            'priceFormatted' => number_format($price, 0, ',', '.') . 'đ',
            'image'          => gf_flagship_product_image($product),
            'permalink'      => get_permalink((int) $pid) ?: home_url('/shop/'),
            'specs'          => gf_flagship_extract_specs($product),
        ];
    }
    return $items;
}

/**
 * Serialize current WooCommerce cart into CartState TypeScript shape.
 */
function gf_flagship_serialize_cart(): array {
    gf_flagship_ensure_wc_cart();
    if (!function_exists('WC') || !WC()->cart) {
        return [
            'items'    => [],
            'count'    => 0,
            'subtotal' => 0,
            'discount' => 0,
            'total'    => 0,
            'coupons'  => [],
        ];
    }

    $cart  = WC()->cart;
    $items = [];
    foreach ($cart->get_cart() as $key => $cart_item) {
        $product = $cart_item['data'] ?? null;
        if (!$product instanceof WC_Product) {
            continue;
        }
        $qty       = max(1, (int) ($cart_item['quantity'] ?? 1));
        $pid       = (int) ($cart_item['product_id'] ?? $product->get_id());
        $unit_cost = (float) $product->get_price();
        $items[]   = [
            'key'       => (string) $key,
            'productId' => $pid,
            'name'      => $product->get_name(),
            'price'     => $unit_cost,
            'qty'       => $qty,
            'lineTotal' => (float) ($cart_item['line_subtotal'] ?? ($unit_cost * $qty)),
            'image'     => gf_flagship_product_image($product),
            'permalink' => get_permalink($pid) ?: home_url('/shop/'),
        ];
    }

    return [
        'items'    => $items,
        'count'    => (int) $cart->get_cart_contents_count(),
        'subtotal' => (float) $cart->get_subtotal(),
        'discount' => (float) $cart->get_discount_total(),
        'total'    => (float) $cart->get_total('edit'),
        'coupons'  => array_values(array_map('strval', $cart->get_applied_coupons())),
    ];
}

/**
 * Map WooCommerce order status to GearForge 7-step OMS domain status.
 */
function gf_flagship_map_oms_status(string $wc_status): string {
    if (class_exists('GF_Core')) {
        return GF_Core::map_order_status($wc_status);
    }
    $clean = str_replace('wc-', '', $wc_status);
    $map   = [
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
    return $map[$clean] ?? 'CREATED';
}

/**
 * Serialize WooCommerce order + OMS + S/N + 2-layer installment details safely.
 */
function gf_flagship_serialize_oms_order(int $order_id, bool $allow_demo_guest = true): array|WP_Error|null {
    if ($order_id <= 0 || !function_exists('wc_get_order')) {
        return null;
    }
    $order = wc_get_order($order_id);
    if (!$order instanceof WC_Order) {
        return null;
    }

    $is_demo           = in_array($order_id, [542, 543], true);
    $can_review        = class_exists('GF_RBAC') && GF_RBAC::can_review_installments();
    $is_owner_or_staff = is_user_logged_in() && (
        current_user_can('manage_woocommerce')
        || $can_review
        || (int) $order->get_customer_id() === get_current_user_id()
    );

    if (!$is_owner_or_staff && !($allow_demo_guest && $is_demo)) {
        return new WP_Error(
            'gf_oms_forbidden',
            sprintf('Vui lòng đăng nhập tài khoản chủ đơn hàng để tra cứu đơn #%d.', $order_id),
            ['status' => 403]
        );
    }

    global $wpdb;
    $meta_oms = (string) $order->get_meta('_gf_oms_status');
    $status   = $meta_oms !== '' ? $meta_oms : gf_flagship_map_oms_status($order->get_status());

    $items = [];
    foreach ($order->get_items() as $item) {
        if (!$item instanceof WC_Order_Item_Product) {
            continue;
        }
        $items[] = [
            'name'  => $item->get_name(),
            'qty'   => max(1, (int) $item->get_quantity()),
            'total' => (float) $item->get_total(),
        ];
    }

    $serials       = [];
    $serials_table = "{$wpdb->prefix}gf_order_serials";
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $serials_table)) === $serials_table) {
        $rows = $wpdb->get_results(
            $wpdb->prepare("SELECT product_id, serial_number, warranty_end_date FROM {$serials_table} WHERE order_id = %d ORDER BY serial_id ASC", $order_id),
            ARRAY_A
        );
        if (is_array($rows)) {
            foreach ($rows as $row) {
                $p_obj     = !empty($row['product_id']) ? wc_get_product((int) $row['product_id']) : null;
                $serials[] = [
                    'serial_number'  => (string) ($row['serial_number'] ?? ''),
                    'product_name'   => $p_obj instanceof WC_Product ? $p_obj->get_name() : ($items[0]['name'] ?? 'GearForge Device'),
                    'warranty_until' => (string) ($row['warranty_end_date'] ?? ''),
                ];
            }
        }
    }
    if (empty($serials)) {
        $meta_sn = (string) $order->get_meta('_gf_assigned_serial');
        if ($meta_sn !== '') {
            $serials[] = [
                'serial_number'  => $meta_sn,
                'product_name'   => $items[0]['name'] ?? 'GearForge Device',
                'warranty_until' => gmdate('Y-m-d', strtotime('+12 months')),
            ];
        }
    }

    $installment = null;
    $app_table   = "{$wpdb->prefix}gf_installment_applications";
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $app_table)) === $app_table) {
        $app = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT a.status, a.student_code, a.monthly_amount, p.duration_months
                 FROM {$app_table} a
                 LEFT JOIN {$wpdb->prefix}gf_installment_plans p ON p.plan_id = a.plan_id
                 WHERE a.order_id = %d ORDER BY a.app_id DESC LIMIT 1",
                $order_id
            ),
            ARRAY_A
        );
        if (is_array($app) && !empty($app)) {
            $code        = (string) ($app['student_code'] ?? '');
            $installment = [
                'status'         => (string) ($app['status'] ?? ''),
                'student_code'   => $is_owner_or_staff ? ($code !== '' ? $code : 'SV-ĐHQG') : 'SV-****',
                'months'         => (int) ($app['duration_months'] ?? 6),
                'monthly_amount' => (float) ($app['monthly_amount'] ?? 0),
            ];
        }
    }
    if ($installment === null) {
        $meta_inst = (string) $order->get_meta('_gf_installment_status');
        if ($meta_inst !== '') {
            $installment = [
                'status'         => $meta_inst,
                'student_code'   => $is_owner_or_staff ? 'SV-ĐHQG' : 'SV-****',
                'months'         => 6,
                'monthly_amount' => (float) round(((float) $order->get_total() * 0.7) / 6, -3),
            ];
        }
    }

    $created_dt = $order->get_date_created();
    $cust_name  = $is_owner_or_staff
        ? (trim($order->get_formatted_billing_full_name()) ?: 'Khách hàng GearForge')
        : sprintf('Sinh viên ĐHQG (#%d)', $order_id);

    $invoice_url = ($is_owner_or_staff && class_exists('GF_Invoice_PDF'))
        ? GF_Invoice_PDF::get_download_url($order_id)
        : add_query_arg('order_id', $order_id, home_url('/tra-cuu-don-hang/'));

    return [
        'orderId'      => $order_id,
        'status'       => $status,
        'wcStatus'     => $order->get_status(),
        'total'        => (float) $order->get_total(),
        'createdAt'    => $created_dt ? $created_dt->date_i18n('d/m/Y H:i') : '',
        'customerName' => $cust_name,
        'items'        => $items,
        'serials'      => $serials,
        'installment'  => $installment,
        'invoiceUrl'   => $invoice_url,
    ];
}

/**
 * Query and filter WooCommerce catalog quickly across published products.
 */
function gf_flagship_query_catalog(array $params): array {
    global $wpdb;

    $search   = trim(sanitize_text_field((string) ($params['search'] ?? '')));
    $category = sanitize_key((string) ($params['category'] ?? 'all'));
    $cpu      = trim(sanitize_text_field((string) ($params['cpu'] ?? '')));
    $ram      = trim(sanitize_text_field((string) ($params['ram'] ?? '')));
    $gpu      = trim(sanitize_text_field((string) ($params['gpu'] ?? '')));
    $storage  = trim(sanitize_text_field((string) ($params['storage'] ?? '')));
    $maxPrice = (float) ($params['maxPrice'] ?? 0);
    $sort     = sanitize_key((string) ($params['sort'] ?? 'featured'));
    $page     = max(1, (int) ($params['page'] ?? 1));
    $perPage  = max(1, min(48, (int) ($params['perPage'] ?? 12)));
    $inStock  = !empty($params['inStockOnly']);

    $lookup = "{$wpdb->prefix}wc_product_meta_lookup";
    $rows   = $wpdb->get_results(
        "SELECT p.ID, p.post_title, p.post_date, COALESCE(ml.min_price, 0) AS price,
                COALESCE(ml.stock_status, 'instock') AS stock_status, COALESCE(ml.total_sales, 0) AS sales
         FROM {$wpdb->posts} p
         LEFT JOIN {$lookup} ml ON ml.product_id = p.ID
         WHERE p.post_type = 'product' AND p.post_status = 'publish'",
        ARRAY_A
    );

    if (!is_array($rows) || empty($rows)) {
        return ['items' => [], 'total' => 0, 'totalPages' => 1, 'page' => 1];
    }

    $term_rows = $wpdb->get_results(
        "SELECT tr.object_id, tt.taxonomy, t.slug, t.name
         FROM {$wpdb->term_relationships} tr
         INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
         INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
         WHERE tt.taxonomy IN ('product_cat', 'pa_cpu', 'pa_ram', 'pa_gpu', 'pa_o-cung')",
        ARRAY_A
    );

    $tax_map = [];
    if (is_array($term_rows)) {
        foreach ($term_rows as $tr) {
            $oid = (int) $tr['object_id'];
            $tax = (string) $tr['taxonomy'];
            $tax_map[$oid][$tax]['slugs'][] = strtolower((string) $tr['slug']);
            $tax_map[$oid][$tax]['names'][] = strtolower((string) $tr['name']);
        }
    }

    $cat_aliases = [
        'laptop'           => ['laptop', 'laptop-gaming', 'laptop-van-phong', 'laptop-do-hoa'],
        'gaming'           => ['laptop-gaming'],
        'laptop-gaming'    => ['laptop-gaming'],
        'ultrabook'        => ['laptop-van-phong', 'laptop-do-hoa'],
        'laptop-ultrabook' => ['laptop-van-phong', 'laptop-do-hoa'],
        'laptop-van-phong' => ['laptop-van-phong'],
        'dev'              => ['laptop-van-phong', 'laptop-do-hoa'],
        'creator'          => ['laptop-do-hoa'],
        'laptop-do-hoa'    => ['laptop-do-hoa'],
        'workstation'      => ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa'],
        'pc-workstation'   => ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa'],
        'pc-nguyen-bo'     => ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa'],
        'pc'               => ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa'],
        'pc-gaming'        => ['pc-gaming'],
        'gear'             => ['phu-kien', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
        'phu-kien'         => ['phu-kien', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
        'accessories'      => ['phu-kien', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
    ];

    $filtered = [];
    foreach ($rows as $row) {
        $pid    = (int) $row['ID'];
        $title  = (string) $row['post_title'];
        $t_low  = function_exists('mb_strtolower') ? mb_strtolower($title, 'UTF-8') : strtolower($title);
        $price  = (float) $row['price'];
        $cats   = $tax_map[$pid]['product_cat']['slugs'] ?? [];
        $cat_s  = implode(' ', $cats);
        $cpus     = implode(' ', $tax_map[$pid]['pa_cpu']['names'] ?? []) . ' ' . $t_low;
        $rams     = implode(' ', $tax_map[$pid]['pa_ram']['names'] ?? []) . ' ' . $t_low;
        $gpus     = implode(' ', $tax_map[$pid]['pa_gpu']['names'] ?? []) . ' ' . $t_low;
        $storages = implode(' ', $tax_map[$pid]['pa_o-cung']['names'] ?? []) . ' ' . $t_low;

        if ($inStock && $row['stock_status'] !== 'instock') {
            continue;
        }
        if ($maxPrice > 0 && $price > $maxPrice) {
            continue;
        }
        if ($search !== '') {
            $q_low = function_exists('mb_strtolower') ? mb_strtolower($search, 'UTF-8') : strtolower($search);
            $blob  = $t_low . ' ' . $cat_s . ' ' . $cpus . ' ' . $rams . ' ' . $gpus . ' ' . $storages;
            if (!str_contains($blob, $q_low)) {
                continue;
            }
        }
        if ($category !== '' && $category !== 'all') {
            $targets = $cat_aliases[$category] ?? [$category];
            $matched = !empty(array_intersect($targets, $cats));
            if (!$matched) {
                continue;
            }
        }
        if ($cpu !== '' && $cpu !== 'all') {
            $c_low = strtolower($cpu);
            if ($c_low === 'core i7/i9' || $c_low === 'i7/i9') {
                if (!preg_match('/\b(core\s*i[79]|i[79][-\s]\d{4,5})/i', $cpus)) {
                    continue;
                }
            } elseif ($c_low === 'core i5') {
                if (!preg_match('/\b(core\s*i5|i5[-\s]\d{4,5})/i', $cpus)) {
                    continue;
                }
            } elseif ($c_low === 'apple m') {
                if (!preg_match('/\b(apple\s*m\d|m[1-4]\s*(?:pro|max)?|macbook)/i', $cpus)) {
                    continue;
                }
            } elseif (!str_contains($cpus, $c_low)) {
                continue;
            }
        }
        if ($ram !== '' && $ram !== 'all') {
            $r_low = strtolower($ram);
            if ($r_low === '64gb+' || $r_low === '64gb') {
                if (!str_contains($rams, '64gb') && !str_contains($rams, '128gb')) {
                    continue;
                }
            } elseif (!str_contains($rams, $r_low)) {
                continue;
            }
        }
        if ($gpu !== '' && $gpu !== 'all') {
            $g_low = strtolower($gpu);
            if ($g_low === 'integrated') {
                if (preg_match('/\b(rtx|gtx|rx\s*\d{4})\b/i', $gpus)) {
                    continue;
                }
            } elseif ($g_low === 'rtx 3050/4050') {
                if (!preg_match('/(3050|4050)/i', $gpus)) {
                    continue;
                }
            } elseif ($g_low === 'rtx 4070+' || $g_low === 'rtx 4070') {
                if (!preg_match('/(4070|4080|4090|5070|5080|5090)/i', $gpus)) {
                    continue;
                }
            } elseif (!str_contains($gpus, $g_low)) {
                continue;
            }
        }
        if ($storage !== '' && $storage !== 'all') {
            $s_low = strtolower($storage);
            if ($s_low === '2tb+' || $s_low === '2tb') {
                if (!preg_match('/\b(2\s*tb|4\s*tb|8\s*tb)\b/i', $storages)) {
                    continue;
                }
            } elseif (!str_contains($storages, $s_low)) {
                continue;
            }
        }

        $row['is_flagship_tier'] = ($price >= 12000000 && !str_contains($cat_s, 'phu-kien')) ? 0 : 1;
        $filtered[]              = $row;
    }

    usort($filtered, static function (array $a, array $b) use ($sort): int {
        return match ($sort) {
            'price_asc', 'price'       => ((float) $a['price'] <=> (float) $b['price']) ?: ((int) $b['ID'] <=> (int) $a['ID']),
            'price_desc', 'price-desc' => ((float) $b['price'] <=> (float) $a['price']) ?: ((int) $b['ID'] <=> (int) $a['ID']),
            'newest', 'date'           => strcmp((string) $b['post_date'], (string) $a['post_date']) ?: ((int) $b['ID'] <=> (int) $a['ID']),
            'popularity'               => ((int) $b['sales'] <=> (int) $a['sales']) ?: ((int) $b['ID'] <=> (int) $a['ID']),
            default                    => ((int) ($a['stock_status'] === 'instock' ? 0 : 1) <=> (int) ($b['stock_status'] === 'instock' ? 0 : 1))
                ?: ((int) $a['is_flagship_tier'] <=> (int) $b['is_flagship_tier'])
                ?: (((int) $a['ID'] % 31) <=> ((int) $b['ID'] % 31))
                ?: (((int) $a['ID'] % 7) <=> ((int) $b['ID'] % 7))
                ?: ((int) $b['ID'] <=> (int) $a['ID']),
        };
    });

    $total       = count($filtered);
    $total_pages = max(1, (int) ceil($total / $perPage));
    $page        = min($page, $total_pages);
    $offset      = ($page - 1) * $perPage;
    $slice       = array_slice($filtered, $offset, $perPage);

    $items = [];
    if (function_exists('wc_get_product')) {
        foreach ($slice as $row) {
            $product = wc_get_product((int) $row['ID']);
            if ($product instanceof WC_Product) {
                $items[] = gf_flagship_serialize_product($product);
            }
        }
    }

    return [
        'items'      => $items,
        'total'      => $total,
        'totalPages' => $total_pages,
        'page'       => $page,
    ];
}

/**
 * Build initial window.gfFlagshipBoot payload for React 19 Flagship shell.
 */
function gf_flagship_build_boot_data(): array {
    gf_flagship_ensure_wc_cart();

    $compare_ids = [];
    if (class_exists('GF_Compare_Specs')) {
        $compare_ids = GF_Compare_Specs::get_session_ids();
    } elseif (!empty($_COOKIE['gf_compare_ids'])) {
        $raw         = array_map('intval', explode(',', sanitize_text_field((string) $_COOKIE['gf_compare_ids'])));
        $compare_ids = array_slice(array_values(array_unique(array_filter($raw))), 0, 3);
    }

    $catalog = gf_flagship_query_catalog([
        'sort'        => 'featured',
        'page'        => 1,
        'perPage'     => 40,
        'inStockOnly' => true,
    ]);
    $boot_products = $catalog['items'];
    foreach (['laptop-gaming', 'laptop-ultrabook', 'pc-workstation', 'gear'] as $cat_key) {
        $extra = gf_flagship_query_catalog([
            'category'    => $cat_key,
            'sort'        => 'featured',
            'page'        => 1,
            'perPage'     => 8,
            'inStockOnly' => true,
        ]);
        foreach ($extra['items'] as $ep) {
            $exists = false;
            foreach ($boot_products as $bp) {
                if ((int) ($bp['id'] ?? 0) === (int) ($ep['id'] ?? 0)) {
                    $exists = true;
                    break;
                }
            }
            if (!$exists) {
                $boot_products[] = $ep;
            }
        }
    }

    $sample_orders = [];
    foreach ([542, 543] as $demo_id) {
        $serialized = gf_flagship_serialize_oms_order($demo_id, true);
        if (is_array($serialized)) {
            $sample_orders[] = $serialized;
        }
    }

    $user          = wp_get_current_user();
    $counts        = wp_count_posts('product');
    $total_publish = isset($counts->publish) ? (int) $counts->publish : (int) $catalog['total'];

    return [
        'siteUrl'        => home_url('/'),
        'pageMode'       => gf_get_flagship_page_mode() ?? 'showcase',
        'themeAssetBase' => get_stylesheet_directory_uri() . '/assets/flagship',
        'restUrl'        => untrailingslashit(esc_url_raw(rest_url('gearforge/v1'))),
        'ajaxUrl'        => admin_url('admin-ajax.php'),
        'restNonce'      => wp_create_nonce('wp_rest'),
        'ajaxNonce'      => wp_create_nonce('gf_frontend_nonce'),
        'routes'         => [
            'shop'      => home_url('/shop/'),
            'cart'      => function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/'),
            'checkout'  => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/'),
            'compare'   => home_url('/so-sanh-cau-hinh/'),
            'tracking'  => home_url('/tra-cuu-don-hang/'),
            'myAccount' => (function_exists('wc_get_page_permalink') && wc_get_page_permalink('myaccount')) ? wc_get_page_permalink('myaccount') : home_url('/my-account/'),
        ],
        'user'           => [
            'loggedIn' => is_user_logged_in(),
            'id'       => is_user_logged_in() ? (int) $user->ID : 0,
            'name'     => is_user_logged_in() ? (string) ($user->display_name ?: $user->user_login) : '',
            'email'    => is_user_logged_in() ? (string) $user->user_email : '',
        ],
        'compareIds'     => $compare_ids,
        'compareItems'   => gf_flagship_serialize_compare_items($compare_ids),
        'cart'           => gf_flagship_serialize_cart(),
        'products'       => $boot_products,
        'totalProducts'  => $total_publish,
        'sampleOrders'   => $sample_orders,
    ];
}

add_action('wp_ajax_gf_flagship_catalog', 'gf_ajax_flagship_catalog');
add_action('wp_ajax_nopriv_gf_flagship_catalog', 'gf_ajax_flagship_catalog');
function gf_ajax_flagship_catalog(): void {
    $res = gf_flagship_query_catalog([
        'search'   => $_REQUEST['search'] ?? '',
        'category' => $_REQUEST['category'] ?? 'all',
        'cpu'      => $_REQUEST['cpu'] ?? '',
        'ram'      => $_REQUEST['ram'] ?? '',
        'gpu'      => $_REQUEST['gpu'] ?? '',
        'storage'  => $_REQUEST['storage'] ?? '',
        'maxPrice' => $_REQUEST['maxPrice'] ?? 0,
        'sort'     => $_REQUEST['sort'] ?? 'menu_order',
        'page'     => $_REQUEST['page'] ?? 1,
        'perPage'  => $_REQUEST['perPage'] ?? 12,
    ]);
    wp_send_json_success($res);
}

add_action('wp_ajax_gf_flagship_oms_lookup', 'gf_ajax_flagship_oms_lookup');
add_action('wp_ajax_nopriv_gf_flagship_oms_lookup', 'gf_ajax_flagship_oms_lookup');
function gf_ajax_flagship_oms_lookup(): void {
    $order_id = (int) ($_REQUEST['order_id'] ?? 0);
    if ($order_id <= 0) {
        wp_send_json_error(['message' => 'Vui lòng nhập mã đơn hàng hợp lệ.'], 400);
    }
    $res = gf_flagship_serialize_oms_order($order_id, true);
    if (is_wp_error($res)) {
        $status = (int) ($res->get_error_data()['status'] ?? 403);
        wp_send_json_error(['message' => $res->get_error_message()], $status);
    }
    if (!is_array($res)) {
        wp_send_json_error(['message' => sprintf('Không tìm thấy đơn hàng #%d trong hệ thống.', $order_id)], 404);
    }
    wp_send_json_success($res);
}

add_action('wp_ajax_gf_flagship_cart', 'gf_ajax_flagship_cart');
add_action('wp_ajax_nopriv_gf_flagship_cart', 'gf_ajax_flagship_cart');
function gf_ajax_flagship_cart(): void {
    check_ajax_referer('gf_frontend_nonce', 'nonce');
    gf_flagship_ensure_wc_cart();

    if (!function_exists('WC') || !WC()->cart) {
        wp_send_json_error(['message' => 'Giỏ hàng WooCommerce chưa sẵn sàng.'], 500);
    }

    $mode    = sanitize_key((string) ($_POST['mode'] ?? 'get'));
    $cart    = WC()->cart;
    $message = '';

    if ($mode === 'add') {
        $pid = (int) ($_POST['product_id'] ?? 0);
        $qty = max(1, (int) ($_POST['qty'] ?? 1));
        if ($pid <= 0 || !$cart->add_to_cart($pid, $qty)) {
            $err = function_exists('wc_get_notices') ? wc_get_notices('error') : [];
            if (function_exists('wc_clear_notices')) {
                wc_clear_notices();
            }
            $msg = !empty($err[0]['notice']) ? wp_strip_all_tags((string) $err[0]['notice']) : 'Không thể thêm sản phẩm vào giỏ hàng.';
            wp_send_json_error(['message' => $msg, 'cart' => gf_flagship_serialize_cart()], 400);
        }
        $message = 'Đã thêm sản phẩm vào giỏ hàng!';
    } elseif ($mode === 'update') {
        $key = sanitize_text_field((string) ($_POST['cart_item_key'] ?? ''));
        $qty = max(0, (int) ($_POST['qty'] ?? 1));
        if ($key !== '') {
            $cart->set_quantity($key, $qty, true);
            $message = 'Đã cập nhật số lượng.';
        }
    } elseif ($mode === 'remove') {
        $key = sanitize_text_field((string) ($_POST['cart_item_key'] ?? ''));
        if ($key !== '') {
            $cart->remove_cart_item($key);
            $message = 'Đã xóa sản phẩm khỏi giỏ hàng.';
        }
    } elseif ($mode === 'apply_coupon') {
        $code = sanitize_text_field((string) ($_POST['coupon_code'] ?? ''));
        if ($code === '') {
            wp_send_json_error(['message' => 'Vui lòng nhập mã ưu đãi (VD: BACKTOSCHOOL).', 'cart' => gf_flagship_serialize_cart()], 400);
        }
        $ok = $cart->apply_coupon($code);
        if (!$ok) {
            $err = function_exists('wc_get_notices') ? wc_get_notices('error') : [];
            if (function_exists('wc_clear_notices')) {
                wc_clear_notices();
            }
            $msg = !empty($err[0]['notice']) ? wp_strip_all_tags((string) $err[0]['notice']) : 'Mã ưu đãi không hợp lệ hoặc chưa đủ điều kiện.';
            wp_send_json_error(['message' => $msg, 'cart' => gf_flagship_serialize_cart()], 400);
        }
        $message = sprintf('Đã áp dụng mã ưu đãi %s!', strtoupper($code));
    } elseif ($mode === 'remove_coupon') {
        $code = sanitize_text_field((string) ($_POST['coupon_code'] ?? ''));
        if ($code !== '') {
            $cart->remove_coupon($code);
            $message = 'Đã gỡ mã ưu đãi.';
        }
    }

    if (function_exists('wc_clear_notices')) {
        wc_clear_notices();
    }
    $cart->calculate_totals();
    $cart->maybe_set_cart_cookies();
    if (WC()->session && method_exists(WC()->session, 'save_data')) {
        WC()->session->save_data();
    }

    wp_send_json_success([
        'cart'    => gf_flagship_serialize_cart(),
        'message' => $message,
    ]);
}
