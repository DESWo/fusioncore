// Stress (spec §3). An integer 0..100 that quietly taxes every check once it
// passes 60, and takes a year away from you at 100.
import { BALANCE } from './balance.js';

/** Named stress deltas so content authors never hand-tune numbers (§3.2/3.3). */
export const STRESS = {
  MINOR_SETBACK: 5,
  STANDARD_SETBACK: 10,
  MAJOR_SETBACK: 20,
  HIGH_WORKLOAD: 8,
  RELATIONSHIP_CONFLICT: 7,
  LIFE_EVENT: 15,
  SUCCESS: -5,
  MAJOR_SUCCESS: -10,
  REST: -15,
  MENTORING: -3,
  RELATIONSHIP_POSITIVE: -5,
  SABBATICAL: -30,
};

export function clampStress(value) {
  return Math.min(Math.max(Math.round(value), 0), BALANCE.STRESS_MAX);
}

export function applyStress(stress, delta) {
  return clampStress(stress + (delta ?? 0));
}

/** The yearly baseline tax; career weight accumulates after 40 (§3.5). */
export function yearlyBaseline(age) {
  return age >= BALANCE.STRESS_YEARLY_BASE_AGE
    ? BALANCE.STRESS_YEARLY_BASE_OVER_40
    : BALANCE.STRESS_YEARLY_BASE;
}

export const STRESS_BAND = {
  CALM: 'calm',
  ELEVATED: 'elevated',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/** Colour bands for the bar (§3.1). */
export function stressBand(stress) {
  if (stress <= 30) return STRESS_BAND.CALM;
  if (stress <= 60) return STRESS_BAND.ELEVATED;
  if (stress <= 80) return STRESS_BAND.HIGH;
  return STRESS_BAND.CRITICAL;
}

export function stressColor(stress) {
  return {
    [STRESS_BAND.CALM]: 'var(--color-safe)',
    [STRESS_BAND.ELEVATED]: '#EAB308',
    [STRESS_BAND.HIGH]: 'var(--color-warn)',
    [STRESS_BAND.CRITICAL]: 'var(--color-crit)',
  }[stressBand(stress)];
}

/** Is the player in the zone where bad things fire on their own (§3.4)? */
export function inBurnoutRisk(stress) {
  return stress >= BALANCE.STRESS_RANDOM_NEGATIVE_THRESHOLD && stress < BALANCE.STRESS_BURNOUT;
}

export function hitBurnout(stress) {
  return stress >= BALANCE.STRESS_BURNOUT;
}

/**
 * Burnout costs the player a year outright and resets stress to 40 (§3.4).
 * Returns the post-sabbatical stress plus the line the game shows.
 */
export function burnoutRecovery() {
  return {
    stress: BALANCE.STRESS_BURNOUT_RECOVERY,
    text: 'You burned out. You took a year off. It was necessary.',
  };
}

/** A short read on how the player is holding up, for the HUD. */
export function stressNote(stress) {
  const band = stressBand(stress);
  if (band === STRESS_BAND.CALM) return 'Steady. You sleep fine.';
  if (band === STRESS_BAND.ELEVATED) return 'Busy, but holding.';
  if (band === STRESS_BAND.HIGH) return 'Fraying. Everything is harder than it should be.';
  return 'Running on fumes. Something is going to give.';
}
