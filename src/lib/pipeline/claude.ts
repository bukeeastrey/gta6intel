// ════════════════════════════════════════════════════════════
// Claude writer — turns a source feed item into an ORIGINAL,
// attributed article, and drafts a tweet. Uses the Messages API.
//   • Article: Sonnet 4.6 (quality)
//   • Tweet:   Haiku 4.5 (fast/cheap)
// IMPORTANT: Claude must REWRITE in its own words (no copying),
// stay factual to the source, and label reliability correctly.
// ════════════════════════════════════════════════════════════
import Anthropic from '@anthropic-ai/sdk';
import type { FeedItem } from './sources';

// Lazy singleton — constructing eagerly would throw at build time
// when ANTHROPIC_API_KEY isn't present in the environment.
let _client: Anthropic | null = null;
function anthropicClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const ARTICLE_MODEL = process.env.PIPELINE_ARTICLE_MODEL || 'claude-sonnet-4-6';
const TWEET_MODEL = process.env.PIPELINE_TWEET_MODEL || 'claude-haiku-4-5';

const LABELS = ['CONFIRMED', 'RUMOR', 'LEAK', 'ANALYSIS'] as const;
const CATEGORIES = ['news', 'analysis', 'guide', 'roundup'] as const;

export interface GeneratedArticle {
  title: string;
  summary: string;
  body: string;
  label: (typeof LABELS)[number];
  category: (typeof CATEGORIES)[number];
}

// Pull the text out of a Messages API response.
function textOf(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

// Extract the first JSON object from a string (handles stray prose/fences).
function parseJsonObject(s: string): Record<string, unknown> | null {
  const cleaned = s.replace(/```json/gi, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const SYSTEM = `You are the senior news writer for GTA6Intel, an independent Grand Theft Auto VI news site. You receive a headline and snippet from a third-party source and write an ORIGINAL short news article about it.

RELEVANCE GATE (check first):
- If the item is NOT about Grand Theft Auto VI / GTA 6 / GTA Online / Rockstar's GTA franchise, respond with EXACTLY {"skip": true} and nothing else.

ACCURACY (non-negotiable):
- Rewrite entirely in your own words. NEVER copy sentences or phrasing from the source.
- Only state facts supported by the snippet. Do NOT invent details, dates, numbers, or quotes.
- Attribute reporting to the source by name in the body (e.g., "according to <source>").
- Choose the reliability label honestly: CONFIRMED = officially announced by Rockstar/Take-Two; RUMOR = unverified report; LEAK = leaked/unofficial material; ANALYSIS = opinion/breakdown.
- category is the content type: news, analysis, guide, or roundup.

VOICE (write like a sharp human editor, not an AI):
- Natural, confident, lightly enthusiastic - a real GTA fan who knows the beat. Vary sentence length and rhythm; use active voice.
- Lead with the actual news in the first sentence (inverted pyramid). No throat-clearing intros.
- Avoid these AI tells and cliches: "In a recent", "It's worth noting", "Moreover", "Furthermore", "In conclusion", "delve", "dive into", "in the world of", "buckle up", "game-changer", "boasts", and starting the piece with "Rockstar Games has". Don't lean on "reportedly" more than once.
- No hype-bait and no fake certainty. If it's a rumor, say so plainly.

SEO:
- title: specific and compelling, front-load the key subject, ~50-65 characters, and include "GTA 6" or "GTA VI" naturally. No "| GTA6Intel" suffix, no ALL CAPS, no clickbait.
- summary: a 150-160 character meta description in natural language that includes the main keyword and earns the click.
- body: 3-5 short paragraphs, ~250-400 words. Work the main keyword (GTA 6 / Grand Theft Auto VI) into the first paragraph naturally, and mention the specifics people search for (names, dates, platforms) where the snippet supports them. Never keyword-stuff. End on a concrete, forward-looking line - not a generic sign-off.

Respond with ONLY a JSON object, no preamble, no markdown fences:
{"title": "...", "summary": "...", "body": "...", "label": "RUMOR", "category": "news"}`;

export async function writeArticle(item: FeedItem): Promise<GeneratedArticle | 'SKIP' | null> {
  try {
    const msg = await anthropicClient().messages.create({
      model: ARTICLE_MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `SOURCE: ${item.sourceName}
HEADLINE: ${item.title}
SNIPPET: ${item.snippet || '(no snippet provided)'}
URL: ${item.link}`,
        },
      ],
    });

    const obj = parseJsonObject(textOf(msg));
    if (!obj) return null;
    if (obj.skip === true) return 'SKIP'; // not about GTA 6

    const label = LABELS.includes(obj.label as never) ? (obj.label as GeneratedArticle['label']) : 'RUMOR';
    const category = CATEGORIES.includes(obj.category as never)
      ? (obj.category as GeneratedArticle['category'])
      : 'news';
    const title = String(obj.title || item.title).slice(0, 200).trim();
    const summary = String(obj.summary || '').slice(0, 200).trim();
    const body = String(obj.body || '').trim();
    if (!title || !body) return null;

    return { title, summary, body, label, category };
  } catch (e) {
    console.error('[claude.writeArticle]', (e as Error).message);
    return null;
  }
}

export async function draftTweet(title: string, slug: string): Promise<string | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gta6intel-gg.com';
    const msg = await anthropicClient().messages.create({
      model: TWEET_MODEL,
      max_tokens: 200,
      system:
        'Write one natural, punchy tweet (max 230 chars before the link) for a GTA 6 news article. ' +
        'Sound like a real person who plays games, not a marketing bot. Add one relevant hashtag like #GTA6. ' +
        'No quotes around it, no emoji spam. Output ONLY the tweet text.',
      messages: [{ role: 'user', content: `Article title: ${title}` }],
    });
    const text = textOf(msg).trim().replace(/^["']|["']$/g, '');
    return `${text.slice(0, 230)} ${siteUrl}/news/${slug}`;
  } catch (e) {
    console.error('[claude.draftTweet]', (e as Error).message);
    return null;
  }
}
