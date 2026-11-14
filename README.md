# BỘ SƯỜN DỰ ÁN ĐỒ ÁN EC312 – GEARFORGE

> **Môn học:** Thiết kế Hệ thống Thương mại điện tử (**EC312**) – Khoa HTTT, UIT – ĐHQG TP.HCM  
> **Đề tài:** Xây dựng Hệ thống Thương mại điện tử kinh doanh Laptop, PC và Phụ kiện (**GearForge**)  
> **Giảng viên hướng dẫn:** ThS. Trình Trọng Tín  
> **Quy mô nhóm:** 4 thành viên (vận hành theo mô hình **Scrum Team liên chức năng**)  
> **Thư mục Google Drive nhóm:** [MONCUATHAYTIN (Google Drive)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)  
> **Kho lưu trữ GitHub:** [nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT)

---

## 1. CẤU TRÚC THƯ MỤC CHUẨN (`D:\DANMH\TKeHT`)

```text
D:\DANMH\TKeHT\
├── README.md                                       # Bản đồ điều hướng toàn dự án (file này)
├── Ban_Mo_Ta_Du_An_GearForge.md                    # Bản mô tả dự án (Markdown)
├── Ban_Mo_Ta_Du_An_GearForge.docx                  # Bản mô tả dự án chuẩn UIT (Word A4)
│
├── 00_References\                                  # Tài liệu gốc & Rubric chấm điểm môn EC312
│   ├── EC312_Mau_do_an_HK1_2025.docx               # Mẫu báo cáo chuẩn của Khoa/GVHD
│   ├── project-template.md                         # Khung nội dung từng chương mục
│   ├── project-rubric.md                           # Tiêu chí chấm điểm (100 điểm)
│   └── build_docx.py                               # Script tự động xuất bản file Word (.docx)
│
├── 01_Project_Management\                          # Bộ sườn Quản trị nhóm Scrum (4 Sprints)
│   ├── role_selection_guide.md                     # Hướng dẫn chọn 4 vai trò (khi nhóm chưa chia việc)
│   ├── task_plan.md                                # Kế hoạch chi tiết 4 Sprints & Definition of Done
│   ├── product_backlog.md                          # 4 Epics & 16 User Stories chuẩn INVEST + AC
│   └── scrum_log_template.md                       # Mẫu Nhật ký làm việc nhóm nộp Phụ lục EC312
│
├── 02_Shared_Specs_and_Standards\                  # Chuẩn dùng chung (Single Source of Truth)
│   ├── shared_domain_glossary.md                   # Khóa cứng Actor, FR/NFR, UC-01..UC-12, Trạng thái, Bảng DB
│   └── architecture_and_uml_skeleton.md            # Khung sơ đồ Mermaid: Kiến trúc, UC, Class, State, ERD, Sequence
│
├── 03_Report_Skeleton\                             # Khung Báo cáo tổng & Khảo sát thực tế
│   ├── EC312_Bao_Cao_Master_Skeleton.md            # Khung sườn toàn bộ Chương 1..7 & Phụ lục (giao rõ cho từng Role)
│   └── survey_questionnaire_template.md            # Mẫu 12 câu hỏi khảo sát sinh viên ĐHQG TP.HCM (Google Forms)
│
└── 04_Technical_and_QA_Skeleton\                   # Khung Kỹ thuật Demo WooCommerce & Kiểm thử QA
    ├── docker-compose.skeleton.yml                 # Cấu hình Docker (WordPress + MySQL 8.0 + phpMyAdmin + Vault)
    ├── plugin_skeleton_spec.md                     # Kiến trúc Custom Plugin gearforge-core & SQL DDL 4 bảng wp_gf_*
    └── test_plan_skeleton.md                       # 16 kịch bản kiểm thử trọng tâm (Chức năng, Bảo mật NĐ 13/2023, QA)
```

---

## 2. LỘ TRÌNH 5 BƯỚC BẮT ĐẦU CHO NHÓM 4 NGƯỜI

### Bước 1: Họp nhóm & Chốt vai trò (`Role 1..4`)
- Cả 4 thành viên cùng đọc [role_selection_guide.md](01_Project_Management/role_selection_guide.md) để chọn gói công việc hợp thế mạnh nhất:
  - **Role 1 (PO / BA):** Khảo sát, Chương 1–2, Use Case tổng thể, `UC-02` (Compare Specs), Dữ liệu ≥ 500 sản phẩm, Chính sách pháp lý.
  - **Role 2 (SM / Architect / QA):** Kiến trúc, Class, State Machine, `UC-05` (RBAC, Bảo mật NĐ 13/2023, Blacklist), Docker/Hosting, QA & Biên tập báo cáo.
  - **Role 3 (Dev 1 – UI/UX & Frontend):** Mockup Figma, Storefront UI, Bộ lọc & Bảng Compare, Consent Banner NĐ 13/2023, `UC-08` (Checkout & OMS).
  - **Role 4 (Dev 2 – Backend, DB & Payment):** ERD & SQL Schema, Custom Plugin `gearforge-core`, `UC-10/UC-11` (Trả góp SV & Duyệt 2 lớp), Sandbox Payment, S/N & Hóa đơn PDF.
- Điền Họ tên & MSSV vào bảng đăng ký và cập nhật sang `Ban_Mo_Ta_Du_An_GearForge.md` / `.docx`.

### Bước 2: Phát hành Khảo sát sinh viên ĐHQG TP.HCM
- **Role 1** copy nội dung từ [survey_questionnaire_template.md](03_Report_Skeleton/survey_questionnaire_template.md) lên Google Forms và thu thập tối thiểu 60–100 mẫu để lấy số liệu thực tế cho Chương 2.

### Bước 3: Khóa chuẩn dùng chung trước khi vẽ UML / Thiết kế DB / Figma
- Toàn bộ nhóm **bắt buộc** bám sát tên Actor, mã `UC-01..UC-12`, tên Class, `OrderStatus`, `InstallmentApplicationStatus` và 4 bảng `wp_gf_*` trong [shared_domain_glossary.md](02_Shared_Specs_and_Standards/shared_domain_glossary.md).
- Mở [architecture_and_uml_skeleton.md](02_Shared_Specs_and_Standards/architecture_and_uml_skeleton.md) để kế thừa ngay các sơ đồ khung và phát triển tiếp phần riêng của từng Role.

### Bước 4: Dựng môi trường Demo & Chia việc theo Backlog
- **Role 2** dựng môi trường chạy chung từ [docker-compose.skeleton.yml](04_Technical_and_QA_Skeleton/docker-compose.skeleton.yml).
- **Role 3 & Role 4** đối chiếu danh sách 16 User Stories trong [product_backlog.md](01_Project_Management/product_backlog.md) và đặc tả Plugin trong [plugin_skeleton_spec.md](04_Technical_and_QA_Skeleton/plugin_skeleton_spec.md) để code song song.
- **Role 2** ghi chép đều đặn tiến độ vào [task_plan.md](01_Project_Management/task_plan.md) và [scrum_log_template.md](01_Project_Management/scrum_log_template.md).

### Bước 5: Kiểm thử & Ghép bài hoàn chỉnh vào Master Report
- Chạy hết 16 Test Cases trong [test_plan_skeleton.md](04_Technical_and_QA_Skeleton/test_plan_skeleton.md).
- Từng Role điền phần bài của mình vào đúng vị trí đã đánh dấu sẵn trong [EC312_Bao_Cao_Master_Skeleton.md](03_Report_Skeleton/EC312_Bao_Cao_Master_Skeleton.md) để xuất bản file `.docx` và `.pdf` đồng nhất.
