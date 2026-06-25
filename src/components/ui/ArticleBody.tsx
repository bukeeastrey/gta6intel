// Renders article body text and converts embed markers into real YouTube players
// Pipeline marks embeds as: ---YOUTUBE_EMBED:videoId---
// This component finds those markers and renders the actual embed

import YouTubeEmbed from './YouTubeEmbed'

type Props = {
  body: string
}

export default function ArticleBody({ body }: Props) {
  // Split body on embed markers
  const EMBED_PATTERN = /---YOUTUBE_EMBED:([a-zA-Z0-9_-]+)---/g

  const parts: Array<{ type: 'text' | 'embed'; content: string }> = []
  let lastIndex = 0
  let match

  EMBED_PATTERN.lastIndex = 0
  while ((match = EMBED_PATTERN.exec(body)) !== null) {
    // Text before embed
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: body.slice(lastIndex, match.index).trim() })
    }
    // The embed itself
    parts.push({ type: 'embed', content: match[1] }) // match[1] = videoId
    lastIndex = match.index + match[0].length
  }

  // Remaining text after last embed
  if (lastIndex < body.length) {
    const remaining = body.slice(lastIndex).trim()
    if (remaining) parts.push({ type: 'text', content: remaining })
  }

  // If no embeds found, render as plain text
  if (parts.length === 0) {
    return (
      <div className="text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap">
        {body}
      </div>
    )
  }

  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === 'embed') {
          return <YouTubeEmbed key={i} videoId={part.content} />
        }
        return (
          <div key={i} className="text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap mb-4">
            {part.content}
          </div>
        )
      })}
    </div>
  )
}
