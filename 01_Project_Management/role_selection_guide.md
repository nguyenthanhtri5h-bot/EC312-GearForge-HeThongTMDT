# HƯỚNG DẪN CHỌN VAI TRÒ & PHÂN CÔNG NHÓM (4 THÀNH VIÊN)

> Tài liệu này giúp 4 thành viên nhóm **GearForge (EC312)** nhanh chóng chọn đúng vai trò dựa trên thế mạnh cá nhân trước khi gán tên vào bản mô tả dự án chính thức. Mọi vai trò được cân bằng ở mức **25% khối lượng công việc**, vừa đảm bảo tinh thần **Scrum Team liên chức năng (Cross-functional)** vừa đáp ứng quy định bắt buộc của môn EC312: *mỗi sinh viên chủ trì phân tích – thiết kế tối thiểu 1 cụm Use Case riêng*.

---

## 1. TỔNG QUAN 4 GÓI VAI TRÒ (ROLE PACKAGES)

| Mã Vai trò | Vai trò Scrum | Chức danh kiêm nhiệm | Điểm mạnh phù hợp | Tỷ trọng liên quan Rubric EC312 |
| :--- | :--- | :--- | :--- | :--- |
| **Role 1** | **Product Owner (PO)** | Nhóm trưởng / Business Analyst (BA) | Giao tiếp tốt với GVHD, viết tài liệu phân tích sắc bén, thích làm khảo sát, chuẩn hóa dữ liệu sản phẩm. | Phân tích yêu cầu (15%), Dữ liệu & Pháp lý (10%), UC tổng thể |
| **Role 2** | **Scrum Master (SM)** | System Architect / Security & QA Lead | Tư duy hệ thống tổng thể, rành sơ đồ kiến trúc/UML, thích kiểm thử (QA), cấu hình Docker/Hosting/SSL & bảo mật. | Thiết kế hệ thống & UML (25%), Báo cáo & Nhật ký nhóm (10%) |
| **Role 3** | **Developer 1 (Dev 1)** | UI/UX Designer & Frontend WooCommerce | Có gu thẩm mỹ, biết dùng Figma/Canva, rành CSS/HTML/WordPress Theme, chú trọng trải nghiệm người dùng. | UI/UX (10%), Demo Frontend Storefront & OMS (10%) |
| **Role 4** | **Developer 2 (Dev 2)** | Backend, Database & Payment Engineer | Tư duy logic CSDL (SQL/ERD) tốt, thích code PHP/Plugin, xử lý API thanh toán Sandbox và nghiệp vụ trả góp. | Thiết kế CSDL (10%), Demo Backend/Plugin & Sáng tạo (20%) |

---

## 2. CHI TIẾT ĐẦU VIỆC TỪNG VAI TRÒ (CHỌN THEO THẾ MẠNH)

### Role 1: Product Owner (PO) – Kiêm Nhóm trưởng & BA
- **Công cụ chính:** Google Forms, Excel/CSV, PlantUML/Mermaid/Draw.io, WordPress Admin (Product Import).
- **Cụm Use Case phụ trách (`Gói 1`):**
  - `UC-01`: Tìm kiếm & Lọc sản phẩm theo thông số (CPU, RAM, GPU, Nhu cầu, Khoảng giá).
  - `UC-02` *(Trọng tâm đặc tả)*: **So sánh cấu hình 2–3 Laptop/PC (Compare Specs)**.
  - `UC-03`: Quản lý danh mục & Import dữ liệu sản phẩm (≥ 500 sản phẩm).
- **Đầu việc Báo cáo EC312:**
  - Khảo sát sinh viên ĐHQG TP.HCM (`survey_questionnaire_template.md`) & tổng hợp biểu đồ số liệu.
  - Hoàn thiện Chương 1 & Chương 2 (Bài toán, KPIs, TCO, FR-01..FR-10, NFR-01..NFR-06).
  - Chủ trì vẽ **Use Case Diagram tổng thể** (`UC-01`..`UC-12`) + đặc tả chi tiết, Activity, Sequence cho `UC-02`.
  - Soạn thảo nội dung chính sách Bảo hành, Đổi trả, Điều khoản (chuẩn bị hồ sơ Bộ Công Thương).
- **Đầu việc Demo WooCommerce:**
  - Chuẩn hóa bộ thuộc tính kỹ thuật (Attributes: CPU, RAM, SSD, GPU, Màn hình, Nhu cầu).
  - Thu thập, làm sạch file CSV và import **≥ 500 sản phẩm** (Laptop, PC, Phụ kiện) lên WooCommerce.

### Role 2: Scrum Master (SM) – Kiêm System Architect & Security/QA Lead
- **Công cụ chính:** Git/GitHub, Trello/Jira/GitHub Projects, Docker, PlantUML/Mermaid, SSL/WAF, Test Plan Sheet.
- **Cụm Use Case phụ trách (`Gói 2`):**
  - `UC-04`: Đăng ký, Đăng nhập & Xác thực tài khoản sinh viên (`.edu.vn`).
  - `UC-05` *(Trọng tâm đặc tả)*: **Phân quyền RBAC, Mã hóa hồ sơ định danh (NĐ 13/2023) & Kiểm soát Blacklist/Rate Limit**.
  - `UC-06`: Đánh giá sản phẩm & Kiểm duyệt bình luận.
- **Đầu việc Báo cáo EC312:**
  - Thiết kế **System Architecture Diagram** (Layered + Microkernel Plugin-based trên WooCommerce).
  - Chủ trì thống nhất **Class Diagram** toàn hệ thống và **State Machine Diagram** (vòng đời `Order` & `InstallmentApplication`).
  - Đặc tả chi tiết, Activity, Sequence cho `UC-05`.
  - Ghi chép **Nhật ký làm việc nhóm** (`scrum_log_template.md`), tổng hợp **Test Report**, rà soát định dạng và xuất bản báo cáo `.docx` / `.pdf`.
- **Đầu việc Demo WooCommerce:**
  - Dựng khung môi trường chạy chung (Docker local hoặc Cloud Hosting/VPS + Domain + SSL).
  - Thiết lập bảo mật cơ bản (Rate Limiting, RBAC phân quyền `StoreAdmin` vs `InstallmentReviewer`, kiểm tra luồng Consent NĐ 13/2023).
  - Thực hiện kiểm thử toàn hệ thống theo `test_plan_skeleton.md`.

### Role 3: Developer 1 (Dev 1) – UI/UX Designer & Frontend WooCommerce
- **Công cụ chính:** Figma, HTML5/CSS3/JS, WordPress Theme / Child Theme, Shortcode / Elementor / Gutenberg.
- **Cụm Use Case phụ trách (`Gói 3`):**
  - `UC-07`: Quản lý Giỏ hàng & Áp mã khuyến mãi sinh viên.
  - `UC-08` *(Trọng tâm đặc tả)*: **Đặt hàng trực tuyến (Checkout tiêu chuẩn & Checkout trả góp) & Theo dõi trạng thái đơn hàng (OMS)**.
  - `UC-09`: Yêu cầu bảo hành / Đổi trả theo Serial Number (S/N).
- **Đầu việc Báo cáo EC312:**
  - Thiết kế bộ **Wireframe & Mockup trên Figma** (Home, Category & Filter, Product Detail, Bảng Compare Specs 2–3 máy, Form tính/nộp hồ sơ trả góp, Cart, Checkout, OMS Tracking, Admin Dashboard).
  - Trình bày User Flow & Nguyên tắc thiết kế UI/UX (Mục 4.3).
  - Đặc tả chi tiết, Activity, Sequence cho `UC-08`.
- **Đầu việc Demo WooCommerce:**
  - Cài đặt và tùy biến Theme/Child Theme cho giao diện **GearForge** (Responsive Mobile & Desktop).
  - Dựng giao diện **Bộ lọc thông số chuyên sâu** & **Bảng Compare Specs** đối chiếu trực quan 2–3 máy.
  - Thiết kế hộp thoại **Consent Banner (Nghị định 13/2023/NĐ-CP)** trước khi upload CCCD/Thẻ SV và tối ưu tốc độ tải trang (`< 3 giây`).

### Role 4: Developer 2 (Dev 2) – Backend, Database & Payment Engineer
- **Công cụ chính:** MySQL / phpMyAdmin, PHP (WordPress/WooCommerce Custom Plugin), REST API / Sandbox (VNPay, MoMo, Fundiin), Dompdf/TCPDF.
- **Cụm Use Case phụ trách (`Gói 4`):**
  - `UC-10` *(Trọng tâm đặc tả)*: **Tính toán gói trả góp & Nộp hồ sơ trả góp sinh viên (3–6–12 tháng, upload CCCD/Thẻ SV)**.
  - `UC-11`: Xét duyệt hồ sơ trả góp 2 lớp & Thanh toán trực tuyến qua Sandbox (VNPay/MoMo/Fundiin 3D-Secure).
  - `UC-12`: Xuất kho gắn mã Serial Number (S/N) & Xuất Hóa đơn PDF chuẩn dữ liệu T-VAN.
- **Đầu việc Báo cáo EC312:**
  - Thiết kế **Mô hình ERD** và ánh xạ **CSDL quan hệ MySQL** (liên kết bảng lõi WooCommerce với 4 bảng mở rộng `wp_gf_*`) + Từ điển dữ liệu (Mục 4.2).
  - Đặc tả chi tiết, BPMN/Activity, Sequence cho `UC-10` (và phối hợp luồng `UC-11`).
  - Viết phần mô tả giải pháp kỹ thuật Custom Plugin, bảo mật dữ liệu AES-256 & định hướng tích hợp T-VAN/eKYC.
- **Đầu việc Demo WooCommerce:**
  - Lập trình Custom Plugin `gearforge-core` (PHP/MySQL): công cụ tính trả trước/góp hàng tháng (3–6–12 tháng), upload & mã hóa tệp CCCD/Thẻ SV, giao diện Admin duyệt 2 lớp.
  - Tích hợp cổng thanh toán **Sandbox VNPay / MoMo / Fundiin** (3D-Secure).
  - Lưu **Serial Number (S/N)** vào đơn hàng khi xuất kho và xuất **Hóa đơn PDF mẫu** chuẩn T-VAN.

---

## 3. BẢNG ĐĂNG KÝ CHỐT VAI TRÒ CỦA NHÓM

*(Sau khi họp nhóm thống nhất, điền thông tin vào bảng dưới đây và cập nhật đồng bộ sang `Ban_Mo_Ta_Du_An_GearForge.md` / `.docx`)*

| Role | Vai trò Scrum | Họ và tên | MSSV | Email / Zalo / GitHub | Trạng thái nhận việc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Role 1** | Product Owner (PO) / BA | *[Điền họ tên]* | *[MSSV]* | *[Liên hệ]* | `[ ] Đã nhận` |
| **Role 2** | Scrum Master (SM) / Architect / QA | *[Điền họ tên]* | *[MSSV]* | *[Liên hệ]* | `[ ] Đã nhận` |
| **Role 3** | Developer 1 (UI/UX & Frontend) | *[Điền họ tên]* | *[MSSV]* | *[Liên hệ]* | `[ ] Đã nhận` |
| **Role 4** | Developer 2 (Backend, DB & Payment) | *[Điền họ tên]* | *[MSSV]* | *[Liên hệ]* | `[ ] Đã nhận` |

---

## 4. NGUYÊN TẮC PHỐI HỢP ĐỂ KHÔNG BỊ LỆCH BÀI KHI GHÉP

1. **Khóa cứng thuật ngữ (Single Source of Truth):** Trước khi vẽ bất kỳ biểu đồ UML, bảng DB hay màn hình Figma nào, cả 4 người **bắt buộc** tra cứu tên Actor, mã `UC-01..UC-12`, mã `FR/NFR`, tên trạng thái và tên bảng DB trong file `02_Shared_Specs_and_Standards/shared_domain_glossary.md`.
2. **Quy tắc đặt tên file sản phẩm đầu ra:**
   - Sơ đồ UML: `UC02_CompareSpecs_Sequence_Role1.png` (kèm file `.puml` hoặc `.mmd` nguồn).
   - Giao diện Figma: Đặt tên Frame rõ ràng theo mã UC, ví dụ `[UC-08] Checkout_Installment_Mobile`.
   - Code Plugin: Mỗi thành viên làm việc trên branch riêng (`feat/role1-import`, `feat/role2-security`, `feat/role3-ui`, `feat/role4-installment`) trước khi merge vào `main`.
3. **Cổng kiểm duyệt chéo (2-Stage Review):**
   - *Vòng 1 (PO duyệt nghiệp vụ):* Có khớp với `shared_domain_glossary.md` và `product_backlog.md` không?
   - *Vòng 2 (SM duyệt kỹ thuật & định dạng):* Tên lớp/bảng có trùng khớp sơ đồ tổng thể không, có vi phạm bảo mật NĐ 13/2023 không?
