import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'About GTA6Intel — Independent GTA 6 News & Intelligence',
  description:
    'GTA6Intel is an independent intelligence hub tracking confirmed news, leaks, rumors, and analysis for Grand Theft Auto VI.',
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <LegalShell kicker="About" title="About GTA6Intel">
      <p>
        <strong>GTA6Intel</strong> is an independent intelligence hub dedicated to one thing:
        tracking everything about <strong>Grand Theft Auto VI</strong> and presenting it clearly,
        quickly, and honestly. We gather confirmed announcements, credible leaks, community rumors,
        and expert analysis, then label each by reliability so you always know what you&apos;re reading.
      </p>

      <h2>What we cover</h2>
      <ul>
        <li><strong>Confirmed</strong> — official details from Rockstar Games and verified channels.</li>
        <li><strong>Intel</strong> — credible leaks and reports from established industry sources.</li>
        <li><strong>Analysis</strong> — context, breakdowns, and what the news actually means.</li>
        <li><strong>Guides &amp; Videos</strong> — walkthroughs and curated video coverage at and after launch.</li>
      </ul>

      <h2>How our content is produced</h2>
      <p>
        In the interest of transparency: GTA6Intel uses automated tooling, including AI, to monitor
        reputable gaming news sources and help summarize developments at speed. Every article links
        to or names its original source where applicable, and we aim to add value through clear
        labeling and context rather than republishing others&apos; work verbatim. Corrections are
        welcome — see <a href="/contact">Contact</a>.
      </p>

      <h2>Independence &amp; affiliation</h2>
      <p>
        GTA6Intel is a fan-run site. We are <strong>not affiliated with, endorsed by, or connected to
        Rockstar Games or Take-Two Interactive</strong>. &ldquo;Grand Theft Auto&rdquo; and &ldquo;GTA&rdquo; are
        trademarks of Take-Two Interactive Software, Inc. All trademarks belong to their respective owners.
      </p>

      <h2>Get in touch</h2>
      <p>
        Tips, corrections, partnerships, or feedback: visit <a href="/contact">Contact</a> or join our{' '}
        <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer">Discord</a>.
      </p>
    </LegalShell>
  );
}
