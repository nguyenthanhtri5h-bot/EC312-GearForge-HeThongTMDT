<?php
/**
 * GearForge Return / Exchange / Warranty (RMA) Manager.
 *
 * Provides REST API endpoints for customers to submit and track RMA requests,
 * validates order ownership (anti-IDOR) and Serial Number binding,
 * and handles atomic state transitions (REQUESTED -> APPROVED -> COMPLETED / REJECTED)
 * with WooCommerce order refund & Serial Number release on completed returns.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_RMA_Manager {

    private const ALLOWED_TYPES = ['RETURN', 'EXCHANGE', 'WARRANTY'];
    private const ELIGIBLE_ORDER_STATUSES = ['gf-shipping', 'shipping', 'completed'];
    private const RETURN_WINDOW_DAYS = 15;

    private static bool $table_checked = false;

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/rma-request', [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => [self::class, 'handle_submit_rest'],
            'permission_callback' => static function (): bool {
                return is_user_logged_in();
            },
            'args'                => [
                'order_id'      => ['required' => true, 'type' => 'integer'],
                'request_type'  => ['required' => true, 'type' => 'string'],
                'reason'        => ['required' => true, 'type' => 'string'],
                'serial_number' => ['required' => false, 'type' => 'string'],
            ],
        ]);

        register_rest_route('gearforge/v1', '/rma-status/(?P<order_id>\d+)', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [self::class, 'handle_status_rest'],
            'permission_callback' => static function (WP_REST_Request $request): bool {
                if (!is_user_logged_in() || !function_exists('wc_get_order')) {
                    return false;
                }
                if (current_user_can('manage_woocommerce') || current_user_can('gf_review_installments')) {
                    return true;
                }
                $order = wc_get_order((int) $request->get_param('order_id'));
                return $order && (int) $order->get_user_id() === get_current_user_id();
            },
        ]);
    }

    public static function ensure_table(): void {
        if (self::$table_checked) {
            return;
        }
        self::$table_checked = true;
        if (class_exists('GF_Activator')) {
            GF_Activator::ensure_rma_table();
        }
    }

    /**
     * REST callback for POST /wp-json/gearforge/v1/rma-request.
     */
    public static function handle_submit_rest(WP_REST_Request $request) {
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
            return new WP_REST_Response(['code' => 'gf_forbidden', 'message' => 'Bạn không có quyền gửi yêu cầu đổi trả cho đơn hàng này.'], 403);
        }

        $rma_id = self::submit_request(
            $order_id,
            (int) $order->get_user_id() ?: $current_user_id,
            (string) $request->get_param('request_type'),
            (string) $request->get_param('reason'),
            (string) ($request->get_param('serial_number') ?? '')
        );

        if (is_wp_error($rma_id)) {
            $status = $rma_id->get_error_code() === 'gf_duplicate_rma' ? 409 : 400;
            return new WP_REST_Response(['code' => $rma_id->get_error_code(), 'message' => $rma_id->get_error_message()], $status);
        }

        return new WP_REST_Response(
            [
                'rma_id'       => $rma_id,
                'order_id'     => $order_id,
                'request_type' => strtoupper(sanitize_key((string) $request->get_param('request_type'))),
                'status'       => 'REQUESTED',
                'message'      => 'Đã tiếp nhận yêu cầu đổi trả / bảo hành.',
            ],
            201
        );
    }

    /**
     * REST callback for GET /wp-json/gearforge/v1/rma-status/{order_id}.
     */
    public static function handle_status_rest(WP_REST_Request $request) {
        global $wpdb;
        self::ensure_table();

        $order_id = (int) $request->get_param('order_id');
        $table    = "{$wpdb->prefix}gf_rma_requests";
        $rows     = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT rma_id, order_id, serial_number, request_type, reason, status, admin_note, reviewed_at, created_at
                 FROM {$table}
                 WHERE order_id = %d
                 ORDER BY rma_id DESC",
                $order_id
            ),
            ARRAY_A
        ) ?: [];

        return rest_ensure_response([
            'order_id' => $order_id,
            'requests' => $rows,
        ]);
    }

    /**
     * Submit a validated RMA request into wp_gf_rma_requests.
     *
     * @return int|WP_Error RMA ID on success.
     */
    public static function submit_request(int $order_id, int $user_id, string $request_type, string $reason, string $serial_number = '') {
        global $wpdb;
        self::ensure_table();

        if (!function_exists('wc_get_order')) {
            return new WP_Error('gf_wc_missing', 'WooCommerce chưa được kích hoạt.');
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('gf_order_not_found', 'Không tìm thấy đơn hàng.');
        }

        if (!in_array($order->get_status(), self::ELIGIBLE_ORDER_STATUSES, true)) {
            return new WP_Error(
                'gf_ineligible_order_status',
                sprintf('Đơn hàng #%d ở trạng thái "%s" không đủ điều kiện tạo yêu cầu đổi trả.', $order_id, $order->get_status())
            );
        }

        $clean_type = strtoupper(sanitize_key($request_type));
        if (!in_array($clean_type, self::ALLOWED_TYPES, true)) {
            return new WP_Error('gf_invalid_rma_type', 'Loại yêu cầu chỉ hỗ trợ: RETURN, EXCHANGE hoặc WARRANTY.');
        }

        if (in_array($clean_type, ['RETURN', 'EXCHANGE'], true)) {
            $completed_date = $order->get_date_completed();
            if ($completed_date && (time() - $completed_date->getTimestamp()) > (self::RETURN_WINDOW_DAYS * DAY_IN_SECONDS)) {
                return new WP_Error(
                    'gf_return_window_expired',
                    sprintf('Đã quá thời hạn %d ngày kể từ khi giao hoàn tất cho đơn #%d.', self::RETURN_WINDOW_DAYS, $order_id)
                );
            }
        }

        $clean_reason = sanitize_textarea_field($reason);
        if (mb_strlen($clean_reason) < 5) {
            return new WP_Error('gf_reason_too_short', 'Vui lòng mô tả lý do đổi trả tối thiểu 5 ký tự.');
        }

        $clean_serial      = strtoupper(sanitize_text_field($serial_number));
        $order_has_serials = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d", $order_id)
        ) > 0;

        if ($clean_serial === '' && $order_has_serials) {
            return new WP_Error(
                'gf_serial_required',
                sprintf('Đơn hàng #%d có gắn Serial Number, vui lòng chọn đúng mã S/N cần đổi trả / bảo hành.', $order_id)
            );
        }

        if ($clean_serial !== '') {
            $owned = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT serial_id FROM {$wpdb->prefix}gf_order_serials WHERE order_id = %d AND serial_number = %s LIMIT 1",
                    $order_id,
                    $clean_serial
                )
            );
            if (!$owned) {
                return new WP_Error('gf_serial_mismatch', sprintf('Mã Serial Number [%s] không thuộc đơn hàng #%d.', $clean_serial, $order_id));
            }
        }

        $table = "{$wpdb->prefix}gf_rma_requests";
        $open_dup = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT rma_id FROM {$table}
                 WHERE order_id = %d
                   AND COALESCE(serial_number, '') = %s
                   AND status IN ('REQUESTED', 'APPROVED')
                 LIMIT 1",
                $order_id,
                $clean_serial
            )
        );
        if ($open_dup) {
            return new WP_Error('gf_duplicate_rma', sprintf('Đã tồn tại yêu cầu RMA #%d đang xử lý cho đơn hàng này.', (int) $open_dup));
        }

        $inserted = $wpdb->insert(
            $table,
            [
                'order_id'      => $order_id,
                'user_id'       => $user_id,
                'serial_number' => $clean_serial !== '' ? $clean_serial : null,
                'request_type'  => $clean_type,
                'reason'        => $clean_reason,
                'status'        => 'REQUESTED',
            ],
            ['%d', '%d', '%s', '%s', '%s', '%s']
        );

        if ($inserted === false) {
            return new WP_Error('gf_rma_insert_failed', 'Không thể lưu yêu cầu đổi trả.');
        }

        $rma_id = (int) $wpdb->insert_id;
        $order->add_order_note(sprintf('Khách hàng gửi yêu cầu RMA #%d (%s%s): %s', $rma_id, $clean_type, $clean_serial !== '' ? " - S/N: {$clean_serial}" : '', $clean_reason));

        return $rma_id;
    }

    /**
     * Approve an RMA request: REQUESTED -> APPROVED.
     *
     * @return true|WP_Error
     */
    public static function approve_request(int $rma_id, int $reviewer_id, string $admin_note = '') {
        $res = self::atomic_transition($rma_id, 'REQUESTED', 'APPROVED', $reviewer_id, sanitize_textarea_field($admin_note));
        if ($res === true) {
            self::add_order_note_for_rma($rma_id, sprintf('RMA #%d đã được duyệt tiếp nhận.%s', $rma_id, $admin_note !== '' ? ' Ghi chú: ' . $admin_note : ''));
        }
        return $res;
    }

    /**
     * Reject an RMA request: REQUESTED -> REJECTED.
     *
     * @return true|WP_Error
     */
    public static function reject_request(int $rma_id, int $reviewer_id, string $admin_note) {
        $clean_note = sanitize_textarea_field($admin_note);
        if ($clean_note === '') {
            return new WP_Error('gf_reason_required', 'Bắt buộc phải nhập lý do từ chối yêu cầu đổi trả.');
        }
        $res = self::atomic_transition($rma_id, 'REQUESTED', 'REJECTED', $reviewer_id, $clean_note);
        if ($res === true) {
            self::add_order_note_for_rma($rma_id, sprintf('RMA #%d bị từ chối: %s', $rma_id, $clean_note));
        }
        return $res;
    }

    /**
     * Complete an approved RMA request: APPROVED -> COMPLETED inside a MySQL Transaction.
     * For RETURN requests, releases bound Serial Number(s), closes any active installment
     * application, and marks the WooCommerce order refunded only if all serials are returned.
     *
     * @return true|WP_Error
     */
    public static function complete_request(int $rma_id, int $reviewer_id, string $admin_note = '') {
        global $wpdb;
        self::ensure_table();

        $initial_rma = self::get_request($rma_id);
        if (!$initial_rma) {
            return new WP_Error('gf_rma_not_found', 'Không tìm thấy yêu cầu đổi trả.');
        }

        $order_id         = (int) $initial_rma['order_id'];
        $clean_note       = sanitize_textarea_field($admin_note);
        $released_serials = [];
        $remaining_count  = 0;
        $rma_type         = '';

        // Advisory lock per order prevents REPEATABLE READ snapshot races when 2 RMAs complete concurrently
        $lock_name = "gf_rma_order_{$order_id}";
        $locked    = (int) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 5)', $lock_name));
        if ($locked !== 1) {
            return new WP_Error('gf_rma_lock_busy', 'Hệ thống đang xử lý RMA khác cho đơn hàng này, vui lòng thử lại.');
        }

        try {
            $wpdb->query('START TRANSACTION');
            try {
                $rma = self::get_request($rma_id);
                if (!$rma) {
                    throw new RuntimeException('Không tìm thấy yêu cầu đổi trả.');
                }
                $rma_type = (string) $rma['request_type'];

                $now      = current_time('mysql');
                $affected = $wpdb->query(
                    $wpdb->prepare(
                        "UPDATE {$wpdb->prefix}gf_rma_requests
                         SET status = 'COMPLETED', reviewed_by = %d, reviewed_at = %s, admin_note = %s
                         WHERE rma_id = %d AND status = 'APPROVED'",
                        $reviewer_id,
                        $now,
                        $clean_note,
                        $rma_id
                    )
                );

                if ($affected !== 1) {
                    throw new RuntimeException(
                        sprintf('Không thể hoàn tất: RMA #%d hiện đang ở trạng thái %s (yêu cầu APPROVED).', $rma_id, $rma['status'])
                    );
                }

                if ($rma_type === 'RETURN') {
                    $serial_table = "{$wpdb->prefix}gf_order_serials";
                    if (!empty($rma['serial_number'])) {
                        $deleted = $wpdb->delete($serial_table, ['order_id' => $order_id, 'serial_number' => $rma['serial_number']], ['%d', '%s']);
                        if ($deleted) {
                            $released_serials[] = $rma['serial_number'];
                        }
                    } else {
                        $existing_serials = $wpdb->get_col(
                            $wpdb->prepare("SELECT serial_number FROM {$serial_table} WHERE order_id = %d", $order_id)
                        ) ?: [];
                        if (!empty($existing_serials)) {
                            $wpdb->delete($serial_table, ['order_id' => $order_id], ['%d']);
                            $released_serials = $existing_serials;
                        }
                    }

                    $remaining_count = (int) $wpdb->get_var(
                        $wpdb->prepare("SELECT COUNT(*) FROM {$serial_table} WHERE order_id = %d", $order_id)
                    );

                    // Close active installment application if full order is returned
                    if ($remaining_count === 0) {
                        $wpdb->query(
                            $wpdb->prepare(
                                "UPDATE {$wpdb->prefix}gf_installment_applications
                                 SET status = 'CLOSED', reject_reason = %s
                                 WHERE order_id = %d AND status IN ('SUBMITTED', 'L1_DOCS_VERIFIED', 'APPROVED_WAITING_DOWNPAYMENT', 'ACTIVE_INSTALLMENT')",
                                'Đóng hồ sơ do hoàn tất trả hàng RMA #' . $rma_id,
                                $order_id
                            )
                        );
                    }
                }

                $wpdb->query('COMMIT');
            } catch (Throwable $e) {
                $wpdb->query('ROLLBACK');
                return new WP_Error('gf_rma_tx_failed', $e->getMessage());
            }
        } finally {
            $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
        }

        if (function_exists('wc_get_order')) {
            $order = wc_get_order($order_id);
            if ($order) {
                $serial_info = !empty($released_serials) ? ' Đã thu hồi S/N: ' . implode(', ', $released_serials) . '.' : '';
                if ($rma_type === 'RETURN' && $remaining_count === 0 && $order->get_status() !== 'refunded') {
                    $order->update_status('refunded', sprintf('Hoàn tất trả hàng toàn phần theo RMA #%d.%s', $rma_id, $serial_info));
                } else {
                    $order->add_order_note(
                        sprintf('Đã hoàn tất xử lý RMA #%d (%s).%s%s', $rma_id, $rma_type, $serial_info, $clean_note !== '' ? ' Ghi chú: ' . $clean_note : '')
                    );
                }
            }
        }

        return true;
    }

    public static function get_request(int $rma_id): ?array {
        global $wpdb;
        self::ensure_table();
        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gf_rma_requests WHERE rma_id = %d", $rma_id),
            ARRAY_A
        );
        return is_array($row) ? $row : null;
    }

    private static function atomic_transition(int $rma_id, string $expected_status, string $next_status, int $reviewer_id, string $admin_note) {
        global $wpdb;
        self::ensure_table();

        $table = "{$wpdb->prefix}gf_rma_requests";
        $now   = current_time('mysql');

        $affected = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                 SET status = %s, reviewed_by = %d, reviewed_at = %s, admin_note = %s
                 WHERE rma_id = %d AND status = %s",
                $next_status,
                $reviewer_id,
                $now,
                $admin_note,
                $rma_id,
                $expected_status
            )
        );

        if ($affected === 1) {
            return true;
        }

        $exists = self::get_request($rma_id);
        if (!$exists) {
            return new WP_Error('gf_rma_not_found', 'Không tìm thấy yêu cầu đổi trả.');
        }

        return new WP_Error(
            'gf_invalid_rma_state',
            sprintf('Không thể chuyển trạng thái: RMA #%d hiện đang ở trạng thái %s (yêu cầu %s).', $rma_id, $exists['status'], $expected_status)
        );
    }

    private static function add_order_note_for_rma(int $rma_id, string $note): void {
        if (!function_exists('wc_get_order')) {
            return;
        }
        $rma = self::get_request($rma_id);
        if (!$rma) {
            return;
        }
        $order = wc_get_order((int) $rma['order_id']);
        if ($order) {
            $order->add_order_note($note);
        }
    }
}

GF_RMA_Manager::init();
