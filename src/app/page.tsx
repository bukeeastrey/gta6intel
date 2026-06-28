// ════════════════════════════════════════════════════════════
// Homepage (/) — Server Component.
//   • SSG + ISR: regenerated at most once per 60s (news freshness)
//   • Hero slider  ← featured articles from Supabase
//   • Latest Intel ← newest articles from Supabase
//   • Static: social strip, marquee band, post-launch grid
//   • Leaderboard ad below the hero (desktop), WebSite + ItemList JSON-LD
// ════════════════════════════════════════════════════════════
import Link from 'next/link';
import { getFeaturedArticles, getLatestArticles, getHotArticles } from '@/lib/articles';
import { getDatabaseCategories } from '@/lib/database';
import { HeroSlider } from '@/components/home/HeroSlider';
import { NewsGrid } from '@/components/home/NewsGrid';
import { CategoryTiles } from '@/components/database/CategoryTiles';
import { SocialFollow, BandMarquee, FutureSection } from '@/components/home/HomeSections';
import { AdSlot } from '@/components/ui/AdSlot';

// Incremental Static Regeneration — 60s revalidation per the brief.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export default async function HomePage() {
  // Fetch in parallel to keep TTFB low.
  const [featured, latest, hot, dbCategories] = await Promise.all([
    getFeaturedArticles(4),
    getLatestArticles(6), // trimmed: full list lives behind "View All"
    getHotArticles(3),
    getDatabaseCategories(),
  ]);

  // Structured data: site search + the latest-intel list.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'GTA6Intel',
        description: 'Independent GTA 6 news, guides and intelligence hub.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/news?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        itemListElement: latest.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/news/${a.slug}`,
          name: a.title,
        })),
      },
    ],
  };

  return (
    <>
      {/* JSON-LD for the homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <HeroSlider slides={featured} />

      {/* Leaderboard 728×90 — below header, desktop only (CLS-safe) */}
      <div className="ad-leaderboard-wrap">
        <AdSlot format="leaderboard" slot={process.env.NEXT_PUBLIC_ADSENSE_LEADERBOARD || ''} />
      </div>

      {/* SOCIAL STRIP + MARQUEE */}
      <SocialFollow />
      <BandMarquee />

      {/* GTA 6 DATABASE — image tiles + counts (evergreen reference hub) */}
      <div className="section-header">
        <h2 className="section-title rl">
          GTA 6 <span>Database</span>
        </h2>
        <Link href="/database" className="section-link rr">Explore All →</Link>
      </div>
      <div className="home-db-tiles">
        <CategoryTiles categories={dbCategories} />
      </div>

      {/* TRENDING / HOT — articles flagged in /admin (only shows if any) */}
      {hot.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title rl">
              🔥 Trending <span>Now</span>
            </h2>
          </div>
          <NewsGrid articles={hot} />
        </>
      )}

      {/* LATEST INTEL (trimmed — full feed behind View All) */}
      <div className="section-header">
        <h2 className="section-title rl">
          Latest <span>Intel</span>
        </h2>
        <Link href="/news" className="section-link rr">View All →</Link>
      </div>
      <NewsGrid articles={latest} />

      {/* POST-LAUNCH COVERAGE */}
      <FutureSection />
    </>
  );
}
