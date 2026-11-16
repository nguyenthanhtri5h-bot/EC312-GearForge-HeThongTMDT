<?php
/**
 * Role-Based Access Control (RBAC) & Audit Logging for sensitive NĐ 13/2023 identity records.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_RBAC {
    public const ROLE_REVIEWER    = 'installment_reviewer';
    public const ROLE_ORDER_STAFF = 'order_staff';

    public const CAP_REVIEW_INSTALLMENTS = 'gf_review_installments';
    public const CAP_VIEW_ENCRYPTED_DOCS = 'gf_view_encrypted_docs';
    public const CAP_ASSIGN_SERIAL       = 'gf_assign_serial';
    public const CAP_MANAGE_BLACKLIST    = 'gf_manage_blacklist';

    public static function init(): void {
        add_action('init', [self::class, 'ensure_admin_caps']);
        add_action('show_user_profile', [self::class, 'render_edu_email_field']);
        add_action('edit_user_profile', [self::class, 'render_edu_email_field']);
        add_action('personal_options_update', [self::class, 'save_edu_email_field']);
        add_action('edit_user_profile_update', [self::class, 'save_edu_email_field']);
    }

    public static function register_roles_and_caps(): void {
        // InstallmentReviewer: allowed to decrypt and review L1/L2 installment apps, denied WooCommerce general settings.
        remove_role(self::ROLE_REVIEWER);
        add_role(self::ROLE_REVIEWER, 'Installment Reviewer (GearForge)', [
            'read'                        => true,
            self::CAP_REVIEW_INSTALLMENTS => true,
            self::CAP_VIEW_ENCRYPTED_DOCS => true,
        ]);

        // OrderStaff: allowed to manage normal orders and assign S/N, strictly FORBIDDEN from viewing encrypted IDs.
        remove_role(self::ROLE_ORDER_STAFF);
        add_role(self::ROLE_ORDER_STAFF, 'Order Staff (GearForge)', [
            'read'                  => true,
            'edit_shop_orders'      => true,
            'read_shop_order'       => true,
            'edit_others_shop_orders' => true,
            self::CAP_ASSIGN_SERIAL => true,
        ]);

        self::ensure_admin_caps();
    }

    public static function ensure_admin_caps(): void {
        $admin = get_role('administrator');
        if ($admin instanceof WP_Role) {
            foreach ([
                self::CAP_REVIEW_INSTALLMENTS,
                self::CAP_VIEW_ENCRYPTED_DOCS,
                self::CAP_ASSIGN_SERIAL,
                self::CAP_MANAGE_BLACKLIST,
            ] as $cap) {
                if (!$admin->has_cap($cap)) {
                    $admin->add_cap($cap);
                }
            }
        }
    }

    public static function can_review_installments(?int $user_id = null): bool {
        $uid = $user_id ?: get_current_user_id();
        if ($uid <= 0) {
            return false;
        }
        return user_can($uid, self::CAP_REVIEW_INSTALLMENTS) && user_can($uid, self::CAP_VIEW_ENCRYPTED_DOCS);
    }

    public static function can_assign_serial(?int $user_id = null): bool {
        $uid = $user_id ?: get_current_user_id();
        return $uid > 0 && (user_can($uid, self::CAP_ASSIGN_SERIAL) || user_can($uid, 'manage_woocommerce'));
    }

    public static function require_reviewer_or_403(): void {
        if (!is_user_logged_in() || !self::can_review_installments()) {
            self::log_audit('UNAUTHORIZED_SENSITIVE_ACCESS_ATTEMPT', get_current_user_id(), 0, [
                'uri' => sanitize_text_field($_SERVER['REQUEST_URI'] ?? ''),
            ]);
            wp_die(
                '403 Forbidden: Tài khoản của bạn không có quyền truy cập hồ sơ định danh (CCCD/Thẻ SV) theo Nghị định 13/2023/NĐ-CP.',
                '403 Forbidden',
                ['response' => 403]
            );
        }
    }

    public static function log_audit(string $action, int $actor_user_id, int $target_app_id, array $context = []): void {
        $vault_dir = GF_Vault_Crypto::get_vault_dir();
        if (!is_dir($vault_dir)) {
            return;
        }
        $entry = [
            'timestamp' => gmdate('c'),
            'action'    => $action,
            'actor_id'  => $actor_user_id,
            'app_id'    => $target_app_id,
            'ip'        => GF_Fraud_Guard::get_client_ip(),
            'context'   => $context,
        ];
        @file_put_contents(
            trailingslashit($vault_dir) . 'audit.log',
            wp_json_encode($entry, JSON_UNESCAPED_UNICODE) . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );
    }

    public static function is_valid_edu_email(string $email): bool {
        $email = sanitize_email($email);
        if (!is_email($email)) {
            return false;
        }
        return (bool) preg_match('/\.(edu\.vn|edu)$/i', $email);
    }

    public static function render_edu_email_field(WP_User $user): void {
        $edu_email = (string) get_user_meta($user->ID, 'gf_student_edu_email', true);
        $verified  = (int) get_user_meta($user->ID, 'gf_edu_verified', true);
        ?>
        <h3>Xác thực Sinh viên GearForge (.edu.vn)</h3>
        <table class="form-table">
            <tr>
                <th><label for="gf_student_edu_email">Email sinh viên (.edu.vn)</label></th>
                <td>
                    <input type="email" name="gf_student_edu_email" id="gf_student_edu_email" value="<?php echo esc_attr($edu_email); ?>" class="regular-text" />
                    <p class="description">Trạng thái: <?php echo $verified ? '<strong>Đã xác thực</strong>' : 'Chưa xác thực'; ?></p>
                </td>
            </tr>
        </table>
        <?php
    }

    public static function save_edu_email_field(int $user_id): void {
        if (!current_user_can('edit_user', $user_id)) {
            return;
        }
        if (isset($_POST['gf_student_edu_email'])) {
            $edu = sanitize_email((string) $_POST['gf_student_edu_email']);
            update_user_meta($user_id, 'gf_student_edu_email', $edu);
            update_user_meta($user_id, 'gf_edu_verified', self::is_valid_edu_email($edu) ? 1 : 0);
        }
    }
}
