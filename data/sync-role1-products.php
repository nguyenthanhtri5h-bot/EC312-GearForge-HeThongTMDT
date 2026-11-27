<?php
/**
 * Idempotent CLI Importer / Syncer for Role 1's 590 GearForge Products.
 *
 * Usage inside Docker:
 *   docker exec gearforge_wp php /var/www/gf-data/sync-role1-products.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only.\n");
}

$wp_load = '/var/www/html/wp-load.php';
if (!file_exists($wp_load)) {
    fwrite(STDERR, "Cannot find wp-load.php at {$wp_load}\n");
    exit(1);
}
require_once $wp_load;

if (!function_exists('wc_get_product') || !class_exists('WC_Product_Simple')) {
    fwrite(STDERR, "WooCommerce must be active before running this sync script.\n");
    exit(1);
}

$csv_path = getenv('GF_PRODUCTS_CSV') ?: '/var/www/gf-data/products_import.csv';
if (!is_file($csv_path)) {
    fwrite(STDERR, "CSV file not found: {$csv_path}\n");
    exit(1);
}

/**
 * Ensure a WooCommerce product_cat term exists with the desired slug and parent.
 */
function gf_sync_ensure_category(string $name, string $slug, int $parent_id = 0): int {
    $existing = get_term_by('slug', $slug, 'product_cat');
    if ($existing instanceof WP_Term) {
        if ($parent_id > 0 && (int) $existing->parent !== $parent_id) {
            wp_update_term((int) $existing->term_id, 'product_cat', ['parent' => $parent_id]);
        }
        return (int) $existing->term_id;
    }

    $res = wp_insert_term($name, 'product_cat', [
        'slug'   => $slug,
        'parent' => $parent_id,
    ]);
    if (is_wp_error($res)) {
        $fallback = get_term_by('name', $name, 'product_cat');
        return $fallback instanceof WP_Term ? (int) $fallback->term_id : 0;
    }
    return (int) $res['term_id'];
}

/**
 * Ensure a WooCommerce global attribute taxonomy (pa_*) exists and return taxonomy slug.
 */
function gf_sync_ensure_attribute_taxonomy(string $slug, string $label): string {
    $taxonomy = wc_attribute_taxonomy_name($slug);
    if (taxonomy_exists($taxonomy)) {
        return $taxonomy;
    }

    if (function_exists('wc_create_attribute')) {
        $attr_id = wc_create_attribute([
            'name'         => $label,
            'slug'         => $slug,
            'type'         => 'select',
            'order_by'     => 'menu_order',
            'has_archives' => false,
        ]);
        if (!is_wp_error($attr_id)) {
            register_taxonomy($taxonomy, ['product'], ['hierarchical' => false]);
        }
    }
    return $taxonomy;
}

/**
 * Split WooCommerce CSV escaped-comma attribute value string into clean values.
 *
 * @return string[]
 */
function gf_sync_parse_attr_values(string $raw): array {
    $raw = trim($raw);
    if ($raw === '') {
        return [];
    }
    $parts  = preg_split('/(?<!\\\\),/', $raw) ?: [];
    $values = [];
    foreach ($parts as $part) {
        $clean = trim(str_replace(['\\,', '\\n'], [',', ' '], $part));
        if ($clean !== '') {
            $values[] = $clean;
        }
    }
    return array_values(array_unique($values));
}

$category_map = [
    'Laptop > Laptop Gaming'      => ['parent' => ['Laptop', 'laptop'],       'child' => ['Laptop Gaming', 'laptop-gaming']],
    'Laptop > Laptop Văn Phòng'   => ['parent' => ['Laptop', 'laptop'],       'child' => ['Laptop Văn Phòng', 'laptop-van-phong']],
    'Laptop > Laptop Đồ Họa'      => ['parent' => ['Laptop', 'laptop'],       'child' => ['Laptop Đồ Họa', 'laptop-do-hoa']],
    'Laptop > Laptop Sinh Viên'   => ['parent' => ['Laptop', 'laptop'],       'child' => ['Laptop Sinh Viên', 'laptop-sinh-vien']],
    'PC > PC Gaming'              => ['parent' => ['PC', 'pc'],               'child' => ['PC Gaming', 'pc-gaming']],
    'PC > PC Đồ Họa'              => ['parent' => ['PC', 'pc'],               'child' => ['PC Đồ Họa', 'pc-do-hoa']],
    'PC > PC Văn Phòng'           => ['parent' => ['PC', 'pc'],               'child' => ['PC Văn Phòng', 'pc-van-phong']],
    'Linh kiện > CPU'             => ['parent' => ['Linh kiện', 'linh-kien'], 'child' => ['CPU', 'cpu']],
    'Linh kiện > RAM'             => ['parent' => ['Linh kiện', 'linh-kien'], 'child' => ['RAM', 'ram']],
    'Linh kiện > VGA'             => ['parent' => ['Linh kiện', 'linh-kien'], 'child' => ['VGA', 'vga']],
    'Gear > Bàn Phím'             => ['parent' => ['Gear', 'gear'],           'child' => ['Bàn Phím', 'ban-phim']],
    'Gear > Chuột máy tính'       => ['parent' => ['Gear', 'gear'],           'child' => ['Chuột máy tính', 'chuot']],
    'Gear > Lót chuột'            => ['parent' => ['Gear', 'gear'],           'child' => ['Lót chuột', 'lot-chuot']],
];

$resolved_cat_ids = [];
foreach ($category_map as $csv_cat => $spec) {
    $parent_id = gf_sync_ensure_category($spec['parent'][0], $spec['parent'][1], 0);
    $child_id  = gf_sync_ensure_category($spec['child'][0], $spec['child'][1], $parent_id);
    $resolved_cat_ids[$csv_cat] = array_values(array_filter([$parent_id, $child_id]));
}

$global_attr_map = [
    'CPU'           => ['cpu', 'CPU'],
    'RAM'           => ['ram', 'RAM'],
    'GPU'           => ['gpu', 'GPU'],
    'Ổ cứng'        => ['o-cung', 'Ổ cứng'],
    'SSD'           => ['o-cung', 'Ổ cứng'],
    'Màn hình'      => ['man-hinh', 'Màn hình'],
    'Nhu cầu'       => ['nhu-cau', 'Nhu cầu'],
    'Thương hiệu'   => ['thuong-hieu', 'Thương hiệu'],
    'Hãng sản xuất' => ['thuong-hieu', 'Thương hiệu'],
    'Kết nối'       => ['ket-noi', 'Kết nối'],
    'Khối lượng'    => ['trong-luong', 'Trọng lượng'],
    'Trọng lượng'   => ['trong-luong', 'Trọng lượng'],
];

$tax_cache = [];
foreach ($global_attr_map as $info) {
    if (!isset($tax_cache[$info[0]])) {
        $tax_cache[$info[0]] = gf_sync_ensure_attribute_taxonomy($info[0], $info[1]);
    }
}

$handle = fopen($csv_path, 'r');
if (!$handle) {
    fwrite(STDERR, "Failed to open CSV: {$csv_path}\n");
    exit(1);
}

$headers = fgetcsv($handle);
if (!is_array($headers) || empty($headers)) {
    fclose($handle);
    fwrite(STDERR, "Invalid or empty CSV header.\n");
    exit(1);
}
$headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
$col_index  = array_flip($headers);

$get_col = static function (array $row, string $name) use ($col_index): string {
    if (!isset($col_index[$name])) {
        return '';
    }
    return trim((string) ($row[$col_index[$name]] ?? ''));
};

wp_defer_term_counting(true);
wp_defer_comment_counting(true);

$created     = 0;
$updated     = 0;
$skipped     = 0;
$csv_skus    = [];
$meta_fields = [
    'cpu'     => '_gf_cpu',
    'ram'     => '_gf_ram',
    'gpu'     => '_gf_gpu',
    'o-cung'  => '_gf_storage',
    'man-hinh'=> '_gf_screen',
    'thuong-hieu' => '_gf_brand',
];

while (($row = fgetcsv($handle)) !== false) {
    $sku = $get_col($row, 'SKU');
    $name = $get_col($row, 'Name');
    if ($sku === '' || $name === '') {
        $skipped++;
        continue;
    }
    $csv_skus[$sku] = true;

    $existing_id = wc_get_product_id_by_sku($sku);
    $product     = $existing_id > 0 ? wc_get_product($existing_id) : null;
    if (!$product instanceof WC_Product) {
        $product = new WC_Product_Simple();
        $product->set_sku($sku);
        $is_new = true;
    } else {
        $is_new = false;
    }

    $regular_price = (string) preg_replace('/[^\d.]/', '', $get_col($row, 'Regular price'));
    $sale_price    = (string) preg_replace('/[^\d.]/', '', $get_col($row, 'Sale price'));
    $published     = $get_col($row, 'Published');
    $in_stock      = $get_col($row, 'In stock?');
    $stock_qty     = $get_col($row, 'Stock');
    $short_desc    = $get_col($row, 'Short description');
    $cat_raw       = $get_col($row, 'Categories');
    $img_raw       = $get_col($row, 'Images');

    $old_slug = $product->get_slug();
    $target_slug = sanitize_title($name);
    if ($old_slug && $old_slug !== $target_slug) {
        add_post_meta($product->get_id(), '_wp_old_slug', $old_slug, false);
    }
    $product->set_name($name);
    $product->set_slug($target_slug);
    $product->set_status($published === '0' ? 'draft' : 'publish');
    $product->set_catalog_visibility($get_col($row, 'Visibility in catalog') ?: 'visible');
    $product->set_featured($get_col($row, 'Is featured?') === '1');
    if ($short_desc !== '') {
        $product->set_short_description($short_desc);
    }
    $clean_desc = $name . ($short_desc !== '' ? ' — ' . $short_desc : '') . '. Chính hãng tại GearForge ĐHQG-HCM, hỗ trợ trả góp 0% thẻ sinh viên .edu.vn và bảo hành onsite KTX.';
    $product->set_description($clean_desc);

    if ($regular_price !== '' && (float) $regular_price > 0) {
        $product->set_regular_price($regular_price);
        if ($sale_price !== '' && (float) $sale_price > 0 && (float) $sale_price < (float) $regular_price) {
            $product->set_sale_price($sale_price);
            $product->set_price($sale_price);
        } else {
            $product->set_sale_price('');
            $product->set_price($regular_price);
        }
    }

    if ($stock_qty !== '' && is_numeric($stock_qty)) {
        $product->set_manage_stock(true);
        $product->set_stock_quantity((int) $stock_qty);
        $product->set_stock_status(((int) $stock_qty > 0 && $in_stock !== '0') ? 'instock' : 'outofstock');
    } else {
        $product->set_manage_stock(false);
        $product->set_stock_status($in_stock === '0' ? 'outofstock' : 'instock');
    }

    if (isset($resolved_cat_ids[$cat_raw])) {
        $product->set_category_ids($resolved_cat_ids[$cat_raw]);
    }

    // Collect attributes (supporting both global pa_* taxonomies and custom attributes cleanly)
    $tax_terms_to_set = [];
    $wc_attributes    = [];
    $custom_attr_map  = [];
    $pos              = 0;

    for ($i = 1; $i <= 17; $i++) {
        $attr_name = $get_col($row, "Attribute {$i} name");
        $attr_vals = gf_sync_parse_attr_values($get_col($row, "Attribute {$i} value(s)"));
        if ($attr_name === '' || empty($attr_vals)) {
            continue;
        }
        $is_visible = $get_col($row, "Attribute {$i} visible") !== '0';

        if (isset($global_attr_map[$attr_name])) {
            [$slug, ] = $global_attr_map[$attr_name];
            $taxonomy = $tax_cache[$slug];
            if (!isset($tax_terms_to_set[$taxonomy])) {
                $tax_terms_to_set[$taxonomy] = [];
            }
            $tax_terms_to_set[$taxonomy] = array_values(array_unique(array_merge($tax_terms_to_set[$taxonomy], $attr_vals)));

            if (!isset($wc_attributes[$taxonomy])) {
                $attr_obj = new WC_Product_Attribute();
                $attr_obj->set_id(wc_attribute_taxonomy_id_by_name($taxonomy));
                $attr_obj->set_name($taxonomy);
                $attr_obj->set_position($pos++);
                $attr_obj->set_visible($is_visible);
                $attr_obj->set_variation(false);
                $wc_attributes[$taxonomy] = $attr_obj;
            }
        } else {
            $key = mb_strtolower($attr_name, 'UTF-8');
            if (!isset($custom_attr_map[$key])) {
                $custom_attr_map[$key] = [
                    'name'    => $attr_name,
                    'values'  => [],
                    'visible' => $is_visible,
                ];
            }
            $custom_attr_map[$key]['values'] = array_values(array_unique(array_merge($custom_attr_map[$key]['values'], $attr_vals)));
        }
    }

    foreach ($custom_attr_map as $key => $c_attr) {
        $attr_obj = new WC_Product_Attribute();
        $attr_obj->set_id(0);
        $attr_obj->set_name($c_attr['name']);
        $attr_obj->set_options($c_attr['values']);
        $attr_obj->set_position($pos++);
        $attr_obj->set_visible($c_attr['visible']);
        $attr_obj->set_variation(false);
        $wc_attributes['custom_' . $key] = $attr_obj;
    }

    foreach ($tax_terms_to_set as $taxonomy => $vals) {
        $term_ids = [];
        foreach ($vals as $val) {
            $term = get_term_by('name', $val, $taxonomy);
            if (!$term instanceof WP_Term) {
                $ins = wp_insert_term($val, $taxonomy);
                if (!is_wp_error($ins)) {
                    $term_ids[] = (int) $ins['term_id'];
                } elseif ($ins->get_error_code() === 'term_exists') {
                    $term_ids[] = (int) $ins->get_error_data('term_exists');
                }
            } else {
                $term_ids[] = (int) $term->term_id;
            }
        }
        if (isset($wc_attributes[$taxonomy])) {
            $wc_attributes[$taxonomy]->set_options($term_ids);
        }
    }

    $product->set_attributes(array_values($wc_attributes));
    $product_id = $product->save();

    foreach ($tax_terms_to_set as $taxonomy => $vals) {
        wp_set_object_terms($product_id, $vals, $taxonomy, false);
        $short_slug = str_replace('pa_', '', $taxonomy);
        if (isset($meta_fields[$short_slug]) && !empty($vals)) {
            update_post_meta($product_id, $meta_fields[$short_slug], $vals[0]);
        }
    }

    if ($img_raw !== '') {
        $first_img = trim(explode(',', $img_raw)[0]);
        if (filter_var($first_img, FILTER_VALIDATE_URL)) {
            update_post_meta($product_id, '_gf_external_image_url', esc_url_raw($first_img));
        }
    }

    if ($is_new) {
        $created++;
    } else {
        $updated++;
    }
}
fclose($handle);

// Archive legacy SKUs not in Role 1's 590 CSV to 'draft' WITHOUT deleting orders or post rows
global $wpdb;
$legacy_drafted = 0;
$all_published = $wpdb->get_results(
    "SELECT p.ID, pm.meta_value AS sku
     FROM {$wpdb->posts} p
     LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = '_sku'
     WHERE p.post_type = 'product' AND p.post_status = 'publish'",
    ARRAY_A
);
foreach ($all_published as $row) {
    $row_sku = (string) ($row['sku'] ?? '');
    if ($row_sku === '' || !isset($csv_skus[$row_sku])) {
        wp_update_post(['ID' => (int) $row['ID'], 'post_status' => 'draft']);
        $legacy_drafted++;
    }
}

wp_defer_term_counting(false);
wp_defer_comment_counting(false);

$all_cats = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false, 'fields' => 'ids']);
if (is_array($all_cats) && !empty($all_cats)) {
    wp_update_term_count_now($all_cats, 'product_cat');
}
if (function_exists('wc_update_product_lookup_tables')) {
    wc_update_product_lookup_tables();
}
delete_transient('wc_term_counts');

$published_count = (int) (wp_count_posts('product')->publish ?? 0);
echo "SYNC_DONE: created={$created}, updated={$updated}, skipped={$skipped}, legacy_drafted={$legacy_drafted}, published_total={$published_count}\n";
