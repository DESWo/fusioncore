import { useCareerStore } from '../careerStore.js';
import { BLOCKS_PER_YEAR, pursuitById } from '../engine/pursuits.js';
import { STAT_LABELS } from '../engine/balance.js';

/**
 * The year you are about to spend. Three blocks, a dozen competing uses, and
 * no way to have all of them. This is where the player stops being a reader
 * and starts being an engineer with a finite year.
 */
export default function YearPlan() {
  const player = useCareerStore((s) => s.player);
  const plan = useCareerStore((s) => s.plan);
  const options = useCareerStore((s) => s.pursuitOptions)();
  const addToPlan = useCareerStore((s) => s.addToPlan);
  const removeFromPlan = useCareerStore((s) => s.removeFromPlan);
  const commitPlan = useCareerStore((s) => s.commitPlan);

  const left = BLOCKS_PER_YEAR - plan.length;
  const counts = plan.reduce((a, id) => ({ ...a, [id]: (a[id] ?? 0) + 1 }), {});

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
      <div className="c-label" style={{ color: 'var(--c-accent)' }}>
        The year ahead · age {player.age}
      </div>
      <h2 className="c-display text-[26px] mt-1.5" style={{ color: 'var(--c-ink)' }}>
        How will you spend it?
      </h2>
      <p className="c-prose mt-2" style={{ fontSize: 14, color: 'var(--c-muted)' }}>
        Three blocks. Put two on the same thing to push harder, at the cost of
        everything you did not choose.
      </p>

      {/* what you have committed so far */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: BLOCKS_PER_YEAR }, (_, i) => {
          const id = plan[i];
          const p = id ? pursuitById(id) : null;
          return (
            <button
              key={i}
              onClick={() => id && removeFromPlan(i)}
              disabled={!id}
              className="flex-1 rounded-xl px-2 py-3 text-center"
              style={{
                border: id ? '1px solid rgba(224,138,60,0.5)' : '1px dashed var(--c-line)',
                background: id ? 'var(--c-accent-soft)' : 'transparent',
                cursor: id ? 'pointer' : 'default',
                minHeight: 60,
              }}
              aria-label={id ? `Remove ${p?.label}` : 'Empty block'}
            >
              <span
                className="text-[12px] leading-tight block"
                style={{ color: id ? 'var(--c-ink)' : 'var(--c-faint)' }}
              >
                {p ? p.label : '—'}
              </span>
              {id && (
                <span className="text-[10px] italic" style={{ color: 'var(--c-faint)' }}>
                  tap to drop
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="c-rule my-4"><span style={{ fontSize: 10 }}>◆</span></div>

      <div className="grid gap-2.5">
        {options.map((p) => {
          const n = counts[p.id] ?? 0;
          const full = left === 0;
          return (
            <button
              key={p.id}
              onClick={() => addToPlan(p.id)}
              disabled={full}
              className="c-choice"
              style={{
                opacity: full && n === 0 ? 0.4 : 1,
                background: n > 0 ? 'var(--c-accent-soft)' : undefined,
                borderLeftColor: n > 0 ? 'var(--c-accent)' : undefined,
              }}
            >
              <div className="flex justify-between items-baseline gap-2">
                <span className="c-display text-[16px]" style={{ color: 'var(--c-ink)' }}>
                  {p.label}
                </span>
                {n > 0 && (
                  <span className="c-num text-[13px] shrink-0" style={{ color: 'var(--c-accent)' }}>
                    ×{n}
                  </span>
                )}
              </div>
              <p className="c-prose mt-1" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                {p.blurb}
              </p>
              <div className="flex justify-between items-baseline mt-1.5">
                <span className="text-[11px] italic" style={{ color: 'var(--c-faint)' }}>
                  {p.stats.map((k) => STAT_LABELS[k]).join(' and ')}
                </span>
                <span
                  className="text-[11px] italic shrink-0"
                  style={{ color: p.stress > 0 ? 'var(--c-bad)' : 'var(--c-good)' }}
                >
                  {p.stress > 0 ? `+${p.stress} stress` : `${p.stress} stress`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={commitPlan}
        disabled={left !== 0}
        className="c-btn w-full mt-6 py-4 text-[15px]"
      >
        {left === 0 ? 'Live the year' : `${left} block${left === 1 ? '' : 's'} left`}
      </button>
    </div>
  );
}
