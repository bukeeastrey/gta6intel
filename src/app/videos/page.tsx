import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import YouTubeEmbed from '@/components/ui/YouTubeEmbed'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'GTA 6 Videos — Official Trailers & Footage',
  description: 'Watch all official GTA 6 trailers, gameplay footage, and Rockstar announcements in one place.',
}

export const revalidate = 300 // Revalidate every 5 minutes

async function getVideoArticles() {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('source_name', 'Rockstar Games (Official)')
    .ilike('body', '%YOUTUBE_EMBED%')
    .order('published_at', { ascending: false })
    .limit(20)

  return data || []
}

// Extract videoId from article body
function extractVideoId(body: string): string | null {
  const match = body.match(/---YOUTUBE_EMBED:([a-zA-Z0-9_-]+)---/)
  return match ? match[1] : null
}

export default async function VideosPage() {
  const articles = await getVideoArticles()

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-4 mb-8">
          <h1 className="font-display text-3xl tracking-widest">OFFICIAL VIDEOS</h1>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-xs text-text-muted">
            Auto-updated when Rockstar posts
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-display text-4xl text-text-muted mb-4">STANDBY</div>
            <p className="font-mono text-sm text-text-muted">
              Monitoring Rockstar&apos;s channel. Videos appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {articles.map(article => {
              const videoId = extractVideoId(article.body || '')
              if (!videoId) return null

              return (
                <div key={article.id} className="card overflow-visible">
                  <YouTubeEmbed videoId={videoId} title={article.title} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="label-badge label-CONFIRMED">CONFIRMED</span>
                      <span className="font-mono text-xs text-text-muted">
                        {article.published_at
                          ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                          : 'Recently'}
                      </span>
                    </div>
                    <Link
                      href={`/news/${article.slug}`}
                      className="font-semibold text-sm hover:text-accent transition-colors line-clamp-2"
                    >
                      {article.title}
                    </Link>
                    {article.summary && (
                      <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>
    </>
  )
}
