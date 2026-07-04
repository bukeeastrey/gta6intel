'use client';
// /admin/broadcast — compose and send an email to all active subscribers.
// Password-gated with the same ADMIN_PASSWORD (x-admin-password header),
// stored in sessionStorage like the rest of /admin.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

const PW_KEY = 'gi_admin_pw';

export default function BroadcastPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [test, setTest] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const insertImg = (url: string) =>
    setHtml((h) => `${h}\n<img src="${url}" alt="" style="max-width:100%;border-radius:8px" />\n`);

  const insertByUrl = () => {
    const url = prompt('Image URL:');
    if (url && url.trim()) insertImg(url.trim());
  };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setMsg('Uploading image…');
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-password': pw }, body: fd });
      const d = await res.json();
      if (res.ok && d.url) { insertImg(d.url); setMsg('Image inserted into the body.'); }
      else setMsg(d.error || 'Upload failed.');
    } catch { setMsg('Upload failed.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function sendDigest() {
    if (!confirm('Send the digest of recent articles to all subscribers now?')) return;
    setBusy(true);
    setMsg('Building & sending digest…');
    try {
      const res = await fetch('/api/cron/digest', { method: 'POST', headers: { 'x-admin-password': pw } });
      const d = await res.json();
      if (!res.ok) setMsg(d.error || 'Digest failed.');
      else if (d.articles === 0) setMsg('No new articles in the last few days — nothing sent.');
      else setMsg(`Digest sent — ${d.articles} article(s) to ${d.sent} subscriber(s).`);
    } catch { setMsg('Digest failed.'); }
    finally { setBusy(false); }
  }

  const load = useCallback(async (p: string) => {
    try {
      const res = await fetch('/api/admin/broadcast', { headers: { 'x-admin-password': p } });
      if (res.ok) {
        const d = await res.json();
        setCount(d.count);
        setAuthed(true);
        sessionStorage.setItem(PW_KEY, p);
        setMsg('');
      } else {
        setMsg('Wrong password.');
      }
    } catch {
      setMsg('Could not reach the server.');
    }
  }, []);

  useEffect(() => {
    const p = sessionStorage.getItem(PW_KEY);
    if (p) { setPw(p); load(p); }
  }, [load]);

  async function send(isTest: boolean) {
    if (!subject.trim() || !html.trim()) { setMsg('Subject and body are required.'); return; }
    if (isTest && !test.trim()) { setMsg('Enter a test address first.'); return; }
    if (!isTest && !confirm(`Send this to ${count ?? 0} subscriber(s)? This can't be undone.`)) return;
    setBusy(true);
    setMsg(isTest ? 'Sending test…' : 'Sending broadcast…');
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ subject, html, test: isTest ? test.trim() : undefined }),
      });
      const d = await res.json();
      if (!res.ok) setMsg(d.error || 'Failed to send.');
      else if (d.error) setMsg(`Error: ${d.error}`);
      else if (isTest) setMsg(`Test sent — ${d.sent} ok, ${d.failed} failed.`);
      else setMsg(`Broadcast complete — ${d.sent} sent, ${d.failed} failed.`);
    } catch {
      setMsg('Failed to send.');
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <main style={S.wrap}>
        <h1 style={S.h1}>Email Broadcast</h1>
        <input style={S.input} type="password" placeholder="Admin password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(pw)} />
        <button style={S.btn} onClick={() => load(pw)}>Enter</button>
        {msg && <p style={S.msg}>{msg}</p>}
      </main>
    );
  }

  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Email Broadcast</h1>
      <p style={S.sub}>{count} active subscriber{count === 1 ? '' : 's'}. An unsubscribe footer is added to every email automatically.</p>
      <input style={S.input} placeholder="Subject line" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea style={{ ...S.input, minHeight: 240, fontFamily: 'monospace', resize: 'vertical' }}
        placeholder="HTML body — e.g. <h2>This week in GTA 6</h2><p>...</p>" value={html} onChange={(e) => setHtml(e.target.value)} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <button style={S.btnGhost} disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <button style={S.btnGhost} onClick={insertByUrl}>Insert image URL</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
        <span style={{ fontSize: 12, color: '#888' }}>Images are appended as &lt;img&gt; to the body.</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
        <input style={{ ...S.input, flex: 1, minWidth: 200, marginBottom: 0 }} placeholder="you@example.com (send a test)"
          value={test} onChange={(e) => setTest(e.target.value)} />
        <button style={S.btnGhost} disabled={busy} onClick={() => send(true)}>Send test</button>
        <button style={S.btn} disabled={busy} onClick={() => send(false)}>Send to all</button>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #eee' }}>
        <button style={S.btnGhost} disabled={busy} onClick={sendDigest}>Send digest of recent articles now</button>
        <p style={{ fontSize: 12, color: '#888', margin: '8px 0 0' }}>
          Auto-builds an email from the last few days of articles and sends it to all subscribers. Also runs on a schedule if you set one up (see docs).
        </p>
      </div>
      {msg && <p style={S.msg}>{msg}</p>}
    </main>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { maxWidth: 720, margin: '40px auto', padding: '0 20px', color: '#0F0F0F' },
  h1: { fontSize: 26, fontWeight: 900, margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, margin: '0 0 18px' },
  input: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 10, fontSize: 15 },
  btn: { background: '#FF5C00', color: '#fff', border: 'none', borderRadius: 100, padding: '11px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' },
  btnGhost: { background: '#fff', color: '#0F0F0F', border: '1px solid #ddd', borderRadius: 100, padding: '11px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  msg: { marginTop: 14, fontSize: 14, color: '#0F0F0F' },
};
