# NHÁNH ĐỘC QUYỀN: role4-backend-payment (NHÓM 7)

> **Thành viên phụ trách:** **Lê Lưu Luân** — MSSV: `24521027`  
> **Vai trò Scrum:** Role 4 – Developer 2 (Backend, Database & Trả góp SV) *(Issue `#4`)*  
> **Nhánh này được dọn gọn:** Chỉ chứa đúng file **Hướng dẫn của bạn** để tránh rối mắt. Toàn bộ bộ khung tài liệu dùng chung nằm trên nhánh [`main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main) và [Google Drive Nhóm 7 (MONCUATHAYTIN)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm).

---

## 1. FILE HƯỚNG DẪN CỦA BẠN (ĐỌC KỸ TRƯỚC KHI LÀM)

- Bản Markdown (đọc trực tiếp trên GitHub): [Hướng dẫn Role 4 - Backend Database và Trả góp.md](<Hướng dẫn Role 4 - Backend Database và Trả góp.md>)
- Bản Word (tải về / xem offline): [Hướng dẫn Role 4 - Backend Database và Trả góp.docx](<Hướng dẫn Role 4 - Backend Database và Trả góp.docx>)

---

## 2. TÓM TẮT PHẦN VIỆC & PHẠM VI SỞ HỮU

| Hạng mục | Chi tiết dành riêng cho bạn |
| :--- | :--- |
| **Mức độ Code** | Code chính (PHP 8.2 + MySQL 8.0 + REST API) |
| **Use Case phụ trách** | **`UC-10 ★`** (Tính toán & Nộp hồ sơ trả góp SV 3–6–12 tháng), `UC-11` (Duyệt 2 lớp & Sandbox VNPay/MoMo/Fundiin), `UC-12` (Gán S/N & Xuất PDF T-VAN) |
| **Phạm vi file / báo cáo** | ERD & 4 bảng `wp_gf_*` (4.2), Plugin `gearforge-core` (`includes/` & `admin/`), mã hóa AES-256-CBC (`gf-vault/`), Sandbox Payment, S/N & Hóa đơn PDF, Chương 3.7, 4.2, 5.2.3–5.2.4, 6.3 |

> Toàn bộ 4 bảng `wp_gf_*`, logic trả góp, AES-256-CBC, Sandbox thanh toán & S/N thuộc toàn quyền xử lý của bạn.

---

## 3. TÀI LIỆU DÙNG CHUNG TRÊN `main` (TRA CỨU KHI CẦN)

Khi cần tra cứu tên Actor, mã `UC-01..UC-12`, tên 4 bảng `wp_gf_*`, Sơ đồ Mermaid, Khung Báo cáo hoặc `docker-compose.skeleton.yml`, mở trực tiếp trên nhánh **`main`** (không cần copy vào nhánh này):
- [Bộ tài liệu dùng chung trên nhánh `main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main)
- [Google Drive chung `MONCUATHAYTIN` (bản `.docx`)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)

> **Lưu ý Git khi nộp bài vào `main`:** Vì nhánh này đã xóa bớt các thư mục dùng chung để giữ gọn, tuyệt đối **không merge trực tiếp toàn bộ lịch sử xóa của nhánh này vào `main`**. Khi hoàn thành bài làm, commit đúng các file sản phẩm của bạn; **Role 2 (SM)** sẽ cherry-pick các commit bài làm đó (hoặc tạo nhánh sạch từ `main` để ghép vào).
