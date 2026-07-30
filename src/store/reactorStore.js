import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { createSimState, physicsTick } from '../engine/physics.js';
import {
  createFissionState, fissionTick, buildFissionContext,
  fissionPlantOf, FISSION_PLANTS, FISSION_SCENARIOS,
  fuelOrderCost, FUEL_ORDER_TICKS, FUEL_RELOAD_TICKS,
} from '../engine/fission.js';
import { FUSION_SCENARIOS } from '../engine/physics.js';
import { fissionLevelsFor, getFissionLevel } from '../engine/fission_levels.js';
import fissionTriggers from '../data/fission_triggers.json';
import { createEconState, econTick, buyTritium } from '../engine/economy.js';
import { LEVELS, getLevel, unlockedFeatures } from '../engine/levels.js';
import { TECH_TREE, getTech, techAvailable } from '../engine/tech.js';
import { buildAdvisorContext, evaluateTriggers } from '../engine/advisor.js';
import { buildFailureReport } from '../engine/failure.js';
import { applyManufacturingTolerances, dailySeedKey, seededRng } from '../engine/tolerances.js';
import { getPosting, nextPosting, firstPosting, buildPerformanceReview } from '../engine/career.js';
import { CAREER_STORAGE_KEYS } from '../career/careerStore.js';
import { directiveSetFor, createDuties, dutiesTick } from '../engine/directives.js';
import { CREW_DEFAULTS, crewControl } from '../engine/crew.js';
import { TUTORIALS, tutorialKeyFor, tutorialStep } from '../engine/tutorials.js';
import triggersData from '../data/advisor_triggers.json';
import triviaData from '../data/didyouknow.json';
import {
  TICK_MS, SIM_DT_S, RD_PER_STABLE_SIM_HOUR, RD_BONUS_Q1, RD_BONUS_LEVEL,
  WALL_REPLACE_COST, DIFFICULTIES,
  Z_EFF_BASE, QUENCH_DAMAGE_PCT, DISRUPTION_BASE_P,
  W_ZEFF, HMODE_DIV_PEAKING, HMODE_DIV_WEAR, HTS_QUENCH_DAMAGE_PCT,
  SHAPING_DISRUPT_MULT, BLANKET_MAINT_MULT,
} from '../engine/constants.js';

// One save slot per reactor, plus one for the career. A fission session must
// never eat a fusion campaign, and neither may touch the career file.
const SAVE_KEYS = {
  fusion: 'fusioncore_save_v2_fusion',
  fission: 'fusioncore_save_v2_fission',
  career: 'fusioncore_save_v2_career',
};
const LEGACY_SAVE_KEY = 'fusioncore_save_v1';
const AUTOSAVE_TICKS = 600; // 60 real seconds

function saveMeta(save) {
  if (!save) return null;
  return {
    levelId: save.level?.id ?? 1,
    completed: !!save.level?.completed,
    difficulty: save.sim?.difficulty?.label ?? 'Operator',
    savedAt: save.savedAt ?? 0,
    mode: save.mode ?? 'fusion',
    plantKey: save.sim?.plantKey ?? 'pwr',
    careerPostingId: save.career?.postingId ?? null,
  };
}

// Baseline safe configurations restored after a SCRAM repair (spec §4)
function levelBaseline(levelId) {
  if (levelId <= 2) return { B: 6.5, heat: 15, density: 0.1, cooling: 0 };
  if (levelId === 3) return { B: 8, heat: 30, density: 0.5, cooling: 0 };
  if (levelId === 4) return { B: 12, heat: 40, density: 1.0, cooling: 0 };
  return { B: 12, heat: 40, density: 1.0, cooling: 40 };
}

const DISRUPTION_CAUSES = {
  greenwald: {
    title: 'Density-Limit Disruption',
    text: 'Too dense for the field. The plasma collapsed into the walls.',
    cite: 'greenwald',
  },
  beta: {
    title: 'Pressure-Limit Disruption',
    text: 'Pressure beat the magnetic bottle. Confinement broke.',
    cite: 'troyon',
  },
  random: {
    title: 'Spontaneous Disruption',
    text: 'A random instability killed the plasma. Tokamaks do this. It is their known weakness.',
    cite: 'scram',
  },
};

// Planned maintenance: full-replacement cost per component (meltdown repair
// is always pricier. That gap is the incentive to service early).
export const SERVICE_COSTS = { firstWall: 50e6, divertor: 30e6, magnets: 80e6 };

// Non-critical notifications expire on their own to keep the stack readable.
const NOTE_TTL_TICKS = { 2: 900, 3: 600, 4: 450, 5: 450 };

// ---------- engineering notebook plumbing ----------
// Slider moves are committed to the log once the value has sat still for
// 2 real seconds; each committed decision gets an outcome check 15 sim-minutes
// later so the log reads "decision -> result", like a real shift log.
const DRAFT_SETTLE_TICKS = 20;
const OUTCOME_TICKS = 150;
const PRAISE_COOLDOWN_TICKS = 3000; // one earned-praise moment per ~5 real minutes
const NOTEBOOK_CAP = 400;

const CONTROL_LOG = {
  B: { label: 'magnetic field', fmt: (v) => `${v.toFixed(1)} T`, min: 0.2 },
  heat: { label: 'heating power', fmt: (v) => `${v.toFixed(0)} MW`, min: 1 },
  density: { label: 'fuel density', fmt: (v) => `${v.toFixed(2)} ×10²⁰ m⁻³`, min: 0.05 },
  cooling: { label: 'divertor cooling', fmt: (v) => `${v.toFixed(0)} MW`, min: 2 },
  fuelMix: { label: 'tritium fraction', fmt: (v) => `${(v * 100).toFixed(0)}%`, min: 0.05 },
  rods: { label: 'control rod target', fmt: (v) => `${v.toFixed(1)}% in`, min: 1 },
  pumps: { label: 'coolant pump flow', fmt: (v) => `${v.toFixed(0)}%`, min: 2 },
};

const HAZARD_LABELS = {
  greenwald: 'density-limit warning',
  beta: 'pressure-limit warning',
  divertor: 'divertor overheat warning',
  magnets: 'field-over-rating warning',
  fuelTemp: 'fuel over-temperature warning',
  coolant: 'coolant limit warning',
};

/** Why did the operator act? Read the alarms that were live at the time. */
function autoReason(sim) {
  const active = Object.entries(sim.hazards ?? {}).filter(([, v]) => v !== 0);
  if (active.length === 0) return undefined;
  return `Responding to the ${active.map(([k]) => HAZARD_LABELS[k] ?? k).join(' and ')}.`;
}

/** Metrics snapshotted when a decision is logged, compared OUTCOME_TICKS later. */
function snapshotMetrics(mode, sim) {
  const p = sim.physics;
  return mode === 'fission'
    ? { power: p.P + p.decayMW, stress: p.TfuelC, coolant: p.TcoolC }
    : { power: p.pFusionMW, net: p.netElecMW, stress: p.divertorTempC, Q: p.Q };
}

const relDelta = (a, b) => (b - a) / Math.max(Math.abs(a), 1e-9);

/**
 * Turn a before/after metric pair into an outcome sentence, and detect the
 * discovery case: stress meaningfully down while output held steady.
 */
function describeOutcome(mode, before, after) {
  const clauses = [];
  const powerD = relDelta(before.power, after.power);
  const stressD = relDelta(before.stress, after.stress);
  if (mode === 'fission') {
    if (before.power > 5 && Math.abs(powerD) >= 0.03) {
      clauses.push(`power ${powerD > 0 ? 'up' : 'down'} ${(Math.abs(powerD) * 100).toFixed(0)}%`);
    }
    if (Math.abs(stressD) >= 0.05) {
      clauses.push(`fuel ${before.stress.toFixed(0)} → ${after.stress.toFixed(0)} °C`);
    }
    if (Math.abs(relDelta(before.coolant, after.coolant)) >= 0.03) {
      clauses.push(`coolant ${before.coolant.toFixed(0)} → ${after.coolant.toFixed(0)} °C`);
    }
  } else {
    if (before.power > 1 && Math.abs(powerD) >= 0.03) {
      clauses.push(`fusion power ${powerD > 0 ? 'up' : 'down'} ${(Math.abs(powerD) * 100).toFixed(0)}%`);
    }
    if (before.Q > 0.05 && Math.abs(relDelta(before.Q, after.Q)) >= 0.05) {
      clauses.push(`Q ${before.Q.toFixed(2)} → ${after.Q.toFixed(2)}`);
    }
    if (Math.abs(stressD) >= 0.05) {
      clauses.push(`divertor ${before.stress.toFixed(0)} → ${after.stress.toFixed(0)} °C`);
    }
  }
  const text = clauses.length
    ? clauses.join('; ') + '.'
    : 'No significant change within 15 minutes.';
  // Discovery: cut the dominant stress metric >=12% while output held within 5%
  const powerFloor = mode === 'fission' ? 300 : 20;
  const discovery = before.power > powerFloor && after.power > powerFloor * 0.9
    && Math.abs(powerD) <= 0.05 && stressD <= -0.12
    ? { dropPct: Math.round(Math.abs(stressD) * 100) }
    : null;
  return { text, discovery };
}

function fmtLogClock(simSeconds) {
  const d = Math.floor(simSeconds / 86400);
  const h = Math.floor((simSeconds % 86400) / 3600);
  const m = Math.floor((simSeconds % 3600) / 60);
  return `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function defaultSettings() {
  return {
    volumes: { master: 0.8, ambient: 0.6, sfx: 0.8, alerts: 0.9, music: 0.4 },
    ttsEnabled: false,
    ttsVoice: null,
    ttsRate: 1.0,
    ttsPitch: 1.0,
    colorblind: 'none', // none | protanopia | deuteranopia | tritanopia
    reducedMotion: false,
    // The camera's slow orbit, on its own switch. It used to be tied to
    // reducedMotion, so the only way to stop the spin was to disable every
    // other animation in the game as well.
    autoRotate: true,
    dyslexicFont: false,
    uiScale: 1.0,
    audioEnabled: true,
  };
}

/** Levels/getLevel for whichever reactor (and fission plant) is running. */
export function levelsFor(mode, plantKey = 'pwr') {
  return mode === 'fission' ? fissionLevelsFor(plantKey) : LEVELS;
}
export function levelFor(mode, id, plantKey = 'pwr') {
  return mode === 'fission' ? getFissionLevel(id, plantKey) : getLevel(id);
}

function freshGameState(mode = 'fusion', plantKey = 'pwr') {
  return {
    mode,
    sim: mode === 'fission' ? createFissionState(plantKey) : createSimState(),
    econ: createEconState(),
    rd: { points: 0, unlocked: [], qAwarded: false },
    level: { id: 1, sustain: 0, completed: false },
    stats: { maxQ: 0, disruptions: 0, quenches: 0, repairs: 0, peakNetMW: 0 },
    notifications: [],
    advisorFeed: [{
      id: 'boot', type: 'info', simTime: 0,
      text: mode !== 'fission'
        ? 'Chief Engineer online. Follow the checklist to light your first plasma.'
        : plantKey === 'research'
          ? 'Reactor supervisor online. Rods are fully in. Ease them out toward ~45% and watch the reactivity balance. Try the Physics view: you can see every neutron generation.'
          : 'Shift supervisor online. Rods are fully inserted. Withdraw them slowly toward ~55% and watch reactivity.',
    }],
    history: [],
    notebook: [],          // the engineering log: decisions, events, outcomes
    notebookPending: [],   // outcome watchers waiting on their due tick
    controlDrafts: {},     // slider moves waiting to settle before logging
    lastPraiseTick: -99999,
    caseNotes: {},         // historical case files: id -> answered correctly
    career: null,          // null = classic campaign; else { postingId, completed: [...], duties }
    careerOpen: false,     // career modal (arrival brief / performance review)
    crew: { ...CREW_DEFAULTS }, // the senior posting's operations crew
    crewPausedUntil: 0,    // crew stands by while the player has the controls
    lastManualTick: -9999, // last hands-on control change (delegation directive)
    triggerMemory: {},
    lastAlarmTick: -10000,
    lastTriviaTick: 0,
    lastAutosaveTick: 0,
    pendingCutscene: null,
    gameOver: null,
    onboarding: { active: true, step: 0, key: tutorialKeyFor(mode, plantKey) },
    uiFx: { flashTick: -9999, shakeTick: -9999 },
    alarmLevel: 'none',
  };
}

let nextNoteId = 1;

export const useReactorStore = create((set, get) => ({
  screen: 'title', // title | game
  hasSave: false,
  saves: { fusion: null, fission: null, career: null }, // per-slot metadata for the title screen
  viewMode: 'normal', // normal | process (visible physics) | stress (false-color FEA)
  analysisView: false, // kept in sync with viewMode === 'stress' for the scene readers
  speed: 0,
  prevSpeed: 1,
  settingsOpen: false,
  caseFilesOpen: false, // historical accident investigations
  settings: defaultSettings(),
  ...freshGameState(),

  // ---------- lifecycle ----------
  async boot() {
    // migrate the old single-slot save into its reactor's slot
    const legacy = await idbGet(LEGACY_SAVE_KEY).catch(() => null);
    if (legacy) {
      const m = legacy.mode ?? 'fusion';
      const existing = await idbGet(SAVE_KEYS[m]).catch(() => null);
      if (!existing) await idbSet(SAVE_KEYS[m], legacy).catch(() => {});
      await idbDel(LEGACY_SAVE_KEY).catch(() => {});
    }
    const [fus, fis, car] = await Promise.all([
      idbGet(SAVE_KEYS.fusion).catch(() => null),
      idbGet(SAVE_KEYS.fission).catch(() => null),
      idbGet(SAVE_KEYS.career).catch(() => null),
    ]);
    set({
      saves: { fusion: saveMeta(fus), fission: saveMeta(fis), career: saveMeta(car) },
      hasSave: !!(fus || fis || car),
    });
    const latest = [fus, fis, car].filter(Boolean).sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))[0];
    if (latest?.settings) {
      set({ settings: { ...defaultSettings(), ...latest.settings } });
    } else if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // No saved prefs yet: inherit the OS motion preference as the default
      set((s) => ({ settings: { ...s.settings, reducedMotion: true } }));
    }
  },

  newGame(difficultyKey = 'operator', mode = 'fusion', plantKey = 'pwr', opts = {}) {
    const diff = DIFFICULTIES[difficultyKey] ?? DIFFICULTIES.operator;
    const fresh = freshGameState(mode, plantKey);
    fresh.sim.difficulty = diff;
    // Daily plant: everyone who starts today gets the same as-built machine, so
    // final LCOE is comparable. Seeded from the UTC date, not the local one.
    const daily = Boolean(opts.daily);
    const seedKey = daily ? dailySeedKey() : null;
    fresh.sim.dailySeed = seedKey;
    // A research reactor runs on a grant, not a utility balance sheet
    const plant = mode === 'fission' ? (FISSION_PLANTS[plantKey] ?? FISSION_PLANTS.pwr) : null;
    fresh.econ.funds = diff.funds * (plant?.fundsScale ?? 1);
    // Roll this campaign's as-built plant. No two builds are identical
    applyManufacturingTolerances(
      fresh.sim,
      mode === 'fission' && plantKey === 'research' ? 'research' : mode,
      seedKey ? seededRng(`${seedKey}:${mode}:${plantKey}`) : Math.random,
    );
    fresh.notebook = [{
      id: `nb_${nextNoteId++}`, simTime: 0, kind: 'event',
      text: `Campaign started (${diff.label}). As-built acceptance values recorded; see the As-Built Plant panel for how this machine differs from the drawings.`,
    }];
    // The tutorial gates the clock itself: frozen steps hold the sim still
    set({ ...fresh, screen: 'game', speed: 1, prevSpeed: 1 });
    scheduleLoop();
  },

  /**
   * Start the engineering career: one save, many machines. The first playable
   * posting is the commercial PWR; the notebook follows the engineer from
   * posting to posting (docs/CAREER_MODE.md).
   */
  newCareerGame(difficultyKey = 'operator') {
    const posting = firstPosting();
    get().newGame(difficultyKey, posting.mode, posting.plant ?? 'pwr');
    set({
      career: { postingId: posting.id, completed: [], duties: createDuties() },
      careerOpen: true, // arrival brief; the sim holds until it closes
      notebook: [
        {
          id: `nb_${nextNoteId++}`, simTime: 0, kind: 'career',
          text: `Hired: ${posting.title}. ${posting.org}.`,
        },
        {
          id: `nb_${nextNoteId++}`, simTime: 0, kind: 'event',
          text: 'As-built acceptance values recorded. This machine differs slightly from its drawings; see the As-Built Plant panel.',
        },
      ],
    });
    get().saveGame();
  },

  /** Accept the promotion: next posting, fresh machine, same notebook. */
  advancePosting() {
    const s = get();
    if (!s.career) return;
    const next = nextPosting(s.career.postingId);
    if (!next) return;
    const prior = getPosting(s.career.postingId);
    const review = s.career.completed.find((c) => c.postingId === s.career.postingId)?.review;
    const carried = [
      ...s.notebook,
      {
        id: `nb_${nextNoteId++}`, simTime: s.sim.time.simSeconds, kind: 'career',
        text: `Promotion accepted. Leaving ${prior.title}${review ? ` with a grade ${review.grade} review on file` : ''}.`,
      },
    ];
    const diffKey = s.sim.difficulty?.key ?? 'operator';
    // a new desk means a clean inbox and a fresh crew assignment
    const career = { ...s.career, postingId: next.id, duties: createDuties() };
    get().newGame(diffKey, next.mode, next.plant ?? 'pwr');
    set({
      career,
      crew: { ...CREW_DEFAULTS },
      crewPausedUntil: 0,
      careerOpen: true, // arrival brief for the new posting
      notebook: [
        ...carried,
        {
          id: `nb_${nextNoteId++}`, simTime: 0, kind: 'career',
          text: `Reported for duty: ${next.title}. ${next.org}. Log clock resets with the new plant.`,
        },
        {
          id: `nb_${nextNoteId++}`, simTime: 0, kind: 'event',
          text: 'As-built acceptance values recorded for the new machine. Different plant, different tolerances.',
        },
      ].slice(-NOTEBOOK_CAP),
    });
    get().saveGame();
  },

  setCareerOpen(open) {
    set({ careerOpen: open });
  },

  /** Configure the operations crew: enable, target, or envelope changes. */
  setCrew(patch) {
    const s = get();
    const crew = { ...s.crew, ...patch };
    set({ crew });
    if (patch.enabled !== undefined && patch.enabled !== s.crew.enabled) {
      get().pushAdvisor({
        type: 'info',
        text: patch.enabled
          ? `Crew has the machine. Target ${crew.targetNetMW} MW net, density ceiling ${(crew.gwMax * 100).toFixed(0)}% of limit.`
          : 'Crew stood down. The controls are yours.',
      });
      get().logNote({
        text: patch.enabled
          ? `Delegated operations to the crew (target ${crew.targetNetMW} MW net, envelope: density ${(crew.gwMax * 100).toFixed(0)}%, divertor ${(crew.divMax * 100).toFixed(0)}%).`
          : 'Took the machine back from the crew.',
        reason: patch.enabled ? 'A senior engineer runs people and envelopes, not sliders.' : undefined,
        watch: patch.enabled === true,
      });
    }
    get().saveGame();
  },

  /** Resume a save slot: 'fusion' | 'fission' | 'career'. */
  async continueGame(modeKey = 'fusion') {
    const save = await idbGet(SAVE_KEYS[modeKey] ?? SAVE_KEYS.fusion).catch(() => null);
    if (!save) return;
    // Migrate older saves that predate level-gated background risk
    if (save.sim?.physics && save.sim.physics.bgRiskScale === undefined) {
      save.sim.physics.bgRiskScale = save.level.id >= 4 ? 1 : save.level.id === 3 ? 0.6 : 0;
    }
    if (save.sim && !save.sim.hazards) {
      save.sim.hazards = { greenwald: 0, beta: 0, divertor: 0, magnets: 0 };
    }
    if (save.sim && !save.sim.difficulty) {
      save.sim.difficulty = DIFFICULTIES.operator;
    }
    if (save.mode === 'fission' && save.sim && !save.sim.design) {
      save.sim.design = { vesselT: 0.22, material: 'sa508' };
    }
    // v4 migration: plant-lifecycle fields. Old saves were born hot with a
    // standard core and (if operating) a synced generator.
    if (save.mode === 'fission' && save.sim && save.sim.controls.heaters === undefined) {
      save.sim.controls.heaters = true;
      save.sim.controls.genOnline = !!save.sim.physics.critical;
      save.sim.fuelCore = { enrichPct: 4.0 };
      save.sim.fuelCycle = { order: null, onSite: null, reloadTicksLeft: 0 };
      save.sim.physics.hotStandbyNoted = true;
    }
    // v3 migrations: as-built tolerances (older plants were built exactly to
    // print) and tech-tradeoff params derived from the purchased tech list
    if (save.sim && !save.sim.asBuilt) {
      save.sim.asBuilt = save.mode === 'fission'
        ? { pumps: 1, fuel: 1, turbine: 1 }
        : { confinement: 1, injector: 1, turbine: 1 };
    }
    if (save.mode !== 'fission' && save.sim?.physics && save.sim.physics.zEff === undefined) {
      const u = save.rd?.unlocked ?? [];
      const ph = save.sim.physics;
      ph.zEff = u.includes('divertor2') ? W_ZEFF : Z_EFF_BASE;
      ph.divertorPeaking = u.includes('hmode') ? HMODE_DIV_PEAKING : 1;
      ph.divertorWearMult = u.includes('hmode') ? HMODE_DIV_WEAR : 1;
      ph.quenchDamagePct = u.includes('hts') ? HTS_QUENCH_DAMAGE_PCT : QUENCH_DAMAGE_PCT;
      if (!ph.isStellarator && u.includes('shaping')) {
        ph.disruptionProbBase = DISRUPTION_BASE_P * SHAPING_DISRUPT_MULT;
      }
      if (u.includes('blanket') && save.econ) {
        save.econ.maintMult = (save.econ.maintMult ?? 1) * BLANKET_MAINT_MULT;
      }
    }
    // The notebook persists but the id counter does not: reseed it past every
    // saved entry, then repair duplicate ids that older builds wrote (dupes
    // break React keys and can mis-target outcome patches).
    for (const e of save.notebook ?? []) {
      const m = /^nb_(\d+)$/.exec(e.id ?? '');
      if (m) nextNoteId = Math.max(nextNoteId, Number(m[1]) + 1);
    }
    const seenIds = new Set();
    const notebook = (save.notebook ?? []).map((e) => {
      const dup = !e.id || seenIds.has(e.id);
      const id = dup ? `nb_${nextNoteId++}` : e.id;
      seenIds.add(id);
      return dup ? { ...e, id } : e;
    });
    set({
      ...freshGameState(save.mode ?? 'fusion'),
      sim: save.sim,
      econ: save.econ,
      rd: save.rd,
      level: save.level,
      stats: save.stats,
      notebook,
      caseNotes: save.caseNotes ?? {},
      career: save.career
        ? { ...save.career, duties: save.career.duties ?? createDuties() }
        : null,
      crew: { ...CREW_DEFAULTS, ...(save.crew ?? {}) },
      settings: { ...defaultSettings(), ...save.settings },
      onboarding: { active: false, step: 0, key: 'fusion' },
      screen: 'game',
      speed: 0,
      prevSpeed: 1,
      hasSave: true,
    });
    // Career edge: quit during the final cutscene leaves a finished posting
    // with no review on file. Write it now so the promotion offer is waiting.
    const s2 = get();
    if (s2.career && s2.level.completed
      && !s2.career.completed.some((c) => c.postingId === s2.career.postingId)) {
      filePerformanceReview(set, get);
    }
    scheduleLoop();
  },

  async saveGame() {
    const s = get();
    // Careers own their slot regardless of which reactor is currently running
    const slot = s.career ? 'career' : s.mode;
    const payload = {
      version: 3,
      savedAt: Date.now(),
      mode: s.mode,
      career: s.career,
      crew: s.crew,
      sim: s.sim, econ: s.econ, rd: s.rd, level: s.level,
      stats: s.stats, settings: s.settings,
      notebook: s.notebook.slice(-NOTEBOOK_CAP), caseNotes: s.caseNotes,
    };
    await idbSet(SAVE_KEYS[slot], payload).catch(() => {});
    set((s2) => ({
      hasSave: true,
      saves: { ...s2.saves, [slot]: saveMeta(payload) },
    }));
  },

  async wipeSave() {
    await idbDel(SAVE_KEYS.fusion).catch(() => {});
    await idbDel(SAVE_KEYS.fission).catch(() => {});
    await idbDel(SAVE_KEYS.career).catch(() => {});
    await idbDel(LEGACY_SAVE_KEY).catch(() => {});
    // the life-sim career lives in localStorage, not idb; "ALL saves" includes it
    try { for (const k of CAREER_STORAGE_KEYS) localStorage.removeItem(k); } catch { /* unavailable: nothing to wipe */ }
    set({ hasSave: false, saves: { fusion: null, fission: null, career: null } });
  },

  quitToTitle() {
    get().saveGame();
    set({ screen: 'title', speed: 0 });
    scheduleLoop();
  },

  // ---------- controls ----------
  setSpeed(speed) {
    const s = get();
    if (s.gameOver || s.pendingCutscene) return;
    set({ speed, prevSpeed: speed > 0 ? speed : s.prevSpeed });
    scheduleLoop();
  },

  setControl(key, value) {
    const s = get();
    const c = s.sim.controls;
    const clamped = {
      B: () => Math.min(Math.max(value, c.bMin), c.bMax),
      heat: () => Math.min(Math.max(value, c.heatMin), c.heatMax),
      density: () => Math.min(Math.max(value, c.densityMin), c.densityMax),
      cooling: () => Math.min(Math.max(value, 0), c.coolingMax),
      fuelMix: () => Math.min(Math.max(value, 0.05), 0.95),
      autoBuyTritium: () => value,
      heaters: () => value,
      genOnline: () => value,
      rods: () => Math.min(Math.max(value, 0), 100),
      pumps: () => Math.min(Math.max(value, 10), 100),
    }[key]?.();
    if (clamped === undefined) return;

    // Hands on the controls: the crew stands aside for 30 seconds, and the
    // delegation directive's no-touch clock resets
    if (['B', 'heat', 'density', 'cooling', 'fuelMix', 'rods', 'pumps'].includes(key)) {
      const patch = { lastManualTick: s.sim.time.ticks };
      if (s.crew.enabled && s.mode === 'fusion' && s.career) {
        patch.crewPausedUntil = s.sim.time.ticks + 300;
      }
      set(patch);
    }

    // Generator sync interlock: the breaker needs real steam behind it
    if (key === 'genOnline' && clamped) {
      const plant = fissionPlantOf(s.sim);
      if (s.sim.physics.P < plant.nominalMW * 0.08) {
        get().pushAdvisor({
          type: 'warning',
          text: 'Not enough steam to carry the generator. Reach ~8% power, then sync.',
        });
        return;
      }
    }
    set({ sim: { ...s.sim, controls: { ...c, [key]: clamped } } });
    get().maybeAdvanceTutorial();

    // Notebook: booleans log immediately; sliders open a draft that commits
    // once the value settles (see notebookTick)
    if (key === 'autoBuyTritium') {
      get().logNote({ text: `${clamped ? 'Enabled' : 'Disabled'} automatic tritium purchasing.` });
    } else if (key === 'heaters') {
      get().logNote({ text: `${clamped ? 'Energized' : 'Secured'} the pressurizer and heatup heaters.` });
    } else if (key === 'genOnline') {
      get().logNote({
        text: clamped ? 'Closed the generator breaker. Selling to the grid.' : 'Opened the generator breaker.',
        watch: clamped,
      });
      if (clamped) {
        get().pushAdvisor({ type: 'info', text: 'Generator synced. Every megawatt-hour now has a buyer.' });
      }
    } else if (CONTROL_LOG[key]) {
      set((st) => ({
        controlDrafts: {
          ...st.controlDrafts,
          [key]: {
            from: st.controlDrafts[key]?.from ?? c[key],
            to: clamped,
            lastTick: st.sim.time.ticks,
          },
        },
      }));
    }

  },

  // ---------- guided tutorial ----------
  /** Watch-steps advance themselves the moment their condition turns true. */
  maybeAdvanceTutorial() {
    const s = get();
    const step = tutorialStep(s.onboarding);
    if (!step || step.ack || !step.done) return;
    const ctx = { c: s.sim.controls, p: s.sim.physics, viewMode: s.viewMode };
    if (step.done(ctx)) get().advanceTutorial();
  },

  /** Move to the next step (ack buttons land here too). */
  advanceTutorial() {
    const s = get();
    if (!s.onboarding.active) return;
    const steps = TUTORIALS[s.onboarding.key] ?? [];
    const nextIdx = s.onboarding.step + 1;
    if (nextIdx >= steps.length) {
      set({ onboarding: { ...s.onboarding, active: false } });
      get().pushAdvisor({ type: 'info', text: 'Checklist complete. The machine is yours.' });
      get().logNote({ kind: 'milestone', text: 'Qualification checklist complete.' });
      if (get().speed === 0) set({ speed: 1, prevSpeed: 1 });
      scheduleLoop();
      return;
    }
    set({ onboarding: { ...s.onboarding, step: nextIdx } });
    // stepping onto a live step needs the clock running
    const entered = steps[nextIdx];
    if (!entered.freeze && get().speed === 0) {
      set({ speed: 1, prevSpeed: 1 });
      scheduleLoop();
    }
  },

  skipTutorial() {
    const s = get();
    if (!s.onboarding.active) return;
    set({ onboarding: { ...s.onboarding, active: false } });
    get().pushAdvisor({ type: 'info', text: 'Checklist skipped. The mission briefs carry everything you need.' });
    if (get().speed === 0) set({ speed: 1, prevSpeed: 1 });
    scheduleLoop();
  },

  /**
   * Load a simulator initial condition ("IC set"). Ends campaign scoring for
   * this save. Scenarios are the freeplay/simulation side of the software.
   */
  loadScenario(key) {
    const s = get();
    if (s.career) {
      // ICs mark the campaign complete, which would let a career skip its
      // postings. Careers earn their promotions.
      get().pushAdvisor({
        type: 'warning',
        text: 'Simulator ICs are disabled on a career posting. Finish the posting, or run them from a classic campaign.',
      });
      return;
    }
    const scenarios = s.mode === 'fission' ? FISSION_SCENARIOS : FUSION_SCENARIOS;
    const sc = scenarios[key];
    if (!sc) return;
    const diff = s.sim.difficulty;
    const sim = s.mode === 'fission' ? createFissionState() : createSimState();
    sim.difficulty = diff;
    sc.apply(sim);
    const levels = levelsFor(s.mode, sim.plantKey);
    set({
      sim,
      level: { id: levels.length, sustain: 0, completed: true },
      rd: sc.techIds ? { ...s.rd, unlocked: [...new Set([...s.rd.unlocked, ...sc.techIds])] } : s.rd,
      speed: 1,
      prevSpeed: 1,
      history: [],
      pendingCutscene: null,
      notifications: [],
      gameOver: null,
      onboarding: { active: false, step: 0, key: 'fusion' },
    });
    get().pushAdvisor({
      type: 'info',
      text: `IC loaded: ${sc.label}. Campaign scoring is off for this save. Pure simulation.`,
    });
    get().logNote({ kind: 'event', text: `Loaded simulator IC: ${sc.label}.` });
    scheduleLoop();
    get().saveGame();
  },

  /**
   * Apply a vessel design change (wall thickness, material). Real tradeoff:
   * thicker walls raise the safety factor and the bill. Requires shutdown.
   */
  applyVesselDesign(vesselT, material, refitCost) {
    const s = get();
    if (s.mode !== 'fission') return;
    if (s.sim.physics.critical) {
      get().pushAdvisor({ type: 'warning', text: 'SCRAM before modifying the vessel.' });
      return;
    }
    if (s.econ.funds < refitCost) {
      get().pushAdvisor({ type: 'warning', text: 'Insufficient funds for the refit.' });
      return;
    }
    const sim = structuredClone(s.sim);
    sim.design = { vesselT, material };
    set({
      sim,
      econ: { ...s.econ, funds: s.econ.funds - refitCost, opexCum: s.econ.opexCum + refitCost },
    });
    get().pushAdvisor({
      type: 'info',
      text: `Vessel refit complete: ${(vesselT * 100).toFixed(0)} cm wall. Check the new safety factor in Engineering Analysis.`,
    });
    get().logNote({
      text: `Vessel refit: ${(vesselT * 100).toFixed(0)} cm wall, ${material} steel ($${(refitCost / 1e6).toFixed(0)}M).`,
      reason: 'Trading capital cost against structural safety factor.',
    });
    get().saveGame();
  },

  /** Fission: slam all rods in. The reactor shuts down; decay heat does not. */
  scramReactor() {
    const s = get();
    if (s.mode !== 'fission') return;
    const sim = structuredClone(s.sim);
    sim.controls.rods = 100;
    sim.physics.rodPos = 100; // gravity drop
    if (!sim.physics.scrammed && sim.physics.critical) {
      sim.physics.tripCount = (sim.physics.tripCount ?? 0) + 1; // manual trips count too
    }
    sim.physics.scrammed = true;
    set({ sim });
    get().pushAdvisor({ type: 'warning', text: 'Manual SCRAM. Keep pumps on. Decay heat continues for hours.' });
    get().logNote({ text: 'Manual SCRAM: all rods inserted.', reason: autoReason(sim), watch: true });
  },

  /**
   * PWR fuel cycle, step 1: order a reload batch. You choose the enrichment;
   * the vendor chain (yellowcake, conversion, SWU, fabrication) sets the bill
   * and the clock. Delivery lands in sim.fuelCycle.onSite hours later.
   */
  orderFuel(enrichPct) {
    const s = get();
    if (s.mode !== 'fission') return;
    const plant = fissionPlantOf(s.sim);
    if (!plant.enrichment || plant.simpleRefuel) return;
    const e = Math.min(Math.max(enrichPct, plant.enrichment.min), plant.enrichment.max);
    const fc = s.sim.fuelCycle ?? { order: null, onSite: null, reloadTicksLeft: 0 };
    if (fc.order) {
      get().pushAdvisor({ type: 'warning', text: 'A fuel order is already in fabrication.' });
      return;
    }
    // market wobble on top of the pure chain cost
    const market = 1 + (Math.random() - 0.5) * 0.12;
    const cost = Math.round(fuelOrderCost(e).total * market);
    if (s.econ.funds < cost) {
      get().pushAdvisor({ type: 'warning', text: 'Insufficient funds for the fuel order.' });
      return;
    }
    set({
      sim: { ...s.sim, fuelCycle: { ...fc, order: { enrichPct: e, cost, ticksLeft: FUEL_ORDER_TICKS } } },
      econ: { ...s.econ, funds: s.econ.funds - cost, opexCum: s.econ.opexCum + cost },
    });
    get().pushAdvisor({
      type: 'info',
      text: `Fuel order placed: ${e.toFixed(2)}% enriched batch, $${(cost / 1e6).toFixed(0)}M. Fabrication takes ${(FUEL_ORDER_TICKS / 600).toFixed(0)} hours.`,
    });
    get().logNote({
      text: `Ordered a reload batch at ${e.toFixed(2)}% U-235 ($${(cost / 1e6).toFixed(0)}M).`,
      reason: 'Fuel arrives on the vendor’s schedule, not the core’s. Order before you need it.',
    });
    get().saveGame();
  },

  /**
   * PWR fuel cycle, step 2: the reload outage. Needs a shutdown reactor and
   * fuel on site; pins the rods in for the duration.
   */
  reloadCore() {
    const s = get();
    if (s.mode !== 'fission') return;
    const plant = fissionPlantOf(s.sim);
    if (plant.simpleRefuel) return;
    const fc = s.sim.fuelCycle ?? {};
    if (s.sim.physics.critical) {
      get().pushAdvisor({ type: 'warning', text: 'SCRAM before opening the vessel head.' });
      return;
    }
    if (!fc.onSite) {
      get().pushAdvisor({ type: 'warning', text: 'No fresh fuel on site. Order a batch first.' });
      return;
    }
    if (fc.reloadTicksLeft > 0) return;
    const sim = structuredClone(s.sim);
    sim.fuelCycle.reloadTicksLeft = FUEL_RELOAD_TICKS;
    sim.controls.rods = 100;
    set({ sim });
    get().pushAdvisor({
      type: 'info',
      text: `Reload outage started: ${fc.onSite.enrichPct.toFixed(2)}% batch going in. ${(FUEL_RELOAD_TICKS / 600).toFixed(0)} hours with the head off.`,
    });
    get().logNote({ text: `Began the reload outage (${fc.onSite.enrichPct.toFixed(2)}% batch).` });
  },

  /** Simple-refuel plants only (the research pool): swap plates on the grant. */
  refuelReactor() {
    const s = get();
    if (s.mode !== 'fission') return;
    if (!fissionPlantOf(s.sim).simpleRefuel) return;
    const refuelCost = fissionPlantOf(s.sim).refuelCost;
    if (s.sim.physics.critical) {
      get().pushAdvisor({ type: 'warning', text: 'Shut down (SCRAM) before refueling.' });
      return;
    }
    if (s.econ.funds < refuelCost) {
      get().pushAdvisor({ type: 'warning', text: 'Insufficient funds to refuel.' });
      return;
    }
    const sim = structuredClone(s.sim);
    sim.physics.burnup = 0;
    sim.physics.xenon = 0;
    sim.physics.iodine = 0;
    sim.physics.xenonPcm = 0;
    set({
      sim,
      econ: { ...s.econ, funds: s.econ.funds - refuelCost, opexCum: s.econ.opexCum + refuelCost },
    });
    get().pushAdvisor({ type: 'info', text: 'Fresh core loaded. Full excess reactivity restored.' });
    get().logNote({ text: `Refueled the core ($${(refuelCost / 1e6).toFixed(0)}M). Burnup and xenon reset.` });
  },

  /** Deliberate plasma shutdown: vent the stored energy, kill the beams. */
  shutdownPlasma() {
    const s = get();
    const sim = structuredClone(s.sim);
    sim.controls.heat = 0;
    sim.physics.W = 0;
    sim.physics.T = 0;
    sim.physics.plasmaOn = false; // immediate. Don't wait for the next tick (sim may be frozen)
    sim.physics.pFusionMW = 0;
    set({ sim });
    get().pushAdvisor({
      type: 'info',
      text: 'Plasma vented. Service parts now; raise heating to relight.',
    });
    get().logNote({ text: 'Deliberate plasma shutdown: maintenance window opened.' });
  },

  /** Planned maintenance: only while the reactor is off, cost scales with wear. */
  repairComponent(name) {
    const s = get();
    const costs = s.mode === 'fission' ? fissionPlantOf(s.sim).serviceCosts : SERVICE_COSTS;
    const health = s.sim.structure[name];
    if (health === undefined || costs[name] === undefined || health >= 99.95) return;
    if (s.sim.physics.plasmaOn) {
      get().pushAdvisor({
        type: 'warning',
        text: s.mode === 'fission' ? 'SCRAM before servicing.' : 'Shut the plasma down before servicing.',
      });
      return;
    }
    const cost = ((100 - health) / 100) * costs[name];
    if (s.econ.funds < cost) {
      get().pushAdvisor({ type: 'warning', text: 'Insufficient funds for this service job.' });
      return;
    }
    const structure = { ...s.sim.structure, [name]: 100 };
    structure.integrity = Math.min(...Object.entries(structure)
      .filter(([k]) => k !== 'integrity').map(([, v]) => v));
    set({
      sim: { ...s.sim, structure },
      econ: { ...s.econ, funds: s.econ.funds - cost, opexCum: s.econ.opexCum + cost },
    });
    const labels = {
      firstWall: 'First wall', divertor: 'Divertor', magnets: 'Magnets',
      cladding: 'Fuel cladding', vessel: 'Pressure vessel', steamGen: 'Steam generators',
    };
    get().pushAdvisor({ type: 'info', text: `${labels[name] ?? name} restored to 100%.` });
    get().logNote({
      text: `Serviced ${(labels[name] ?? name).toLowerCase()} from ${health.toFixed(0)}% to 100% ($${(cost / 1e6).toFixed(0)}M).`,
      reason: 'Planned maintenance is cheaper than failure.',
    });
  },

  buyTritiumAction(grams) {
    const s = get();
    const result = buyTritium(s.econ, s.sim.fuel, grams);
    if (!result) {
      get().pushAdvisor({ type: 'warning', text: 'Insufficient funds for tritium purchase.' });
      return;
    }
    const [econ, fuel] = result;
    set({ econ, sim: { ...s.sim, fuel } });
    get().logNote({ text: `Purchased ${grams} g of tritium on the open market.` });
  },

  purchaseTech(id) {
    const s = get();
    const tech = getTech(id);
    if (!tech || !techAvailable(tech, s.rd.unlocked, s.level.id)) return;
    if (s.rd.points < tech.cost) return;
    const sim = structuredClone(s.sim);
    const econ = { ...s.econ };
    tech.apply({ sim, econ });
    set({
      sim, econ,
      rd: { ...s.rd, points: s.rd.points - tech.cost, unlocked: [...s.rd.unlocked, id] },
    });
    get().pushAdvisor({
      type: 'info',
      text: `R&D deployed: ${tech.name}. ${tech.pros[0]}. The bill: ${tech.cons[0].toLowerCase()}.`,
      cite: tech.cite,
    });
    get().logNote({
      text: `Deployed ${tech.name}.`,
      reason: `Accepted tradeoff: ${tech.cons[0].toLowerCase()}.`,
      watch: true,
    });
    get().saveGame();
  },

  // ---------- notifications ----------
  pushNotification(n) {
    const note = { id: nextNoteId++, tick: get().sim.time.ticks, ...n };
    set((s) => {
      let list = [note, ...s.notifications].slice(0, 30);
      list.sort((a, b) => a.priority - b.priority || b.tick - a.tick);
      const patch = { notifications: list };
      if (note.priority <= 3) patch.lastAlarmTick = s.sim.time.ticks;
      if (note.priority === 1) { patch.speed = 0; } // P1 freezes the loop (spec §9)
      return patch;
    });
    if (n.priority === 1) scheduleLoop();
  },

  dismissNotification(id) {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },

  ackNotification(id) {
    const s = get();
    const note = s.notifications.find((n) => n.id === id);
    set({ notifications: s.notifications.filter((n) => n.id !== id) });
    if (note?.priority === 1 && !s.gameOver) {
      set({ speed: s.prevSpeed });
      scheduleLoop();
    }
  },

  pushAdvisor(entry) {
    set((s) => ({
      advisorFeed: [
        { id: `adv_${nextNoteId++}`, simTime: s.sim.time.simSeconds, ...entry },
        ...s.advisorFeed,
      ].slice(0, 60),
    }));
  },

  // ---------- engineering notebook ----------
  /**
   * Append an entry to the engineering log. kind: decision | event |
   * milestone | praise. `watch: true` snapshots the plant now and writes an
   * Outcome line onto this entry OUTCOME_TICKS later.
   */
  logNote({ text, kind = 'decision', reason, watch = false }) {
    const s = get();
    const entry = { id: `nb_${nextNoteId++}`, simTime: s.sim.time.simSeconds, kind, text, reason };
    set((st) => ({ notebook: [...st.notebook.slice(-(NOTEBOOK_CAP - 1)), entry] }));
    if (watch) {
      set((st) => ({
        notebookPending: [
          ...st.notebookPending.slice(-11),
          {
            noteId: entry.id,
            dueTick: s.sim.time.ticks + OUTCOME_TICKS,
            snap: snapshotMetrics(s.mode, s.sim),
          },
        ],
      }));
    }
    return entry.id;
  },

  /** Download the notebook as a plain-text shift log (or full career log). */
  exportNotebook() {
    const s = get();
    const posting = s.career ? getPosting(s.career.postingId) : null;
    const header = [
      s.career ? 'FUSIONCORE CAREER LOG' : 'FUSIONCORE ENGINEERING LOG',
      s.career
        ? `Current posting: ${posting?.title ?? 'Engineer'} (rung ${posting?.rung ?? '?'} of 7) | Difficulty: ${s.sim.difficulty?.label ?? 'Operator'} | Exported at T+${fmtLogClock(s.sim.time.simSeconds)}`
        : `Reactor: ${s.mode === 'fission' ? 'PWR fission plant' : 'Fusion tokamak'} | Difficulty: ${s.sim.difficulty?.label ?? 'Operator'} | Exported at T+${fmtLogClock(s.sim.time.simSeconds)}`,
      '-'.repeat(72),
    ];
    const lines = s.notebook.map((e) => {
      const out = [`[${fmtLogClock(e.simTime)}]  ${(e.kind ?? 'decision').toUpperCase().padEnd(9)} ${e.text}`];
      if (e.reason) out.push(`${' '.repeat(12)}Reason: ${e.reason}`);
      if (e.outcome) out.push(`${' '.repeat(12)}Outcome: ${e.outcome}`);
      return out.join('\n');
    });
    const blob = new Blob([[...header, ...lines].join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = s.career
      ? 'fusioncore_career_log.txt'
      : `${s.mode === 'fission' ? 'fissioncore' : 'fusioncore'}_engineering_log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  setCaseFilesOpen(open) {
    set({ caseFilesOpen: open });
  },

  /** Record a case-file investigation answer (persisted with the save). */
  answerCaseFile(caseId, correct) {
    set((s) => ({ caseNotes: { ...s.caseNotes, [caseId]: correct } }));
    get().saveGame();
  },

  // ---------- SCRAM / repair ----------
  repairReactor() {
    const s = get();
    if (!s.gameOver) return;
    const fee = s.gameOver.fee;
    const sim = structuredClone(s.sim);
    if (s.mode === 'fission') {
      sim.structure = { cladding: 100, vessel: 100, steamGen: 100, integrity: 100 };
      sim.controls.rods = 100;
      sim.controls.pumps = 100;
      sim.physics.P = 0.0005;
      sim.physics.decayMW = 0;
      sim.physics.avgP = 0;
      sim.physics.TfuelC = 290;
      sim.physics.TcoolC = 290;
      sim.physics.scrammed = false;
    } else {
      sim.structure = { firstWall: 100, divertor: 100, magnets: 100, integrity: 100 };
      const base = levelBaseline(s.level.id);
      Object.assign(sim.controls, base);
      sim.physics.W = 0; // vacuum chamber flushed
      sim.physics.T = 0;
      sim.physics.divertorTempC = 300;
    }
    set({
      sim,
      econ: { ...s.econ, funds: s.econ.funds - fee, opexCum: s.econ.opexCum + fee },
      gameOver: null,
      speed: 0,
      stats: { ...s.stats, repairs: s.stats.repairs + 1 },
      notifications: s.notifications.filter((n) => n.priority > 2),
    });
    get().pushAdvisor({
      type: 'info',
      text: `Repair crews have restored the reactor. $${(fee / 1e6).toFixed(0)}M charged against capital reserves. Configuration reset to the Level ${s.level.id} safe baseline.`,
    });
    get().logNote({
      kind: 'event',
      text: `Post-failure rebuild authorized ($${(fee / 1e6).toFixed(0)}M). All structures restored; controls reset to the safe baseline.`,
    });
    scheduleLoop();
  },

  completeCutscene() {
    const s = get();
    set({ pendingCutscene: null, speed: s.prevSpeed || 1 });
    scheduleLoop();
    // Career: the final mission cutscene rolls straight into the review
    if (s.career && s.level.completed
      && !s.career.completed.some((c) => c.postingId === s.career.postingId)) {
      filePerformanceReview(set, get);
    }
  },

  updateSettings(patch) {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    get().saveGame();
  },

  setSettingsOpen(open) {
    set({ settingsOpen: open });
  },

  setViewMode(mode) {
    set({ viewMode: mode, analysisView: mode === 'stress' });
    get().maybeAdvanceTutorial();
  },

  // ---------- the fixed-timestep tick ----------
  tick() {
    const s = get();
    if (s.screen !== 'game' || s.speed === 0 || s.gameOver || s.pendingCutscene || s.settingsOpen || s.caseFilesOpen || s.careerOpen) return;
    // Frozen tutorial steps hold the world still while the player reads;
    // live steps (heatups, criticality) need the clock to run
    if (s.onboarding.active) {
      const stepDef = tutorialStep(s.onboarding);
      if (!stepDef || stepDef.freeze) return;
    }

    // 1. physics (mode dispatch). The operations crew gets its hands on the
    // controls first: one small nudge per tick, inside the player's envelope
    let simIn = s.sim;
    if (s.career && s.mode === 'fusion' && s.crew.enabled
      && s.sim.time.ticks >= s.crewPausedUntil && !s.onboarding.active) {
      const nudge = crewControl(simIn, s.crew);
      if (Object.keys(nudge).length > 0) {
        simIn = { ...simIn, controls: { ...simIn.controls, ...nudge } };
      }
    }
    const r = s.mode === 'fission' ? fissionTick(simIn, Math.random) : physicsTick(simIn, Math.random);
    const time = {
      simSeconds: s.sim.time.simSeconds + SIM_DT_S,
      ticks: s.sim.time.ticks + 1,
    };
    // Spread the previous sim first: fields the physics doesn't return
    // (difficulty, future additions) must survive reassembly.
    let sim = { ...s.sim, time, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };

    // 1b. fission fuel cycle: fabrication clock and reload-outage progress
    if (s.mode === 'fission' && sim.fuelCycle && (sim.fuelCycle.order || sim.fuelCycle.reloadTicksLeft > 0)) {
      const fc = { ...sim.fuelCycle };
      if (fc.order) {
        fc.order = { ...fc.order, ticksLeft: fc.order.ticksLeft - 1 };
        if (fc.order.ticksLeft <= 0) {
          fc.onSite = { enrichPct: fc.order.enrichPct };
          fc.order = null;
          get().pushNotification({
            priority: 4, type: 'milestone', title: 'FUEL DELIVERY',
            text: `The ${fc.onSite.enrichPct.toFixed(2)}% reload batch is on site and inspected. Reload during any shutdown.`,
          });
          get().logNote({ kind: 'event', text: `Fuel delivery: ${fc.onSite.enrichPct.toFixed(2)}% batch received.` });
        }
      }
      if (fc.reloadTicksLeft > 0) {
        fc.reloadTicksLeft -= 1;
        if (fc.reloadTicksLeft === 0 && fc.onSite) {
          sim.fuelCore = { enrichPct: fc.onSite.enrichPct };
          sim.physics = { ...sim.physics, burnup: 0, xenon: 0, iodine: 0, xenonPcm: 0 };
          fc.onSite = null;
          get().pushNotification({
            priority: 4, type: 'milestone', title: 'CORE RELOADED',
            text: `Fresh ${sim.fuelCore.enrichPct.toFixed(2)}% core installed. Full excess reactivity restored. Head back on; heat up when ready.`,
          });
          get().logNote({ kind: 'milestone', text: `Reload outage complete: ${sim.fuelCore.enrichPct.toFixed(2)}% core loaded.` });
        }
      }
      sim.fuelCycle = fc;
    }

    // 2. economy
    let econ = econTick(s.econ, sim, Math.random);

    // 3. auto-buy tritium
    if (sim.controls.autoBuyTritium && sim.fuel.tritium < 2 && econ.funds > 0) {
      const bought = buyTritium(econ, sim.fuel, 10);
      if (bought) {
        [econ, sim.fuel] = [bought[0], bought[1]];
        sim = { ...sim };
      }
    }

    // 4. R&D accrual + milestones
    let rd = s.rd;
    if (sim.physics.stable) {
      rd = { ...rd, points: rd.points + RD_PER_STABLE_SIM_HOUR * (SIM_DT_S / 3600) };
    }
    if (!rd.qAwarded && sim.physics.Q > 1.0) {
      rd = { ...rd, points: rd.points + RD_BONUS_Q1, qAwarded: true };
      get().pushNotification({
        priority: 4, type: 'milestone', title: 'SCIENTIFIC BREAKEVEN',
        text: `Q crossed 1.0 for the first time. +${RD_BONUS_Q1} R&D points awarded.`,
      });
    }

    // 5. stats
    const stats = {
      ...s.stats,
      maxQ: Math.max(s.stats.maxQ, sim.physics.Q ?? 0),
      peakNetMW: Math.max(s.stats.peakNetMW, sim.physics.netElecMW),
    };

    set({ sim, econ, rd, stats });

    // 5a. live tutorial steps watch the plant (heatups, criticality, power)
    if (s.onboarding.active) get().maybeAdvanceTutorial();

    // 5b. engineering notebook: commit settled slider moves, resolve pending
    // outcome checks, and fire discovery praise when one is earned
    notebookTick(set, get, sim, time);

    // 6. engine events -> notifications / feed
    for (const ev of r.events) {
      if (ev.type === 'disruption') {
        const info = DISRUPTION_CAUSES[ev.cause];
        set((st) => ({
          stats: { ...st.stats, disruptions: st.stats.disruptions + 1 },
          uiFx: { ...st.uiFx, flashTick: time.ticks, shakeTick: time.ticks },
        }));
        get().pushNotification({
          priority: ev.severity > 1.2 ? 1 : 2, type: 'critical', title: info.title,
          text: info.text, cite: info.cite, requiresAck: ev.severity > 1.2,
        });
        get().pushAdvisor({ type: 'critical', text: `${info.title}: ${info.text}`, cite: info.cite });
        get().logNote({ kind: 'event', text: `${info.title}. Stored plasma energy dumped into the structure.` });
      } else if (ev.type === 'quench') {
        set((st) => ({
          stats: { ...st.stats, quenches: st.stats.quenches + 1 },
          uiFx: { ...st.uiFx, flashTick: time.ticks, shakeTick: time.ticks },
        }));
        get().pushNotification({
          priority: 1, type: 'critical', title: 'MAGNET QUENCH',
          text: 'A coil quenched and dumped its energy. Field collapsed to 3 T. Stay under the rating.',
          cite: 'quench', requiresAck: true,
        });
        get().logNote({ kind: 'event', text: `Magnet quench: coil energy dumped, ${(sim.physics.quenchDamagePct ?? 15).toFixed(0)}% coil damage. Field collapsed to 3 T.` });
      } else if (ev.type === 'hazard') {
        if (ev.phase === 'clear' && ev.remaining > 0) {
          const frac = ev.remaining / ev.graceTicks;
          const secs = (ev.remaining / 10).toFixed(0);
          get().logNote({
            kind: frac >= 0.5 ? 'praise' : 'event',
            text: `${HAZARD_LABELS[ev.hazard] ?? ev.hazard} cleared with ${secs}s on the clock.`,
          });
          // Earned praise: the save was made with real margin, not at the buzzer
          if (frac >= 0.5 && time.ticks - get().lastPraiseTick > PRAISE_COOLDOWN_TICKS) {
            set({ lastPraiseTick: time.ticks });
            get().pushNotification({
              priority: 4, type: 'milestone', title: 'CLEAN SAVE',
              text: `You cleared the ${HAZARD_LABELS[ev.hazard] ?? ev.hazard} with ${secs} seconds still on the clock. Acting early is what margin is for.`,
            });
          }
        } else if (ev.phase === 'start') {
          set({ lastAlarmTick: time.ticks });
          get().pushAdvisor({
            type: 'warning',
            text: {
              greenwald: 'Density limit crossed. Countdown running. Lower fuel density or raise field.',
              beta: 'Pressure limit crossed. Countdown running. Raise field or cut heating.',
              divertor: 'Divertor over its heat limit. Countdown running. Add cooling or cut heating.',
              magnets: 'Field above magnet rating. Lower it before a coil quenches.',
              fuelTemp: 'Fuel over temperature. Countdown running. Rods in or pumps up.',
              coolant: 'Coolant near boiling. Countdown running. More flow or less power.',
            }[ev.hazard],
          });
          get().logNote({ kind: 'event', text: `Alarm: ${HAZARD_LABELS[ev.hazard] ?? ev.hazard} countdown started.` });
        } else if (ev.phase === 'breach') {
          get().pushAdvisor({
            type: 'critical',
            text: ev.hazard === 'fuelTemp' ? 'Cladding failing. The protection system has tripped the reactor.'
              : ev.hazard === 'coolant' ? 'Steam generators taking damage. Reactor tripped.'
              : 'Divertor eroding at 1%/s. Cool it NOW.',
          });
          get().logNote({ kind: 'event', text: `Limit breached: ${HAZARD_LABELS[ev.hazard] ?? ev.hazard} ignored past the grace window. Damage in progress.` });
        }
      } else if (ev.type === 'prompt') {
        set((st) => ({
          uiFx: { ...st.uiFx, flashTick: time.ticks, shakeTick: time.ticks },
        }));
        get().pushNotification({
          priority: 1, type: 'critical', title: 'PROMPT CRITICAL EXCURSION',
          text: 'Reactivity exceeded the delayed-neutron fraction. Power spiked on prompt neutrons alone. The protection system slammed the rods in. Cladding took damage.',
          cite: 'prompt_crit', requiresAck: true,
        });
        get().logNote({ kind: 'event', text: 'PROMPT CRITICAL excursion. Power ran on prompt neutrons alone; RPS scrammed the reactor. Cladding damaged.' });
      } else if (ev.type === 'scram' && ev.reason !== 'prompt') {
        get().pushNotification({
          priority: 2, type: 'warning', title: 'REACTOR TRIP (SCRAM)',
          text: `Protection system inserted all rods (${
            ev.reason === 'fuelTemp' ? 'fuel over-temperature'
            : ev.reason === 'overpower' ? 'neutron flux above 118% nominal'
            : 'coolant limit'
          }). Keep the pumps running. Decay heat continues.`,
          cite: 'decay_heat',
        });
        get().logNote({
          kind: 'event',
          text: `Automatic reactor trip (${ev.reason === 'fuelTemp' ? 'fuel over-temperature' : ev.reason === 'overpower' ? 'overpower, flux above 118%' : 'coolant limit'}). One fatigue cycle consumed.`,
        });
      } else if (ev.type === 'hotStandby') {
        get().pushNotification({
          priority: 4, type: 'milestone', title: 'HOT STANDBY',
          text: 'Primary at operating temperature. The rod interlock is released: criticality is yours when you are ready.',
        });
        get().logNote({ kind: 'milestone', text: 'Reached hot standby. Rod withdrawal interlock released.' });
      } else if (ev.type === 'gridTrip') {
        get().pushNotification({
          priority: 2, type: 'warning', title: 'GENERATOR BREAKER OPEN',
          text: ev.reason === 'scram'
            ? 'The reactor tripped and the generator dropped off the grid with it. Re-sync after recovery.'
            : 'Reverse-power protection opened the breaker: not enough steam to carry the generator.',
        });
        get().logNote({ kind: 'event', text: `Generator breaker opened (${ev.reason === 'scram' ? 'reactor trip' : 'reverse power'}).` });
      } else if (ev.type === 'fuel_exhausted') {
        get().pushNotification({
          priority: 2, type: 'warning', title: 'FUEL EXHAUSTED',
          text: 'Tritium empty. The burn stopped. Buy fuel or enable auto-buy.',
          cite: 'tritium_price',
        });
      } else if (ev.type === 'meltdown' && !get().gameOver) {
        triggerGameOver(set, get);
      }
    }

    // 7. advisor rule matrix (mode-specific triggers and context)
    const ctx = s.mode === 'fission' ? buildFissionContext(sim, econ) : buildAdvisorContext(sim, econ);
    const fired = evaluateTriggers(
      s.mode === 'fission' ? fissionTriggers : triggersData,
      ctx, s.triggerMemory, time.ticks,
    );
    for (const t of fired) {
      get().pushAdvisor({ type: t.type, text: t.text, cite: t.cite });
    }

    // 8. alarm level for the audio layer (hazard countdowns are critical)
    const hazardsActive = Object.values(sim.hazards ?? {}).some((v) => v !== 0);
    const worst = get().notifications.find((n) => n.priority <= 2);
    const alarmLevel = get().gameOver || worst?.priority === 1 || hazardsActive ? 'crit'
      : worst ? 'warn' : 'none';
    if (alarmLevel !== s.alarmLevel) set({ alarmLevel });

    // 8b. expire stale non-critical notifications so the stack stays readable
    if (time.ticks % 50 === 0) {
      set((st) => ({
        notifications: st.notifications.filter(
          (n) => n.requiresAck || n.priority === 1 ||
            time.ticks - n.tick < (NOTE_TTL_TICKS[n.priority] ?? 600),
        ),
      }));
    }

    // 9. trivia (P5): only after 90+ real seconds alarm-free (spec §9)
    if (
      s.mode === 'fusion' &&
      time.ticks - get().lastAlarmTick > 900 &&
      time.ticks - s.lastTriviaTick > 2400 &&
      Math.random() < 0.003
    ) {
      const item = triviaData[Math.floor(Math.random() * triviaData.length)];
      set({ lastTriviaTick: time.ticks });
      get().pushNotification({ priority: 5, type: 'trivia', title: 'Did You Know?', text: item.text, cite: item.cite });
    }

    // 10. level progression
    const modeLevels = levelsFor(s.mode, sim.plantKey);
    const level = levelFor(s.mode, s.level.id, sim.plantKey);
    const passing = level.check({ physics: sim.physics, structure: sim.structure, econ });
    let sustain = passing ? s.level.sustain + 1 : 0;
    if (sustain >= level.sustainTicks && !s.level.completed) {
      const isLast = s.level.id >= modeLevels.length;
      const nextId = Math.min(s.level.id + 1, modeLevels.length);
      // Background disruptions stay off during the fusion tutorial, then ramp in
      if (s.mode === 'fusion') {
        sim.physics.bgRiskScale = nextId >= 4 ? 1 : nextId === 3 ? 0.6 : 0;
      }
      set({
        level: { id: nextId, sustain: 0, completed: isLast },
        rd: { ...get().rd, points: get().rd.points + RD_BONUS_LEVEL },
        pendingCutscene: level,
        speed: 0,
      });
      get().logNote({ kind: 'milestone', text: `Mission ${level.id} complete: ${level.name}. ${level.objective}.` });
      scheduleLoop();
      if (!isLast) {
        const next = levelFor(s.mode, s.level.id + 1, sim.plantKey);
        get().pushAdvisor({
          type: 'info',
          // The idea, not the setpoints. Numbers live behind the mission
          // panel's "stuck?" toggle so the player gets to work them out.
          text: `MISSION ${next.id}, ${next.name}: ${next.objective}. ${next.hint ?? ''}`.trim(),
        });
      }
      get().saveGame();
    } else {
      set({ level: { ...s.level, sustain } });
    }

    // 10b. career directives: the orders that make each rung a different job
    if (s.career) {
      const dutySet = directiveSetFor(s.career.postingId);
      const duties0 = s.career.duties ?? createDuties();
      if (dutySet.length > 0 && (duties0.current || duties0.idx < dutySet.length)) {
        const fc = sim.fuelCycle ?? {};
        const dCtx = {
          P: sim.physics.P,
          TcoolC: sim.physics.TcoolC,
          netElecMW: sim.physics.netElecMW,
          tripCount: sim.physics.tripCount ?? 0,
          burnup: sim.physics.burnup ?? 0,
          fuelSecured: !!(fc.order || fc.onSite),
          Q: sim.physics.Q ?? 0,
          plasmaOn: !!sim.physics.plasmaOn,
          hazardActive: Object.values(sim.hazards ?? {}).some((v) => v !== 0),
          crewEnabled: !!get().crew.enabled,
          ticksSinceManual: time.ticks - get().lastManualTick,
        };
        const { duties, events: dutyEvents } = dutiesTick(
          duties0, dutySet, dCtx, get().level.id, time.ticks,
        );
        if (duties !== duties0) {
          set((st) => ({ career: { ...st.career, duties } }));
        }
        for (const de of dutyEvents) {
          const d = de.directive;
          if (de.type === 'issued') {
            get().pushNotification({
              priority: 3, type: 'warning', title: `DIRECTIVE / ${d.from.toUpperCase()}`,
              text: d.text,
            });
            get().pushAdvisor({ type: 'info', text: `New directive from the ${d.from}: ${d.text}` });
            get().logNote({ kind: 'event', text: `Directive received from the ${d.from}: ${d.text}` });
          } else if (de.type === 'done') {
            get().pushNotification({
              priority: 4, type: 'milestone', title: 'DIRECTIVE COMPLETE',
              text: d.doneText ?? 'Signed off.',
            });
            get().logNote({ kind: 'milestone', text: `Directive complete (${d.from}): ${d.doneText ?? d.text}` });
          } else if (de.type === 'missed') {
            get().pushNotification({
              priority: 2, type: 'warning', title: 'DIRECTIVE MISSED',
              text: d.missText ?? 'The window closed. It goes in the file.',
            });
            get().logNote({ kind: 'event', text: `Directive MISSED (${d.from}). ${d.missText ?? ''}` });
          }
        }
      }
    }

    // 11. history ring buffer (chart data every 5 ticks)
    if (time.ticks % 5 === 0) {
      const entry = s.mode === 'fission'
        ? {
            t: time.simSeconds,
            P: sim.physics.P,
            Tfuel: sim.physics.TfuelC,
            xe: sim.physics.xenonPcm,
            rho: sim.physics.reactivityPcm,
            net: sim.physics.netElecMW,
          }
        : {
            t: time.simSeconds,
            T: sim.physics.T,
            Q: sim.physics.Q,
            pFus: sim.physics.pFusionMW,
            net: sim.physics.netElecMW,
            triple: sim.physics.tripleProduct,
            density: sim.controls.density,
            tauE: sim.physics.tauE,
          };
      set((st) => ({ history: [...st.history.slice(-239), entry] }));
    }

    // 12. autosave every 60 real seconds
    if (time.ticks - s.lastAutosaveTick >= AUTOSAVE_TICKS) {
      set({ lastAutosaveTick: time.ticks });
      get().saveGame();
    }
  },
}));

const FISSION_REPORTS = {
  cladding: {
    title: 'FUEL CLADDING FAILURE',
    text: 'Overheated fuel rods ruptured and released fission products into the coolant. Partial core damage.',
    cite: 'decay_heat',
    historical: 'TMI-2 melted half its core from decay heat after the reactor had already tripped.',
  },
  vessel: {
    title: 'PRESSURE VESSEL EMBRITTLEMENT',
    text: 'Decades of neutron bombardment (compressed into your run) made the vessel too brittle to certify. Plant retired.',
    cite: 'pwr',
    historical: 'Vessel embrittlement is the life-limiting factor for most of the world’s aging PWR fleet.',
  },
  steamGen: {
    title: 'STEAM GENERATOR FAILURE',
    text: 'Thermal cycling cracked the tube bundles. Primary coolant is leaking to the secondary side.',
    cite: 'pwr',
    historical: 'San Onofre closed permanently in 2013 over premature steam generator tube wear.',
  },
};

function triggerGameOver(set, get) {
  const s = get();
  const st = s.sim.structure;
  if (s.mode === 'fission') {
    const failed = st.cladding <= 0 ? 'cladding' : st.vessel <= 0 ? 'vessel' : 'steamGen';
    const fee = 200e6 + (failed === 'cladding' ? 300e6 : failed === 'vessel' ? 400e6 : 100e6);
    const report = buildFailureReport('fission', s.sim, s.stats, failed);
    set({ gameOver: { ...FISSION_REPORTS[failed], component: failed, fee, report }, speed: 0 });
    get().logNote({ kind: 'event', text: `FAILURE: ${FISSION_REPORTS[failed].title}. ${report.primary}` });
    scheduleLoop();
    return;
  }
  const failed = st.firstWall <= 0 ? 'firstWall' : st.divertor <= 0 ? 'divertor' : 'magnets';
  const reports = {
    firstWall: {
      title: 'FIRST WALL STRUCTURAL FAILURE',
      text: 'Neutron damage made the wall brittle. It cracked and the vacuum was lost. Servicing it would have prevented this.',
      cite: 'dpa_materials',
      historical: 'This is why ITER plans full blanket-replacement campaigns.',
    },
    divertor: {
      title: 'DIVERTOR DESTRUCTION',
      text: 'The exhaust plates melted and tungsten vapor poisoned the plasma. Servicing them would have prevented this.',
      cite: 'divertor_iter',
      historical: 'JET and ASDEX Upgrade have both melted tungsten in off-normal events.',
    },
    magnets: {
      title: 'MAGNET SYSTEM DESTRUCTION',
      text: 'Repeated shocks cracked the coils. No field, no bottle, no machine.',
      cite: 'quench',
      historical: 'Coil trouble ended NCSX; quench protection is a first-order design driver at ITER.',
    },
  };
  const fee = WALL_REPLACE_COST + 150e6 + (st.firstWall <= 0 ? 100e6 : 0) + (st.magnets <= 0 ? 250e6 : 0);
  const report = buildFailureReport('fusion', s.sim, s.stats, failed);
  set({
    gameOver: { ...reports[failed], component: failed, fee, report },
    speed: 0,
  });
  get().logNote({ kind: 'event', text: `FAILURE: ${reports[failed].title}. ${report.primary}` });
  scheduleLoop();
}

/**
 * Grade the finished posting from what actually happened and put the review
 * on file. Opens the career modal so the promotion offer is the next thing
 * the player reads. Grades never gate progress (design doc, non-goals).
 */
function filePerformanceReview(set, get) {
  const s = get();
  const posting = getPosting(s.career.postingId);
  const review = buildPerformanceReview(s.mode, {
    sim: s.sim, econ: s.econ, stats: s.stats, difficulty: s.sim.difficulty,
    duties: s.career.duties,
  });
  set({
    career: {
      ...s.career,
      completed: [...s.career.completed, { postingId: s.career.postingId, review, at: Date.now() }],
    },
    careerOpen: true,
  });
  get().logNote({
    kind: 'career',
    text: `Posting complete: ${posting.title}. Performance review filed, grade ${review.grade} (${review.gradeWord.toLowerCase()}).`,
  });
  get().saveGame();
}

// ---------- notebook tick: draft commits, outcome checks, discoveries ----------
function notebookTick(set, get, sim, time) {
  const st = get();

  // Commit slider drafts that have sat still for DRAFT_SETTLE_TICKS
  const draftKeys = Object.keys(st.controlDrafts);
  if (draftKeys.length) {
    const keep = {};
    let dirty = false;
    for (const key of draftKeys) {
      const d = st.controlDrafts[key];
      if (time.ticks - d.lastTick < DRAFT_SETTLE_TICKS) { keep[key] = d; continue; }
      dirty = true;
      const spec = CONTROL_LOG[key];
      if (spec && Math.abs(d.to - d.from) >= spec.min) {
        get().logNote({
          text: `Set ${spec.label} ${spec.fmt(d.from)} → ${spec.fmt(d.to)}.`,
          reason: autoReason(sim),
          watch: true,
        });
      }
    }
    if (dirty) set({ controlDrafts: keep });
  }

  // Resolve due outcome watchers; a good one can earn discovery praise.
  // Re-read pending: the draft commits above may have added new watchers.
  const pending = get().notebookPending;
  if (pending.length && pending.some((w) => w.dueTick <= time.ticks)) {
    const due = pending.filter((w) => w.dueTick <= time.ticks);
    const rest = pending.filter((w) => w.dueTick > time.ticks);
    let notebook = get().notebook;
    let discovery = null;
    for (const w of due) {
      const after = snapshotMetrics(st.mode, sim);
      const res = describeOutcome(st.mode, w.snap, after);
      notebook = notebook.map((e) => (e.id === w.noteId ? { ...e, outcome: res.text } : e));
      if (res.discovery) discovery = res.discovery;
    }
    set({ notebook, notebookPending: rest });

    if (discovery && time.ticks - get().lastPraiseTick > PRAISE_COOLDOWN_TICKS) {
      set({ lastPraiseTick: time.ticks });
      const text = st.mode === 'fission'
        ? `Fuel temperature is down ${discovery.dropPct}% and output held steady. You bought thermal margin without giving anything up. That is the whole job.`
        : `Divertor thermal load is down ${discovery.dropPct}% and output held steady. Cutting stress without losing power is how plants reach old age.`;
      get().pushNotification({ priority: 4, type: 'milestone', title: 'EXCELLENT ENGINEERING', text });
      get().pushAdvisor({ type: 'info', text });
      get().logNote({ kind: 'praise', text });
    }
  }
}

// A hot-swapped store module would create a second store instance that no one
// boots (stale hasSave, orphaned tick worker). Force a clean reload instead.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

// Dev-only console handle for driving the store in manual tests
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__fusioncoreStore = useReactorStore;
}

// ---------- fixed-timestep loop (decoupled from render, spec §1) ----------
// The timer lives in a dedicated Web Worker: worker timers are exempt from the
// background-tab throttling that freezes main-thread intervals, so the reactor
// keeps running when the tab is hidden. A catch-up accumulator replays missed
// ticks (capped at 40) if the browser stalls the worker anyway.
let worker = null;
let lastFire = 0;

export function scheduleLoop() {
  if (worker) { worker.terminate(); worker = null; }
  const { speed, screen } = useReactorStore.getState();
  if (screen !== 'game' || speed === 0) return;
  const interval = TICK_MS / speed;
  const url = URL.createObjectURL(
    new Blob([`setInterval(() => postMessage(0), ${interval});`], { type: 'application/javascript' }),
  );
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  lastFire = performance.now();
  worker.onmessage = () => {
    const now = performance.now();
    const due = Math.floor((now - lastFire) / interval);
    const ticks = Math.max(1, Math.min(due, 40));
    lastFire = now;
    const st = useReactorStore.getState();
    for (let i = 0; i < ticks; i++) st.tick();
  };
}
