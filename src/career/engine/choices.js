// Resolving a choice: the single place a choice's modifiers are assembled and
// turned into an outcome.
//
// This exists because resolution is now deterministic. When outcomes were
// rolled, the UI could not usefully say anything about a choice before you
// committed to it, so the store owned resolution alone. Now the answer is
// knowable in advance, and the interface should tell you: picking blind into a
// predetermined failure is strictly worse than a dice roll, because at least a
// roll gave you a reason to try.
//
// The store and the choice list both call this, so what you are shown before
// committing and what actually happens cannot drift apart. That is the whole
// point of the module: two copies of this arithmetic would eventually disagree,
// and the disagreement would look like a bug in the game rather than in the UI.

import { resolveCheck, resolveTiered, OUTCOME } from './checks.js';
import { relationshipModifier } from './relationships.js';
import { grantModifier } from './reputation.js';
import { healthModifier } from './life.js';

/** Everything that shifts a check away from the raw stat. */
export function choiceModifier({ choice, event, relationships, reputation, health }) {
  return (
    (choice.stat_check?.modifier ?? 0) +
    relationshipModifier(relationships ?? [], {
      npcIds: event?.npcs ?? [],
      roles: event?.grant ? ['administrator', 'rival'] : [],
    }) +
    (event?.grant ? grantModifier(reputation ?? {}) : 0) +
    healthModifier(health ?? 90)
  );
}

/**
 * Resolve a choice to the outcome key its event data is written against.
 *
 * Returns `{ outcomeKey, checkInfo, gated }`.
 *   outcomeKey  'excellent' | 'success' | 'failure', matching choice.outcomes
 *   checkInfo   the raw resolver result, or null for an unchecked choice
 *   gated       true when this character cannot clear the check
 *
 * `gated` is not a probability and not a hint. It is a fact about the
 * character: their stats, health and stress do not reach what this choice
 * asks. A gated choice stays selectable on purpose, because its failure branch
 * is authored content that this is the right character to see.
 */
export function resolveChoice({ choice, event, player, relationships, reputation }) {
  if (!choice?.stat_check) {
    return { outcomeKey: 'success', checkInfo: null, gated: false };
  }

  const args = {
    stats: player.stats,
    statKeys: choice.stat_check.stats,
    modifier: choiceModifier({
      choice, event, relationships, reputation, health: player.health,
    }),
    stress: player.stress,
  };

  const tiered = Boolean(choice.stat_check.tiered && choice.outcomes?.excellent);
  const checkInfo = tiered ? resolveTiered(args) : resolveCheck(args);

  const outcomeKey = tiered
    ? (checkInfo.outcome === OUTCOME.EXCELLENT ? 'excellent'
      : checkInfo.outcome === OUTCOME.ADEQUATE ? 'success'
      : 'failure')
    : (checkInfo.passed ? 'success' : 'failure');

  return { outcomeKey, checkInfo, gated: outcomeKey === 'failure' };
}
