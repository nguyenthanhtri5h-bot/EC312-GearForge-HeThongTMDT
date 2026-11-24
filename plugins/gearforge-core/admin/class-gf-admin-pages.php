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
        add_action('admin_post_gf_rma_action', [self::class, 'handle_rma_action']);
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

        add_submenu_page(
            'gf-installments',
            'Quản lý Đổi trả / RMA',
            'Đổi trả / RMA',
            $cap,
            'gf-rma',
            [self::class, 'render_rma_page']
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
            $reason = sanitize_textarea_field(wp_unslash($_POST['reject_reason'] ?? ''));
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

        $allowed_statuses = [
            ''                           => 'Tất cả',
            'SUBMITTED'                  => 'Chờ duyệt L1 (SUBMITTED)',
            'L1_DOCS_VERIFIED'           => 'Đã duyệt L1 (L1_DOCS_VERIFIED)',
            'APPROVED_WAITING_DOWNPAYMENT' => 'Chờ trả trước (APPROVED)',
            'ACTIVE_INSTALLMENT'         => 'Đang góp (ACTIVE)',
            'CLOSED'                     => 'Đã đóng (CLOSED)',
            'REJECTED'                   => 'Từ chối (REJECTED)',
            'BLACKLISTED'                => 'Danh sách đen (BLACKLISTED)',
        ];

        $raw_status    = sanitize_text_field($_GET['status'] ?? '');
        $status_filter = array_key_exists($raw_status, $allowed_statuses) ? $raw_status : '';
        $last_id       = max(0, (int) ($_GET['last_id'] ?? 0));
        $page_size     = 20;
        $fetch_limit   = $page_size + 1;
        $table         = "{$wpdb->prefix}gf_installment_applications";

        // Index-backed grouped status counters
        $count_rows = $wpdb->get_results("SELECT status, COUNT(*) AS cnt FROM {$table} GROUP BY status", ARRAY_A) ?: [];
        $counts     = array_column($count_rows, 'cnt', 'status');
        $total_all  = array_sum(array_map('intval', $counts));

        // Keyset pagination (O(log N), avoids slow OFFSET on large tables)
        if ($status_filter !== '' && $last_id > 0) {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE status = %s AND app_id < %d ORDER BY app_id DESC LIMIT %d", $status_filter, $last_id, $fetch_limit),
                ARRAY_A
            );
        } elseif ($status_filter !== '') {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE status = %s ORDER BY app_id DESC LIMIT %d", $status_filter, $fetch_limit),
                ARRAY_A
            );
        } elseif ($last_id > 0) {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE app_id < %d ORDER BY app_id DESC LIMIT %d", $last_id, $fetch_limit),
                ARRAY_A
            );
        } else {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} ORDER BY app_id DESC LIMIT %d", $fetch_limit),
                ARRAY_A
            );
        }

        $has_more = count($rows) > $page_size;
        if ($has_more) {
            array_pop($rows);
        }

        echo '<div class="wrap"><h1>Quản lý Hồ sơ Trả góp Sinh viên (Duyệt 2 lớp)</h1>';
        echo '<ul class="subsubsub" style="margin-bottom:12px;">';
        $idx   = 0;
        $total = count($allowed_statuses);
        foreach ($allowed_statuses as $key => $label) {
            $idx++;
            $cnt   = $key === '' ? $total_all : (int) ($counts[$key] ?? 0);
            $url   = $key === '' ? admin_url('admin.php?page=gf-installments') : admin_url('admin.php?page=gf-installments&status=' . urlencode($key));
            $class = $status_filter === $key ? 'current' : '';
            $sep   = $idx < $total ? ' | ' : '';
            echo '<li><a href="' . esc_url($url) . '" class="' . esc_attr($class) . '">' . esc_html($label) . ' <span class="count">(' . $cnt . ')</span></a>' . $sep . '</li>';
        }
        echo '</ul><div class="clear"></div>';

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
                if (in_array($row['status'], ['SUBMITTED', 'L1_DOCS_VERIFIED', 'APPROVED_WAITING_DOWNPAYMENT'], true)) {
                    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">';
                    echo '<input type="hidden" name="action" value="gf_review_action" />';
                    echo '<input type="hidden" name="app_id" value="' . $id . '" />';
                    wp_nonce_field('gf_review_' . $id);
                    if ($row['status'] === 'SUBMITTED') {
                        echo '<button class="button button-primary" name="review_step" value="layer1">Duyệt Lớp 1</button>';
                    } elseif ($row['status'] === 'L1_DOCS_VERIFIED') {
                        echo '<button class="button button-primary" name="review_step" value="layer2">Duyệt Lớp 2</button>';
                    }
                    echo '<input type="text" name="reject_reason" placeholder="Lý do từ chối..." style="max-width:150px;" />';
                    echo '<button class="button" name="review_step" value="reject">Từ chối</button>';
                    echo '<button class="button button-link-delete" name="review_step" value="blacklist">Từ chối + Blacklist</button>';
                    echo '</form>';
                } else {
                    echo '<em>Đã kết thúc duyệt</em>';
                }
                echo '</td></tr>';
            }
        }
        echo '</tbody></table>';
        if (!empty($has_more) && !empty($rows)) {
            $next_last_id = (int) end($rows)['app_id'];
            $next_url     = admin_url('admin.php?page=gf-installments&last_id=' . $next_last_id);
            if ($status_filter !== '') {
                $next_url = add_query_arg('status', $status_filter, $next_url);
            }
            echo '<p style="margin-top:12px;"><a class="button" href="' . esc_url($next_url) . '">Trang tiếp theo (Keyset &lt; #' . $next_last_id . ') &rarr;</a></p>';
        }
        echo '</div>';
    }

    private static function can_review(): bool {
        return current_user_can('gf_review_installments') || current_user_can('manage_woocommerce');
    }

    private static function get_reviewer_capability(): string {
        return current_user_can('gf_review_installments') ? 'gf_review_installments' : 'manage_woocommerce';
    }

    public static function handle_rma_action(): void {
        if (!self::can_review()) {
            wp_die('Bạn không có quyền xử lý yêu cầu đổi trả / RMA.', '403 Forbidden', ['response' => 403]);
        }

        $rma_id = isset($_POST['rma_id']) ? (int) $_POST['rma_id'] : 0;
        check_admin_referer('gf_rma_' . $rma_id);

        $step        = sanitize_key($_POST['rma_step'] ?? '');
        $admin_note  = sanitize_textarea_field(wp_unslash($_POST['admin_note'] ?? ''));
        $reviewer_id = get_current_user_id();
        $result      = new WP_Error('gf_unknown_action', 'Hành động RMA không hợp lệ.');

        if ($step === 'approve') {
            $result = GF_RMA_Manager::approve_request($rma_id, $reviewer_id, $admin_note);
        } elseif ($step === 'complete') {
            $result = GF_RMA_Manager::complete_request($rma_id, $reviewer_id, $admin_note);
        } elseif ($step === 'reject') {
            $result = GF_RMA_Manager::reject_request($rma_id, $reviewer_id, $admin_note);
        }

        $redirect = admin_url('admin.php?page=gf-rma');
        if (is_wp_error($result)) {
            $redirect = add_query_arg('gf_err', urlencode($result->get_error_message()), $redirect);
        } else {
            $redirect = add_query_arg('gf_msg', urlencode('Cập nhật yêu cầu RMA #' . $rma_id . ' thành công.'), $redirect);
        }

        wp_safe_redirect($redirect);
        exit;
    }

    public static function render_rma_page(): void {
        global $wpdb;
        GF_RMA_Manager::ensure_table();

        $allowed_statuses = [
            ''          => 'Tất cả',
            'REQUESTED' => 'Chờ duyệt (REQUESTED)',
            'APPROVED'  => 'Đã duyệt (APPROVED)',
            'COMPLETED' => 'Hoàn tất (COMPLETED)',
            'REJECTED'  => 'Từ chối (REJECTED)',
        ];

        $raw_status    = sanitize_text_field($_GET['status'] ?? '');
        $status_filter = array_key_exists($raw_status, $allowed_statuses) ? $raw_status : '';
        $last_id       = max(0, (int) ($_GET['last_id'] ?? 0));
        $page_size     = 20;
        $fetch_limit   = $page_size + 1;
        $table         = "{$wpdb->prefix}gf_rma_requests";

        $count_rows = $wpdb->get_results("SELECT status, COUNT(*) AS cnt FROM {$table} GROUP BY status", ARRAY_A) ?: [];
        $counts     = array_column($count_rows, 'cnt', 'status');
        $total_all  = array_sum(array_map('intval', $counts));

        if ($status_filter !== '' && $last_id > 0) {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE status = %s AND rma_id < %d ORDER BY rma_id DESC LIMIT %d", $status_filter, $last_id, $fetch_limit),
                ARRAY_A
            );
        } elseif ($status_filter !== '') {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE status = %s ORDER BY rma_id DESC LIMIT %d", $status_filter, $fetch_limit),
                ARRAY_A
            );
        } elseif ($last_id > 0) {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} WHERE rma_id < %d ORDER BY rma_id DESC LIMIT %d", $last_id, $fetch_limit),
                ARRAY_A
            );
        } else {
            $rows = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} ORDER BY rma_id DESC LIMIT %d", $fetch_limit),
                ARRAY_A
            );
        }

        $has_more = count($rows) > $page_size;
        if ($has_more) {
            array_pop($rows);
        }

        echo '<div class="wrap"><h1>Quản lý Đổi trả / Bảo hành (RMA)</h1>';
        echo '<ul class="subsubsub" style="margin-bottom:12px;">';
        $idx   = 0;
        $total = count($allowed_statuses);
        foreach ($allowed_statuses as $key => $label) {
            $idx++;
            $cnt   = $key === '' ? $total_all : (int) ($counts[$key] ?? 0);
            $url   = $key === '' ? admin_url('admin.php?page=gf-rma') : admin_url('admin.php?page=gf-rma&status=' . urlencode($key));
            $class = $status_filter === $key ? 'current' : '';
            $sep   = $idx < $total ? ' | ' : '';
            echo '<li><a href="' . esc_url($url) . '" class="' . esc_attr($class) . '">' . esc_html($label) . ' <span class="count">(' . $cnt . ')</span></a>' . $sep . '</li>';
        }
        echo '</ul><div class="clear"></div>';

        if (!empty($_GET['gf_msg'])) {
            echo '<div class="notice notice-success"><p>' . esc_html(wp_unslash($_GET['gf_msg'])) . '</p></div>';
        }
        if (!empty($_GET['gf_err'])) {
            echo '<div class="notice notice-error"><p>' . esc_html(wp_unslash($_GET['gf_err'])) . '</p></div>';
        }

        echo '<table class="widefat striped" style="margin-top:12px;">';
        echo '<thead><tr><th>RMA</th><th>Đơn hàng</th><th>Loại / S/N</th><th>Lý do khách hàng</th><th>Trạng thái</th><th>Thao tác xử lý</th></tr></thead><tbody>';

        if (empty($rows)) {
            echo '<tr><td colspan="6">Chưa có yêu cầu đổi trả / bảo hành nào.</td></tr>';
        } else {
            foreach ($rows as $row) {
                $id = (int) $row['rma_id'];
                echo '<tr>';
                echo '<td>#' . $id . '</td>';
                echo '<td>#' . (int) $row['order_id'] . '</td>';
                echo '<td><strong>' . esc_html($row['request_type']) . '</strong><br/>' . (!empty($row['serial_number']) ? '<code>' . esc_html($row['serial_number']) . '</code>' : '<em>Theo đơn</em>') . '</td>';
                echo '<td>' . esc_html($row['reason']) . (!empty($row['admin_note']) ? '<br/><small>Ghi chú: ' . esc_html($row['admin_note']) . '</small>' : '') . '</td>';
                echo '<td><code>' . esc_html($row['status']) . '</code></td>';
                echo '<td>';
                if (in_array($row['status'], ['REQUESTED', 'APPROVED'], true)) {
                    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">';
                    echo '<input type="hidden" name="action" value="gf_rma_action" />';
                    echo '<input type="hidden" name="rma_id" value="' . $id . '" />';
                    wp_nonce_field('gf_rma_' . $id);
                    echo '<input type="text" name="admin_note" placeholder="Ghi chú / Lý do..." style="max-width:160px;" />';
                    if ($row['status'] === 'REQUESTED') {
                        echo '<button class="button button-primary" name="rma_step" value="approve">Duyệt tiếp nhận</button>';
                        echo '<button class="button button-link-delete" name="rma_step" value="reject">Từ chối</button>';
                    } elseif ($row['status'] === 'APPROVED') {
                        echo '<button class="button button-primary" name="rma_step" value="complete">Hoàn tất</button>';
                    }
                    echo '</form>';
                } else {
                    echo '<em>Đã kết thúc xử lý</em>';
                }
                echo '</td></tr>';
            }
        }
        echo '</tbody></table>';

        if (!empty($has_more) && !empty($rows)) {
            $next_last_id = (int) end($rows)['rma_id'];
            $next_url     = admin_url('admin.php?page=gf-rma&last_id=' . $next_last_id);
            if ($status_filter !== '') {
                $next_url = add_query_arg('status', $status_filter, $next_url);
            }
            echo '<p style="margin-top:12px;"><a class="button" href="' . esc_url($next_url) . '">Trang tiếp theo (Keyset &lt; #' . $next_last_id . ') &rarr;</a></p>';
        }
        echo '</div>';
    }
}

GF_Admin_Pages::init();
