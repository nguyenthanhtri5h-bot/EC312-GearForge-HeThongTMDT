import csv
from pathlib import Path

OUT_CSV = Path(__file__).resolve().parent / "products_import.csv"

HEADERS = [
    "SKU", "Type", "Name", "Published", "Is featured?", "Visibility in catalog",
    "Short description", "Description", "In stock?", "Stock",
    "Regular price", "Sale price", "Categories",
    "Attribute 1 name", "Attribute 1 value(s)", "Attribute 1 visible", "Attribute 1 global",
    "Attribute 2 name", "Attribute 2 value(s)", "Attribute 2 visible", "Attribute 2 global",
    "Attribute 3 name", "Attribute 3 value(s)", "Attribute 3 visible", "Attribute 3 global",
    "Attribute 4 name", "Attribute 4 value(s)", "Attribute 4 visible", "Attribute 4 global",
    "Attribute 5 name", "Attribute 5 value(s)", "Attribute 5 visible", "Attribute 5 global",
    "Attribute 6 name", "Attribute 6 value(s)", "Attribute 6 visible", "Attribute 6 global",
    "Attribute 7 name", "Attribute 7 value(s)", "Attribute 7 visible", "Attribute 7 global",
    "Attribute 8 name", "Attribute 8 value(s)", "Attribute 8 visible", "Attribute 8 global",
]


def make_row(
    sku: str,
    name: str,
    regular_price: int,
    sale_price: int | None,
    categories: str,
    short_desc: str,
    stock: int,
    attrs: list[tuple[str, str]],
    featured: int = 0,
) -> list[str]:
    row = [
        sku,
        "simple",
        name,
        "1",
        str(featured),
        "visible",
        short_desc,
        f"{name}. {short_desc}. Hỗ trợ trả góp sinh viên ĐHQG 0% lãi (3 tháng) hoặc linh hoạt 6-12 tháng tại GearForge. Bảo hành chính hãng có đối chiếu Serial Number (S/N).",
        "1",
        str(stock),
        str(regular_price),
        str(sale_price) if sale_price else "",
        categories,
    ]
    for i in range(8):
        if i < len(attrs) and attrs[i][1]:
            row.extend([attrs[i][0], attrs[i][1], "1", "1"])
        else:
            row.extend(["", "", "", ""])
    return row


def generate_laptops() -> list[list[str]]:
    rows: list[list[str]] = []
    laptop_bases = [
        ("ASUS Vivobook 15 OLED", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i5-13500H", "Intel Iris Xe", "15.6 inch OLED FHD", "1.7 kg", 15990000),
        ("ASUS TUF Gaming A15", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "AMD Ryzen 5 7535HS", "RTX 2050 4GB", "15.6 inch FHD 144Hz", "2.3 kg", 17490000),
        ("ASUS ROG Strix G16", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i7-13650HX", "RTX 4060 8GB", "16 inch QHD+ 165Hz", "2.5 kg", 32990000),
        ("Lenovo IdeaPad Slim 5", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "AMD Ryzen 7 7730U", "AMD Radeon Graphics", "14 inch WUXGA IPS", "1.46 kg", 14990000),
        ("Lenovo LOQ 15IAX9", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i5-12450HX", "RTX 3050 6GB", "15.6 inch FHD 144Hz", "2.38 kg", 19990000),
        ("Lenovo Legion Slim 5", "Laptop > Laptop Đồ họa", "Đồ họa, Gaming", "AMD Ryzen 7 7840HS", "RTX 4060 8GB", "16 inch WQXGA 165Hz", "2.4 kg", 34990000),
        ("Acer Aspire 5 Spin", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i5-1335U", "Intel Iris Xe", "14 inch FHD IPS Touch", "1.6 kg", 14290000),
        ("Acer Nitro V 15", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i5-13420H", "RTX 4050 6GB", "15.6 inch FHD 144Hz", "2.1 kg", 22490000),
        ("Acer Predator Helios Neo 16", "Laptop > Laptop Đồ họa", "Đồ họa, Gaming", "Intel Core i7-14700HX", "RTX 4060 8GB", "16 inch WQXGA 165Hz", "2.6 kg", 36990000),
        ("HP Pavilion 15", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i5-1335U", "Intel Iris Xe", "15.6 inch FHD IPS", "1.74 kg", 15490000),
        ("HP Victus 16", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "AMD Ryzen 5 7640HS", "RTX 3050 6GB", "16.1 inch FHD 144Hz", "2.33 kg", 20990000),
        ("Dell Inspiron 15 3530", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i5-1335U", "Intel Iris Xe", "15.6 inch FHD 120Hz", "1.65 kg", 14990000),
        ("Dell Vostro 3530", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i7-1355U", "Intel Iris Xe", "15.6 inch FHD 120Hz", "1.66 kg", 18990000),
        ("MSI Modern 14 C13M", "Laptop > Laptop Văn phòng", "Văn phòng, Sinh viên", "Intel Core i5-1335U", "Intel Iris Xe", "14 inch FHD IPS", "1.4 kg", 12990000),
        ("MSI Cyborg 15", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i5-12450H", "RTX 2050 4GB", "15.6 inch FHD 144Hz", "1.98 kg", 17290000),
        ("MSI Katana 15", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i7-13620H", "RTX 4060 8GB", "15.6 inch FHD 144Hz", "2.25 kg", 29490000),
        ("MacBook Air M2 13", "Laptop > Laptop Đồ họa", "Đồ họa, Văn phòng", "Apple M2", "Apple GPU 8-core", "13.6 inch Liquid Retina", "1.24 kg", 24490000),
        ("MacBook Air M3 15", "Laptop > Laptop Đồ họa", "Đồ họa, Văn phòng", "Apple M3", "Apple GPU 10-core", "15.3 inch Liquid Retina", "1.51 kg", 31990000),
        ("Gigabyte G5 MF", "Laptop > Laptop Gaming", "Gaming, Đồ họa", "Intel Core i5-12500H", "RTX 4050 6GB", "15.6 inch FHD 144Hz", "2.08 kg", 20490000),
        ("LG Gram 14 2024", "Laptop > Laptop Văn phòng", "Văn phòng, Đồ họa", "Intel Core Ultra 5 125H", "Intel Arc Graphics", "14 inch WUXGA IPS", "1.12 kg", 28990000),
    ]
    variants = [
        ("8GB", "512GB SSD", 0, "Bản Tiêu chuẩn"),
        ("16GB", "512GB SSD", 1200000, "Bản RAM 16GB"),
        ("16GB", "1TB SSD", 2400000, "Bản RAM 16GB - 1TB"),
        ("32GB", "1TB SSD", 4200000, "Bản Đồ họa 32GB"),
        ("16GB", "512GB SSD", 900000, "Bản SV ĐHQG 2025"),
        ("24GB", "512GB SSD", 2100000, "Bản RAM 24GB"),
        ("32GB", "2TB SSD", 6200000, "Bản Pro Workstation"),
        ("8GB", "256GB SSD", -800000, "Bản Tiết kiệm"),
        ("16GB", "1TB SSD", 2700000, "Bản Gaming Plus"),
        ("32GB", "1TB SSD", 4600000, "Bản Creator"),
        ("16GB", "512GB SSD", 1400000, "Bản Win 11 Pro"),
        ("24GB", "1TB SSD", 3500000, "Bản Full Option"),
        ("16GB", "512GB SSD", 1100000, "Bản Back-to-School"),
    ]
    idx = 1
    for base_name, cat, usage, cpu, gpu, screen, weight, base_price in laptop_bases:
        for ram, ssd, delta, tag in variants:
            if idx > 260:
                break
            reg = max(9990000, base_price + delta)
            sale = reg - 1000000
            sku = f"GF-LAP-{idx:03d}"
            full_name = f"Laptop {base_name} ({ram} / {ssd}) - {tag}"
            short = f"{cpu} | RAM {ram} | {gpu} | {ssd} | {screen}"
            attrs = [
                ("Nhu cầu", usage),
                ("CPU", cpu),
                ("RAM", ram),
                ("GPU", gpu),
                ("Ổ cứng", ssd),
                ("Màn hình", screen),
                ("Trọng lượng", weight),
                ("Bảo hành", "24 tháng chính hãng"),
            ]
            rows.append(make_row(sku, full_name, reg, sale, cat, short, 10 + (idx % 25), attrs, featured=1 if idx <= 8 else 0))
            idx += 1
    return rows


def generate_pcs() -> list[list[str]]:
    rows: list[list[str]] = []
    pc_bases = [
        ("PC GearForge Starter Office", "PC nguyên bộ > PC Văn phòng & Đồ họa", "Văn phòng, Sinh viên", "Intel Core i3-12100", "Intel UHD 730", 8490000),
        ("PC GearForge Coder Pro", "PC nguyên bộ > PC Văn phòng & Đồ họa", "Văn phòng, Đồ họa", "Intel Core i5-13400", "Intel UHD 730", 12490000),
        ("PC GearForge Gaming Nova", "PC nguyên bộ > PC Gaming", "Gaming, Đồ họa", "Intel Core i5-12400F", "RTX 3050 6GB", 14990000),
        ("PC GearForge Gaming Titan", "PC nguyên bộ > PC Gaming", "Gaming, Đồ họa", "Intel Core i5-13400F", "RTX 4060 8GB", 21490000),
        ("PC GearForge Creator Studio", "PC nguyên bộ > PC Văn phòng & Đồ họa", "Đồ họa, Gaming", "Intel Core i7-14700K", "RTX 4070 12GB", 38990000),
        ("PC GearForge Ryzen Arena", "PC nguyên bộ > PC Gaming", "Gaming, Đồ họa", "AMD Ryzen 5 5600", "RX 6600 8GB", 13990000),
        ("PC GearForge Ryzen Phantom", "PC nguyên bộ > PC Gaming", "Gaming, Đồ họa", "AMD Ryzen 5 7600", "RTX 4060 Ti 8GB", 25990000),
        ("PC GearForge AI Render", "PC nguyên bộ > PC Văn phòng & Đồ họa", "Đồ họa, Gaming", "AMD Ryzen 9 7900X", "RTX 4070 Super 12GB", 46990000),
        ("PC GearForge Mini Dorm", "PC nguyên bộ > PC Văn phòng & Đồ họa", "Văn phòng, Sinh viên", "AMD Ryzen 5 5600G", "Radeon Vega 7", 9490000),
        ("PC GearForge eSports X", "PC nguyên bộ > PC Gaming", "Gaming", "Intel Core i5-14400F", "RTX 4060 8GB", 22990000),
    ]
    pc_variants = [
        ("16GB", "512GB NVMe", 0, "Case Airflow Đen"),
        ("16GB", "1TB NVMe", 1100000, "Case Kính RGB"),
        ("32GB", "1TB NVMe", 2600000, "Bản Render 32GB"),
        ("32GB", "2TB NVMe", 4500000, "Bản Studio 2TB"),
        ("16GB", "512GB NVMe", 800000, "Kèm Tản Khí ARGB"),
        ("32GB", "1TB NVMe", 3400000, "Kèm Tản Nước AIO 240"),
        ("16GB", "512GB NVMe", 500000, "Bản SV ĐHQG"),
        ("64GB", "2TB NVMe", 7900000, "Bản Workstation 64GB"),
        ("16GB", "1TB NVMe", 1500000, "Case Trắng Minimal"),
        ("32GB", "1TB NVMe", 2900000, "Bản Full Black"),
        ("16GB", "512GB NVMe", 300000, "Bản Tiết kiệm"),
    ]
    idx = 1
    for base_name, cat, usage, cpu, gpu, base_price in pc_bases:
        for ram, ssd, delta, tag in pc_variants:
            if idx > 110:
                break
            reg = base_price + delta
            sale = reg - 800000
            sku = f"GF-PC-{idx:03d}"
            full_name = f"{base_name} ({ram} / {ssd}) - {tag}"
            short = f"{cpu} | RAM {ram} | {gpu} | {ssd} | Nguồn chuẩn 80 Plus"
            attrs = [
                ("Nhu cầu", usage),
                ("CPU", cpu),
                ("RAM", ram),
                ("GPU", gpu),
                ("Ổ cứng", ssd),
                ("Màn hình", "Chưa gồm màn hình"),
                ("Trọng lượng", "8.5 kg"),
                ("Bảo hành", "36 tháng theo linh kiện"),
            ]
            rows.append(make_row(sku, full_name, reg, sale, cat, short, 8 + (idx % 15), attrs))
            idx += 1
    return rows


def generate_accessories() -> list[list[str]]:
    rows: list[list[str]] = []
    acc_groups = [
        ("Phụ kiện > Chuột Gaming", "Gaming, Văn phòng", [
            ("Chuột Logitech G304 Lightspeed", "Logitech", "Không dây 2.4GHz", 890000),
            ("Chuột Logitech G102 Lightsync", "Logitech", "Có dây USB", 490000),
            ("Chuột Logitech G Pro X Superlight 2", "Logitech", "Không dây Lightspeed", 3490000),
            ("Chuột Razer DeathAdder V3", "Razer", "Có dây 8KHz", 1690000),
            ("Chuột Razer Viper V3 HyperSpeed", "Razer", "Không dây", 1790000),
            ("Chuột Pulsar X2V2 Wireless", "Pulsar", "Không dây 2.4GHz", 2190000),
        ]),
        ("Phụ kiện > Bàn phím cơ", "Gaming, Văn phòng", [
            ("Bàn phím cơ Akko 3068B Plus", "Akko", "3 Mode Bluetooth/2.4G/USB-C", 1490000),
            ("Bàn phím cơ Akko 5075B Plus", "Akko", "3 Mode Gasket Mount", 1890000),
            ("Bàn phím cơ Keychron K2 Pro", "Keychron", "Bluetooth / USB-C", 2290000),
            ("Bàn phím cơ Aula F75", "Aula", "3 Mode Wireless", 1190000),
            ("Bàn phím cơ DareU EK75 Pro", "DareU", "3 Mode Wireless", 890000),
            ("Bàn phím cơ Logitech G515 TKL", "Logitech", "Lightspeed Low-profile", 3190000),
        ]),
        ("Phụ kiện > Tai nghe", "Gaming, Văn phòng", [
            ("Tai nghe HyperX Cloud III", "HyperX", "Có dây USB/3.5mm", 2190000),
            ("Tai nghe Logitech G435 Lightspeed", "Logitech", "Không dây / Bluetooth", 1490000),
            ("Tai nghe Razer BlackShark V2 X", "Razer", "Có dây 3.5mm", 1190000),
            ("Tai nghe SteelSeries Arctis Nova 1", "SteelSeries", "Có dây 3.5mm", 1450000),
            ("Tai nghe Sony WH-CH520", "Sony", "Bluetooth 5.2", 1190000),
            ("Tai nghe JBL Quantum 350 Wireless", "JBL", "Không dây 2.4GHz", 1890000),
        ]),
        ("Phụ kiện > RAM & SSD", "Đồ họa, Gaming, Văn phòng", [
            ("SSD Samsung 980 Pro 1TB NVMe", "Samsung", "PCIe 4.0 x4", 2490000),
            ("SSD Kingston NV2 500GB NVMe", "Kingston", "PCIe 4.0 x4", 990000),
            ("SSD WD Black SN850X 1TB", "Western Digital", "PCIe 4.0 x4", 2690000),
            ("RAM Laptop Kingston Fury 16GB DDR5", "Kingston", "5600MHz SO-DIMM", 1290000),
            ("RAM PC Corsair Vengeance 16GB DDR4", "Corsair", "3200MHz", 1090000),
            ("RAM PC G.Skill Trident Z5 32GB DDR5", "G.Skill", "6000MHz RGB", 3290000),
        ]),
        ("Phụ kiện > Balo & Đế tản nhiệt", "Sinh viên, Văn phòng", [
            ("Balo Laptop Targus Cypress 15.6", "Targus", "Chống sốc Eco", 1190000),
            ("Balo Gaming ASUS ROG BP1501", "ASUS", "Vải trượt nước 15.6 inch", 790000),
            ("Đế tản nhiệt Cooler Master NotePal", "Cooler Master", "2 Quạt USB êm ái", 590000),
            ("Giá đỡ Laptop Nhôm CNC gập gọn", "GearForge", "Hợp kim nhôm", 290000),
            ("Hub chuyển Type-C Ugreen 6-in-1", "Ugreen", "HDMI 4K + PD 100W", 650000),
            ("Lót chuột Gaming XL Speed", "GearForge", "800x300x4mm bo viền", 190000),
        ]),
    ]
    variants = ["Đen Obsidian", "Trắng Frost", "Xám Space", "Phiên bản SV ĐHQG", "Limited Edition"]

    idx = 1
    for cat, usage, items in acc_groups:
        for base_name, brand, conn, price in items:
            for v in variants:
                if idx > 150:
                    break
                sku = f"GF-ACC-{idx:03d}"
                full_name = f"{base_name} - {v}"
                reg = price
                sale = max(149000, int(price * 0.9))
                short = f"Thương hiệu {brand} | Kết nối {conn} | Bảo hành chính hãng 12 tháng"
                attrs = [
                    ("Nhu cầu", usage),
                    ("Thương hiệu", brand),
                    ("Kết nối", conn),
                    ("Bảo hành", "12 tháng 1 đổi 1"),
                ]
                rows.append(make_row(sku, full_name, reg, sale, cat, short, 25 + (idx % 30), attrs))
                idx += 1
    return rows


def main():
    all_rows = generate_laptops() + generate_pcs() + generate_accessories()
    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        writer.writerows(all_rows)
    print(f"Generated {len(all_rows)} products -> {OUT_CSV}")


if __name__ == "__main__":
    main()
