// ════════════════════════════════════════════════════════════
// Domain types for the Supabase `articles` table.
// Adjust column names here if your schema differs — everything
// downstream reads from this single source of truth.
// ════════════════════════════════════════════════════════════

/**
 * Category union. The v9 design ships three visual styles
 * (confirmed / intel / analysis). The brief also references
 * rumor + leak — both are folded into the "intel" amber style.
 */
export type ArticleCategory =
  | 'confirmed'
  | 'intel'
  | 'analysis'
  | 'rumor'
  | 'leak';

/** A row from the `articles` table. */
export interface Article {
  id: string;
  slug: string;
  title: string;
  /** Short dek shown on expanded cards + hero. Nullable for compact cards. */
  summary: string | null;
  category: ArticleCategory;
  /** Attribution, e.g. "Rockstar Newswire", "IGN", "Tom Henderson". */
  source: string | null;
  /** Optional hero/card image. When null we fall back to a brand gradient. */
  image_url: string | null;
  /** Optional alt text for the image (SEO + a11y). */
  image_alt: string | null;
  /** Big stroked watchword behind a hero slide, e.g. "PRE ORDER". */
  ghost_text: string | null;
  /** Surfaces the article in the hero slider when true. */
  featured: boolean;
  /** ISO timestamp used for ordering + "2h ago" labels. */
  published_at: string;
}

/** Per-category visual config consumed by CategoryBadge + slide labels. */
export const CATEGORY_CONFIG: Record<
  ArticleCategory,
  { label: string; cardClass: string; slideClass: string }
> = {
  confirmed: { label: 'Confirmed', cardClass: 'cl-c', slideClass: 'lbl-c' },
  intel:     { label: 'Intel',     cardClass: 'cl-i', slideClass: 'lbl-i' },
  analysis:  { label: 'Analysis',  cardClass: 'cl-a', slideClass: 'lbl-a' },
  // rumor + leak reuse the amber "intel" treatment from the design system
  rumor:     { label: 'Rumor',     cardClass: 'cl-i', slideClass: 'lbl-i' },
  leak:      { label: 'Leak',      cardClass: 'cl-i', slideClass: 'lbl-i' },
};
