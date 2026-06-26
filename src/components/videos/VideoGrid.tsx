'use client';
// ════════════════════════════════════════════════════════════
// VideoGrid — responsive grid of YouTube videos. The iframe is
// only mounted on click (lazy), so the page stays fast (good LCP).
// Thumbnails use a plain lazy <img> (external YouTube host) inside
// a fixed 16:9 box, so there's no layout shift (CLS-safe).
// ════════════════════════════════════════════════════════════
import { useState } from 'react';
import type { Video } from '@/lib/videos';
import { longDate } from '@/lib/utils';
import styles from '@/styles/content.module.css';

export function VideoGrid({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className={styles.videoGrid}>
      {videos.map((v) => {
        const thumb =
          v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
        const playing = active === v.id;

        return (
          <div
            key={v.id}
            className={styles.videoCard}
            onClick={() => !playing && setActive(v.id)}
          >
            {playing ? (
              <div className={styles.videoFrame}>
                <iframe
                  src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=1`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={styles.videoThumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={v.title}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className={styles.playBadge}>
                  <span>▶</span>
                </div>
              </div>
            )}
            <div className={styles.videoBody}>
              <div className={styles.videoTitle}>{v.title}</div>
              {v.published_at && <div className={styles.videoDate}>{longDate(v.published_at)}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
