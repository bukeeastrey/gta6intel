'use client';
// ════════════════════════════════════════════════════════════
// Footer — ported from v9. Client component only so the "GTA6 AI"
// link can open the AI modal; everything else is plain navigation.
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import { useUi } from './UiProvider';

const SOCIALS = [
  { cls: 'x', icon: 'ico-x', href: 'https://x.com/gta6intel_world' },
  { cls: 'dc', icon: 'ico-dc', href: 'https://discord.gg/G9m5w78N9' },
  { cls: 'yt', icon: 'ico-yt', href: 'https://www.youtube.com/@GTA6intel-gg' },
  { cls: 'tk', icon: 'ico-tk', href: 'https://tiktok.com' },
  { cls: 'ig', icon: 'ico-ig', href: 'https://instagram.com' },
];

export function Footer() {
  const { openModal } = useUi();
  return (
    <footer className="footer">
      <div className="f-grid rv">
        <div className="f-brand">
          <div className="f-logo">
            <div className="f-logo-mark">G6</div>
            <span><em>GTA6</em>Intel</span>
          </div>
          <p>
            Independent GTA 6 intelligence hub. Covering news, Intel, guides, and
            community content. Not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
          <div className="f-soc-row">
            {SOCIALS.map((s) => (
              <a key={s.cls} href={s.href} className={`f-s ${s.cls}`} target="_blank" rel="noopener noreferrer" aria-label={s.cls}>
                <svg><use href={`#${s.icon}`} /></svg>
              </a>
            ))}
          </div>
        </div>

        <div className="f-col">
          <h4>Coverage</h4>
          <Link href="/news">All News</Link>
          <Link href="/news?category=confirmed">Confirmed</Link>
          <Link href="/news?category=intel">Intel</Link>
          <Link href="/news?category=analysis">Analysis</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/guides">Guides</Link>
        </div>

        <div className="f-col">
          <h4>Community</h4>
          <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer">Join Discord</a>
          <Link href="/newsletter">Newsletter</Link>
          <button type="button" className="footer-linkbtn" onClick={() => openModal('ai')}>GTA6 AI</button>
          <Link href="/connect">Connect Game</Link>
          <a href="/rss.xml">RSS Feed</a>
        </div>

        <div className="f-col">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">User Agreement</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
      </div>

      <div className="f-bot">
        <div className="f-copy">© 2026 GTA6Intel.net · All rights reserved</div>
        <div className="f-disc">
          GTA6Intel.net is an independent fan site. Not affiliated with Rockstar Games
          or Take-Two Interactive. Grand Theft Auto is a registered trademark of
          Take-Two Interactive Software, Inc.
        </div>
      </div>
    </footer>
  );
}
