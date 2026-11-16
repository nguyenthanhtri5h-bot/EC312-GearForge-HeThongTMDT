<?php
/**
 * Seeds a sample SUBMITTED student installment application for live Admin UI walkthrough (L1 -> L2 -> 3DS).
 */

if (!defined('ABSPATH')) {
    exit(1);
}

global $wpdb;
$count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gf_installment_applications WHERE status = 'SUBMITTED'");
if ($count > 0) {
    echo "Demo SUBMITTED application already exists.\n";
    exit(0);
}

$student = get_user_by('login', 'student_test');
$laptop_id = wc_get_product_id_by_sku('GF-LAP-002');
if (!$student || !$laptop_id) {
    echo "Missing student_test or GF-LAP-002.\n";
    exit(1);
}

$tmp_a = tempnam(sys_get_temp_dir(), 'demo_cccd_') . '.png';
$tmp_b = tempnam(sys_get_temp_dir(), 'demo_card_') . '.png';
$png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
file_put_contents($tmp_a, $png);
file_put_contents($tmp_b, $png);

$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$res = GF_Installment_Review::process_submission(
    $student->ID,
    [
        'product_id'            => $laptop_id,
        'downpayment_pct'       => 30,
        'months'                => 6,
        'student_code'          => '24521838',
        'student_edu_email'     => '24521838@gm.uit.edu.vn',
        'cccd_number'           => '079204008888',
        'phone'                 => '0909123456',
        'consent_nd13_accepted' => '1',
    ],
    [
        'cccd_file'         => ['name' => 'demo_cccd.png', 'type' => 'image/png', 'tmp_name' => $tmp_a, 'error' => UPLOAD_ERR_OK, 'size' => strlen($png)],
        'student_card_file' => ['name' => 'demo_svcard.png', 'type' => 'image/png', 'tmp_name' => $tmp_b, 'error' => UPLOAD_ERR_OK, 'size' => strlen($png)],
    ]
);
print_r($res);
