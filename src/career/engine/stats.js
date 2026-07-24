// Stat growth and decay (spec §1). Stats are floats internally and floor to
// integers for display; the bar fills proportionally inside the current
// integer segment (7.6 reads as "7" with a 60%-filled segment).
// Pure module: no state, no randomness. Runs headless.
import { BALANCE, STATS } from './balance.js';

/** Growth gets harder the higher a stat already sits (§1.3). */
export function diminishingFactor(value) {
  const bands = Object.keys(BALANCE.DIMINISHING)
    .map(Number)
    .sort((a, b) => a - b);
  for (const upper of bands) {
    if (value <= upper) return BALANCE.DIMINISHING[upper];
  }
  return BALANCE.DIMINISHING[bands[bands.length - 1]];
}

/**
 * The actual delta applied to a stat, given the base delta and the player's
 * age. Gains are scaled by diminishing returns and (past 50) the age cap;
 * losses are applied at face value: nothing protects you from a bad year.
 */
export function effectiveDelta(base, currentValue, age) {
  if (base <= 0) return base; // §1.4 losses are unscaled
  let gain = base * diminishingFactor(currentValue);
  if (age >= BALANCE.AGE_GROWTH_PENALTY_START) {
    gain *= BALANCE.AGE_GROWTH_MULTIPLIER; // §1.5
  }
  return gain;
}

/** Clamp to the hard 1..12 range (§1.1, §1.4). */
export function clampStat(value) {
  return Math.min(Math.max(value, BALANCE.STAT_MIN), BALANCE.STAT_MAX);
}

/**
 * Apply a map of base deltas to a stat block. Returns a NEW stat block plus
 * the deltas that were actually applied (for the "+0.3 Intuition" toasts).
 */
export function applyStatDeltas(stats, deltas, age) {
  const next = { ...stats };
  const applied = {};
  for (const [key, base] of Object.entries(deltas ?? {})) {
    if (!STATS.includes(key)) continue;
    const delta = effectiveDelta(base, next[key], age);
    const before = next[key];
    next[key] = clampStat(next[key] + delta);
    const real = next[key] - before;
    if (Math.abs(real) > 1e-9) applied[key] = real;
  }
  return { stats: next, applied };
}

/** What the player sees: the floor (§1.2). */
export function displayStat(value) {
  return Math.floor(value);
}

/** How full the current integer segment is, 0..1, for the bar fill (§1.2). */
export function segmentFill(value) {
  if (value >= BALANCE.STAT_MAX) return 1;
  return value - Math.floor(value);
}

/** A fresh creation-time stat block: every stat starts at the minimum. */
export function baseStats() {
  return STATS.reduce((acc, k) => ({ ...acc, [k]: BALANCE.STAT_MIN }), {});
}

/** Points still unspent during character creation. */
export function pointsRemaining(stats) {
  const spent = STATS.reduce((sum, k) => sum + stats[k], 0);
  return BALANCE.STAT_POOL - spent;
}

/**
 * Creation rules: 1..10 per stat, 30 points total including the base 1s.
 * Backgrounds add on top afterwards and may exceed 10 (hard cap stays 12).
 */
export function canRaise(stats, key) {
  return stats[key] < BALANCE.STAT_CREATION_MAX && pointsRemaining(stats) > 0;
}
export function canLower(stats, key) {
  return stats[key] > BALANCE.STAT_MIN;
}

/** Apply a background's stat bonuses, allowed to push past the creation cap. */
export function applyBackground(stats, bonuses) {
  const next = { ...stats };
  for (const [k, v] of Object.entries(bonuses ?? {})) {
    if (!STATS.includes(k)) continue;
    next[k] = clampStat(next[k] + v);
  }
  return next;
}
