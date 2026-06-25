import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'GTA6Intel.us — GTA 6 News, Guides & Intelligence',
    template: '%s | GTA6Intel.us'
  },
  description: 'The fastest, most accurate GTA 6 news hub. Confirmed updates, leak tracking, guides, and community intelligence — no filler.',
  keywords: ['GTA 6', 'GTA VI', 'Grand Theft Auto 6', 'GTA 6 release date', 'GTA 6 news', 'GTA 6 guides'],
  openGraph: {
    type: 'website',
    siteName: 'GTA6Intel.us',
    url: 'https://gta6intel.us',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@GTA6Intel',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body bg-bg text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
