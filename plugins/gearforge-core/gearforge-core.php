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

/**
 * Lightweight per-endpoint Layer 7 rate limiter scoped strictly to Role 4 routes.
 * Uses REMOTE_ADDR (never spoofable proxy headers) + optional user identity.
 *
 * @return true|WP_Error
 */
function gf_core_check_rate_limit(string $scope, int $limit, int $window_sec = 60, string $identity = '', bool $force_in_cli = false) {
    if (PHP_SAPI === 'cli' && !$force_in_cli) {
        return true;
    }

    $remote_ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    $subject   = $identity !== '' ? $identity : $remote_ip;
    $key       = 'gf_rl_' . md5($scope . '|' . $subject);

    $record = get_transient($key);
    $now    = time();

    if (!is_array($record) || ($record['reset'] ?? 0) <= $now) {
        set_transient($key, ['count' => 1, 'reset' => $now + $window_sec], $window_sec);
        return true;
    }

    $count = (int) ($record['count'] ?? 0) + 1;
    if ($count > $limit) {
        $retry_after = max(1, (int) $record['reset'] - $now);
        return new WP_Error(
            'gf_rate_limited',
            sprintf('Quá nhiều yêu cầu (%s). Vui lòng thử lại sau %d giây.', $scope, $retry_after),
            ['retry_after' => $retry_after]
        );
    }

    $ttl = max(1, (int) $record['reset'] - $now);
    set_transient($key, ['count' => $count, 'reset' => (int) $record['reset']], $ttl);
    return true;
}

/**
 * Convert a gf_rate_limited WP_Error into an HTTP 429 WP_REST_Response.
 */
function gf_core_rate_limit_rest_response(WP_Error $error): WP_REST_Response {
    $data        = $error->get_error_data();
    $retry_after = is_array($data) && !empty($data['retry_after']) ? (int) $data['retry_after'] : 60;
    $response    = new WP_REST_Response(
        ['code' => $error->get_error_code(), 'message' => $error->get_error_message()],
        429
    );
    $response->header('Retry-After', (string) $retry_after);
    return $response;
}

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
        'includes/class-gf-rma-manager.php',
        'admin/class-gf-admin-pages.php',
    ];

    foreach ($modules as $relative_path) {
        $full_path = GF_CORE_PATH . $relative_path;
        if (file_exists($full_path)) {
            require_once $full_path;
        }
    }
});
