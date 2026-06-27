// ════════════════════════════════════════════════════════════
// /guides — guide hub. Lists articles with content category
// 'guide' (post-launch how-tos, walkthroughs). ISR 60s.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { getGuides } from '@/lib/articles';
import { NewsGrid } from '@/components/home/NewsGrid';
import styles from '@/styles/content.module.css';

export const revalidate = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 Guides — Walkthroughs, Tips & How-Tos — GTA6Intel',
  description:
    'In-depth GTA 6 guides: walkthroughs, money methods, map secrets, and tips. Updated as the game launches.',
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: 'GTA 6 Guides — GTA6Intel',
    description: 'Walkthroughs, tips, and how-tos for GTA 6.',
    url: `${SITE_URL}/guides`,
    type: 'website',
  },
};

export default async function GuidesPage() {
  const guides = await getGuides(24);

  return (
    <main>
      <header className={styles.head}>
        <div className={styles.kicker}>GTA6Intel</div>
        <h1 className={styles.h1}>
          GTA VI <span>Guides</span>
        </h1>
        <p className={styles.sub}>
          Walkthroughs, money methods, and map secrets. Guides go live as the game launches —
          subscribe to get them first.
        </p>
      </header>

      {guides.length > 0 ? (
        <NewsGrid articles={guides} />
      ) : (
        <p className={styles.empty}>
          No guides published yet. They drop at launch (Nov 19, 2026) — check back soon.
        </p>
      )}
    </main>
  );
}
