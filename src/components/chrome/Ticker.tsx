// ════════════════════════════════════════════════════════════
// Ticker — fixed bottom breaking-news marquee (CSS animation).
// Static content; swap to live data later if desired. The list is
// duplicated so the -50% translate loop is seamless.
// ════════════════════════════════════════════════════════════
const ITEMS = [
  { tag: 'Confirmed', text: 'GTA VI Pre-Orders Now Open' },
  { tag: 'Confirmed', text: 'Launch November 19, 2026' },
  { tag: 'Confirmed', text: 'Standard $69.99 · Premium $99.99' },
  { tag: 'Intel', text: 'PC Version Targeting Q2 2027' },
  { tag: 'Confirmed', text: 'Dual Protagonists Jason & Lucia' },
];

export function Ticker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        <span className="ticker-tag">Breaking</span>
        {loop.map((it, i) => (
          <span className="t-item" key={i}>
            <b>{it.tag} —</b> {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}
