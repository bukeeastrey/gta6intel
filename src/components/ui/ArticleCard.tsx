import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Article } from '@/lib/supabase'

type Props = {
  article: Article
  variant?: 'compact' | 'featured'
}

const labelColors: Record<string, string> = {
  CONFIRMED: 'label-CONFIRMED',
  RUMOR: 'label-RUMOR',
  LEAK: 'label-LEAK',
  ANALYSIS: 'label-ANALYSIS',
}

export default function ArticleCard({ article, variant = 'compact' }: Props) {
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently'

  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="card block group">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`label-badge ${labelColors[article.label] || ''}`}>
              {article.label}
            </span>
            <span className="font-mono text-xs text-text-muted">{article.category}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold leading-tight mb-3 group-hover:text-accent transition-colors">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>{article.source_name}</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    )
  }

  // Compact variant
  return (
    <Link href={`/news/${article.slug}`} className="card flex gap-3 p-3 sm:p-4 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`label-badge ${labelColors[article.label] || ''}`}>
            {article.label}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-tight group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs font-mono text-text-muted">
          <span>{article.source_name}</span>
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  )
}
