import { useCareerStore } from '../careerStore.js';
import { STAT_LABELS } from '../engine/balance.js';

const GRADE_TONE = {
  excellent: 'var(--c-good)',
  adequate: 'var(--c-muted)',
  poor: 'var(--c-bad)',
};

/**
 * The year, closed out. What your three blocks produced, then what happened
 * around you while you were busy. One screen instead of a run of taps.
 */
export default function YearSummary() {
  const player = useCareerStore((s) => s.player);
  const planResults = useCareerStore((s) => s.planResults);
  const digest = useCareerStore((s) => s.digest);
  const lastResult = useCareerStore((s) => s.lastResult);

  const burnout = lastResult?.kind === 'burnout';

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
      <div className="c-label" style={{ color: 'var(--c-accent)' }}>
        Age {player.age}, closed
      </div>

      {burnout ? (
        <>
          <h2 className="c-display text-[26px] mt-1.5" style={{ color: 'var(--c-ink)' }}>
            You stopped
          </h2>
          <p
            className="c-prose mt-3"
            style={{ paddingLeft: 14, borderLeft: '2px solid var(--c-bad)', color: 'var(--c-ink)' }}
          >
            {lastResult.text}
          </p>
        </>
      ) : (
        <>
          <h2 className="c-display text-[26px] mt-1.5" style={{ color: 'var(--c-ink)' }}>
            What the year came to
          </h2>

          {planResults.length > 0 && (
            <div className="mt-4 grid gap-3.5">
              {planResults.map((r) => (
                <div key={r.id} style={{ paddingLeft: 14, borderLeft: `2px solid ${GRADE_TONE[r.grade]}` }}>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="c-display text-[16px]" style={{ color: 'var(--c-ink)' }}>
                      {r.label}
                    </span>
                    {r.blocks > 1 && (
                      <span className="c-num text-[12px] shrink-0" style={{ color: 'var(--c-faint)' }}>
                        ×{r.blocks}
                      </span>
                    )}
                  </div>
                  <p className="c-prose" style={{ fontSize: 13.5, color: 'var(--c-muted)' }}>
                    {r.text}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {Object.entries(r.effects.stat_deltas).map(([k, v]) => (
                      <span key={k} className="text-[11px]" style={{ color: 'var(--c-good)' }}>
                        {STAT_LABELS[k]} +{v.toFixed(2)}
                      </span>
                    ))}
                    {Object.entries(r.effects.reputation_deltas).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-[11px]"
                        style={{ color: v > 0 ? 'var(--c-good)' : 'var(--c-bad)' }}
                      >
                        {k} {v > 0 ? '+' : ''}{v}
                      </span>
                    ))}
                    {r.effects.publications > 0 && (
                      <span className="text-[11px]" style={{ color: 'var(--c-good)' }}>
                        {r.effects.publications} paper{r.effects.publications > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {digest.length > 0 && (
            <>
              <div className="c-rule my-5"><span style={{ fontSize: 10 }}>◆</span></div>
              <div className="c-label mb-2.5">Meanwhile</div>
              <div className="grid gap-3">
                {digest.map((d, i) => (
                  <div key={i}>
                    <div className="c-display text-[15px]" style={{ color: 'var(--c-ink)' }}>
                      {d.title}
                    </div>
                    <p className="c-prose" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                      {d.text}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
