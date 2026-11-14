# TỪ ĐIỂN THUẬT NGỮ & CHUẨN DỮ LIỆU DÙNG CHUNG (SINGLE SOURCE OF TRUTH)

> **Quy tắc bắt buộc:** Cả 4 thành viên khi vẽ biểu đồ UML, thiết kế CSDL, tạo Wireframe Figma hoặc viết code Plugin cho **GearForge** đều phải dùng **chính xác 100%** tên gọi, mã ID, trạng thái và tên bảng quy định trong tài liệu này để đảm bảo ghép bài hoàn hảo.

---

## 1. DANH SÁCH TÁC NHÂN CHUẨN (ACTORS)

| Actor ID (Code/UML) | Tên Tiếng Việt trên Báo cáo | Mô tả vai trò trong hệ thống |
| :--- | :--- | :--- |
| `Guest` | Khách vãng lai | Người dùng chưa đăng nhập: xem trang chủ, tìm kiếm, lọc thông số, so sánh cấu hình, xem ước tính trả góp. |
| `StudentCustomer` | Khách hàng sinh viên | Khách hàng đã đăng ký/đăng nhập (có thể xác thực email `.edu.vn`): đặt hàng, nộp hồ sơ trả góp, theo dõi OMS, đánh giá, yêu cầu bảo hành. |
| `StoreAdmin` | Quản trị viên cửa hàng | Quản lý danh mục ≥ 500 SP, quản lý đơn hàng, gán Serial Number (S/N) khi xuất kho, xuất Hóa đơn PDF, phân quyền hệ thống, cấu hình Blacklist. |
| `InstallmentReviewer` | Chuyên viên duyệt trả góp | Nhân sự được phân quyền RBAC chuyên trách xem hồ sơ định danh (CCCD/Thẻ SV đã giải mã) và thực hiện **duyệt 2 lớp** cho hồ sơ trả góp sinh viên. |
| `PaymentGateway` | Cổng thanh toán / BNPL Sandbox | Hệ thống đối tác bên ngoài (**VNPay / MoMo / Fundiin Sandbox**) xử lý thanh toán trực tuyến và xác thực 3D-Secure. |
| `TVANService` | Hệ thống Hóa đơn điện tử (T-VAN) | Hệ thống truyền nhận Hóa đơn điện tử (Out-of-scope kết nối real-time; trong MVP cung cấp cấu trúc dữ liệu chuẩn để xuất Hóa đơn PDF mẫu). |

---

## 2. DANH MỤC YÊU CẦU CHỨC NĂNG (FR) & PHI CHỨC NĂNG (NFR)

### 2.1. Yêu cầu Chức năng (Functional Requirements – FR)

| ID | Tên yêu cầu (English) | Mô tả chi tiết (Tiếng Việt) | Gói Role phụ trách |
| :--- | :--- | :--- | :---: |
| **FR-01** | Catalog & Technical Filtering | Quản lý ≥ 500 sản phẩm (Laptop, PC, Phụ kiện); hỗ trợ tìm kiếm và lọc đa tiêu chí theo Nhu cầu, CPU, RAM, GPU, Khoảng giá. | Role 1 (PO) |
| **FR-02** | Product Specs Comparison | Cho phép chọn 2–3 mẫu Laptop/PC đặt cạnh nhau để đối chiếu trực quan từng thông số kỹ thuật, giá bán và mức góp dự kiến. | Role 1 (PO) |
| **FR-03** | Legal & Policy Pages | Công khai Chính sách bảo hành, Đổi trả, Điều khoản sử dụng, Bảo mật NĐ 13/2023 và thông tin định danh Website TMĐT theo BCT. | Role 1 (PO) |
| **FR-04** | Student Authentication & `.edu.vn` | Đăng ký, đăng nhập, khôi phục mật khẩu và hỗ trợ xác thực email sinh viên (`.edu.vn`) để mở khóa gói trả góp sinh viên. | Role 2 (SM) |
| **FR-05** | RBAC, Data Encryption & Fraud Guard | Phân quyền chặt chẽ (`StoreAdmin` vs `InstallmentReviewer`), mã hóa AES-256 ảnh CCCD/Thẻ SV, áp dụng Rate Limiting & Blacklist chống spam/hồ sơ giả. | Role 2 (SM) |
| **FR-06** | Cart, Student Promo & Checkout | Quản lý giỏ hàng, áp mã khuyến mãi sinh viên, hỗ trợ Checkout tiêu chuẩn (COD/VNPay/MoMo) hoặc Checkout trả góp kèm **Consent Banner NĐ 13/2023**. | Role 3 (Dev 1) |
| **FR-07** | Order Management & Warranty (OMS) | Theo dõi trạng thái đơn hàng và tiến độ duyệt hồ sơ trả góp trực tuyến; gửi yêu cầu bảo hành/đổi trả đối chiếu theo S/N. | Role 3 (Dev 1) |
| **FR-08** | Student Installment Calculator & Application | Tính tự động tiền trả trước (20–50%), tiền góp mỗi tháng theo kỳ hạn 3–6–12 tháng; cho phép tải lên ảnh CCCD & Thẻ SV kèm điều khoản đồng ý. | Role 4 (Dev 2) |
| **FR-09** | 2-Layer Review & Sandbox Payment | Chuyên viên duyệt hồ sơ qua 2 lớp (Lớp 1: giấy tờ; Lớp 2: xác nhận SĐT/Email `.edu.vn`); tích hợp VNPay/MoMo/Fundiin Sandbox (3D-Secure). | Role 4 (Dev 2) |
| **FR-10** | Serial Number (S/N) & T-VAN PDF Invoice | Bắt buộc gắn mã Serial Number / Service Tag khi xuất kho để chống đánh tráo; xuất Hóa đơn PDF mẫu đúng chuẩn dữ liệu VAT (8%–10%) cho T-VAN. | Role 4 (Dev 2) |

### 2.2. Yêu cầu Phi chức năng (Non-functional Requirements – NFR)

| ID | Hạng mục | Tiêu chí đo lường cụ thể | Người kiểm chứng |
| :--- | :--- | :--- | :---: |
| **NFR-01** | **Performance (Hiệu năng)** | Thời gian tải trang chủ, danh mục và phản hồi bộ lọc ≥ 500 sản phẩm dưới **3 giây**. | Dev 1 + SM |
| **NFR-02** | **Security & Privacy (Bảo mật)** | Tuân thủ **Nghị định 13/2023/NĐ-CP**: có Consent Banner rõ ràng; ảnh CCCD/Thẻ SV mã hóa AES-256 & chặn truy cập URL trực tiếp; mật khẩu băm Bcrypt/Argon2; HTTPS/SSL. | SM + Dev 2 |
| **NFR-03** | **Anti-Fraud (Chống gian lận)** | Hỗ trợ **3D-Secure** trên cổng thanh toán; **Rate Limiting** giới hạn tần suất gửi đơn/hồ sơ; lưu vết **Serial Number** chống tráo linh kiện. | SM + Dev 2 |
| **NFR-04** | **Usability & Responsive (Khả dụng)** | Giao diện hiển thị chuẩn trên Desktop (≥ 1280px) và Mobile (375px), thao tác so sánh & tính trả góp trực quan không quá 3 cú nhấp chuột. | Dev 1 + PO |
| **NFR-05** | **Maintainability (Khả năng bảo trì)** | Tuân thủ kiến trúc **Layered + Microkernel (Plugin-based)**: tách biệt Custom Plugin `gearforge-core` khỏi lõi WooCommerce để dễ nâng cấp. | SM + Dev 2 |
| **NFR-06** | **Availability (Sẵn sàng)** | Hệ thống vận hành ổn định 24/7 trong giai đoạn Demo/Thử nghiệm (uptime ≥ 99%), có sao lưu CSDL định kỳ. | SM |

---

## 3. PHÂN BỔ 12 USE CASES (`UC-01`..`UC-12`) THEO 4 VAI TRÒ

> **Quy định EC312:** Mỗi sinh viên chịu trách nhiệm phân tích, đặc tả và vẽ Activity/Sequence cho một phân hệ riêng. Trong mỗi gói bên dưới, Use Case đánh dấu **★ (Trọng tâm)** là Use Case bắt buộc viết **Bảng đặc tả Use Case đầy đủ + Activity + Sequence Diagram**.

| Mã UC | Tên Use Case | Tác nhân tham gia | Liên kết FR | Vai trò phụ trách |
| :--- | :--- | :--- | :---: | :---: |
| **UC-01** | Tìm kiếm & Lọc sản phẩm theo thông số | `Guest`, `StudentCustomer` | `FR-01` | **Role 1 (PO/BA)** |
| **UC-02 ★** | **So sánh cấu hình 2–3 Laptop/PC (Compare Specs)** | `Guest`, `StudentCustomer` | `FR-02` | **Role 1 (PO/BA)** |
| **UC-03** | Quản lý danh mục & Import ≥ 500 sản phẩm | `StoreAdmin` | `FR-01`, `FR-03` | **Role 1 (PO/BA)** |
| **UC-04** | Đăng ký, Đăng nhập & Xác thực Email `.edu.vn` | `Guest`, `StudentCustomer` | `FR-04` | **Role 2 (SM/QA)** |
| **UC-05 ★** | **Phân quyền RBAC, Mã hóa NĐ 13/2023 & Chống gian lận (Rate Limit/Blacklist)** | `StoreAdmin`, `InstallmentReviewer` | `FR-05` | **Role 2 (SM/QA)** |
| **UC-06** | Đánh giá sản phẩm & Kiểm duyệt bình luận | `StudentCustomer`, `StoreAdmin` | `FR-01` | **Role 2 (SM/QA)** |
| **UC-07** | Quản lý Giỏ hàng & Áp mã khuyến mãi sinh viên | `StudentCustomer` | `FR-06` | **Role 3 (Dev 1)** |
| **UC-08 ★** | **Đặt hàng trực tuyến (Checkout) & Theo dõi đơn hàng (OMS)** | `StudentCustomer`, `PaymentGateway` | `FR-06`, `FR-07` | **Role 3 (Dev 1)** |
| **UC-09** | Yêu cầu bảo hành / Đổi trả đối chiếu Serial Number | `StudentCustomer`, `StoreAdmin` | `FR-07` | **Role 3 (Dev 1)** |
| **UC-10 ★** | **Tính toán gói trả góp & Nộp hồ sơ trả góp sinh viên (3–6–12 tháng)** | `StudentCustomer` | `FR-08` | **Role 4 (Dev 2)** |
| **UC-11** | Xét duyệt hồ sơ trả góp 2 lớp & Thanh toán trực tuyến Sandbox (3D-Secure) | `InstallmentReviewer`, `StudentCustomer`, `PaymentGateway` | `FR-09` | **Role 4 (Dev 2)** |
| **UC-12** | Xuất kho gắn Serial Number (S/N) & Xuất Hóa đơn PDF chuẩn T-VAN | `StoreAdmin`, `StudentCustomer`, `TVANService` | `FR-10` | **Role 4 (Dev 2)** |

---

## 4. CHUẨN HÓA TRẠNG THÁI (STATE MACHINE CONSTANTS)

### 4.1. Vòng đời Đơn hàng (`OrderStatus`)
- `CREATED`: Đơn hàng vừa khởi tạo trong phiên Checkout.
- `PENDING_PAYMENT`: Chờ thanh toán trực tuyến qua cổng VNPay/MoMo/Fundiin (đơn thanh toán thẳng).
- `PENDING_INSTALLMENT_APPROVAL`: Chờ xét duyệt hồ sơ trả góp sinh viên 2 lớp (đơn trả góp nội bộ).
- `PROCESSING`: Đã xác nhận thanh toán (hoặc đã duyệt trả góp + đóng tiền trả trước), đang chuẩn bị hàng.
- `SERIAL_ASSIGNED`: Kho đã gán mã Serial Number / Service Tag (`S/N`) của máy vào đơn hàng.
- `SHIPPING`: Đã bàn giao đơn vị vận chuyển / đang giao cho sinh viên.
- `DELIVERED`: Đã giao thành công, bắt đầu tính thời hạn bảo hành theo S/N.
- `COMPLETED`: Hoàn tất đối soát và xuất Hóa đơn PDF chuẩn T-VAN.
- *Trạng thái kết thúc ngoại lệ:* `CANCELLED` (Hủy trước khi giao), `REFUNDED` (Hoàn tiền / Đổi trả hợp lệ).

### 4.2. Vòng đời Hồ sơ Trả góp Sinh viên (`InstallmentApplicationStatus`)
- `DRAFT`: Khách hàng đang tính toán thử kỳ hạn trên widget (chưa nộp).
- `SUBMITTED`: Đã đồng ý Consent NĐ 13/2023 và tải lên CCCD + Thẻ SV.
- `L1_DOCS_VERIFIED`: **Duyệt Lớp 1** – Chuyên viên đã đối chiếu ảnh CCCD & Thẻ SV hợp lệ, rõ nét.
- `L2_EDU_CONFIRMED`: **Duyệt Lớp 2** – Đã xác thực qua SĐT chính chủ và Email `.edu.vn` của sinh viên.
- `APPROVED_WAITING_DOWNPAYMENT`: Hồ sơ đạt, chờ sinh viên thanh toán khoản trả trước qua Sandbox.
- `ACTIVE_INSTALLMENT`: Đã nhận tiền trả trước, chuyển sang theo dõi lịch trả góp hàng tháng (3–6–12 tháng).
- `CLOSED`: Đã tất toán đủ toàn bộ kỳ hạn.
- *Trạng thái kết thúc ngoại lệ:* `REJECTED` (Không đạt tiêu chuẩn duyệt), `BLACKLISTED` (Phát hiện hồ sơ giả mạo/gian lận, khóa IP/CCCD).

---

## 5. CHUẨN HÓA TÊN LỚP (CLASS NAMES) & BẢNG CSDL (MYSQL SCHEMA)

### 5.1. Tên Lớp chuẩn trong Class Diagram & Plugin PHP
- **Domain Entities / Models:** `User`, `Product`, `ProductSpecAttribute`, `Cart`, `CartItem`, `Order`, `OrderItem`, `InstallmentPlan`, `InstallmentApplication`, `OrderSerial`, `PaymentTransaction`, `FraudBlacklist`, `InvoiceDocument`.
- **Services / Controllers:** `CatalogFilterService`, `ComparisonService`, `AuthSecurityService`, `CartCheckoutService`, `InstallmentCalculatorService`, `InstallmentReviewService`, `PaymentGatewayAdapter`, `SerialNumberService`, `PdfInvoiceGenerator`, `FraudGuardMiddleware`.

### 5.2. Danh sách Bảng Cơ sở dữ liệu (WooCommerce Core + GearForge Extensions)

| Nhóm bảng | Tên bảng MySQL | Khóa chính (PK) & Khóa ngoại (FK) | Mục đích lưu trữ |
| :--- | :--- | :--- | :--- |
| **Core WP/WC** | `wp_users` | `ID (PK)` | Thông tin tài khoản người dùng, vai trò RBAC (`user_role`), cờ `edu_verified` (meta). |
| **Core WP/WC** | `wp_posts` *(post_type='product')* | `ID (PK)` | Sản phẩm Laptop, PC, Phụ kiện (≥ 500 bản ghi), liên kết thuộc tính qua `wp_term_relationships`. |
| **Core WP/WC** | `wp_wc_orders` | `id (PK)`, `customer_id (FK -> wp_users.ID)` | Đơn hàng tổng, tổng tiền, phương thức thanh toán, `status` theo `OrderStatus`. |
| **Core WP/WC** | `wp_wc_order_items` | `order_item_id (PK)`, `order_id (FK -> wp_wc_orders.id)` | Chi tiết từng sản phẩm và số lượng trong đơn hàng. |
| **Extension 1** | `wp_gf_installment_plans` | `plan_id (PK)` | Cấu hình các gói kỳ hạn trả góp (3, 6, 12 tháng), tỷ lệ trả trước tối thiểu, lãi suất/tháng, phí hồ sơ. |
| **Extension 2** | `wp_gf_installment_applications` | `app_id (PK)`, `order_id (FK -> wp_wc_orders.id)`, `user_id (FK -> wp_users.ID)`, `plan_id (FK -> wp_gf_installment_plans.plan_id)`, `reviewer_id (FK -> wp_users.ID)` | Hồ sơ trả góp sinh viên: mã SV, email `.edu.vn`, hash CCCD, đường dẫn file mã hóa AES-256 (`cccd_encrypted_path`, `student_card_encrypted_path`), cờ `consent_nd13_accepted`, trạng thái duyệt 2 lớp (`l1_verified_at`, `l2_verified_at`, `status`), ghi chú từ chối. |
| **Extension 3** | `wp_gf_order_serials` | `serial_id (PK)`, `order_id (FK -> wp_wc_orders.id)`, `order_item_id (FK -> wp_wc_order_items.order_item_id)`, `product_id (FK -> wp_posts.ID)` | Lưu mã `serial_number` / `service_tag` duy nhất (UNIQUE) cho từng máy xuất kho, ngày kích hoạt bảo hành, trạng thái bảo hành. |
| **Extension 4** | `wp_gf_fraud_blacklist` | `blacklist_id (PK)`, `created_by (FK -> wp_users.ID)` | Lưu dấu vết chống gian lận (`target_type`: IP / USER / PHONE / CCCD_HASH, `target_value`, `reason`, `blocked_until`). |
