# BẢN MÔ TẢ DỰ ÁN

**Đề tài:** Xây dựng Hệ thống Thương mại điện tử kinh doanh Laptop, PC và Phụ kiện  
**Thương hiệu (Dự kiến):** GearForge  
**Trường:** Đại học Công nghệ Thông tin (UIT) – ĐHQG TP.HCM  
**Môn học:** Thiết kế Hệ thống Thương mại điện tử (EC312)  
**Giảng viên hướng dẫn:** ThS. Trình Trọng Tín  
**Nhóm thực hiện:** Nhóm 7  

---

## DANH SÁCH THÀNH VIÊN & VAI TRÒ SCRUM (NHÓM 4 NGƯỜI)

> Nhóm vận hành theo mô hình **Scrum Team liên chức năng (Cross-functional)** gồm 3 vai trò chuẩn của Scrum (**Product Owner**, **Scrum Master**, **Developers**). Vì quy mô nhóm gồm 4 thành viên và theo yêu cầu đồ án môn EC312 (*mỗi sinh viên chịu trách nhiệm phân tích – thiết kế tối thiểu 1 chức năng/Use Case riêng*), **Product Owner** và **Scrum Master** đồng thời kiêm nhiệm công việc phân tích, mô hình hóa và triển khai để đảm bảo khối lượng công việc đồng đều (25% / thành viên).

| STT | Họ và tên | MSSV | Vai trò Scrum (Scrum Role) | Chức danh chuyên môn kiêm nhiệm | Nhánh Git | Phân hệ phụ trách chính (EC312 & MVP) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Trịnh Duy Long** | `24521021` | **Product Owner (PO)** | Nhóm trưởng / Business Analyst (BA) | `role1-data-catalog` | Nghiệp vụ tổng thể, Danh mục, Bộ lọc chuyên sâu & So sánh cấu hình (Compare Specs), Dữ liệu ≥ 500 sản phẩm |
| 2 | **Ngô Trọng Đạt** | `24520275` | **Scrum Master (SM)** | Kiến trúc sư hệ thống / Security & QA Lead | `role2-security-qa` | Kiến trúc hệ thống, Xác thực & Phân quyền (RBAC), Bảo mật NĐ 13/2023 & Chống gian lận, Hạ tầng & Kiểm thử (QA) |
| 3 | **Nguyễn Thanh Trí** | `24521838` | **Developer (Dev 1)** | UI/UX Designer & Frontend WooCommerce | `role3-ui-frontend` | Thiết kế UI/UX (Figma), Giao diện Storefront, Giỏ hàng, Đặt hàng & Quản lý đơn hàng (OMS) |
| 4 | **Lê Lưu Luân** | `24521027` | **Developer (Dev 2)** | Backend, Database & Payment Engineer | `role4-backend-payment` | Thiết kế CSDL (ERD), Custom Plugin Trả góp sinh viên (3-6-12 tháng), Duyệt hồ sơ 2 lớp, Tích hợp VNPay/MoMo/Fundiin Sandbox, Quản lý S/N & Hóa đơn PDF |

---

## PHẦN 1: GIỚI THIỆU DỰ ÁN & TẦM NHÌN CHIẾN LƯỢC

- **Ngách sản phẩm:** Laptop, PC (máy bộ nguyên chiếc) và Phụ kiện công nghệ. (Cam kết dữ liệu mẫu tối thiểu 500 sản phẩm tham khảo từ Xgear, MemoryZone, GearVN, Phong Vũ).
- **Tên thương hiệu (Dự kiến):** GearForge
- **Tầm nhìn chiến lược (Vision Statement):** Xây dựng hệ thống TMĐT chuyên phân phối Laptop, PC và Phụ kiện, giải quyết bài toán tài chính cho sinh viên đại học thông qua các giải pháp trả góp trực tuyến linh hoạt, thủ tục xét duyệt nhanh gọn với mức giá hợp lý nhất thị trường.
- **Chỉ số đo lường (KPIs)** *(Ước tính giai đoạn thử nghiệm tại Khu đô thị ĐHQG TP.HCM)*:
  - Đạt **150 giao dịch thành công** trong 3 tháng đầu ra mắt (trong đó 30% – 40% là các đơn hàng Laptop/PC áp dụng hình thức trả góp, phần còn lại đến từ nhóm Phụ kiện công nghệ để tạo dòng tiền và thu hút khách hàng).
  - Giá trị trung bình trên một đơn hàng (**AOV**) đối với nhóm Laptop/PC đạt từ **10.000.000 VNĐ**; AOV toàn sàn (gộp phụ kiện) đạt khoảng **3.500.000 VNĐ**.
  - Tỷ lệ chuyển đổi đơn hàng (**Conversion Rate**) kỳ vọng ở mức **1.5%** (tương đương mục tiêu thu hút khoảng 10.000 lượt truy cập chất lượng từ các cộng đồng sinh viên trong 3 tháng đầu).

---

## PHẦN 2: MÔ HÌNH KINH DOANH & PHẠM VI HỆ THỐNG

- **Mô hình kinh doanh chủ đạo:** **B2C (Business-to-Consumer)** – Bán lẻ trực tiếp thiết bị máy tính và phụ kiện tới người tiêu dùng cuối.
- **Phân tích Chân dung khách hàng (Target Persona):**
  - **Đối tượng:** Sinh viên đại học các ngành CNTT, Kinh tế, Thiết kế đồ họa (Độ tuổi 18 – 24) cần trang bị thiết bị học tập nhưng ngân sách ban đầu hạn hẹp.
  - **Hành vi:** Thường xuyên so sánh cấu hình và giá bán giữa các dòng máy, rất quan tâm đến các chương trình khuyến mãi mùa tựu trường, đặc biệt chú ý đến lãi suất và kỳ hạn trả góp.
  - **Điểm chạm (Touchpoints):** Website TMĐT trên giao diện Mobile/Desktop, Fanpage, và các hội nhóm cộng đồng sinh viên (KTX ĐHQG, hội nhóm các trường thành viên) trên Facebook.
- **Phạm vi bắt buộc MVP (In-scope):**
  - **Hệ thống danh mục và bộ lọc chuyên sâu:** Tìm kiếm và lọc sản phẩm theo nhu cầu thực tế (Laptop văn phòng, Laptop Gaming, Laptop Đồ họa) và theo thông số kỹ thuật (CPU, RAM, GPU, khoảng giá).
  - **Tính năng so sánh cấu hình (Compare Specs):** Cho phép sinh viên đặt 2 – 3 mẫu Laptop/PC cạnh nhau để đối chiếu trực quan thông số kỹ thuật và giá bán trước khi ra quyết định.
  - **Module tính toán & đăng ký trả góp sinh viên:** Công cụ tự động tính số tiền trả trước, số tiền góp mỗi tháng theo kỳ hạn (3 – 6 – 12 tháng); cho phép sinh viên tải lên hồ sơ định danh (CCCD, Thẻ sinh viên) để Admin xét duyệt trên hệ thống quản trị, kết hợp cổng thanh toán/BNPL (tích hợp môi trường Sandbox VNPay/MoMo/Fundiin).
  - **Quản lý đơn hàng (OMS):** Theo dõi trạng thái đơn hàng và tra cứu tiến độ duyệt hồ sơ trả góp trực tuyến.
- **Các tính năng để lại giai đoạn sau (Out-of-scope):**
  - Chương trình thu cũ đổi mới (Trade-in) tự động định giá máy cũ bằng AI.
  - Công cụ tự xây dựng cấu hình máy tính nâng cao (Build PC tự động kiểm tra độ tương thích phần cứng chuyên sâu).
  - Tích hợp tự động hóa hoàn toàn API eKYC bằng AI và kết nối trực tiếp API xuất hóa đơn điện tử thời gian thực với cơ quan Thuế (trong phạm vi đồ án, hệ thống tập trung chuẩn hóa luồng nghiệp vụ và xuất hóa đơn PDF mẫu).

---

## PHẦN 3: CHIẾN LƯỢC KỸ THUẬT & CHI PHÍ SỞ HỮU (TCO)

### 1. Quyết định triển khai: Buy/Customize vs. Build from Scratch

- **Quyết định:** Mua sẵn & Tùy biến (**Buy / Customize**) – Nền tảng mã nguồn mở **WooCommerce (WordPress)**.
- **Lý do thuyết phục:** Với định hướng phục vụ sinh viên và ngân sách khởi nghiệp cực kỳ eo hẹp, việc sử dụng nền tảng mã nguồn mở WooCommerce là lựa chọn tối ưu nhất. Phương án này tối ưu được chi phí khởi tạo ban đầu ở mức thấp nhất so với việc tự xây dựng từ số 0 (Build from Scratch), đồng thời giải quyết được rào cản phụ thuộc vào phí duy trì hàng tháng của các nền tảng SaaS thuần túy. Bên cạnh đó, với kiến trúc linh hoạt chạy trên môi trường PHP/MySQL, nhóm phát triển có thể can thiệp sâu vào mã nguồn (Custom Plugin/Hook) để tự thiết kế module tính toán lãi suất và quản lý hồ sơ trả góp sinh viên riêng biệt. Thời gian triển khai nhanh của nền tảng này cũng giúp dự án kịp ra mắt trong mùa tựu trường.

### 2. Bảng tính toán Tổng chi phí sở hữu (TCO) giả định

Đơn vị tính: **VNĐ** *(Ước tính theo mô hình Khởi nghiệp sinh viên – Lấy công làm lãi)*

| Hạng mục chi phí | Năm 1 (Khởi tạo & Thử nghiệm) | Năm 2 (Mở rộng quy mô) | Năm 3 (Tối ưu & Nâng cấp) |
| :--- | :---: | :---: | :---: |
| **Hạ tầng & Bản quyền:** Thuê Cloud Hosting/VPS, Domain, SSL, Theme/Plugin trả phí | 6.000.000 | 10.000.000 | 15.000.000 |
| **Chi phí nhân sự & Vận hành:** Core team tự phát triển (0đ), chi phí thuê CTV nhập liệu / CSKH theo ca | 18.000.000 | 36.000.000 | 60.000.000 |
| **Dịch vụ bên thứ ba & Tiếp thị:** SMS OTP, Email thông báo, Seeding cộng đồng sinh viên & Quảng cáo cơ bản | 12.000.000 | 20.000.000 | 25.000.000 |
| **TỔNG CỘNG TCO** | **36.000.000** | **66.000.000** | **100.000.000** |

> **Ghi chú tài chính:** Phí chiết khấu cổng thanh toán (MDR từ 1.5% – 2.5% của VNPay, MoMo hoặc đối tác BNPL) biến thiên theo doanh thu thực tế và được hạch toán trực tiếp vào giá vốn/biên lợi nhuận của từng đơn hàng, không tính cố định vào chi phí vận hành TCO.

---

## PHẦN 4: ĐẢM BẢO RỦI RO PHÁP LÝ & BẢO MẬT TẠI VIỆT NAM

### 1. Rủi ro Pháp lý, Bảo mật & Thuế

- **Đăng ký Website TMĐT:** Bắt buộc hoàn thiện thủ tục thông báo Bộ Công Thương đối với website TMĐT bán hàng. Đồng thời, công khai minh bạch Chính sách bảo hành, Điều khoản sử dụng & Chính sách đổi trả ngay trên giao diện website để tránh rủi ro tranh chấp với người tiêu dùng.
- **Nghĩa vụ Thuế:** Hệ thống chuẩn hóa dữ liệu đơn hàng để sẵn sàng xuất hóa đơn điện tử (HĐĐT) theo từng giao dịch. Về mặt định hướng vận hành thực tế, website thiết kế cấu trúc dữ liệu tương thích để kết nối API với các đối tác T-VAN (Tổ chức cung cấp dịch vụ truyền nhận dữ liệu hóa đơn được Tổng cục Thuế cấp phép như MISA meInvoice, VNPT Invoice) nhằm đảm bảo kê khai Thuế Giá trị gia tăng (VAT 8% – 10%) và Thuế Thu nhập doanh nghiệp (TNDN) hợp lệ, minh bạch.
- **Bảo mật thông tin cá nhân:** Đối với luồng xét duyệt hồ sơ trả góp sinh viên nội bộ có thu thập thông tin nhạy cảm (hình ảnh CCCD, Thẻ sinh viên), hệ thống cam kết tuân thủ **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân: hiển thị thông báo xin sự đồng ý rõ ràng của người dùng trước khi tải tệp, phân quyền truy cập nghiêm ngặt cho Admin và mã hóa dữ liệu định danh lưu trữ trên hệ thống.

### 2. Phương án chống rửa tiền và Gian lận thanh toán

- **Kiểm soát dòng tiền:** Mọi giao dịch thanh toán trực tuyến và giải ngân từ đối tác trả góp (BNPL) đều được đối soát và kiểm soát dòng tiền qua tài khoản định danh của đơn vị kinh doanh. Tuyệt đối không sử dụng tài khoản cá nhân không rõ nguồn gốc để nhận tiền.
- **Chống gian lận trả góp (Tín dụng ảo):** Đối với cổng BNPL (Fundiin), quy trình định danh điện tử (eKYC) sẽ do trực tiếp hệ thống của đối tác tài chính thực hiện và đảm bảo an toàn. Đối với luồng hỗ trợ trả góp sinh viên trên website, hệ thống áp dụng quy trình kiểm duyệt 2 lớp (đối chiếu thông tin CCCD, Thẻ sinh viên chính chủ và xác nhận qua số điện thoại/email sinh viên trường cấp) trước khi duyệt giao hàng.
- **Chống gian lận thanh toán:** Tích hợp các cổng thanh toán uy tín hỗ trợ tiêu chuẩn bảo mật **3D-Secure** cho các giao dịch qua thẻ. Đồng thời, thiết lập cơ chế giới hạn tần suất gửi yêu cầu (**Rate Limiting**) và đưa vào danh sách đen (**Blacklist**) các tài khoản/địa chỉ IP có hành vi spam tạo đơn hàng ảo hoặc tải lên hồ sơ giả mạo.
- **Quản lý rủi ro hàng hóa:** Quản lý và lưu trữ chính xác mã **Serial Number (S/N) / Service Tag / Mã vạch** thiết bị trên vỏ hộp vào chi tiết đơn hàng ngay khi xuất kho để đối chiếu khi bảo hành hoặc đổi trả, phòng ngừa triệt để hành vi đánh tráo sản phẩm hoặc linh kiện.

---

## PHẦN 5: PHÂN CÔNG VAI TRÒ SCRUM & MÔ TẢ CÔNG VIỆC DỰ KIẾN

### 1. Mô tả chi tiết Vai trò Scrum & Công việc dự kiến của từng thành viên

#### Thành viên 1: Trịnh Duy Long (`24521021`) – **Product Owner (PO)** *(Kiêm Nhóm trưởng / Business Analyst)*
- **Trách nhiệm cốt lõi theo Scrum:**
  - Sở hữu tầm nhìn sản phẩm **GearForge**, xây dựng và sắp xếp độ ưu tiên cho **Product Backlog** dựa trên giá trị mang lại cho người dùng sinh viên và tiêu chí MVP.
  - Viết **User Stories** và tiêu chí chấp nhận (**Acceptance Criteria**) cho các tính năng cốt lõi; làm đầu mối trao đổi với Giảng viên hướng dẫn (Stakeholder) và nghiệm thu kết quả cuối mỗi Sprint.
- **Công việc dự kiến (Kỹ thuật, Dữ liệu & Báo cáo EC312):**
  1. **Phân tích yêu cầu & Nghiệp vụ (EC312 Mục 1 & 2):** Thực hiện khảo sát nhu cầu mua sắm/trả góp của sinh viên tại Khu đô thị ĐHQG TP.HCM; hoàn thiện bài toán, mục tiêu, phạm vi, bảng TCO, KPIs, danh sách **Yêu cầu chức năng (FR)** và **Yêu cầu phi chức năng (NFR)**.
  2. **Mô hình hóa hệ thống (EC312 Mục 3):** Chủ trì vẽ **Biểu đồ Use Case tổng thể** toàn hệ thống; trực tiếp đặc tả Use Case và vẽ **Activity Diagram + Sequence Diagram** cho cụm chức năng **Tìm kiếm, Bộ lọc thông số chuyên sâu & So sánh cấu hình (Compare Specs)**.
  3. **Dữ liệu sản phẩm & Nội dung pháp lý (Demo):** Thiết kế bộ thuộc tính kỹ thuật chuẩn (Nhu cầu, CPU, RAM, GPU, Khoảng giá); thu thập, làm sạch và import tối thiểu **500 sản phẩm** (Laptop, PC, Phụ kiện) lên WooCommerce; soạn thảo trang Chính sách bảo hành, Đổi trả, Điều khoản và thông tin chuẩn bị hồ sơ Bộ Công Thương.

#### Thành viên 2: Ngô Trọng Đạt (`24520275`) – **Scrum Master (SM)** *(Kiêm Kiến trúc sư hệ thống & Security/QA Lead)*
- **Trách nhiệm cốt lõi theo Scrum:**
  - Tổ chức và điều phối các sự kiện Scrum (**Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective**); cập nhật tiến độ trên Jira/Trello/GitHub Projects và tháo gỡ vướng mắc kỹ thuật cho cả nhóm.
  - Ghi chép đầy đủ **Nhật ký làm việc nhóm** (Phụ lục bắt buộc của EC312) và đảm bảo các thành viên tuân thủ chuẩn thiết kế/chất lượng (Definition of Done).
- **Công việc dự kiến (Kiến trúc, Bảo mật, QA & Báo cáo EC312):**
  1. **Kiến trúc & Bảo mật hệ thống (EC312 Mục 4.1 & Phần 4):** Thiết kế **Sơ đồ Kiến trúc tổng thể (System Architecture)** theo mô hình **Layered / Microkernel (Plugin-based)** trên nền WordPress/WooCommerce + Custom Plugin + Payment/BNPL Sandbox; thiết kế cơ chế tuân thủ **Nghị định 13/2023/NĐ-CP** (mã hóa thông tin CCCD/Thẻ SV, phân quyền RBAC Admin) và phòng chống gian lận (Rate Limiting, Blacklist IP/Account).
  2. **Mô hình hóa hệ thống (EC312 Mục 3):** Chủ trì thống nhất **Class Diagram** toàn hệ thống và **State Machine Diagram** (vòng đời Đơn hàng & Trạng thái duyệt hồ sơ trả góp); viết đặc tả Use Case + **Sequence Diagram** cho cụm chức năng **Xác thực người dùng, Phân quyền & Kiểm soát gian lận/Bảo mật**.
  3. **Hạ tầng, Kiểm thử & Hoàn thiện tài liệu (Demo & QA):** Triển khai môi trường **Cloud Hosting/VPS, Domain, SSL**, thiết lập bảo mật WAF/Rate Limit; lập **Test Plan & Test Cases** kiểm thử toàn diện luồng đặt hàng, bộ lọc, upload hồ sơ trả góp, thanh toán Sandbox; tổng hợp, rà soát định dạng báo cáo (`.docx` & `.pdf`).

#### Thành viên 3: Nguyễn Thanh Trí (`24521838`) – **Developer 1** *(UI/UX Designer & Frontend WooCommerce Specialist)*
- **Trách nhiệm cốt lõi theo Scrum:**
  - Tham gia ước lượng độ phức tạp (Story Points) trong Sprint Planning; chịu trách nhiệm chuyển hóa các User Story thành giao diện trực quan, thân thiện trên cả Mobile và Desktop.
  - Phối hợp chặt chẽ với PO để đảm bảo giao diện bám sát hành vi so sánh cấu hình và săn khuyến mãi của sinh viên.
- **Công việc dự kiến (UI/UX, Frontend & Báo cáo EC312):**
  1. **Thiết kế UI/UX (EC312 Mục 4.3):** Xây dựng **Wireframe & Mockup hoàn chỉnh (Figma)** cho các màn hình trọng tâm: Trang chủ GearForge, Trang danh mục & Bộ lọc thông số kỹ thuật, Trang chi tiết sản phẩm, **Bảng so sánh cấu hình 2–3 Laptop/PC**, Giao diện tính toán & đăng ký trả góp, Giỏ hàng, Checkout, Tra cứu đơn hàng & Admin Dashboard.
  2. **Mô hình hóa hệ thống (EC312 Mục 3):** Viết đặc tả Use Case + **Activity Diagram + Sequence Diagram** cho cụm chức năng **Giỏ hàng, Đặt hàng & Theo dõi trạng thái đơn hàng (OMS)**.
  3. **Triển khai giao diện WooCommerce (Demo):** Cài đặt và tùy biến **Theme / Child Theme WordPress**; hiện thực hóa giao diện **Bộ lọc đa tiêu chí (Filter theo CPU, RAM, GPU, Nhu cầu, Giá)** và bảng **So sánh cấu hình (Compare Specs)**; tích hợp hộp thoại xác nhận đồng ý xử lý dữ liệu cá nhân (**Consent Banner** theo NĐ 13/2023) khi upload hồ sơ trả góp; tối ưu tốc độ tải trang (NFR Performance < 3 giây).

#### Thành viên 4: Lê Lưu Luân (`24521027`) – **Developer 2** *(Backend, Database & Payment/Installment Engineer)*
- **Trách nhiệm cốt lõi theo Scrum:**
  - Tham gia ước lượng kỹ thuật và phát triển các thành phần xử lý nghiệp vụ phía Backend, cơ sở dữ liệu và tích hợp API bên thứ ba.
  - Đảm bảo tính toàn vẹn dữ liệu đơn hàng, hồ sơ định danh và quy trình thanh toán an toàn.
- **Công việc dự kiến (CSDL, Custom Plugin, Tích hợp & Báo cáo EC312):**
  1. **Thiết kế Cơ sở dữ liệu (EC312 Mục 4.2):** Xây dựng **Mô hình ERD** và ánh xạ sang **CSDL quan hệ (MySQL)** kết hợp bảng mặc định của WooCommerce với các bảng mở rộng: *Gói kỳ hạn & Lãi suất (`wp_gf_installment_plans`), Hồ sơ trả góp sinh viên (`wp_gf_installment_applications`), Mã Serial/Service Tag (`wp_gf_order_serials`), Danh sách đen & Nhật ký chống gian lận (`wp_gf_fraud_blacklist`)*.
  2. **Mô hình hóa hệ thống (EC312 Mục 3):** Viết đặc tả Use Case + **BPMN / Activity Diagram + Sequence Diagram** cho cụm chức năng **Tính toán, Đăng ký trả góp sinh viên, Xét duyệt 2 lớp & Thanh toán trực tuyến**.
  3. **Lập trình Custom Plugin & Tích hợp API (Demo):** Phát triển **Custom WordPress Plugin (PHP/MySQL)** cho **Module trả góp sinh viên** (tính trả trước, chia kỳ hạn 3–6–12 tháng, lưu trữ & mã hóa tệp CCCD/Thẻ SV, luồng Admin xét duyệt 2 lớp qua SĐT/Email trường); tích hợp cổng thanh toán **Sandbox VNPay / MoMo / Fundiin** (hỗ trợ 3D-Secure); xây dựng tính năng gắn **Serial Number (S/N)** khi xuất kho và xuất **Hóa đơn PDF mẫu** chuẩn dữ liệu T-VAN.

---

### 2. Ma trận phân công Hạng mục Đồ án EC312 (Bám sát Rubric chấm điểm)

| Hạng mục theo Mẫu & Rubric EC312 | Tỷ trọng điểm | Chủ trì (Owner) | Phối hợp (Support) |
| :--- | :---: | :--- | :--- |
| **1. Phân tích yêu cầu:** Bài toán, KPIs, TCO, FR/NFR, Khảo sát sinh viên, Use Case tổng thể | **15%** | **Thành viên 1 (PO)** | Cả nhóm (mỗi TV 1 đặc tả UC) |
| **2. Thiết kế hệ thống & UML:** Kiến trúc hệ thống, Class, State Machine, Activity/BPMN, Sequence | **25%** | **Thành viên 2 (SM)** *(Kiến trúc, Class, State)* | TV1, TV3, TV4 *(Vẽ Activity/Sequence theo phân hệ)* |
| **3. Thiết kế UI/UX:** Wireframe/Mockup Figma, User Flow, Responsive Mobile/Desktop | **10%** | **Thành viên 3 (Dev 1)** | Thành viên 1 (PO) duyệt nghiệp vụ |
| **4. Thiết kế CSDL:** ERD, Chuẩn hóa bảng MySQL, Mapping WooCommerce + Bảng mở rộng | **10%** | **Thành viên 4 (Dev 2)** | Thành viên 2 (SM) rà soát bảo mật |
| **5. Triển khai Demo:** Website WooCommerce ≥ 500 SP, Lọc, Compare, Trả góp, Sandbox Payment, S/N, PDF | **20%** | **Thành viên 3 & 4 (Dev Team)** | TV1 (Dữ liệu 500 SP), TV2 (Hosting/QA) |
| **6. Tài liệu, Pháp lý & Nhật ký nhóm:** Báo cáo `.docx`/`.pdf`, Pháp lý VN, Test Report, Scrum Log | **10%** | **Thành viên 2 (SM)** & **Thành viên 1 (PO)** | Thành viên 3 & 4 viết phần kỹ thuật |
| **7. Tính sáng tạo & Mở rộng:** So sánh mô hình, Module Trả góp SV chuyên biệt, Định hướng T-VAN/eKYC/AI | **10%** | **Thành viên 1 (PO)** & **Thành viên 4 (Dev 2)** | Thành viên 2 & 3 |

---

### 3. Lộ trình thực hiện dự kiến theo Scrum Sprints (4 Sprints)

- **Sprint 1 – Khởi tạo, Khảo sát & Phân tích Yêu cầu:**
  - Chốt Product Backlog, khảo sát sinh viên ĐHQG, hoàn thiện FR/NFR, Use Case tổng thể, đặc tả Use Case từng thành viên, dựng môi trường WordPress/WooCommerce & Hosting/Git.
- **Sprint 2 – Thiết kế Hệ thống, CSDL & UI/UX:**
  - Hoàn thiện System Architecture, ERD, Class Diagram, State Machine, Activity/Sequence Diagrams và bộ Mockup Figma; bắt đầu thu thập/import dữ liệu 500 sản phẩm.
- **Sprint 3 – Phát triển MVP Core (Storefront, Compare & Custom Plugin Trả góp):**
  - Hoàn thiện giao diện Storefront, Bộ lọc cấu hình chuyên sâu, So sánh 2–3 Laptop/PC; lập trình Custom Plugin tính toán & nộp hồ sơ trả góp sinh viên (kèm Consent NĐ 13/2023 và mã hóa dữ liệu).
- **Sprint 4 – Tích hợp Thanh toán Sandbox, OMS, Kiểm thử & Hoàn thiện Báo cáo:**
  - Tích hợp VNPay/MoMo/Fundiin Sandbox, luồng Admin duyệt 2 lớp, quản lý S/N, xuất hóa đơn PDF mẫu; chạy kiểm thử bảo mật (Rate Limit/Blacklist) & chức năng; quay video/chuẩn bị Demo và xuất bản báo cáo `.docx` / `.pdf`.
