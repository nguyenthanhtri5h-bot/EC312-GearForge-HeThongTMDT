# GearForge Design System Specification (Slate Navy Anchors + Crisp Light Shopping Canvas)

> Visual standard for `D:\DANMH\TKeHT\themes\gearforge-child`. Architectural Tech Retail blending **Anti-AI-Slop discipline**, **Xgear merchandising clarity**, and **balanced dark/light visual rhythm** tailored for Vietnamese university students (ĐHQG-HCM).

## 1. 3-Band Color System
- **Anchor Dark Bands (Hero `#top`, Cinema Lab `.ht`, Contact Wrap `.contact-box-wrap`, Secondary Footer `.gf-sec-ft`)**:
  - Background: `#0f172a` (Deep Slate Navy) with radial slate highlight `#1e293b`
  - Elevated Dark Card / Container Surface: `#1e293b` with crisp hairline `1px solid rgba(255, 255, 255, 0.14)` (never flat black `#09090b` so cards never sink into darkness)
  - Dark Surface Typography: `#ffffff` headings, `#cbd5e1` (Slate-300) subtitles & metadata
- **Main Shopping Canvas & Inner WooCommerce Routes (~80% of storefront — Xgear Quick Strip, Flash Deals, Category Shelves, `/shop/`, `/he-sinh-thai/`, `/cau-hinh-mau/`, `/cart/`, `/checkout/`, `/my-account/`, `/so-sanh-cau-hinh/`, `/tra-cuu-don-hang/`, Modals & Drawers)**:
  - Page Canvas Background: `#f8fafc` (Slate-50) / `#ffffff` Pure White alternating cleanly
  - Elevated Product Card / Panel / Header: `#ffffff` with `1px solid #e2e8f0` hairline & crisp depth `0 2px 10px rgba(15, 23, 42, 0.05)`
  - Muted / 2x2 Spec Chip Surface: `#f1f5f9` (Slate-100) with `#334155` text
  - Light Surface Typography: `#0f172a` (Slate-900 primary), `#475569` (Slate-600 secondary)
- **Single Focused Primary CTA Accent**:
  - Electric Cobalt `#2563eb` fill with `#ffffff` text (`#1d4ed8` on hover) across Hero, Header, Product Cards, Shop, Cart & Checkout
  - Secondary Action on Light: `#ffffff` fill with `1px solid #cbd5e1` border & `#0f172a` text
  - Secondary Action on Slate Navy: `rgba(255, 255, 255, 0.08)` fill with `1px solid rgba(255, 255, 255, 0.24)` border & `#ffffff` text
- **Semantic-Only Hues** (reserved strictly for live status & genuine discounts):
  - In stock / verified `.edu.vn`: `#047857` on `#ecfdf5` (`border: #a7f3d0`)
  - Real discount (`regularPrice > price`): `#dc2626` fill with `#ffffff` text

## 2. Hero Showcase & Anti-Clutter Rules
- **Riot-style Full-Bleed Atmospheric Hero Video (`gf-hero-showcase-1080p.mp4`)**: Video plays natively across the full Slate Navy Hero backdrop (`#top`) masked by a directional Slate Navy gradient scrim (`rgba(15, 23, 42, 0.94)` left -> transparent showcase right -> `#0f172a` bottom edge), leaving open visual breathing room on the right with one compact `Showcase Studio` modal trigger pill. Zero overlapping mockups, stickers, or card frames over the video.
- Zero purple/pink neon glows, zero rainbow grids, zero `mona.media` or external copyrighted references.
- Strict `< 250` LOC per `.ts`/`.tsx` source module, `Be Vietnam Pro` + `Inter` Vietnamese typography.
