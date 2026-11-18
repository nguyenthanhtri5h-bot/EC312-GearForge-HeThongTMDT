# NHÁNH ĐỘC QUYỀN: role2-security-qa (NHÓM 7)

> **Thành viên phụ trách:** **Ngô Trọng Đạt** — MSSV: `24520275`  
> **Vai trò Scrum:** Role 2 – Scrum Master (SM) / System Architect / Security & QA Lead *(Issue `#2`)*  
> **Nhánh này được dọn gọn:** Chỉ chứa đúng file **Hướng dẫn của bạn** để tránh rối mắt. Toàn bộ bộ khung tài liệu dùng chung nằm trên nhánh [`main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main) và [Google Drive Nhóm 7 (MONCUATHAYTIN)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm).

---

## 1. FILE HƯỚNG DẪN CỦA BẠN (ĐỌC KỸ TRƯỚC KHI LÀM)

- Bản Markdown (đọc trực tiếp trên GitHub): [Hướng dẫn Role 2 - SM Bảo mật và Kiểm thử.md](<Hướng dẫn Role 2 - SM Bảo mật và Kiểm thử.md>)
- Bản Word (tải về / xem offline): [Hướng dẫn Role 2 - SM Bảo mật và Kiểm thử.docx](<Hướng dẫn Role 2 - SM Bảo mật và Kiểm thử.docx>)

---

## 2. TÓM TẮT PHẦN VIỆC & PHẠM VI SỞ HỮU

| Hạng mục | Chi tiết dành riêng cho bạn |
| :--- | :--- |
| **Mức độ Code** | 0–5% Code (`docker-compose`, RBAC, Fraud Guard) |
| **Use Case phụ trách** | `UC-04` (Đăng ký/`.edu.vn`), **`UC-05 ★`** (RBAC, Bảo mật NĐ 13/2023 & Rate Limit/Blacklist), `UC-06` (Đánh giá SP) |
| **Phạm vi file / báo cáo** | Kiến trúc hệ thống (4.1), Class Diagram (3.2), State Machine (3.3), `docker-compose`, `includes/class-gf-rbac.php`, `includes/class-gf-fraud-guard.php`, 16 Test Cases Report, Nhật ký Scrum |

> Bạn là Scrum Master giữ quyền review và **chỉ cherry-pick/merge phần bài làm mới** vào `main` (tránh merge commit dọn nhánh xóa file dùng chung).

---

## 3. TÀI LIỆU DÙNG CHUNG TRÊN `main` (TRA CỨU KHI CẦN)

Khi cần tra cứu tên Actor, mã `UC-01..UC-12`, tên 4 bảng `wp_gf_*`, Sơ đồ Mermaid, Khung Báo cáo hoặc `docker-compose.skeleton.yml`, mở trực tiếp trên nhánh **`main`** (không cần copy vào nhánh này):
- [Bộ tài liệu dùng chung trên nhánh `main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main)
- [Google Drive chung `MONCUATHAYTIN` (bản `.docx`)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)

> **Lưu ý Git khi nộp bài vào `main`:** Vì nhánh này đã xóa bớt các thư mục dùng chung để giữ gọn, tuyệt đối **không merge trực tiếp toàn bộ lịch sử xóa của nhánh này vào `main`**. Khi hoàn thành bài làm, commit đúng các file sản phẩm của bạn; **Role 2 (SM)** sẽ cherry-pick các commit bài làm đó (hoặc tạo nhánh sạch từ `main` để ghép vào).
