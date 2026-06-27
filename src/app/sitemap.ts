// app/sitemap.ts → served at /sitemap.xml
import type { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

// Regenerate the sitemap hourly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();

  // Pull article slugs (+ optional guide slugs) for dynamic entries.
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5000);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/news`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/videos`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/newsletter`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/advertise`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
