import { memo } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';
import { IGNITION_TRIPLE } from '../../engine/constants.js';
import Cite from '../common/Cite.jsx';

// Live operating-point plot in (T, n·τE) space with the D-T ignition boundary
// n·τ = 3e21 / T. Both axes log-scaled.
const W = 220, H = 150, PAD = 26;
const TMIN = 0.5, TMAX = 100;      // keV
const YMIN = 1e17, YMAX = 1e22;    // s·m^-3

const x = (t) => PAD + ((Math.log10(t) - Math.log10(TMIN)) / (Math.log10(TMAX) - Math.log10(TMIN))) * (W - PAD - 6);
const y = (v) => H - PAD + 8 - ((Math.log10(v) - Math.log10(YMIN)) / (Math.log10(YMAX) - Math.log10(YMIN))) * (H - PAD - 10);

function ignitionPath() {
  const pts = [];
  for (let lt = Math.log10(TMIN); lt <= Math.log10(TMAX) + 1e-9; lt += 0.08) {
    const t = 10 ** lt;
    const v = Math.min(Math.max(IGNITION_TRIPLE / t, YMIN), YMAX);
    pts.push(`${x(t).toFixed(1)},${y(v).toFixed(1)}`);
  }
  return pts;
}

const IGNITION_PTS = ignitionPath();

function LawsonPlot() {
  const T = useReactorStore((s) => s.sim.physics.T);
  const triple = useReactorStore((s) => s.sim.physics.tripleProduct);
  const history = useReactorStore((s) => s.history);

  const nTau = T > 0.01 ? triple / T : 0;
  const px = x(Math.min(Math.max(T, TMIN), TMAX));
  const py = y(Math.min(Math.max(nTau || YMIN, YMIN), YMAX));
  const ignited = triple >= IGNITION_TRIPLE;

  const trail = history
    .slice(-60)
    .filter((h) => h.T > 0.05 && h.triple > 0)
    .map((h) => `${x(Math.min(Math.max(h.T, TMIN), TMAX)).toFixed(1)},${y(Math.min(Math.max(h.triple / h.T, YMIN), YMAX)).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-panel p-2 m-2 shrink-0">
      <div className="text-[9px] uppercase tracking-widest text-ink/70 flex items-center gap-1 mb-1">
        Lawson Triple Product <Cite id="lawson" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Lawson criterion operating point plot">
        {/* ignition region */}
        <polygon
          points={`${IGNITION_PTS.join(' ')} ${W - 6},${y(YMAX)} ${x(TMIN)},${y(YMAX)}`}
          fill="rgba(56,189,248,0.10)"
        />
        <polyline points={IGNITION_PTS.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="4 3" />
        {/* axes */}
        <line x1={PAD} y1={H - PAD + 8} x2={W - 6} y2={H - PAD + 8} stroke="#313A49" strokeWidth="1" />
        <line x1={PAD} y1={8} x2={PAD} y2={H - PAD + 8} stroke="#313A49" strokeWidth="1" />
        {[1, 10, 100].map((t) => (
          <text key={t} x={x(t)} y={H - PAD + 18} textAnchor="middle" fontSize="7" fill="#4A5568">{t}</text>
        ))}
        {[1e18, 1e20, 1e22].map((v) => (
          <text key={v} x={PAD - 3} y={y(v) + 2} textAnchor="end" fontSize="6.5" fill="#4A5568">
            1e{Math.round(Math.log10(v))}
          </text>
        ))}
        <text x={(W + PAD) / 2} y={H - 2} textAnchor="middle" fontSize="7" fill="#A9B0BE">T (keV)</text>
        <text x={8} y={H / 2} textAnchor="middle" fontSize="7" fill="#A9B0BE" transform={`rotate(-90 8 ${H / 2})`}>
          n·τE (s·m⁻³)
        </text>
        <text x={W - 10} y={16} textAnchor="end" fontSize="7" fill="var(--color-accent)">IGNITION →</text>
        {/* trail + operating point */}
        {trail && <polyline points={trail} fill="none" stroke="rgba(248,250,252,0.35)" strokeWidth="1" />}
        <circle cx={px} cy={py} r="4" fill={ignited ? 'var(--color-accent)' : 'var(--color-warn)'} stroke="var(--color-ink)" strokeWidth="1.2">
          <animate attributeName="r" values="3.4;4.6;3.4" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export default memo(LawsonPlot);
