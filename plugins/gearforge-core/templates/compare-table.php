<?php
/**
 * Compare Specs Matrix Template (UC-02): compares 2-3 Laptop/PC devices side by side + monthly installment estimate.
 * Available vars: $products (array)
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="gf-compare-wrapper">
    <div class="gf-section-header">
        <div>
            <span class="gf-eyebrow">GearForge Smart Compare</span>
            <h2 class="gf-heading">So sánh cấu hình Laptop / PC trực quan (Tối đa 3 máy)</h2>
        </div>
        <?php if (!empty($products)): ?>
            <button type="button" id="gf-compare-reset" class="gf-btn gf-btn-ghost">Xóa tất cả</button>
        <?php endif; ?>
    </div>

    <?php if (empty($products)): ?>
        <div class="gf-empty-state">
            <p>Bạn chưa chọn máy nào vào khay so sánh. Hãy vào trang <a href="<?php echo esc_url(home_url('/shop/')); ?>">Cửa hàng GearForge</a> và bấm nút <strong>So sánh</strong> trên tối đa 3 mẫu Laptop hoặc PC.</p>
        </div>
    <?php else: ?>
        <div class="gf-compare-scroll">
            <table class="gf-compare-table">
                <thead>
                    <tr>
                        <th class="gf-spec-col">Thông số đối chiếu</th>
                        <?php foreach ($products as $p): ?>
                            <th class="gf-device-col">
                                <button type="button" class="gf-remove-compare" data-product-id="<?php echo esc_attr((string) $p['id']); ?>" title="Xóa khỏi bảng">&times;</button>
                                <a href="<?php echo esc_url($p['url']); ?>" class="gf-compare-thumb">
                                    <img src="<?php echo esc_url($p['image']); ?>" alt="<?php echo esc_attr($p['name']); ?>" />
                                </a>
                                <a href="<?php echo esc_url($p['url']); ?>" class="gf-compare-name"><?php echo esc_html($p['name']); ?></a>
                                <div class="gf-compare-price"><?php echo esc_html($p['price_fmt']); ?></div>
                                <div class="gf-compare-stock"><?php echo esc_html($p['stock_status']); ?></div>
                            </th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <tr class="gf-row-highlight">
                        <td><strong>Trả góp SV 0% (3 tháng, trả trước 20%)</strong></td>
                        <?php foreach ($products as $p): ?>
                            <td><span class="gf-pill-installment"><?php echo esc_html($p['monthly_3m']); ?></span></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr class="gf-row-highlight">
                        <td><strong>Trả góp SV linh hoạt (6 tháng, trả trước 20%)</strong></td>
                        <?php foreach ($products as $p): ?>
                            <td><strong><?php echo esc_html($p['monthly_6m']); ?></strong></td>
                        <?php endforeach; ?>
                    </tr>
                    <?php
                    $spec_keys = array_keys($products[0]['specs']);
                    foreach ($spec_keys as $label):
                        $vals   = array_map(static fn(array $p): string => (string) ($p['specs'][$label] ?? ''), $products);
                        $diff   = count(array_unique($vals)) > 1;
                    ?>
                        <tr class="<?php echo $diff ? 'gf-spec-diff' : ''; ?>">
                            <td><strong><?php echo esc_html($label); ?></strong></td>
                            <?php foreach ($products as $p): ?>
                                <td><?php echo esc_html((string) ($p['specs'][$label] ?? 'Đang cập nhật')); ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                    <tr>
                        <td><strong>Hành động</strong></td>
                        <?php foreach ($products as $p): ?>
                            <td>
                                <?php $cart_base = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/'); ?>
                                <a href="<?php echo esc_url($p['url']); ?>#gf-installment-widget" class="gf-btn gf-btn-primary gf-btn-sm">Tính trả góp SV</a>
                                <a href="<?php echo esc_url(add_query_arg('add-to-cart', $p['id'], $cart_base)); ?>" class="gf-btn gf-btn-secondary gf-btn-sm">Mua ngay</a>
                            </td>
                        <?php endforeach; ?>
                    </tr>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>
