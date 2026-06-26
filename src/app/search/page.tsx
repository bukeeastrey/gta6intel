// ════════════════════════════════════════════════════════════
// /search — full-text-ish search over published articles.
// Results pages are noindex (thin/duplicate content).
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { searchArticles } from '@/lib/articles';
import { NewsGrid } from '@/components/home/NewsGrid';
import { SearchBar } from '@/components/ui/SearchBar';
import styles from '@/styles/content.module.css';

export const metadata: Metadata = {
  title: 'Search — GTA6Intel',
  robots: { index: false, follow: true },
};

type SP = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchArticles(query) : [];

  return (
    <main>
      <div className={styles.searchWrap}>
        <SearchBar initial={query} />
      </div>

      {query && (
        <p className={styles.searchMeta}>
          {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
        </p>
      )}

      {results.length > 0 ? (
        <NewsGrid articles={results} />
      ) : query ? (
        <p className={styles.empty}>No matches. Try different keywords.</p>
      ) : (
        <p className={styles.empty}>Type a search above to find GTA 6 intel.</p>
      )}
    </main>
  );
}
