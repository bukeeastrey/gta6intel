// ════════════════════════════════════════════════════════════
// CategoryBadge — the typographic label used on cards (a coloured
// dash + uppercase word). Variants come from CATEGORY_CONFIG so the
// mapping (confirmed/intel/analysis/rumor/leak) lives in one place.
// ════════════════════════════════════════════════════════════
import { CATEGORY_CONFIG, type ArticleCategory } from '@/lib/types';

export function CategoryBadge({ category }: { category: ArticleCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.intel;
  return <div className={`card-lbl ${cfg.cardClass}`}>{cfg.label}</div>;
}
