<?php
/**
 * GearForge Core Activator.
 *
 * Creates the 4 extended MySQL tables (wp_gf_*) and seeds default
 * student installment plans on plugin activation.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Activator {

    /**
     * Run database migrations, seed installment plans, and prepare the vault directory.
     */
    public static function activate(): void {
        self::create_tables();
        self::seed_installment_plans();
        self::ensure_vault_directory();
    }

    /**
     * Create the 4 custom GearForge tables using the exact EC312 MySQL 8.0 schema.
     */
    private static function create_tables(): void {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $prefix          = $wpdb->prefix;

        $queries = [
            "CREATE TABLE IF NOT EXISTS {$prefix}gf_installment_plans (
                plan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                plan_name VARCHAR(100) NOT NULL,
                duration_months TINYINT UNSIGNED NOT NULL,
                min_downpayment_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
                monthly_interest_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                admin_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB {$charset_collate};",

            "CREATE TABLE IF NOT EXISTS {$prefix}gf_installment_applications (
                app_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
                INDEX idx_gf_app_order (order_id),
                INDEX idx_gf_app_user (user_id),
                INDEX idx_gf_app_status_id (status, app_id),
                INDEX idx_gf_app_cccd_hash (cccd_hash),
                CONSTRAINT fk_gf_app_plan FOREIGN KEY (plan_id) REFERENCES {$prefix}gf_installment_plans(plan_id)
            ) ENGINE=InnoDB {$charset_collate};",

            "CREATE TABLE IF NOT EXISTS {$prefix}gf_order_serials (
                serial_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT UNSIGNED NOT NULL,
                order_item_id BIGINT UNSIGNED NOT NULL,
                product_id BIGINT UNSIGNED NOT NULL,
                serial_number VARCHAR(100) NOT NULL,
                warranty_months SMALLINT UNSIGNED NOT NULL DEFAULT 12,
                warranty_end_date DATE NULL,
                assigned_by BIGINT UNSIGNED NOT NULL,
                assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_gf_serial_number (serial_number),
                INDEX idx_gf_serial_order_item (order_id, order_item_id)
            ) ENGINE=InnoDB {$charset_collate};",

            "CREATE TABLE IF NOT EXISTS {$prefix}gf_fraud_blacklist (
                blacklist_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                target_type ENUM('IP', 'USER', 'PHONE', 'CCCD_HASH') NOT NULL,
                target_value VARCHAR(150) NOT NULL,
                reason TEXT NOT NULL,
                created_by BIGINT UNSIGNED NOT NULL,
                blocked_until DATETIME NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_gf_blacklist_target (target_type, target_value)
            ) ENGINE=InnoDB {$charset_collate};",
        ];

        foreach ($queries as $sql) {
            $wpdb->query($sql);
        }
    }

    /**
     * Seed the 3 standard student installment plans (3, 6, 12 months) if empty.
     */
    private static function seed_installment_plans(): void {
        global $wpdb;

        $table = "{$wpdb->prefix}gf_installment_plans";
        $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");

        if ($count > 0) {
            return;
        }

        $plans = [
            [
                'plan_name'            => 'Gói Sinh viên 0% - 3 tháng',
                'duration_months'      => 3,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 0.00,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
            [
                'plan_name'            => 'Gói Sinh viên Tiêu chuẩn - 6 tháng',
                'duration_months'      => 6,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 1.20,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
            [
                'plan_name'            => 'Gói Sinh viên Linh hoạt - 12 tháng',
                'duration_months'      => 12,
                'min_downpayment_pct'  => 20.00,
                'monthly_interest_pct' => 1.50,
                'admin_fee'            => 0.00,
                'is_active'            => 1,
            ],
        ];

        foreach ($plans as $plan) {
            $wpdb->insert(
                $table,
                $plan,
                ['%s', '%d', '%f', '%f', '%f', '%d']
            );
        }
    }

    /**
     * Ensure the encrypted ID vault directory exists outside webroot and denies direct HTTP access.
     */
    private static function ensure_vault_directory(): void {
        $vault_dir = defined('GF_VAULT_DIR') ? GF_VAULT_DIR : '/var/www/gf-vault';

        if (!is_dir($vault_dir)) {
            wp_mkdir_p($vault_dir);
        }

        $htaccess = rtrim($vault_dir, '/\\') . '/.htaccess';
        if (is_dir($vault_dir) && !file_exists($htaccess)) {
            file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
        }
    }
}
