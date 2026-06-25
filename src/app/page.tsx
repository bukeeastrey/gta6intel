import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import ArticleCard from '@/components/ui/ArticleCard'
import Countdown from '@/components/ui/Countdown'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import type { Article } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'GTA6Intel.us — GTA 6 News, Guides & Intelligence',
  description: 'The fastest GTA 6 news hub. Confirmed updates, leak tracking, and guides — no filler.',
}

export const revalidate = 60 // Revalidate page every 60 seconds

async function getLatestArticles(): Promise<Article[]> {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(13)

  return data || []
}

export default async function HomePage() {
  const articles = await getLatestArticles()
  const [featured, ...rest] = articles

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Top grid: Featured + Countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Featured article */}
          <div className="lg:col-span-2">
            {featured ? (
              <ArticleCard article={featured} variant="featured" />
            ) : (
              <div className="card p-6 text-center text-text-muted font-mono text-sm">
                Pipeline initializing — first articles arriving shortly...
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Countdown />
            <NewsletterSignup />
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-display text-2xl tracking-widest text-text-primary">
            LATEST INTEL
          </h2>
          <div className="flex-1 h-px bg-border" />
          <a
            href="/news"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            View all →
          </a>
        </div>

        {/* News grid */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-3 bg-border rounded w-16 mb-3" />
                <div className="h-4 bg-border rounded w-full mb-2" />
                <div className="h-4 bg-border rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-display text-lg tracking-widest">
              <span className="text-accent">GTA6</span>INTEL<span className="text-text-muted">.US</span>
            </div>
            <p className="font-mono text-xs text-text-muted text-center sm:text-right max-w-md">
              GTA6Intel.us is an independent fan site. Not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto is a trademark of Take-Two Interactive.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 justify-center sm:justify-start">
            <a href="/news" className="font-mono text-xs text-text-muted hover:text-accent">News</a>
            <a href="/guides" className="font-mono text-xs text-text-muted hover:text-accent">Guides</a>
            <a href="/privacy" className="font-mono text-xs text-text-muted hover:text-accent">Privacy</a>
            <a href="/terms" className="font-mono text-xs text-text-muted hover:text-accent">Terms</a>
          </div>
        </div>
      </footer>
    </>
  )
}
