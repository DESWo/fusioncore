import { useReactorStore } from '../../store/reactorStore.js';
import { fissionAnalysis, fusionAnalysis } from '../../engine/structural.js';
import Cite from '../common/Cite.jsx';
import CalcDrawer from '../common/CalcDrawer.jsx';

const STATUS_COLOR = { ok: 'var(--color-safe)', warn: 'var(--color-warn)', crit: 'var(--color-crit)' };

/**
 * Engineering-margin analysis: live ASME/NRC-style screening numbers.
 * Each bar shows how much of the allowable is consumed right now.
 */
export default function EngineeringPanel() {
  const sim = useReactorStore((s) => s.sim);
  const stats = useReactorStore((s) => s.stats);
  const mode = useReactorStore((s) => s.mode);
  const a = mode === 'fission' ? fissionAnalysis(sim) : fusionAnalysis(sim, stats);

  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-1.5">
        Engineering Analysis: margins to design limits
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {a.header.map(([k, v]) => (
          <div key={k}>
            <div className="text-[8px] uppercase tracking-wider text-ink/55">{k}</div>
            <div className="font-mono text-[11px] text-ink">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-1.5">
        {a.rows.map((r) => (
          <div key={r.id}>
            <div className="flex justify-between items-baseline text-[10px]">
              <span className="text-ink/70 flex items-center gap-1">
                {r.label}
                {r.techName && (
                  <span className="text-[8px] text-ink/55 italic">({r.techName})</span>
                )}
                {r.cite && <Cite id={r.cite} />}
              </span>
              <span className="font-mono" style={{ color: STATUS_COLOR[r.status] }}>
                {r.value}{r.unit && ` ${r.unit}`}
                <span className="text-ink/55"> / {r.lowerIsBad ? 'min ' : ''}{r.limit}</span>
              </span>
            </div>
            <div className="h-1 bg-raise rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(r.used, 1) * 100}%`,
                  background: STATUS_COLOR[r.status],
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <CalcDrawer calc={r.calc} />
          </div>
        ))}
      </div>

      <p className="text-[9px] text-ink/55 mt-2 leading-snug">
        0-D screening estimates for education. The field-grade versions of these
        numbers come from qualified codes (RELAP/TRACE, ANSYS, MCNP) under NQA-1.
      </p>
    </div>
  );
}
