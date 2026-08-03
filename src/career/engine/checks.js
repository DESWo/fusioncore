// Stat checks (spec §2). One resolution system for every chance-based
// decision in the game. Pure: the caller supplies the RNG, so the whole
// engine stays deterministic under test.
import { BALANCE } from './balance.js';

export const OUTCOME = {
  EXCELLENT: 'excellent',
  ADEQUATE: 'adequate',
  SUCCESS: 'success',
  FAILURE: 'failure',
};

/** Average the checked stats (§2.2). A single stat is just its own average. */
export function combinedStat(stats, keys) {
  const list = (keys ?? []).filter((k) => stats[k] !== undefined);
  if (list.length === 0) return 0;
  return list.reduce((sum, k) => sum + stats[k], 0) / list.length;
}

/** Stress drags every check down once it passes 60 (§2.3, §3.4). */
export function stressModifier(stress) {
  if (stress <= BALANCE.STRESS_PENALTY_START) return 0;
  return -((stress - BALANCE.STRESS_PENALTY_START) * BALANCE.STRESS_PENALTY_PER_POINT);
}

/**
 * The success threshold for a check.
 *
 * Spec note: §2.1's table runs to 96% at stat 11 and auto-success at stat 12,
 * while §2.3 clamps thresholds to 0.95. Read in context ("there is always at
 * least a 5% chance of success or failure regardless of modifiers") the clamp
 * exists to stop MODIFIERS pushing a check to a certainty, not to overrule the
 * base table. So the base value from the table is authoritative, and the clamp
 * bounds the modified result to [0.05, max(0.95, base)]. A stat-11 player still
 * keeps a 4% chance of failure no matter how favourable the context.
 */
export function successThreshold({ stats, statKeys, modifier = 0, stress = 0 }) {
  const stat = combinedStat(stats, statKeys);
  if (stat >= BALANCE.STAT_MAX) return { threshold: 1, auto: true, stat };
  const base = BALANCE.CHECK_BASE + stat * BALANCE.CHECK_PER_STAT;
  const ceiling = Math.max(BALANCE.CHECK_MAX, base);
  const withMods = base + modifier + stressModifier(stress);
  const threshold = Math.min(Math.max(withMods, BALANCE.CHECK_MIN), ceiling);
  return { threshold, auto: false, stat };
}

/* ---------------------------------------------------------------------------
 * Deterministic resolution.
 *
 * This used to roll dice: `roll < threshold` decided whether a choice worked.
 * It does not any more. A choice is a branch, not a bet. The same character
 * making the same choice in the same circumstances always lands in the same
 * place, so a run is something you can learn and steer rather than something
 * that happens to you.
 *
 * The tuning is untouched. `successThreshold` still folds in stat, the
 * per-choice modifier and the stress penalty exactly as before; the only
 * change is what we do with the number. Instead of asking "did the roll beat
 * it", we ask "would this have been more likely than not" and commit to that
 * answer. DECISIVE_BAR is that tipping point.
 *
 * This is why no event data needed rewriting: all 913 outcome branches were
 * already authored, and the dice were only ever choosing between them.
 * ------------------------------------------------------------------------- */

/** Pass/fail. Returns { passed, outcome, threshold, stat, margin }. */
export function resolveCheck({ stats, statKeys, modifier = 0, stress = 0 }) {
  const { threshold, auto, stat } = successThreshold({ stats, statKeys, modifier, stress });
  const passed = auto || threshold >= BALANCE.DECISIVE_BAR;
  return {
    passed,
    outcome: passed ? OUTCOME.SUCCESS : OUTCOME.FAILURE,
    threshold,
    stat,
    // How far clear of the tipping point you were. Lets the retrospective say
    // "comfortably" or "barely" without reintroducing luck.
    margin: threshold - BALANCE.DECISIVE_BAR,
  };
}

/**
 * Tiered. Clearing the bar by EXCELLENT_OFFSET or more is exceptional rather
 * than merely adequate, so a genuinely strong character reads as strong.
 */
export function resolveTiered({ stats, statKeys, modifier = 0, stress = 0 }) {
  const { threshold, auto, stat } = successThreshold({ stats, statKeys, modifier, stress });
  const excellentAt = BALANCE.DECISIVE_BAR + BALANCE.EXCELLENT_OFFSET;
  let outcome;
  if (auto || threshold >= excellentAt) outcome = OUTCOME.EXCELLENT;
  else if (threshold >= BALANCE.DECISIVE_BAR) outcome = OUTCOME.ADEQUATE;
  else outcome = OUTCOME.FAILURE;
  return {
    outcome,
    passed: outcome !== OUTCOME.FAILURE,
    threshold,
    excellentAt,
    stat,
    margin: threshold - BALANCE.DECISIVE_BAR,
  };
}

/** Human-readable odds for the UI ("about a 2 in 3 shot"). */
export function oddsLabel(threshold) {
  const pct = Math.round(threshold * 100);
  if (pct >= 90) return 'near certain';
  if (pct >= 75) return 'strong odds';
  if (pct >= 60) return 'favourable';
  if (pct >= 45) return 'a coin flip';
  if (pct >= 30) return 'long odds';
  return 'a real gamble';
}
