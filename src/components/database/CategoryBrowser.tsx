'use client';
// Client-side browse experience for a database category:
// search, status filter, and sort — instant, no page reloads.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DbEntry } from '@/lib/database';
import { entryImage } from '@/lib/database';

function topStatus(e: DbEntry): string {
  // The "headline" credibility of an entry = best status among its attributes.
  const s = e.attributes.map((a) => a.status);
  if (s.includes('confirmed')) return 'confirmed';
  if (s.includes('rumor')) return 'rumor';
  if (s.includes('leak')) return 'leak';
  return 'none';
}

export function CategoryBrowser({ entries, categoryKey }: { entries: DbEntry[]; categoryKey: string }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('popular');

  const view = useMemo(() => {
    let list = entries.slice();
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(needle) ||
          (e.subtitle ?? '').toLowerCase().includes(needle) ||
          (e.summary ?? '').toLowerCase().includes(needle),
      );
    }
    if (status !== 'all') list = list.filter((e) => topStatus(e) === status);
    if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'za') list.sort((a, b) => b.name.localeCompare(a.name));
    else list.sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
    return list;
  }, [entries, q, status, sort]);

  return (
    <>
      <div className="db-toolbar">
        <input
          className="db-search"
          placeholder="Search this category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="db-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="rumor">Rumor</option>
          <option value="leak">Leak</option>
        </select>
        <select className="db-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">Popular first</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <span className="db-count">{view.length} {view.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {view.length === 0 ? (
        <p className="db-empty">No entries yet. Check back soon — this category is being built out.</p>
      ) : (
        <div className="db-grid">
          {view.map((e) => (
            <Link key={e.slug} href={`/database/${categoryKey}/${e.slug}`} className="db-card">
              {(() => { const img = entryImage(e); return (
              <div className="db-card-img" style={img ? { backgroundImage: `url(${img})` } : undefined}>
                {!img && <span className="db-card-ph">{e.name.charAt(0)}</span>}
                {e.popular && <span className="db-badge-pop">POPULAR</span>}
                <span className={`db-badge-st st-${topStatus(e)}`}>{topStatus(e) === 'none' ? '' : topStatus(e).toUpperCase()}</span>
              </div>
              ); })()}
              <div className="db-card-body">
                <div className="db-card-name">{e.name}</div>
                {e.subtitle && <div className="db-card-sub">{e.subtitle}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
