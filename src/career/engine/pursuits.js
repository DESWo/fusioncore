// Pursuits: what you decide to DO with a year, before anything happens to you.
//
// Without this the game is purely reactive: events arrive, you pick one of two
// replies. Pursuits make the player the agent. You get three blocks of the
// year and a menu of competing uses for them, and you cannot have everything:
// the bench, the writing, the network, the students, and your own health are
// all pulling on the same finite year. That is the actual shape of a research
// career, and it is a tradeoff rather than a click.
//
// Pure module. Resolution takes an injected RNG so runs are reproducible.
import { STAGE, PATH } from './stages.js';
import { STRESS } from './stress.js';
import { resolveTiered, OUTCOME } from './checks.js';
import { healthModifier } from './life.js';

export const BLOCKS_PER_YEAR = 3;

const ALL_WORKING = [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR];
const EVERY_STAGE = [STAGE.COLLEGE, STAGE.GRAD_SCHOOL, ...ALL_WORKING];

/**
 * Each pursuit declares:
 *   stats     which traits govern how well it goes
 *   stress    baseline cost (negative = restorative) per block
 *   grades    effects at excellent / adequate / poor, per block spent
 *   available (player, reputation) => boolean, beyond stage/path gating
 */
export const PURSUITS = [
  {
    id: 'bench',
    label: 'Time at the machine',
    blurb: 'Run experiments yourself. Slow, physical, and the only way anything new actually appears.',
    stages: [STAGE.GRAD_SCHOOL, ...ALL_WORKING],
    stats: ['IN', 'GR'],
    stress: 6,
    grades: {
      excellent: { text: 'a campaign that worked', stat_deltas: { IN: 0.5, SM: 0.3 }, reputation_deltas: { SCI: 4 }, publications: 1, progress: 1 },
      adequate: { text: 'steady data, nothing spectacular', stat_deltas: { IN: 0.3 }, reputation_deltas: { SCI: 2 }, progress: 1 },
      poor: { text: 'hardware fought you all year', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, stress_delta: 4, progress: 1 },
    },
  },
  {
    id: 'writing',
    label: 'Writing it up',
    blurb: 'Turn results into papers. Nothing counts in this field until it is written down and survives review.',
    stages: [STAGE.GRAD_SCHOOL, ...ALL_WORKING],
    stats: ['SM', 'GR'],
    stress: 5,
    grades: {
      excellent: { text: 'two papers out, one in a good journal', stat_deltas: { SM: 0.5 }, reputation_deltas: { SCI: 6 }, publications: 2, progress: 1 },
      adequate: { text: 'one paper submitted', stat_deltas: { SM: 0.3 }, reputation_deltas: { SCI: 3 }, publications: 1, progress: 1 },
      poor: { text: 'a draft that never left your desk', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, stress_delta: 4 },
    },
  },
  {
    id: 'conferences',
    label: 'Conferences and travel',
    blurb: 'Be in the rooms where the field talks to itself. Costs weeks, buys people who know your name.',
    stages: [STAGE.GRAD_SCHOOL, ...ALL_WORKING],
    stats: ['CH', 'CO'],
    stress: 5,
    grades: {
      excellent: { text: 'a talk that landed, and two collaborations out of it', stat_deltas: { CH: 0.5, CO: 0.5 }, reputation_deltas: { NET: 7, PUB: 4 } },
      adequate: { text: 'the usual circuit, a few good conversations', stat_deltas: { CH: 0.3 }, reputation_deltas: { NET: 4, PUB: 2 } },
      poor: { text: 'a lot of airports and nothing to show', stat_deltas: {}, reputation_deltas: { NET: 1 }, stress_delta: 5 },
    },
  },
  {
    id: 'teaching',
    label: 'Teaching',
    blurb: 'Lecture halls and problem sets. It eats your research time and it is how you learn what you actually understand.',
    stages: [STAGE.GRAD_SCHOOL, ...ALL_WORKING],
    stats: ['CH', 'SM'],
    stress: 4,
    grades: {
      excellent: { text: 'a course students still mention years later', stat_deltas: { CH: 0.5, SM: 0.3 }, reputation_deltas: { NET: 3 }, mentoring: 1 },
      adequate: { text: 'competent lectures, fair marking', stat_deltas: { CH: 0.3 }, reputation_deltas: { NET: 1 }, mentoring: 1 },
      poor: { text: 'you were audibly reading last year’s slides', stat_deltas: {}, reputation_deltas: {}, stress_delta: 3 },
    },
  },
  {
    id: 'mentoring',
    label: 'Bringing people up',
    blurb: 'Supervise students properly. Every hour spent here is an hour not spent on your own name.',
    stages: ALL_WORKING,
    stats: ['CH', 'IN'],
    stress: -2,
    available: (p) => p.mentees_count > 0 || p.career_stage !== STAGE.EARLY_CAREER,
    grades: {
      excellent: { text: 'one of yours got a result that was genuinely theirs', stat_deltas: { CH: 0.5 }, reputation_deltas: { NET: 6, SCI: 2 }, mentoring: 1, mentee_success: 1 },
      adequate: { text: 'steady supervision, nobody drowned', stat_deltas: { CH: 0.3 }, reputation_deltas: { NET: 3 }, mentoring: 1 },
      poor: { text: 'you were too busy and they noticed', stat_deltas: {}, reputation_deltas: { NET: -1 }, stress_delta: 4 },
    },
  },
  {
    id: 'outreach',
    label: 'Talking to the public',
    blurb: 'Schools, press, podcasts. Colleagues will call it a distraction right up until they need public support.',
    stages: ALL_WORKING,
    stats: ['CH'],
    stress: 2,
    grades: {
      excellent: { text: 'a piece that actually travelled', stat_deltas: { CH: 0.5 }, reputation_deltas: { PUB: 9 }, outreach: 1 },
      adequate: { text: 'a few talks, a local paper', stat_deltas: { CH: 0.3 }, reputation_deltas: { PUB: 4 }, outreach: 1 },
      poor: { text: 'misquoted, and the correction never ran', stat_deltas: {}, reputation_deltas: { PUB: -2 }, stress_delta: 5 },
    },
  },
  {
    id: 'grants',
    label: 'Chasing money',
    blurb: 'Proposals, budgets, and panels. The least scientific work you will ever do, and everything depends on it.',
    stages: ALL_WORKING,
    stats: ['CH', 'SM'],
    stress: 9,
    grades: {
      excellent: { text: 'funded, and more than you asked for', stat_deltas: { CH: 0.5, CO: 0.5 }, reputation_deltas: { NET: 4, SCI: 2 }, funded: 2 },
      adequate: { text: 'one award, one rejection', stat_deltas: { CH: 0.3 }, reputation_deltas: { NET: 2 }, funded: 1 },
      poor: { text: 'declined across the board', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, stress_delta: 8 },
    },
  },
  {
    id: 'study',
    label: 'Reading and learning',
    blurb: 'Take a subject apart properly. Nobody rewards it directly and it changes everything downstream.',
    stages: EVERY_STAGE,
    stats: ['SM'],
    stress: 1,
    grades: {
      excellent: { text: 'a technique from another field, now yours', stat_deltas: { SM: 0.5, IN: 0.5 }, reputation_deltas: {}, progress: 1 },
      adequate: { text: 'you filled some real gaps', stat_deltas: { SM: 0.4 }, reputation_deltas: {}, progress: 1 },
      poor: { text: 'too scattered to stick', stat_deltas: { SM: 0.15 }, reputation_deltas: {} },
    },
  },
  {
    id: 'rest',
    label: 'A life outside this',
    blurb: 'People, sleep, something that is not fusion. The field treats this as optional. It is not.',
    stages: EVERY_STAGE,
    stats: ['GR'],
    stress: -16,
    grades: {
      excellent: { text: 'you came back genuinely restored', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, stress_delta: -8 },
      adequate: { text: 'a real break', stat_deltas: {}, reputation_deltas: {} },
      poor: { text: 'you kept checking the run logs', stat_deltas: {}, reputation_deltas: {}, stress_delta: 6 },
    },
  },
  {
    id: 'committees',
    label: 'Institutional politics',
    blurb: 'Panels, review boards, the committees that decide things. Tedious, and it is where the decisions get made.',
    stages: [STAGE.MID_CAREER, STAGE.SENIOR],
    stats: ['CO', 'CH'],
    stress: 7,
    grades: {
      excellent: { text: 'you are now in the room where budgets are set', stat_deltas: { CO: 0.8 }, reputation_deltas: { NET: 6 }, standing: 2 },
      adequate: { text: 'you served your time on the panel', stat_deltas: { CO: 0.3 }, reputation_deltas: { NET: 3 }, standing: 1 },
      poor: { text: 'outmanoeuvred by people who enjoy this', stat_deltas: {}, reputation_deltas: { NET: -2 }, stress_delta: 6 },
    },
  },
  {
    id: 'coursework',
    label: 'Coursework',
    blurb: 'Lectures, problem sets, exams. The grind that gets you to the part you actually want.',
    stages: [STAGE.COLLEGE],
    stats: ['SM', 'GR'],
    stress: 5,
    grades: {
      excellent: { text: 'top of the cohort', stat_deltas: { SM: 0.5, GR: 0.3 }, reputation_deltas: {}, progress: 2 },
      adequate: { text: 'solid marks', stat_deltas: { SM: 0.3 }, reputation_deltas: {}, progress: 1 },
      poor: { text: 'you scraped through', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, progress: 1, stress_delta: 5 },
    },
  },
  {
    id: 'lab_assist',
    label: 'Hanging around the lab',
    blurb: 'Unpaid, unglamorous, and the fastest way to find out whether you actually like this.',
    stages: [STAGE.COLLEGE],
    stats: ['IN', 'GR'],
    stress: 4,
    grades: {
      excellent: { text: 'they started trusting you with real work', stat_deltas: { IN: 0.5, GR: 0.3 }, reputation_deltas: { NET: 3 }, progress: 1 },
      adequate: { text: 'you learned which end of a vacuum pump is which', stat_deltas: { IN: 0.3 }, reputation_deltas: { NET: 1 }, progress: 1 },
      poor: { text: 'mostly you washed glassware', stat_deltas: { GR: 0.2 }, reputation_deltas: {} },
    },
  },
  {
    id: 'student_life',
    label: 'Being nineteen',
    blurb: 'Friends, societies, and the part of university that is not on the transcript. It matters later in ways nobody tells you.',
    stages: [STAGE.COLLEGE, STAGE.GRAD_SCHOOL],
    stats: ['CH'],
    stress: -9,
    grades: {
      excellent: { text: 'people you will still know at fifty', stat_deltas: { CH: 0.5, CO: 0.5 }, reputation_deltas: {}, stress_delta: -4 },
      adequate: { text: 'a decent year outside the library', stat_deltas: { CH: 0.3 }, reputation_deltas: {} },
      poor: { text: 'you kept meaning to go out', stat_deltas: {}, reputation_deltas: {}, stress_delta: 4 },
    },
  },
  {
    id: 'side_job',
    label: 'Working for money',
    blurb: 'Bar shifts, tutoring, whatever pays. Time you cannot spend on physics, and rent does not care.',
    stages: [STAGE.COLLEGE, STAGE.GRAD_SCHOOL],
    stats: ['GR'],
    stress: 6,
    grades: {
      excellent: { text: 'solvent, and you learned to handle people', stat_deltas: { GR: 0.5, CH: 0.3 }, reputation_deltas: {} },
      adequate: { text: 'the money came in', stat_deltas: { GR: 0.3 }, reputation_deltas: {} },
      poor: { text: 'exhausting, and it showed in your marks', stat_deltas: { GR: 0.2 }, reputation_deltas: {}, stress_delta: 6 },
    },
  },
  {
    id: 'build',
    label: 'Building the machine',
    blurb: 'Hardware, integration, and the schedule. At a startup this is the whole job.',
    stages: ALL_WORKING,
    paths: [PATH.STARTUP],
    stats: ['IN', 'GR'],
    stress: 8,
    grades: {
      excellent: { text: 'a subsystem works that did not exist in January', stat_deltas: { IN: 0.8, GR: 0.5 }, reputation_deltas: { SCI: 4, NET: 3 }, commercialization: 1 },
      adequate: { text: 'real progress, behind schedule', stat_deltas: { IN: 0.3, GR: 0.3 }, reputation_deltas: { SCI: 2 }, commercialization: 1 },
      poor: { text: 'a year lost to a supplier and a tolerance', stat_deltas: { GR: 0.3 }, reputation_deltas: {}, stress_delta: 8 },
    },
  },
  // ---- the rest of your life, competing for the same three blocks ----
  {
    id: 'dating',
    label: 'Looking for someone',
    blurb: 'Make room for a person. Hard to do in a field that rewards being permanently available.',
    stages: EVERY_STAGE,
    stats: ['CH'],
    stress: -3,
    available: (p) => !p.partner && p.age >= 19,
    grades: {
      excellent: { text: 'you met someone, and it stuck', stat_deltas: { CH: 0.3 }, reputation_deltas: {}, meet_partner: true, stress_delta: -6 },
      adequate: { text: 'a few evenings that went nowhere in particular', stat_deltas: { CH: 0.2 }, reputation_deltas: {} },
      poor: { text: 'you cancelled twice for beam time and they stopped asking', stat_deltas: {}, reputation_deltas: {}, stress_delta: 5 },
    },
  },
  {
    id: 'family',
    label: 'Time at home',
    blurb: 'Be present for the people who live with the person you are at work. The field will not thank you.',
    stages: EVERY_STAGE,
    stats: ['CH', 'GR'],
    stress: -10,
    available: (p) => !!p.partner || (p.children ?? 0) > 0,
    grades: {
      excellent: { text: 'a year they will remember you being there for', stat_deltas: { CH: 0.3, GR: 0.3 }, reputation_deltas: {}, partner_delta: 14, stress_delta: -6 },
      adequate: { text: 'dinners made, weekends kept', stat_deltas: {}, reputation_deltas: {}, partner_delta: 8 },
      poor: { text: 'physically home, mentally at the machine', stat_deltas: {}, reputation_deltas: {}, partner_delta: 1, stress_delta: 3 },
    },
  },
  {
    id: 'health',
    label: 'Looking after yourself',
    blurb: 'Sleep, exercise, the check-ups you keep postponing. Deeply boring and it decides your last twenty years.',
    stages: EVERY_STAGE,
    stats: ['GR'],
    stress: -8,
    grades: {
      excellent: { text: 'fitter at the end of the year than the start', stat_deltas: { GR: 0.4 }, reputation_deltas: {}, health_delta: 13 },
      adequate: { text: 'you kept most of the habits', stat_deltas: { GR: 0.2 }, reputation_deltas: {}, health_delta: 8 },
      poor: { text: 'the gym membership went unused again', stat_deltas: {}, reputation_deltas: {}, health_delta: 2 },
    },
  },
  {
    id: 'consulting',
    label: 'Consulting on the side',
    blurb: 'Sell your expertise by the hour. It pays properly, which is its own uncomfortable lesson.',
    stages: ALL_WORKING,
    stats: ['CO', 'SM'],
    stress: 7,
    available: (p, rep) => (rep?.SCI ?? 0) >= 20 || (rep?.NET ?? 0) >= 25,
    grades: {
      excellent: { text: 'a retainer that pays better than the day job', stat_deltas: { CO: 0.4 }, reputation_deltas: { NET: 3 }, side_income: 45000 },
      adequate: { text: 'a few contracts, useful money', stat_deltas: { CO: 0.2 }, reputation_deltas: { NET: 1 }, side_income: 22000 },
      poor: { text: 'work that ate your evenings and paid late', stat_deltas: {}, reputation_deltas: {}, side_income: 6000, stress_delta: 5 },
    },
  },
  {
    id: 'positioning',
    label: 'Looking around',
    blurb: 'Quiet conversations about what else is out there. Nobody advertises the jobs worth having.',
    stages: ALL_WORKING,
    stats: ['CO', 'CH'],
    stress: 4,
    grades: {
      excellent: { text: 'two people want you, and they know about each other', stat_deltas: { CO: 0.5 }, reputation_deltas: { NET: 5 }, standing: 2 },
      adequate: { text: 'your name is in a few more minds', stat_deltas: { CO: 0.3 }, reputation_deltas: { NET: 2 }, standing: 1 },
      poor: { text: 'nobody called back', stat_deltas: {}, reputation_deltas: {}, stress_delta: 5 },
    },
  },
];

/** Pursuits the player can pick from this year. */
export function availablePursuits(player, reputation) {
  return PURSUITS.filter((p) => {
    if (!p.stages.includes(player.career_stage)) return false;
    if (p.paths && !p.paths.includes(player.career_path)) return false;
    if (p.available && !p.available(player, reputation)) return false;
    return true;
  });
}

export function pursuitById(id) {
  return PURSUITS.find((p) => p.id === id) ?? null;
}

/**
 * Resolve one year's allocation.
 *
 * `plan` is an array of pursuit ids, length BLOCKS_PER_YEAR, repeats allowed.
 * Doubling up on a pursuit raises its odds (concentrated effort) but the
 * stress cost stacks, so specialising is a real bet rather than a free win.
 *
 * Returns { results: [{ id, label, grade, text, effects }], totals }
 */
export function resolveYearPlan({ plan, player, reputation, rng = Math.random }) {
  const counts = plan.reduce((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
  const results = [];

  for (const [id, blocks] of Object.entries(counts)) {
    const pursuit = pursuitById(id);
    if (!pursuit) continue;

    // concentration bonus: a second block on the same pursuit is a real push
    const modifier = (blocks - 1) * 0.12 + healthModifier(player.health ?? 90);
    const { outcome } = resolveTiered({
      stats: player.stats,
      statKeys: pursuit.stats,
      modifier,
      stress: player.stress,
      rng,
    });
    const grade = outcome === OUTCOME.EXCELLENT ? 'excellent'
      : outcome === OUTCOME.ADEQUATE ? 'adequate'
      : 'poor';
    const base = pursuit.grades[grade];

    // effects scale with blocks committed
    const effects = {
      stat_deltas: {},
      reputation_deltas: {},
      stress_delta: (pursuit.stress + (base.stress_delta ?? 0)) * blocks,
      publications: (base.publications ?? 0) * blocks,
      mentoring: (base.mentoring ?? 0) * blocks,
      mentee_success: (base.mentee_success ?? 0) * blocks,
      outreach: (base.outreach ?? 0) * blocks,
      commercialization: (base.commercialization ?? 0) * blocks,
      progress: (base.progress ?? 0) * blocks,
      funded: (base.funded ?? 0) * blocks,
      standing: (base.standing ?? 0) * blocks,
      // life effects: health and a relationship do not scale linearly with
      // blocks the way output does, so they are dampened past the first
      health_delta: (base.health_delta ?? 0) * (1 + (blocks - 1) * 0.5),
      partner_delta: (base.partner_delta ?? 0) * (1 + (blocks - 1) * 0.5),
      side_income: (base.side_income ?? 0) * blocks,
      meet_partner: !!base.meet_partner,
    };
    for (const [k, v] of Object.entries(base.stat_deltas ?? {})) {
      effects.stat_deltas[k] = v * blocks;
    }
    for (const [k, v] of Object.entries(base.reputation_deltas ?? {})) {
      effects.reputation_deltas[k] = Math.round(v * blocks);
    }

    results.push({
      id,
      label: pursuit.label,
      blocks,
      grade,
      text: base.text,
      effects,
    });
  }

  return results;
}
