<?php
/**
 * Encrypted ID Vault (AES-256-CBC + HMAC-SHA256) outside webroot for NĐ 13/2023/NĐ-CP compliance.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Vault_Crypto {
    private const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
    private const ALLOWED_MIMES  = [
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
        'application/pdf' => 'pdf',
    ];

    public static function init(): void {
        add_action('wp_ajax_gf_vault_view_doc', [self::class, 'ajax_stream_decrypted_doc']);
        add_action('wp_ajax_nopriv_gf_vault_view_doc', [self::class, 'deny_unauthenticated']);
    }

    public static function get_vault_dir(): string {
        $env_dir = getenv('GF_VAULT_DIR');
        if (is_string($env_dir) && $env_dir !== '') {
            return rtrim($env_dir, "/\\");
        }
        if (defined('GF_VAULT_DIR')) {
            return rtrim((string) GF_VAULT_DIR, "/\\");
        }
        return '/var/www/gf-vault';
    }

    public static function ensure_vault_directory(): void {
        $dir = self::get_vault_dir();
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        if (is_dir($dir)) {
            $htaccess = trailingslashit($dir) . '.htaccess';
            if (!file_exists($htaccess)) {
                @file_put_contents($htaccess, "Order allow,deny\nDeny from all\n");
            }
            $index = trailingslashit($dir) . 'index.php';
            if (!file_exists($index)) {
                @file_put_contents($index, "<?php\n// Silence is golden.\n");
            }
        }
    }

    private static function get_binary_key(): string|WP_Error {
        $raw = getenv('GF_VAULT_ENCRYPTION_KEY');
        if ((!is_string($raw) || $raw === '') && defined('GF_VAULT_ENCRYPTION_KEY')) {
            $raw = (string) GF_VAULT_ENCRYPTION_KEY;
        }
        if (!is_string($raw) || strlen($raw) < 32 || str_starts_with($raw, 'replace_with_')) {
            return new WP_Error('gf_vault_key_missing', 'Chưa cấu hình biến môi trường GF_VAULT_ENCRYPTION_KEY hợp lệ.', ['status' => 500]);
        }
        if (ctype_xdigit($raw) && strlen($raw) === 64) {
            $bin = hex2bin($raw);
            if ($bin !== false) {
                return $bin;
            }
        }
        return hash('sha256', $raw, true);
    }

    /**
     * Validates MIME bytes, encrypts uploaded CCCD/Student Card using AES-256-CBC + HMAC-SHA256, stores in vault.
     */
    public static function encrypt_and_store_upload(array $file_array, string $prefix): array|WP_Error {
        if (empty($file_array['tmp_name']) || !isset($file_array['error']) || (int) $file_array['error'] !== UPLOAD_ERR_OK) {
            return new WP_Error('gf_upload_error', 'Tải tệp hồ sơ thất bại.', ['status' => 400]);
        }

        $size = (int) ($file_array['size'] ?? 0);
        if ($size <= 0 || $size > self::MAX_FILE_BYTES) {
            return new WP_Error('gf_file_too_large', 'Dung lượng tệp phải từ 1 byte đến tối đa 5MB.', ['status' => 400]);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = $finfo ? finfo_file($finfo, $file_array['tmp_name']) : '';
        if ($finfo) {
            finfo_close($finfo);
        }
        if (!is_string($mime) || !array_key_exists($mime, self::ALLOWED_MIMES)) {
            return new WP_Error('gf_invalid_mime', 'Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc tài liệu PDF.', ['status' => 400]);
        }

        $key = self::get_binary_key();
        if (is_wp_error($key)) {
            return $key;
        }

        $plaintext = file_get_contents($file_array['tmp_name']);
        if ($plaintext === false) {
            return new WP_Error('gf_read_error', 'Không thể đọc tệp tải lên.', ['status' => 500]);
        }

        self::ensure_vault_directory();
        $vault_dir = self::get_vault_dir();
        if (!is_dir($vault_dir) || !is_writable($vault_dir)) {
            return new WP_Error('gf_vault_unwritable', 'Thư mục lưu trữ bảo mật gf-vault chưa sẵn sàng.', ['status' => 500]);
        }

        $enc_key  = hash_hmac('sha256', 'enc', $key, true);
        $mac_key  = hash_hmac('sha256', 'mac', $key, true);
        $iv       = random_bytes(16);
        $payload  = wp_json_encode(['mime' => $mime, 'data' => base64_encode($plaintext)]);
        $cipher   = openssl_encrypt((string) $payload, 'AES-256-CBC', $enc_key, OPENSSL_RAW_DATA, $iv);
        if ($cipher === false) {
            return new WP_Error('gf_encrypt_failed', 'Mã hóa dữ liệu thất bại.', ['status' => 500]);
        }
        $mac      = hash_hmac('sha256', $iv . $cipher, $mac_key, true);
        $blob     = $iv . $mac . $cipher;

        $uuid = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : bin2hex(random_bytes(16));
        $safe_prefix = preg_replace('/[^a-z0-9_-]/i', '', $prefix);
        $filename = sprintf('%s_%s.enc', $safe_prefix ?: 'doc', $uuid);
        $dest     = trailingslashit($vault_dir) . $filename;

        if (file_put_contents($dest, $blob, LOCK_EX) === false) {
            return new WP_Error('gf_write_failed', 'Không thể ghi tệp mã hóa vào Vault.', ['status' => 500]);
        }
        @chmod($dest, 0600);

        return [
            'stored_name' => $filename,
            'mime_type'   => $mime,
            'sha256'      => hash('sha256', $plaintext),
        ];
    }

    public static function decrypt_vault_file(string $stored_name): array|WP_Error {
        $safe_name = basename($stored_name);
        if ($safe_name === '' || !preg_match('/^[a-zA-Z0-9_-]+\.enc$/', $safe_name)) {
            return new WP_Error('gf_invalid_vault_file', 'Tên tệp Vault không hợp lệ.', ['status' => 400]);
        }

        $full_path = trailingslashit(self::get_vault_dir()) . $safe_name;
        if (!file_exists($full_path) || !is_readable($full_path)) {
            return new WP_Error('gf_vault_not_found', 'Không tìm thấy tệp trong Vault.', ['status' => 404]);
        }

        $key = self::get_binary_key();
        if (is_wp_error($key)) {
            return $key;
        }

        $blob = file_get_contents($full_path);
        if ($blob === false || strlen($blob) <= 48) {
            return new WP_Error('gf_vault_corrupt', 'Dữ liệu Vault không hợp lệ.', ['status' => 500]);
        }

        $iv     = substr($blob, 0, 16);
        $mac    = substr($blob, 16, 32);
        $cipher = substr($blob, 48);

        $enc_key = hash_hmac('sha256', 'enc', $key, true);
        $mac_key = hash_hmac('sha256', 'mac', $key, true);
        $expected_mac = hash_hmac('sha256', $iv . $cipher, $mac_key, true);

        if (!hash_equals($expected_mac, $mac)) {
            return new WP_Error('gf_vault_tampered', 'Xác thực toàn vẹn tệp thất bại.', ['status' => 403]);
        }

        $json = openssl_decrypt($cipher, 'AES-256-CBC', $enc_key, OPENSSL_RAW_DATA, $iv);
        if ($json === false) {
            return new WP_Error('gf_decrypt_failed', 'Giải mã tệp thất bại.', ['status' => 500]);
        }

        $decoded = json_decode($json, true);
        if (!is_array($decoded) || empty($decoded['mime']) || empty($decoded['data'])) {
            return new WP_Error('gf_vault_decode_error', 'Định dạng dữ liệu giải mã lỗi.', ['status' => 500]);
        }

        $bytes = base64_decode((string) $decoded['data'], true);
        if ($bytes === false) {
            return new WP_Error('gf_vault_base64_error', 'Lỗi khôi phục dữ liệu nhị phân.', ['status' => 500]);
        }

        return [
            'mime_type' => (string) $decoded['mime'],
            'bytes'     => $bytes,
        ];
    }

    public static function deny_unauthenticated(): void {
        wp_die('403 Forbidden: Vui lòng đăng nhập bằng tài khoản có quyền xét duyệt.', '403 Forbidden', ['response' => 403]);
    }

    public static function ajax_stream_decrypted_doc(): void {
        GF_RBAC::require_reviewer_or_403();
        check_ajax_referer('gf_vault_view', '_wpnonce');

        $app_id = (int) ($_GET['app_id'] ?? 0);
        $doc    = sanitize_key((string) ($_GET['doc'] ?? 'cccd'));

        global $wpdb;
        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT app_id, cccd_encrypted_path, student_card_encrypted_path FROM {$wpdb->prefix}gf_installment_applications WHERE app_id = %d",
                $app_id
            ),
            ARRAY_A
        );
        if (!$row) {
            wp_die('404 Not Found: Không tìm thấy hồ sơ.', '404 Not Found', ['response' => 404]);
        }

        $path_col = $doc === 'student_card' ? 'student_card_encrypted_path' : 'cccd_encrypted_path';
        $res      = self::decrypt_vault_file((string) $row[$path_col]);
        if (is_wp_error($res)) {
            wp_die(esc_html($res->get_error_message()), 'Lỗi giải mã Vault', ['response' => 500]);
        }

        GF_RBAC::log_audit('DECRYPT_VIEW_DOCUMENT', get_current_user_id(), $app_id, ['doc_type' => $doc]);

        header('Content-Type: ' . $res['mime_type']);
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Content-Length: ' . strlen($res['bytes']));
        echo $res['bytes']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }
}
