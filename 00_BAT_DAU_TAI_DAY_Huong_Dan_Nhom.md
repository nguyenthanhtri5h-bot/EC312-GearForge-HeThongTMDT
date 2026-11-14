# BẮT ĐẦU TẠI ĐÂY: HƯỚNG DẪN NHÓM 4 THÀNH VIÊN (GEARFORGE – EC312)

> Chào mừng bạn đến với dự án **GearForge** (Hệ thống TMĐT kinh doanh Laptop, PC và Phụ kiện tích hợp So sánh cấu hình & Trả góp sinh viên – Môn **EC312**, GVHD: **ThS. Trình Trọng Tín**).  
> Tài liệu này giúp cả 4 thành viên **hiểu đúng quy trình và bắt tay làm việc ngay trong 10 phút** mà không bị rối hay làm lệch bài của nhau.

- **Thư mục Google Drive chung:** `https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm`
- **Kho lưu trữ GitHub chung:** `https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT`

---

## 1. THỨ TỰ ĐỌC 3 FILE TRONG 10 PHÚT ĐẦU TIÊN

| Bước | Mở file nào? | Nằm ở đâu? | Mục đích |
| :-: | :--- | :--- | :--- |
| **1** | `Ban_Mo_Ta_Du_An_GearForge.docx` | Thư mục gốc | Nắm toàn cảnh đề tài GearForge, mục tiêu KPIs, TCO 3 năm và yêu cầu pháp lý VN (NĐ 13/2023, T-VAN, 3D-Secure, S/N). |
| **2** | `Huong_Dan_Chon_Vai_Tro_GearForge.docx` | `01_Project_Management\` | Chọn 1 trong 4 vai trò (`Role 1..4`) đúng thế mạnh cá nhân. Sau đó điền Họ tên & MSSV vào bảng phân công. |
| **3** | `shared_domain_glossary.md` | `02_Shared_Specs_and_Standards\` | Tra cứu tên **Actor, Mã UC-01..UC-12, Trạng thái, Tên Class và 4 bảng MySQL** dùng chung (Tuyệt đối không tự đặt tên khác!). |

---

## 2. PHỐI HỢP GOOGLE DRIVE VS GITHUB KHÔNG ĐÈ FILE NHAU

- **Google Drive (`MONCUATHAYTIN`)** là nơi lưu trữ tài liệu Word, kết quả khảo sát Google Forms, hình ảnh mockup Figma, ảnh chụp màn hình Demo và file Báo cáo cuối cùng nộp giảng viên.
  - *Quy tắc:* Không sửa trực tiếp lên file sườn gốc của người khác; khi viết phần chương của mình, hãy tạo file riêng theo cú pháp `Chuong3_RoleX_TenThanhVien.docx` rồi gộp vào bản Master.
- **GitHub (`EC312-GearForge-HeThongTMDT`)** là nơi lưu trữ mã nguồn Plugin `gearforge-core`, Child Theme, file Docker, file Markdown/Mermaid và quản lý đầu việc qua **4 Epic Issues** (`#1` đến `#4`).
  - *Quy tắc:* Sau khi chốt vai trò, mỗi bạn tự bấm **Assign** vào Issue tương ứng trên GitHub (`Issue #1` = Role 1, `Issue #2` = Role 2, `Issue #3` = Role 3, `Issue #4` = Role 4). Khi code hoặc cập nhật tài liệu Markdown, tạo nhánh riêng (`feat/role1-import`, `feat/role2-security`, `feat/role3-ui`, `feat/role4-installment`) và mở Pull Request vào `main`.
  - **Cảnh báo bảo mật:** Tuyệt đối **không** commit tệp `.env`, mật khẩu DB, khóa AES-256 hoặc dữ liệu trong thư mục `gf-vault/`.

---

## 3. BÍ QUYẾT ĂN ĐIỂM TUYỆT ĐỐI THEO CHUẨN CỦA THẦY TRÌNH TRỌNG TÍN (`trinhtin/ec312`)

Dựa trên tài liệu chính thức của Thầy Tín (`00_References/gap-analysis.md`, `requirements.md`, `project-rubric.md`), nhóm cần giữ vững **3 nguyên tắc vàng** sau:

1. **Nguyên tắc Buy & Customize (70% Core – 30% Custom GAP):**
   - Các chức năng có sẵn của WooCommerce (đăng ký cơ bản, giỏ hàng, catalog mặc định) được xem là **Black-box** — vẫn vẽ hình bầu dục trên sơ đồ Use Case tổng thể để đủ khung phạm vi, nhưng **không cần tốn công viết đặc tả dài dòng**.
   - Dồn 100% tâm huyết mô hình hóa sâu và code thật cho phần **Custom GAP** của GearForge: `UC-02` (Compare Specs 2–3 máy), `UC-05` (RBAC + Mã hóa NĐ 13/2023 + Blacklist/Rate Limit), `UC-08` (Checkout + OMS theo dõi duyệt trả góp), `UC-10/11/12` (Trả góp SV 3–6–12 tháng + Duyệt 2 lớp + S/N + Hóa đơn PDF T-VAN).
2. **Dòng chảy thiết kế nhất quán (`BR → FR → Use Case → Sequence → Class → ERD`):**
   - Mọi tính năng mới đều phải truy vết ngược được về Business Requirement (`BR-01..05`) và bảng Fit-Gap trong `shared_domain_glossary.md`.
   - Tên hàm trong `Sequence Diagram` phải khớp với phương thức trong `Class Diagram`, và các Entity trong `Class Diagram` phải ánh xạ chuẩn sang bảng MySQL trong `ERD`.
3. **Viết Đặc tả Custom Use Case đủ 6 mục + Tiêu chí BDD:**
   - Mỗi Role khi viết đặc tả cho Use Case trọng tâm (`★`) của mình ở Chương 3 cần đủ 6 phần: *(1) Metadata → (2) Pre/Post-conditions → (3) Main Flow → (4) Alternative/Exception Flows → (5) Business Rules, Payload/Schema, RBAC/UI → (6) Acceptance Criteria viết theo mẫu `Given ... When ... Then ...`*.

---

## 4. CÁCH XUẤT ẢNH SƠ ĐỒ UML NÉT CAO CHỈ TRONG 30 GIÂY

Nhóm không cần mất thời gian kẻ lại sơ đồ từ đầu. Toàn bộ khung sơ đồ (**Kiến trúc Layered/Microkernel, Use Case tổng thể, Class Diagram, State Machine, ERD, Sequence & Activity mẫu**) đã được viết sẵn bằng mã Mermaid trong file `02_Shared_Specs_and_Standards/architecture_and_uml_skeleton.md`.

- **Bước 1:** Mở file `architecture_and_uml_skeleton.md` và copy đoạn mã nằm trong cặp thẻ ```` ```mermaid ... ``` ````.
- **Bước 2:** Truy cập trang `https://mermaid.live` (hoặc dùng Draw.io chọn *Arrange → Insert → Advanced → Mermaid*).
- **Bước 3:** Dán mã vào, chỉnh sửa/bổ sung chi tiết phân hệ của mình rồi bấm **Actions → Export PNG** (chọn độ phân giải cao) hoặc **SVG** để chèn trực tiếp vào Báo cáo Word.

---

## 5. TIN NHẮN MẪU GỬI GROUP NHÓM (COPY & PASTE)

> Chào mọi người, mình đã dựng xong bộ sườn chuẩn cho đồ án **EC312 – GearForge** (bám sát 100% mẫu báo cáo, rubric và hướng dẫn Buy/Customize trên GitHub của thầy Trình Trọng Tín):
> - 📁 **Google Drive nhóm:** https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm
> - 💻 **GitHub nhóm:** https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT
>
> Mọi người vào Drive đọc giúp mình theo thứ tự:
> 1. `00_BAT_DAU_TAI_DAY_Huong_Dan_Nhom.docx` (đọc trước 5 phút)
> 2. `Ban_Mo_Ta_Du_An_GearForge.docx`
> 3. `01_Project_Management/Huong_Dan_Chon_Vai_Tro_GearForge.docx`
>
> Tối nay/mai cả nhóm chốt mỗi người nhận 1 gói (`Role 1..4`) tương ứng 4 Issue trên GitHub để bắt đầu chạy Sprint 1 (làm khảo sát + đặc tả Use Case) luôn nhé!
