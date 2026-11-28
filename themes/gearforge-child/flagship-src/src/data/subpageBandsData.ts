import { VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS, vibeUrl } from './vibeMedia';
import type { HoverBandItem } from '../components/subpages/SubpageHoverBand';

const hw = VIBE_PORTFOLIO_CARDS.hardware;

export const SHOP_BRANCH_CARDS = [
  {
    id: 'branch-ai',
    tag: 'UIT · KHOA KHMT / AI',
    title: 'Laptop RTX 4060 & PC Train Model',
    img: hw.branchAi,
    category: 'laptop-gaming',
  },
  {
    id: 'branch-se',
    tag: 'BÁCH KHOA · KTPM / DEV',
    title: 'Ultrabook Pin 11h & Màn Chuẩn Màu',
    img: vibeUrl('shop-branch-dev.jpg'),
    category: 'laptop-ultrabook',
  },
  {
    id: 'branch-cad',
    tag: 'WORKSTATION · RENDER 3D',
    title: 'PC Tản Nhiệt Custom & GPU Rời',
    img: hw.branchCad,
    category: 'pc-workstation',
  },
  {
    id: 'branch-gear',
    tag: 'KTX DESK · GAMING GEAR',
    title: 'Màn 240Hz, Phím Cơ Gasket & Balo SV',
    img: vibeUrl('shop-branch-gear.jpg'),
    category: 'gear',
  },
];

export const SHOP_MEDIA_DATA = {
  kicker: 'TRẢI NGHIỆM KHO THỰC TẾ',
  heading: 'Từ Kho Kiểm Định Đến Bàn Học ĐHQG',
  desc: 'Mỗi thiết bị trong kho 590+ cấu hình đều được mở hộp kiểm tra ngoại quan, stress-test GPU/CPU liên tục 30 phút và đồng bộ số Serial lên hệ thống bảo hành điện tử.',
  videoSrc: VIBE_VIDEOS.shopShowcase,
  posterSrc: VIBE_VIDEOS.posterShopShowcase,
  facts: [
    { label: 'Thời gian giao nội khu ĐHQG', value: 'Trong 2 giờ (Khu A & Khu B)' },
    { label: 'Chính sách trả góp 0%', value: '3 tháng qua email .edu.vn' },
    { label: 'Kiểm định xuất kho', value: 'Stress-test 30p · Tem Serial S/N' },
  ],
};

export const GALLERY_MEDIA_DATA = {
  kicker: 'BÀN GIAO THỰC TẾ TẠI KTX',
  heading: 'Mở Hộp & Setup Góc Máy Tận Phòng',
  desc: 'Đội ngũ kỹ thuật mang máy tới tận KTX Khu A, Khu B ĐHQG-HCM, đi dây gọn gàng, kiểm tra màn hình và bàn giao hóa đơn điện tử T-VAN ngay tại chỗ.',
  videoSrc: VIBE_VIDEOS.reelUnbox,
  posterSrc: VIBE_VIDEOS.posterReelUnbox,
  facts: [
    { label: 'Phạm vi lắp đặt miễn phí', value: 'KTX Khu A, Khu B, Làng ĐH' },
    { label: 'Phụ kiện đi kèm chuẩn SV', value: 'Balo chống sốc + Pad bàn phím' },
    { label: 'Hỗ trợ kỹ thuật tại chỗ', value: 'Cân màu OLED · Vệ sinh định kỳ' },
  ],
};

export const INSTALLMENT_HOVER_STEPS: HoverBandItem[] = [
  {
    id: 'inst-1',
    tag: 'BƯỚC 01 · XÁC THỰC .EDU.VN',
    title: 'Điền bảng tính & gửi thẻ sinh viên online',
    meta: 'Không giữ CCCD gốc · Chọn mức trả trước 20% – 50%',
    desc: 'Hệ thống tự động tính khoản góp từng tháng theo giá máy thực tế từ WooCommerce.',
    img: hw.riotNewsBooth,
  },
  {
    id: 'inst-2',
    tag: 'BƯỚC 02 · ĐỐI SOÁT 2 TẦNG',
    title: 'Duyệt hồ sơ tự động trong 2 giờ hành chính',
    meta: 'Chống trùng hồ sơ · Bảo mật Nghị định 13/2023',
    desc: 'Hồ sơ được xét duyệt bảo mật qua email @gm.uit.edu.vn / @hcmut.edu.vn / @student.hcmus.edu.vn.',
    img: hw.subInstallmentFlow,
  },
  {
    id: 'inst-3',
    tag: 'BƯỚC 03 · NHẬN MÁY KTX 2H',
    title: 'Giao tận phòng KTX & đối chiếu Serial bảo hành',
    meta: '0% lãi suất kỳ hạn 3 tháng · Hóa đơn điện tử VAT',
    desc: 'Kiểm tra máy hoàn chỉnh, ký nhận điện tử và theo dõi toàn bộ lịch góp trên cổng OMS.',
    img: vibeUrl('sub-installment-3.jpg'),
  },
];

export const TRACKING_MEDIA_DATA = {
  kicker: 'HÀNH TRÌNH GIAO HỎA TỐC KTX',
  heading: 'Theo Dõi 7 Chặng Vận Đơn ĐHQG-HCM',
  desc: 'Từ lúc kỹ thuật viên niêm phong Serial S/N, xuất hóa đơn T-VAN PDF đến khi giao tận tay sinh viên tại Làng Đại Học — mọi bước đều minh bạch theo thời gian thực.',
  videoSrc: VIBE_VIDEOS.reelTour,
  posterSrc: VIBE_VIDEOS.posterReelTour,
  facts: [
    { label: 'Chặng 1–3', value: 'Tiếp nhận · eKYC · Gán Serial S/N' },
    { label: 'Chặng 4–5', value: 'Stress-test 30p · Xuất hóa đơn VAT' },
    { label: 'Chặng 6–7', value: 'Giao KTX 2h · Kích hoạt RMA S/N' },
  ],
};

export const COMPARE_MEDIA_DATA = {
  kicker: 'SOI CHI TIẾT LINH KIỆN BÊN TRONG',
  heading: 'Hiệu Năng Thực Tế Vượt Ra Ngoài Thông Số',
  desc: 'Đừng chỉ nhìn tên CPU hay dung lượng RAM — soi trực tiếp thiết kế buồng hơi tản nhiệt, công suất TGP card đồ họa RTX và độ phủ màu màn hình trước khi chốt máy.',
  videoSrc: VIBE_VIDEOS.reelMacro,
  posterSrc: VIBE_VIDEOS.posterReelMacro,
  facts: [
    { label: 'TGP RTX 4060 Laptop', value: '105W – 140W tối đa xung CUDA' },
    { label: 'Chuẩn màn đồ họa', value: '100% DCI-P3 · Delta E < 2' },
    { label: 'Nâng cấp mở rộng', value: '2 khe SO-DIMM DDR5 · 2 khe M.2' },
  ],
};

export const CART_MEDIA_DATA = {
  kicker: 'ĐẶC QUYỀN ĐƠN HÀNG SINH VIÊN ĐHQG',
  heading: 'Giao Tận KTX · Quà Tặng Phụ Kiện Theo Máy',
  desc: 'Đơn hàng từ kho GearForge mặc định kèm gói kiểm định tản nhiệt, hỗ trợ cài phần mềm học tập theo ngành và áp dụng mã BACKTOSCHOOL giảm thêm 5%.',
  videoSrc: VIBE_VIDEOS.campusLaptop,
  posterSrc: hw.subCartDorm,
  facts: [
    { label: 'Mã giảm giá sinh viên', value: 'BACKTOSCHOOL (-5% tổng đơn)' },
    { label: 'Giao hàng nội khu', value: 'Miễn phí KTX Khu A & Khu B' },
    { label: 'Đổi trả 1-1', value: 'Trong 15 ngày nếu lỗi phần cứng NSX' },
  ],
};
