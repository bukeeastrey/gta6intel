import type { Metadata } from 'next';
import Link from 'next/link';
import { CountdownTimer } from '@/components/home/CountdownTimer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 Release Date — Countdown to November 19, 2026',
  description:
    'GTA 6 releases on November 19, 2026 for PS5 and Xbox Series X|S. Live countdown, preload date, platforms, price, and whether a delay or PC version is confirmed.',
  alternates: { canonical: `${SITE_URL}/gta-6-release-date` },
};

const FAQS = [
  { q: 'When is the GTA 6 release date?', a: 'Grand Theft Auto VI releases on November 19, 2026. It was confirmed by Rockstar Games after an earlier 2025 window shifted.' },
  { q: 'Can I preload GTA 6?', a: 'Yes — digital preloading begins November 12, 2026, a week before launch, so the game is ready to play at release.' },
  { q: 'What platforms is GTA 6 on at launch?', a: 'PlayStation 5 and Xbox Series X|S only. There is no last-gen (PS4/Xbox One) version.' },
  { q: 'Is GTA 6 coming to PC?', a: 'Rockstar has not confirmed a PC version or date. Based on past GTA releases, a PC port is expected later rather than at launch.' },
  { q: 'Has GTA 6 been delayed?', a: 'The launch moved from an initial 2025 window to November 19, 2026. As of now, that date stands as the confirmed release.' },
];

export default function ReleaseDatePage() {
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <main className="pillar-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="pillar-hero">
        <span className="pillar-kicker">Release Date</span>
        <h1 className="pillar-h1">GTA 6 <span>Release Date</span></h1>
        <p className="pillar-lead">
          <strong>Grand Theft Auto VI</strong> launches on <strong>November 19, 2026</strong> for PS5 and Xbox Series X|S.
          Here&rsquo;s the live countdown and everything confirmed about the date.
        </p>
      </div>

      <div className="pillar-countdown"><CountdownTimer /></div>

      <section className="pillar-section">
        <h2 className="pillar-h2">The key facts</h2>
        <div className="pillar-facts">
          <div className="pillar-fact"><span className="pf-k">Release date</span><span className="pf-v">November 19, 2026</span></div>
          <div className="pillar-fact"><span className="pf-k">Digital preload</span><span className="pf-v">November 12, 2026</span></div>
          <div className="pillar-fact"><span className="pf-k">Platforms</span><span className="pf-v">PS5 &amp; Xbox Series X|S</span></div>
          <div className="pillar-fact"><span className="pf-k">PC version</span><span className="pf-v">Not confirmed</span></div>
          <div className="pillar-fact"><span className="pf-k">Price</span><span className="pf-v">$79.99 / $99.99</span></div>
          <div className="pillar-fact"><span className="pf-k">Setting</span><span className="pf-v">Leonida &middot; Vice City</span></div>
        </div>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">What to know</h2>
        <p className="pillar-body">
          Rockstar dated GTA 6 to November 19, 2026 after its original 2025 window shifted — a move the company framed as
          extra polish time. Pre-orders are open, and pre-ordering digitally lets your console auto-download from the
          November 12 preload so you can play the moment it unlocks. Both editions include the Vintage Vice City Pack as a
          pre-order bonus; the Ultimate Edition adds exclusive content and a month of GTA+.
        </p>
        <p className="pillar-body">
          A PC version has not been announced. If GTA 5 is any guide, PC players may wait past the console launch — we&rsquo;ll
          update this page the moment Rockstar confirms anything, labeled clearly as confirmed rather than rumor.
        </p>
        <div className="pillar-ctas">
          <Link href="/buy-gta-6" className="pillar-cta">Where to pre-order →</Link>
          <Link href="/gta-6-map" className="pillar-cta pillar-cta-ghost">Explore the map →</Link>
        </div>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">Release date FAQ</h2>
        <div className="pillar-faq">
          {FAQS.map((f, i) => (
            <details className="pillar-faq-item" key={i}>
              <summary>{f.q}<span className="pillar-chev">+</span></summary>
              <div className="pillar-faq-a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
