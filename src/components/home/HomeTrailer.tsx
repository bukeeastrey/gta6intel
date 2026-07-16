'use client';
// Cinematic homepage trailer.
// - Full-bleed poster that SHRINKS into a rounded card as you scroll past it
//   (sticky scroll-scrub; transform-only so it stays smooth).
// - Click-to-play facade: loads the YouTube iframe only on click, so the
//   homepage stays fast.
// - Falls back to a plain 16:9 embed on mobile / reduced-motion.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Video } from '@/lib/videos';

export function HomeTrailer({ trailer }: { trailer: Video | null }) {
  const secRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 820px)').matches;
    if (reduce || small) { setSimple(true); return; }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const sec = secRef.current;
        const frame = frameRef.current;
        if (!sec || !frame) return;
        const rect = sec.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        const p = Math.min(1, Math.max(0, -rect.top / travel)); // 0 → 1 through the section
        const scale = 1 - 0.34 * p;          // 100% → 66%
        const radius = 26 * p;               // square → rounded
        frame.style.transform = `scale(${scale})`;
        frame.style.borderRadius = `${radius}px`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [trailer]);

  if (!trailer) return null;

  const poster = trailer.thumbnail_url || `https://i.ytimg.com/vi/${trailer.youtube_id}/maxresdefault.jpg`;
  const embed = `https://www.youtube-nocookie.com/embed/${trailer.youtube_id}?autoplay=1&rel=0`;

  const media = playing ? (
    <iframe
      src={embed}
      title={trailer.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <button type="button" className="ct-poster" onClick={() => setPlaying(true)} aria-label={`Play ${trailer.title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" />
      <span className="ct-scrim" />
      <span className="ct-play">▶</span>
      <span className="ct-meta">
        <span className="ct-kicker">Official Trailer</span>
        <span className="ct-title">{trailer.title}</span>
      </span>
    </button>
  );

  if (simple) {
    return (
      <section className="ht-wrap" aria-labelledby="ht-title">
        <div className="section-header">
          <h2 className="section-title rl" id="ht-title">Latest <span>Trailer</span></h2>
          <Link href="/gta-6-trailer" className="section-link rr">All trailers →</Link>
        </div>
        <div className="ht-frame">{media}</div>
      </section>
    );
  }

  return (
    <>
      <div className="section-header ct-head">
        <h2 className="section-title rl">Latest <span>Trailer</span></h2>
        <Link href="/gta-6-trailer" className="section-link rr">All trailers →</Link>
      </div>
      <section className="ct-sec" ref={secRef} aria-label="Latest GTA 6 trailer">
        <div className="ct-sticky">
          <div className="ct-frame" ref={frameRef}>{media}</div>
        </div>
      </section>
    </>
  );
}
