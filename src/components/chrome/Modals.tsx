'use client';
// ════════════════════════════════════════════════════════════
// Modals — AI assistant + newsletter subscribe overlays.
// (Login/account modals removed: no auth system yet. The "signup"
//  modal is now a real newsletter capture → POST /api/newsletter.)
// ════════════════════════════════════════════════════════════
import { useState } from 'react';
import { useUi } from './UiProvider';

const DISCORD_INVITE = 'https://discord.gg/G9m5w78N9';

const CHIPS = [
  'GTA 6 release date',
  'GTA 6 map size',
  'GTA 6 pre-order',
  'GTA 6 PC version',
  'Jason and Lucia GTA 6',
  'GTA 6 price',
] as const;

// Canned knowledge base (verbatim from v9), keyed by matched substring.
const ANSWERS: Record<string, string> = {
  'release date':
    'GTA VI launches on <strong>November 19, 2026</strong> for PS5 and Xbox Series X/S. A PC version has not been officially confirmed.',
  'map size':
    'The GTA VI map spans all of <strong>Leonida State</strong> — confirmed by Rockstar as the largest in series history. Vice City sits within the state as its major urban center.',
  'pre-order':
    'Pre-orders are open now. <strong>Standard Edition: $79.99</strong> · <strong>Premium Edition: $99.99</strong> — includes Leonida Pass and 3-day early access from November 16.',
  'pc version':
    '<strong>Not officially confirmed</strong> by Rockstar. Multiple sources suggest Q2 2027, approximately 6 months after the console launch.',
  characters:
    'GTA VI features <strong>Jason and Lucia</strong> as dual protagonists — the first time in the series. Both confirmed by Rockstar with official artwork.',
  price:
    "<strong>Standard: $79.99</strong> · <strong>Premium: $99.99</strong> · Collector's Edition pricing TBA. These are US prices — regional pricing varies.",
};

function Overlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`overlay${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-bar" />
        {children}
      </div>
    </div>
  );
}

export function Modals() {
  const { modal, closeModal } = useUi();

  // ── AI panel state ──
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  function runAi(raw?: string) {
    const q = (raw ?? query).trim();
    if (!q) return;
    setQuery(q);
    setThinking(true);
    setAnswer('Searching GTA6Intel database...');
    window.setTimeout(() => {
      const key = Object.keys(ANSWERS).find((k) => q.toLowerCase().includes(k));
      setThinking(false);
      setAnswer(
        key
          ? `<strong>GTA6Intel AI:</strong><br><br>${ANSWERS[key]}<br><br><small style="color:var(--ink-faint)">Source: GTA6Intel verified articles · <a href="/news" style="color:var(--orange)">Read full article →</a></small>`
          : `<strong>GTA6Intel AI:</strong><br><br>I found relevant articles on GTA6Intel for "<em>${q}</em>". Full AI launch coming when GTA 6 drops. <a href="/news" style="color:var(--orange)">Search all articles →</a>`
      );
    }, 800);
  }

  // ── Newsletter subscribe state ──
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'invalid'>('idle');

  async function subscribe() {
    if (subStatus === 'loading') return;
    // Validate the email before hitting the server so the user gets a
    // clear message instead of a generic failure.
    const clean = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setSubStatus('invalid');
      return;
    }
    setSubStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      setSubStatus(res.ok ? 'done' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setSubStatus('error');
    }
  }

  return (
    <>
      {/* ═══ AI MODAL ═══ */}
      <Overlay open={modal === 'ai'} onClose={closeModal}>
        <div className="modal-head">
          <div className="modal-title"><span className="ai-pill">AI</span>Ask GTA6Intel</div>
          <button className="modal-x" onClick={closeModal} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="chips">
            {CHIPS.map((c) => (
              <span className="chip" key={c} onClick={() => runAi(c)}>
                {c.replace(/^GTA 6 /, '').replace('Jason and Lucia GTA 6', 'Characters')}
              </span>
            ))}
          </div>
          <div className="ai-row">
            <input
              type="text"
              className="ai-inp"
              placeholder="Ask anything about GTA 6..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runAi()}
            />
            <button className="ai-go" onClick={() => runAi()}>Ask →</button>
          </div>
          {answer && (
            <div
              className="ai-resp show"
              dangerouslySetInnerHTML={{
                __html: thinking
                  ? '<em style="color:var(--ink-faint)">Searching GTA6Intel database...</em>'
                  : answer,
              }}
            />
          )}
          <div className="ai-note">
            ✨ Powered by Claude AI · Sourced from GTA6Intel articles · GTA6 AI launching as standalone app soon
          </div>
        </div>
      </Overlay>

      {/* ═══ NEWSLETTER SUBSCRIBE MODAL (key: 'signup') ═══ */}
      <Overlay open={modal === 'signup'} onClose={closeModal}>
        <div className="modal-head">
          <div className="modal-title">Join the Intel Drop</div>
          <button className="modal-x" onClick={closeModal} aria-label="Close">✕</button>
        </div>
        <div className="auth-body">
          {subStatus === 'done' ? (
            <p style={{ fontSize: 15, color: 'var(--confirmed)', fontWeight: 600, padding: '12px 0' }}>
              ✓ You&apos;re in. The next GTA 6 intel drop lands in your inbox.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 18 }}>
                Weekly GTA 6 intel — confirmed news, leaks, and analysis. No spam, unsubscribe anytime.
              </p>
              <label className="f-lbl">Email</label>
              <input
                type="email"
                className="f-inp"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (subStatus !== 'idle') setSubStatus('idle'); }}
                onKeyDown={(e) => e.key === 'Enter' && subscribe()}
              />
              {subStatus === 'invalid' && (
                <p style={{ fontSize: 13, color: '#c0392b', marginTop: 8 }}>
                  Please enter a valid email address (e.g. you@example.com).
                </p>
              )}
              {subStatus === 'error' && (
                <p style={{ fontSize: 13, color: '#c0392b', marginTop: 8 }}>
                  Something went wrong — please try again.
                </p>
              )}
              <button className="auth-submit" onClick={subscribe} disabled={subStatus === 'loading'}>
                {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
              <div className="auth-div">or join the community</div>
              <a
                className="auth-discord"
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <svg style={{ width: 16, height: 16, fill: 'white' }}><use href="#ico-dc" /></svg>
                Join our Discord
              </a>
            </>
          )}
        </div>
      </Overlay>
    </>
  );
}
