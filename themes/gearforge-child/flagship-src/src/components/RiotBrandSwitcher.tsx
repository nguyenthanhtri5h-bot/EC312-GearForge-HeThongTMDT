import { useEffect, useRef, useState } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { BrandLogo } from './BrandLogo';
import { BrandSwitcherPreview } from './BrandSwitcherPreview';

interface SwitcherLink {
  label: string;
  artId: string;
  onSelect: () => void;
}

interface SwitcherGroup {
  heading: string;
  links: SwitcherLink[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RiotBrandSwitcher({ open, onClose }: Props) {
  const { navigateToPage, openDrawer, setChatOpen } = useGearForgeStore();
  const [activeArtId, setActiveArtId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveArtId(null);
      setActiveLabel(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const go = (fn: () => void) => {
    onClose();
    fn();
  };

  const enterArt = (artId: string, label: string) => {
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    setActiveArtId(artId);
    setActiveLabel(label);
  };

  const leaveLinks = () => {
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = window.setTimeout(() => {
      setActiveArtId(null);
      setActiveLabel(null);
    }, 90);
  };

  const col1: SwitcherGroup[] = [
    {
      heading: 'KHO MÁY ĐHQG',
      links: [
        { label: 'TẤT CẢ KHO MÁY ĐHQG', artId: 'all', onSelect: () => go(() => navigateToPage('shop')) },
        { label: 'LAPTOP GAMING RTX 40/50', artId: 'gaming', onSelect: () => go(() => navigateToPage('shop', { category: 'laptop-gaming' })) },
        { label: 'ULTRABOOK & ĐỒ HỌA OLED', artId: 'ultrabook', onSelect: () => go(() => navigateToPage('shop', { category: 'laptop-ultrabook' })) },
        { label: 'PC WORKSTATION AI', artId: 'pc', onSelect: () => go(() => navigateToPage('shop', { category: 'pc-workstation' })) },
        { label: 'LINH KIỆN & GAMING GEAR', artId: 'gear', onSelect: () => go(() => navigateToPage('shop', { category: 'gear' })) },
      ],
    },
  ];

  const col2: SwitcherGroup[] = [
    {
      heading: 'HỆ SINH THÁI ĐHQG',
      links: [
        { label: 'CHỌN MÁY THEO NGÀNH HỌC', artId: 'ecosystem', onSelect: () => go(() => navigateToPage('ecosystem')) },
        { label: 'TRẢ GÓP 0% (.EDU.VN)', artId: 'installment', onSelect: () => go(() => openDrawer('installment')) },
        { label: 'SO SÁNH 3 CẤU HÌNH', artId: 'compare', onSelect: () => go(() => openDrawer('compare')) },
        { label: 'QUY TRÌNH GIAO KTX 2 GIỜ', artId: 'ktxDelivery', onSelect: () => go(() => navigateToPage('ecosystem')) },
      ],
    },
    {
      heading: 'GÓC MÁY THỰC TẾ',
      links: [
        { label: 'GÓC MÁY SINH VIÊN ĐHQG', artId: 'gallerySv', onSelect: () => go(() => navigateToPage('gallery')) },
        { label: 'SETUP AI LAB & CREATOR', artId: 'galleryLab', onSelect: () => go(() => navigateToPage('gallery')) },
      ],
    },
  ];

  const col3: SwitcherGroup[] = [
    {
      heading: 'HẬU MÃI & OMS',
      links: [
        { label: 'TRA CỨU ĐƠN HÀNG OMS', artId: 'oms', onSelect: () => go(() => navigateToPage('tracking')) },
        { label: 'BẢO HÀNH SERIAL & ĐỔI TRẢ', artId: 'serialRma', onSelect: () => go(() => navigateToPage('tracking')) },
        { label: 'HÓA ĐƠN ĐIỆN TỬ VAT', artId: 'vatInvoice', onSelect: () => go(() => navigateToPage('tracking')) },
      ],
    },
    {
      heading: 'GEARFORGE',
      links: [
        { label: 'TRANG CHỦ GEARFORGE', artId: 'homeFlagship', onSelect: () => go(() => navigateToPage('showcase')) },
        { label: 'TRỢ LÝ AI TƯ VẤN CẤU HÌNH', artId: 'aiAdvisor', onSelect: () => go(() => setChatOpen(true)) },
      ],
    },
  ];

  const renderColumn = (groups: SwitcherGroup[]) => (
    <div className="gf-switcher-col" onMouseLeave={leaveLinks}>
      {groups.map((grp) => (
        <div key={grp.heading} className="gf-switcher-group">
          <div className="gf-switcher-head">{grp.heading}</div>
          <ul className="gf-switcher-list">
            {grp.links.map((lk) => (
              <li key={lk.label}>
                <button
                  type="button"
                  className={`gf-switcher-link${activeLabel === lk.label ? ' is-active' : ''}`}
                  onMouseEnter={() => enterArt(lk.artId, lk.label)}
                  onFocus={() => enterArt(lk.artId, lk.label)}
                  onClick={lk.onSelect}
                >
                  {lk.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="gf-switcher-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Hệ sinh thái GearForge"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gf-switcher-panel">
        <div className="gf-switcher-in">
          <div className="gf-switcher-top">
            <div className="gf-hd-left">
              <BrandLogo
                height={30}
                tone="dark"
                stacked={false}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  navigateToPage('showcase');
                }}
              />
              <button
                type="button"
                className="gf-brand-caret-btn is-dark"
                onClick={onClose}
                aria-label="Đóng menu hệ sinh thái GearForge"
                title="Đóng menu hệ sinh thái"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 7.75L6 4.25L9.5 7.75" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <button type="button" className="gf-switcher-x" onClick={onClose} aria-label="Đóng">
              &#10005;
            </button>
          </div>

          <div className="gf-switcher-grid" onMouseLeave={leaveLinks}>
            {renderColumn(col1)}
            {renderColumn(col2)}
            {renderColumn(col3)}

            <BrandSwitcherPreview
              activeArtId={activeArtId}
              onSelectEcosystem={() => go(() => navigateToPage('ecosystem'))}
              onSelectGallery={() => go(() => navigateToPage('gallery'))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
