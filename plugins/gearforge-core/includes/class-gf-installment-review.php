<?php
/**
 * Student Installment Application & 2-Layer Review Engine (UC-10, UC-11).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Installment_Review {
    public static function init(): void {
        add_action('wp_ajax_gf_submit_installment_app', [self::class, 'ajax_submit_application']);
        add_action('wp_ajax_nopriv_gf_submit_installment_app', [self::class, 'ajax_require_login']);
        add_action('admin_post_gf_review_installment', [self::class, 'handle_admin_review_action']);
    }

    public static function ajax_require_login(): void {
        wp_send_json_error(['message' => 'Vui lòng đăng nhập tài khoản sinh viên trước khi nộp hồ sơ.'], 401);
    }

    public static function ajax_submit_application(): void {
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => 'Vui lòng đăng nhập tài khoản sinh viên trước khi nộp hồ sơ.'], 401);
        }
        check_ajax_referer('gf_frontend_nonce', 'nonce');

        $res = self::process_submission(
            get_current_user_id(),
            $_POST,
            $_FILES
        );
        if (is_wp_error($res)) {
            $status = (int) ($res->get_error_data()['status'] ?? 400);
            wp_send_json_error(['message' => $res->get_error_message(), 'code' => $res->get_error_code()], $status);
        }

        wp_send_json_success($res, 201);
    }

    public static function rest_submit_application(WP_REST_Request $request): WP_REST_Response {
        $res = self::process_submission(
            get_current_user_id(),
            $request->get_params(),
            $request->get_file_params()
        );
        if (is_wp_error($res)) {
            $status = (int) ($res->get_error_data()['status'] ?? 400);
            return new WP_REST_Response(['error' => $res->get_error_message(), 'code' => $res->get_error_code()], $status);
        }
        return new WP_REST_Response($res, 201);
    }

    public static function process_submission(int $user_id, array $data, array $files): array|WP_Error {
        // 1. NĐ 13/2023 Consent mandatory check (TC-05)
        $consent = !empty($data['consent_nd13_accepted']) && in_array((string) $data['consent_nd13_accepted'], ['1', 'true', 'on', 'yes'], true);
        if (!$consent) {
            return new WP_Error(
                'gf_consent_required',
                'Bạn bắt buộc phải đồng ý với Thông báo Xử lý Dữ liệu Cá nhân theo Nghị định 13/2023/NĐ-CP trước khi gửi hồ sơ.',
                ['status' => 400]
            );
        }

        // 2. Validate student inputs
        $product_id   = (int) ($data['product_id'] ?? 0);
        $order_id     = (int) ($data['order_id'] ?? 0);
        $months       = (int) ($data['months'] ?? 6);
        $down_pct     = (float) ($data['downpayment_pct'] ?? 20);
        $student_code = sanitize_text_field((string) ($data['student_code'] ?? ''));
        $edu_email    = sanitize_email((string) ($data['student_edu_email'] ?? ''));
        $phone        = preg_replace('/\D+/', '', (string) ($data['phone'] ?? ''));
        $cccd_number  = preg_replace('/\D+/', '', (string) ($data['cccd_number'] ?? ''));

        if ($student_code === '' || !GF_RBAC::is_valid_edu_email($edu_email)) {
            return new WP_Error('gf_invalid_student_info', 'Vui lòng nhập Mã sinh viên và Email sinh viên (.edu.vn) hợp lệ.', ['status' => 400]);
        }
        if (strlen($cccd_number) !== 12) {
            return new WP_Error('gf_invalid_cccd', 'Số CCCD gắn chip phải gồm đúng 12 chữ số.', ['status' => 400]);
        }

        $cccd_hash = hash('sha256', $cccd_number);

        // 3. Fraud Guard: Rate Limiting & Blacklist Check (TC-08)
        $rl = GF_Fraud_Guard::check_rate_limit('installment_submit', $user_id);
        if (is_wp_error($rl)) {
            return $rl;
        }
        $bl = GF_Fraud_Guard::check_blacklist([
            'IP'        => GF_Fraud_Guard::get_client_ip(),
            'USER'      => (string) $user_id,
            'PHONE'     => $phone,
            'CCCD_HASH' => $cccd_hash,
        ]);
        if (is_wp_error($bl)) {
            return $bl;
        }

        if (empty($files['cccd_file']) || empty($files['student_card_file'])) {
            return new WP_Error('gf_missing_files', 'Vui lòng tải lên đầy đủ ảnh CCCD và ảnh Thẻ sinh viên.', ['status' => 400]);
        }

        // 4. Determine order/price & create WooCommerce Order if not provided
        $order = $order_id > 0 && function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            $product = function_exists('wc_get_product') && $product_id > 0 ? wc_get_product($product_id) : null;
            if (!$product) {
                return new WP_Error('gf_invalid_product', 'Không tìm thấy sản phẩm để tạo đơn trả góp.', ['status' => 400]);
            }
            $order = wc_create_order(['customer_id' => $user_id]);
            $order->add_product($product, 1);
            $user = get_userdata($user_id);
            if ($user) {
                $order->set_billing_first_name($user->display_name ?: $user->user_login);
                $order->set_billing_email($user->user_email);
            }
            if ($phone !== '') {
                $order->set_billing_phone($phone);
            }
            $order->set_payment_method('gearforge_sandbox');
            $order->set_payment_method_title('Trả góp Sinh viên GearForge + Sandbox 3DS');
            $order->calculate_totals();
            $order->set_status('wc-gf-installment', 'Khởi tạo đơn hàng trả góp sinh viên (chờ duyệt 2 lớp).');
            $order->save();
            $order_id = $order->get_id();
        } else {
            $order->set_status('wc-gf-installment', 'Đơn hàng chuyển sang chờ duyệt hồ sơ trả góp 2 lớp.');
            $order->save();
        }

        $calc = GF_Installment_Calc::calculate((float) $order->get_total(), $down_pct, $months);
        if ((int) $calc['plan_id'] <= 0) {
            return new WP_Error('gf_plan_missing', 'Không tìm thấy gói kỳ hạn trả góp hợp lệ trong CSDL.', ['status' => 400]);
        }

        // 5. Encrypt CCCD & Student Card into Vault outside webroot (TC-06)
        $cccd_enc = GF_Vault_Crypto::encrypt_and_store_upload($files['cccd_file'], 'cccd');
        if (is_wp_error($cccd_enc)) {
            return $cccd_enc;
        }
        $card_enc = GF_Vault_Crypto::encrypt_and_store_upload($files['student_card_file'], 'svcard');
        if (is_wp_error($card_enc)) {
            return $card_enc;
        }

        // 6. Save Application Record
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_applications";
        $inserted = $wpdb->insert(
            $table,
            [
                'order_id'                    => $order_id,
                'user_id'                     => $user_id,
                'plan_id'                     => (int) $calc['plan_id'],
                'student_code'                => $student_code,
                'student_edu_email'           => $edu_email,
                'cccd_hash'                   => $cccd_hash,
                'cccd_encrypted_path'         => $cccd_enc['stored_name'],
                'student_card_encrypted_path' => $card_enc['stored_name'],
                'downpayment_amount'          => $calc['downpayment_amount'],
                'monthly_amount'              => $calc['monthly_amount'],
                'consent_nd13_accepted'       => 1,
                'consent_accepted_at'         => current_time('mysql'),
                'status'                      => 'SUBMITTED',
            ],
            ['%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%f', '%d', '%s', '%s']
        );

        if ($inserted === false) {
            return new WP_Error('gf_db_insert_failed', 'Không thể lưu hồ sơ trả góp vào cơ sở dữ liệu.', ['status' => 500]);
        }

        $app_id = (int) $wpdb->insert_id;
        update_user_meta($user_id, 'gf_student_edu_email', $edu_email);
        GF_RBAC::log_audit('INSTALLMENT_APP_SUBMITTED', $user_id, $app_id, ['order_id' => $order_id]);

        return [
            'app_id'             => $app_id,
            'order_id'           => $order_id,
            'status'             => 'SUBMITTED',
            'downpayment_amount' => $calc['downpayment_amount'],
            'monthly_amount'     => $calc['monthly_amount'],
            'tracking_url'       => $order->get_view_order_url(),
            'message'            => 'Nộp hồ sơ trả góp thành công! Hồ sơ đang chờ duyệt 2 lớp (L1 Giấy tờ -> L2 .edu.vn).',
        ];
    }

    public static function review_layer_1(int $app_id, int $reviewer_id): true|WP_Error {
        if (!GF_RBAC::can_review_installments($reviewer_id)) {
            return new WP_Error('gf_forbidden', 'Không đủ quyền duyệt hồ sơ.', ['status' => 403]);
        }
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_applications";
        $app   = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE app_id = %d", $app_id), ARRAY_A);
        if (!$app || $app['status'] !== 'SUBMITTED') {
            return new WP_Error('gf_invalid_state', 'Chỉ có thể duyệt Lớp 1 khi hồ sơ ở trạng thái SUBMITTED.', ['status' => 400]);
        }

        $wpdb->update(
            $table,
            [
                'status'         => 'L1_DOCS_VERIFIED',
                'reviewer_id'    => $reviewer_id,
                'l1_verified_at' => current_time('mysql'),
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        $order = wc_get_order((int) $app['order_id']);
        if ($order) {
            $order->add_order_note(sprintf('Hồ sơ trả góp #%d đã qua Duyệt Lớp 1 (Đối chiếu ảnh CCCD & Thẻ SV).', $app_id));
        }
        GF_RBAC::log_audit('INSTALLMENT_L1_VERIFIED', $reviewer_id, $app_id);
        return true;
    }

    public static function review_layer_2(int $app_id, int $reviewer_id): true|WP_Error {
        if (!GF_RBAC::can_review_installments($reviewer_id)) {
            return new WP_Error('gf_forbidden', 'Không đủ quyền duyệt hồ sơ.', ['status' => 403]);
        }
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_applications";
        $app   = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE app_id = %d", $app_id), ARRAY_A);
        if (!$app || $app['status'] !== 'L1_DOCS_VERIFIED') {
            return new WP_Error('gf_invalid_state', 'Bắt buộc hoàn thành Duyệt Lớp 1 (L1_DOCS_VERIFIED) trước khi Duyệt Lớp 2.', ['status' => 400]);
        }

        $wpdb->update(
            $table,
            [
                'status'         => 'APPROVED_WAITING_DOWNPAYMENT',
                'reviewer_id'    => $reviewer_id,
                'l2_verified_at' => current_time('mysql'),
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        update_user_meta((int) $app['user_id'], 'gf_edu_verified', 1);
        $order = wc_get_order((int) $app['order_id']);
        if ($order) {
            $order->add_order_note(sprintf(
                'Hồ sơ trả góp #%d đã qua Duyệt Lớp 2 (L2_EDU_CONFIRMED -> APPROVED_WAITING_DOWNPAYMENT). Mời sinh viên thanh toán tiền trả trước %sđ.',
                $app_id,
                number_format((float) $app['downpayment_amount'], 0, ',', '.')
            ));
        }
        GF_RBAC::log_audit('INSTALLMENT_L2_APPROVED', $reviewer_id, $app_id);
        return true;
    }

    public static function reject_application(int $app_id, int $reviewer_id, string $reason, bool $blacklist = false): true|WP_Error {
        if (!GF_RBAC::can_review_installments($reviewer_id)) {
            return new WP_Error('gf_forbidden', 'Không đủ quyền xử lý hồ sơ.', ['status' => 403]);
        }
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_applications";
        $app   = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE app_id = %d", $app_id), ARRAY_A);
        if (!$app) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ.', ['status' => 404]);
        }

        $new_status = $blacklist ? 'BLACKLISTED' : 'REJECTED';
        $wpdb->update(
            $table,
            [
                'status'        => $new_status,
                'reviewer_id'   => $reviewer_id,
                'reject_reason' => sanitize_textarea_field($reason),
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        if ($blacklist) {
            GF_Fraud_Guard::add_blacklist_entry('CCCD_HASH', (string) $app['cccd_hash'], $reason, $reviewer_id);
            GF_Fraud_Guard::add_blacklist_entry('USER', (string) $app['user_id'], $reason, $reviewer_id);
        }

        $order = wc_get_order((int) $app['order_id']);
        if ($order) {
            $order->update_status('cancelled', sprintf('Hồ sơ trả góp #%d bị %s: %s', $app_id, $new_status, $reason));
        }

        GF_RBAC::log_audit('INSTALLMENT_' . $new_status, $reviewer_id, $app_id, ['reason' => $reason]);
        return true;
    }

    public static function handle_admin_review_action(): void {
        GF_RBAC::require_reviewer_or_403();
        check_admin_referer('gf_review_installment_action');

        $app_id = (int) ($_POST['app_id'] ?? 0);
        $decision = sanitize_key((string) ($_POST['decision'] ?? ''));
        $reason = sanitize_textarea_field((string) ($_POST['reject_reason'] ?? 'Hồ sơ không đạt tiêu chuẩn đối chiếu'));
        $uid = get_current_user_id();

        $res = match ($decision) {
            'l1'        => self::review_layer_1($app_id, $uid),
            'l2'        => self::review_layer_2($app_id, $uid),
            'reject'    => self::reject_application($app_id, $uid, $reason, false),
            'blacklist' => self::reject_application($app_id, $uid, $reason, true),
            default     => new WP_Error('gf_bad_action', 'Hành động không hợp lệ.'),
        };

        $msg_arg = is_wp_error($res) ? 'gf_error=' . rawurlencode($res->get_error_message()) : 'gf_msg=updated';
        wp_safe_redirect(admin_url('admin.php?page=gearforge-ops&tab=installments&' . $msg_arg));
        exit;
    }
}
