// "The State of Leonida" regions panel — sits below the database on the
// homepage. CREDIBILITY NOTE: Rockstar has not released an official map of
// Leonida. So this panel does NOT fake geography — it presents only the
// Rockstar-CONFIRMED region names with an explicit "layout illustrative"
// disclaimer. If a credible leaked map surfaces later, drop it into the
// `mapImage` slot and the RUMOR ribbon will show automatically.
import Link from 'next/link';

type Region = { name: string; note: string };

// All six are officially confirmed regions of Leonida, plus the penitentiary
// named in Lucia's bio. Descriptors kept to confirmed facts only.
const REGIONS: Region[] = [
  { name: 'Vice City', note: 'Modern-day, Miami-inspired metropolis' },
  { name: 'Leonida Keys', note: "Coastal island chain — Jason's home turf" },
  { name: 'Grassrivers', note: 'Confirmed region of Leonida' },
  { name: 'Port Gellhorn', note: 'Confirmed port region' },
  { name: 'Ambrosia', note: 'Confirmed region of Leonida' },
  { name: 'Mount Kalaga National Park', note: 'Confirmed national-park region' },
  { name: 'Leonida Penitentiary', note: "Where Lucia's story begins" },
];

// Set this to a real (uploaded) map URL only if/when a credible source exists.
// While null, we show the confirmed-regions layout instead of faking geography.
const mapImage: string | null = null;
const mapIsRumor = true; // if mapImage is ever set, it's leak/rumor-tagged

export function LeonidaRegions() {
  return (
    <section className="leonida-map-wrap" aria-labelledby="leonida-map-title">
      <div className="section-header">
        <h2 className="section-title rl" id="leonida-map-title">
          The State of <span>Leonida</span>
        </h2>
        <Link href="/database/locations" className="section-link rr">All locations →</Link>
      </div>

      <div className="leonida-map">
        {mapImage ? (
          <div className="leonida-map-img" style={{ backgroundImage: `url(${mapImage})` }}>
            {mapIsRumor && <span className="leonida-map-ribbon">RUMOR · UNOFFICIAL MAP</span>}
          </div>
        ) : (
          <div className="leonida-grid">
            {REGIONS.map((r) => (
              <div className="leonida-region" key={r.name}>
                <span className="leonida-dot" aria-hidden="true" />
                <div>
                  <div className="leonida-region-name">{r.name}</div>
                  <div className="leonida-region-note">{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="leonida-disclaimer">
          Regions confirmed by Rockstar. Rockstar has not released an official map of
          Leonida — this layout is illustrative, not geographic. We&rsquo;ll add a real
          map (clearly tagged) only when a credible source exists.
        </p>
      </div>
    </section>
  );
}
