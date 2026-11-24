<?php
/**
 * Compare Specs Matrix Template (UC-02): compares up to 3 Laptop/PC devices side by side
 * with diff-only toggle and monthly installment summary.
 * Available vars: $products (array)
 */

if (!defined('ABSPATH')) {
    exit;
}

$products   = isset($products) && is_array($products) ? $products : [];
$shop_url   = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/shop/');
$cart_base  = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/');
$spec_keys  = (!empty($products[0]['specs']) && is_array($products[0]['specs'])) ? array_keys($products[0]['specs']) : [];
?>
<div class="gf-compare-wrapper">
    <div class="gf-section-header">
        <div>
            <h2 class="gf-heading">So sánh cấu hình chi tiết (Tối đa 3 thiết bị)</h2>
            <p class="gf-subheading">Đối chiếu trực tiếp CPU, RAM, GPU, màn hình và ước tính trả góp 0% cho sinh viên.</p>
        </div>
        <?php if (!empty($products)): ?>
            <div class="gf-compare-toolbar">
                <label class="gf-toggle-pill" for="gf-diff-only-toggle">
                    <input type="checkbox" id="gf-diff-only-toggle" />
                    <span>Chỉ hiện điểm khác biệt</span>
                </label>
                <button type="button" id="gf-compare-reset" class="gf-btn gf-btn-ghost gf-btn-sm">Xóa tất cả</button>
            </div>
        <?php endif; ?>
    </div>

    <?php if (empty($products)): ?>
        <div class="gf-empty-state">
            <p>Khay so sánh đang trống. Vào <a href="<?php echo esc_url($shop_url ?: home_url('/shop/')); ?>">Cửa hàng GearForge</a> và chọn <strong>So sánh</strong> trên tối đa 3 mẫu Laptop hoặc PC cùng nhóm.</p>
            <a href="<?php echo esc_url($shop_url ?: home_url('/shop/')); ?>" class="gf-btn gf-btn-primary gf-btn-sm">Khám phá sản phẩm</a>
        </div>
    <?php else: ?>
        <div class="gf-compare-scroll" role="region" aria-label="Bảng so sánh cấu hình chi tiết" tabindex="0">
            <table class="gf-compare-table">
                <thead>
                    <tr>
                        <th scope="col" class="gf-spec-col">Thông số đối chiếu</th>
                        <?php foreach ($products as $p): ?>
                            <?php
                            $p_id       = (int) ($p['id'] ?? 0);
                            $p_url      = (string) ($p['url'] ?? '#');
                            $p_image    = (string) ($p['image'] ?? '');
                            if (
                                $p_id > 0
                                && function_exists('gf_resolve_studio_image_url')
                                && function_exists('wc_get_product')
                                && ($p_image === '' || str_ends_with($p_image, 'laptop-ultrabook.jpg') || str_contains($p_image, 'woocommerce-placeholder'))
                            ) {
                                $wc_prod = wc_get_product($p_id);
                                if ($wc_prod instanceof WC_Product) {
                                    $p_image = gf_resolve_studio_image_url($wc_prod);
                                }
                            }
                            $p_name     = (string) ($p['name'] ?? '');
                            $p_price    = (string) ($p['price_fmt'] ?? '');
                            $p_stock    = (string) ($p['stock_status'] ?? '');
                            $in_stock   = stripos($p_stock, 'hết') === false;
                            ?>
                            <th scope="col" class="gf-device-col">
                                <button
                                    type="button"
                                    class="gf-remove-compare"
                                    data-product-id="<?php echo esc_attr((string) $p_id); ?>"
                                    aria-label="<?php echo esc_attr(sprintf('Xóa %s khỏi bảng so sánh', $p_name)); ?>"
                                    title="Xóa khỏi bảng"
                                >&times;</button>
                                <a href="<?php echo esc_url($p_url); ?>" class="gf-compare-thumb">
                                    <img src="<?php echo esc_url($p_image); ?>" alt="<?php echo esc_attr($p_name); ?>" decoding="async" />
                                </a>
                                <a href="<?php echo esc_url($p_url); ?>" class="gf-compare-name"><?php echo esc_html($p_name); ?></a>
                                <div class="gf-compare-price"><?php echo esc_html($p_price); ?></div>
                                <div class="gf-compare-stock <?php echo $in_stock ? 'is-in-stock' : 'is-out-of-stock'; ?>">
                                    <?php echo esc_html($p_stock); ?>
                                </div>
                            </th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <tr class="gf-row-highlight">
                        <td><strong>Trả góp SV 0% (3 tháng, trả trước 20%)</strong></td>
                        <?php foreach ($products as $p): ?>
                            <td><span class="gf-pill-installment"><?php echo esc_html((string) ($p['monthly_3m'] ?? '')); ?></span></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr class="gf-row-highlight">
                        <td><strong>Trả góp linh hoạt (6 tháng, trả trước 20%)</strong></td>
                        <?php foreach ($products as $p): ?>
                            <td><strong class="gf-mono"><?php echo esc_html((string) ($p['monthly_6m'] ?? '')); ?></strong></td>
                        <?php endforeach; ?>
                    </tr>
                    <?php
                    foreach ($spec_keys as $label):
                        $vals = array_map(static fn(array $p): string => (string) ($p['specs'][$label] ?? ''), $products);
                        $diff = count(array_unique($vals)) > 1;
                    ?>
                        <tr class="<?php echo $diff ? 'gf-spec-diff' : 'gf-spec-same'; ?>">
                            <td><strong><?php echo esc_html((string) $label); ?></strong></td>
                            <?php foreach ($products as $p): ?>
                                <td><?php echo esc_html((string) ($p['specs'][$label] ?? 'Đang cập nhật')); ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                    <tr>
                        <td><strong>Thao tác nhanh</strong></td>
                        <?php foreach ($products as $p): ?>
                            <?php
                            $p_id  = (int) ($p['id'] ?? 0);
                            $p_url = (string) ($p['url'] ?? '#');
                            ?>
                            <td>
                                <div class="gf-compare-actions">
                                    <a href="<?php echo esc_url($p_url); ?>#gf-installment-widget" class="gf-btn gf-btn-primary gf-btn-sm">Tính trả góp</a>
                                    <a href="<?php echo esc_url(add_query_arg('add-to-cart', $p_id, $cart_base)); ?>" class="gf-btn gf-btn-ghost gf-btn-sm">Mua ngay</a>
                                </div>
                            </td>
                        <?php endforeach; ?>
                    </tr>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>
