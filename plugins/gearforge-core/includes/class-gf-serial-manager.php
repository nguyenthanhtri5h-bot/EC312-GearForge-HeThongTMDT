<?php
/**
 * Serial Number (S/N) & Warehouse Dispatch Guard (UC-12 / FR-10).
 *
 * Registers custom WooCommerce statuses (SERIAL_ASSIGNED / SHIPPING),
 * provides an Admin Meta Box to bind unique Serial Numbers per order item,
 * and blocks transition to SHIPPING/COMPLETED if any Laptop/PC lacks an S/N (TC-15).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Serial_Manager {

    private static bool $is_reverting = false;

    public static function init(): void {
        add_action('init', [self::class, 'register_custom_order_statuses']);
        add_filter('wc_order_statuses', [self::class, 'append_custom_order_statuses']);
        add_action('add_meta_boxes', [self::class, 'register_serial_metabox']);
        add_action('admin_post_gf_assign_serial', [self::class, 'handle_assign_serial_form']);
        add_action('woocommerce_order_status_changed', [self::class, 'enforce_serial_before_shipping'], 10, 4);
        add_action('admin_notices', [self::class, 'render_serial_guard_notice']);
    }

    public static function register_custom_order_statuses(): void {
        register_post_status('wc-gf-serial', [
            'label'                     => 'Đã gắn S/N (SERIAL_ASSIGNED)',
            'public'                    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Đã gắn S/N (%s)', 'Đã gắn S/N (%s)'),
        ]);

        register_post_status('wc-gf-shipping', [
            'label'                     => 'Đang giao hàng (SHIPPING)',
            'public'                    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Đang giao (%s)', 'Đang giao (%s)'),
        ]);
    }

    public static function append_custom_order_statuses(array $statuses): array {
        $statuses['wc-gf-serial']   = 'Đã gắn S/N (SERIAL_ASSIGNED)';
        $statuses['wc-gf-shipping'] = 'Đang giao hàng (SHIPPING)';
        return $statuses;
    }

    /**
     * Assign a unique Serial Number to an order item inside wp_gf_order_serials.
     *
     * @return int|WP_Error Serial record ID on success.
     */
    public static function assign_serial(int $order_id, int $order_item_id, int $product_id, string $serial_number, int $assigned_by, int $warranty_months = 12) {
        global $wpdb;

        $clean_serial = strtoupper(sanitize_text_field($serial_number));
        if ($clean_serial === '') {
            return new WP_Error('gf_empty_serial', 'Mã Serial Number không được để trống.');
        }

        $table = "{$wpdb->prefix}gf_order_serials";
        $exists = $wpdb->get_var(
            $wpdb->prepare("SELECT serial_id FROM {$table} WHERE serial_number = %s LIMIT 1", $clean_serial)
        );
        if ($exists) {
            return new WP_Error('gf_duplicate_serial', 'Mã Serial Number này đã tồn tại trên hệ thống.');
        }

        $warranty_end = gmdate('Y-m-d', strtotime("+{$warranty_months} months"));
        $inserted     = $wpdb->insert(
            $table,
            [
                'order_id'          => $order_id,
                'order_item_id'     => $order_item_id,
                'product_id'        => $product_id,
                'serial_number'     => $clean_serial,
                'warranty_months'   => $warranty_months,
                'warranty_end_date' => $warranty_end,
                'assigned_by'       => $assigned_by,
            ],
            ['%d', '%d', '%d', '%s', '%d', '%s', '%d']
        );

        if ($inserted === false) {
            return new WP_Error('gf_serial_insert_failed', 'Không thể lưu Serial Number vào CSDL.');
        }

        $serial_id = (int) $wpdb->insert_id;

        if (function_exists('wc_get_order')) {
            $order = wc_get_order($order_id);
            if ($order) {
                $order->add_order_note(sprintf('Đã gắn Serial Number [%s] cho sản phẩm #%d.', $clean_serial, $product_id));
                if (self::has_all_required_serials($order) && $order->get_status() === 'processing') {
                    $order->update_status('gf-serial', 'Đã gắn đủ Serial Number xuất kho.');
                }
            }
        }

        return $serial_id;
    }

    /**
     * Hook: Block transitioning an order to SHIPPING or COMPLETED if any Laptop/PC lacks S/N (TC-15).
     */
    public static function enforce_serial_before_shipping(int $order_id, string $old_status, string $new_status, $order): void {
        if (self::$is_reverting) {
            return;
        }

        $protected_targets = ['gf-shipping', 'shipping', 'completed'];
        if (!in_array($new_status, $protected_targets, true)) {
            return;
        }

        if (!$order || self::has_all_required_serials($order)) {
            return;
        }

        self::$is_reverting = true;
        $order->update_status(
            $old_status,
            '[CHẶN XUẤT KHO] Đơn hàng Laptop/PC chưa được gắn đủ Serial Number (S/N) vào wp_gf_order_serials.'
        );
        self::$is_reverting = false;

        set_transient(
            'gf_serial_guard_error_' . get_current_user_id(),
            sprintf('Không thể chuyển đơn hàng #%d sang trạng thái %s vì chưa gắn đủ Serial Number (S/N)!', $order_id, strtoupper($new_status)),
            60
        );
    }

    /**
     * Check whether all Laptop/PC items (or physical products) in an order have matching S/N records.
     */
    public static function has_all_required_serials($order): bool {
        global $wpdb;

        $table = "{$wpdb->prefix}gf_order_serials";
        foreach ($order->get_items() as $item_id => $item) {
            $product_id = (int) $item->get_product_id();
            $qty        = max(1, (int) $item->get_quantity());

            if (!self::requires_serial_number($product_id)) {
                continue;
            }

            $assigned_count = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$table} WHERE order_id = %d AND order_item_id = %d",
                    $order->get_id(),
                    $item_id
                )
            );

            if ($assigned_count < $qty) {
                return false;
            }
        }

        return true;
    }

    public static function get_order_serials(int $order_id): array {
        global $wpdb;
        return $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d ORDER BY serial_id ASC", $order_id),
            ARRAY_A
        ) ?: [];
    }

    public static function register_serial_metabox(): void {
        foreach (['shop_order', 'woocommerce_page_wc-orders'] as $screen) {
            add_meta_box(
                'gf_serial_metabox',
                'GearForge: Gán Serial Number (S/N) & Hóa đơn PDF T-VAN',
                [self::class, 'render_serial_metabox'],
                $screen,
                'normal',
                'high'
            );
        }
    }

    public static function render_serial_metabox($post_or_order): void {
        $order = is_a($post_or_order, 'WC_Order') ? $post_or_order : wc_get_order($post_or_order->ID);
        if (!$order) {
            return;
        }

        $order_id = $order->get_id();
        $serials  = self::get_order_serials($order_id);
        $pdf_url  = wp_nonce_url(admin_url("admin-post.php?action=gf_download_invoice_pdf&order_id={$order_id}"), "gf_pdf_{$order_id}");

        echo '<p><strong>Danh sách Serial Number đã gắn:</strong></p>';
        if (empty($serials)) {
            echo '<p style="color:#d9534f;">Chưa có mã S/N nào được gắn cho đơn hàng này.</p>';
        } else {
            echo '<ul>';
            foreach ($serials as $s) {
                echo '<li><code>' . esc_html($s['serial_number']) . '</code> (BH đến: ' . esc_html($s['warranty_end_date']) . ')</li>';
            }
            echo '</ul>';
        }

        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:flex;gap:8px;align-items:center;margin-top:8px;">';
        echo '<input type="hidden" name="action" value="gf_assign_serial" />';
        echo '<input type="hidden" name="order_id" value="' . $order_id . '" />';
        wp_nonce_field('gf_assign_serial_' . $order_id);
        echo '<select name="order_item_id">';
        foreach ($order->get_items() as $item_id => $item) {
            echo '<option value="' . (int) $item_id . '">' . esc_html($item->get_name()) . '</option>';
        }
        echo '</select>';
        echo '<input type="text" name="serial_number" placeholder="Nhập S/N (VD: SN-GF-2026-001)" required />';
        echo '<button type="submit" class="button button-primary">Gắn S/N</button>';
        echo '<a class="button" href="' . esc_url($pdf_url) . '" target="_blank">Xuất Hóa đơn PDF (T-VAN)</a>';
        echo '</form>';
    }

    public static function handle_assign_serial_form(): void {
        if (!current_user_can('manage_woocommerce')) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }

        $order_id = (int) ($_POST['order_id'] ?? 0);
        check_admin_referer('gf_assign_serial_' . $order_id);

        $item_id = (int) ($_POST['order_item_id'] ?? 0);
        $serial  = sanitize_text_field($_POST['serial_number'] ?? '');
        $order   = wc_get_order($order_id);
        $item    = $order ? $order->get_item($item_id) : null;

        if ($item) {
            $res = self::assign_serial($order_id, $item_id, (int) $item->get_product_id(), $serial, get_current_user_id());
            if (is_wp_error($res)) {
                set_transient('gf_serial_guard_error_' . get_current_user_id(), $res->get_error_message(), 60);
            }
        }

        wp_safe_redirect(wp_get_referer() ?: admin_url('edit.php?post_type=shop_order'));
        exit;
    }

    public static function render_serial_guard_notice(): void {
        $key = 'gf_serial_guard_error_' . get_current_user_id();
        $msg = get_transient($key);
        if ($msg) {
            delete_transient($key);
            echo '<div class="notice notice-error is-dismissible"><p><strong>GearForge S/N Guard:</strong> ' . esc_html($msg) . '</p></div>';
        }
    }

    private static function requires_serial_number(int $product_id): bool {
        if ($product_id <= 0) {
            return true;
        }
        $terms = get_the_terms($product_id, 'product_cat');
        if (empty($terms) || is_wp_error($terms)) {
            return true;
        }
        foreach ($terms as $term) {
            $slug = strtolower($term->slug);
            if (strpos($slug, 'phu-kien') !== false || strpos($slug, 'accessory') !== false) {
                return false;
            }
        }
        return true;
    }
}

GF_Serial_Manager::init();
