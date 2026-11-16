<?php
/**
 * GearForge Ops Admin Dashboard: 2-Layer Installment Review, Serial Number Assignment, Blacklist Management.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Admin_Pages {
    public static function init(): void {
        add_action('admin_menu', [self::class, 'register_menu']);
        add_action('admin_post_gf_manage_blacklist', [self::class, 'handle_blacklist_post']);
    }

    public static function register_menu(): void {
        $cap = GF_RBAC::can_review_installments() ? GF_RBAC::CAP_REVIEW_INSTALLMENTS : GF_RBAC::CAP_ASSIGN_SERIAL;
        add_menu_page(
            'GearForge Ops',
            'GearForge Ops',
            $cap,
            'gearforge-ops',
            [self::class, 'render_ops_page'],
            'dashicons-shield-alt',
            56
        );
    }

    public static function render_ops_page(): void {
        $tab = sanitize_key((string) ($_GET['tab'] ?? (GF_RBAC::can_review_installments() ? 'installments' : 'serials')));
        ?>
        <div class="wrap">
            <h1>GearForge Operations Center (EC312)</h1>
            <?php if (!empty($_GET['gf_error'])): ?>
                <div class="notice notice-error"><p><?php echo esc_html(sanitize_text_field(wp_unslash((string) $_GET['gf_error']))); ?></p></div>
            <?php elseif (!empty($_GET['gf_msg'])): ?>
                <div class="notice notice-success"><p>Thao tác thành công!</p></div>
            <?php endif; ?>

            <h2 class="nav-tab-wrapper">
                <?php if (GF_RBAC::can_review_installments()): ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=gearforge-ops&tab=installments')); ?>" class="nav-tab <?php echo $tab === 'installments' ? 'nav-tab-active' : ''; ?>">Duyệt Trả Góp 2 Lớp</a>
                <?php endif; ?>
                <?php if (GF_RBAC::can_assign_serial()): ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=gearforge-ops&tab=serials')); ?>" class="nav-tab <?php echo $tab === 'serials' ? 'nav-tab-active' : ''; ?>">Gắn Serial Number (S/N)</a>
                <?php endif; ?>
                <?php if (current_user_can(GF_RBAC::CAP_MANAGE_BLACKLIST)): ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=gearforge-ops&tab=blacklist')); ?>" class="nav-tab <?php echo $tab === 'blacklist' ? 'nav-tab-active' : ''; ?>">Danh sách đen Fraud</a>
                <?php endif; ?>
            </h2>

            <?php
            if ($tab === 'installments') {
                GF_RBAC::require_reviewer_or_403();
                self::render_installments_tab();
            } elseif ($tab === 'serials') {
                self::render_serials_tab();
            } elseif ($tab === 'blacklist' && current_user_can(GF_RBAC::CAP_MANAGE_BLACKLIST)) {
                self::render_blacklist_tab();
            }
            ?>
        </div>
        <?php
    }

    private static function render_installments_tab(): void {
        global $wpdb;
        $apps = $wpdb->get_results(
            "SELECT a.*, p.plan_name, p.duration_months
             FROM {$wpdb->prefix}gf_installment_applications a
             LEFT JOIN {$wpdb->prefix}gf_installment_plans p ON a.plan_id = p.plan_id
             ORDER BY a.app_id DESC LIMIT 50",
            ARRAY_A
        );
        ?>
        <h3>Hồ sơ Trả góp Sinh viên (Quy trình 2 Lớp: L1 Giấy tờ → L2 .edu.vn)</h3>
        <table class="widefat striped">
            <thead>
                <tr>
                    <th>ID / Đơn</th>
                    <th>Sinh viên &amp; Email .edu.vn</th>
                    <th>Gói &amp; Thanh toán</th>
                    <th>Hồ sơ AES-256 (Vault)</th>
                    <th>Trạng thái</th>
                    <th>Thao tác duyệt 2 lớp</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($apps)): ?>
                    <tr><td colspan="6">Chưa có hồ sơ trả góp sinh viên nào.</td></tr>
                <?php else: ?>
                    <?php foreach ($apps as $app): ?>
                        <?php
                        $cccd_url = wp_nonce_url(admin_url('admin-ajax.php?action=gf_vault_view_doc&doc=cccd&app_id=' . $app['app_id']), 'gf_vault_view');
                        $card_url = wp_nonce_url(admin_url('admin-ajax.php?action=gf_vault_view_doc&doc=student_card&app_id=' . $app['app_id']), 'gf_vault_view');
                        ?>
                        <tr>
                            <td>#<?php echo esc_html((string) $app['app_id']); ?><br/>Đơn #<?php echo esc_html((string) $app['order_id']); ?></td>
                            <td>MSSV: <strong><?php echo esc_html($app['student_code']); ?></strong><br/><?php echo esc_html($app['student_edu_email']); ?></td>
                            <td><?php echo esc_html((string) $app['plan_name']); ?><br/>Trả trước: <?php echo esc_html(number_format((float) $app['downpayment_amount'], 0, ',', '.')); ?>đ<br/>Góp/th: <?php echo esc_html(number_format((float) $app['monthly_amount'], 0, ',', '.')); ?>đ</td>
                            <td>
                                <a class="button button-small" target="_blank" href="<?php echo esc_url($cccd_url); ?>">Giải mã xem CCCD</a><br/><br/>
                                <a class="button button-small" target="_blank" href="<?php echo esc_url($card_url); ?>">Giải mã xem Thẻ SV</a>
                            </td>
                            <td><code><?php echo esc_html($app['status']); ?></code></td>
                            <td>
                                <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display:flex;flex-direction:column;gap:4px;">
                                    <?php wp_nonce_field('gf_review_installment_action'); ?>
                                    <input type="hidden" name="action" value="gf_review_installment" />
                                    <input type="hidden" name="app_id" value="<?php echo esc_attr((string) $app['app_id']); ?>" />
                                    <?php if ($app['status'] === 'SUBMITTED'): ?>
                                        <button type="submit" name="decision" value="l1" class="button button-primary">Duyệt Lớp 1 (Ảnh CCCD/SV)</button>
                                    <?php elseif ($app['status'] === 'L1_DOCS_VERIFIED'): ?>
                                        <button type="submit" name="decision" value="l2" class="button button-primary">Duyệt Lớp 2 (.edu.vn/SĐT)</button>
                                    <?php endif; ?>
                                    <?php if (in_array($app['status'], ['SUBMITTED', 'L1_DOCS_VERIFIED'], true)): ?>
                                        <input type="text" name="reject_reason" placeholder="Lý do từ chối / Blacklist..." />
                                        <div style="display:flex;gap:4px;">
                                            <button type="submit" name="decision" value="reject" class="button">Từ chối</button>
                                            <button type="submit" name="decision" value="blacklist" class="button button-link-delete">Từ chối + Blacklist</button>
                                        </div>
                                    <?php endif; ?>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
        <?php
    }

    private static function render_serials_tab(): void {
        if (!GF_RBAC::can_assign_serial()) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }
        $orders = function_exists('wc_get_orders') ? wc_get_orders(['limit' => 20, 'orderby' => 'date', 'order' => 'DESC']) : [];
        ?>
        <h3>Gắn Serial Number (S/N) Xuất Kho &amp; Xuất Hóa Đơn PDF</h3>
        <table class="widefat striped">
            <thead>
                <tr><th>Đơn hàng</th><th>Trạng thái</th><th>Sản phẩm cần gắn S/N</th><th>S/N đã gán &amp; Hóa đơn</th></tr>
            </thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                    <tr>
                        <td>#<?php echo esc_html((string) $order->get_id()); ?> (<?php echo esc_html($order->get_formatted_billing_full_name()); ?>)</td>
                        <td><code><?php echo esc_html(GF_Core::map_order_status($order->get_status())); ?></code></td>
                        <td>
                            <?php foreach ($order->get_items() as $item_id => $item): ?>
                                <?php if ($item instanceof WC_Order_Item_Product && GF_Serial_Manager::is_serial_required_product($item->get_product_id())): ?>
                                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-bottom:8px;">
                                        <?php wp_nonce_field('gf_assign_serial_action'); ?>
                                        <input type="hidden" name="action" value="gf_assign_order_serial" />
                                        <input type="hidden" name="order_id" value="<?php echo esc_attr((string) $order->get_id()); ?>" />
                                        <input type="hidden" name="order_item_id" value="<?php echo esc_attr((string) $item_id); ?>" />
                                        <input type="hidden" name="product_id" value="<?php echo esc_attr((string) $item->get_product_id()); ?>" />
                                        <div><strong><?php echo esc_html($item->get_name()); ?></strong> (SL: <?php echo esc_html((string) $item->get_quantity()); ?>)</div>
                                        <input type="text" name="serial_number" placeholder="Nhập S/N (VD: SN-GF-2026-001)" style="min-width:215px;" required />
                                        <input type="number" name="warranty_months" value="24" min="1" max="60" style="width:70px;" /> tháng
                                        <button type="submit" class="button button-primary">Lưu S/N</button>
                                    </form>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </td>
                        <td>
                            <?php foreach (GF_Serial_Manager::get_order_serials($order->get_id()) as $sn): ?>
                                <div><code><?php echo esc_html($sn['serial_number']); ?></code> (BH đến <?php echo esc_html((string) $sn['warranty_end_date']); ?>)</div>
                            <?php endforeach; ?>
                            <a class="button" target="_blank" href="<?php echo esc_url(GF_Invoice_PDF::get_download_url($order->get_id())); ?>" style="margin-top:6px;">Tải Hóa đơn PDF (T-VAN)</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    private static function render_blacklist_tab(): void {
        global $wpdb;
        $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gf_fraud_blacklist ORDER BY blacklist_id DESC LIMIT 50", ARRAY_A);
        ?>
        <h3>Danh sách đen Chống gian lận (wp_gf_fraud_blacklist)</h3>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-bottom:16px;display:flex;gap:8px;align-items:center;">
            <?php wp_nonce_field('gf_blacklist_action'); ?>
            <input type="hidden" name="action" value="gf_manage_blacklist" />
            <input type="hidden" name="op" value="add" />
            <select name="target_type">
                <option value="IP">IP</option>
                <option value="PHONE">PHONE</option>
                <option value="USER">USER</option>
                <option value="CCCD_HASH">CCCD_HASH</option>
            </select>
            <input type="text" name="target_value" placeholder="Giá trị chặn..." required />
            <input type="text" name="reason" placeholder="Lý do..." required />
            <button type="submit" class="button button-primary">Thêm Blacklist</button>
        </form>
        <table class="widefat striped">
            <thead><tr><th>ID</th><th>Loại</th><th>Giá trị</th><th>Lý do</th><th>Thao tác</th></tr></thead>
            <tbody>
                <?php foreach ($rows as $r): ?>
                    <tr>
                        <td><?php echo esc_html((string) $r['blacklist_id']); ?></td>
                        <td><code><?php echo esc_html($r['target_type']); ?></code></td>
                        <td><code><?php echo esc_html($r['target_value']); ?></code></td>
                        <td><?php echo esc_html($r['reason']); ?></td>
                        <td>
                            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                                <?php wp_nonce_field('gf_blacklist_action'); ?>
                                <input type="hidden" name="action" value="gf_manage_blacklist" />
                                <input type="hidden" name="op" value="remove" />
                                <input type="hidden" name="blacklist_id" value="<?php echo esc_attr((string) $r['blacklist_id']); ?>" />
                                <button type="submit" class="button">Gỡ chặn</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    public static function handle_blacklist_post(): void {
        if (!current_user_can(GF_RBAC::CAP_MANAGE_BLACKLIST)) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }
        check_admin_referer('gf_blacklist_action');
        $op = sanitize_key((string) ($_POST['op'] ?? ''));
        if ($op === 'add') {
            GF_Fraud_Guard::add_blacklist_entry(
                (string) ($_POST['target_type'] ?? 'IP'),
                (string) ($_POST['target_value'] ?? ''),
                (string) ($_POST['reason'] ?? ''),
                get_current_user_id()
            );
        } elseif ($op === 'remove') {
            GF_Fraud_Guard::remove_blacklist_entry((int) ($_POST['blacklist_id'] ?? 0));
        }
        wp_safe_redirect(admin_url('admin.php?page=gearforge-ops&tab=blacklist&gf_msg=updated'));
        exit;
    }
}
