// Map placeholder. We do NOT show a fake/leaked Leonida map. Instead we render
// a neutral, abstract "map structure" (no real geography) and lock it behind a
// COMING SOON overlay so it isn't openable. Swap in a real map only when a
// credible source exists. Non-interactive by design (a div, not a link).
export function LeonidaMapComingSoon() {
  return (
    <section className="map-cs-wrap" aria-labelledby="map-cs-title">
      <div className="section-header">
        <h2 className="section-title rl" id="map-cs-title">
          The Map of <span>Leonida</span>
        </h2>
      </div>
      <div className="map-cs" role="img" aria-label="Leonida map — coming soon">
        {/* Abstract placeholder geometry — intentionally NOT the real map */}
        <svg className="map-cs-svg" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="1200" height="520" fill="#e9efe9" />
          {/* water */}
          <path d="M0,360 C220,330 380,400 560,372 C760,340 900,410 1200,372 L1200,520 L0,520 Z" fill="#cfe0e6" />
          <path d="M860,0 C900,90 840,150 880,230 C915,300 1040,320 1200,300 L1200,0 Z" fill="#cfe0e6" />
          {/* parks / green blocks */}
          <path d="M90,70 C200,40 300,90 320,170 C335,240 250,300 150,290 C60,280 30,160 90,70 Z" fill="#d6e7cf" />
          <path d="M520,60 C620,50 700,110 690,190 C680,250 600,270 540,250 C470,228 460,90 520,60 Z" fill="#d6e7cf" />
          <ellipse cx="980" cy="150" rx="120" ry="80" fill="#d6e7cf" />
          {/* roads */}
          <g stroke="#ffffff" strokeWidth="9" fill="none" opacity="0.9">
            <path d="M0,250 C200,230 380,300 560,250 C760,196 980,300 1200,240" />
            <path d="M300,0 C320,160 260,300 300,520" />
            <path d="M760,0 C740,180 820,320 780,520" />
          </g>
          <g stroke="#c9cdc9" strokeWidth="3" fill="none" opacity="0.8">
            <path d="M0,160 C220,150 420,190 640,160 C860,130 1020,200 1200,170" />
            <path d="M120,0 C140,200 90,360 130,520" />
            <path d="M520,0 C540,200 500,360 540,520" />
            <path d="M960,0 C980,200 940,360 980,520" />
          </g>
        </svg>
        <div className="map-cs-overlay">
          <span className="map-cs-badge">Coming Soon</span>
          <p className="map-cs-note">Rockstar hasn&rsquo;t released an official map of Leonida. We&rsquo;ll drop a real one here the moment a credible source exists — never a fake.</p>
        </div>
      </div>
    </section>
  );
}
