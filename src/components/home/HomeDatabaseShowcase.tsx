'use client';
// Rockstar-style homepage database showcase.
// - Characters: large hero that rolls through entry images like a FILMSTRIP,
//   with a per-image writeup (pulled from each entry's summary).
// - Places + Vehicles: smaller cards that simply crossfade to the next image.
// Text sits on the image (no emoji icons). Each card links to its category.
// All motion respects prefers-reduced-motion.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ShowcaseSlide } from '@/lib/database';

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useAutoIndex(length: number, interval: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (length <= 1 || prefersReduced()) return;
    const id = setInterval(() => setI((p) => (p + 1) % length), interval);
    return () => clearInterval(id);
  }, [length, interval]);
  return length > 0 ? i % length : 0;
}

function Text({ label, name, line, small }: { label: string; name?: string; line?: string; small?: boolean }) {
  return (
    <div className="dbx-text">
      <span className="dbx-label">{label}</span>
      {name && <span key={name} className={small ? 'dbx-name dbx-name-sm' : 'dbx-name'}>{name}</span>}
      {line && <span key={`l-${name}`} className={small ? 'dbx-line dbx-line-sm' : 'dbx-line'}>{line}</span>}
      <span className="dbx-btn">{small ? 'Explore →' : 'See all →'}</span>
    </div>
  );
}

function CharactersHero({ slides }: { slides: ShowcaseSlide[] }) {
  const n = slides.length;
  const [pos, setPos] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (n < 2 || prefersReduced()) return;
    const id = setInterval(() => setPos((p) => p + 1), 8000);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    if (n >= 2 && pos === n) {
      const t = setTimeout(() => { setAnimate(false); setPos(0); }, 1300);
      return () => clearTimeout(t);
    }
  }, [pos, n]);
  useEffect(() => {
    if (!animate) {
      const r = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(r);
    }
  }, [animate]);

  if (n === 0) {
    return (
      <Link href="/database/characters" className="dbx-card dbx-hero" aria-label="Explore Characters">
        <div className="dbx-overlay" />
        <span className="dbx-empty">Coming soon</span>
        <Text label="Characters" />
      </Link>
    );
  }

  const display = n < 2 ? slides : [...slides, slides[0], slides[1 % n]];
  const fw = 100 / display.length;
  const frameCard = n < 2 ? 100 : 78;
  const track: Record<string, string> = {
    width: `${display.length * frameCard}%`,
    transform: `translateX(-${pos * fw}%)`,
  };
  if (!animate) track.transition = 'none';

  return (
    <div className="dbx-card dbx-hero dbx-reel" role="group" aria-label="Characters">
      <div className="dbx-reel-track" style={track}>
        {display.map((s, idx) => {
          const isActive = n < 2 ? idx === 0 : idx === pos;
          return (
            <Link key={idx} href={`/database/characters/${s.slug}`} className={`dbx-rframe${isActive ? ' is-active' : ''}`} style={{ width: `${fw}%` }} aria-label={s.name}>
              <div className="dbx-rbg" style={{ backgroundImage: `url(${s.image})` }} />
              <div className="dbx-overlay" />
              <div className="dbx-text">
                <span className="dbx-label">Characters</span>
                <span className="dbx-name">{s.name}</span>
                {s.line && <span className="dbx-line">{s.line}</span>}
              </div>
            </Link>
          );
        })}
      </div>
      <span className="dbx-perf dbx-perf-top" aria-hidden="true" />
      <span className="dbx-perf dbx-perf-bot" aria-hidden="true" />
    </div>
  );
}

function MiniCard({ slides, label, href }: { slides: ShowcaseSlide[]; label: string; href: string }) {
  const i = useAutoIndex(slides.length, 9000);
  const active = slides[i];
  return (
    <Link href={href} className="dbx-card dbx-mini" aria-label={`Explore ${label}`}>
      <div className="dbx-fades">
        {slides.map((s, idx) => (
          <div key={idx} className="dbx-fade" style={{ backgroundImage: `url(${s.image})`, opacity: idx === i ? 1 : 0 }} />
        ))}
      </div>
      <div className="dbx-overlay" />
      {slides.length === 0 && <span className="dbx-empty">Coming soon</span>}
      <Text label={label} name={active?.name} line={active?.line} small />
    </Link>
  );
}

export function HomeDatabaseShowcase({ characters, locations, vehicles }: { characters: ShowcaseSlide[]; locations: ShowcaseSlide[]; vehicles: ShowcaseSlide[] }) {
  return (
    <div className="dbx-wrap">
      <CharactersHero slides={characters} />
      <div className="dbx-row">
        <MiniCard slides={locations} label="Places" href="/database/locations" />
        <MiniCard slides={vehicles} label="Vehicles" href="/database/vehicles" />
      </div>
    </div>
  );
}
