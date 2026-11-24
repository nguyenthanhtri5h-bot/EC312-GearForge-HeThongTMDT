import { VIBE_INSTALLMENT_STEPS, VIBE_PORTFOLIO_CARDS, VIBE_RESULTS, VIBE_STATIONS } from './vibeAssets';

export interface ServiceStation {
  id: number;
  title: string;
  desc: string;
  ctaText: string;
  ctaHref: string;
  categorySlug?: string;
  extraLinks?: { label: string; href: string }[];
}

export const SERVICE_STATIONS: ServiceStation[] = [
  {
    id: 0,
    title: 'Laptop Gaming & AI',
    desc: 'Đầy đủ cấu hình ROG, Legion, MacBook M4 Pro sẵn kho Làng Đại học Thủ Đức, kiểm tra máy tận tay.',
    ctaText: 'Xem các mẫu Laptop',
    ctaHref: '#gf-catalog',
    categorySlug: 'laptop-gaming',
  },
  {
    id: 1,
    title: 'Custom PC Workstation',
    desc: 'Lắp ráp PC RTX 40/50 Series đi dây gọn đẹp, kiểm tra tải nặng 24h trước khi giao đến KTX.',
    ctaText: 'Xem dàn PC Workstation',
    ctaHref: '#gf-catalog',
    categorySlug: 'pc-workstation',
  },
  {
    id: 2,
    title: 'Lab Benchmark thực tế',
    desc: 'Đo FPS thực tế, nhiệt độ CPU/GPU và thời lượng pin cho từng ngành CNTT, Đồ họa, Cơ khí.',
    ctaText: 'Xem video benchmark',
    ctaHref: '#gf-reels',
  },
  {
    id: 3,
    title: 'Gear & Màn hình 240Hz',
    desc: 'Phím cơ êm cho KTX, chuột siêu nhẹ, màn hình đồ họa chuẩn màu và balo chống sốc sinh viên.',
    ctaText: 'Khám phá Phụ kiện',
    ctaHref: '#gf-catalog',
    categorySlug: 'gear',
  },
  {
    id: 4,
    title: 'Trả góp 0% & Bảo hành',
    desc: 'Duyệt trả góp nhanh qua email .edu.vn, theo dõi tiến độ giao hàng và kích hoạt bảo hành điện tử.',
    ctaText: 'Ước tính Trả góp 0%',
    ctaHref: '#gf-installment',
    extraLinks: [
      { label: 'Tra cứu đơn hàng', href: '/tra-cuu-don-hang/' },
      { label: 'So sánh 3 thiết bị', href: '/so-sanh-cau-hinh/' },
    ],
  },
];

export const STATION_ASSETS = VIBE_STATIONS;

export const RESULT_POSTERS = VIBE_RESULTS;

export const KHA_STEPS = [
  'Chọn máy phù hợp trong cửa hàng',
  'Ước tính khoản góp 0% chỉ 1 chạm',
  'Xác thực thẻ SV & email .edu.vn',
  'Nhận máy KTX 2h & theo dõi đơn',
];

export const KHA_SCREENS = VIBE_INSTALLMENT_STEPS;

export const KHA_STATS = [
  { value: '0%', label: 'lãi suất sinh viên ĐHQG-HCM kỳ hạn 3 tháng', highlight: true },
  { value: '100%', label: 'thiết bị chính hãng bảo hành theo số Serial' },
  { value: '45 giây', label: 'duyệt sơ bộ hồ sơ qua email .edu.vn' },
  { value: '2 giờ', label: 'giao hỏa tốc tận KTX Khu A & Khu B Thủ Đức' },
];

const hw = VIBE_PORTFOLIO_CARDS.hardware;
const cp = VIBE_PORTFOLIO_CARDS.campus;

export const TEAM_COLUMNS: { dir: number; items: { src: string; note?: string }[] }[] = [
  { dir: -80, items: [{ src: hw.campusUitAi }, { src: hw.laptopRogRgb }, { src: hw.monitorOled }, { src: hw.pcWatercool }] },
  { dir: 80, items: [{ src: hw.campusBkCad }, { src: hw.gearPeripherals }, { src: hw.laptopCreator }, { src: hw.pcMiniItx }] },
  { dir: -80, items: [{ src: hw.pcWorkstation }, { src: hw.gearAudioHub }, { src: hw.laptopUltrabook }, { src: hw.laptopGaming }] },
  { dir: 80, items: [{ src: hw.laptopKatana }, { src: hw.gearBackpack, note: 'Giao KTX 2h' }, { src: hw.monitorOled }, { src: hw.campusUitAi }] },
  { dir: -80, items: [{ src: hw.pcMinimal, note: 'Bảo hành 36T' }, { src: hw.campusBkCad }, { src: hw.gearPeripherals }, { src: hw.laptopRogRgb }] },
  { dir: 80, items: [{ src: hw.pcMiniItx }, { src: cp[0].img, note: 'ĐHQG-HCM' }, { src: hw.gearAudioHub }, { src: hw.laptopCreator }] },
];

export const STATS_CARDS = [
  { digits: [1, 0, 0], suffix: '%', label: 'Laptop, PC & Gear chính hãng đầy đủ hóa đơn VAT', full: '100%' },
  { digits: [0], suffix: '%', label: 'lãi suất ưu đãi sinh viên kỳ hạn 3 tháng', full: '0%' },
  { digits: [4, '.', 2, 0, 0], suffix: '+', label: 'sinh viên ĐHQG-HCM đã trang bị máy qua GearForge', full: '4.200+' },
  { digits: [9, 8], suffix: '%', label: 'đơn hàng giao KTX Khu A/B đúng hẹn 2 giờ', full: '98%' },
  { digits: [3, 6], suffix: 'T', label: 'bảo hành điện tử minh bạch theo số Serial', full: '36T' },
];
