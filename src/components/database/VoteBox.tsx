'use client';
// 👍 / 👎 voting for a database entry. Remembers the user's vote in
// localStorage to discourage repeat voting (best-effort, not security).
import { useEffect, useState } from 'react';

export function VoteBox({ id, up, down }: { id: string; up: number; down: number }) {
  const [counts, setCounts] = useState({ up, down });
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(`gi_vote_${id}`);
      if (v === 'up' || v === 'down') setVoted(v);
    } catch {}
  }, [id]);

  async function vote(dir: 'up' | 'down') {
    if (voted) return;
    setVoted(dir);
    setCounts((c) => ({ ...c, [dir]: c[dir] + 1 }));
    try { localStorage.setItem(`gi_vote_${id}`, dir); } catch {}
    try {
      const res = await fetch('/api/database/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dir }),
      });
      const d = await res.json();
      if (res.ok) setCounts({ up: d.votes_up, down: d.votes_down });
    } catch {}
  }

  return (
    <div className="db-vote">
      <button className={`db-vote-btn up ${voted === 'up' ? 'on' : ''}`} onClick={() => vote('up')} disabled={!!voted} aria-label="Helpful">
        👍 <span>{counts.up}</span>
      </button>
      <button className={`db-vote-btn down ${voted === 'down' ? 'on' : ''}`} onClick={() => vote('down')} disabled={!!voted} aria-label="Not helpful">
        👎 <span>{counts.down}</span>
      </button>
    </div>
  );
}
