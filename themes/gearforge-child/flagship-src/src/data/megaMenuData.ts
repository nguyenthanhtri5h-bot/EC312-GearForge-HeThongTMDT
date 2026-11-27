import { vibeUrl } from './vibeMedia';

export interface MegaPreviewItem {
  id: string;
  tag: string;
  title: string;
  desc: string;
  img: string;
}

export const MEGA_PREVIEW_ITEMS: Record<string, MegaPreviewItem> = {
  all: {
    id: 'all',
    tag: 'KHO 520+ MẪU CHÍNH HÃNG',
    title: 'Tất Cả Kho Máy ĐHQG-HCM',
    desc: 'Lọc theo ngành học, GPU RTX 40/50, màn OLED và mức trả góp 0% .edu.vn.',
    img: vibeUrl('mega-all.jpg'),
  },
  gaming: {
    id: 'gaming',
    tag: 'RTX 4060 / 4070 / 5070',
    title: 'Laptop Gaming & AI Di Động',
    desc: 'Tản nhiệt buồng hơi, stress-test 30 phút đạt chuẩn FPS & CUDA trước khi giao.',
    img: vibeUrl('mega-gaming.jpg'),
  },
  ultrabook: {
    id: 'ultrabook',
    tag: 'PIN 11H · CHUẨN MÀU OLED',
    title: 'Ultrabook & Đồ Họa Sáng Tạo',
    desc: 'Mỏng nhẹ dưới 1.4kg mang lên giảng đường UIT, Bách Khoa, KHTN cả ngày.',
    img: vibeUrl('mega-ultrabook.jpg'),
  },
  pc: {
    id: 'pc',
    tag: 'WORKSTATION CUSTOM',
    title: 'PC AI & Render 3D Theo Đơn',
    desc: 'Linh kiện chính hãng nguyên seal, cân đối nguồn Airflow và xuất hóa đơn VAT.',
    img: vibeUrl('mega-pc.jpg'),
  },
  linhKien: {
    id: 'linhKien',
    tag: 'VGA · CPU · RAM DDR5 · NVME',
    title: 'Linh Kiện & Card Đồ Họa Rời',
    desc: 'Nâng cấp trực tiếp lấy liền, tem Serial điện tử đồng bộ hệ thống bảo hành OMS.',
    img: vibeUrl('mega-components.jpg'),
  },
  gear: {
    id: 'gear',
    tag: 'OLED 240HZ · GASKET RGB',
    title: 'Gaming Gear & Màn Hình Studio',
    desc: 'Phím cơ silent cho phòng KTX, chuột không dây ultralight và màn OLED 2K/4K.',
    img: vibeUrl('mega-gear.jpg'),
  },
  ecosystem: {
    id: 'ecosystem',
    tag: 'BỘ CHỌN THEO KHOA ĐHQG',
    title: 'Gợi Ý Máy Theo Ngành Học',
    desc: '4 lộ trình CNTT/AI, Kỹ thuật PM, An toàn TT và Đồ họa 3D có bảng ước tính ngân sách.',
    img: vibeUrl('mega-ecosystem.jpg'),
  },
  installment: {
    id: 'installment',
    tag: '0% LÃI SUẤT · 3 KỲ',
    title: 'Trả Góp 0% Qua .edu.vn',
    desc: 'Không giữ CCCD gốc, xét duyệt online trong 2 giờ, tính khoản góp từng tháng.',
    img: vibeUrl('mega-installment.jpg'),
  },
  compare: {
    id: 'compare',
    tag: 'SO KÈ 3 CẤU HÌNH',
    title: 'Bảng Đối Chiếu Thông Số',
    desc: 'So sánh song song CPU, GPU, RAM, màn hình và lọc riêng các điểm khác biệt.',
    img: vibeUrl('sub-compare-flow.jpg'),
  },
  tracking: {
    id: 'tracking',
    tag: 'OMS 7 CHẶNG · SERIAL S/N',
    title: 'Tra Cứu Đơn & Bảo Hành S/N',
    desc: 'Theo dõi giao hỏa tốc KTX 2h, tải hóa đơn VAT và kích hoạt bảo hành theo mã máy.',
    img: vibeUrl('sub-oms-flow.jpg'),
  },
};
