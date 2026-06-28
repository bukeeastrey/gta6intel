// ════════════════════════════════════════════════════════════
// /database — the GTA 6 Database hub. Grid of categories with
// live entry counts. Evergreen, high-intent SEO landing page.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { getDatabaseCategories } from '@/lib/database';
import { CategoryTiles } from '@/components/database/CategoryTiles';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 Database — Characters, Vehicles, Locations & More | GTA6Intel',
  description:
    'The complete GTA 6 database. Browse every confirmed character, vehicle, location, weapon and more — each detail clearly labeled Confirmed, Rumor or Leak.',
  alternates: { canonical: `${SITE_URL}/database` },
  openGraph: {
    title: 'GTA 6 Database — GTA6Intel',
    description: 'Every confirmed GTA 6 character, vehicle, location and more — clearly labeled.',
    url: `${SITE_URL}/database`,
    type: 'website',
  },
};

export default async function DatabaseHub() {
  const categories = await getDatabaseCategories();

  return (
    <main className="db-wrap">
      <div className="db-head">
        <span className="db-kicker">— COMMUNITY RESEARCH</span>
        <h1 className="db-h1">GTA 6 <span className="orange">Database</span></h1>
      </div>

      <CategoryTiles categories={categories} />
    </main>
  );
}
