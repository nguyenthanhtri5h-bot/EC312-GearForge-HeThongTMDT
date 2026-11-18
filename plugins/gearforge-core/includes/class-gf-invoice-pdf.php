<?php
/**
 * T-VAN Compliant PDF Invoice Generator (UC-12 / FR-10).
 *
 * Generates valid %PDF-1.4 documents containing seller Tax ID (MST), customer info,
 * order items with bound Serial Numbers (S/N), VAT breakdown (10%), and installment terms.
 * Also hooks into WP Overnight PDF Invoices if installed.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Invoice_PDF {

    private const SELLER_NAME = 'CONG TY TNHH CONG NGHE GEARFORGE';
    private const SELLER_MST  = '0312345678';
    private const VAT_RATE    = 0.10;

    public static function init(): void {
        add_action('admin_post_gf_download_invoice_pdf', [self::class, 'handle_download_request']);
        add_action('wpo_wcpdf_after_item_meta', [self::class, 'inject_serial_into_wpo_pdf'], 10, 3);
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

        $total_incl_vat = (float) $order->get_total();
        $pre_tax        = round($total_incl_vat / (1 + self::VAT_RATE));
        $vat_amount     = $total_incl_vat - $pre_tax;

        $app          = class_exists('GF_Installment_Review') ? GF_Installment_Review::get_application_by_order($order_id) : null;
        $payment_mode = $app ? ('Tra gop SV (' . $app['status'] . ')') : strtoupper((string) $order->get_payment_method());

        $lines = [
            'HOA DON DIEN TU CHUAN T-VAN (ND 123/2020/ND-CP)',
            'Don vi ban: ' . self::SELLER_NAME . ' | MST: ' . self::SELLER_MST,
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
        $lines[] = 'Thue suat VAT (10%):  ' . number_format($vat_amount) . ' VND';
        $lines[] = 'Tong thanh toan:      ' . number_format($total_incl_vat) . ' VND';

        return self::render_minimal_pdf($lines);
    }

    private static function render_minimal_pdf(array $lines): string {
        $stream_ops = ["BT", "/F1 11 Tf", "50 760 Td", "16 TL"];
        foreach ($lines as $idx => $line) {
            $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line);
            $stream_ops[] = ($idx === 0 ? "({$escaped}) Tj" : "T* ({$escaped}) Tj");
        }
        $stream_ops[] = "ET";
        $stream       = implode("\n", $stream_ops);

        $objects = [
            1 => "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            2 => "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            3 => "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
            4 => "4 0 obj\n<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream\nendobj\n",
            5 => "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n",
        ];

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

    private static function ascii_safe(string $text): string {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        return $converted !== false ? preg_replace('/[^\x20-\x7E]/', '', $converted) : $text;
    }
}

GF_Invoice_PDF::init();
