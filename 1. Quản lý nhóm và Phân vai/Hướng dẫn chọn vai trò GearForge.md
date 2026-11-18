# HƯỚNG DẪN CHỌN VAI TRÒ & PHÂN CÔNG NHÓM (4 THÀNH VIÊN)

> Tài liệu này giúp 4 thành viên nhóm **GearForge (EC312)** nhanh chóng chọn đúng vai trò dựa trên thế mạnh cá nhân trước khi gán tên vào `Bản mô tả dự án GearForge.docx`. Mọi vai trò được cân bằng ở mức **25% khối lượng công việc**, vừa đảm bảo tinh thần **Scrum Team liên chức năng (Cross-functional)** vừa đáp ứng quy định bắt buộc của môn EC312: *mỗi sinh viên chủ trì phân tích – thiết kế tối thiểu 1 cụm Use Case riêng*.

---

## 1. TỔNG QUAN 4 GÓI VAI TRÒ (ROLE PACKAGES)

| Mã Vai trò | Vai trò Scrum | Chức danh kiêm nhiệm | Nhánh GitHub độc quyền | Tỷ trọng liên quan Rubric EC312 |
| :--- | :--- | :--- | :--- | :--- |
| **Role 1** | **Product Owner (PO)** | Nhóm trưởng / Business Analyst (BA) | `role1-data-catalog` | Phân tích yêu cầu (15%), Dữ liệu & Pháp lý (10%), UC tổng thể |
| **Role 2** | **Scrum Master (SM)** | System Architect / Security & QA Lead | `role2-security-qa` | Thiết kế hệ thống & UML (25%), Báo cáo & Nhật ký nhóm (10%) |
| **Role 3** | **Developer 1 (Dev 1)** | UI/UX Designer & Frontend WooCommerce | `role3-ui-frontend` | UI/UX (10%), Demo Frontend Storefront & OMS (10%) |
| **Role 4** | **Developer 2 (Dev 2)** | Backend, Database & Payment Engineer | `role4-backend-payment` | Thiết kế CSDL (10%), Demo Backend/Plugin & Sáng tạo (20%) |

---

## 2. CHI TIẾT ĐẦU VIỆC TỪNG VAI TRÒ (CHỌN THEO THẾ MẠNH)

### Role 1: Product Owner (PO) – Kiêm Nhóm trưởng & BA (`role1-data-catalog`)
- **Công cụ chính:** Google Forms, Excel/CSV, PlantUML/Mermaid/Draw.io, WordPress Admin (Product Import).
- **Cụm Use Case phụ trách (`Gói 1`):**
  - `UC-01`: Tìm kiếm & Lọc sản phẩm theo thông số (CPU, RAM, GPU, Nhu cầu, Khoảng giá).
  - `UC-02` *(Trọng tâm đặc tả)*: **So sánh cấu hình 2–3 Laptop/PC (Compare Specs)**.
  - `UC-03`: Quản lý danh mục & Import dữ liệu sản phẩm (≥ 500 sản phẩm).
- **Đầu việc Báo cáo EC312:**
  - Khảo sát sinh viên ĐHQG TP.HCM (`3. Khung báo cáo đồ án EC312/Mẫu bảng hỏi khảo sát sinh viên ĐHQG.docx`) & tổng hợp biểu đồ số liệu.
  - Hoàn thiện Chương 1 & Chương 2 (Bài toán, KPIs, TCO, FR-01..FR-10, NFR-01..NFR-06) và Chương 6.1–6.2.
  - Chủ trì vẽ **Use Case Diagram tổng thể** (`UC-01`..`UC-12`) + đặc tả chi tiết, Activity, Sequence cho `UC-02`.
  - Soạn thảo nội dung chính sách Bảo hành, Đổi trả, Điều khoản (chuẩn bị hồ sơ Bộ Công Thương).
- **Đầu việc Demo & File độc quyền:**
  - Chuẩn hóa bộ thuộc tính kỹ thuật (Attributes: CPU, RAM, SSD, GPU, Màn hình, Nhu cầu).
  - Thu thập dữ liệu (tham khảo Xgear, MemoryZone, GearVN), làm sạch file CSV và import **≥ 500 sản phẩm** qua WooCommerce REST API.
  - Quản lý logic xử lý dữ liệu so sánh trong `includes/class-gf-compare-specs.php`.

### Role 2: Scrum Master (SM) – Kiêm System Architect & Security/QA Lead (`role2-security-qa`)
- **Công cụ chính:** Git/GitHub, Docker, PlantUML/Mermaid, SSL/WAF, Test Plan Sheet.
- **Cụm Use Case phụ trách (`Gói 2`):**
  - `UC-04`: Đăng ký, Đăng nhập & Xác thực tài khoản sinh viên (`.edu.vn`).
  - `UC-05` *(Trọng tâm đặc tả)*: **Phân quyền RBAC, Mã hóa hồ sơ định danh (NĐ 13/2023) & Kiểm soát Blacklist/Rate Limit**.
  - `UC-06`: Đánh giá sản phẩm & Kiểm duyệt bình luận.
- **Đầu việc Báo cáo EC312:**
  - Thiết kế **System Architecture Diagram** (Layered + Microkernel Plugin-based trên WooCommerce – Mục 4.1).
  - Chủ trì thống nhất **Class Diagram** toàn hệ thống (Mục 3.2) và **State Machine Diagram** (vòng đời `Order` & `InstallmentApplication` – Mục 3.3).
  - Đặc tả chi tiết, Activity, Sequence cho `UC-05` (Mục 3.5).
  - Ghi chép **Nhật ký làm việc nhóm** (`Mẫu nhật ký làm việc nhóm Scrum.docx`), tổng hợp **Test Report** (Mục 5.3), kiểm soát chất lượng Pull Request trên GitHub và ghép/xuất bản báo cáo `.docx` / `.pdf`.
- **Đầu việc Demo & File độc quyền:**
  - Dựng khung môi trường chạy chung (`4. Kỹ thuật và Kiểm thử/docker-compose.skeleton.yml` hoặc Cloud Hosting/VPS + SSL).
  - Lập trình bảo mật `includes/class-gf-rbac.php` và `includes/class-gf-fraud-guard.php` (Rate Limiting, Blacklist, kiểm tra luồng Consent NĐ 13/2023).
  - Thực hiện kiểm thử toàn hệ thống theo `4. Kỹ thuật và Kiểm thử/Kế hoạch kiểm thử 16 Test Cases.docx`.

### Role 3: Developer 1 (Dev 1) – UI/UX Designer & Frontend WooCommerce (`role3-ui-frontend`)
- **Công cụ chính:** Figma, HTML5/CSS3/JS, WordPress Theme / Child Theme, Shortcode / Elementor / Gutenberg.
- **Cụm Use Case phụ trách (`Gói 3`):**
  - `UC-07`: Quản lý Giỏ hàng & Áp mã khuyến mãi sinh viên.
  - `UC-08` *(Trọng tâm đặc tả)*: **Đặt hàng trực tuyến (Checkout tiêu chuẩn & Checkout trả góp) & Theo dõi trạng thái đơn hàng (OMS)**.
  - `UC-09`: Yêu cầu bảo hành / Đổi trả theo Serial Number (S/N).
- **Đầu việc Báo cáo EC312:**
  - Thiết kế bộ **Wireframe & Mockup trên Figma** (Home, Category & Filter, Product Detail, Bảng Compare Specs 2–3 máy, Form tính/nộp hồ sơ trả góp, Cart, Checkout, OMS Tracking, Admin Dashboard).
  - Trình bày User Flow & Nguyên tắc thiết kế UI/UX (Mục 4.3).
  - Đặc tả chi tiết, Activity, Sequence cho `UC-08` (Mục 3.6).
- **Đầu việc Demo & File độc quyền:**
  - Cài đặt và tùy biến Theme/Child Theme cho giao diện **GearForge** (Responsive Mobile & Desktop).
  - Toàn quyền quản lý thư mục giao diện `templates/` (`compare-table.php`, `installment-widget.php`, `oms-tracking-stepper.php`) và thư mục `assets/` (`css/gearforge-frontend.css`, `js/gearforge-frontend.js`).
  - Thiết kế hộp thoại **Consent Banner (Nghị định 13/2023/NĐ-CP)** trước khi upload CCCD/Thẻ SV và tối ưu tốc độ tải trang (`< 3 giây`).

### Role 4: Developer 2 (Dev 2) – Backend, Database & Payment Engineer (`role4-backend-payment`)
- **Công cụ chính:** MySQL / phpMyAdmin, PHP (WordPress/WooCommerce Custom Plugin), REST API / Sandbox (VNPay, MoMo, Fundiin), Dompdf/TCPDF.
- **Cụm Use Case phụ trách (`Gói 4`):**
  - `UC-10` *(Trọng tâm đặc tả)*: **Tính toán gói trả góp & Nộp hồ sơ trả góp sinh viên (3–6–12 tháng, upload CCCD/Thẻ SV)**.
  - `UC-11`: Xét duyệt hồ sơ trả góp 2 lớp & Thanh toán trực tuyến qua Sandbox (VNPay/MoMo/Fundiin 3D-Secure).
  - `UC-12`: Xuất kho gắn mã Serial Number (S/N) & Xuất Hóa đơn PDF chuẩn dữ liệu T-VAN.
- **Đầu việc Báo cáo EC312:**
  - Thiết kế **Mô hình ERD** và ánh xạ **CSDL quan hệ MySQL** (liên kết bảng lõi WooCommerce với 4 bảng mở rộng `wp_gf_*`) + Từ điển dữ liệu (Mục 4.2).
  - Đặc tả chi tiết, BPMN/Activity, Sequence cho `UC-10` (và phối hợp luồng `UC-11` – Mục 3.7).
  - Viết phần mô tả giải pháp kỹ thuật Custom Plugin, bảo mật dữ liệu AES-256 & định hướng tích hợp T-VAN/eKYC (Mục 6.3).
- **Đầu việc Demo & File độc quyền:**
  - Toàn quyền quản lý các file xử lý lõi trong `includes/`: `class-gf-activator.php`, `class-gf-installment-calc.php`, `class-gf-vault-crypto.php`, `class-gf-installment-review.php`, `class-gf-payment-sandbox.php`, `class-gf-serial-manager.php`, `class-gf-invoice-pdf.php` và thư mục `admin/`.
  - Tích hợp cổng thanh toán **Sandbox VNPay / MoMo / Fundiin** (3D-Secure), lưu **S/N** xuất kho và xuất **Hóa đơn PDF mẫu** chuẩn T-VAN.

---

## 3. BẢNG ĐĂNG KÝ CHỐT VAI TRÒ CỦA NHÓM

*(Sau khi họp nhóm thống nhất, điền thông tin vào bảng dưới đây và cập nhật đồng bộ sang `Bản mô tả dự án GearForge.docx`)*

| Role | Vai trò Scrum | Nhánh GitHub | Họ và tên | MSSV | Tình trạng | Trạng thái nhận việc |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Role 1** | PO / BA | `role1-data-catalog` | **Trịnh Duy Long** | `24521021` | Nhóm trưởng / PO | `[x] Đã nhận` |
| **Role 2** | SM / Architect / QA | `role2-security-qa` | **Ngô Trọng Đạt** | `24520275` | Scrum Master / QA | `[x] Đã nhận` |
| **Role 3** | Dev 1 (UI/UX & FE) | `role3-ui-frontend` | **Nguyễn Thanh Trí** | `24521838` | Developer 1 (UI/UX) | `[x] Đã nhận` |
| **Role 4** | Dev 2 (BE, DB & Pay) | `role4-backend-payment` | **Lê Lưu Luân** | `24521027` | Developer 2 (Backend) | `[x] Đã nhận` |

---

## 4. NGUYÊN TẮC PHỐI HỢP CHỐNG ĐÈ VIỆC & CHỐNG ĐÈ NHÁNH

1. **Khóa cứng thuật ngữ (Single Source of Truth):** Trước khi vẽ bất kỳ biểu đồ UML, bảng DB hay màn hình Figma nào, cả 4 người **bắt buộc** tra cứu tên Actor, mã `UC-01..UC-12`, mã `FR/NFR`, tên trạng thái và tên bảng DB trong `2. Quy ước và Sơ đồ UML/Từ điển thuật ngữ và Ma trận Fit-Gap.docx`.
2. **Quy tắc đặt tên file sản phẩm đầu ra (Chống ghi đè tên file giống nhau):**
   - Sơ đồ UML: `UC02_CompareSpecs_Sequence_Role1.png` (kèm file `.puml` hoặc `.mmd` nguồn).
   - Giao diện Figma: Đặt tên Frame rõ ràng theo mã UC, ví dụ `[UC-08] Checkout_Installment_Mobile`.
   - File nháp Word trên Google Drive: `Nháp Role X - Họ Tên.docx` lưu trong thư mục `3. Khung báo cáo đồ án EC312` trước khi ghép vào `Khung báo cáo đồ án EC312 GearForge.docx`.
3. **Quy tắc phân nhánh Git bắt buộc (Chống đè nhánh & xung đột code):**
   - Nhóm sử dụng **4 nhánh cố định đã tạo sẵn trên GitHub**: `role1-data-catalog`, `role2-security-qa`, `role3-ui-frontend`, `role4-backend-payment`.
   - Ai thuộc Role nào **chỉ checkout và push lên đúng nhánh của mình**; mỗi ngày bắt buộc chạy `git fetch origin` rồi `git merge origin/main` trước khi code; chỉ add đúng file thuộc lãnh thổ của mình; mở Pull Request từ `roleX-...` vào `main`.
   - **Cấm tuyệt đối:** `git push origin main` trực tiếp, `git push --force`, hoặc nhảy sang nhánh Role khác để sửa file.
4. **Cổng kiểm duyệt chéo trước khi Merge (2-Stage Review):**
   - *Vòng 1 (PO duyệt nghiệp vụ):* Có khớp với `Từ điển thuật ngữ và Ma trận Fit-Gap.md` và `Product Backlog 16 User Stories.md` không?
   - *Vòng 2 (SM duyệt kỹ thuật & không xung đột):* PR có chạm chéo vào file của Role khác không, tên lớp/bảng có trùng khớp sơ đồ tổng thể không, có vi phạm bảo mật NĐ 13/2023 không?
