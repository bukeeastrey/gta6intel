// ════════════════════════════════════════════════════════════
// /database/[category]/[slug] — individual entry page.
//   • SSG (generateStaticParams) + ISR
//   • Labeled attribute box (Confirmed/Rumor/Leak per field) — our edge
//   • Bio, related entries, community voting, JSON-LD schema
// ════════════════════════════════════════════════════════════
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntry, getAllEntryParams, categoryMeta, type DbAttr } from '@/lib/database';
import { VoteBox } from '@/components/database/VoteBox';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';
type Params = Promise<{ category: string; slug: string }>;

export async function generateStaticParams() {
  return await getAllEntryParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, slug } = await params;
  const entry = await getEntry(category, slug);
  if (!entry) return { title: 'Not found — GTA6Intel' };
  const meta = categoryMeta(category);
  const title = `${entry.name}${entry.subtitle ? ` — ${entry.subtitle}` : ''} | GTA 6 ${meta?.label ?? 'Database'} | GTA6Intel`;
  const description = entry.summary ?? `${entry.name} in GTA 6. ${entry.subtitle ?? ''}`.trim();
  const canonical = `${SITE_URL}/database/${category}/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'profile',
      images: entry.image_url ? [{ url: entry.image_url }] : undefined,
    },
  };
}

function StatusTag({ status }: { status: DbAttr['status'] }) {
  if (!status) return null;
  return <span className={`db-attr-st st-${status}`}>{status.toUpperCase()}</span>;
}

export default async function EntryPage({ params }: { params: Params }) {
  const { category, slug } = await params;
  const entry = await getEntry(category, slug);
  if (!entry) notFound();
  const meta = categoryMeta(category);

  // JSON-LD: Person for characters, generic Thing otherwise.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': category === 'characters' ? 'Person' : 'Thing',
    name: entry.name,
    description: entry.summary ?? undefined,
    image: entry.image_url ?? undefined,
    url: `${SITE_URL}/database/${category}/${slug}`,
  };

  return (
    <main className="db-wrap db-entry">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="db-entry-head">
        <Link href={`/database/${category}`} className="db-back">← {meta?.label.toUpperCase() ?? 'DATABASE'}</Link>
        <div className="db-entry-titlerow">
          <h1 className="db-h1">{entry.name}</h1>
          <VoteBox id={entry.id} up={entry.votes_up} down={entry.votes_down} />
        </div>
        {entry.subtitle && <div className="db-entry-sub">{entry.subtitle}</div>}
      </div>

      <div className="db-entry-grid">
        {/* Left: portrait + bio */}
        <div className="db-entry-main">
          <div className="db-entry-img" style={entry.image_url ? { backgroundImage: `url(${entry.image_url})` } : undefined}>
            {!entry.image_url && <span className="db-card-ph big">{entry.name.charAt(0)}</span>}
          </div>
          {entry.body && (
            <div className="db-entry-body">
              {entry.body.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right: labeled attribute box — the credibility differentiator */}
        <aside className="db-attr-box">
          {entry.attributes.map((a, i) => (
            <div key={i} className="db-attr">
              <span className="db-attr-label">{a.label}</span>
              <span className="db-attr-value">
                {a.href ? <Link href={a.href} className="db-attr-link">{a.value}</Link> : a.value}
                <StatusTag status={a.status} />
              </span>
            </div>
          ))}
        </aside>
      </div>

      {/* Related entries */}
      {entry.related.length > 0 && (
        <div className="db-related">
          <h2 className="db-related-h">Related</h2>
          <div className="db-related-row">
            {entry.related.map((r) => (
              <Link key={r.slug} href={`/database/${r.category}/${r.slug}`} className="db-related-card">
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="db-entry-foot">
        <Link href={`/database/${category}`} className="db-back">← Back to all {meta?.label.toLowerCase()}</Link>
      </div>
    </main>
  );
}
