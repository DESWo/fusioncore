// The rest of a life: a body that ages, someone to come home to, children who
// cost time and money and are the thing most people say mattered most.
//
// None of this is decoration. Health caps what you can do late; a partner
// buffers stress and doubles your expenses; children take years you would
// otherwise have spent at the machine. That competition is the point.
import { STAGE } from './stages.js';

// ---------------------------------------------------------------- health
export const HEALTH_MAX = 100;

/**
 * Health drifts down with age and stress, and the decline steepens after 45.
 * Deliberately slow: this is a forty-year arc, not a survival game.
 */
export function healthDrift(player) {
  const age = player.age;
  let drift = -0.45;                             // simply getting older
  if (age >= 45) drift -= 0.35;
  if (age >= 58) drift -= 0.5;
  if (player.stress > 70) drift -= 1.2;          // the body keeps the score
  else if (player.stress > 50) drift -= 0.5;
  else if (player.stress < 25) drift += 0.5;     // a calm year repairs a little
  return drift;
}

export function clampHealth(v) {
  return Math.min(Math.max(Math.round(v * 10) / 10, 0), HEALTH_MAX);
}

export const HEALTH_BAND = {
  STRONG: 'strong',
  FINE: 'fine',
  WEARING: 'wearing',
  FRAGILE: 'fragile',
};

export function healthBand(h) {
  if (h >= 80) return HEALTH_BAND.STRONG;
  if (h >= 60) return HEALTH_BAND.FINE;
  if (h >= 35) return HEALTH_BAND.WEARING;
  return HEALTH_BAND.FRAGILE;
}

export function healthNote(h) {
  return {
    [HEALTH_BAND.STRONG]: 'You barely think about your body.',
    [HEALTH_BAND.FINE]: 'Fine, with the odd reminder.',
    [HEALTH_BAND.WEARING]: 'Things ache that did not used to.',
    [HEALTH_BAND.FRAGILE]: 'Your body is setting the schedule now.',
  }[healthBand(h)];
}

/** Poor health drags on everything you attempt. */
export function healthModifier(h) {
  if (h >= 70) return 0;
  if (h >= 50) return -0.04;
  if (h >= 30) return -0.09;
  return -0.15;
}

// ------------------------------------------------------------- partners
const PARTNER_NAMES = [
  'Mara', 'Tomas', 'Ines', 'Kwame', 'Yuki', 'Dara', 'Noor', 'Ellis',
  'Sofia', 'Anton', 'Priya', 'Jonah', 'Leila', 'Rasmus', 'Nadia', 'Theo',
];

const MET_WHERE = [
  'at a conference dinner nobody wanted to attend',
  'through a friend who thought you would argue well together',
  'in the queue for terrible coffee at the department',
  'on a delayed train out of somewhere forgettable',
  'at a talk they attended by mistake',
  'through a colleague who had been trying for years',
  'in the last row of a very bad seminar',
];

export function makePartner(age, rng = Math.random) {
  return {
    name: PARTNER_NAMES[Math.floor(rng() * PARTNER_NAMES.length)],
    met_age: age,
    met_where: MET_WHERE[Math.floor(rng() * MET_WHERE.length)],
    score: 62,
    married: false,
  };
}

export function partnerTier(score) {
  if (score <= 25) return 'strained';
  if (score <= 45) return 'distant';
  if (score <= 65) return 'steady';
  if (score <= 85) return 'close';
  return 'devoted';
}

export function partnerNote(partner) {
  if (!partner) return null;
  return {
    strained: 'You are barely in the same room.',
    distant: 'Cordial. You have both been busy for a long time.',
    steady: 'Good, most weeks.',
    close: 'They are the reason the hard years were survivable.',
    devoted: 'Whatever this work took, you did not lose this.',
  }[partnerTier(partner.score)];
}

/**
 * A neglected relationship decays. Long hours are not free, and the game
 * should not pretend otherwise.
 */
export function partnerDrift(player) {
  if (!player.partner) return 0;
  let drift = -0.8;                          // entropy, absent effort
  if (player.stress > 70) drift -= 2.0;
  if ((player.children ?? 0) > 0) drift -= 0.5;
  if (player.partner.married) drift *= 0.6;  // commitment slows the erosion
  return drift;
}

/**
 * A relationship does not end the moment the score bottoms out; it ends when
 * it has been at the bottom for a while. Otherwise a single terrible year
 * costs you a marriage, which is neither fair nor true.
 */
export function relationshipEnding(partner) {
  return !!partner && partner.score <= 0 && (partner.rock_bottom_years ?? 0) >= 2;
}

export function clampPartnerScore(v) {
  return Math.min(Math.max(Math.round(v), 0), 100);
}

// ------------------------------------------------------------- children
export function canHaveChildren(player) {
  return !!player.partner && player.age >= 26 && player.age <= 48 && (player.children ?? 0) < 4;
}

/** Kids are a stress buffer and a stress source, depending on the year. */
export function childStressEffect(player) {
  const n = player.children ?? 0;
  if (n === 0) return 0;
  const youngest = player.age - (player.last_child_age ?? player.age);
  return youngest <= 4 ? n * 3 : -n; // small children cost, grown ones give back
}

// --------------------------------------------------------- life summary
/** A one-line description of the domestic situation, for the HUD. */
export function lifeLine(player) {
  const bits = [];
  if (player.partner) {
    bits.push(player.partner.married
      ? `Married to ${player.partner.name}`
      : `With ${player.partner.name}`);
  } else {
    bits.push('On your own');
  }
  const n = player.children ?? 0;
  if (n > 0) bits.push(n === 1 ? 'one child' : `${n} children`);
  if (player.owns_home) bits.push('own your place');
  return bits.join(' · ');
}

/** Freshly created life state, merged into the player at creation. */
export function freshLife() {
  return {
    health: 92,
    money: 0,
    debt: 0,
    equity: 0,
    side_income: 0,
    owns_home: false,
    partner: null,
    children: 0,
    last_child_age: null,
  };
}
