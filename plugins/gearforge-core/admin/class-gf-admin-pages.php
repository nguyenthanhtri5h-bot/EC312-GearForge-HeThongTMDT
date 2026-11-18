<?php
/**
 * GearForge Admin Operations Pages (Installment 2-Layer Review & Vault Viewer).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Admin_Pages {

    public static function init(): void {
        add_action('admin_menu', [self::class, 'register_menus']);
        add_action('admin_post_gf_review_action', [self::class, 'handle_review_action']);
        add_action('admin_post_gf_view_vault_doc', [self::class, 'handle_view_vault_doc']);
    }

    public static function register_menus(): void {
        $cap = self::get_reviewer_capability();

        add_menu_page(
            'Hồ sơ Trả góp SV',
            'Trả góp SV',
            $cap,
            'gf-installments',
            [self::class, 'render_installments_page'],
            'dashicons-id-alt',
            56
        );
    }

    public static function handle_review_action(): void {
        if (!self::can_review()) {
            wp_die('Bạn không có quyền xét duyệt hồ sơ trả góp.', '403 Forbidden', ['response' => 403]);
        }

        $app_id = isset($_POST['app_id']) ? (int) $_POST['app_id'] : 0;
        check_admin_referer('gf_review_' . $app_id);

        $action      = sanitize_key($_POST['review_step'] ?? '');
        $reviewer_id = get_current_user_id();
        $result      = new WP_Error('gf_unknown_action', 'Hành động không hợp lệ.');

        if ($action === 'layer1') {
            $result = GF_Installment_Review::review_layer_1($app_id, $reviewer_id);
        } elseif ($action === 'layer2') {
            $result = GF_Installment_Review::review_layer_2($app_id, $reviewer_id);
        } elseif ($action === 'reject' || $action === 'blacklist') {
            $reason = sanitize_textarea_field($_POST['reject_reason'] ?? '');
            $result = GF_Installment_Review::reject_application($app_id, $reviewer_id, $reason, $action === 'blacklist');
        }

        $redirect = admin_url('admin.php?page=gf-installments');
        if (is_wp_error($result)) {
            $redirect = add_query_arg('gf_err', urlencode($result->get_error_message()), $redirect);
        } else {
            $redirect = add_query_arg('gf_msg', urlencode('Cập nhật hồ sơ #' . $app_id . ' thành công.'), $redirect);
        }

        wp_safe_redirect($redirect);
        exit;
    }

    public static function handle_view_vault_doc(): void {
        if (!self::can_review()) {
            wp_die('403 Forbidden - Chỉ InstallmentReviewer hoặc StoreAdmin mới được xem hồ sơ định danh.', '403 Forbidden', ['response' => 403]);
        }

        $app_id = isset($_GET['app_id']) ? (int) $_GET['app_id'] : 0;
        $doc    = sanitize_key($_GET['doc'] ?? 'cccd');
        check_admin_referer('gf_vault_' . $app_id . '_' . $doc);

        $app = GF_Installment_Review::get_application($app_id);
        if (!$app) {
            wp_die('Không tìm thấy hồ sơ.', '404 Not Found', ['response' => 404]);
        }

        $stored = $doc === 'card' ? $app['student_card_encrypted_path'] : $app['cccd_encrypted_path'];
        $plain  = GF_Vault_Crypto::decrypt_file($stored);

        if (is_wp_error($plain)) {
            wp_die(esc_html($plain->get_error_message()), 'Lỗi giải mã', ['response' => 404]);
        }

        error_log(sprintf('[GearForge Audit] User #%d viewed %s for app #%d', get_current_user_id(), $doc, $app_id));

        header('Content-Type: ' . $plain['mime']);
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store, no-cache, must-revalidate');
        echo $plain['bytes'];
        exit;
    }

    public static function render_installments_page(): void {
        global $wpdb;

        $status_filter = sanitize_text_field($_GET['status'] ?? '');
        $table         = "{$wpdb->prefix}gf_installment_applications";

        if ($status_filter !== '') {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE status = %s ORDER BY app_id DESC LIMIT 50", $status_filter),
                ARRAY_A
            );
        } else {
            $rows = $wpdb->get_results("SELECT * FROM {$table} ORDER BY app_id DESC LIMIT 50", ARRAY_A);
        }

        echo '<div class="wrap"><h1>Quản lý Hồ sơ Trả góp Sinh viên (Duyệt 2 lớp)</h1>';

        if (!empty($_GET['gf_msg'])) {
            echo '<div class="notice notice-success"><p>' . esc_html(wp_unslash($_GET['gf_msg'])) . '</p></div>';
        }
        if (!empty($_GET['gf_err'])) {
            echo '<div class="notice notice-error"><p>' . esc_html(wp_unslash($_GET['gf_err'])) . '</p></div>';
        }

        echo '<table class="widefat striped" style="margin-top:12px;">';
        echo '<thead><tr><th>ID</th><th>Đơn hàng</th><th>MSSV / Email .edu</th><th>Trả trước / Góp tháng</th><th>Hồ sơ AES-256</th><th>Trạng thái</th><th>Thao tác Duyệt 2 lớp</th></tr></thead><tbody>';

        if (empty($rows)) {
            echo '<tr><td colspan="7">Chưa có hồ sơ trả góp nào.</td></tr>';
        } else {
            foreach ($rows as $row) {
                $id       = (int) $row['app_id'];
                $cccd_url = wp_nonce_url(admin_url("admin-post.php?action=gf_view_vault_doc&app_id={$id}&doc=cccd"), "gf_vault_{$id}_cccd");
                $card_url = wp_nonce_url(admin_url("admin-post.php?action=gf_view_vault_doc&app_id={$id}&doc=card"), "gf_vault_{$id}_card");

                echo '<tr>';
                echo '<td>#' . $id . '</td>';
                echo '<td>#' . (int) $row['order_id'] . '</td>';
                echo '<td><strong>' . esc_html($row['student_code']) . '</strong><br/>' . esc_html($row['student_edu_email']) . '</td>';
                echo '<td>Trả trước: ' . number_format((float) $row['downpayment_amount']) . 'đ<br/>Góp: ' . number_format((float) $row['monthly_amount']) . 'đ/th</td>';
                echo '<td><a class="button button-small" target="_blank" href="' . esc_url($cccd_url) . '">Xem CCCD</a> ';
                echo '<a class="button button-small" target="_blank" href="' . esc_url($card_url) . '">Xem Thẻ SV</a></td>';
                echo '<td><code>' . esc_html($row['status']) . '</code></td>';
                echo '<td>';
                echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">';
                echo '<input type="hidden" name="action" value="gf_review_action" />';
                echo '<input type="hidden" name="app_id" value="' . $id . '" />';
                wp_nonce_field('gf_review_' . $id);
                echo '<button class="button button-primary" name="review_step" value="layer1">Duyệt Lớp 1</button>';
                echo '<button class="button button-primary" name="review_step" value="layer2">Duyệt Lớp 2</button>';
                echo '<input type="text" name="reject_reason" placeholder="Lý do từ chối..." style="max-width:150px;" />';
                echo '<button class="button" name="review_step" value="reject">Từ chối</button>';
                echo '<button class="button button-link-delete" name="review_step" value="blacklist">Từ chối + Blacklist</button>';
                echo '</form></td></tr>';
            }
        }
        echo '</tbody></table></div>';
    }

    private static function can_review(): bool {
        return current_user_can('gf_review_installments') || current_user_can('manage_woocommerce');
    }

    private static function get_reviewer_capability(): string {
        return current_user_can('gf_review_installments') ? 'gf_review_installments' : 'manage_woocommerce';
    }
}

GF_Admin_Pages::init();
