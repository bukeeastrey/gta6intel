import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import ArticleCard from '@/components/ui/ArticleCard'
import type { Article } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'GTA 6 News — Latest Updates, Confirmed & Leaks',
  description: 'All GTA 6 news in one place. Confirmed updates, rumors, leaks, and analysis — labeled and sourced.',
}

export const revalidate = 60

type Props = {
  searchParams: { label?: string; page?: string }
}

async function getArticles(label?: string, page = 1): Promise<{ articles: Article[]; total: number }> {
  const limit = 24
  const from = (page - 1) * limit

  let query = supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1)

  if (label) query = query.eq('label', label)

  const { data, count } = await query
  return { articles: data || [], total: count || 0 }
}

const filters = [
  { label: 'All', value: undefined },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rumor', value: 'RUMOR' },
  { label: 'Leak', value: 'LEAK' },
  { label: 'Analysis', value: 'ANALYSIS' },
]

export default async function NewsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { articles, total } = await getArticles(searchParams.label, page)

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl tracking-widest">ALL INTEL</h1>
          <span className="font-mono text-xs text-text-muted">{total} articles</span>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map(f => {
            const isActive = searchParams.label === f.value || (!searchParams.label && !f.value)
            return (
              <a
                key={f.label}
                href={f.value ? `/news?label=${f.value}` : '/news'}
                className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                  isActive
                    ? 'bg-accent text-black border-accent'
                    : 'border-border text-text-muted hover:border-border2 hover:text-text-primary'
                }`}
              >
                {f.label}
              </a>
            )
          })}
        </div>

        {/* Articles grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted font-mono text-sm">
            No articles yet. Pipeline is running — check back soon.
          </div>
        )}

      </main>
    </>
  )
}
