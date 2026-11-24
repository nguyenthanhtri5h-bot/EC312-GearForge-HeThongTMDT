export interface VibeCampusAsset {
  id: string;
  campus: string;
  title: string;
  img: string;
  alt: string;
  quote: string;
}

const DEFAULT_FLAGSHIP_BASE = '/wp-content/themes/gearforge-child/assets/flagship';

export function getGfAssetBase(): string {
  const bootBase =
    typeof window !== 'undefined' ? window.gfFlagshipBoot?.themeAssetBase : undefined;
  return (bootBase || DEFAULT_FLAGSHIP_BASE).replace(/\/+$/, '');
}

export const GF_ASSET_BASE = getGfAssetBase();

export function vibeUrl(relPath: string): string {
  return `${GF_ASSET_BASE}/vibe/${relPath.replace(/^\/+/, '')}`;
}

export const VIBE_VIDEOS = {
  heroShowcase: vibeUrl('videos/gf-hero-showcase-1080p.mp4'),
  heroRiotCinematic: vibeUrl('videos/gf-hero-riot-1080p.mp4?v=4'),
  labPc: vibeUrl('videos/gf-lab-pc-1080p.mp4'),
  campusLaptop: vibeUrl('videos/gf-campus-laptop-1080p.mp4'),
  deskOrbit: vibeUrl('videos/gf-desk-orbit-1080p.mp4'),
  pcBuild: vibeUrl('videos/gf-pc-build-1080p.mp4'),
  shopShowcase: vibeUrl('videos/gf-shop-showcase-1080p.mp4'),
  ecosystemFlow: vibeUrl('videos/gf-ecosystem-flow-1080p.mp4'),
  reelGaming: vibeUrl('videos/gf-reel-gaming-1080p.mp4'),
  reelAstronaut: vibeUrl('videos/gf-reel-astronaut-1080p.mp4'),
  reelUnbox: vibeUrl('videos/gf-reel-unbox-1080p.mp4'),
  reelNight: vibeUrl('videos/gf-reel-night-1080p.mp4'),
  reelTour: vibeUrl('videos/gf-reel-tour-1080p.mp4'),
  reelMacro: vibeUrl('videos/gf-reel-macro-1080p.mp4'),
  posterHeroShowcase: vibeUrl('videos/gf-hero-showcase-poster.jpg'),
  posterHeroRiot: vibeUrl('videos/gf-hero-riot-poster.jpg?v=4'),
  posterLab: vibeUrl('videos/gf-lab-pc-poster.jpg'),
  posterCampus: vibeUrl('videos/gf-campus-laptop-poster.jpg'),
  posterDeskOrbit: vibeUrl('videos/gf-desk-orbit-poster.jpg'),
  posterPcBuild: vibeUrl('videos/gf-pc-build-poster.jpg'),
  posterShopShowcase: vibeUrl('videos/gf-shop-showcase-poster.jpg'),
  posterEcosystemFlow: vibeUrl('videos/gf-ecosystem-flow-poster.jpg'),
  posterReelGaming: vibeUrl('videos/gf-reel-gaming-poster.jpg'),
  posterReelAstronaut: vibeUrl('videos/gf-reel-astronaut-poster.jpg'),
  posterReelUnbox: vibeUrl('videos/gf-reel-unbox-poster.jpg'),
  posterReelNight: vibeUrl('videos/gf-reel-night-poster.jpg'),
  posterReelTour: vibeUrl('videos/gf-reel-tour-poster.jpg'),
  posterReelMacro: vibeUrl('videos/gf-reel-macro-poster.jpg'),
} as const;

export const VIBE_PORTFOLIO_CARDS = {
  campus: [
    {
      id: 'uit',
      campus: 'UIT · Khoa KHMT',
      title: 'RTX 5070 AI Rig',
      img: vibeUrl('hardware/campus-uit-ai.jpg'),
      alt: 'Góc học tập AI sinh viên UIT',
      quote: 'Nhờ gói trả góp 0% qua thẻ SV UIT, mình nhận ROG G16 ngay trước kỳ đồ án Deep Learning.',
    },
    {
      id: 'bk',
      campus: 'Bách Khoa · Cơ Điện Tử',
      title: 'Workstation CAD',
      img: vibeUrl('hardware/campus-bk-cad.jpg'),
      alt: 'Workstation CAD sinh viên Bách Khoa',
      quote: 'Kỹ thuật GearForge test stress SolidWorks và cài sẵn driver trước khi giao tới tận phòng.',
    },
    {
      id: 'khtn',
      campus: 'KHTN · Toán - Tin',
      title: 'Ultrabook Linux',
      img: vibeUrl('hardware/laptop-rog-rgb.jpg'),
      alt: 'Ultrabook Linux sinh viên KHTN',
      quote: 'Máy nhẹ gọn, dual-boot Ubuntu mượt mà, tra cứu bảo hành điện tử trực tuyến cực tiện.',
    },
    {
      id: 'ktx',
      campus: 'KTX Khu B ĐHQG',
      title: 'Mini-ITX Desk Setup',
      img: vibeUrl('hardware/pc-mini-itx.jpg'),
      alt: 'Setup bàn học KTX Khu B ĐHQG',
      quote: 'Đặt buổi sáng là chiều 2 tiếng sau shipper đã giao tận cổng KTX Khu B kèm hóa đơn VAT.',
    },
    {
      id: 'creator',
      campus: 'Media Club UIT',
      title: 'Monitor OLED 240Hz',
      img: vibeUrl('hardware/monitor-oled.jpg'),
      alt: 'Setup dựng phim 4K OLED Media Club UIT',
      quote: 'Render video 4K DaVinci Resolve nhanh gấp đôi, màn OLED chuẩn màu tuyệt đối.',
    },
    {
      id: 'esports',
      campus: 'ĐHQG Esports Arena',
      title: 'Combo Phím Cơ & Chuột',
      img: vibeUrl('hardware/gallery-esports-desk.jpg'),
      alt: 'Gear Esports ĐHQG-HCM',
      quote: 'Phím cơ custom và chuột không dây siêu nhẹ, FPS ổn định suốt giải đấu Làng Đại học.',
    },
  ] satisfies VibeCampusAsset[],
  hardware: {
    laptopCreator: vibeUrl('hardware/laptop-creator.jpg'),
    laptopGaming: vibeUrl('hardware/laptop-gaming.jpg'),
    laptopRogRgb: vibeUrl('hardware/laptop-rog-rgb.jpg'),
    laptopKatana: vibeUrl('hardware/laptop-katana.jpg'),
    laptopUltrabook: vibeUrl('hardware/laptop-ultrabook.jpg'),
    pcMinimal: vibeUrl('hardware/pc-minimal.jpg'),
    pcMiniItx: vibeUrl('hardware/pc-mini-itx.jpg'),
    pcWatercool: vibeUrl('hardware/pc-watercool.jpg'),
    pcWorkstation: vibeUrl('hardware/pc-workstation.jpg'),
    monitorOled: vibeUrl('hardware/monitor-oled.jpg'),
    gearPeripherals: vibeUrl('hardware/gear-peripherals.jpg'),
    gearAudioHub: vibeUrl('hardware/gear-audio-hub.jpg'),
    gearBackpack: vibeUrl('hardware/gear-backpack.jpg'),
    campusUitAi: vibeUrl('hardware/campus-uit-ai.jpg'),
    campusBkCad: vibeUrl('hardware/campus-bk-cad.jpg'),
    gearBundle: vibeUrl('hardware/gear-peripherals.jpg'),
    galleryEsportsDesk: vibeUrl('hardware/gallery-esports-desk.jpg'),
    riotPcTitan: vibeUrl('riot-card-rtx-pc.jpg'),
    riotGamingLaptop: vibeUrl('riot-card-gaming-laptop.jpg'),
    riotUltrabook: vibeUrl('riot-card-ultrabook.jpg'),
    riotGearArena: vibeUrl('riot-card-gear.jpg'),
    riotSplitStatue: vibeUrl('riot-split-statue.jpg'),
    riotP1ApexPc: vibeUrl('riot-p1-apex-pc.jpg'),
    riotP2Valkyrie: vibeUrl('riot-p2-valkyrie-laptop.jpg'),
    riotP3Cipher: vibeUrl('riot-p3-cipher-ultrabook.jpg'),
    riotP4Titan: vibeUrl('riot-p4-titan-workstation.jpg'),
    riotP5Strike: vibeUrl('riot-p5-strike-gear.jpg'),
    riotNewsLead: vibeUrl('riot-news-lead.jpg'),
    riotNewsBooth: vibeUrl('riot-news-booth.jpg'),
  },
} as const;
