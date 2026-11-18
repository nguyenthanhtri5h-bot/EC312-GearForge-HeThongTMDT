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

        $cccd_hash = self::hash_cccd($cccd_number);
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

        $clean_reason = sanitize_textarea_field($reason);
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
                $bl_res = $wpdb->replace(
                    "{$wpdb->prefix}gf_fraud_blacklist",
                    [
                        'target_type'  => 'CCCD_HASH',
                        'target_value' => $app['cccd_hash'],
                        'reason'       => $clean_reason,
                        'created_by'   => $reviewer_id,
                    ],
                    ['%s', '%s', '%s', '%d']
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
