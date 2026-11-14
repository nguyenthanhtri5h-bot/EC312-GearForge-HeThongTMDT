# HƯỚNG DẪN CẦM TAY CHỈ VIỆC: ROLE 1 – PRODUCT OWNER (PO) / BUSINESS ANALYST & DỮ LIỆU 500 SẢN PHẨM

> **Tin vui cho bạn:** Vị trí **Role 1 (PO / BA)** làm **0% Code lập trình**. Bạn là người dẫn dắt nghiệp vụ, khảo sát sinh viên, chuẩn hóa dữ liệu **500 sản phẩm** bằng Excel/CSV rồi bấm nút **Import** có sẵn trong WordPress, đồng thời viết Chương 1–2 và đặc tả **UC-02** (So sánh cấu hình).

---

## 1. THÔNG TIN ĐỊNH DANH & PHẠM VI "KHÔNG ĐÈ VIỆC"

| Hạng mục | Quy định dành riêng cho Role 1 |
| :--- | :--- |
| **Chức danh** | Product Owner (PO) / Nhóm trưởng / Business Analyst (BA) |
| **Mức độ Code** | **0% Code** (Chỉ dùng Word, Excel/CSV, Google Forms, Mermaid Live và bấm chuột Admin WordPress) |
| **Nhánh GitHub độc quyền** | `role1-data-catalog` *(Issue `#1`)* — Tuyệt đối không push thẳng vào `main` |
| **File Word nháp trên Drive** | Tự tạo file `Nháp Role 1 - Họ Tên.docx` trong thư mục `3. Khung báo cáo đồ án EC312` |
| **Use Case phụ trách** | `UC-01` (Tìm & Lọc), **`UC-02 ★` (So sánh cấu hình 2–3 máy – Viết đặc tả 6 mục)**, `UC-03` (Import 500 SP) |
| **File / Vùng ĐƯỢC SỬA** | File khảo sát, CSV `products_import.csv`, ảnh Use Case tổng thể & `UC-02`, Chương 1, 2 (2.1–2.4), 3.1, 3.4, 6.1–6.2 |
| **File TUYỆT ĐỐI KHÔNG SỬA** | Không sửa code PHP trả góp (`Role 4`), file giao diện `templates/` & `assets/` (`Role 3`), file `class-gf-rbac.php` (`Role 2`), hay file Word Master khi chưa ghép |

---

## 2. BẢN ĐỒ FILE CẦN MỞ TRÊN GOOGLE DRIVE (CHỈ MỞ ĐÚNG 5 FILE NÀY)

| STT | Tên file trên Drive (`MONCUATHAYTIN`) | Thư mục chứa | Bạn lấy gì từ file này? |
| :-: | :--- | :--- | :--- |
| **1** | `Bản mô tả dự án GearForge.docx` | Thư mục gốc | Điền tên/MSSV thật; lấy số liệu KPIs (150 đơn, AOV 10tr/3.5tr), Persona, In/Out-of-scope, TCO 3 năm bỏ vào Chương 1 & 2. |
| **2** | `Từ điển thuật ngữ và Ma trận Fit-Gap.docx` | `2. Quy ước và Sơ đồ UML` | Copy bảng **Actors**, bảng **FR-01..10**, **NFR-01..06**, **Ma trận Fit-Gap** và **6 mục chuẩn đặc tả UC-02**. |
| **3** | `Khung kiến trúc và Sơ đồ UML Mermaid.docx` | `2. Quy ước và Sơ đồ UML` | Copy code **Biểu đồ Use Case tổng thể (Mục 2)** và **Activity Diagram UC-02 (Mục 6.2)** mang đi xuất ảnh PNG. |
| **4** | `Mẫu bảng hỏi khảo sát sinh viên ĐHQG.docx` | `3. Khung báo cáo đồ án EC312` | Copy nguyên bộ câu hỏi tạo **Google Forms** gửi bạn bè/sinh viên ĐHQG làm khảo sát thực tế. |
| **5** | `Danh mục nguồn tham chiếu và Plugin WordPress.docx` | `0. Tài liệu tham khảo` | Lấy link **Xgear, MemoryZone, GearVN, Phong Vũ** để tham khảo thông số sản phẩm & quy định Bộ Công Thương. |

---

## 3. LỘ TRÌNH 5 BƯỚC LÀM VIỆC TỪ TUẦN 1 ĐẾN TUẦN 12

### Bước 1: Chốt đề tài & Chạy khảo sát sinh viên (Sprint 0–1 | Tuần 1–2)
1. Họp nhóm 15 phút thống nhất ai nhận Role nào, điền đầy đủ **Họ tên + MSSV** của 4 người vào `Bản mô tả dự án GearForge.docx` và bảng đăng ký trong `Hướng dẫn chọn vai trò GearForge.docx`.
2. Mở `Mẫu bảng hỏi khảo sát sinh viên ĐHQG.docx`, tạo thành **Google Form** rồi gửi vào các nhóm KTX / lớp học để thu về tối thiểu **50–100 câu trả lời** (càng nhiều biểu đồ càng đẹp).
3. Xuất các biểu đồ tròn/cột từ phần *Câu trả lời (Responses)* của Google Forms để chèn vào **Mục 2.2** trong báo cáo.

### Bước 2: Vẽ Sơ đồ Use Case Tổng thể & Viết Đặc tả UC-02 (Sprint 1–2 | Tuần 2–5)
1. Mở `Khung kiến trúc và Sơ đồ UML Mermaid.docx` → Copy đoạn mã ở **Mục 2 (Biểu đồ Use Case tổng thể)** và **Mục 6.2 (Activity Diagram UC-02)**.
2. Vào web **`https://mermaid.live`** → dán mã vào bên trái → chỉnh sửa cho gọn đẹp → bấm **Actions → Export PNG** để tải 2 ảnh độ phân giải cao.
   - *Mẹo ăn điểm từ file `exercises_use_case_diagram.md` của thầy Tín:* Hãy dùng Draw.io hoặc PlantUML vẽ rõ thêm nét đứt `<<include>>` (ví dụ `Đặt hàng Checkout` include `Thanh toán`) và `<<extend>>` (ví dụ `Trả góp Sinh viên` extend `Đặt hàng Checkout`).
3. Vẽ thêm **Sequence Diagram cho UC-02** (luồng: `StudentCustomer` → `UI So sánh` → `ComparisonService` → `ProductSpecAttribute` → `InstallmentCalculatorService`) theo đúng tên lớp trong `Từ điển thuật ngữ`.
4. Đặt tên file ảnh đúng chuẩn chống trùng: `UC_TongThe_Role1.png`, `UC02_CompareSpecs_Activity_Role1.png`, `UC02_CompareSpecs_Sequence_Role1.png`.
5. Viết **Bảng đặc tả UC-02 đủ 6 mục chuẩn** (Metadata, Tiền/Hậu điều kiện, Main Flow, Alternative/Exception Flow khi chọn quá 3 máy hoặc khác loại, Quy tắc & Dữ liệu, và BDD `Given / When / Then`).

### Bước 3: Chuẩn bị file Excel/CSV 500 Sản phẩm & Import lên WordPress (Sprint 2–3 | Tuần 5–8)
1. Tham khảo cấu trúc sản phẩm và thông số kỹ thuật từ **Xgear (`xgear.net`)**, **MemoryZone (`memoryzone.com.vn`)**, **GearVN** và **Phong Vũ** (ưu tiên 3 nhóm hàng: Laptop Văn phòng/Gaming/Đồ họa, PC nguyên bộ, Phụ kiện như chuột/bàn phím/tai nghe/RAM/SSD).
2. Lập file Excel/CSV `products_import.csv` đạt **tối thiểu 500 dòng sản phẩm** với bộ cột chuẩn WooCommerce (xem mẫu ở Mục 4 bên dưới). Có thể sinh biến thể hợp lý (ví dụ khác dung lượng RAM 8GB/16GB/32GB, SSD 512GB/1TB) để đạt mốc ≥ 500 bản ghi sạch, không lỗi font tiếng Việt (lưu định dạng **CSV UTF-8**).
3. Đợi **Role 2 (SM)** dựng xong trang Web thử nghiệm, bạn đăng nhập Admin WordPress:
   - Vào **Sản phẩm (Products) → Tất cả sản phẩm → Nhập (Import)** → chọn file `products_import.csv` → bấm chạy tự động (hoặc phối hợp Role 4 đẩy qua WooCommerce REST API `/wp-json/wc/v3/products`).
   - Vào **Gói mở rộng (Plugins) → Thêm mới (Add New)** cài 2 plugin miễn phí bằng chuột (không cần code):
     - **HUSKY (WOOF) Products Filter** *(hoặc Product Filter by WBW)* → kéo thả bật bộ lọc theo `Nhu cầu`, `CPU`, `RAM`, `GPU`, `Khoảng giá`.
     - **Products Compare for WooCommerce (BeRocket)** → bật nút *"So sánh"* ở danh sách máy (rồi báo **Role 3** làm đẹp CSS và **Role 4** móc thêm dòng tiền góp tháng).
4. Tạo 4 trang tĩnh gắn ở Footer WordPress (Copy/biên tập từ mục Chính sách của Xgear/MemoryZone):
   - *Chính sách bảo hành Laptop / PC / Phụ kiện*
   - *Chính sách đổi mới & hoàn trả 7 ngày*
   - *Chính sách bảo mật dữ liệu cá nhân (tuân thủ NĐ 13/2023/NĐ-CP)*
   - *Điều khoản sử dụng & Thông tin định danh Bộ Công Thương (giả lập mẫu)*

### Bước 4: Viết các Chương Báo cáo vào file Word Nháp (Sprint 3–4 | Tuần 8–11)
Mở `3. Khung báo cáo đồ án EC312/Khung báo cáo đồ án EC312 GearForge.docx`, xem các mục gắn thẻ `[Role 1 viết]` rồi gõ vào file riêng **`Nháp Role 1 - Họ Tên.docx`**:
- **Chương 1 (1.1 – 1.4):** Lý do chọn đề tài, Tầm nhìn, Mục tiêu, Persona sinh viên, In-scope / Out-of-scope.
- **Chương 2 (2.1 – 2.5):** KPIs, Kết quả & biểu đồ khảo sát ĐHQG, Bảng FR-01..10, Bảng NFR-01..06, Bảng Fit-Gap (Buy/Customize WooCommerce), Bảng TCO 3 năm (36tr–66tr–100tr), Pháp lý BCT/VAT/NĐ 13/2023.
- **Mục 3.1 & 3.4:** Biểu đồ Use Case tổng thể + Đặc tả `UC-02` + Activity & Sequence `UC-02`.
- **Mục 5.2.1:** Ảnh chụp màn hình thực tế danh mục 500 SP + Bộ lọc + Bảng so sánh 3 máy.
- **Mục 6.1 & 6.2:** Bảng đối sánh GearForge vs Shopee / Shopify / Odoo / Phong Vũ, Đánh giá KPIs & Kết luận.

### Bước 5: Lưu bài lên Drive & Push nhánh GitHub (Cuối mỗi Sprint)
1. Upload `Nháp Role 1 - Họ Tên.docx` lên thư mục `3. Khung báo cáo đồ án EC312` trên Drive và nhắn Role 2 (SM) để ghép vào bản Master.
2. Nếu đẩy file CSV / file nguồn sơ đồ `.mmd` / `.png` lên GitHub, chỉ dùng đúng nhánh **`role1-data-catalog`**:
   ```bash
   git checkout role1-data-catalog
   git fetch origin
   git merge origin/main
   git add products_import.csv docs/
   git commit -m "[Role 1][UC-02] cap nhat CSV 500 san pham va so do UC-02"
   git push origin role1-data-catalog
   ```

---

## 4. MẪU FILE CSV 500 SẢN PHẨM CHUẨN WOOCOMMERCE (DÙNG NGAY)

Khi tạo file Excel xuất ra **CSV UTF-8**, bạn đặt đúng tên tiêu đề các cột sau để WordPress tự nhận diện 100% không cần chỉnh tay từng sản phẩm:

| Tên cột trong Excel/CSV | Ví dụ giá trị mẫu dòng Laptop | Ví dụ giá trị mẫu dòng Phụ kiện |
| :--- | :--- | :--- |
| `SKU` | `GF-LAP-001` | `GF-ACC-351` |
| `Type` | `simple` | `simple` |
| `Name` | `Laptop Gaming ASUS TUF A15 FA506NF` | `Chuột không dây Logitech G304 Lightspeed` |
| `Regular price` | `17990000` | `890000` |
| `Sale price` | `16490000` | `790000` |
| `Categories` | `Laptop > Laptop Gaming` | `Phụ kiện > Chuột Gaming` |
| `Stock` | `15` | `40` |
| `Short description` | `Ryzen 5 7535HS - RAM 16GB - RTX 2050 4GB - 144Hz` | `Cảm biến HERO 12000 DPI - Kết nối Lightspeed 1ms` |
| `Attribute 1 name` / `Attribute 1 value(s)` | `Nhu cầu` / `Gaming, Đồ họa` | `Nhu cầu` / `Gaming, Văn phòng` |
| `Attribute 2 name` / `Attribute 2 value(s)` | `CPU` / `AMD Ryzen 5` | `Thương hiệu` / `Logitech` |
| `Attribute 3 name` / `Attribute 3 value(s)` | `RAM` / `16GB` | `Kết nối` / `Không dây` |
| `Attribute 4 name` / `Attribute 4 value(s)` | `GPU` / `RTX 2050` | *(để trống)* |
| `Attribute 5 name` / `Attribute 5 value(s)` | `Ổ cứng` / `512GB SSD` | *(để trống)* |
| `Attribute 6 name` / `Attribute 6 value(s)` | `Màn hình` / `15.6 inch 144Hz` | *(để trống)* |

*(Mẹo đạt 500 sản phẩm nhanh: Chia khoảng **250 Laptop** + **100 PC nguyên bộ** + **150 Phụ kiện** lấy mẫu từ Xgear, MemoryZone, GearVN).*

---

## 5. CHECKLIST TỰ KIỂM TRA TRƯỚC KHI BÀN GIAO (ROLE 1 DONE)

- [ ] Đã chốt Họ tên + MSSV của 4 người trong `Bản mô tả dự án GearForge.docx`.
- [ ] Có đủ số liệu khảo sát sinh viên ĐHQG (`≥ 50` phản hồi) kèm biểu đồ chèn Chương 2.2.
- [ ] File `products_import.csv` nhập thành công lên WordPress đạt **≥ 500 sản phẩm** và lọc được theo CPU/RAM/GPU/Nhu cầu/Giá.
- [ ] Có đủ 3 ảnh sơ đồ PNG nét cao (`Use Case Tổng thể`, `Activity UC-02`, `Sequence UC-02`) dùng đúng tên trong `Từ điển thuật ngữ`.
- [ ] Đã viết xong `Nháp Role 1 - Họ Tên.docx` (Chương 1, 2, 3.1, 3.4, 5.2.1, 6.1–6.2) và tạo đủ 4 trang Chính sách BCT ở Footer web.
