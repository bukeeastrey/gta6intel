// ════════════════════════════════════════════════════════════
// Small pure helpers shared across components.
// ════════════════════════════════════════════════════════════

/** "2h ago" / "5d ago" style relative label from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Long-form date for hero meta, e.g. "June 25, 2026". */
export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Brand-consistent dark gradients used when an article has no image.
// Mirrors the hand-picked palettes from the v9 card placeholders.
const CARD_GRADIENTS = [
  'linear-gradient(135deg,#1a0805,#2d1208)',
  'linear-gradient(155deg,#0d1a2d,#1a0d28)',
  'linear-gradient(135deg,#1f0a14,#0a1f14)',
  'linear-gradient(135deg,#1a1505,#051a1a)',
  'linear-gradient(135deg,#180804,#0a1628)',
];

/** Deterministic gradient pick from an id so a card looks stable across renders. */
export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return CARD_GRADIENTS[h % CARD_GRADIENTS.length];
}

/** Stroked watchword behind hero slides when none is stored. */
export function ghostFrom(title: string): string {
  return title
    .replace(/[^a-z0-9 ]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ')
    .toUpperCase();
}
