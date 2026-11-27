import { VIBE_PORTFOLIO_CARDS, vibeUrl } from './vibeMedia';

export interface MajorPillar {
  title: string;
  body: string;
}

export interface QuickMajor {
  id: string;
  num: string;
  label: string;
  heroHeadline: string;
  heroLead: string;
  query: string;
  heroImg: string;
  pillars: MajorPillar[];
}

const hw = VIBE_PORTFOLIO_CARDS.hardware;

export const QUICK_MAJORS: QuickMajor[] = [
  {
    id: 'ai',
    num: '01',
    label: 'CNTT / AI-ML',
    heroHeadline: 'Làm Chủ Đồ Án AI & Khoa Học Dữ Liệu',
    heroLead: 'Trang bị GPU NVIDIA RTX VRAM lớn cùng băng thông RAM DDR5 để chạy PyTorch, Docker và train mô hình mượt mà.',
    query: 'RTX 4060',
    heroImg: hw.ecoHeroAi,
    pillars: [
      { title: 'GPU RTX 4060 8GB & Nhân Tensor', body: 'Tối ưu xử lý CUDA, TensorRT và Fine-tune LLM nhẹ ngay trên máy cá nhân mà không phụ thuộc hoàn toàn vào Colab giới hạn giờ chạy.' },
      { title: 'Dung lượng 16–32GB RAM DDR5', body: 'Mở đồng thời VS Code, Docker Compose, JupyterLab và nhiều container dữ liệu lớn vẫn phản hồi tức thì, không nghẽn bộ nhớ.' },
      { title: 'Hiệu năng ổn định ~100 FPS & Tản nhiệt mát', body: 'Được kỹ thuật viên stress-test tải nặng liên tục 30 phút trước khi xuất kho, giữ xung nhịp ổn định xuyên suốt các kỳ bảo vệ đồ án.' },
      { title: 'Cài sẵn môi trường & Giao KTX 2 giờ', body: 'Hỗ trợ chuẩn bị sẵn CUDA, Python/Conda và xuất hóa đơn VAT điện tử; giao tận phòng KTX Khu A, Khu B ĐHQG-HCM.' },
    ],
  },
  {
    id: 'se',
    num: '02',
    label: 'Kỹ thuật PM',
    heroHeadline: 'Code Mượt Trên Mọi Giảng Đường',
    heroLead: 'Laptop mỏng nhẹ pin bền tới 11 giờ, tản nhiệt êm ái cho biên dịch microservices, Android Studio và đồ án tốt nghiệp.',
    query: 'ThinkPad',
    heroImg: hw.ecoHeroSe,
    pillars: [
      { title: 'Đồ họa Intel Arc / Apple M-Series', body: 'Hiển thị sắc nét đa màn hình ngoài tại phòng lab và xử lý mượt các giao diện WebGL, Figma hay trình giả lập di động.' },
      { title: 'Bộ nhớ 16GB LPDDR5x tốc độ cao', body: 'Chạy mượt IntelliJ IDEA, Android Studio, Node.js và cơ sở dữ liệu local khi học và làm việc nhóm suốt cả ngày.' },
      { title: 'Thời lượng pin thực tế tới 11 giờ', body: 'Tự tin mang máy lên giảng đường Bách Khoa, UIT, KHTN từ sáng tới tối mà không cần kè kè củ sạc hay tìm ổ điện.' },
      { title: 'Bàn phím chuẩn Dev & Bảo hành Serial', body: 'Hành trình phím sâu gõ êm khi code lâu, tặng gói vệ sinh tản nhiệt định kỳ miễn phí và kích hoạt bảo hành theo S/N.' },
    ],
  },
  {
    id: 'sec',
    num: '03',
    label: 'An toàn TT',
    heroHeadline: 'Lab Cyber Đa Máy Ảo Bền Bỉ',
    heroLead: 'Sức mạnh 32GB RAM và GPU rời cho phép dựng đồng thời 3–4 máy ảo Kali Linux, mô phỏng mạng và phân tích gói tin.',
    query: 'Katana',
    heroImg: hw.ecoHeroSec,
    pillars: [
      { title: 'GPU RTX 4050 6GB hỗ trợ bẻ khóa & Lab', body: 'Tăng tốc Hashcat, các tác vụ phân tích log bảo mật và kết xuất đồ họa hệ thống mô phỏng chuyên sâu.' },
      { title: 'Nâng cấp sẵn 32GB RAM DDR5', body: 'Cấp phát thoải mái 8GB RAM cho mỗi máy ảo VMware / VirtualBox chạy lab CTF và pentest cùng lúc trên một máy.' },
      { title: 'Tương thích chuẩn Linux & WSL2', body: 'Kiểm tra kỹ driver Wi-Fi, Ethernet và ảo hóa VT-x / AMD-V để sinh viên An toàn Thông tin cài dual-boot thuận lợi.' },
      { title: 'Trả góp 0% duyệt nhanh .edu.vn', body: 'Không giữ giấy tờ gốc, ký hồ sơ trực tuyến với tỷ lệ trả trước linh hoạt 20%–50% phù hợp ngân sách sinh viên.' },
    ],
  },
  {
    id: 'creator',
    num: '04',
    label: 'Đồ họa 3D',
    heroHeadline: 'Sáng Tạo Chuẩn Màu OLED Điện Ảnh',
    heroLead: 'Màn hình 100% DCI-P3 kết hợp RTX 4070 tăng tốc render Blender, Premiere Pro và DaVinci Resolve 4K tức thì.',
    query: 'Creator',
    heroImg: hw.ecoHero3d,
    pillars: [
      { title: 'Sức mạnh RTX 4070 8GB Creator', body: 'Rút ngắn đáng kể thời gian render Cycles trong Blender, chuyển cảnh 3D và xuất video 4K nhiều lớp hiệu ứng.' },
      { title: 'RAM 32–64GB & SSD NVMe Gen4', body: 'Mở file thiết kế dung lượng lớn trên Photoshop, After Effects và Cinema 4D mà không gặp hiện tượng giật timeline.' },
      { title: 'Màn OLED 120Hz+ chuẩn màu DCI-P3', body: 'Độ phủ màu đạt 100% DCI-P3, độ lệch màu Delta E < 2 cho thành phẩm in ấn và video truyền thông chính xác tuyệt đối.' },
      { title: 'Cân màu định kỳ miễn phí tại ĐHQG', body: 'Sinh viên Media Club và các ngành thiết kế được hỗ trợ cân màu màn hình định kỳ và xuất đầy đủ hóa đơn VAT.' },
    ],
  },
];

export const ECO_HOVER_STEPS = [
  {
    id: 'step-1',
    tag: 'CHẶNG 01 · TƯ VẤN NGÀNH HỌC',
    title: 'Định cấu hình theo từng khoa ĐHQG-HCM',
    meta: 'CNTT / AI-ML · Kỹ thuật PM · An toàn TT · Đồ họa 3D',
    desc: 'Khớp đúng dung lượng VRAM, RAM DDR5 và thời lượng pin thực tế theo giáo trình giảng đường.',
    img: vibeUrl('eco-step-1.jpg'),
  },
  {
    id: 'step-2',
    tag: 'CHẶNG 02 · KIỂM ĐỊNH PHẦN CỨNG',
    title: 'Stress-test 30 phút & đo nhiệt độ buồng hơi',
    meta: 'FurMark · Cinebench · Kiểm tra điểm chết màn OLED',
    desc: 'Kỹ thuật viên xuất log benchmark và tem niêm phong Serial trước khi bàn giao ra khỏi kho.',
    img: vibeUrl('eco-step-2.jpg'),
  },
  {
    id: 'step-3',
    tag: 'CHẶNG 03 · CÀI SẴN MÔI TRƯỜNG',
    title: 'Chuẩn bị PyTorch, Docker, WSL2 & Driver',
    meta: 'Dual-boot Linux · CUDA Toolkit · Bộ font kỹ thuật',
    desc: 'Bật máy lên là vào thẳng terminal hoặc đồ án — tiết kiệm trọn 1 ngày tự cài lại từ đầu.',
    img: vibeUrl('eco-step-3.jpg'),
  },
  {
    id: 'step-4',
    tag: 'CHẶNG 04 · BÀN GIAO TẬN KTX',
    title: 'Giao hỏa tốc KTX Khu A/B trong 2 giờ & VAT',
    meta: 'Thanh toán linh hoạt · Trả góp 0% .edu.vn · Hóa đơn T-VAN',
    desc: 'Kỹ thuật viên bàn giao tận nơi, kiểm tra ngoại quan cùng sinh viên và kích hoạt bảo hành S/N.',
    img: vibeUrl('eco-step-4.jpg'),
  },
];
