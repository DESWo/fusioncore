import { motion } from 'framer-motion';
import { useReactorStore, levelsFor, levelFor } from '../../store/reactorStore.js';
import { RD_BONUS_LEVEL } from '../../engine/constants.js';
import { scoreCampaign } from '../../engine/scorecard.js';
import { fmtMoney } from '../../utils/units.js';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

/** Framer Motion milestone cutscene between levels (spec §8). */
export default function LevelUpCutscene() {
  const level = useReactorStore((s) => s.pendingCutscene);
  const mode = useReactorStore((s) => s.mode);
  const complete = useReactorStore((s) => s.completeCutscene);
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const career = useReactorStore((s) => s.career);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const stats = useReactorStore((s) => s.stats);
  const econ = useReactorStore((s) => s.econ);
  const structure = useReactorStore((s) => s.sim.structure);
  const simSeconds = useReactorStore((s) => s.sim.time?.simSeconds);
  const difficultyLabel = useReactorStore((s) => s.sim.difficulty?.label ?? 'Operator');
  const dailySeed = useReactorStore((s) => s.sim.dailySeed ?? null);
  if (!level) return null;

  const modeLevels = levelsFor(mode, plantKey);
  const isFinal = level.id === modeLevels.length;
  // Graded only for the standalone campaign; career mode has its own review.
  const card = isFinal && !career
    ? scoreCampaign({ stats, econ, structure, simSeconds, difficulty: difficultyLabel })
    : null;

  return (
    <div className="fixed inset-0 z-40 bg-base/95 flex items-center justify-center p-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-lg text-center"
      >
        {/* pulse graphic: city lights coming on */}
        <motion.div
          aria-hidden="true"
          className="mx-auto mb-6 w-40 h-40 rounded-full relative"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 62%)' }}
          animate={reducedMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-ink">
            {level.id}
          </div>
        </motion.div>

        <div className="label-mono text-[10px] text-accent">
          [ {isFinal ? (career ? 'Posting complete' : 'Campaign complete') : `Mission ${level.id} complete`} ]
        </div>
        <h2 className="display-caps text-5xl sm:text-6xl mt-2 flex items-center justify-center gap-2">
          {level.name}
          <SpeakerIcon text={`Level ${level.id} complete: ${level.name}. ${level.cutscene}`} />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-ink/85 mt-4 leading-relaxed"
        >
          {level.cutscene}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-xs font-mono text-safe"
        >
          +{RD_BONUS_LEVEL.toLocaleString()} R&amp;D points
        </motion.div>
        {!isFinal && level.unlockText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-2 text-[11px] text-ink/70"
          >
            Unlocked: {level.unlockText}
          </motion.div>
        )}

        {/* Campaign scorecard: every figure here is read off the finished run. */}
        {card && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-6 border border-accent/40 bg-panel p-4 text-left"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
                Final review · {card.summary.difficulty}
              </span>
              <span className="font-mono text-3xl font-black leading-none text-ink">
                {card.grade}
                <span className="ml-1.5 text-xs font-bold text-ink/70">{card.score}/100</span>
              </span>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-ink/85">{card.verdict}</p>

            <div className="mt-3 grid gap-2">
              {card.parts.map((p) => (
                <div key={p.id}>
                  <div className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-ink/85">{p.label}</span>
                    <span className="font-mono text-ink/70">{p.detail}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-raise/70">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round(p.fraction * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-raise pt-2 font-mono text-[10px] text-ink/55">
              {/* summary.funds is raw dollars, so `.toFixed(2)}B` rendered a
                  $10B bank as "$9999974793.69B". fmtMoney picks the unit. */}
              {Math.round(card.summary.hours)} h online · {fmtMoney(card.summary.funds)} left
              {dailySeed && <> · daily plant {dailySeed}</>}
            </div>
            {dailySeed && (
              <p className="mt-1.5 text-[10px] leading-snug text-ink/55">
                Everyone who ran the {dailySeed} plant started from these same tolerances.
                Cost of power is the comparable number.
              </p>
            )}
          </motion.div>
        )}

        {/* Mission briefing for what comes next. The "what do I do now?" answer */}
        {!isFinal && (() => {
          const next = levelFor(mode, level.id + 1, plantKey);
          return (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-6 border border-accent/40 bg-panel p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
                  Next mission {next.id} of {modeLevels.length}: {next.name}
                </span>
                <SpeakerIcon text={`Next mission: ${next.name}. ${next.objective}. ${next.why} ${next.hint ?? ''}`} />
              </div>
              <p className="text-sm font-semibold mt-1.5">{next.objective}</p>
              <p className="text-[11px] text-ink/70 mt-1.5 leading-relaxed">{next.why}</p>
              {/* The idea, not the answer. The exact setpoints live behind the
                  in-game "stuck?" toggle so the mission stays a problem. */}
              {next.hint && (
                <p className="text-[11px] text-accent mt-1.5 leading-relaxed">▸ {next.hint}</p>
              )}
              {next.terms?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-raise">
                  <div className="text-[9px] uppercase tracking-widest text-ink/55 mb-1.5">
                    New terms you'll see on the dashboard
                  </div>
                  <div className="grid gap-1.5">
                    {next.terms.map((t) => (
                      <div key={t.term} className="text-[11px] leading-snug">
                        <span className="font-bold text-ink">{t.term}</span>
                        <span className="text-ink/70">: {t.def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

        <button
          onClick={complete}
          autoFocus
          className="mt-6 px-8 py-2.5 bg-accent text-base font-bold tracking-widest hover:brightness-110"
        >
          {isFinal ? (career ? 'READ PERFORMANCE REVIEW' : 'ENTER SANDBOX') : 'BEGIN MISSION'}
        </button>
      </motion.div>
    </div>
  );
}
