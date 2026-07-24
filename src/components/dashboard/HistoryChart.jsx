import { memo } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';

/** Lightweight SVG sparkline over the store's history ring buffer. */
function HistoryChart({ metric, label, color = 'var(--color-accent)', formatMax }) {
  const history = useReactorStore((s) => s.history);
  const W = 260;
  const H = 56;
  let path = '';
  let maxV = 1e-9;

  if (history.length > 1) {
    for (const h of history) maxV = Math.max(maxV, Math.abs(h[metric]));
    const n = history.length;
    path = history
      .map((h, i) => {
        const x = (i / (n - 1)) * W;
        const y = H - 4 - (Math.max(h[metric], 0) / maxV) * (H - 10);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  return (
    <div className="bg-panel rounded-lg p-2 min-w-0">
      <div className="flex justify-between items-baseline">
        <span className="text-[9px] uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-[9px] font-mono text-slate-500">
          peak {formatMax ? formatMax(maxV) : maxV.toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1={H - 4} x2={W} y2={H - 4} stroke="#334155" strokeWidth="1" />
        {path && <path d={path} fill="none" stroke={color} strokeWidth="1.6" />}
      </svg>
    </div>
  );
}

export default memo(HistoryChart);
