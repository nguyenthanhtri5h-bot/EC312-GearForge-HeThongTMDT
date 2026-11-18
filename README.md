# NHÁNH ĐỘC QUYỀN: role3-ui-frontend (NHÓM 7)

> **Thành viên phụ trách:** **Nguyễn Thanh Trí** — MSSV: `24521838`  
> **Vai trò Scrum:** Role 3 – Developer 1 (UI/UX Figma & Frontend WooCommerce) *(Issue `#3`)*  
> **Nhánh này được dọn gọn:** Chỉ chứa đúng file **Hướng dẫn của bạn** để tránh rối mắt. Toàn bộ bộ khung tài liệu dùng chung nằm trên nhánh [`main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main) và [Google Drive Nhóm 7 (MONCUATHAYTIN)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm).

---

## 1. FILE HƯỚNG DẪN CỦA BẠN (ĐỌC KỸ TRƯỚC KHI LÀM)

- Bản Markdown (đọc trực tiếp trên GitHub): [Hướng dẫn Role 3 - UI UX Figma và Giao diện.md](<Hướng dẫn Role 3 - UI UX Figma và Giao diện.md>)
- Bản Word (tải về / xem offline): [Hướng dẫn Role 3 - UI UX Figma và Giao diện.docx](<Hướng dẫn Role 3 - UI UX Figma và Giao diện.docx>)

---

## 2. TÓM TẮT PHẦN VIỆC & PHẠM VI SỞ HỮU

| Hạng mục | Chi tiết dành riêng cho bạn |
| :--- | :--- |
| **Mức độ Code** | Ít Code (Figma, Theme/Child Theme, CSS/JS, `templates/`) |
| **Use Case phụ trách** | `UC-07` (Giỏ hàng & Coupon), **`UC-08 ★`** (Checkout & Theo dõi đơn hàng OMS), `UC-09` (Yêu cầu bảo hành S/N) |
| **Phạm vi file / báo cáo** | Mockup Figma (4.3), Child Theme WooCommerce, `templates/` (`compare-table`, `installment-widget` UI, `oms-tracking-stepper`), `assets/` (`css/`, `js/`), Chương 3.6, 4.3, 5.2.1, 5.2.3 |

> Tập trung hoàn thiện bộ UI/UX Figma + giao diện Storefront trong phạm vi `templates/` và `assets/`.

---

## 3. TÀI LIỆU DÙNG CHUNG TRÊN `main` (TRA CỨU KHI CẦN)

Khi cần tra cứu tên Actor, mã `UC-01..UC-12`, tên 4 bảng `wp_gf_*`, Sơ đồ Mermaid, Khung Báo cáo hoặc `docker-compose.skeleton.yml`, mở trực tiếp trên nhánh **`main`** (không cần copy vào nhánh này):
- [Bộ tài liệu dùng chung trên nhánh `main`](https://github.com/nguyenthanhtri5h-bot/EC312-GearForge-HeThongTMDT/tree/main)
- [Google Drive chung `MONCUATHAYTIN` (bản `.docx`)](https://drive.google.com/drive/folders/17V1tjxDp0T4hoQtF4pSNsXWjcD4WRJpm)

> **Lưu ý Git khi nộp bài vào `main`:** Vì nhánh này đã xóa bớt các thư mục dùng chung để giữ gọn, tuyệt đối **không merge trực tiếp toàn bộ lịch sử xóa của nhánh này vào `main`**. Khi hoàn thành bài làm, commit đúng các file sản phẩm của bạn; **Role 2 (SM)** sẽ cherry-pick các commit bài làm đó (hoặc tạo nhánh sạch từ `main` để ghép vào).
