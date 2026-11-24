# NHÁNH ROLE 4: BACKEND, CƠ SỞ DỮ LIỆU & MODULE TRẢ GÓP (`role4-backend-payment`)

> **Thành viên phụ trách:** **Lê Lưu Luân** — MSSV: `24521027`  
> **Vai trò trong nhóm (Nhóm 7 – EC312):** Role 4 – Developer 2 (Backend, Database & Trả góp Sinh viên) *(Issue `#4`)*  
> **Mục tiêu nhánh:** Lưu trữ toàn bộ mã nguồn Custom Plugin, thiết kế CSDL, sơ đồ UML/ERD, ảnh chụp minh chứng và phần báo cáo của Role 4 trước khi ghép vào nhánh `main`.

---

## 1. TỔNG QUAN CÁC SẢN PHẨM ĐÃ HOÀN THIỆN TRÊN NHÁNH

| Hạng mục | Đường dẫn xem nhanh | Mô tả nội dung |
| :--- | :--- | :--- |
| **Mã nguồn Plugin (`gearforge-core`)** | [plugins/gearforge-core/](plugins/gearforge-core/) | 9 class PHP xử lý trả góp SV 3–6–12 tháng, mã hóa AES-256-CBC, duyệt 2 lớp, Sandbox 3DS, S/N xuất kho, Hóa đơn PDF T-VAN và Đổi trả / Bảo hành (RMA). |
| **Bộ 6 Sơ đồ UML & ERD** | [2. Quy ước và Sơ đồ UML/role4_diagrams/](<2. Quy ước và Sơ đồ UML/role4_diagrams/>) | Gồm mã nguồn `.mmd` và ảnh `.png`: ERD (5 bảng `wp_gf_*`), Activity `UC-10..12`, Sequence `UC-10/11`, Sequence `UC-12`, Sequence `RMA` và Class Diagram Backend. |
| **Báo cáo Nháp Role 4 (Word & MD)** | [Nháp Role 4 - Lê Lưu Luân.docx](<3. Khung báo cáo đồ án EC312/Nháp Role 4 - Lê Lưu Luân.docx>) | Trình bày đầy đủ Mục 3.7 (`UC-10 ★`), Mục 4.2 (ERD & Data Dictionary), Mục 5.1/5.2.3–5.2.5 (ảnh Demo thực tế) và Mục 6.3. |
| **Nhật ký Kỹ thuật & Bảo mật** | [Nhật ký Kỹ thuật và Bảo mật Role 4.docx](<3. Khung báo cáo đồ án EC312/Nhật ký Kỹ thuật và Bảo mật Role 4.docx>) | Ghi nhận chi tiết 15 điểm tối ưu bảo mật & hiệu năng (`FIX-01..FIX-15`) kèm nguyên nhân và cách xử lý. |
| **Ảnh minh chứng & PDF mẫu** | [Ảnh minh chứng Role 4/](<3. Khung báo cáo đồ án EC312/Ảnh minh chứng Role 4/>) | Ảnh chụp REST API, WP Admin duyệt 2 lớp, Sandbox 3DS, Meta Box S/N, WP Admin RMA, phpMyAdmin 5 bảng `wp_gf_*` và file Hóa đơn PDF mẫu `GearForge-Invoice-20.pdf`. |
| **Tài liệu hướng dẫn gốc** | [Hướng dẫn Role 4 - Backend Database và Trả góp.md](<Hướng dẫn Role 4 - Backend Database và Trả góp.md>) | Đề cương phân công ban đầu của Role 4. |

---

## 2. PHẠM VI NGHIỆP VỤ & CÁC API CUNG CẤP CHO NHÓM

* **Cụm Use Case phụ trách:** `UC-10 ★` (Tính & nộp hồ sơ trả góp SV 3–6–12 tháng), `UC-11` (Duyệt 2 lớp & Sandbox VNPay/MoMo/Fundiin 3D-Secure), `UC-12` (Gắn Serial Number xuất kho & Xuất Hóa đơn PDF chuẩn T-VAN), cùng phân hệ **Đổi trả / Bảo hành (`RMA`)**.
* **5 bảng MySQL mở rộng (`wp_gf_*`):** `wp_gf_installment_plans`, `wp_gf_installment_applications`, `wp_gf_order_serials`, `wp_gf_fraud_blacklist`, `wp_gf_rma_requests`.
* **REST API Endpoints phục vụ Frontend (Role 3) & Kiểm thử (Role 2):**
  * `GET /wp-json/gearforge/v1/installment-calc?price=...&down_pct=...&months=...` — Tính trả trước, gốc vay, lãi và tiền góp hàng tháng.
  * `POST /wp-json/gearforge/v1/installment-apply` — Nộp hồ sơ trả góp sinh viên kèm upload 2 ảnh CCCD/Thẻ SV mã hóa AES-256-CBC *(yêu cầu đăng nhập đúng chủ đơn)*.
  * `POST /wp-json/gearforge/v1/payment-sandbox/session` — Khởi tạo URL thanh toán Sandbox 3D-Secure ký HMAC-SHA256 (TTL 15 phút) cho khoản trả trước (`APPROVED_WAITING_DOWNPAYMENT`) hoặc trả thẳng.
  * `GET /wp-json/gearforge/v1/oms-status/{order_id}` — Tra cứu trạng thái đơn hàng + hồ sơ trả góp + Serial Number + `invoice_download_url` *(yêu cầu đăng nhập đúng chủ đơn hoặc Admin/Reviewer)*.
  * `POST /wp-json/gearforge/v1/payment-sandbox/ipn` — Nhận Webhook IPN xác thực chữ ký HMAC-SHA256.
  * `GET /wp-json/gearforge/v1/payment-sandbox/query/{order_id}` — Đối soát chủ động `QueryDR` chống thanh toán trùng khi rớt mạng.
  * `POST /wp-json/gearforge/v1/rma-request` — Gửi yêu cầu Đổi trả / Bảo hành (RMA) gắn `serial_number` và kiểm tra hạn 15 ngày.
  * `GET /wp-json/gearforge/v1/rma-status/{order_id}` — Tra cứu danh sách và trạng thái yêu cầu RMA của đơn hàng *(có chống IDOR)*.
* **Kiểm thử hồi quy CLI (`plugins/gearforge-core/tests/verify-role4.php`):** Chạy qua Docker `docker exec gearforge_wp php /var/www/html/wp-content/plugins/gearforge-core/tests/verify-role4.php` (29 assertions E2E).

---

## 3. LƯU Ý KHI GHÉP CODE & TÀI LIỆU VÀO `main`

* Nhánh này đã lược bỏ các thư mục tài liệu dùng chung (`0.`, `1.`, `4.`) để tránh chỉnh sửa nhầm phần việc của các thành viên khác; khi cần tra cứu quy ước chung có thể xem trực tiếp trên nhánh [`main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main) hoặc [Google Drive Nhóm 7 (`MONCUATHAYTIN`)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm).
* **Nhờ Role 2 (SM) khi tích hợp lên `main`:** Không merge toàn bộ lịch sử xóa thư mục của nhánh này, mà chỉ kéo đúng các thư mục sản phẩm của Role 4 sang `main`:
  ```bash
  git checkout main
  git checkout origin/role4-backend-payment -- plugins/ "2. Quy ước và Sơ đồ UML/role4_diagrams/" "3. Khung báo cáo đồ án EC312/"
  ```
* Trong file `plugins/gearforge-core/gearforge-core.php` đã cấu hình cơ chế nạp module an toàn (`file_exists`), chỉ cần bổ sung tên file của Role 1 & Role 2 (`class-gf-compare-specs.php`, `class-gf-rbac.php`, `class-gf-fraud-guard.php`) vào mảng `$modules` khi ghép đủ 4 phân hệ.

---

## 4. TÀI KHOẢN MÔI TRƯỜNG DEMO LOCAL (DÀNH CHO NHÓM TEST CHUNG)

*(Chỉ sử dụng cho môi trường Docker Local trên máy phát triển, tuyệt đối không dùng cho môi trường Production)*

| Hệ thống / Vai trò | Đường dẫn truy cập | Tài khoản (Username) | Mật khẩu (Password) | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **WordPress Admin** (`StoreAdmin` / `InstallmentReviewer`) | `http://localhost:8080/wp-admin` | `admin` | `admin123` | Quản lý SP, Duyệt trả góp 2 lớp, Gán S/N, Xử lý RMA, Xuất PDF T-VAN |
| **Tài khoản Sinh viên** (`StudentCustomer`) | `http://localhost:8080/wp-login.php` | `user` (`24521027@gm.uit.edu.vn`) | `admin123` | Đăng nhập sinh viên test đặt hàng, nộp trả góp, gửi/tra cứu RMA |
| **phpMyAdmin** (MySQL 8.0 – DB `gearforge_db`) | `http://localhost:8081` | `gf_user` | `admin123` | Kiểm tra trực tiếp 5 bảng mở rộng `wp_gf_*` và dữ liệu seed |
