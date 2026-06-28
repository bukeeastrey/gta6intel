'use client';
// /admin/database — manage GTA 6 Database entries.
// Password-gated (same ADMIN_PASSWORD). Create/edit entries with a
// dynamic labeled-attribute builder, related links, and image upload.
import { useCallback, useEffect, useState } from 'react';

const PW_KEY = 'gi_admin_pw';
const CATEGORIES = ['characters','vehicles','locations','weapons','animals','businesses','activities','music'];
const STATUSES = ['confirmed','rumor','leak','none'];

interface Attr { label: string; value: string; status: string; href: string }
interface Related { name: string; slug: string; category: string }
interface Row { id: string; slug: string; category: string; name: string; subtitle: string | null; image_url: string | null; popular: boolean; is_published: boolean }

const empty = {
  category: 'characters', name: '', subtitle: '', summary: '', body: '',
  image_url: '', popular: false, is_published: true,
  attributes: [] as Attr[], related: [] as Related[],
};

export default function DatabaseAdmin() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { const s = typeof window !== 'undefined' ? sessionStorage.getItem(PW_KEY) : null; if (s) { setPw(s); setAuthed(true); } }, []);
  const headers = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-password': pw }), [pw]);

  const load = useCallback(async () => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/admin/database', { headers: headers() });
      if (res.status === 401) { setMsg('Wrong password.'); setAuthed(false); sessionStorage.removeItem(PW_KEY); return; }
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || 'Load failed.'); setAuthed(true); return; }
      setRows(d.entries || []); setAuthed(true); sessionStorage.setItem(PW_KEY, pw);
    } catch { setMsg('Could not load.'); } finally { setLoading(false); }
  }, [headers, pw]);
  useEffect(() => { if (authed) load(); }, [authed, load]);

  async function uploadImage(file: File) {
    setUploading(true); setMsg('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-password': pw }, body: fd });
      const d = await res.json();
      if (res.ok && d.url) { setForm((f) => ({ ...f, image_url: d.url })); setMsg('Image uploaded.'); }
      else setMsg(d.error || 'Upload failed.');
    } catch { setMsg('Upload failed.'); } finally { setUploading(false); }
  }

  async function save() {
    if (!form.name.trim()) { setMsg('Name is required.'); return; }
    // strip 'none' status to null before saving
    const payload = { ...form, attributes: form.attributes.map((a) => ({ ...a, status: a.status === 'none' ? null : a.status, href: a.href || undefined })) };
    setLoading(true);
    const url = editingId ? `/api/admin/database/${editingId}` : '/api/admin/database';
    const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: headers(), body: JSON.stringify(payload) });
    setLoading(false);
    if (res.ok) { setForm({ ...empty }); setEditingId(null); setMsg(editingId ? 'Saved.' : 'Created.'); load(); }
    else { const d = await res.json().catch(() => ({})); setMsg(d.error || 'Save failed.'); }
  }

  async function edit(id: string) {
    setMsg('Loading…');
    const res = await fetch(`/api/admin/database/${id}`, { headers: headers() });
    const d = await res.json();
    if (!res.ok) { setMsg(d.error || 'Load failed.'); return; }
    const e = d.entry;
    setEditingId(id);
    setForm({
      category: e.category, name: e.name, subtitle: e.subtitle || '', summary: e.summary || '',
      body: e.body || '', image_url: e.image_url || '', popular: !!e.popular, is_published: !!e.is_published,
      attributes: (e.attributes || []).map((a: Attr) => ({ label: a.label || '', value: a.value || '', status: a.status || 'none', href: a.href || '' })),
      related: e.related || [],
    });
    setMsg('Editing.'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function del(id: string) { if (!confirm('Delete this entry?')) return; await fetch(`/api/admin/database/${id}`, { method: 'DELETE', headers: headers() }); load(); }
  async function patchRow(id: string, body: Record<string, unknown>) { await fetch(`/api/admin/database/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }); load(); }

  // attribute helpers
  const addAttr = () => setForm((f) => ({ ...f, attributes: [...f.attributes, { label: '', value: '', status: 'confirmed', href: '' }] }));
  const setAttr = (i: number, k: keyof Attr, v: string) => setForm((f) => ({ ...f, attributes: f.attributes.map((a, j) => j === i ? { ...a, [k]: v } : a) }));
  const delAttr = (i: number) => setForm((f) => ({ ...f, attributes: f.attributes.filter((_, j) => j !== i) }));
  const addRel = () => setForm((f) => ({ ...f, related: [...f.related, { name: '', slug: '', category: 'characters' }] }));
  const setRel = (i: number, k: keyof Related, v: string) => setForm((f) => ({ ...f, related: f.related.map((r, j) => j === i ? { ...r, [k]: v } : r) }));
  const delRel = (i: number) => setForm((f) => ({ ...f, related: f.related.filter((_, j) => j !== i) }));

  const S = {
    page: { maxWidth: 920, margin: '0 auto', padding: '104px 20px 60px', color: '#e2e2f0', fontFamily: 'Inter, system-ui, sans-serif' } as const,
    input: { width: '100%', padding: '9px 11px', background: '#0f0f1a', border: '1px solid #1e1e35', borderRadius: 8, color: '#e2e2f0', marginBottom: 8, fontSize: 14 } as const,
    btn: { background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' } as const,
    ghost: { background: 'transparent', color: '#e2e2f0', border: '1px solid #1e1e35', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 } as const,
    card: { background: '#0f0f1a', border: '1px solid #1e1e35', borderRadius: 12, padding: 16, marginBottom: 12 } as const,
  };

  if (!authed) {
    return (
      <div style={{ ...S.page, maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, marginBottom: 10 }}>Database Admin</h1>
        <input style={S.input} type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <button style={S.btn} onClick={load}>Enter</button>
        {msg && <p style={{ color: '#ff9b9b', marginTop: 10 }}>{msg}</p>}
      </div>
    );
  }

  const shown = rows.filter((r) => filter === 'all' || r.category === filter);

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24 }}>Database Admin</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/admin" style={{ ...S.ghost, textDecoration: 'none' }}>← Newsroom</a>
          <button style={S.ghost} onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPw(''); }}>Log out</button>
        </div>
      </div>

      {/* form */}
      <div style={S.card}>
        <h2 style={{ fontSize: 17, marginBottom: 12 }}>{editingId ? 'Edit entry' : 'New entry'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ ...S.input, width: 180 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={S.input} placeholder="Name (e.g. Lucia Caminos)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <input style={S.input} placeholder="Subtitle (e.g. Protagonist)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <input style={S.input} placeholder="Summary (short, for cards + SEO)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea style={{ ...S.input, minHeight: 120 }} placeholder="Body / bio (one paragraph per line)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input style={{ ...S.input, marginBottom: 0, flex: 1 }} placeholder="Image URL (or Upload →)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <label style={{ ...S.ghost, whiteSpace: 'nowrap', opacity: uploading ? .6 : 1 }}>{uploading ? 'Uploading…' : '⬆ Upload'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }} />
          </label>
        </div>
        {form.image_url && <img src={form.image_url} alt="" style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #1e1e35' }} />}

        {/* Attributes builder */}
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 13, color: '#9a9ab8' }}>ATTRIBUTES (each gets a Confirmed/Rumor/Leak tag)</strong>
            <button style={S.ghost} onClick={addAttr}>+ Add field</button>
          </div>
          {form.attributes.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <input style={{ ...S.input, marginBottom: 0, width: 150 }} placeholder="Label" value={a.label} onChange={(e) => setAttr(i, 'label', e.target.value)} />
              <input style={{ ...S.input, marginBottom: 0, flex: 1, minWidth: 140 }} placeholder="Value" value={a.value} onChange={(e) => setAttr(i, 'value', e.target.value)} />
              <select style={{ ...S.input, marginBottom: 0, width: 120 }} value={a.status} onChange={(e) => setAttr(i, 'status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input style={{ ...S.input, marginBottom: 0, width: 160 }} placeholder="Link (optional)" value={a.href} onChange={(e) => setAttr(i, 'href', e.target.value)} />
              <button style={{ ...S.ghost, color: '#ff9b9b' }} onClick={() => delAttr(i)}>✕</button>
            </div>
          ))}
        </div>

        {/* Related builder */}
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 13, color: '#9a9ab8' }}>RELATED ENTRIES</strong>
            <button style={S.ghost} onClick={addRel}>+ Add link</button>
          </div>
          {form.related.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <input style={{ ...S.input, marginBottom: 0, flex: 1, minWidth: 120 }} placeholder="Name" value={r.name} onChange={(e) => setRel(i, 'name', e.target.value)} />
              <input style={{ ...S.input, marginBottom: 0, width: 160 }} placeholder="slug" value={r.slug} onChange={(e) => setRel(i, 'slug', e.target.value)} />
              <select style={{ ...S.input, marginBottom: 0, width: 130 }} value={r.category} onChange={(e) => setRel(i, 'category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button style={{ ...S.ghost, color: '#ff9b9b' }} onClick={() => delRel(i)}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center', margin: '10px 0' }}>
          <label style={{ fontSize: 14 }}><input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> ⭐ Popular</label>
          <label style={{ fontSize: 14 }}><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btn} onClick={save} disabled={loading}>{loading ? 'Saving…' : editingId ? 'Save changes' : 'Create entry'}</button>
          {editingId && <button style={S.ghost} onClick={() => { setEditingId(null); setForm({ ...empty }); setMsg(''); }}>Cancel</button>}
        </div>
        {msg && <p style={{ color: '#ffb37a', marginTop: 10, fontSize: 13 }}>{msg}</p>}
      </div>

      {/* list */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '18px 0 10px' }}>
        <h2 style={{ fontSize: 17 }}>Entries ({shown.length})</h2>
        <select style={{ ...S.input, marginBottom: 0, width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={S.ghost} onClick={load}>↻ Refresh</button>
      </div>
      {shown.map((r) => (
        <div key={r.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 52, borderRadius: 6, background: r.image_url ? `center/cover url(${r.image_url})` : '#1a1a26', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00', fontWeight: 800 }}>{!r.image_url && r.name.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{r.name} {r.popular && '⭐'}</div>
              <div style={{ fontSize: 12, color: '#5a5a78' }}>{r.category} · {r.subtitle || '—'} · {r.is_published ? 'Published' : 'Draft'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button style={S.ghost} onClick={() => patchRow(r.id, { is_published: !r.is_published })}>{r.is_published ? 'Unpublish' : 'Publish'}</button>
            <button style={S.ghost} onClick={() => patchRow(r.id, { popular: !r.popular })}>{r.popular ? 'Un-star' : '⭐ Star'}</button>
            {r.is_published && <a style={{ ...S.ghost, textDecoration: 'none' }} href={`/database/${r.category}/${r.slug}`} target="_blank" rel="noreferrer">View</a>}
            <button style={S.ghost} onClick={() => edit(r.id)}>Edit</button>
            <button style={{ ...S.ghost, color: '#ff9b9b' }} onClick={() => del(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
