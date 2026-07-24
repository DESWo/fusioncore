// The retrospective (spec §9). At retirement the log becomes a life. Every
// number the player accumulated is read back as a sentence about who they
// turned out to be. Pure module.

export const MOTIVATIONS = {
  planet: {
    id: 'planet',
    label: 'Save the planet',
    blurb: 'The climate math only works if this gets built. You are here for the deployment, not the paper.',
  },
  science: {
    id: 'science',
    label: 'Pure science',
    blurb: 'A confined star is the most interesting object humans can make. That is reason enough.',
  },
  build: {
    id: 'build',
    label: 'Build something real',
    blurb: 'Theory is cheap. You want to stand next to a machine that works.',
  },
  prove: {
    id: 'prove',
    label: 'Prove them wrong',
    blurb: 'Someone told you fusion was always fifty years away. You intend to be the counterexample.',
  },
  legacy: {
    id: 'legacy',
    label: 'Legacy',
    blurb: 'You will not finish this. You intend to train the people who do.',
  },
};

const clamp100 = (v) => Math.min(Math.max(Math.round(v), 0), 100);

/** How closely the career matched the reason the player started (§9.3). */
export function motivationAlignment(state) {
  const { player, reputation, counters } = state;
  const c = counters;
  switch (player.motivation) {
    case 'planet':
      return clamp100(reputation.PUB + c.policy_events * 5 + (c.chose_commercialization ? 20 : 0));
    case 'science':
      return clamp100(
        reputation.SCI + player.publications * 2 + (c.stayed_in_lab ? 15 : 0),
      );
    case 'build':
      return clamp100(
        (player.career_path === 'startup' ? 30 : 0) +
        c.commercialization_events * 10 +
        reputation.SCI,
      );
    case 'prove':
      return clamp100(
        player.breakthroughs * 15 +
        (reputation.SCI > 80 ? 20 : 0) +
        c.keynote_excellent * 10,
      );
    case 'legacy':
      return clamp100(
        player.mentees_count * 5 + reputation.SCI + reputation.PUB + reputation.NET,
      );
    default:
      return 50;
  }
}

/**
 * Personal fulfillment: the life actually lived, not the CV.
 *
 * DELIBERATE DEVIATION from the spec's mapping of this axis straight onto
 * §9.3 motivation alignment: in play that pinned at 88-100 for every strategy
 * (late-career reputation alone saturates every motivation formula), so a
 * health-19, twelve-burnout, alone-at-the-end workaholic read as a fully
 * fulfilled life. Alignment keeps its §9.3 meaning and is still shown
 * separately as "Lived up to it"; this axis now weighs purpose against the
 * body, the people, and the ledger the player is actually left with.
 * Budget: purpose 35 + body 25 + people 25 + solvency 15, minus 3 per burnout year.
 */
export function lifeFulfillment(state) {
  const { player, careerLog } = state;
  const purpose = motivationAlignment(state) * 0.35;
  const body = (player.health ?? 70) * 0.25;
  // a solo life is a life of colleagues and friendships, not an automatic deficit
  const people = player.partner
    ? ((player.partner.score ?? 0) / 100) * 20 + Math.min(player.children ?? 0, 2) * 2.5
    : 10;
  const worth = (player.money ?? 0) + (player.equity ?? 0) - (player.debt ?? 0);
  const solvency = worth >= 0 ? 15 : Math.max(0, 15 + (worth / 300000) * 15);
  const burnouts = (careerLog ?? []).filter((e) => e.event_id === 'burnout').length;
  return clamp100(purpose + body + people + solvency - burnouts * 3);
}

/** The four radar axes (§9.5), each normalised to 0..100. */
export function radarAxes(state) {
  const { player, reputation, counters } = state;
  // Weighted so a strong career lands in the 70s to 80s rather than pinning at
  // 100: the shape of the radar should still say something at the top end.
  return {
    'Scientific Impact': clamp100(
      reputation.SCI * 0.6 + player.publications * 1.2 + player.breakthroughs * 6,
    ),
    'Human Impact': clamp100(
      counters.mentoring_events * 4 + player.mentees_count * 6 + counters.mentee_successes * 8,
    ),
    'Public Impact': clamp100(
      reputation.PUB * 0.7 + counters.policy_events * 4 + counters.outreach_events * 3,
    ),
    'Personal Fulfillment': lifeFulfillment(state),
  };
}

/** Which axis defines this life. */
export function dominantAxis(axes) {
  return Object.entries(axes).sort((a, b) => b[1] - a[1])[0][0];
}

const CAREER_ARC = {
  startup: 'bet on a company instead of a department',
  academia: 'built your work inside the university system',
  national_lab: 'spent it inside the national programme',
  international: 'worked wherever the machine was',
};

/**
 * The closing line, chosen by dominant axis and motivation (§9.4).
 * Written to land, not to congratulate.
 */
function closingArc(state, axes) {
  const { player, reputation, counters } = state;
  const axis = dominantAxis(axes);
  const m = player.motivation;
  const allLow = Object.values(axes).every((v) => v < 35);

  if (allLow && player.stats.GR >= 7) {
    return "It wasn't the career you imagined at 18. Grants fell through. Experiments failed. You stayed anyway. There's something to be said for that.";
  }
  if (axis === 'Scientific Impact' && m === 'science') {
    return 'You spent your life chasing plasma confinement. You got closer than most. The next generation will finish what you started.';
  }
  if (axis === 'Scientific Impact' && m === 'prove') {
    return `They said it was fifty years away. You published ${player.publications} papers and ${player.breakthroughs} results that moved the number. Nobody says it quite so confidently anymore.`;
  }
  if (axis === 'Human Impact') {
    return `You published ${player.publications} papers. But the work that mattered most was the ${player.mentees_count} scientists you trained. Some of them are running labs now.`;
  }
  if (axis === 'Public Impact' && m === 'planet') {
    return 'When the funding votes came, people in the room cited your testimony by name. You never finished a power plant. You built the political will to fund one.';
  }
  if (axis === 'Public Impact') {
    return `You became the face people pictured when they heard the word fusion. ${reputation.PUB >= 70 ? 'That reach outlasted any single result.' : 'It was never the plan, but it mattered.'}`;
  }
  if (axis === 'Personal Fulfillment' && m === 'build') {
    return 'You wanted to stand next to a machine that worked. You did. It hummed, and it was yours, and that was the whole point.';
  }
  if (m === 'legacy') {
    return `The reactor is still not finished. But ${player.mentees_count} people who learned the work from you are still at it, and that was always the plan.`;
  }
  if (counters.stayed_in_lab) {
    return 'You never took the corner office. You stayed where the machine was. Some people would call that a failure to advance. They would be wrong.';
  }
  return 'You gave a hard problem your working life. The problem is still there. So is the progress you made on it.';
}

/**
 * The closing line (§9.4), with the ledger and the body given the last word
 * when they earned it. QA 2026-07-22: a life that retired $641k in the red
 * used to close on pure congratulation; the cost belongs in the sentence.
 */
export function closingLine(state, axes) {
  const { player } = state;
  const arc = closingArc(state, axes);
  const coda = [];
  const worth = (player.money ?? 0) + (player.equity ?? 0) - (player.debt ?? 0);
  if (worth < -20000) {
    coda.push(`You retire owing $${Math.round(-worth / 1000)}k. Nobody at commencement mentioned that part either.`);
  }
  if ((player.health ?? 100) < 40) {
    coda.push('The work took more of the body than anyone signed off on.');
  }
  return coda.length ? `${arc} ${coda.join(' ')}` : arc;
}

/** The full retrospective payload the UI renders (§9.2). */
/** The half of the retrospective that is not about fusion at all. */
export function lifeSummary(player) {
  const bits = [];
  if (player.partner) {
    const years = player.age - player.partner.met_age;
    bits.push(
      player.partner.married
        ? `You married ${player.partner.name}, ${years} years ago now, having met ${player.partner.met_where}.`
        : `You have been with ${player.partner.name} for ${years} years, since you met ${player.partner.met_where}.`,
    );
  } else {
    bits.push('You did this alone, which some years was the easier arrangement and some years was not.');
  }
  const n = player.children ?? 0;
  if (n > 0) {
    bits.push(n === 1
      ? 'One child, raised around beam time and grant deadlines.'
      : `${n} children, raised around beam time and grant deadlines.`);
  }
  if (player.owns_home) bits.push('You own the place you live in.');
  return bits.join(' ');
}

/**
 * What a moment is worth remembering for. QA 2026-07-22: the old rule
 * (last eight excellent-or-milestone rows) surfaced three identical years of
 * "Time at the machine" and skipped the wedding, so significance now beats
 * recency: hinges first, scars next, then the field remembering you, and a
 * good year at the bench only when the life had little else in it.
 */
function momentScore(entry) {
  const id = entry.event_id ?? '';
  if (entry.milestone) return 100; // transitions and breakthroughs
  if (id.startsWith('tr_')) return 90;
  if (id.startsWith('sim_')) return 85; // the five times you took the controls
  if (id === 'burnout' || id === 'partner_left') return 80; // the scars count
  if (id.startsWith('life_')) return 70; // weddings, children, the reckonings
  if (id.startsWith('cb_')) return 60; // the field remembering what you did
  if (entry.outcome === 'excellent' && !id.startsWith('pursuit_')) return 50;
  if (entry.outcome === 'excellent') return 20; // a good year at the bench
  return 0;
}

/** The eight moments that stuck, chosen by weight and spread across the life. */
export function significantMoments(careerLog, count = 8) {
  const scored = (careerLog ?? [])
    .map((e, i) => ({ e, i, s: momentScore(e) }))
    .filter((x) => x.s > 0);
  scored.sort((a, b) => b.s - a.s || a.i - b.i);
  // at most two per decade of age, so one hot streak does not own the list;
  // the true hinges (milestones, transitions) are exempt from the cap
  const perDecade = {};
  const picked = [];
  for (const x of scored) {
    const d = Math.floor((x.e.age ?? 0) / 10);
    if ((perDecade[d] ?? 0) >= 2 && x.s < 90) continue;
    perDecade[d] = (perDecade[d] ?? 0) + 1;
    picked.push(x);
    if (picked.length >= count) break;
  }
  return picked.sort((a, b) => a.i - b.i).map((x) => x.e);
}

export function buildRetrospective(state) {
  const { player, reputation, careerLog, counters } = state;
  const axes = radarAxes(state);
  const alignment = motivationAlignment(state);
  const careerLength = player.age - 18;

  const highlights = significantMoments(careerLog);

  return {
    name: player.name,
    age: player.age,
    careerLength,
    path: player.career_path,
    motivation: player.motivation,
    motivationLabel: MOTIVATIONS[player.motivation]?.label ?? '',
    alignment,
    axes,
    dominant: dominantAxis(axes),
    opening: `Over ${careerLength} years in fusion research, you ${CAREER_ARC[player.career_path] ?? 'followed the work where it led'}.`,
    life: lifeSummary(player),
    health: player.health,
    partner: player.partner,
    children: player.children ?? 0,
    ownsHome: player.owns_home,
    worth: (player.money ?? 0) + (player.equity ?? 0) - (player.debt ?? 0),
    closing: closingLine(state, axes),
    stats: player.stats,
    reputation,
    publications: player.publications,
    breakthroughs: player.breakthroughs,
    mentees: player.mentees_count,
    sims: player.reactor_sims_completed,
    highlights,
    counters,
  };
}
