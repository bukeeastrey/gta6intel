// ════════════════════════════════════════════════════════════
// ArticleView — shared renderer for a full article OR guide.
// Used by /news/[slug] and /guides/[slug] so the layout, ad
// placement, and body parsing live in exactly one place.
//   • body rendered as plain-text paragraphs
//   • 336×280 rectangle ad after paragraph 3 (ad spec)
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ArticleFull } from '@/lib/articles';
import { longDate } from '@/lib/utils';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { AdSlot } from '@/components/ui/AdSlot';
import { RelatedLinks } from '@/components/article/RelatedLinks';
import styles from '@/styles/content.module.css';

// Render inline [text](url) links and **bold** inside a paragraph.
// Internal links (starting with "/") use client-side navigation; external ones
// open in a new tab. Plain text passes through untouched.
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const label = m[1];
      const url = m[2];
      parts.push(
        url.startsWith('/')
          ? <Link key={k++} href={url}>{label}</Link>
          : <a key={k++} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
      );
    } else if (m[3] !== undefined) {
      parts.push(<strong key={k++}>{m[3]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

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
              <p>{renderInline(p)}</p>
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

      {article.tags?.length > 0 && (
        <div className="tag-chips">
          <span className="tag-chips-h">Tags</span>
          <ul>
            {article.tags.map((t) => (
              <li key={t}><Link href={`/tags/${encodeURIComponent(t)}`}>{t}</Link></li>
            ))}
          </ul>
        </div>
      )}

      <RelatedLinks title={article.title} body={article.body} />
    </article>
  );
}
