// Image-tile category grid (like the competitor's): big cover image,
// category name + entry count overlaid. Used on /database and the homepage.
import Link from 'next/link';
import type { DbCategoryMeta } from '@/lib/database';

export function CategoryTiles({ categories }: { categories: DbCategoryMeta[] }) {
  return (
    <div className="db-tiles">
      {categories.map((c) => (
        <Link key={c.key} href={`/database/${c.key}`} className="db-tile">
          <div
            className="db-tile-img"
            style={c.cover ? { backgroundImage: `url(${c.cover})` } : undefined}
          >
            {!c.cover && <span className="db-tile-emoji">{c.emoji}</span>}
            <div className="db-tile-overlay" />
            <div className="db-tile-foot">
              <span className="db-tile-name">{c.label}</span>
              {c.count > 0 && <span className="db-tile-count">{c.count}</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
