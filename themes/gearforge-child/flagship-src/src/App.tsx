import { useEffect } from 'react';
import { CartPageView } from './components/CartPageView';
import { ComparePageView } from './components/ComparePageView';
import { CommandSearchModal } from './components/drawers/CommandSearchModal';
import { QuickViewModal } from './components/drawers/QuickViewModal';
import { EcosystemPageView } from './components/EcosystemPageView';
import { FloatingWidgets } from './components/FloatingWidgets';
import { FooterSection } from './components/FooterSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InstallmentPageView } from './components/InstallmentPageView';
import { OmsTrackingPageView } from './components/OmsTrackingPageView';
import { RiotDealsBento } from './components/riot/RiotDealsBento';
import { RiotEcosystemStrip, RiotStudentSplit } from './components/riot/RiotEcosystemAndSplit';
import { RiotFeaturedShelf } from './components/riot/RiotFeaturedShelf';
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
      <RiotFeaturedShelf />
      <RiotEcosystemStrip />
      <RiotStudentSplit />
    </main>
  );
}

function FlagshipShell() {
  const { toast, pageMode, navigateToPage, closeDrawer } = useGearForgeStore();

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
      } else if (href === '/tra-cuu-don-hang/' || href.startsWith('/tra-cuu-don-hang?')) {
        e.preventDefault();
        closeDrawer();
        navigateToPage('tracking');
      } else if (href === '#gf-installment' || href === '/tra-gop/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('installment');
      } else if (href === '/so-sanh-cau-hinh/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('compare');
      } else if (href === '/gio-hang-sv/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('cart');
      } else if (href === '#gf-oms-contact') {
        e.preventDefault();
        const target = document.getElementById('gf-oms-contact');
        if (target) {
          closeDrawer();
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigateToPage('tracking');
        }
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [closeDrawer, navigateToPage]);

  const renderMain = () => {
    switch (pageMode) {
      case 'shop':
        return <ShopPageView />;
      case 'ecosystem':
        return <EcosystemPageView />;
      case 'gallery':
        return <SetupGalleryPageView />;
      case 'tracking':
        return <OmsTrackingPageView />;
      case 'installment':
        return <InstallmentPageView />;
      case 'compare':
        return <ComparePageView />;
      case 'cart':
        return <CartPageView />;
      default:
        return <ShowcaseMain />;
    }
  };

  return (
    <>
      <Header />
      {renderMain()}
      <FooterSection />
      <FloatingWidgets />
      <MobileBottomBar />
      <VideoModal />
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
