// Compact homepage band: GTA 6 Radio (confirmed soundtrack) + Pre-order.
// Kept small. The radio is a confirmed tracklist that links each song to a
// YouTube search (no audio is hosted/embedded — copyright + cost safe). The
// pre-order CTA points at PREORDER_URL — swap it for your Amazon affiliate
// link when that's set up.
import Link from 'next/link';

const PREORDER_URL = 'https://www.rockstargames.com/VI';

const SOUNDTRACK: { title: string; artist: string }[] = [
  { title: 'Love Is a Long Road', artist: 'Tom Petty' },
  { title: 'Hot Together', artist: 'The Pointer Sisters' },
  { title: 'Everybody Have Fun Tonight', artist: 'Wang Chung' },
  { title: "Talkin' to Myself Again", artist: 'Tammy Wynette' },
  { title: 'Child Support', artist: 'Zenglen' },
  { title: 'Thunder Island', artist: 'Jay Ferguson' },
];

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export function HomeRadioPreorder() {
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
        <div className="rp-editions">
          <div className="rp-edition">
            <span className="rp-ed-name">Standard</span>
            <span className="rp-ed-price">$79.99</span>
          </div>
          <div className="rp-edition rp-edition-ult">
            <span className="rp-ed-name">Ultimate</span>
            <span className="rp-ed-price">$99.99</span>
          </div>
        </div>
        <ul className="rp-facts">
          <li>Launches <strong>Nov 19, 2026</strong> · preload <strong>Nov 12</strong></li>
          <li>PS5 &amp; Xbox Series X|S</li>
          <li>Pre-order bonus: Vintage Vice City Pack</li>
        </ul>
        <a className="rp-cta" href={PREORDER_URL} target="_blank" rel="noopener noreferrer">Pre-Order Now →</a>
      </section>
    </div>
  );
}
