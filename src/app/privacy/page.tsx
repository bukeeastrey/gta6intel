import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How GTA6Intel collects, uses, and protects your information, including cookies and advertising.',
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalShell kicker="Legal" title="Privacy Policy" updated="June 26, 2026">
      <p>
        This Privacy Policy explains how <strong>GTA6Intel</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
        uses, and safeguards information when you visit <strong>gta6intel-gg.com</strong> (the &ldquo;Site&rdquo;).
        By using the Site, you agree to this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Email address</strong> — only if you subscribe to our newsletter. Used to send updates; you can unsubscribe anytime.</li>
        <li><strong>Usage data</strong> — pages visited, device/browser type, and approximate location, collected automatically via cookies and analytics.</li>
        <li><strong>Server logs</strong> — standard technical logs (IP address, timestamps) kept for security and diagnostics.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain, and improve the Site.</li>
        <li>To send newsletter emails you requested.</li>
        <li>To measure traffic and understand what content is useful.</li>
        <li>To display advertising that helps keep the Site free.</li>
      </ul>

      <h2>Cookies and advertising</h2>
      <p>
        We use cookies to run the Site and to serve ads. <strong>Third-party vendors, including Google,
        use cookies to serve ads based on your prior visits to this and other websites.</strong> Google&apos;s
        use of advertising cookies enables it and its partners to serve ads to you based on your visits
        to our Site and/or other sites on the Internet.
      </p>
      <ul>
        <li>
          You may opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
        </li>
        <li>
          You can opt out of some third-party vendors&apos; use of cookies for personalized advertising at{' '}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
        </li>
        <li>
          Learn how Google uses data at{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            policies.google.com/technologies/partner-sites
          </a>.
        </li>
      </ul>
      <p>
        See our <a href="/cookies">Cookie Policy</a> for more detail. You can disable cookies in your
        browser settings, though parts of the Site may not work as intended.
      </p>

      <h2>Third-party services</h2>
      <p>
        We rely on trusted providers to run the Site, including <strong>Supabase</strong> (database/hosting
        of content and subscriber emails), <strong>Vercel</strong> (site hosting), and <strong>Google AdSense</strong>
        (advertising). These providers process data under their own privacy policies.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location (including under GDPR and CCPA), you may have the right to access,
        correct, or delete your personal data, or to opt out of certain processing. To exercise these
        rights, contact us via the <a href="/contact">Contact</a> page.
      </p>

      <h2>Children</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly collect their data.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. Material changes will be reflected by the &ldquo;Last updated&rdquo; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href="mailto:gta6intel404@gmail.com">gta6intel404@gmail.com</a>{' '}
        or use the <a href="/contact">Contact</a> page.
      </p>
    </LegalShell>
  );
}
