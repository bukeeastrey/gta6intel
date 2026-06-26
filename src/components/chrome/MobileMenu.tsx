'use client';
// ════════════════════════════════════════════════════════════
// MobileMenu — full-width overlay shown when the hamburger is open.
// Open/close state is owned by UiProvider so the navbar's hamburger
// and these links stay in sync. Ported from v9 .mobile-menu markup.
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import { useUi } from './UiProvider';

const LINKS = [
  { label: 'All', href: '/news', active: true },
  { label: 'Confirmed', href: '/news?category=confirmed' },
  { label: 'Intel', href: '/news?category=intel' },
  { label: 'Analysis', href: '/news?category=analysis' },
  { label: 'Videos', href: '/videos' },
  { label: 'Guides', href: '/guides' },
];

const SOCIALS = [
  { cls: 'x', icon: 'ico-x', href: 'https://x.com' },
  { cls: 'dc', icon: 'ico-dc', href: 'https://discord.gg/G9m5w78N9' },
  { cls: 'yt', icon: 'ico-yt', href: 'https://www.youtube.com/@GTA6intel-gg' },
  { cls: 'tk', icon: 'ico-tk', href: 'https://tiktok.com' },
  { cls: 'ig', icon: 'ico-ig', href: 'https://instagram.com' },
];

export function MobileMenu() {
  const { menuOpen, closeMenu, openModal } = useUi();

  return (
    <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu">
      <div className="mm-links">
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={`mm-link${l.active ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mm-divider" />

      <div className="mm-more">
        <button className="mm-more-link" onClick={() => openModal('ai')}>🤖 Ask GTA6 AI</button>
        <Link href="/connect" className="mm-more-link" onClick={closeMenu}>🎮 Connect Your Game</Link>
        <a href="https://discord.gg/G9m5w78N9" className="mm-more-link" target="_blank" rel="noopener noreferrer">💬 Join Discord</a>
        <Link href="/newsletter" className="mm-more-link" onClick={closeMenu}>📧 Newsletter</Link>
        <Link href="/advertise" className="mm-more-link" onClick={closeMenu}>📢 Advertise</Link>
        <Link href="/about" className="mm-more-link" onClick={closeMenu}>📋 About GTA6Intel</Link>
      </div>

      <div className="mm-divider" />

      <div className="mm-auth">
        <button className="mm-login" onClick={() => openModal('signup')}>Subscribe</button>
      </div>

      <div className="mm-socials">
        {SOCIALS.map((s) => (
          <a key={s.cls} href={s.href} className={`mm-soc ${s.cls}`} target="_blank" rel="noopener noreferrer" aria-label={s.cls}>
            <svg viewBox="0 0 24 24"><use href={`#${s.icon}`} /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}
