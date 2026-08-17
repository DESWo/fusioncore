import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import { HAZARD_GRACE_TICKS } from '../../engine/constants.js';
import Icon from '../common/Icon.jsx';

/**
 * Live countdown strips: you crossed a limit, and the consequence is now on a
 * clock.
 *
 * THE LADDER
 * Everything on this panel used to be the same tile: a hazard twelve seconds
 * out and a hazard actively eating the divertor were one design in two colours.
 * They are now four rungs that differ in size, weight, type scale, how much of
 * the panel they take, and (at the top) whether they own the edge of the
 * screen. Severity is legible from across the room, before any word is read.
 *
 *   exceeded  one quiet line, dashed warn border          (grace > 50%)
 *   urgent    a block with a large timer and a drain bar  (grace <= 50%)
 *   imminent  a tall block, timer at 3xl, screen edge ring (<= 3 s)
 *   breach    the same, held solid: damage is accumulating now
 *
 * NEVER COLOUR ALONE. Three colourblind overlays swap safe/warn/crit, so each
 * rung also carries: its own word (LIMIT EXCEEDED / ACT NOW / IMMINENT /
 * DAMAGE IN PROGRESS), a distinct border shape via the existing .status-*
 * classes, a distinct size, and a numeric countdown plus a draining bar.
 * Remove all hue and the ordering still reads.
 *
 * MOTION. The top two rungs pulse. Under either reduced-motion signal (the
 * in-game setting or the OS preference) they hold SOLID instead of pulsing:
 * an alarm that is suppressed for accessibility is a safety regression, so the
 * animation is what goes away, never the alarm.
 */

const HAZARD_INFO = {
  // fusion
  greenwald: { label: 'DENSITY LIMIT', outcome: 'plasma collapse', fix: 'Lower Density or raise Field' },
  beta: { label: 'PRESSURE LIMIT', outcome: 'plasma collapse', fix: 'Raise Field or cut Heating' },
  divertor: { label: 'DIVERTOR OVER TEMP', outcome: 'armor erosion', fix: 'Add Cooling or cut Heating' },
  magnets: { label: 'MAGNETS OVER RATING', outcome: 'coil quench', fix: 'Lower Field' },
  // fission
  fuelTemp: { label: 'FUEL OVER TEMP', outcome: 'cladding damage', fix: 'Rods in or Pumps up' },
  coolant: { label: 'COOLANT NEAR BOILING', outcome: 'steam generator damage', fix: 'Pumps up or Rods in' },
};

/** Ticks left when a countdown stops being something you can think about. */
const IMMINENT_TICKS = 30; // 3 s at 10 Hz

const RUNG_WORD = {
  exceeded: 'LIMIT EXCEEDED',
  urgent: 'ACT NOW',
  imminent: 'IMMINENT',
  breach: 'DAMAGE IN PROGRESS',
};
const RUNG_RANK = { breach: 0, imminent: 1, urgent: 2, exceeded: 3 };

function rungOf(ticks, grace) {
  if (ticks === -1) return 'breach';
  if (ticks <= IMMINENT_TICKS) return 'imminent';
  return ticks / grace <= 0.5 ? 'urgent' : 'exceeded';
}

/**
 * Wall-clock seconds remaining at the CURRENT speed; rounds up so 0 s means
 * 0 s. Ticks drain at 10 x speed per real second, so a countdown that ignored
 * speed showed "12s" and then expired in 1.5 at 8x - the one display in the
 * game where lying about time costs the player their divertor. While paused
 * the clock is not draining; the 1x figure is shown as the resume-speed value.
 */
const secondsLeft = (ticks, speed) => Math.ceil(ticks / (10 * (speed > 0 ? speed : 1)));

/**
 * A countdown pulses fast because a clock is running out. A breach pulses slow
 * and shallow because it is not counting anything: the damage is continuous,
 * and a strobe held for the minutes a player might take to cool a divertor is
 * fatigue, not information. Both stay well under 3 Hz. Under reduced motion
 * both hold solid, which keeps the alarm and drops only the animation.
 */
function pulse(rung, still) {
  if (still) return { animate: { opacity: 1 }, transition: { duration: 0 } };
  const slow = rung === 'breach';
  return {
    animate: { opacity: slow ? [0.55, 1, 0.55] : [0.25, 1, 0.25] },
    transition: { duration: slow ? 1.6 : 0.8, repeat: Infinity, ease: 'easeInOut' },
  };
}

export default function HazardBanner() {
  const hazards = useReactorStore((s) => s.sim.hazards);
  const graceSetting = useReactorStore((s) => s.sim.difficulty?.graceTicks);
  const settingStill = useReactorStore((s) => s.settings.reducedMotion);
  const speed = useReactorStore((s) => s.speed);
  const osStill = useReducedMotion();
  const still = settingStill || osStill;
  const grace = graceSetting ?? HAZARD_GRACE_TICKS;

  const rows = Object.entries(hazards ?? {})
    .filter(([key, v]) => v !== 0 && HAZARD_INFO[key])
    .map(([key, v]) => ({ key, ticks: v, info: HAZARD_INFO[key], rung: rungOf(v, grace) }))
    .sort((a, b) => RUNG_RANK[a.rung] - RUNG_RANK[b.rung] || a.ticks - b.ticks);

  if (rows.length === 0) return null;
  const worst = rows[0].rung;
  const ownsTheScreen = worst === 'imminent' || worst === 'breach';

  return (
    <>
      {/* One assertive announcement per escalation. The countdown itself is
          deliberately NOT in a live region: at 10 Hz it would talk over
          everything, forever. */}
      <div className="sr-only" role="alert">
        {rows.map((r) => `${r.info.label} ${RUNG_WORD[r.rung]}`).join('. ')}
      </div>

      <div className="grid gap-1.5" role="group" aria-label="Active hazards">
        {rows.map((r) => (
          <HazardRow key={r.key} row={r} grace={grace} still={still} speed={speed} />
        ))}
      </div>

      {/* The loudest rung is entitled to more than its slot in the column.
          A portal, because the instrument column sets a backdrop-filter and
          would otherwise become the containing block for anything fixed.
          Non-interactive, and it sits under the modal layers (z-40/z-50). */}
      {ownsTheScreen && createPortal(
        <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
          <motion.div
            className="absolute inset-0 border-4 border-crit"
            style={{ boxShadow: 'inset 0 0 70px color-mix(in srgb, var(--color-crit) 30%, transparent)' }}
            initial={false}
            {...pulse(worst, still)}
          />
        </div>,
        document.body,
      )}
    </>
  );
}

function HazardRow({ row, grace, still, speed }) {
  const { info, ticks, rung } = row;
  const loud = rung === 'imminent' || rung === 'breach';
  const breach = rung === 'breach';
  const left = Math.max(ticks, 0) / grace;

  // The quiet rung: dashed border, small type, no bar and no big numeral.
  // It still carries the fix, because this is the rung with time left to act.
  if (rung === 'exceeded') {
    return (
      <div className="status-warn bg-warn/10 px-2 py-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-warn flex items-center gap-1.5 min-w-0">
            <Icon name="warn" className="w-3 h-3 shrink-0" />
            <span className="truncate">{info.label}</span>
            <span className="label-mono text-[8px] text-warn/70 shrink-0">{RUNG_WORD.exceeded}</span>
          </span>
          <span className="font-mono text-[11px] text-warn tabular-nums shrink-0">{secondsLeft(ticks, speed)}s</span>
        </div>
        <div className="text-[9px] text-ink/65 pl-[18px]">{info.fix}</div>
      </div>
    );
  }

  return (
    <div
      className={`status-crit bg-crit/15 relative overflow-hidden ${loud ? 'px-3 py-2.5' : 'px-2.5 py-1.5'}`}
    >
      {/* Pulse as an opacity ramp over a token-coloured fill, so the palette
          overlays keep working. Solid under reduced motion. */}
      {loud && (
        <motion.div
          className="absolute inset-0 bg-crit/25 pointer-events-none"
          initial={false}
          {...pulse(rung, still)}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`text-crit font-black flex items-center gap-1.5 ${loud ? 'text-[12px] tracking-[0.08em]' : 'text-[11px]'}`}>
            <Icon name="warn" className={`${loud ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
            <span className="truncate">{info.label}</span>
          </div>
          <div className={`label-mono text-crit/90 mt-0.5 ${loud ? 'text-[9px]' : 'text-[8px]'}`}>
            {RUNG_WORD[rung]}
          </div>
          <div className={`text-warn font-semibold mt-1 ${loud ? 'text-[11px]' : 'text-[10px]'}`}>
            {info.fix}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={`font-mono font-bold text-crit tabular-nums leading-none ${loud ? 'text-3xl' : 'text-base'}`}>
            {breach ? 'NOW' : `${secondsLeft(ticks, speed)}s`}
          </div>
          <div className={`text-ink/70 mt-1 ${loud ? 'text-[10px]' : 'text-[9px]'}`}>
            {breach ? `${info.outcome} ongoing` : `to ${info.outcome}`}
          </div>
        </div>
      </div>

      {/* The countdown without hue or digits: a bar that drains. Breach has no
          bar left to drain, so it reads as a full red rule. */}
      <div className="relative mt-2 h-1 bg-base/70">
        <div
          className="h-full bg-crit"
          style={{ width: breach ? '100%' : `${Math.min(Math.max(left, 0), 1) * 100}%` }}
        />
      </div>
    </div>
  );
}
