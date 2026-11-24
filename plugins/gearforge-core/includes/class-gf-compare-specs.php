<?php
/**
 * Compare Specs Service (UC-02): limits 2-3 same-category devices, renders spec matrix + monthly installment preview.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Compare_Specs {
    private const COOKIE_NAME = 'gf_compare_ids';
    private const MAX_ITEMS   = 3;

    public static function init(): void {
        add_action('wp_ajax_gf_compare_action', [self::class, 'ajax_compare_action']);
        add_action('wp_ajax_nopriv_gf_compare_action', [self::class, 'ajax_compare_action']);
        add_action('wp_footer', [self::class, 'render_floating_tray']);
    }

    public static function get_session_ids(): array {
        if (!empty($_GET['ids'])) {
            $raw = array_map('intval', explode(',', sanitize_text_field((string) $_GET['ids'])));
            return array_values(array_unique(array_filter($raw)));
        }
        $cookie = sanitize_text_field((string) ($_COOKIE[self::COOKIE_NAME] ?? ''));
        if ($cookie === '') {
            return [];
        }
        $ids = array_map('intval', explode(',', $cookie));
        return array_slice(array_values(array_unique(array_filter($ids))), 0, self::MAX_ITEMS);
    }

    private static function save_session_ids(array $ids): void {
        $ids = array_slice(array_values(array_unique(array_filter(array_map('intval', $ids)))), 0, self::MAX_ITEMS);
        $val = implode(',', $ids);
        $_COOKIE[self::COOKIE_NAME] = $val;
        if (!headers_sent()) {
            setcookie(self::COOKIE_NAME, $val, time() + DAY_IN_SECONDS, COOKIEPATH ?: '/', COOKIE_DOMAIN, is_ssl(), false);
        }
    }

    public static function get_device_group(int $product_id): string {
        $terms = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'slugs']);
        if (!is_array($terms)) {
            return 'other';
        }
        foreach ($terms as $slug) {
            if (str_contains($slug, 'laptop')) {
                return 'laptop';
            }
            if (str_contains($slug, 'pc')) {
                return 'pc';
            }
        }
        return 'accessory';
    }

    public static function ajax_compare_action(): void {
        check_ajax_referer('gf_frontend_nonce', 'nonce');

        $mode       = sanitize_key((string) ($_POST['mode'] ?? 'list'));
        $product_id = (int) ($_POST['product_id'] ?? 0);
        $ids        = self::get_session_ids();

        if ($mode === 'add' && $product_id > 0) {
            if (!in_array($product_id, $ids, true)) {
                if (count($ids) >= self::MAX_ITEMS) {
                    wp_send_json_error([
                        'message' => 'Khay so sánh tối đa 3 sản phẩm. Vui lòng xóa bớt 1 máy trước khi thêm.',
                        'ids'     => $ids,
                    ], 400);
                }
                if (!empty($ids)) {
                    $base_group = self::get_device_group($ids[0]);
                    $new_group  = self::get_device_group($product_id);
                    if ($base_group !== $new_group) {
                        wp_send_json_error([
                            'message' => 'Chỉ có thể so sánh các thiết bị cùng nhóm (Laptop với Laptop, PC với PC).',
                            'ids'     => $ids,
                        ], 400);
                    }
                }
                $ids[] = $product_id;
                self::save_session_ids($ids);
            }
        } elseif ($mode === 'remove' && $product_id > 0) {
            $ids = array_values(array_filter($ids, static fn(int $id): bool => $id !== $product_id));
            self::save_session_ids($ids);
        } elseif ($mode === 'clear') {
            $ids = [];
            self::save_session_ids($ids);
        }

        $items = [];
        foreach ($ids as $id) {
            $p = function_exists('wc_get_product') ? wc_get_product($id) : null;
            if ($p) {
                $items[] = [
                    'id'    => $id,
                    'name'  => $p->get_name(),
                    'price' => number_format((float) $p->get_price(), 0, ',', '.') . 'đ',
                    'image' => wp_get_attachment_image_url($p->get_image_id(), 'thumbnail') ?: wc_placeholder_img_src(),
                ];
            }
        }

        wp_send_json_success(['ids' => $ids, 'items' => $items]);
    }

    public static function get_comparison_rows(array $product_ids): array {
        $products = [];
        foreach (array_slice($product_ids, 0, self::MAX_ITEMS) as $pid) {
            $product = function_exists('wc_get_product') ? wc_get_product($pid) : null;
            if (!$product) {
                continue;
            }
            $price   = (float) $product->get_price();
            $calc_6m = $price > 0 ? GF_Installment_Calc::calculate($price, 20, 6) : null;
            $calc_3m = $price > 0 ? GF_Installment_Calc::calculate($price, 20, 3) : null;
            $m3_amt  = (is_array($calc_3m) && isset($calc_3m['monthly_amount'])) ? (int) $calc_3m['monthly_amount'] : 0;
            $m6_amt  = (is_array($calc_6m) && isset($calc_6m['monthly_amount'])) ? (int) $calc_6m['monthly_amount'] : 0;

            $products[] = [
                'id'           => $pid,
                'name'         => $product->get_name(),
                'sku'          => $product->get_sku(),
                'url'          => get_permalink($pid),
                'image'        => wp_get_attachment_image_url($product->get_image_id(), 'medium') ?: wc_placeholder_img_src(),
                'price_raw'    => $price,
                'price_fmt'    => number_format($price, 0, ',', '.') . 'đ',
                'monthly_3m'   => number_format($m3_amt, 0, ',', '.') . 'đ/tháng (0%)',
                'monthly_6m'   => number_format($m6_amt, 0, ',', '.') . 'đ/tháng',
                'stock_status' => $product->is_in_stock() ? 'Còn hàng' : 'Hết hàng',
                'specs'        => [
                    'Nhu cầu'    => self::attr($product, 'pa_nhu-cau', 'Nhu cầu'),
                    'CPU'        => self::attr($product, 'pa_cpu', 'CPU'),
                    'RAM'        => self::attr($product, 'pa_ram', 'RAM'),
                    'GPU'        => self::attr($product, 'pa_gpu', 'GPU'),
                    'Ổ cứng'     => self::attr($product, 'pa_o-cung', 'Ổ cứng'),
                    'Màn hình'   => self::attr($product, 'pa_man-hinh', 'Màn hình'),
                    'Trọng lượng'=> self::attr($product, 'pa_trong-luong', 'Trọng lượng'),
                    'Bảo hành'   => self::attr($product, 'pa_bao-hanh', 'Bảo hành') ?: '12 tháng chính hãng',
                ],
            ];
        }
        return $products;
    }

    private static function attr(WC_Product $product, string $slug, string $label): string {
        $val = $product->get_attribute($slug);
        if ($val === '') {
            $val = $product->get_attribute($label);
        }
        return $val !== '' ? $val : 'Đang cập nhật';
    }

    public static function render_shortcode(): string {
        $ids      = self::get_session_ids();
        $products = self::get_comparison_rows($ids);
        ob_start();
        include GF_CORE_PATH . 'templates/compare-table.php';
        return (string) ob_get_clean();
    }

    public static function render_floating_tray(): void {
        if (is_admin() || is_page('so-sanh-cau-hinh')) {
            return;
        }
        ?>
        <div id="gf-compare-tray" class="gf-compare-tray" style="display:none;">
            <div class="gf-compare-tray-inner">
                <div class="gf-tray-title">So sánh cấu hình (<span id="gf-tray-count">0</span>/3)</div>
                <div id="gf-tray-items" class="gf-tray-items"></div>
                <div class="gf-tray-actions">
                    <a href="<?php echo esc_url(home_url('/so-sanh-cau-hinh/')); ?>" class="gf-btn gf-btn-primary">So sánh ngay</a>
                    <button type="button" id="gf-tray-clear" class="gf-btn gf-btn-ghost">Xóa hết</button>
                </div>
            </div>
        </div>
        <?php
    }
}
