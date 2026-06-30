'use client';
// Compact homepage band: GTA 6 Radio (confirmed soundtrack) + Pre-order.
// Radio links each song to a YouTube search (no audio hosted/embedded — copyright
// + cost safe). Pre-order editions are selectable; CTA points at PREORDER_URL —
// swap for your Amazon affiliate link when ready.
import Link from 'next/link';
import { useState } from 'react';

const PREORDER_URL = 'https://www.rockstargames.com/VI';

const SOUNDTRACK: { title: string; artist: string }[] = [
  { title: 'Love Is a Long Road', artist: 'Tom Petty' },
  { title: 'Hot Together', artist: 'The Pointer Sisters' },
  { title: 'Everybody Have Fun Tonight', artist: 'Wang Chung' },
  { title: "Talkin' to Myself Again", artist: 'Tammy Wynette' },
  { title: 'Child Support', artist: 'Zenglen' },
  { title: 'Thunder Island', artist: 'Jay Ferguson' },
];

const EDITIONS = {
  standard: { name: 'Standard', price: '$79.99', includes: 'The base game, plus the Vintage Vice City Pack pre-order bonus.' },
  ultimate: { name: 'Ultimate', price: '$99.99', includes: 'Everything in Standard, plus exclusive vehicles, weapons, businesses, cosmetics and bonus missions — and 1 month of GTA+ on digital pre-orders.' },
} as const;

type Ed = keyof typeof EDITIONS;

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export function HomeRadioPreorder() {
  const [ed, setEd] = useState<Ed>('ultimate');

  return (
    <div className="rp-grid">
      {/* Radio */}
      <section className="rp-card rp-radio" aria-labelledby="rp-radio-title">
        <div className="rp-head">
          <span className="rp-radio-icon" aria-hidden="true">((•))</span>
          <div>
            <h3 className="rp-title" id="rp-radio-title">GTA 6 Radio</h3>
            <p className="rp-sub">Confirmed soundtrack</p>
          </div>
          <Link href="/database/music" className="rp-head-link">All →</Link>
        </div>
        <ol className="rp-songs">
          {SOUNDTRACK.map((s, i) => (
            <li className="rp-song" key={s.title}>
              <span className="rp-song-no">{i + 1}</span>
              <span className="rp-song-meta">
                <span className="rp-song-title">{s.title}</span>
                <span className="rp-song-artist">{s.artist}</span>
              </span>
              <a className="rp-song-play" href={yt(`${s.artist} ${s.title}`)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${s.title} on YouTube`}>▶</a>
            </li>
          ))}
        </ol>
        <p className="rp-radio-foot">Station <strong>V-Rock</strong> confirmed to return · more stations &amp; tracks closer to launch.</p>
      </section>

      {/* Pre-order */}
      <section className="rp-card rp-preorder" aria-labelledby="rp-pre-title">
        <span className="rp-pre-kicker">Pre-order</span>
        <h3 className="rp-title" id="rp-pre-title">Grand Theft Auto VI</h3>
        <div className="rp-editions" role="radiogroup" aria-label="Choose edition">
          {(Object.keys(EDITIONS) as Ed[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={ed === k}
              onClick={() => setEd(k)}
              className={`rp-edition${ed === k ? ' is-sel' : ''}`}
            >
              <span className="rp-ed-name">{EDITIONS[k].name}</span>
              <span className="rp-ed-price">{EDITIONS[k].price}</span>
            </button>
          ))}
        </div>
        <p className="rp-ed-includes">{EDITIONS[ed].includes}</p>
        <ul className="rp-facts">
          <li>Launches <strong>Nov 19, 2026</strong> · preload <strong>Nov 12</strong></li>
          <li>PS5 &amp; Xbox Series X|S</li>
        </ul>
        <a className="rp-cta" href={PREORDER_URL} target="_blank" rel="noopener noreferrer">Pre-Order {EDITIONS[ed].name} →</a>
      </section>
    </div>
  );
}
