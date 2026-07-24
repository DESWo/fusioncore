// Fission reactors: point kinetics with delayed neutrons (prompt-jump
// approximation), Doppler + coolant temperature feedback, xenon poisoning,
// decay heat, and fuel burnup. One physics engine, several plants: the
// FISSION_PLANTS catalog scales it from a 10 MW training pool to a 3.4 GW
// PWR. Pure module. Runs headless.
import { SIM_DT_S, TICKS_PER_REAL_S, HAZARD_GRACE_TICKS } from './constants.js';

export const FISSION_NOMINAL_MW = 3400;   // thermal, PWR class (default plant)
const SOURCE_MW = 0.0005;                 // neutron-source floor power

const BETA_PCM = 650;                     // delayed neutron fraction
const LAMBDA_EFF = 0.08;                  // effective delayed precursor decay, 1/s
const ALPHA_DOPPLER = 2.2;                // pcm per K of fuel temperature
const ALPHA_COOLANT = 4.0;                // pcm per K of coolant temperature

const XE_EQ_PCM = 2700;                   // PWR equilibrium worth (IC sets use this)
const LAMBDA_I = 2.9e-5;                  // iodine-135 decay, 1/s
const LAMBDA_XE = 2.1e-5;                 // xenon-135 decay, 1/s
const XE_BURN_FP = 3.5e-5;                // xenon burnup by flux at full power, 1/s
const XE_PROD_RATIO = (LAMBDA_XE + XE_BURN_FP) / LAMBDA_I;

/**
 * The plant catalog. Same kinetics, different scale and stakes. Everything
 * that differs per machine lives here; saves store only `sim.plantKey`, so
 * rebalancing a plant applies to old saves too.
 */
export const FISSION_PLANTS = {
  pwr: {
    key: 'pwr',
    label: 'Commercial PWR',
    nominalMW: 3400,
    tRefC: 290,            // loop reference / inlet temperature
    fuelTempLimitC: 2200,  // cladding damage threshold
    coolantLimitC: 345,    // departure from nucleate boiling at 15.5 MPa
    coolFlowCoeff: 150,    // coolEq = tRef + MW / (flow * coeff)
    fuelRiseCoeff: 0.33,   // fuelEq = Tcool + MW * coeff
    rodWorthPcm: 9000,
    excessFreshPcm: 6000,
    xenonEqPcm: 2700,      // high flux: xenon can lock you out for hours
    // Full-power fuel cycle: 10 sim-days. Slow enough that xenon dynamics
    // (9 h timescales) stay physically coherent, fast enough to matter.
    burnCycleS: 240 * 3600,
    gridConnected: true,
    thermalEff: 0.33,
    recircFlowMW: 70, recircBaseMW: 25,
    fundsScale: 1,
    refuelCost: 40e6,
    serviceCosts: { cladding: 60e6, vessel: 120e6, steamGen: 40e6 },
    componentLabels: {
      cladding: 'Fuel-Rod Covering (cladding)',
      vessel: 'Pressure Vessel',
      steamGen: 'Heat Exchangers (steam gens)',
    },
    vesselDesign: true, // the vessel-thickness tradeoff panel applies
    // Full plant lifecycle: the PWR starts cold and must be heated to hot
    // standby before the rod interlock releases; fuel is bought, not spawned
    heatupPlant: true,
    ambientC: 30,
    heatupRateCPerHr: 120,  // admin heatup limit, game-compressed from ~28 °C/hr
    critInterlockC: 280,    // rod withdrawal blocked below this (mode restriction)
    pumpHeatMW: 18,         // RCP friction heat at full flow
    heaterMW: 16,           // pressurizer + auxiliary heaters
    coolLossCoeff: 0.12,    // MW/°C lost to ambient during heatup
    enrichment: { min: 3.0, max: 4.95, ref: 4.0 }, // % U-235; 5% is the LEU license cap
    simpleRefuel: false,    // reloads go through the fuel-cycle chain
  },
  research: {
    key: 'research',
    label: 'Research reactor, 10 MW pool type',
    nominalMW: 10,
    tRefC: 30,             // open pool at ambient
    fuelTempLimitC: 600,   // plate fuel with generous margin: a training machine
    coolantLimitC: 95,     // keep the pool under boiling
    coolFlowCoeff: 0.67,   // ~15 °C pool rise at full power, full flow
    fuelRiseCoeff: 12,     // plates run ~165 °C at 10 MW
    rodWorthPcm: 9000,
    excessFreshPcm: 4000,
    xenonEqPcm: 900,       // low flux: xenon is a lesson here, not a lockout
    burnCycleS: 2400 * 3600, // burnup is effectively a non-issue
    gridConnected: false,  // research reactors make neutrons, not kilowatt-hours
    thermalEff: 0,
    recircFlowMW: 0.5, recircBaseMW: 0.5,
    fundsScale: 0.01,      // a university grant, not a utility balance sheet
    refuelCost: 2e6,
    serviceCosts: { cladding: 1.5e6, vessel: 3e6, steamGen: 1e6 },
    componentLabels: {
      cladding: 'Fuel Plates (cladding)',
      vessel: 'Pool Liner & Structure',
      steamGen: 'Heat Exchanger',
    },
    vesselDesign: false, // an open pool has no pressure-vessel tradeoff
    // Pools go critical cold (that is the point of a pool) and the grant
    // covers fresh plates without a procurement chain
    heatupPlant: false,
    simpleRefuel: true,
  },
};

// ---- Fuel cycle (PWR): the chain a real utility pays for ----
export const FUEL_ORDER_TICKS = 3600;   // 6 sim-hours from order to delivery
export const FUEL_RELOAD_TICKS = 1200;  // 2 sim-hour reload outage

/** Excess reactivity scale vs the 4.0% reference core. */
export function enrichExcessFactor(enrichPct, plant = FISSION_PLANTS.pwr) {
  const ref = plant.enrichment?.ref ?? 4.0;
  return 0.25 + 0.75 * (enrichPct / ref);
}

/**
 * What a reload batch costs, by the real chain: yellowcake, conversion,
 * enrichment work (SWU, superlinear in target enrichment), fabrication,
 * licensing and logistics. Pure function; the store adds market noise.
 */
export function fuelOrderCost(enrichPct) {
  const uranium = 10e6;
  const conversion = 3e6;
  const swu = 9e6 * (enrichPct / 4.0) ** 2;
  const fabrication = 17e6;
  const logistics = 4e6;
  return { uranium, conversion, swu, fabrication, logistics, total: uranium + conversion + swu + fabrication + logistics };
}

export function fissionPlantOf(sim) {
  return FISSION_PLANTS[sim?.plantKey ?? 'pwr'] ?? FISSION_PLANTS.pwr;
}

// Back-compat exports (PWR values); live code should use fissionPlantOf(sim)
export const REFUEL_COST = FISSION_PLANTS.pwr.refuelCost;
export const FISSION_SERVICE_COSTS = FISSION_PLANTS.pwr.serviceCosts;

export function createFissionState(plantKey = 'pwr') {
  const plant = FISSION_PLANTS[plantKey] ?? FISSION_PLANTS.pwr;
  // Heatup plants begin COLD: heaters and pump friction earn hot standby
  const t0 = plant.heatupPlant ? plant.ambientC : plant.tRefC;
  return {
    time: { simSeconds: 0, ticks: 0 },
    plantKey: plant.key,
    controls: {
      rods: 100,   // % inserted (100 = fully shut down)
      pumps: 100,  // % coolant flow
      heaters: false,   // pressurizer + heatup heaters (heatup plants)
      genOnline: false, // generator breaker closed = selling to the grid
    },
    // the loaded core and the procurement pipeline (PWR fuel cycle)
    fuelCore: { enrichPct: plant.enrichment?.ref ?? 4.0 },
    fuelCycle: { order: null, onSite: null, reloadTicksLeft: 0 },
    physics: {
      P: SOURCE_MW, decayMW: 0, avgP: 0, rodPos: 100,
      reactivityPcm: -plant.rodWorthPcm + plant.excessFreshPcm,
      rhoRods: -plant.rodWorthPcm, rhoDoppler: 0, rhoCoolant: 0, rhoXenon: 0,
      hotStandbyNoted: !plant.heatupPlant,
      TfuelC: t0, TcoolC: t0,
      iodine: 0, xenon: 0, xenonPcm: 0,
      burnup: 0, excessPcm: plant.excessFreshPcm,
      tripCount: 0,
      critical: false, scrammed: false,
      plasmaOn: false, // shared name: "reactor producing power" (gates servicing)
      grossElecMW: 0, netElecMW: 0, recircMW: 0, homesPowered: 0,
      stable: false, stability: 100,
      fluxFrac: 0,
    },
    structure: { cladding: 100, vessel: 100, steamGen: 100, integrity: 100 },
    // player-adjustable engineering design (see structural.js for the tradeoffs)
    design: { vesselT: 0.22, material: 'sa508' },
    // As-built manufacturing tolerances, sampled once per campaign in the
    // store's newGame. Exact-to-print by default so the headless suite is
    // deterministic.
    asBuilt: { pumps: 1.0, fuel: 1.0, turbine: 1.0 },
    hazards: { fuelTemp: 0, coolant: 0 },
    fuel: { tritium: 0, deuterium: 0 }, // unused in fission; keeps save shape uniform
  };
}

/** One 6-sim-second tick. Same contract as the fusion physicsTick. */
export function fissionTick(sim, rng = Math.random) {
  const events = [];
  const c = { ...sim.controls };
  const p = { ...sim.physics };
  const st = { ...sim.structure };
  const hz = { ...(sim.hazards ?? { fuelTemp: 0, coolant: 0 }) };
  const dt = SIM_DT_S;
  const diff = sim.difficulty ?? {};
  const graceTicks = diff.graceTicks ?? HAZARD_GRACE_TICKS;
  const dmgMult = diff.damageMult ?? 1;
  const ab = sim.asBuilt ?? { pumps: 1, fuel: 1, turbine: 1 };
  const plant = fissionPlantOf(sim);

  // ---- Rod drive: the slider is a TARGET; rods travel at a real drive speed ----
  // Cold-shutdown interlock: below the mode-restriction temperature the rods
  // will not withdraw past 95% (a cold, dense core is MORE reactive; real
  // plants forbid criticality until the primary is at operating temperature).
  // A reload outage in progress also pins the bank fully in.
  const coldLocked = plant.heatupPlant && !p.critical && p.TcoolC < plant.critInterlockC;
  const reloading = (sim.fuelCycle?.reloadTicksLeft ?? 0) > 0;
  const rodTarget = reloading ? 100 : coldLocked ? Math.max(c.rods, 95) : c.rods;
  const maxStep = 0.5; // % per tick. Full stroke takes ~20 s real time at 1x
  p.rodPos = p.rodPos ?? 100;
  p.rodPos += Math.min(Math.max(rodTarget - p.rodPos, -maxStep), maxStep);
  p.rodsLocked = coldLocked || reloading;

  // ---- Reactivity balance (pcm) ----
  // ab.fuel: the enrichment the fuel vendor certified vs what the batch
  // assayed; the loaded core's enrichment sets how much excess it starts with
  const enrichF = plant.enrichment
    ? enrichExcessFactor(sim.fuelCore?.enrichPct ?? plant.enrichment.ref, plant)
    : 1;
  p.excessPcm = plant.excessFreshPcm * enrichF * ab.fuel * Math.max(1 - p.burnup * 1.2, 0);
  p.rhoRods = -plant.rodWorthPcm * (p.rodPos / 100);
  p.rhoDoppler = -ALPHA_DOPPLER * (p.TfuelC - plant.tRefC);
  p.rhoCoolant = -ALPHA_COOLANT * (p.TcoolC - plant.tRefC);
  p.rhoXenon = -p.xenonPcm;
  const rho = p.excessPcm + p.rhoRods + p.rhoDoppler + p.rhoCoolant + p.rhoXenon;
  p.reactivityPcm = rho;

  // ---- Power dynamics ----
  if (rho >= BETA_PCM) {
    // PROMPT CRITICAL: power runs on prompt neutrons alone. An excursion
    p.P = Math.min(p.P * 50, plant.nominalMW * 4);
    st.cladding -= 25 * dmgMult;
    c.rods = 100;
    p.rodPos = 100; // scram: rods drop by gravity, not by drive motor
    p.scrammed = true;
    p.tripCount = (p.tripCount ?? 0) + 1;
    events.push({ type: 'prompt' });
    events.push({ type: 'scram', reason: 'prompt' });
  } else {
    // Prompt-jump approximation: stable period from delayed neutrons
    const omega = (LAMBDA_EFF * rho) / Math.max(BETA_PCM - rho, 50); // 1/s
    p.P = Math.min(Math.max(p.P * Math.exp(omega * dt), SOURCE_MW), plant.nominalMW * 1.5);
  }

  // ---- RPS overpower trip: high neutron flux beyond 118% of nominal ----
  if (!p.scrammed && p.P > plant.nominalMW * 1.18) {
    c.rods = 100;
    p.rodPos = 100;
    p.scrammed = true;
    p.tripCount = (p.tripCount ?? 0) + 1;
    events.push({ type: 'scram', reason: 'overpower' });
  }

  // ---- Decay heat: recent-average power keeps making ~6.6% after shutdown ----
  p.avgP += (p.P - p.avgP) * (dt / 3000);
  p.decayMW = 0.066 * p.avgP;
  const totalMW = p.P + p.decayMW;

  // ---- Thermal hydraulics (two-node) ----
  // ab.pumps: as-installed pump capacity vs nameplate
  const flow = Math.max((c.pumps / 100) * ab.pumps, 0.05);
  const prevTcool = sim.physics.TcoolC;
  const hotRegime = !plant.heatupPlant || p.critical || p.TcoolC >= plant.critInterlockC;
  if (hotRegime) {
    // steam side active: PWR at full flow, full power: T_avg ≈ 313 °C
    // (hot leg ~331, saturation 345)
    const coolEq = plant.tRefC + totalMW / (flow * plant.coolFlowCoeff);
    p.TcoolC += (coolEq - p.TcoolC) * 0.15;
  } else {
    // heatup: pump friction + heaters against losses, rate-limited the way
    // tech specs limit real heatups (thermal stress in thick steel)
    const heatIn = (c.heaters ? plant.heaterMW : 0) + flow * plant.pumpHeatMW + p.decayMW + p.P;
    const loss = plant.coolLossCoeff * (p.TcoolC - plant.ambientC);
    const dT = Math.min((heatIn - loss) * 0.008, plant.heatupRateCPerHr / 600);
    p.TcoolC = Math.max(p.TcoolC + dT, plant.ambientC);
  }
  if (plant.heatupPlant && !p.hotStandbyNoted && p.TcoolC >= plant.critInterlockC) {
    p.hotStandbyNoted = true;
    events.push({ type: 'hotStandby' });
  }
  const fuelEq = p.TcoolC + totalMW * plant.fuelRiseCoeff;
  p.TfuelC += (fuelEq - p.TfuelC) * 0.25;

  // ---- Xenon-135: builds from iodine decay, burned off by flux ----
  const f = p.P / plant.nominalMW;
  p.iodine += LAMBDA_I * (f - p.iodine) * dt;
  p.xenon += (LAMBDA_I * p.iodine * XE_PROD_RATIO - (LAMBDA_XE + XE_BURN_FP * f) * p.xenon) * dt;
  p.xenonPcm = plant.xenonEqPcm * p.xenon;

  // ---- Burnup (a hotter-enriched core carries more fissile inventory) ----
  p.burnup = Math.min(p.burnup + (p.P * dt) / (plant.nominalMW * plant.burnCycleS * enrichF), 1);

  // ---- Hazards (same grace-window contract as fusion) ----
  const violations = {
    fuelTemp: p.TfuelC > plant.fuelTempLimitC,
    coolant: p.TcoolC > plant.coolantLimitC,
  };
  for (const key of Object.keys(violations)) {
    if (!violations[key]) {
      if (hz[key] !== 0) {
        events.push({
          type: 'hazard', hazard: key, phase: 'clear',
          remaining: Math.max(hz[key], 0), graceTicks,
        });
        hz[key] = 0;
      }
      continue;
    }
    if (hz[key] === 0) {
      hz[key] = graceTicks;
      events.push({ type: 'hazard', hazard: key, phase: 'start' });
    } else if (hz[key] > 1) {
      hz[key] -= 1;
    } else if (hz[key] === 1) {
      hz[key] = -1;
      events.push({ type: 'hazard', hazard: key, phase: 'breach' });
      if (!p.scrammed) { // reactor protection system trips
        c.rods = 100;
        p.rodPos = 100;
        p.scrammed = true;
        p.tripCount = (p.tripCount ?? 0) + 1;
        events.push({ type: 'scram', reason: key });
      }
    }
  }
  if (hz.fuelTemp === -1) st.cladding -= (1.0 / TICKS_PER_REAL_S) * dmgMult;
  if (hz.coolant === -1) st.steamGen -= (0.8 / TICKS_PER_REAL_S) * dmgMult;

  // ---- Slow structural wear ----
  st.vessel -= (f * 100 * dt) / (5 * 86400) * dmgMult;              // fast fluence embrittlement
  st.steamGen -= Math.abs(p.TcoolC - prevTcool) * 0.02 * dmgMult;   // thermal-cycling fatigue

  // ---- Electric output (research reactors make neutrons, not MWh) ----
  p.grossElecMW = plant.gridConnected ? totalMW * plant.thermalEff * ab.turbine : 0;
  p.recircMW = flow * plant.recircFlowMW + plant.recircBaseMW;
  if (plant.gridConnected) {
    // the generator breaker: no sync, no sales. House loads never stop
    if (c.genOnline && p.scrammed) {
      c.genOnline = false;
      events.push({ type: 'gridTrip', reason: 'scram' });
    } else if (c.genOnline && p.P < plant.nominalMW * 0.08) {
      // reverse-power protection: a turbine with no steam motors on the grid
      c.genOnline = false;
      events.push({ type: 'gridTrip', reason: 'lowsteam' });
    }
    p.netElecMW = (c.genOnline ? p.grossElecMW : 0) - p.recircMW;
    p.homesPowered = c.genOnline ? Math.max(Math.round(p.netElecMW * 1000), 0) : 0;
  } else {
    p.netElecMW = p.grossElecMW - p.recircMW;
    p.homesPowered = Math.max(Math.round(p.netElecMW * 1000), 0);
  }

  // ---- Status ----
  p.critical = p.P > 1;
  p.plasmaOn = p.critical;
  if (p.scrammed && c.rods < 99) p.scrammed = false; // operator re-withdrew after a trip
  p.fluxFrac = f;

  st.cladding = Math.max(st.cladding, 0);
  st.vessel = Math.max(st.vessel, 0);
  st.steamGen = Math.max(st.steamGen, 0);
  st.integrity = Math.min(st.cladding, st.vessel, st.steamGen);
  if (st.integrity <= 0) events.push({ type: 'meltdown' });

  const activeTimers = Object.values(hz).filter((v) => v > 0);
  p.stability = Object.values(hz).some((v) => v === -1) ? 5
    : activeTimers.length ? Math.round((Math.min(...activeTimers) / graceTicks) * 100)
    : 100;
  p.stable = p.critical && Object.values(hz).every((v) => v === 0);

  return { controls: c, physics: p, structure: st, fuel: { ...sim.fuel }, hazards: hz, events };
}

/** Cold / Heatup / Hot standby / Critical / On line, for status displays. */
export function plantStateOf(sim) {
  const p = sim.physics;
  const c = sim.controls;
  const plant = fissionPlantOf(sim);
  if ((sim.fuelCycle?.reloadTicksLeft ?? 0) > 0) return 'RELOAD OUTAGE';
  if (c.genOnline) return 'ON LINE';
  if (p.critical) return 'CRITICAL';
  if (!plant.heatupPlant) return p.scrammed ? 'TRIPPED' : 'SHUTDOWN';
  if (p.TcoolC >= plant.critInterlockC) return p.scrammed ? 'TRIPPED / HOT' : 'HOT STANDBY';
  if (c.heaters && p.TcoolC > plant.ambientC + 5) return 'HEATUP';
  return 'COLD SHUTDOWN';
}

/**
 * Simulator initial conditions ("IC sets", as on real training simulators).
 * Each returns overrides applied onto a fresh fission state.
 */
export const FISSION_SCENARIOS = {
  hotFullPower: {
    label: 'Hot Full Power',
    desc: 'Steady at ~100% with equilibrium xenon. Keep it there.',
    apply: (sim) => {
      sim.controls.rods = 7;
      sim.controls.heaters = true;
      sim.controls.genOnline = true;
      sim.physics = {
        ...sim.physics,
        rodPos: 7, P: 3350, avgP: 3350, decayMW: 221,
        TcoolC: 332, TfuelC: 1507, hotStandbyNoted: true,
        iodine: 0.98, xenon: 1.0, xenonPcm: XE_EQ_PCM,
        burnup: 0.10, critical: true, plasmaOn: true, scrammed: false,
      };
    },
  },
  xenonPeak: {
    label: 'Post-Trip Xenon Peak',
    desc: 'Tripped 3 h ago; xenon near its pit. Restart if you can.',
    apply: (sim) => {
      sim.controls.rods = 100;
      sim.controls.heaters = true;
      sim.physics = {
        ...sim.physics,
        rodPos: 100, P: SOURCE_MW, avgP: 700, decayMW: 46,
        TcoolC: 300, TfuelC: 312, hotStandbyNoted: true,
        iodine: 0.70, xenon: 1.32, xenonPcm: XE_EQ_PCM * 1.32,
        burnup: 0.15, critical: false, plasmaOn: false, scrammed: true,
      };
    },
  },
  endOfCycle: {
    label: 'End of Cycle',
    desc: 'Core 70% burned. Barely enough reactivity. Coast down or refuel.',
    apply: (sim) => {
      sim.controls.rods = 5;
      sim.controls.heaters = true;
      sim.controls.genOnline = true;
      sim.physics = {
        ...sim.physics,
        rodPos: 5, P: 900, avgP: 900, decayMW: 59,
        TcoolC: 302, TfuelC: 610, hotStandbyNoted: true,
        iodine: 0.45, xenon: 0.32, xenonPcm: XE_EQ_PCM * 0.32,
        burnup: 0.70, critical: true, plasmaOn: true, scrammed: false,
      };
    },
  },
};

/** Flat metric context for the fission advisor triggers. */
export function buildFissionContext(sim, econ) {
  const { physics: p, structure: st, controls: c } = sim;
  const plant = fissionPlantOf(sim);
  return {
    P: p.P, reactivityPcm: p.reactivityPcm, xenonPcm: p.xenonPcm,
    TfuelC: p.TfuelC, TcoolC: p.TcoolC, decayMW: p.decayMW,
    burnup: p.burnup, rods: c.rods, pumps: c.pumps,
    netElecMW: p.netElecMW, funds: econ.funds,
    cladding: st.cladding, vessel: st.vessel, steamGen: st.steamGen, integrity: st.integrity,
    critical: p.critical ? 1 : 0, scrammed: p.scrammed ? 1 : 0,
    heaters: c.heaters ? 1 : 0, genOnline: c.genOnline ? 1 : 0,
    gridConnected: plant.gridConnected ? 1 : 0,
    coldPlant: plant.heatupPlant && !p.critical && p.TcoolC < plant.critInterlockC ? 1 : 0,
    fluxFrac: p.fluxFrac ?? 0,
  };
}
