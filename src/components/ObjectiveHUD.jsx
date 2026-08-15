import { useReactorStore, levelFor } from '../store/reactorStore.js';
import { fmtSci } from '../utils/units.js';

/**
 * What you are trying to do, and how close you are to it.
 *
 * This replaces two things that were both saying half of it: a caption over
 * the stage that named the objective without measuring it, and a panel in the
 * instrument column that measured the hold without naming the threshold. A
 * player at Q 0.83 could see neither that 1.00 was the bar nor how far off
 * they were.
 *
 * It sits with the hero numbers rather than in the column, because it is the
 * one piece of text that should never require looking for.
 *
 * The threshold comes from `level.target`, a declarative descriptor sitting
 * beside the level's `check`. `check` remains the thing that actually gates the
 * mission; the target only draws the bar. A check in units_check.mjs asserts
 * the two agree, so the bar can never fill while the mission refuses to pass.
 */

function fmtTargetValue(t, v) {
  if (!Number.isFinite(v)) return '--';
  if (t.sci) return fmtSci(v);
  return v.toFixed(t.dp ?? 0);
}

export default function ObjectiveHUD() {
  const mode = useReactorStore((s) => s.mode);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const levelId = useReactorStore((s) => s.level.id);
  const sustain = useReactorStore((s) => s.level.sustain);
  const completed = useReactorStore((s) => s.level.completed);
  const sim = useReactorStore((s) => s.sim);

  const level = levelFor(mode, levelId, plantKey);
  if (completed || !level) return null;

  const t = level.target;
  const holdFrac = Math.min(sustain / level.sustainTicks, 1);
  const holding = sustain > 0;

  // Progress toward the threshold, clamped. For a goal of 0 (net power) the
  // meaningful reading is "are you above the line", not a ratio, so the bar
  // fills the moment you cross rather than pretending 0 is a percentage.
  let reachFrac = null;
  let current = null;
  if (t) {
    current = t.read(sim);
    reachFrac = t.goal === 0
      ? (current > 0 ? 1 : 0)
      : Math.min(Math.max(current / t.goal, 0), 1);
  }

  return (
    <div className="pointer-events-none select-none">
      <div className="label-mono text-[10px] text-accent mb-1">
        Objective
      </div>
      <div className="text-ink font-medium text-[15px] leading-snug max-w-lg">
        {level.objective}
      </div>

      {t && (
        <div className="mt-2 max-w-sm">
          <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
            <span className="text-ink/70">{t.label}</span>
            <span className="tabular-nums">
              <span className={reachFrac >= 1 ? 'text-safe' : 'text-ink'}>
                {fmtTargetValue(t, current)}
              </span>
              <span className="text-ink/45"> / {fmtTargetValue(t, t.goal)}{t.unit ? ` ${t.unit}` : ''}</span>
            </span>
          </div>
          {/* The bar is the threshold made visible: full means you are at the
              bar, not that the mission is won. Holding it is the second half. */}
          <div className="h-1 mt-1 bg-raise/70 overflow-hidden rounded-full">
            <div
              className={`h-full transition-[width] duration-300 ${reachFrac >= 1 ? 'bg-safe' : 'bg-accent'}`}
              style={{ width: `${reachFrac * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Hold is a separate idea from reach, and reads as one only once you
          are actually at the threshold. Hidden until then so the opening
          screen is not carrying a bar that cannot move yet. */}
      {holding && (
        <div className="mt-1.5 max-w-sm">
          <div className="flex items-baseline justify-between font-mono text-[10px] text-ink/60">
            <span>holding</span>
            <span className="tabular-nums">{Math.round(holdFrac * 100)}%</span>
          </div>
          <div className="h-[3px] mt-1 bg-raise/70 overflow-hidden rounded-full">
            <div className="h-full bg-safe transition-[width] duration-200" style={{ width: `${holdFrac * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
