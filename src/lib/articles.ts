// ════════════════════════════════════════════════════════════
// Article queries — mapped to the LIVE Supabase schema.
//
// The DB table uses: source_name, label, is_published, body, etc.
// The UI expects an `Article`. This file is the single translation
// layer between the two. If the table changes, only this changes.
// ════════════════════════════════════════════════════════════
import { createSupabaseServerClient } from './supabaseServer';
import type { Article, ArticleCategory } from './types';

// Columns that exist in the `articles` table (list view).
const COLUMNS =
  'id, slug, title, summary, image_url, published_at, created_at, source_name, label';
// Extra columns only needed on the full article page.
const FULL_COLUMNS = `${COLUMNS}, body, source_url`;

const KNOWN: ArticleCategory[] = ['confirmed', 'analysis', 'rumor', 'leak', 'intel'];

// Maps a /news?category=… filter to the DB `label` value(s) it covers.
// "intel" is the design's umbrella for unverified reports (rumor + leak).
const FILTER_TO_LABELS: Record<string, string[]> = {
  confirmed: ['CONFIRMED'],
  analysis: ['ANALYSIS'],
  intel: ['RUMOR', 'LEAK'],
  rumor: ['RUMOR'],
  leak: ['LEAK'],
};

/** A full article incl. body + canonical source link (for /news/[slug]). */
export interface ArticleFull extends Article {
  body: string | null;
  source_url: string | null;
}

// ── Row → UI mappers ────────────────────────────────────────
function toArticle(r: Record<string, unknown>): Article {
  const label = String(r.label ?? '').toLowerCase();
  const category = (KNOWN.includes(label as ArticleCategory)
    ? (label as ArticleCategory)
    : 'intel');

  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    summary: (r.summary as string) ?? null,
    category,
    source: (r.source_name as string) ?? null,
    image_url: (r.image_url as string) ?? null,
    image_alt: null, // not stored → components fall back to the title
    ghost_text: null,
    featured: false,
    published_at: (r.published_at as string) ?? (r.created_at as string),
  };
}

function toArticleFull(r: Record<string, unknown>): ArticleFull {
  return {
    ...toArticle(r),
    body: (r.body as string) ?? null,
    source_url: (r.source_url as string) ?? null,
  };
}

// ── Homepage queries ────────────────────────────────────────
/** Hero slider items: newest published (no `featured` column yet). */
export async function getFeaturedArticles(limit = 4): Promise<Article[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[getFeaturedArticles]', error.message);
    return [];
  }
  return (data ?? []).map(toArticle);
}

/** "Latest Intel" grid: newest published articles. */
export async function getLatestArticles(limit = 9): Promise<Article[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[getLatestArticles]', error.message);
    return [];
  }
  return (data ?? []).map(toArticle);
}

// ── /news feed (filter + pagination) ────────────────────────
export interface ArticlesPage {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getArticlesPage(opts: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<ArticlesPage> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseServerClient();
  let q = supabase
    .from('articles')
    .select(COLUMNS, { count: 'exact' })
    .eq('is_published', true);

  const labels = opts.category
    ? FILTER_TO_LABELS[opts.category.toLowerCase()]
    : undefined;
  // Case-insensitive match: the DB may store labels as 'ANALYSIS',
  // 'Analysis', or 'analysis'. ilike (no wildcards) matches any case,
  // so the filters work regardless of how the pipeline saved them.
  if (labels && labels.length) {
    q = q.or(labels.map((l) => `label.ilike.${l}`).join(','));
  }

  const { data, error, count } = await q
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    console.error('[getArticlesPage]', error.message);
    return { articles: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    articles: (data ?? []).map(toArticle),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ── /news/[slug] article page ───────────────────────────────
export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select(FULL_COLUMNS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('[getArticleBySlug]', error.message);
    return null;
  }
  return data ? toArticleFull(data as Record<string, unknown>) : null;
}

/** Published slugs for static generation of article pages. */
export async function getPublishedSlugs(limit = 1000): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[getPublishedSlugs]', error.message);
    return [];
  }
  return (data ?? []).map((r) => String((r as { slug: unknown }).slug));
}

// ── /guides ─────────────────────────────────────────────────
/** Guide articles (content category = 'guide'), newest first. */
export async function getGuides(limit = 24): Promise<Article[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .eq('is_published', true)
    .eq('category', 'guide')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[getGuides]', error.message);
    return [];
  }
  return (data ?? []).map(toArticle);
}

// ── /search ─────────────────────────────────────────────────
/** Basic case-insensitive search over title + summary of published rows. */
export async function searchArticles(q: string, limit = 30): Promise<Article[]> {
  const term = q.trim().replace(/[,()%*]/g, ' ').trim();
  if (!term) return [];

  const supabase = createSupabaseServerClient();
  const like = `%${term}%`;
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .eq('is_published', true)
    .or(`title.ilike.${like},summary.ilike.${like}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[searchArticles]', error.message);
    return [];
  }
  return (data ?? []).map(toArticle);
}
