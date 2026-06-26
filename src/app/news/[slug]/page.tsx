// ════════════════════════════════════════════════════════════
// /news/[slug] — individual article page.
//   • SSG via generateStaticParams + ISR (revalidate 60s)
//   • Unique title/description, canonical, Open Graph, Twitter
//   • NewsArticle JSON-LD; rectangle ad after paragraph 3
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getPublishedSlugs } from '@/lib/articles';
import { CATEGORY_CONFIG } from '@/lib/types';
import { ArticleView } from '@/components/article/ArticleView';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel.com';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article not found — GTA6Intel' };

  const title = `${article.title} — GTA6Intel`;
  const description = article.summary ?? `${article.title}. The latest GTA 6 intel on GTA6Intel.`;
  const canonical = `${SITE_URL}/news/${article.slug}`;
  const images = article.image_url ? [{ url: article.image_url }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', publishedTime: article.published_at, images },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const labelText = CATEGORY_CONFIG[article.category]?.label ?? 'Intel';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary ?? undefined,
    image: article.image_url ? [article.image_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { '@type': 'Organization', name: article.source ?? 'GTA6Intel' },
    publisher: {
      '@type': 'Organization',
      name: 'GTA6Intel',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/news/${article.slug}` },
    articleSection: labelText,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView article={article} backHref="/news" backLabel="Back to News" />
    </main>
  );
}
