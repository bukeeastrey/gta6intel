// ════════════════════════════════════════════════════════════
// /search — searches the database (characters, vehicles, etc.) AND
// published articles. Results pages are noindex (thin/duplicate content).
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import Link from 'next/link';
import { searchArticles } from '@/lib/articles';
import { searchEntries, entryImage, categoryMeta } from '@/lib/database';
import { NewsGrid } from '@/components/home/NewsGrid';
import { SearchBar } from '@/components/ui/SearchBar';
import styles from '@/styles/content.module.css';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

type SP = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const [entries, articles] = query
    ? await Promise.all([searchEntries(query), searchArticles(query)])
    : [[], []];
  const total = entries.length + articles.length;

  return (
    <main>
      <div className={styles.searchWrap}>
        <SearchBar initial={query} />
      </div>

      {query && (
        <p className={styles.searchMeta}>
          {total} result{total === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
        </p>
      )}

      {total > 0 ? (
        <div className="search-results">
          {entries.length > 0 && (
            <section className="search-section">
              <h2 className="search-h2">Database</h2>
              <div className="search-db-grid">
                {entries.map((e) => {
                  const img = entryImage(e);
                  return (
                    <Link key={e.id} href={`/database/${e.category}/${e.slug}`} className="search-db-card">
                      <div className="search-db-img" style={img ? { backgroundImage: `url(${img})` } : undefined}>
                        {!img && <span className="search-db-ph">{e.name.charAt(0)}</span>}
                      </div>
                      <div className="search-db-meta">
                        <span className="search-db-cat">{categoryMeta(e.category)?.label ?? e.category}</span>
                        <span className="search-db-name">{e.name}</span>
                        {e.subtitle && <span className="search-db-sub">{e.subtitle}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {articles.length > 0 && (
            <section className="search-section">
              <h2 className="search-h2">News &amp; Articles</h2>
              <NewsGrid articles={articles} />
            </section>
          )}
        </div>
      ) : query ? (
        <p className={styles.empty}>No matches. Try different keywords.</p>
      ) : (
        <p className={styles.empty}>Type a search above to find GTA 6 intel — characters, vehicles, news and more.</p>
      )}
    </main>
  );
}
