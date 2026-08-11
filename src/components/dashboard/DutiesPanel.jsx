import { useReactorStore } from '../../store/reactorStore.js';
import { directiveSetFor } from '../../engine/directives.js';

/**
 * The inbox that makes rank real: directives from whoever outranks you at
 * this posting. Trainees get instructions, engineers get targets, seniors
 * get goals. Career mode only.
 */
export default function DutiesPanel() {
  const career = useReactorStore((s) => s.career);
  const ticks = useReactorStore((s) => s.sim.time.ticks);
  if (!career) return null;
  const set = directiveSetFor(career.postingId);
  const duties = career.duties;
  if (!duties || set.length === 0) return null;
  const spec = duties.current ? set.find((d) => d.id === duties.current.id) : null;
  const recent = [...duties.log].slice(-3).reverse();
  if (!spec && recent.length === 0) return null;

  return (
    <div className="bg-panel p-3 border border-accent/25">
      <div className="text-[10px] uppercase tracking-wider text-accent mb-1.5">
        Standing Orders
      </div>

      {spec ? (
        <div>
          <div className="label-mono text-[9px] text-ink/70">[ {spec.from} ]</div>
          <p className="text-[11px] text-ink leading-snug mt-1">{spec.text}</p>
          <div className="h-1 bg-raise rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-accent rounded-full"
              style={{
                width: `${Math.min((duties.current.sustain / spec.sustainTicks) * 100, 100)}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono mt-0.5">
            <span className="text-ink/55">
              holding {Math.round((duties.current.sustain / spec.sustainTicks) * 100)}%
            </span>
            {spec.windowTicks && (
              <span className={
                spec.windowTicks - (ticks - duties.current.issuedTick) < 300 ? 'text-crit' : 'text-ink/55'
              }>
                window: {Math.max(((spec.windowTicks - (ticks - duties.current.issuedTick)) / 600), 0).toFixed(1)} h
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-ink/55">
          Inbox clear. {duties.idx >= set.length ? 'No further directives at this posting.' : 'The next directive will find you.'}
        </p>
      )}

      {recent.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-raise grid gap-0.5">
          {recent.map((l) => (
            <div key={l.id} className="flex items-start gap-1.5 text-[9px]">
              <span className={l.result === 'done' ? 'text-safe' : 'text-crit'}>
                {l.result === 'done' ? '✓' : '✗'}
              </span>
              <span className="text-ink/55 leading-snug">
                {l.from}: {l.text.length > 70 ? `${l.text.slice(0, 70)}…` : l.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
