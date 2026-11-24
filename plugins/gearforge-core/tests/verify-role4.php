<?php
/**
 * GearForge Core (Role 4) Regression & Security Verification Suite.
 *
 * Usage inside Docker:
 *   docker exec gearforge_wp php /var/www/html/wp-content/plugins/gearforge-core/tests/verify-role4.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only.\n");
}

require_once '/var/www/html/wp-load.php';

$failures = 0;
$passed   = 0;

function gf_assert(bool $cond, string $label): void {
    global $failures, $passed;
    if ($cond) {
        $passed++;
        echo "[PASS] {$label}\n";
    } else {
        $failures++;
        echo "[FAIL] {$label}\n";
    }
}

$student = get_user_by('login', 'user');
$admin   = get_user_by('login', 'admin');
if (!$student || !$admin) {
    fwrite(STDERR, "Missing demo users 'user' or 'admin'.\n");
    exit(1);
}

$created_order_ids = [];
$created_vault     = [];

try {
    // 1. Vault Crypto v2 + legacy v1 compatibility
    $legacy_files = glob(rtrim(GF_VAULT_DIR, '/\\') . '/*.gfenc') ?: [];
    if (!empty($legacy_files)) {
        $legacy_res = GF_Vault_Crypto::decrypt_file(basename($legacy_files[0]));
        gf_assert(!is_wp_error($legacy_res) && !empty($legacy_res['bytes']), 'Vault Crypto backward-compatible decrypt for legacy v1 file');
    }

    $v2_file = GF_Vault_Crypto::encrypt_bytes('GEARFORGE_V2_TEST_BYTES', 'image/png');
    gf_assert(is_string($v2_file) && $v2_file !== '', 'Vault Crypto v2 encrypt_bytes succeeds');
    if (is_string($v2_file)) {
        $created_vault[] = $v2_file;
        $v2_raw          = json_decode((string) file_get_contents(rtrim(GF_VAULT_DIR, '/\\') . '/' . $v2_file), true);
        gf_assert(($v2_raw['v'] ?? 0) === 2, 'Vault Crypto v2 envelope stores version 2');
        $v2_dec = GF_Vault_Crypto::decrypt_file($v2_file);
        gf_assert(!is_wp_error($v2_dec) && $v2_dec['bytes'] === 'GEARFORGE_V2_TEST_BYTES', 'Vault Crypto v2 decrypt verifies separated MAC & MIME');
        GF_Vault_Crypto::delete_stored_file($v2_file);
        gf_assert(!file_exists(rtrim(GF_VAULT_DIR, '/\\') . '/' . $v2_file), 'Vault Crypto delete_stored_file cleans up file');
    }

    // 2. Activator .htaccess Apache 2.4 + 2.2 check
    GF_Activator::activate();
    $htaccess_body = (string) @file_get_contents(rtrim(GF_VAULT_DIR, '/\\') . '/.htaccess');
    gf_assert(strpos($htaccess_body, 'Require all denied') !== false, 'Activator .htaccess includes Apache 2.4 Require all denied');

    // 3. Installment Calc TC-12
    $calc = GF_Installment_Calc::calculate(20000000, 30, 6);
    gf_assert(
        !is_wp_error($calc)
        && $calc['downpayment_amount'] === 6000000
        && $calc['loan_principal'] === 14000000
        && $calc['total_interest'] === 1008000
        && $calc['monthly_amount'] === 2501000,
        'TC-12 installment formula matches 6M 30% downpayment spec'
    );

    // 4. Create temporary WooCommerce order for end-to-end flow
    $order = wc_create_order(['customer_id' => $student->ID]);
    $item  = new WC_Order_Item_Product();
    $item->set_name('Laptop Test GearForge E2E');
    $item->set_quantity(2);
    $item->set_subtotal(20000000);
    $item->set_total(20000000);
    $order->add_item($item);
    $order->set_total(20000000);
    $order->set_status('pending');
    $order->save();
    $order_id            = $order->get_id();
    $created_order_ids[] = $order_id;
    $item_ids            = array_keys($order->get_items());
    $item_id             = (int) $item_ids[0];

    // 5. Reject invalid edu email before storing files
    $bad_email_res = GF_Installment_Review::submit_application(
        [
            'order_id'              => $order_id,
            'user_id'               => $student->ID,
            'plan_id'               => (int) $calc['plan_id'],
            'student_code'          => '24521027',
            'student_edu_email'     => 'not-an-email.edu.vn',
            'cccd_number'           => '079206001234',
            'downpayment_amount'    => $calc['downpayment_amount'],
            'monthly_amount'        => $calc['monthly_amount'],
            'consent_nd13_accepted' => 1,
        ],
        ['tmp_name' => ''],
        ['tmp_name' => '']
    );
    gf_assert(is_wp_error($bad_email_res) && $bad_email_res->get_error_code() === 'gf_invalid_edu_email', 'Installment Review rejects malformed .edu email via is_email()');

    // 6. Insert valid application directly using encrypt_bytes and verify 2-layer + sandbox REST API
    $f1 = GF_Vault_Crypto::encrypt_bytes('CCCD_BYTES', 'image/png');
    $f2 = GF_Vault_Crypto::encrypt_bytes('CARD_BYTES', 'image/png');
    $created_vault[] = $f1;
    $created_vault[] = $f2;

    global $wpdb;
    $wpdb->insert(
        "{$wpdb->prefix}gf_installment_applications",
        [
            'order_id'                    => $order_id,
            'user_id'                     => $student->ID,
            'plan_id'                     => (int) $calc['plan_id'],
            'student_code'                => '24521027',
            'student_edu_email'           => '24521027@gm.uit.edu.vn',
            'cccd_hash'                   => GF_Installment_Review::hash_cccd('079206009999'),
            'cccd_encrypted_path'         => $f1,
            'student_card_encrypted_path' => $f2,
            'downpayment_amount'          => $calc['downpayment_amount'],
            'monthly_amount'              => $calc['monthly_amount'],
            'consent_nd13_accepted'       => 1,
            'consent_accepted_at'         => current_time('mysql'),
            'status'                      => 'SUBMITTED',
        ]
    );
    $app_id = (int) $wpdb->insert_id;

    // 6a. Block layer 2 skip & sandbox session before approval
    wp_set_current_user($student->ID);
    $req_early = new WP_REST_Request('POST', '/gearforge/v1/payment-sandbox/session');
    $req_early->set_param('order_id', $order_id);
    $req_early->set_param('provider', 'vnpay');
    $req_early->set_param('mode', 'downpayment');
    $res_early = rest_do_request($req_early);
    gf_assert($res_early->get_status() === 400, 'POST /payment-sandbox/session blocks unapproved installment application');

    $skip_l2 = GF_Installment_Review::review_layer_2($app_id, $admin->ID);
    gf_assert(is_wp_error($skip_l2) && $skip_l2->get_error_code() === 'gf_invalid_state', 'TC-13 blocks skipping Layer 1');

    gf_assert(GF_Installment_Review::review_layer_1($app_id, $admin->ID) === true, 'Layer 1 transition SUBMITTED -> L1_DOCS_VERIFIED');
    gf_assert(GF_Installment_Review::review_layer_2($app_id, $admin->ID) === true, 'Layer 2 transition L1_DOCS_VERIFIED -> APPROVED_WAITING_DOWNPAYMENT');

    // 6b. Create sandbox session via REST API & reject amount mismatch on finalize
    wp_set_current_user($student->ID);
    $req_sess = new WP_REST_Request('POST', '/gearforge/v1/payment-sandbox/session');
    $req_sess->set_param('order_id', $order_id);
    $req_sess->set_param('provider', 'vnpay');
    $req_sess->set_param('mode', 'downpayment');
    $res_sess = rest_do_request($req_sess);
    $sess_data = $res_sess->get_data();
    gf_assert(
        $res_sess->get_status() === 201
        && !empty($sess_data['checkout_url'])
        && (int) $sess_data['amount'] === 6000000,
        'POST /payment-sandbox/session returns 201 and signed 3DS checkout_url'
    );

    $bad_amt = GF_Payment_Sandbox::finalize_verified_payment($order_id, 1000, 'vnpay', 'downpayment', 'TXN-BAD-AMT');
    gf_assert(is_wp_error($bad_amt) && $bad_amt->get_error_code() === 'gf_amount_mismatch', 'Payment finalizer rejects mismatched downpayment amount');

    $ok_pay = GF_Payment_Sandbox::finalize_verified_payment($order_id, 6000000, 'vnpay', 'downpayment', 'TXN-E2E-' . $order_id);
    gf_assert($ok_pay === true, 'Payment finalizer accepts exact downpayment amount');

    // 6c. OMS status includes invoice_download_url
    $req_oms = new WP_REST_Request('GET', "/gearforge/v1/oms-status/{$order_id}");
    $res_oms = rest_do_request($req_oms);
    $oms_data = $res_oms->get_data();
    gf_assert($res_oms->get_status() === 200 && !empty($oms_data['invoice_download_url']), 'GET /oms-status returns nonce-signed invoice_download_url');

    // 7. Serial guard + Multi-page PDF
    $order = wc_get_order($order_id);
    $order->update_status('completed');
    $order = wc_get_order($order_id);
    gf_assert($order->get_status() !== 'completed', 'TC-15 blocks transitioning to completed without Serial Numbers');

    $sn1 = 'SN-TEST-' . $order_id . '-A';
    $sn2 = 'SN-TEST-' . $order_id . '-B';
    GF_Serial_Manager::assign_serial($order_id, $item_id, 0, $sn1, $admin->ID);
    GF_Serial_Manager::assign_serial($order_id, $item_id, 0, $sn2, $admin->ID);
    $order = wc_get_order($order_id);
    $order->update_status('completed');
    $order = wc_get_order($order_id);
    gf_assert($order->get_status() === 'completed', 'Order transitions to completed after all 2 Serial Numbers are assigned');

    $pdf_bytes = GF_Invoice_PDF::generate_tvan_invoice_pdf($order_id);
    gf_assert(is_string($pdf_bytes) && strpos($pdf_bytes, '%PDF-1.4') === 0, 'T-VAN PDF starts with %PDF-1.4');

    $ref_method = new ReflectionMethod(GF_Invoice_PDF::class, 'render_minimal_pdf');
    $ref_method->setAccessible(true);
    $many_lines = array_map(static fn($i) => "Line {$i} test multi-page invoice", range(1, 55));
    $multi_pdf  = $ref_method->invoke(null, $many_lines);
    gf_assert(strpos($multi_pdf, '/Count 2') !== false && strpos($multi_pdf, '%%EOF') !== false, 'Invoice PDF automatically paginates >42 lines into 2 pages');

    // 8. RMA guard: require serial_number when order has serials, partial vs full return
    $rma_no_sn = GF_RMA_Manager::submit_request($order_id, $student->ID, 'RETURN', 'Khach khong nhap S/N thu');
    gf_assert(is_wp_error($rma_no_sn) && $rma_no_sn->get_error_code() === 'gf_serial_required', 'RMA blocks empty serial_number when order has assigned S/Ns');

    $rma1 = GF_RMA_Manager::submit_request($order_id, $student->ID, 'RETURN', 'Tra may thu nhat', $sn1);
    $rma2 = GF_RMA_Manager::submit_request($order_id, $student->ID, 'RETURN', 'Tra may thu hai', $sn2);
    gf_assert(is_int($rma1) && is_int($rma2), 'RMA accepts valid requests for both S/Ns');

    GF_RMA_Manager::approve_request($rma1, $admin->ID, 'OK 1');
    GF_RMA_Manager::complete_request($rma1, $admin->ID, 'Done 1');
    $order = wc_get_order($order_id);
    gf_assert($order->get_status() === 'completed', 'Returning 1/2 S/N keeps order completed');

    GF_RMA_Manager::approve_request($rma2, $admin->ID, 'OK 2');
    GF_RMA_Manager::complete_request($rma2, $admin->ID, 'Done 2');
    $order = wc_get_order($order_id);
    $app_after = GF_Installment_Review::get_application($app_id);
    gf_assert(
        $order->get_status() === 'refunded' && ($app_after['status'] ?? '') === 'CLOSED',
        'Returning all 2/2 S/Ns refunds order and closes installment application'
    );

    // 9. Layer 7 Hardening checks (FIX-15)
    $inf_calc = GF_Installment_Calc::calculate(INF, 30, 6);
    gf_assert(is_wp_error($inf_calc) && $inf_calc->get_error_code() === 'gf_invalid_price', 'Calculator blocks INF/NaN price overflow');

    $bad_code = GF_Installment_Review::submit_application(
        [
            'order_id'              => $order_id,
            'user_id'               => $student->ID,
            'plan_id'               => (int) $calc['plan_id'],
            'student_code'          => '2452<script>',
            'student_edu_email'     => '24521027@gm.uit.edu.vn',
            'cccd_number'           => '079206001234',
            'downpayment_amount'    => $calc['downpayment_amount'],
            'monthly_amount'        => $calc['monthly_amount'],
            'consent_nd13_accepted' => 1,
        ],
        ['tmp_name' => ''],
        ['tmp_name' => '']
    );
    gf_assert(is_wp_error($bad_code) && $bad_code->get_error_code() === 'gf_invalid_student_code', 'Installment Review validates student_code format');

    $bad_sn = GF_Serial_Manager::assign_serial($order_id, $item_id, 0, "BAD SERIAL\n<>", $admin->ID);
    gf_assert(is_wp_error($bad_sn) && $bad_sn->get_error_code() === 'gf_invalid_serial_format', 'Serial Manager rejects invalid S/N format');

    $inj_pdf = $ref_method->invoke(null, ["Customer\n) ET\nBT"]);
    gf_assert(strpos($inj_pdf, "Customer\n") === false && strpos($inj_pdf, '\) ET BT') !== false, 'Invoice PDF strips control chars to prevent PDF stream injection');

    $rl_id = 'test_subj_' . uniqid();
    delete_transient('gf_rl_' . md5('test_rl|' . $rl_id));
    $rl1 = gf_core_check_rate_limit('test_rl', 2, 60, $rl_id, true);
    $rl2 = gf_core_check_rate_limit('test_rl', 2, 60, $rl_id, true);
    $rl3 = gf_core_check_rate_limit('test_rl', 2, 60, $rl_id, true);
    $rl_resp = is_wp_error($rl3) ? gf_core_rate_limit_rest_response($rl3) : null;
    delete_transient('gf_rl_' . md5('test_rl|' . $rl_id));
    gf_assert($rl1 === true && $rl2 === true && $rl_resp && $rl_resp->get_status() === 429, 'Role 4 Layer 7 rate limiter blocks bursts with HTTP 429');
} finally {
    global $wpdb;
    foreach ($created_order_ids as $oid) {
        $wpdb->delete("{$wpdb->prefix}gf_rma_requests", ['order_id' => $oid], ['%d']);
        $wpdb->delete("{$wpdb->prefix}gf_order_serials", ['order_id' => $oid], ['%d']);
        $wpdb->delete("{$wpdb->prefix}gf_installment_applications", ['order_id' => $oid], ['%d']);
        $o = wc_get_order($oid);
        if ($o) {
            $o->delete(true);
        }
    }
    foreach ($created_vault as $vf) {
        if (is_string($vf)) {
            GF_Vault_Crypto::delete_stored_file($vf);
        }
    }
}

echo "\nSUMMARY: {$passed} passed, {$failures} failed.\n";
exit($failures > 0 ? 1 : 0);
