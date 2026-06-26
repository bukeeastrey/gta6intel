// ════════════════════════════════════════════════════════════
// ArticleView — shared renderer for a full article OR guide.
// Used by /news/[slug] and /guides/[slug] so the layout, ad
// placement, and body parsing live in exactly one place.
//   • body rendered as plain-text paragraphs
//   • 336×280 rectangle ad after paragraph 3 (ad spec)
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import type { ArticleFull } from '@/lib/articles';
import { longDate } from '@/lib/utils';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { AdSlot } from '@/components/ui/AdSlot';
import styles from '@/styles/content.module.css';

interface ArticleViewProps {
  article: ArticleFull;
  backHref: string;
  backLabel: string;
}

export function ArticleView({ article, backHref, backLabel }: ArticleViewProps) {
  // Split body into paragraphs (blank-line first, else single newlines).
  const raw = article.body?.trim() ?? '';
  const paragraphs = raw
    ? raw
        .split(/\n{2,}/)
        .flatMap((p) => (p.includes('\n') ? p.split(/\n/) : [p]))
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <article className={styles.article}>
      <Link href={backHref} className={styles.crumb}>
        ← {backLabel}
      </Link>

      <CategoryBadge category={article.category} />
      <h1 className={styles.title}>{article.title}</h1>

      <div className={styles.meta}>
        <span>{article.source || 'GTA6Intel'}</span>
        <span className={styles.metaDot}>·</span>
        <span>{longDate(article.published_at)}</span>
      </div>

      {article.image_url && (
        <div className={styles.heroImg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt={article.image_alt || article.title}
            className="next-img"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {article.summary && <p className={styles.summary}>{article.summary}</p>}

      <div className={styles.body}>
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <div key={i}>
              <p>{p}</p>
              {i === 2 && (
                <div className={styles.adWrap}>
                  <AdSlot format="rectangle" slot="0000000000" />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>{article.summary || 'Full report coming soon.'}</p>
        )}
      </div>

      {article.source_url && (
        <a
          className={styles.sourceLink}
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the original source →
        </a>
      )}
    </article>
  );
}
