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

## PHẦN 2: NGUỒN THAM CHIẾU ĐÃ KIỂM ĐỊNH (XGEAR, MEMORYZONE, VIỆT NAM, MỸ, TRUNG QUỐC)

Danh mục dưới đây hợp nhất bộ link từ Google Doc tham khảo của nhóm (`link` – ID `1N5phOZ1J_-odt2d6jFG5ilhG5Vscvr8KqHLFtk7pEQA`), bổ sung chuyên sâu **Xgear** và **MemoryZone**, đồng thời đã **kiểm định HTTP thực tế** để loại bỏ các link 404, link sập, link dính Google Dịch và link bài báo SEO trung gian.

### 2.1. Tiền bán hàng: Danh mục, Bộ lọc Cấu hình, Build PC & Compare Specs (UC-01, UC-02 – Role 1 & Role 3)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu đã kiểm định | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Việt Nam** | **Xgear** | https://xgear.net/ , https://xgear.net/collections/laptop , https://xgear.net/collections/pc , https://xgear.net/collections/gaming-gear | Cấu trúc cây danh mục Laptop Gaming, PC và Gaming Gear rõ phân khúc; cách bố trí banner và thẻ thông số nổi bật cho người chơi game/đồ họa (`Role 1` & `Role 3`). |
| **Việt Nam** | **MemoryZone** | https://memoryzone.com.vn/ , https://memoryzone.com.vn/laptop , https://memoryzone.com.vn/pc-gaming , https://memoryzone.com.vn/build-pc | Luồng danh mục **Laptop – PC – Gaming Gear – Linh kiện** chuẩn hóa và tính năng **Tự Build PC** chọn linh kiện tương thích kèm giá tạm tính (`Role 1` & `Role 3`). |
| **Việt Nam** | **GearVN & Phong Vũ** | https://gearvn.com/ , https://phongvu.vn/c/laptop | Bộ thuộc tính WooCommerce chuẩn VN (CPU, RAM, VGA, SSD, Tần số quét) và cấu trúc danh mục 500+ sản phẩm (`Role 1`). |
| **Việt Nam** | **CellphoneS, TGDĐ & ThinkPro** | https://cellphones.com.vn/laptop.html , https://www.thegioididong.com/laptop , https://thinkpro.vn/ | Bộ lọc theo nhu cầu sinh viên/văn phòng/gaming tại TGDĐ và bảng **Compare Specs** tinh gọn tại CellphoneS/ThinkPro (`Role 3`). |
| **Quốc tế** | **GSMArena Compare** | https://www.gsmarena.com/compare.php3 | Logic giao diện đặt 2–3 thiết bị cạnh nhau, căn hàng theo từng nhóm thông số và highlight chênh lệch (`Role 3`). |
| **Mỹ (US)** | **Apple Buy Mac & Compare** | https://www.apple.com/vn/shop/buy-mac , https://www.apple.com/mac/compare/ | Luồng tùy chọn nâng cấp cấu hình (RAM/SSD) trước khi thêm vào giỏ và bảng đối chiếu tối giản 2–3 máy. |
| **Mỹ (US)** | **PCPartPicker, Newegg & Best Buy** | https://pcpartpicker.com/ , https://www.newegg.com/tools/laptop-finder , https://www.bestbuy.com/ | Bộ lọc Guided Finder nhiều tầng (Newegg), Compare tray (Best Buy) và kiểm tra tương thích linh kiện PC (PCPartPicker; mở trên trình duyệt). |
| **Trung Quốc** | **JD.com & ZOL** | https://www.jd.com/ , https://computer.jd.com/ , https://www.zol.com.cn/ | Bộ lọc đa thuộc tính mật độ thông tin cao (JD) và CSDL so sánh thông số kỹ thuật đối đầu Parameter PK (ZOL). |
| **TQ (Gear)** | **Taobao, 1688, AliExpress & Akko** | https://www.taobao.com/ , https://www.1688.com/ , https://www.aliexpress.com/ , https://akkogear.com.vn/ , https://en.akkogear.com/ | Tham khảo phân loại biến thể Gaming Gear (Switch/Keycap/Layout cho phụ kiện) theo chuẩn hãng nội địa Trung. |

### 2.2. Định danh Sinh viên, Duyệt Hồ sơ & Ưu đãi Giáo dục (UC-04, UC-05, UC-07 – Role 2 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu đã kiểm định | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Việt Nam** | **CellphoneS (S-Student)** | https://cellphones.com.vn/uu-dai-sinh-vien-hoc-sinh , https://cellphones.com.vn/ | Cơ chế định danh 2 lớp bằng Email `.edu.vn` + ảnh Thẻ sinh viên & CCCD gắn chip để mở khóa đặc quyền giảm giá và trả góp sinh viên. |
| **Việt Nam** | **zShop (Duyệt hồ sơ thiết bị)** | https://zshop.vn/cho-thue-may-anh/ | Tham khảo quy trình kiểm duyệt giấy tờ tùy thân (CCCD + Thẻ SV/Hộ khẩu) và xác minh thủ công trước khi bàn giao thiết bị giá trị cao. |
| **Mỹ / VN** | **Apple Education Store** | https://www.apple.com/vn-edu/store , https://www.apple.com/us-edu/store | Tách bạch luồng giá ưu đãi giáo dục và ràng buộc điều kiện đối tượng sinh viên/giảng viên trước khi thanh toán. |
| **Toàn cầu** | **UNiDAYS & SheerID** | https://www.myunidays.com/ , https://corporate.myunidays.com/ , https://www.sheerid.com/ | Xác thực email trường (`.edu` / `.edu.vn`), biểu mẫu tải minh chứng và giới hạn lượt hưởng ưu đãi chống gian lận (`Role 2`). |

### 2.3. Tính toán Bảng Trả góp Động, BNPL & Thanh toán Trực tuyến (UC-10, UC-11 – Role 2 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu đã kiểm định | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Việt Nam** | **Xgear (Hướng dẫn trả góp)** | https://xgear.net/pages/huong-dan-tra-gop | Phân tách rõ điều kiện trả góp qua thẻ tín dụng 0% và trả góp hồ sơ công ty tài chính/BNPL (HD SAISON, Fundiin, MPOS). |
| **Việt Nam** | **MemoryZone (Trả góp)** | https://memoryzone.com.vn/huong-dan-tra-gop | Điều kiện ngưỡng giá trị đơn hàng tối thiểu được trả góp, kỳ hạn hỗ trợ và bảng phí chuyển đổi theo tháng. |
| **Việt Nam** | **TGDĐ, CellphoneS & GearVN** | https://www.thegioididong.com/tra-gop/ , https://cellphones.com.vn/tra-gop , https://gearvn.com/pages/huong-dan-tra-gop | Bảng tính dự toán trả góp tương tác (chọn % trả trước 20%–50%, kỳ hạn 3–6–12 tháng) — mẫu cho endpoint `installment-calc`. |
| **Việt Nam** | **Fundiin & VNPay / MoMo Sandbox** | https://fundiin.vn/ , https://sandbox.vnpayment.vn/apis/ , https://developers.momo.vn/ | Kiến trúc tích hợp ví BNPL (Client ID, Merchant ID, Secret Key, IPN) và chuẩn chữ ký HMAC Callback / OTP giả lập **3D-Secure** (`Role 4`). |
| **Mỹ / TQ** | **Affirm, Klarna & JD Baitiao** | https://docs.affirm.com/ , https://www.affirm.com/ , https://docs.klarna.com/ , https://www.klarna.com/us/payments/ , https://baitiao.jd.com/ | Luồng **Authorize / Capture** theo kỳ hạn (Affirm), widget Checkout chia kỳ (Klarna) và hiển thị tiền trả hàng tháng trên trang SP (JD Baitiao). |

### 2.4. Xử lý Đơn hàng (OMS), Giao nhận KTX, E-Invoice, S/N & Bảo hành/RMA (UC-08, UC-09, UC-12 – Role 3 & Role 4)

| Khu vực | Hệ thống tham chiếu | Link tham chiếu đã kiểm định | Điểm học hỏi áp dụng vào GearForge |
| :--- | :--- | :--- | :--- |
| **Bảo hành VN** | **Xgear, MemoryZone & GearVN** | https://xgear.net/pages/chinh-sach-bao-hanh-doi-moi , https://memoryzone.com.vn/chinh-sach-bao-hanh , https://gearvn.com/pages/bao-hanh | Chính sách bảo hành tách biệt Laptop vs Linh kiện, đổi mới 7 ngày đầu và cổng tra cứu bảo hành riêng (`hotro.sieutoc.com/thong-tin-bao-hanh`). |
| **Bảo hành Hãng** | **Asus, Lenovo, Apple & Dell** | https://www.asus.com/vn/support/ , https://pcsupport.lenovo.com/warrantylookup , https://checkcoverage.apple.com/ , https://www.dell.com/support/home/vi-vn | Mô hình gắn mã **Serial Number / Service Tag** duy nhất cho từng thiết bị xuất kho để khách tự tra cứu hạn bảo hành chính hãng. |
| **Giao nhận KTX** | **GHN, Ahamove & GrabExpress** | https://ghn.vn/ , https://ahamove.com/ , https://www.grab.com/vn/express/ | Tham khảo mô hình giao hỏa tốc nội khu (KTX ĐHQG – Làng ĐH Thủ Đức) và quy chuẩn đồng kiểm niêm phong cho hàng công nghệ giá trị cao. |
| **E-Invoice** | **MISA meInvoice, VNPT & FPT** | https://www.meinvoice.vn/ , https://vnpt-invoice.com.vn/ , https://fptshop.com.vn/ | Chuẩn thông tin xuất hóa đơn VAT điện tử **Nghị định 123/2020/NĐ-CP** (T-VAN, MST, VAT 8%–10%, S/N) áp dụng vào PDF Invoice. |
| **Đổi trả (RMA)** | **Shopee, Tiki & Amazon** | https://help.shopee.vn/portal/4/article/77251-CH%C3%8DNH-S%C3%81CH-TR%E1%BA%A2-H%C3%80NG-V%C3%80-HO%C3%80N-TI%E1%BB%80N , https://tiki.vn/thong-tin/tiki-doi-tra-de-dang-an-tam-mua-sam , https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7 | Quy trình RMA tạo yêu cầu hoàn trả/đổi lỗi, upload video mở hộp đồng kiểm và hoàn tiền/đổi máy theo SLA (`Role 3` & `Role 4`). |

### 2.5. Nhật ký kiểm định & lọc link từ Google Doc (link) và bộ tham chiếu cũ

| Trạng thái kiểm định | Link gốc trong Google Doc / bản cũ | Hành động xử lý chuẩn hóa | Link chuẩn giữ lại trong tài liệu |
| :--- | :--- | :--- | :--- |
| **HTTP 404** | `https://cellphones.com.vn/s-student` | Link cũ không tồn tại; thay bằng URL chương trình sinh viên chính thức đang hoạt động (`HTTP 200`). | https://cellphones.com.vn/uu-dai-sinh-vien-hoc-sinh |
| **HTTP 404** | `https://www.apple.com/shop/goto/buy_mac/mags_b` | Quiz chọn Mac cũ bị 404; giữ URL tùy chọn cấu hình Mac VN đang hoạt động (`HTTP 200`). | https://www.apple.com/vn/shop/buy-mac |
| **HTTP 404** | `https://docs.affirm.com/developers/docs/checkout-overview` & `set-up-direct-api`, `https://docs.klarna.com/palms/web-payments/`, `https://sandbox.vnpayment.vn/devreg/` | Các đường dẫn con cũ trả về 404; chuẩn hóa về trang gốc Developer Portal chính thức (`HTTP 200`). | https://docs.affirm.com/ , https://docs.klarna.com/ , https://www.klarna.com/us/payments/ , https://sandbox.vnpayment.vn/apis/ |
| **Sập / Từ chối kết nối** | `https://kredivo.vn/` | Domain trả về lỗi `Connection Refused` khi kiểm tra; thay thế bằng Fundiin, Xgear và MemoryZone trả góp (`HTTP 200`). | https://fundiin.vn/ , https://xgear.net/pages/huong-dan-tra-gop , https://memoryzone.com.vn/huong-dan-tra-gop |
| **Proxy Google Dịch** | `https://www-amazon-com.translate.goog/gp/help/customer/display.html?...` | Gỡ lớp trung gian `.translate.goog`, đưa về đường dẫn trợ giúp đổi trả chính thức của Amazon. | https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7 |
| **Link ẩn / Redirect** | Mục 5.2 Google Doc hiển thị chữ `shopee.vn` / `tiki.vn` nhưng trỏ sâu vào trang chính sách; Bảo hành Xgear & MemoryZone redirect | Hiển thị tường minh URL đích chính xác để tránh nhầm lẫn khi trích dẫn vào Chương 7 báo cáo. | https://xgear.net/pages/chinh-sach-bao-hanh-doi-moi , https://hotro.sieutoc.com/thong-tin-bao-hanh |
| **Link SEO trung gian** | 4 link bài báo blog cuối Google Doc (`welog.vn`, `ghn.vn/blogs`, `cellphones.com.vn/sforum`, `baothanhhoa.vn`) | Loại bỏ nguồn báo trung gian thiếu tính học thuật; thay bằng website gốc của sàn TMĐT & hãng gear TQ (`HTTP 200`). | https://www.jd.com/ , https://www.taobao.com/ , https://www.1688.com/ , https://www.aliexpress.com/ , https://akkogear.com.vn/ |

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

Nhóm đã lưu đầy đủ các file bài tập chuẩn của Thầy Trình Trọng Tín trong `0. Tài liệu tham khảo\Tài liệu gốc GitHub Thầy Tín\`:
1. [exercises_use_case_diagram.md](<Tài liệu gốc GitHub Thầy Tín/exercises_use_case_diagram.md>): Quy chuẩn dùng `<<include>>` (ví dụ `Register` → `Verify Email`, `Make Payment` → `Payment Gateway`) và `<<extend>>` (ví dụ `Cancel Payment`, `Student Installment` mở rộng `Checkout`).
2. [exercises_class_diagram.md](<Tài liệu gốc GitHub Thầy Tín/exercises_class_diagram.md>): Quy chuẩn phân biệt **Association**, **Aggregation**, **Composition** (đặc biệt cấu trúc `Product – Category – ProductVariant – Attribute` áp dụng thẳng vào mô hình Laptop/PC).
3. [exercises_sequence_diagram.md](<Tài liệu gốc GitHub Thầy Tín/exercises_sequence_diagram.md>): Quy chuẩn luồng thông điệp 4 lớp `Actor → Page/UI → Service → Database` (khớp với sơ đồ trong `2. Quy ước và Sơ đồ UML/Khung kiến trúc và Sơ đồ UML Mermaid.md`).
4. [lab_api_notes.md](<Tài liệu gốc GitHub Thầy Tín/lab_api_notes.md>): Quy chuẩn cấu hình Permalink **Post name**, tạo WooCommerce REST API Key (Read/Write) và test qua Postman tại `/wp-json/wc/v3/products`.

---

## PHẦN 5: TÀI LIỆU THAM KHẢO CHUẨN HỌC THUẬT (BỔ SUNG CHO CHƯƠNG 7 BÁO CÁO)

1. Kenneth C. Laudon, Carol Guercio Traver (2024). *E-Commerce 2024: Business, Technology, Society* (18th Edition). Pearson.
2. Trình Trọng Tín (2025). *Tài liệu Hướng dẫn Đồ án Thiết kế Hệ thống Thương mại điện tử (EC312) – Fit-Gap Analysis, Requirements & WooCommerce API Labs*. Khoa HTTT, Trường ĐH CNTT – ĐHQG TP.HCM (`github.com/trinhtin/ec312`).
3. Chính phủ nước CHXHCN Việt Nam (2023). *Nghị định số 13/2023/NĐ-CP ngày 17/04/2023 về Bảo vệ dữ liệu cá nhân*.
4. Chính phủ nước CHXHCN Việt Nam (2020 & 2021). *Nghị định 123/2020/NĐ-CP về Hóa đơn, chứng từ điện tử* và *Nghị định 85/2021/NĐ-CP sửa đổi Nghị định 52/2013/NĐ-CP về Thương mại điện tử*.
5. Automattic / WooCommerce (2025). *WooCommerce Developer Resources: High-Performance Order Storage (HPOS), REST API v3 & Payment Gateway API*.
6. WordPress.org Plugin Directory (2025). *HUSKY – Products Filter Professional for WooCommerce*, *Products Compare for WooCommerce*, *WooCommerce Serial Numbers*, *PDF Invoices & Packing Slips for WooCommerce*.
