import { useState } from 'react';
import { useCareerStore } from '../careerStore.js';
import { BALANCE, STATS, STAT_LABELS, STAT_BLURBS } from '../engine/balance.js';
import { pointsRemaining } from '../engine/stats.js';
import { BACKGROUNDS } from '../data/backgrounds.js';
import { MOTIVATIONS } from '../engine/retrospective.js';

const TITLES = ['Who you are', 'Where you started', 'Why fusion'];

export default function CharacterCreation() {
  const [step, setStep] = useState(0);
  const player = useCareerStore((s) => s.player);
  const setDraft = useCareerStore((s) => s.setDraft);
  const adjustStat = useCareerStore((s) => s.adjustStat);
  const beginCareer = useCareerStore((s) => s.beginCareer);
  const exit = useCareerStore((s) => s.exit);

  const remaining = pointsRemaining(player.stats);
  const canFinish = player.name.trim() && player.background && player.motivation && remaining === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-5 pt-6 pb-3">
        <div className="c-label">Chapter one · {step + 1} of 3</div>
        <h1 className="c-display text-[30px] mt-1.5" style={{ color: 'var(--c-ink)' }}>
          {TITLES[step]}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {step === 0 && (
          <div className="grid gap-5">
            <div>
              <label htmlFor="cname" className="c-label">Your name</label>
              <input
                id="cname"
                value={player.name}
                onChange={(e) => setDraft({ name: e.target.value.slice(0, 28) })}
                placeholder="Type it in"
                className="w-full mt-2 px-3.5 py-3 text-[16px]"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <span className="c-label">What you bring</span>
                <span
                  className="c-num text-[14px]"
                  style={{ color: remaining === 0 ? 'var(--c-good)' : 'var(--c-accent)' }}
                >
                  {remaining} left
                </span>
              </div>
              <p className="c-prose mt-1.5 mb-3" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                Thirty points across five traits. Growth slows sharply above seven,
                so what you start with tends to stay your strength.
              </p>

              <div className="grid gap-2.5">
                {STATS.map((k) => {
                  const v = player.stats[k];
                  return (
                    <div key={k} className="c-card px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="c-display text-[16px]" style={{ color: 'var(--c-ink)' }}>
                            {STAT_LABELS[k]}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            onClick={() => adjustStat(k, -1)}
                            disabled={v <= BALANCE.STAT_MIN}
                            aria-label={`Lower ${STAT_LABELS[k]}`}
                            className="c-btn-ghost w-11 h-11 text-[18px] leading-none disabled:opacity-25"
                          >−</button>
                          <span className="c-num text-[20px] w-6 text-center" style={{ color: 'var(--c-accent)' }}>
                            {v}
                          </span>
                          <button
                            onClick={() => adjustStat(k, 1)}
                            disabled={remaining <= 0 || v >= BALANCE.STAT_CREATION_MAX}
                            aria-label={`Raise ${STAT_LABELS[k]}`}
                            className="c-btn-ghost w-11 h-11 text-[18px] leading-none disabled:opacity-25"
                          >+</button>
                        </div>
                      </div>
                      <div className="c-stat-track mt-2.5">
                        <div className="c-stat-fill" style={{ width: `${(v / BALANCE.STAT_MAX) * 100}%` }} />
                        <div className="c-stat-ticks" aria-hidden="true">
                          {Array.from({ length: BALANCE.STAT_MAX }, (_, i) => <span key={i} />)}
                        </div>
                      </div>
                      <p className="text-[12px] mt-2 italic" style={{ color: 'var(--c-faint)' }}>
                        {STAT_BLURBS[k]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-2.5">
            {BACKGROUNDS.map((b) => {
              const active = player.background === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setDraft({ background: b.id })}
                  aria-pressed={active}
                  className="c-choice"
                  style={active ? {
                    background: 'var(--c-accent-soft)',
                    borderLeftColor: 'var(--c-accent)',
                    borderColor: 'rgba(224,138,60,0.4)',
                  } : undefined}
                >
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="c-display text-[17px]" style={{ color: 'var(--c-ink)' }}>
                      {b.label}
                    </span>
                    <span className="c-num text-[12px] shrink-0" style={{ color: 'var(--c-good)' }}>
                      {Object.entries(b.bonuses).map(([k, v]) => `${k} +${v}`).join('  ')}
                    </span>
                  </div>
                  <p className="c-prose mt-1.5" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                    {b.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2.5">
            {Object.values(MOTIVATIONS).map((m) => {
              const active = player.motivation === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setDraft({ motivation: m.id })}
                  aria-pressed={active}
                  className="c-choice"
                  style={active ? {
                    background: 'var(--c-accent-soft)',
                    borderLeftColor: 'var(--c-accent)',
                    borderColor: 'rgba(224,138,60,0.4)',
                  } : undefined}
                >
                  <span className="c-display text-[17px]" style={{ color: 'var(--c-ink)' }}>
                    {m.label}
                  </span>
                  <p className="c-prose mt-1.5" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                    {m.blurb}
                  </p>
                </button>
              );
            })}
            <p className="text-[12px] mt-2 italic leading-relaxed" style={{ color: 'var(--c-faint)' }}>
              This is not a difficulty setting. At the end your life gets measured
              against it, and the distance between the two is part of the story.
            </p>
          </div>
        )}
      </div>

      <div
        className="shrink-0 p-5 flex gap-2.5"
        style={{ borderTop: '1px solid var(--c-line)' }}
      >
        <button
          onClick={() => (step === 0 ? exit() : setStep(step - 1))}
          className="c-btn-ghost px-5 py-3.5 text-[13px]"
        >
          {step === 0 ? 'Back' : 'Back'}
        </button>
        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            // Gate every step, not just the first: skipping the background step
            // used to land you on a permanently disabled "Begin at eighteen".
            disabled={
              step === 0
                ? !player.name.trim() || remaining !== 0
                : !player.background
            }
            className="c-btn flex-1 py-3.5 text-[14px]"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={beginCareer}
            disabled={!canFinish}
            className="c-btn flex-1 py-3.5 text-[14px]"
          >
            Begin at eighteen
          </button>
        )}
      </div>
    </div>
  );
}
