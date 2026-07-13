import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticlesByTag } from '@/lib/articles';
import { NewsGrid } from '@/components/home/NewsGrid';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

type P = Promise<{ tag: string }>;
const pretty = (t: string) => t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { tag } = await params;
  const t = decodeURIComponent(tag);
  return {
    title: `${pretty(t)} — GTA 6 News & Updates`,
    description: `Every GTA6Intel story tagged ${pretty(t)} — confirmed news, credible leaks and analysis, clearly labeled.`,
    alternates: { canonical: `${SITE_URL}/tags/${encodeURIComponent(t)}` },
  };
}

export default async function TagPage({ params }: { params: P }) {
  const { tag } = await params;
  const t = decodeURIComponent(tag).toLowerCase();
  const articles = await getArticlesByTag(t);
  if (articles.length === 0) notFound();

  return (
    <main className="pillar-wrap">
      <div className="pillar-hero">
        <span className="pillar-kicker">Tag</span>
        <h1 className="pillar-h1">{pretty(t)}</h1>
        <p className="pillar-lead">
          {articles.length} {articles.length === 1 ? 'story' : 'stories'} tagged &ldquo;{t}&rdquo;.
        </p>
      </div>
      <NewsGrid articles={articles} />
      <div className="pillar-ctas" style={{ marginTop: 28 }}>
        <Link href="/news" className="pillar-cta">All GTA 6 news →</Link>
        <Link href="/database" className="pillar-cta pillar-cta-ghost">Browse the database →</Link>
      </div>
    </main>
  );
}
