<?php
/**
 * Fraud Guard Middleware: Rate Limiting (429) and Blacklist enforcement (403) against wp_gf_fraud_blacklist.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Fraud_Guard {
    public static function get_client_ip(): string {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        return sanitize_text_field((string) $ip);
    }

    /**
     * Enforces sliding-window request limit per IP + action using transients.
     */
    public static function check_rate_limit(string $action, int $user_id = 0, int $max_attempts = 5, int $window_seconds = 60): true|WP_Error {
        $max_attempts   = (int) apply_filters('gf_rate_limit_max_attempts', $max_attempts, $action);
        $window_seconds = (int) apply_filters('gf_rate_limit_window_seconds', $window_seconds, $action);

        $ip  = self::get_client_ip();
        $key = 'gf_rl_' . md5($action . '|' . $ip . '|' . $user_id);

        $data = get_transient($key);
        if (!is_array($data)) {
            $data = ['count' => 0, 'expires' => time() + $window_seconds];
        }

        if ($data['count'] >= $max_attempts) {
            return new WP_Error(
                'gf_rate_limited',
                'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút (Rate Limit 429).',
                ['status' => 429]
            );
        }

        $data['count']++;
        $ttl = max(1, (int) ($data['expires'] - time()));
        set_transient($key, $data, $ttl);
        return true;
    }

    /**
     * Checks IP, USER, PHONE, and CCCD_HASH against active wp_gf_fraud_blacklist entries.
     */
    public static function check_blacklist(array $identifiers): true|WP_Error {
        global $wpdb;
        $table = "{$wpdb->prefix}gf_fraud_blacklist";

        $checks = [];
        $params = [];
        foreach (['IP', 'USER', 'PHONE', 'CCCD_HASH'] as $type) {
            if (!empty($identifiers[$type])) {
                $checks[] = '(target_type = %s AND target_value = %s)';
                $params[] = $type;
                $params[] = sanitize_text_field((string) $identifiers[$type]);
            }
        }

        if (empty($checks)) {
            return true;
        }

        $where_or = implode(' OR ', $checks);
        $sql = $wpdb->prepare(
            "SELECT blacklist_id, target_type, reason, blocked_until
             FROM {$table}
             WHERE ({$where_or})
               AND (blocked_until IS NULL OR blocked_until > UTC_TIMESTAMP())
             LIMIT 1",
            ...$params
        );

        $hit = $wpdb->get_row($sql, ARRAY_A);
        if ($hit) {
            return new WP_Error(
                'gf_blacklisted',
                sprintf(
                    'Yêu cầu bị từ chối do nằm trong danh sách hạn chế (%s): %s',
                    $hit['target_type'],
                    $hit['reason']
                ),
                ['status' => 403]
            );
        }

        return true;
    }

    public static function add_blacklist_entry(string $target_type, string $target_value, string $reason, int $created_by, ?string $blocked_until = null): bool {
        global $wpdb;
        $allowed_types = ['IP', 'USER', 'PHONE', 'CCCD_HASH'];
        if (!in_array($target_type, $allowed_types, true) || trim($target_value) === '') {
            return false;
        }

        $table = "{$wpdb->prefix}gf_fraud_blacklist";
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT blacklist_id FROM {$table} WHERE target_type = %s AND target_value = %s",
            $target_type,
            $target_value
        ));

        if ($existing) {
            return (bool) $wpdb->update(
                $table,
                ['reason' => sanitize_textarea_field($reason), 'blocked_until' => $blocked_until],
                ['blacklist_id' => (int) $existing],
                ['%s', '%s'],
                ['%d']
            );
        }

        return (bool) $wpdb->insert(
            $table,
            [
                'target_type'   => $target_type,
                'target_value'  => sanitize_text_field($target_value),
                'reason'        => sanitize_textarea_field($reason),
                'created_by'    => $created_by,
                'blocked_until' => $blocked_until,
            ],
            ['%s', '%s', '%s', '%d', '%s']
        );
    }

    public static function remove_blacklist_entry(int $blacklist_id): bool {
        global $wpdb;
        return (bool) $wpdb->delete("{$wpdb->prefix}gf_fraud_blacklist", ['blacklist_id' => $blacklist_id], ['%d']);
    }
}
