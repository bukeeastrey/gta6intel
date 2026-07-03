'use client';
// Interactive SPECULATIVE map of Leonida. The six regions are officially
// confirmed by Rockstar; their positions here follow the GTA mapping
// community's reconstruction and are approximate. This is an original,
// stylised illustration — not an official map and not Rockstar artwork.
import { useCallback, useRef, useState } from 'react';

type Region = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'confirmed' | 'rumor';
  insp: string;
  note: string;
};

const REGIONS: Region[] = [
  { id: 'kalaga', name: 'Mount Kalaga National Park', x: 318, y: 140, status: 'confirmed',
    insp: 'North Florida / Providence Canyon, GA',
    note: "Leonida's remote northern wilderness — forests, canyons and winding rivers. Hunting, fishing and off-road country." },
  { id: 'gellhorn', name: 'Port Gellhorn', x: 150, y: 300, status: 'confirmed',
    insp: 'Panama City, FL (Gulf coast)',
    note: "A faded industrial port town on the western coast — cheap motels, truck stops, rail yards and maritime smuggling." },
  { id: 'ambrosia', name: 'Ambrosia', x: 340, y: 345, status: 'confirmed',
    insp: 'Rural / industrial central Florida',
    note: "Industrial heartland beside Lake Leonida — sugar refineries, farmland and a heavy outlaw biker presence." },
  { id: 'grassrivers', name: 'Grassrivers', x: 250, y: 520, status: 'confirmed',
    insp: 'The Everglades',
    note: "Vast subtropical wetlands — airboats, mangroves, alligators and off-grid communities. Home turf of the POACH crew." },
  { id: 'vicecity', name: 'Vice City', x: 415, y: 560, status: 'confirmed',
    insp: 'Miami, FL',
    note: "The neon-soaked centrepiece on the southeast coast — Art Deco beaches, nightlife, canals and downtown towers." },
  { id: 'keys', name: 'Leonida Keys', x: 375, y: 715, status: 'confirmed',
    insp: 'The Florida Keys',
    note: "A southern island chain linked by long bridges. Jason and Lucia start the story here." },
  { id: 'lake', name: 'Lake Leonida', x: 300, y: 400, status: 'rumor',
    insp: 'Lake Okeechobee',
    note: "A large freshwater lake at the state's centre. Widely reported from mapping analysis but not an officially named region." },
];

const MIN = 1;
const MAX = 5;
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
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
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
          className="lm-viewport"
          ref={vp}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={() => { if (!drag.current?.moved) setSelected(null); }}
        >
          <div className="lm-canvas" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0' }}>
            <svg viewBox="0 0 600 820" className="lm-svg" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="820" fill="#cfe2ea" />
              {/* stylised Leonida landmass (Florida-like peninsula) */}
              <path
                d="M250,132 C310,120 360,122 402,128 C440,133 462,150 460,196 C458,260 450,320 446,392 C442,460 438,516 420,566 C404,612 384,650 366,690 C356,712 350,720 344,700 C332,660 314,616 292,566 C268,510 232,482 200,438 C168,394 140,352 138,300 C136,244 150,182 196,152 C214,140 232,136 250,132 Z"
                fill="#c7dcb4" stroke="#a9c493" strokeWidth="2"
              />
              {/* lake */}
              <ellipse cx="300" cy="400" rx="42" ry="30" fill="#bcd7e0" stroke="#a9c9d3" strokeWidth="2" />
              {/* keys (island dots trailing south) */}
              {[[352,662],[366,686],[380,708],[396,728],[414,744]].map(([kx,ky],i)=>(
                <circle key={i} cx={kx} cy={ky} r="7" fill="#c7dcb4" stroke="#a9c493" strokeWidth="2" />
              ))}
              {/* north label */}
              <text x="300" y="60" textAnchor="middle" fill="#7c93a3" fontSize="14" fontWeight="700" letterSpacing="2">GLORIANA ↑ (rumored)</text>

              {/* region markers */}
              {REGIONS.map((r) => (
                <g key={r.id} className="lm-marker" onClick={(e) => pickRegion(r, e)} onPointerDown={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                  <circle cx={r.x} cy={r.y} r={selected?.id === r.id ? 11 : 8}
                    fill={r.status === 'confirmed' ? '#FF5C00' : '#8a7fa8'} stroke="#fff" strokeWidth="3" />
                  <text x={r.x + 15} y={r.y + 5} fill="#173" fontSize="15" fontWeight="800" style={{ paintOrder: 'stroke', stroke: '#ffffffcc', strokeWidth: 4 }}>{r.name}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* controls */}
          <div className="lm-controls">
            <button onClick={() => btnZoom(1.3)} aria-label="Zoom in">+</button>
            <button onClick={() => btnZoom(0.77)} aria-label="Zoom out">&minus;</button>
            <button onClick={reset} aria-label="Reset view" className="lm-reset">Reset</button>
          </div>
        </div>

        {/* info panel */}
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
        {!selected && <p className="lm-hint">Tap a marker to learn about each region · drag to pan · scroll or use +/&minus; to zoom.</p>}
      </div>
    </section>
  );
}
