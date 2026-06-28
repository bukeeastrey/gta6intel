// ════════════════════════════════════════════════════════════
// /database/[category] — listing page for one category.
// SSR + ISR; unique SEO; renders the client browser for
// search/filter/sort.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntriesByCategory, categoryMeta, DB_CATEGORIES } from '@/lib/database';
import { CategoryBrowser } from '@/components/database/CategoryBrowser';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';
type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return DB_CATEGORIES.map((c) => ({ category: c.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryMeta(category);
  if (!meta) return { title: 'Database — GTA6Intel' };
  const title = `GTA 6 ${meta.label} — Full Database | GTA6Intel`;
  const description = `Every GTA 6 ${meta.label.toLowerCase()} in one place. ${meta.blurb} Each detail labeled Confirmed, Rumor or Leak.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/database/${category}` },
    openGraph: { title, description, url: `${SITE_URL}/database/${category}`, type: 'website' },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const meta = categoryMeta(category);
  if (!meta) notFound();

  const entries = await getEntriesByCategory(category);

  return (
    <main className="db-wrap">
      <div className="db-head">
        <Link href="/database" className="db-back">← DATABASE</Link>
        <h1 className="db-h1">GTA 6 <span className="orange">{meta.label}</span></h1>
        <p className="db-lead">{meta.blurb}</p>
      </div>
      <CategoryBrowser entries={entries} categoryKey={category} />
    </main>
  );
}
