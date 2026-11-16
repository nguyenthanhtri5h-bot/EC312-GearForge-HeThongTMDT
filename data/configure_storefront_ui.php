<?php
/**
 * Configures Storefront navigation menu, Shop frontpage, and Attribute Filter sidebar widgets.
 * Usage: wp --allow-root --path=/var/www/html eval-file /var/www/gf-data/configure_storefront_ui.php
 */

if (!defined('ABSPATH')) {
    exit(1);
}

// 0. Publish Store (disable WooCommerce Coming Soon mode) & configure Vietnam VND currency
update_option('woocommerce_coming_soon', 'no');
update_option('woocommerce_store_pages_only', 'no');
update_option('woocommerce_default_country', 'VN');
update_option('woocommerce_currency', 'VND');
update_option('woocommerce_currency_pos', 'right_space');
update_option('woocommerce_price_thousand_sep', '.');
update_option('woocommerce_price_decimal_sep', ',');
update_option('woocommerce_price_num_decimals', 0);
echo "Published WooCommerce store & configured VND currency.\n";

// 1. Set Shop page as front page so visitors immediately see hero + catalog + filters
$shop_id = function_exists('wc_get_page_id') ? wc_get_page_id('shop') : 0;
if ($shop_id > 0) {
    update_option('show_on_front', 'page');
    update_option('page_on_front', $shop_id);
}

// 2. Create Primary Navigation Menu for GearForge
$menu_name = 'GearForge Primary Menu';
$menu_obj  = wp_get_nav_menu_object($menu_name);
if (!$menu_obj) {
    $menu_id = wp_create_nav_menu($menu_name);
    if (!is_wp_error($menu_id)) {
        $links = [
            ['title' => 'Cửa hàng (500+ SP)', 'url' => home_url('/shop/')],
            ['title' => 'So sánh cấu hình', 'url' => home_url('/so-sanh-cau-hinh/')],
            ['title' => 'Tra cứu OMS', 'url' => home_url('/tra-cuu-don-hang/')],
            ['title' => 'Giỏ hàng', 'url' => home_url('/cart/')],
            ['title' => 'Tài khoản SV', 'url' => home_url('/my-account/')],
        ];
        foreach ($links as $idx => $item) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title'    => $item['title'],
                'menu-item-url'      => $item['url'],
                'menu-item-status'   => 'publish',
                'menu-item-position' => $idx + 1,
            ]);
        }
        $locations = get_theme_mod('nav_menu_locations') ?: [];
        $locations['primary']  = $menu_id;
        $locations['handheld'] = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
        echo "Configured GearForge Primary Menu.\n";
    }
}

// 3. Configure Sidebar Filters (Price + Nhu cau + CPU + RAM + GPU)
$sidebars = get_option('sidebars_widgets', []);
if (empty($sidebars['sidebar-1']) || !in_array('woocommerce_price_filter-2', $sidebars['sidebar-1'], true)) {
    update_option('widget_woocommerce_product_search', [
        2 => ['title' => 'Tìm kiếm Laptop / PC / Gear'],
        '_multiwidget' => 1,
    ]);
    update_option('widget_woocommerce_price_filter', [
        2 => ['title' => 'Lọc theo Khoảng giá'],
        '_multiwidget' => 1,
    ]);
    update_option('widget_woocommerce_layered_nav', [
        2 => ['title' => 'Lọc theo Nhu cầu', 'attribute' => 'nhu-cau', 'display_type' => 'list', 'query_type' => 'and'],
        3 => ['title' => 'Lọc theo CPU', 'attribute' => 'cpu', 'display_type' => 'list', 'query_type' => 'or'],
        4 => ['title' => 'Lọc theo RAM', 'attribute' => 'ram', 'display_type' => 'list', 'query_type' => 'or'],
        5 => ['title' => 'Lọc theo GPU', 'attribute' => 'gpu', 'display_type' => 'list', 'query_type' => 'or'],
        '_multiwidget' => 1,
    ]);
    $sidebars['sidebar-1'] = [
        'woocommerce_product_search-2',
        'woocommerce_price_filter-2',
        'woocommerce_layered_nav-2',
        'woocommerce_layered_nav-3',
        'woocommerce_layered_nav-4',
        'woocommerce_layered_nav-5',
    ];
    update_option('sidebars_widgets', $sidebars);
    echo "Configured Storefront filter sidebar widgets.\n";
}
