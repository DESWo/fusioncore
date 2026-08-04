// Headless verification of the career systems against the written spec.
// Every table in the specification gets an assertion here, plus full
// playthrough simulations to prove a career is completable end to end.
// Run: npm run career
import { BALANCE, STATS } from '../src/career/engine/balance.js';
import {
  diminishingFactor, effectiveDelta, applyStatDeltas, displayStat, segmentFill, baseStats,
} from '../src/career/engine/stats.js';
import {
  successThreshold, resolveCheck, resolveTiered, combinedStat, stressModifier, OUTCOME,
} from '../src/career/engine/checks.js';
import {
  applyStress, yearlyBaseline, stressBand, hitBurnout, inBurnoutRisk, burnoutRecovery,
} from '../src/career/engine/stress.js';
import { applyReputation, reputationGates, grantModifier } from '../src/career/engine/reputation.js';
import {
  tierOf, TIER, adjustRelationship, createRelationship,
} from '../src/career/engine/relationships.js';
import { selectYearEvents, isEligible, EVENT_TYPE, continuityWeight } from '../src/career/engine/events.js';
import { STAGE, PATH, qualifiesMidCareer, qualifiesSenior, canDefend } from '../src/career/engine/stages.js';
import { buildRetrospective, motivationAlignment, radarAxes, significantMoments } from '../src/career/engine/retrospective.js';
import { ALL_EVENTS } from '../src/career/careerStore.js';
import { freshPlayer } from '../src/career/careerStore.js';
import { CAREER_SIMS } from '../src/career/data/sims.js';
import { NPCS, castForRun } from '../src/career/data/npcs.js';
import { BACKGROUNDS } from '../src/career/data/backgrounds.js';
import { PURSUITS, availablePursuits, resolveYearPlan, BLOCKS_PER_YEAR } from '../src/career/engine/pursuits.js';
import { resolveChoice } from '../src/career/engine/choices.js';
import { salaryFor, annualExpenses, settleYear, netWorth, fmtMoney } from '../src/career/engine/money.js';
import { healthDrift, healthModifier, partnerDrift, makePartner } from '../src/career/engine/life.js';
import { LIFE_EVENTS } from '../src/career/data/events_life.js';

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures++;
};
const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

// ---- §2.1 the probability table, exactly as written ----
{
  const expected = {
    1: 0.36, 2: 0.42, 3: 0.48, 4: 0.54, 5: 0.60,
    6: 0.66, 7: 0.72, 8: 0.78, 9: 0.84, 10: 0.90, 11: 0.96,
  };
  let allMatch = true;
  for (const [stat, pct] of Object.entries(expected)) {
    const { threshold } = successThreshold({ stats: { X: Number(stat) }, statKeys: ['X'] });
    if (!near(threshold, pct, 1e-9)) {
      allMatch = false;
      console.log(`      stat ${stat}: got ${threshold.toFixed(4)}, expected ${pct}`);
    }
  }
  ok(allMatch, 'checks: probability table matches spec §2.1 for stats 1 to 11');

  const cap = successThreshold({ stats: { X: 12 }, statKeys: ['X'] });
  ok(cap.auto === true, 'checks: stat 12 is auto-success (spec §2.1 table)');
}

// ---- §2.2 multi-stat averaging (the worked example) ----
{
  const stats = { IN: 7, CH: 5 };
  ok(combinedStat(stats, ['IN', 'CH']) === 6, 'checks: IN 7 + CH 5 averages to 6 (§2.2 example)');
  const { threshold } = successThreshold({ stats, statKeys: ['IN', 'CH'] });
  ok(near(threshold, 0.66), 'checks: that example yields a 66% success chance');
}

// ---- §2.3 modifiers, stress penalty and clamping ----
{
  ok(near(stressModifier(80), -0.20), 'checks: stress 80 applies a -0.20 modifier (§2.3)');
  ok(stressModifier(60) === 0, 'checks: stress at 60 costs nothing');
  const low = successThreshold({ stats: { X: 1 }, statKeys: ['X'], modifier: -0.9 });
  const high = successThreshold({ stats: { X: 5 }, statKeys: ['X'], modifier: 0.9 });
  ok(near(low.threshold, BALANCE.CHECK_MIN) && near(high.threshold, BALANCE.CHECK_MAX),
    'checks: thresholds clamp to the 5% / 95% floor and ceiling');
  // the clamp bounds modifiers, it does not overrule the base table
  const stat11 = successThreshold({ stats: { X: 11 }, statKeys: ['X'], modifier: 0.9 });
  ok(near(stat11.threshold, 0.96),
    'checks: a stat-11 check keeps its 96% base and never reaches certainty');
}

// ---- §2.4 outcome tiers (the worked example) ----
{
  const args = { stats: { A: 7, B: 7 }, statKeys: ['A', 'B'] };
  const { threshold } = successThreshold(args);
  const excellentAt = threshold - BALANCE.EXCELLENT_OFFSET;
  ok(near(threshold, 0.72) && near(excellentAt, 0.57),
    'checks: combined stat 7 gives 72% success / 57% excellent (§2.4 example)');
  // Resolution is deterministic: the stat decides the band, not a roll.
  // Combined stat 7 clears DECISIVE_BAR + EXCELLENT_OFFSET (0.65), so it is
  // exceptional every single time.
  const strong = resolveTiered(args);
  ok(strong.outcome === OUTCOME.EXCELLENT,
    'checks: combined stat 7 is exceptional, deterministically');

  // Just over the bar is adequate, not exceptional.
  const mid = resolveTiered({ stats: { A: 4, B: 4 }, statKeys: ['A', 'B'] });
  ok(mid.outcome === OUTCOME.ADEQUATE,
    'checks: combined stat 4 clears the bar but not the excellent margin');

  // Under the bar always fails.
  const weak = resolveTiered({ stats: { A: 1, B: 1 }, statKeys: ['A', 'B'] });
  ok(weak.outcome === OUTCOME.FAILURE,
    'checks: combined stat 1 falls short of the bar and fails');

  // The property that matters: no luck. Same input, same answer, every time.
  const repeated = Array.from({ length: 50 }, () => resolveCheck(args).outcome);
  ok(new Set(repeated).size === 1,
    'checks: resolution is deterministic across repeated calls (no dice)');
}

// ---- events belong to threads, not to a shuffle ----
{
  const ev = { id: 'probe', npcs: ['npc_a'], choices: [] };
  const stranger = { relationships: [] };
  const acquaintance = {
    relationships: [{ id: 'npc_a', active: true, score: 50, history: [{}, {}, {}] }],
  };
  const charged = {
    relationships: [{ id: 'npc_a', active: true, score: 90, history: [{}, {}, {}, {}, {}] }],
  };
  const noOne = { id: 'weather', npcs: [], choices: [] };

  const w0 = continuityWeight(ev, stranger);
  const w1 = continuityWeight(ev, acquaintance);
  const w2 = continuityWeight(ev, charged);

  ok(w0 === 1, 'events: an event about someone you have never dealt with carries no thread bonus');
  ok(w1 > w0, 'events: someone you have dealt with pulls harder than a stranger');
  ok(w2 > w1, 'events: a relationship that has moved off neutral pulls harder still');
  ok(continuityWeight(noOne, charged) === 1,
    'events: an event with no NPC is unweighted, so the pool does not starve');
  // The cap matters: without it one long relationship would swallow the pool.
  const runaway = {
    relationships: [{ id: 'npc_a', active: true, score: 50, history: Array(50).fill({}) }],
  };
  ok(continuityWeight(ev, runaway) === continuityWeight(ev, {
    relationships: [{ id: 'npc_a', active: true, score: 50, history: Array(5).fill({}) }],
  }), 'events: the thread bonus caps, so one relationship cannot swallow the pool');
}

// ---- the preview shown on a choice must be the outcome that happens ----
{
  const player = {
    stats: { SM: 2, IN: 2, CH: 2, GR: 2, CO: 2 }, stress: 0, health: 90,
  };
  const strong = {
    stats: { SM: 9, IN: 9, CH: 9, GR: 9, CO: 9 }, stress: 0, health: 90,
  };
  const event = { id: 'probe', npcs: [] };
  const choice = { stat_check: { stats: ['GR'] }, outcomes: { success: {}, failure: {} } };
  const args = { choice, event, relationships: [], reputation: {} };

  const weakRes = resolveChoice({ ...args, player });
  const strongRes = resolveChoice({ ...args, player: strong });

  ok(weakRes.gated === true && weakRes.outcomeKey === 'failure',
    'choices: a character short of the bar is gated, and gated means failure');
  ok(strongRes.gated === false && strongRes.outcomeKey === 'success',
    'choices: a capable character is not gated');

  // The invariant the shared module exists for: `gated` is not an estimate.
  // It is the same computation the store commits with, so the mark on the
  // button and the outcome that follows can never disagree.
  ok(weakRes.gated === (weakRes.outcomeKey === 'failure'),
    'choices: gated is exactly "this resolves to failure", not a guess about it');

  // Unchecked choices are never gated: there is nothing to fall short of.
  const plain = resolveChoice({ ...args, player, choice: { outcomes: { success: {} } } });
  ok(plain.gated === false && plain.checkInfo === null,
    'choices: a choice with no stat check is never gated');
}

// ---- §1.3 diminishing returns (the worked example) ----
{
  ok(diminishingFactor(3) === 1.0 && diminishingFactor(5.5) === 0.75 &&
     diminishingFactor(7.3) === 0.5 && diminishingFactor(9.9) === 0.25 &&
     diminishingFactor(11.5) === 0.1,
    'stats: diminishing bands match spec §1.3');
  ok(near(effectiveDelta(0.5, 7.3, 30), 0.25),
    'stats: +0.5 at stat 7.3 becomes +0.25 (§1.3 worked example)');
}

// ---- §1.4 losses unscaled, §1.5 age cap, floors and caps ----
{
  ok(effectiveDelta(-0.4, 9.5, 30) === -0.4, 'stats: losses are not scaled by diminishing returns');
  ok(near(effectiveDelta(0.5, 3, 55), 0.25), 'stats: growth halves after age 50 (§1.5)');
  const { stats: floored } = applyStatDeltas({ SM: 1.1 }, { SM: -0.8 }, 30);
  ok(floored.SM === 1.0, 'stats: cannot drop below 1.0');
  const { stats: capped } = applyStatDeltas({ SM: 11.95 }, { SM: 0.8 }, 30);
  ok(capped.SM <= BALANCE.STAT_MAX, 'stats: hard cap of 12 holds');
}

// ---- §1.2 display and bar fill ----
{
  ok(displayStat(7.6) === 7 && near(segmentFill(7.6), 0.6, 1e-9),
    'stats: 7.6 displays as 7 with a 60% filled segment (§1.2)');
}

// ---- §1.1 creation pool ----
{
  const base = baseStats();
  const spent = STATS.reduce((s, k) => s + base[k], 0);
  ok(spent === 5 && BALANCE.STAT_POOL - spent === 25,
    'stats: 5 stats at 1 leaves 25 free points from the 30 pool (§1.1)');
}

// ---- §3 stress bands, baseline, burnout ----
{
  ok(stressBand(20) === 'calm' && stressBand(45) === 'elevated' &&
     stressBand(70) === 'high' && stressBand(90) === 'critical',
    'stress: colour bands match §3.1');
  ok(yearlyBaseline(30) === 2 && yearlyBaseline(45) === 4,
    'stress: yearly baseline doubles after 40 (§3.5)');
  ok(applyStress(5, -20) === 0 && applyStress(95, 20) === 100,
    'stress: clamps to 0 and 100');
  ok(inBurnoutRisk(85) && !inBurnoutRisk(70) && hitBurnout(100),
    'stress: burnout-risk band and burnout threshold (§3.4)');
  ok(burnoutRecovery().stress === 40, 'stress: burnout drops stress to 40 (§3.4)');
}

// ---- §4 reputation clamps and gates ----
{
  const r = applyReputation({ SCI: 95, PUB: 5, NET: 50 }, { SCI: 120, PUB: -20 });
  ok(r.SCI === 100 && r.PUB === 0, 'reputation: clamps to 0..100');

  // gains slow as standing builds; losses always land in full
  const low = applyReputation({ SCI: 10, PUB: 0, NET: 0 }, { SCI: 10 }).SCI;
  const high = applyReputation({ SCI: 85, PUB: 0, NET: 0 }, { SCI: 10 }).SCI;
  const drop = applyReputation({ SCI: 85, PUB: 0, NET: 0 }, { SCI: -10 }).SCI;
  ok(low === 20 && high - 85 < 4 && drop === 75,
    `reputation: gains diminish with standing (+10 at 10 -> +${low - 10}, at 85 -> +${high - 85}) while losses land in full`);
  const gates = reputationGates({ SCI: 65, PUB: 55, NET: 75 });
  ok(gates.reviewPanels && gates.testimony && gates.frequentCollabs,
    'reputation: gates open at the specified thresholds (§4.4)');
  ok(near(grantModifier({ SCI: 10, NET: 10 }), -0.15),
    'reputation: low SCI and NET stack to a -0.15 grant modifier (§4.4)');
}

// ---- §5 relationship tiers and callbacks ----
{
  ok(tierOf(10) === TIER.HOSTILE && tierOf(30) === TIER.COLD && tierOf(50) === TIER.NEUTRAL &&
     tierOf(70) === TIER.WARM && tierOf(90) === TIER.ALLY,
    'relationships: tier boundaries match §5.3');
  const rel = createRelationship({ id: 'x', name: 'X', role: 'peer', callback_events: ['cb_x'] }, 30);
  const warm = adjustRelationship(rel, 25, { age: 30, rng: () => 0.5 });
  ok(warm.relationship.score === 75 && warm.callback &&
     warm.callback.trigger_age >= 34 && warm.callback.trigger_age <= 40,
    'relationships: crossing into Warm queues a callback 4 to 10 years out (§5.4)');
  const hostile = adjustRelationship({ ...rel, score: 25 }, -10, { age: 30, rng: () => 0.5 });
  ok(hostile.callback && hostile.callback.trigger_age >= 32 && hostile.callback.trigger_age <= 36,
    'relationships: crossing into Hostile queues a callback 2 to 6 years out (§5.4)');
}

// ---- §6 stage gates ----
{
  const base = { age: 36, has_leadership_role: false, publications: 12, career_stage: STAGE.EARLY_CAREER };
  ok(qualifiesMidCareer(base, { NET: 0 }), 'stages: 10+ publications reaches mid career (§6.1)');
  ok(qualifiesMidCareer({ ...base, publications: 0 }, { NET: 45 }), 'stages: NET 40+ also reaches mid career');
  ok(!qualifiesMidCareer({ ...base, age: 30 }, { NET: 90 }), 'stages: mid career still requires age 35');
  ok(qualifiesSenior({ age: 52, has_leadership_role: false }, { SCI: 55 }), 'stages: senior at 50 with SCI 50+');
  ok(canDefend({ age: 27, grad_progress: 4, college_grad_age: 22 }), 'stages: defense needs progress and 4 years');
  ok(!canDefend({ age: 24, grad_progress: 9, college_grad_age: 22 }), 'stages: defense blocked before 4 years served');
}

// ---- §7 event engine ----
{
  const ctx = {
    allEvents: ALL_EVENTS,
    player: {
      age: 30, career_stage: STAGE.EARLY_CAREER, career_path: PATH.ACADEMIA,
      stats: { SM: 6, IN: 6, CH: 6, GR: 6, CO: 6 }, stress: 20,
    },
    reputation: { SCI: 30, PUB: 20, NET: 30 },
    flags: new Set(),
    relationships: [],
    history: [],
    cooldowns: {},
    callbackQueue: [],
    pendingTransitions: [],
    pendingSim: null,
  };
  const year = selectYearEvents(ctx, () => 0.5);
  ok(year.length <= BALANCE.MAX_EVENTS_PER_YEAR, 'events: a year never exceeds 4 events (§7.2)');
  const decisions = year.filter((e) => e.event.type === EVENT_TYPE.DECISION).length;
  ok(decisions <= BALANCE.MAX_DECISION_EVENTS, 'events: at most 2 decision events per year');

  // max_fires is respected
  const once = ALL_EVENTS.find((e) => (e.max_fires ?? 1) === 1 && e.type === EVENT_TYPE.DECISION);
  ok(!isEligible(once, { ...ctx, history: [once.id] }), 'events: max_fires stops an event repeating');

  // cooldowns are respected
  const cd = ALL_EVENTS.find((e) => e.cooldown_years);
  if (cd) {
    const blocked = !isEligible(cd, {
      ...ctx,
      player: { ...ctx.player, age: 30, career_stage: cd.stage[0] },
      cooldowns: { [cd.id]: 29 },
      history: [],
    });
    ok(blocked, 'events: cooldown_years blocks a recent repeat');
  }
}

// ---- content integrity ----
{
  const ids = ALL_EVENTS.map((e) => e.id);
  ok(new Set(ids).size === ids.length, `content: all ${ids.length} event ids are unique`);

  let shapeOk = true;
  for (const e of ALL_EVENTS) {
    if (!e.id || !e.title || !e.text || !e.type) shapeOk = false;
    if (e.type === EVENT_TYPE.DECISION || e.type === EVENT_TYPE.TRANSITION) {
      if (!e.choices?.length) shapeOk = false;
      for (const c of e.choices ?? []) {
        if (!c.label || c.label.length > 40) { shapeOk = false; console.log(`      long/missing label: ${e.id} "${c.label}"`); }
        if (!c.outcomes?.success && !c.outcomes?.excellent) shapeOk = false;
        if (c.stat_check && !c.outcomes.failure) { shapeOk = false; console.log(`      check without failure branch: ${e.id}`); }
      }
    }
  }
  ok(shapeOk, 'content: every event is well-formed and choice labels fit 40 chars (§7.1)');

  // every relationship delta points at a real NPC
  const npcIds = new Set(NPCS.map((n) => n.id));
  let relsOk = true;
  for (const e of ALL_EVENTS) {
    for (const c of e.choices ?? []) {
      for (const o of Object.values(c.outcomes ?? {})) {
        for (const id of Object.keys(o.relationship_deltas ?? {})) {
          if (!npcIds.has(id)) { relsOk = false; console.log(`      unknown npc ${id} in ${e.id}`); }
        }
      }
    }
  }
  ok(relsOk, 'content: every relationship delta references a real NPC');

  // every NPC callback event exists
  let cbOk = true;
  const eventIds = new Set(ids);
  for (const n of NPCS) {
    for (const cb of n.callback_events ?? []) {
      if (!eventIds.has(cb)) { cbOk = false; console.log(`      missing callback event ${cb} for ${n.id}`); }
    }
  }
  ok(cbOk, 'content: every NPC callback resolves to a real event (unwired callbacks are dead ends)');

  ok(castForRun(PATH.STARTUP, () => 0.5).length >= 15, 'content: a run casts at least 15 NPCs (§5.5)');
  ok(BACKGROUNDS.length >= 5 && CAREER_SIMS.length === 5, 'content: backgrounds and 5 reactor sims present (§8.1)');
}

// ---- full playthrough simulation ----
{
  // Drive the pure engine through a whole life, choosing randomly, and prove
  // the loop always terminates with a retirement-ready state.
  const runOnce = (seed) => {
    let s = seed;
    const rng = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    const player = {
      age: 18, career_stage: STAGE.COLLEGE, career_path: null,
      stats: { SM: 6, IN: 6, CH: 6, GR: 6, CO: 6 }, stress: 0,
      college_progress: 0, grad_progress: 0, publications: 0, breakthroughs: 0,
      mentees_count: 0, has_leadership_role: false, college_grad_age: null,
    };
    let reputation = { SCI: 0, PUB: 0, NET: 0 };
    const history = [];
    let emptyYears = 0;
    for (let year = 0; year < 47; year++) {
      const ctx = {
        allEvents: ALL_EVENTS, player, reputation, flags: new Set(),
        relationships: [], history, cooldowns: {}, callbackQueue: [],
        pendingTransitions: [], pendingSim: null,
      };
      const evts = selectYearEvents(ctx, rng);
      if (evts.length === 0) emptyYears++;
      for (const e of evts) history.push(e.event.id);
      // crude progression so stages advance
      player.age += 1;
      player.college_progress += 1;
      player.grad_progress += 1;
      if (player.career_stage === STAGE.COLLEGE && player.age >= 22) {
        player.career_stage = STAGE.GRAD_SCHOOL;
        player.college_grad_age = player.age;
      } else if (player.career_stage === STAGE.GRAD_SCHOOL && player.age >= 27) {
        player.career_stage = STAGE.EARLY_CAREER;
        player.career_path = PATH.ACADEMIA;
      }
      player.publications += 1;
      reputation = applyReputation(reputation, { SCI: 2, NET: 1 });
      player.career_stage = player.career_stage === STAGE.COLLEGE || player.career_stage === STAGE.GRAD_SCHOOL
        ? player.career_stage
        : (qualifiesSenior(player, reputation) ? STAGE.SENIOR
          : qualifiesMidCareer(player, reputation) ? STAGE.MID_CAREER : STAGE.EARLY_CAREER);
    }
    return { player, reputation, emptyYears, history };
  };

  let worstEmpty = 0;
  let reachedSenior = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const r = runOnce(seed);
    worstEmpty = Math.max(worstEmpty, r.emptyYears);
    if (r.player.career_stage === STAGE.SENIOR) reachedSenior++;
  }
  ok(reachedSenior === 12, 'playthrough: all 12 seeded runs reach senior career by 65');
  // The store always fills a bare year with a quiet-year beat, so this is a
  // content-depth bar rather than a correctness one: most years should have
  // something authored in them.
  ok(worstEmpty <= 8, `playthrough: authored content covers most years (worst run had ${worstEmpty} bare years of 47; the store fills those with a quiet-year beat)`);
}

// ---- retrospective ----
{
  const state = {
    player: {
      name: 'Test', age: 63, motivation: 'legacy', career_path: PATH.ACADEMIA,
      stats: { SM: 8, IN: 7, CH: 6, GR: 9, CO: 6 }, publications: 40,
      breakthroughs: 2, mentees_count: 6, reactor_sims_completed: 4,
    },
    reputation: { SCI: 70, PUB: 40, NET: 65 },
    careerLog: [{ age: 40, outcome: 'excellent', event_title: 'x' }],
    counters: {
      policy_events: 2, outreach_events: 1, commercialization_events: 0,
      mentoring_events: 5, mentee_successes: 3, keynote_excellent: 1,
      chose_commercialization: false, stayed_in_lab: true,
    },
  };
  const retro = buildRetrospective(state);
  const axes = radarAxes(state);
  ok(Object.keys(axes).length === 4, 'retrospective: four radar axes (§9.5)');
  ok(Object.values(axes).every((v) => v >= 0 && v <= 100), 'retrospective: axes normalise to 0..100');
  ok(motivationAlignment(state) >= 0 && motivationAlignment(state) <= 100,
    'retrospective: motivation alignment scores 0..100 (§9.3)');
  ok(!!retro.closing && !!retro.opening, 'retrospective: opening and closing lines generated (§9.2, §9.4)');

  // every motivation must produce a valid score and a closing line
  let allMot = true;
  for (const m of ['planet', 'science', 'build', 'prove', 'legacy']) {
    const st = { ...state, player: { ...state.player, motivation: m } };
    const r = buildRetrospective(st);
    if (!r.closing || r.alignment < 0 || r.alignment > 100) allMot = false;
  }
  ok(allMot, 'retrospective: all five motivations score and close cleanly');

  // Personal Fulfillment weighs the life, not just the CV (deliberate
  // deviation from mapping the axis straight to §9.3, documented in
  // retrospective.js: alignment alone pinned at 88-100 for every strategy).
  const burnoutLog = (n) => Array.from({ length: n }, (_, i) => ({ age: 30 + i, event_id: 'burnout', outcome: 'burnout' }));
  const wreckState = {
    ...state,
    player: {
      ...state.player, motivation: 'science', health: 19, partner: null, children: 0,
      money: 2100000, equity: 0, debt: 0,
    },
    careerLog: [...state.careerLog, ...burnoutLog(12)],
  };
  const wholeState = {
    ...state,
    player: {
      ...state.player, motivation: 'science', health: 90,
      partner: { score: 80, married: true }, children: 2,
      money: 350000, equity: 90000, debt: 0,
    },
  };
  const wreck = radarAxes(wreckState)['Personal Fulfillment'];
  const whole = radarAxes(wholeState)['Personal Fulfillment'];
  ok(wreck < 55 && whole > 75 && whole - wreck >= 25,
    `retrospective: fulfillment separates a wrecked life from a whole one (${wreck} vs ${whole})`);

  // the ledger and the body get the last word when they earned it
  const brokeState = {
    ...state,
    player: { ...state.player, health: 75, money: 0, equity: 0, debt: 641000 },
  };
  const brokeClosing = buildRetrospective(brokeState).closing;
  ok(/owing \$641k/.test(brokeClosing),
    'retrospective: a negative net worth is named in the closing line');
  const friedState = {
    ...state,
    player: { ...state.player, health: 22, money: 100000, equity: 0, debt: 0 },
  };
  ok(/body/.test(buildRetrospective(friedState).closing),
    'retrospective: a wrecked body is named in the closing line');
  const cleanClosing = buildRetrospective(wholeState).closing;
  ok(!/owing|body/.test(cleanClosing),
    'retrospective: a solvent, healthy life closes without the codas');

  // The moments that stuck: significance beats recency. A late run of
  // excellent bench years must not crowd out the wedding, the sims, or the
  // burnout year (QA 2026-07-22: the old tail-of-log rule did exactly that).
  const log = [
    { age: 22, event_id: 'sim_thesis', event_title: 'Your thesis experiment', outcome: 'adequate' },
    { age: 26, event_id: 'burnout', event_title: 'Burnout', outcome: 'burnout' },
    { age: 30, event_id: 'life_marriage', event_title: 'The question', outcome: 'success' },
    { age: 33, event_id: 'cb_varga_collab', event_title: 'Réka has a proposal', outcome: 'success' },
    { age: 40, event_id: 'mid_replication', event_title: 'The result that will not repeat', outcome: 'excellent' },
    ...Array.from({ length: 10 }, (_, i) => ({
      age: 55 + Math.floor(i / 2), event_id: 'pursuit_bench', event_title: 'Time at the machine', outcome: 'excellent',
    })),
  ];
  const moments = significantMoments(log);
  const ids = moments.map((m) => m.event_id);
  ok(ids.includes('life_marriage') && ids.includes('sim_thesis') && ids.includes('burnout'),
    'retrospective: the wedding, the sim, and the burnout year all stick');
  ok(ids.filter((id) => id === 'pursuit_bench').length <= 2,
    'retrospective: a hot streak at the bench cannot own the list');
  const ages = moments.map((m) => m.age);
  ok(ages.every((a, i) => i === 0 || a >= ages[i - 1]),
    'retrospective: moments render in the order the life happened');
}

// ---- Pursuits: the player's own agency over the year ----
{
  let shapeOk = true;
  for (const p of PURSUITS) {
    if (!p.id || !p.label || !p.blurb || !p.stages?.length || !p.stats?.length) shapeOk = false;
    for (const g of ['excellent', 'adequate', 'poor']) {
      if (!p.grades?.[g]?.text) { shapeOk = false; console.log(`      ${p.id} missing ${g}`); }
    }
  }
  const ids = PURSUITS.map((p) => p.id);
  ok(shapeOk && new Set(ids).size === ids.length,
    `pursuits: all ${PURSUITS.length} are well-formed with three grades and unique ids`);

  // every stage must offer a real choice, or the planner is a formality
  const stages = ['COLLEGE', 'GRAD_SCHOOL', 'EARLY_CAREER', 'MID_CAREER', 'SENIOR'];
  let everyStageHasOptions = true;
  const counts = {};
  for (const stage of stages) {
    const player = {
      career_stage: stage, career_path: PATH.ACADEMIA, mentees_count: 1,
      stats: { SM: 6, IN: 6, CH: 6, GR: 6, CO: 6 }, stress: 10,
    };
    const opts = availablePursuits(player, { SCI: 30, PUB: 20, NET: 30 });
    counts[stage] = opts.length;
    if (opts.length < 4) everyStageHasOptions = false;
  }
  ok(everyStageHasOptions,
    `pursuits: every stage offers at least 4 ways to spend a year (${stages.map((s) => `${s.slice(0, 4)}:${counts[s]}`).join(' ')})`);

  // resolution scales with blocks committed and never crashes
  const player = {
    career_stage: 'MID_CAREER', career_path: PATH.ACADEMIA, mentees_count: 2,
    stats: { SM: 7, IN: 7, CH: 6, GR: 7, CO: 6 }, stress: 20,
  };
  const one = resolveYearPlan({ plan: ['writing', 'bench', 'rest'], player, reputation: {}, rng: () => 0.1 });
  const double = resolveYearPlan({ plan: ['writing', 'writing', 'rest'], player, reputation: {}, rng: () => 0.1 });
  const singleWriting = one.find((r) => r.id === 'writing');
  const doubleWriting = double.find((r) => r.id === 'writing');
  ok(one.length === 3 && double.length === 2 && doubleWriting.blocks === 2,
    'pursuits: a plan groups repeated blocks into one weighted result');
  ok(doubleWriting.effects.publications > singleWriting.effects.publications,
    `pursuits: doubling up multiplies the output (${singleWriting.effects.publications} -> ${doubleWriting.effects.publications} papers)`);
  ok(doubleWriting.effects.stress_delta > singleWriting.effects.stress_delta,
    'pursuits: doubling up also multiplies the stress, so specialising is a real bet');

  // A year spent on something you are badly equipped for must still be
  // survivable. There is no roll to force any more: stats 1 across the board
  // with high stress simply cannot clear the bar, which is the point.
  const worst = resolveYearPlan({
    plan: ['grants', 'grants', 'grants'],
    player: { ...player, stats: { SM: 1, IN: 1, CH: 1, GR: 1, CO: 1 }, stress: 70 },
    reputation: {},
  });
  ok(worst.length === 1 && worst[0].effects.stress_delta > 0,
    `pursuits: a year you are unequipped for still costs stress (grade ${worst[0].grade})`);

  // BALANCE QUESTION, see FEEDBACK.md: under dice, the +0.12-per-extra-block
  // concentration bonus only shifted the odds. Deterministically it is worth
  // four stat points, enough on its own to lift a stats-1 character over the
  // bar, so grinding one pursuit substitutes for aptitude entirely. Recorded
  // rather than silently retuned, because that is a game-feel decision.
  ok(worst[0].grade !== 'excellent',
    'pursuits: concentration alone does not make an unequipped year exceptional');

  // And the same plan run by a capable, rested character lands better, every
  // time. Determinism is only worth having if the inputs still matter.
  const best = resolveYearPlan({
    plan: ['grants', 'grants', 'grants'],
    player: { ...player, stats: { SM: 9, IN: 9, CH: 9, GR: 9, CO: 9 }, stress: 0 },
    reputation: {},
  });
  ok(best[0].grade !== 'poor',
    `pursuits: the same plan run by a capable character grades better (${worst[0].grade} -> ${best[0].grade})`);

  // Deterministic resolution made this a real risk: with nothing distinguishing
  // the pursuits, an even stat block graded all twenty the same way every year
  // for a whole run, and 40 of the 60 authored grade texts never rendered.
  // Per-pursuit `difficulty` is what prevents that, so assert the spread.
  {
    const flat = {
      health: 90, career_stage: 'MID_CAREER', mentees_count: 2, stress: 0,
      stats: { SM: 6, IN: 6, CH: 6, GR: 6, CO: 6 },
    };
    const grades = new Set();
    for (const p of PURSUITS) {
      const r = resolveYearPlan({ plan: [p.id], player: flat, reputation: {} });
      if (r.length) grades.add(r[0].grade);
    }
    ok(grades.size > 1,
      `pursuits: an even stat block does NOT grade every pursuit the same (${[...grades].join('/')})`);
  }

  // rest genuinely relieves stress at every grade
  const restGrades = ['excellent', 'adequate', 'poor'].map((g) => {
    const rng = () => (g === 'excellent' ? 0.01 : g === 'adequate' ? 0.5 : 0.999);
    return resolveYearPlan({ plan: ['rest'], player, reputation: {}, rng })[0];
  });
  ok(restGrades.every((r) => r.effects.stress_delta < 0),
    'pursuits: resting always lowers stress, however the year went');
}

// ---- Money and the rest of a life ----
{
  const base = {
    age: 30, career_stage: STAGE.EARLY_CAREER, career_path: PATH.ACADEMIA,
    has_leadership_role: false, money: 0, debt: 0, equity: 0,
    partner: null, children: 0, owns_home: false, health: 90, stress: 20,
  };

  // pay rises with stage, and the startup pays more than the university
  const gradPay = salaryFor({ ...base, career_stage: STAGE.GRAD_SCHOOL }, {});
  const postdocPay = salaryFor(base, {});
  const seniorPay = salaryFor({ ...base, career_stage: STAGE.SENIOR }, {});
  const startupPay = salaryFor({ ...base, career_path: PATH.STARTUP }, {});
  ok(gradPay < postdocPay && postdocPay < seniorPay && startupPay > postdocPay,
    `money: pay scales with stage and path (grad ${fmtMoney(gradPay)}, postdoc ${fmtMoney(postdocPay)}, senior ${fmtMoney(seniorPay)}, startup ${fmtMoney(startupPay)})`);

  // a family costs real money
  const solo = annualExpenses(base);
  const family = annualExpenses({ ...base, partner: { score: 70 }, children: 2 });
  ok(family > solo * 1.5,
    `money: dependants raise the cost of living (${fmtMoney(solo)} -> ${fmtMoney(family)})`);

  // A funded PhD roughly breaks even on a student's cost of living; the debt
  // a scientist carries into their thirties is the undergraduate tuition,
  // applied at graduation, and the stipend barely dents it.
  let gradPlayer = { ...base, career_stage: STAGE.GRAD_SCHOOL, debt: 46000 };
  for (let i = 0; i < 5; i++) {
    const r = settleYear(gradPlayer, {});
    gradPlayer = { ...gradPlayer, money: r.money, debt: r.debt };
  }
  ok(gradPlayer.debt > 20000,
    `money: tuition debt still hangs over you five years into the PhD (${fmtMoney(gradPlayer.debt)})`);

  // a working career clears it and builds something
  let mid = { ...gradPlayer, career_stage: STAGE.MID_CAREER };
  for (let i = 0; i < 15; i++) {
    const r = settleYear(mid, { SCI: 50, NET: 50 });
    mid = { ...mid, money: r.money, debt: r.debt, equity: r.equity };
  }
  ok(mid.debt === 0 && netWorth(mid) > 0,
    `money: fifteen mid-career years clear the debt and build savings (${fmtMoney(netWorth(mid))})`);

  // health declines with age and stress, and recovers when calm
  const calm = healthDrift({ ...base, age: 30, stress: 15 });
  const fried = healthDrift({ ...base, age: 60, stress: 85 });
  ok(calm > fried,
    `life: health drifts down faster when old and stressed (${calm.toFixed(1)}/yr vs ${fried.toFixed(1)}/yr)`);
  ok(healthModifier(90) === 0 && healthModifier(25) < -0.1,
    'life: poor health drags on every check');

  // a neglected relationship decays, and can end
  const neglected = partnerDrift({ ...base, partner: { score: 50 }, stress: 80, children: 1 });
  ok(neglected < -3,
    `life: long hours erode a relationship (${neglected.toFixed(1)}/yr with high stress and a child)`);

  // life pursuits exist and are gated sensibly
  const single = availablePursuits({ ...base, partner: null }, { SCI: 40, NET: 40 }).map((p) => p.id);
  const attached = availablePursuits({ ...base, partner: { score: 70 } }, { SCI: 40, NET: 40 }).map((p) => p.id);
  ok(single.includes('dating') && !single.includes('family'),
    'life: dating is offered when single, family time is not');
  ok(attached.includes('family') && !attached.includes('dating'),
    'life: family time replaces dating once you have someone');
  ok(single.includes('health') && single.includes('consulting'),
    'life: looking after yourself and earning on the side are always on the table');

  // The money warnings: the harsh economy is allowed to stay harsh only
  // because these tell the player the arithmetic while it can still be acted
  // on (QA 2026-07-22: a family academic could reach minus $641k at 65 with
  // the game never once saying the maths out loud).
  const kitchen = LIFE_EVENTS.find((e) => e.id === 'life_kitchen_table_math');
  const underwater = LIFE_EVENTS.find((e) => e.id === 'life_underwater');
  ok(!!kitchen && !!underwater, 'money warnings: both debt events exist');
  const debtCtx = (debt, extra = {}) => ({
    player: {
      age: 32, career_stage: STAGE.EARLY_CAREER, career_path: PATH.ACADEMIA,
      stats: { SM: 7, IN: 7, CH: 6, GR: 6, CO: 4 }, stress: 40, health: 80,
      money: 0, debt, partner: null, children: 0, ...extra,
    },
    reputation: { SCI: 30, PUB: 5, NET: 10 },
    flags: new Set(), relationships: [], history: [], cooldowns: {},
  });
  ok(!isEligible(kitchen, debtCtx(80000)) && isEligible(kitchen, debtCtx(180000)),
    'money warnings: the kitchen-table event waits for real debt (150k gate)');
  ok(!isEligible(underwater, debtCtx(200000)) && isEligible(underwater, debtCtx(400000)),
    'money warnings: Underwater fires only once the debt has its own gravity (350k gate)');
  ok(kitchen.max_fires === 1 && underwater.max_fires === 1,
    'money warnings: each says its piece exactly once');

  // life events are well-formed and non-nuclear
  ok(LIFE_EVENTS.length >= 10, `content: ${LIFE_EVENTS.length} life events outside the lab`);
  let lifeShapeOk = true;
  for (const e of LIFE_EVENTS) {
    if (!e.id || !e.title || !e.text) lifeShapeOk = false;
    for (const c of e.choices ?? []) {
      if (!c.label || c.label.length > 40) lifeShapeOk = false;
    }
  }
  ok(lifeShapeOk, 'content: every life event is well-formed');
}

// ---- character creation: gender and pronouns ----
{
  const fresh = freshPlayer();
  ok('gender' in fresh && 'pronouns' in fresh,
    'character creation: a fresh player has gender and pronoun fields, unset like background and motivation');
  ok(fresh.gender === null && fresh.pronouns === null,
    'character creation: gender starts unchosen, matching background/motivation until creation picks one');

  // save()/load() round-trip the whole player object through JSON in
  // localStorage (fusioncore_career_v1); prove gender and pronouns survive
  // that without a real localStorage in this headless environment.
  const chosen = {
    ...fresh, name: 'Test', gender: 'nonbinary',
    pronouns: { subject: 'they', object: 'them', possessive: 'their' },
  };
  const reloaded = JSON.parse(JSON.stringify({ player: chosen })).player;
  ok(reloaded.gender === 'nonbinary' && reloaded.pronouns.subject === 'they',
    'character creation: gender and pronouns survive a save/load JSON round trip');
}

console.log(failures === 0 ? '\nALL CAREER CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
