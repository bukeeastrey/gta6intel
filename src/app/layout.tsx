// ════════════════════════════════════════════════════════════
// Root layout — fonts, global SEO defaults, and site chrome.
// All shared UI (nav, mobile menu, modals, ticker, footer, AI fab)
// lives here inside <UiProvider> so every route gets it consistently.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import { UiProvider } from '@/components/chrome/UiProvider';
import { SvgDefs } from '@/components/chrome/SvgDefs';
import { Navbar } from '@/components/chrome/Navbar';
import { MobileMenu } from '@/components/chrome/MobileMenu';
import { Modals } from '@/components/chrome/Modals';
import { Ticker } from '@/components/chrome/Ticker';
import { Footer } from '@/components/chrome/Footer';
import { AiFab } from '@/components/chrome/AiFab';
import { ScrollReveal } from '@/components/chrome/ScrollReveal';

// Inter as a CSS variable → consumed by globals.css (--font-stack-inter).
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

// Set these in Vercel once you have them (safe to be absent):
//   NEXT_PUBLIC_ADSENSE_CLIENT     e.g. "ca-pub-1234567890123456"
//   NEXT_PUBLIC_GOOGLE_VERIFICATION  the code from Search Console
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GTA6Intel — GTA 6 News, Guides & Intelligence',
    template: '%s · GTA6Intel',
  },
  description:
    'The independent GTA 6 intelligence hub. Confirmed news, leaks, analysis, ' +
    'a live launch countdown, and post-launch guides for Grand Theft Auto VI.',
  applicationName: 'GTA6Intel',
  keywords: ['GTA 6', 'GTA VI', 'Grand Theft Auto VI', 'Leonida', 'Vice City', 'Rockstar'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'GTA6Intel',
    url: SITE_URL,
    title: 'GTA6Intel — GTA 6 News, Guides & Intelligence',
    description:
      'Confirmed news, leaks, analysis, a live launch countdown, and guides for GTA 6.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gta6intel_gg',
    title: 'GTA6Intel — GTA 6 News, Guides & Intelligence',
    description: 'Confirmed news, leaks, analysis, and a live launch countdown for GTA 6.',
  },
  robots: { index: true, follow: true },
  // Search Console ownership (set NEXT_PUBLIC_GOOGLE_VERIFICATION in Vercel).
  ...(GOOGLE_VERIFICATION ? { verification: { google: GOOGLE_VERIFICATION } } : {}),
  // Helps AdSense associate the site with your account.
  ...(ADSENSE_CLIENT ? { other: { 'google-adsense-account': ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Google AdSense loader — only loads once you set the client ID. */}
        {ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
        <UiProvider>
          {/* Reusable icon sprite (used by nav/footer/socials) */}
          <SvgDefs />

          {/* Fixed chrome */}
          <Navbar />
          <MobileMenu />

          {/* Page content */}
          {children}

          {/* Site-wide footer + fixed overlays */}
          <Footer />
          <Ticker />
          <AiFab />

          {/* Modals + scroll-reveal observer */}
          <Modals />
          <ScrollReveal />
        </UiProvider>
      </body>
    </html>
  );
}
