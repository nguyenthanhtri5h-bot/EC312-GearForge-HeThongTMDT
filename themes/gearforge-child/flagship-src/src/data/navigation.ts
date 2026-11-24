import { VIBE_PORTFOLIO_CARDS } from './vibeAssets';

export interface NavSubItem {
  label: string;
  href: string;
  category?: string;
  drawer?: 'oms' | 'installment' | 'compare';
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
    { label: 'AI Builder Chọn Cấu Hình Ngành Học', href: '/he-sinh-thai/', icon: VIBE_PORTFOLIO_CARDS.hardware.laptopRogRgb },
    { label: 'Quy Trình Test Stress Nhiệt & FPS', href: '/he-sinh-thai/', icon: VIBE_PORTFOLIO_CARDS.hardware.campusBkCad },
    { label: 'Góc Máy Thực Tế SV ĐHQG-HCM', href: '/cau-hinh-mau/', icon: VIBE_PORTFOLIO_CARDS.hardware.campusUitAi },
    { label: 'Ước Tính Trả Góp 0% Thẻ Sinh Viên', href: '#gf-installment', drawer: 'installment', icon: VIBE_PORTFOLIO_CARDS.hardware.galleryEsportsDesk },
  ],
  support: [
    { label: 'Tra cứu nhanh đơn hàng (OMS)', href: '/tra-cuu-don-hang/', drawer: 'oms' },
    { label: 'So sánh cấu hình (tối đa 3 máy)', href: '/so-sanh-cau-hinh/', drawer: 'compare' },
    { label: 'Ước tính Trả góp 0% (.edu.vn)', href: '#gf-installment', drawer: 'installment' },
  ],
};

export const TOP_NAV_ITEMS: TopNavItem[] = [
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
    id: 'oms',
    label: 'Tra cứu đơn',
    href: '/tra-cuu-don-hang/',
    icon: VIBE_PORTFOLIO_CARDS.hardware.gearPeripherals,
    dropdownKey: 'support',
  },
];
