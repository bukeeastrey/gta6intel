import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gta6intel.us'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  // Dynamic article pages
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(500)

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages]
}
