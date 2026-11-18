# PROJECT MEMORY & WORKSPACE RULES: GEARFORGE (UIT – EC312)

> File này lưu ngữ cảnh cốt lõi của đồ án **EC312 – Hệ thống TMĐT GearForge** để mọi phiên làm việc Antigravity sau khi mở thư mục `D:\DANMH\TKeHT` đều tự động nắm bắt đầy đủ, không bị quên lịch sử thiết kế và quy ước nhóm.

---

## 1. THÔNG TIN DỰ ÁN & ĐỊA CHỈ ĐỒNG BỘ CHÍNH THỨC

- **Môn học:** Thiết kế Hệ thống Thương mại điện tử (**EC312**) – ĐH CNTT (UIT), ĐHQG TP.HCM
- **Giảng viên hướng dẫn:** ThS. Trình Trọng Tín (Chuẩn đối chiếu: `github.com/trinhtin/ec312`)
- **Nhóm thực hiện:** **Nhóm 7** (Trịnh Duy Long – `24521021`, Ngô Trọng Đạt – `24520275`, Nguyễn Thanh Trí – `24521838`, Lê Lưu Luân – `24521027`)
- **Đề tài:** Xây dựng Hệ thống TMĐT B2C kinh doanh **Laptop, PC và Phụ kiện** cho sinh viên – Thương hiệu **GearForge** (tối thiểu **500 sản phẩm**).
- **Thư mục máy (Workspace chính):** `D:\DANMH\TKeHT` *(Tuyệt đối không lưu file dự án sang workspace khác)*.
- **Kho lưu trữ GitHub:** `https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT`
  - **5 nhánh hiện hành:** `main`, `role1-data-catalog`, `role2-security-qa`, `role3-ui-frontend`, `role4-backend-payment`.
- **Google Drive nhóm (`MONCUATHAYTIN`):** `https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm` (ID: `17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm`)
  - `0. Tài liệu tham khảo` (`1yExAJzotV0CSPhujo1KE82nyIYQqgQJG`) → Thư mục con `Tài liệu gốc GitHub Thầy Tín` (`1pvRe5pWpyhxSrNWYXnTMufC-seVePDjJ`)
  - `1. Quản lý nhóm và Phân vai` (`1BYbyxHnItGUjtC8QIA4zKV2ABTahn9Xm`)
  - `2. Quy ước và Sơ đồ UML` (`1Ur9fbW-nH1BW98VUQgJKYIff90BHXvVv`)
  - `3. Khung báo cáo đồ án EC312` (`18aJogAAui8FkTZ9YLm6-2n5qsKMkJqIp`)
  - `4. Kỹ thuật và Kiểm thử` (`1bDAexbjmCk4k8dIXLIhi3Sjh0UBkYjEp`)
  - `Bản mô tả dự án GearForge.docx` (`1PTLxa_b4_h32IRMd4r-4rIQp2HEEX48r`)
  - `0. Bắt đầu tại đây - Hướng dẫn nhóm.docx` (`1hRsGgzoKV5oHSr5VgSKaCa8YZuR6919j`)
  - 4 file hướng dẫn Role `.docx`: Role 1 (`1eKpPx7G54cJ9dY8wbRPdT5ZNsqUFhbPp`), Role 2 (`16zvE7dap7Z2JdYIcFh42ReJhjgw_7vLb`), Role 3 (`1B6aHeZqX73uRKe0s17IY3NKb6d36Oq7i`), Role 4 (`1rWptLLu_QKZPTydua8jIjz92RMUECXK1`).

---

## 2. QUY ƯỚC ĐẶT TÊN & ĐỒNG BỘ FILE

1. **Quy tắc đặt tên thư mục/file:** Dùng tiếng Việt có dấu rõ ràng, đánh số dạng `0.`, `1.`, `2.`, `3.`, `4.` (không dùng `00.`, `01.`, hạn chế tối đa ký tự `_`).
2. **Phân tách Drive vs GitHub:**
   - **Google Drive (`MONCUATHAYTIN`)** chỉ lưu file Word **`.docx`** (cùng `docker-compose.skeleton.yml` và thư mục `Tài liệu gốc GitHub Thầy Tín/`) để thành viên dễ đọc, không upload trùng các bản `.md`.
   - **GitHub** lưu cả `.md`, `.docx`, script (`build_docx.py`), SQL, code plugin và sơ đồ UML.
   - Khi cập nhật tài liệu Word trên Drive, ưu tiên dùng `gdrive mutate update <FILE_ID> ...` để giữ nguyên link chia sẻ.

---

## 3. KIẾN TRÚC KỸ THUẬT & THUẬT NGỮ ĐÃ KHÓA (SINGLE SOURCE OF TRUTH)

- **Nền tảng & Chiến lược:** **WordPress + WooCommerce (PHP 8.2 / MySQL 8.0)** theo chuẩn **Buy/Customize** (`trinhtin/ec312`):
  - **70%–80% Out-of-the-box & Plugin miễn phí WP.org:** Catalog ≥ 500 SP, Cart, Coupon, `HUSKY (WOOF) Products Filter`, `Products Compare for WooCommerce (BeRocket)`, `PDF Invoices & Packing Slips (WP Overnight)`.
  - **20%–30% Custom Plugin (`gearforge-core`):** Calculator Trả góp SV (3–6–12 tháng), Consent Banner NĐ 13/2023, Upload CCCD/Thẻ SV mã hóa **AES-256-CBC** (`/var/www/gf-vault/`), Duyệt 2 lớp (`L1 Docs` → `L2 .edu.vn`), **Sandbox VNPay / MoMo / Fundiin (3D-Secure)** *(không dùng Kredivo vì web sập)*, Ràng buộc **Serial Number (`S/N`)** trước khi `SHIPPING`, Hóa đơn PDF chuẩn **T-VAN (VAT 8%–10%)**.
- **4 Bảng MySQL mở rộng bắt buộc (khớp 100% ERD & Plugin):**
  - `wp_gf_installment_plans`
  - `wp_gf_installment_applications`
  - `wp_gf_order_serials`
  - `wp_gf_fraud_blacklist`
- **Nguồn tham chiếu chính đã kiểm định:** Xgear (`xgear.net`), MemoryZone (`memoryzone.com.vn`), GearVN, Phong Vũ, CellphoneS, TGDĐ, ThinkPro, GSMArena, Apple, Newegg, Best Buy, JD/ZOL, Fundiin, VNPay/MoMo Sandbox, MISA meInvoice/VNPT (Google Doc tham khảo gốc của user ID: `1N5phOZ1J_-odt2d6jFG5ilhG5Vscvr8KqHLFtk7pEQA`).

---

## 4. PHÂN CÔNG 4 VAI TRÒ SCRUM & CHỐNG ĐÈ NHÁNH

| Role | Thành viên & MSSV | Chức danh | Mức Code | Nhánh GitHub | Cụm Use Case & Tài liệu chính |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Role 1** | **Trịnh Duy Long** (`24521021`) | PO / Nhóm trưởng / BA | **0% Code** | `role1-data-catalog` | `UC-01`, **`UC-02 ★`** (Compare Specs), `UC-03`; CSV ≥ 500 SP; Chương 1–2, 3.1, 3.4, 6.1–6.2 |
| **Role 2** | **Ngô Trọng Đạt** (`24520275`) | SM / Architect / QA | **0–5% Code** | `role2-security-qa` | `UC-04`, **`UC-05 ★`** (RBAC/NĐ 13/Fraud), `UC-06`; Kiến trúc, Class, State, 16 Test Cases, Nhật ký Scrum; **Giữ quyền merge vào `main`** |
| **Role 3** | **Nguyễn Thanh Trí** (`24521838`) | Dev 1 (UI/UX & FE) | **Ít Code** (Figma/CSS) | `role3-ui-frontend` | `UC-07`, **`UC-08 ★`** (Checkout & OMS), `UC-09`; 6 màn Figma, Theme & `templates/`, `assets/` |
| **Role 4** | **Lê Lưu Luân** (`24521027`) | Dev 2 (Backend & DB) | **Code PHP/MySQL** | `role4-backend-payment` | **`UC-10 ★`** (Trả góp SV), `UC-11`, `UC-12`; ERD, 4 bảng `wp_gf_*`, `includes/`, Sandbox, S/N, PDF |

> **Quy tắc nhánh (2026-11-18):** Nhánh `main` lưu đầy đủ toàn bộ khung tài liệu dùng chung; mỗi nhánh `role1..role4` chỉ giữ đúng file **Hướng dẫn Role X** (`.md` & `.docx`), `README.md` riêng của thành viên đó và `.gitignore` để thành viên tập trung đúng phần việc của mình.
