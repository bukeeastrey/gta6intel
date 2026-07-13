'use client';
// ════════════════════════════════════════════════════════════
// /admin — password-gated newsroom dashboard.
//   • Enter ADMIN_PASSWORD once (kept in sessionStorage).
//   • List every article (published + drafts).
//   • Create / edit / publish / unpublish / 🔥 feature / delete.
// All actions hit /api/admin/* which re-checks the password.
// ════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState } from 'react';

interface Row {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  label: string;
  category: string;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  is_published: boolean;
  auto_published: boolean;
  featured: boolean;
  tags?: string[] | null;
  published_at: string | null;
  created_at: string;
}

const LABELS = ['CONFIRMED', 'RUMOR', 'LEAK', 'ANALYSIS'];
const CATEGORIES = ['news', 'analysis', 'guide', 'roundup'];
const PW_KEY = 'gi_admin_pw';

const empty = {
  title: '', summary: '', body: '', tags: '', label: 'CONFIRMED', category: 'news',
  image_url: '', source_name: 'GTA6Intel', source_url: '', featured: false, is_published: true,
};

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewBody, setPreviewBody] = useState('');

  // Fetch one article's full body (list endpoint omits body to stay fast).
  async function fetchBody(id: string): Promise<string> {
    const res = await fetch(`/api/admin/articles/${id}`, { headers: headers() });
    if (!res.ok) return '';
    const d = await res.json();
    return d.article?.body || '';
  }

  async function togglePreview(id: string) {
    if (previewId === id) { setPreviewId(null); setPreviewBody(''); return; }
    setPreviewId(id); setPreviewBody('Loading…');
    setPreviewBody(await fetchBody(id) || '(no body)');
  }

  async function uploadImage(file: File) {
    setUploading(true); setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-password': pw }, // don't set Content-Type for FormData
        body: fd,
      });
      const d = await res.json();
      if (res.ok && d.url) { setForm((f) => ({ ...f, image_url: d.url })); setMsg('Image uploaded.'); }
      else setMsg(d.error || 'Upload failed.');
    } catch { setMsg('Upload failed.'); }
    finally { setUploading(false); }
  }

  // Restore saved password on load.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(PW_KEY) : null;
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-admin-password': pw }),
    [pw]
  );

  const load = useCallback(async () => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/admin/articles', { headers: headers() });
      if (res.status === 401) { setMsg('Wrong password.'); setAuthed(false); sessionStorage.removeItem(PW_KEY); return; }
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || `Load failed (${res.status}).`); setAuthed(true); return; }
      setRows(data.articles || []);
      setAuthed(true);
      sessionStorage.setItem(PW_KEY, pw);
    } catch { setMsg('Could not load — check your connection.'); }
    finally { setLoading(false); }
  }, [headers, pw]);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/articles/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) });
    load();
  }
  async function del(id: string) {
    if (!confirm('Delete this article permanently?')) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE', headers: headers() });
    load();
  }
  async function save() {
    if (!form.title.trim() || !form.body.trim()) { setMsg('Title and body are required.'); return; }
    setLoading(true);
    const url = editingId ? `/api/admin/articles/${editingId}` : '/api/admin/articles';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { setForm({ ...empty }); setEditingId(null); setMsg(editingId ? 'Saved.' : 'Created.'); load(); }
    else { const d = await res.json().catch(() => ({})); setMsg(d.error || 'Save failed.'); }
  }
  async function edit(r: Row) {
    setEditingId(r.id);
    setMsg('Loading article…');
    const body = await fetchBody(r.id);
    setForm({
      title: r.title, summary: r.summary || '', body, tags: (r.tags || []).join(', '), label: r.label || 'CONFIRMED',
      category: r.category || 'news', image_url: r.image_url || '', source_name: r.source_name || 'GTA6Intel',
      source_url: r.source_url || '', featured: r.featured, is_published: r.is_published,
    });
    setMsg('Editing — the full body is loaded below; change it or leave as-is, then Save.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── styles (inline; admin tool, not public brand) ──
  const S = {
    page: { maxWidth: 960, margin: '0 auto', padding: '104px 20px 40px', color: '#e2e2f0', fontFamily: 'Inter, system-ui, sans-serif' } as const,
    input: { width: '100%', padding: '10px 12px', background: '#0f0f1a', border: '1px solid #1e1e35', borderRadius: 8, color: '#e2e2f0', marginBottom: 10, fontSize: 14 } as const,
    btn: { background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' } as const,
    ghost: { background: 'transparent', color: '#e2e2f0', border: '1px solid #1e1e35', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 } as const,
    card: { background: '#0f0f1a', border: '1px solid #1e1e35', borderRadius: 12, padding: 16, marginBottom: 12 } as const,
  };

  // ── password gate ──
  if (!authed) {
    return (
      <div style={{ ...S.page, maxWidth: 420 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>GTA6Intel Admin</h1>
        <p style={{ color: '#5a5a78', marginBottom: 16, fontSize: 14 }}>Enter the admin password.</p>
        <input
          style={S.input} type="password" placeholder="Password" value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button style={S.btn} onClick={load} disabled={loading}>{loading ? 'Checking…' : 'Enter'}</button>
        {msg && <p style={{ color: '#ff6b6b', marginTop: 10, fontSize: 13 }}>{msg}</p>}
      </div>
    );
  }

  const publishedCount = rows.filter((r) => r.is_published).length;
  const draftCount = rows.length - publishedCount;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 26 }}>Newsroom</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a style={{ ...S.ghost, textDecoration: 'none' }} href="/admin/database">🗂️ Database</a>
          <a style={{ ...S.ghost, textDecoration: 'none' }} href="/admin/videos">🎬 Videos</a>
          <a style={{ ...S.ghost, textDecoration: 'none' }} href="/admin/broadcast">📧 Email</a>
          <a style={{ ...S.ghost, textDecoration: 'none' }} href="/admin/archive">🖼️ Media</a>
          <button style={S.ghost} onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPw(''); }}>Log out</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: '#9a9ab8' }}>
          <strong style={{ color: '#e2e2f0' }}>{rows.length}</strong> articles ·{' '}
          <strong style={{ color: '#6ee7a0' }}>{publishedCount}</strong> published ·{' '}
          <strong style={{ color: '#ffb37a' }}>{draftCount}</strong> drafts
        </span>
        <button style={S.ghost} onClick={load} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
        {draftCount > 0 && <span style={{ fontSize: 13, color: '#ffb37a' }}>↓ drafts await your review below</span>}
      </div>

      {/* ── Create / Edit form ── */}
      <div style={S.card}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>{editingId ? 'Edit article' : 'New article'}</h2>
        <input style={S.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input style={S.input} placeholder="Summary (≤200 chars, for SEO meta)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea style={{ ...S.input, minHeight: 180, fontFamily: 'inherit' }} placeholder={editingId ? 'Body (leave empty to keep existing)' : 'Body (Markdown or plain text)'} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <input style={S.input} placeholder="Tags (comma separated — e.g. gta 6 crossplay, gta 6 online)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select style={{ ...S.input, width: 'auto' }} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
            {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select style={{ ...S.input, width: 'auto' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input style={{ ...S.input, marginBottom: 0, flex: 1 }} placeholder="Image URL (or use Upload →)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <label style={{ ...S.ghost, whiteSpace: 'nowrap', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Uploading…' : '⬆ Upload'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }} />
          </label>
        </div>
        {form.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.image_url} alt="preview" style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 10, border: '1px solid #1e1e35' }} />
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={S.input} placeholder="Source name" value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} />
          <input style={S.input} placeholder="Source URL (optional)" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 14 }}><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> 🔥 Hot / Trending</label>
          <label style={{ fontSize: 14 }}><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publish now</label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={save} disabled={loading}>{loading ? 'Saving…' : editingId ? 'Save changes' : 'Create article'}</button>
          {editingId && <button style={S.ghost} onClick={() => { setEditingId(null); setForm({ ...empty }); setMsg(''); }}>Cancel</button>}
        </div>
        {msg && <p style={{ color: '#ffb37a', marginTop: 10, fontSize: 13 }}>{msg}</p>}
      </div>

      {/* ── Article list ── */}
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>All articles ({rows.length})</h2>
      {loading && <p style={{ color: '#5a5a78' }}>Loading…</p>}
      {rows.map((r) => (
        <div key={r.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ff6b00' }}>{r.label}</span>
                {r.featured && <span style={{ fontSize: 11 }}>🔥 HOT</span>}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: r.is_published ? '#16351e' : '#351616', color: r.is_published ? '#6ee7a0' : '#ff9b9b' }}>
                  {r.is_published ? 'Published' : 'Draft'}
                </span>
                {r.auto_published && <span style={{ fontSize: 11, color: '#5a5a78' }}>auto</span>}
              </div>
              <div style={{ fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 2 }}>{r.source_name} · {new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <button style={S.ghost} onClick={() => togglePreview(r.id)}>{previewId === r.id ? 'Hide' : 'Preview'}</button>
              <button style={S.ghost} onClick={() => patch(r.id, { is_published: !r.is_published })}>{r.is_published ? 'Unpublish' : 'Publish'}</button>
              <button style={S.ghost} onClick={() => patch(r.id, { featured: !r.featured })}>{r.featured ? 'Un-hot' : '🔥 Hot'}</button>
              {r.is_published && <a style={{ ...S.ghost, textDecoration: 'none' }} href={`/news/${r.slug}`} target="_blank" rel="noreferrer">View live</a>}
              <button style={S.ghost} onClick={() => edit(r)}>Edit</button>
              <button style={{ ...S.ghost, color: '#ff9b9b' }} onClick={() => del(r.id)}>Delete</button>
            </div>
          </div>
          {previewId === r.id && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--bg, #080810)', border: '1px solid #1e1e35', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#c9c9e0', maxHeight: 360, overflowY: 'auto' }}>
              {previewBody}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
