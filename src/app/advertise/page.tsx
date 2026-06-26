import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import styles from '@/styles/content.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Advertise — GTA6Intel',
  description: 'Reach a highly engaged GTA 6 audience. Advertising and partnership opportunities on GTA6Intel.',
  alternates: { canonical: `${SITE_URL}/advertise` },
};

export default function AdvertisePage() {
  return (
    <LegalShell kicker="Partnerships" title="Advertise with GTA6Intel">
      <p>
        GTA6Intel reaches a focused, highly engaged audience following one of the most anticipated game
        launches in history. If you want to put your brand in front of GTA 6 fans, let&apos;s talk.
      </p>

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <h3>Display advertising</h3>
          <p>Leaderboard, in-article, and sticky units across high-traffic news and guide pages.</p>
        </div>
        <div className={styles.card}>
          <h3>Sponsored content</h3>
          <p>Clearly labeled sponsored articles and newsletter placements that respect our readers.</p>
        </div>
        <div className={styles.card}>
          <h3>Newsletter</h3>
          <p>Dedicated or inline placements in our subscriber email drops.</p>
        </div>
        <div className={styles.card}>
          <h3>Social &amp; video</h3>
          <p>Integrations across our X, YouTube, and Discord community channels.</p>
        </div>
      </div>

      <h2>Get in touch</h2>
      <p>
        Email <a href="mailto:gta6intel404@gmail.com">gta6intel404@gmail.com</a> with your goals and we&apos;ll
        send current traffic and placement options.
      </p>
    </LegalShell>
  );
}
