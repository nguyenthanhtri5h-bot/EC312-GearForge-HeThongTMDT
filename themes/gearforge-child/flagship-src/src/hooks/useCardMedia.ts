import { useEffect, useMemo, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { GearForgeProduct } from '../types/gearforge';

const IMG_BASE = '/wp-content/themes/gearforge-child/assets/flagship/vibe/hardware';
const SVG_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#FFFFFF"/><rect x="52" y="44" width="216" height="130" rx="6" fill="#F5F4F0" stroke="#DFDEDC" stroke-width="2"/><path d="M36 182h248l-12 16H48z" fill="#DFDEDC"/><rect x="132" y="102" width="56" height="14" rx="3" fill="#D13639"/></svg>'
  );

export function resolveFallbackImage(categorySlug: string): string {
  const s = (categorySlug || '').toLowerCase();
  if (s.includes('gaming') && !s.includes('pc')) return `${IMG_BASE}/laptop-gaming.jpg`;
  if (s.includes('pc') || s.includes('workstation')) return `${IMG_BASE}/pc-workstation.jpg`;
  if (s.includes('linh-kien') || s.includes('ram')) return `${IMG_BASE}/pc-minimal.jpg`;
  if (s.includes('gear') || s.includes('phu-kien') || s.includes('phim') || s.includes('chuot')) {
    return `${IMG_BASE}/gear-peripherals.jpg`;
  }
  return `${IMG_BASE}/laptop-ultrabook.jpg`;
}

export function useCardMedia(product: GearForgeProduct, eager = false) {
  const primaryUrl = useMemo(
    () => (product.image || '').trim() || resolveFallbackImage(product.categorySlug),
    [product.image, product.categorySlug]
  );
  const angle2Url = useMemo(() => {
    const first = product.galleryImages?.[0]?.trim();
    return first && first !== primaryUrl ? first : '';
  }, [product.galleryImages, primaryUrl]);

  const hasSecondAngle = Boolean(angle2Url);
  const [imgSrc, setImgSrc] = useState(primaryUrl);
  const [fallbackStep, setFallbackStep] = useState(0);
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [angle2Ready, setAngle2Ready] = useState(false);
  const [isHovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const primaryImgRef = useRef<HTMLImageElement | null>(null);
  const prevPrimaryRef = useRef(primaryUrl);

  useEffect(() => {
    const imgEl = primaryImgRef.current;
    if (prevPrimaryRef.current !== primaryUrl) {
      prevPrimaryRef.current = primaryUrl;
      setImgSrc(primaryUrl);
      setFallbackStep(0);
      setPrimaryLoaded(false);
      setAngle2Ready(false);
    } else if (imgEl && imgEl.complete) {
      if (imgEl.naturalWidth > 10) {
        setPrimaryLoaded(true);
      } else {
        setFallbackStep(1);
        setImgSrc(resolveFallbackImage(product.categorySlug));
      }
    }
  }, [primaryUrl, product.categorySlug]);

  useEffect(() => {
    if (!angle2Url) return;
    let cancelled = false;
    const preload = () => {
      const pre = new Image();
      pre.referrerPolicy = 'no-referrer';
      pre.src = angle2Url;
      const markReady = () => {
        if (!cancelled) setAngle2Ready(true);
      };
      if (typeof pre.decode === 'function') {
        pre.decode().then(markReady).catch(() => {});
      } else {
        pre.onload = markReady;
      }
    };
    const node = wrapRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      preload();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preload();
          io.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    io.observe(node);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [angle2Url]);

  const advanceFallback = () => {
    setPrimaryLoaded(false);
    if (fallbackStep === 0) {
      setFallbackStep(1);
      setImgSrc(resolveFallbackImage(product.categorySlug));
    } else if (fallbackStep === 1) {
      setFallbackStep(2);
      setImgSrc(`${IMG_BASE}/pc-minimal.jpg`);
    } else if (fallbackStep === 2) {
      setFallbackStep(3);
      setImgSrc(SVG_FALLBACK);
    }
  };

  const onPrimaryLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth <= 10 && fallbackStep < 3) {
      advanceFallback();
      return;
    }
    setPrimaryLoaded(true);
  };

  const onPrimaryError = () => {
    if (fallbackStep < 3) {
      advanceFallback();
    } else {
      setPrimaryLoaded(true);
    }
  };

  return {
    wrapRef,
    primaryImgRef,
    hasSecondAngle,
    imgSrc,
    angle2Url,
    primaryLoaded,
    angle2Ready,
    isHovered,
    setHovered,
    onPrimaryLoad,
    onPrimaryError,
    imgProps: {
      draggable: false as const,
      referrerPolicy: 'no-referrer' as const,
      loading: (eager ? 'eager' : 'lazy') as 'eager' | 'lazy',
      decoding: (eager ? 'sync' : 'async') as 'sync' | 'async',
    },
  };
}
