// Career mode store: the year loop. Everything the spec describes as state
// (§10.1) lives here, and every mutation runs through the pure engine modules
// so the whole thing stays testable headless.
import { create } from 'zustand';
import { BALANCE, STATS } from './engine/balance.js';
import { applyStatDeltas, baseStats, applyBackground } from './engine/stats.js';
import { resolveCheck, resolveTiered, OUTCOME } from './engine/checks.js';
import { applyStress, yearlyBaseline, hitBurnout, inBurnoutRisk, burnoutRecovery } from './engine/stress.js';
import { applyReputation, grantModifier } from './engine/reputation.js';
import {
  createRelationship, adjustRelationship, relationshipModifier, findRelationship,
} from './engine/relationships.js';
import {
  STAGE, PATH, resolveStage, canGraduateCollege, mustGraduateCollege,
  canDefend, mustDefend, canRetire, mustRetire,
} from './engine/stages.js';
import { selectYearEvents, EVENT_TYPE } from './engine/events.js';
import { availablePursuits, resolveYearPlan, BLOCKS_PER_YEAR } from './engine/pursuits.js';
import { settleYear, netWorth } from './engine/money.js';
import {
  freshLife, healthDrift, clampHealth, healthModifier,
  partnerDrift, clampPartnerScore, makePartner, childStressEffect, relationshipEnding,
} from './engine/life.js';
import { buildRetrospective } from './engine/retrospective.js';
import { castForRun } from './data/npcs.js';
import { backgroundById } from './data/backgrounds.js';
import { SCHOOL_EVENTS } from './data/events_school.js';
import { CAREER_EVENTS } from './data/events_career.js';
import { TRANSITION_EVENTS, CALLBACK_EVENTS } from './data/events_transitions.js';
import { TEXTURE_EVENTS } from './data/events_texture.js';
import { LIFE_EVENTS } from './data/events_life.js';
import { EXTRA_EVENTS } from './data/events_extra.js';
import { PATH_EVENTS } from './data/events_paths.js';
import { SCHOOL_EVENTS_2 } from './data/events_school2.js';
import { dueSim, simById } from './data/sims.js';

export const ALL_EVENTS = [
  ...SCHOOL_EVENTS,
  ...CAREER_EVENTS,
  ...TRANSITION_EVENTS,
  ...CALLBACK_EVENTS,
  ...TEXTURE_EVENTS,
  ...LIFE_EVENTS,
  ...EXTRA_EVENTS,
  ...PATH_EVENTS,
  ...SCHOOL_EVENTS_2,
];

const SAVE_KEY = 'fusioncore_career_v1';
const RUNS_KEY = 'fusioncore_career_runs_v1';
// Everything the career keeps in localStorage, so "Delete ALL saves" can honour its word.
export const CAREER_STORAGE_KEYS = [SAVE_KEY, RUNS_KEY];

function freshCounters() {
  return {
    policy_events: 0,
    outreach_events: 0,
    commercialization_events: 0,
    mentoring_events: 0,
    mentee_successes: 0,
    keynote_excellent: 0,
    chose_commercialization: false,
    stayed_in_lab: false,
  };
}

function freshPlayer() {
  return {
    ...freshLife(),
    name: '',
    background: null,
    motivation: null,
    age: BALANCE.START_AGE,
    stats: baseStats(),
    stress: 0,
    career_stage: STAGE.COLLEGE,
    career_path: null,
    college_progress: 0,
    grad_progress: 0,
    college_grad_age: null,
    first_job_age: null,
    years_since_first_job: 0,
    publications: 0,
    breakthroughs: 0,
    mentees_count: 0,
    has_leadership_role: false,
    stayed_in_lab: false,
    pivoted: false,
    reactor_sims_completed: 0,
    sims_done: [],
    last_sim_age: -99,
  };
}

export const useCareerStore = create((set, get) => ({
  screen: 'title', // title | create | year | retrospective
  player: freshPlayer(),
  reputation: { SCI: 0, PUB: 0, NET: 0 },
  relationships: [],
  flags: new Set(),
  counters: freshCounters(),
  eventHistory: [],
  cooldowns: {},
  callbackQueue: [],
  careerLog: [],
  phase: 'plan',       // plan -> events -> summary
  plan: [],            // pursuit ids chosen for the year
  planResults: [],     // what those pursuits produced
  digest: [],          // random events that resolved without asking
  yearQueue: [],       // events pending this year
  currentIndex: 0,
  lastResult: null,    // the outcome panel under the current event
  yearResolved: false,
  retrospective: null,
  pendingSim: null,    // the sim handed to the physics engine
  panel: null,         // 'relationships' | 'log' | 'stats' | null
  toasts: [],

  // ---------- creation ----------
  startCreation() {
    set({ screen: 'create', player: freshPlayer() });
  },

  setDraft(patch) {
    set((s) => ({ player: { ...s.player, ...patch } }));
  },

  adjustStat(key, delta) {
    const s = get();
    const stats = { ...s.player.stats };
    const next = stats[key] + delta;
    const spent = STATS.reduce((sum, k) => sum + stats[k], 0);
    if (next < BALANCE.STAT_MIN || next > BALANCE.STAT_CREATION_MAX) return;
    if (delta > 0 && spent >= BALANCE.STAT_POOL) return;
    stats[key] = next;
    set({ player: { ...s.player, stats } });
  },

  /** Lock in the character and open year one. */
  beginCareer() {
    const s = get();
    const bg = backgroundById(s.player.background);
    const stats = bg ? applyBackground(s.player.stats, bg.bonuses) : s.player.stats;
    const cast = castForRun(null, Math.random)
      .filter((n) => n.stages?.includes(STAGE.COLLEGE) || n.stages?.includes(STAGE.GRAD_SCHOOL) || true)
      .map((n) => createRelationship(n, BALANCE.START_AGE));
    set({
      player: { ...s.player, stats },
      relationships: cast,
      reputation: { SCI: 0, PUB: 0, NET: 0 },
      flags: new Set(),
      counters: freshCounters(),
      eventHistory: [],
      cooldowns: {},
      callbackQueue: [],
      careerLog: [],
      screen: 'year',
    });
    get().openYear();
  },

  // ---------- the year loop ----------
  /** Open the planning phase: what will you spend this year on? */
  openYear() {
    const s = get();
    const { player } = s;

    // burnout takes the whole year (§3.4): no planning, no events
    if (hitBurnout(player.stress)) {
      const rec = burnoutRecovery();
      set({
        player: { ...player, stress: rec.stress },
        phase: 'summary',
        plan: [],
        planResults: [],
        digest: [],
        yearQueue: [],
        currentIndex: 0,
        yearResolved: true,
        lastResult: { text: rec.text, kind: 'burnout' },
      });
      get().pushLog({ event_id: 'burnout', event_title: 'Burnout', outcome: 'burnout', result_text: rec.text });
      return;
    }

    set({
      phase: 'plan',
      plan: [],
      planResults: [],
      digest: [],
      yearQueue: [],
      currentIndex: 0,
      lastResult: null,
      yearResolved: false,
    });
  },

  /** The pursuits on offer this year. */
  pursuitOptions() {
    const s = get();
    return availablePursuits(s.player, s.reputation);
  },

  addToPlan(id) {
    const s = get();
    if (s.plan.length >= BLOCKS_PER_YEAR) return;
    set({ plan: [...s.plan, id] });
  },

  removeFromPlan(index) {
    const s = get();
    set({ plan: s.plan.filter((_, i) => i !== index) });
  },

  /** Commit the year: resolve pursuits, then assemble the events. */
  commitPlan() {
    const s = get();
    if (s.phase !== 'plan') return; // double-tap must not resolve the pursuits twice
    if (s.plan.length !== BLOCKS_PER_YEAR) return;

    const results = resolveYearPlan({
      plan: s.plan,
      player: s.player,
      reputation: s.reputation,
      rng: Math.random,
    });

    // fold every pursuit's effects into the world
    for (const r of results) {
      get().applyEffects(
        { ...r.effects, text: r.text },
        { id: `pursuit_${r.id}`, title: r.label },
        r.grade,
        null,
        null,
        { silent: true },
      );
    }
    set({ planResults: results, lastResult: null });
    get().buildYearEvents();
  },

  /** Assemble this year's events (§7.2) and show the first decision. */
  buildYearEvents() {
    const s = get();
    const { player, reputation } = s;
    const pendingTransitions = get().dueTransitions();
    const sim = pendingTransitions.length === 0 ? dueSim(player, reputation) : null;
    const simEvent = sim
      ? {
          id: sim.sim_id,
          title: sim.title,
          text: sim.narrative_setup,
          type: EVENT_TYPE.REACTOR_SIM,
          sim,
        }
      : null;

    const queue = selectYearEvents(
      {
        allEvents: ALL_EVENTS,
        player,
        reputation,
        flags: s.flags,
        relationships: s.relationships,
        history: s.eventHistory,
        cooldowns: s.cooldowns,
        callbackQueue: s.callbackQueue,
        pendingTransitions,
        pendingSim: simEvent,
      },
      Math.random,
    );

    // Randoms are things that happened TO you: they do not deserve their own
    // tap. They resolve silently and appear in the year's digest. Only events
    // that ask something of you interrupt.
    const interactive = queue.filter((e) => e.event.type !== EVENT_TYPE.RANDOM);
    const passive = queue.filter((e) => e.event.type === EVENT_TYPE.RANDOM);

    const digest = [];
    for (const entry of passive) {
      const ev = entry.event;
      get().applyEffects(ev.effects ?? {}, ev, 'random', null, null, { silent: true });
      digest.push({ title: ev.title, text: ev.text });
    }

    set({
      yearQueue: interactive,
      digest,
      currentIndex: 0,
      lastResult: null,
      phase: interactive.length > 0 ? 'events' : 'summary',
      yearResolved: interactive.length === 0,
    });
  },

  /** Transitions that must fire this year (§7.2 step 2). */
  dueTransitions() {
    const { player } = get();
    const out = [];
    const byId = (id) => TRANSITION_EVENTS.find((e) => e.id === id);

    if (player.career_stage === STAGE.COLLEGE) {
      if (canGraduateCollege(player) || mustGraduateCollege(player)) out.push(byId('tr_college_grad'));
    } else if (player.career_stage === STAGE.GRAD_SCHOOL) {
      if (canDefend(player) || mustDefend(player)) out.push(byId('tr_defense'));
    } else if (player.career_stage === STAGE.EARLY_CAREER && player.career_path === null) {
      out.push(byId('tr_first_job'));
    }
    if (mustRetire(player)) out.push(byId('tr_retire'));
    return out.filter(Boolean);
  },


  /** The player picked a choice on a decision event. */
  choose(choiceIndex) {
    const s = get();
    // a second tap before the outcome panel renders must not re-roll the check
    if (s.lastResult) return;
    const entry = s.yearQueue[s.currentIndex];
    if (!entry) return;
    const choice = entry.event.choices?.[choiceIndex];
    if (!choice) return;

    let outcomeKey = 'success';
    let checkInfo = null;

    if (choice.stat_check) {
      const mods =
        (choice.stat_check.modifier ?? 0) +
        relationshipModifier(s.relationships, {
          npcIds: entry.event.npcs ?? [],
          roles: entry.event.grant ? ['administrator', 'rival'] : [],
        }) +
        (entry.event.grant ? grantModifier(s.reputation) : 0);

      const args = {
        stats: s.player.stats,
        statKeys: choice.stat_check.stats,
        modifier: mods + healthModifier(s.player.health ?? 90),
        stress: s.player.stress,
      };
      const tiered = choice.stat_check.tiered && choice.outcomes.excellent;
      const res = tiered ? resolveTiered(args) : resolveCheck(args);
      checkInfo = res;
      if (tiered) {
        outcomeKey = res.outcome === OUTCOME.EXCELLENT ? 'excellent'
          : res.outcome === OUTCOME.ADEQUATE ? 'success'
          : 'failure';
      } else {
        outcomeKey = res.passed ? 'success' : 'failure';
      }
    }

    const outcome = choice.outcomes[outcomeKey] ?? choice.outcomes.success;
    get().applyEffects(outcome, entry.event, outcomeKey, choice.label, checkInfo);
  },

  /**
   * Apply an outcome to the world: stats, stress, reputation, relationships,
   * flags, counters, and the log line.
   */
  applyEffects(outcome, event, outcomeKey, choiceLabel = null, checkInfo = null, opts = {}) {
    const s = get();
    const toasts = [];

    // stats
    const { stats, applied } = applyStatDeltas(s.player.stats, outcome.stat_deltas, s.player.age);
    for (const [k, v] of Object.entries(applied)) {
      toasts.push({ kind: v > 0 ? 'stat_up' : 'stat_down', key: k, value: v });
    }

    // stress + reputation
    const stress = applyStress(s.player.stress, outcome.stress_delta);
    const reputation = applyReputation(s.reputation, outcome.reputation_deltas);
    for (const [k, v] of Object.entries(outcome.reputation_deltas ?? {})) {
      if (v) toasts.push({ kind: 'rep', key: k, value: v });
    }

    // relationships (+ any callbacks their tier crossings queue)
    let relationships = s.relationships;
    let callbackQueue = [...s.callbackQueue];
    for (const [id, delta] of Object.entries(outcome.relationship_deltas ?? {})) {
      const rel = findRelationship(relationships, id);
      if (!rel) continue;
      const { relationship, callback } = adjustRelationship(rel, delta, {
        age: s.player.age,
        note: event.title,
        rng: Math.random,
      });
      relationships = relationships.map((r) => (r.id === id ? relationship : r));
      if (callback) callbackQueue.push(callback);
      toasts.push({ kind: 'rel', key: relationship.name, value: delta });
    }

    // flags + counters + player markers
    const flags = new Set(s.flags);
    for (const f of outcome.flags_set ?? []) flags.add(f);

    const counters = { ...s.counters };
    if (outcome.policy) counters.policy_events += outcome.policy;
    if (outcome.outreach) counters.outreach_events += outcome.outreach;
    if (outcome.commercialization) {
      counters.commercialization_events += outcome.commercialization;
      counters.chose_commercialization = true;
    }
    if (outcome.mentoring) counters.mentoring_events += outcome.mentoring;
    if (outcome.mentee_success) counters.mentee_successes += outcome.mentee_success;
    if (outcome.keynote_excellent) counters.keynote_excellent += outcome.keynote_excellent;
    if (outcome.stayed_in_lab) counters.stayed_in_lab = true;
    if (outcome.funded) counters.grants_won = (counters.grants_won ?? 0) + outcome.funded;
    if (outcome.standing) counters.standing = (counters.standing ?? 0) + outcome.standing;

    // life effects: health, a relationship, money coming in
    let partner = s.player.partner;
    if (outcome.meet_partner && !partner) {
      partner = makePartner(s.player.age, Math.random);
      toasts.push({ kind: 'rel', key: `Met ${partner.name}`, value: 1 });
    }
    if (outcome.partner_delta && partner) {
      partner = { ...partner, score: clampPartnerScore(partner.score + outcome.partner_delta) };
    }
    if (outcome.marry && partner) partner = { ...partner, married: true };

    const player = {
      ...s.player,
      partner,
      health: clampHealth((s.player.health ?? 90) + (outcome.health_delta ?? 0)),
      side_income: outcome.side_income ?? s.player.side_income ?? 0,
      money: (s.player.money ?? 0) + (outcome.money_delta ?? 0),
      owns_home: s.player.owns_home || !!outcome.buy_home,
      debt: Math.max(0, (s.player.debt ?? 0) + (outcome.debt_delta ?? 0)),
      children: (s.player.children ?? 0) + (outcome.have_child ? 1 : 0),
      last_child_age: outcome.have_child ? s.player.age : s.player.last_child_age,
      stats,
      stress,
      publications: s.player.publications + (outcome.publications ?? 0),
      breakthroughs: s.player.breakthroughs + (outcome.breakthroughs ?? 0),
      mentees_count: s.player.mentees_count + (outcome.mentees ?? 0),
      has_leadership_role: s.player.has_leadership_role || !!outcome.leadership,
      stayed_in_lab: s.player.stayed_in_lab || !!outcome.stayed_in_lab,
      college_progress: s.player.college_progress + (
        s.player.career_stage === STAGE.COLLEGE ? (outcome.progress ?? 0) : 0
      ),
      grad_progress: Math.max(0, s.player.grad_progress + (
        s.player.career_stage === STAGE.GRAD_SCHOOL ? (outcome.progress ?? 0) : 0
      )),
      career_path: outcome.set_path ?? s.player.career_path,
      pivoted: s.player.pivoted || (!!outcome.set_path && s.player.career_path !== null),
    };

    // stage hinges carried by transition events
    if (event.transition === 'college_graduate') {
      player.career_stage = STAGE.GRAD_SCHOOL;
      player.college_grad_age = s.player.age;
    } else if (event.transition === 'defense' && outcomeKey !== 'failure') {
      player.career_stage = STAGE.EARLY_CAREER;
    } else if (event.transition === 'first_job') {
      player.first_job_age = s.player.age;
    } else if (event.transition === 'retire') {
      player.career_stage = STAGE.RETIRED;
    }

    set({
      player,
      reputation,
      relationships,
      callbackQueue: callbackQueue.filter((c) => c.trigger_age > s.player.age || c.event_id !== event.id),
      flags,
      counters,
      eventHistory: [...s.eventHistory, event.id],
      cooldowns: { ...s.cooldowns, [event.id]: s.player.age },
      // Silent effects (pursuits, background randoms) feed the year digest
      // instead of interrupting with their own panel and Continue tap.
      ...(opts.silent ? {} : {
        lastResult: { text: outcome.text, kind: outcomeKey, check: checkInfo, toasts },
        toasts,
      }),
    });

    get().pushLog({
      event_id: event.id,
      event_title: event.title,
      choice_made: choiceLabel,
      outcome: outcomeKey,
      result_text: outcome.text,
      milestone: !!event.transition || !!outcome.breakthroughs,
    });
  },

  pushLog(entry) {
    const s = get();
    set({
      careerLog: [
        ...s.careerLog,
        { age: s.player.age, year: 2045 + (s.player.age - BALANCE.START_AGE), ...entry },
      ],
    });
  },

  /** Advance to the next event in the year, or move to the year's summary. */
  nextEvent() {
    const s = get();
    const idx = s.currentIndex + 1;
    if (idx >= s.yearQueue.length) {
      set({ yearResolved: true, lastResult: null, phase: 'summary' });
      return;
    }
    set({ currentIndex: idx, lastResult: null });
  },

  /** Age up: the only button that moves time (§12.1). */
  ageUp() {
    const s = get();
    // time only moves from a closed year: queued double-taps must not skip years
    if (s.phase !== 'summary') return;
    if (s.player.career_stage === STAGE.RETIRED) {
      get().retire();
      return;
    }
    const age = s.player.age + 1;
    let stress = applyStress(s.player.stress, yearlyBaseline(age));

    // burnout-risk band fires its own trouble (§3.4)
    let extraLog = null;
    if (inBurnoutRisk(stress) && Math.random() < BALANCE.STRESS_RANDOM_NEGATIVE_CHANCE) {
      stress = applyStress(stress, 6);
      extraLog = 'A bad month. Sleep went first, then patience. Nothing broke that anyone could point to.';
    }

    const player = {
      ...s.player,
      age,
      stress,
      years_since_first_job: s.player.first_job_age ? age - s.player.first_job_age : 0,
    };
    player.career_stage = resolveStage(player, s.reputation);

    // the body, the relationship, and the bank account all move every year
    player.stress = applyStress(player.stress, childStressEffect(player));
    player.health = clampHealth(player.health + healthDrift(player));
    if (player.partner) {
      const score = clampPartnerScore(player.partner.score + partnerDrift(player));
      const bottomed = score <= 0 ? (player.partner.rock_bottom_years ?? 0) + 1 : 0;
      const next = { ...player.partner, score, rock_bottom_years: bottomed };
      if (relationshipEnding(next)) {
        player.partner = null;
        get().pushLog({
          event_id: 'partner_left', event_title: 'It ended',
          outcome: 'negative',
          result_text: 'Years of being second to the work finally added up. They left, and were kind about it, which was worse.',
        });
      } else {
        player.partner = next;
      }
    }
    const settled = settleYear(player, s.reputation);
    player.money = settled.money;
    player.debt = settled.debt;
    player.equity = settled.equity;
    player.side_income = 0; // consulting has to be re-chosen each year

    set({ player, yearResolved: false, lastResult: null, toasts: [], phase: 'plan' });
    if (extraLog) {
      get().pushLog({ event_id: 'stress_incident', event_title: 'A bad month', outcome: 'negative', result_text: extraLog });
    }
    get().openYear();
    get().save();
  },

  // ---------- reactor sim bridge ----------
  /** Resolve a sim from the physics engine, or from the Skip button (§8.3). */
  resolveSim(simId, outcomeKey) {
    const s = get();
    const sim = simById(simId);
    if (!sim) return;
    const effects = sim.effects[outcomeKey] ?? sim.effects.adequate;
    const player = {
      ...s.player,
      reactor_sims_completed: s.player.reactor_sims_completed + 1,
      sims_done: [...s.player.sims_done, simId],
      last_sim_age: s.player.age,
    };
    set({ player, pendingSim: null });
    get().applyEffects(effects, { id: simId, title: sim.title }, outcomeKey);
  },

  launchSim(sim) {
    set({ pendingSim: sim });
  },

  // ---------- retirement ----------
  canRetireNow() {
    return canRetire(get().player);
  },

  retire() {
    const s = get();
    const retro = buildRetrospective({
      player: s.player,
      reputation: s.reputation,
      careerLog: s.careerLog,
      counters: s.counters,
    });
    set({ retrospective: retro, screen: 'retrospective' });
    get().archiveRun(retro);
  },

  // ---------- panels / persistence ----------
  setPanel(panel) {
    set((s) => ({ panel: s.panel === panel ? null : panel }));
  },

  save() {
    const s = get();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 'career-1',
        player: s.player,
        reputation: s.reputation,
        relationships: s.relationships,
        flags: [...s.flags],
        counters: s.counters,
        eventHistory: s.eventHistory,
        cooldowns: s.cooldowns,
        callbackQueue: s.callbackQueue,
        careerLog: s.careerLog,
      }));
    } catch { /* storage full or unavailable: play on */ }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      set({
        player: d.player,
        reputation: d.reputation,
        relationships: d.relationships,
        flags: new Set(d.flags ?? []),
        counters: { ...freshCounters(), ...(d.counters ?? {}) },
        eventHistory: d.eventHistory ?? [],
        cooldowns: d.cooldowns ?? {},
        callbackQueue: d.callbackQueue ?? [],
        careerLog: d.careerLog ?? [],
        screen: 'year',
      });
      get().openYear();
      return true;
    } catch { return false; }
  },

  hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
  },

  archiveRun(retro) {
    try {
      const raw = localStorage.getItem(RUNS_KEY);
      const runs = raw ? JSON.parse(raw) : [];
      runs.push({ at: Date.now(), ...retro });
      localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(-12)));
      localStorage.removeItem(SAVE_KEY);
    } catch { /* ignore */ }
  },

  pastRuns() {
    try {
      const raw = localStorage.getItem(RUNS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  exit() {
    set({ screen: 'title', panel: null });
  },
}));

// Dev-only console handle, matching the reactor store's. Optional-chained so
// the headless suites can import this module outside Vite.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__careerStore = useCareerStore;
}
