<?php
/**
 * Student Installment Application & 2-Layer Review Service (UC-10 & UC-11).
 *
 * Enforces sequential state transitions:
 * SUBMITTED -> L1_DOCS_VERIFIED -> APPROVED_WAITING_DOWNPAYMENT (or REJECTED / BLACKLISTED).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Installment_Review {

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
        if (!preg_match('/\.edu(\.vn)?$/i', $edu_email)) {
            return new WP_Error('gf_invalid_edu_email', 'Email sinh viên phải có đuôi .edu.vn hoặc .edu.');
        }

        $cccd_number = preg_replace('/\D/', '', (string) ($data['cccd_number'] ?? ''));
        if (strlen($cccd_number) !== 12) {
            return new WP_Error('gf_invalid_cccd', 'Số CCCD gắn chip phải gồm đúng 12 chữ số.');
        }

        $cccd_hash = hash('sha256', $cccd_number);
        if (self::is_blacklisted('CCCD_HASH', $cccd_hash) || self::is_blacklisted('USER', (string) ($data['user_id'] ?? 0))) {
            return new WP_Error('gf_blacklisted', 'Hồ sơ hoặc tài khoản nằm trong danh sách hạn chế gian lận.');
        }

        $cccd_path = GF_Vault_Crypto::encrypt_and_store_upload($cccd_file);
        if (is_wp_error($cccd_path)) {
            return $cccd_path;
        }

        $card_path = GF_Vault_Crypto::encrypt_and_store_upload($student_card_file);
        if (is_wp_error($card_path)) {
            return $card_path;
        }

        $table    = "{$wpdb->prefix}gf_installment_applications";
        $inserted = $wpdb->insert(
            $table,
            [
                'order_id'                    => (int) $data['order_id'],
                'user_id'                     => (int) $data['user_id'],
                'plan_id'                     => (int) $data['plan_id'],
                'student_code'                => sanitize_text_field($data['student_code'] ?? ''),
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
            return new WP_Error('gf_db_insert_failed', 'Không thể lưu hồ sơ trả góp vào cơ sở dữ liệu.');
        }

        return (int) $wpdb->insert_id;
    }

    /**
     * Layer 1 Review: Verify encrypted CCCD & Student Card images (SUBMITTED -> L1_DOCS_VERIFIED).
     *
     * @return true|WP_Error
     */
    public static function review_layer_1(int $app_id, int $reviewer_id) {
        global $wpdb;

        $app = self::get_application($app_id);
        if (!$app) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ trả góp.');
        }

        if ($app['status'] !== 'SUBMITTED') {
            return new WP_Error('gf_invalid_state', 'Chỉ có thể Duyệt Lớp 1 khi hồ sơ ở trạng thái SUBMITTED.');
        }

        $updated = $wpdb->update(
            "{$wpdb->prefix}gf_installment_applications",
            [
                'status'         => 'L1_DOCS_VERIFIED',
                'reviewer_id'    => $reviewer_id,
                'l1_verified_at' => current_time('mysql'),
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        return $updated !== false ? true : new WP_Error('gf_update_failed', 'Cập nhật Duyệt Lớp 1 thất bại.');
    }

    /**
     * Layer 2 Review: Confirm phone & .edu.vn email (L1_DOCS_VERIFIED -> APPROVED_WAITING_DOWNPAYMENT).
     * Blocks skipping Layer 1 (TC-13).
     *
     * @return true|WP_Error
     */
    public static function review_layer_2(int $app_id, int $reviewer_id) {
        global $wpdb;

        $app = self::get_application($app_id);
        if (!$app) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ trả góp.');
        }

        if ($app['status'] !== 'L1_DOCS_VERIFIED') {
            return new WP_Error(
                'gf_invalid_state',
                'Vi phạm quy trình 2 lớp: Phải hoàn tất Duyệt Lớp 1 (L1_DOCS_VERIFIED) trước khi Duyệt Lớp 2.'
            );
        }

        $updated = $wpdb->update(
            "{$wpdb->prefix}gf_installment_applications",
            [
                'status'         => 'APPROVED_WAITING_DOWNPAYMENT',
                'reviewer_id'    => $reviewer_id,
                'l2_verified_at' => current_time('mysql'),
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        return $updated !== false ? true : new WP_Error('gf_update_failed', 'Cập nhật Duyệt Lớp 2 thất bại.');
    }

    /**
     * Reject an application or flag as fraud into wp_gf_fraud_blacklist.
     *
     * @return true|WP_Error
     */
    public static function reject_application(int $app_id, int $reviewer_id, string $reason, bool $blacklist = false) {
        global $wpdb;

        $app = self::get_application($app_id);
        if (!$app) {
            return new WP_Error('gf_not_found', 'Không tìm thấy hồ sơ trả góp.');
        }

        $clean_reason = sanitize_textarea_field($reason);
        if ($clean_reason === '') {
            return new WP_Error('gf_reason_required', 'Bắt buộc phải nhập lý do từ chối hồ sơ.');
        }

        $new_status = $blacklist ? 'BLACKLISTED' : 'REJECTED';
        $wpdb->update(
            "{$wpdb->prefix}gf_installment_applications",
            [
                'status'        => $new_status,
                'reviewer_id'   => $reviewer_id,
                'reject_reason' => $clean_reason,
            ],
            ['app_id' => $app_id],
            ['%s', '%d', '%s'],
            ['%d']
        );

        if ($blacklist && !empty($app['cccd_hash'])) {
            $wpdb->replace(
                "{$wpdb->prefix}gf_fraud_blacklist",
                [
                    'target_type'  => 'CCCD_HASH',
                    'target_value' => $app['cccd_hash'],
                    'reason'       => $clean_reason,
                    'created_by'   => $reviewer_id,
                ],
                ['%s', '%s', '%s', '%d']
            );
        }

        if (function_exists('wc_get_order')) {
            $order = wc_get_order((int) $app['order_id']);
            if ($order) {
                $order->update_status('cancelled', 'Hồ sơ trả góp bị từ chối: ' . $clean_reason);
            }
        }

        return true;
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

    private static function is_blacklisted(string $type, string $value): bool {
        global $wpdb;
        $found = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT blacklist_id FROM {$wpdb->prefix}gf_fraud_blacklist
                 WHERE target_type = %s AND target_value = %s
                   AND (blocked_until IS NULL OR blocked_until > NOW())
                 LIMIT 1",
                $type,
                $value
            )
        );
        return !empty($found);
    }
}
