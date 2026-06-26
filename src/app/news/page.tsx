// ════════════════════════════════════════════════════════════
// /news — paginated, category-filterable news feed.
// Server Component. ISR (revalidate 60s). Reuses the homepage
// masonry (NewsGrid) so the feed matches the v9 design exactly.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticlesPage } from '@/lib/articles';
import { NewsGrid } from '@/components/home/NewsGrid';
import styles from '@/styles/content.module.css';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel.com';
const PAGE_SIZE = 12;

// Category tabs. `value` is the ?category= param; undefined = All.
const FILTERS: { label: string; value?: string }[] = [
  { label: 'All' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Intel', value: 'intel' },
  { label: 'Analysis', value: 'analysis' },
];

// Next 16: searchParams is async and must be awaited.
type SP = Promise<{ category?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const active = FILTERS.find((f) => f.value === category);
  const label = active && active.value ? `${active.label} News` : 'Latest News';
  const title = `${label} — GTA6Intel`;
  const description =
    'Breaking GTA 6 news, confirmed details, leaks, rumors, and analysis — updated continuously.';
  const canonical = category ? `${SITE_URL}/news?category=${category}` : `${SITE_URL}/news`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

// Build a /news href that preserves the active category across pages.
function pageHref(category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/news?${qs}` : '/news';
}

export default async function NewsPage({ searchParams }: { searchParams: SP }) {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { articles, totalPages } = await getArticlesPage({
    category,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <main>
      {/* Section header (reuses v9 styles) */}
      <div className="section-header">
        <h2 className="section-title">
          {category ? <span>{category.toUpperCase()}</span> : <>Latest <span>Intel</span></>}
        </h2>
      </div>

      {/* Category tabs */}
      <nav className={styles.filters} aria-label="Filter by category">
        {FILTERS.map((f) => {
          const isActive = (f.value ?? undefined) === (category ?? undefined);
          return (
            <Link
              key={f.label}
              href={pageHref(f.value, 1)}
              className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {/* Feed */}
      {articles.length > 0 ? (
        <NewsGrid articles={articles} />
      ) : (
        <p className={styles.empty}>No articles here yet — check back soon.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <Link
            href={pageHref(category, page - 1)}
            className={`${styles.pageLink} ${page <= 1 ? styles.pageDisabled : ''}`}
            aria-label="Previous page"
          >
            ←
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
            n === page ? (
              <span key={n} className={styles.pageCurrent} aria-current="page">
                {n}
              </span>
            ) : (
              <Link key={n} href={pageHref(category, n)} className={styles.pageLink}>
                {n}
              </Link>
            )
          )}

          <Link
            href={pageHref(category, page + 1)}
            className={`${styles.pageLink} ${page >= totalPages ? styles.pageDisabled : ''}`}
            aria-label="Next page"
          >
            →
          </Link>
        </nav>
      )}
    </main>
  );
}
