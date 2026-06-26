'use client';
// ════════════════════════════════════════════════════════════
// Navbar — fixed top nav. Ports v9 behaviour:
//  • transparent over hero → frosted on scroll (>60px)
//  • "More" dropdown (click toggle + outside-click close)
//  • search button + AI triggers open the AI modal
//  • hamburger toggles the mobile menu (state lives in UiProvider)
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUi } from './UiProvider';

const NAV_LINKS = [
  { label: 'All', href: '/news' },
  { label: 'Confirmed', href: '/news?category=confirmed' },
  { label: 'Intel', href: '/news?category=intel' },
  { label: 'Analysis', href: '/news?category=analysis' },
  { label: 'Videos', href: '/videos' },
  { label: 'Guides', href: '/guides' },
];

export function Navbar() {
  const { openModal, toggleMenu, menuOpen } = useUi();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);

  // Frost the bar once the user scrolls past the hero lip.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the "More" dropdown on any outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      {/* Logo */}
      <Link href="/" className="nav-logo" aria-label="GTA6Intel home">
        <svg className="nav-logo-svg" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="31" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="900" fontStyle="italic" letterSpacing="-1" fill="white" className="logo-gta6">GTA</text>
          <text x="58" y="31" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="900" fontStyle="italic" letterSpacing="-1" fill="#FF5C00">VI</text>
          <text x="92" y="18" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="800" letterSpacing="4" fill="#FF5C00">INTEL</text>
          <rect x="92" y="23" width="46" height="2" rx="1" fill="#FF5C00" opacity="0.45" />
        </svg>
      </Link>

      {/* Center links */}
      <ul className="nav-links">
        {NAV_LINKS.map((l, i) => (
          <li key={l.label}>
            <Link href={l.href} className={i === 0 ? 'active' : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
        <li className={`more-wrap${moreOpen ? ' open' : ''}`} ref={moreRef}>
          <button className="more-btn" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}>
            More
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="more-dropdown">
            <div className="more-dd-head">More from GTA6Intel</div>
            <button type="button" className="dd-as-link" onClick={() => { setMoreOpen(false); openModal('ai'); }}>
              <span className="dd-ic">🤖</span>Ask GTA6 AI
            </button>
            <Link href="/connect"><span className="dd-ic">🎮</span>Connect Your Game</Link>
            <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer"><span className="dd-ic">💬</span>Join Discord</a>
            <Link href="/newsletter"><span className="dd-ic">📧</span>Newsletter</Link>
            <a href="/rss.xml"><span className="dd-ic">📰</span>RSS Feed</a>
            <Link href="/advertise"><span className="dd-ic">📢</span>Advertise</Link>
            <Link href="/about"><span className="dd-ic">📋</span>About GTA6Intel</Link>
            <Link href="/privacy"><span className="dd-ic">⚖️</span>Privacy Policy</Link>
            <Link href="/terms"><span className="dd-ic">📃</span>User Agreement</Link>
            <Link href="/cookies"><span className="dd-ic">🍪</span>Cookie Policy</Link>
          </div>
        </li>
      </ul>

      {/* Right side */}
      <div className="nav-right">
        <Link href="/search" className="nav-search-btn" title="Search" aria-label="Search">
          <svg viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </Link>
        <button className="btn-login-nav" onClick={() => openModal('signup')}>Subscribe</button>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
