// ════════════════════════════════════════════════════════════
// ArticleCard — the masonry card from v9, now data-driven.
//   • variant="expanded" → image (or brand gradient) + summary
//   • variant="compact"  → label + title + footer only (padding-top)
// Uses next/image for real images (no CLS, lazy by default).
// When an article has no image we render the gradient placeholder
// block, preserving the editorial mix of the original design.
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import type { Article } from '@/lib/types';
import { timeAgo, gradientFor } from '@/lib/utils';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

interface ArticleCardProps {
  article: Article;
  variant?: 'compact' | 'expanded';
  /** Reveal-animation delay class index (1–9), matches v9 .d1–.d9. */
  delay?: number;
  /** Placeholder image height when there is no real image. */
  imageHeight?: number;
  /** Mark first cards as priority for LCP (above the fold). */
  priority?: boolean;
}

export function ArticleCard({
  article,
  variant = 'expanded',
  delay = 1,
  imageHeight = 190,
  priority = false,
}: ArticleCardProps) {
  const href = `/news/${article.slug}`;
  const showImage = variant === 'expanded';
  const showSummary = variant === 'expanded' && !!article.summary;
  const ghost = (article.ghost_text || article.title.slice(0, 14)).toUpperCase();

  return (
    <div className={`masonry-item rv d${delay}`}>
      <Link className="card" href={href}>
        {showImage && (
          <div className="card-img-wrap" style={{ height: imageHeight }}>
            {article.image_url ? (
              // External news-CDN images load directly (not via next/image),
              // so any source host works without an allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.image_url}
                alt={article.image_alt || article.title}
                loading={priority ? 'eager' : 'lazy'}
                className="next-img"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              // No image → brand gradient placeholder (keeps layout rhythm).
              <div
                className="card-img"
                style={{ background: gradientFor(article.id), height: imageHeight }}
              >
                {ghost}
              </div>
            )}
          </div>
        )}

        <div className="card-body" style={!showImage ? { paddingTop: 22 } : undefined}>
          <CategoryBadge category={article.category} />
          <div className="card-title">{article.title}</div>
          {showSummary && <div className="card-summary">{article.summary}</div>}
          <div className="card-footer">
            <span className="card-src">{article.source || 'GTA6Intel'}</span>
            <span className="card-time">{timeAgo(article.published_at)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
