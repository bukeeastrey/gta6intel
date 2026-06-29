'use client';
// Homepage-only database showcase: 4 large, animated tiles
// (Characters · Vehicles · Weapons · Locations). The full 8-category grid
// still lives on /database via the shared CategoryTiles component.
// Animations: Ken-Burns drift on cover images, floating + pop icon,
// count-up badge, cursor parallax tilt, hover shine. All respect
// prefers-reduced-motion.
import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { DbCategoryMeta } from '@/lib/database';

const HOME_KEYS = ['characters', 'vehicles', 'weapons', 'locations'];

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useCountUp(target: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target <= 0) { setN(0); return; }
    if (prefersReduced()) { setN(target); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

function Tile({ c }: { c: DbCategoryMeta }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const count = useCountUp(c.count);

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-2px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };

  return (
    <Link ref={ref} href={`/database/${c.key}`} className="hdb-tile" onMouseMove={onMove} onMouseLeave={reset}>
      {c.cover
        ? <div className="hdb-bg ken" style={{ backgroundImage: `url(${c.cover})` }} />
        : <div className="hdb-bg" style={{ background: 'radial-gradient(120% 120% at 30% 20%, #2a2036, #140f1e)' }} />}
      <div className="hdb-overlay" />
      <span className="hdb-shine" aria-hidden="true" />
      <span className="hdb-emoji-wrap" aria-hidden="true"><span className="hdb-emoji">{c.emoji}</span></span>
      <div className="hdb-foot">
        <div className="hdb-name">
          {c.label}
          {c.count > 0 && <span className="hdb-count">{count}</span>}
        </div>
        <div className="hdb-blurb">{c.blurb}</div>
      </div>
    </Link>
  );
}

export function HomeDatabaseTiles({ categories }: { categories: DbCategoryMeta[] }) {
  const tiles = HOME_KEYS
    .map((k) => categories.find((c) => c.key === k))
    .filter((c): c is DbCategoryMeta => Boolean(c));
  return (
    <div className="hdb-grid">
      {tiles.map((c) => <Tile key={c.key} c={c} />)}
    </div>
  );
}
