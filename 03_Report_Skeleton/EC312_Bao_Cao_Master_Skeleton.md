# BÁO CÁO ĐỒ ÁN MÔN HỌC: THIẾT KẾ HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ (EC312)

> **Hướng dẫn sử dụng Khung Báo cáo (Master Outline):**
> - Tài liệu này được thiết kế chuẩn theo **Mẫu đồ án EC312** và **Rubric 100 điểm** (`00_References/project-template.md` & `project-rubric.md`).
> - Các thẻ `[Role X viết]` chỉ rõ thành viên phụ trách biên soạn từng mục để 4 người viết song song mà không bị chồng chéo, sau đó Role 1 & Role 2 ghép lại và dùng script chuyển sang `.docx` / `.pdf`.

---

## TRANG BÌA (COVER PAGE)

- **Trường:** Đại học Công nghệ Thông tin (UIT) – ĐHQG TP.HCM
- **Khoa:** Hệ thống Thông tin
- **Môn học:** Thiết kế Hệ thống Thương mại điện tử (**EC312**)
- **Tên đề tài:** **Xây dựng Hệ thống Thương mại điện tử kinh doanh Laptop, PC và Phụ kiện – GearForge**
- **Giảng viên hướng dẫn:** ThS. Trình Trọng Tín
- **Ngày nộp:** *[dd/mm/yyyy]*

### BẢNG THÔNG TIN NHÓM & PHÂN CÔNG ĐỒ ÁN

| STT | Họ và tên | MSSV | Vai trò Scrum | Chức danh chuyên môn | Phân hệ phụ trách phân tích & thiết kế |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | *[Họ tên 1]* | *[MSSV 1]* | **Product Owner (PO)** | Nhóm trưởng / BA | Use Case tổng thể, **UC-02** (Compare Specs), Dữ liệu ≥ 500 SP, Pháp lý |
| 2 | *[Họ tên 2]* | *[MSSV 2]* | **Scrum Master (SM)** | System Architect / QA | Kiến trúc, Class, State Machine, **UC-05** (RBAC/NĐ 13/2023/Blacklist), QA |
| 3 | *[Họ tên 3]* | *[MSSV 3]* | **Developer 1 (Dev 1)** | UI/UX & Frontend | Bộ Mockup Figma, Storefront UI, **UC-08** (Checkout & OMS Tracking) |
| 4 | *[Họ tên 4]* | *[MSSV 4]* | **Developer 2 (Dev 2)** | Backend, DB & Payment | ERD & MySQL Schema, **UC-10/UC-11** (Trả góp SV & Sandbox), S/N & PDF |

---

## MỤC LỤC – DANH MỤC HÌNH ẢNH – DANH MỤC BẢNG BIỂU

*(Tự động cập nhật trong Microsoft Word khi xuất bản từ file `.docx`)*

---

## CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI *(Role 1 – PO chủ trì)*

### 1.1. Lý do chọn đề tài & Tầm nhìn chiến lược (GearForge)
- Bối cảnh nhu cầu mua sắm Laptop, PC và Phụ kiện công nghệ của sinh viên tại Khu đô thị ĐHQG TP.HCM (các ngành CNTT, Kinh tế, Thiết kế đồ họa).
- Nỗi đau thực tế: Ngân sách ban đầu hạn hẹp, khó so sánh thông số phần cứng phức tạp, quy trình trả góp truyền thống rườm rà và thiếu minh bạch.
- **Tầm nhìn chiến lược (Vision Statement):** Xây dựng hệ thống TMĐT B2C **GearForge** giải quyết bài toán tài chính cho sinh viên thông qua công cụ so sánh cấu hình trực quan và giải pháp trả góp trực tuyến 3–6–12 tháng nhanh gọn, an toàn pháp lý.

### 1.2. Mục tiêu nghiên cứu
- **Mục tiêu tổng quát:** Nghiên cứu, phân tích, thiết kế và triển khai thử nghiệm hệ thống TMĐT B2C kinh doanh thiết bị máy tính đáp ứng chuẩn nghiệp vụ, bảo mật và trải nghiệm người dùng.
- **Mục tiêu cụ thể (Mức độ Cơ bản & Ứng dụng):**
  - Hoàn thiện bộ mô hình phân tích thiết kế hướng đối tượng (Use Case, Activity/BPMN, Class, Sequence, State Machine, ERD) và Kiến trúc Layered/Microkernel.
  - Triển khai Demo chạy được trên nền tảng **WordPress/WooCommerce** kết hợp **Custom Plugin (`gearforge-core`)** với ≥ 500 sản phẩm, Compare Specs, Trả góp sinh viên duyệt 2 lớp, Sandbox VNPay/MoMo/Fundiin, gắn S/N và Hóa đơn PDF.
- **Định hướng mở rộng (Mức độ Nâng cao):** Đề xuất lộ trình tích hợp eKYC tự động bằng AI, API Hóa đơn điện tử T-VAN thời gian thực và AI tư vấn cấu hình.

### 1.3. Đối tượng khách hàng (Target Persona) & Phạm vi hệ thống
- **Chân dung khách hàng:** Sinh viên 18–24 tuổi, hành vi so sánh kỹ cấu hình/giá/kỳ hạn góp, tiếp cận qua Website Mobile/Desktop và cộng đồng KTX/trường đại học.
- **Phạm vi In-scope (MVP):** Danh mục ≥ 500 SP + Bộ lọc chuyên sâu; Compare Specs 2–3 máy; Module tính & đăng ký trả góp SV (3–6–12 tháng, upload CCCD/Thẻ SV mã hóa, duyệt 2 lớp); Thanh toán Sandbox (3D-Secure); OMS & Serial Number (S/N); Hóa đơn PDF mẫu.
- **Phạm vi Out-of-scope (Giai đoạn sau):** Trade-in định giá bằng AI; Build PC tự kiểm tra tương thích phần cứng; eKYC AI tự động và API T-VAN xuất hóa đơn real-time lên Tổng cục Thuế.

### 1.4. Cấu trúc báo cáo
- Tóm tắt ngắn gọn nội dung từ Chương 1 đến Chương 7.

---

## CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG *(Role 1 chủ trì, Role 2 & 4 hỗ trợ TCO/Pháp lý)*

### 2.1. Mô tả bài toán & Chỉ số đo lường (KPIs)
- Trình bày bài toán vận hành B2C và bộ **KPIs giai đoạn thử nghiệm 3 tháng đầu**:
  - 150 giao dịch thành công (30–40% đơn Laptop/PC trả góp).
  - AOV Laptop/PC ≥ 10.000.000 VNĐ; AOV toàn sàn ~3.500.000 VNĐ.
  - Conversion Rate mục tiêu 1.5% (~10.000 lượt truy cập chất lượng).

### 2.2. Khảo sát nhu cầu thực tế sinh viên ĐHQG TP.HCM *(Role 1)*
- Mô tả đối tượng, cỡ mẫu khảo sát (`N >= ...` sinh viên từ `survey_questionnaire_template.md`).
- Biểu đồ thống kê & Nhận xét rút ra làm căn cứ thiết kế tính năng Compare Specs và Trả góp 3–6–12 tháng.

### 2.3. Yêu cầu Chức năng (Functional Requirements)
- Đưa vào bảng chuẩn `FR-01` đến `FR-10` từ `02_Shared_Specs_and_Standards/shared_domain_glossary.md`.

### 2.4. Yêu cầu Phi chức năng (Non-functional Requirements)
- Đưa vào bảng chuẩn `NFR-01` đến `NFR-06` (Performance < 3s, Security NĐ 13/2023, Anti-Fraud 3DS/Rate Limit/S/N, Responsive, Maintainability, Availability).

### 2.5. Chiến lược Kỹ thuật, Chi phí sở hữu (TCO) & Tuân thủ Pháp lý Việt Nam
- **Quyết định Buy/Customize trên WooCommerce vs Build from Scratch:** Lý giải hiệu quả chi phí và khả năng mở rộng bằng Custom Plugin PHP/MySQL.
- **Bảng tính TCO 3 năm:** Năm 1 (36 triệu VNĐ) → Năm 2 (66 triệu VNĐ) → Năm 3 (100 triệu VNĐ), tách bạch phí MDR 1.5%–2.5%.
- **Pháp lý & Chống gian lận tại VN:** Thông báo BCT, chuẩn dữ liệu VAT 8%–10% sẵn sàng kết nối T-VAN, Consent Banner & mã hóa ảnh CCCD/Thẻ SV theo **Nghị định 13/2023/NĐ-CP**, duyệt 2 lớp, 3D-Secure, Rate Limiting/Blacklist và quản lý S/N.

---

## CHƯƠNG 3: MÔ HÌNH HÓA HỆ THỐNG (SYSTEM MODELING) *(Trọng tâm 25% Rubric)*

### 3.1. Biểu đồ Use Case Tổng thể & Phân rã chức năng *(Role 1 chủ trì)*
- Chèn sơ đồ Use Case tổng thể (`UC-01`..`UC-12`) + Bảng mô tả tổng quan 12 Use Cases.

### 3.2. Biểu đồ Lớp Tổng thể (Class Diagram) *(Role 2 chủ trì)*
- Chèn Class Diagram chuẩn hóa khớp với `shared_domain_glossary.md` + Giải thích các mối quan hệ Aggregation, Composition, Association.

### 3.3. Biểu đồ Trạng thái (State Machine Diagrams) *(Role 2 chủ trì)*
- 3.3.1. Biểu đồ trạng thái Đơn hàng (`OrderStatus`: `CREATED` → `COMPLETED` / `CANCELLED` / `REFUNDED`).
- 3.3.2. Biểu đồ trạng thái Hồ sơ trả góp sinh viên (`InstallmentApplicationStatus`: `DRAFT` → `ACTIVE_INSTALLMENT` → `CLOSED` / `REJECTED` / `BLACKLISTED`).

### 3.4. Phân tích & Mô hình hóa Phân hệ 1: Tìm kiếm, Lọc & So sánh cấu hình *(Role 1 – PO/BA)*
- **Bảng Đặc tả Use Case `UC-02`: So sánh cấu hình 2–3 Laptop/PC** *(Use Case ID, Actors, Pre/Post-conditions, Main Flow, Alternate Flow, Exception Flow)*.
- **Activity Diagram** cho `UC-01` & `UC-02`.
- **Sequence Diagram** cho `UC-02` (`StudentCustomer` ↔ `UI` ↔ `ComparisonService` ↔ `ProductSpecAttribute` ↔ `InstallmentCalculatorService`).

### 3.5. Phân tích & Mô hình hóa Phân hệ 2: Xác thực, RBAC, Bảo mật NĐ 13/2023 & Chống gian lận *(Role 2 – SM)*
- **Bảng Đặc tả Use Case `UC-05`: Phân quyền RBAC, Mã hóa NĐ 13/2023 & Kiểm soát Blacklist/Rate Limit**.
- **Activity Diagram** quy trình kiểm tra Rate Limit, Blacklist và phân quyền truy cập hồ sơ nhạy cảm.
- **Sequence Diagram** cho `UC-05`.

### 3.6. Phân tích & Mô hình hóa Phân hệ 3: Giỏ hàng, Checkout & Theo dõi đơn hàng (OMS) *(Role 3 – Dev 1)*
- **Bảng Đặc tả Use Case `UC-08`: Đặt hàng trực tuyến & Theo dõi trạng thái đơn hàng (OMS)**.
- **Activity Diagram** cho luồng Checkout (nhánh thanh toán thẳng vs nhánh trả góp kèm Consent NĐ 13/2023).
- **Sequence Diagram** cho `UC-08`.

### 3.7. Phân tích & Mô hình hóa Phân hệ 4: Trả góp Sinh viên, Duyệt 2 lớp & Thanh toán Sandbox *(Role 4 – Dev 2)*
- **Bảng Đặc tả Use Case `UC-10`: Tính toán gói trả góp & Nộp hồ sơ trả góp sinh viên** *(và mô tả liên thông `UC-11`, `UC-12`)*.
- **BPMN / Activity Diagram** quy trình liên thông: Sinh viên nộp hồ sơ → Duyệt Lớp 1 (CCCD/Thẻ SV) → Duyệt Lớp 2 (SĐT/Email `.edu.vn`) → Thanh toán trả trước 3D-Secure → Gán S/N xuất kho → Xuất Hóa đơn PDF.
- **Sequence Diagram** cho `UC-10` & `UC-11`.

---

## CHƯƠNG 4: THIẾT KẾ HỆ THỐNG (SYSTEM DESIGN)

### 4.1. Kiến trúc Hệ thống (System Architecture) *(Role 2 – SM chủ trì)*
- Chèn **Sơ đồ Kiến trúc Layered + Microkernel (Plugin-based)** trên nền WordPress/WooCommerce.
- Phân tích chi tiết từng tầng: Presentation, Security Middleware (`FraudGuardMiddleware`, RBAC), WooCommerce Core, Custom Plugin `gearforge-core` (4 modules), Data & External Sandbox/T-VAN.

### 4.2. Thiết kế Cơ sở dữ liệu (Database Design) *(Role 4 – Dev 2 chủ trì)*
- **4.2.1. Mô hình Thực thể Kết hợp (ERD):** Thể hiện bảng lõi WooCommerce (`wp_users`, `wp_posts`, `wp_wc_orders`, `wp_wc_order_items`) liên kết với 4 bảng mở rộng `wp_gf_*`.
- **4.2.2. Chuẩn hóa & Từ điển dữ liệu (Data Dictionary):** Trình bày chi tiết tên trường, kiểu dữ liệu, PK/FK, ràng buộc UNIQUE/NOT NULL của `wp_gf_installment_plans`, `wp_gf_installment_applications`, `wp_gf_order_serials`, `wp_gf_fraud_blacklist`.

### 4.3. Thiết kế Giao diện & Trải nghiệm người dùng (UI/UX Design) *(Role 3 – Dev 1 chủ trì)*
- **4.3.1. Sơ đồ luồng người dùng (User Flow / Sitemap)** trên Desktop & Mobile.
- **4.3.2. Bộ Wireframe & Mockup Figma:** Chèn hình ảnh và chú thích cho các màn hình trọng tâm:
  1. Trang chủ GearForge & Danh mục lọc thông số chuyên sâu (`UC-01`).
  2. Bảng So sánh cấu hình 2–3 Laptop/PC (`UC-02`).
  3. Trang Chi tiết sản phẩm kèm Widget tính trả góp sinh viên (`UC-10`).
  4. Giỏ hàng, Checkout & Hộp thoại **Consent Banner (NĐ 13/2023)** (`UC-07`, `UC-08`).
  5. Trang Theo dõi đơn hàng & Tiến độ hồ sơ OMS (`UC-08`).
  6. Giao diện Quản trị: Duyệt hồ sơ trả góp 2 lớp & Gán Serial Number xuất kho (`UC-11`, `UC-12`).

---

## CHƯƠNG 5: TRIỂN KHAI DEMO & KIỂM THỬ HỆ THỐNG *(Cả 4 Role cùng đóng góp)*

### 5.1. Môi trường Triển khai & Kiến trúc Mã nguồn *(Role 2 & Role 4)*
- Thông số Docker / Hosting (PHP 8.2, MySQL 8.0, WordPress, WooCommerce, SSL).
- Cấu trúc thư mục Custom Plugin `gearforge-core` và vai trò từng file.

### 5.2. Kết quả Demo các Chức năng Trọng tâm *(Ảnh chụp màn hình thực tế)*
- 5.2.1. Danh mục ≥ 500 sản phẩm, Bộ lọc & Bảng Compare Specs *(Role 1 + Role 3)*.
- 5.2.2. Đăng ký, Xác thực `.edu.vn`, Phân quyền RBAC & Chặn Blacklist/Rate Limit *(Role 2)*.
- 5.2.3. Tính toán, Upload CCCD/Thẻ SV (Consent NĐ 13/2023), Duyệt 2 lớp & Sandbox VNPay/MoMo/Fundiin *(Role 3 + Role 4)*.
- 5.2.4. Gán mã Serial Number (S/N) xuất kho & Xuất Hóa đơn PDF mẫu chuẩn T-VAN *(Role 4)*.

### 5.3. Kiểm thử Hệ thống (QA & Testing) *(Role 2 chủ trì)*
- Tổng hợp kết quả chạy Test Cases theo `04_Technical_and_QA_Skeleton/test_plan_skeleton.md` (Tỷ lệ Pass/Fail, kiểm tra tốc độ tải trang < 3s, kiểm tra bảo mật truy cập trực tiếp file CCCD).

---

## CHƯƠNG 6: KẾT LUẬN & HƯỚNG PHÁT TRIỂN *(Role 1 & Role 4 chủ trì)*

### 6.1. Đối sánh mô hình GearForge với các hệ thống TMĐT hiện có
- Bảng so sánh GearForge (WooCommerce + Custom Plugin) với **Shopee / Shopify / Odoo E-commerce / Phong Vũ** trên các tiêu chí: TCO khởi tạo, Tính năng Compare Specs, Hỗ trợ trả góp sinh viên nội bộ 2 lớp, Kiểm soát S/N, Khả năng tùy biến mã nguồn.

### 6.2. Kết quả đạt được & Hạn chế
- Đánh giá mức độ hoàn thành so với Mục tiêu Chương 1 và KPIs.

### 6.3. Hướng phát triển tương lai (Out-of-scope Roadmap)
- Thu cũ đổi mới (Trade-in) định giá bằng AI; Công cụ Build PC kiểm tra tương thích phần cứng; Tích hợp eKYC AI tự động và kết nối API Hóa đơn điện tử T-VAN thời gian thực với Tổng cục Thuế.

---

## CHƯƠNG 7: TÀI LIỆU THAM KHẢO

- `[1]` Kenneth C. Laudon, Carol Guercio Traver (2024), *E-Commerce: Business, Technology, Society*, Pearson.
- `[2]` Chính phủ nước CHXHCN Việt Nam (2023), *Nghị định số 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân*.
- `[3]` Chính phủ nước CHXHCN Việt Nam (2013 & sửa đổi), *Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP về Thương mại điện tử*.
- `[4]` WooCommerce Developer Documentation – *High-Performance Order Storage (HPOS) & Custom Payment Gateways*.
- `[5]` Tài liệu kỹ thuật VNPay / MoMo / Fundiin Sandbox API.

---

## PHỤ LỤC (APPENDIX)

- **Phụ lục A:** Tập tin mã nguồn sơ đồ UML/PlantUML/Mermaid & SQL Schema.
- **Phụ lục B:** Nhật ký làm việc nhóm theo Scrum & Bảng đóng góp công việc (`scrum_log_template.md`).
- **Phụ lục C:** Đường dẫn liên kết (GitHub Repository, Figma Prototype, Video Demo, Link Website thử nghiệm).
