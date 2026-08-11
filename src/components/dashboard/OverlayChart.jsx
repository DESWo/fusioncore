import { memo } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';

/**
 * Every telemetry channel on one plot, each normalized to its own run peak.
 * Absolute values live in the legend; the plot is for seeing what moves
 * together: raise heating and watch temperature, stress, and efficiency
 * respond as one system.
 */
function OverlayChart({ channels }) {
  const history = useReactorStore((s) => s.history);
  const W = 260;
  const H = 96;

  const series = channels.map((ch) => {
    let maxV = 1e-9;
    for (const h of history) maxV = Math.max(maxV, Math.abs(h[ch.id] ?? 0));
    const n = history.length;
    const path = n > 1
      ? history
          .map((h, i) => {
            const x = (i / (n - 1)) * W;
            const y = H - 4 - (Math.max(h[ch.id] ?? 0, 0) / maxV) * (H - 10);
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : '';
    const last = n > 0 ? (history[n - 1][ch.id] ?? 0) : 0;
    return { ...ch, path, last };
  });

  return (
    <div className="bg-panel p-2 min-w-0">
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1">
        {series.map((s) => (
          <span key={s.id} className="text-[9px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
            <span className="text-ink/70">{s.label}</span>
            <span className="font-mono text-ink">{s.fmt ? s.fmt(s.last) : s.last.toFixed(1)}</span>
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1={H - 4} x2={W} y2={H - 4} stroke="#242B37" strokeWidth="1" />
        {series.map((s) => s.path && (
          <path key={s.id} d={s.path} fill="none" stroke={s.color} strokeWidth="1.3" opacity="0.9" />
        ))}
      </svg>
      <p className="text-[8px] text-ink/55 mt-0.5 leading-snug">
        Each channel is scaled to its own peak this run. Shape is the point:
        watch which lines move together when you change one control.
      </p>
    </div>
  );
}

export default memo(OverlayChart);
