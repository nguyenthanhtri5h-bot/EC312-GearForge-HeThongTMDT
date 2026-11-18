# BỘ SƯỜN DỰ ÁN ĐỒ ÁN EC312 – GEARFORGE

> **Môn học:** Thiết kế Hệ thống Thương mại điện tử (**EC312**) – Khoa HTTT, UIT – ĐHQG TP.HCM  
> **Đề tài:** Xây dựng Hệ thống Thương mại điện tử kinh doanh Laptop, PC và Phụ kiện (**GearForge**)  
> **Giảng viên hướng dẫn:** ThS. Trình Trọng Tín  
> **Nhóm thực hiện:** **Nhóm 7** – 4 thành viên (vận hành theo mô hình **Scrum Team liên chức năng**, tách 4 nhánh Git độc lập)  
> **Thư mục Google Drive nhóm (bản Word gọn sạch):** [MONCUATHAYTIN (Google Drive)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)  
> **Kho lưu trữ GitHub:** [nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT)

---

## 1. CẤU TRÚC THƯ MỤC CHUẨN (`D:\DANMH\TKeHT`)

```text
D:\DANMH\TKeHT\
├── 0. Bắt đầu tại đây - Hướng dẫn nhóm.docx         (+ bản .md)
├── Bản mô tả dự án GearForge.docx                   (+ bản .md)
├── README.md                                        # Bản đồ điều hướng toàn dự án (trang chủ GitHub)
│
├── 0. Tài liệu tham khảo\                           # Tài liệu gốc, Rubric & Nguồn tham chiếu WordPress
│   ├── Mẫu đồ án EC312 HK1 2025.docx                # Mẫu báo cáo chuẩn của Khoa/GVHD
│   ├── Danh mục nguồn tham chiếu và Plugin WordPress.docx (+ bản .md) # Đã kiểm định VN (Xgear, MemoryZone), Mỹ, TQ
│   └── Tài liệu gốc GitHub Thầy Tín\                # Đề mục, Rubric, Fit-Gap, Requirements, API Labs, Bài tập UML & script build_docx.py
│
├── 1. Quản lý nhóm và Phân vai\                     # Bộ sườn Quản trị nhóm Scrum (4 Sprints)
│   ├── Hướng dẫn chọn vai trò GearForge.docx        (+ bản .md)
│   ├── Kế hoạch 4 Sprints và Chia việc.docx         (+ bản .md)
│   ├── Product Backlog 16 User Stories.docx         (+ bản .md)
│   └── Mẫu nhật ký làm việc nhóm Scrum.docx         (+ bản .md)
│
├── 2. Quy ước và Sơ đồ UML\                         # Chuẩn dùng chung (Single Source of Truth)
│   ├── Từ điển thuật ngữ và Ma trận Fit-Gap.docx    (+ bản .md) # Khóa cứng Actor, BR->FR->UC, Fit-Gap, Trạng thái, Bảng DB
│   └── Khung kiến trúc và Sơ đồ UML Mermaid.docx    (+ bản .md) # Khung Mermaid: Kiến trúc, UC, Class, State, ERD, Sequence
│
├── 3. Khung báo cáo đồ án EC312\                    # Khung Báo cáo tổng & Khảo sát thực tế
│   ├── Khung báo cáo đồ án EC312 GearForge.docx     (+ bản .md) # Sườn Chương 1..7 & Phụ lục có gắn nhãn [Role X viết]
│   └── Mẫu bảng hỏi khảo sát sinh viên ĐHQG.docx    (+ bản .md) # Mẫu 12 câu hỏi Google Forms
│
└── 4. Kỹ thuật và Kiểm thử\                         # Khung Kỹ thuật Demo WooCommerce & Kiểm thử QA
    ├── docker-compose.skeleton.yml                  # Môi trường Docker (WordPress + MySQL 8.0 + phpMyAdmin + Vault)
    ├── Đặc tả kỹ thuật Plugin và Database MySQL.docx (+ bản .md) # Kiến trúc Plugin gearforge-core & SQL DDL 4 bảng wp_gf_*
    └── Kế hoạch kiểm thử 16 Test Cases.docx         (+ bản .md) # 16 kịch bản Test chức năng, bảo mật NĐ 13/2023 & hiệu năng
```

---

## 2. PHÂN NHÁNH GIT & CHỐNG ĐÈ VIỆC CHO 4 THÀNH VIÊN

Kho GitHub đã tạo sẵn **4 nhánh độc quyền** tương ứng 4 Issues (`#1`..`#4`). Mỗi nhánh `role*` được giữ gọn **chỉ chứa đúng file Hướng dẫn của Role đó** (toàn bộ tài liệu dùng chung nằm trên `main` để tra cứu); khi nộp phần việc, mở **Pull Request** vào `main`:

| Role | Thành viên (Nhóm 7) | MSSV | Issue | Nhánh Git độc quyền | Lãnh thổ file sở hữu chính |
| :--- | :--- | :--- | :-: | :--- | :--- |
| **Role 1 (PO / BA)** | **Trịnh Duy Long** | `24521021` | `#1` | `role1-data-catalog` | Khảo sát, Chương 1–2, UC tổng thể, `UC-01..03`, CSV ≥ 500 SP, `class-gf-compare-specs.php`, Pháp lý BCT |
| **Role 2 (SM / QA)** | **Ngô Trọng Đạt** | `24520275` | `#2` | `role2-security-qa` | Kiến trúc (4.1), Class & State Machine, `UC-04..06`, `docker-compose`, `class-gf-rbac.php`, `class-gf-fraud-guard.php`, Test Report & Nhật ký nhóm |
| **Role 3 (Dev 1 - UI)** | **Nguyễn Thanh Trí** | `24521838` | `#3` | `role3-ui-frontend` | Figma (4.3), `UC-07..09`, Child Theme, `templates/` (`compare-table`, `installment-widget`, `oms-tracking`) & `assets/` (`css/`, `js/`) |
| **Role 4 (Dev 2 - BE)** | **Lê Lưu Luân** | `24521027` | `#4` | `role4-backend-payment` | ERD & Từ điển DB (4.2), `UC-10..12`, các class Backend trong `includes/` (`activator`, `installment-calc`, `vault-crypto`, `review`, `payment-sandbox`, `serial-manager`, `invoice-pdf`) & `admin/` |

---

## 3. LỘ TRÌNH 5 BƯỚC BẮT ĐẦU CHO NHÓM 4 NGƯỜI

### Bước 1: Đọc Cẩm nang 10 phút & Chốt 4 vai trò (`Role 1..4`)
- Mở [0. Bắt đầu tại đây - Hướng dẫn nhóm.md](<0. Bắt đầu tại đây - Hướng dẫn nhóm.md>) và [Hướng dẫn chọn vai trò GearForge.md](<1. Quản lý nhóm và Phân vai/Hướng dẫn chọn vai trò GearForge.md>) để nhận đúng Role và đúng nhánh Git.
- Điền Họ tên & MSSV vào bảng đăng ký và cập nhật sang [Bản mô tả dự án GearForge.md](<Bản mô tả dự án GearForge.md>) (và bản `.docx`).

### Bước 2: Phát hành Khảo sát sinh viên ĐHQG TP.HCM
- **Role 1** copy nội dung từ [Mẫu bảng hỏi khảo sát sinh viên ĐHQG.md](<3. Khung báo cáo đồ án EC312/Mẫu bảng hỏi khảo sát sinh viên ĐHQG.md>) lên Google Forms và thu thập tối thiểu 60–100 mẫu cho Chương 2.

### Bước 3: Khóa chuẩn dùng chung trước khi vẽ UML / Thiết kế DB / Figma
- Toàn bộ nhóm **bắt buộc** bám sát tên Actor, mã `UC-01..UC-12`, tên Class, `OrderStatus`, `InstallmentApplicationStatus` và 4 bảng `wp_gf_*` trong [Từ điển thuật ngữ và Ma trận Fit-Gap.md](<2. Quy ước và Sơ đồ UML/Từ điển thuật ngữ và Ma trận Fit-Gap.md>).
- Mở [Khung kiến trúc và Sơ đồ UML Mermaid.md](<2. Quy ước và Sơ đồ UML/Khung kiến trúc và Sơ đồ UML Mermaid.md>) để kế thừa các sơ đồ khung và xuất ảnh PNG bằng Mermaid Live.

### Bước 4: Dựng môi trường Demo & Code song song trên 4 nhánh
- **Role 2** dựng môi trường chung từ [docker-compose.skeleton.yml](<4. Kỹ thuật và Kiểm thử/docker-compose.skeleton.yml>).
- **Role 3 & Role 4** đối chiếu [Product Backlog 16 User Stories.md](<1. Quản lý nhóm và Phân vai/Product Backlog 16 User Stories.md>) và [Đặc tả kỹ thuật Plugin và Database MySQL.md](<4. Kỹ thuật và Kiểm thử/Đặc tả kỹ thuật Plugin và Database MySQL.md>) để code đúng vùng file của mình trên nhánh `role3-ui-frontend` và `role4-backend-payment`.
- **Role 2** ghi chép tiến độ vào [Kế hoạch 4 Sprints và Chia việc.md](<1. Quản lý nhóm và Phân vai/Kế hoạch 4 Sprints và Chia việc.md>) và [Mẫu nhật ký làm việc nhóm Scrum.md](<1. Quản lý nhóm và Phân vai/Mẫu nhật ký làm việc nhóm Scrum.md>).

### Bước 5: Kiểm thử & Ghép bài hoàn chỉnh vào Master Report
- Chạy đủ 16 Test Cases trong [Kế hoạch kiểm thử 16 Test Cases.md](<4. Kỹ thuật và Kiểm thử/Kế hoạch kiểm thử 16 Test Cases.md>).
- Mỗi Role viết phần bài gắn thẻ `[Role X viết]` ra file nháp riêng trên Drive (`Nháp Role X - Họ Tên.docx`), sau đó Role 1 & Role 2 ghép sạch vào [Khung báo cáo đồ án EC312 GearForge.md](<3. Khung báo cáo đồ án EC312/Khung báo cáo đồ án EC312 GearForge.md>) và bản `.docx`.
