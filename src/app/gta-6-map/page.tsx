import type { Metadata } from 'next';
import Link from 'next/link';
import { LeonidaMap } from '@/components/home/LeonidaMap';
import { getEntriesByCategory } from '@/lib/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

export const metadata: Metadata = {
  title: 'GTA 6 Map — Explore the State of Leonida',
  description:
    'An interactive GTA 6 map of the State of Leonida: Vice City, the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia and Mount Kalaga. Confirmed regions, clearly labeled.',
  alternates: { canonical: `${SITE_URL}/gta-6-map` },
};

const REGION_COPY: { name: string; text: string }[] = [
  { name: 'Vice City', text: 'The returning, neon-soaked centrepiece on the southeast coast — inspired by Miami, bigger than ever.' },
  { name: 'Leonida Keys', text: 'A southern island chain linked by long bridges, where Jason and Lucia begin the story. Think the Florida Keys.' },
  { name: 'Grassrivers', text: 'Vast Everglades-style wetlands — airboats, mangroves, alligators and off-grid communities.' },
  { name: 'Port Gellhorn', text: 'A gritty industrial port town on the western Gulf coast, built on shipping and smuggling.' },
  { name: 'Ambrosia', text: 'Rural, industrial heartland beside Lake Leonida — refineries, farmland and outlaw bikers.' },
  { name: 'Mount Kalaga', text: 'Rugged northern highlands and national park — forests, canyons and off-road country.' },
];

export default async function MapPage() {
  const SLUG_TO_REGION: Record<string, string> = {
    'vice-city': 'vicecity', 'mount-kalaga': 'kalaga', 'mount-kalaga-national-park': 'kalaga',
    'port-gellhorn': 'gellhorn', 'ambrosia': 'ambrosia', 'grassrivers': 'grassrivers',
    'leonida-keys': 'keys', 'lake-leonida': 'lake',
  };
  const mapMedia: Record<string, string[]> = {};
  try {
    const locs = await getEntriesByCategory('locations');
    for (const e of locs) {
      const rid = SLUG_TO_REGION[e.slug];
      if (!rid) continue;
      const imgs = [e.image_url, ...(e.gallery || [])].filter(Boolean) as string[];
      if (imgs.length) mapMedia[rid] = imgs;
    }
  } catch { /* optional */ }

  return (
    <main className="pillar-wrap">
      <div className="pillar-hero">
        <span className="pillar-kicker">The Map</span>
        <h1 className="pillar-h1">The GTA 6 <span>Map</span></h1>
        <p className="pillar-lead">
          GTA 6 is set in the state of <strong>Leonida</strong> — a modern take on Florida, anchored by Vice City.
          Explore the confirmed regions on the interactive map below.
        </p>
      </div>

      <LeonidaMap media={mapMedia} />

      <section className="pillar-section">
        <h2 className="pillar-h2">The regions of Leonida</h2>
        <div className="pillar-regions">
          {REGION_COPY.map((r) => (
            <div className="pillar-region" key={r.name}>
              <h3>{r.name}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
        <p className="pillar-body">
          Rockstar has not released an official, full-resolution map yet, so exact borders and the complete road network
          aren&rsquo;t confirmed. We&rsquo;ll add the official map here the moment it exists — until then, the interactive map above
          is a community-informed guide, clearly labeled speculative.
        </p>
        <div className="pillar-ctas">
          <Link href="/database/locations" className="pillar-cta">Browse all locations →</Link>
          <Link href="/gta-6-release-date" className="pillar-cta pillar-cta-ghost">Release date & countdown →</Link>
        </div>
      </section>
    </main>
  );
}
