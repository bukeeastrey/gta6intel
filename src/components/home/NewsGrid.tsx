// ════════════════════════════════════════════════════════════
// NewsGrid — responsive CSS-columns masonry (3 → 2 → 1).
// Recreates the v9 rhythm: cards with images alternate with compact
// text cards. Real data decides the image; we also force a couple of
// compact cards so a feed full of images still breathes.
// ════════════════════════════════════════════════════════════
import type { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

// Heights mirror the staggered min-heights in the original masonry.
const IMG_HEIGHTS = [190, 230, 160, 145, 200, 175];

// Positions that render as compact (no image) regardless of data,
// to preserve the editorial "text card" beats from v9.
const COMPACT_BEATS = new Set([1, 3, 5, 6, 8]);

export function NewsGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="masonry-wrap">
      <div className="masonry">
        {articles.map((article, i) => {
          const hasImage = !!article.image_url;
          // Expanded if it has a real image; otherwise alternate beats.
          const variant: 'compact' | 'expanded' =
            hasImage || !COMPACT_BEATS.has(i) ? 'expanded' : 'compact';
          return (
            <ArticleCard
              key={article.id}
              article={article}
              variant={variant}
              delay={(i % 9) + 1}
              imageHeight={IMG_HEIGHTS[i % IMG_HEIGHTS.length]}
              priority={i < 3}
            />
          );
        })}
      </div>
    </div>
  );
}
