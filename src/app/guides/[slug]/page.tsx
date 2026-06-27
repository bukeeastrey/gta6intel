// ════════════════════════════════════════════════════════════
// /guides/[slug] — individual guide. Reuses ArticleView. A guide
// is an article row with content category 'guide'. SSG + ISR.
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/articles';
import { ArticleView } from '@/components/article/ArticleView';

export const revalidate = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getArticleBySlug(slug);
  if (!guide) return { title: 'Guide not found — GTA6Intel' };

  const title = `${guide.title} — GTA6Intel Guides`;
  const description = guide.summary ?? `${guide.title}. A GTA 6 guide from GTA6Intel.`;
  const canonical = `${SITE_URL}/guides/${guide.slug}`;
  const images = guide.image_url ? [{ url: guide.image_url }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', images },
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = await getArticleBySlug(slug);
  if (!guide) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.summary ?? undefined,
    image: guide.image_url ? [guide.image_url] : undefined,
    datePublished: guide.published_at,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView article={guide} backHref="/guides" backLabel="Back to Guides" />
    </main>
  );
}
