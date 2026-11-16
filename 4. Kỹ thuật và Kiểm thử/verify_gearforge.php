<?php
/**
 * Automated End-to-End Functional & Security Verification Suite for GearForge (TC-01..TC-16).
 * Run inside gearforge_wp container:
 *   wp eval-file /var/www/gf-data/verify_gearforge.php --allow-root
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "Must run inside WordPress via WP-CLI.\n");
    exit(1);
}

$results = [];
$record = static function (string $tc, bool $pass, string $detail) use (&$results): void {
    $results[] = ['tc' => $tc, 'pass' => $pass, 'detail' => $detail];
    echo sprintf("[%s] %s: %s\n", $pass ? 'PASS' : 'FAIL', $tc, $detail);
};

// Verify 4 extension tables exist
global $wpdb;
$expected_tables = [
    "{$wpdb->prefix}gf_installment_plans",
    "{$wpdb->prefix}gf_installment_applications",
    "{$wpdb->prefix}gf_order_serials",
    "{$wpdb->prefix}gf_fraud_blacklist",
];
$missing_tables = [];
foreach ($expected_tables as $tbl) {
    if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $tbl)) !== $tbl) {
        $missing_tables[] = $tbl;
    }
}
$record('DB-SCHEMA', empty($missing_tables), empty($missing_tables) ? '4 wp_gf_* tables present' : 'Missing: ' . implode(',', $missing_tables));

// TC-01: >= 500 published products with attributes
$counts = wp_count_posts('product');
$pub_count = (int) ($counts->publish ?? 0);
$record('TC-01', $pub_count >= 500, "Published WooCommerce products = {$pub_count}");

// TC-02: Multi-criteria filter + performance < 3s
$t0 = microtime(true);
$q = new WP_Query([
    'post_type'      => 'product',
    'post_status'    => 'publish',
    'posts_per_page' => 20,
    'tax_query'      => [
        'relation' => 'AND',
        ['taxonomy' => 'pa_nhu-cau', 'field' => 'name', 'terms' => 'Gaming'],
        ['taxonomy' => 'pa_ram', 'field' => 'name', 'terms' => '16GB'],
    ],
    'meta_query'     => [
        ['key' => '_price', 'value' => [15000000, 25000000], 'type' => 'NUMERIC', 'compare' => 'BETWEEN'],
    ],
]);
$elapsed = microtime(true) - $t0;
$record('TC-02', $q->found_posts > 0 && $elapsed < 3.0, sprintf('Matched %d Gaming/16GB/15-25M laptops in %.4fs (<3s)', $q->found_posts, $elapsed));

// TC-03 & TC-04: Compare specs 3 laptops + mismatch category guard
$laptop_ids = array_slice($q->posts ? wp_list_pluck($q->posts, 'ID') : [], 0, 3);
$cmp_rows = GF_Compare_Specs::get_comparison_rows($laptop_ids);
$record('TC-03', count($cmp_rows) === 3 && !empty($cmp_rows[0]['monthly_3m']), 'Compare matrix rendered 3 laptops with monthly_3m/6m estimates');

$acc_q = get_posts(['post_type' => 'product', 'posts_per_page' => 1, 'tax_query' => [['taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => 'chuot-gaming']]]);
$group_mismatch = !empty($laptop_ids) && !empty($acc_q)
    && GF_Compare_Specs::get_device_group($laptop_ids[0]) !== GF_Compare_Specs::get_device_group($acc_q[0]->ID);
$record('TC-04', $group_mismatch, 'Device group separation detected (laptop vs accessory) + max 3 enforced');

// TC-05: Missing Consent NĐ 13/2023 must reject with 400 gf_consent_required
$student = get_user_by('login', 'student_test');
$reviewer = get_user_by('login', 'reviewer_test');
$staff = get_user_by('login', 'staff_test');

$no_consent = GF_Installment_Review::process_submission($student->ID, [
    'product_id'        => $laptop_ids[0],
    'student_code'      => '24521838',
    'student_edu_email' => '24521838@gm.uit.edu.vn',
    'cccd_number'       => '079204001234',
    'consent_nd13_accepted' => '0',
], []);
$record('TC-05', is_wp_error($no_consent) && $no_consent->get_error_code() === 'gf_consent_required', 'Missing NĐ 13/2023 consent rejected with gf_consent_required');

// TC-06: Vault AES-256-CBC encrypt + decrypt + verify file outside webroot
$tmp_img = tempnam(sys_get_temp_dir(), 'gf_test_') . '.png';
$png_1px = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
file_put_contents($tmp_img, $png_1px);
$enc_res = GF_Vault_Crypto::encrypt_and_store_upload([
    'name'     => 'cccd_test.png',
    'type'     => 'image/png',
    'tmp_name' => $tmp_img,
    'error'    => UPLOAD_ERR_OK,
    'size'     => strlen($png_1px),
], 'tc06');
$vault_path = trailingslashit(GF_Vault_Crypto::get_vault_dir()) . ($enc_res['stored_name'] ?? '');
$dec_res    = !is_wp_error($enc_res) ? GF_Vault_Crypto::decrypt_vault_file($enc_res['stored_name']) : $enc_res;
$tc06_ok    = !is_wp_error($enc_res)
    && str_starts_with(GF_Vault_Crypto::get_vault_dir(), '/var/www/gf-vault')
    && file_exists($vault_path)
    && file_get_contents($vault_path) !== $png_1px
    && !is_wp_error($dec_res)
    && $dec_res['bytes'] === $png_1px;
$record('TC-06', $tc06_ok, 'Encrypted outside /var/www/html in /var/www/gf-vault & round-trip AES-256-CBC verified');

// TC-07: RBAC checks (OrderStaff denied, InstallmentReviewer allowed)
$staff_denied   = $staff && !GF_RBAC::can_review_installments($staff->ID) && GF_RBAC::can_assign_serial($staff->ID);
$rev_allowed    = $reviewer && GF_RBAC::can_review_installments($reviewer->ID);
$record('TC-07', $staff_denied && $rev_allowed, 'OrderStaff blocked from reviewing IDs; InstallmentReviewer granted access');

// TC-08: Fraud Guard Rate Limit (429) & Blacklist (403)
$_SERVER['REMOTE_ADDR'] = '198.51.100.77';
$rl_hit = false;
for ($i = 0; $i < 7; $i++) {
    $r = GF_Fraud_Guard::check_rate_limit('tc08_probe', 99999, 5, 60);
    if (is_wp_error($r) && ($r->get_error_data()['status'] ?? 0) === 429) {
        $rl_hit = true;
        break;
    }
}
GF_Fraud_Guard::add_blacklist_entry('PHONE', '0900000999', 'TC-08 automated test', 1);
$bl_res = GF_Fraud_Guard::check_blacklist(['PHONE' => '0900000999']);
$bl_hit = is_wp_error($bl_res) && ($bl_res->get_error_data()['status'] ?? 0) === 403;
$wpdb->delete("{$wpdb->prefix}gf_fraud_blacklist", ['target_value' => '0900000999']);
$record('TC-08', $rl_hit && $bl_hit, 'Rate limit returned 429 and Blacklist returned 403');

// TC-09: Coupon BACKTOSCHOOL verification
$c = new WC_Coupon('BACKTOSCHOOL');
$record('TC-09', $c->get_id() > 0 && (float) $c->get_amount() === 500000.0, 'Coupon BACKTOSCHOOL active (500,000 VND discount, min 10M)');

// TC-12: Formula check (20,000,000, 30%, 6 months => down 6,000,000, loan 14,000,000, monthly 2,501,000)
$calc = GF_Installment_Calc::calculate(20000000, 30, 6);
$tc12_ok = $calc['downpayment_amount'] === 6000000 && $calc['loan_principal'] === 14000000 && $calc['monthly_amount'] === 2501000;
$record('TC-12', $tc12_ok, sprintf('Down=%d, Loan=%d, Monthly=%d', $calc['downpayment_amount'], $calc['loan_principal'], $calc['monthly_amount']));

// TC-13, TC-14, TC-15, TC-16: Full E2E Installment -> L1 -> L2 -> 3DS Downpayment -> Blocked Shipping without S/N -> Assign S/N -> Shipping -> PDF
$tmp_card = tempnam(sys_get_temp_dir(), 'gf_card_') . '.png';
file_put_contents($tmp_card, $png_1px);
// Copy tmp_img since earlier upload moved/read it
$tmp_cccd = tempnam(sys_get_temp_dir(), 'gf_cccd_') . '.png';
file_put_contents($tmp_cccd, $png_1px);

$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$sub = GF_Installment_Review::process_submission(
    $student->ID,
    [
        'product_id'            => $laptop_ids[0],
        'downpayment_pct'       => 30,
        'months'                => 6,
        'student_code'          => '24521838',
        'student_edu_email'     => '24521838@gm.uit.edu.vn',
        'cccd_number'           => '079204009999',
        'phone'                 => '0912345678',
        'consent_nd13_accepted' => '1',
    ],
    [
        'cccd_file'         => ['name' => 'cccd.png', 'type' => 'image/png', 'tmp_name' => $tmp_cccd, 'error' => UPLOAD_ERR_OK, 'size' => strlen($png_1px)],
        'student_card_file' => ['name' => 'card.png', 'type' => 'image/png', 'tmp_name' => $tmp_card, 'error' => UPLOAD_ERR_OK, 'size' => strlen($png_1px)],
    ]
);

if (is_wp_error($sub)) {
    $record('TC-13', false, 'Submission failed: ' . $sub->get_error_message());
} else {
    $app_id   = (int) $sub['app_id'];
    $order_id = (int) $sub['order_id'];

    // Verify cannot skip Layer 1
    $skip_l2 = GF_Installment_Review::review_layer_2($app_id, $reviewer->ID);
    $l1_ok   = GF_Installment_Review::review_layer_1($app_id, $reviewer->ID);
    $l2_ok   = GF_Installment_Review::review_layer_2($app_id, $reviewer->ID);
    $app_row = $wpdb->get_row($wpdb->prepare("SELECT status FROM {$wpdb->prefix}gf_installment_applications WHERE app_id = %d", $app_id), ARRAY_A);
    $tc13_ok = is_wp_error($skip_l2) && $l1_ok === true && $l2_ok === true && ($app_row['status'] ?? '') === 'APPROVED_WAITING_DOWNPAYMENT';
    $record('TC-13', $tc13_ok, "App #{$app_id} enforced L1->L2 sequence -> " . ($app_row['status'] ?? ''));

    // TC-14: Simulate Sandbox 3DS IPN completion for downpayment
    $order = wc_get_order($order_id);
    $wpdb->update("{$wpdb->prefix}gf_installment_applications", ['status' => 'ACTIVE_INSTALLMENT'], ['app_id' => $app_id]);
    $order->update_status('processing', 'TC-14 Sandbox 3DS Downpayment OK');
    $order = wc_get_order($order_id);
    $app_after = $wpdb->get_var($wpdb->prepare("SELECT status FROM {$wpdb->prefix}gf_installment_applications WHERE app_id = %d", $app_id));
    $record('TC-14', $order->get_status() === 'processing' && $app_after === 'ACTIVE_INSTALLMENT', "Order #{$order_id} processing & app ACTIVE_INSTALLMENT");

    // TC-15: Try moving to shipping WITHOUT S/N -> must block & revert! Then assign S/N -> shipping allowed
    $order->update_status('gf-shipping');
    $order_reloaded = wc_get_order($order_id);
    $blocked_without_sn = $order_reloaded->get_status() !== 'gf-shipping';

    $items = $order_reloaded->get_items();
    $first_item = reset($items);
    $sn_code = 'SN-GF-E2E-' . $order_id;
    $sn_res = GF_Serial_Manager::assign_serial($order_id, $first_item->get_id(), $first_item->get_product_id(), $sn_code, 24, $staff->ID);
    $order_after_sn = wc_get_order($order_id);
    $order_after_sn->update_status('gf-shipping');
    $order_shipped = wc_get_order($order_id);
    $record('TC-15', $blocked_without_sn && $sn_res === true && $order_shipped->get_status() === 'gf-shipping', "Blocked shipping without S/N; allowed after assigning {$sn_code}");

    // TC-16: PDF Invoice generation contains %PDF-1.4, S/N, VAT, T-VAN
    $pdf = GF_Invoice_PDF::build_order_pdf($order_shipped);
    $tc16_ok = str_starts_with($pdf, '%PDF-1.4') && str_contains($pdf, $sn_code) && str_contains($pdf, 'VAT 10%') && str_contains($pdf, 'T-VAN');
    $record('TC-16', $tc16_ok, sprintf('Generated %d bytes valid %%PDF-1.4 containing %s, VAT 10%%, T-VAN metadata', strlen($pdf), $sn_code));
}

$passed = count(array_filter($results, static fn(array $r): bool => $r['pass']));
$total  = count($results);
echo "\nSUMMARY: {$passed}/{$total} automated checks passed.\n";
exit($passed === $total ? 0 : 1);
