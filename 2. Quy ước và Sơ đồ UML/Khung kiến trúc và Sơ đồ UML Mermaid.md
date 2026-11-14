# KHUNG KIẾN TRÚC & SƠ ĐỒ UML / ERD CHUẨN HÓA (GEARFORGE)

> Tài liệu này cung cấp **bộ khung sơ đồ Mermaid chuẩn hóa** bám sát 100% các thuật ngữ trong `2. Quy ước và Sơ đồ UML/Từ điển thuật ngữ và Ma trận Fit-Gap.md`.
> - **Cách sử dụng:** Các thành viên có thể render trực tiếp trên VS Code / GitHub / Mermaid Live Editor (mermaid.live) hoặc chuyển đổi sang PlantUML / Draw.io để xuất ảnh `.png` nét cao chèn vào Báo cáo Word (`EC312`).

---

## 1. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE – LAYERED + MICROKERNEL)

Mô hình kết hợp **Layered Architecture** (Client → Application → Core & Plugin → Data/External Services) và **Microkernel (Plugin-based)** trên nền tảng WordPress/WooCommerce.

```mermaid
flowchart TB
    subgraph ClientLayer["1. Presentation & Client Layer"]
        WebUI["Storefront UI (Responsive Desktop/Mobile)"]
        AdminUI["Admin & Reviewer Dashboard"]
        ConsentUI["NĐ 13/2023 Consent Banner"]
    end

    subgraph SecurityEdge["2. Security & Gateway Middleware"]
        SSL["HTTPS / SSL & WAF"]
        FraudGuard["FraudGuardMiddleware (Rate Limit & Blacklist Check)"]
        RBAC["RBAC Access Control (StoreAdmin / InstallmentReviewer)"]
    end

    subgraph CoreKernel["3. Microkernel Core (WordPress + WooCommerce)"]
        WCCatalog["Catalog & Attribute Engine (>= 500 Products)"]
        WCCart["Cart, Coupon & Order Management (OMS)"]
        WCAuth["User Authentication & Session"]
    end

    subgraph GearForgePlugin["4. Custom Plugin: gearforge-core (Microkernel Extensions)"]
        CompareMod["CompareSpecs Module (2-3 Devices)"]
        InstallmentMod["StudentInstallment Module (3-6-12 Months + AES-256)"]
        ReviewMod["2-Layer Approval Engine (L1 Docs + L2 Edu)"]
        SerialMod["SerialNumberManager (S/N Tracking)"]
        InvoiceMod["PdfInvoiceGenerator (T-VAN Format)"]
    end

    subgraph DataAndExternal["5. Data Persistence & External Sandbox Services"]
        MySQL[("MySQL 8.0 (WP Core + 4 wp_gf_* Tables)")]
        EncryptedVault[("Encrypted ID Vault (CCCD / Student Card)")]
        PaymentGW["Payment / BNPL Sandbox (VNPay / MoMo / Fundiin 3DS)"]
        TVAN["T-VAN Electronic Invoice Target Schema"]
    end

    WebUI --> SSL
    AdminUI --> SSL
    ConsentUI --> SSL
    SSL --> FraudGuard
    FraudGuard --> RBAC
    RBAC --> WCCatalog
    RBAC --> WCCart
    RBAC --> WCAuth

    WCCatalog --> CompareMod
    WCCart --> InstallmentMod
    InstallmentMod --> ReviewMod
    WCCart --> SerialMod
    SerialMod --> InvoiceMod

    WCCatalog --> MySQL
    WCCart --> MySQL
    InstallmentMod --> MySQL
    InstallmentMod --> EncryptedVault
    SerialMod --> MySQL
    FraudGuard --> MySQL

    InstallmentMod --> PaymentGW
    WCCart --> PaymentGW
    InvoiceMod -.->|"Compatible Data Schema"| TVAN
```

---

## 2. BIỂU ĐỒ USE CASE TỔNG THỂ (MASTER USE CASE OVERVIEW)

*(Role 1 chủ trì hoàn thiện sơ đồ này bằng PlantUML/Draw.io kèm đường `<<include>>` / `<<extend>>` chi tiết trước khi đưa vào Chương 3.2)*

```mermaid
flowchart LR
    Guest(["Guest"])
    Student(["StudentCustomer"])
    Admin(["StoreAdmin"])
    Reviewer(["InstallmentReviewer"])
    Gateway(["PaymentGateway Sandbox"])
    TVAN(["TVANService"])

    subgraph GearForgeSystem["Hệ thống TMĐT GearForge"]
        subgraph Role1Pkg["Gói 1 - PO/BA"]
            UC01["UC-01: Tìm kiếm & Lọc thông số"]
            UC02["UC-02: So sánh cấu hình 2-3 máy"]
            UC03["UC-03: Quản lý danh mục & Import >= 500 SP"]
        end

        subgraph Role2Pkg["Gói 2 - SM/QA"]
            UC04["UC-04: Đăng ký, Đăng nhập & Xác thực .edu.vn"]
            UC05["UC-05: Phân quyền RBAC, Mã hóa NĐ 13/2023 & Blacklist"]
            UC06["UC-06: Đánh giá sản phẩm & Kiểm duyệt"]
        end

        subgraph Role3Pkg["Gói 3 - Dev 1"]
            UC07["UC-07: Quản lý Giỏ hàng & Mã giảm giá SV"]
            UC08["UC-08: Đặt hàng Checkout & Theo dõi đơn (OMS)"]
            UC09["UC-09: Yêu cầu Bảo hành / Đổi trả theo S/N"]
        end

        subgraph Role4Pkg["Gói 4 - Dev 2"]
            UC10["UC-10: Tính & Nộp hồ sơ trả góp SV 3-6-12 tháng"]
            UC11["UC-11: Duyệt hồ sơ 2 lớp & Thanh toán Sandbox"]
            UC12["UC-12: Gắn Serial Number & Xuất Hóa đơn PDF"]
        end
    end

    Guest --> UC01
    Guest --> UC02
    Guest --> UC04

    Student --> UC01
    Student --> UC02
    Student --> UC04
    Student --> UC06
    Student --> UC07
    Student --> UC08
    Student --> UC09
    Student --> UC10

    Admin --> UC03
    Admin --> UC05
    Admin --> UC06
    Admin --> UC09
    Admin --> UC12

    Reviewer --> UC05
    Reviewer --> UC11

    UC08 -.->|"include"| UC11
    UC10 -.->|"extend"| UC08
    UC11 --> Gateway
    UC12 -.->|"prepare schema"| TVAN
```

---

## 3. BIỂU ĐỒ LỚP TỔNG THỂ (CLASS DIAGRAM – ROLE 2 CHỦ TRÌ)

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string studentEmail
        +bool isEduVerified
        +string role
        +string phone
        +register()
        +verifyEduEmail()
    }

    class Product {
        +int id
        +string sku
        +string name
        +decimal price
        +int stockQty
        +string usageCategory
        +getSpecs()
    }

    class ProductSpecAttribute {
        +int specId
        +int productId
        +string cpu
        +string ram
        +string gpu
        +string storage
        +string screen
    }

    class ComparisonSession {
        +string sessionId
        +int[] productIds
        +addProduct(productId)
        +removeProduct(productId)
        +renderComparisonTable()
    }

    class Cart {
        +string cartId
        +int userId
        +string couponCode
        +calculateTotal()
    }

    class Order {
        +int orderId
        +int userId
        +decimal totalAmount
        +string paymentMethod
        +string orderStatus
        +createOrder()
        +updateStatus(newStatus)
    }

    class OrderItem {
        +int orderItemId
        +int orderId
        +int productId
        +int quantity
        +decimal unitPrice
    }

    class InstallmentPlan {
        +int planId
        +int months
        +decimal minDownpaymentRate
        +decimal monthlyInterestRate
        +calculateMonthlyAmount(price, downRate)
    }

    class InstallmentApplication {
        +int appId
        +int orderId
        +int userId
        +int planId
        +string cccdEncryptedPath
        +string studentCardEncryptedPath
        +bool consentNd13Accepted
        +string status
        +submitApplication()
        +verifyLayer1(reviewerId)
        +verifyLayer2(reviewerId)
        +reject(reason)
    }

    class OrderSerial {
        +int serialId
        +int orderId
        +int orderItemId
        +string serialNumber
        +date warrantyExpiresAt
        +assignSerial(sn)
    }

    class FraudBlacklist {
        +int blacklistId
        +string targetType
        +string targetValue
        +string reason
        +isBlocked(value)
    }

    class InvoiceDocument {
        +string invoiceNo
        +int orderId
        +decimal vatRate
        +string tvanPayloadJson
        +exportPdf()
    }

    User "1" --> "0..*" Order : places
    User "1" --> "0..1" Cart : owns
    User "1" --> "0..*" InstallmentApplication : submits
    Product "1" *-- "1" ProductSpecAttribute : has
    ComparisonSession "0..*" o-- "2..3" Product : compares
    Cart "1" *-- "0..*" Product : contains
    Order "1" *-- "1..*" OrderItem : consists of
    OrderItem "0..*" --> "1" Product : references
    Order "1" --> "0..1" InstallmentApplication : uses
    InstallmentApplication "0..*" --> "1" InstallmentPlan : applies
    Order "1" *-- "0..*" OrderSerial : tracks
    Order "1" --> "0..1" InvoiceDocument : generates
    FraudBlacklist ..> User : blocks
```

---

## 4. BIỂU ĐỒ TRẠNG THÁI (STATE MACHINE DIAGRAMS – ROLE 2 CHỦ TRÌ)

### 4.1. Vòng đời Đơn hàng (`OrderStatus`)

```mermaid
stateDiagram-v2
    [*] --> CREATED : Student submits checkout
    CREATED --> PENDING_PAYMENT : Standard Online Payment
    CREATED --> PENDING_INSTALLMENT_APPROVAL : Student Installment Selected

    PENDING_PAYMENT --> PROCESSING : Gateway IPN Success (3DS)
    PENDING_PAYMENT --> CANCELLED : Timeout or Payment Failed

    PENDING_INSTALLMENT_APPROVAL --> PROCESSING : L1+L2 Approved & Downpayment Paid
    PENDING_INSTALLMENT_APPROVAL --> CANCELLED : Application Rejected / Blacklisted

    PROCESSING --> SERIAL_ASSIGNED : StoreAdmin Assigns S/N
    SERIAL_ASSIGNED --> SHIPPING : Handed to Carrier
    SHIPPING --> DELIVERED : Customer Receives Device
    DELIVERED --> COMPLETED : Invoice PDF Generated (T-VAN Ready)
    DELIVERED --> REFUNDED : Valid Return within Policy

    CANCELLED --> [*]
    REFUNDED --> [*]
    COMPLETED --> [*]
```

### 4.2. Vòng đời Hồ sơ Trả góp Sinh viên (`InstallmentApplicationStatus`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Calculate on Widget
    DRAFT --> SUBMITTED : Consent NĐ 13/2023 + Upload Encrypted IDs

    SUBMITTED --> L1_DOCS_VERIFIED : Reviewer L1 Verifies CCCD & Student Card
    SUBMITTED --> REJECTED : Blurry or Mismatched Documents
    SUBMITTED --> BLACKLISTED : Fake ID / Spam Detected

    L1_DOCS_VERIFIED --> L2_EDU_CONFIRMED : Reviewer L2 Confirms Phone & .edu.vn
    L1_DOCS_VERIFIED --> REJECTED : Failed Phone / Edu Verification

    L2_EDU_CONFIRMED --> APPROVED_WAITING_DOWNPAYMENT : Approval Notification Sent
    APPROVED_WAITING_DOWNPAYMENT --> ACTIVE_INSTALLMENT : Downpayment Paid via Sandbox (3DS)
    ACTIVE_INSTALLMENT --> CLOSED : All Monthly Terms Paid

    REJECTED --> [*]
    BLACKLISTED --> [*]
    CLOSED --> [*]
```

---

## 5. MÔ HÌNH THỰC THỂ KẾT HỢP (ERD – ROLE 4 CHỦ TRÌ)

```mermaid
erDiagram
    wp_users ||--o{ wp_wc_orders : places
    wp_users ||--o{ wp_gf_installment_applications : submits
    wp_users ||--o{ wp_gf_fraud_blacklist : creates_rule
    wp_posts ||--o{ wp_wc_order_items : ordered_in
    wp_posts ||--o{ wp_gf_order_serials : identified_by
    wp_wc_orders ||--|{ wp_wc_order_items : contains
    wp_wc_orders ||--o| wp_gf_installment_applications : finances
    wp_wc_orders ||--o{ wp_gf_order_serials : tracks
    wp_wc_order_items ||--o{ wp_gf_order_serials : assigns
    wp_gf_installment_plans ||--o{ wp_gf_installment_applications : defines_terms

    wp_users {
        bigint ID PK
        varchar user_login
        varchar user_email
        varchar student_edu_email
        tinyint is_edu_verified
        varchar role_code
    }

    wp_posts {
        bigint ID PK
        varchar post_title
        varchar post_type
        varchar sku
        decimal price
    }

    wp_wc_orders {
        bigint id PK
        bigint customer_id FK
        decimal total_amount
        varchar payment_method
        varchar status
        datetime date_created_gmt
    }

    wp_wc_order_items {
        bigint order_item_id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal subtotal
    }

    wp_gf_installment_plans {
        bigint plan_id PK
        varchar plan_name
        int duration_months
        decimal min_downpayment_pct
        decimal monthly_interest_pct
        tinyint is_active
    }

    wp_gf_installment_applications {
        bigint app_id PK
        bigint order_id FK
        bigint user_id FK
        bigint plan_id FK
        bigint reviewer_id FK
        varchar cccd_hash
        varchar cccd_encrypted_path
        varchar student_card_encrypted_path
        tinyint consent_nd13_accepted
        varchar status
        datetime l1_verified_at
        datetime l2_verified_at
        text reject_reason
    }

    wp_gf_order_serials {
        bigint serial_id PK
        bigint order_id FK
        bigint order_item_id FK
        bigint product_id FK
        varchar serial_number UK
        date warranty_end_date
        datetime assigned_at
    }

    wp_gf_fraud_blacklist {
        bigint blacklist_id PK
        varchar target_type
        varchar target_value
        text reason
        bigint created_by FK
        datetime blocked_until
    }
```

---

## 6. MẪU SEQUENCE & ACTIVITY DIAGRAM CHUẨN CHO 4 GÓI CÔNG VIỆC

### 6.1. Mẫu Sequence Diagram – Gói Role 4: Nộp hồ sơ trả góp SV & Duyệt 2 lớp (`UC-10` & `UC-11`)

```mermaid
sequenceDiagram
    actor SV as StudentCustomer
    participant UI as Storefront & Consent UI
    participant FG as FraudGuardMiddleware
    participant Plugin as StudentInstallment Module
    participant Vault as Encrypted ID Vault (AES-256)
    participant DB as MySQL (wp_gf_installment_applications)
    actor Rev as InstallmentReviewer
    participant GW as PaymentGateway Sandbox (3DS)

    SV->>UI: Chọn máy, kỳ hạn (3/6/12 tháng) & tick Consent NĐ 13/2023
    SV->>UI: Upload ảnh CCCD + Thẻ sinh viên
    UI->>FG: POST /installment/submit (IP, UserID, Files)
    FG->>DB: Kiểm tra Rate Limit & wp_gf_fraud_blacklist
    alt Vi phạm Rate Limit hoặc nằm trong Blacklist
        FG-->>UI: Trả lỗi 429 / 403 Từ chối tiếp nhận
    else Hợp lệ
        FG->>Plugin: Chuyển tiếp xử lý hồ sơ
        Plugin->>Vault: Mã hóa AES-256 & lưu tệp ngoài thư mục public
        Plugin->>DB: Tạo bản ghi trạng thái SUBMITTED
        Plugin-->>UI: Hiển thị mã hồ sơ & thông báo chờ duyệt 2 lớp

        Rev->>DB: Duyệt Lớp 1 - Giải mã kiểm tra CCCD & Thẻ SV
        DB-->>Rev: Cập nhật L1_DOCS_VERIFIED
        Rev->>SV: Duyệt Lớp 2 - Xác nhận SĐT & Email .edu.vn
        Rev->>DB: Cập nhật APPROVED_WAITING_DOWNPAYMENT
        DB-->>SV: Gửi thông báo thanh toán khoản trả trước

        SV->>GW: Thanh toán tiền trả trước (3D-Secure Sandbox)
        GW-->>Plugin: Callback IPN xác nhận giao dịch hợp lệ
        Plugin->>DB: Chuyển trạng thái ACTIVE_INSTALLMENT & PROCESSING
    end
```

### 6.2. Mẫu Activity Diagram – Gói Role 1: So sánh cấu hình 2–3 Laptop/PC (`UC-02`)

```mermaid
flowchart TD
    Start(["Bắt đầu"]) --> Browse["Sinh viên duyệt Danh mục / Kết quả lọc (UC-01)"]
    Browse --> ClickCompare["Nhấn nút So sánh trên thẻ Laptop/PC"]
    ClickCompare --> CheckCount{"Số máy trong khay < 3?"}
    CheckCount -- "Không (Đã đủ 3)" --> ShowLimit["Hiển thị cảnh báo tối đa 3 máy"] --> ViewBar
    CheckCount -- "Có" --> CheckCat{"Cùng nhóm thiết bị (Laptop/PC)?"}
    CheckCat -- "Không" --> ShowMismatch["Thông báo chỉ so sánh thiết bị cùng loại"] --> Browse
    CheckCat -- "Có" --> AddSession["Thêm vào ComparisonSession"]
    AddSession --> ViewBar["Hiển thị thanh khay so sánh ở cuối màn hình"]
    ViewBar --> TriggerTable["Nhấn Xem bảng so sánh"]
    TriggerTable --> FetchSpecs["Truy vấn ProductSpecAttribute & Tính góp dự kiến/tháng"]
    FetchSpecs --> RenderTable["Hiển thị bảng đối chiếu CPU, RAM, GPU, Giá, Tiền góp/tháng"]
    RenderTable --> ActionChoice{"Hành động tiếp theo?"}
    ActionChoice -- "Xóa 1 máy" --> RemoveOne["Cập nhật lại bảng so sánh"] --> RenderTable
    ActionChoice -- "Chọn mua / Trả góp" --> GoDetail["Điều hướng sang Checkout / Đăng ký trả góp (UC-08 / UC-10)"] --> EndNode(["Kết thúc"])
```
