// What the player's job IS, level by level.
//
// The existing `unlockedFeatures` answers "may this widget exist yet", which is
// binary: hidden or shown. That is enough to stop level 1 being overwhelming
// and not enough to stop level 8 being level 1 with seven more panels bolted
// on. Nothing ever steps back, so the interface only ever accumulates.
//
// Three states instead:
//
//   HIDDEN      not rendered. The player has no use for it and no way to read
//               it yet.
//   PERIPHERAL  present, readable, deliberately quiet. Small, dim, compact.
//               The quantity exists before it becomes the lesson.
//   PRIMARY     this is today's job. Biggest region, largest type, first thing
//               your eye lands on.
//
// The important half is that groups RECEDE. Stability is the whole game at
// level 1 and is peripheral by level 4, not because it stopped mattering but
// because keeping the plasma alive is no longer the thing being asked of you.
// A group that has been primary and later drops back to peripheral is the
// interface saying "you know this now".
//
// Pure module, no React. `scripts/units_check.mjs` asserts the progression
// holds, including that nothing regresses to HIDDEN once seen.

export const FOCUS = {
  HIDDEN: 'hidden',
  PERIPHERAL: 'peripheral',
  PRIMARY: 'primary',
};

const { HIDDEN: H, PERIPHERAL: P, PRIMARY: X } = FOCUS;

/**
 * The information groups, named for the question each answers.
 *
 *   stability   is the plasma alive and behaving: T, n, tau_E, disruption risk
 *   gain        is it producing enough fusion to matter: Q, fusion power
 *   endurance   will the machine survive the run: wall, divertor, tritium, quench
 *   power       does any of it reach the meter: gross, recirculating, net
 *   scale       is it a power station: homes, capacity, sustained output
 *   economics   does it sell: LCOE, funds, cost per MWh
 */
export const FOCUS_GROUPS = ['stability', 'gain', 'endurance', 'power', 'scale', 'economics'];

/**
 * Level by level, one row per level. Read down a column to see a group's arc.
 *
 * Levels 1-2  keeping it lit is the entire job. Q is visible but quiet: the
 *             interface must not imply that maximising it is today's task.
 * Levels 3-4  the plasma stays alive now, so the question becomes whether it
 *             is actually fusing. Stability steps back.
 * Level 5     sustaining the machine is the challenge, so wear and heat load
 *             come forward.
 * Level 6     where "Q > 1" stops meaning "power plant works". Gross against
 *             recirculating against net becomes the story.
 * Level 7     scale: a million homes, held.
 * Level 8     economics takes the headline; the plasma is still there and no
 *             longer occupies half the screen.
 */
const TABLE = {
  1: { stability: X, gain: H, endurance: H, power: H, scale: H, economics: H },
  2: { stability: X, gain: P, endurance: H, power: H, scale: H, economics: H },
  3: { stability: P, gain: X, endurance: H, power: H, scale: H, economics: H },
  4: { stability: P, gain: X, endurance: P, power: P, scale: H, economics: H },
  5: { stability: P, gain: P, endurance: X, power: P, scale: H, economics: P },
  6: { stability: P, gain: P, endurance: P, power: X, scale: P, economics: P },
  7: { stability: P, gain: P, endurance: P, power: P, scale: X, economics: P },
  8: { stability: P, gain: P, endurance: P, power: P, scale: P, economics: X },
};

const MAX_LEVEL = 8;

/** The focus map for a level. Sandbox and anything past the campaign use L8. */
export function focusFor(levelId) {
  const id = Math.min(Math.max(Number(levelId) || 1, 1), MAX_LEVEL);
  return TABLE[id];
}

/** Convenience: is this group worth rendering at all right now? */
export function isVisible(levelId, group) {
  return focusFor(levelId)[group] !== HIDDEN;
}

/** Convenience: is this group today's job? */
export function isPrimary(levelId, group) {
  return focusFor(levelId)[group] === FOCUS.PRIMARY;
}

/** Every level in order, for the checks and for anything that wants the arc. */
export const FOCUS_LEVELS = Object.keys(TABLE).map(Number).sort((a, b) => a - b);
