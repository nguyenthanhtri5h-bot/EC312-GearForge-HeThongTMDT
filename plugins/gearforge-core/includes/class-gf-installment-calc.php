<?php
/**
 * Student Installment Calculator & REST API Endpoint.
 *
 * Implements the standard GearForge installment formula (3, 6, 12 months)
 * referenced from TGDĐ, CellphoneS, GearVN, Xgear & MemoryZone.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Installment_Calc {

    private const FALLBACK_RATES = [
        3  => ['min_down_pct' => 20.0, 'monthly_interest_pct' => 0.0],
        6  => ['min_down_pct' => 20.0, 'monthly_interest_pct' => 1.2],
        12 => ['min_down_pct' => 20.0, 'monthly_interest_pct' => 1.5],
    ];

    public static function init(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
    }

    public static function register_routes(): void {
        register_rest_route('gearforge/v1', '/installment-calc', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [self::class, 'handle_calc_request'],
            'permission_callback' => '__return_true',
            'args'                => [
                'price'    => ['required' => true, 'type' => 'number'],
                'down_pct' => ['required' => true, 'type' => 'number'],
                'months'   => ['required' => true, 'type' => 'integer'],
            ],
        ]);
    }

    /**
     * REST callback for GET /wp-json/gearforge/v1/installment-calc.
     */
    public static function handle_calc_request(WP_REST_Request $request) {
        if (function_exists('gf_core_check_rate_limit')) {
            $rl = gf_core_check_rate_limit('installment_calc', 60, 60);
            if (is_wp_error($rl)) {
                return gf_core_rate_limit_rest_response($rl);
            }
        }

        $price    = (float) $request->get_param('price');
        $down_pct = (float) $request->get_param('down_pct');
        $months   = (int) $request->get_param('months');

        $result = self::calculate($price, $down_pct, $months);

        if (is_wp_error($result)) {
            return new WP_REST_Response(
                ['code' => $result->get_error_code(), 'message' => $result->get_error_message()],
                400
            );
        }

        return rest_ensure_response($result);
    }

    /**
     * Calculate downpayment, loan principal, total interest, and monthly amount.
     *
     * @return array|WP_Error
     */
    public static function calculate(float $price, float $down_pct, int $months) {
        if (!is_finite($price) || $price <= 0 || $price > 10000000000) {
            return new WP_Error('gf_invalid_price', 'Giá sản phẩm phải nằm trong khoảng 1 đến 10.000.000.000 VNĐ.');
        }

        $plan = self::get_plan_by_months($months);
        if ($plan === null) {
            return new WP_Error('gf_invalid_months', 'Kỳ hạn trả góp chỉ hỗ trợ 3, 6 hoặc 12 tháng.');
        }

        $min_down = (float) $plan['min_downpayment_pct'];
        if (!is_finite($down_pct) || $down_pct < $min_down || $down_pct > 80) {
            return new WP_Error(
                'gf_invalid_downpayment',
                sprintf('Tỷ lệ trả trước phải từ %.0f%% đến 80%%.', $min_down)
            );
        }

        $interest_pct = (float) $plan['monthly_interest_pct'];
        $downpayment  = (int) round($price * ($down_pct / 100));
        $principal    = (int) round($price - $downpayment);
        $total_int    = (int) round($principal * ($interest_pct / 100) * $months);
        $monthly      = (int) round(($principal + $total_int) / $months, -3);

        return [
            'plan_id'              => (int) $plan['plan_id'],
            'plan_name'            => $plan['plan_name'],
            'price'                => (int) round($price),
            'down_pct'             => $down_pct,
            'months'               => $months,
            'monthly_interest_pct' => $interest_pct,
            'downpayment_amount'   => $downpayment,
            'loan_principal'       => $principal,
            'total_interest'       => $total_int,
            'total_payable'        => $downpayment + $principal + $total_int,
            'monthly_amount'       => $monthly,
        ];
    }

    /**
     * Fetch active plan from wp_gf_installment_plans (with Object Cache) or fallback constants.
     */
    public static function get_plan_by_months(int $months): ?array {
        global $wpdb;

        $cache_key = 'plan_months_' . $months;
        $cached    = wp_cache_get($cache_key, 'gearforge_plans');
        if (is_array($cached)) {
            return $cached;
        }

        $table = "{$wpdb->prefix}gf_installment_plans";
        $row   = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT plan_id, plan_name, duration_months, min_downpayment_pct, monthly_interest_pct
                 FROM {$table}
                 WHERE duration_months = %d AND is_active = 1
                 LIMIT 1",
                $months
            ),
            ARRAY_A
        );

        if (is_array($row)) {
            wp_cache_set($cache_key, $row, 'gearforge_plans', 3600);
            return $row;
        }

        if (!isset(self::FALLBACK_RATES[$months])) {
            return null;
        }

        return [
            'plan_id'              => $months === 3 ? 1 : ($months === 6 ? 2 : 3),
            'plan_name'            => sprintf('Gói Sinh viên %d tháng', $months),
            'duration_months'      => $months,
            'min_downpayment_pct'  => self::FALLBACK_RATES[$months]['min_down_pct'],
            'monthly_interest_pct' => self::FALLBACK_RATES[$months]['monthly_interest_pct'],
        ];
    }
}

GF_Installment_Calc::init();
