import type { GearForgeProduct } from '../../types/gearforge';

export interface CardSpecItem {
  kind: 'cpu' | 'gpu' | 'ram' | 'extra';
  label: string;
  title: string;
}

function cleanRaw(val: string | undefined): string {
  return (val || '')
    .replace(/[®™]/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
}

function formatCpu(val: string | undefined): string {
  const clean = cleanRaw(val);
  if (!clean || clean === 'Đang cập nhật') return 'Core / Ryzen';
  const ultra = clean.match(/Core\s*Ultra\s*([579])(?:\s*processor)?\s*[- ]?(\d{3}[A-Z]*)/i);
  if (ultra) return `Ultra ${ultra[1]} ${ultra[2]}`;
  const intel = clean.match(/(?:Intel\s*Core\s*)?(i[3579]|Core\s*[3579])(?:\s*processor)?\s*[- ]?(\d{3,5}[A-Z]*)/i);
  if (intel) return `${intel[1].replace(/^Core\s*/i, 'Core ')}-${intel[2]}`.replace(/\s+/g, ' ');
  const ryzen = clean.match(/Ryzen\s*(?:AI\s*(?:Max\+?\s*)?)?([3579])\s*[- ]?(\d{3,4}[A-Z]*)/i);
  if (ryzen) return `R${ryzen[1]}-${ryzen[2]}`;
  const apple = clean.match(/M[1-4](?:\s*(?:Pro|Max))?/i);
  if (apple) return apple[0];
  return clean.replace(/^CPU\s+(AMD|Intel)\s+/i, '').slice(0, 16);
}

function formatGpu(val: string | undefined): string {
  const clean = cleanRaw(val);
  if (!clean || clean === 'Đang cập nhật') return 'GPU Onboard';
  const rtx = clean.match(/(?:RTX|GTX)\s*\d{4}(?:\s*(?:Ti|SUPER|4GB|6GB|8GB|12GB|16GB))?/i);
  if (rtx) return rtx[0].replace(/\s+/g, ' ');
  const rx = clean.match(/(?:Radeon\s*)?(RX\s*\d{3,4}[A-Z]*|\d{3}M)/i);
  if (rx) return rx[1].startsWith('RX') ? rx[1] : `Radeon ${rx[1]}`;
  if (/arc/i.test(clean)) return 'Intel Arc';
  if (/tích hợp|iris|uhd|graphics|onboard/i.test(clean)) return 'GPU Onboard';
  return clean.slice(0, 16);
}

function formatRam(val: string | undefined): string {
  const clean = cleanRaw(val);
  if (!clean || clean === 'Đang cập nhật') return '16GB RAM';
  const ram = clean.match(/(\d+\s*GB)(?:\s*(LPDDR[45]X?|DDR[45]))?/i);
  if (ram) return `${ram[1].replace(/\s+/g, '')}${ram[2] ? ` ${ram[2].toUpperCase()}` : ''}`;
  return clean.slice(0, 16);
}

function formatStorage(val: string | undefined, screen: string | undefined): string {
  const clean = cleanRaw(val || screen);
  if (!clean || clean === 'Đang cập nhật') return '512GB NVMe';
  const ssd = clean.match(/(\d+\s*(?:GB|TB))/i);
  if (ssd) return `${ssd[1].replace(/\s+/g, '')} SSD`;
  return clean.slice(0, 16);
}

export function extractCardSpecs(product: GearForgeProduct): CardSpecItem[] {
  const slug = (product.categorySlug || '').toLowerCase();
  const isGear = ['gear', 'chuot', 'ban-phim', 'lot-chuot', 'phu-kien'].some((k) => slug.includes(k));
  const isComponent = ['linh-kien', 'cpu', 'ram', 'vga'].some((k) => slug.includes(k));

  if (isGear) {
    return [
      { kind: 'cpu', label: product.category || 'Esports Gear', title: product.category },
      { kind: 'gpu', label: 'Chính hãng VAT', title: 'Xuất hóa đơn VAT ĐHQG' },
      { kind: 'ram', label: 'Bảo hành 24T', title: 'Bảo hành chính hãng 24 tháng' },
      { kind: 'extra', label: 'Giao KTX 2 giờ', title: 'Giao nhanh KTX ĐHQG-HCM' },
    ];
  }

  if (isComponent) {
    const firstPart = cleanRaw(product.specs.cpu || product.specs.gpu || product.specs.ram) || product.category;
    return [
      { kind: 'cpu', label: firstPart.slice(0, 16), title: firstPart },
      { kind: 'gpu', label: 'Tem Serial S/N', title: 'Quản lý Serial chính hãng' },
      { kind: 'ram', label: 'Bảo hành 36T', title: 'Bảo hành 36 tháng' },
      { kind: 'extra', label: 'Fullbox VAT', title: 'Nguyên seal + hóa đơn VAT' },
    ];
  }

  return [
    { kind: 'cpu', label: formatCpu(product.specs.cpu), title: product.specs.cpu || 'CPU' },
    { kind: 'gpu', label: formatGpu(product.specs.gpu), title: product.specs.gpu || 'GPU' },
    { kind: 'ram', label: formatRam(product.specs.ram), title: product.specs.ram || 'RAM' },
    { kind: 'extra', label: formatStorage(product.specs.storage, product.specs.screen), title: product.specs.storage || 'Lưu trữ' },
  ];
}
