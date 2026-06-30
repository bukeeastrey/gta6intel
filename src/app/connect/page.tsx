import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'Connect Your Game',
  description: 'Personalized GTA 6 tracking and stats — coming at launch.',
  alternates: { canonical: `${SITE_URL}/connect` },
};

export default function ConnectPage() {
  return (
    <LegalShell kicker="Coming Soon" title="Connect Your Game">
      <p>
        Personalized GTA 6 tracking — link your profile for tailored intel, stats, and guides — is on the
        way and will go live around launch (<strong>November 19, 2026</strong>).
      </p>
      <p>
        Want early access? <a href="/newsletter">Join the newsletter</a> or{' '}
        <a href="https://discord.gg/G9m5w78N9" target="_blank" rel="noopener noreferrer">our Discord</a> and
        we&apos;ll let you know the moment it&apos;s ready.
      </p>
    </LegalShell>
  );
}
