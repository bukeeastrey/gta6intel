// Renders a YouTube video embed inside article pages
// The pipeline marks embed locations with: ---YOUTUBE_EMBED:videoId---

type Props = {
  videoId: string
  title?: string
}

export default function YouTubeEmbed({ videoId, title }: Props) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border bg-surface">
      {/* 16:9 aspect ratio wrapper */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title || 'GTA 6 Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="px-3 py-2 border-t border-border flex items-center gap-2">
        <svg className="w-4 h-4 text-leak shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
          <path fill="#080810" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span className="font-mono text-xs text-text-muted">Official Rockstar Games</span>
        <a
          href={`https://youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto font-mono text-xs text-accent hover:underline"
        >
          Watch on YouTube →
        </a>
      </div>
    </div>
  )
}
