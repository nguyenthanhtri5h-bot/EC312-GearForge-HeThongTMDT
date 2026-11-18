# NHÁNH ĐỘC QUYỀN: role1-data-catalog (NHÓM 7)

> **Thành viên phụ trách:** **Trịnh Duy Long** — MSSV: `24521021`  
> **Vai trò Scrum:** Role 1 – Product Owner (PO) / Nhóm trưởng / BA *(Issue `#1`)*  
> **Nhánh này được dọn gọn:** Chỉ chứa đúng file **Hướng dẫn của bạn** để tránh rối mắt. Toàn bộ bộ khung tài liệu dùng chung nằm trên nhánh [`main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main) và [Google Drive Nhóm 7 (MONCUATHAYTIN)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm).

---

## 1. FILE HƯỚNG DẪN CỦA BẠN (ĐỌC KỸ TRƯỚC KHI LÀM)

- Bản Markdown (đọc trực tiếp trên GitHub): [Hướng dẫn Role 1 - PO và Dữ liệu 500 SP.md](<Hướng dẫn Role 1 - PO và Dữ liệu 500 SP.md>)
- Bản Word (tải về / xem offline): [Hướng dẫn Role 1 - PO và Dữ liệu 500 SP.docx](<Hướng dẫn Role 1 - PO và Dữ liệu 500 SP.docx>)

---

## 2. TÓM TẮT PHẦN VIỆC & PHẠM VI SỞ HỮU

| Hạng mục | Chi tiết dành riêng cho bạn |
| :--- | :--- |
| **Mức độ Code** | 0% Code (Excel/CSV, Google Forms, Mermaid, Admin WP) |
| **Use Case phụ trách** | `UC-01` (Tìm & Lọc), **`UC-02 ★`** (So sánh cấu hình 2–3 máy), `UC-03` (Import ≥ 500 sản phẩm) |
| **Phạm vi file / báo cáo** | Khảo sát sinh viên ĐHQG, file CSV `products_import.csv` (≥ 500 SP), trang Pháp lý BCT, Chương 1, 2 (2.1–2.4), 3.1, 3.4, 6.1–6.2 |

> Bạn đóng vai trò PO/Nhóm trưởng theo dõi tổng thể tiến độ và chốt dữ liệu ≥ 500 sản phẩm.

---

## 3. TÀI LIỆU DÙNG CHUNG TRÊN `main` (TRA CỨU KHI CẦN)

Khi cần tra cứu tên Actor, mã `UC-01..UC-12`, tên 4 bảng `wp_gf_*`, Sơ đồ Mermaid, Khung Báo cáo hoặc `docker-compose.skeleton.yml`, mở trực tiếp trên nhánh **`main`** (không cần copy vào nhánh này):
- [Bộ tài liệu dùng chung trên nhánh `main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main)
- [Google Drive chung `MONCUATHAYTIN` (bản `.docx`)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)

> **Lưu ý Git khi nộp bài vào `main`:** Vì nhánh này đã xóa bớt các thư mục dùng chung để giữ gọn, tuyệt đối **không merge trực tiếp toàn bộ lịch sử xóa của nhánh này vào `main`**. Khi hoàn thành bài làm, commit đúng các file sản phẩm của bạn; **Role 2 (SM)** sẽ cherry-pick các commit bài làm đó (hoặc tạo nhánh sạch từ `main` để ghép vào).
