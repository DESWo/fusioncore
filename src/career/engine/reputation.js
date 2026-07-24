// Reputation (spec §4). Three independent 0..100 tracks that gate content and
// bias checks. They are deliberately not a single "score": a famous scientist
// with no credibility is a different career from a respected invisible one.
import { BALANCE } from './balance.js';

export const REP_TRACKS = ['SCI', 'PUB', 'NET'];

/** Named deltas from §4.1-4.3 so content references intent, not integers. */
export const REP = {
  // Scientific credibility
  PUBLISH: { SCI: 3 },
  PUBLISH_TOP: { SCI: 6 },
  BREAKTHROUGH: { SCI: 12 },
  REPLICATED: { SCI: 4 },
  HONEST_NEGATIVE: { SCI: 2 },
  HYPE: { SCI: -8 },
  RETRACTION: { SCI: -20 },
  NULL_RESULT: { SCI: 1 },
  SCOOPED: { SCI: -2 },
  // Public profile
  TALK: { PUB: 2 },
  KEYNOTE_EXCELLENT: { PUB: 10 },
  KEYNOTE_ADEQUATE: { PUB: 4 },
  TESTIMONY_GOOD: { PUB: 8 },
  TESTIMONY_BAD: { PUB: -3 },
  MEDIA_POSITIVE: { PUB: 5 },
  MEDIA_CORRECTED: { PUB: 3 },
  VIRAL: { PUB: 12 },
  MISQUOTE_IGNORED: { PUB: -1 },
  OUTREACH: { PUB: 3 },
  // Network
  COLLABORATION: { NET: 4 },
  MENTOR: { NET: 3 },
  CONFERENCE: { NET: 2 },
  GRANT_COPI: { NET: 3 },
  HELPED_SUCCESSOR: { NET: 5 },
  COMPETE_WON: { NET: 1 },
  COMPETE_LOST: { NET: -2 },
  BURNED_BRIDGE: { NET: -8 },
  ADVISOR_POSITIVE: { NET: 3 },
  ADVISOR_NEGATIVE: { NET: -4 },
  INTERNATIONAL: { NET: 5 },
};

export function clampRep(value) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

/**
 * Standing gets harder to build the higher it goes.
 *
 * The spec lists flat deltas, which is right for a single event but saturates
 * over a forty-six year career: every track pins at 100 by the fifties and the
 * retrospective stops saying anything. So gains are scaled by how established
 * you already are (going from respected to eminent is far harder than from
 * unknown to known) while losses land at full weight, because a reputation is
 * genuinely easier to lose than to build.
 */
export function reputationGainFactor(current) {
  if (current <= 40) return 1.0;
  if (current <= 60) return 0.6;
  if (current <= 75) return 0.4;
  if (current <= 90) return 0.25;
  return 0.1;
}

export function applyReputation(reputation, deltas) {
  const next = { ...reputation };
  for (const [k, v] of Object.entries(deltas ?? {})) {
    if (!REP_TRACKS.includes(k)) continue;
    const scaled = v > 0 ? v * reputationGainFactor(next[k]) : v;
    next[k] = clampRep(next[k] + scaled);
  }
  return next;
}

/**
 * Reputation's effect on the world (§4.4): which event families are open,
 * and the standing modifier applied to grant-style checks.
 */
export function reputationGates(reputation) {
  const { SCI, PUB, NET } = reputation;
  return {
    reviewPanels: SCI >= BALANCE.REP_SCI_PANEL,
    autoKeynotes: SCI >= BALANCE.REP_SCI_KEYNOTE,
    testimony: PUB >= BALANCE.REP_PUB_TESTIMONY,
    mediaRequests: PUB >= BALANCE.REP_PUB_MEDIA,
    invisible: PUB < BALANCE.REP_PUB_INVISIBLE,
    betterOffers: NET >= BALANCE.REP_NET_BETTER_OFFERS,
    frequentCollabs: NET >= BALANCE.REP_NET_COLLAB,
  };
}

/** The standing modifier a grant proposal inherits from your reputation. */
export function grantModifier(reputation) {
  let mod = 0;
  if (reputation.SCI < BALANCE.REP_SCI_LOW) mod += BALANCE.REP_SCI_LOW_MOD;
  if (reputation.NET < BALANCE.REP_NET_LOW) mod += BALANCE.REP_NET_LOW_MOD;
  return mod;
}

/** Plain-language standing, shown under each track. */
export function repNote(track, value) {
  const bands = [
    [0, 'unknown'],
    [20, 'emerging'],
    [40, 'established'],
    [60, 'respected'],
    [80, 'eminent'],
  ];
  let label = 'unknown';
  for (const [floor, name] of bands) if (value >= floor) label = name;
  if (track === 'PUB' && value < BALANCE.REP_PUB_INVISIBLE) return 'no profile';
  return label;
}
