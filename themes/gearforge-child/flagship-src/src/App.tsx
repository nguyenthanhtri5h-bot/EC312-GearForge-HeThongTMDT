import { useEffect, useRef } from 'react';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { CompareDrawer } from './components/CompareDrawer';
import { CommandSearchModal } from './components/drawers/CommandSearchModal';
import { QuickViewModal } from './components/drawers/QuickViewModal';
import { ContactSection } from './components/ContactSection';
import { CtaSection } from './components/CtaSection';
import { EcosystemPageView } from './components/EcosystemPageView';
import { FloatingWidgets } from './components/FloatingWidgets';
import { FooterSection } from './components/FooterSection';
import { GuideBearNav } from './components/GuideBearNav';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InstallmentDrawer } from './components/InstallmentDrawer';
import { KhaAiSection } from './components/KhaAiSection';
import { MarqueeRibbon } from './components/MarqueeRibbon';
import { PartnersSection } from './components/PartnersSection';
import { ReelsSection } from './components/ReelsSection';
import { ResultsSection } from './components/ResultsSection';
import { ServicesSection } from './components/ServicesSection';
import { SetupGalleryPageView } from './components/SetupGalleryPageView';
import { ShopPageView } from './components/ShopPageView';
import { CategoryShelvesSection } from './components/storefront/CategoryShelvesSection';
import { FlashDealsShelf } from './components/storefront/FlashDealsShelf';
import { MobileBottomBar } from './components/storefront/MobileBottomBar';
import { XgearCategoryStrip } from './components/storefront/XgearCategoryStrip';
import { StatsSection } from './components/StatsSection';
import { SystemVideoSection } from './components/SystemVideoSection';
import { TeamSection } from './components/TeamSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { VideoModal } from './components/VideoModal';
import { GearForgeProvider, useGearForgeStore } from './hooks/useGearForgeStore';
import { useHomeScroll } from './hooks/useHomeScroll';

function ShowcaseMain() {
  const mainRef = useRef<HTMLElement>(null);
  useHomeScroll(mainRef);

  return (
    <>
      <main ref={mainRef} className="tc" id="tc">
        <HeroSection />
        <MarqueeRibbon />
        <XgearCategoryStrip />
        <FlashDealsShelf />
        <CategoryShelvesSection />
        <ServicesSection />
        <ResultsSection />
        <SystemVideoSection />
        <KhaAiSection />
        <TeamSection />
        <StatsSection />
        <TestimonialsSection />
        <ReelsSection />
        <PartnersSection />
        <CtaSection />
        <GuideBearNav rootRef={mainRef} />
      </main>
      <ContactSection />
    </>
  );
}

function FlagshipShell() {
  const { toast, pageMode, navigateToPage, closeDrawer } = useGearForgeStore();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href') || '';
      if (href === '#gf-catalog' || href === '/shop/' || href.startsWith('/shop?')) {
        e.preventDefault();
        closeDrawer();
        const q = href.includes('?') ? new URLSearchParams(href.split('?')[1]).get('category') || '' : '';
        navigateToPage('shop', q ? { category: q } : undefined);
      } else if (href === '/he-sinh-thai/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('ecosystem');
      } else if (href === '/cau-hinh-mau/') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('gallery');
      } else if (href === '#gf-installment' || href === '#gf-partners' || href === '#gf-services' || href === '#gf-team' || href === '#gf-testimonials') {
        e.preventDefault();
        closeDrawer();
        navigateToPage('showcase', undefined, href);
      } else if (href === '#gf-oms-contact') {
        const target = document.getElementById('gf-oms-contact');
        if (target) {
          e.preventDefault();
          closeDrawer();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [closeDrawer, navigateToPage]);

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
