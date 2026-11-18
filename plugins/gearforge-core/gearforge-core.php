<?php
/**
 * Plugin Name: GearForge Core
 * Plugin URI:  https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT
 * Description: Custom Microkernel Plugin cho Hệ thống TMĐT GearForge (EC312 - UIT): Trả góp Sinh viên 3-6-12 tháng, Mã hóa NĐ 13/2023, Duyệt 2 lớp, Sandbox 3DS, Serial Number & Hóa đơn PDF T-VAN.
 * Version:     1.0.0
 * Author:      Nhóm 7 - EC312 UIT (Role 4: Lê Lưu Luân)
 * Text Domain: gearforge-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GF_CORE_VERSION', '1.0.0');
define('GF_CORE_PATH', plugin_dir_path(__FILE__));
define('GF_CORE_URL', plugin_dir_url(__FILE__));

if (!defined('GF_VAULT_DIR')) {
    $env_vault_dir = getenv('GF_VAULT_DIR');
    define('GF_VAULT_DIR', $env_vault_dir ? $env_vault_dir : '/var/www/gf-vault');
}

require_once GF_CORE_PATH . 'includes/class-gf-activator.php';

register_activation_hook(__FILE__, ['GF_Activator', 'activate']);

/**
 * Bootstrap optional GearForge modules as they are implemented across sprints.
 */
add_action('plugins_loaded', static function (): void {
    $modules = [
        'includes/class-gf-installment-calc.php',
        'includes/class-gf-vault-crypto.php',
        'includes/class-gf-installment-review.php',
        'includes/class-gf-payment-sandbox.php',
        'includes/class-gf-serial-manager.php',
        'includes/class-gf-invoice-pdf.php',
        'admin/class-gf-admin-pages.php',
    ];

    foreach ($modules as $relative_path) {
        $full_path = GF_CORE_PATH . $relative_path;
        if (file_exists($full_path)) {
            require_once $full_path;
        }
    }
});
