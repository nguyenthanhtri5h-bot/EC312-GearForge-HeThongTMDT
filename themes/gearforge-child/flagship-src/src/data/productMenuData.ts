import { VIBE_BEAR_GUIDE, VIBE_INSTALLMENT_STEPS, VIBE_PORTFOLIO_CARDS } from './vibeAssets';

export interface ProductMenuItem {
  name: string;
  desc: string;
  href: string;
  img: string;
  domain?: string;
}

export interface ProductMenuTab {
  id: 'laptop' | 'pc' | 'gear' | 'sv';
  title: string;
  desc: string;
  allLabel: string;
  allHref: string;
  isBearRound?: boolean;
  items: ProductMenuItem[];
}

const hw = VIBE_PORTFOLIO_CARDS.hardware;

export const PRODUCT_MENU_TABS: ProductMenuTab[] = [
  {
    id: 'laptop',
    title: 'Laptop Chuyên Ngành',
    desc: 'Gaming RTX, Ultrabook Dev & Đồ họa OLED',
    allLabel: 'Xem toàn bộ Laptop',
    allHref: '/shop/?category=laptop-gaming',
    items: [
      { name: 'Laptop Gaming RTX 40/50', desc: 'ROG Strix, Legion, Katana tản nhiệt buồng hơi.', href: '/shop/?category=laptop-gaming', img: hw.laptopRogRgb },
      { name: 'Laptop Đồ họa & Creator', desc: 'MacBook M4 Pro, Zenbook OLED chuẩn màu 100% DCI-P3.', href: '/shop/?category=laptop-ultrabook', img: hw.laptopCreator },
      { name: 'Ultrabook Sinh viên IT', desc: 'ThinkPad, Dell XPS nhẹ 1.1kg, pin 14h học tập cả ngày.', href: '/shop/?category=laptop-ultrabook', img: hw.laptopUltrabook },
      { name: 'Laptop Sinh viên dưới 25 triệu', desc: 'MSI Katana, LOQ, TUF cấu hình tối ưu cho tân sinh viên.', href: '/shop/?category=laptop-gaming', img: hw.laptopKatana },
    ],
  },
  {
    id: 'pc',
    title: 'PC Custom & AI Rig',
    desc: 'Build PC theo đồ án AI, Render & Esports',
    allLabel: 'Khám phá PC Workstation',
    allHref: '/shop/?category=pc-workstation',
    items: [
      { name: 'PC Watercool Nova RTX', desc: 'Tản nhiệt nước AIO 360mm, vận hành ổn định 24/7.', href: '/shop/?category=pc-workstation', img: hw.pcWatercool },
      { name: 'PC Workstation AI & CAD', desc: '64GB DDR5, dual NVMe Gen4 cho PyTorch & SolidWorks.', href: '/shop/?category=pc-workstation', img: hw.campusBkCad },
      { name: 'PC Mini-ITX Gọn Bàn Học', desc: 'Case lưới thoáng nhỏ gọn cho bàn học KTX ĐHQG.', href: '/shop/?category=pc-workstation', img: hw.pcMiniItx },
      { name: 'Tư vấn Build PC theo ngân sách', desc: 'Đội kỹ thuật UIT kiểm tra tải nặng trước khi bàn giao.', href: '/he-sinh-thai/', img: VIBE_BEAR_GUIDE.pcMascot },
    ],
  },
  {
    id: 'gear',
    title: 'Gear & Màn hình',
    desc: 'Phím cơ, chuột không dây, màn 240Hz',
    allLabel: 'Xem tất cả Phụ kiện',
    allHref: '/shop/?category=gear',
    items: [
      { name: 'Combo Phím Cơ & Chuột Wireless', desc: 'Bàn phím cơ Gasket êm cho KTX, chuột siêu nhẹ.', href: '/shop/?category=gear', img: hw.gearPeripherals },
      { name: 'Màn hình 2K 240Hz OLED', desc: 'Chuẩn màu đồ họa & tần số quét cao cho Esports.', href: '/shop/?category=gear', img: hw.monitorOled },
      { name: 'Tai nghe, Hub USB-C & Balo Tech', desc: 'Sạc GaN & phụ kiện bảo vệ laptop lên giảng đường.', href: '/shop/?category=gear', img: hw.gearAudioHub },
    ],
  },
  {
    id: 'sv',
    title: 'Đặc quyền ĐHQG-HCM',
    desc: 'Trả góp 0%, giao KTX 2h & bảo hành điện tử',
    allLabel: 'Ước tính Trả góp 0%',
    allHref: '#gf-installment',
    isBearRound: true,
    items: [
      { name: 'Trả góp 0% lãi suất 3 tháng', desc: 'Trả trước từ 20%, duyệt tự động qua email .edu.vn.', href: '#gf-installment', img: VIBE_INSTALLMENT_STEPS[1].img },
      { name: 'Xác thực hồ sơ an toàn', desc: 'Bảo mật thông tin thẻ sinh viên & CCCD tuyệt đối.', href: '#gf-installment', img: VIBE_INSTALLMENT_STEPS[2].img },
      { name: 'Tra cứu đơn hàng & Bảo hành', desc: 'Theo dõi tiến độ giao hàng, số Serial & hóa đơn VAT.', href: '/tra-cuu-don-hang/', img: VIBE_INSTALLMENT_STEPS[3].img },
      { name: 'So sánh 3 cấu hình song song', desc: 'Đối chiếu CPU, RAM, GPU, ổ cứng ngay trên trang.', href: '/so-sanh-cau-hinh/', img: VIBE_BEAR_GUIDE.laptopMascot },
    ],
  },
];
