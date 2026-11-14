# KẾ HOẠCH & KỊCH BẢN KIỂM THỬ HỆ THỐNG (TEST PLAN SKELETON)

> **Người chủ trì:** Role 2 (Scrum Master / Security & QA Lead) phối hợp cùng Role 1, 3, 4 thực hiện kiểm thử trước khi quay Demo và nộp báo cáo Chương 5.3.

---

## 1. PHẠM VI & TIÊU CHÍ NGHIỆM THU KIỂM THỬ

- **Môi trường test:** Docker local (`localhost:8080`) hoặc Hosting/VPS có HTTPS.
- **Dữ liệu nền:** Đã import đủ ≥ 500 sản phẩm, cấu hình sẵn 3 gói trả góp (3, 6, 12 tháng), tạo sẵn 3 tài khoản test (`StudentCustomer`, `InstallmentReviewer`, `StoreAdmin`).
- **Tiêu chí đạt (Pass Criteria):** 100% test case mức `Critical` (Bảo mật NĐ 13/2023, Đặt hàng, Duyệt trả góp 2 lớp, Thanh toán Sandbox, Gắn S/N) đều phải **PASS**.

---

## 2. DANH SÁCH TEST CASES TRỌNG TÂM (`TC-01`..`TC-16`)

### Nhóm A: Danh mục, Bộ lọc & So sánh cấu hình *(Liên kết UC-01, UC-02, UC-03)*

| Mã TC | Kịch bản kiểm thử | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Kiểm tra số lượng & thuộc tính sản phẩm | Truy cập Admin Products và trang Shop | Có ≥ 500 sản phẩm hiển thị đủ giá, ảnh, thuộc tính CPU/RAM/GPU/Nhu cầu | `[ ]` |
| **TC-02** | Lọc đa tiêu chí đồng thời | Chọn Nhu cầu `Gaming` + RAM `16GB` + Giá `15-25tr` | Chỉ hiển thị đúng các máy thỏa cả 3 điều kiện; thời gian phản hồi `< 3s` (`NFR-01`) | `[ ]` |
| **TC-03** | So sánh 2–3 Laptop (Compare Specs) | Bấm "So sánh" trên 3 mẫu Laptop rồi mở bảng so sánh | Hiển thị đủ 3 cột đối chiếu thông số và số tiền góp dự kiến/tháng | `[ ]` |
| **TC-04** | Giới hạn vượt quá 3 máy so sánh | Chọn máy thứ 4 vào khay so sánh | Hệ thống chặn và thông báo tối đa 3 sản phẩm; không vỡ UI | `[ ]` |

### Nhóm B: Bảo mật NĐ 13/2023, RBAC & Chống gian lận *(Liên kết UC-04, UC-05)*

| Mã TC | Kịch bản kiểm thử | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-05** | Kiểm tra Consent Banner NĐ 13/2023 | Vào form nộp hồ sơ trả góp, bỏ trống checkbox Consent và bấm Nộp | Hệ thống chặn không cho gửi, yêu cầu đồng ý điều khoản xử lý dữ liệu cá nhân | `[ ]` |
| **TC-06** | Chặn truy cập URL trực tiếp tệp CCCD | Copy đường dẫn file sau khi upload và mở trên trình duyệt ẩn danh | Không thể truy cập trực tiếp (tệp nằm ngoài webroot và đã mã hóa AES-256) | `[ ]` |
| **TC-07** | Kiểm tra phân quyền RBAC | Đăng nhập bằng tài khoản nhân viên thường (`OrderStaff`), truy cập trang hồ sơ CCCD | Bị từ chối (`403 Forbidden`); chỉ `InstallmentReviewer` hoặc `StoreAdmin` mới xem được | `[ ]` |
| **TC-08** | Kiểm tra Rate Limiting & Blacklist | Gửi liên tiếp vượt ngưỡng hồ sơ trả góp hoặc dùng SĐT/IP trong `wp_gf_fraud_blacklist` | Hệ thống chặn (`429/403`) và hiển thị cảnh báo tài khoản/IP bị giới hạn | `[ ]` |

### Nhóm C: Giỏ hàng, Checkout & Theo dõi đơn hàng OMS *(Liên kết UC-07, UC-08, UC-09)*

| Mã TC | Kịch bản kiểm thử | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-09** | Giỏ hàng & Mã giảm giá sinh viên | Thêm Laptop vào giỏ, nhập coupon `BACKTOSCHOOL` | Tổng tiền tự động trừ đúng mức giảm; mã hết hạn báo lỗi rõ ràng | `[ ]` |
| **TC-10** | Responsive Giao diện Mobile (375px) | Mở Trang chủ, Bộ lọc, Compare Specs, Checkout bằng DevTools Mobile 375px | Layout gọn gàng, không tràn ngang, nút bấm thao tác dễ dàng (`NFR-04`) | `[ ]` |
| **TC-11** | Theo dõi tiến độ đơn hàng (OMS) | Mở mục Đơn hàng của tôi kiểm tra đơn vừa đặt | Hiển thị đúng trạng thái theo `OrderStatus` và tiến độ duyệt hồ sơ 2 lớp | `[ ]` |

### Nhóm D: Trả góp 2 lớp, Sandbox Payment, S/N & Hóa đơn PDF *(Liên kết UC-10, UC-11, UC-12)*

| Mã TC | Kịch bản kiểm thử | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-12** | Tính toán công thức trả góp 3–6–12 tháng | Chọn Laptop 20.000.000đ, trả trước 30% (6tr), kỳ hạn 6 tháng | Tính chính xác gốc vay 14tr, lãi suất và số tiền góp mỗi tháng | `[ ]` |
| **TC-13** | Quy trình duyệt hồ sơ 2 lớp tuần tự | Reviewer thực hiện Duyệt Lớp 1 (Ảnh) → Duyệt Lớp 2 (SĐT/Email `.edu.vn`) | Hồ sơ chuyển `SUBMITTED` → `L1_DOCS_VERIFIED` → `APPROVED_WAITING_DOWNPAYMENT` | `[ ]` |
| **TC-14** | Thanh toán Sandbox (3D-Secure) | Thanh toán tiền trả trước qua Sandbox VNPay/MoMo/Fundiin & nhập OTP test | Nhận callback IPN hợp lệ; đơn chuyển sang `PROCESSING` và lưu mã giao dịch | `[ ]` |
| **TC-15** | Ràng buộc gán Serial Number (S/N) | Admin thử chuyển đơn Laptop sang `SHIPPING` khi chưa nhập S/N | Hệ thống chặn và yêu cầu nhập S/N; nhập S/N xong mới cho xuất kho (`SERIAL_ASSIGNED`) | `[ ]` |
| **TC-16** | Xuất Hóa đơn PDF chuẩn T-VAN | Bấm tải Hóa đơn PDF trên đơn hàng hoàn tất | Tải được file `.pdf` hiển thị đúng tên máy, **S/N**, thuế VAT 8%–10% và tổng tiền | `[ ]` |
