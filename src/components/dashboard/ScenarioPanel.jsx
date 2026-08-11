import { useReactorStore } from '../../store/reactorStore.js';
import { FISSION_SCENARIOS } from '../../engine/fission.js';
import { FUSION_SCENARIOS } from '../../engine/physics.js';

/** Simulator IC sets. Load a prepared plant state, like a real training sim. */
export default function ScenarioPanel() {
  const mode = useReactorStore((s) => s.mode);
  const load = useReactorStore((s) => s.loadScenario);
  const career = useReactorStore((s) => s.career);
  const scenarios = mode === 'fission' ? FISSION_SCENARIOS : FUSION_SCENARIOS;
  // ICs mark the campaign complete, which would let a career skip its
  // postings. Classic campaigns only.
  if (career) return null;
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-1.5">
        Simulator Scenarios (IC sets)
      </div>
      <div className="grid gap-1.5">
        {Object.entries(scenarios).map(([key, sc]) => (
          <button
            key={key}
            onClick={() => {
              if (window.confirm(`Load "${sc.label}"? This ends campaign scoring for the current save.`)) load(key);
            }}
            className="text-left border border-raise-hi hover:bg-raise px-2 py-1.5"
          >
            <span className="text-[11px] font-semibold">{sc.label}</span>
            <span className="text-[10px] text-ink/70 block">{sc.desc}</span>
          </button>
        ))}
      </div>
      <p className="text-[9px] text-ink/55 mt-1.5">Loading an IC ends campaign scoring for this save.</p>
    </div>
  );
}
