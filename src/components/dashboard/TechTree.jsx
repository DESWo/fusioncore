import { useReactorStore } from '../../store/reactorStore.js';
import { TECH_TREE, techAvailable } from '../../engine/tech.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

export default function TechTree() {
  const rd = useReactorStore((s) => s.rd);
  const levelId = useReactorStore((s) => s.level.id);
  const purchase = useReactorStore((s) => s.purchaseTech);

  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70">
        R&amp;D Technology Tree: {Math.floor(rd.points)} pts available
      </div>
      <div className="text-[8px] text-ink/55 italic mb-2">
        every upgrade is a compromise. Read the fine print before you sign
      </div>
      <div className="grid gap-2">
        {TECH_TREE.map((t) => {
          const owned = rd.unlocked.includes(t.id);
          const available = techAvailable(t, rd.unlocked, levelId);
          const affordable = rd.points >= t.cost;
          const lockReason = owned ? null
            : levelId < t.minLevel ? `Requires Level ${t.minLevel}`
            : t.requires && !rd.unlocked.includes(t.requires) ? 'Requires prerequisite tech'
            : null;
          return (
            <div
              key={t.id}
              className={`border p-2 ${
                owned ? 'border-safe/50 bg-safe/5' : available ? 'border-raise-hi' : 'border-raise opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  {t.name} <Cite id={t.cite} /> <SpeakerIcon text={`${t.name}. ${t.desc} Gains: ${t.pros.join('. ')}. Costs: ${t.cons.join('. ')}.`} />
                </span>
                {owned ? (
                  <span className="text-[10px] font-mono text-safe">INSTALLED</span>
                ) : (
                  <button
                    onClick={() => purchase(t.id)}
                    disabled={!available || !affordable}
                    className={`text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap ${
                      available && affordable
                        ? 'bg-accent text-base font-bold hover:brightness-110'
                        : 'bg-raise text-ink/70 cursor-not-allowed'
                    }`}
                  >
                    {t.cost.toLocaleString()} R&amp;D
                  </button>
                )}
              </div>
              <p className="text-[10px] text-ink/70 mt-1 leading-snug">{t.desc}</p>
              <div className="mt-1 grid gap-0.5">
                {t.pros.map((p) => (
                  <div key={p} className="text-[10px] text-safe leading-snug flex gap-1">
                    <span className="shrink-0 font-bold">+</span><span>{p}</span>
                  </div>
                ))}
                {t.cons.map((c) => (
                  <div key={c} className="text-[10px] text-warn leading-snug flex gap-1">
                    <span className="shrink-0 font-bold">−</span><span>{c}</span>
                  </div>
                ))}
              </div>
              {lockReason && <p className="text-[9px] text-warn mt-0.5">{lockReason}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
