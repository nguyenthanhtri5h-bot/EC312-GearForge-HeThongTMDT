import { useEffect, type RefObject } from 'react';
import { animateCounter, bindMouseEffects, clamp, playActiveVideo } from './scrollEffects';

export function useHomeScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = <T extends Element>(s: string, el: ParentNode = root) => el.querySelector<T>(s);
    const $$ = <T extends Element>(s: string, el: ParentNode = root) => Array.from(el.querySelectorAll<T>(s));

    let io: IntersectionObserver | null = null;
    if (!still && 'IntersectionObserver' in window) {
      root.classList.add('tc-js');
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            io?.unobserve(e.target);
            $$('[data-dem]', e.target).forEach(animateCounter);
          });
        },
        { rootMargin: '0px 0px -12% 0px' }
      );
      $$('.tc-mast,.kq-chu,.dv-h,.kha-chu,.dn-the,.cs-h,[data-cs],.kc-dau,.rl-chu,.dt-h,.dt-kh,.ct-wrap').forEach((el) => {
        el.classList.add('tc-rv');
        io?.observe(el);
      });
      $$('.tc-chung [data-dem]').forEach(animateCounter);
    }

    const pins = $$<HTMLElement>('[data-pin]');
    const tien = $$<HTMLElement>('[data-tien]');
    const chay = $$<HTMLElement>('[data-chay]');
    const cuon = $$<HTMLElement>('[data-cuon]');
    const dv = $<HTMLElement>('.dv');
    const kq = $<HTMLElement>('.kq');
    const kha = $<HTMLElement>('.kha');
    const kc = $<HTMLElement>('.kc');
    const rl = $<HTMLElement>('.rl');

    let last: Record<string, number> = {};
    const setOn = (key: string, list: HTMLElement[], idx: number) => {
      if (last[key] === idx) return false;
      last[key] = idx;
      list.forEach((el, i) => el.classList.toggle('on', i === idx));
      return true;
    };

    const dvRay = dv && $<HTMLElement>('[data-dv-ray]', dv);
    const dvTram = dv ? $$<HTMLElement>('.dv-tram', dv) : [];
    const dvThe = dv ? $$<HTMLElement>('.dv-the-mot', dv) : [];
    const dvTien = dv ? $$<HTMLElement>('[data-dv-tien] li', dv) : [];
    const dvTenS = dv ? $$<HTMLElement>('[data-dv-ten] span', dv) : [];

    const kqThe = kq ? $$<HTMLElement>('.kq-the', kq) : [];
    const kqSo = kq && $<HTMLElement>('.kq-so', kq);
    const kqCham = kq ? $$<HTMLElement>('.kq-cham li', kq) : [];

    const khaMan = kha && $<HTMLElement>('[data-kha-man]', kha);
    const khaBuoc = kha ? $$<HTMLElement>('[data-kha-buoc] li', kha) : [];
    const khaChip = kha ? $$<HTMLElement>('.kha-chip', kha) : [];

    const kcThe = kc ? $$<HTMLElement>('.kc-the', kc) : [];
    const kcLoi = kc ? $$<HTMLElement>('[data-kc-loi] blockquote', kc) : [];

    const rlFeed = rl && $<HTMLElement>('[data-rl-feed]', rl);
    const rlN = rl ? $$('.rl-mot', rl).length : 0;

    const rlVid = rl ? $$<HTMLVideoElement>('.rl-mot .tc-song', rl) : [];
    const kcVid = kc ? $$<HTMLVideoElement>('.kc-the .tc-song', kc) : [];

    const t0 = performance.now();
    let ticking = false;
    let vh = window.innerHeight;
    let vw = window.innerWidth;

    const frame = () => {
      ticking = false;
      if (still) return;
      vh = window.innerHeight || document.documentElement.clientHeight;
      vw = window.innerWidth || document.documentElement.clientWidth;
      const y = window.scrollY;
      const now = performance.now();
      const mob = vw < 768;

      root.style.setProperty('--sy', String(Math.round(y)));

      const pinState = new Map<HTMLElement, { p: number; on: boolean }>();
      pins.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
        const on = r.bottom > 0 && r.top < vh;
        if (on) sec.style.setProperty('--p', p.toFixed(4));
        pinState.set(sec, { p, on });
      });

      tien.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        sec.style.setProperty('--p', clamp((vh * 0.9 - r.top) / (r.height * 0.85), 0, 1).toFixed(4));
      });

      if (dv && pinState.get(dv)?.on && dvRay && dvTram.length) {
        const s = pinState.get(dv)!.p * (dvTram.length - 1);
        dvRay.style.transform = `translate3d(${(-s * dvTram[0].offsetWidth).toFixed(1)}px,0,0)`;
        dvTenS.forEach((el, i) => {
          const d = i - s;
          el.style.opacity = clamp(1 - Math.abs(d) * 2.6, 0, 1).toFixed(3);
          el.style.transform = `translateX(calc(-50% + ${(d * vw * 0.5).toFixed(1)}px))`;
        });
        const a = Math.round(s);
        if (setOn('dv', dvTram, a)) {
          setOn('dvt', dvThe, a);
          setOn('dvp', dvTien, a);
        }
      }

      if (kq && pinState.get(kq)?.on && kqThe.length) {
        const pos = clamp(pinState.get(kq)!.p * (kqThe.length - 0.6), 0, kqThe.length - 1);
        kqThe.forEach((c, i) => {
          const d = i - pos;
          if (d < -1.2) { c.style.opacity = '0'; c.style.visibility = 'hidden'; return; }
          c.style.visibility = 'visible';
          c.style.transform = d < 0
            ? `translate(-50%,-50%) translate3d(${(-d * (mob ? 90 : 36)).toFixed(2)}vw,${(d * (mob ? -8 : 90)).toFixed(2)}vh,0) rotate(${(-d * 24).toFixed(2)}deg)`
            : `translate(-50%,-50%) translate3d(${(d * (mob ? 12 : 26)).toFixed(1)}px,${(-d * (mob ? 12 : 18)).toFixed(1)}px,${(-d * 90).toFixed(1)}px) rotate(${(d * 3).toFixed(2)}deg)`;
          c.style.opacity = (d < 0 ? clamp(1 + d * 1.6, 0, 1) : clamp(1.4 - d * 0.2, 0, 1)).toFixed(3);
          c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        });
        const ak = Math.round(pos);
        if (setOn('kq', kqCham, ak) && kqSo) {
          const c = kqThe[ak];
          const so = kqSo.querySelector('[data-kq-so]');
          const nhan = kqSo.querySelector('[data-kq-nhan]');
          if (so && nhan) {
            so.textContent = c.getAttribute('data-so') || '';
            nhan.textContent = c.getAttribute('data-nhan') || '';
            kqSo.classList.remove('doi');
            void (kqSo as HTMLElement).offsetWidth;
            kqSo.classList.add('doi');
          }
        }
      }

      if (kha && pinState.get(kha)?.on && khaMan) {
        const sk = clamp(pinState.get(kha)!.p * 3.6 - 0.3, 0, 3);
        khaMan.style.setProperty('--s', sk.toFixed(3));
        if (setOn('kha', khaBuoc, Math.round(sk))) setOn('khac', khaChip, Math.round(sk));
      }

      if (kc && pinState.get(kc)?.on && kcThe.length) {
        const ps = clamp(pinState.get(kc)!.p * (kcThe.length - 0.4), 0, kcThe.length - 1);
        const sp = mob ? 0.62 : 0.24;
        kcThe.forEach((c, i) => {
          const d = i - ps, ad = Math.abs(d);
          if (ad > 4) { c.style.visibility = 'hidden'; return; }
          c.style.visibility = 'visible';
          c.style.transform = `translate3d(${(d * vw * sp).toFixed(1)}px,${(ad * ad * 14).toFixed(1)}px,0) rotate(${(d * 7).toFixed(1)}deg) scale(${Math.max(0.62, 1 - ad * 0.2).toFixed(3)})`;
          c.style.opacity = clamp(1.3 - ad * 0.3, 0, 1).toFixed(3);
          c.style.zIndex = String(50 - Math.round(ad * 10));
        });
        setOn('kc', kcLoi, Math.round(ps) % Math.max(1, kcLoi.length));
        playActiveVideo(last, 'kcv', kcVid, Math.abs(ps - Math.round(ps)) < 0.38 ? Math.round(ps) : -1, still);
      } else if (kc) playActiveVideo(last, 'kcv', kcVid, -1, still);

      if (rl && pinState.get(rl)?.on && rlFeed) {
        const rs = clamp(pinState.get(rl)!.p * (rlN - 0.6) - 0.2, 0, Math.max(0, rlN - 1));
        rlFeed.style.setProperty('--s', rs.toFixed(3));
        playActiveVideo(last, 'rlv', rlVid, Math.abs(rs - Math.round(rs)) < 0.38 ? Math.round(rs) : -1, still);
      } else if (rl) playActiveVideo(last, 'rlv', rlVid, -1, still);

      chay.forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const r = parent.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        const dir = Number(el.getAttribute('data-chay') || -1);
        const w = el.scrollWidth / (el.children.length > 12 ? 6 : 4);
        if (w <= 0) return;
        const x = ((y * 0.45 + (now - t0) * 0.02) * Math.abs(dir)) % w;
        el.style.transform = `translate3d(${(dir < 0 ? -x : x - w).toFixed(1)}px,0,0)`;
      });

      cuon.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        const d = Number(el.getAttribute('data-cuon') || 0);
        el.style.translate = `0 ${((((r.top + r.height / 2) - vh / 2) / vh) * d).toFixed(1)}px`;
      });
    };

    const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    let timerId: number | null = null;
    const onResize = () => { vh = window.innerHeight; vw = window.innerWidth; last = {}; ask(); };

    if (!still) {
      window.addEventListener('scroll', ask, { passive: true });
      window.addEventListener('resize', onResize);
      timerId = window.setInterval(ask, 40);
      frame();
    }

    const mouseCleanups = bindMouseEffects(root, still);
    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', ask);
      window.removeEventListener('resize', onResize);
      if (timerId !== null) window.clearInterval(timerId);
      mouseCleanups.forEach((fn) => fn());
    };
  }, [rootRef]);
}
