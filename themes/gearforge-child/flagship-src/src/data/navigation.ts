import { VIBE_BEAR_GUIDE, VIBE_PORTFOLIO_CARDS } from './vibeAssets';

export interface NavSubItem {
  label: string;
  href: string;
  category?: string;
  icon?: string;
}

export interface TopNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  isNew?: boolean;
  isProductMega?: boolean;
  isAiPulse?: boolean;
  dropdownKey?: string;
}

export const SIMPLE_DROPDOWNS: Record<string, NavSubItem[]> = {
  ecosystem: [
    { label: 'Laptop Gaming RTX', href: '/shop/?category=laptop-gaming', category: 'laptop-gaming', icon: VIBE_PORTFOLIO_CARDS.hardware.laptopGaming },
    { label: 'Laptop Đồ họa & Studio', href: '/shop/?category=laptop-ultrabook', category: 'laptop-ultrabook', icon: VIBE_PORTFOLIO_CARDS.hardware.laptopCreator },
    { label: 'PC Workstation & Custom', href: '/shop/?category=pc-workstation', category: 'pc-workstation', icon: VIBE_PORTFOLIO_CARDS.hardware.pcWatercool },
    { label: 'Gaming Gear & Màn hình', href: '/shop/?category=gear', category: 'gear', icon: VIBE_PORTFOLIO_CARDS.hardware.gearPeripherals },
  ],
  support: [
    { label: 'Tra cứu đơn hàng & Vận chuyển', href: '/tra-cuu-don-hang/' },
    { label: 'So sánh cấu hình (tối đa 3 máy)', href: '/so-sanh-cau-hinh/' },
    { label: 'Chính sách bảo hành & Trả góp 0%', href: '#gf-oms-contact' },
  ],
};

export const TOP_NAV_ITEMS: TopNavItem[] = [
  {
    id: 'showcase',
    label: 'Trang chủ',
    href: '/',
    icon: VIBE_BEAR_GUIDE.avatar,
  },
  {
    id: 'catalog',
    label: 'Sản phẩm',
    href: '/shop/',
    icon: VIBE_PORTFOLIO_CARDS.hardware.laptopCreator,
    isProductMega: true,
  },
  {
    id: 'services',
    label: 'Hệ sinh thái',
    href: '/he-sinh-thai/',
    icon: VIBE_PORTFOLIO_CARDS.hardware.pcWorkstation,
    dropdownKey: 'ecosystem',
  },
  {
    id: 'gallery',
    label: 'Góc máy SV',
    href: '/cau-hinh-mau/',
    icon: VIBE_PORTFOLIO_CARDS.hardware.laptopGaming,
  },
  {
    id: 'installment',
    label: 'Trả góp 0%',
    href: '#gf-installment',
    icon: VIBE_BEAR_GUIDE.aiBadge,
    isAiPulse: true,
  },
  {
    id: 'oms',
    label: 'Tra cứu đơn',
    href: '#gf-oms-contact',
    icon: VIBE_PORTFOLIO_CARDS.hardware.gearPeripherals,
    dropdownKey: 'support',
  },
];
