'use client';
// ════════════════════════════════════════════════════════════
// NewsletterSignup — email capture row (v9 .nl-row styling).
// Posts to /api/newsletter; shows an inline confirmation on success.
// Swap the endpoint for your provider (Beehiiv/ConvertKit/etc).
// ════════════════════════════════════════════════════════════
import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function subscribe() {
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="nl-row" aria-live="polite">
        <span style={{ fontSize: 12, color: 'var(--confirmed)', fontWeight: 600 }}>
          ✓ You&apos;re in — check your inbox for a welcome email.
        </span>
      </div>
    );
  }

  return (
    <div className="nl-row">
      <input
        type="email"
        placeholder="your@email.com"
        className="nl-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && subscribe()}
        aria-label="Email address"
      />
      <button className="nl-btn" onClick={subscribe} disabled={status === 'loading'}>
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
    </div>
  );
}
