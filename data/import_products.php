<?php
/**
 * Idempotent WooCommerce CLI Product Importer for GearForge (>= 500 products).
 * Usage inside container: wp eval-file /var/www/gf-data/import_products.php --allow-root
 */

if (!defined('ABSPATH') || !class_exists('WC_Product_Simple')) {
    fwrite(STDERR, "WordPress + WooCommerce must be loaded.\n");
    exit(1);
}

$csv_path = '/var/www/gf-data/products_import.csv';
if (!file_exists($csv_path)) {
    fwrite(STDERR, "CSV not found at {$csv_path}\n");
    exit(1);
}

$attr_slug_map = [
    'Nhu cầu'     => 'nhu-cau',
    'CPU'         => 'cpu',
    'RAM'         => 'ram',
    'GPU'         => 'gpu',
    'Ổ cứng'      => 'o-cung',
    'Màn hình'    => 'man-hinh',
    'Trọng lượng' => 'trong-luong',
    'Bảo hành'    => 'bao-hanh',
    'Thương hiệu' => 'thuong-hieu',
    'Kết nối'     => 'ket-noi',
];

// Ensure global WooCommerce attributes exist
foreach ($attr_slug_map as $label => $slug) {
    $taxonomy = wc_attribute_taxonomy_name($slug);
    if (!taxonomy_exists($taxonomy)) {
        wc_create_attribute([
            'name'         => $label,
            'slug'         => $slug,
            'type'         => 'select',
            'order_by'     => 'menu_order',
            'has_archives' => true,
        ]);
        register_taxonomy($taxonomy, ['product'], ['hierarchical' => false, 'show_ui' => true, 'query_var' => true]);
    }
}

delete_transient('wc_attribute_taxonomies');

$ensure_category_tree = static function (string $cat_path): int {
    $parts     = array_map('trim', explode('>', $cat_path));
    $parent_id = 0;
    foreach ($parts as $part) {
        if ($part === '') {
            continue;
        }
        $existing = term_exists($part, 'product_cat', $parent_id);
        if (is_array($existing)) {
            $parent_id = (int) $existing['term_id'];
        } elseif ($existing) {
            $parent_id = (int) $existing;
        } else {
            $res = wp_insert_term($part, 'product_cat', ['parent' => $parent_id]);
            if (!is_wp_error($res)) {
                $parent_id = (int) $res['term_id'];
            }
        }
    }
    return $parent_id;
};

$handle = fopen($csv_path, 'r');
$bom    = fread($handle, 3);
if ($bom !== "\xEF\xBB\xBF") {
    rewind($handle);
}

$headers = fgetcsv($handle);
$idx     = array_flip($headers);

$created = 0;
$skipped = 0;

while (($row = fgetcsv($handle)) !== false) {
    $sku = trim((string) ($row[$idx['SKU']] ?? ''));
    if ($sku === '') {
        continue;
    }
    if (wc_get_product_id_by_sku($sku)) {
        $skipped++;
        continue;
    }

    $product = new WC_Product_Simple();
    $product->set_sku($sku);
    $product->set_name((string) $row[$idx['Name']]);
    $product->set_status('publish');
    $product->set_featured((string) ($row[$idx['Is featured?']] ?? '0') === '1');
    $product->set_short_description((string) $row[$idx['Short description']]);
    $product->set_description((string) $row[$idx['Description']]);
    $product->set_regular_price((string) $row[$idx['Regular price']]);
    if (!empty($row[$idx['Sale price']])) {
        $product->set_sale_price((string) $row[$idx['Sale price']]);
    }
    $product->set_manage_stock(true);
    $product->set_stock_quantity((int) ($row[$idx['Stock']] ?? 10));
    $product->set_stock_status('instock');

    $cat_id = $ensure_category_tree((string) ($row[$idx['Categories']] ?? ''));
    if ($cat_id > 0) {
        $product->set_category_ids([$cat_id]);
    }

    $wc_attrs = [];
    for ($i = 1; $i <= 8; $i++) {
        $aname = trim((string) ($row[$idx["Attribute {$i} name"]] ?? ''));
        $aval  = trim((string) ($row[$idx["Attribute {$i} value(s)"]] ?? ''));
        if ($aname === '' || $aval === '') {
            continue;
        }
        $slug     = $attr_slug_map[$aname] ?? sanitize_title($aname);
        $taxonomy = wc_attribute_taxonomy_name($slug);
        if (!taxonomy_exists($taxonomy)) {
            wc_create_attribute(['name' => $aname, 'slug' => $slug, 'type' => 'select']);
            register_taxonomy($taxonomy, ['product']);
        }
        $vals     = array_map('trim', explode(',', $aval));
        $term_ids = [];
        foreach ($vals as $v) {
            $t = term_exists($v, $taxonomy);
            if (!$t) {
                $t = wp_insert_term($v, $taxonomy);
            }
            if (!is_wp_error($t)) {
                $term_ids[] = (int) (is_array($t) ? $t['term_id'] : $t);
            }
        }
        $attr_obj = new WC_Product_Attribute();
        $attr_obj->set_id(wc_attribute_taxonomy_id_by_name($taxonomy));
        $attr_obj->set_name($taxonomy);
        $attr_obj->set_options($term_ids);
        $attr_obj->set_position($i - 1);
        $attr_obj->set_visible(true);
        $attr_obj->set_variation(false);
        $wc_attrs[] = $attr_obj;
    }

    $product->set_attributes($wc_attrs);
    $product->save();
    $created++;

    if ($created % 100 === 0) {
        echo "Imported {$created} products...\n";
    }
}
fclose($handle);
echo "Import finished: created={$created}, skipped={$skipped}\n";
