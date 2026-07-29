// Headless balance verification: proves every level objective is reachable
// inside the slider bounds, using only the pure engine modules.
// Run: npm run balance
import { createSimState, physicsTick } from '../src/engine/physics.js';
import { createFissionState, fissionTick, enrichExcessFactor, fuelOrderCost } from '../src/engine/fission.js';
import { fissionAnalysis, fusionAnalysis } from '../src/engine/structural.js';
import { FISSION_LEVELS, RESEARCH_LEVELS } from '../src/engine/fission_levels.js';
import { createEconState, econTick } from '../src/engine/economy.js';
import { LEVELS } from '../src/engine/levels.js';
import { getTech, TECH_TREE } from '../src/engine/tech.js';
import { sigmaV } from '../src/engine/reactivity.js';
import { buildFailureReport } from '../src/engine/failure.js';
import {
  applyManufacturingTolerances, worstCaseAsBuilt, TOLERANCE_SPECS,
  dailySeedKey, seededRng,
} from '../src/engine/tolerances.js';
import { scoreCampaign, gradeFor } from '../src/engine/scorecard.js';
import { SIM_DT_S, Z_EFF_BASE, QUENCH_DAMAGE_PCT } from '../src/engine/constants.js';
import {
  CAREER_POSTINGS, firstPosting, nextPosting, buildPerformanceReview,
} from '../src/engine/career.js';
import { CASE_FILES } from '../src/data/case_files.js';
import { DIRECTIVE_SETS, createDuties, dutiesTick } from '../src/engine/directives.js';
import { crewControl } from '../src/engine/crew.js';
import { TUTORIALS } from '../src/engine/tutorials.js';

const noDisrupt = () => 1;      // never roll a disruption/quench
const steadyPrice = () => 0.5;  // zero gaussian noise -> price pinned at $50

let sim = createSimState();
let econ = createEconState();
let failures = 0;
// Mirrors the store's stats accumulator so the walkthrough can be graded.
const runStats = { maxQ: 0, disruptions: 0, quenches: 0, repairs: 0, peakNetMW: 0 };

function applyControls(controls) {
  sim = { ...sim, controls: { ...sim.controls, ...controls } };
}

function applyTechById(id) {
  const ctx = { sim, econ };
  getTech(id).apply(ctx);
}

function run(ticks) {
  for (let i = 0; i < ticks; i++) {
    const r = physicsTick(sim, noDisrupt);
    sim = {
      ...sim,
      controls: r.controls,
      physics: r.physics,
      structure: r.structure,
      fuel: r.fuel,
      hazards: r.hazards,
      time: {
        simSeconds: sim.time.simSeconds + SIM_DT_S,
        ticks: sim.time.ticks + 1,
      },
    };
    econ = econTick(econ, sim, steadyPrice);
    runStats.maxQ = Math.max(runStats.maxQ, sim.physics.Q ?? 0);
    runStats.peakNetMW = Math.max(runStats.peakNetMW, sim.physics.netElecMW ?? 0);
    // keep fuel topped up for the physics check; economics tested separately
    if (sim.fuel.tritium < 5) sim.fuel.tritium += 20;
    if (sim.fuel.deuterium < 5) sim.fuel.deuterium += 20;
  }
}

function sustained(level, ticks) {
  let count = 0;
  for (let i = 0; i < ticks; i++) {
    run(1);
    count = level.check({ physics: sim.physics, structure: sim.structure, econ }) ? count + 1 : 0;
    if (count >= level.sustainTicks) return true;
  }
  return false;
}

function phase(levelId, label, controls, techIds, settleTicks, windowTicks) {
  const level = LEVELS[levelId - 1];
  for (const id of techIds) applyTechById(id);
  applyControls(controls);
  run(settleTicks);
  const ok = sustained(level, windowTicks);
  const p = sim.physics;
  const s = sim.structure;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  L${levelId} ${label.padEnd(16)} ` +
    `T=${p.T.toFixed(1)}keV  tau=${p.tauE.toFixed(2)}s  Q=${p.Q.toFixed(2)}  ` +
    `Pfus=${p.pFusionMW.toFixed(0)}MW  net=${p.netElecMW.toFixed(0)}MWe  ` +
    `homes=${(p.homesPowered / 1e6).toFixed(2)}M  ` +
    `hp=[${s.firstWall.toFixed(0)},${s.divertor.toFixed(0)},${s.magnets.toFixed(0)}]  ` +
    `divT=${p.divertorTempC.toFixed(0)}C  gw=${p.greenwaldFrac.toFixed(2)}  ` +
    `LCOE=${econ.lcoe === null ? '—' : '$' + econ.lcoe.toFixed(0)}`,
  );
  if (!ok) failures++;
  return ok;
}

// ---- Reactivity sanity ----
const sv10 = sigmaV(10);
const svOk = sv10 > 0.9e-22 && sv10 < 1.3e-22;
let monotone = true;
for (let t = 1; t < 50; t += 0.25) {
  if (sigmaV(t + 0.25) < sigmaV(t) * 0.999) { monotone = false; break; }
}
console.log(`${svOk && monotone ? 'PASS' : 'FAIL'}  reactivity fit: sigmaV(10keV)=${sv10.toExponential(2)} m3/s, monotone 1-50keV=${monotone}`);
if (!svOk || !monotone) failures++;

// ---- Anti-idle checks: missions must NOT complete without player action ----
{
  const runIdle = (sim2, ticks) => {
    for (let i = 0; i < ticks; i++) {
      const r = physicsTick(sim2, noDisrupt);
      sim2 = { ...sim2, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
      sim2.time = { simSeconds: sim2.time.simSeconds + SIM_DT_S, ticks: sim2.time.ticks + 1 };
      if (sim2.fuel.tritium < 5) sim2.fuel.tritium += 20;
    }
    return sim2;
  };
  const ctx = (sim2) => ({ physics: sim2.physics, structure: sim2.structure, econ });

  // Post-onboarding equilibrium (B=6.5, heat=15, n=0.1): M2 must not be met
  let sim2 = createSimState();
  sim2.controls = { ...sim2.controls, B: 6.5, heat: 15 };
  sim2 = runIdle(sim2, 300);
  const m2Idle = LEVELS[1].check(ctx(sim2));
  console.log(`${!m2Idle ? 'PASS' : 'FAIL'}  anti-idle: M2 not met after onboarding (T=${sim2.physics.T.toFixed(1)}keV, needs action)`);
  if (m2Idle) failures++;

  // Raising heating (the briefed M2 action) must complete M2
  sim2.controls = { ...sim2.controls, heat: 30 };
  sim2 = runIdle(sim2, 300);
  const m2Action = LEVELS[1].check(ctx(sim2));
  console.log(`${m2Action ? 'PASS' : 'FAIL'}  anti-idle: M2 met after raising heat to 30MW (T=${sim2.physics.T.toFixed(1)}keV)`);
  if (!m2Action) failures++;

  // M3 must not be met by max heating alone at minimum density
  sim2.controls = { ...sim2.controls, heat: 50 };
  sim2 = runIdle(sim2, 300);
  const m3Idle = LEVELS[2].check(ctx(sim2));
  console.log(`${!m3Idle ? 'PASS' : 'FAIL'}  anti-idle: M3 not met at min density even at 50MW (neutrons=${sim2.physics.neutronRate.toExponential(1)}/s)`);
  if (m3Idle) failures++;
}

// ---- Level walkthrough (mirrors an intended player path) ----
phase(1, 'First Light', { B: 6.5, heat: 15 }, [], 20, 200);
phase(2, 'Heating Up', { heat: 30 }, [], 20, 200);
phase(3, 'First Fusion', { B: 8, density: 0.5, heat: 40 }, [], 20, 200);
phase(4, 'Breakeven', { B: 11.4, density: 1.0, heat: 42 }, [], 60, 400);
phase(5, 'Endurance', { B: 11.4, density: 1.0, heat: 40, cooling: 40 }, ['hmode', 'divertor2'], 20, 1400);
phase(6, 'First Customers', { B: 16, density: 2.0, heat: 50, cooling: 80 }, ['hts'], 60, 400);
phase(7, 'City Scale', { B: 19.4, density: 3.0, heat: 50, cooling: 100 }, ['shaping', 'blanket'], 100, 400);

// L8: keep running at scale and watch cumulative LCOE fall under $100/MWh
{
  const level = LEVELS[7];
  let ok = false;
  for (let h = 0; h < 200 && !ok; h++) {
    run(600); // 1 sim-hour
    ok = level.check({ physics: sim.physics, structure: sim.structure, econ });
  }
  if (ok) ok = sustained(level, 200);
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  L8 Commercial Era   LCOE=$${econ.lcoe?.toFixed(0)}/MWh  ` +
    `net=${sim.physics.netElecMW.toFixed(0)}MWe  funds=$${(econ.funds / 1e9).toFixed(2)}B`,
  );
  if (!ok) failures++;
}

// ---- Campaign scorecard ----
// The walkthrough above IS a finished campaign: clean (noDisrupt), commercial
// LCOE, hardware intact. Grading it proves the scorecard reads real run state
// and lands where a competent player should land.
{
  const card = scoreCampaign({
    stats: runStats,
    econ,
    structure: sim.structure,
    simSeconds: sim.time.simSeconds,
    difficulty: 'Operator',
  });
  const weightsOk = card.parts.reduce((s, p) => s + p.weight, 0) === 100;
  const rangeOk = card.score >= 0 && card.score <= 100;
  const fractionsOk = card.parts.every((p) => p.fraction >= 0 && p.fraction <= 1);
  // A clean run that actually reached Commercial Era should not grade below B.
  const earnedOk = card.score >= 74;
  const verdictOk = typeof card.verdict === 'string' && card.verdict.length > 20;
  const ok = weightsOk && rangeOk && fractionsOk && earnedOk && verdictOk;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  scorecard: clean campaign grades ${card.grade} (${card.score}/100)  ` +
    `Q=${runStats.maxQ.toFixed(1)} LCOE=$${econ.lcoe?.toFixed(0)} hull=${Math.round(Math.min(sim.structure.firstWall, sim.structure.divertor, sim.structure.magnets))}%`,
  );
  if (!ok) failures++;

  // Monotonic where it should be: wrecking the plant can only cost you.
  const worse = scoreCampaign({
    stats: { ...runStats, disruptions: 12, quenches: 4 },
    econ,
    structure: { firstWall: 45, divertor: 42, magnets: 55 },
    simSeconds: sim.time.simSeconds,
    difficulty: 'Operator',
  });
  const mono = worse.score < card.score;
  console.log(
    `${mono ? 'PASS' : 'FAIL'}  scorecard: a wrecked plant grades lower (${worse.grade} ${worse.score} < ${card.grade} ${card.score})`,
  );
  if (!mono) failures++;

  // Letter bands are ordered and cover the range.
  const letters = [0, 55, 65, 78, 88, 95].map(gradeFor);
  const bandsOk = JSON.stringify(letters) === JSON.stringify(['E', 'D', 'C', 'B', 'A', 'A+']);
  console.log(`${bandsOk ? 'PASS' : 'FAIL'}  scorecard: grade bands ordered E..A+ (${letters.join(' ')})`);
  if (!bandsOk) failures++;
}

// ---- Daily plant seed ----
// The whole point is that two people running "today" get the same machine.
{
  const key = dailySeedKey(new Date('2026-07-29T12:00:00Z'));
  const keyOk = key === '2026-07-29';

  const a = {}; applyManufacturingTolerances(a, 'fusion', seededRng(`${key}:fusion:pwr`));
  const b = {}; applyManufacturingTolerances(b, 'fusion', seededRng(`${key}:fusion:pwr`));
  const c = {}; applyManufacturingTolerances(c, 'fusion', seededRng('2026-07-30:fusion:pwr'));
  const same = JSON.stringify(a.asBuilt) === JSON.stringify(b.asBuilt);
  const differs = JSON.stringify(a.asBuilt) !== JSON.stringify(c.asBuilt);

  // A seeded plant must still respect the declared tolerance bounds.
  const inBounds = TOLERANCE_SPECS.fusion.every((s) => {
    const v = a.asBuilt[s.key];
    return v >= s.min && v <= s.max;
  });

  // UTC, not local: the key must not drift with the machine's timezone.
  const utcOk = dailySeedKey(new Date('2026-07-29T23:30:00Z')) === '2026-07-29';

  const ok = keyOk && same && differs && inBounds && utcOk;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  daily seed: reproducible, date-scoped, in-bounds ` +
    `(confinement x${a.asBuilt.confinement.toFixed(3)})`,
  );
  if (!ok) failures++;
}

// ---- Hazard grace-period contract ----
// crossing a limit: no punishment inside the window, fixable, guaranteed after
{
  const step = (sim2, events) => {
    const r = physicsTick(sim2, noDisrupt);
    events.push(...r.events);
    const next = { ...sim2, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    next.time = { simSeconds: sim2.time.simSeconds + SIM_DT_S, ticks: sim2.time.ticks + 1 };
    return next;
  };
  let sim2 = createSimState();
  sim2.controls = { ...sim2.controls, B: 5, heat: 30, density: 1.5 }; // gw frac >> 1
  let events = [];
  for (let i = 0; i < 60; i++) sim2 = step(sim2, events); // inside the 120-tick grace
  const early = events.some((e) => e.type === 'disruption' && e.cause === 'greenwald');
  const counting = sim2.hazards.greenwald > 0;
  console.log(`${!early && counting ? 'PASS' : 'FAIL'}  hazard grace: no disruption inside window (timer=${sim2.hazards.greenwald})`);
  if (early || !counting) failures++;

  // player fixes it inside the window -> hazard clears, nothing fires
  sim2.controls = { ...sim2.controls, density: 0.3 };
  events = [];
  for (let i = 0; i < 40; i++) sim2 = step(sim2, events);
  const cleared = sim2.hazards.greenwald === 0 && !events.some((e) => e.type === 'disruption');
  console.log(`${cleared ? 'PASS' : 'FAIL'}  hazard grace: fixing in time cancels the consequence`);
  if (!cleared) failures++;

  // ignoring it past the window -> guaranteed disruption
  sim2.controls = { ...sim2.controls, density: 1.5 };
  events = [];
  for (let i = 0; i < 200; i++) sim2 = step(sim2, events);
  const fired = events.some((e) => e.type === 'disruption' && e.cause === 'greenwald');
  console.log(`${fired ? 'PASS' : 'FAIL'}  hazard grace: ignoring the countdown guarantees a disruption`);
  if (!fired) failures++;
}

// ---- Fission mode ----
{
  const fstep = (fs, events = []) => {
    const r = fissionTick(fs, noDisrupt);
    events.push(...r.events);
    const next = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    next.time = { simSeconds: fs.time.simSeconds + SIM_DT_S, ticks: fs.time.ticks + 1 };
    return next;
  };
  const runF = (fs, ticks, events) => { for (let i = 0; i < ticks; i++) fs = fstep(fs, events); return fs; };
  // The real plant lifecycle: heaters + pump friction earn hot standby first
  const heatupPWR = (fs, ev = []) => {
    fs.controls = { ...fs.controls, heaters: true, pumps: 100 };
    let guard = 0;
    while (fs.physics.TcoolC < 280 && guard++ < 4000) fs = fstep(fs, ev);
    return fs;
  };

  // Cold-shutdown interlock: a cold plant must refuse criticality outright
  let fsCold = createFissionState();
  fsCold.controls = { ...fsCold.controls, rods: 30 };
  fsCold = runF(fsCold, 600, []);
  const interlockOk = fsCold.physics.rodPos >= 95 && !fsCold.physics.critical && fsCold.physics.P < 1;
  console.log(`${interlockOk ? 'PASS' : 'FAIL'}  fission lifecycle: cold interlock holds rods in (rodPos=${fsCold.physics.rodPos.toFixed(0)}%, T=${fsCold.physics.TcoolC.toFixed(0)}C)`);
  if (!interlockOk) failures++;

  // Heatup: heaters + pumps reach hot standby inside the rate limit
  let fs = createFissionState();
  let ev = [];
  fs = heatupPWR(fs, ev);
  const hotOk = fs.physics.TcoolC >= 280 && ev.some((e) => e.type === 'hotStandby');
  console.log(`${hotOk ? 'PASS' : 'FAIL'}  fission lifecycle: heatup to hot standby (T=${fs.physics.TcoolC.toFixed(0)}C in ${(fs.time.simSeconds / 3600).toFixed(1)} sim-hours)`);
  if (!hotOk) failures++;

  // F1: criticality at ~64% rods settles into the low-power band, no prompt event
  fs.controls = { ...fs.controls, rods: 64 };
  ev = [];
  fs = runF(fs, 900, ev);
  const f1 = FISSION_LEVELS[0].check({ physics: fs.physics, structure: fs.structure });
  const noPrompt = !ev.some((e) => e.type === 'prompt');
  console.log(`${f1 && noPrompt ? 'PASS' : 'FAIL'}  fission F1: critical low power (P=${fs.physics.P.toFixed(0)}MW, rho=${fs.physics.reactivityPcm.toFixed(0)}pcm)`);
  if (!f1 || !noPrompt) failures++;

  // F2: staged withdrawal (as briefed) reaches 3000+ MW, self-limited by Doppler
  fs.controls = { ...fs.controls, rods: 50 };
  ev = [];
  fs = runF(fs, 600, ev);
  fs.controls = { ...fs.controls, rods: 38 };
  fs = runF(fs, 600, ev);
  fs.controls = { ...fs.controls, rods: 34 };
  fs = runF(fs, 1200, ev);
  const f2Prompt = ev.some((e) => e.type === 'prompt');
  if (f2Prompt) { console.log('FAIL  fission F2: briefed withdrawal caused a prompt excursion'); failures++; }
  const f2 = FISSION_LEVELS[1].check({ physics: fs.physics, structure: fs.structure });
  console.log(`${f2 ? 'PASS' : 'FAIL'}  fission F2: full power (P=${fs.physics.P.toFixed(0)}MW, Tfuel=${fs.physics.TfuelC.toFixed(0)}C, Tcool=${fs.physics.TcoolC.toFixed(0)}C)`);
  if (!f2) failures++;

  // Generator breaker gates every sale: full power exports NOTHING unsynced
  const unsyncedNet = fs.physics.netElecMW;
  fs.controls = { ...fs.controls, genOnline: true };
  fs = runF(fs, 20, ev);
  const syncOk = unsyncedNet <= 0 && fs.physics.netElecMW > 500;
  console.log(`${syncOk ? 'PASS' : 'FAIL'}  fission lifecycle: generator sync gates export (${unsyncedNet.toFixed(0)} -> ${fs.physics.netElecMW.toFixed(0)}MWe)`);
  if (!syncOk) failures++;

  // F3: net electric export
  const f3 = FISSION_LEVELS[2].check({ physics: fs.physics, structure: fs.structure });
  console.log(`${f3 ? 'PASS' : 'FAIL'}  fission F3: grid export (net=${fs.physics.netElecMW.toFixed(0)}MWe)`);
  if (!f3) failures++;

  // Xenon: hold near full power for 30 sim-hours with a simple rod governor
  // (what real operators do as the poison builds); then scram -> xenon PIT
  let govEvents = [];
  for (let h = 0; h < 180; h++) {
    fs = runF(fs, 100, govEvents);
    if (fs.physics.P < 3100 && fs.controls.rods > 4) {
      fs.controls = { ...fs.controls, rods: fs.controls.rods - 1 };
    } else if (fs.physics.P > 3700) {
      fs.controls = { ...fs.controls, rods: fs.controls.rods + 1 };
    }
  }
  const heldPower = !govEvents.some((e) => e.type === 'scram');
  if (!heldPower) { console.log('FAIL  fission xenon: governor tripped the plant (test setup)'); failures++; }
  const xeEq = fs.physics.xenonPcm;
  fs.controls = { ...fs.controls, rods: 100 };
  fs.physics = { ...fs.physics, scrammed: true, rodPos: 100 };
  let xePit = 0; // track the PEAK of the pit over ~10 shutdown hours
  for (let i = 0; i < 6000; i++) {
    fs = fstep(fs);
    xePit = Math.max(xePit, fs.physics.xenonPcm);
  }
  const pitOk = xeEq > 1200 && xePit > xeEq * 1.2;
  console.log(`${pitOk ? 'PASS' : 'FAIL'}  fission xenon: equilibrium ${xeEq.toFixed(0)}pcm -> pit ${xePit.toFixed(0)}pcm after scram`);
  if (!pitOk) failures++;

  // Rod-withdrawal accident from hot standby: rods yanked to 30%. Doppler
  // catches the transient below prompt-critical (real PWR behavior), but the
  // overpower excursion must trip the reactor protection system.
  let fs2 = heatupPWR(createFissionState());
  fs2.controls = { ...fs2.controls, rods: 30 };
  ev = [];
  let maxP = 0;
  for (let i = 0; i < 600; i++) {
    fs2 = fstep(fs2, ev);
    maxP = Math.max(maxP, fs2.physics.P);
  }
  const tripped = ev.some((e) => e.type === 'scram' || e.type === 'prompt');
  const overpower = maxP > 4000;
  console.log(`${tripped && overpower ? 'PASS' : 'FAIL'}  fission safety: withdrawal accident -> overpower (peak ${maxP.toFixed(0)}MW) -> RPS trip=${tripped}`);
  if (!tripped || !overpower) failures++;

  // Engineering margins at full power: all screening limits must be green
  {
    let fsE = heatupPWR(createFissionState());
    fsE.controls = { ...fsE.controls, rods: 50 };
    fsE = runF(fsE, 600, []);
    fsE.controls = { ...fsE.controls, rods: 38 };
    fsE = runF(fsE, 600, []);
    fsE.controls = { ...fsE.controls, rods: 34 };
    fsE = runF(fsE, 1200, []);
    if (fsE.physics.fluxFrac < 0.8) { console.log('FAIL  fission engineering: test core not at power'); failures++; }
    const a = fissionAnalysis(fsE);
    const bad = a.rows.filter((r) => r.status === 'crit');
    const dnbr = a.rows.find((r) => r.id === 'dnbr');
    const sub = a.rows.find((r) => r.id === 'subcool');
    const ok = bad.length === 0 && Number(dnbr.value) > 1.3 && Number(sub.value) > 4;
    console.log(`${ok ? 'PASS' : 'FAIL'}  fission engineering: full-power margins green (DNBR=${dnbr.value}, subcool=${sub.value}C${bad.length ? ', CRIT: ' + bad.map((r) => r.id).join(',') : ''})`);
    if (!ok) failures++;

    // trips consume fatigue allowance
    fsE.physics = { ...fsE.physics, tripCount: 40 };
    const cuf = fissionAnalysis(fsE).rows.find((r) => r.id === 'cuf');
    const cufOk = Math.abs(Number(cuf.value) - 0.1) < 0.001;
    console.log(`${cufOk ? 'PASS' : 'FAIL'}  fission engineering: 40 trips -> CUF ${cuf.value} (Miner's rule)`);
    if (!cufOk) failures++;
  }

  // Decay heat: right after a trip from full power, the core still makes real heat
  let fs3 = heatupPWR(createFissionState());
  fs3.controls = { ...fs3.controls, rods: 36 };
  fs3 = runF(fs3, 1500, []);
  fs3.controls = { ...fs3.controls, rods: 100 };
  fs3.physics = { ...fs3.physics, scrammed: true, rodPos: 100 };
  fs3 = runF(fs3, 50, []);
  const decayOk = fs3.physics.decayMW > 100 && fs3.physics.P < 1;
  console.log(`${decayOk ? 'PASS' : 'FAIL'}  fission decay heat: ${fs3.physics.decayMW.toFixed(0)}MW after trip (TMI lesson)`);
  if (!decayOk) failures++;

  // ---- Fuel cycle: enrichment buys reactivity, costs SWU, keeps its margin ----
  {
    const f30 = enrichExcessFactor(3.0);
    const f40 = enrichExcessFactor(4.0);
    const f495 = enrichExcessFactor(4.95);
    const scaleOk = f30 < f40 && Math.abs(f40 - 1) < 1e-9 && f40 < f495;
    // shutdown margin at max enrichment, cold (the most reactive condition):
    // full rod insertion must still hold the core down
    const coldBonusPcm = 4.0 * (290 - 30); // coolant coefficient * cold delta-T
    const marginOk = 6000 * f495 + coldBonusPcm < 9000;
    const c30 = fuelOrderCost(3.0).total;
    const c40 = fuelOrderCost(4.0).total;
    const c495 = fuelOrderCost(4.95).total;
    const costOk = c30 < c40 && c40 < c495;
    console.log(`${scaleOk && marginOk && costOk ? 'PASS' : 'FAIL'}  fuel cycle: enrichment scaling (x${f30.toFixed(2)}/x${f495.toFixed(2)}), cold shutdown margin ${(6000 * f495 + coldBonusPcm).toFixed(0)}<9000pcm, SWU cost monotonic`);
    if (!(scaleOk && marginOk && costOk)) failures++;

    // A 3.0% core really is a shorter cycle. Each enrichment needs its own
    // rod program (a hot batch goes critical much deeper), so drive both
    // with the same cautious governor and compare burnup at equal power.
    const governTo = (fs0, slices) => {
      let g = fs0;
      const evg = [];
      for (let i = 0; i < slices; i++) {
        g = runF(g, 100, evg);
        if (g.physics.P < 3100 && g.controls.rods > 4) {
          g.controls = { ...g.controls, rods: g.controls.rods - 1 };
        } else if (g.physics.P > 3700) {
          g.controls = { ...g.controls, rods: g.controls.rods + 1 };
        }
      }
      return { fs: g, tripped: evg.some((e) => e.type === 'scram' || e.type === 'prompt') };
    };
    let cheap = heatupPWR(createFissionState());
    cheap.fuelCore = { enrichPct: 3.0 };
    let rich = heatupPWR(createFissionState());
    rich.fuelCore = { enrichPct: 4.95 };
    // ascend both, then compare the burnup RATE over the same 6 h at power
    // (the rich core reaches power sooner, so totals alone mislead)
    const gc = governTo(cheap, 100);
    const gr = governTo(rich, 100);
    const b0c = gc.fs.physics.burnup;
    const b0r = gr.fs.physics.burnup;
    const wc = governTo(gc.fs, 36);
    const wr = governTo(gr.fs, 36);
    const rateCheap = wc.fs.physics.burnup - b0c;
    const rateRich = wr.fs.physics.burnup - b0r;
    const bothAtPower = wc.fs.physics.P > 2800 && wr.fs.physics.P > 2800;
    const noTrips = !gc.tripped && !gr.tripped && !wc.tripped && !wr.tripped;
    const burnOk = bothAtPower && noTrips && rateCheap > rateRich * 1.25;
    console.log(`${burnOk ? 'PASS' : 'FAIL'}  fuel cycle: at equal power the 3.0%% core burns ${(rateCheap / Math.max(rateRich, 1e-9)).toFixed(2)}x faster (trips=${noTrips ? 'none' : 'YES'})`);
    if (!burnOk) failures++;
  }
}

// ---- Tech tradeoffs: every upgrade must carry a WORKING downside ----
{
  const fresh = () => ({ sim: createSimState(), econ: createEconState() });

  let ctx = fresh();
  getTech('hmode').apply(ctx);
  const hmodeOk = ctx.sim.physics.divertorPeaking > 1 && ctx.sim.physics.divertorWearMult > 1;

  ctx = fresh();
  getTech('divertor2').apply(ctx);
  const wOk = ctx.sim.physics.zEff > Z_EFF_BASE;

  ctx = fresh();
  getTech('hts').apply(ctx);
  const htsOk = ctx.sim.physics.quenchDamagePct > QUENCH_DAMAGE_PCT;

  ctx = fresh();
  getTech('blanket').apply(ctx);
  const blanketOk = ctx.econ.maintMult > 1;

  ctx = fresh();
  const baseDisrupt = ctx.sim.physics.disruptionProbBase;
  getTech('shaping').apply(ctx);
  const shapingOk = ctx.sim.physics.disruptionProbBase > baseDisrupt;

  ctx = fresh();
  getTech('stellarator').apply(ctx);
  const stellOk = ctx.econ.maintMult > 1;

  const consOk = TECH_TREE.every((t) => Array.isArray(t.cons) && t.cons.length > 0 && t.pros.length > 0);
  const ok = hmodeOk && wOk && htsOk && blanketOk && shapingOk && stellOk && consOk;
  console.log(`${ok ? 'PASS' : 'FAIL'}  tech tradeoffs: every upgrade has an enforced downside (hmode=${hmodeOk} W=${wOk} hts=${htsOk} blanket=${blanketOk} shaping=${shapingOk} stell=${stellOk} copy=${consOk})`);
  if (!ok) failures++;

  // The tungsten Z_eff penalty must actually cost radiated power
  let simA = createSimState();
  simA.controls = { ...simA.controls, B: 11.4, heat: 42, density: 1.0 };
  let simB = structuredClone(simA);
  getTech('divertor2').apply({ sim: simB, econ: createEconState() });
  const stepN = (s2, n) => {
    for (let i = 0; i < n; i++) {
      const r = physicsTick(s2, noDisrupt);
      s2 = { ...s2, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
      if (s2.fuel.tritium < 5) s2.fuel.tritium += 20;
    }
    return s2;
  };
  simA = stepN(simA, 300);
  simB = stepN(simB, 300);
  const bremsUp = simB.physics.pBremsMW > simA.physics.pBremsMW * 1.1;
  console.log(`${bremsUp ? 'PASS' : 'FAIL'}  tech tradeoffs: tungsten raises radiation loss (${simA.physics.pBremsMW.toFixed(1)} -> ${simB.physics.pBremsMW.toFixed(1)} MW)`);
  if (!bremsUp) failures++;
}

// ---- Manufacturing tolerances ----
{
  // Fresh states must stay exact-to-print (headless determinism contract)
  const exact = createSimState().asBuilt;
  const exactF = createFissionState().asBuilt;
  const exactOk = Object.values(exact).every((v) => v === 1)
    && Object.values(exactF).every((v) => v === 1);
  console.log(`${exactOk ? 'PASS' : 'FAIL'}  tolerances: fresh engine states are exact-to-print`);
  if (!exactOk) failures++;

  // Sampled values stay inside their declared bounds
  let inBounds = true;
  for (const mode of ['fusion', 'fission']) {
    for (let i = 0; i < 50; i++) {
      const sim2 = mode === 'fission' ? createFissionState() : createSimState();
      applyManufacturingTolerances(sim2, mode, Math.random);
      for (const spec of TOLERANCE_SPECS[mode]) {
        const v = sim2.asBuilt[spec.key];
        if (v < spec.min || v > spec.max) inBounds = false;
      }
    }
  }
  console.log(`${inBounds ? 'PASS' : 'FAIL'}  tolerances: sampled as-built values respect declared bounds`);
  if (!inBounds) failures++;

  // Worst-case roll must still beat breakeven with slightly pushed controls
  let simW = createSimState();
  simW.asBuilt = worstCaseAsBuilt('fusion');
  simW.controls = { ...simW.controls, B: 11.5, heat: 45, density: 1.0 };
  for (let i = 0; i < 500; i++) {
    const r = physicsTick(simW, noDisrupt);
    simW = { ...simW, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    if (simW.fuel.tritium < 5) simW.fuel.tritium += 20;
  }
  const worstQ = simW.physics.Q;
  console.log(`${worstQ > 1 ? 'PASS' : 'FAIL'}  tolerances: worst-case plant still beats breakeven (Q=${worstQ.toFixed(2)} at B=11.5, 45MW)`);
  if (worstQ <= 1) failures++;

  // Worst-case fission plant: briefed rod positions still hit both missions
  let fsW = createFissionState();
  fsW.asBuilt = worstCaseAsBuilt('fission');
  fsW.controls = { ...fsW.controls, heaters: true };
  {
    let guard = 0;
    while (fsW.physics.TcoolC < 280 && guard++ < 4000) {
      const r = fissionTick(fsW, noDisrupt);
      fsW = { ...fsW, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    }
  }
  fsW.controls = { ...fsW.controls, rods: 64 };
  for (let i = 0; i < 900; i++) {
    const r = fissionTick(fsW, noDisrupt);
    fsW = { ...fsW, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
  }
  const f1Worst = fsW.physics.P >= 10 && fsW.physics.P <= 600;
  const evW = [];
  const runW = (fs2, ticks) => {
    for (let i = 0; i < ticks; i++) {
      const r = fissionTick(fs2, noDisrupt);
      evW.push(...r.events);
      fs2 = { ...fs2, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    }
    return fs2;
  };
  // The mission passes on a sustained window, exactly like the campaign check
  const sustainedF2 = (fs2, ticks) => {
    let count = 0;
    let peak = 0;
    for (let i = 0; i < ticks; i++) {
      fs2 = runW(fs2, 1);
      peak = Math.max(peak, fs2.physics.P);
      count = FISSION_LEVELS[1].check({ physics: fs2.physics, structure: fs2.structure }) ? count + 1 : 0;
      if (count >= FISSION_LEVELS[1].sustainTicks) return { fs2, ok: true, peak };
    }
    return { fs2, ok: false, peak };
  };
  fsW.controls = { ...fsW.controls, rods: 34 };
  let res = sustainedF2(fsW, 1800);
  let trimmed = false;
  if (!res.ok) {
    // The tolerance lesson: a weak fuel batch needs the operator to trim a
    // little past the briefed position. That trim must not trip the plant
    trimmed = true;
    res.fs2.controls = { ...res.fs2.controls, rods: 32 };
    res = sustainedF2(res.fs2, 1800);
  }
  const f2Worst = res.ok && !evW.some((e) => e.type === 'prompt' || e.type === 'scram');
  console.log(`${f1Worst && f2Worst ? 'PASS' : 'FAIL'}  tolerances: worst-case fission plant completes F1+F2 (peak=${res.peak.toFixed(0)}MW${trimmed ? ', operator trimmed to 32%' : ''}, no trips)`);
  if (!f1Worst || !f2Worst) failures++;
}

// ---- Failure analysis report ----
{
  // Build a TMI-shaped state: tripped, decay heat, pumps starved, hot fuel
  let fs = createFissionState();
  fs.controls = { ...fs.controls, heaters: true };
  {
    let guard = 0;
    while (fs.physics.TcoolC < 280 && guard++ < 4000) {
      const r = fissionTick(fs, noDisrupt);
      fs = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    }
  }
  fs.controls = { ...fs.controls, rods: 36 };
  for (let i = 0; i < 1500; i++) {
    const r = fissionTick(fs, noDisrupt);
    fs = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
  }
  fs.controls = { ...fs.controls, rods: 100, pumps: 15 };
  fs.physics = { ...fs.physics, scrammed: true, rodPos: 100 };
  for (let i = 0; i < 100; i++) {
    const r = fissionTick(fs, noDisrupt);
    fs = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
  }
  const rep = buildFailureReport('fission', fs, { disruptions: 0, quenches: 0 }, 'cladding');
  const mentionsPumps = rep.factors.some((f) => f.toLowerCase().includes('pump'));
  const mentionsDecay = rep.factors.some((f) => f.toLowerCase().includes('decay'));
  const ok = !!rep.primary && rep.factors.length >= 2 && !!rep.recommendation && mentionsPumps && mentionsDecay;
  console.log(`${ok ? 'PASS' : 'FAIL'}  failure report: TMI-shaped state names starved pumps + decay heat (${rep.factors.length} factors)`);
  if (!ok) failures++;

  const repF = buildFailureReport('fusion', createSimState(), { disruptions: 5, quenches: 1 }, 'magnets');
  const okF = !!repF.primary && repF.factors.length >= 1 && !!repF.recommendation;
  console.log(`${okF ? 'PASS' : 'FAIL'}  failure report: fusion magnet failure produces a full report`);
  if (!okF) failures++;
}

// ---- Career mode shell ----
// The ladder wraps the two proven campaigns; reviews must be deterministic,
// grade from real run data, and never come back empty.
{
  const playable = CAREER_POSTINGS.filter((p) => p.playable);
  const rungsOrdered = CAREER_POSTINGS.every((p, i) => p.rung === i + 1);
  const first = firstPosting();
  const second = nextPosting(first.id);
  const third = nextPosting(second?.id);
  const seqOk = CAREER_POSTINGS.length === 7 && playable.length === 3
    && first.plant === 'research'
    && second?.mode === 'fission' && (second?.plant ?? 'pwr') === 'pwr'
    && third?.mode === 'fusion'
    && nextPosting(third?.id) === null;
  const caseIds = new Set(CASE_FILES.map((c) => c.id));
  const casesOk = playable.every((p) => p.caseFiles.every((id) => caseIds.has(id)));
  const briefsOk = playable.every((p) => p.mandate?.length >= 2 && p.boss?.name);
  console.log(`${seqOk && rungsOrdered && casesOk && briefsOk ? 'PASS' : 'FAIL'}  career ladder: 7 rungs, research -> PWR -> fusion playable, case files resolve, briefs present`);
  if (!(seqOk && rungsOrdered && casesOk && briefsOk)) failures++;

  const diff = { funds: 10e9 };

  // A clean fission posting earns an A; a rough one earns a C or D
  const cleanSim = createFissionState();
  cleanSim.physics = { ...cleanSim.physics, tripCount: 1, burnup: 0.34, avgP: 3100 };
  const cleanArgs = {
    sim: cleanSim,
    econ: { ...createEconState(), funds: 10.6e9, lcoe: 62, mwhCum: 1e5 },
    stats: { repairs: 0, disruptions: 0, quenches: 0, peakNetMW: 980, maxQ: 0 },
    difficulty: diff,
  };
  const clean = buildPerformanceReview('fission', cleanArgs);
  const roughSim = createFissionState();
  roughSim.physics = { ...roughSim.physics, tripCount: 14, burnup: 0.31, avgP: 1500 };
  roughSim.structure = { cladding: 22, vessel: 60, steamGen: 45, integrity: 22 };
  const rough = buildPerformanceReview('fission', {
    sim: roughSim,
    econ: { ...createEconState(), funds: 7.2e9, lcoe: 190, mwhCum: 1e5 },
    stats: { repairs: 3, disruptions: 0, quenches: 0, peakNetMW: 700, maxQ: 0 },
    difficulty: diff,
  });
  const gradesOk = clean.grade === 'A' && (rough.grade === 'C' || rough.grade === 'D') && clean.score > rough.score;
  console.log(`${gradesOk ? 'PASS' : 'FAIL'}  career review: clean fission run ${clean.grade} (${clean.score}), rough run ${rough.grade} (${rough.score})`);
  if (!gradesOk) failures++;

  // Deterministic: the same run always produces the identical review
  const again = buildPerformanceReview('fission', cleanArgs);
  const deterministic = JSON.stringify(again) === JSON.stringify(clean);
  console.log(`${deterministic ? 'PASS' : 'FAIL'}  career review: deterministic for identical run data`);
  if (!deterministic) failures++;

  // Fusion reviews grade quenches and disruptions; sections never come back empty
  const fusionGood = buildPerformanceReview('fusion', {
    sim: createSimState(),
    econ: { ...createEconState(), funds: 12e9, lcoe: 84, mwhCum: 5e5 },
    stats: { repairs: 0, disruptions: 2, quenches: 0, peakNetMW: 1200, maxQ: 22 },
    difficulty: diff,
  });
  const fusionBad = buildPerformanceReview('fusion', {
    sim: createSimState(),
    econ: { ...createEconState(), funds: 5e9, lcoe: 210, mwhCum: 5e5 },
    stats: { repairs: 2, disruptions: 11, quenches: 3, peakNetMW: 300, maxQ: 4 },
    difficulty: diff,
  });
  const fusionOk = fusionGood.grade === 'A' && fusionGood.score > fusionBad.score
    && [clean, rough, fusionGood, fusionBad].every(
      (r) => r.strengths.length >= 1 && r.improvements.length >= 1 && r.metrics.length >= 5 && r.summary,
    );
  console.log(`${fusionOk ? 'PASS' : 'FAIL'}  career review: fusion ${fusionGood.grade} vs ${fusionBad.grade}, all sections populated`);
  if (!fusionOk) failures++;
}

// ---- Research reactor (career rung 1): the briefed path must qualify ----
{
  const step = (fs, events = []) => {
    const r = fissionTick(fs, noDisrupt);
    events.push(...r.events);
    const next = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    next.time = { simSeconds: fs.time.simSeconds + SIM_DT_S, ticks: fs.time.ticks + 1 };
    return next;
  };
  const runR = (fs, ticks, events) => { for (let i = 0; i < ticks; i++) fs = step(fs, events); return fs; };
  const sustainR = (fs, level, ticks, events) => {
    let count = 0;
    for (let i = 0; i < ticks; i++) {
      fs = step(fs, events);
      count = level.check({ physics: fs.physics, structure: fs.structure }) ? count + 1 : 0;
      if (count >= level.sustainTicks) return [fs, true];
    }
    return [fs, false];
  };

  // R1: briefed criticality at ~43% inserted holds 0.1..5 MW
  let rs = createFissionState('research');
  let ev = [];
  rs.controls = { ...rs.controls, rods: 43 };
  rs = runR(rs, 400, ev);
  let ok1;
  [rs, ok1] = sustainR(rs, RESEARCH_LEVELS[0], 600, ev);
  console.log(`${ok1 ? 'PASS' : 'FAIL'}  research R1: criticality (P=${rs.physics.P.toFixed(2)}MW at rods 43%, rho=${rs.physics.reactivityPcm.toFixed(0)}pcm)`);
  if (!ok1) failures++;

  // R2: one rod point at a time, as briefed. Bigger steps overshoot the trip
  for (const r of [43, 42, 41, 40]) {
    rs.controls = { ...rs.controls, rods: r };
    rs = runR(rs, 400, ev);
  }
  let ok2;
  [rs, ok2] = sustainR(rs, RESEARCH_LEVELS[1], 800, ev);
  const noTrip = !ev.some((e) => e.type === 'scram' || e.type === 'prompt');
  console.log(`${ok2 && noTrip ? 'PASS' : 'FAIL'}  research R2: licensed power (P=${rs.physics.P.toFixed(1)}MW, Tfuel=${rs.physics.TfuelC.toFixed(0)}C, trips=${noTrip ? 0 : 'YES'})`);
  if (!ok2 || !noTrip) failures++;

  // R3: shutdown drill: scram, decay away, restart through light xenon
  rs.controls = { ...rs.controls, rods: 100 };
  rs.physics = { ...rs.physics, scrammed: true, rodPos: 100, tripCount: (rs.physics.tripCount ?? 0) + 1 };
  rs = runR(rs, 600, ev); // ~1 sim-hour shut down
  const poolCalm = rs.physics.TcoolC < 60;
  rs.controls = { ...rs.controls, rods: 43 };
  rs = runR(rs, 400, ev);
  let ok3;
  [rs, ok3] = sustainR(rs, RESEARCH_LEVELS[2], 800, ev);
  console.log(`${ok3 && poolCalm ? 'PASS' : 'FAIL'}  research R3: shutdown drill + restart (P=${rs.physics.P.toFixed(2)}MW, xenon=${rs.physics.xenonPcm.toFixed(0)}pcm, pool=${rs.physics.TcoolC.toFixed(0)}C)`);
  if (!ok3 || !poolCalm) failures++;

  // Passive safety: post-scram pool with pumps at minimum stays cold. The
  // design-doc callback to TMI and Fukushima: this machine forgives.
  let ps = createFissionState('research');
  ps.controls = { ...ps.controls, rods: 41 };
  ps = runR(ps, 1200, []);
  ps.controls = { ...ps.controls, rods: 100, pumps: 10 };
  ps.physics = { ...ps.physics, scrammed: true, rodPos: 100 };
  ps = runR(ps, 1200, []);
  const passiveOk = ps.physics.TcoolC < 60 && ps.physics.TfuelC < 100;
  console.log(`${passiveOk ? 'PASS' : 'FAIL'}  research passive safety: scram + min pumps -> pool ${ps.physics.TcoolC.toFixed(0)}C, fuel ${ps.physics.TfuelC.toFixed(0)}C`);
  if (!passiveOk) failures++;

  // The guided path must hold across the WHOLE fuel-tolerance range at the
  // BRIEFED rod position: a new player who does exactly what the mission and
  // tutorial say must reach criticality in the mission band on any roll.
  // (Regression guard: the briefed 44% used to go subcritical on weak rolls.)
  for (const fuel of [worstCaseAsBuilt('research').fuel, 1.0, TOLERANCE_SPECS.research.find((s) => s.key === 'fuel').max]) {
    let ws = createFissionState('research');
    ws.asBuilt = { ...ws.asBuilt, fuel };
    ws.controls = { ...ws.controls, rods: 43 }; // the briefed position
    ws = runR(ws, 900, []);
    const inBand = ws.physics.P >= 0.1 && ws.physics.P <= 5;
    console.log(`${inBand ? 'PASS' : 'FAIL'}  research tolerances: briefed 43% in-band on fuel roll ${fuel.toFixed(3)} (P=${ws.physics.P.toFixed(2)}MW)`);
    if (!inBand) failures++;
  }

  // A trainee review from a clean drill grades well and stays research-flavored
  const rev = buildPerformanceReview('fission', {
    sim: { ...rs, plantKey: 'research' },
    econ: { ...createEconState(), funds: 100e6 - 2e5, lcoe: null, mwhCum: 0 },
    stats: { repairs: 0, disruptions: 0, quenches: 0, peakNetMW: 0, maxQ: 0 },
    difficulty: { funds: 10e9 },
  });
  const revOk = (rev.grade === 'A' || rev.grade === 'B')
    && rev.metrics.some(([k]) => k === 'Peak thermal power')
    && !rev.metrics.some(([k]) => k === 'Peak net output');
  console.log(`${revOk ? 'PASS' : 'FAIL'}  research review: trainee drill grades ${rev.grade}, research-flavored metrics`);
  if (!revOk) failures++;
}

// ---- Career responsibilities: directives and the operations crew ----
{
  // Directive sets: well-formed, unique, and evaluable against a rich context
  const probeCtx = {
    P: 3000, TcoolC: 310, netElecMW: 950, tripCount: 0, burnup: 0.2,
    fuelSecured: true, Q: 6, plasmaOn: true, hazardActive: false,
    crewEnabled: true, ticksSinceManual: 100,
  };
  let shapeOk = true;
  for (const [key, set] of Object.entries(DIRECTIVE_SETS)) {
    const ids = new Set(set.map((d) => d.id));
    if (ids.size !== set.length) shapeOk = false;
    for (const d of set) {
      if (!d.from || !d.text || !d.minLevel || !d.sustainTicks) shapeOk = false;
      try {
        const base = d.baseline ? d.baseline(probeCtx) : {};
        d.check(probeCtx, base);
        if (d.failWhen) d.failWhen(probeCtx);
      } catch {
        shapeOk = false;
        console.log(`      directive ${key}/${d.id} threw during evaluation`);
      }
    }
  }
  console.log(`${shapeOk ? 'PASS' : 'FAIL'}  directives: all sets well-formed and evaluable (${Object.values(DIRECTIVE_SETS).flat().length} orders)`);
  if (!shapeOk) failures++;

  // Lifecycle machinery: issue -> sustain -> done, and window -> missed
  let duties = createDuties();
  const rSet = DIRECTIVE_SETS.research;
  let issued = false;
  let r1 = dutiesTick(duties, rSet, { ...probeCtx, P: 0.001 }, 2, 100);
  issued = r1.events.some((e) => e.type === 'issued');
  duties = r1.duties;
  const passCtx = { ...probeCtx, P: 2.0 }; // satisfies r_hold2
  let doneEvent = false;
  for (let t = 101; t < 600 && !doneEvent; t++) {
    const r2 = dutiesTick(duties, rSet, passCtx, 2, t);
    duties = r2.duties;
    doneEvent = r2.events.some((e) => e.type === 'done');
  }
  const logOk = duties.log.length === 1 && duties.log[0].result === 'done';
  // windowed miss: pwr evening peak with no export, clock past the window
  let pduties = { ...createDuties(), idx: 1 }; // start at p_peak
  let pr = dutiesTick(pduties, DIRECTIVE_SETS.pwr, { ...probeCtx, netElecMW: 0 }, 3, 1000);
  pduties = pr.duties;
  let missed = false;
  for (let t = 1001; t < 1000 + 2200 && !missed; t += 50) {
    const r3 = dutiesTick(pduties, DIRECTIVE_SETS.pwr, { ...probeCtx, netElecMW: 0 }, 3, t);
    pduties = r3.duties;
    missed = r3.events.some((e) => e.type === 'missed');
  }
  console.log(`${issued && doneEvent && logOk && missed ? 'PASS' : 'FAIL'}  directives: issue -> hold -> done, and a blown window goes down as missed`);
  if (!(issued && doneEvent && logOk && missed)) failures++;

  // Missed orders cost the review real points
  const revBase = {
    sim: createFissionState(), econ: { ...createEconState(), funds: 10.5e9, lcoe: 80, mwhCum: 1e5 },
    stats: { repairs: 0, disruptions: 0, quenches: 0, peakNetMW: 950, maxQ: 0 },
    difficulty: { funds: 10e9 },
  };
  revBase.sim.physics.tripCount = 1;
  revBase.sim.physics.avgP = 3000;
  const revClean = buildPerformanceReview('fission', {
    ...revBase,
    duties: { log: [{ id: 'a', from: 'Grid Dispatcher', text: 'x', result: 'done' }] },
  });
  const revMissy = buildPerformanceReview('fission', {
    ...revBase,
    duties: { log: [{ id: 'a', from: 'Grid Dispatcher', text: 'x', result: 'missed' }, { id: 'b', from: 'Plant Manager', text: 'y', result: 'missed' }] },
  });
  const dutyRevOk = revClean.score > revMissy.score
    && revClean.metrics.some(([k]) => k === 'Directives')
    && revMissy.improvements.some((t) => t.includes('missed'));
  console.log(`${dutyRevOk ? 'PASS' : 'FAIL'}  directives: reviews reward completion (${revClean.score}) and charge misses (${revMissy.score})`);
  if (!dutyRevOk) failures++;

  // The crew: drives to target inside the envelope, never disrupts
  let cs = createSimState();
  const crewCtx = { sim: cs, econ: createEconState() };
  getTech('hmode').apply(crewCtx);
  getTech('divertor2').apply(crewCtx);
  getTech('hts').apply(crewCtx);
  cs.controls = { ...cs.controls, B: 16, heat: 30, density: 1.0, cooling: 40 };
  const crew = { enabled: true, targetNetMW: 300, gwMax: 0.85, divMax: 0.8 };
  const crewEvents = [];
  let gwPeak = 0;
  let reached = 0;
  for (let i = 0; i < 4000; i++) {
    const nudge = crewControl(cs, crew);
    if (Object.keys(nudge).length > 0) {
      cs = { ...cs, controls: { ...cs.controls, ...nudge } };
    }
    const r = physicsTick(cs, noDisrupt);
    crewEvents.push(...r.events);
    cs = { ...cs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    cs.time = { simSeconds: cs.time.simSeconds + SIM_DT_S, ticks: cs.time.ticks + 1 };
    if (cs.fuel.tritium < 5) cs.fuel.tritium += 20;
    gwPeak = Math.max(gwPeak, cs.physics.greenwaldFrac);
    if (Math.abs(cs.physics.netElecMW - crew.targetNetMW) <= 50) reached++;
  }
  const noDisruptions = !crewEvents.some((e) => e.type === 'disruption' || e.type === 'quench');
  const crewOk = reached > 400 && gwPeak <= crew.gwMax + 0.03 && noDisruptions;
  console.log(`${crewOk ? 'PASS' : 'FAIL'}  crew: holds ${crew.targetNetMW}MW net inside the envelope (on-target ticks=${reached}, gw peak=${gwPeak.toFixed(2)}, clean=${noDisruptions})`);
  if (!crewOk) failures++;
}

// ---- Guided tutorials: scripts well-formed, research path achievable ----
{
  const validHighlights = new Set(['B', 'heat', 'rods', 'heaters', 'physics']);
  let shapeOk = true;
  for (const [key, steps] of Object.entries(TUTORIALS)) {
    if (steps.length < 3 || !steps[0].ack || !steps[steps.length - 1].ack) shapeOk = false;
    for (const st of steps) {
      if (!st.say || (!st.ack && !st.done)) shapeOk = false;
      if (st.highlight && !validHighlights.has(st.highlight)) shapeOk = false;
      if (st.done) {
        try {
          st.done({ c: { B: 6, heat: 15, rods: 44, heaters: true }, p: { critical: true, P: 1, TcoolC: 300 }, viewMode: 'process' });
        } catch {
          shapeOk = false;
          console.log(`      tutorial ${key} step "${st.say}" threw`);
        }
      }
    }
  }
  console.log(`${shapeOk ? 'PASS' : 'FAIL'}  tutorials: three scripts well-formed (${Object.values(TUTORIALS).flat().length} steps, open + close on plain-language acks)`);
  if (!shapeOk) failures++;

  // Research script: each watch-step's condition is reachable in sequence,
  // and it must complete on the WEAKEST fuel roll (what stalled the old 44%)
  const rSteps = TUTORIALS.research;
  let ts = createFissionState('research');
  ts.asBuilt = { ...ts.asBuilt, fuel: worstCaseAsBuilt('research').fuel };
  const step = (fs) => {
    const r = fissionTick(fs, noDisrupt);
    const next = { ...fs, controls: r.controls, physics: r.physics, structure: r.structure, fuel: r.fuel, hazards: r.hazards };
    next.time = { simSeconds: fs.time.simSeconds + SIM_DT_S, ticks: fs.time.ticks + 1 };
    return next;
  };
  const ctxOf = (fs, vm) => ({ c: fs.controls, p: fs.physics, viewMode: vm });
  const s1 = rSteps[1].done(ctxOf(ts, 'process'));               // physics view
  ts.controls = { ...ts.controls, rods: 50 };
  const s2 = rSteps[2].done(ctxOf(ts, 'process'));               // rods to 50
  ts.controls = { ...ts.controls, rods: 43 };                    // the briefed position
  for (let i = 0; i < 900; i++) ts = step(ts);
  const s3 = rSteps[3].done(ctxOf(ts, 'process'));               // power rising
  const s4 = rSteps[4].done(ctxOf(ts, 'process'));               // P >= 0.5
  console.log(`${s1 && s2 && s3 && s4 ? 'PASS' : 'FAIL'}  tutorials: research script completes on weakest fuel (P=${ts.physics.P.toFixed(2)}MW)`);
  if (!(s1 && s2 && s3 && s4)) failures++;

  // PWR script: heatup watch-step and criticality watch-step line up with
  // the plant lifecycle the missions use
  const pSteps = TUTORIALS.pwr;
  let ps = createFissionState('pwr');
  ps.controls = { ...ps.controls, heaters: true };
  const h1 = pSteps[1].done(ctxOf(ps, 'normal'));
  let guard = 0;
  while (ps.physics.TcoolC < 280 && guard++ < 4000) ps = step(ps);
  const h2 = pSteps[2].done(ctxOf(ps, 'normal'));
  ps.controls = { ...ps.controls, rods: 64 };
  for (let i = 0; i < 900; i++) ps = step(ps);
  const h3 = pSteps[3].done(ctxOf(ps, 'normal'));
  console.log(`${h1 && h2 && h3 ? 'PASS' : 'FAIL'}  tutorials: PWR script heatup -> hot standby -> critical (T=${ps.physics.TcoolC.toFixed(0)}C, P=${ps.physics.P.toFixed(0)}MW)`);
  if (!(h1 && h2 && h3)) failures++;
}

console.log(failures === 0 ? '\nALL BALANCE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
