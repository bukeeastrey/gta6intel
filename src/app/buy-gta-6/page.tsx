import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Where to Buy GTA 6 — Prices, Editions & Pre-Order Deals',
  description:
    'Compare where to buy Grand Theft Auto VI: Standard ($79.99) vs Ultimate ($99.99), PS5 & Xbox pre-order prices, bonuses and the best deals ahead of the November 19, 2026 launch.',
  alternates: { canonical: '/buy-gta-6' },
};

// 👉 Replace each '#' with YOUR affiliate link once you've joined the programs.
const LINKS = {
  playstation: '#',
  xbox: '#',
  amazon: '#',
  instantGaming: '#',
  eneba: '#',
  cdkeys: '#',
};

type Retailer = {
  name: string; platform: string; std: string; ult: string; url: string; note?: string; official?: boolean;
};

const RETAILERS: Retailer[] = [
  { name: 'PlayStation Store', platform: 'PS5', std: '$79.99', ult: '$99.99', url: LINKS.playstation, official: true },
  { name: 'Xbox Store', platform: 'Xbox Series X|S', std: '$79.99', ult: '$99.99', url: LINKS.xbox, official: true },
  { name: 'Amazon', platform: 'PS5 / Xbox', std: '$79.99', ult: '$99.99', url: LINKS.amazon, note: 'Disc + digital (PSN) codes' },
  { name: 'Instant Gaming', platform: 'PS5 / Xbox', std: 'Check price', ult: 'Check price', url: LINKS.instantGaming, note: 'Reseller - often discounted' },
  { name: 'Eneba', platform: 'PS5 / Xbox', std: 'Check price', ult: 'Check price', url: LINKS.eneba, note: 'Reseller marketplace' },
  { name: 'CDKeys', platform: 'PS5 / Xbox', std: 'Check price', ult: 'Check price', url: LINKS.cdkeys, note: 'Reseller' },
];

const REL = 'nofollow sponsored noopener noreferrer';

export default function BuyPage() {
  return (
    <main className="buy-wrap">
      <div className="buy-hero">
        <span className="buy-kicker">Where to Buy</span>
        <h1 className="buy-h1">Buy <span>Grand Theft Auto VI</span></h1>
        <p className="buy-lead">
          GTA 6 launches <strong>November 19, 2026</strong> on PS5 and Xbox Series X|S (digital preload from Nov 12).
          Here is every place to pre-order, side by side, with prices and bonuses.
        </p>
      </div>

      <p className="buy-disclosure">
        Some links below are affiliate links - GTA6Intel may earn a small commission if you buy through them, at no extra cost to you. It helps keep the site independent.
      </p>

      <section className="buy-section">
        <h2 className="buy-h2">Which edition?</h2>
        <div className="buy-editions">
          <div className="buy-ed">
            <div className="buy-ed-top"><span className="buy-ed-name">Standard</span><span className="buy-ed-price">$79.99</span></div>
            <ul className="buy-ed-list">
              <li>The full base game</li>
              <li>Pre-order bonus: <strong>Vintage Vice City Pack</strong></li>
            </ul>
            <p className="buy-ed-for">Best for most players.</p>
          </div>
          <div className="buy-ed buy-ed-ult">
            <div className="buy-ed-top"><span className="buy-ed-name">Ultimate</span><span className="buy-ed-price">$99.99</span></div>
            <ul className="buy-ed-list">
              <li>Everything in Standard</li>
              <li>Exclusive vehicles, weapons, businesses &amp; cosmetics</li>
              <li>Bonus missions (Classic Car Collection &amp; more)</li>
              <li><strong>1 month of GTA+</strong> on digital pre-orders</li>
            </ul>
            <p className="buy-ed-for">Best for day-one superfans.</p>
          </div>
        </div>
      </section>

      <section className="buy-section">
        <h2 className="buy-h2">Compare prices</h2>
        <div className="buy-table">
          <div className="buy-row buy-head">
            <span>Retailer</span><span>Platform</span><span>Standard</span><span>Ultimate</span><span></span>
          </div>
          {RETAILERS.map((r) => (
            <div className="buy-row" key={r.name}>
              <span className="buy-r-name">{r.name}{r.official && <em className="buy-tag">Official</em>}{r.note && <em className="buy-note">{r.note}</em>}</span>
              <span data-l="Platform">{r.platform}</span>
              <span data-l="Standard">{r.std}</span>
              <span data-l="Ultimate">{r.ult}</span>
              <span><a className="buy-btn" href={r.url} target="_blank" rel={REL}>Buy &rarr;</a></span>
            </div>
          ))}
        </div>
        <p className="buy-fineprint">Reseller prices change often - &ldquo;Check price&rdquo; opens the live listing. Official store prices are set by Rockstar. Always confirm the platform before buying.</p>
      </section>

      <section className="buy-section">
        <h2 className="buy-h2">Pre-order bonus</h2>
        <p className="buy-body">
          Every pre-order includes the <strong>Vintage Vice City Pack</strong>. Digital pre-orders also get <strong>one month of GTA+</strong>.
          Pre-ordering locks the bonus and lets your console auto-download from Nov 12 so you can play at launch.
        </p>
      </section>
    </main>
  );
}
