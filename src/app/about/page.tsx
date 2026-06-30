import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  // `absolute` stops the layout title template from appending the brand twice.
  title: { absolute: 'About GTA6Intel — Independent GTA 6 News, Database & Analysis' },
  description:
    'GTA6Intel is an independent Grand Theft Auto VI hub: confirmed news, a source-checked GTA 6 database, and analysis — every claim labeled by reliability ahead of the November 19, 2026 launch.',
  alternates: { canonical: `${SITE_URL}/about` },
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GTA6Intel',
  url: SITE_URL,
  description:
    'Independent Grand Theft Auto VI news, a source-checked database, and analysis — every claim labeled confirmed, rumor, or leak.',
  founder: { '@type': 'Person', name: 'Bukee' },
  sameAs: ['https://discord.gg/G9m5w78N9'],
};

export default function AboutPage() {
  return (
    <LegalShell kicker="About" title="About GTA6Intel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

      <p>
        <strong>GTA6Intel</strong> is an independent hub for everything <strong>Grand Theft Auto VI</strong> —
        confirmed news, a growing, source-checked reference database, and clear-eyed analysis. The plan is
        simple: track every real development on the road to the <strong>November 19, 2026</strong> launch and
        present it honestly, so you never have to guess whether what you&apos;re reading is fact or hype.
      </p>

      <h2>Why we exist</h2>
      <p>
        The build-up to a new <em>Grand Theft Auto</em> is a firehose — official drops, credible leaks, wild
        rumors, and a lot of noise in between. Most of it arrives with no label telling you how much to trust it.
        We do that labeling. Whether it&apos;s Jason and Lucia, the state of Leonida, a new vehicle, or a release
        detail, we tell you exactly how solid the source is before you read a word of the story.
      </p>

      <h2>What you&apos;ll find here</h2>
      <ul>
        <li><strong><a href="/news">News</a></strong> — every story tagged <strong>Confirmed</strong> (official from Rockstar), <strong>Intel</strong> (credible reporting and leaks), or <strong>Analysis</strong> (context and what it actually means).</li>
        <li><strong><a href="/database">The GTA 6 Database</a></strong> — a structured reference for characters, vehicles, locations, weapons, businesses, wildlife, activities, and the soundtrack. Each entry carries its own status, so a confirmed fact never sits next to a rumor without you knowing.</li>
        <li><strong><a href="/videos">Videos</a></strong> and <strong><a href="/guides">Guides</a></strong> — trailers, breakdowns, and walkthroughs at launch and beyond.</li>
        <li>A live launch <strong>countdown</strong>, a <strong><a href="/newsletter">newsletter</a></strong>, and a place to watch GTA streams live.</li>
      </ul>

      <h2>Our one rule: accuracy over hype</h2>
      <p>
        We don&apos;t fabricate details and we don&apos;t pad our counts to look bigger than we are. If Rockstar
        has named twelve characters, you&apos;ll find twelve — not a padded list stuffed with leaks and fan
        guesses. When something is rumored, it&apos;s tagged as a rumor. When it&apos;s confirmed, we&apos;ll
        point you to the source. That discipline is the whole reason GTA6Intel exists.
      </p>

      <h2>How our content is produced</h2>
      <p>
        GTA6Intel pairs human editorial judgment with automated tooling — including AI — to monitor reputable
        gaming sources and summarize developments quickly. Every article names or links its original source
        where applicable, and we add value through clear labeling and context rather than republishing anyone
        else&apos;s work word-for-word. Spot something wrong? Tell us — corrections are genuinely welcome via{' '}
        <a href="/contact">Contact</a>.
      </p>

      <h2>Who runs it</h2>
      <p>
        GTA6Intel is founded and edited by <strong>Bukee</strong> and run as an independent, fan-built project —
        not a Rockstar mouthpiece, not a content farm. Just a place built by someone who wanted GTA 6 information
        that&apos;s fast, organized, and honest.
      </p>

      <h2>Independence &amp; affiliation</h2>
      <p>
        GTA6Intel is a fan-run site. We are <strong>not affiliated with, endorsed by, or connected to Rockstar
        Games or Take-Two Interactive</strong>. &ldquo;Grand Theft Auto&rdquo; and &ldquo;GTA&rdquo; are trademarks
        of Take-Two Interactive Software, Inc. All trademarks belong to their respective owners.
      </p>

      <h2>Get in touch</h2>
      <p>
        Tips, corrections, partnerships, or feedback: head to <a href="/contact">Contact</a>, subscribe to the{' '}
        <a href="/newsletter">newsletter</a>, or join the{' '}
        <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer">Discord</a>.
      </p>
    </LegalShell>
  );
}
