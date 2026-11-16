<?php
/**
 * Serial Number (S/N) Manager & Mandatory Shipping Guard (UC-12, UC-09 Warranty RMA).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Serial_Manager {
    private static bool $reverting_status = false;

    public static function init(): void {
        add_action('add_meta_boxes', [self::class, 'add_order_serial_metabox']);
        add_action('admin_post_gf_assign_order_serial', [self::class, 'handle_assign_serial_post']);
        add_action('woocommerce_order_status_changed', [self::class, 'enforce_serial_before_shipping'], 10, 4);
        add_action('admin_notices', [self::class, 'render_admin_serial_error_notice']);
    }

    public static function is_serial_required_product(int $product_id): bool {
        $terms = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'slugs']);
        if (!is_array($terms)) {
            return false;
        }
        foreach ($terms as $slug) {
            if (str_contains($slug, 'laptop') || str_contains($slug, 'pc')) {
                return true;
            }
        }
        return false;
    }

    public static function get_order_serials(int $order_id): array {
        global $wpdb;
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d ORDER BY serial_id ASC",
                $order_id
            ),
            ARRAY_A
        );
        return is_array($rows) ? $rows : [];
    }

    public static function get_missing_serial_items(WC_Order $order): array {
        global $wpdb;
        $table   = "{$wpdb->prefix}gf_order_serials";
        $missing = [];

        foreach ($order->get_items() as $item_id => $item) {
            if (!$item instanceof WC_Order_Item_Product) {
                continue;
            }
            $product_id = $item->get_product_id();
            if (!self::is_serial_required_product($product_id)) {
                continue;
            }
            $qty = max(1, (int) $item->get_quantity());
            $assigned_count = (int) $wpdb->get_var(
                $wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE order_id = %d AND order_item_id = %d", $order->get_id(), $item_id)
            );
            if ($assigned_count < $qty) {
                $missing[] = [
                    'order_item_id' => $item_id,
                    'product_id'    => $product_id,
                    'name'          => $item->get_name(),
                    'required_qty'  => $qty,
                    'assigned_qty'  => $assigned_count,
                ];
            }
        }
        return $missing;
    }

    /**
     * Blocks shipping/completed transition when Laptop/PC items lack assigned S/N (TC-15).
     */
    public static function enforce_serial_before_shipping(int $order_id, string $from_status, string $to_status, WC_Order $order): void {
        if (self::$reverting_status) {
            return;
        }
        $guarded_targets = ['gf-shipping', 'shipping', 'gf-delivered', 'completed'];
        if (!in_array($to_status, $guarded_targets, true)) {
            return;
        }

        $missing = self::get_missing_serial_items($order);
        if (empty($missing)) {
            return;
        }

        $names = implode(', ', array_map(static fn(array $m): string => $m['name'], $missing));
        $err   = sprintf(
            'CHẶN XUẤT KHO: Đơn #%d chưa gắn đủ Serial Number (S/N) cho thiết bị [%s]. Vui lòng nhập S/N trước khi chuyển sang trạng thái %s.',
            $order_id,
            $names,
            strtoupper($to_status)
        );

        self::$reverting_status = true;
        $order->set_status($from_status, $err);
        $order->save();
        self::$reverting_status = false;

        set_transient('gf_serial_guard_error_' . get_current_user_id(), $err, 60);
    }

    public static function render_admin_serial_error_notice(): void {
        $key = 'gf_serial_guard_error_' . get_current_user_id();
        $msg = get_transient($key);
        if ($msg) {
            delete_transient($key);
            echo '<div class="notice notice-error is-dismissible"><p><strong>' . esc_html((string) $msg) . '</strong></p></div>';
        }
    }

    public static function assign_serial(int $order_id, int $order_item_id, int $product_id, string $serial_number, int $warranty_months, int $assigned_by): true|WP_Error {
        if (!GF_RBAC::can_assign_serial($assigned_by)) {
            return new WP_Error('gf_forbidden', 'Không đủ quyền gắn Serial Number.', ['status' => 403]);
        }
        $serial_number = strtoupper(sanitize_text_field(trim($serial_number)));
        if ($serial_number === '') {
            return new WP_Error('gf_empty_sn', 'Serial Number không được để trống.', ['status' => 400]);
        }

        global $wpdb;
        $table = "{$wpdb->prefix}gf_order_serials";
        $dup   = $wpdb->get_var($wpdb->prepare("SELECT serial_id FROM {$table} WHERE serial_number = %s", $serial_number));
        if ($dup) {
            return new WP_Error('gf_dup_sn', 'Mã Serial Number này đã tồn tại trên hệ thống (chống trùng/tráo máy).', ['status' => 409]);
        }

        $warranty_months = max(1, $warranty_months);
        $end_date = gmdate('Y-m-d', strtotime("+{$warranty_months} months"));

        $ok = $wpdb->insert(
            $table,
            [
                'order_id'          => $order_id,
                'order_item_id'     => $order_item_id,
                'product_id'        => $product_id,
                'serial_number'     => $serial_number,
                'warranty_months'   => $warranty_months,
                'warranty_end_date' => $end_date,
                'assigned_by'       => $assigned_by,
            ],
            ['%d', '%d', '%d', '%s', '%d', '%s', '%d']
        );
        if (!$ok) {
            return new WP_Error('gf_sn_insert_fail', 'Không thể lưu Serial Number vào CSDL.', ['status' => 500]);
        }

        $order = wc_get_order($order_id);
        if ($order) {
            $order->add_order_note(sprintf('Đã gắn S/N [%s] cho sản phẩm #%d (BH %d tháng đến %s).', $serial_number, $product_id, $warranty_months, $end_date));
            if ($order->get_status() === 'processing' && empty(self::get_missing_serial_items($order))) {
                $order->update_status('wc-gf-serial-ready', 'Đã gắn đủ S/N xuất kho (SERIAL_ASSIGNED).');
            }
        }
        return true;
    }

    public static function add_order_serial_metabox(): void {
        $screens = ['shop_order', 'woocommerce_page_wc-orders'];
        foreach ($screens as $screen) {
            add_meta_box(
                'gf_order_serial_box',
                'GearForge Serial Number (S/N) & Hóa đơn T-VAN',
                [self::class, 'render_order_serial_metabox'],
                $screen,
                'normal',
                'high'
            );
        }
    }

    public static function render_order_serial_metabox($post_or_order): void {
        $order = $post_or_order instanceof WC_Order ? $post_or_order : wc_get_order($post_or_order->ID ?? 0);
        if (!$order) {
            return;
        }
        $serials = self::get_order_serials($order->get_id());
        $missing = self::get_missing_serial_items($order);
        ?>
        <div>
            <p><strong>Trạng thái S/N:</strong> <?php echo empty($missing) ? '<span style="color:green;">Đã đủ S/N xuất kho</span>' : '<span style="color:#b91c1c;">Thiếu S/N Laptop/PC (Bị chặn chuyển SHIPPING)</span>'; ?></p>
            <?php if (!empty($serials)): ?>
                <ul>
                    <?php foreach ($serials as $s): ?>
                        <li>Item #<?php echo esc_html((string) $s['order_item_id']); ?> — <code><?php echo esc_html($s['serial_number']); ?></code> (Hạn BH: <?php echo esc_html((string) $s['warranty_end_date']); ?>)</li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
            <p><a class="button" href="<?php echo esc_url(admin_url('admin.php?page=gearforge-ops&tab=serials&order_id=' . $order->get_id())); ?>">Quản lý gắn S/N trong GearForge Ops</a>
               <a class="button button-primary" target="_blank" href="<?php echo esc_url(GF_Invoice_PDF::get_download_url($order->get_id())); ?>">Xuất Hóa đơn PDF (T-VAN)</a></p>
        </div>
        <?php
    }

    public static function handle_assign_serial_post(): void {
        if (!GF_RBAC::can_assign_serial()) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }
        check_admin_referer('gf_assign_serial_action');

        $order_id        = (int) ($_POST['order_id'] ?? 0);
        $order_item_id   = (int) ($_POST['order_item_id'] ?? 0);
        $product_id      = (int) ($_POST['product_id'] ?? 0);
        $serial_number   = (string) ($_POST['serial_number'] ?? '');
        $warranty_months = (int) ($_POST['warranty_months'] ?? 12);

        $res = self::assign_serial($order_id, $order_item_id, $product_id, $serial_number, $warranty_months, get_current_user_id());
        $arg = is_wp_error($res) ? 'gf_error=' . rawurlencode($res->get_error_message()) : 'gf_msg=sn_assigned';
        wp_safe_redirect(admin_url('admin.php?page=gearforge-ops&tab=serials&' . $arg));
        exit;
    }

    public static function rest_request_warranty(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $order_id = (int) $request->get_param('order_id');
        $sn       = strtoupper(sanitize_text_field((string) $request->get_param('serial_number')));
        $reason   = sanitize_textarea_field((string) $request->get_param('reason'));

        $order = wc_get_order($order_id);
        if (!$order || (int) $order->get_customer_id() !== get_current_user_id()) {
            return new WP_REST_Response(['error' => 'Đơn hàng không thuộc về bạn.'], 403);
        }

        $match = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d AND serial_number = %s LIMIT 1",
                $order_id,
                $sn
            ),
            ARRAY_A
        );
        if (!$match) {
            return new WP_REST_Response(['error' => 'Mã Serial Number không khớp với đơn hàng này (Từ chối bảo hành).'], 400);
        }

        $order->add_order_note(sprintf('Yêu cầu Bảo hành/Đổi trả (UC-09) cho S/N [%s]: %s', $sn, $reason));
        $order->update_meta_data('_gf_rma_last_request', wp_json_encode([
            'serial_number' => $sn,
            'reason'        => $reason,
            'requested_at'  => current_time('mysql'),
        ], JSON_UNESCAPED_UNICODE));
        $order->save();

        return new WP_REST_Response([
            'message'           => 'Đã tiếp nhận yêu cầu bảo hành/đổi trả đối chiếu khớp Serial Number!',
            'serial_number'     => $sn,
            'warranty_end_date' => $match['warranty_end_date'],
        ], 200);
    }
}
