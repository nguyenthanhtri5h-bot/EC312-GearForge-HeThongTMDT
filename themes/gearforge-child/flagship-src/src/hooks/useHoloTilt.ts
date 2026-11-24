import { useCallback, type CSSProperties, type MouseEvent } from 'react';

/**
 * Provides subtle GPU-accelerated 3D tilt + radial cursor sheen CSS vars (--mx, --my, --rx, --ry)
 * inspired by ASUS ROG / Razer hardware showcases while respecting prefers-reduced-motion.
 */
export function useHoloTilt(maxDeg = 5) {
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = ((0.5 - py) * maxDeg).toFixed(2);
      const ry = ((px - 0.5) * maxDeg).toFixed(2);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
    },
    [maxDeg]
  );

  const handleMouseLeave = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '30%');
  }, []);

  const tiltStyle: CSSProperties = {
    transform: 'perspective(960px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
    transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  };

  return { handleMouseMove, handleMouseLeave, tiltStyle };
}
