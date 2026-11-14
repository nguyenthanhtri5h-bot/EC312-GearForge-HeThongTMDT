# KẾ HOẠCH TRIỂN KHAI DỰ ÁN GEARFORGE (TASK PLAN - 4 SPRINTS)

> Quản lý theo phương pháp **Planning with Files** kết hợp **Scrum Framework**.
> - **Mục tiêu tối thượng:** Hoàn thành trọn vẹn Báo cáo Đồ án EC312 (`.docx` + `.pdf` + file nguồn sơ đồ UML/Figma) và Demo Website **GearForge** chạy được thực tế các luồng lõi để đạt tối đa **100/100 điểm Rubric**.
> - **Quy ước trạng thái:** `[ ]` Chưa làm | `[/]` Đang làm | `[x]` Hoàn thành | `[!]` Đang vướng mắc

---

## 1. TRẠNG THÁI TỔNG QUAN CÁC GIAI ĐOẠN

| Sprint | Tên giai đoạn | Thời gian dự kiến | Mục tiêu cốt lõi (Sprint Goal) | Trạng thái |
| :--- | :--- | :---: | :--- | :---: |
| **Sprint 0** | Chuẩn bị & Chốt vai | Tuần 1 | Chốt 4 vai trò, ký quy ước dùng chung, chạy môi trường Docker/WP cơ bản | `[/]` |
| **Sprint 1** | Phân tích Yêu cầu & Khảo sát | Tuần 2–3 | Hoàn thiện Khảo sát sinh viên ĐHQG, FR/NFR, Use Case tổng thể & 4 đặc tả UC | `[ ]` |
| **Sprint 2** | Thiết kế Hệ thống, CSDL & UI/UX | Tuần 4–6 | Chốt Architecture, ERD, Class, State Machine, Activity/Sequence & Mockup Figma | `[ ]` |
| **Sprint 3** | Phát triển MVP Core (Storefront & Plugin) | Tuần 7–9 | Import ≥ 500 SP, hoàn thiện Lọc/Compare Specs, UI Storefront & Plugin Trả góp SV | `[ ]` |
| **Sprint 4** | Tích hợp Sandbox, QA & Báo cáo | Tuần 10–12 | Sandbox VNPay/MoMo/Fundiin, Duyệt 2 lớp, S/N, PDF, Test Report & Xuất bản Báo cáo | `[ ]` |

---

## 2. CHECKLIST CHI TIẾT THEO SPRINT & VAI TRÒ

### Sprint 0: Khởi tạo Bộ sườn & Chốt vai trò
- [x] Khởi tạo cấu trúc thư mục và bộ tài liệu chuẩn hóa tại `D:\DANMH\TKeHT`.
- [ ] **[Cả nhóm]** Họp phân vai theo `role_selection_guide.md`, điền Họ tên & MSSV vào `Ban_Mo_Ta_Du_An_GearForge.docx`.
- [ ] **[Role 2 - SM]** Tạo repo Git (GitHub/GitLab), bảng Trello/GitHub Projects và test chạy thử `docker-compose.skeleton.yml`.
- [ ] **[Role 1 - PO]** Duyệt lại `product_backlog.md` và gửi link Google Forms khảo sát từ `survey_questionnaire_template.md`.

### Sprint 1: Phân tích Yêu cầu & Mô hình hóa Sơ bộ
- [ ] **[Role 1 - PO]** Thu thập ≥ 50–100 phản hồi khảo sát sinh viên ĐHQG TP.HCM; viết Chương 1 & Chương 2 (Bài toán, KPIs, TCO, FR-01..FR-10, NFR-01..NFR-06).
- [ ] **[Role 1 - PO]** Hoàn thiện **Biểu đồ Use Case tổng thể** (`UC-01`..`UC-12`) + Đặc tả chi tiết `UC-02` (Compare Specs).
- [ ] **[Role 2 - SM]** Đặc tả chi tiết `UC-05` (RBAC, Bảo mật NĐ 13/2023 & Chống gian lận) + ghi Nhật ký Sprint 1.
- [ ] **[Role 3 - Dev 1]** Đặc tả chi tiết `UC-08` (Đặt hàng Checkout & OMS Tracking) + phác thảo Wireframe các màn hình chính.
- [ ] **[Role 4 - Dev 2]** Đặc tả chi tiết `UC-10` (Tính toán & Nộp hồ sơ trả góp sinh viên) + rà soát quy trình nghiệp vụ 2 lớp.

### Sprint 2: Thiết kế Kiến trúc, UML, CSDL & Figma
- [ ] **[Role 2 - SM]** Chốt **System Architecture Diagram**, **Class Diagram tổng thể**, **State Machine Diagram** (`Order` & `InstallmentApplication`).
- [ ] **[Role 4 - Dev 2]** Thiết kế **ERD** & SQL Schema mở rộng (`wp_gf_installment_plans`, `wp_gf_installment_applications`, `wp_gf_order_serials`, `wp_gf_fraud_blacklist`).
- [ ] **[Role 3 - Dev 1]** Hoàn thiện bộ **Mockup Figma** đầy đủ (Desktop + Mobile) cho Storefront, Compare Specs, Form Trả góp, Checkout, OMS, Admin Dashboard.
- [ ] **[Cả 4 Role]** Vẽ xong **Activity Diagram / BPMN** và **Sequence Diagram** cho cụm Use Case mình phụ trách (tuân thủ 100% tên Class & Bảng trong `shared_domain_glossary.md`).
- [ ] **[Role 1 - PO]** Chuẩn bị file CSV/Excel chuẩn hóa **≥ 500 sản phẩm** (Laptop, PC, Phụ kiện) từ dữ liệu tham khảo GearVN/Phong Vũ.

### Sprint 3: Triển khai MVP Core trên WooCommerce
- [ ] **[Role 1 - PO]** Import ≥ 500 sản phẩm lên WooCommerce; cấu hình đầy đủ bộ lọc (CPU, RAM, GPU, Nhu cầu, Khoảng giá); tạo các trang Chính sách (Bảo hành, Đổi trả, Bảo mật NĐ 13/2023).
- [ ] **[Role 3 - Dev 1]** Cài đặt Theme/Child Theme GearForge; code/cấu hình giao diện Bộ lọc chuyên sâu, Bảng **Compare Specs 2–3 máy**, trang OMS Tracking & **Consent Banner (NĐ 13/2023)**.
- [ ] **[Role 4 - Dev 2]** Lập trình khung Custom Plugin `gearforge-core`:
  - Module tính toán gói trả góp (3–6–12 tháng).
  - Module nộp hồ sơ trả góp (Upload CCCD + Thẻ SV, mã hóa AES-256 khi lưu).
  - Giao diện Admin duyệt hồ sơ 2 lớp (Lớp 1: Kiểm tra giấy tờ; Lớp 2: Xác nhận SĐT/Email `.edu.vn`).
- [ ] **[Role 2 - SM]** Triển khai phân quyền RBAC (`StoreAdmin`, `InstallmentReviewer`), cấu hình Rate Limiting & Blacklist cơ bản.

### Sprint 4: Tích hợp Thanh toán Sandbox, S/N, QA & Hoàn thiện Báo cáo
- [ ] **[Role 4 - Dev 2]** Tích hợp cổng thanh toán **Sandbox VNPay / MoMo / Fundiin** (hỗ trợ 3D-Secure); làm tính năng gắn **Serial Number (S/N)** khi xuất kho & xuất **Hóa đơn PDF mẫu** chuẩn T-VAN.
- [ ] **[Role 2 - SM]** Chạy toàn bộ bộ Test Cases trong `test_plan_skeleton.md` (chức năng, bảo mật upload/blacklist, hiệu năng < 3s); tổng hợp Test Report.
- [ ] **[Role 3 - Dev 1]** Chụp ảnh màn hình Demo chất lượng cao & hỗ trợ quay video luồng Demo end-to-end.
- [ ] **[Role 1 & Role 2]** Ghép toàn bộ nội dung của 4 người vào `EC312_Bao_Cao_Master_Skeleton.md`, rà soát lỗi chính tả/đồng nhất thuật ngữ, xuất bản file `.docx` & `.pdf`, đính kèm file nguồn sơ đồ & Nhật ký nhóm.

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)

Một hạng mục chỉ được đánh dấu `[x]` khi đạt đủ 3 điều kiện:
1. **Đúng chuẩn dùng chung:** Tên Actor, Use Case ID, trạng thái và bảng DB khớp 100% với `02_Shared_Specs_and_Standards/shared_domain_glossary.md`.
2. **Có minh chứng kiểm chứng:** Tài liệu có file `.md`/`.docx` + hình sơ đồ rõ nét (`.png`/`.svg`/`.puml`); tính năng Demo có log chạy thực tế hoặc test pass không lỗi console/PHP fatal error.
3. **Được review chéo:** Có ít nhất 1 thành viên khác (PO kiểm tra nghiệp vụ hoặc SM kiểm tra kỹ thuật) xác nhận.

---

## 4. NHẬT KÝ QUYẾT ĐỊNH KỸ THUẬT & RỦI RO (DECISION & BLOCKER LOG)

| Ngày | Quyết định / Vấn đề phát sinh | Phương án xử lý | Người phụ trách |
| :--- | :--- | :--- | :--- |
| *Ngày 1* | Chọn nền tảng **Buy/Customize WooCommerce** thay vì Build from Scratch | Tối ưu TCO (36tr năm 1), tập trung thời gian code Custom Plugin Trả góp SV & Compare Specs | Cả nhóm |
| *Ngày 1* | Nhóm 4 người nhưng Scrum có PO & SM | PO & SM kiêm nhiệm BA/Architect/QA và giữ cụm UC riêng để chia đều 25% khối lượng | Cả nhóm |
| *[Điền thêm]* | | | |
