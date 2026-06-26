import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Terms of Use — GTA6Intel',
  description: 'The terms governing your use of GTA6Intel (gta6intel-gg.com).',
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <LegalShell kicker="Legal" title="Terms of Use" updated="June 26, 2026">
      <p>
        These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of <strong>gta6intel-gg.com</strong>
        (the &ldquo;Site&rdquo;), operated by GTA6Intel. By using the Site, you agree to these Terms. If you do not
        agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may use the Site for personal, non-commercial purposes. You agree not to misuse the Site,
        including by attempting to disrupt it, scrape it at scale, or access it through automated means
        without permission, or to use it for any unlawful purpose.
      </p>

      <h2>Content &amp; intellectual property</h2>
      <p>
        Original text and design on the Site are owned by GTA6Intel. News reporting may reference or
        summarize third-party sources, which remain the property of their respective owners and are used
        for commentary and informational purposes. &ldquo;Grand Theft Auto&rdquo; and related marks are trademarks
        of Take-Two Interactive Software, Inc. GTA6Intel is not affiliated with Rockstar Games or Take-Two.
      </p>

      <h2>Accuracy &amp; &ldquo;as is&rdquo; disclaimer</h2>
      <p>
        The Site covers rumors, leaks, and unconfirmed reports, which we label accordingly. Information
        is provided <strong>&ldquo;as is&rdquo; without warranties of any kind</strong>. We do not guarantee that any
        content is accurate, complete, or current, and nothing here is official information from Rockstar
        Games or Take-Two.
      </p>

      <h2>External links</h2>
      <p>
        The Site links to third-party websites we do not control. We are not responsible for their
        content, policies, or practices.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, GTA6Intel shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the Site.
      </p>

      <h2>Changes</h2>
      <p>
        We may revise these Terms at any time. Continued use of the Site after changes constitutes
        acceptance of the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Visit the <a href="/contact">Contact</a> page.
      </p>
    </LegalShell>
  );
}
