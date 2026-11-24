import { VIBE_PORTFOLIO_CARDS } from './vibeAssets';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_TOP_COLUMNS: FooterColumn[] = [
  {
    title: 'Về GearForge',
    links: [
      { label: 'Trang chủ GearForge', href: '#top' },
      { label: 'Hệ sinh thái phần cứng ĐHQG-HCM', href: '#gf-services' },
      { label: 'Tất cả sản phẩm chính hãng', href: '/shop/' },
      { label: 'Đội ngũ kỹ thuật Làng Đại học', href: '#gf-team' },
      { label: 'Cộng đồng Sinh viên UIT / BK / KHTN', href: '#gf-testimonials' },
    ],
  },
  {
    title: 'Danh mục Sản phẩm',
    links: [
      { label: 'Laptop Gaming RTX 40 / 50 Series', href: '/shop/?category=laptop-gaming' },
      { label: 'Laptop Đồ họa & Studio OLED', href: '/shop/?category=laptop-ultrabook' },
      { label: 'Ultrabook Sinh viên CNTT', href: '/shop/?category=laptop-ultrabook' },
      { label: 'PC Workstation & Custom Watercool', href: '/shop/?category=pc-workstation' },
      { label: 'Gaming Gear & Màn hình 240Hz', href: '/shop/?category=gear' },
    ],
  },
  {
    title: 'Trả góp 0% & Chính sách',
    links: [
      { label: 'Trả góp Sinh viên 0% kỳ hạn 3 tháng', href: '#gf-installment' },
      { label: 'Xác thực hồ sơ qua email .edu.vn', href: '#gf-installment' },
      { label: 'Chính sách bảo mật thông tin', href: '#gf-installment' },
      { label: 'So sánh tối đa 3 cấu hình song song', href: '/so-sanh-cau-hinh/' },
      { label: 'Mã ưu đãi BACKTOSCHOOL (-500K)', href: '/shop/' },
    ],
  },
  {
    title: 'Tra cứu & Bảo hành',
    links: [
      { label: 'Tra cứu tiến độ đơn hàng', href: '/tra-cuu-don-hang/' },
      { label: 'Kích hoạt bảo hành theo Serial', href: '/tra-cuu-don-hang/' },
      { label: 'Hóa đơn điện tử VAT hợp lệ', href: '#gf-oms-contact' },
      { label: 'Gửi yêu cầu đổi trả & bảo hành', href: '/tra-cuu-don-hang/' },
      { label: 'Giao hỏa tốc KTX Khu A & Khu B (2h)', href: '#gf-oms-contact' },
    ],
  },
];

export const FOOTER_BOTTOM_COLUMNS: FooterColumn[] = [
  {
    title: 'Phân khu Làng Đại học',
    links: [
      { label: 'Campus Hub — Trường ĐH CNTT (UIT)', href: '#gf-oms-contact' },
      { label: 'Điểm nhận KTX Khu A — Thủ Đức', href: '#gf-oms-contact' },
      { label: 'Điểm nhận KTX Khu B — Đông Hòa', href: '#gf-oms-contact' },
      { label: 'Trạm bảo hành ĐH Bách Khoa & KHTN', href: '#gf-oms-contact' },
    ],
  },
  {
    title: 'Tài khoản & Giao dịch',
    links: [
      { label: 'Cửa hàng trực tuyến', href: '/shop/' },
      { label: 'Giỏ hàng của bạn', href: '/cart/' },
      { label: 'Thanh toán đơn hàng', href: '/checkout/' },
      { label: 'Tài khoản Sinh viên', href: '/my-account/' },
    ],
  },
];

export const GEARFORGE_ENTITIES = [
  {
    name: 'GearForge Campus Hub — ĐHQG-HCM',
    code: 'MST: 0318202607',
    account: 'Khu phố 6, P. Linh Trung, Thủ Đức',
  },
  {
    name: 'GearForge Lab & Build PC Center',
    code: 'VNPay / MoMo / Fundiin',
    account: 'KTX Khu B, ĐHQG-HCM (Giao 2h)',
  },
  {
    name: 'Trung tâm Bảo hành Chính hãng',
    code: '1 Đổi 1 · Bảo hành 36T',
    account: 'Hotline SV: 1900 6868 07',
  },
];

export const CONTACT_SERVICES = [
  'Build PC Workstation cho đồ án AI / Deep Learning',
  'Tư vấn Laptop Gaming / Lập trình dưới 25 triệu',
  'Đăng ký Trả góp 0% bằng email .edu.vn',
  'Kiểm tra Serial & Kích hoạt bảo hành điện tử',
  'Áp dụng Coupon BACKTOSCHOOL cho đơn Sinh viên',
];

export const GUIDE_SECTIONS = [
  { selector: 'section.gf-cat-sec', id: 'gf-spotlight', label: 'Kệ sản phẩm' },
  { selector: 'section.dv', id: 'gf-services', label: 'Dịch vụ' },
  { selector: 'section.kq', id: 'gf-results', label: 'Cam kết' },
  { selector: 'section.kha', id: 'gf-installment', label: 'Trả góp 0%' },
  { selector: 'section.dn', id: 'gf-team', label: 'Kỹ thuật' },
  { selector: 'section.kc', id: 'gf-testimonials', label: 'Sinh viên' },
  { selector: 'section.rl', id: 'gf-reels', label: 'Benchmark' },
  { selector: 'section.dt', id: 'gf-partners', label: 'Đối tác' },
  { selector: '#gf-oms-contact', id: 'gf-oms-contact', label: 'Tra cứu đơn' },
];

export const NOTIS_ITEMS = [
  {
    img: VIBE_PORTFOLIO_CARDS.hardware.laptopGaming,
    text: 'Đơn ASUS ROG Strix G16 đang trên đường giao hỏa tốc về KTX Khu B ĐHQG-HCM.',
    href: '/tra-cuu-don-hang/',
  },
  {
    img: VIBE_PORTFOLIO_CARDS.hardware.pcWatercool,
    text: 'Ưu đãi Tựu trường: Nhập mã BACKTOSCHOOL giảm ngay 500.000đ cho đơn Laptop.',
    href: '/shop/',
  },
];
