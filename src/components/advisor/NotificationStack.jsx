import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';
import Icon from '../common/Icon.jsx';

/**
 * The advisor stack, as a severity ladder rather than five tints of one tile.
 *
 * The five store priorities now differ in everything a glance can pick up:
 *
 *   1 PRIORITY 1  boxed, doubled outline, pulsing fill, largest type, icon
 *   2 WARNING     solid 2px crit border, bold caps title
 *   3 CAUTION     dashed warn border (the .status-warn shape), smaller
 *   4 ADVISORY    a 2px left rule, no box, title and body at one weight
 *   5 NOTE        a 1px left rule, dimmed to near-invisible, single line
 *
 * A note at rung 5 should cost the player nothing to ignore, which is the only
 * way rung 1 can mean anything.
 *
 * ENTITLEMENT. When a P1 or P2 is up, the routine traffic (4 and 5) collapses
 * into one muted line you can expand. A run-ending alert should not be queued
 * behind three pieces of trivia, and it should not have to shout over them.
 *
 * NEVER COLOUR ALONE: each rung carries its severity word, its own border
 * shape, and its own size. Three colourblind overlays swap the hues; none of
 * them touch any of that.
 *
 * MOTION honours the in-game reduced-motion setting AND the OS preference.
 * Framer animates inline styles, so the CSS clamp in index.css cannot reach
 * it: the gate has to be here. Under reduced motion the P1 fill holds solid
 * rather than disappearing.
 */

const RUNG = {
  1: {
    word: 'PRIORITY 1',
    box: 'status-crit bg-crit/20 p-2.5 pl-3',
    title: 'text-[12px] font-black tracking-[0.08em] text-crit',
    body: 'text-[11px] text-ink leading-snug mt-1',
    icon: true,
  },
  2: {
    word: 'WARNING',
    box: 'status-crit bg-crit/8 p-2',
    title: 'text-[11px] font-bold tracking-wide text-crit',
    body: 'text-[10px] text-ink/90 leading-snug mt-0.5',
    icon: true,
  },
  3: {
    word: 'CAUTION',
    box: 'status-warn bg-warn/8 p-2',
    title: 'text-[10px] font-bold tracking-wide text-warn',
    body: 'text-[10px] text-ink/85 leading-snug mt-0.5',
  },
  4: {
    word: 'ADVISORY',
    box: 'border-l-2 border-safe bg-safe/5 pl-2 pr-2 py-1.5',
    title: 'text-[10px] font-semibold text-safe',
    body: 'text-[10px] text-ink/75 leading-snug mt-0.5',
  },
  5: {
    word: 'NOTE',
    box: 'border-l border-raise-hi pl-2 pr-2 py-1',
    title: 'text-[9px] font-medium text-ink/55',
    body: 'text-[9px] text-ink/50 leading-snug',
  },
};

const rungOf = (p) => RUNG[p] ?? RUNG[5];

export default function NotificationStack() {
  const notifications = useReactorStore((s) => s.notifications);
  const dismiss = useReactorStore((s) => s.dismissNotification);
  const settingStill = useReactorStore((s) => s.settings.reducedMotion);
  const osStill = useReducedMotion();
  const still = settingStill || osStill;
  const [showRoutine, setShowRoutine] = useState(false);

  // Already severity-sorted by the store (priority, then most recent).
  const all = notifications.filter((n) => !n.requiresAck);
  const critical = all.some((n) => n.priority <= 2);
  const routine = critical ? all.filter((n) => n.priority >= 4) : [];
  const front = (critical ? all.filter((n) => n.priority <= 3) : all).slice(0, 4);
  const shown = showRoutine ? [...front, ...routine.slice(0, 3)] : front;

  return (
    <div className="px-2 grid gap-1.5" aria-label="Operator alerts">
      <AnimatePresence initial={false}>
        {shown.map((n) => {
          const rung = rungOf(n.priority);
          return (
            <motion.div
              key={n.id}
              layout
              initial={still ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={still ? { duration: 0 } : undefined}
              className={`relative overflow-hidden ${rung.box}`}
              role={n.priority <= 2 ? 'alert' : 'status'}
            >
              {n.priority === 1 && (
                <motion.div
                  className="absolute inset-0 bg-crit/25 pointer-events-none"
                  initial={false}
                  animate={still ? { opacity: 1 } : { opacity: [0.2, 1, 0.2] }}
                  transition={still ? { duration: 0 } : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              )}
              <div className="relative">
                <div className="flex items-start justify-between gap-1">
                  <span className={`flex items-center gap-1 min-w-0 ${rung.title}`}>
                    {rung.icon && <Icon name="warn" className={n.priority === 1 ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} />}
                    <span className="min-w-0">{n.title}</span>
                    {n.cite && <Cite id={n.cite} />}
                    <SpeakerIcon text={`${rung.word}. ${n.title}. ${n.text}`} />
                  </span>
                  <button
                    onClick={() => dismiss(n.id)}
                    aria-label={`Dismiss ${n.title}`}
                    className="text-ink/45 hover:text-ink px-1 inline-flex items-center shrink-0"
                  >
                    <Icon name="x" className="w-3 h-3" />
                  </button>
                </div>
                {/* The severity word, not just the hue. Rung 5 does without it:
                    a note that announces itself as a note is still noise. */}
                {n.priority <= 4 && (
                  <div className="label-mono text-[8px] text-ink/50 mt-0.5">{rung.word}</div>
                )}
                <p className={rung.body}>{n.text}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {routine.length > 0 && (
        <button
          onClick={() => setShowRoutine((v) => !v)}
          aria-expanded={showRoutine}
          className="label-mono text-[9px] text-ink/45 hover:text-ink/80 flex items-center gap-1 px-1 py-0.5"
        >
          <Icon name={showRoutine ? 'chevronDown' : 'chevronRight'} className="w-2.5 h-2.5" />
          {showRoutine ? 'Hide' : `${routine.length} routine`}
        </button>
      )}
    </div>
  );
}
