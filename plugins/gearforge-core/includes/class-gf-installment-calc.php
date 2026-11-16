<?php
/**
 * Student Installment Calculator Service (3-6-12 months) & REST API endpoint.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Installment_Calc {
    public static function get_active_plans(): array {
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_plans";
        $rows  = $wpdb->get_results(
            "SELECT plan_id, plan_name, duration_months, min_downpayment_pct, monthly_interest_pct, admin_fee
             FROM {$table} WHERE is_active = 1 ORDER BY duration_months ASC",
            ARRAY_A
        );
        return is_array($rows) ? $rows : [];
    }

    public static function get_plan_by_months(int $months): ?array {
        global $wpdb;
        $table = "{$wpdb->prefix}gf_installment_plans";
        $row   = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT plan_id, plan_name, duration_months, min_downpayment_pct, monthly_interest_pct, admin_fee
                 FROM {$table} WHERE duration_months = %d AND is_active = 1 LIMIT 1",
                $months
            ),
            ARRAY_A
        );
        return is_array($row) ? $row : null;
    }

    public static function calculate(float $price, float $downpayment_pct, int $months): array {
        $price = max(0.0, $price);
        $plan  = self::get_plan_by_months($months);

        if (!$plan) {
            $fallback_rates = [3 => 0.0, 6 => 1.2, 12 => 1.5];
            $months = array_key_exists($months, $fallback_rates) ? $months : 6;
            $plan = [
                'plan_id'              => 0,
                'plan_name'            => "Gói {$months} tháng",
                'duration_months'      => $months,
                'min_downpayment_pct'  => 20.0,
                'monthly_interest_pct' => $fallback_rates[$months],
                'admin_fee'            => 0.0,
            ];
        }

        $min_pct  = (float) $plan['min_downpayment_pct'];
        $rate_pct = (float) $plan['monthly_interest_pct'];
        $admin_fee = (float) $plan['admin_fee'];
        $down_pct = max($min_pct, min(80.0, $downpayment_pct));

        $downpayment      = round($price * ($down_pct / 100.0), 0);
        $loan_principal   = max(0.0, $price - $downpayment);
        $total_interest   = round($loan_principal * ($rate_pct / 100.0) * $months, 0);
        $total_installment_payable = $loan_principal + $total_interest + $admin_fee;
        $monthly_amount   = $months > 0 ? (float) round($total_installment_payable / $months, -3) : 0.0;

        return [
            'plan_id'              => (int) $plan['plan_id'],
            'plan_name'            => $plan['plan_name'],
            'price'                => (int) round($price, 0),
            'downpayment_pct'      => $down_pct,
            'duration_months'      => $months,
            'monthly_interest_pct' => $rate_pct,
            'admin_fee'            => (int) round($admin_fee, 0),
            'downpayment_amount'   => (int) $downpayment,
            'loan_principal'       => (int) $loan_principal,
            'total_interest'       => (int) $total_interest,
            'monthly_amount'       => (int) $monthly_amount,
            'total_payable'        => (int) ($downpayment + ($monthly_amount * $months)),
        ];
    }

    public static function rest_calculate(WP_REST_Request $request): WP_REST_Response {
        $price    = (float) ($request->get_param('price') ?? 0);
        $down_pct = (float) ($request->get_param('down_pct') ?? 20);
        $months   = (int) ($request->get_param('months') ?? 6);

        if ($price <= 0) {
            return new WP_REST_Response(['error' => 'Tham số price phải lớn hơn 0'], 400);
        }

        return new WP_REST_Response(self::calculate($price, $down_pct, $months), 200);
    }
}
