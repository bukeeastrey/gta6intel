'use client';
// Interactive SPECULATIVE map of Leonida. The six regions are officially
// confirmed by Rockstar; positions follow the GTA mapping community's
// reconstruction and are approximate. Original stylised artwork — not an
// official map and not Rockstar / community-map artwork.
import { useCallback, useRef, useState } from 'react';

type Region = {
  id: string; name: string; x: number; y: number;
  status: 'confirmed' | 'rumor'; insp: string; note: string; sz?: number;
};

const REGIONS: Region[] = [
  { id: 'kalaga', name: 'Mount Kalaga', x: 400, y: 220, status: 'confirmed',
    insp: 'North Florida / Providence Canyon, GA',
    note: "Leonida's remote northern highlands - forests, canyons and rivers. Hunting, fishing and off-road country." },
  { id: 'gellhorn', name: 'Port Gellhorn', x: 215, y: 430, status: 'confirmed',
    insp: 'Panama City, FL (Gulf coast)',
    note: "A faded industrial port town on the western coast - cheap motels, truck stops, rail yards and maritime smuggling." },
  { id: 'ambrosia', name: 'Ambrosia', x: 430, y: 480, status: 'confirmed',
    insp: 'Rural / industrial central Florida',
    note: "Industrial heartland beside Lake Leonida - sugar refineries, farmland and a heavy outlaw biker presence." },
  { id: 'grassrivers', name: 'Grassrivers', x: 300, y: 690, status: 'confirmed',
    insp: 'The Everglades',
    note: "Vast subtropical wetlands - airboats, mangroves, alligators and off-grid communities. Home turf of the POACH crew." },
  { id: 'vicecity', name: 'Vice City', x: 545, y: 650, status: 'confirmed',
    insp: 'Miami, FL',
    note: "The neon-soaked centrepiece on the southeast coast - Art Deco beaches, nightlife, canals and downtown towers." },
  { id: 'keys', name: 'Leonida Keys', x: 562, y: 800, status: 'confirmed',
    insp: 'The Florida Keys',
    note: "A southern island chain linked by long bridges. Jason and Lucia start the story here." },
  { id: 'lake', name: 'Lake Leonida', x: 380, y: 520, status: 'rumor', sz: 7,
    insp: 'Lake Okeechobee',
    note: "A large freshwater lake at the state's centre. Widely reported from mapping analysis but not an officially named region." },
];

const COAST =
  'M250,150 C300,120 380,118 470,124 C520,127 548,150 560,200 C572,250 566,300 570,360 C574,420 560,470 566,520 C572,575 556,620 560,660 C562,695 548,700 532,706 C556,740 520,780 470,808 C440,826 412,842 398,858 C388,842 372,828 356,812 C330,786 312,748 296,706 C276,654 260,620 244,566 C230,518 214,486 206,436 C200,398 214,372 210,332 C206,286 226,250 232,206 C236,178 240,164 250,150 Z';

const ROADS = [
  'M400,230 C470,300 520,420 540,650 C548,720 560,760 560,800',
  'M215,430 C300,470 380,500 540,650',
  'M400,230 C420,360 430,440 430,480',
  'M300,690 C380,660 470,650 540,650',
];

const MIN = 1, MAX = 5;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function LeonidaMap() {
  const vp = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [selected, setSelected] = useState<Region | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  const zoomAround = useCallback((mx: number, my: number, factor: number) => {
    setScale((s) => {
      const ns = clamp(s * factor, MIN, MAX);
      const k = ns / s;
      setTx((t) => mx - (mx - t) * k);
      setTy((t) => my - (my - t) * k);
      return ns;
    });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = vp.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAround(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.15 : 0.87);
  }, [zoomAround]);

  const btnZoom = (factor: number) => {
    const rect = vp.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAround(rect.width / 2, rect.height / 2, factor);
  };
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, tx, ty, moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    setTx(d.tx + dx);
    setTy(d.ty + dy);
  };
  const onPointerUp = () => { drag.current = null; };

  const pickRegion = (r: Region, e: React.MouseEvent) => {
    e.stopPropagation();
    if (drag.current?.moved) return;
    setSelected(r);
  };

  return (
    <section className="lm-wrap" aria-labelledby="lm-title">
      <div className="section-header">
        <h2 className="section-title rl" id="lm-title">GTA 6 <span>Maps</span></h2>
      </div>

      <div className="lm-card">
        <div className="lm-banner">
          <span className="lm-badge">Speculative</span>
          <span className="lm-banner-txt">Regions are officially confirmed; the layout follows community mapping and is approximate. Not an official map.</span>
        </div>

        <div
          className="lm-viewport" ref={vp}
          onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
          onClick={() => { if (!drag.current?.moved) setSelected(null); }}
        >
          <div className="lm-canvas" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0' }}>
            <svg viewBox="0 0 760 980" className="lm-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lm-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3d7fa6" /><stop offset="1" stopColor="#22536f" />
                </linearGradient>
                <linearGradient id="lm-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#cfe4a6" /><stop offset="1" stopColor="#a7c882" />
                </linearGradient>
                <radialGradient id="lm-lake" cx="0.5" cy="0.4" r="0.7">
                  <stop offset="0" stopColor="#5fa3c4" /><stop offset="1" stopColor="#3a7fa3" />
                </radialGradient>
                <clipPath id="lm-clip"><path d={COAST} /></clipPath>
              </defs>

              <rect width="760" height="980" fill="url(#lm-water)" />
              <path d={COAST} fill="none" stroke="#7fc0d6" strokeWidth="26" opacity="0.5" />
              <path d={COAST} fill="none" stroke="#bfe3d8" strokeWidth="12" opacity="0.7" />
              <path d={COAST} fill="url(#lm-land)" stroke="#e6d9a8" strokeWidth="6" />

              <g clipPath="url(#lm-clip)">
                <g fill="#8caf66" opacity="0.85">
                  <ellipse cx="330" cy="300" rx="70" ry="52" /><ellipse cx="470" cy="270" rx="60" ry="44" />
                  <ellipse cx="300" cy="430" rx="55" ry="42" /><ellipse cx="250" cy="330" rx="40" ry="34" />
                </g>
                <ellipse cx="400" cy="220" rx="120" ry="70" fill="#b9a479" />
                <g fill="#8a744f">
                  <path d="M340,235 l25,-45 l25,45 Z" /><path d="M380,240 l30,-55 l30,55 Z" /><path d="M430,236 l22,-40 l22,40 Z" />
                </g>
                <ellipse cx="300" cy="690" rx="95" ry="80" fill="#9fb673" />
                <g stroke="#7fb0a6" strokeWidth="3" fill="none" opacity="0.7">
                  <path d="M235,660 q30,-12 60,0 t60,0" /><path d="M240,690 q30,-12 60,0 t60,0" /><path d="M245,720 q30,-12 60,0 t60,0" />
                </g>
                <g stroke="#5fa3c4" strokeWidth="5" fill="none" opacity="0.8">
                  <path d="M400,250 C395,330 390,420 380,500" /><path d="M380,545 C360,610 330,660 300,720" />
                </g>
                <g fill="none" stroke="#c9bfa0" strokeWidth="9" strokeLinecap="round">
                  {ROADS.map((d, i) => <path key={i} d={d} />)}
                </g>
                <g fill="none" stroke="#f2ead2" strokeWidth="4" strokeLinecap="round">
                  {ROADS.map((d, i) => <path key={i} d={d} />)}
                </g>
              </g>

              <ellipse cx="380" cy="520" rx="52" ry="36" fill="url(#lm-lake)" stroke="#e6d9a8" strokeWidth="4" />
              <g fill="url(#lm-land)" stroke="#e6d9a8" strokeWidth="4">
                <circle cx="562" cy="800" r="12" /><circle cx="588" cy="818" r="10" /><circle cx="612" cy="834" r="8" /><circle cx="634" cy="848" r="7" />
              </g>

              <g stroke="#ffffff" strokeWidth="1" opacity="0.12">
                <path d="M215,70 V905 M310,70 V905 M405,70 V905 M500,70 V905 M595,70 V905" />
                <path d="M55,220 H715 M55,320 H715 M55,420 H715 M55,520 H715 M55,620 H715 M55,720 H715 M55,820 H715" />
              </g>
              <g fill="#5b7a8c" fontSize="12" fontFamily="Arial" opacity="0.75">
                <text x="60" y="215">N6</text><text x="60" y="415">N2</text><text x="60" y="620">S2</text><text x="60" y="820">S6</text>
              </g>

              <g transform="translate(660,895)">
                <circle r="30" fill="#ffffff" opacity="0.85" />
                <path d="M0,-24 L6,0 L0,5 L-6,0 Z" fill="#FF5C00" />
                <path d="M0,24 L6,0 L0,-5 L-6,0 Z" fill="#5b7a8c" />
                <text x="0" y="-13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1a3a1a">N</text>
              </g>

              {REGIONS.map((r) => (
                <g key={r.id} onClick={(e) => pickRegion(r, e)} onPointerDown={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                  <circle cx={r.x} cy={r.y} r={selected?.id === r.id ? (r.sz ?? 8) + 3 : (r.sz ?? 8)}
                    fill={r.status === 'confirmed' ? '#FF5C00' : '#8a7fa8'} stroke="#fff" strokeWidth="3" />
                  <text x={r.x + 15} y={r.y + 5} fontFamily="Arial" fontSize={r.status === 'rumor' ? 13 : 15}
                    fontWeight="800" fill={r.status === 'rumor' ? '#2a3a4a' : '#173a17'}
                    paintOrder="stroke" stroke="#ffffffcc" strokeWidth="4">{r.name}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="lm-controls">
            <button onClick={() => btnZoom(1.3)} aria-label="Zoom in">+</button>
            <button onClick={() => btnZoom(0.77)} aria-label="Zoom out">&minus;</button>
            <button onClick={reset} aria-label="Reset view" className="lm-reset">Reset</button>
          </div>
        </div>

        {selected && (
          <div className="lm-info">
            <div className="lm-info-head">
              <h3>{selected.name}</h3>
              <span className={`lm-status lm-${selected.status}`}>{selected.status.toUpperCase()}</span>
            </div>
            <p className="lm-insp">Inspired by {selected.insp}</p>
            <p className="lm-note">{selected.note}</p>
          </div>
        )}
        {!selected && <p className="lm-hint">Tap a marker for details &middot; drag to pan &middot; scroll or use +/&minus; to zoom.</p>}
      </div>
    </section>
  );
}
