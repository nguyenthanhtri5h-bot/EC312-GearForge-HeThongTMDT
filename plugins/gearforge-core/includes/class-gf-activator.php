<?php
/**
 * Plugin activation: creates the 4 wp_gf_* extension tables, seeds installment plans, and initializes RBAC roles.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Activator {
    public static function activate(): void {
        self::create_tables();
        self::seed_installment_plans();
        GF_RBAC::register_roles_and_caps();
        GF_Vault_Crypto::ensure_vault_directory();
        flush_rewrite_rules();
    }

    public static function create_tables(): void {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset_collate = $wpdb->get_charset_collate();
        $plans_table     = "{$wpdb->prefix}gf_installment_plans";
        $apps_table      = "{$wpdb->prefix}gf_installment_applications";
        $serials_table   = "{$wpdb->prefix}gf_order_serials";
        $blacklist_table = "{$wpdb->prefix}gf_fraud_blacklist";

        $sql_plans = "CREATE TABLE {$plans_table} (
            plan_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            plan_name VARCHAR(100) NOT NULL,
            duration_months TINYINT UNSIGNED NOT NULL,
            min_downpayment_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
            monthly_interest_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            admin_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (plan_id),
            UNIQUE KEY uk_gf_plan_months (duration_months)
        ) {$charset_collate};";

        $sql_apps = "CREATE TABLE {$apps_table} (
            app_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            order_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            plan_id BIGINT UNSIGNED NOT NULL,
            reviewer_id BIGINT UNSIGNED NULL,
            student_code VARCHAR(50) NOT NULL,
            student_edu_email VARCHAR(150) NOT NULL,
            cccd_hash CHAR(64) NOT NULL,
            cccd_encrypted_path VARCHAR(255) NOT NULL,
            student_card_encrypted_path VARCHAR(255) NOT NULL,
            downpayment_amount DECIMAL(14,2) NOT NULL,
            monthly_amount DECIMAL(14,2) NOT NULL,
            consent_nd13_accepted TINYINT(1) NOT NULL DEFAULT 0,
            consent_accepted_at DATETIME NULL,
            status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED',
            l1_verified_at DATETIME NULL,
            l2_verified_at DATETIME NULL,
            reject_reason TEXT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (app_id),
            KEY idx_gf_app_order (order_id),
            KEY idx_gf_app_user (user_id),
            KEY idx_gf_app_status (status),
            KEY idx_gf_app_cccd_hash (cccd_hash)
        ) {$charset_collate};";

        $sql_serials = "CREATE TABLE {$serials_table} (
            serial_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            order_id BIGINT UNSIGNED NOT NULL,
            order_item_id BIGINT UNSIGNED NOT NULL,
            product_id BIGINT UNSIGNED NOT NULL,
            serial_number VARCHAR(100) NOT NULL,
            warranty_months SMALLINT UNSIGNED NOT NULL DEFAULT 12,
            warranty_end_date DATE NULL,
            assigned_by BIGINT UNSIGNED NOT NULL,
            assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (serial_id),
            UNIQUE KEY uk_gf_serial_number (serial_number),
            KEY idx_gf_serial_order (order_id)
        ) {$charset_collate};";

        $sql_blacklist = "CREATE TABLE {$blacklist_table} (
            blacklist_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            target_type ENUM('IP', 'USER', 'PHONE', 'CCCD_HASH') NOT NULL,
            target_value VARCHAR(150) NOT NULL,
            reason TEXT NOT NULL,
            created_by BIGINT UNSIGNED NOT NULL,
            blocked_until DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (blacklist_id),
            UNIQUE KEY uk_gf_blacklist_target (target_type, target_value)
        ) {$charset_collate};";

        dbDelta($sql_plans);
        dbDelta($sql_apps);
        dbDelta($sql_serials);
        dbDelta($sql_blacklist);
    }

    public static function seed_installment_plans(): void {
        global $wpdb;
        $plans_table = "{$wpdb->prefix}gf_installment_plans";
        $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$plans_table}");
        if ($count > 0) {
            return;
        }

        $defaults = [
            [
                'plan_name'            => 'Gói Sinh viên 0% lãi (3 tháng)',
                'duration_months'      => 3,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 0.00,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
            [
                'plan_name'            => 'Gói Linh hoạt Sinh viên (6 tháng)',
                'duration_months'      => 6,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 1.20,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
            [
                'plan_name'            => 'Gói Nhẹ gánh Sinh viên (12 tháng)',
                'duration_months'      => 12,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 1.50,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
        ];

        foreach ($defaults as $row) {
            $wpdb->insert($plans_table, $row, ['%s', '%d', '%f', '%f', '%f', '%d']);
        }
    }
}
