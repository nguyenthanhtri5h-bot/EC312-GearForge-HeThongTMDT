# ĐẶC TẢ KIẾN TRÚC PLUGIN `gearforge-core` & SCHEMA CSDL MỞ RỘNG

> Tài liệu khung kỹ thuật cho **Role 4 (Backend/DB)**, **Role 3 (Frontend)** và **Role 2 (Security/RBAC)** cùng phát triển trên nền **WordPress + WooCommerce** theo kiến trúc **Microkernel (Plugin-based)**.

---

## 1. CHIẾN LƯỢC WORDPRESS: PLUGINS CÓ SẴN VS CUSTOM PLUGIN `gearforge-core`

Theo chuẩn **Buy & Customize (70%–80% Out-of-the-box, 20%–30% Custom GAP)** của môn EC312, nhóm kết hợp các plugin miễn phí uy tín trên WordPress.org cho phần phổ thông và dồn code vào **`gearforge-core`** cho các nghiệp vụ đặc thù:

| Thành phần | Sử dụng Plugin có sẵn (WordPress.org / GitHub) | Phần Custom code trong `gearforge-core` |
| :--- | :--- | :--- |
| **Bộ lọc thông số** | **HUSKY (WOOF) Products Filter** hoặc **WBW Product Filter** | Chuẩn hóa Attributes (CPU, RAM, GPU, Nhu cầu) & import ≥ 500 SP qua REST API |
| **So sánh cấu hình** | **Products Compare for WooCommerce (BeRocket)** *(tùy chọn nền)* | Shortcode/Hook chèn thêm dòng **Tiền trả góp SV dự kiến/tháng** |
| **Trả góp SV & Vault** | *Không dùng plugin ngoài (100% Custom GAP)* | Calculator 3–6–12 tháng, Consent NĐ 13/2023, Mã hóa AES-256 `/var/www/gf-vault`, Duyệt 2 lớp |
| **Thanh toán Sandbox** | Tham khảo `woo-vnpay`, `kanbox-momo-payment-gateway`, Plugin **Fundiin** | Adapter xử lý thanh toán tiền cọc trả trước & verify chữ ký IPN (3D-Secure) |
| **Serial Number & PDF** | **PDF Invoices & Packing Slips (WP Overnight)** *(tạo khung PDF)* | Bảng `wp_gf_order_serials`, Hook chặn `SHIPPING` nếu thiếu `S/N`, Hook in `S/N` & VAT 8–10% vào PDF |

---

## 2. CẤU TRÚC THƯ MỤC PLUGIN `gearforge-core`

```text
plugins/gearforge-core/
├── gearforge-core.php                 # Entry point, load các module, activation hook tạo 4 bảng wp_gf_*
├── includes/
│   ├── class-gf-activator.php         # Chạy SQL DDL tạo 4 bảng mở rộng & seed 3 gói trả góp (3, 6, 12 tháng)
│   ├── class-gf-rbac.php              # Khai báo Role & Capability: InstallmentReviewer (Role 2)
│   ├── class-gf-fraud-guard.php       # Rate Limiting + Kiểm tra wp_gf_fraud_blacklist (Role 2)
│   ├── class-gf-compare-specs.php     # Xử lý so sánh 2-3 Laptop/PC & Shortcode bảng đối chiếu (Role 1 & 3)
│   ├── class-gf-installment-calc.php  # Công thức tính trả trước, lãi suất, góp hàng tháng (Role 4)
│   ├── class-gf-vault-crypto.php      # Mã hóa/Giải mã AES-256-CBC cho ảnh CCCD & Thẻ SV vào /var/www/gf-vault
│   ├── class-gf-installment-review.php# Màn hình Admin duyệt 2 lớp (L1 Docs -> L2 Edu) & Audit Log (Role 4)
│   ├── class-gf-payment-sandbox.php   # Adapter tích hợp Sandbox VNPay / MoMo / Fundiin (3D-Secure) (Role 4)
│   ├── class-gf-serial-manager.php    # Gắn mã S/N khi xuất kho, chặn chuyển SHIPPING nếu thiếu S/N (Role 4)
│   └── class-gf-invoice-pdf.php       # Xuất Hóa đơn PDF mẫu có S/N & VAT 8-10% chuẩn dữ liệu T-VAN (Role 4)
├── templates/
│   ├── compare-table.php              # Giao diện bảng đối chiếu thông số (Role 3)
│   ├── installment-widget.php         # Widget tính trả góp & Form nộp hồ sơ + Consent NĐ 13/2023 (Role 3 & 4)
│   └── oms-tracking-stepper.php       # Thanh tiến trình theo dõi đơn hàng & hồ sơ duyệt 2 lớp (Role 3)
└── assets/
    ├── css/gearforge-frontend.css     # Responsive Desktop/Mobile CSS
    └── js/gearforge-frontend.js       # AJAX Compare tray, Calculator real-time, Consent validation
```

---

## 3. SCRIPT SQL KHỞI TẠO 4 BẢNG MỞ RỘNG (MYSQL 8.0)

*(Được thực thi tự động trong `class-gf-activator.php` khi kích hoạt Plugin)*

```sql
-- 1. Bảng gói kỳ hạn trả góp sinh viên (3, 6, 12 tháng)
CREATE TABLE IF NOT EXISTS wp_gf_installment_plans (
    plan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    duration_months TINYINT UNSIGNED NOT NULL,
    min_downpayment_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    monthly_interest_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    admin_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng hồ sơ trả góp sinh viên (liên kết WooCommerce Order & User)
CREATE TABLE IF NOT EXISTS wp_gf_installment_applications (
    app_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NULL,
    student_code VARCHAR(50) NOT NULL,
    student_edu_email VARCHAR(150) NOT NULL,
    cccd_hash CHAR(64) NOT NULL,
    cccd_encrypted_path VARCHAR(255) NOT NULL,
    student_card_encrypted_path VARCHAR(255) NOT NULL,
    downpayment_amount DECIMAL(14,2) NOT NULL,
    monthly_amount DECIMAL(14,2) NOT NULL,
    consent_nd13_accepted TINYINT(1) NOT NULL DEFAULT 0,
    consent_accepted_at DATETIME NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED',
    l1_verified_at DATETIME NULL,
    l2_verified_at DATETIME NULL,
    reject_reason TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gf_app_order (order_id),
    INDEX idx_gf_app_user (user_id),
    INDEX idx_gf_app_status (status),
    INDEX idx_gf_app_cccd_hash (cccd_hash),
    CONSTRAINT fk_gf_app_plan FOREIGN KEY (plan_id) REFERENCES wp_gf_installment_plans(plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng quản lý Serial Number (S/N) / Service Tag chống đánh tráo khi bảo hành
CREATE TABLE IF NOT EXISTS wp_gf_order_serials (
    serial_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    order_item_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    warranty_months SMALLINT UNSIGNED NOT NULL DEFAULT 12,
    warranty_end_date DATE NULL,
    assigned_by BIGINT UNSIGNED NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_gf_serial_number (serial_number),
    INDEX idx_gf_serial_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng danh sách đen chống gian lận (Rate limit / Spam / Hồ sơ giả mạo)
CREATE TABLE IF NOT EXISTS wp_gf_fraud_blacklist (
    blacklist_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    target_type ENUM('IP', 'USER', 'PHONE', 'CCCD_HASH') NOT NULL,
    target_value VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    blocked_until DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_gf_blacklist_target (target_type, target_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. QUY ƯỚC BẢO MẬT, HOOKS & REST API NỘI BỘ

1. **Bảo mật tải tệp CCCD/Thẻ SV (NĐ 13/2023):**
   - Kiểm tra MIME type thực tế (`finfo_file`), chỉ cho phép `image/jpeg`, `image/png`, `application/pdf`, kích thước ≤ 5MB.
   - Đổi tên tệp thành UUID ngẫu nhiên, mã hóa bằng **AES-256-CBC** (dùng `GF_VAULT_ENCRYPTION_KEY` từ biến môi trường, tuyệt đối không hardcode trong code) và lưu tại `/var/www/gf-vault/`.
   - Khi `InstallmentReviewer` bấm xem hồ sơ trong Admin, endpoint PHP kiểm tra quyền RBAC (`current_user_can('gf_review_installments')`) + Nonce trước khi giải mã stream ảnh tạm thời và ghi Audit Log.
2. **Logic chặn xuất kho thiếu Serial Number:**
   - Hook vào sự kiện chuyển trạng thái đơn hàng `woocommerce_order_status_changed`: nếu đơn hàng có sản phẩm thuộc danh mục `Laptop` hoặc `PC` và chuyển sang `shipping`/`completed` nhưng bảng `wp_gf_order_serials` chưa có đủ số lượng `serial_number` khớp `order_item_id`, chặn chuyển trạng thái và báo lỗi nhắc nhập S/N.
3. **Chuẩn hóa cấu trúc Hóa đơn PDF tương thích T-VAN:**
   - Dùng hook `wpo_wcpdf_after_item_meta` (nếu dùng plugin WP Overnight) hoặc `class-gf-invoice-pdf.php` xuất kèm các trường chuẩn Thông tư 78 / NĐ 123: Tên đơn vị bán (GearForge), MST giả lập, Thông tin người mua, Danh mục hàng hóa + **Serial Number**, Đơn giá trước thuế, Thuế suất **VAT (8% / 10%)**, Tiền thuế, Tổng thanh toán, Hình thức thanh toán (Trả thẳng / Trả góp SV).
4. **Danh sách Hooks & REST API Endpoints phục vụ Demo Postman (theo `0. Tài liệu tham khảo/Tài liệu gốc GitHub Thầy Tín/lab_api_notes.md`):**
   - *Core WooCommerce REST API v3 (OAuth 1.0):* `GET/POST /wp-json/wc/v3/products` (quản lý ≥ 500 SP), `GET /wp-json/wc/v3/orders` (quản lý OMS).
   - *GearForge Custom REST API (`rest_api_init`):*
     - `GET /wp-json/gearforge/v1/installment-calc?price=20000000&down_pct=30&months=6` → Trả về JSON chi tiết số tiền trả trước, gốc vay, lãi/tháng, góp mỗi tháng.
     - `GET /wp-json/gearforge/v1/oms-status/{order_id}` → Trả về trạng thái kết hợp `OrderStatus` + `InstallmentApplicationStatus` + danh sách `serial_number` đã gán.
