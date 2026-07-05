// ════════════════════════════════════════════════════════════
// /videos — YouTube video hub, pulled from the `videos` table.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { getVideos } from '@/lib/videos';
import { VideoTabs } from '@/components/videos/VideoTabs';
import styles from '@/styles/content.module.css';

export const revalidate = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 Videos — Trailers, Breakdowns & Analysis',
  description: 'Watch the latest GTA 6 trailers, frame-by-frame breakdowns, and video analysis.',
  alternates: { canonical: `${SITE_URL}/videos` },
  openGraph: {
    title: 'GTA 6 Videos — GTA6Intel',
    description: 'Trailers, breakdowns, and analysis for GTA 6.',
    url: `${SITE_URL}/videos`,
    type: 'website',
  },
};

export default async function VideosPage() {
  const videos = await getVideos(48);

  return (
    <main>
      <header className={styles.head}>
        <div className={styles.kicker}>GTA6Intel</div>
        <h1 className={styles.h1}>
          GTA VI <span>Videos</span>
        </h1>
        <p className={styles.sub}>
          Trailers, frame-by-frame breakdowns, and the analysis worth your time. Tap any video to play.
        </p>
      </header>

      {videos.length > 0 ? (
        <VideoTabs videos={videos} />
      ) : (
        <p className={styles.empty}>No videos yet — the pipeline adds them automatically. Check back soon.</p>
      )}
    </main>
  );
}
