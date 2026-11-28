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
  heroShowcase: vibeUrl('videos/gf-hero-showcase-1080p.mp4?v=4k60'),
  heroRiotCinematic: vibeUrl('videos/gf-hero-riot-1080p.mp4?v=4k60'),
  labPc: vibeUrl('videos/gf-pc-build-1080p.mp4?v=4k60'),
  campusLaptop: vibeUrl('videos/gf-desk-orbit-1080p.mp4?v=4k60'),
  deskOrbit: vibeUrl('videos/gf-desk-orbit-1080p.mp4?v=4k60'),
  pcBuild: vibeUrl('videos/gf-pc-build-1080p.mp4?v=4k60'),
  shopShowcase: vibeUrl('videos/gf-shop-showcase-1080p.mp4?v=4k60'),
  ecosystemFlow: vibeUrl('videos/gf-ecosystem-flow-1080p.mp4'),
  reelGaming: vibeUrl('videos/gf-reel-gaming-1080p.mp4'),
  reelAstronaut: vibeUrl('videos/gf-reel-astronaut-1080p.mp4'),
  reelUnbox: vibeUrl('videos/gf-reel-unbox-1080p.mp4?v=4k60'),
  reelNight: vibeUrl('videos/gf-reel-night-1080p.mp4'),
  reelTour: vibeUrl('videos/gf-reel-tour-1080p.mp4?v=4k60'),
  reelMacro: vibeUrl('videos/gf-reel-macro-1080p.mp4?v=4k60'),
  posterHeroShowcase: vibeUrl('videos/gf-hero-showcase-poster.jpg?v=4k60'),
  posterHeroRiot: vibeUrl('videos/gf-hero-riot-poster.jpg?v=4k60'),
  posterLab: vibeUrl('videos/gf-pc-build-poster.jpg?v=4k60'),
  posterCampus: vibeUrl('videos/gf-desk-orbit-poster.jpg?v=4k60'),
  posterDeskOrbit: vibeUrl('videos/gf-desk-orbit-poster.jpg?v=4k60'),
  posterPcBuild: vibeUrl('videos/gf-pc-build-poster.jpg?v=4k60'),
  posterShopShowcase: vibeUrl('videos/gf-shop-showcase-poster.jpg?v=4k60'),
  posterEcosystemFlow: vibeUrl('videos/gf-ecosystem-flow-poster.jpg'),
  posterReelGaming: vibeUrl('videos/gf-reel-gaming-poster.jpg'),
  posterReelAstronaut: vibeUrl('videos/gf-reel-astronaut-poster.jpg'),
  posterReelUnbox: vibeUrl('videos/gf-reel-unbox-poster.jpg?v=4k60'),
  posterReelNight: vibeUrl('videos/gf-reel-night-poster.jpg'),
  posterReelTour: vibeUrl('videos/gf-reel-tour-poster.jpg?v=4k60'),
  posterReelMacro: vibeUrl('videos/gf-reel-macro-poster.jpg?v=4k60'),
} as const;

export const VIBE_PORTFOLIO_CARDS = {
  campus: [
    {
      id: 'uit',
      campus: 'UIT · Khoa KHMT',
      title: 'RTX 5070 AI Rig',
      img: vibeUrl('real-photos/real-ai-dev-setup.jpg'),
      alt: 'Góc học tập AI sinh viên UIT',
      quote: 'Nhờ gói trả góp 0% qua thẻ SV UIT, mình nhận máy ngay trước kỳ đồ án Deep Learning.',
    },
    {
      id: 'bk',
      campus: 'Bách Khoa · Cơ Điện Tử',
      title: 'Workstation Custom PC',
      img: vibeUrl('real-photos/real-pc-workstation.jpg'),
      alt: 'Workstation CAD sinh viên Bách Khoa',
      quote: 'Kỹ thuật GearForge test stress SolidWorks và cài sẵn driver trước khi giao tới tận phòng.',
    },
    {
      id: 'khtn',
      campus: 'KHTN · Toán - Tin',
      title: 'Ultrabook Studio',
      img: vibeUrl('real-photos/real-ultrabook-studio.jpg'),
      alt: 'Ultrabook Linux sinh viên KHTN',
      quote: 'Máy nhẹ gọn, dual-boot Ubuntu mượt mà, tra cứu bảo hành điện tử trực tuyến cực tiện.',
    },
    {
      id: 'ktx',
      campus: 'KTX Khu B ĐHQG',
      title: 'Desk Setup KTX Gọn Gàng',
      img: vibeUrl('real-photos/real-ktx-compact.jpg'),
      alt: 'Setup bàn học KTX Khu B ĐHQG',
      quote: 'Đặt buổi sáng là chiều 2 tiếng sau shipper đã giao tận cổng KTX Khu B kèm hóa đơn VAT.',
    },
    {
      id: 'creator',
      campus: 'Media Club UIT',
      title: 'Creator Studio 4K',
      img: vibeUrl('real-photos/real-creator-editing.jpg'),
      alt: 'Setup dựng phim 4K Media Club UIT',
      quote: 'Render video 4K DaVinci Resolve nhanh gấp đôi, màn chuẩn màu tuyệt đối.',
    },
    {
      id: 'esports',
      campus: 'ĐHQG Esports Arena',
      title: 'Combo Phím Cơ & Chuột',
      img: vibeUrl('real-photos/real-mech-gear.jpg'),
      alt: 'Gear Esports ĐHQG-HCM',
      quote: 'Phím cơ custom và chuột không dây siêu nhẹ, ổn định suốt mùa giải Làng Đại học.',
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
    riotSplitStatue: vibeUrl('riot-split-statue.jpg?v=2'),
    riotP1ApexPc: vibeUrl('riot-p1-apex-pc.jpg'),
    riotP2Valkyrie: vibeUrl('riot-p2-valkyrie-laptop.jpg'),
    riotP3Cipher: vibeUrl('riot-p3-cipher-ultrabook.jpg'),
    riotP4Titan: vibeUrl('riot-p4-titan-workstation.jpg?v=3'),
    riotP5Strike: vibeUrl('riot-p5-strike-gear.jpg'),
    riotP6RogLegion: vibeUrl('riot-p6-rog-legion.jpg'),
    riotP7DormMini: vibeUrl('riot-p7-dorm-mini.jpg'),
    riotNewsLead: vibeUrl('riot-news-lead.jpg?v=2'),
    riotNewsBooth: vibeUrl('riot-news-booth.jpg'),
    riotNewsInstallment: vibeUrl('riot-news-installment.jpg?v=2'),
    riotNewsOmsSerial: vibeUrl('riot-news-oms-serial.jpg'),
    riotEcoAiBuilder: vibeUrl('riot-eco-aibuilder.jpg'),
    riotEcoStressLab: vibeUrl('riot-eco-stresslab.jpg'),
    ecoHeroAi: vibeUrl('eco-hero-ai.jpg'),
    ecoHeroSe: vibeUrl('eco-hero-se.jpg'),
    ecoHeroSec: vibeUrl('eco-hero-sec.jpg'),
    ecoHero3d: vibeUrl('eco-hero-3d.jpg'),
    galAiUit: vibeUrl('gal-ai-uit.jpg'),
    galBkCad: vibeUrl('gal-bk-cad.jpg'),
    galCreatorOled: vibeUrl('gal-creator-oled.jpg'),
    galKtxMini: vibeUrl('gal-ktx-mini.jpg'),
    galDevRog: vibeUrl('gal-dev-rog.jpg'),
    galEsportsGear: vibeUrl('gal-esports-gear.jpg'),
    subCompareFlow: vibeUrl('sub-compare-flow.jpg'),
    subOmsFlow: vibeUrl('sub-oms-flow.jpg'),
    subCartDorm: vibeUrl('sub-cart-dorm.jpg'),
    subInstallmentFlow: vibeUrl('sub-installment-flow.jpg'),
    branchAi: vibeUrl('branch-ai.jpg'),
    branchCad: vibeUrl('branch-cad.jpg'),
    bentoLead: vibeUrl('bento-lead.jpg'),
    bentoPc: vibeUrl('bento-pc.jpg'),
    bentoLaptop: vibeUrl('bento-laptop.jpg'),
    swPromoEco: vibeUrl('sw-promo-eco.jpg'),
    swPromoGal: vibeUrl('sw-promo-gal.jpg'),
    ecoCardAi: vibeUrl('eco-card-ai.jpg'),
    ecoCardSetup: vibeUrl('eco-card-setup.jpg'),
    ecoCardOms: vibeUrl('eco-card-oms.jpg'),
    swHomeFlagship: vibeUrl('sw-home-flagship.jpg'),
    swKtxDelivery: vibeUrl('sw-ktx-delivery.jpg'),
    swGallerySv: vibeUrl('sw-gallery-sv.jpg'),
    swGalleryLab: vibeUrl('sw-gallery-lab.jpg'),
    swSerialRma: vibeUrl('sw-serial-rma.jpg'),
    swVatInvoice: vibeUrl('sw-vat-invoice.jpg'),
    swAiAdvisor: vibeUrl('sw-ai-advisor.jpg'),
    realAiDev: vibeUrl('real-photos/real-ai-dev-setup.jpg'),
    realPcWorkstation: vibeUrl('real-photos/real-pc-workstation.jpg'),
    realKtxCompact: vibeUrl('real-photos/real-ktx-compact.jpg'),
    realEsportsDual: vibeUrl('real-photos/real-esports-dual.jpg'),
    realCreatorEditing: vibeUrl('real-photos/real-creator-editing.jpg'),
    realMechGear: vibeUrl('real-photos/real-mech-gear.jpg'),
    realUltrabookStudio: vibeUrl('real-photos/real-ultrabook-studio.jpg'),
    realGamingLaptop: vibeUrl('real-photos/real-gaming-laptop.jpg'),
    realStudentEduDesk: vibeUrl('real-photos/real-student-edu-desk.jpg'),
    realSerialHardware: vibeUrl('real-photos/real-serial-hardware.jpg'),
  },
} as const;
