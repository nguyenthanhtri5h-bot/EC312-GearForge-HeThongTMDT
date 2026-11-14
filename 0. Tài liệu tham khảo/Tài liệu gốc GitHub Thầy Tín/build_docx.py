import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn


def set_cell_shading(cell, color_hex: str):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def set_table_borders(table, color="BFBFBF"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)


def add_formatted_run(p, text, bold=False, italic=False, size=13, color=None):
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r._element.rPr.rFonts.set(qn('w:eastAsia'), "Times New Roman")
    r.font.size = Pt(size)
    r.bold = bold
    r.italic = italic
    if color:
        r.font.color.rgb = RGBColor(*color)
    return r


def add_heading_block(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    if level == 1:
        add_formatted_run(p, text, bold=True, size=14, color=(31, 78, 121))
    elif level == 2:
        add_formatted_run(p, text, bold=True, size=13, color=(31, 78, 121))
    else:
        add_formatted_run(p, text, bold=True, size=13, color=(0, 0, 0))
    return p


def add_rich_bullet(doc, label, body, indent_cm=0.6):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(indent_cm)
    p.paragraph_format.first_line_indent = Cm(-0.35)
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    add_formatted_run(p, "• ", bold=True, size=13)
    if label:
        add_formatted_run(p, label + " ", bold=True, size=13)
    add_formatted_run(p, body, size=13)
    return p


def add_rich_para(doc, parts, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    for text, bold, italic in parts:
        add_formatted_run(p, text, bold=bold, italic=italic, size=13)
    return p


def add_styled_table(doc, headers, rows, col_widths_cm, alignments=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)

    # Header
    hdr_row = table.rows[0]
    trPr = hdr_row._tr.get_or_add_trPr()
    trPr.append(OxmlElement('w:tblHeader'))
    for j, h in enumerate(headers):
        cell = hdr_row.cells[j]
        cell.width = Cm(col_widths_cm[j])
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_shading(cell, "1F4E79")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        add_formatted_run(p, h, bold=True, size=11.5, color=(255, 255, 255))

    # Data rows
    for i, row_data in enumerate(rows):
        row = table.rows[i + 1]
        is_total = (i == len(rows) - 1 and any("TỔNG CỘNG" in str(c) for c in row_data))
        bg = "D9E2F3" if is_total else ("F5F8FC" if i % 2 == 1 else "FFFFFF")
        for j, val in enumerate(row_data):
            cell = row.cells[j]
            cell.width = Cm(col_widths_cm[j])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_shading(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            if alignments and j < len(alignments):
                p.alignment = alignments[j]
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            if isinstance(val, list):
                for t, b, it in val:
                    add_formatted_run(p, t, bold=(b or is_total), italic=it, size=11.5)
            else:
                add_formatted_run(p, str(val), bold=is_total, size=11.5)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)
    return table


def build():
    doc = docx.Document()
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(1.9)
    sec.bottom_margin = Cm(1.9)
    sec.left_margin = Cm(2.5)
    sec.right_margin = Cm(1.9)

    normal = doc.styles['Normal']
    normal.font.name = 'Times New Roman'
    normal.font.size = Pt(13)

    # University & Document Header
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_after = Pt(2)
    add_formatted_run(p_uni, "TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN – ĐHQG TP.HCM\n", bold=True, size=13)
    add_formatted_run(p_uni, "KHOA HỆ THỐNG THÔNG TIN", bold=True, size=13)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(4)
    add_formatted_run(p_title, "BẢN MÔ TẢ DỰ ÁN ĐỒ ÁN MÔN HỌC (EC312)\n", bold=True, size=16, color=(31, 78, 121))
    add_formatted_run(
        p_title,
        "Xây dựng Hệ thống Thương mại điện tử kinh doanh Laptop, PC và Phụ kiện (GearForge)",
        bold=True,
        size=13.5,
    )

    add_rich_para(doc, [
        ("Môn học: ", True, False), ("Thiết kế Hệ thống Thương mại điện tử (EC312)   |   ", False, False),
        ("Giảng viên hướng dẫn: ", True, False), ("ThS. Trình Trọng Tín", False, False),
    ])

    # Team Table
    add_heading_block(doc, "DANH SÁCH THÀNH VIÊN & VAI TRÒ SCRUM (NHÓM 4 NGƯỜI)", level=1)
    add_rich_para(doc, [(
        "Nhóm vận hành theo mô hình Scrum Team liên chức năng (Cross-functional) gồm 3 vai trò chuẩn của Scrum "
        "(Product Owner, Scrum Master, Developers). Để đáp ứng yêu cầu đồ án EC312 (mỗi sinh viên chủ trì phân tích – "
        "thiết kế tối thiểu 1 chức năng/Use Case riêng), Product Owner và Scrum Master đồng thời kiêm nhiệm công việc "
        "phân tích, mô hình hóa và triển khai nhằm đảm bảo khối lượng công việc cân bằng (25% / thành viên).",
        False, True
    )])

    add_styled_table(
        doc,
        headers=["STT", "Họ và tên / MSSV", "Vai trò Scrum", "Chức danh kiêm nhiệm", "Nhánh Git", "Phân hệ phụ trách chính (EC312 & MVP)"],
        rows=[
            [
                "1",
                [("[Họ và tên 1]\n", False, True), ("MSSV: [MSSV 1]", False, True)],
                [("Product Owner (PO)", True, False)],
                "Nhóm trưởng / Business Analyst",
                "role1-data-catalog",
                "Nghiệp vụ tổng thể, Danh mục, Bộ lọc chuyên sâu & So sánh cấu hình (Compare Specs), Dữ liệu ≥ 500 sản phẩm"
            ],
            [
                "2",
                [("[Họ và tên 2]\n", False, True), ("MSSV: [MSSV 2]", False, True)],
                [("Scrum Master (SM)", True, False)],
                "Kiến trúc sư hệ thống / Security & QA Lead",
                "role2-security-qa",
                "Kiến trúc hệ thống, Xác thực & Phân quyền (RBAC), Bảo mật NĐ 13/2023 & Chống gian lận, Hạ tầng & Kiểm thử"
            ],
            [
                "3",
                [("[Họ và tên 3]\n", False, True), ("MSSV: [MSSV 3]", False, True)],
                [("Developer (Dev 1)", True, False)],
                "UI/UX Designer & Frontend WooCommerce",
                "role3-ui-frontend",
                "Thiết kế UI/UX (Figma), Giao diện Storefront, Giỏ hàng, Đặt hàng & Theo dõi đơn hàng (OMS)"
            ],
            [
                "4",
                [("[Họ và tên 4]\n", False, True), ("MSSV: [MSSV 4]", False, True)],
                [("Developer (Dev 2)", True, False)],
                "Backend, Database & Payment Engineer",
                "role4-backend-payment",
                "CSDL (ERD), Custom Plugin Trả góp sinh viên (3-6-12 tháng), Duyệt hồ sơ 2 lớp, Sandbox VNPay/MoMo/Fundiin, S/N & Hóa đơn PDF"
            ],
        ],
        col_widths_cm=[0.9, 2.7, 2.5, 2.8, 2.8, 4.9],
        alignments=[WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT],
    )

    # PHẦN 1
    add_heading_block(doc, "PHẦN 1: GIỚI THIỆU DỰ ÁN & TẦM NHÌN CHIẾN LƯỢC", level=1)
    add_rich_bullet(doc, "Ngách sản phẩm:", "Laptop, PC (máy bộ nguyên chiếc) và Phụ kiện công nghệ. (Cam kết dữ liệu mẫu tối thiểu 500 sản phẩm tham khảo từ Xgear, MemoryZone, GearVN, Phong Vũ).")
    add_rich_bullet(doc, "Tên thương hiệu (Dự kiến):", "GearForge")
    add_rich_bullet(doc, "Tầm nhìn chiến lược (Vision Statement):", "Xây dựng hệ thống TMĐT chuyên phân phối Laptop, PC và Phụ kiện, giải quyết bài toán tài chính cho sinh viên đại học thông qua các giải pháp trả góp trực tuyến linh hoạt, thủ tục xét duyệt nhanh gọn với mức giá hợp lý nhất thị trường.")
    add_rich_bullet(doc, "Chỉ số đo lường (KPIs):", "(Ước tính giai đoạn thử nghiệm tại Khu đô thị ĐHQG TP.HCM):")
    add_rich_bullet(doc, "", "Đạt 150 giao dịch thành công trong 3 tháng đầu ra mắt (trong đó 30% - 40% là các đơn hàng Laptop/PC áp dụng hình thức trả góp, phần còn lại đến từ nhóm Phụ kiện công nghệ để tạo dòng tiền và thu hút khách hàng).", indent_cm=1.2)
    add_rich_bullet(doc, "", "Giá trị trung bình trên một đơn hàng (AOV) đối với nhóm Laptop/PC đạt từ 10.000.000 VNĐ; AOV toàn sàn (gộp phụ kiện) đạt khoảng 3.500.000 VNĐ.", indent_cm=1.2)
    add_rich_bullet(doc, "", "Tỷ lệ chuyển đổi đơn hàng (Conversion Rate) kỳ vọng ở mức 1.5% (tương đương mục tiêu thu hút khoảng 10.000 lượt truy cập chất lượng từ các cộng đồng sinh viên trong 3 tháng đầu).", indent_cm=1.2)

    # PHẦN 2
    add_heading_block(doc, "PHẦN 2: MÔ HÌNH KINH DOANH & PHẠM VI HỆ THỐNG", level=1)
    add_rich_bullet(doc, "Mô hình kinh doanh chủ đạo:", "B2C (Business-to-Consumer) - Bán lẻ trực tiếp thiết bị máy tính và phụ kiện tới người tiêu dùng cuối.")
    add_rich_bullet(doc, "Phân tích Chân dung khách hàng (Target Persona):", "")
    add_rich_bullet(doc, "Đối tượng:", "Sinh viên đại học các ngành CNTT, Kinh tế, Thiết kế đồ họa (Độ tuổi 18 - 24) cần trang bị thiết bị học tập nhưng ngân sách ban đầu hạn hẹp.", indent_cm=1.2)
    add_rich_bullet(doc, "Hành vi:", "Thường xuyên so sánh cấu hình và giá bán giữa các dòng máy, rất quan tâm đến các chương trình khuyến mãi mùa tựu trường, đặc biệt chú ý đến lãi suất và kỳ hạn trả góp.", indent_cm=1.2)
    add_rich_bullet(doc, "Điểm chạm (Touchpoints):", "Website TMĐT trên giao diện Mobile/Desktop, Fanpage, và các hội nhóm cộng đồng sinh viên (KTX ĐHQG, hội nhóm các trường thành viên) trên Facebook.", indent_cm=1.2)

    add_rich_bullet(doc, "Phạm vi bắt buộc MVP (In-scope):", "")
    add_rich_bullet(doc, "Hệ thống danh mục và bộ lọc chuyên sâu:", "Tìm kiếm và lọc sản phẩm theo nhu cầu thực tế (Laptop văn phòng, Laptop Gaming, Laptop Đồ họa) và theo thông số kỹ thuật (CPU, RAM, GPU, khoảng giá).", indent_cm=1.2)
    add_rich_bullet(doc, "Tính năng so sánh cấu hình (Compare Specs):", "Cho phép sinh viên đặt 2 - 3 mẫu Laptop/PC cạnh nhau để đối chiếu trực quan thông số kỹ thuật và giá bán trước khi ra quyết định.", indent_cm=1.2)
    add_rich_bullet(doc, "Module tính toán & đăng ký trả góp sinh viên:", "Công cụ tự động tính số tiền trả trước, số tiền góp mỗi tháng theo kỳ hạn (3 - 6 - 12 tháng); cho phép sinh viên tải lên hồ sơ định danh (CCCD, Thẻ sinh viên) để Admin xét duyệt trên hệ thống quản trị, kết hợp cổng thanh toán/BNPL (tích hợp môi trường Sandbox VNPay/MoMo/Fundiin).", indent_cm=1.2)
    add_rich_bullet(doc, "Quản lý đơn hàng (OMS):", "Theo dõi trạng thái đơn hàng và tra cứu tiến độ duyệt hồ sơ trả góp trực tuyến.", indent_cm=1.2)

    add_rich_bullet(doc, "Các tính năng để lại giai đoạn sau (Out-of-scope):", "")
    add_rich_bullet(doc, "", "Chương trình thu cũ đổi mới (Trade-in) tự động định giá máy cũ bằng AI.", indent_cm=1.2)
    add_rich_bullet(doc, "", "Công cụ tự xây dựng cấu hình máy tính nâng cao (Build PC tự động kiểm tra độ tương thích phần cứng chuyên sâu).", indent_cm=1.2)
    add_rich_bullet(doc, "", "Tích hợp tự động hóa hoàn toàn API eKYC bằng AI và kết nối trực tiếp API xuất hóa đơn điện tử thời gian thực với cơ quan Thuế (trong phạm vi đồ án, hệ thống tập trung chuẩn hóa luồng nghiệp vụ và xuất hóa đơn PDF mẫu).", indent_cm=1.2)

    # PHẦN 3
    add_heading_block(doc, "PHẦN 3: CHIẾN LƯỢC KỸ THUẬT & CHI PHÍ SỞ HỮU (TCO)", level=1)
    add_heading_block(doc, "1. Quyết định triển khai: Buy/Customize vs. Build from Scratch", level=2)
    add_rich_para(doc, [
        ("Quyết định: ", True, False),
        ("Mua sẵn & Tùy biến (Buy / Customize) - Nền tảng mã nguồn mở WooCommerce (WordPress).", False, False),
    ])
    add_rich_para(doc, [
        ("Lý do thuyết phục: ", True, False),
        ("Với định hướng phục vụ sinh viên và ngân sách khởi nghiệp cực kỳ eo hẹp, việc sử dụng nền tảng mã nguồn mở WooCommerce là lựa chọn tối ưu nhất. Phương án này tối ưu được chi phí khởi tạo ban đầu ở mức thấp nhất so với việc tự xây dựng từ số 0 (Build from Scratch), đồng thời giải quyết được rào cản phụ thuộc vào phí duy trì hàng tháng của các nền tảng SaaS thuần túy. Bên cạnh đó, với kiến trúc linh hoạt chạy trên môi trường PHP/MySQL, nhóm phát triển có thể can thiệp sâu vào mã nguồn (Custom Plugin/Hook) để tự thiết kế module tính toán lãi suất và quản lý hồ sơ trả góp sinh viên riêng biệt. Thời gian triển khai nhanh của nền tảng này cũng giúp dự án kịp ra mắt trong mùa tựu trường.", False, False),
    ])

    add_heading_block(doc, "2. Bảng tính toán Tổng chi phí sở hữu (TCO) giả định", level=2)
    add_rich_para(doc, [("Đơn vị tính: VNĐ (Ước tính theo mô hình Khởi nghiệp sinh viên - Lấy công làm lãi)", False, True)])
    add_styled_table(
        doc,
        headers=["Hạng mục chi phí", "Năm 1\n(Khởi tạo & Thử nghiệm)", "Năm 2\n(Mở rộng quy mô)", "Năm 3\n(Tối ưu & Nâng cấp)"],
        rows=[
            ["Hạ tầng & Bản quyền: Thuê Cloud Hosting/VPS, Domain, SSL, Theme/Plugin trả phí", "6.000.000", "10.000.000", "15.000.000"],
            ["Chi phí nhân sự & Vận hành: Core team tự phát triển (0đ), chi phí thuê CTV nhập liệu / CSKH theo ca", "18.000.000", "36.000.000", "60.000.000"],
            ["Dịch vụ bên thứ ba & Tiếp thị: SMS OTP, Email thông báo, Seeding cộng đồng sinh viên & Quảng cáo cơ bản", "12.000.000", "20.000.000", "25.000.000"],
            ["TỔNG CỘNG TCO", "36.000.000", "66.000.000", "100.000.000"],
        ],
        col_widths_cm=[7.6, 3.0, 3.0, 3.0],
        alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT],
    )
    add_rich_para(doc, [
        ("Ghi chú tài chính: ", True, False),
        ("Phí chiết khấu cổng thanh toán (MDR từ 1.5% - 2.5% của VNPay, MoMo hoặc đối tác BNPL) biến thiên theo doanh thu thực tế và được hạch toán trực tiếp vào giá vốn/biên lợi nhuận của từng đơn hàng, không tính cố định vào chi phí vận hành TCO.", False, False),
    ])

    # PHẦN 4
    add_heading_block(doc, "PHẦN 4: ĐẢM BẢO RỦI RO PHÁP LÝ & BẢO MẬT TẠI VIỆT NAM", level=1)
    add_heading_block(doc, "1. Rủi ro Pháp lý, Bảo mật & Thuế", level=2)
    add_rich_bullet(doc, "Đăng ký Website TMĐT:", "Bắt buộc hoàn thiện thủ tục thông báo Bộ Công Thương đối với website TMĐT bán hàng. Đồng thời, công khai minh bạch Chính sách bảo hành, Điều khoản sử dụng & Chính sách đổi trả ngay trên giao diện website để tránh rủi ro tranh chấp với người tiêu dùng.")
    add_rich_bullet(doc, "Nghĩa vụ Thuế:", "Hệ thống chuẩn hóa dữ liệu đơn hàng để sẵn sàng xuất hóa đơn điện tử (HĐĐT) theo từng giao dịch. Về mặt định hướng vận hành thực tế, website thiết kế cấu trúc dữ liệu tương thích để kết nối API với các đối tác T-VAN (Tổ chức cung cấp dịch vụ truyền nhận dữ liệu hóa đơn được Tổng cục Thuế cấp phép như MISA meInvoice, VNPT Invoice) nhằm đảm bảo kê khai Thuế Giá trị gia tăng (VAT 8% - 10%) và Thuế Thu nhập doanh nghiệp (TNDN) hợp lệ, minh bạch.")
    add_rich_bullet(doc, "Bảo mật thông tin cá nhân:", "Đối với luồng xét duyệt hồ sơ trả góp sinh viên nội bộ có thu thập thông tin nhạy cảm (hình ảnh CCCD, Thẻ sinh viên), hệ thống cam kết tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân: hiển thị thông báo xin sự đồng ý rõ ràng của người dùng trước khi tải tệp, phân quyền truy cập nghiêm ngặt cho Admin và mã hóa dữ liệu định danh lưu trữ trên hệ thống.")

    add_heading_block(doc, "2. Phương án chống rửa tiền và Gian lận thanh toán", level=2)
    add_rich_bullet(doc, "Kiểm soát dòng tiền:", "Mọi giao dịch thanh toán trực tuyến và giải ngân từ đối tác trả góp (BNPL) đều được đối soát và kiểm soát dòng tiền qua tài khoản định danh của đơn vị kinh doanh. Tuyệt đối không sử dụng tài khoản cá nhân không rõ nguồn gốc để nhận tiền.")
    add_rich_bullet(doc, "Chống gian lận trả góp (Tín dụng ảo):", "Đối với cổng BNPL (Fundiin), quy trình định danh điện tử (eKYC) sẽ do trực tiếp hệ thống của đối tác tài chính thực hiện và đảm bảo an toàn. Đối với luồng hỗ trợ trả góp sinh viên trên website, hệ thống áp dụng quy trình kiểm duyệt 2 lớp (đối chiếu thông tin CCCD, Thẻ sinh viên chính chủ và xác nhận qua số điện thoại/email sinh viên trường cấp) trước khi duyệt giao hàng.")
    add_rich_bullet(doc, "Chống gian lận thanh toán:", "Tích hợp các cổng thanh toán uy tín hỗ trợ tiêu chuẩn bảo mật 3D-Secure cho các giao dịch qua thẻ. Đồng thời, thiết lập cơ chế giới hạn tần suất gửi yêu cầu (Rate Limiting) và đưa vào danh sách đen (Blacklist) các tài khoản/địa chỉ IP có hành vi spam tạo đơn hàng ảo hoặc tải lên hồ sơ giả mạo.")
    add_rich_bullet(doc, "Quản lý rủi ro hàng hóa:", "Quản lý và lưu trữ chính xác mã Serial Number (S/N) / Service Tag / Mã vạch thiết bị trên vỏ hộp vào chi tiết đơn hàng ngay khi xuất kho để đối chiếu khi bảo hành hoặc đổi trả, phòng ngừa triệt để hành vi đánh tráo sản phẩm hoặc linh kiện.")

    # PHẦN 5
    add_heading_block(doc, "PHẦN 5: PHÂN CÔNG VAI TRÒ SCRUM & MÔ TẢ CÔNG VIỆC DỰ KIẾN", level=1)
    add_heading_block(doc, "1. Mô tả chi tiết Vai trò Scrum & Công việc dự kiến của từng thành viên", level=2)

    members = [
        (
            "Thành viên 1 – Product Owner (PO) (Kiêm Nhóm trưởng / Business Analyst)",
            [
                ("Trách nhiệm theo Scrum:", "Sở hữu tầm nhìn sản phẩm GearForge, xây dựng và sắp xếp độ ưu tiên Product Backlog theo giá trị MVP; viết User Stories và tiêu chí chấp nhận (Acceptance Criteria); làm đầu mối trao đổi với GVHD và nghiệm thu đầu ra cuối mỗi Sprint."),
                ("Phân tích yêu cầu (EC312 Mục 1 & 2):", "Khảo sát nhu cầu mua sắm/trả góp của sinh viên ĐHQG TP.HCM; hoàn thiện bài toán, mục tiêu, phạm vi, KPIs, bảng TCO, danh sách Functional Requirements (FR) & Non-Functional Requirements (NFR)."),
                ("Mô hình hóa (EC312 Mục 3):", "Chủ trì vẽ Biểu đồ Use Case tổng thể; viết đặc tả Use Case và vẽ Activity Diagram + Sequence Diagram cho cụm Tìm kiếm, Bộ lọc thông số chuyên sâu & So sánh cấu hình (Compare Specs)."),
                ("Dữ liệu & Pháp lý (Demo):", "Chuẩn hóa bộ thuộc tính sản phẩm (Nhu cầu, CPU, RAM, GPU, Giá); thu thập và import tối thiểu 500 sản phẩm lên WooCommerce; soạn nội dung Chính sách bảo hành, Đổi trả, Điều khoản (thông báo Bộ Công Thương)."),
            ],
        ),
        (
            "Thành viên 2 – Scrum Master (SM) (Kiêm Kiến trúc sư hệ thống & Security/QA Lead)",
            [
                ("Trách nhiệm theo Scrum:", "Điều phối các sự kiện Scrum (Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective); quản lý tiến độ trên Jira/Trello/GitHub; tháo gỡ vướng mắc kỹ thuật và ghi chép Nhật ký làm việc nhóm (Phụ lục EC312)."),
                ("Kiến trúc & Bảo mật (EC312 Mục 4.1 & Phần 4):", "Thiết kế Sơ đồ Kiến trúc hệ thống (Layered / Microkernel trên WordPress/WooCommerce + Custom Plugin + Payment Sandbox); thiết kế cơ chế tuân thủ Nghị định 13/2023/NĐ-CP (mã hóa CCCD/Thẻ SV, phân quyền RBAC Admin) và chống gian lận (Rate Limiting, Blacklist IP/Account)."),
                ("Mô hình hóa (EC312 Mục 3):", "Chủ trì thống nhất Class Diagram tổng thể và State Machine Diagram (vòng đời Đơn hàng & Hồ sơ trả góp); viết đặc tả Use Case + Sequence Diagram cho cụm Xác thực, Phân quyền & Bảo mật/Chống gian lận."),
                ("Hạ tầng, Kiểm thử & Tài liệu (QA):", "Thiết lập Cloud Hosting/VPS, Domain, SSL, WAF; lập Test Plan & Test Cases kiểm thử toàn luồng nghiệp vụ và bảo mật upload tệp; tổng hợp, rà soát chuẩn định dạng báo cáo (.docx & .pdf)."),
            ],
        ),
        (
            "Thành viên 3 – Developer 1 (UI/UX Designer & Frontend WooCommerce Specialist)",
            [
                ("Trách nhiệm theo Scrum:", "Tham gia ước lượng Story Points trong Sprint Planning; chuyển hóa các User Story thành giao diện trực quan, tối ưu trải nghiệm mua sắm và so sánh cấu hình cho sinh viên trên cả Mobile và Desktop."),
                ("Thiết kế UI/UX (EC312 Mục 4.3):", "Thiết kế bộ Wireframe & Mockup trên Figma cho: Trang chủ, Danh mục & Bộ lọc thông số kỹ thuật, Chi tiết sản phẩm, Bảng so sánh 2-3 Laptop/PC, Form tính toán & đăng ký trả góp, Giỏ hàng, Checkout, Tra cứu đơn hàng & Admin Dashboard."),
                ("Mô hình hóa (EC312 Mục 3):", "Viết đặc tả Use Case + Activity Diagram + Sequence Diagram cho cụm Giỏ hàng, Đặt hàng & Theo dõi trạng thái đơn hàng (OMS)."),
                ("Triển khai Frontend WooCommerce (Demo):", "Tùy biến Theme/Child Theme WordPress; xây dựng giao diện Bộ lọc đa tiêu chí (CPU, RAM, GPU, Nhu cầu, Giá) và Compare Specs; tích hợp hộp thoại xác nhận đồng ý xử lý dữ liệu (Consent Notice theo NĐ 13/2023); tối ưu tốc độ tải trang (< 3 giây)."),
            ],
        ),
        (
            "Thành viên 4 – Developer 2 (Backend, Database & Payment/Installment Engineer)",
            [
                ("Trách nhiệm theo Scrum:", "Tham gia ước lượng kỹ thuật và hiện thực hóa các logic nghiệp vụ lõi ở tầng Backend, cơ sở dữ liệu và tích hợp API thanh toán đảm bảo tính toàn vẹn dữ liệu."),
                ("Thiết kế CSDL (EC312 Mục 4.2):", "Xây dựng Mô hình ERD và ánh xạ sang CSDL quan hệ (MySQL) mở rộng trên WooCommerce (wp_gf_installment_plans, wp_gf_installment_applications, wp_gf_order_serials, wp_gf_fraud_blacklist)."),
                ("Mô hình hóa (EC312 Mục 3):", "Viết đặc tả Use Case + BPMN / Activity Diagram + Sequence Diagram cho cụm Đăng ký trả góp sinh viên, Xét duyệt 2 lớp & Thanh toán trực tuyến."),
                ("Lập trình Custom Plugin & Tích hợp (Demo):", "Phát triển Custom WordPress Plugin (PHP/MySQL) cho Module trả góp sinh viên (tính trả trước, chia kỳ hạn 3-6-12 tháng, mã hóa lưu trữ CCCD/Thẻ SV, luồng Admin duyệt 2 lớp); tích hợp Sandbox VNPay/MoMo/Fundiin (3D-Secure); quản lý Serial Number (S/N) xuất kho và xuất Hóa đơn PDF mẫu chuẩn dữ liệu T-VAN."),
            ],
        ),
    ]

    for title, items in members:
        add_heading_block(doc, title, level=3)
        for lbl, txt in items:
            add_rich_bullet(doc, lbl, txt)

    add_heading_block(doc, "2. Ma trận phân công Hạng mục Đồ án EC312 (Bám sát Rubric)", level=2)
    add_styled_table(
        doc,
        headers=["Hạng mục theo Mẫu & Rubric EC312", "Tỷ trọng", "Chủ trì (Owner)", "Phối hợp (Support)"],
        rows=[
            ["1. Phân tích yêu cầu: Bài toán, KPIs, TCO, FR/NFR, Khảo sát SV, Use Case tổng thể", "15%", "Thành viên 1 (PO)", "Cả nhóm (mỗi TV 1 đặc tả UC)"],
            ["2. Thiết kế hệ thống & UML: Kiến trúc, Class, State Machine, Activity/BPMN, Sequence", "25%", "Thành viên 2 (SM)", "TV1, TV3, TV4 (vẽ theo phân hệ)"],
            ["3. Thiết kế UI/UX: Wireframe/Mockup Figma, User Flow, Responsive", "10%", "Thành viên 3 (Dev 1)", "Thành viên 1 (PO) duyệt nghiệp vụ"],
            ["4. Thiết kế CSDL: ERD, Chuẩn hóa MySQL, Bảng mở rộng WooCommerce", "10%", "Thành viên 4 (Dev 2)", "Thành viên 2 (SM) rà soát bảo mật"],
            ["5. Triển khai Demo: WooCommerce ≥ 500 SP, Lọc, Compare, Trả góp, Sandbox, S/N, PDF", "20%", "Thành viên 3 & 4", "TV1 (500 SP), TV2 (Hosting/QA)"],
            ["6. Tài liệu, Pháp lý & Nhật ký nhóm: Báo cáo .docx/.pdf, Pháp lý VN, Test, Scrum Log", "10%", "Thành viên 2 (SM) & TV1 (PO)", "Thành viên 3 & 4 viết phần kỹ thuật"],
            ["7. Tính sáng tạo & Mở rộng: So sánh mô hình, Trả góp SV, Định hướng T-VAN/eKYC/AI", "10%", "Thành viên 1 (PO) & TV4", "Thành viên 2 & 3"],
        ],
        col_widths_cm=[7.0, 1.8, 3.8, 4.0],
        alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT],
    )

    add_heading_block(doc, "3. Lộ trình thực hiện dự kiến theo Scrum Sprints (4 Sprints)", level=2)
    add_rich_bullet(doc, "Sprint 1 – Khởi tạo, Khảo sát & Phân tích Yêu cầu:", "Chốt Product Backlog, khảo sát sinh viên ĐHQG, hoàn thiện FR/NFR, Use Case tổng thể, đặc tả Use Case từng thành viên, dựng môi trường WordPress/WooCommerce & Hosting/Git.")
    add_rich_bullet(doc, "Sprint 2 – Thiết kế Hệ thống, CSDL & UI/UX:", "Hoàn thiện System Architecture, ERD, Class Diagram, State Machine, Activity/Sequence Diagrams và bộ Mockup Figma; bắt đầu thu thập/import dữ liệu 500 sản phẩm.")
    add_rich_bullet(doc, "Sprint 3 – Phát triển MVP Core (Storefront, Compare & Plugin Trả góp):", "Hoàn thiện giao diện Storefront, Bộ lọc cấu hình chuyên sâu, So sánh 2-3 Laptop/PC; lập trình Custom Plugin tính toán & nộp hồ sơ trả góp sinh viên (kèm Consent NĐ 13/2023 và mã hóa dữ liệu).")
    add_rich_bullet(doc, "Sprint 4 – Tích hợp Thanh toán Sandbox, OMS, Kiểm thử & Hoàn thiện Báo cáo:", "Tích hợp VNPay/MoMo/Fundiin Sandbox, luồng Admin duyệt 2 lớp, quản lý S/N, xuất hóa đơn PDF mẫu; kiểm thử bảo mật (Rate Limit/Blacklist) & chức năng; quay video/chuẩn bị Demo và xuất bản báo cáo .docx / .pdf.")

    out_path = r"D:\DANMH\TKeHT\Bản mô tả dự án GearForge.docx"
    doc.save(out_path)
    print("Saved:", out_path)


if __name__ == "__main__":
    build()
