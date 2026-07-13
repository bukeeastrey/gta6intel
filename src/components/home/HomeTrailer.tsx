// Homepage trailer hero — embeds the most recent official trailer (category
// 'trailer' in the videos table). Renders nothing if no trailer exists yet,
// so the homepage never shows an empty box.
import Link from 'next/link';
import type { Video } from '@/lib/videos';

export function HomeTrailer({ trailer }: { trailer: Video | null }) {
  if (!trailer) return null;
  return (
    <section className="ht-wrap" aria-labelledby="ht-title">
      <div className="section-header">
        <h2 className="section-title rl" id="ht-title">
          Latest <span>Trailer</span>
        </h2>
        <Link href="/gta-6-trailer" className="section-link rr">All trailers →</Link>
      </div>
      <div className="ht-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.youtube_id}`}
          title={trailer.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <p className="ht-cap">{trailer.title}</p>
    </section>
  );
}
