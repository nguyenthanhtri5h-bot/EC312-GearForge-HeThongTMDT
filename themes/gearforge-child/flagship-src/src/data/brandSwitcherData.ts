import { vibeUrl } from './vibeMedia';

export interface SwitcherArtworkItem {
  id: string;
  label: string;
  kicker: string;
  title: string;
  desc: string;
  img: string;
}

export const SWITCHER_ARTWORK: Record<string, SwitcherArtworkItem> = {
  all: {
    id: 'all',
    label: 'TẤT CẢ KHO MÁY ĐHQG',
    kicker: 'HỆ THỐNG KHO 520+ CẤU HÌNH',
    title: 'Kho Máy Chính Hãng ĐHQG-HCM',
    desc: 'Tất cả Laptop Gaming RTX, Ultrabook OLED, PC AI và Gaming Gear lọc theo khoa, giá và trả góp 0%.',
    img: vibeUrl('sw-catalog-hub.jpg'),
  },
  gaming: {
    id: 'gaming',
    label: 'LAPTOP GAMING RTX 40/50',
    kicker: 'HIỆU NĂNG GPU RỜI ĐỒ ÁN & ESPORTS',
    title: 'Laptop Gaming RTX 40/50 Series',
    desc: 'ROG Strix, Lenovo Legion, MSI Katana test stress 30 phút đạt chuẩn FPS & CUDA trước khi xuất kho.',
    img: vibeUrl('sw-laptop-gaming.jpg'),
  },
  ultrabook: {
    id: 'ultrabook',
    label: 'ULTRABOOK & ĐỒ HỌA OLED',
    kicker: 'CHUẨN MÀU DCI-P3 · PIN 11 GIỜ',
    title: 'Ultrabook Mỏng Nhẹ & OLED Studio',
    desc: 'MacBook, ThinkPad, Zenbook OLED độ lệch màu Delta E < 2 cho sinh viên KTPM, Media Club & thiết kế.',
    img: vibeUrl('sw-ultrabook-oled.jpg'),
  },
  pc: {
    id: 'pc',
    label: 'PC WORKSTATION AI',
    kicker: 'CUSTOM RTX BUILD · TẢN NƯỚC AIO',
    title: 'Workstation AI & Render CAD',
    desc: 'Cấu hình PC tối ưu PyTorch, SolidWorks, Blender với nguồn 80+ Gold và bảo hành từng linh kiện theo Serial.',
    img: vibeUrl('sw-pc-workstation.jpg'),
  },
  gear: {
    id: 'gear',
    label: 'LINH KIỆN & GAMING GEAR',
    kicker: 'PHÍM CƠ · CHUỘT ESPORTS · MÀN 240HZ',
    title: 'Linh Kiện & Combo Gaming Gear',
    desc: 'Phím cơ gasket êm phòng KTX, chuột không dây siêu nhẹ, tai nghe 2.4GHz và RAM/SSD NVMe nâng cấp lấy liền.',
    img: vibeUrl('sw-gear-combo.jpg'),
  },
  ecosystem: {
    id: 'ecosystem',
    label: 'CHỌN MÁY THEO NGÀNH HỌC',
    kicker: 'LAB-TO-DORM · BỘ LỌC THEO KHOA',
    title: 'Hệ Sinh Thái ĐHQG Theo Ngành',
    desc: 'Đề xuất cấu hình chuẩn theo từng ngành CNTT/AI, Kỹ thuật PM, An toàn TT và Đồ họa 3D trong 10 giây.',
    img: vibeUrl('sw-ecosystem-dorm.jpg'),
  },
  installment: {
    id: 'installment',
    label: 'TRẢ GÓP 0% (.EDU.VN)',
    kicker: 'DUYỆT ONLINE · KHÔNG GIỮ GIẤY TỜ',
    title: 'Trả Góp 0% Lãi Suất Sinh Viên',
    desc: 'Xét duyệt hồ sơ điện tử qua email .edu.vn chỉ trong 2 giờ, kỳ hạn 3 tháng 0% lãi suất minh bạch từng đồng.',
    img: vibeUrl('sw-installment-edu.jpg'),
  },
  compare: {
    id: 'compare',
    label: 'SO SÁNH 3 CẤU HÌNH',
    kicker: 'ĐỐI CHIẾU CPU · GPU · THỜI LƯỢNG PIN',
    title: 'Bảng Đối Chiếu Cấu Hình Trực Tiếp',
    desc: 'So kè cạnh nhau tới 3 mẫu máy theo benchmark CUDA, trọng lượng giảng đường và số tiền góp mỗi tháng.',
    img: vibeUrl('sw-compare-specs.jpg'),
  },
  oms: {
    id: 'oms',
    label: 'TRA CỨU ĐƠN HÀNG OMS',
    kicker: 'GIAO HỎA TỐC KTX 2H · SERIAL S/N',
    title: 'Theo Dõi Đơn Hàng & Bảo Hành S/N',
    desc: 'Cập nhật 7 chặng vận đơn KTX Khu A/Khu B, tải hóa đơn điện tử T-VAN PDF và kích hoạt bảo hành theo Serial.',
    img: vibeUrl('sw-oms-warranty.jpg'),
  },
  ktxDelivery: {
    id: 'ktxDelivery',
    label: 'QUY TRÌNH GIAO KTX 2 GIỜ',
    kicker: 'LAB-TO-DORM · HỎA TỐC ĐHQG',
    title: 'Kiểm Máy Phòng Lab · Giao Tận Phòng',
    desc: 'Đội ngũ kỹ thuật test tải nặng 30 phút, niêm phong Serial S/N và giao hỏa tốc KTX Khu A, Khu B trong 2 giờ.',
    img: vibeUrl('sw-ktx-delivery.jpg'),
  },
  gallerySv: {
    id: 'gallerySv',
    label: 'GÓC MÁY SINH VIÊN ĐHQG',
    kicker: 'BÀN GIAO THỰC TẾ KTX KHU A/B',
    title: 'Không Gian Học & Gaming Thực Tế',
    desc: 'Khám phá hàng chục góc máy sinh viên UIT, Bách Khoa, KHTN đã bàn giao trọn bộ kèm setup tối giản gọn dây.',
    img: vibeUrl('sw-gallery-sv.jpg'),
  },
  galleryLab: {
    id: 'galleryLab',
    label: 'SETUP AI LAB & CREATOR',
    kicker: 'WORKSTATION · MÀN OLED CHUẨN MÀU',
    title: 'Góc Studio Dựng Phim & AI Research',
    desc: 'Dual-monitor OLED 240Hz + PC RTX build tản nhiệt êm cho CLB Media, Lab AI và nhóm đồ án tốt nghiệp.',
    img: vibeUrl('sw-gallery-lab.jpg'),
  },
  serialRma: {
    id: 'serialRma',
    label: 'BẢO HÀNH SERIAL & ĐỔI TRẢ',
    kicker: 'BẢO HÀNH ĐIỆN TỬ · ĐỔI MỚI 15 NGÀY',
    title: 'Kích Hoạt Bảo Hành & Yêu Cầu RMA',
    desc: 'Tra cứu bảo hành trực tuyến theo từng số Serial S/N linh kiện, đặt lịch kỹ thuật hỗ trợ trực tiếp tại Làng ĐH.',
    img: vibeUrl('sw-serial-rma.jpg'),
  },
  vatInvoice: {
    id: 'vatInvoice',
    label: 'HÓA ĐƠN ĐIỆN TỬ VAT',
    kicker: 'CHỨNG TỪ T-VAN · XUẤT TRONG 5 PHÚT',
    title: 'Hóa Đơn Điện Tử VAT Chuẩn Học Bổng',
    desc: 'Tải hóa đơn đỏ PDF & XML hợp lệ quyết toán học bổng doanh nghiệp, lab trường và hợp đồng mua sắm khoa.',
    img: vibeUrl('sw-vat-invoice.jpg'),
  },
  homeFlagship: {
    id: 'homeFlagship',
    label: 'TRANG CHỦ GEARFORGE',
    kicker: 'STUDIO CHÍNH HÃNG ĐHQG TP.HCM',
    title: 'GearForge Flagship Storefront',
    desc: 'Quay về trang chủ khám phá Hero 4K, Deal Tựu Trường ĐHQG, Bảng thông số ngành học và máy tính Trả góp 0%.',
    img: vibeUrl('sw-home-flagship.jpg'),
  },
  aiAdvisor: {
    id: 'aiAdvisor',
    label: 'TRỢ LÝ AI TƯ VẤN CẤU HÌNH',
    kicker: 'HỖ TRỢ 8H–22H · CHỌN MÁY TRONG 10S',
    title: 'Trợ Lý AI Gợi Ý Laptop & PC',
    desc: 'Đặt câu hỏi theo ngân sách hoặc phần mềm (PyTorch, SolidWorks, Figma) để nhận cấu hình tối ưu nhất.',
    img: vibeUrl('sw-ai-advisor.jpg'),
  },
};
