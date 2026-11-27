# MEMORY — GearForge ĐHQG-HCM Flagship (Role 3 + Integrated Role 4 Ready-for-VPS)

> **Cập nhật lần cuối**: 2026-11-27 19:35 (`UTC+7`)  
> **Nhánh hiện tại**: `integrate/riot-xgear-h1` *(toàn bộ nâng cấp & sửa lỗi đang nằm ở working tree local, chưa commit — cần `git commit` + `git push` sau khi mở lại máy)*  
> **Trạng thái hiện tại**: Đã hoàn thiện 100% giao diện chuẩn Riot Obsidian/Crimson trên toàn bộ 8 route React SPA + trang WooCommerce PHP, đồng bộ **Role 4 FIX-16 (`9b8029c`)**, nâng cấp **8 video 4K 60fps**, tạo **18 ảnh 2D Riot/Arcane/Valorant mới**, vá lỗ hổng tích hợp & hardening chuẩn bị deploy VPS (**`VERDICT: PASS`**).

---

## 1. Các hạng mục đã hoàn tất & xác minh (2026-11-27)

### A. Video 4K 60fps & Xóa Watermark
- Nâng cấp 8 video active (`h264_qsv`, `minterpolate=fps=60`, scale `lanczos`) + delogo `Veo` + tạo lại poster, gắn `?v=4k60` trong `themes/gearforge-child/flagship-src/src/data/vibeMedia.ts`:
  - **5 video ngang (`3840x2160`, `60/1 fps`)**: `gf-hero-riot-1080p.mp4`, `gf-shop-showcase-1080p.mp4`, `gf-pc-build-1080p.mp4`, `gf-desk-orbit-1080p.mp4`, `gf-hero-showcase-1080p.mp4`.
  - **3 vertical reels (`2160x3840`, `60/1 fps`)**: `gf-reel-unbox-1080p.mp4`, `gf-reel-tour-1080p.mp4`, `gf-reel-macro-1080p.mp4`.
- `HeroSection.tsx`: gắn `fetchPriority="high"` cho poster `<img />`, `preload="metadata"` cho `<video>`, tôn trọng `navigator.connection.saveData`.

### B. Ảnh 2D Riot/Arcane/Valorant Mới & Khử Trùng Lặp
- Đã tạo **18 ảnh 2D** từ Google Flow (Batch A + Batch B), xóa sạch ngôi sao Gemini & badge `AI` góc phải dưới (`1280x720` JPEG):
  - `RiotBrandSwitcher.tsx` + `brandSwitcherData.ts`: **16/16 link** gắn **16 artwork & tiêu đề/mô tả 1:1 riêng biệt**.
  - `RiotDealsBento.tsx`: chọn đúng ảnh PC/Laptop theo danh mục thực tế (`bentoPc`/`bentoLaptop`) và thay ảnh trả góp mới `riot-news-installment.jpg`.
  - `RiotEcosystemAndSplit.tsx` & `subpageBandsData.ts`: dùng ảnh 2D mới (`branchAi`, `branchCad`, `ecoCardAi`, `ecoCardSetup`, `ecoCardOms`).
  - `BrandSwitcherPreview.tsx`: cập nhật `swPromoEco` và `swPromoGal`.
  - `FloatingWidgets.tsx`: thay icon gấu bằng `<CrestIcon />`.

### C. Dropdown Header Nền Trắng & Sửa Lỗi Kẹt Hover/Focus
- `Header.tsx` (217 dòng) & `ProductMegaMenu.tsx` (109 dòng): chuyển cơ chế mở/đóng menu từ CSS `:hover`/`:focus-within` sang state `openMenuId` + `closeMenuNow()` + `.blur()` ngay khi click/rời chuột/nhấn `Escape`/đổi trang.
- `header.css` & `hover-reveal.css`: chuyển toàn bộ nền dropdown (`SẢN PHẨM`, `HỆ SINH THÁI`, `TRA CỨU ĐƠN`) sang `#FFFFFF` sắc nét đồng bộ `RiotBrandSwitcher`, giữ preview card tối `#0B0B0D`.

### D. Tích Hợp Role 4 FIX-16 (`9b8029c`) & Hardening PHP/WooCommerce
- Đã đồng bộ 5 file từ `origin/role4-backend-payment`: `class-gf-installment-review.php`, `class-gf-invoice-pdf.php`, `class-gf-rma-manager.php`, `class-gf-serial-manager.php`, `verify-role4.php` (kèm fallback demo user `user`/`student_test`, `admin`/`gf_admin`).
- `class-gf-installment-review.php`: thêm guard `get_post_status_object('wc-gf-installment') === null` + `exclude_from_search => true` tránh đụng độ status với `gearforge-core.php`.
- `class-gf-payment-sandbox.php`: redirect sau thanh toán 3DS về `/tra-cuu-don-hang/?order_id={id}&gf_paid=1` (có filter `gf_sandbox_success_redirect_url`) và giữ font `Inter`.
- `gearforge-core.php`: vá lỗ hổng AJAX `ajax_submit_installment_app()` — chuẩn hóa SĐT `+84/84 -> 0`, truyền đủ `'phone'` và `'client_ip'` vào `submit_application()`, trả `403` khi `gf_blacklisted`; bump `GF_CORE_VERSION = '1.0.2'`.
- `OmsTrackingPageView.tsx` & `OmsLookupPanel.tsx`: bỏ fallback cứng `#542`, tự fetch đúng `initialOrderId` thật khi redirect từ 3DS, hiển thị banner xác nhận + nút **"Làm mới trạng thái"** và tự xóa `gf_paid=1` khỏi URL qua `history.replaceState`.
- `functions.php` & CSS (`cosmic-secondary.css`, `gearforge-frontend.css`, `sections.css`, `widgets.css`):
  - Sửa ảnh trang single product PHP (`woocommerce_single_product_image_thumbnail_html` khi `image_id <= 0`, sửa triệt để lỗi MacBook nền tím ở ID=217).
  - Header/Footer PHP đồng bộ Flagship, Hero strip full-width `#08080A`, xóa sạch `'Plus Jakarta Sans'`, mã tím `#6D28D9`/`#F3F0FF`, mã xanh `#2563eb` và màu xanh mint `.gf-product-installment-cta`.
  - Vá OMS enumeration trả `404` đồng nhất, cắt ngoặc mở `(` trong `gf_flagship_extract_specs`.
  - Tắt `xmlrpc_enabled`, thêm 4 security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`), gắn `<meta name="robots" content="noindex, nofollow" />` cho route đơn hàng/giỏ hàng riêng tư và OpenGraph dynamic dùng `home_url()`.
- Tạo tài liệu triển khai VPS: `VPS-DEPLOY-CHECKLIST.md`.

---

## 2. Quy chuẩn & Công cụ Bắt Buộc
- **Package Manager**: **CHỈ DÙNG `pnpm`** (tuyệt đối không dùng `npm`):
  - Build: `pnpm --dir "d:\DANMH\TKeHT\themes\gearforge-child\flagship-src" run build`
- **Giới hạn độ dài file**: Toàn bộ `.ts` / `.tsx` trong `themes/gearforge-child/flagship-src/src/` bắt buộc **< 250 dòng (`OVER_250: []`)**.
- **Design System**: Riot Obsidian (`#08080A` / `#111111`), Warm Cream (`#F1F0EC`), Crimson (`#D13639`), dropdown trắng `#FFFFFF`, `Be Vietnam Pro` / `Barlow` / `Inter` / `JetBrains Mono`.

---

## 3. Lần kiểm tra & build cuối (Trước khi reset máy)
- **`pnpm` Build**: Thành công (`1.96s`), output tại `themes/gearforge-child/assets/flagship/` (`flagship.css` `142.25 kB`, `flagship.js` `496.00 kB`).
- **Role 4 FIX-16 Suite (`docker exec gearforge_wp php /var/www/html/wp-content/plugins/gearforge-core/tests/verify-role4.php`)**: **`SUMMARY: 35 passed, 0 failed.`**
- **PHP Lint (`php -l`)**: `0` lỗi trên toàn bộ 8 file PHP (`functions.php`, `gearforge-core.php`, `class-gf-*.php`, `verify-role4.php`).
- **LOC Gate & Browser QA**: `OVER_250: []`; Desktop `1440x900` & Mobile `375x812` HTTP `200`, `0` lỗi console/network, `0px` tràn ngang, đã xác minh trực quan luồng `/tra-cuu-don-hang/?order_id=543&gf_paid=1` và dropdown nền trắng.

---

## 4. Việc cần làm ngay khi bật lại máy
1. Bật Docker Desktop và đảm bảo 2 container `gearforge_wp`, `gearforge_mysql` chạy (`http://localhost:8080`).
2. Kiểm tra `git status` trên nhánh `integrate/riot-xgear-h1`, rà soát diff và **`git commit` + `git push`** trước khi kéo lên VPS.
3. Trên VPS thật (Ubuntu + Nginx + SSL), thực hiện đúng 5 bước trong `VPS-DEPLOY-CHECKLIST.md` (`gf-vault` ra ngoài webroot `chmod 700`, Nginx `set_real_ip_from` Cloudflare + `mp4` Byte-Range + `Cache-Control`, `wp search-replace --precise`, `certbot`, cron hệ thống, và chạy lại `verify-role4.php`).
