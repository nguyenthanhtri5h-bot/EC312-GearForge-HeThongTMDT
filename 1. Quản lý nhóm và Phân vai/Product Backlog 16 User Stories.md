# PRODUCT BACKLOG – DỰ ÁN GEARFORGE (EC312)

> Tài liệu này áp dụng chuẩn **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable) và khung ưu tiên **MoSCoW** (`Must-have`, `Should-have`, `Could-have`) nhằm phân rã phạm vi MVP của GearForge thành các User Story cụ thể cho 4 vai trò.

---

## 1. TỔNG HỢP EPICS THEO 4 VAI TRÒ

| Mã Epic | Tên Epic | Vai trò sở hữu | Sprint mục tiêu | Liên kết FR |
| :--- | :--- | :--- | :---: | :--- |
| **EPIC-01** | Khám phá sản phẩm, Bộ lọc chuyên sâu & Compare Specs | **Role 1 (PO / BA)** | Sprint 1–3 | `FR-01`, `FR-02`, `FR-03` |
| **EPIC-02** | Định danh sinh viên, Bảo mật NĐ 13/2023 & Chống gian lận | **Role 2 (SM / Architect / QA)** | Sprint 1–4 | `FR-04`, `FR-05`, `FR-10` |
| **EPIC-03** | Trải nghiệm Storefront, Giỏ hàng, Checkout & OMS Tracking | **Role 3 (Dev 1 / UI-UX)** | Sprint 2–4 | `FR-06`, `FR-07` |
| **EPIC-04** | Module Trả góp SV, Duyệt 2 lớp, Sandbox Payment, S/N & PDF | **Role 4 (Dev 2 / Backend-DB)** | Sprint 2–4 | `FR-08`, `FR-09`, `FR-10` |

---

## 2. DANH SÁCH USER STORIES CHI TIẾT (MVP BACKLOG)

### EPIC-01: Khám phá sản phẩm, Bộ lọc & So sánh cấu hình *(Role 1 – PO/BA)*

- **US-01 | Import & Chuẩn hóa danh mục ≥ 500 sản phẩm** *(Must-have | 5 pts | Sprint 3 | `UC-03`)*
  - **User Story:** *Là một Quản trị viên cửa hàng (`StoreAdmin`), tôi muốn import hàng loạt dữ liệu Laptop, PC và Phụ kiện kèm thuộc tính kỹ thuật chuẩn hóa, để cửa hàng có đủ tối thiểu 500 sản phẩm phục vụ sinh viên tìm kiếm.*
  - **Acceptance Criteria (AC):**
    1. Tệp CSV chứa ≥ 500 sản phẩm hợp lệ gồm 3 nhóm: Laptop (Văn phòng, Gaming, Đồ họa), PC nguyên bộ, Phụ kiện công nghệ.
    2. Mỗi Laptop/PC đều có đủ các thuộc tính lọc: `Nhu cầu`, `CPU`, `RAM`, `GPU`, `Ổ cứng`, `Màn hình`, `Khoảng giá`.
    3. Ảnh sản phẩm, giá bán (VNĐ) và tồn kho hiển thị đúng trên Storefront không lỗi font tiếng Việt.

- **US-02 | Tìm kiếm & Bộ lọc thông số kỹ thuật chuyên sâu** *(Must-have | 5 pts | Sprint 3 | `UC-01`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn lọc Laptop/PC theo nhu cầu học tập (CNTT, Kinh tế, Đồ họa) và thông số CPU/RAM/GPU/Khoảng giá, để nhanh chóng tìm được máy phù hợp túi tiền.*
  - **Acceptance Criteria (AC):**
    1. Cho phép kết hợp nhiều bộ lọc đồng thời (ví dụ: Nhu cầu = `Đồ họa` AND RAM ≥ `16GB` AND Giá `15–20 triệu`).
    2. Thời gian phản hồi kết quả lọc < 3 giây (`NFR-01`).
    3. Khi không có sản phẩm khớp, hiển thị thông báo thân thiện kèm nút "Xóa bộ lọc".

- **US-03 | So sánh cấu hình trực quan 2–3 máy (Compare Specs)** *(Must-have | 8 pts | Sprint 3 | `UC-02`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn chọn 2 đến 3 mẫu Laptop/PC đặt cạnh nhau để đối chiếu từng thông số kỹ thuật và giá trả góp dự kiến, để ra quyết định mua chính xác nhất.*
  - **Acceptance Criteria (AC):**
    1. Nút "So sánh" xuất hiện trên thẻ sản phẩm ở trang danh mục và trang chi tiết; giới hạn tối đa 3 sản phẩm cùng loại trong khay so sánh.
    2. Bảng so sánh hiển thị các dòng đối chiếu: Giá bán, Số tiền góp dự kiến/tháng, CPU, RAM, GPU, Màn hình, Trọng lượng, Bảo hành.
    3. Cho phép xóa bớt sản phẩm khỏi bảng so sánh hoặc bấm "Mua ngay / Đăng ký trả góp" trực tiếp từ bảng.

- **US-04 | Chuẩn hóa chính sách pháp lý & Bộ Công Thương trên Storefront** *(Should-have | 2 pts | Sprint 3 | `FR-01`)*
  - **User Story:** *Là một Khách hàng (`Guest`/`StudentCustomer`), tôi muốn đọc rõ Chính sách bảo hành, Đổi trả, Bảo mật dữ liệu cá nhân và thông tin liên hệ ở Footer, để yên tâm mua hàng có giá trị cao.*
  - **Acceptance Criteria (AC):**
    1. Có đủ 4 trang tĩnh công khai ở Footer: Chính sách bảo hành, Chính sách đổi trả, Chính sách bảo mật (theo NĐ 13/2023), Điều khoản sử dụng.
    2. Có khu vực hiển thị biểu tượng/thông tin định danh pháp lý Website TMĐT bán hàng theo quy định BCT.

---

### EPIC-02: Định danh, Bảo mật NĐ 13/2023 & Kiểm soát gian lận *(Role 2 – SM/Architect/QA)*

- **US-05 | Đăng ký & Xác thực tài khoản sinh viên (`.edu.vn`)** *(Must-have | 5 pts | Sprint 3 | `UC-04`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn đăng ký/đăng nhập tài khoản bằng email cá nhân hoặc xác thực thêm email trường đại học (`.edu.vn`), để được hưởng ưu đãi và đủ điều kiện đăng ký trả góp sinh viên.*
  - **Acceptance Criteria (AC):**
    1. Mật khẩu được băm an toàn bằng chuẩn WordPress/Bcrypt, yêu cầu tối thiểu 8 ký tự.
    2. Form đăng ký/hồ sơ cho phép nhập Email sinh viên (`.edu.vn` / `.edu`) và gắn cờ trạng thái đã xác thực email hay chưa.
    3. Hỗ trợ luồng Quên mật khẩu qua email.

- **US-06 | Phân quyền truy cập theo vai trò (RBAC) cho nhân sự nội bộ** *(Must-have | 5 pts | Sprint 3 | `UC-05`)*
  - **User Story:** *Là một Kiến trúc sư hệ thống / Quản trị cấp cao (`StoreAdmin`), tôi muốn tách bạch quyền giữa Quản trị cửa hàng chung và Chuyên viên xét duyệt trả góp (`InstallmentReviewer`), để ngăn ngừa rò rỉ dữ liệu nhạy cảm CCCD/Thẻ sinh viên.*
  - **Acceptance Criteria (AC):**
    1. Nhân viên xử lý đơn hàng thường (`OrderStaff`) **không thể** xem tệp ảnh CCCD/Thẻ sinh viên gốc trong hồ sơ trả góp.
    2. Chỉ tài khoản có vai trò `InstallmentReviewer` hoặc `StoreAdmin` được cấp quyền mới xem được hồ sơ giải mã và thao tác duyệt/từ chối.
    3. Mọi thao tác xem/duyệt/từ chối hồ sơ nhạy cảm đều ghi nhận nhật ký (Audit Log: ai xem, lúc nào).

- **US-07 | Tuân thủ NĐ 13/2023, Rate Limiting & Blacklist chống gian lận** *(Must-have | 8 pts | Sprint 4 | `UC-05`)*
  - **User Story:** *Là một Quản trị bảo mật (`StoreAdmin`), tôi muốn hệ thống chặn các IP/tài khoản spam đơn hàng ảo hoặc tải hồ sơ giả mạo và mã hóa tệp định danh lưu trữ, để bảo vệ hệ thống và tuân thủ Nghị định 13/2023/NĐ-CP.*
  - **Acceptance Criteria (AC):**
    1. Chặn (HTTP 429 / thông báo cooldown) nếu 1 IP/tài khoản gửi quá ngưỡng request nộp hồ sơ trả góp hoặc tạo đơn hàng trong 1 phút.
    2. Tài khoản/SĐT/CCCD/IP nằm trong bảng `wp_gf_fraud_blacklist` bị chặn tạo đơn trả góp mới kèm lý do ghi nhận.
    3. Tệp ảnh CCCD/Thẻ SV tải lên được lưu ngoài thư mục public (hoặc mã hóa AES-256), không thể truy cập trực tiếp bằng URL tĩnh.

- **US-08 | Đánh giá sản phẩm & Kiểm duyệt bình luận** *(Could-have | 3 pts | Sprint 4 | `UC-06`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn xem và viết đánh giá (1–5 sao) kèm nhận xét thực tế sau khi mua máy, để tham khảo trải nghiệm sử dụng thật từ các bạn sinh viên khác.*
  - **Acceptance Criteria (AC):**
    1. Chỉ tài khoản đã mua sản phẩm (`Verified Purchase`) mới được gắn nhãn xác thực khi bình luận.
    2. `StoreAdmin` có thể duyệt hoặc ẩn các bình luận spam/chứa link độc hại.

---

### EPIC-03: Giao diện Storefront, Giỏ hàng, Checkout & OMS *(Role 3 – Dev 1)*

- **US-09 | Giao diện Storefront GearForge & Trang chi tiết sản phẩm** *(Must-have | 8 pts | Sprint 3 | `UC-01`, `UC-02`)*
  - **User Story:** *Là một Khách truy cập (`Guest`), tôi muốn trải nghiệm giao diện website công nghệ hiện đại, hiển thị rõ cấu hình tóm tắt và badge "Hỗ trợ trả góp SV" trên cả điện thoại và máy tính, để dễ dàng tìm hiểu sản phẩm.*
  - **Acceptance Criteria (AC):**
    1. Responsive mượt trên màn hình Desktop (≥ 1280px) và Mobile (375px), không vỡ layout hay tràn ngang.
    2. Trang chi tiết hiển thị đầy đủ ảnh, bảng thông số kỹ thuật chuẩn, giá bán, tồn kho và Widget ước tính trả góp nhanh.

- **US-10 | Giỏ hàng & Áp dụng mã khuyến mãi mùa tựu trường** *(Must-have | 3 pts | Sprint 3 | `UC-07`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn thêm sản phẩm vào giỏ hàng, chỉnh số lượng và nhập mã giảm giá sinh viên (ví dụ `BACKTOSCHOOL`), để thấy ngay tổng tiền sau giảm trước khi thanh toán.*
  - **Acceptance Criteria (AC):**
    1. Cập nhật số lượng, xóa sản phẩm và tính lại tổng tiền tự động.
    2. Kiểm tra điều kiện hợp lệ của coupon (hạn dùng, giá trị đơn tối thiểu) và hiển thị lỗi rõ ràng nếu mã không hợp lệ.

- **US-11 | Luồng Checkout đa phương thức & Consent Banner NĐ 13/2023** *(Must-have | 8 pts | Sprint 3 | `UC-08`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn chọn thanh toán trực tiếp (COD / VNPay / MoMo) hoặc chọn hình thức Trả góp (BNPL Fundiin hoặc Trả góp sinh viên GearForge) kèm xác nhận đồng ý xử lý dữ liệu cá nhân, để hoàn tất đặt hàng minh bạch.*
  - **Acceptance Criteria (AC):**
    1. Nếu chọn Trả góp sinh viên, bắt buộc hiển thị **Consent Banner (NĐ 13/2023/NĐ-CP)** với checkbox đồng ý rõ ràng trước khi cho phép gửi đơn/hồ sơ.
    2. Tạo đơn hàng thành công chuyển sang trạng thái tương ứng (`PENDING_PAYMENT` hoặc `PENDING_INSTALLMENT_APPROVAL`).

- **US-12 | Tra cứu trạng thái đơn hàng & Tiến độ duyệt trả góp (OMS)** *(Must-have | 5 pts | Sprint 4 | `UC-08`, `UC-09`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn theo dõi trực tuyến từng bước xử lý đơn hàng và tiến độ duyệt hồ sơ trả góp (Lớp 1 → Lớp 2 → Đóng gói kèm S/N → Đang giao), để chủ động thời gian nhận máy.*
  - **Acceptance Criteria (AC):**
    1. Trang tài khoản / Tra cứu đơn hàng hiển thị thanh tiến trình (Stepper) khớp với `OrderStatus` và `InstallmentApplicationStatus`.
    2. Cho phép gửi yêu cầu bảo hành/đổi trả theo mã đơn hàng & Serial Number (`UC-09`).

---

### EPIC-04: Module Trả góp SV, Duyệt 2 lớp, Sandbox, S/N & PDF *(Role 4 – Dev 2)*

- **US-13 | Công cụ tính toán & Nộp hồ sơ trả góp sinh viên (3–6–12 tháng)** *(Must-have | 8 pts | Sprint 3 | `UC-10`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn chọn tỷ lệ trả trước (20%, 30%, 50%) và kỳ hạn góp (3, 6, 12 tháng) để xem ngay số tiền góp mỗi tháng, rồi tải lên ảnh CCCD + Thẻ sinh viên ngay trên web.*
  - **Acceptance Criteria (AC):**
    1. Tự động tính chính xác: `Số tiền trả trước`, `Số tiền vay`, `Lãi suất/tháng`, `Tiền góp hàng tháng` theo công thức trong bảng `wp_gf_installment_plans`.
    2. Validate định dạng tệp tải lên (chỉ nhận `.jpg`, `.jpeg`, `.png`, `.pdf`, dung lượng ≤ 5MB) và mã hóa tệp khi lưu trữ.
    3. Lưu bản ghi hồ sơ vào bảng `wp_gf_installment_applications` ở trạng thái `SUBMITTED`.

- **US-14 | Quy trình Admin xét duyệt hồ sơ trả góp 2 lớp** *(Must-have | 8 pts | Sprint 4 | `UC-11`)*
  - **User Story:** *Là một Chuyên viên xét duyệt (`InstallmentReviewer`), tôi muốn kiểm duyệt hồ sơ sinh viên theo 2 lớp (Lớp 1: Đối chiếu ảnh CCCD & Thẻ SV; Lớp 2: Xác nhận SĐT & Email trường `.edu.vn`) trước khi cho phép xuất kho, để tránh rủi ro tín dụng ảo.*
  - **Acceptance Criteria (AC):**
    1. Màn hình quản trị hiển thị danh sách hồ sơ theo bộ lọc trạng thái (`SUBMITTED`, `L1_DOCS_VERIFIED`, `L2_EDU_CONFIRMED`, `REJECTED`).
    2. Bắt buộc ghi nhận xác nhận qua Lớp 1 và Lớp 2 theo tuần tự; nếu từ chối phải nhập lý do (và tùy chọn đẩy vào `wp_gf_fraud_blacklist` nếu phát hiện giả mạo).
    3. Khi duyệt thành công (`APPROVED_WAITING_DOWNPAYMENT`), kích hoạt thông báo để sinh viên thanh toán khoản trả trước.

- **US-15 | Tích hợp Cổng thanh toán Sandbox (VNPay / MoMo / Fundiin)** *(Must-have | 8 pts | Sprint 4 | `UC-11`)*
  - **User Story:** *Là một Sinh viên (`StudentCustomer`), tôi muốn thanh toán toàn bộ đơn hàng hoặc khoản trả trước qua cổng thanh toán Sandbox có xác thực 3D-Secure/OTP giả lập, để giao dịch được ghi nhận tự động trên hệ thống.*
  - **Acceptance Criteria (AC):**
    1. Điều hướng sang trang Sandbox thanh toán thành công và nhận callback/IPN trả về Website.
    2. Xác thực chữ ký callback hợp lệ trước khi chuyển `OrderStatus` sang `PROCESSING` (hoặc `ACTIVE_INSTALLMENT` nếu là tiền cọc trả góp).
    3. Lưu mã giao dịch (`transaction_ref`) vào đơn hàng.

- **US-16 | Quản lý Serial Number (S/N) xuất kho & Xuất Hóa đơn PDF chuẩn T-VAN** *(Should-have | 5 pts | Sprint 4 | `UC-12`)*
  - **User Story:** *Là một Quản trị viên (`StoreAdmin`), tôi muốn nhập mã Serial Number / Service Tag của chiếc Laptop trước khi bấm giao hàng và xuất file Hóa đơn PDF chuẩn thông tin Thuế (VAT 8%–10%), để chống đánh tráo linh kiện khi bảo hành và sẵn sàng kết nối T-VAN.*
  - **Acceptance Criteria (AC):**
    1. Không cho phép chuyển đơn hàng Laptop/PC sang trạng thái `SHIPPING` nếu chưa gán đủ `serial_number` vào bảng `wp_gf_order_serials`.
    2. Sinh viên và Admin có thể tải file **Hóa đơn PDF mẫu** hiển thị đầy đủ: Thông tin người bán/người mua, Mã đơn, Tên hàng, **Serial Number**, Thuế suất VAT (8%–10%), Tổng thanh toán, và Trạng thái thanh toán/trả góp.
