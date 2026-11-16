<?php
/**
 * T-VAN Compatible Invoice PDF Generator (with S/N, VAT 8-10%, and WP Overnight hook).
 */

if (!defined('ABSPATH')) {
    exit;
}

class GF_Invoice_PDF {
    private const DEFAULT_VAT_RATE = 0.10; // VAT 10% (or 8% per Decree 44/72)

    public static function init(): void {
        add_action('wpo_wcpdf_after_item_meta', [self::class, 'append_sn_to_wpo_pdf'], 10, 3);
        add_action('wp_ajax_gf_download_invoice', [self::class, 'ajax_download_invoice']);
    }

    public static function get_download_url(int $order_id): string {
        return wp_nonce_url(
            admin_url('admin-ajax.php?action=gf_download_invoice&order_id=' . $order_id),
            'gf_invoice_' . $order_id
        );
    }

    public static function append_sn_to_wpo_pdf(string $document_type, array $item, WC_Order $order): void {
        if (empty($item['item_id'])) {
            return;
        }
        $serials = GF_Serial_Manager::get_order_serials($order->get_id());
        $matched = array_filter($serials, static fn(array $s): bool => (int) $s['order_item_id'] === (int) $item['item_id']);
        if (!empty($matched)) {
            $codes = implode(', ', array_column($matched, 'serial_number'));
            echo '<div class="gf-pdf-sn"><strong>Serial Number (S/N):</strong> ' . esc_html($codes) . '</div>';
        }
    }

    public static function ajax_download_invoice(): void {
        $order_id = (int) ($_GET['order_id'] ?? 0);
        check_admin_referer('gf_invoice_' . $order_id);

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_die('404 Not Found', '404 Not Found', ['response' => 404]);
        }
        if (!current_user_can('manage_woocommerce') && !GF_RBAC::can_assign_serial() && (int) $order->get_customer_id() !== get_current_user_id()) {
            wp_die('403 Forbidden', '403 Forbidden', ['response' => 403]);
        }

        $pdf_bytes = self::build_order_pdf($order);
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="GearForge-Invoice-' . $order_id . '.pdf"');
        header('Content-Length: ' . strlen($pdf_bytes));
        echo $pdf_bytes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        exit;
    }

    public static function build_order_pdf(WC_Order $order): string {
        global $wpdb;
        $order_id = $order->get_id();
        $serials  = GF_Serial_Manager::get_order_serials($order_id);
        $sn_by_item = [];
        foreach ($serials as $s) {
            $sn_by_item[(int) $s['order_item_id']][] = $s['serial_number'];
        }

        $app = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT app_id, status, downpayment_amount, monthly_amount FROM {$wpdb->prefix}gf_installment_applications WHERE order_id = %d LIMIT 1",
                $order_id
            ),
            ARRAY_A
        );

        $gross_total = (float) $order->get_total();
        $pre_tax     = round($gross_total / (1.0 + self::DEFAULT_VAT_RATE), 0);
        $vat_amount  = $gross_total - $pre_tax;

        $lines = [
            'GEARFORGE E-COMMERCE (UIT EC312) - HOA DON MAU CHUAN T-VAN',
            'Don vi ban: Cong ty TNHH GearForge Viet Nam | MST: 0318000999',
            'Dia chi: Khu do thi DHQG TP.HCM, Thu Duc, TP.HCM',
            '------------------------------------------------------------------------',
            sprintf('So Hoa Don: GF-INV-%06d | Ma Don Hang: #%d', $order_id, $order_id),
            sprintf('Ngay xuat: %s | Trang thai: %s', gmdate('Y-m-d H:i'), GF_Core::map_order_status($order->get_status())),
            sprintf('Khach hang: %s (%s)', self::to_ascii($order->get_formatted_billing_full_name() ?: 'Khach hang SV'), $order->get_billing_email()),
            '------------------------------------------------------------------------',
            'CHI TIET HANG HOA & SERIAL NUMBER (S/N):',
        ];

        foreach ($order->get_items() as $item_id => $item) {
            $sn_list = !empty($sn_by_item[$item_id]) ? implode(', ', $sn_by_item[$item_id]) : 'N/A (Phu kien / Chua gan)';
            $lines[] = sprintf(
                '- %s | SL: %d | Thanh tien: %s VND',
                self::to_ascii($item->get_name()),
                $item->get_quantity(),
                number_format((float) $item->get_total(), 0, ',', '.')
            );
            $lines[] = '  Serial Number (S/N): ' . $sn_list;
        }

        $lines[] = '------------------------------------------------------------------------';
        $lines[] = sprintf('Cong tien hang (Chua VAT):   %s VND', number_format($pre_tax, 0, ',', '.'));
        $lines[] = sprintf('Thue suat GTGT (VAT 10%%):    %s VND', number_format($vat_amount, 0, ',', '.'));
        $lines[] = sprintf('TONG THANH TOAN:             %s VND', number_format($gross_total, 0, ',', '.'));
        if ($app) {
            $lines[] = sprintf(
                'Hinh thuc: Tra gop SV #%d (%s) | Tra truoc: %s VND | Gop/thang: %s VND',
                (int) $app['app_id'],
                $app['status'],
                number_format((float) $app['downpayment_amount'], 0, ',', '.'),
                number_format((float) $app['monthly_amount'], 0, ',', '.')
            );
        } else {
            $lines[] = 'Hinh thuc thanh toan: ' . self::to_ascii($order->get_payment_method_title());
        }
        $lines[] = '------------------------------------------------------------------------';
        $lines[] = 'Tai lieu tuong thich cau truc du lieu T-VAN (Thong tu 78 / ND 123).';

        return self::render_minimal_pdf($lines);
    }

    private static function to_ascii(string $str): string {
        $map = [
            'à'=>'a','á'=>'a','ạ'=>'a','ả'=>'a','ã'=>'a','â'=>'a','ầ'=>'a','ấ'=>'a','ậ'=>'a','ẩ'=>'a','ẫ'=>'a','ă'=>'a','ằ'=>'a','ắ'=>'a','ặ'=>'a','ẳ'=>'a','ẵ'=>'a',
            'è'=>'e','é'=>'e','ẹ'=>'e','ẻ'=>'e','ẽ'=>'e','ê'=>'e','ề'=>'e','ế'=>'e','ệ'=>'e','ể'=>'e','ễ'=>'e',
            'ì'=>'i','í'=>'i','ị'=>'i','ỉ'=>'i','ĩ'=>'i',
            'ò'=>'o','ó'=>'o','ọ'=>'o','ỏ'=>'o','õ'=>'o','ô'=>'o','ồ'=>'o','ố'=>'o','ộ'=>'o','ổ'=>'o','ỗ'=>'o','ơ'=>'o','ờ'=>'o','ớ'=>'o','ợ'=>'o','ở'=>'o','ỡ'=>'o',
            'ù'=>'u','ú'=>'u','ụ'=>'u','ủ'=>'u','ũ'=>'u','ư'=>'u','ừ'=>'ư','ứ'=>'u','ự'=>'u','ử'=>'u','ữ'=>'u',
            'ỳ'=>'y','ý'=>'y','ỵ'=>'y','ỷ'=>'y','ỹ'=>'y','đ'=>'d',
            'À'=>'A','Á'=>'A','Ạ'=>'A','Ả'=>'A','Ã'=>'A','Â'=>'A','Ầ'=>'A','Ấ'=>'A','Ậ'=>'A','Ẩ'=>'A','Ẫ'=>'A','Ă'=>'A','Ằ'=>'A','Ắ'=>'A','Ặ'=>'A','Ẳ'=>'A','Ẵ'=>'A',
            'È'=>'E','É'=>'E','Ẹ'=>'E','Ẻ'=>'E','Ẽ'=>'E','Ê'=>'E','Ề'=>'E','Ế'=>'E','Ệ'=>'E','Ể'=>'E','Ễ'=>'E',
            'Ì'=>'I','Í'=>'I','Ị'=>'I','Ỉ'=>'I','Ĩ'=>'I',
            'Ò'=>'O','Ó'=>'O','Ọ'=>'O','Ỏ'=>'O','Õ'=>'O','Ô'=>'O','Ồ'=>'O','Ố'=>'O','Ộ'=>'O','Ổ'=>'O','Ỗ'=>'O','Ơ'=>'O','Ờ'=>'O','Ớ'=>'O','Ợ'=>'O','Ở'=>'O','Ỡ'=>'O',
            'Ù'=>'U','Ú'=>'U','Ụ'=>'U','Ủ'=>'U','Ũ'=>'U','Ư'=>'U','Ừ'=>'U','Ứ'=>'U','Ự'=>'U','Ử'=>'U','Ữ'=>'U',
            'Ỳ'=>'Y','Ý'=>'Y','Ỵ'=>'Y','Ỷ'=>'Y','Ỹ'=>'Y','Đ'=>'D',
        ];
        $ascii = strtr($str, $map);
        return preg_replace('/[^\x20-\x7E]/', '', $ascii) ?: '';
    }

    /**
     * Generates a valid single-page PDF 1.4 binary using Helvetica Type1 without external deps.
     */
    private static function render_minimal_pdf(array $lines): string {
        $content_stream = "BT\n/F1 10 Tf\n14 TL\n45 790 Td\n";
        foreach ($lines as $idx => $line) {
            $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line);
            $content_stream .= $idx === 0 ? "({$escaped}) Tj\n" : "T* ({$escaped}) Tj\n";
        }
        $content_stream .= "ET\n";

        $objects = [
            1 => "<< /Type /Catalog /Pages 2 0 R >>",
            2 => "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            3 => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            4 => "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            5 => "<< /Length " . strlen($content_stream) . " >>\nstream\n{$content_stream}endstream",
        ];

        $pdf     = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $xref_pos = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref_pos}\n%%EOF\n";
        return $pdf;
    }
}
