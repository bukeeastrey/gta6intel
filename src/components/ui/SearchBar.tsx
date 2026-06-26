'use client';
// ════════════════════════════════════════════════════════════
// SearchBar — navigates to /search?q=… on submit. Used on the
// search page (and anywhere else you want a search box).
// ════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/content.module.css';

export function SearchBar({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  function go() {
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className={styles.searchForm}>
      <input
        className={styles.searchInput}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder="Search GTA 6 intel…"
        aria-label="Search"
      />
      <button className={styles.searchBtn} onClick={go}>
        Search
      </button>
    </div>
  );
}
