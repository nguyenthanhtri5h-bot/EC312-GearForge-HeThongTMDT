# ĐÁNH GIÁ TÍNH HỢP LÝ & DANH MỤC NGUỒN THAM CHIẾU CHỨC NĂNG WORDPRESS (GEARFORGE – EC312)

> Tài liệu này tổng hợp kết quả rà soát thiết kế hiện tại dưới góc nhìn triển khai **WordPress + WooCommerce**, đồng thời cung cấp bộ **Nguồn tham chiếu thực tế trong & ngoài nước** (Website TMĐT tại Việt Nam, Mỹ, Trung Quốc, Hệ sinh thái Plugin WordPress/WooCommerce, Cổng thanh toán Sandbox & Chuẩn UML/API của Thầy Trình Trọng Tín).

---

## PHẦN 1: ĐÁNH GIÁ TÍNH HỢP LÝ & 4 TINH CHỈNH THỰC CHIẾN CHO WORDPRESS

### 1.1. Đánh giá tổng thể thiết kế hiện tại
- **Về mặt học thuật EC312:** Rất hợp lý, phủ kín 100% Rubric (15% Phân tích + 25% UML/Kiến trúc + 10% UI/UX + 10% CSDL + 20% Demo + 10% Báo cáo/Pháp lý + 10% Sáng tạo).
- **Về tính khả thi với nhóm 4 sinh viên dùng WordPress:** Rất phù hợp nếu tuân thủ đúng tỷ lệ **Buy/Customize (70%–80% Plugin/Core có sẵn, 20%–30% Custom Code)**. Tuy nhiên, nếu nhóm tự code PHP từ đầu cả Bộ lọc AJAX lẫn Tạo file PDF Hóa đơn thì sẽ tốn công không cần thiết và dễ vỡ giao diện.

### 1.2. Bốn tinh chỉnh quan trọng khi triển khai trên WordPress + WooCommerce
1. **Áp dụng chiến lược "Plugin-First + Custom Hook" thay vì tự viết lại tính năng phổ thông:**
   - **Bộ lọc thông số (CPU/RAM/GPU/Giá):** Dùng sẵn **WooCommerce Product Attributes** kết hợp plugin miễn phí **HUSKY (WOOF) Products Filter** hoặc **Product Filter by WBW** trên WordPress.org.
   - **So sánh cấu hình (Compare Specs 2–3 máy):** Dùng nền từ plugin **Products Compare for WooCommerce (BeRocket)** hoặc **Compare Products for WooCommerce (a3rev)**, sau đó dùng **Hook** của `gearforge-core` chèn thêm dòng *"Ước tính trả góp sinh viên/tháng"*.
   - **Hóa đơn PDF:** Dùng plugin **PDF Invoices & Packing Slips for WooCommerce (WP Overnight)** làm khung in PDF ổn định, rồi dùng hook `wpo_wcpdf_after_item_meta` tự động chèn **Serial Number (`S/N`)**, thuế **VAT 8%–10%** (chuẩn schema T-VAN) và **trạng thái Trả góp SV**.
   - **Tập trung code 100% vào lõi khác biệt (`gearforge-core`):** Calculator Trả góp SV (3–6–12 tháng) + Consent Banner NĐ 13/2023 + Upload mã hóa AES-256 vào `/var/www/gf-vault` + Duyệt 2 lớp (`L1 Docs` → `L2 .edu.vn`) + Ràng buộc nhập `S/N` trước khi xuất kho + Rate Limit / Blacklist.
2. **Khai thác WooCommerce REST API (`/wp-json/wc/v3/`) & Postman (theo `lab_api_notes.md` của Thầy Tín):**
   - Dùng chuẩn OAuth 1.0 / Consumer Key & Secret để import tự động ≥ 500 sản phẩm bằng script hoặc demo CRUD sản phẩm trên Postman; bổ sung endpoint custom `/wp-json/gearforge/v1/installment-calc` để minh họa API mở rộng khi bảo vệ đồ án.
3. **Chuẩn hóa 3 quan hệ trong Class Diagram (theo `exercises_class_diagram.md` của Thầy Tín):**
   - Phải chỉ rõ và giải thích được trong báo cáo: **Association** (`Product – Category`, `User – Order`), **Aggregation** (`Category – Subcategory`, `ComparisonSession – Product`), và **Composition** (`Order – OrderItem`, `Product – ProductSpecAttribute`).
4. **Tách bạch 2 luồng Trả góp thực tế tại Việt Nam:**
   - **Luồng A (BNPL bên thứ ba – Fundiin):** Đơn phụ kiện/Laptop giá tầm trung → chuyển sang cổng **Fundiin Sandbox** (eKYC do Fundiin xử lý).
   - **Luồng B (Trả góp Sinh viên GearForge 3–6–12 tháng):** Trả trước 20%–50%, cần ảnh CCCD gắn chip + Thẻ SV / Email `.edu.vn`, duyệt 2 lớp nội bộ → tránh lệ thuộc thẻ tín dụng của sinh viên.

---

## PHẦN 2: NGUỒN THAM CHIẾU TÍNH NĂNG TRONG & NGOÀI NƯỚC (VIỆT NAM, MỸ, TRUNG QUỐC)

Để tránh thiết kế cảm tính, nhóm đối chiếu trực tiếp các nền tảng TMĐT thực tế tại **Việt Nam, Mỹ và Trung Quốc** theo 4 nhóm chức năng cốt lõi của **GearForge**:

### 2.1. Lọc thông số kỹ thuật Laptop/PC & So sánh cấu hình (UC-01, UC-02 – Role 1 & Role 3)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu trực tiếp | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Mỹ (US)** | **Newegg Laptop Finder** | https://www.newegg.com/tools/laptop-finder , https://www.newegg.com/Laptops-Notebooks/SubCategory/ID-32 | Bộ lọc Guided Finder & đa thuộc tính nhiều tầng (CPU, GPU, RAM, SSD, màn hình, ngân sách, mục đích sử dụng). |
| **Mỹ (US)** | **Best Buy Laptops & PC** | https://www.bestbuy.com/site/clp/laptops/pcmcat138500050001/c?id=pcmcat138500050001 , https://www.bestbuy.com/site/electronics/pc-comparisons/pcmcat1554823158010.c?id=pcmcat1554823158010 | Thanh chọn nhanh so sánh (Compare tray) và bố cục bảng so sánh theo phân khúc giá cho sinh viên dễ đối chiếu. |
| **Mỹ (US)** | **Apple Compare Mac & Quiz** | https://www.apple.com/mac/compare/ , https://www.apple.com/shop/goto/buy_mac/mags_b | Bảng **Compare Specs** đặt 2–3 máy cạnh nhau tối giản, làm nổi bật thông số chênh lệch cốt lõi không gây rối mắt. |
| **Mỹ (US)** | **PCPartPicker** | https://pcpartpicker.com/ | Cơ chế lọc sâu thông số phần cứng và kiểm tra tương thích cấu hình (ý tưởng mở rộng cho PC/Phụ kiện). |
| **Trung Quốc** | **JD.com & JD Computers** | https://www.jd.com , https://computer.jd.com | Hệ thống **Faceted Filtering** gắn nhãn tóm tắt CPU/VGA/Tần số quét nổi bật ngay trên thẻ sản phẩm (Product Card). |
| **Trung Quốc** | **ZOL (中关村在线)** | https://www.zol.com.cn | Cơ sở dữ liệu thông số Laptop/PC chuẩn hóa cực chi tiết và chế độ đối đầu thông số kỹ thuật (Parameter PK). |
| **Việt Nam** | **GearVN & Phong Vũ** | https://gearvn.com/ , https://phongvu.vn/ | Cấu trúc cây danh mục Laptop chuẩn thị trường VN (Văn phòng, Gaming, Đồ họa), PC nguyên bộ, bộ thuộc tính WooCommerce (`Role 1`). |
| **Việt Nam** | **ThinkPro** | https://thinkpro.vn/ | Giao diện tối giản, bảng **Compare Specs** gọn sạch giúp sinh viên so sánh nhanh cấu hình trọng tâm (`Role 3`). |

### 2.2. Định danh Sinh viên & Ưu đãi Giáo dục (UC-04, UC-05, UC-07 – Role 2 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu trực tiếp | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Mỹ / VN** | **Apple Education Store** | https://www.apple.com/us-edu/store , https://www.apple.com/vn-edu/store | Tách bạch luồng giá ưu đãi giáo dục và ràng buộc điều kiện đối tượng sinh viên/giảng viên trước khi thanh toán. |
| **Toàn cầu** | **UNiDAYS Verification** | https://www.myunidays.com/ , https://corporate.myunidays.com/ | Quy trình xác thực email trường đại học (`.edu` / `.edu.vn`) và cấp trạng thái *Verified Student* tách khỏi user thường (`Role 2`). |
| **Toàn cầu** | **SheerID** | https://www.sheerid.com/ | Biểu mẫu tải lên giấy tờ chứng minh sinh viên, trạng thái chờ xét duyệt và cơ chế giới hạn lượt hưởng ưu đãi chống gian lận. |
| **Việt Nam** | **CellphoneS (S-Student)** | https://cellphones.com.vn/s-student , https://cellphones.com.vn | Định danh 2 lớp bằng Email `.edu.vn` + ảnh Thẻ sinh viên & CCCD gắn chip để mở khóa đặc quyền giảm giá và trả góp sinh viên. |

### 2.3. Trả góp Sinh viên, BNPL & Thanh toán Trực tuyến (UC-10, UC-11 – Role 2 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu trực tiếp | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Trung Quốc** | **JD Baitiao (京东白条)** | https://baitiao.jd.com | Chọn kỳ hạn trả góp (3–6–12 tháng), hiển thị minh bạch số tiền trả hàng tháng ngay trên trang sản phẩm và luồng duyệt hạn mức. |
| **Mỹ (US)** | **Affirm Checkout Docs** | https://docs.affirm.com/developers/docs/checkout-overview , https://docs.affirm.com/developers/docs/set-up-direct-api | Mô hình Checkout Object trả góp theo tháng, luồng **Authorize / Capture** tách biệt và webhook callback xác nhận giải ngân. |
| **Toàn cầu** | **Klarna Web Payments** | https://docs.klarna.com/palms/web-payments/ | Trải nghiệm widget chia kỳ hạn trả góp trực quan ngay trong trang Checkout. |
| **Việt Nam** | **Thế Giới Di Động (Trả góp)** | https://www.thegioididong.com/tra-gop | Bảng tính dự toán trả góp tương tác (chọn tỷ lệ trả trước 20%–50%, kỳ hạn 3–6–12 tháng) — áp dụng cho endpoint `installment-calc`. |
| **Việt Nam** | **Fundiin (BNPL)** | https://fundiin.vn/ | Kiến trúc tích hợp ví BNPL trên WooCommerce (Merchant ID, Client ID, Secret Key, IPN Notify URL). |
| **Việt Nam** | **VNPay & MoMo Sandbox** | https://sandbox.vnpayment.vn/devreg/ , https://sandbox.vnpayment.vn/apis , https://developers.momo.vn/ | Chuẩn chữ ký HMAC-SHA256/SHA512 cho Callback/IPN và kịch bản test OTP / **3D-Secure** (`Role 4` & `Role 2`). |

### 2.4. Quản lý Đơn hàng (OMS), Serial Number & Tra cứu Bảo hành (UC-08, UC-09, UC-12 – Role 3 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu trực tiếp | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Mỹ / Toàn cầu** | **Dell Service Tag Lookup** | https://www.dell.com/support/home | Mô hình gắn mã **Service Tag / Serial Number (S/N)** duy nhất cho từng máy bán ra để kích hoạt và kiểm tra bảo hành. |
| **Mỹ / Toàn cầu** | **Lenovo Warranty Lookup** | https://pcsupport.lenovo.com/warrantylookup | Giao diện tra cứu thời hạn bảo hành theo S/N và đối soát lịch sử bảo hành thiết bị. |
| **Mỹ / Toàn cầu** | **Apple Check Coverage** | https://checkcoverage.apple.com/ | Form tra cứu 1 bước tối giản nhập S/N để xác nhận tình trạng kích hoạt và hỗ trợ kỹ thuật. |
| **Việt Nam** | **GearVN & Phong Vũ (Kho S/N)** | https://gearvn.com/ , https://phongvu.vn/ | Bắt buộc nhập S/N xuất kho trước khi chuyển sang `SHIPPING`, in S/N lên hóa đơn PDF và theo dõi trạng thái đơn hàng đa bước. |

---

## PHẦN 3: MA TRẬN HỆ SINH THÁI WORDPRESS (PLUGINS CÓ SẴN VS CUSTOM `gearforge-core`)

### 3.1. Bảng phân công: Dùng Plugin WordPress nào vs Tự code phần nào?

| Chức năng (`FR` / `UC`) | Nguồn Plugin WordPress.org / GitHub tham khảo | Phần tùy biến thêm trong `gearforge-core` (Custom GAP) |
| :--- | :--- | :--- |
| **Danh mục, Thuộc tính & Bộ lọc (`FR-01` / `UC-01`, `UC-03`)** | **WooCommerce Core** + **HUSKY (WOOF) Products Filter** hoặc **Product Filter by WBW** *(WordPress.org)* | Script/Postman import ≥ 500 sản phẩm chuẩn hóa qua `/wp-json/wc/v3/products` (có sẵn thuộc tính CPU/RAM/GPU/Nhu cầu). |
| **So sánh cấu hình (`FR-02` / `UC-02 ★`)** | **Products Compare for WooCommerce (BeRocket)** hoặc **Compare Products (a3rev)** *(WordPress.org)* | Hook chèn thêm dòng **"Số tiền trả góp SV dự kiến/tháng"** (tính theo kỳ hạn 6/12 tháng) ngay trong bảng so sánh. |
| **Tài khoản, `.edu.vn`, RBAC & Bảo mật (`FR-04`, `FR-05` / `UC-04`, `UC-05 ★`)** | **WordPress User / Roles Core** + **Limit Login Attempts** | Code `class-gf-rbac.php` (tạo Role `InstallmentReviewer`), xác thực cờ `.edu.vn`, `class-gf-fraud-guard.php` (Rate Limit + `wp_gf_fraud_blacklist`). |
| **Giỏ hàng, Mã giảm giá & Checkout (`FR-06` / `UC-07`, `UC-08 ★`)** | **WooCommerce Cart & Coupons Core** | Hook thêm **Consent Banner NĐ 13/2023** vào trang Checkout khi chọn trả góp; custom trang **OMS Tracking Stepper** hiển thị tiến độ duyệt 2 lớp. |
| **Trả góp SV 3–6–12 tháng & Duyệt 2 lớp (`FR-08`, `FR-09` / `UC-10 ★`, `UC-11`)** | *Không dùng plugin ngoài (100% Custom GAP)* | Code trọn bộ trong `gearforge-core`: Calculator trả trước 20–50%, Upload & **Mã hóa AES-256** vào `/var/www/gf-vault`, Admin duyệt 2 lớp (`L1 Docs` → `L2 .edu.vn`). |
| **Thanh toán Sandbox 3D-Secure (`FR-09` / `UC-11`)** | Tham khảo mã nguồn mở GitHub: `kiennguyen278/woo-vnpay`, `hoanbui-kans/kanbox-momo-payment-gateway`, Plugin chính thức **Fundiin** | Đọc kỹ & kiểm tra bảo mật code tham khảo trước khi cài; tích hợp luồng **thanh toán khoản trả trước** sau khi hồ sơ đạt `APPROVED_WAITING_DOWNPAYMENT`. |
| **Serial Number & Bảo hành (`FR-07`, `FR-10` / `UC-09`, `UC-12`)** | Tham khảo **WooCommerce Serial Numbers (codersantosh)** *(WordPress.org)* | Bảng riêng `wp_gf_order_serials` + hook `woocommerce_order_status_changed` **chặn cứng không cho chuyển `SHIPPING` nếu thiếu `S/N`**. |
| **Hóa đơn PDF chuẩn T-VAN (`FR-10` / `UC-12`)** | **PDF Invoices & Packing Slips for WooCommerce (WP Overnight)** *(WordPress.org)* | Hook `wpo_wcpdf_after_item_meta` in kèm mã **S/N**, **VAT 8%–10%** và **Lịch kỳ hạn trả góp** lên file PDF. |

### 3.2. Các WordPress / WooCommerce Hooks cốt lõi cần nắm
- `register_activation_hook`: Tự động chạy SQL DDL tạo 4 bảng `wp_gf_*` khi bật plugin `gearforge-core`.
- `woocommerce_single_product_summary`: Chèn Widget ước tính trả góp nhanh (3–6–12 tháng) ngay dưới giá bán trên trang chi tiết máy.
- `woocommerce_checkout_process` & `woocommerce_checkout_update_order_meta`: Kiểm tra tick **Consent NĐ 13/2023**, kiểm tra `FraudGuardMiddleware` (Rate Limit & Blacklist) và lưu hồ sơ trả góp.
- `woocommerce_order_status_changed`: Kiểm tra ràng buộc đã gắn đủ `serial_number` cho các món Laptop/PC trước khi cho phép đổi sang `SHIPPING`.
- `rest_api_init`: Mở Custom REST API `/wp-json/gearforge/v1/installment-calc` và `/wp-json/gearforge/v1/oms-status/{order_id}`.
- `wpo_wcpdf_after_item_meta`: Đưa mã Serial Number vào từng dòng sản phẩm trên Hóa đơn PDF.

---

## PHẦN 4: THAM CHIẾU CHUẨN UML & REST API TỪ KHO `trinhtin/ec312`

Nhóm đã lưu đầy đủ các file bài tập chuẩn của Thầy Trình Trọng Tín trong `00_References\`:
1. [exercises_use_case_diagram.md](exercises_use_case_diagram.md): Quy chuẩn dùng `<<include>>` (ví dụ `Register` → `Verify Email`, `Make Payment` → `Payment Gateway`) và `<<extend>>` (ví dụ `Cancel Payment`, `Student Installment` mở rộng `Checkout`).
2. [exercises_class_diagram.md](exercises_class_diagram.md): Quy chuẩn phân biệt **Association**, **Aggregation**, **Composition** (đặc biệt cấu trúc `Product – Category – ProductVariant – Attribute` áp dụng thẳng vào mô hình Laptop/PC).
3. [exercises_sequence_diagram.md](exercises_sequence_diagram.md): Quy chuẩn luồng thông điệp 4 lớp `Actor → Page/UI → Service → Database` (khớp với sơ đồ trong `architecture_and_uml_skeleton.md`).
4. [lab_api_notes.md](lab_api_notes.md): Quy chuẩn cấu hình Permalink **Post name**, tạo WooCommerce REST API Key (Read/Write) và test qua Postman tại `/wp-json/wc/v3/products`.

---

## PHẦN 5: TÀI LIỆU THAM KHẢO CHUẨN HỌC THUẬT (BỔ SUNG CHO CHƯƠNG 7 BÁO CÁO)

1. Kenneth C. Laudon, Carol Guercio Traver (2024). *E-Commerce 2024: Business, Technology, Society* (18th Edition). Pearson.
2. Trình Trọng Tín (2025). *Tài liệu Hướng dẫn Đồ án Thiết kế Hệ thống Thương mại điện tử (EC312) – Fit-Gap Analysis, Requirements & WooCommerce API Labs*. Khoa HTTT, Trường ĐH CNTT – ĐHQG TP.HCM (`github.com/trinhtin/ec312`).
3. Chính phủ nước CHXHCN Việt Nam (2023). *Nghị định số 13/2023/NĐ-CP ngày 17/04/2023 về Bảo vệ dữ liệu cá nhân*.
4. Chính phủ nước CHXHCN Việt Nam (2020 & 2021). *Nghị định 123/2020/NĐ-CP về Hóa đơn, chứng từ điện tử* và *Nghị định 85/2021/NĐ-CP sửa đổi Nghị định 52/2013/NĐ-CP về Thương mại điện tử*.
5. Automattic / WooCommerce (2025). *WooCommerce Developer Resources: High-Performance Order Storage (HPOS), REST API v3 & Payment Gateway API*.
6. WordPress.org Plugin Directory (2025). *HUSKY – Products Filter Professional for WooCommerce*, *Products Compare for WooCommerce*, *WooCommerce Serial Numbers*, *PDF Invoices & Packing Slips for WooCommerce*.
