import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Cookie Policy — GTA6Intel',
  description: 'How GTA6Intel uses cookies, including advertising cookies from Google.',
  alternates: { canonical: `${SITE_URL}/cookies` },
};

export default function CookiesPage() {
  return (
    <LegalShell kicker="Legal" title="Cookie Policy" updated="June 26, 2026">
      <p>
        This Cookie Policy explains how <strong>GTA6Intel</strong> uses cookies and similar technologies
        on <strong>gta6intel-gg.com</strong>. For more on how we handle data, see our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the site
        function, remember preferences, and understand how it&apos;s used.
      </p>

      <h2>Types we use</h2>
      <ul>
        <li><strong>Essential</strong> — required for the Site to work (e.g. page rendering, security).</li>
        <li><strong>Analytics</strong> — help us measure traffic and improve content.</li>
        <li><strong>Advertising</strong> — used by Google and partners to show relevant ads.</li>
      </ul>

      <h2>Advertising cookies (Google)</h2>
      <p>
        Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on your
        prior visits to this and other websites. You can opt out of personalized advertising via{' '}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{' '}
        or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
      </p>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies in their settings. Blocking some cookies may affect
        how the Site works.
      </p>
    </LegalShell>
  );
}
