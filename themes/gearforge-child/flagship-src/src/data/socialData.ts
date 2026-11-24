import { VIBE_PARTNERS, VIBE_PORTFOLIO_CARDS, VIBE_RESULTS, VIBE_VIDEOS } from './vibeAssets';

export interface CustomerVideoItem {
  name: string;
  campus: string;
  title: string;
  poster: string;
  fullVideo: string;
  previewVideo: string;
  quote: string;
}

const CUSTOMER_CLIPS = [
  { v: VIBE_VIDEOS.reelNight, p: VIBE_VIDEOS.posterReelNight },
  { v: VIBE_VIDEOS.pcBuild, p: VIBE_VIDEOS.posterPcBuild },
  { v: VIBE_VIDEOS.campusLaptop, p: VIBE_VIDEOS.posterCampus },
  { v: VIBE_VIDEOS.reelTour, p: VIBE_VIDEOS.posterReelTour },
  { v: VIBE_VIDEOS.reelUnbox, p: VIBE_VIDEOS.posterReelUnbox },
  { v: VIBE_VIDEOS.deskOrbit, p: VIBE_VIDEOS.posterDeskOrbit },
];

export const CUSTOMER_VIDEOS: CustomerVideoItem[] = VIBE_PORTFOLIO_CARDS.campus.map((c, i) => ({
  name: c.campus,
  campus: c.campus,
  title: c.title,
  poster: CUSTOMER_CLIPS[i].p || c.img,
  fullVideo: CUSTOMER_CLIPS[i].v,
  previewVideo: CUSTOMER_CLIPS[i].v,
  quote: c.quote,
}));

const REEL_CLIPS = [
  { v: VIBE_VIDEOS.reelGaming, p: VIBE_VIDEOS.posterReelGaming },
  { v: VIBE_VIDEOS.reelAstronaut, p: VIBE_VIDEOS.posterReelAstronaut },
  { v: VIBE_VIDEOS.reelMacro, p: VIBE_VIDEOS.posterReelMacro },
  { v: VIBE_VIDEOS.reelUnbox, p: VIBE_VIDEOS.posterReelUnbox },
  { v: VIBE_VIDEOS.reelTour, p: VIBE_VIDEOS.posterReelTour },
  { v: VIBE_VIDEOS.reelNight, p: VIBE_VIDEOS.posterReelNight },
];

export const REEL_VIDEOS = VIBE_RESULTS.map((r, i) => ({
  title: `${r.stat} — ${r.label}`,
  poster: REEL_CLIPS[i % REEL_CLIPS.length].p || VIBE_PORTFOLIO_CARDS.campus[i % VIBE_PORTFOLIO_CARDS.campus.length].img,
  overlayPoster: r.img,
  fullVideo: REEL_CLIPS[i % REEL_CLIPS.length].v,
  previewVideo: REEL_CLIPS[i % REEL_CLIPS.length].v,
}));

export const PARTNER_CARDS = [
  {
    href: '/shop/?category=laptop-gaming',
    logo: VIBE_PARTNERS[0].src,
    alt: VIBE_PARTNERS[0].alt,
    name: 'ASUS ROG & NVIDIA RTX',
    tier: 'Đại lý ủy quyền chính hãng',
    desc: 'Phân phối chính hãng dòng ROG Strix, Zephyrus & GPU RTX 40/50 Series chuẩn bảo hành toàn quốc.',
    date: 'Đa dạng cấu hình',
  },
  {
    href: '#gf-installment',
    logo: VIBE_PARTNERS[10].src,
    alt: VIBE_PARTNERS[10].alt,
    name: 'Chương trình Ưu đãi ĐHQG-HCM',
    tier: 'Ưu đãi qua email .edu.vn',
    desc: 'Xác thực nhanh bằng email sinh viên UIT, Bách Khoa, KHTN kèm trả góp 0% & giao KTX trong 2 giờ.',
    date: '0% lãi · Kỳ hạn 3T',
  },
  {
    href: '/tra-cuu-don-hang/',
    logo: VIBE_PARTNERS[7].src,
    alt: VIBE_PARTNERS[7].alt,
    name: 'VNPay-QR · MoMo · Fundiin',
    tier: 'Thanh toán & Hóa đơn VAT',
    desc: 'Thanh toán QR bảo mật, trả góp sinh viên trực tuyến và xuất hóa đơn điện tử kèm bảo hành Serial.',
    date: 'Cập nhật tức thì',
  },
];

export const BRAND_LOGOS = [
  ...VIBE_PARTNERS.map((p) => p.src),
  ...VIBE_PARTNERS.map((p) => p.src),
  VIBE_PARTNERS[0].src,
  VIBE_PARTNERS[4].src,
];
