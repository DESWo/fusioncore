// Relationships (spec §5). People remember. A rivalry at 26 shows up on your
// grant panel at 38; someone you mentored at 34 offers you a lab at 48.
// Pure module; the caller supplies RNG for callback delays.
import { BALANCE } from './balance.js';

/** Named score changes (§5.2). */
export const REL = {
  COLLABORATED: 10,
  HELPED: 8,
  CHOSE_THEM: 5,
  COMPETED_WON: -10,
  COMPETED_LOST: -5,
  IGNORED: -7,
  SHARED_CREDIT: 6,
  SOLE_CREDIT: -12,
  SPOKE_WELL: 4,
  DISAGREED: -3,
};

export const TIER = {
  HOSTILE: 'hostile',
  COLD: 'cold',
  NEUTRAL: 'neutral',
  WARM: 'warm',
  ALLY: 'ally',
};

export const TIER_ORDER = [TIER.HOSTILE, TIER.COLD, TIER.NEUTRAL, TIER.WARM, TIER.ALLY];

export function tierOf(score) {
  if (score <= BALANCE.REL_HOSTILE_MAX) return TIER.HOSTILE;
  if (score <= BALANCE.REL_COLD_MAX) return TIER.COLD;
  if (score <= BALANCE.REL_NEUTRAL_MAX) return TIER.NEUTRAL;
  if (score <= BALANCE.REL_WARM_MAX) return TIER.WARM;
  return TIER.ALLY;
}

export const TIER_BLURB = {
  [TIER.HOSTILE]: 'Actively works against you.',
  [TIER.COLD]: 'Will not help, will not sabotage.',
  [TIER.NEUTRAL]: 'Cordial. Nothing owed either way.',
  [TIER.WARM]: 'Will vouch for you.',
  [TIER.ALLY]: 'Goes out of their way for you.',
};

export function clampScore(v) {
  return Math.min(Math.max(Math.round(v), BALANCE.REL_MIN), BALANCE.REL_MAX);
}

/** Instantiate an NPC from its content definition (§5.1). */
export function createRelationship(def, age) {
  return {
    id: def.id,
    name: def.name,
    role: def.role,
    met_age: age,
    score: def.start_score ?? BALANCE.REL_DEFAULT_SCORE,
    history: [],
    active: true,
    callback_events: def.callback_events ?? [],
  };
}

/** Callback delay windows by the tier that was just crossed into (§5.4). */
const CALLBACK_DELAY = {
  [TIER.ALLY]: [3, 8],
  [TIER.HOSTILE]: [2, 6],
  [TIER.WARM]: [4, 10],
};

/**
 * Apply a score change. Returns the updated relationship plus any callback
 * that should be queued because a tier boundary was crossed.
 */
export function adjustRelationship(rel, delta, { age, note, rng = Math.random }) {
  const before = tierOf(rel.score);
  const score = clampScore(rel.score + delta);
  const after = tierOf(score);
  const next = {
    ...rel,
    score,
    history: note ? [...rel.history, `Age ${age}: ${note}`].slice(-12) : rel.history,
  };

  let callback = null;
  if (after !== before && CALLBACK_DELAY[after] && rel.callback_events.length > 0) {
    const [min, max] = CALLBACK_DELAY[after];
    const delay = min + Math.floor(rng() * (max - min + 1));
    const eventId = rel.callback_events[Math.floor(rng() * rel.callback_events.length)];
    callback = { event_id: eventId, trigger_age: age + delay, npc_id: rel.id, tier: after };
  }
  return { relationship: next, callback, crossedInto: after !== before ? after : null };
}

/**
 * The standing modifier this cast applies to a check, by role. A hostile
 * reviewer costs you; a warm advisor vouches for you (§5.4).
 */
export function relationshipModifier(relationships, { roles = [], npcIds = [] } = {}) {
  let mod = 0;
  for (const rel of relationships) {
    if (!rel.active) continue;
    const relevant = npcIds.includes(rel.id) || roles.includes(rel.role);
    if (!relevant) continue;
    const tier = tierOf(rel.score);
    if (tier === TIER.HOSTILE) mod += BALANCE.UNFAVORABLE_MOD;
    else if (tier === TIER.ALLY) mod += BALANCE.FAVORABLE_MOD;
    else if (tier === TIER.WARM) mod += BALANCE.FAVORABLE_MOD / 2;
  }
  // one relationship should not swing a check more than a full context step
  return Math.min(Math.max(mod, BALANCE.UNFAVORABLE_MOD * 2), BALANCE.FAVORABLE_MOD * 2);
}

export function findRelationship(relationships, id) {
  return relationships.find((r) => r.id === id) ?? null;
}
