import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import ArticleBody from '@/components/ui/ArticleBody'

type Props = { params: { slug: string } }

async function getArticle(slug: string) {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.summary || article.title,
    openGraph: {
      title: article.title,
      description: article.summary || '',
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
  }
}

const labelColors: Record<string, string> = {
  CONFIRMED: 'label-CONFIRMED',
  RUMOR: 'label-RUMOR',
  LEAK: 'label-LEAK',
  ANALYSIS: 'label-ANALYSIS',
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : 'Recently'

  // JSON-LD schema for SEO
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'GTA6Intel.us',
      url: 'https://gta6intel.us'
    },
    url: `https://gta6intel.us/news/${article.slug}`
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-text-muted mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-accent">News</Link>
          <span>/</span>
          <span className="truncate">{article.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`label-badge ${labelColors[article.label] || ''}`}>
              {article.label}
            </span>
            <span className="font-mono text-xs text-text-muted">{article.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-text-muted pb-4 border-b border-border">
            <span>GTA6Intel Editorial</span>
            <span>·</span>
            <span>{publishedDate}</span>
            {article.source_name && (
              <>
                <span>·</span>
                <span>Via {article.source_name}</span>
              </>
            )}
          </div>
        </header>

        {/* Article body — auto-renders YouTube embeds where present */}
        <article className="prose prose-invert prose-sm max-w-none">
          <ArticleBody body={article.body || ''} />
        </article>

        {/* Source link */}
        {article.source_url && (
          <div className="mt-8 p-4 bg-surface border border-border rounded-lg">
            <p className="font-mono text-xs text-text-muted mb-2">ORIGINAL SOURCE</p>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline break-all"
            >
              {article.source_url}
            </a>
          </div>
        )}

        {/* Affiliate disclosure */}
        <p className="mt-8 text-xs text-text-muted font-mono border-t border-border pt-4">
          GTA6Intel.us is an independent fan site. Not affiliated with Rockstar Games or Take-Two Interactive.
          This site may contain affiliate links. We may earn a commission from qualifying purchases at no extra cost to you.
        </p>

        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 mt-6 font-mono text-xs text-text-muted hover:text-accent transition-colors"
        >
          ← Back to all news
        </Link>

      </main>
    </>
  )
}
