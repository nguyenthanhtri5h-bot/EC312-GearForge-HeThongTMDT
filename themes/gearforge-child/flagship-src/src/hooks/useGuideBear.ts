import { useEffect, useState, type RefObject } from 'react';
import { GUIDE_SECTIONS } from '../data/footerData';

export function useGuideBear(rootRef: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({
    visible: false,
    moving: false,
    changed: false,
    progress: 0,
    activeIdx: 0,
    positions: GUIDE_SECTIONS.map((_, i) => (i / Math.max(1, GUIDE_SECTIONS.length - 1)) * 100),
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let tops: number[] = [];
    let start = 0;
    let end = 1;
    let lastIdx = -1;
    let tChange: number | undefined;
    let tMove: number | undefined;

    const getTop = (el: HTMLElement | null) => {
      let y = 0;
      while (el) {
        y += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      return y;
    };

    const computeLayout = () => {
      const vh = window.innerHeight;
      const secs = GUIDE_SECTIONS.map((d) => root.querySelector<HTMLElement>(d.selector) || document.querySelector<HTMLElement>(d.selector));
      let fallbackTop = 0;
      tops = secs.map((s) => {
        if (s) fallbackTop = getTop(s);
        return fallbackTop;
      });
      const lastSec = secs[secs.length - 1];
      start = (tops[0] || 0) - vh * 0.3;
      end = Math.max(start + 1, (tops[tops.length - 1] || 0) + (lastSec ? lastSec.offsetHeight : 0) - vh);
      const positions = tops.map((t) => Math.min(1, Math.max(0, (t - start) / (end - start))) * 100);
      setState((prev) => ({ ...prev, positions }));
    };

    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const q = Math.min(1, Math.max(0, (y - start) / (end - start)));
      const visible = tops.length > 1 && y > tops[0] - vh * 0.5 && y < tops[tops.length - 1] - vh * 0.45;
      let k = 0;
      tops.forEach((t, i) => {
        if (t <= y + vh * 0.5) k = i;
      });

      const changedNow = k !== lastIdx;
      if (changedNow) {
        lastIdx = k;
        window.clearTimeout(tChange);
        tChange = window.setTimeout(() => {
          setState((p) => ({ ...p, changed: false }));
        }, 2000);
      }

      window.clearTimeout(tMove);
      tMove = window.setTimeout(() => {
        setState((p) => ({ ...p, moving: false }));
      }, 180);

      setState((prev) => ({
        ...prev,
        visible,
        moving: true,
        changed: changedNow ? true : prev.changed,
        progress: q,
        activeIdx: k,
      }));
    };

    computeLayout();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', computeLayout);
    window.addEventListener('load', computeLayout);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', computeLayout);
      window.removeEventListener('load', computeLayout);
      window.clearTimeout(tChange);
      window.clearTimeout(tMove);
    };
  }, [rootRef]);

  const scrollToSection = (index: number) => {
    const root = rootRef.current;
    const item = GUIDE_SECTIONS[index];
    if (!item) return;
    const sec = root?.querySelector<HTMLElement>(item.selector) || document.querySelector<HTMLElement>(item.selector);
    if (sec) {
      window.scrollTo({ top: sec.offsetTop + 2, behavior: 'smooth' });
    }
  };

  return { ...state, scrollToSection };
}
