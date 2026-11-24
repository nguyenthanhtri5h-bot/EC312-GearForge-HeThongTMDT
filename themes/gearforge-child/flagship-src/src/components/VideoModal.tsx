import { useEffect, useRef, useState } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';

export function VideoModal() {
  const { videoModalSrc, setVideoModalSrc } = useGearForgeStore();
  const dlgRef = useRef<HTMLDialogElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const dlg = dlgRef.current;
    const vid = vidRef.current;
    if (!dlg || !vid) return;

    if (videoModalSrc) {
      setIsLandscape(/(lab-pc|campus-laptop|desk-orbit|pc-build)/.test(videoModalSrc));
      vid.src = videoModalSrc;
      if (!dlg.open) dlg.showModal();
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      if (dlg.open) dlg.close();
    }
  }, [videoModalSrc]);

  return (
    <dialog
      ref={dlgRef}
      className={`tc-xem ${isLandscape ? 'is-wide' : ''}`}
      aria-label="Xem video GearForge Full HD 1080p"
      onClick={(e) => {
        if (e.target === dlgRef.current) setVideoModalSrc(null);
      }}
      onClose={() => setVideoModalSrc(null)}
    >
      <button
        type="button"
        className="tc-xem-dong"
        aria-label="Đóng video"
        onClick={() => setVideoModalSrc(null)}
      >
        ×
      </button>
      <video
        ref={vidRef}
        className={`tc-xem-vid ${isLandscape ? 'is-wide' : ''}`}
        controls
        playsInline
        onLoadedMetadata={() => {
          const v = vidRef.current;
          if (v && v.videoWidth && v.videoHeight) {
            setIsLandscape(v.videoWidth > v.videoHeight);
          }
        }}
      />
    </dialog>
  );
}
