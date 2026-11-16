# DESIGN.md — GearForge Hardware Flagship Design System

> Chuẩn hóa giao diện UI/UX cho **GearForge** (EC312 – Hệ thống TMĐT Laptop, PC & Phụ kiện cho sinh viên ĐHQG TP.HCM), tuân thủ nguyên tắc **Anti-AI-Slop** & **WCAG AA**.

## 1. Visual Direction
- **Aesthetic:** Precision Hardware Flagship (lấy cảm hứng từ ThinkPro, MemoryZone, Apple Hardware Store & Vercel). Sạch sẽ, mật độ thông tin kỹ thuật rõ ràng, không badge rác (`HOT`, `MỚI`, `VIP`), không gradient tím/hồng.
- **Typography:** `Plus Jakarta Sans` (Display/Headings), `Inter` (Body/UI), `JetBrains Mono` (SKU, Serial Number `S/N`, mã trạng thái), sử dụng `font-variant-numeric: tabular-nums` cho toàn bộ giá VNĐ và bảng trả góp.

## 2. Color Tokens
| Token | Hex | Vai trò |
|---|---|---|
| `--gf-bg-canvas` | `#F4F6F9` | Nền trang chính (làm nổi thẻ trắng) |
| `--gf-surface` | `#FFFFFF` | Thẻ sản phẩm, bảng Compare, form Checkout |
| `--gf-obsidian` | `#0B1220` | Header, thanh Compare Tray, Hero banner |
| `--gf-cobalt` | `#0066FF` | **Primary Accent duy nhất** (CTA chính, nút lọc đang chọn) |
| `--gf-cobalt-hover` | `#0052CC` | Trạng thái hover CTA chính |
| `--gf-ink` | `#0F172A` | Chữ chính (contrast ≥ 14:1 trên nền trắng) |
| `--gf-ink-muted` | `#475569` | Mô tả phụ, nhãn thông số |
| `--gf-border` | `#E2E8F0` | Viền hairline `1px` đồng bộ mọi thẻ |
| `--gf-emerald` | `#059669` | Semantic: `0% lãi`, `Đã duyệt L1/L2`, `PASS` |
| `--gf-amber` | `#D97706` | Semantic: `Consent NĐ 13/2023`, `Chờ duyệt` |
| `--gf-crimson` | `#DC2626` | Semantic: Giá khuyến mãi, cảnh báo thiếu `S/N` |

## 3. Geometry & Elevation
- **Section Container:** `border-radius: 16px`, `1px solid #E2E8F0`
- **Product Card & Widget:** `border-radius: 12px`, shadow nhẹ `0 1px 3px rgba(15, 23, 42, 0.05)`
- **Buttons & Inputs:** `border-radius: 10px`, chiều cao tối thiểu `42px` (`>= 44px` trên Mobile)
- **Spec Chips:** `border-radius: 6px`, nền `#F1F5F9`, chữ `12px`
- **Responsive Breakpoints:** Desktop `>= 1280px` (4 cột), Tablet `768px–1024px` (2–3 cột), Mobile `375px` (1–2 cột, bảng cuộn ngang nội bộ không tràn `scrollWidth`).
