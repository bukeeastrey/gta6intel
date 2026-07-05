import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 on PC — Will There Be a PC Version?',
  description:
    'Is GTA 6 coming to PC? At launch it is PS5 and Xbox Series X|S only — no PC version is confirmed. Here is what Rockstar\u2019s history tells us about when a PC port might arrive.',
  alternates: { canonical: `${SITE_URL}/gta-6-pc` },
};

const FAQS = [
  { q: 'Is GTA 6 coming to PC?', a: 'Not confirmed. Rockstar has announced GTA 6 for PS5 and Xbox Series X|S only. A PC version has not been announced.' },
  { q: 'When will GTA 6 come to PC?', a: 'Unknown. Based on Rockstar\u2019s history, a PC port would likely arrive after the console launch — anywhere from several months to about two years later.' },
  { q: 'Why is GTA 6 not on PC at launch?', a: 'Rockstar typically ships GTA on consoles first, then releases an optimized PC version later. GTA 5 and Red Dead Redemption 2 both followed this pattern.' },
  { q: 'Will GTA 6 be on Steam and Epic?', a: 'No storefronts are confirmed. Past Rockstar PC titles launched on the Rockstar Games Launcher and later Steam/Epic — but nothing is announced for GTA 6.' },
];

export default function PcPage() {
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <main className="pillar-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="pillar-hero">
        <span className="pillar-kicker">PC Version</span>
        <h1 className="pillar-h1">GTA 6 on <span>PC</span></h1>
        <p className="pillar-lead">The short answer, and what Rockstar&rsquo;s track record tells us about a PC release.</p>
      </div>

      <div className="pillar-answer">
        <span className="pillar-answer-label">The short answer</span>
        <p>A GTA 6 PC version is <strong>not confirmed.</strong> At launch on <strong>November 19, 2026</strong>, GTA 6 is
        <strong> PS5 and Xbox Series X|S only.</strong> Rockstar has not announced a PC edition or a date.</p>
      </div>

      <section className="pillar-section">
        <h2 className="pillar-h2">What history tells us</h2>
        <p className="pillar-body">
          Rockstar has a clear pattern: release GTA on consoles first, then bring an enhanced version to PC later. It&rsquo;s a
          strong hint a PC port will come eventually — just not on day one.
        </p>
        <div className="pillar-facts">
          <div className="pillar-fact"><span className="pf-k">GTA V — console</span><span className="pf-v">Sept 2013</span></div>
          <div className="pillar-fact"><span className="pf-k">GTA V — PC</span><span className="pf-v">April 2015 (~18 mo later)</span></div>
          <div className="pillar-fact"><span className="pf-k">RDR2 — console</span><span className="pf-v">Oct 2018</span></div>
          <div className="pillar-fact"><span className="pf-k">RDR2 — PC</span><span className="pf-v">Nov 2019 (~13 mo later)</span></div>
        </div>
        <p className="pillar-body">
          If GTA 6 follows suit, PC players might wait roughly one to two years after the console launch. Treat any exact
          &ldquo;GTA 6 PC date&rdquo; you see online as a <strong>rumor</strong> until Rockstar says otherwise.
        </p>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">Should PC players wait or get a console?</h2>
        <p className="pillar-body">
          If you want GTA 6 at launch, a PS5 or Xbox Series X|S is the only way in on November 19, 2026. If you&rsquo;d rather
          hold out for the (likely sharper, higher-frame-rate) PC version, be ready for a wait with no confirmed date. We&rsquo;ll
          update this page the moment a PC version is officially announced.
        </p>
        <div className="pillar-ctas">
          <Link href="/gta-6-release-date" className="pillar-cta">Release date &amp; countdown →</Link>
          <Link href="/buy-gta-6" className="pillar-cta pillar-cta-ghost">Where to buy →</Link>
        </div>
      </section>

      <section className="pillar-section">
        <h2 className="pillar-h2">GTA 6 PC FAQ</h2>
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
