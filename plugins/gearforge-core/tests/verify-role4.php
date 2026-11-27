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

$created_order_ids   = [];
$created_vault       = [];
$created_product_ids = [];
$created_term_ids    = [];

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

    // 10. Integration patch checks (wc-gf-installment, PHONE/IP blacklist, gf-delivered, MST/VAT/VN translit)
    $wc_statuses = wc_get_order_statuses();
    gf_assert(isset($wc_statuses['wc-gf-installment']), 'wc-gf-installment custom order status is registered');

    $test_phone = '0909' . wp_rand(100000, 999999);
    $test_ip    = '203.0.113.' . wp_rand(10, 250);
    $wpdb->insert("{$wpdb->prefix}gf_fraud_blacklist", [
        'target_type'  => 'PHONE',
        'target_value' => $test_phone,
        'reason'       => 'Verify test PHONE',
        'created_by'   => $admin->ID,
    ]);
    $wpdb->insert("{$wpdb->prefix}gf_fraud_blacklist", [
        'target_type'  => 'IP',
        'target_value' => $test_ip,
        'reason'       => 'Verify test IP',
        'created_by'   => $admin->ID,
    ]);

    $bl_phone_res = GF_Installment_Review::submit_application(
        [
            'order_id'              => $order_id,
            'user_id'               => $student->ID,
            'plan_id'               => (int) $calc['plan_id'],
            'student_code'          => '24521027',
            'student_edu_email'     => '24521027@gm.uit.edu.vn',
            'cccd_number'           => '079206001234',
            'phone'                 => '+84-' . substr($test_phone, 1),
            'client_ip'             => '198.51.100.1',
            'downpayment_amount'    => $calc['downpayment_amount'],
            'monthly_amount'        => $calc['monthly_amount'],
            'consent_nd13_accepted' => 1,
        ],
        ['tmp_name' => ''],
        ['tmp_name' => '']
    );
    $bl_ip_res = GF_Installment_Review::submit_application(
        [
            'order_id'              => $order_id,
            'user_id'               => $student->ID,
            'plan_id'               => (int) $calc['plan_id'],
            'student_code'          => '24521027',
            'student_edu_email'     => '24521027@gm.uit.edu.vn',
            'cccd_number'           => '079206001234',
            'phone'                 => '0901000001',
            'client_ip'             => $test_ip,
            'downpayment_amount'    => $calc['downpayment_amount'],
            'monthly_amount'        => $calc['monthly_amount'],
            'consent_nd13_accepted' => 1,
        ],
        ['tmp_name' => ''],
        ['tmp_name' => '']
    );
    gf_assert(
        is_wp_error($bl_phone_res) && $bl_phone_res->get_error_code() === 'gf_blacklisted'
        && is_wp_error($bl_ip_res) && $bl_ip_res->get_error_code() === 'gf_blacklisted',
        'Installment Review blocks blacklisted PHONE (including +84 format) and IP'
    );

    // Check REST /installment-apply -> gf-installment -> finalize_verified_payment -> processing (TC-14)
    $p_inst = new WC_Product_Simple();
    $p_inst->set_name('Laptop Installment Payment Complete Test');
    $p_inst->set_regular_price(20000000);
    $p_inst->save();
    $created_product_ids[] = $p_inst->get_id();

    $order_inst = wc_create_order(['customer_id' => $student->ID]);
    $order_inst->add_product($p_inst, 1);
    $order_inst->calculate_totals();
    $order_inst->set_status('pending');
    $order_inst->save();
    $order_inst_id       = $order_inst->get_id();
    $created_order_ids[] = $order_inst_id;

    $f_inst1 = GF_Vault_Crypto::encrypt_bytes('CCCD_INST_BYTES', 'image/png');
    $f_inst2 = GF_Vault_Crypto::encrypt_bytes('CARD_INST_BYTES', 'image/png');
    $created_vault[] = $f_inst1;
    $created_vault[] = $f_inst2;
    $wpdb->insert(
        "{$wpdb->prefix}gf_installment_applications",
        [
            'order_id'                    => $order_inst_id,
            'user_id'                     => $student->ID,
            'plan_id'                     => (int) $calc['plan_id'],
            'student_code'                => '24521027',
            'student_edu_email'           => '24521027@gm.uit.edu.vn',
            'cccd_hash'                   => GF_Installment_Review::hash_cccd('079206008888'),
            'cccd_encrypted_path'         => $f_inst1,
            'student_card_encrypted_path' => $f_inst2,
            'downpayment_amount'          => 6000000,
            'monthly_amount'              => 2501000,
            'consent_nd13_accepted'       => 1,
            'consent_accepted_at'         => current_time('mysql'),
            'status'                      => 'APPROVED_WAITING_DOWNPAYMENT',
        ]
    );
    $order_inst->update_status('gf-installment');
    $inst_pay_res = GF_Payment_Sandbox::finalize_verified_payment($order_inst_id, 6000000, 'vnpay', 'downpayment', 'TXN-INST-' . $order_inst_id);
    $order_inst   = wc_get_order($order_inst_id);
    gf_assert(
        $inst_pay_res === true
        && $order_inst
        && $order_inst->get_status() === 'processing'
        && $order_inst->is_paid(),
        'TC-14 payment_complete transitions gf-installment order to processing and marks paid'
    );

    // Check REST /installment-apply returns HTTP 403 for blacklisted PHONE
    wp_set_current_user($student->ID);
    $order_bl_rest = wc_create_order(['customer_id' => $student->ID]);
    $order_bl_rest->set_total(20000000);
    $order_bl_rest->set_status('pending');
    $order_bl_rest->save();
    $created_order_ids[] = $order_bl_rest->get_id();
    $tmp_png_1 = tempnam(sys_get_temp_dir(), 'gf_cccd_');
    $tmp_png_2 = tempnam(sys_get_temp_dir(), 'gf_card_');
    file_put_contents($tmp_png_1, "\x89PNG\r\n\x1a\nTEST1");
    file_put_contents($tmp_png_2, "\x89PNG\r\n\x1a\nTEST2");
    $req_bl = new WP_REST_Request('POST', '/gearforge/v1/installment-apply');
    $req_bl->set_param('order_id', $order_bl_rest->get_id());
    $req_bl->set_param('months', 6);
    $req_bl->set_param('down_pct', 30);
    $req_bl->set_param('student_code', '24521027');
    $req_bl->set_param('student_edu_email', '24521027@gm.uit.edu.vn');
    $req_bl->set_param('cccd_number', '079206001234');
    $req_bl->set_param('phone', $test_phone);
    $req_bl->set_param('consent_nd13_accepted', '1');
    $req_bl->set_file_params([
        'cccd_file'         => ['name' => 'cccd.png', 'type' => 'image/png', 'tmp_name' => $tmp_png_1, 'error' => 0, 'size' => 13],
        'student_card_file' => ['name' => 'card.png', 'type' => 'image/png', 'tmp_name' => $tmp_png_2, 'error' => 0, 'size' => 13],
    ]);
    $res_bl = rest_do_request($req_bl);
    @unlink($tmp_png_1);
    @unlink($tmp_png_2);
    gf_assert($res_bl->get_status() === 403, 'TC-08 REST /installment-apply returns HTTP 403 when PHONE is blacklisted');

    // Check Serial exemption: cpu/gear exempt, gearforge-laptop NOT falsely exempt
    $term_gearforge = wp_insert_term('GearForge Laptop Test', 'product_cat', ['slug' => 'gearforge-laptop-test']);
    $term_cpu       = get_term_by('slug', 'cpu', 'product_cat') ?: wp_insert_term('CPU Test', 'product_cat', ['slug' => 'cpu']);
    $tid_gf_laptop  = is_array($term_gearforge) ? (int) $term_gearforge['term_id'] : (is_object($term_gearforge) ? 0 : 0);
    if ($tid_gf_laptop > 0) {
        $created_term_ids[] = $tid_gf_laptop;
    } else {
        $existing_gfl  = get_term_by('slug', 'gearforge-laptop-test', 'product_cat');
        $tid_gf_laptop = $existing_gfl ? (int) $existing_gfl->term_id : 0;
    }
    $tid_cpu = is_array($term_cpu) ? (int) $term_cpu['term_id'] : ($term_cpu instanceof WP_Term ? (int) $term_cpu->term_id : 0);
    if (is_array($term_cpu) && $tid_cpu > 0) {
        $created_term_ids[] = $tid_cpu;
    }
    $p_laptop = new WC_Product_Simple();
    $p_laptop->set_name('Test GearForge Laptop');
    $p_laptop->set_regular_price(20000000);
    $p_laptop->save();
    wp_set_object_terms($p_laptop->get_id(), [$tid_gf_laptop], 'product_cat');
    $created_product_ids[] = $p_laptop->get_id();

    $p_cpu = new WC_Product_Simple();
    $p_cpu->set_name('Test CPU Component');
    $p_cpu->set_regular_price(5000000);
    $p_cpu->save();
    wp_set_object_terms($p_cpu->get_id(), [$tid_cpu], 'product_cat');
    $created_product_ids[] = $p_cpu->get_id();

    $ref_req_sn = new ReflectionMethod(GF_Serial_Manager::class, 'requires_serial_number');
    $ref_req_sn->setAccessible(true);
    gf_assert(
        $ref_req_sn->invoke(null, $p_laptop->get_id()) === true
        && $ref_req_sn->invoke(null, $p_cpu->get_id()) === false,
        'Serial exemption skips cpu component but enforces S/N on gearforge-laptop-test slug'
    );

    // Check gf-delivered guard when order lacks S/N
    $order_guard = wc_create_order(['customer_id' => $student->ID]);
    $item_guard  = new WC_Order_Item_Product();
    $item_guard->set_name('Laptop Guard Delivered Test');
    $item_guard->set_quantity(1);
    $item_guard->set_subtotal(15000000);
    $item_guard->set_total(15000000);
    $order_guard->add_item($item_guard);
    $order_guard->set_total(15000000);
    $order_guard->set_status('processing');
    $order_guard->save();
    $created_order_ids[] = $order_guard->get_id();
    $order_guard->update_status('gf-delivered');
    $order_guard = wc_get_order($order_guard->get_id());
    gf_assert($order_guard->get_status() !== 'gf-delivered', 'Serial guard blocks transitioning to gf-delivered without S/N');

    // Check Invoice MST 0318202607, configurable VAT 8%, empty VAT fallback 10%, and Vietnamese transliteration
    $prev_vat = get_option('gf_vat_rate', null);
    update_option('gf_vat_rate', 0.08);
    $pdf_vat8 = GF_Invoice_PDF::generate_tvan_invoice_pdf($order_id);
    update_option('gf_vat_rate', '');
    $pdf_vat_empty = GF_Invoice_PDF::generate_tvan_invoice_pdf($order_id);
    if ($prev_vat === null) {
        delete_option('gf_vat_rate');
    } else {
        update_option('gf_vat_rate', $prev_vat);
    }
    $ref_ascii = new ReflectionMethod(GF_Invoice_PDF::class, 'ascii_safe');
    $ref_ascii->setAccessible(true);
    $vn_clean = $ref_ascii->invoke(null, 'Đơn hàng Điều khiển GearForge');
    gf_assert(
        is_string($pdf_vat8)
        && strpos($pdf_vat8, 'MST: 0318202607') !== false
        && strpos($pdf_vat8, 'VAT \\(8%\\)') !== false
        && is_string($pdf_vat_empty)
        && strpos($pdf_vat_empty, 'VAT \\(10%\\)') !== false
        && $vn_clean === 'Don hang Dieu khien GearForge',
        'Invoice PDF uses MST 0318202607, configurable 8% VAT, safe 10% fallback on empty option, and clean Vietnamese transliteration'
    );
} finally {
    global $wpdb;
    if (!empty($test_phone)) {
        $wpdb->delete("{$wpdb->prefix}gf_fraud_blacklist", ['target_type' => 'PHONE', 'target_value' => $test_phone], ['%s', '%s']);
    }
    if (!empty($test_ip)) {
        $wpdb->delete("{$wpdb->prefix}gf_fraud_blacklist", ['target_type' => 'IP', 'target_value' => $test_ip], ['%s', '%s']);
    }
    foreach ($created_product_ids as $pid) {
        $p = wc_get_product($pid);
        if ($p) {
            $p->delete(true);
        }
    }
    foreach ($created_term_ids as $tid) {
        wp_delete_term($tid, 'product_cat');
    }
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
