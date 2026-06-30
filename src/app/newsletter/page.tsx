import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { NewsletterSignup } from '@/components/ui/HomeNewsletter';
import styles from '@/styles/content.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Get the latest GTA 6 intel delivered to your inbox — confirmed news, leaks, and analysis.',
  alternates: { canonical: `${SITE_URL}/newsletter` },
};

export default function NewsletterPage() {
  return (
    <LegalShell kicker="Newsletter" title="The Intel Drop">
      <p>
        Join thousands of GTA fans getting the week&apos;s most important GTA 6 intel — confirmed news,
        credible leaks, and sharp analysis — straight to your inbox. No spam, unsubscribe anytime.
      </p>
      <div className={styles.subscribeWrap}>
        <NewsletterSignup />
      </div>
    </LegalShell>
  );
}
