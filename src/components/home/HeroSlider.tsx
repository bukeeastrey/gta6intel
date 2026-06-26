'use client';
// ════════════════════════════════════════════════════════════
// HeroSlider — full-bleed editorial slider, ported from v9.
// Behaviour preserved 1:1:
//   • 4 slides, 6s autoplay, animated progress bar (resets per slide)
//   • dots + prev/next arrows + ArrowLeft/Right keys + touch swipe
//   • staggered content reveal via the .active class (CSS-driven)
//   • side panel: live countdown + community (Discord / newsletter / socials)
// Data-driven: `slides` are the featured articles from Supabase.
// ════════════════════════════════════════════════════════════
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Article } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';
import { longDate, ghostFrom } from '@/lib/utils';
import { CountdownTimer } from './CountdownTimer';
import { NewsletterSignup } from '@/components/ui/HomeNewsletter';

const DURATION = 6000;
const BG_CLASSES = ['s1', 's2', 's3', 's4'];

const SOCIALS = [
  { cls: 'x', icon: 'ico-x', href: 'https://x.com/gta6intel_gg' },
  { cls: 'dc', icon: 'ico-dc', href: 'https://discord.gg/G9m5w78N9' },
  { cls: 'yt', icon: 'ico-yt', href: 'https://www.youtube.com/@gta6intel_gg' },
  { cls: 'tk', icon: 'ico-tk', href: 'https://www.tiktok.com/@gta6intel_gg' },
  { cls: 'ig', icon: 'ico-ig', href: 'https://www.instagram.com/gta6intel_gg' },
];

export function HeroSlider({ slides }: { slides: Article[] }) {
  const total = slides.length;
  const [cur, setCur] = useState(0);
  const progRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const touchX = useRef(0);

  const goTo = useCallback(
    (n: number) => {
      if (total === 0) return;
      setCur(((n % total) + total) % total);
    },
    [total]
  );
  const next = useCallback(() => goTo(cur + 1), [cur, goTo]);
  const prev = useCallback(() => goTo(cur - 1), [cur, goTo]);

  // Restart the progress bar + autoplay timer whenever the slide changes.
  useEffect(() => {
    if (total === 0) return;
    const bar = progRef.current;
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      // Force reflow so the next transition actually animates from 0.
      void bar.offsetWidth;
      bar.style.transition = `width ${DURATION}ms linear`;
      bar.style.width = '100%';
    }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => goTo(cur + 1), DURATION);
    return () => window.clearTimeout(timerRef.current);
  }, [cur, total, goTo]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (total === 0) {
    // Graceful empty state — keeps the countdown/community panel useful.
    return (
      <section className="hero" id="hero">
        <div className="slide active">
          <div className="slide-bg s1" />
          <div className="slide-overlay" />
          <div className="slide-content">
            <div className="slide-lbl lbl-c">GTA6Intel</div>
            <h2 className="slide-title">Latest GTA VI intel, loading…</h2>
            <p className="slide-summary">No featured stories yet. Check the feed for the newest drops.</p>
            <Link href="/news" className="slide-btn">Browse News →</Link>
          </div>
        </div>
        <HeroSide />
      </section>
    );
  }

  return (
    <section
      className="hero"
      id="hero"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const d = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 50) (d > 0 ? next : prev)();
      }}
    >
      {slides.map((s, i) => {
        const cfg = CATEGORY_CONFIG[s.category] ?? CATEGORY_CONFIG.intel;
        const ghost = s.ghost_text || ghostFrom(s.title);
        return (
          <div className={`slide${i === cur ? ' active' : ''}`} key={s.id} aria-hidden={i !== cur}>
            <div className={`slide-bg ${BG_CLASSES[i % BG_CLASSES.length]}`}>
              {s.image_url && (
                <Image
                  src={s.image_url}
                  alt={s.image_alt || s.title}
                  fill
                  sizes="100vw"
                  className="next-img"
                  priority={i === 0}
                />
              )}
            </div>
            <div className="slide-ghost">{ghost}</div>
            <div className="slide-overlay" />
            <div className="slide-content">
              <div className="slide-num">{String(i + 1).padStart(2, '0')}</div>
              <div className={`slide-lbl ${cfg.slideClass}`}>{cfg.label}</div>
              <h2 className="slide-title">{s.title}</h2>
              {s.summary && <p className="slide-summary">{s.summary}</p>}
              <div className="slide-meta">
                <span>By <strong>GTA6Intel Editorial</strong></span>
                <span>·</span>
                <span>{longDate(s.published_at)}</span>
                {s.source && (<><span>·</span><span>{s.source}</span></>)}
              </div>
              <Link href={`/news/${s.slug}`} className="slide-btn">Read Full Story →</Link>
            </div>
          </div>
        );
      })}

      <HeroSide />

      {/* Controls */}
      <div className="slider-ctrl">
        <div className="dots">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`dot${i === cur ? ' active' : ''}`}
              onClick={() => goTo(i)}
              role="button"
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 7, marginLeft: 14 }}>
          <div className="arr" onClick={prev} role="button" aria-label="Previous slide">←</div>
          <div className="arr" onClick={next} role="button" aria-label="Next slide">→</div>
        </div>
      </div>
      <div className="prog" ref={progRef} />
    </section>
  );
}

// ── Side panel: countdown + community (hidden < 1100px by CSS) ──
function HeroSide() {
  return (
    <div className="hero-side">
      <CountdownTimer />
      <div className="comm-block">
        <h3>Join the Community</h3>
        <p>
          Weekly intel drops, personalized guides at launch, and a community of GTA
          players worldwide.
        </p>
        <a href="https://discord.gg/G9m5w78N9" className="discord-btn" target="_blank" rel="noopener noreferrer">
          <svg style={{ width: 16, height: 16, fill: 'white' }}><use href="#ico-dc" /></svg>
          Join Our Discord Server
        </a>
        <NewsletterSignup />
        <div className="soc-lbl">Follow Us</div>
        <div className="soc-row">
          {SOCIALS.map((s) => (
            <a key={s.cls} href={s.href} className={`soc-ic ${s.cls}`} target="_blank" rel="noopener noreferrer" aria-label={s.cls}>
              <svg><use href={`#${s.icon}`} /></svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
