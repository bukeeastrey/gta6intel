// ════════════════════════════════════════════════════════════
// Data layer for the GTA 6 Database feature (database_entries).
// One JSONB-backed table serves every category (characters,
// vehicles, locations, …). Attributes carry per-field labels
// (confirmed / rumor / leak) — our credibility edge.
// ════════════════════════════════════════════════════════════
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export type DbStatus = 'confirmed' | 'rumor' | 'leak' | null;

export interface DbAttr {
  label: string;
  value: string;
  status?: DbStatus;
  href?: string;
}
export interface DbRelated {
  name: string;
  slug: string;
  category: string;
}
export interface DbEntry {
  id: string;
  slug: string;
  category: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  summary: string | null;
  body: string | null;
  attributes: DbAttr[];
  related: DbRelated[];
  popular: boolean;
  votes_up: number;
  votes_down: number;
}
export interface DbCategoryMeta {
  key: string;
  label: string;
  emoji: string;
  blurb: string;
  count: number;
  cover: string | null;
}

// Display order + metadata for every supported category.
export const DB_CATEGORIES: Omit<DbCategoryMeta, 'count' | 'cover'>[] = [
  { key: 'characters', label: 'Characters', emoji: '🎭', blurb: 'Protagonists, rivals and the whole Leonida cast.' },
  { key: 'vehicles',   label: 'Vehicles',   emoji: '🚗', blurb: 'Cars, bikes, boats and aircraft of Vice City.' },
  { key: 'locations',  label: 'Locations',  emoji: '📍', blurb: 'Cities, neighborhoods and landmarks across Leonida.' },
  { key: 'weapons',    label: 'Weapons',    emoji: '🔫', blurb: 'The confirmed GTA 6 arsenal.' },
  { key: 'animals',    label: 'Animals',    emoji: '🐊', blurb: 'The wildlife of the Leonida swamps and coast.' },
  { key: 'businesses', label: 'Businesses', emoji: '🏢', blurb: 'Shops, fronts and money-making operations.' },
  { key: 'activities', label: 'Activities', emoji: '🎣', blurb: 'Things to do — from fishing to heists.' },
  { key: 'music',      label: 'Radio & Music', emoji: '📻', blurb: 'Confirmed soundtrack and radio stations.' },
];

export function categoryMeta(key: string) {
  return DB_CATEGORIES.find((c) => c.key === key) ?? null;
}

const COLS =
  'id, slug, category, name, subtitle, image_url, summary, body, attributes, related, popular, votes_up, votes_down';

function toEntry(r: Record<string, unknown>): DbEntry {
  return {
    id: String(r.id),
    slug: String(r.slug),
    category: String(r.category),
    name: String(r.name),
    subtitle: (r.subtitle as string) ?? null,
    image_url: (r.image_url as string) ?? null,
    summary: (r.summary as string) ?? null,
    body: (r.body as string) ?? null,
    attributes: Array.isArray(r.attributes) ? (r.attributes as DbAttr[]) : [],
    related: Array.isArray(r.related) ? (r.related as DbRelated[]) : [],
    popular: Boolean(r.popular),
    votes_up: Number(r.votes_up ?? 0),
    votes_down: Number(r.votes_down ?? 0),
  };
}

/** Category hub: every category with its live entry count + a cover image. */
export async function getDatabaseCategories(): Promise<DbCategoryMeta[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('database_entries')
    .select('category, image_url, popular')
    .eq('is_published', true);
  const counts: Record<string, number> = {};
  const covers: Record<string, string> = {};
  if (!error && data) {
    for (const row of data) {
      counts[row.category] = (counts[row.category] ?? 0) + 1;
      // Prefer a popular entry's image as the cover; else first available.
      if (row.image_url && (!covers[row.category] || row.popular)) covers[row.category] = row.image_url as string;
    }
  }
  return DB_CATEGORIES.map((c) => ({ ...c, count: counts[c.key] ?? 0, cover: covers[c.key] ?? null }));
}

/** All entries in a category (newest-feeling: popular first, then name). */
export async function getEntriesByCategory(category: string): Promise<DbEntry[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('database_entries')
    .select(COLS)
    .eq('is_published', true)
    .eq('category', category)
    .order('popular', { ascending: false })
    .order('name', { ascending: true });
  if (error) {
    console.error('[getEntriesByCategory]', error.message);
    return [];
  }
  return (data ?? []).map(toEntry);
}

/** One entry by category + slug. */
export async function getEntry(category: string, slug: string): Promise<DbEntry | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('database_entries')
    .select(COLS)
    .eq('is_published', true)
    .eq('category', category)
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return toEntry(data);
}

/** For generateStaticParams across all entries. */
export async function getAllEntryParams(): Promise<{ category: string; slug: string }[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('database_entries')
    .select('category, slug')
    .eq('is_published', true);
  if (error || !data) return [];
  return data.map((r) => ({ category: r.category, slug: r.slug }));
}
