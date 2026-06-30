import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import styles from '@/styles/content.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with GTA6Intel: tips, corrections, partnerships, and support.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <LegalShell kicker="Contact" title="Get in touch">
      <p>
        Have a tip, a correction, or a partnership idea? We&apos;d love to hear from you. The fastest way
        to reach us and the community is Discord.
      </p>

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <h3>📨 General &amp; tips</h3>
          <p><a href="mailto:gta6intel404@gmail.com">gta6intel404@gmail.com</a></p>
        </div>
        <div className={styles.card}>
          <h3>📢 Advertising</h3>
          <p><a href="mailto:gta6intel404@gmail.com">gta6intel404@gmail.com</a></p>
        </div>
        <div className={styles.card}>
          <h3>⚖️ Privacy &amp; legal</h3>
          <p><a href="mailto:gta6intel404@gmail.com">gta6intel404@gmail.com</a></p>
        </div>
        <div className={styles.card}>
          <h3>💬 Community</h3>
          <p>
            <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer">Join our Discord</a>{' '}
            · <a href="https://x.com/gta6intel_gg" target="_blank" rel="noopener noreferrer">X / Twitter</a>
          </p>
        </div>
      </div>

      <p>
        For corrections to a specific article, please include the article link so we can review it quickly.
      </p>
    </LegalShell>
  );
}
