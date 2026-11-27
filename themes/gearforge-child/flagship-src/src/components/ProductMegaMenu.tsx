import { useEffect, useState } from 'react';
import { MEGA_PREVIEW_ITEMS } from '../data/megaMenuData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import type { FilterParams } from '../types/gearforge';

interface SlimLink {
  id: keyof typeof MEGA_PREVIEW_ITEMS;
  label: string;
  action: () => void;
}

const PREVIEW_LIST = Object.values(MEGA_PREVIEW_ITEMS);

export function ProductMegaMenu({ onSelect }: { onSelect?: () => void }) {
  const { navigateToPage, openDrawer } = useGearForgeStore();
  const [activeId, setActiveId] = useState<string>('all');

  useEffect(() => {
    PREVIEW_LIST.forEach((item) => {
      const pre = new Image();
      pre.src = item.img;
    });
  }, []);

  const goShop = (patch?: Partial<FilterParams>) => {
    onSelect?.();
    navigateToPage('shop', patch);
  };

  const hardwareLinks: SlimLink[] = [
    { id: 'all', label: 'Tất cả Kho Máy ĐHQG', action: () => goShop() },
    { id: 'gaming', label: 'Laptop Gaming RTX 40/50', action: () => goShop({ category: 'laptop-gaming' }) },
    { id: 'ultrabook', label: 'Ultrabook & Đồ họa OLED', action: () => goShop({ category: 'laptop-ultrabook' }) },
    { id: 'pc', label: 'PC Custom & Workstation AI', action: () => goShop({ category: 'pc-workstation' }) },
    { id: 'linhKien', label: 'Linh kiện & Card đồ họa', action: () => goShop({ category: 'linh-kien' }) },
    { id: 'gear', label: 'Gaming Gear & Màn hình 240Hz', action: () => goShop({ category: 'gear' }) },
  ];

  const svLinks: SlimLink[] = [
    { id: 'ecosystem', label: 'Gợi ý máy theo ngành học', action: () => { onSelect?.(); navigateToPage('ecosystem'); } },
    { id: 'installment', label: 'Trả góp 0% qua .edu.vn', action: () => { onSelect?.(); openDrawer('installment'); } },
    { id: 'compare', label: 'So sánh tối đa 3 cấu hình', action: () => { onSelect?.(); openDrawer('compare'); } },
    { id: 'tracking', label: 'Tra cứu đơn & Bảo hành S/N', action: () => { onSelect?.(); navigateToPage('tracking'); } },
  ];

  const activePreview = MEGA_PREVIEW_ITEMS[activeId] || MEGA_PREVIEW_ITEMS.all;

  return (
    <div
      className="mega-menu-wrap"
      role="menu"
      aria-label="Danh mục sản phẩm"
      onMouseLeave={() => setActiveId('all')}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setActiveId('all');
      }}
    >
      <div className="gf-mega-split">
        <div className="gf-slim-col">
          <span className="gf-slim-title">Danh mục phần cứng</span>
          {hardwareLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`gf-slim-link${activeId === item.id ? ' is-active' : ''}`}
              role="menuitem"
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="gf-slim-col">
          <span className="gf-slim-title">Hỗ trợ Sinh viên</span>
          {svLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`gf-slim-link${activeId === item.id ? ' is-active' : ''}`}
              role="menuitem"
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="gf-mega-stage">
          {PREVIEW_LIST.map((item) => (
            <img
              key={item.id}
              src={item.img}
              alt=""
              className={`gf-mega-stage-img${activePreview.id === item.id ? ' is-active' : ''}`}
            />
          ))}
          <span className="gf-mega-stage-tag">{activePreview.tag}</span>
          <h4 className="gf-mega-stage-title">{activePreview.title}</h4>
          <p className="gf-mega-stage-desc">{activePreview.desc}</p>
        </div>
      </div>
    </div>
  );
}
