import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

export function useHeroAnimation(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const chu = Array.from(hero.querySelectorAll<HTMLElement>('.tc-hero-chu > [data-in], .tc-hero-chu > .tc-h1'));
      const triggerBtn = hero.querySelector<HTMLElement>('.gf-hero-float-trigger');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(chu, { y: 16, opacity: 0.01, duration: 0.45, stagger: 0.07 }, 0);
      if (triggerBtn) {
        tl.from(triggerBtn, { y: 14, opacity: 0.01, duration: 0.45 }, 0.25);
      }
    }, hero);

    return () => ctx.revert();
  }, [heroRef]);
}
