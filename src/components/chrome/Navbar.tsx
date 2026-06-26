'use client';
// ════════════════════════════════════════════════════════════
// Navbar — fixed top nav. Ports v9 behaviour:
//  • transparent over hero → frosted on scroll (>60px)
//  • "More" dropdown (click toggle + outside-click close)
//  • search button + AI triggers open the AI modal
//  • hamburger toggles the mobile menu (state lives in UiProvider)
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useUi } from './UiProvider';

const NAV_LINKS = [
  { label: 'All', href: '/' },
  { label: 'Confirmed', href: '/news?category=confirmed' },
  { label: 'Intel', href: '/news?category=intel' },
  { label: 'Analysis', href: '/news?category=analysis' },
  { label: 'Videos', href: '/videos' },
  { label: 'Guides', href: '/guides' },
];

// Is a given nav link the one matching the current URL?
function isActive(href: string, pathname: string, category: string | null): boolean {
  if (href === '/') return pathname === '/'; // "All" → home
  const [base, query] = href.split('?');
  if (query) {
    // category links, e.g. /news?category=confirmed
    const want = new URLSearchParams(query).get('category');
    return pathname === base && category === want;
  }
  // section links, e.g. /videos, /guides (and their sub-pages)
  return pathname === base || pathname.startsWith(`${base}/`);
}

// Center links. Split out because it reads the query string
// (useSearchParams), which must sit inside a <Suspense> boundary.
function CenterLinks() {
  const pathname = usePathname();
  const category = useSearchParams().get('category');
  return (
    <>
      {NAV_LINKS.map((l) => (
        <li key={l.label}>
          <Link href={l.href} className={isActive(l.href, pathname, category) ? 'active' : undefined}>
            {l.label}
          </Link>
        </li>
      ))}
    </>
  );
}

// Fallback during prerender: highlight by path only (no query yet).
function CenterLinksFallback() {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map((l) => (
        <li key={l.label}>
          <Link href={l.href} className={isActive(l.href, pathname, null) ? 'active' : undefined}>
            {l.label}
          </Link>
        </li>
      ))}
    </>
  );
}

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
        <svg className="nav-logo-svg" viewBox="0 0 188 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* "6" mark — recolors with .logo-gta6 (cream over hero → ink on scroll) */}
          <text x="2" y="33" fontFamily="Arial, Helvetica, sans-serif" fontSize="36" fontWeight="900" fill="#F4EFE3" className="logo-gta6">6</text>
          {/* orange spark */}
          <path transform="translate(32 11)" d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="#FF6A1A" />
          {/* wordmark — also recolors */}
          <text x="46" y="27" fontFamily="Inter, Arial, sans-serif" fontSize="16" fontWeight="800" letterSpacing="0.3" fill="#F4EFE3" className="logo-gta6">GTA6INTEL</text>
          {/* ".GG" pill — always orange */}
          <rect x="150" y="13" width="30" height="15" rx="7.5" fill="#FF6A1A" />
          <text x="165" y="24.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="800" fill="#0A0A0C">GG</text>
        </svg>
      </Link>

      {/* Center links */}
      <ul className="nav-links">
        <Suspense fallback={<CenterLinksFallback />}>
          <CenterLinks />
        </Suspense>
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
