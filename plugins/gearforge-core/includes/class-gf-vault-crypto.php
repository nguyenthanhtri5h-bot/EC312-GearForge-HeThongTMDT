<?php
/**
 * Encrypted ID Vault (AES-256-CBC + HMAC-SHA256) for Decree 13/2023/ND-CP compliance.
 *
 * Validates uploaded CCCD & Student Card files (MIME via finfo, <= 5MB),
 * encrypts them outside webroot, and streams decrypted bytes only to authorized reviewers.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Vault_Crypto {

    private const CIPHER       = 'AES-256-CBC';
    private const MAX_BYTES    = 5242880; // 5 MB
    private const ALLOWED_MIME = [
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
        'application/pdf' => 'pdf',
    ];

    /**
     * Validate an uploaded file, encrypt with AES-256-CBC, and save into GF_VAULT_DIR.
     *
     * @param array $file Entry from $_FILES.
     * @return string|WP_Error Encrypted file path on success.
     */
    public static function encrypt_and_store_upload(array $file) {
        if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return new WP_Error('gf_upload_missing', 'Tệp tải lên không hợp lệ.');
        }

        if (($file['size'] ?? 0) > self::MAX_BYTES) {
            return new WP_Error('gf_file_too_large', 'Dung lượng tệp vượt quá giới hạn tối đa 5MB.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($file['tmp_name']);
        if (!isset(self::ALLOWED_MIME[$mime])) {
            return new WP_Error('gf_invalid_mime', 'Chỉ chấp nhận tệp JPG, PNG hoặc PDF.');
        }

        $raw_bytes = file_get_contents($file['tmp_name']);
        if ($raw_bytes === false) {
            return new WP_Error('gf_read_failed', 'Không thể đọc nội dung tệp tải lên.');
        }

        return self::encrypt_bytes($raw_bytes, $mime);
    }

    /**
     * Encrypt raw bytes and persist as an authenticated payload (v2: separated enc/mac subkeys).
     *
     * @return string|WP_Error Relative filename inside GF_VAULT_DIR.
     */
    public static function encrypt_bytes(string $plaintext, string $mime) {
        $master_key = self::get_encryption_key();
        if (is_wp_error($master_key)) {
            return $master_key;
        }

        $enc_key    = self::derive_subkey($master_key, 'gf_vault_enc_v2');
        $mac_key    = self::derive_subkey($master_key, 'gf_vault_mac_v2');
        $iv_len     = openssl_cipher_iv_length(self::CIPHER);
        $iv         = random_bytes($iv_len);
        $ciphertext = openssl_encrypt($plaintext, self::CIPHER, $enc_key, OPENSSL_RAW_DATA, $iv);

        if ($ciphertext === false) {
            return new WP_Error('gf_encrypt_failed', 'Lỗi mã hóa dữ liệu định danh.');
        }

        $mac      = hash_hmac('sha256', 'v2|' . $mime . '|' . $iv . $ciphertext, $mac_key, true);
        $envelope = wp_json_encode([
            'v'    => 2,
            'mime' => $mime,
            'data' => base64_encode($iv . $mac . $ciphertext),
        ]);

        $vault_dir = rtrim(GF_VAULT_DIR, '/\\');
        if (!is_dir($vault_dir)) {
            wp_mkdir_p($vault_dir);
        }

        $filename  = wp_generate_uuid4() . '.gfenc';
        $full_path = $vault_dir . DIRECTORY_SEPARATOR . $filename;

        if (file_put_contents($full_path, $envelope) === false) {
            return new WP_Error('gf_vault_write_failed', 'Không thể ghi tệp vào vùng lưu trữ bảo mật.');
        }

        @chmod($full_path, 0600);
        return $filename;
    }

    /**
     * Decrypt a stored vault file after checking path containment and HMAC integrity.
     * Supports both v2 (separated subkeys + authenticated MIME) and legacy v1 envelopes.
     *
     * @return array{mime:string, bytes:string}|WP_Error
     */
    public static function decrypt_file(string $stored_filename) {
        $master_key = self::get_encryption_key();
        if (is_wp_error($master_key)) {
            return $master_key;
        }

        $vault_real = realpath(GF_VAULT_DIR);
        $target     = $vault_real ? realpath($vault_real . DIRECTORY_SEPARATOR . basename($stored_filename)) : false;

        if (!$vault_real || !$target || strpos($target, $vault_real) !== 0 || !is_file($target)) {
            return new WP_Error('gf_vault_not_found', 'Không tìm thấy tệp hồ sơ trong vùng bảo mật.');
        }

        $envelope = json_decode((string) file_get_contents($target), true);
        if (!is_array($envelope) || empty($envelope['data']) || empty($envelope['mime'])) {
            return new WP_Error('gf_corrupt_vault', 'Định dạng tệp mã hóa không hợp lệ.');
        }

        $raw    = base64_decode($envelope['data'], true);
        $iv_len = openssl_cipher_iv_length(self::CIPHER);
        if ($raw === false || strlen($raw) <= $iv_len + 32) {
            return new WP_Error('gf_corrupt_payload', 'Dữ liệu mã hóa bị hỏng.');
        }

        $iv         = substr($raw, 0, $iv_len);
        $mac        = substr($raw, $iv_len, 32);
        $ciphertext = substr($raw, $iv_len + 32);
        $is_v2      = isset($envelope['v']) && (int) $envelope['v'] === 2;

        $enc_key      = $is_v2 ? self::derive_subkey($master_key, 'gf_vault_enc_v2') : $master_key;
        $mac_key      = $is_v2 ? self::derive_subkey($master_key, 'gf_vault_mac_v2') : $master_key;
        $mac_payload  = $is_v2 ? ('v2|' . $envelope['mime'] . '|' . $iv . $ciphertext) : ($iv . $ciphertext);
        $expected_mac = hash_hmac('sha256', $mac_payload, $mac_key, true);

        if (!hash_equals($expected_mac, $mac)) {
            return new WP_Error('gf_tampered_file', 'Cảnh báo: Tệp hồ sơ có dấu hiệu bị thay đổi trái phép.');
        }

        $plaintext = openssl_decrypt($ciphertext, self::CIPHER, $enc_key, OPENSSL_RAW_DATA, $iv);
        if ($plaintext === false) {
            return new WP_Error('gf_decrypt_failed', 'Giải mã tệp hồ sơ thất bại.');
        }

        return [
            'mime'  => $envelope['mime'],
            'bytes' => $plaintext,
        ];
    }

    /**
     * Safely delete a stored encrypted file inside GF_VAULT_DIR (used for rollback on failed submissions).
     */
    public static function delete_stored_file(string $stored_filename): void {
        if ($stored_filename === '') {
            return;
        }
        $vault_real = realpath(GF_VAULT_DIR);
        $target     = $vault_real ? realpath($vault_real . DIRECTORY_SEPARATOR . basename($stored_filename)) : false;
        if ($vault_real && $target && strpos($target, $vault_real) === 0 && is_file($target)) {
            @unlink($target);
        }
    }

    private static function derive_subkey(string $master_key, string $purpose): string {
        return hash_hmac('sha256', $purpose, $master_key, true);
    }

    /**
     * Derive a 32-byte binary key from GF_VAULT_ENCRYPTION_KEY environment variable.
     *
     * @return string|WP_Error
     */
    private static function get_encryption_key() {
        $raw_key = getenv('GF_VAULT_ENCRYPTION_KEY');
        if (!$raw_key && defined('GF_VAULT_ENCRYPTION_KEY')) {
            $raw_key = GF_VAULT_ENCRYPTION_KEY;
        }

        if (empty($raw_key) || $raw_key === 'replace_with_32_byte_hex_key_in_env') {
            return new WP_Error('gf_missing_key', 'Chưa cấu hình GF_VAULT_ENCRYPTION_KEY trong biến môi trường.');
        }

        if (ctype_xdigit($raw_key) && strlen($raw_key) === 64) {
            return hex2bin($raw_key);
        }

        return hash('sha256', $raw_key, true);
    }
}
