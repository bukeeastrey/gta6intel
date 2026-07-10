'use client';
// 👍 / 👎 voting for a database entry. Clicking your current vote removes it;
// clicking the other switches. Remembers the choice in localStorage
// (best-effort, not security).
import { useEffect, useState } from 'react';

type Dir = 'up' | 'down';

export function VoteBox({ id, up, down }: { id: string; up: number; down: number }) {
  const [counts, setCounts] = useState({ up, down });
  const [voted, setVoted] = useState<Dir | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(`gi_vote_${id}`);
      if (v === 'up' || v === 'down') setVoted(v);
    } catch {}
  }, [id]);

  async function click(dir: Dir) {
    if (busy) return;
    const prev = voted;
    const next: Dir | null = prev === dir ? null : dir; // same = remove, other = switch
    setBusy(true);
    setVoted(next);
    setCounts((c) => {
      const u = c.up + (next === 'up' ? 1 : 0) - (prev === 'up' ? 1 : 0);
      const d = c.down + (next === 'down' ? 1 : 0) - (prev === 'down' ? 1 : 0);
      return { up: Math.max(0, u), down: Math.max(0, d) };
    });
    try {
      if (next) localStorage.setItem(`gi_vote_${id}`, next);
      else localStorage.removeItem(`gi_vote_${id}`);
    } catch {}
    try {
      const res = await fetch('/api/database/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, prev, next }),
      });
      const data = await res.json();
      if (res.ok) setCounts({ up: data.votes_up, down: data.votes_down });
    } catch {} finally {
      setBusy(false);
    }
  }

  return (
    <div className="db-vote">
      <button className={`db-vote-btn up ${voted === 'up' ? 'on' : ''}`} onClick={() => click('up')} aria-pressed={voted === 'up'} aria-label="Helpful">
        👍 <span>{counts.up}</span>
      </button>
      <button className={`db-vote-btn down ${voted === 'down' ? 'on' : ''}`} onClick={() => click('down')} aria-pressed={voted === 'down'} aria-label="Not helpful">
        👎 <span>{counts.down}</span>
      </button>
    </div>
  );
}
