export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function animateCounter(el: Element) {
  const to = Number(el.getAttribute('data-dem') || 0);
  const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let t0: number | null = null;
  const duration = 1600;
  const step = (t: number) => {
    if (!t0) t0 = t;
    const k = Math.min(1, (t - t0) / duration);
    el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function playActiveVideo(
  lastMap: Record<string, number>,
  key: string,
  vids: HTMLVideoElement[],
  idx: number,
  still: boolean
) {
  if (still || !vids.length || lastMap[key] === idx) return;
  lastMap[key] = idx;
  vids.forEach((v, i) => {
    if (i === idx) {
      const dataSrc = v.getAttribute('data-src') || '';
      if (!v.src && dataSrc) v.src = dataSrc;
      if (!v.src) return;
      const pr = v.play();
      if (pr && pr.then) {
        pr.then(() => (v.parentNode as HTMLElement)?.classList.add('dang')).catch(() => {});
      }
    } else if (!v.paused) {
      v.pause();
      (v.parentNode as HTMLElement)?.classList.remove('dang');
    }
  });
}

export function bindMouseEffects(root: HTMLElement, still: boolean) {
  const cleanups: (() => void)[] = [];
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (still || !fine) return cleanups;

  root.querySelectorAll<HTMLElement>('[data-mouse]').forEach((sec) => {
    const els = Array.from(sec.querySelectorAll<HTMLElement>('[data-par]'));
    let tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      els.forEach((el) => {
        const d = Number(el.getAttribute('data-par') || 0);
        el.style.transform = `translate3d(${(cx * d).toFixed(2)}px,${(cy * d).toFixed(2)}px,0)`;
      });
      if (on || Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) requestAnimationFrame(step);
    };
    const mm = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!on) { on = true; requestAnimationFrame(step); }
    };
    const ml = () => { on = false; tx = 0; ty = 0; requestAnimationFrame(step); };
    sec.addEventListener('mousemove', mm);
    sec.addEventListener('mouseleave', ml);
    cleanups.push(() => { sec.removeEventListener('mousemove', mm); sec.removeEventListener('mouseleave', ml); });
  });

  const dn = root.querySelector<HTMLElement>('[data-tuong]');
  const tw2 = dn?.querySelector<HTMLElement>('[data-dn-tuong]');
  if (dn && tw2) {
    const mm = (e: MouseEvent) => {
      const r = dn.getBoundingClientRect();
      tw2.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      tw2.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const ml = () => { tw2.style.setProperty('--mx', '0'); tw2.style.setProperty('--my', '0'); };
    dn.addEventListener('mousemove', mm);
    dn.addEventListener('mouseleave', ml);
    cleanups.push(() => { dn.removeEventListener('mousemove', mm); dn.removeEventListener('mouseleave', ml); });
  }

  const den = root.querySelector<HTMLElement>('[data-den]');
  const mau = den?.querySelector<HTMLElement>('.dt-luoi-mau');
  if (den && mau) {
    const mm = (e: MouseEvent) => {
      const r = mau.getBoundingClientRect();
      mau.style.setProperty('--mx', `${e.clientX - r.left}px`);
      mau.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const ml = () => mau.style.setProperty('--mx', '-999px');
    den.addEventListener('mousemove', mm);
    den.addEventListener('mouseleave', ml);
    cleanups.push(() => { den.removeEventListener('mousemove', mm); den.removeEventListener('mouseleave', ml); });
  }

  return cleanups;
}
