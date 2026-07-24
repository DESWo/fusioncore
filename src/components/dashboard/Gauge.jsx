import { memo } from 'react';
import Cite from '../common/Cite.jsx';

/**
 * Compact 180° arc gauge. `zones` = [safeEnd, warnEnd] as fractions of max;
 * beyond warnEnd renders critical. Shape + color coded for colorblind users.
 */
function Gauge({ label, value, max, unit, display, zones = [0.7, 0.9], cite, invert = false }) {
  const frac = Math.min(Math.max(value / max, 0), 1);
  const angle = -90 + frac * 180;
  let zone = frac <= zones[0] ? 'safe' : frac <= zones[1] ? 'warn' : 'crit';
  if (invert) zone = frac >= zones[0] ? 'safe' : frac >= zones[1] * 0.5 ? 'warn' : 'crit';
  const zoneColor = { safe: 'var(--color-safe)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' }[zone];
  const zoneIcon = { safe: '●', warn: '▲', crit: '✕' }[zone];

  return (
    <div className="bg-panel rounded-lg p-2 flex flex-col items-center min-w-0">
      <svg viewBox="0 0 100 58" className="w-full max-w-[110px]">
        <path d="M 8 52 A 42 42 0 0 1 92 52" fill="none" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M 8 52 A 42 42 0 0 1 92 52"
          fill="none"
          stroke={zoneColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${frac * 132} 132`}
          style={{ transition: 'stroke-dasharray 0.3s linear, stroke 0.3s' }}
        />
        <g transform={`rotate(${angle} 50 52)`} style={{ transition: 'transform 0.3s linear' }}>
          <line x1="50" y1="52" x2="50" y2="16" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="52" r="3.5" fill="var(--color-ink)" />
      </svg>
      <div className="font-mono text-sm font-bold leading-none mt-0.5" style={{ color: zoneColor }}>
        <span aria-hidden="true" className="text-[9px] align-middle mr-0.5">{zoneIcon}</span>
        {display}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5 flex items-center gap-1 text-center">
        {label} {unit ? `(${unit})` : ''} {cite && <Cite id={cite} />}
      </div>
    </div>
  );
}

export default memo(Gauge);
