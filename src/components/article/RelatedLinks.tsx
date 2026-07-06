// RelatedLinks — auto internal-linking for every article/guide.
// Reads the article's title + body and surfaces the most relevant pillar /
// database pages (intent-based), plus a universal "Buy GTA 6" CTA. Computed at
// render time, so every existing and future article gets fresh internal links
// with zero pipeline changes.
import Link from 'next/link';

type Pillar = { href: string; label: string; kw: RegExp };

// Ordered by priority; each links to the page that matches the reader's intent.
const PILLARS: Pillar[] = [
  { href: '/buy-gta-6', label: 'Where to Buy GTA 6', kw: /\b(price|buy|pre-?order|edition|cost|deal|deluxe|ultimate)\b/i },
  { href: '/gta-6-map', label: 'The GTA 6 Map', kw: /\b(map|leonida|vice city|grassrivers|keys|region|county|location)\b/i },
  { href: '/gta-6-trailer', label: 'GTA 6 Trailers', kw: /\b(trailer|teaser|footage|reveal)\b/i },
  { href: '/gta-6-release-date', label: 'GTA 6 Release Date', kw: /\b(release|date|delay|launch|november|2026|preload|countdown)\b/i },
  { href: '/gta-6-pc', label: 'GTA 6 on PC', kw: /\b(\bpc\b|steam|epic games|computer|port)\b/i },
  { href: '/database/characters', label: 'GTA 6 Characters', kw: /\b(character|jason|lucia|cast|protagonist|npc)\b/i },
  { href: '/database/vehicles', label: 'GTA 6 Vehicles', kw: /\b(car|vehicle|motorcycle|bike|driving)\b/i },
  { href: '/database/weapons', label: 'GTA 6 Weapons', kw: /\b(weapon|gun|pistol|rifle|firearm)\b/i },
  { href: '/database/music', label: 'GTA 6 Soundtrack', kw: /\b(song|music|soundtrack|radio|track)\b/i },
];

const FALLBACK: { href: string; label: string }[] = [
  { href: '/gta-6-release-date', label: 'GTA 6 Release Date' },
  { href: '/database', label: 'GTA 6 Database' },
];

export function RelatedLinks({ title, body }: { title: string; body?: string | null }) {
  const text = `${title} ${body ?? ''}`;
  const links: { href: string; label: string }[] = [];

  for (const p of PILLARS) if (p.kw.test(text)) links.push({ href: p.href, label: p.label });
  for (const f of FALLBACK) if (!links.some((l) => l.href === f.href)) links.push(f);

  const seen = new Set<string>();
  const related = links.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true))).slice(0, 5);

  return (
    <aside className="rel-wrap">
      <div className="rel-cta">
        <div className="rel-cta-txt">
          <span className="rel-cta-k">Ready to play?</span>
          <span className="rel-cta-t">Compare editions, prices and pre-order deals.</span>
        </div>
        <Link href="/buy-gta-6" className="rel-cta-btn">Buy GTA 6 from here →</Link>
      </div>

      <div className="rel-block">
        <span className="rel-h">Keep reading</span>
        <ul className="rel-list">
          {related.map((l) => (
            <li key={l.href}><Link href={l.href}>{l.label} →</Link></li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
