'use client';
// Clickable gallery: thumbnails open a full-view lightbox with prev/next,
// keyboard arrows, Esc to close, and click-outside to dismiss.
import { useEffect, useState, useCallback } from 'react';

export function GalleryLightbox({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;
  const n = images?.length ?? 0;

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + n) % n)), [n]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % n)), [n]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, prev, next]);

  if (!images || n === 0) return null;

  return (
    <>
      <div className="db-gallery">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className="db-gallery-thumb"
            onClick={() => setIdx(i)}
            aria-label={`View image ${i + 1} of ${n}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${name} ${i + 1}`} className="db-gallery-img" loading="lazy" />
          </button>
        ))}
      </div>

      {open && (
        <div className="lb-overlay" role="dialog" aria-modal="true" aria-label={`${name} image viewer`} onClick={close}>
          <button className="lb-close" onClick={close} aria-label="Close">&times;</button>
          {n > 1 && (
            <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image">&lsaquo;</button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lb-img" src={images[idx!]} alt={`${name} ${idx! + 1}`} onClick={(e) => e.stopPropagation()} />
          {n > 1 && (
            <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image">&rsaquo;</button>
          )}
          <div className="lb-counter">{idx! + 1} / {n}</div>
        </div>
      )}
    </>
  );
}
