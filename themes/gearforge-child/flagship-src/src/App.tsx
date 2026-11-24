import { useEffect } from 'react';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { CompareDrawer } from './components/CompareDrawer';
import { CommandSearchModal } from './components/drawers/CommandSearchModal';
import { OmsLookupDrawer } from './components/drawers/OmsLookupDrawer';
import { QuickViewModal } from './components/drawers/QuickViewModal';
import { EcosystemPageView } from './components/EcosystemPageView';
import { FloatingWidgets } from './components/FloatingWidgets';
import { FooterSection } from './components/FooterSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InstallmentDrawer } from './components/InstallmentDrawer';
import { RiotDealsBento } from './components/riot/RiotDealsBento';
import { RiotEcosystemStrip, RiotStudentSplit } from './components/riot/RiotEcosystemAndSplit';
import { RiotProductsShowcase } from './components/riot/RiotProductsShowcase';
import { SetupGalleryPageView } from './components/SetupGalleryPageView';
import { ShopPageView } from './components/ShopPageView';
import { MobileBottomBar } from './components/storefront/MobileBottomBar';
import { VideoModal } from './components/VideoModal';
import { GearForgeProvider, useGearForgeStore } from './hooks/useGearForgeStore';

function ShowcaseMain() {
  return (
    <main className="tc tc-riot-home" id="tc">
      <HeroSection />
      <RiotDealsBento />
      <RiotProductsShowcase />
      <RiotEcosystemStrip />
      <RiotStudentSplit />
    </main>
  );
}

function FlagshipShell() {
  const { toast, pageMode, navigateToPage, closeDrawer, openDrawer } = useGearForgeStore();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href') || '';
      if (href === '/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('showcase');
      } else if (href === '#gf-catalog' || href === '/shop/' || href.startsWith('/shop?') || href.startsWith('/shop/?')) {
        e.preventDefault();
        closeDrawer();
        const q = href.includes('?') ? new URLSearchParams(href.split('?')[1]).get('category') || '' : '';
        navigateToPage('shop', q ? { category: q } : {});
      } else if (href === '/he-sinh-thai/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('ecosystem');
      } else if (href === '/cau-hinh-mau/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('gallery');
      } else if (href === '#gf-installment') {
        e.preventDefault();
        closeDrawer();
        openDrawer('installment');
      } else if (href === '#gf-oms-contact') {
        e.preventDefault();
        const target = document.getElementById('gf-oms-contact');
        if (target) {
          closeDrawer();
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          openDrawer('oms');
        }
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [closeDrawer, navigateToPage, openDrawer]);

  return (
    <>
      <Header />
      {pageMode === 'shop'
        ? <ShopPageView />
        : pageMode === 'ecosystem'
          ? <EcosystemPageView />
          : pageMode === 'gallery'
            ? <SetupGalleryPageView />
            : <ShowcaseMain />}
      <FooterSection />
      <FloatingWidgets />
      <MobileBottomBar />
      <VideoModal />
      <CompareDrawer />
      <InstallmentDrawer />
      <CartCheckoutDrawer />
      <OmsLookupDrawer />
      <QuickViewModal />
      <CommandSearchModal />

      {toast && (
        <div className="gf-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <GearForgeProvider>
      <FlagshipShell />
    </GearForgeProvider>
  );
}

export default App;
