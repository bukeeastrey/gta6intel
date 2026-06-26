// ════════════════════════════════════════════════════════════
// Static homepage sections ported verbatim from v9:
//   • SocialFollow — compact follow strip
//   • BandMarquee  — orange scrolling keyword band
//   • FutureSection — "Where We Go After Launch" feature grid
// Pure server components (no interactivity).
// ════════════════════════════════════════════════════════════

const SOCIALS = [
  { cls: 'sf-x', icon: 'ico-x', label: 'X / Twitter', href: 'https://x.com/gta6intel_world' },
  { cls: 'sf-dc', icon: 'ico-dc', label: 'Discord', href: 'https://discord.gg/G9m5w78N9' },
  { cls: 'sf-yt', icon: 'ico-yt', label: 'YouTube', href: 'https://www.youtube.com/@GTA6intel-gg' },
  { cls: 'sf-tk', icon: 'ico-tk', label: 'TikTok', href: 'https://tiktok.com' },
  { cls: 'sf-ig', icon: 'ico-ig', label: 'Instagram', href: 'https://instagram.com' },
];

export function SocialFollow() {
  return (
    <section className="social-follow rv">
      <div className="sf-strip">
        <div className="sf-label">Follow us</div>
        <div className="sf-pills">
          {SOCIALS.map((s) => (
            <a key={s.cls} href={s.href} className={`sf-pill ${s.cls}`} target="_blank" rel="noopener noreferrer">
              <div className="sf-pill-ic"><svg viewBox="0 0 24 24"><use href={`#${s.icon}`} /></svg></div>
              <span>{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BandMarquee() {
  const Item = () => (
    <span className="band-item">
      GTA 6 <span className="b-dot" /> Nov 19 2026 <span className="b-dot" /> Pre-Orders Open{' '}
      <span className="b-dot" /> Leonida State <span className="b-dot" /> Jason &amp; Lucia{' '}
      <span className="b-dot" /> Vice City Returns <span className="b-dot" />
    </span>
  );
  return (
    <div className="band rv">
      <div className="band-track">
        <Item />
        <Item />
      </div>
    </div>
  );
}

const FUTURE = [
  { ic: '🗺️', n: 'Story Guides', d: "Mission walkthroughs, collectibles, 100% completion for Jason & Lucia's story.", hot: true },
  { ic: '💰', n: 'Money Methods', d: 'Best ways to earn in GTA Online — passive income, businesses, heist payouts.' },
  { ic: '🚗', n: 'Vehicles', d: 'Best cars by category, upgrade priorities, race setups, and new vehicle reviews.' },
  { ic: '🎯', n: 'Heist Guides', d: 'Step-by-step heist breakdowns, crew requirements, and payout strategies.' },
  { ic: '📅', n: 'Weekly Updates', d: 'Every Thursday Rockstar updates GTA Online. We cover every bonus and content drop.' },
  { ic: '🏠', n: 'Properties', d: 'Which businesses to buy first, ROI rankings, and property upgrade guides.' },
  { ic: '🤖', n: 'GTA6 AI', d: 'Ask our AI anything. Connect your game progress for personalized help.' },
  { ic: '🏆', n: 'Rank & Trophies', d: 'Level-up guides, trophy hunting, achievement completion, and prestige strategies.' },
];

export function FutureSection() {
  return (
    <div className="future">
      <div className="f-ey rv">Post-Launch Coverage</div>
      <h2 className="f-h rv">Where We Go After <em>Launch</em></h2>
      <p className="f-sub rv">
        GTA Online is a decade-long live service. We cover every update, every week — and
        our AI helps you personally navigate the game.
      </p>
      <div className="f-grid">
        {FUTURE.map((f, i) => (
          <div className={`fc${f.hot ? ' hot' : ''} rv d${i + 1}`} key={f.n}>
            <span className="fc-ic">{f.ic}</span>
            <div className="fc-n">{f.n}</div>
            <div className="fc-d">{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
