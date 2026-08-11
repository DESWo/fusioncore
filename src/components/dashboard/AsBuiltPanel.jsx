import { useReactorStore } from '../../store/reactorStore.js';
import { TOLERANCE_SPECS } from '../../engine/tolerances.js';

/**
 * The plant you got vs the plant you ordered. As-built values are sampled
 * once per campaign; real engineering is never deterministic.
 */
export default function AsBuiltPanel() {
  const mode = useReactorStore((s) => s.mode);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const asBuilt = useReactorStore((s) => s.sim.asBuilt);
  const specs = TOLERANCE_SPECS[mode === 'fission' && plantKey === 'research' ? 'research' : mode];
  if (!asBuilt || !specs) return null;

  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70">As-Built Plant</div>
      <div className="text-[8px] text-ink/55 italic mb-1.5">
        manufacturing tolerances: what the vendors actually delivered
      </div>
      <div className="grid gap-1.5">
        {specs.map((spec) => {
          const m = asBuilt[spec.key] ?? 1;
          const { design, actual } = spec.describe(m);
          const dev = (m - 1) * 100;
          const devColor = Math.abs(dev) < 0.05 ? 'text-ink/55' : dev < 0 ? 'text-warn' : 'text-safe';
          return (
            <div key={spec.key} className="text-[10px]">
              <div className="flex justify-between items-baseline">
                <span className="text-ink/85">
                  {spec.label}
                  <span className="text-[8px] text-ink/55 italic ml-1">({spec.tech})</span>
                </span>
                <span className={`font-mono ${devColor}`}>
                  {dev >= 0 ? '+' : ''}{dev.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-ink/55">design {design}</span>
                <span className="text-ink">as-built {actual}</span>
              </div>
              <p className="text-[8px] text-ink/40 leading-snug">{spec.note}.</p>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-ink/55 mt-1.5 leading-snug">
        Sampled when this campaign began. No two plants are identical; the
        operating manual describes the design, the log describes yours.
      </p>
    </div>
  );
}
