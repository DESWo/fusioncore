import { motion, AnimatePresence } from 'framer-motion';
import { useCareerStore } from '../careerStore.js';
import { STAT_LABELS } from '../engine/balance.js';
import { successThreshold, oddsLabel } from '../engine/checks.js';
import { relationshipModifier } from '../engine/relationships.js';
import { grantModifier } from '../engine/reputation.js';

const KICKER = {
  callback: { text: 'Someone remembered', color: 'var(--c-violet)' },
  transition: { text: 'A hinge', color: 'var(--c-accent)' },
  sim: { text: 'At the machine', color: 'var(--c-accent)' },
};

const RESULT_TONE = {
  excellent: { label: 'Exceptional', color: 'var(--c-good)' },
  success: { label: null, color: 'var(--c-accent)' },
  failure: { label: 'It did not go your way', color: 'var(--c-bad)' },
  adequate: { label: null, color: 'var(--c-accent)' },
  burnout: { label: 'You stopped', color: 'var(--c-bad)' },
};

/** Odds shown before committing, in words rather than percentages. */
function Odds({ choice, event }) {
  const player = useCareerStore((s) => s.player);
  const relationships = useCareerStore((s) => s.relationships);
  const reputation = useCareerStore((s) => s.reputation);
  if (!choice.stat_check) return null;

  const mods =
    (choice.stat_check.modifier ?? 0) +
    relationshipModifier(relationships, {
      npcIds: event.npcs ?? [],
      roles: event.grant ? ['administrator', 'rival'] : [],
    }) +
    (event.grant ? grantModifier(reputation) : 0);

  const { threshold, auto } = successThreshold({
    stats: player.stats,
    statKeys: choice.stat_check.stats,
    modifier: mods,
    stress: player.stress,
  });
  const names = choice.stat_check.stats.map((k) => STAT_LABELS[k]).join(' and ');

  return (
    <span
      className="block mt-1.5 text-[11px] italic"
      style={{ color: 'var(--c-faint)' }}
    >
      {names} · {auto ? 'certain' : oddsLabel(threshold)}
      {mods < -0.001 && <span style={{ color: 'var(--c-bad)' }}> · something is working against you</span>}
      {mods > 0.001 && <span style={{ color: 'var(--c-good)' }}> · someone vouched for you</span>}
    </span>
  );
}

function Deltas({ toasts }) {
  if (!toasts?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
      {toasts.map((t, i) => (
        <span
          key={i}
          className="text-[11px]"
          style={{ color: t.value > 0 ? 'var(--c-good)' : 'var(--c-bad)' }}
        >
          {t.kind === 'stat_up' || t.kind === 'stat_down'
            ? `${STAT_LABELS[t.key] ?? t.key} ${t.value > 0 ? '+' : ''}${t.value.toFixed(2)}`
            : `${t.key} ${t.value > 0 ? '+' : ''}${t.value}`}
        </span>
      ))}
    </div>
  );
}

export default function EventCard() {
  const yearQueue = useCareerStore((s) => s.yearQueue);
  const currentIndex = useCareerStore((s) => s.currentIndex);
  const lastResult = useCareerStore((s) => s.lastResult);
  const choose = useCareerStore((s) => s.choose);
  const nextEvent = useCareerStore((s) => s.nextEvent);
  const launchSim = useCareerStore((s) => s.launchSim);
  const resolveSim = useCareerStore((s) => s.resolveSim);

  const entry = yearQueue[currentIndex];
  if (!entry) return null;
  const { event } = entry;
  const isSim = event.type === 'reactor_sim';
  const resolved = !!lastResult;
  const kicker = KICKER[entry.source];
  const tone = RESULT_TONE[lastResult?.kind] ?? RESULT_TONE.success;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${event.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {kicker && (
            <div className="c-label mb-2" style={{ color: kicker.color }}>
              {kicker.text}
            </div>
          )}

          <h2 className="c-display text-[26px]" style={{ color: 'var(--c-ink)' }}>
            {event.title}
          </h2>

          <p className="c-prose mt-3">{event.text}</p>

          {resolved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5"
            >
              <div className="c-rule mb-3">
                <span style={{ fontSize: 10 }}>◆</span>
              </div>
              {tone.label && (
                <div className="c-label mb-1.5" style={{ color: tone.color }}>
                  {tone.label}
                </div>
              )}
              <p
                className="c-prose"
                style={{ color: 'var(--c-ink)', paddingLeft: 14, borderLeft: `2px solid ${tone.color}` }}
              >
                {lastResult.text}
              </p>
              <Deltas toasts={lastResult.toasts} />
            </motion.div>
          )}

          {!resolved && !isSim && (
            <div className="grid gap-2.5 mt-6">
              {(event.choices ?? []).map((c, i) => (
                <button key={c.label} onClick={() => choose(i)} className="c-choice">
                  <span className="text-[15px]" style={{ color: 'var(--c-ink)' }}>{c.label}</span>
                  <Odds choice={c} event={event} />
                </button>
              ))}
            </div>
          )}

          {!resolved && isSim && (
            <div className="grid gap-2.5 mt-6">
              <div className="c-card px-4 py-3">
                <div className="c-label mb-1" style={{ color: 'var(--c-accent)' }}>The run</div>
                <p className="text-[13px]" style={{ color: 'var(--c-muted)' }}>
                  {event.sim.difficulty}
                </p>
              </div>
              <button onClick={() => launchSim(event.sim)} className="c-btn w-full py-3.5 text-[14px]">
                Take the controls
              </button>
              <button
                onClick={() => resolveSim(event.sim.sim_id, 'adequate')}
                className="c-btn-ghost w-full py-3 text-[13px]"
              >
                Let the team run it
              </button>
              <p className="text-[11px] text-center italic" style={{ color: 'var(--c-faint)' }}>
                Skipping resolves as a solid result. No penalty.
              </p>
            </div>
          )}

          {resolved && (
            <button
              onClick={nextEvent}
              autoFocus
              className="c-btn w-full mt-6 py-3.5 text-[14px]"
            >
              Go on
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
