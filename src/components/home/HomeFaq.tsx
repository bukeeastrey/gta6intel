// Homepage FAQ — high-intent, confirmed-fact answers about GTA 6.
// Native <details> accordion (no JS, content in the DOM for SEO) + FAQPage
// JSON-LD so the questions are eligible for rich results in Google.
// Keep answers CONFIRMED and honest — this is the accuracy brand.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'When does GTA 6 come out?',
    a: 'Grand Theft Auto VI launches on November 19, 2026. Digital pre-loading begins a week earlier, on November 12, 2026.',
  },
  {
    q: 'What platforms is GTA 6 on?',
    a: 'GTA 6 launches on PlayStation 5 and Xbox Series X|S. Rockstar has not announced a PC version or a PC release date — historically, PC ports arrive later.',
  },
  {
    q: 'How much does GTA 6 cost?',
    a: 'The Standard Edition is $79.99 and the Ultimate Edition is $99.99. Digital pre-orders include the Vintage Vice City Pack, and digital pre-orders also get one month of GTA+.',
  },
  {
    q: 'Who are the GTA 6 protagonists?',
    a: 'GTA 6 has two playable protagonists, Jason Duval and Lucia Caminos — Lucia is the first female lead in a mainline GTA. You switch between them during the story.',
  },
  {
    q: 'Where is GTA 6 set?',
    a: 'GTA 6 is set in the fictional state of Leonida, a modern take on Florida, centered on Vice City (inspired by Miami). Confirmed regions include the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia and Mount Kalaga National Park.',
  },
  {
    q: 'Is there an official GTA 6 map?',
    a: 'No. Rockstar has not released an official map of Leonida yet — only the named regions and screenshots. Any full map circulating online is unofficial.',
  },
  {
    q: 'Will GTA 6 have online multiplayer at launch?',
    a: 'GTA 6 launches with its single-player campaign. Rockstar is expected to follow with an online mode, but it has not been dated.',
  },
  {
    q: 'Has Trailer 3 been released?',
    a: 'No. Only two official trailers have been released so far. Any "Trailer 3" date is a rumor until Rockstar confirms it.',
  },
];

export function HomeFaq() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="faq-wrap" aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="section-header">
        <h2 className="section-title rl" id="faq-title">
          GTA 6 <span>FAQ</span>
        </h2>
      </div>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <details className="faq-item" key={i}>
            <summary className="faq-q">
              <span>{f.q}</span>
              <span className="faq-chev" aria-hidden="true">+</span>
            </summary>
            <div className="faq-a">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
