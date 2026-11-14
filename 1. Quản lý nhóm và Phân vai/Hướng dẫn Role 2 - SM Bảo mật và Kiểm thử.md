# HƯỚNG DẪN CẦM TAY CHỈ VIỆC: ROLE 2 – SCRUM MASTER (SM) / KIẾN TRÚC, BẢO MẬT & KIỂM THỬ QA

> **Mức độ kỹ thuật:** Bạn là **người giữ nhịp (Scrum Master)**, chủ trì bộ sơ đồ thiết kế nặng ký nhất (25% điểm Rubric: Kiến trúc, Class, State Machine), chịu trách nhiệm dựng môi trường chạy web + cấu hình bảo mật **Nghị định 13/2023/NĐ-CP** và dẫn dắt chạy **16 Test Cases**. Phần lập trình bảo mật chỉ chiếm khoảng **5%** (chủ yếu dùng cấu hình sẵn + 2 class ngắn gọn).

---

## 1. THÔNG TIN ĐỊNH DANH & PHẠM VI "KHÔNG ĐÈ VIỆC"

| Hạng mục | Quy định dành riêng cho Role 2 |
| :--- | :--- |
| **Chức danh** | Scrum Master (SM) / System Architect / Security & QA Lead |
| **Mức độ Code** | **0% – 5% Code** (Chủ yếu cài môi trường Docker/Hosting, bật plugin bảo mật/RBAC, viết 2 file kiểm soát nhẹ `class-gf-rbac.php` & `class-gf-fraud-guard.php`) |
| **Nhánh GitHub độc quyền** | `role2-security-qa` *(Issue `#2`)* — **Giữ quyền duyệt & bấm Merge Pull Request vào `main`** |
| **File Word nháp trên Drive** | Tự tạo file `Nháp Role 2 - Họ Tên.docx` trong thư mục `3. Khung báo cáo đồ án EC312` |
| **Use Case phụ trách** | `UC-04` (Đăng ký/`.edu.vn`), **`UC-05 ★` (RBAC, Mã hóa NĐ 13/2023 & Rate Limit/Blacklist – Đặc tả 6 mục)**, `UC-06` (Đánh giá SP) |
| **File / Vùng ĐƯỢC SỬA** | `docker-compose.skeleton.yml`, `includes/class-gf-rbac.php`, `includes/class-gf-fraud-guard.php`, Nhật ký Scrum, Test Report, Chương 3.2, 3.3, 3.5, 4.1, 5.1, 5.2.2, 5.3 |
| **File TUYỆT ĐỐI KHÔNG SỬA** | Không tự sửa code tính trả góp/S/N (`Role 4`), giao diện `templates/` & `assets/` (`Role 3`), hay file CSV 500 SP (`Role 1`) |

---

## 2. BẢN ĐỒ FILE CẦN MỞ TRÊN GOOGLE DRIVE (CHỈ MỞ ĐÚNG 5 FILE NÀY)

| STT | Tên file trên Drive (`MONCUATHAYTIN`) | Thư mục chứa | Bạn lấy gì từ file này? |
| :-: | :--- | :--- | :--- |
| **1** | `2. Quy ước và Sơ đồ UML` → `Từ điển thuật ngữ và Ma trận Fit-Gap.docx` | `2. Quy ước và Sơ đồ UML` | Khóa cứng tên **Actors**, trạng thái `OrderStatus` & `InstallmentApplicationStatus`, tên Class và tiêu chí **NFR-01..06**. |
| **2** | `Khung kiến trúc và Sơ đồ UML Mermaid.docx` | `2. Quy ước và Sơ đồ UML` | Lấy nguyên bộ code **System Architecture (Mục 1)**, **Class Diagram (Mục 3)** và **2 State Machine (Mục 4)** để xuất ảnh PNG. |
| **3** | `Mẫu nhật ký làm việc nhóm Scrum.docx` | `1. Quản lý nhóm và Phân vai` | Dùng để ghi biên bản họp, tiến độ và bảng % đóng góp qua từng Sprint (Nộp thành Phụ lục B bắt buộc). |
| **4** | `Kế hoạch kiểm thử 16 Test Cases.docx` | `4. Kỹ thuật và Kiểm thử` | Bảng sẵn 16 kịch bản kiểm thử từ `TC-01` đến `TC-16` — bạn chỉ việc test, chụp ảnh bằng chứng và tick `PASS/FAIL`. |
| **5** | `docker-compose.skeleton.yml` | `4. Kỹ thuật và Kiểm thử` | File cấu hình sẵn để dựng nhanh WordPress + MySQL + phpMyAdmin chạy chung cho cả nhóm (nếu chạy Local/VPS Docker). |

---

## 3. LỘ TRÌNH 5 BƯỚC LÀM VIỆC TỪ TUẦN 1 ĐẾN TUẦN 12

### Bước 1: Dựng môi trường WordPress + Tạo tài khoản & GitHub cho nhóm (Sprint 0–1 | Tuần 1–3)
1. Kiểm tra kho GitHub `EC312-GearForge-HeThongTMDT` xem đủ 4 nhánh `role1..role4`; nhắc mỗi bạn nhận 1 Issue (`#1..#4`).
2. Dựng trang **WordPress + WooCommerce** chạy chung để cả nhóm vào làm Demo:
   - *Cách 1 (Khuyên dùng – Dễ nhất nếu có Hosting/VPS hoặc máy trạm chung):* Cài WordPress trắng trên Hosting có SSL (`https://...`), hoặc chạy trên máy bằng **LocalWP / XAMPP** rồi dùng Docker từ `docker-compose.skeleton.yml` (lệnh `docker compose -f "4. Kỹ thuật và Kiểm thử/docker-compose.skeleton.yml" up -d`).
   - Vào WordPress Admin → **Cài đặt (Settings) → Đường dẫn tĩnh (Permalinks)** → Chọn **`Tên bài viết (Post name)`** *(bắt buộc theo `lab_api_notes.md` của thầy Tín để REST API chạy được)*.
   - Cài **WooCommerce** và tạo sẵn 3 tài khoản test cho nhóm thử nghiệm: `student_test` (Khách sinh viên), `reviewer_test` (Chuyên viên duyệt hồ sơ), `admin_test` (Quản trị viên).
3. Bắt đầu ghi **Nhật ký làm việc nhóm** sau mỗi buổi họp tuần vào `Mẫu nhật ký làm việc nhóm Scrum.docx`.

### Bước 2: Xuất bộ Sơ đồ Kiến trúc, Class, State Machine & Đặc tả UC-05 (Sprint 1–2 | Tuần 3–6)
1. Mở `Khung kiến trúc và Sơ đồ UML Mermaid.docx`:
   - Copy code **Mục 1 (System Architecture)** → dán vào `https://mermaid.live` → Export PNG (`Architecture_GearForge_Role2.png`).
   - Copy code **Mục 3 (Class Diagram)** → Export PNG (`ClassDiagram_GearForge_Role2.png`). *Nhớ đọc mục `exercises_class_diagram.md` của thầy Tín để giải thích rõ trong báo cáo 3 loại quan hệ: **Association** (`User – Order`), **Aggregation** (`ComparisonSession – Product`), **Composition** (`Order – OrderItem`, `Product – ProductSpecAttribute`).*
   - Copy code **Mục 4.1 & 4.2 (2 State Machine Diagrams)** → Export 2 ảnh PNG (`State_Order_Role2.png`, `State_Installment_Role2.png`).
2. Vẽ **Activity & Sequence Diagram cho `UC-05`** (luồng kiểm tra Rate Limit/Blacklist + kiểm tra quyền `InstallmentReviewer` khi giải mã xem ảnh CCCD/Thẻ SV).
3. Viết **Bảng đặc tả 6 mục chuẩn cho `UC-05 ★`** (đủ Metadata, Pre/Post-conditions, Main Flow, Exception Flow như `429 Too Many Requests` / `403 Forbidden`, Quy tắc NĐ 13/2023 và BDD `Given / When / Then`).

### Bước 3: Cấu hình Bảo mật, Phân quyền RBAC & Chống gian lận (Sprint 3 | Tuần 7–9)
1. Trên WordPress Admin, cài plugin miễn phí bằng chuột (không phải tự code từ đầu):
   - **Limit Login Attempts Reloaded** (hoặc **Wordfence Security** bản Free) → bật tính năng giới hạn số lần đăng nhập sai / chống spam request.
   - **User Role Editor** (hoặc dùng đoạn hook ngắn trong `includes/class-gf-rbac.php` do bạn & Role 4 phối hợp) để tạo vai trò riêng **`InstallmentReviewer`** chỉ có quyền `gf_review_installments` mà **không cấp cho nhân viên xử lý đơn thường (`OrderStaff`)**.
2. Kiểm tra chéo với **Role 4 (Dev 2)** 3 chốt chặn bảo mật **Nghị định 13/2023/NĐ-CP** (nếu thiếu cái nào phải yêu cầu sửa ngay):
   - File ảnh CCCD/Thẻ SV upload lên phải lưu ngoài `public_html` (`/var/www/gf-vault/`) hoặc được mã hóa AES-256, **tuyệt đối không mở được trực tiếp qua link URL trình duyệt**.
   - Khóa `GF_VAULT_ENCRYPTION_KEY` phải đặt trong `.env` / `wp-config.php`, **không ghi thẳng (hardcode) trong file code đẩy lên GitHub**.
   - Khi nộp hồ sơ trả góp, người dùng bắt buộc phải tick vào **Consent Banner NĐ 13/2023** (phối hợp Role 3 kiểm tra).
3. Triển khai bảng **`wp_gf_fraud_blacklist`** (kiểm tra trong `includes/class-gf-fraud-guard.php` chặn theo IP / SĐT / mã CCCD hash).

### Bước 4: Chạy toàn bộ 16 Test Cases & Tổng hợp Báo cáo Master (Sprint 4 | Tuần 10–12)
1. Mở file `4. Kỹ thuật và Kiểm thử/Kế hoạch kiểm thử 16 Test Cases.docx`, tự tay test đủ từ **`TC-01` đến `TC-16`** trên website:
   - Đo tốc độ tải trang lọc ≥ 500 SP (`NFR-01` < 3s) bằng Chrome DevTools (`F12 → Network`).
   - Test co giãn màn hình Mobile `375px` (`TC-10`).
   - Test lấy link URL ảnh CCCD mở trên trình duyệt Ẩn danh xem có bị chặn `403/404` không (`TC-06`).
   - Test đăng nhập tài khoản `OrderStaff` thử vào trang duyệt CCCD xem có bị từ chối `403` không (`TC-07`).
   - Test gắn đơn Laptop chưa nhập Serial Number thử bấm `SHIPPING` xem hệ thống có chặn lại không (`TC-15`).
2. Điền trạng thái `PASS / FAIL`, ngày test và **chụp ảnh màn hình bằng chứng** đưa vào Chương 5.3.
3. Soạn các mục `[Role 2 viết]` vào **`Nháp Role 2 - Họ Tên.docx`**:
   - **Mục 3.2 (Class Diagram)**, **Mục 3.3 (State Machine)**, **Mục 3.5 (Đặc tả `UC-05` + Activity + Sequence)**.
   - **Mục 4.1 (Kiến trúc hệ thống Layered + Microkernel)**, **Mục 5.1 (Môi trường & Cấu trúc code)**, **Mục 5.2.2 (Ảnh Demo RBAC/Blacklist)**, **Mục 5.3 (Test Report 16 Test Cases)**.
   - **Phụ lục B:** Bảng Nhật ký làm việc nhóm Scrum đầy đủ 4 Sprints.

### Bước 5: Duyệt Pull Request trên GitHub & Ghép file Word Master
1. Thu 4 file `Nháp Role 1..4 - Họ Tên.docx` trên Drive → ghép vào bản cuối cùng `Khung báo cáo đồ án EC312 GearForge.docx` → rà mục lục tự động, căn lề chuẩn UIT, xuất file `.pdf`.
2. Trên GitHub, luôn dùng nhánh `role2-security-qa` cho phần của mình, đồng thời **review Pull Request của Role 1, 3, 4** (kiểm tra không ai lộ file `.env`, không sửa chéo file của nhau) trước khi bấm **Merge pull request** vào `main`.

---

## 4. BẢNG PHÂN QUYỀN RBAC & MẪU DÒNG NHẬT KÝ SCRUM (COPY DÙNG NGAY)

### 4.1. Ma trận Phân quyền RBAC (Đưa vào Chương 4.1 & Mục 3.5)

| Vai trò (`Role`) | Xem & mua SP | Nộp hồ sơ trả góp | Sửa/Import 500 SP | Xác nhận đóng gói & Gán S/N | Xem ảnh CCCD/Thẻ SV & Duyệt 2 lớp | Cấu hình Blacklist & RBAC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `Guest` | Có | Không | Không | Không | **Không** | Không |
| `StudentCustomer` | Có | Có (của mình) | Không | Không | **Chỉ xem trạng thái** | Không |
| `OrderStaff` *(NV thường)* | Có | Không | Không | Có | **Cấm (403 Forbidden)** | Không |
| `InstallmentReviewer` | Có | Không | Không | Không | **Có (Ghi Audit Log)** | Không |
| `StoreAdmin` | Có | Không | Có | Có | **Có (Ghi Audit Log)** | **Có** |

### 4.2. Ghi chú nhanh khi Test Bảo mật (Bí quyết lấy trọn 10% điểm Pháp lý/QA)
- Khi test `TC-06` (Chặn URL ảnh CCCD) và `TC-08` (Blacklist/Rate Limit), hãy bấm `F12` mở tab **Network** hoặc **Console** chụp lại dòng mã phản hồi **`403 Forbidden`** / **`429 Too Many Requests`** chèn thẳng vào Chương 5.3 — giảng viên chấm bài đánh giá rất cao bằng chứng thật này!

---

## 5. CHECKLIST TỰ KIỂM TRA TRƯỚC KHI BÀN GIAO (ROLE 2 DONE)

- [ ] Môi trường WordPress + WooCommerce chạy ổn định, đã bật Permalink `Post name` và tạo đủ tài khoản test.
- [ ] Có đủ 6 ảnh sơ đồ UML PNG nét cao (`Kiến trúc`, `Class`, `State Order`, `State Installment`, `Activity UC-05`, `Sequence UC-05`).
- [ ] Đã kiểm tra chắc chắn `OrderStaff` bị chặn `403` khi mở hồ sơ CCCD và link URL tĩnh không truy cập được ảnh CCCD.
- [ ] Đã chạy và ghi kết quả đầy đủ **16/16 Test Cases** (100% test Critical đều `PASS`) kèm ảnh chụp màn hình.
- [ ] Đã hoàn thiện `Mẫu nhật ký làm việc nhóm Scrum.docx`, ghép trọn bộ báo cáo Master `.docx` & `.pdf` và giữ nhánh `main` trên GitHub sạch sẽ.
