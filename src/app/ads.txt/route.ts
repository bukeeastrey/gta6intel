// ════════════════════════════════════════════════════════════
// GET /ads.txt — AdSense requires this file to authorize Google
// to sell your ad inventory. Auto-built from your publisher ID.
// Returns a harmless placeholder until NEXT_PUBLIC_ADSENSE_CLIENT
// is set in Vercel.
// ════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-123...
  const headers = { 'content-type': 'text/plain; charset=utf-8' };

  if (!client) {
    return new Response('# ads.txt — set NEXT_PUBLIC_ADSENSE_CLIENT to activate\n', { headers });
  }
  const pub = client.replace(/^ca-/, ''); // ca-pub-123 → pub-123
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, { headers });
}
