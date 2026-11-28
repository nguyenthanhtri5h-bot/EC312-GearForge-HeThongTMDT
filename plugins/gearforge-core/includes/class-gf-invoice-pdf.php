<?php
/**
 * T-VAN Compliant PDF Invoice Generator (UC-12 / FR-10).
 *
 * Generates valid %PDF-1.4 documents containing seller Tax ID (MST), customer info,
 * order items with bound Serial Numbers (S/N), VAT breakdown (8% - 10%), and installment terms.
 * Also hooks into WP Overnight PDF Invoices if installed.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Invoice_PDF {

    private const SELLER_NAME = 'CONG TY TNHH CONG NGHE GEARFORGE';
    private const SELLER_MST  = '0318202607';
    private const VAT_RATE    = 0.10;

    public static function init(): void {
        add_action('admin_post_gf_download_invoice_pdf', [self::class, 'handle_download_request']);
        add_action('wpo_wcpdf_after_item_meta', [self::class, 'inject_serial_into_wpo_pdf'], 10, 3);
        add_filter('woocommerce_my_account_my_orders_actions', [self::class, 'add_my_account_invoice_action'], 10, 2);
    }

    /**
     * Build a nonce-protected invoice download URL for an authorized order owner or operator.
     */
    public static function get_download_url(int $order_id): string {
        return add_query_arg(
            [
                'action'   => 'gf_download_invoice_pdf',
                'order_id' => $order_id,
                '_wpnonce' => wp_create_nonce("gf_pdf_{$order_id}"),
            ],
            admin_url('admin-post.php')
        );
    }

    /**
     * Expose a "Hóa đơn PDF" button in WooCommerce My Account -> Orders without editing theme files.
     */
    public static function add_my_account_invoice_action(array $actions, $order): array {
        if (!$order || in_array($order->get_status(), ['cancelled', 'failed'], true)) {
            return $actions;
        }
        $actions['gf_invoice_pdf'] = [
            'url'  => self::get_download_url((int) $order->get_id()),
            'name' => 'Hóa đơn PDF',
        ];
        return $actions;
    }

    /**
     * Hook compatibility for WP Overnight PDF Invoices & Packing Slips.
     */
    public static function inject_serial_into_wpo_pdf(string $document_type, array $item, $order): void {
        if ($document_type !== 'invoice' || !$order) {
            return;
        }
        $serials = GF_Serial_Manager::get_order_serials((int) $order->get_id());
        foreach ($serials as $row) {
            if ((int) $row['product_id'] === (int) ($item['product_id'] ?? 0)) {
                echo '<div class="gf-pdf-serial"><strong>S/N:</strong> ' . esc_html($row['serial_number']) . '</div>';
            }
        }
    }

    /**
     * HTTP handler to download a T-VAN structured PDF invoice (with IDOR & nonce guard).
     */
    public static function handle_download_request(): void {
        if (!is_user_logged_in()) {
            wp_die('401 Unauthorized', '401 Unauthorized', ['response' => 401]);
        }

        if (function_exists('gf_core_check_rate_limit')) {
            $rl = gf_core_check_rate_limit('invoice_pdf', 20, 60, 'u' . get_current_user_id());
            if (is_wp_error($rl)) {
                wp_die(esc_html($rl->get_error_message()), '429 Too Many Requests', ['response' => 429]);
            }
        }

        $order_id = (int) ($_GET['order_id'] ?? 0);
        check_admin_referer('gf_pdf_' . $order_id);

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            wp_die('Không tìm thấy đơn hàng.', '404 Not Found', ['response' => 404]);
        }

        $is_operator = current_user_can('manage_woocommerce') || current_user_can('gf_review_installments');
        $is_owner    = (int) $order->get_customer_id() === get_current_user_id();
        if (!$is_operator && !$is_owner) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }

        $pdf_bytes = self::generate_tvan_invoice_pdf($order_id);
        if (is_wp_error($pdf_bytes)) {
            wp_die(esc_html($pdf_bytes->get_error_message()), 'Lỗi xuất PDF', ['response' => 500]);
        }

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="GearForge-Invoice-' . $order_id . '.pdf"');
        header('X-Content-Type-Options: nosniff');
        header('Content-Security-Policy: default-src \'none\'; sandbox');
        header('Cache-Control: private, no-store, max-age=0');
        header('Content-Length: ' . strlen($pdf_bytes));
        echo $pdf_bytes;
        exit;
    }

    /**
     * Build a standalone valid %PDF-1.4 binary document compliant with T-VAN fields.
     *
     * @return string|WP_Error Raw PDF bytes.
     */
    public static function generate_tvan_invoice_pdf(int $order_id) {
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_Error('gf_order_not_found', 'Không tìm thấy đơn hàng để xuất PDF.');
        }

        $serials     = GF_Serial_Manager::get_order_serials($order_id);
        $serial_list = array_column($serials, 'serial_number');
        $serial_text = !empty($serial_list) ? implode(', ', $serial_list) : 'N/A';

        $raw_mst        = sanitize_text_field((string) get_option('gf_seller_mst', self::SELLER_MST));
        $seller_mst     = self::ascii_safe($raw_mst) ?: self::SELLER_MST;
        $vat_rate       = self::get_vat_rate();
        $vat_pct_label  = rtrim(rtrim(number_format($vat_rate * 100, 2, '.', ''), '0'), '.');

        $total_incl_vat = (float) $order->get_total();
        $pre_tax        = round($total_incl_vat / (1 + $vat_rate));
        $vat_amount     = $total_incl_vat - $pre_tax;

        $app          = class_exists('GF_Installment_Review') ? GF_Installment_Review::get_application_by_order($order_id) : null;
        $payment_mode = $app ? ('Tra gop SV (' . $app['status'] . ')') : strtoupper((string) $order->get_payment_method());

        $lines = [
            'HOA DON DIEN TU CHUAN T-VAN (ND 123/2020/ND-CP)',
            'Don vi ban: ' . self::SELLER_NAME . ' | MST: ' . $seller_mst,
            'Ma don hang: #' . $order_id . ' | Ngay lap: ' . gmdate('Y-m-d H:i:s') . ' UTC',
            'Khach hang: ' . self::ascii_safe($order->get_formatted_billing_full_name() ?: 'Khach hang Sinh vien'),
            'Hinh thuc thanh toan: ' . self::ascii_safe($payment_mode),
            '----------------------------------------------------------------',
        ];

        foreach ($order->get_items() as $item) {
            $lines[] = sprintf(
                '- %s (SL: %d) : %s VND',
                self::ascii_safe($item->get_name()),
                (int) $item->get_quantity(),
                number_format((float) $item->get_total())
            );
        }

        $lines[] = 'Serial Number (S/N): ' . self::ascii_safe($serial_text);
        $lines[] = '----------------------------------------------------------------';
        $lines[] = 'Tien hang truoc thue: ' . number_format($pre_tax) . ' VND';
        $lines[] = sprintf('Thue suat VAT (%s%%):  %s VND', $vat_pct_label, number_format($vat_amount));
        $lines[] = 'Tong thanh toan:      ' . number_format($total_incl_vat) . ' VND';

        return self::render_minimal_pdf($lines);
    }

    private static function render_minimal_pdf(array $lines): string {
        $chunks   = array_chunk($lines, 42) ?: [[]];
        $page_ids = [];
        $objects  = [];

        $objects[1] = ''; // Placeholder for Catalog
        $objects[2] = ''; // Placeholder for Pages
        $objects[3] = "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

        $next_id = 4;
        foreach ($chunks as $page_lines) {
            $page_id    = $next_id++;
            $content_id = $next_id++;
            $page_ids[] = $page_id . ' 0 R';

            $stream_ops = ["BT", "/F1 11 Tf", "50 780 Td", "16 TL"];
            foreach ($page_lines as $idx => $line) {
                $clean_line   = preg_replace('/[\x00-\x1F\x7F]/', ' ', (string) $line);
                $escaped      = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $clean_line);
                $stream_ops[] = ($idx === 0 ? "({$escaped}) Tj" : "T* ({$escaped}) Tj");
            }
            $stream_ops[] = "ET";
            $stream       = implode("\n", $stream_ops);

            $objects[$page_id]    = "{$page_id} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents {$content_id} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n";
            $objects[$content_id] = "{$content_id} 0 obj\n<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream\nendobj\n";
        }

        $objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $objects[2] = "2 0 obj\n<< /Type /Pages /Kids [" . implode(' ', $page_ids) . "] /Count " . count($page_ids) . " >>\nendobj\n";
        ksort($objects);

        $pdf     = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $id => $obj) {
            $offsets[$id] = strlen($pdf);
            $pdf         .= $obj;
        }

        $xref_pos = strlen($pdf);
        $pdf     .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        foreach ($objects as $id => $_) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref_pos}\n%%EOF";

        return $pdf;
    }

    private static function get_vat_rate(): float {
        $raw_opt = get_option('gf_vat_rate', null);
        if ($raw_opt === null || $raw_opt === false) {
            return self::VAT_RATE;
        }
        $trimmed = rtrim(trim((string) $raw_opt), "% \t\n\r\0\x0B");
        if ($trimmed === '' || !is_numeric($trimmed)) {
            return self::VAT_RATE;
        }
        $raw = (float) $trimmed;
        if ($raw > 1 && $raw <= 25) {
            $raw = $raw / 100;
        }
        if (!is_finite($raw) || $raw < 0 || $raw > 0.25) {
            return self::VAT_RATE;
        }
        return $raw;
    }

    private static function ascii_safe(string $text): string {
        static $vi_map = [
            'à' => 'a', 'á' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a',
            'ă' => 'a', 'ằ' => 'a', 'ắ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a',
            'â' => 'a', 'ầ' => 'a', 'ấ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
            'À' => 'A', 'Á' => 'A', 'Ả' => 'A', 'Ã' => 'A', 'Ạ' => 'A',
            'Ă' => 'A', 'Ằ' => 'A', 'Ắ' => 'A', 'Ẳ' => 'A', 'Ẵ' => 'A', 'Ặ' => 'A',
            'Â' => 'A', 'Ầ' => 'A', 'Ấ' => 'A', 'Ẩ' => 'A', 'Ẫ' => 'A', 'Ậ' => 'A',
            'è' => 'e', 'é' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e',
            'ê' => 'e', 'ề' => 'e', 'ế' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
            'È' => 'E', 'É' => 'E', 'Ẻ' => 'E', 'Ẽ' => 'E', 'Ẹ' => 'E',
            'Ê' => 'E', 'Ề' => 'E', 'Ế' => 'E', 'Ể' => 'E', 'Ễ' => 'E', 'Ệ' => 'E',
            'ì' => 'i', 'í' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
            'Ì' => 'I', 'Í' => 'I', 'Ỉ' => 'I', 'Ĩ' => 'I', 'Ị' => 'I',
            'ò' => 'o', 'ó' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o',
            'ô' => 'o', 'ồ' => 'o', 'ố' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o',
            'ơ' => 'o', 'ờ' => 'o', 'ớ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
            'Ò' => 'O', 'Ó' => 'O', 'Ỏ' => 'O', 'Õ' => 'O', 'Ọ' => 'O',
            'Ô' => 'O', 'Ồ' => 'O', 'Ố' => 'O', 'Ổ' => 'O', 'Ỗ' => 'O', 'Ộ' => 'O',
            'Ơ' => 'O', 'Ờ' => 'O', 'Ớ' => 'O', 'Ở' => 'O', 'Ỡ' => 'O', 'Ợ' => 'O',
            'ù' => 'u', 'ú' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u',
            'ư' => 'u', 'ừ' => 'u', 'ứ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
            'Ù' => 'U', 'Ú' => 'U', 'Ủ' => 'U', 'Ũ' => 'U', 'Ụ' => 'U',
            'Ư' => 'U', 'Ừ' => 'U', 'Ứ' => 'U', 'Ử' => 'U', 'Ữ' => 'U', 'Ự' => 'U',
            'ỳ' => 'y', 'ý' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
            'Ỳ' => 'Y', 'Ý' => 'Y', 'Ỷ' => 'Y', 'Ỹ' => 'Y', 'Ỵ' => 'Y',
            'đ' => 'd', 'Đ' => 'D',
        ];
        $normalized = strtr($text, $vi_map);
        $converted  = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);
        return $converted !== false ? preg_replace('/[^\x20-\x7E]/', '', $converted) : preg_replace('/[^\x20-\x7E]/', '', $normalized);
    }
}

GF_Invoice_PDF::init();
