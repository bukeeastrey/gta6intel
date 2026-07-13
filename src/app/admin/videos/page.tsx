'use client';
// /admin/videos — add official Rockstar videos by pasting a YouTube link,
// retag anything (Trailer / Video / Live), or delete it.
import { useCallback, useEffect, useState, type CSSProperties } from 'react';

const PW_KEY = 'gi_admin_pw';
const CATS = ['trailer', 'video', 'stream'] as const;

type Row = {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string | null;
  category: string;
  channel_title: string | null;
};

export default function AdminVideosPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState<string>('trailer');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (p: string) => {
    try {
      const res = await fetch('/api/admin/videos', { headers: { 'x-admin-password': p } });
      if (!res.ok) { setMsg('Wrong password.'); return; }
      const d = await res.json();
      setRows(d.videos ?? []);
      setAuthed(true);
      sessionStorage.setItem(PW_KEY, p);
      setMsg('');
    } catch { setMsg('Could not reach the server.'); }
  }, []);

  useEffect(() => {
    const p = sessionStorage.getItem(PW_KEY);
    if (p) { setPw(p); load(p); }
  }, [load]);

  async function add() {
    if (!url.trim()) { setMsg('Paste a YouTube link first.'); return; }
    setBusy(true); setMsg('Adding…');
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ url: url.trim(), category: cat }),
      });
      const d = await res.json();
      if (!res.ok) setMsg(d.error || 'Failed to add.');
      else {
        const warn = cat === 'trailer' && d.channel_title && d.channel_title !== 'Rockstar Games'
          ? ` ⚠️ Heads up: this is from "${d.channel_title}", not Rockstar Games.`
          : '';
        setMsg(`Added: ${d.title}.${warn}`);
        setUrl('');
        await load(pw);
      }
    } catch { setMsg('Failed to add.'); }
    finally { setBusy(false); }
  }

  async function retag(id: string, category: string) {
    setRows((r) => r.map((v) => (v.id === id ? { ...v, category } : v)));
    await fetch('/api/admin/videos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: JSON.stringify({ id, category }),
    });
  }

  async function remove(id: string) {
    if (!confirm('Delete this video?')) return;
    await fetch('/api/admin/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: JSON.stringify({ id }),
    });
    setRows((r) => r.filter((v) => v.id !== id));
  }

  if (!authed) {
    return (
      <main style={S.wrap}>
        <h1 style={S.h1}>Videos</h1>
        <input style={S.input} type="password" placeholder="Admin password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(pw)} />
        <button style={S.btn} onClick={() => load(pw)}>Enter</button>
        {msg && <p style={S.msg}>{msg}</p>}
      </main>
    );
  }

  const trailers = rows.filter((r) => r.category === 'trailer');

  return (
    <main style={S.wrap}>
      <h1 style={S.h1}>Videos</h1>
      <p style={S.sub}>{rows.length} videos · {trailers.length} in Trailers. Paste a YouTube link from Rockstar&apos;s channel to add it.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <input style={{ ...S.input, flex: 1, minWidth: 240, marginBottom: 0 }}
          placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <select style={{ ...S.input, width: 'auto', marginBottom: 0 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={S.btn} disabled={busy} onClick={add}>Add</button>
      </div>
      {msg && <p style={S.msg}>{msg}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((v) => (
          <div key={v.id} style={S.row}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.thumbnail_url || `https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`} alt="" style={S.thumb} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.title}>{v.title}</div>
              <div style={S.meta}>
                {v.channel_title || 'unknown channel'}
                {v.category === 'trailer' && v.channel_title !== 'Rockstar Games' && (
                  <strong style={{ color: '#c0392b' }}> · not Rockstar</strong>
                )}
              </div>
            </div>
            <select style={S.select} value={v.category} onChange={(e) => retag(v.id, e.target.value)}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button style={S.del} onClick={() => remove(v.id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: { maxWidth: 860, margin: '40px auto', padding: '0 20px', color: '#0F0F0F' },
  h1: { fontSize: 26, fontWeight: 900, margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, margin: '0 0 18px' },
  input: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '11px 14px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 10, fontSize: 15 },
  btn: { background: '#FF5C00', color: '#fff', border: 'none', borderRadius: 100, padding: '11px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer' },
  msg: { fontSize: 14, margin: '0 0 14px' },
  row: { display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #eee', borderRadius: 12, padding: 10, background: '#fff' },
  thumb: { width: 88, height: 50, objectFit: 'cover', borderRadius: 6, flex: '0 0 auto' },
  title: { fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: 12, color: '#777' },
  select: { padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 },
  del: { background: '#fff', color: '#c0392b', border: '1px solid #e6c9c4', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
};
