<?php
/**
 * Student Installment Application & 2-Layer Review Service (UC-10 & UC-11).
 *
 * Security & Concurrency Hardening:
 * - Uses HMAC-SHA256 with server pepper for cccd_hash (prevents brute-force/rainbow tables).
 * - Uses Atomic Conditional Updates (WHERE app_id = ? AND status = ?) to prevent race conditions.
 * - Uses MySQL Transactions (START TRANSACTION/COMMIT/ROLLBACK) when rejecting & blacklisting.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Installment_Review {

    public static function init(): void {
        add_action('init', [self::class, 'register_custom_order_status']);
        add_filter('wc_order_statuses', [self::class, 'append_custom_order_status']);
        add_filter('woocommerce_valid_order_statuses_for_payment_complete', [self::class, 'allow_installment_status_for_payment']);
        add_filter('woocommerce_valid_order_statuses_for_payment', [self::class, 'allow_installment_status_for_payment']);
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function allow_installment_status_for_payment(array $statuses): array {
        if (!in_array('gf-installment', $statuses, true)) {
            $statuses[] = 'gf-installment';
        }
        return $statuses;
    }

    public static function register_custom_order_status(): void {
        if (get_post_status_object('wc-gf-installment') !== null) {
            return;
        }
        register_post_status('wc-gf-installment', [
            'label'                     => 'Chờ duyệt trả góp (INSTALLMENT)',
            'public'                    => true,
            'exclude_from_search'       => true,
            'show_in_admin_all_list'    => true,
            'show_in_admin_status_list' => true,
            'label_count'               => _n_noop('Chờ duyệt trả góp (%s)', 'Chờ duyệt trả góp (%s)'),
        ]);
    }

    public static function append_custom_order_status(array $statuses): array {
        if (!isset($statuses['wc-gf-installment'])) {
            $statuses['wc-gf-installment'] = 'Chờ duyệt trả góp (INSTALLMENT)';
        }
        return $statuses;
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/installment-apply', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_apply_rest'],
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
        ]);
    }

    /**
     * REST callback for POST /wp-json/gearforge/v1/installment-apply.
     * Accepts multipart/form-data with cccd_file & student_card_file, recalculates
     * installment figures server-side, and prevents IDOR / duplicate applications.
     */
    public static function handle_apply_rest(WP_REST_Request $request) {
        if (function_exists('gf_core_check_rate_limit')) {
            $rl = gf_core_check_rate_limit('installment_apply', 15, 60, 'u' . get_current_user_id());
            if (is_wp_error($rl)) {
                return gf_core_rate_limit_rest_response($rl);
            }
        }

        $order_id = (int) $request->get_param('order_id');
        if ($order_id <= 0 || !function_exists('wc_get_order')) {
            return new WP_REST_Response(['code' => 'gf_invalid_order', 'message' => 'Mã đơn hàng không hợp lệ.'], 400);
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_REST_Response(['code' => 'gf_order_not_found', 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        $current_user_id = get_current_user_id();
        $is_operator     = current_user_can('manage_woocommerce') || current_user_can('gf_review_installments');
        if ((int) $order->get_user_id() !== $current_user_id && !$is_operator) {
            return new WP_REST_Response(['code' => 'gf_forbidden', 'message' => 'Bạn không có quyền nộp hồ sơ trả góp cho đơn hàng này.'], 403);
        }

        if (!in_array($order->get_status(), ['pending', 'on-hold'], true)) {
            return new WP_REST_Response(
                [
                    'code'    => 'gf_ineligible_order_status',
                    'message' => sprintf('Đơn hàng #%d ở trạng thái "%s" không thể nộp hồ sơ trả góp (chỉ áp dụng cho đơn pending hoặc on-hold).', $order_id, $order->get_status()),
                ],
                400
            );
        }

        global $wpdb;
        $lock_name = 'gf_apply_order_' . $order_id;
        $locked    = (int) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 5)', $lock_name));
        if ($locked !== 1) {
            return new WP_REST_Response(['code' => 'gf_lock_busy', 'message' => 'Hệ thống đang xử lý hồ sơ cho đơn hàng này, vui lòng thử lại.'], 409);
        }

        try {
            $existing = self::get_application_by_order($order_id);
            if ($existing && $existing['status'] !== 'REJECTED') {
                return new WP_REST_Response(
                    [
                        'code'    => 'gf_duplicate_application',
                        'message' => sprintf('Đơn hàng #%d đã có hồ sơ trả góp #%d (trạng thái: %s).', $order_id, (int) $existing['app_id'], $existing['status']),
                    ],
                    409
                );
            }

            $months   = (int) $request->get_param('months');
            $down_pct = (float) $request->get_param('down_pct');
            $calc     = GF_Installment_Calc::calculate((float) $order->get_total(), $down_pct, $months);
            if (is_wp_error($calc)) {
                return new WP_REST_Response(['code' => $calc->get_error_code(), 'message' => $calc->get_error_message()], 400);
            }

            $files        = $request->get_file_params();
            $cccd_file    = $files['cccd_file'] ?? [];
            $student_file = $files['student_card_file'] ?? [];
            if (empty($cccd_file['tmp_name']) || empty($student_file['tmp_name'])) {
                return new WP_REST_Response(
                    ['code' => 'gf_missing_files', 'message' => 'Bắt buộc tải lên cả ảnh CCCD (cccd_file) và Thẻ Sinh viên (student_card_file).'],
                    400
                );
            }

            $consent_raw = $request->get_param('consent_nd13_accepted');
            $consent     = filter_var($consent_raw, FILTER_VALIDATE_BOOLEAN) || (string) $consent_raw === '1';

            $raw_phone = trim((string) $request->get_param('phone'));
            $phone     = self::normalize_phone($raw_phone !== '' ? sanitize_text_field($raw_phone) : sanitize_text_field((string) $order->get_billing_phone()));
            $client_ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');

            $app_id = self::submit_application(
                [
                    'order_id'              => $order_id,
                    'user_id'               => (int) $order->get_user_id() ?: $current_user_id,
                    'plan_id'               => (int) $calc['plan_id'],
                    'student_code'          => (string) $request->get_param('student_code'),
                    'student_edu_email'     => (string) $request->get_param('student_edu_email'),
                    'cccd_number'           => (string) $request->get_param('cccd_number'),
                    'phone'                 => $phone,
                    'client_ip'             => $client_ip,
                    'downpayment_amount'    => (float) $calc['downpayment_amount'],
                    'monthly_amount'        => (float) $calc['monthly_amount'],
                    'consent_nd13_accepted' => $consent ? 1 : 0,
                ],
                $cccd_file,
                $student_file
            );

            if (is_wp_error($app_id)) {
                $status_code = $app_id->get_error_code() === 'gf_blacklisted' ? 403 : 400;
                return new WP_REST_Response(['code' => $app_id->get_error_code(), 'message' => $app_id->get_error_message()], $status_code);
            }

            if ($phone !== '' && $phone !== (string) $order->get_billing_phone()) {
                $order->set_billing_phone($phone);
            }

            $note = sprintf('Đã tiếp nhận hồ sơ trả góp #%d qua REST API (gói %d tháng, trả trước %s VNĐ).', $app_id, $months, number_format((float) $calc['downpayment_amount']));
            $order->update_status('gf-installment', $note);

            return new WP_REST_Response(
                [
                    'app_id'             => $app_id,
                    'order_id'           => $order_id,
                    'status'             => 'SUBMITTED',
                    'plan_id'            => (int) $calc['plan_id'],
                    'downpayment_amount' => (int) $calc['downpayment_amount'],
                    'monthly_amount'     => (int) $calc['monthly_amount'],
                    'message'            => 'Nộp hồ sơ trả góp thành công. Đang chờ duyệt Lớp 1.',
                ],
                201
            );
        } finally {
            $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
        }
    }

    /**
     * Submit a new student installment application after validating Decree 13/2023 consent & blacklist.
     *
     * @return int|WP_Error Application ID on success.
     */
    public static function submit_application(array $data, array $cccd_file, array $student_card_file) {
        global $wpdb;

        if (empty($data['consent_nd13_accepted'])) {
            return new WP_Error('gf_consent_required', 'Bạn bắt buộc phải đồng ý điều khoản bảo vệ dữ liệu cá nhân (NĐ 13/2023).');
        }

        $edu_email = sanitize_email($data['student_edu_email'] ?? '');
        if ($edu_email === '' || !is_email($edu_email) || !preg_match('/\.edu(\.vn)?$/i', $edu_email)) {
            return new WP_Error('gf_invalid_edu_email', 'Email sinh viên phải hợp lệ và có đuôi .edu.vn hoặc .edu.');
        }

        $student_code = trim((string) ($data['student_code'] ?? ''));
        if (!preg_match('/^[A-Za-z0-9_-]{4,32}$/', $student_code)) {
            return new WP_Error('gf_invalid_student_code', 'Mã số sinh viên phải dài 4–32 ký tự và chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.');
        }

        $cccd_number = preg_replace('/\D/', '', (string) ($data['cccd_number'] ?? ''));
        if (strlen($cccd_number) !== 12) {
            return new WP_Error('gf_invalid_cccd', 'Số CCCD gắn chip phải gồm đúng 12 chữ số.');
        }

        $cccd_hash = self::hash_cccd($cccd_number);
        $phone     = self::normalize_phone((string) ($data['phone'] ?? ''));
        $client_ip = trim((string) ($data['client_ip'] ?? ''));

        $is_blocked = self::is_blacklisted('CCCD_HASH', $cccd_hash)
            || self::is_blacklisted('USER', (string) ($data['user_id'] ?? 0))
            || ($phone !== '' && self::is_blacklisted('PHONE', $phone))
            || ($client_ip !== '' && self::is_blacklisted('IP', $client_ip));

        if ($is_blocked) {
            return new WP_Error('gf_blacklisted', 'Hồ sơ hoặc tài khoản nằm trong danh sách hạn chế gian lận.');
        }

        $cccd_path = GF_Vault_Crypto::encrypt_and_store_upload($cccd_file);
        if (is_wp_error($cccd_path)) {
            return $cccd_path;
        }

        $card_path = GF_Vault_Crypto::encrypt_and_store_upload($student_card_file);
        if (is_wp_error($card_path)) {
            GF_Vault_Crypto::delete_stored_file($cccd_path);
            return $card_path;
        }

        $table    = "{$wpdb->prefix}gf_installment_applications";
        $inserted = $wpdb->insert(
            $table,
            [
                'order_id'                    => (int) $data['order_id'],
                'user_id'                     => (int) $data['user_id'],
                'plan_id'                     => (int) $data['plan_id'],
                'student_code'                => $student_code,
                'student_edu_email'           => $edu_email,
                'cccd_hash'                   => $cccd_hash,
                'cccd_encrypted_path'         => $cccd_path,
                'student_card_encrypted_path' => $card_path,
                'downpayment_amount'          => (float) $data['downpayment_amount'],
                'monthly_amount'              => (float) $data['monthly_amount'],
                'consent_nd13_accepted'       => 1,
                'consent_accepted_at'         => current_time('mysql'),
                'status'                      => 'SUBMITTED',
            ],
            ['%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%f', '%f', '%d', '%s', '%s']
        );

        if ($inserted === false) {
            GF_Vault_Crypto::delete_stored_file($cccd_path);
            GF_Vault_Crypto::delete_stored_file($card_path);
            return new WP_Error('gf_db_insert_failed', 'Không thể lưu hồ sơ trả góp vào cơ sở dữ liệu.');
        }

        return (int) $wpdb->insert_id;
    }

    /**
     * Layer 1 Review (Atomic): SUBMITTED -> L1_DOCS_VERIFIED.
     *
     * @return true|WP_Error
     */
    public static function review_layer_1(int $app_id, int $reviewer_id) {
        return self::atomic_transition($app_id, 'SUBMITTED', 'L1_DOCS_VERIFIED', $reviewer_id, 'l1_verified_at');
    }

    /**
     * Layer 2 Review (Atomic): L1_DOCS_VERIFIED -> APPROVED_WAITING_DOWNPAYMENT.
     * Blocks skipping Layer 1 (TC-13) and prevents concurrent double-approval race conditions.
     *
     * @return true|WP_Error
     */
    public static function review_layer_2(int $app_id, int $reviewer_id) {
        return self::atomic_transition($app_id, 'L1_DOCS_VERIFIED', 'APPROVED_WAITING_DOWNPAYMENT', $reviewer_id, 'l2_verified_at');
    }

    /**
     * Reject an application or flag as fraud into wp_gf_fraud_blacklist inside a DB transaction.
     *
     * @return true|WP_Error
     */
    public static function reject_application(int $app_id, int $reviewer_id, string $reason, bool $blacklist = false) {
        global $wpdb;

        $app = self::get_application($app_id);
        if (!$app) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ trả góp.');
        }

        $clean_reason = mb_substr(sanitize_textarea_field($reason), 0, 500);
        if ($clean_reason === '') {
            return new WP_Error('gf_reason_required', 'Bắt buộc phải nhập lý do từ chối hồ sơ.');
        }

        $new_status = $blacklist ? 'BLACKLISTED' : 'REJECTED';

        $wpdb->query('START TRANSACTION');
        try {
            $updated = $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$wpdb->prefix}gf_installment_applications
                     SET status = %s, reviewer_id = %d, reject_reason = %s
                     WHERE app_id = %d AND status IN ('SUBMITTED', 'L1_DOCS_VERIFIED', 'APPROVED_WAITING_DOWNPAYMENT')",
                    $new_status,
                    $reviewer_id,
                    $clean_reason,
                    $app_id
                )
            );

            if ($updated !== 1) {
                throw new RuntimeException('Chỉ có thể từ chối hồ sơ đang chờ duyệt (không thể hủy hồ sơ đã ACTIVE_INSTALLMENT/CLOSED).');
            }

            if ($blacklist && !empty($app['cccd_hash'])) {
                $bl_res = $wpdb->query(
                    $wpdb->prepare(
                        "INSERT INTO {$wpdb->prefix}gf_fraud_blacklist (target_type, target_value, reason, created_by)
                         VALUES ('CCCD_HASH', %s, %s, %d)
                         ON DUPLICATE KEY UPDATE reason = VALUES(reason), created_by = VALUES(created_by), blocked_until = NULL",
                        $app['cccd_hash'],
                        $clean_reason,
                        $reviewer_id
                    )
                );
                if ($bl_res === false) {
                    throw new RuntimeException('Ghi danh sách đen thất bại.');
                }
            }

            $wpdb->query('COMMIT');
        } catch (Throwable $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('gf_tx_failed', $e->getMessage());
        }

        if (function_exists('wc_get_order')) {
            $order = wc_get_order((int) $app['order_id']);
            if ($order) {
                $order->update_status('cancelled', 'Hồ sơ trả góp bị từ chối: ' . $clean_reason);
            }
        }

        return true;
    }

    /**
     * Compute a keyed HMAC-SHA256 hash for 12-digit CCCD numbers (resists brute-force/rainbow tables).
     */
    public static function hash_cccd(string $cccd_number): string {
        $pepper = getenv('GF_VAULT_ENCRYPTION_KEY');
        if (!$pepper || $pepper === 'replace_with_32_byte_hex_key_in_env') {
            $pepper = wp_salt('auth');
        }
        return hash_hmac('sha256', $cccd_number, $pepper);
    }

    public static function get_application(int $app_id): ?array {
        global $wpdb;
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_installment_applications WHERE app_id = %d", $app_id),
            ARRAY_A
        );
        return is_array($row) ? $row : null;
    }

    public static function get_application_by_order(int $order_id): ?array {
        global $wpdb;
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d ORDER BY app_id DESC LIMIT 1", $order_id),
            ARRAY_A
        );
        return is_array($row) ? $row : null;
    }

    /**
     * Execute an atomic conditional state transition to prevent race conditions.
     *
     * @return true|WP_Error
     */
    private static function atomic_transition(int $app_id, string $expected_status, string $next_status, int $reviewer_id, string $timestamp_col) {
        global $wpdb;

        if (!in_array($timestamp_col, ['l1_verified_at', 'l2_verified_at'], true)) {
            return new WP_Error('gf_invalid_column', 'Cột thời gian duyệt không hợp lệ.');
        }

        $table = "{$wpdb->prefix}gf_installment_applications";
        $now   = current_time('mysql');

        $sql = $wpdb->prepare(
            "UPDATE {$table}
             SET status = %s, reviewer_id = %d, {$timestamp_col} = %s
             WHERE app_id = %d AND status = %s",
            $next_status,
            $reviewer_id,
            $now,
            $app_id,
            $expected_status
        );

        $affected = $wpdb->query($sql);
        if ($affected === 1) {
            return true;
        }

        $exists = self::get_application($app_id);
        if (!$exists) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ trả góp.');
        }

        return new WP_Error(
            'gf_invalid_state',
            sprintf('Không thể chuyển trạng thái: Hồ sơ #%d hiện đang ở trạng thái %s (yêu cầu %s).', $app_id, $exists['status'], $expected_status)
        );
    }

    private static function normalize_phone(string $phone): string {
        $clean = preg_replace('/[\s.\-()]+/', '', trim($phone));
        if ($clean === '' || $clean === null) {
            return '';
        }
        if (strpos($clean, '+84') === 0) {
            $clean = '0' . substr($clean, 3);
        } elseif (strpos($clean, '84') === 0 && strlen($clean) >= 11) {
            $clean = '0' . substr($clean, 2);
        }
        return $clean;
    }

    private static function is_blacklisted(string $type, string $value): bool {
        global $wpdb;
        $found = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT blacklist_id FROM {$wpdb->prefix}gf_fraud_blacklist
                 WHERE target_type = %s AND target_value = %s
                   AND (blocked_until IS NULL OR blocked_until > UTC_TIMESTAMP())
                 LIMIT 1",
                $type,
                $value
            )
        );
        return !empty($found);
    }
}

GF_Installment_Review::init();
