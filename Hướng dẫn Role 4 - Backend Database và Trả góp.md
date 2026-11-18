# HƯỚNG DẪN CẦM TAY CHỈ VIỆC: ROLE 4 – BACKEND, DATABASE & MODULE TRẢ GÓP SINH VIÊN

> **Vai trò kỹ thuật nòng cốt:** Bạn là **người hiện thực hóa trái tim công nghệ (20–30% Custom GAP)** giúp đồ án GearForge khác biệt hoàn toàn với các web bán hàng thông thường: **4 bảng CSDL `wp_gf_*`**, **Custom Plugin `gearforge-core`** (tính trả góp 3–6–12 tháng, mã hóa AES-256 ảnh CCCD/Thẻ SV, duyệt 2 lớp), **Sandbox VNPay/MoMo/Fundiin**, **gán Serial Number (S/N)** và **Hóa đơn PDF chuẩn T-VAN**.

---

## 1. THÔNG TIN ĐỊNH DANH & PHẠM VI "KHÔNG ĐÈ VIỆC"

| Hạng mục | Quy định dành riêng cho Role 4 |
| :--- | :--- |
| **Thành viên đảm nhận (Nhóm 7)** | **Lê Lưu Luân** — MSSV: `24521027` |
| **Chức danh** | Developer 2 – Backend, Database & Payment/Installment Engineer |
| **Mức độ Code** | **Code chính (PHP 8.2 + MySQL 8.0 + REST API)** — Nhưng kế thừa ~70% lõi WooCommerce & Plugin PDF/Thanh toán nên chỉ tập trung code phần khác biệt |
| **Nhánh GitHub độc quyền** | `role4-backend-payment` *(Issue `#4`)* — Tuyệt đối không push thẳng vào `main` |
| **File Word nháp trên Drive** | Tự tạo file `Nháp Role 4 - Họ Tên.docx` trong thư mục `3. Khung báo cáo đồ án EC312` |
| **Use Case phụ trách** | **`UC-10 ★` (Tính toán & Nộp hồ sơ trả góp SV – Đặc tả 6 mục)**, `UC-11` (Duyệt 2 lớp & Sandbox), `UC-12` (Gán S/N & Xuất PDF) |
| **File / Vùng ĐƯỢC SỬA** | Các file lõi trong `includes/` (`class-gf-activator.php`, `calc`, `vault-crypto`, `review`, `payment-sandbox`, `serial-manager`, `invoice-pdf`), `admin/`, Chương 3.7, 4.2, 5.2.3–5.2.4, 6.3 |
| **File TUYỆT ĐỐI KHÔNG SỬA** | Không tự sửa `assets/css/` & `templates/` giao diện (`Role 3`), `class-gf-rbac.php` / `fraud-guard.php` (`Role 2`) hay CSV 500 SP (`Role 1`) |

---

## 2. BẢN ĐỒ FILE CẦN MỞ TRÊN GOOGLE DRIVE (CHỈ MỞ ĐÚNG 5 FILE NÀY)

| STT | Tên file trên Drive (`MONCUATHAYTIN`) | Thư mục chứa | Bạn lấy gì từ file này? |
| :-: | :--- | :--- | :--- |
| **1** | `Đặc tả kỹ thuật Plugin và Database MySQL.docx` | `4. Kỹ thuật và Kiểm thử` | **Quan trọng nhất:** Chứa sẵn cây thư mục plugin `gearforge-core`, **đoạn lệnh SQL tạo 4 bảng mở rộng** và danh sách Hooks / REST API endpoints. |
| **2** | `Khung kiến trúc và Sơ đồ UML Mermaid.docx` | `2. Quy ước và Sơ đồ UML` | Copy code **ERD (Mục 5)** và **Sequence Diagram `UC-10` & `UC-11` (Mục 6.1)** sang `mermaid.live` xuất ảnh chèn báo cáo. |
| **3** | `Từ điển thuật ngữ và Ma trận Fit-Gap.docx` | `2. Quy ước và Sơ đồ UML` | Đối chiếu chính xác tên trạng thái hồ sơ (`SUBMITTED`, `L1_DOCS_VERIFIED`, `L2_EDU_CONFIRMED`, `APPROVED_WAITING_DOWNPAYMENT`), S/N và cấu trúc 6 mục `UC-10`. |
| **4** | `Danh mục nguồn tham chiếu và Plugin WordPress.docx` | `0. Tài liệu tham khảo` | Lấy link **Sandbox VNPay (`sandbox.vnpayment.vn/apis/`), MoMo (`developers.momo.vn`), Fundiin**, plugin **PDF Invoices (WP Overnight)** và quy chuẩn REST API Postman. |
| **5** | `Product Backlog 16 User Stories.docx` | `1. Quản lý nhóm và Phân vai` | Kiểm tra tiêu chí nghiệm thu của `US-13`, `US-14`, `US-15`, `US-16` để code đúng từng nút bấm. |

---

## 3. LỘ TRÌNH 5 BƯỚC LÀM VIỆC TỪ TUẦN 1 ĐẾN TUẦN 12

### Bước 1: Thiết kế ERD, Tạo 4 bảng MySQL & Đặc tả UC-10 (Sprint 1–2 | Tuần 2–6)
1. Mở `Khung kiến trúc và Sơ đồ UML Mermaid.docx` → copy code **Mục 5 (ERD)** và **Mục 6.1 (Sequence `UC-10 & UC-11`)** → vào `https://mermaid.live` → Export PNG nét cao (`ERD_GearForge_Role4.png`, `UC10_11_Installment_Sequence_Role4.png`).
2. Vẽ thêm **BPMN / Activity Diagram** luồng liên thông từ khi sinh viên chọn trả góp → duyệt 2 lớp → thanh toán cọc → gán `S/N` xuất kho → xuất Hóa đơn PDF (`UC10_12_Installment_Activity_Role4.png`).
3. Viết **Bảng đặc tả 6 mục chuẩn cho `UC-10 ★`** (kèm công thức tính trả góp, cấu trúc JSON payload, quy tắc tệp ≤ 5MB chỉ nhận JPG/PNG/PDF, và BDD `Given / When / Then`).
4. Lập **Bảng Từ điển dữ liệu (Data Dictionary)** mô tả chi tiết từng cột, kiểu dữ liệu, PK/FK/UNIQUE của 4 bảng mới để đưa vào **Mục 4.2**.

### Bước 2: Khởi tạo Khung Plugin `gearforge-core` & Chạy SQL tạo 4 bảng (Sprint 3 | Tuần 7)
1. Trong thư mục WordPress `wp-content/plugins/`, tạo thư mục `gearforge-core/` theo đúng kiến trúc đã chốt trong `Đặc tả kỹ thuật Plugin và Database MySQL.docx`.
2. Trong file `includes/class-gf-activator.php`, viết hàm `register_activation_hook` dùng `dbDelta()` chạy đúng 4 câu lệnh `CREATE TABLE IF NOT EXISTS` đã viết sẵn trong tài liệu kỹ thuật:
   - `wp_gf_installment_plans` (và seed sẵn 3 gói: **3 tháng – 0% lãi**, **6 tháng – 1.2%/tháng**, **12 tháng – 1.5%/tháng**, trả trước tối thiểu 20%).
   - `wp_gf_installment_applications`
   - `wp_gf_order_serials`
   - `wp_gf_fraud_blacklist`
3. Kích hoạt Plugin trong WP Admin → mở **phpMyAdmin** (hoặc Adminer) kiểm tra đủ 4 bảng đã sinh ra và chụp ảnh làm bằng chứng cho báo cáo.

### Bước 3: Lập trình 3 Module Trả góp, Mã hóa AES-256 & Duyệt 2 lớp (Sprint 3 | Tuần 8–9)
1. **Calculator & REST API (`class-gf-installment-calc.php`):**
   - Triển khai công thức tính trả góp (xem Mục 4 bên dưới) và mở endpoint `/wp-json/gearforge/v1/installment-calc?price=...&down_pct=...&months=...` để hiển thị trên web lẫn test **Postman** theo chuẩn `lab_api_notes.md` của thầy Tín.
2. **Bảo mật lưu ảnh CCCD/Thẻ SV (`class-gf-vault-crypto.php`):**
   - Kiểm tra file upload bằng `finfo_file` (chỉ nhận `.jpg`, `.png`, `.pdf` ≤ 5MB), đổi tên UUID, mã hóa **`openssl_encrypt(..., 'AES-256-CBC', ...)`** lưu vào thư mục bảo vệ `/var/www/gf-vault/` (nằm ngoài public hoặc có `.htaccess Deny from all`).
   - **Quy tắc bảo mật sống còn:** Đặt khóa bí mật `GF_VAULT_ENCRYPTION_KEY` trong `.env` / `wp-config.php`, **tuyệt đối không viết thẳng chuỗi key vào code trên GitHub**.
   - Cung cấp endpoint PHP trung gian kiểm tra `current_user_can('gf_review_installments')` (phối hợp Role 2) + WordPress Nonce mới giải mã luồng ảnh cho Reviewer xem.
3. **Màn hình Admin Duyệt 2 lớp (`class-gf-installment-review.php`):**
   - Tạo trang Menu riêng trong WP Admin (*"Hồ sơ Trả góp SV"*):
     - Nút **Duyệt Lớp 1 (Kiểm tra CCCD/Thẻ SV)** → đổi `status` thành `L1_DOCS_VERIFIED` + lưu `l1_verified_at`.
     - Nút **Duyệt Lớp 2 (Xác nhận SĐT/Email `.edu.vn`)** → đổi `status` thành `APPROVED_WAITING_DOWNPAYMENT` + lưu `l2_verified_at`.
     - Nút **Từ chối** (bắt buộc nhập lý do) hoặc **Đẩy vào Blacklist** (`wp_gf_fraud_blacklist`).

### Bước 4: Tích hợp Thanh toán Sandbox, Ràng buộc S/N & Hóa đơn PDF T-VAN (Sprint 4 | Tuần 10–11)
1. **Thanh toán Sandbox 3D-Secure (`class-gf-payment-sandbox.php`):**
   - Tham khảo code mở (`woo-vnpay`, `kanbox-momo-payment-gateway`, Plugin **Fundiin**) để tích hợp cổng thanh toán Sandbox (VNPay Test Card / OTP `123456`).
   - Quan trọng: Hỗ trợ luồng **thanh toán riêng khoản tiền cọc trả trước** sau khi hồ sơ được duyệt (`APPROVED_WAITING_DOWNPAYMENT`) → nhận IPN Callback xác thực chữ ký HMAC → chuyển trạng thái thành `ACTIVE_INSTALLMENT` & `PROCESSING`.
2. **Quản lý Serial Number xuất kho (`class-gf-serial-manager.php`):**
   - Tạo Meta Box *"Gán Serial Number / Service Tag"* ngay trong màn hình Chi tiết Đơn hàng WP Admin để lưu vào `wp_gf_order_serials` (chống nhập trùng mã S/N nhờ `UNIQUE KEY`).
   - Móc hook **`woocommerce_order_status_changed`**: nếu đơn có Laptop/PC mà Admin cố chuyển sang `SHIPPING` hoặc `COMPLETED` khi chưa gắn đủ `S/N`, **chặn ngay lại và báo lỗi đỏ nhắc nhập S/N**.
3. **Hóa đơn PDF chuẩn dữ liệu T-VAN (`class-gf-invoice-pdf.php`):**
   - Cài plugin **PDF Invoices & Packing Slips for WooCommerce (WP Overnight)** để lấy bộ khung in PDF ổn định, rồi dùng hook **`wpo_wcpdf_after_item_meta`** tự động chèn mã **`Serial Number`**, dòng **thuế VAT 8% / 10%**, **MST giả lập chuẩn Thông tư 78/NĐ 123** và **lịch kỳ hạn trả góp SV**.

### Bước 5: Test API bằng Postman, Viết Báo cáo Word & Push nhánh `role4` (Sprint 4 | Tuần 11–12)
1. Chụp ảnh màn hình test bằng **Postman** (theo `lab_api_notes.md` của thầy Tín): `GET /wp-json/wc/v3/products` và `GET /wp-json/gearforge/v1/installment-calc` trả về JSON sạch đẹp.
2. Viết các mục `[Role 4 viết]` vào **`Nháp Role 4 - Họ Tên.docx`**:
   - **Mục 3.7:** Đặc tả `UC-10` + BPMN/Activity + Sequence `UC-10/11`.
   - **Mục 4.2:** Mô hình ERD + Data Dictionary chi tiết 4 bảng `wp_gf_*`.
   - **Mục 5.2.3 & 5.2.4:** Ảnh Demo Công cụ tính/nộp hồ sơ trả góp, Duyệt 2 lớp, Thanh toán Sandbox VNPay/MoMo/Fundiin, Cảnh báo chặn thiếu S/N, và File Hóa đơn PDF có S/N + VAT.
   - **Mục 6.3:** Hướng mở rộng tương lai (eKYC AI tự động, kết nối API T-VAN Tổng cục Thuế thật, AI định giá Trade-in).
3. Đẩy code plugin lên đúng nhánh **`role4-backend-payment`** (không đẩy `.env`, `wp-config.php` hay thư mục ảnh `gf-vault/`):
   ```bash
   git checkout role4-backend-payment
   git fetch origin
   git merge origin/main
   git add plugins/gearforge-core/includes/ plugins/gearforge-core/gearforge-core.php
   git commit -m "[Role 4][UC-10] hoan thien plugin tra gop AES-256, duyet 2 lop va S/N"
   git push origin role4-backend-payment
   ```

---

## 4. CÔNG THỨC TRẢ GÓP & CHECKLIST REST API CHO ROLE 4 (DÙNG NGAY)

### 4.1. Công thức tính Trả góp Sinh viên chuẩn (nhất quán Frontend & Backend)
Giả sử **Giá máy = `P`**, **Tỷ lệ trả trước = `r_down`** (`20%`, `30%`, `50%`), **Số tháng góp = `N`** (`3`, `6`, `12` tháng), **Lãi suất phẳng/tháng = `r_int`** (ví dụ: 3 tháng = `0%`, 6 tháng = `1.2%/tháng`, 12 tháng = `1.5%/tháng`):
- **Tiền trả trước (`D`):** `D = P × r_down`
- **Gốc còn lại vay (`L`):** `L = P - D`
- **Tổng lãi cả kỳ hạn (`I`):** `I = L × r_int × N`
- **Số tiền phải trả mỗi tháng (`M`):** `M = round((L + I) / N, -3)` *(làm tròn đến hàng nghìn VNĐ)*
- *Ví dụ kiểm thử chuẩn (`TC-12`):* Laptop `20.000.000đ`, trả trước `30%` = `6.000.000đ`, gốc vay = `14.000.000đ`, kỳ hạn `6 tháng` (`1.2%/tháng`) → Tổng lãi = `1.008.000đ` → Góp mỗi tháng = `15.008.000 / 6` ≈ **`2.501.000đ/tháng`**.

### 4.2. Các biến môi trường bảo mật tuyệt đối không đưa lên GitHub
Trong `wp-config.php` (hoặc `.env`), khai báo:
- `GF_VAULT_ENCRYPTION_KEY`: Chuỗi random 32 bytes cho AES-256-CBC.
- `VNP_TMN_CODE` & `VNP_HASH_SECRET`: Lấy sau khi đăng ký miễn phí tại [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/apis/).
- `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`: Lấy từ [developers.momo.vn](https://developers.momo.vn/).

---

## 5. CHECKLIST TỰ KIỂM TRA TRƯỚC KHI BÀN GIAO (ROLE 4 DONE)

- [ ] Kích hoạt `gearforge-core` sinh đủ 4 bảng mở rộng trong MySQL + seed sẵn 3 gói (3, 6, 12 tháng).
- [ ] Ảnh CCCD/Thẻ SV tải lên được mã hóa AES-256 và lưu ngoài thư mục web public (đạt `TC-06`).
- [ ] Trang Admin duyệt hồ sơ đi đúng trình tự `Duyệt Lớp 1` → `Duyệt Lớp 2` → mở thanh toán tiền cọc Sandbox (`TC-13`, `TC-14`).
- [ ] Hệ thống chặn cứng không cho chuyển đơn Laptop sang `SHIPPING` nếu thiếu `S/N` (`TC-15`), và xuất được Hóa đơn PDF có mã S/N + VAT 8–10% (`TC-16`).
- [ ] Hoàn thiện `Nháp Role 4 - Họ Tên.docx` (Mục 3.7, 4.2, 5.2.3–5.2.4, 6.3), chụp log Postman API và push code sạch lên nhánh `role4-backend-payment`.
