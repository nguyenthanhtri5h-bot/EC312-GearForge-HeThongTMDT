# HƯỚNG DẪN CẦM TAY CHỈ VIỆC: ROLE 3 – UI/UX DESIGNER (FIGMA) & GIAO DIỆN FRONTEND

> **Mức độ kỹ thuật:** Bạn là **người thổi hồn giao diện cho GearForge**! Công việc chính của bạn là **thiết kế Wireframe/Mockup trên Figma** (chiếm 10% điểm riêng của Rubric) và **cài Theme WooCommerce kéo-thả** trên WordPress để làm đẹp trang chủ, trang lọc, bảng **Compare Specs 2–3 máy**, trang theo dõi đơn hàng **OMS** và hộp thoại đồng ý **Nghị định 13/2023**. Rất ít code logic — chủ yếu dùng CSS/HTML và Template PHP cơ bản.

---

## 1. THÔNG TIN ĐỊNH DANH & PHẠM VI "KHÔNG ĐÈ VIỆC"

| Hạng mục | Quy định dành riêng cho Role 3 |
| :--- | :--- |
| **Thành viên đảm nhận (Nhóm 7)** | **Nguyễn Thanh Trí** — MSSV: `24521838` |
| **Chức danh** | Developer 1 – UI/UX Designer & Frontend WooCommerce Specialist |
| **Mức độ Code** | **Code ít (UI là chính)** — Thiết kế Figma + Dựng trang WordPress bằng Theme/Elementor/CSS + Template hiển thị trong `templates/` & `assets/` |
| **Nhánh GitHub độc quyền** | `role3-ui-frontend` *(Issue `#3`)* — Tuyệt đối không push thẳng vào `main` |
| **File Word nháp trên Drive** | Tự tạo file `Nháp Role 3 - Họ Tên.docx` trong thư mục `3. Khung báo cáo đồ án EC312` |
| **Use Case phụ trách** | `UC-07` (Giỏ hàng & Coupon), **`UC-08 ★` (Đặt hàng Checkout & Theo dõi OMS – Viết đặc tả 6 mục)**, `UC-09` (Yêu cầu bảo hành S/N) |
| **File / Vùng ĐƯỢC SỬA** | File Figma, WordPress Child Theme, `templates/` (`compare-table.php`, `installment-widget.php` phần UI, `oms-tracking-stepper.php`), `assets/` (`css/`, `js/`), Chương 3.6, 4.3, 5.2.1 & 5.2.3 |
| **File TUYỆT ĐỐI KHÔNG SỬA** | Không tự sửa code tính lãi/duyệt hồ sơ/SQL/Sandbox trong `includes/` (`Role 4`), file `class-gf-rbac.php` (`Role 2`) hay CSV 500 SP (`Role 1`) |

---

## 2. BẢN ĐỒ FILE CẦN MỞ TRÊN GOOGLE DRIVE (CHỈ MỞ ĐÚNG 5 FILE NÀY)

| STT | Tên file trên Drive (`MONCUATHAYTIN`) | Thư mục chứa | Bạn lấy gì từ file này? |
| :-: | :--- | :--- | :--- |
| **1** | `Danh mục nguồn tham chiếu và Plugin WordPress.docx` | `0. Tài liệu tham khảo` | Mở **Xgear, MemoryZone, CellphoneS, ThinkPro, GSMArena Compare** để học bố cục thẻ Laptop, bộ lọc và bảng Compare Specs 3 máy. |
| **2** | `Từ điển thuật ngữ và Ma trận Fit-Gap.docx` | `2. Quy ước và Sơ đồ UML` | Lấy đúng tên **8 trạng thái `OrderStatus`**, **6 trạng thái `InstallmentApplicationStatus`**, tiêu chuẩn Mobile `375px` (`NFR-04`) và **6 mục đặc tả `UC-08`**. |
| **3** | `Khung kiến trúc và Sơ đồ UML Mermaid.docx` | `2. Quy ước và Sơ đồ UML` | Xem mẫu Sequence & Activity để vẽ `Activity` + `Sequence Diagram` cho `UC-08` (trên `mermaid.live`). |
| **4** | `Product Backlog 16 User Stories.docx` | `1. Quản lý nhóm và Phân vai` | Đọc `US-09` → `US-12` để đảm bảo giao diện đủ các nút bấm, mã giảm giá `BACKTOSCHOOL` và Consent Banner NĐ 13/2023. |
| **5** | `Đặc tả kỹ thuật Plugin và Database MySQL.docx` | `4. Kỹ thuật và Kiểm thử` | Xem cấu trúc `templates/` và `assets/` bạn phụ trách khớp với Backend của Role 4. |

---

## 3. LỘ TRÌNH 5 BƯỚC LÀM VIỆC TỪ TUẦN 1 ĐẾN TUẦN 12

### Bước 1: Tham khảo giao diện & Vẽ Wireframe/Mockup trên Figma (Sprint 1–2 | Tuần 2–6)
1. Lướt 4 website mẫu ở [xgear.net](https://xgear.net/), [memoryzone.com.vn](https://memoryzone.com.vn/), [thinkpro.vn](https://thinkpro.vn/) và bảng đối chiếu [gsmarena.com/compare.php3](https://www.gsmarena.com/compare.php3) để chốt tông màu **GearForge** *(gợi ý: Xanh đậm `#1F4E79` hoặc Đen Công nghệ + Cam/Xanh Neon điểm nhấn, font chữ dễ đọc như Inter/Roboto)*.
2. Trên **Figma**, tạo Project đặt tên khung (Frame) đúng chuẩn **`[UC-XX] TênMànHình_Desktop/Mobile`**, hoàn thành đủ **6 màn hình trọng tâm** (bảng chi tiết ở Mục 4):
   - Trang chủ & Danh mục lọc thông số (`CPU / RAM / GPU / Nhu cầu / Giá`).
   - Bảng **So sánh cấu hình 2–3 Laptop/PC** (kèm dòng *"Ước tính góp SV/tháng"*).
   - Trang Chi tiết sản phẩm kèm **Widget tính trả góp 3–6–12 tháng**.
   - Giỏ hàng (áp mã `BACKTOSCHOOL`), Trang Checkout (Thanh toán thẳng vs Trả góp SV) + **Hộp thoại Consent Banner NĐ 13/2023**.
   - Trang **Theo dõi đơn hàng OMS Stepper** (hiển thị tiến độ Duyệt Lớp 1 → Lớp 2 → Gắn S/N → Đang giao).
   - Giao diện Admin tối giản: Duyệt hồ sơ trả góp 2 lớp & Gắn S/N *(phác thảo khung để Role 4 code theo)*.
3. Export từng màn hình Figma sang ảnh PNG nét cao, vẽ thêm **User Flow (Sơ đồ luồng đi của người dùng)** để chèn vào **Mục 4.3**.

### Bước 2: Vẽ Sơ đồ UML & Viết Đặc tả UC-08 (Sprint 1–2 | Tuần 3–6)
1. Dựa vào mẫu trong `Khung kiến trúc và Sơ đồ UML Mermaid.docx`, dùng **`https://mermaid.live`** để vẽ 2 sơ đồ cho `UC-08`:
   - **Activity Diagram `UC-08`:** Thể hiện 2 nhánh rẽ rõ ràng từ Giỏ hàng → Checkout: *Nhánh A (Thanh toán thẳng VNPay/MoMo/COD)* vs *Nhánh B (Trả góp Sinh viên GearForge → Bắt buộc tick Consent Banner NĐ 13/2023 → Upload CCCD/Thẻ SV → Chờ duyệt 2 lớp)*.
   - **Sequence Diagram `UC-08`:** Theo 4 lớp chuẩn `StudentCustomer → CheckoutUI → CartCheckoutService → Order / PaymentGateway`.
2. Xuất ảnh đặt tên chuẩn: `UC08_CheckoutOMS_Activity_Role3.png`, `UC08_CheckoutOMS_Sequence_Role3.png`.
3. Viết **Bảng đặc tả 6 mục chuẩn cho `UC-08 ★`** (đủ các trường hợp ngoại lệ như coupon hết hạn, bỏ trống checkbox Consent NĐ 13/2023, giỏ hàng trống, và tiêu chí BDD `Given / When / Then`).

### Bước 3: Dựng Giao diện WordPress + WooCommerce (Sprint 3 | Tuần 7–9)
1. Cài **Theme WordPress miễn phí/gọn nhẹ** hỗ trợ WooCommerce tốt (ví dụ **Astra**, **Blocksy** hoặc **Storefront**) và tạo **Child Theme** (hoặc dùng trình kéo-thả **Elementor Free / Gutenberg Blocks**) để dựng Trang chủ, Header (thanh tìm kiếm + menu Laptop/PC/Phụ kiện), Footer (4 link Chính sách của Role 1).
2. Định dạng lại CSS cho các thành phần đặc thù trong `assets/css/gearforge-frontend.css`:
   - **Thẻ sản phẩm (Product Card):** Hiển thị gọn tag cấu hình tóm tắt (`i5 / 16GB / RTX 3050`), badge **"Trả góp SV 0% lãi suất kỳ hạn 3th"** và nút **"So sánh"**.
   - **Bảng Compare Specs (`templates/compare-table.php`):** Đảm bảo 3 cột Laptop xếp cạnh nhau ngay hàng thẳng lối, tô màu highlight điểm khác biệt giữa 3 máy.
   - **Thanh tiến độ OMS (`templates/oms-tracking-stepper.php`):** Vẽ thanh Stepper ngang (trên Desktop) / dọc (trên Mobile) hiển thị đúng tên trạng thái `CREATED → PENDING_INSTALLMENT_APPROVAL → L1_DOCS_VERIFIED → L2_EDU_CONFIRMED → PROCESSING → SERIAL_ASSIGNED → SHIPPING → DELIVERED`.
3. Thiết kế & gắn **Hộp thoại Consent Banner Nghị định 13/2023/NĐ-CP** ngay trên `templates/installment-widget.php` (bắt buộc người dùng bấm tick mới sáng nút *"Nộp hồ sơ"* bằng JS trong `assets/js/gearforge-frontend.js`).
4. Tạo sẵn trong WooCommerce → Marketing → Coupons mã khuyến mãi **`BACKTOSCHOOL`** (ví dụ giảm 500.000đ cho đơn Laptop ≥ 10 triệu) để dùng cho `TC-09`.

### Bước 4: Kiểm tra Responsive Mobile 375px & Tốc độ < 3 giây (Sprint 3–4 | Tuần 9–11)
1. Mở Website bằng Google Chrome → bấm `F12` → bật biểu tượng **Toggle Device Toolbar (`Ctrl + Shift + M`)** → chọn kích thước **iPhone SE / `375px`**:
   - Soi kỹ Trang chủ, Bộ lọc, Bảng Compare Specs (cho phép cuộn ngang gọn trong bảng chứ **không để tràn cả trang web**), Trang Checkout và Trang OMS.
   - Kiểm tra tốc độ tải trang (`Network` / `Lighthouse`) đảm bảo **< 3 giây (`NFR-01`)** (nén ảnh banner dưới 200KB dạng `.webp` nếu ảnh nặng).
2. Chụp ảnh màn hình giao diện thực tế (Desktop + Mobile + Consent Banner) gửi cho Role 2 và đưa vào Báo cáo.

### Bước 5: Viết Báo cáo Word Nháp & Đẩy code lên GitHub (Sprint 4 | Tuần 10–12)
1. Viết các mục `[Role 3 viết]` vào **`Nháp Role 3 - Họ Tên.docx`**:
   - **Mục 3.6:** Đặc tả `UC-08` + Activity + Sequence Diagram.
   - **Mục 4.3:** User Flow (Sitemap) + 6 màn hình Mockup Figma (kèm chú thích các nút/trạng thái).
   - **Mục 5.2.1 & 5.2.3:** Ảnh chụp giao diện Website chạy thực tế, Bảng Compare Specs, Consent Banner NĐ 13/2023 và Thanh OMS Stepper.
2. Lưu CSS/JS/Template lên đúng nhánh **`role3-ui-frontend`** trên GitHub (không đụng file `includes/` của Role 4):
   ```bash
   git checkout role3-ui-frontend
   git fetch origin
   git merge origin/main
   git add templates/ assets/
   git commit -m "[Role 3][UC-08] hoan thien UI Compare, Consent ND13 va OMS stepper"
   git push origin role3-ui-frontend
   ```

---

## 4. CHECKLIST 6 MÀN HÌNH FIGMA & MẪU CHỮ CONSENT NĐ 13/2023 (COPY DÙNG NGAY)

### 4.1. Danh sách 6 màn hình Figma bắt buộc

| STT | Tên Frame chuẩn | Nội dung bắt buộc phải có trên hình |
| :-: | :--- | :--- |
| **1** | `[UC-01] Home_Category_Filter` | Thanh tìm kiếm, Banner tựu trường ĐHQG, Bộ lọc bên trái (Nhu cầu, CPU, RAM, GPU, Giá), Card máy có nút *"So sánh"* |
| **2** | `[UC-02] Compare_Specs_3Devices` | Bảng đối chiếu 3 Laptop cạnh nhau: Ảnh, Giá, **Tiền trả góp SV/tháng**, CPU, RAM, GPU, Màn hình, Trọng lượng |
| **3** | `[UC-10] ProductDetail_InstallmentWidget` | Thông số chi tiết + Khung chọn Trả trước (`20%/30%/50%`) & Kỳ hạn (`3/6/12 tháng`) hiển thị ngay số tiền góp/tháng |
| **4** | `[UC-08] Cart_Checkout_ConsentND13` | Áp mã `BACKTOSCHOOL`, chọn Trả góp SV, **hộp thoại Consent NĐ 13/2023** có checkbox đồng ý + ô upload ảnh CCCD/Thẻ SV |
| **5** | `[UC-08] OMS_OrderTracking` | Thanh tiến trình Stepper: Đã nộp → Duyệt L1 (Giấy tờ) → Duyệt L2 (`.edu.vn`) → Gán `S/N` → Đang giao + nút Yêu cầu bảo hành |
| **6** | `[UC-11] Admin_Review_Serial` | Bảng quản trị cho Reviewer bấm *Duyệt Lớp 1 / Lớp 2* và ô nhập `Serial Number` xuất kho / nút *Xuất Hóa đơn PDF* |

### 4.2. Mẫu câu chữ chuẩn cho Consent Banner Nghị định 13/2023/NĐ-CP (Gắn lên Form Trả góp)

> **Thông báo Xử lý Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP):**  
> *"Tôi đồng ý cho GearForge thu thập, mã hóa (AES-256) và xử lý hình ảnh CCCD, Thẻ sinh viên cùng Email `.edu.vn` nhằm mục đích duy nhất là thẩm định hồ sơ trả góp sinh viên 2 lớp. Dữ liệu được bảo mật phân quyền nghiêm ngặt và tự động hủy sau 30 ngày nếu hồ sơ bị từ chối hoặc sau khi hoàn tất nghĩa vụ theo quy định pháp luật."*  
> `[ ] Tôi đã đọc, hiểu rõ và đồng ý với Điều khoản bảo vệ dữ liệu cá nhân nêu trên (Bắt buộc).`

---

## 5. CHECKLIST TỰ KIỂM TRA TRƯỚC KHI BÀN GIAO (ROLE 3 DONE)

- [ ] Có đủ link Figma và ảnh export **6 màn hình Desktop + Mobile** nét cao kèm User Flow cho Mục 4.3.
- [ ] Giao diện Website chạy mượt trên Desktop (≥ 1280px) và **Mobile 375px** không tràn ngang (`NFR-04`).
- [ ] Có hộp thoại **Consent Banner NĐ 13/2023** khóa nút Gửi nếu chưa tick chọn.
- [ ] Đã tạo coupon `BACKTOSCHOOL` và kiểm thử hiển thị bảng Compare Specs + OMS Stepper khớp 100% tên trạng thái trong `Từ điển thuật ngữ`.
- [ ] Hoàn thiện `Nháp Role 3 - Họ Tên.docx` (Mục 3.6, 4.3, 5.2.1, 5.2.3) và push lên nhánh `role3-ui-frontend`.
