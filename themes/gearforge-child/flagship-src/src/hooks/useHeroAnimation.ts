import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

export function useHeroAnimation(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const items = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-item]'));
      if (items.length === 0) return;

      gsap.from(items, {
        y: 18,
        opacity: 0.01,
        duration: 0.48,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, hero);

    return () => ctx.revert();
  }, [heroRef]);
}
