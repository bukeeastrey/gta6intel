import type { Metadata } from 'next';
import Link from 'next/link';
import { getVideosByCategory } from '@/lib/videos';
import { VideoGrid } from '@/components/videos/VideoGrid';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

// Re-check the DB regularly so newly added trailers appear without a redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'GTA 6 Trailers — Every Official Trailer & Breakdown',
  description:
    'Watch every official GTA 6 trailer in one place. Trailer 1 (December 2023) and Trailer 2 (May 2025), what they revealed, the soundtrack, and whether Trailer 3 is coming.',
  alternates: { canonical: `${SITE_URL}/gta-6-trailer` },
};

const FAQS = [
  { q: 'How many GTA 6 trailers are there?', a: 'Two official trailers so far: Trailer 1 (December 2023) and Trailer 2 (May 2025). Rockstar has not released a third.' },
  { q: 'When did the first GTA 6 trailer release?', a: 'Trailer 1 dropped in December 2023 — a day early, after a leak — and became the most-viewed video-game trailer in history within 24 hours.' },
  { q: 'Is there a GTA 6 Trailer 3?', a: 'Not yet. Any "Trailer 3" date is a rumor until Rockstar confirms it. We label it as rumor until then.' },
  { q: 'What songs are in the GTA 6 trailers?', a: 'Trailer 1 used Tom Petty\u2019s "Love Is a Long Road"; Trailer 2 featured tracks including The Pointer Sisters. See our full confirmed soundtrack in the database.' },
];

export default async function TrailerPage() {
  const trailers = await getVideosByCategory('trailer', 20);

  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <main className="pillar-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="pillar-hero">
        <span className="pillar-kicker">Trailers</span>
        <h1 className="pillar-h1">GTA 6 <span>Trailers</span></h1>
        <p className="pillar-lead">
          Every official <strong>Grand Theft Auto VI</strong> trailer in one place, plus what each one revealed about
          Jason, Lucia and the state of Leonida.
        </p>
      </div>

      {trailers.length > 0 ? (
        <VideoGrid videos={trailers} />
      ) : (
        <p className="pillar-body">Official trailers will appear here. (Tag videos as <code>trailer</code> in your database to feature them.)</p>
      )}

      <section className="pillar-section">
        <h2 className="pillar-h2">The trailers so far</h2>
        <div className="pillar-regions">
          <div className="pillar-region">
            <h3>Trailer 1 — December 2023</h3>
            <p>Our first look at GTA 6: Lucia Caminos, a return to Vice City in the new state of Leonida, set to Tom Petty&rsquo;s &ldquo;Love Is a Long Road.&rdquo; It shattered records as the most-watched game trailer ever in its first 24 hours.</p>
          </div>
          <div className="pillar-region">
            <h3>Trailer 2 — May 2025</h3>
            <p>A deeper look at Jason and Lucia&rsquo;s story and a wider tour of Leonida&rsquo;s regions and tone, with an expanded soundtrack. It confirmed the November 2026 launch window era of marketing.</p>
          </div>
        </div>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">Is Trailer 3 coming?</h2>
        <p className="pillar-body">
          Rockstar hasn&rsquo;t announced a third trailer. Expect the marketing to ramp up as the November 19, 2026 launch
          nears — and when a real Trailer 3 drops, it&rsquo;ll be here first, clearly labeled confirmed rather than rumor.
        </p>
        <div className="pillar-ctas">
          <Link href="/gta-6-release-date" className="pillar-cta">Release date &amp; countdown →</Link>
          <Link href="/database/music" className="pillar-cta pillar-cta-ghost">Trailer soundtrack →</Link>
        </div>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">Trailer FAQ</h2>
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
