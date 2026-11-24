# GearForge Precision Commerce 2026 — MONA Flagship Design System (`DESIGN.md`)

> **Single Source of Truth cho Role 3 (`role3-ui-frontend`) — EC312 GearForge (Nhóm 7)**  
> Kiến trúc mục tiêu: **Blocksy Parent Theme + Blocksy Companion (Free)** + **`gearforge-child`** + **`gearforge-core` (4 Custom GAPs)** + **`figma-prototype` (6 Frame bắt buộc)**.  
> Ngôn ngữ thị giác: **MONA Media High-Energy Tech Flagship** (`mona.media`) kết hợp chuẩn `ui-ux-pro-max`, `anti-ai-slop-ui`, `frontend-design` và Buy/Customize EC312.

---

## 1. Visual Direction & Anti-AI-Slop Rules

GearForge chuyển sang diện mạo **MONA Media High-Energy Tech Flagship**: nền sáng Lavender-White (`#F8F7FF`) thoáng mắt, **Frosted Light Glass Header** (`rgba(255, 255, 255, 0.90)`), **Mesh Gradient Hero Stage** đa sắc tím-hồng-cam tiết chế đúng điểm nhấn, 8 ảnh studio phần cứng tách nền riêng biệt và Product Card hành động 1 hàng gọn mắt.

### 5 Quy tắc Bất di bất dịch (Pre-Ship Gate)
1. **1 Màu nhấn chính (`#6D28D9` Electric Royal Violet) + Dải nhấn MONA tiết chế:** Toàn bộ CTA nút bấm chính, tab active, thanh tiến độ OMS và focus ring dùng `#6D28D9` (hover `#5B21B6`). Dải gradient `--gf-mona-grad` (`#6D28D9 → #C026D3 → #EA580C`) chỉ dùng có chọn lọc tại Logo mark, cụm highlight Hero (`span.gf-text-grad`) và nút CTA Hero chính. Trạng thái nghiệp vụ giữ màu ngữ nghĩa WCAG AA (`Success #047857`, `Warning #B45309`, `Danger #B91C1C`).
2. **Xóa sạch nhãn rác & tem lặp:** Không gắn tem tĩnh `HOT`, `MỚI`, `VIP`, `ƯU ĐÃI SV` lên mọi card; không dùng emoji làm icon UI; không thêm mũi tên `→` vào đuôi nút. Badge `-X%` chỉ hiện khi `sale_price < regular_price`.
3. **Bố cục Thoáng, Sidebar Chống Kéo Dài & Card Action 1 Hàng:** Filter sidebar cố định chiều cao dưới lưới sản phẩm (nhóm HUSKY dạng pill gọn + block CPU/RAM/GPU cuộn `max-height: 150px`), đồng thời chuyển bottom action của Product Card sang **1 hàng ngang** (`Thêm vào giỏ` + `+ So sánh`) qua CSS Grid 2 cột.
4. **8 Ảnh Studio Phần Cứng Riêng Biệt (`16:10`, nền `#F3F0FF`/`#F3F4F6`):** Định tuyến 8 tài nguyên studio khác nhau (`laptop-ultrabook.jpg`, `laptop-gaming.jpg`, `laptop-creator.jpg`, `laptop-katana.jpg`, `pc-workstation.jpg`, `pc-minimal.jpg`, `pc-watercool.jpg`, `gear-bundle.svg`) kết hợp xen kẽ Laptop & PC ngay từ Trang 1 để không lặp lại cùng 1 ảnh trên các card liền kề.
5. **Copywriting trung thực & Tương phản WCAG AA (`>= 4.5:1`):** Động từ rõ hành động (*"Thêm vào giỏ"*, *"+ So sánh"*, *"Tính trả góp"*, *"Nộp hồ sơ Trả góp Sinh viên"*, *"Đặt hàng ngay"*).

---

## 2. Color Palette & Blocksy Customizer Token Mapping

> Token `:root` khai báo **1 lần duy nhất** tại `themes/gearforge-child/style.css` và ánh xạ trực tiếp sang **Blocksy Global Color Palette (`--theme-palette-color-1..8`)**. `plugins/gearforge-core/assets/css/gearforge-frontend.css` chỉ tiêu thụ `var(--gf-*, fallback)`.

| GearForge Token | Giá trị Hex / RGBA | Blocksy Variable Mapping | Vai trò & Kiểm định WCAG AA (`>= 4.5:1`) |
|---|---|---|---|
| `--gf-accent` | `#6D28D9` | `--theme-palette-color-1` | Electric Royal Violet — CTA chính, active pill, OMS progress, focus ring (`7.13:1` với `#FFFFFF`) |
| `--gf-accent-hover` | `#5B21B6` | `--theme-palette-color-2` | Deep Royal Violet — Hover state của CTA chính (`8.98:1` với `#FFFFFF`) |
| `--gf-ink` | `#1E1B4B` | `--theme-palette-color-3` | Deep Indigo-Slate — Tiêu đề, tên SP, giá chính, text trên Light Glass Header (`14.5:1` trên `#FFFFFF`) |
| `--gf-ink-2` | `#4C4968` | `--theme-palette-color-4` | Muted Indigo-Slate — Mô tả phụ, chip thông số (`7.4:1` trên `#FFFFFF`) |
| `--gf-ink-3` | `#6E6A8F` | — | Giá gạch ngang, caption phụ **chỉ dùng trên `#FFFFFF`** (`4.8:1`); trong nền phụ dùng `--gf-ink-2` |
| `--gf-border` | `rgba(109, 40, 217, 0.11)` | `--theme-palette-color-5` | Viền hairline `1px` ánh tím đồng bộ card, bảng, accordion |
| `--gf-border-strong` | `rgba(109, 40, 217, 0.22)` | — | Viền input, select, nút ghost |
| `--gf-surface-muted` | `#F3F0FF` | `--theme-palette-color-6` | Lavender Tint — Khung nền ảnh studio, chip thông số, KPI phụ |
| `--gf-bg` | `#F8F7FF` | `--theme-palette-color-7` | Soft Lavender-White — Nền canvas trang chính |
| `--gf-surface` | `#FFFFFF` | `--theme-palette-color-8` | Card sản phẩm, panel Checkout, bảng Compare, sidebar |
| `--gf-obsidian` | `#120D24` | Footer / Tray Dark | Deep Royal Midnight — Footer 3 cột & Floating Compare Tray |
| `--gf-accent-soft` | `#F3E8FF` | — | Nền pill đang chọn, badge `Hardware` (ghép chữ `#5B21B6` hoặc `#6D28D9`) |
| `--gf-mona-grad` | `linear-gradient(135deg, #6D28D9 0%, #C026D3 52%, #EA580C 100%)` | — | Gradient nhấn Hero highlight, CTA chính Hero & Logo icon mark |
| `--gf-success` | `#047857` | — | Emerald 700 — Góp `0%`, còn hàng S/N (`5.48:1` với `#FFFFFF`) |
| `--gf-success-soft` | `#ECFDF5` | — | Nền badge đạt duyệt L1/L2 & góp 0% |
| `--gf-warning` | `#B45309` | — | Amber 700 — Chờ duyệt hồ sơ, chờ trả trước |
| `--gf-warning-soft` | `#FFFBEB` | — | Nền badge trạng thái chờ |
| `--gf-danger` | `#B91C1C` | — | Crimson 700 — Giá sale thực tế, lỗi validate, `-X%` badge (`5.83:1` trên `#FEF2F2`) |
| `--gf-danger-soft` | `#FEF2F2` | — | Nền badge `-X%` & `.gf-alert-danger` |

### Blocksy Root Alias Contract (khai báo trong `themes/gearforge-child/style.css`)
```css
:root {
  --gf-bg: #F8F7FF;
  --gf-surface: #FFFFFF;
  --gf-surface-muted: #F3F0FF;
  --gf-ink: #1E1B4B;
  --gf-ink-2: #4C4968;
  --gf-ink-3: #6E6A8F;
  --gf-border: rgba(109, 40, 217, 0.11);
  --gf-border-strong: rgba(109, 40, 217, 0.22);
  --gf-obsidian: #120D24;
  --gf-accent: #6D28D9;
  --gf-accent-hover: #5B21B6;
  --gf-accent-soft: #F3E8FF;
  --gf-mona-grad: linear-gradient(135deg, #6D28D9 0%, #C026D3 52%, #EA580C 100%);
  --gf-success: #047857;
  --gf-success-soft: #ECFDF5;
  --gf-warning: #B45309;
  --gf-warning-soft: #FFFBEB;
  --gf-danger: #B91C1C;
  --gf-danger-soft: #FEF2F2;

  --gf-font-display: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
  --gf-font-body: 'Inter', system-ui, sans-serif;
  --gf-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  --gf-r-lg: 20px;
  --gf-r-md: 14px;
  --gf-r-sm: 8px;
  --gf-shadow-sm: 0 2px 10px -4px rgba(109, 40, 217, 0.08);
  --gf-shadow-md: 0 14px 34px -12px rgba(109, 40, 217, 0.14);
  --gf-ease: cubic-bezier(0.22, 1, 0.36, 1);

  --theme-palette-color-1: var(--gf-accent);
  --theme-palette-color-2: var(--gf-accent-hover);
  --theme-palette-color-3: var(--gf-ink);
  --theme-palette-color-4: var(--gf-ink-2);
  --theme-palette-color-5: var(--gf-border);
  --theme-palette-color-6: var(--gf-surface-muted);
  --theme-palette-color-7: var(--gf-bg);
  --theme-palette-color-8: var(--gf-surface);
  --theme-font-family: var(--gf-font-body);
  --theme-headings-font-family: var(--gf-font-display);
  --theme-container-max-width: 1320px;
  --theme-border-radius: var(--gf-r-md);
}
```

---

## 3. Typography, Geometry, Elevation & Z-Index Scale

- **Display / Headings:** `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`, `letter-spacing: -0.025em`, `font-weight: 600–800`, màu `#1E1B4B`.
- **Body / Controls:** `'Inter', system-ui, sans-serif`, `15px` desktop (`line-height: 1.55`), **`16px` ở `@media (max-width: 640px)`** trên body và input để ngăn iOS/Android auto-zoom.
- **Numerals / Specs / Serials:** `'JetBrains Mono', monospace` + `font-variant-numeric: tabular-nums` áp dụng bắt buộc cho toàn bộ giá VND, tiền góp/tháng, phần trăm giảm giá, bộ đếm giỏ hàng và mã `S/N`.
- **Geometry:** Card/Panel/Sidebar/Hero `20px` (`--gf-r-lg`, riêng Hero Stage `24px`), Button/Input/Image `14px` (`--gf-r-md`), Chip/Badge/Pill `8px` (`--gf-r-sm`).
- **Motion:** Chỉ animate `transform`, `opacity`, `background-color`, `border-color` trong `180ms var(--gf-ease)`. Hover card `translateY(-2px)` + `--gf-shadow-md`. Nhấn nút `scale(0.98)`. Bắt buộc hỗ trợ `@media (prefers-reduced-motion: reduce)`.
- **Z-Index Scale:**
  - `10`: Sticky Product Gallery / Sticky Checkout Order Summary / Compare first column (`2`).
  - `30–40`: Frosted Light Glass Sticky Header (`header#header`).
  - `50`: Off-Canvas Drawers (`#offcanvas`, Mobile Filter Drawer).
  - `60`: Floating Compare Tray (`#gf-compare-tray`).

---

## 4. Blocksy + GearForge Architecture & Role 4 Hook Compatibility

| Khu vực giao diện | Cơ chế Blocksy / Child Theme | WooCommerce / Role 4 Hooks giữ nguyên |
|---|---|---|
| **Frosted Light Glass Header** | Blocksy Header Builder 1 dòng (`rgba(255, 255, 255, 0.90)` + `backdrop-filter: blur(20px)` + border `rgba(109, 40, 217, 0.12)` + shadow nhẹ), Logo icon gradient MONA + chữ `#1E1B4B` + badge `Hardware` (`#F3E8FF` / `#5B21B6`), link `#1E1B4B` hover pill `#F3E8FF`, icons `#1E1B4B`. | `woocommerce_add_to_cart_fragments`. |
| **Slide-out Mini Cart** | Blocksy Off-Canvas Cart Dropdown/Drawer: nền `#FFFFFF`, giá `tabular-nums`, CTA `#6D28D9`. | `woocommerce_widget_shopping_cart_buttons`, `woocommerce_mini_cart_contents`. |
| **MONA Mesh Hero + Visual Category Pills** | Hook `blocksy:content:top` bọc `.ct-container > .gf-bento-shell`: Light Mesh Gradient (`#F3E8FF → #FFFFFF → #FFF7ED`), tiêu đề highlight gradient `.gf-text-grad`, 3 Trust Metric Pills (`.gf-hero-metrics`), Hero visual kèm badge nổi `.gf-hero-float-badge` (`Duyệt .edu.vn 2 lớp • AES-256 NĐ 13/2023`) + dải danh mục có thumbnail `28×28px`. | Không phá vỡ `woocommerce_breadcrumb` hoặc `woocommerce_archive_description`. |
| **Off-Canvas Mobile Filter Drawer (`375px`)** | Desktop (`>= 1000px`): `.ct-sidebar` trái `268px`, HUSKY pills & scrollable CPU/RAM/GPU (`max-height: 150px`), Price Slider Royal Violet `#6D28D9`. Mobile (`< 1000px`): Drawer trượt mở qua nút `Bộ lọc` `>= 44×44px`. | Tương thích HUSKY (`woof_widget`) & `WC_Widget_Price_Filter`. |
| **Product Cards (1-Row Actions + 8 Studio Images)** | Lưới `ul.products` (`3` cột desktop có sidebar, `2` cột tablet, `1` cột `375px`). Mỗi `li.product` dùng CSS Grid `minmax(0, 1fr) auto` ở hàng cuối để `.ct-woo-card-actions` (`Thêm vào giỏ`) và `.gf-btn-compare-card` (`+ So sánh`) nằm **cùng 1 hàng ngang**. Ảnh định tuyến thông minh across 8 studio visuals và xen kẽ Laptop/PC trang 1. | **Cấm duplicate:** `gearforge-child` chỉ render fallback khi `!class_exists('GF_Core')`; khi `GF_Core` chạy, nhường `woocommerce_after_shop_loop_item` priority `5` & `15`. |
| **Single Product Sticky Gallery** | Fullwidth `.ct-container`, 2 cột (`1fr / 1.05fr`), ảnh studio trái `position: sticky; top: 90px`, bên phải là Summary + `#gf-installment-widget`. | Giữ nguyên `woocommerce_single_product_summary`. |
| **Classic 2-Col 60/40 Checkout** | Classic Checkout chia lưới `minmax(0, 1.5fr) minmax(320px, 1fr)` (`60% / 40%`): `#customer_details` trái, `#order_review` sticky phải + `#payment` (`VNPay / MoMo / Fundiin 3DS`) + `#place_order` `#6D28D9`. | Giữ nguyên `woocommerce_checkout_*`, `woocommerce_review_order_*`, `woocommerce_checkout_process`. |

---

## 5. Đặc tả 4 Thành phần EC312 GAP & 6 Màn hình `figma-prototype/`

- Giữ nguyên 100% hợp đồng biến PHP, `id`, `name`, Nonce, AJAX `gf_compare_action`, `gf_submit_installment_app`, REST `/gearforge/v1/installment-calc`, Consent NĐ 13/2023 khóa `#gf-submit-installment-btn` (`disabled` khi chưa tick), Compare table sticky col-1 + toggle khác biệt, và OMS 7 bước / 8 trạng thái (`CREATED` → `COMPLETED`, ngoại lệ `CANCELLED`/`REFUNDED`) + S/N warranty form.
- `figma-prototype/` đồng bộ 1:1 token `--gf-*`, Light Glass `.store-header`, MONA Mesh `.bento-hero`, ảnh studio đa dạng (`laptop-creator.jpg`, `laptop-katana.jpg`, `pc-minimal.jpg`, `pc-watercool.jpg`), và hành động card 1 hàng trên đủ 6 frame ở cả Desktop `1320px/1440px` lẫn Mobile `375px`.
