import { GF_ASSET_BASE, VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS, getGfAssetBase, vibeUrl, type VibeCampusAsset } from './vibeMedia';

export { GF_ASSET_BASE, VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS, getGfAssetBase, vibeUrl };
export type { VibeCampusAsset };

export interface VibeStationAsset {
  id: number;
  mascot: string;
  preview: string;
  variants?: string[];
  alt: string;
}

export interface VibeStepAsset {
  step: number;
  img: string;
  alt: string;
  chipTitle: string;
  chipDesc: string;
}

export interface VibeResultAsset {
  stat: string;
  label: string;
  img: string;
  alt: string;
}

export interface VibePartnerAsset {
  id: string;
  name: string;
  src: string;
  alt: string;
}

export const VIBE_HERO = {
  planet: vibeUrl('cosmic-planet.png'),
  planetVector: vibeUrl('planet.svg'),
  moon: vibeUrl('moon.svg'),
  orbitGlow: vibeUrl('orbit-glow.svg'),
  mascotLaptop: vibeUrl('mascot-laptop.png'),
  mascotPc: vibeUrl('mascot-pc.png'),
  mascotCamera: vibeUrl('mascot-benchmark.png'),
  mascotAi: vibeUrl('mascot-ai-chat.png'),
  mascotVibeStack: vibeUrl('mascot-vibe-stack.png'),
  guideAstronaut: vibeUrl('guide-astronaut.png'),
  showcaseLaptop: vibeUrl('hardware/laptop-gaming.jpg'),
  showcaseCreator: vibeUrl('hardware/laptop-creator.jpg'),
  showcasePc: vibeUrl('hardware/pc-watercool.jpg'),
  showcaseCalc: vibeUrl('step-calc.svg'),
} as const;

export const VIBE_STATIONS: VibeStationAsset[] = [
  {
    id: 0,
    mascot: vibeUrl('mascot-laptop.png'),
    preview: vibeUrl('hardware/laptop-gaming.jpg'),
    variants: [
      vibeUrl('hardware/laptop-gaming.jpg'),
      vibeUrl('hardware/laptop-creator.jpg'),
      vibeUrl('hardware/laptop-ultrabook.jpg'),
    ],
    alt: 'Cyber Bear GearForge tư vấn Laptop Gaming & Dev hiệu năng cao',
  },
  {
    id: 1,
    mascot: vibeUrl('mascot-pc.png'),
    preview: vibeUrl('hardware/pc-watercool.jpg'),
    alt: 'Cyber Bear kỹ thuật lắp ráp Custom PC tản nhiệt nước RTX',
  },
  {
    id: 2,
    mascot: vibeUrl('mascot-benchmark.png'),
    preview: vibeUrl('hardware/laptop-creator.jpg'),
    alt: 'Studio benchmark & review phần cứng thực tế GearForge Lab',
  },
  {
    id: 3,
    mascot: vibeUrl('mascot-vibe-stack.png'),
    preview: vibeUrl('hardware/pc-minimal.jpg'),
    alt: 'Hệ sinh thái Gaming Gear, màn hình 240Hz & bàn phím cơ',
  },
  {
    id: 4,
    mascot: vibeUrl('mascot-ai-chat.png'),
    preview: vibeUrl('step-calc.svg'),
    alt: 'Trợ lý AI gợi ý cấu hình & tính trả góp 0% sinh viên',
  },
];

export const VIBE_INSTALLMENT_STEPS: VibeStepAsset[] = [
  {
    step: 1,
    img: vibeUrl('step-pick.svg'),
    alt: 'Bước 1: Chọn Laptop, PC hoặc Phụ kiện phù hợp ngành học',
    chipTitle: 'Chọn máy & cấu hình',
    chipDesc: 'Laptop, PC & Gear chính hãng sẵn kho Thủ Đức',
  },
  {
    step: 2,
    img: vibeUrl('step-calc.svg'),
    alt: 'Bước 2: Tính lịch trả góp 0% lãi suất theo kỳ hạn 3-12 tháng',
    chipTitle: 'Tính góp 0% tức thì',
    chipDesc: 'Kỳ hạn 3–12 tháng · 0đ phí hồ sơ',
  },
  {
    step: 3,
    img: vibeUrl('step-ekyc.svg'),
    alt: 'Bước 3: Xác thực hồ sơ & Thẻ Sinh viên ĐHQG-HCM bảo mật',
    chipTitle: 'Xác thực Thẻ SV',
    chipDesc: 'Duyệt nhanh qua Thẻ SV ĐHQG-HCM',
  },
  {
    step: 4,
    img: vibeUrl('step-oms.svg'),
    alt: 'Bước 4: Giao hàng KTX trong 2h & kích hoạt bảo hành điện tử',
    chipTitle: 'Giao KTX & Bảo hành',
    chipDesc: 'Giao hỏa tốc 2h · Bảo hành điện tử 36 tháng',
  },
];

export const VIBE_RESULTS: VibeResultAsset[] = [
  { stat: 'Chính hãng', label: 'Laptop, PC & Gear kiểm định sẵn kho', img: vibeUrl('results/result-01.svg'), alt: 'Sản phẩm chính hãng' },
  { stat: '0%', label: 'lãi suất trả góp sinh viên ĐHQG-HCM', img: vibeUrl('results/result-02.svg'), alt: 'Trả góp 0% lãi suất sinh viên' },
  { stat: '100%', label: 'đơn hàng định danh Serial Number bảo mật', img: vibeUrl('results/result-03.svg'), alt: '100% đơn hàng định danh Serial' },
  { stat: '2 Giờ', label: 'giao hỏa tốc KTX Khu A & Khu B Làng ĐH', img: vibeUrl('results/result-04.svg'), alt: 'Giao hỏa tốc 2 giờ tại Làng ĐH' },
  { stat: '4.9★', label: 'điểm hài lòng từ 4.200+ sinh viên UIT/BK', img: vibeUrl('results/result-05.svg'), alt: 'Đánh giá 4.9 sao từ sinh viên' },
  { stat: '36T', label: 'bảo hành 1-đổi-1 & hỗ trợ máy mượn', img: vibeUrl('results/result-06.svg'), alt: 'Bảo hành 36 tháng 1-đổi-1' },
];

export const VIBE_PARTNERS: VibePartnerAsset[] = [
  { id: 'asus-rog', name: 'ASUS ROG', src: vibeUrl('partners/asus-rog.svg'), alt: 'Đối tác ASUS ROG' },
  { id: 'lenovo-legion', name: 'Lenovo Legion', src: vibeUrl('partners/lenovo-legion.svg'), alt: 'Đối tác Lenovo Legion' },
  { id: 'msi', name: 'MSI Gaming', src: vibeUrl('partners/msi.svg'), alt: 'Đối tác MSI' },
  { id: 'apple', name: 'Apple Campus', src: vibeUrl('partners/apple.svg'), alt: 'Đối tác Apple Campus' },
  { id: 'nvidia', name: 'NVIDIA RTX', src: vibeUrl('partners/nvidia.svg'), alt: 'Đối tác NVIDIA GeForce' },
  { id: 'amd', name: 'AMD Ryzen', src: vibeUrl('partners/amd.svg'), alt: 'Đối tác AMD Ryzen' },
  { id: 'intel', name: 'Intel Core Ultra', src: vibeUrl('partners/intel.svg'), alt: 'Đối tác Intel Core Ultra' },
  { id: 'vnpay', name: 'VNPay-QR', src: vibeUrl('partners/vnpay.svg'), alt: 'Cổng thanh toán VNPay' },
  { id: 'momo', name: 'MoMo', src: vibeUrl('partners/momo.svg'), alt: 'Ví MoMo trả sau 0%' },
  { id: 'fundiin', name: 'Fundiin', src: vibeUrl('partners/fundiin.svg'), alt: 'Đối tác trả góp Fundiin' },
  { id: 'dhqg-hcm', name: 'ĐHQG-HCM', src: vibeUrl('partners/dhqg-hcm.svg'), alt: 'Chương trình ưu đãi ĐHQG-HCM' },
];

export const VIBE_BEAR_GUIDE = {
  avatar: vibeUrl('guide-astronaut.png'),
  avatarVector: vibeUrl('guide-astronaut.svg'),
  aiBadge: vibeUrl('mascot-ai-chat.png'),
  vibeStack: vibeUrl('mascot-vibe-stack.png'),
  laptopMascot: vibeUrl('mascot-laptop.png'),
  pcMascot: vibeUrl('mascot-pc.png'),
  shopRig: vibeUrl('scene-shop-rig.png'),
  ecosystemHub: vibeUrl('scene-ecosystem-hub.png'),
} as const;
