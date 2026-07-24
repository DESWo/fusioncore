// Pure physics solver for FusionCore. No imports from React, Zustand, or the
// DOM. This module must stay runnable headless (see scripts/balance_check.mjs).
import { sigmaV } from './reactivity.js';
import {
  KEV_J, E_FUSION_J, ALPHA_FRACTION, NEUTRON_J, MU0,
  PLASMA_VOLUME_M3 as V, BREMS_COEFF, Z_EFF_BASE,
  TAU_C1, INJECTOR_EFF, HEAT_ABSORB, SHINE_N0, TAU_CAP_BASE, BASELINE_PLANT_MW,
  THERMAL_EFF, BLANKET_MULT, IGNITION_TRIPLE, GREENWALD_COEFF, BETA_LIMIT,
  DIVERTOR_BASE_C, DIVERTOR_HEAT_COEFF, DIVERTOR_COOLING_SCALE,
  DIVERTOR_DAMAGE_PCT_PER_S, WALL_DPA_PCT_PER_S_PER_MW,
  QUENCH_DAMAGE_PCT, DISRUPTION_BASE_P,
  FUEL_BURN_G_PER_MW_S, TRITIUM_MASS_FRACTION,
  SIM_DT_S, TICKS_PER_REAL_S, H_FACTOR_BASE, MAGNET_OHMIC_COEFF,
  MAGNET_SAFE_B_LTS, DIVERTOR_LIMIT_BASE_C, HAZARD_GRACE_TICKS,
  W_ZEFF, HMODE_DIV_PEAKING, HMODE_DIV_WEAR, HTS_QUENCH_DAMAGE_PCT,
} from './constants.js';

export function createSimState() {
  const n20 = 0.1; // 1.0e19 m^-3 (spec §8)
  const T = 1.0;   // keV
  return {
    time: { simSeconds: 0, ticks: 0 },
    controls: {
      B: 5.0, bMin: 1.0, bMax: 12.0,
      heat: 10, heatMin: 0, heatMax: 50,
      density: n20, densityMin: 0.1, densityMax: 5.0, // units of 1e20 m^-3
      cooling: 0, coolingMax: 100,                    // divertor cooling, MW
      fuelMix: 0.5,                                   // tritium fraction
      autoBuyTritium: true,
    },
    physics: {
      T, W: 3 * n20 * 1e20 * T * KEV_J * V,
      tauE: 0, Q: 0, pFusionMW: 0, pAlphaMW: 0, pBremsMW: 0,
      pInputElecMW: 20, magnetDrawMW: 0, grossElecMW: 0, netElecMW: 0, recircMW: 0,
      neutronRate: 0, tripleProduct: 0, ignition: false, beamCoupling: 0.2,
      greenwaldFrac: 0, greenwaldLimit20: GREENWALD_COEFF * 5.0,
      beta: 0, betaLimit: BETA_LIMIT,
      divertorTempC: DIVERTOR_BASE_C,
      plasmaOn: true, stable: false, stability: 100,
      homesPowered: 0,
      // tech-mutable machine parameters
      hFactor: H_FACTOR_BASE,
      magnetOhmicCoeff: MAGNET_OHMIC_COEFF,
      magnetSafeB: MAGNET_SAFE_B_LTS,
      divertorLimitC: DIVERTOR_LIMIT_BASE_C,
      tbr: 0.0,
      isStellarator: false,
      disruptionProbBase: DISRUPTION_BASE_P,
      // Random background disruptions ramp in with the campaign (0 during the
      // tutorial missions); player-caused limit violations always carry risk.
      bgRiskScale: 0,
      // Tech-tradeoff parameters (upgrades move these in both directions)
      zEff: Z_EFF_BASE,
      divertorPeaking: 1.0,
      divertorWearMult: 1.0,
      quenchDamagePct: QUENCH_DAMAGE_PCT,
    },
    // As-built manufacturing tolerances, sampled once per campaign in the
    // store's newGame. Defaults are exact-to-print so the headless balance
    // suite stays deterministic.
    asBuilt: { confinement: 1.0, injector: 1.0, turbine: 1.0 },
    // Hazard countdown state per limit: 0 = clear, >0 = grace ticks left,
    // -1 = breached (consequence ongoing until the violation is fixed)
    hazards: { greenwald: 0, beta: 0, divertor: 0, magnets: 0 },
    structure: { firstWall: 100, divertor: 100, magnets: 100, integrity: 100 },
    fuel: { tritium: 30, deuterium: 20, exhaustedWarned: false }, // 50 g premixed D-T
  };
}

/** Simulator initial conditions for the fusion machine. */
export const FUSION_SCENARIOS = {
  breakevenReady: {
    label: 'Breakeven Ready',
    desc: 'Baseline machine tuned to the edge of Q = 1. Push it over.',
    apply: (sim) => {
      Object.assign(sim.controls, { B: 11.4, heat: 40, density: 1.0, cooling: 20 });
      sim.physics.W = 3 * 1.0e20 * 10 * KEV_J * V;
      sim.physics.T = 10;
      sim.fuel.tritium = 30;
      sim.fuel.deuterium = 25;
    },
  },
  gwClass: {
    label: 'GW-Class Plant',
    desc: 'Full tech stack at gigawatt scale with breeding. Keep it profitable.',
    apply: (sim) => {
      Object.assign(sim.controls, { B: 19, heat: 50, density: 3.0, cooling: 100, bMax: 20 });
      Object.assign(sim.physics, {
        hFactor: 1.9,
        magnetSafeB: 19.5,
        magnetOhmicCoeff: MAGNET_OHMIC_COEFF * 0.3,
        divertorLimitC: 2200,
        tbr: 1.05,
        T: 20,
        W: 3 * 3.0e20 * 20 * KEV_J * V,
        // the matching downsides of that tech stack
        zEff: W_ZEFF,
        divertorPeaking: HMODE_DIV_PEAKING,
        divertorWearMult: HMODE_DIV_WEAR,
        quenchDamagePct: HTS_QUENCH_DAMAGE_PCT,
      });
      sim.fuel.tritium = 40;
      sim.fuel.deuterium = 35;
    },
    techIds: ['hmode', 'shaping', 'hts', 'divertor2', 'blanket'],
  },
};

/**
 * Advance the reactor by one fixed 100 ms tick (6 sim-seconds at 1x).
 * Returns { physics, structure, fuel, controls, events }. New objects; the
 * input sim is not mutated.
 */
export function physicsTick(sim, rng = Math.random) {
  const events = [];
  const c = { ...sim.controls };
  const p = { ...sim.physics };
  const st = { ...sim.structure };
  const fuel = { ...sim.fuel };
  const hz = { ...(sim.hazards ?? { greenwald: 0, beta: 0, divertor: 0, magnets: 0 }) };
  const dt = SIM_DT_S;
  // Difficulty knobs (default = Operator for old saves and headless runs)
  const diff = sim.difficulty ?? {};
  const graceTicks = diff.graceTicks ?? HAZARD_GRACE_TICKS;
  const dmgMult = diff.damageMult ?? 1;
  const bgRiskMult = diff.bgRiskMult ?? 1;
  // As-built plant (manufacturing tolerances); older saves predate the field
  const ab = sim.asBuilt ?? { confinement: 1, injector: 1, turbine: 1 };

  const fuelOk = fuel.tritium > 0.0005 && fuel.deuterium > 0.0005;
  const n20 = fuelOk ? c.density : 0;
  const nM3 = n20 * 1e20;

  // ---- Temperature from stored energy (W = 3 n T V, electrons + ions) ----
  p.T = nM3 > 0 ? p.W / (3 * nM3 * KEV_J * V) : 0;

  // ---- Power balance ----
  const mixFactor = 4 * c.fuelMix * (1 - c.fuelMix); // peaks at 50/50 D-T
  const sv = sigmaV(p.T);
  const pFusW = 0.25 * nM3 * nM3 * sv * mixFactor * E_FUSION_J * V;
  const pAlphaW = ALPHA_FRACTION * pFusW;
  const pBremsW = BREMS_COEFF * (p.zEff ?? Z_EFF_BASE) * nM3 * nM3 * Math.sqrt(Math.max(p.T, 0.01)) * V;
  // Beam shine-through: a thin plasma absorbs only a fraction of the beam
  p.beamCoupling = HEAT_ABSORB * (1 - Math.exp(-n20 / SHINE_N0));
  const pAuxW = c.heat * 1e6 * p.beamCoupling;
  const pNetHeatW = pAuxW + pAlphaW - pBremsW;

  // ---- Confinement: IPB98(y,2)-inspired scaling (game-calibrated) ----
  const pNetMW = Math.max(pNetHeatW / 1e6, 0.5);
  const n19 = Math.max(n20 * 10, 0.01);
  const hEff = p.hFactor * ab.confinement; // as-built confinement quality
  p.tauE = nM3 > 0
    ? Math.min(
        hEff * TAU_C1 * c.B ** 0.15 * pNetMW ** -0.69 * n19 ** 0.41,
        TAU_CAP_BASE * hEff, // transport floor: no free confinement at low power
      )
    : 0.05;

  // Semi-implicit energy update. Unconditionally stable for stiff tau_E
  p.W = Math.max((p.W + pNetHeatW * dt) / (1 + dt / p.tauE), 0);
  p.T = nM3 > 0 ? p.W / (3 * nM3 * KEV_J * V) : 0;

  p.pFusionMW = pFusW / 1e6;
  p.pAlphaMW = pAlphaW / 1e6;
  p.pBremsMW = pBremsW / 1e6;
  p.plasmaOn = p.T > 0.3 && nM3 > 0;

  // ---- Operational limits ----
  p.greenwaldLimit20 = GREENWALD_COEFF * c.B;
  p.greenwaldFrac = n20 / p.greenwaldLimit20;
  const pressure = 2 * nM3 * p.T * KEV_J;
  p.beta = pressure / (c.B * c.B / (2 * MU0));

  // ---- Divertor thermal load (needed before hazard evaluation) ----
  // H-mode ELMs concentrate the exhaust onto the strike points (peaking > 1)
  const pExhaustMW = ((pAuxW + pAlphaW) / 1e6) * (p.divertorPeaking ?? 1);
  const targetDivC = p.plasmaOn
    ? DIVERTOR_BASE_C + DIVERTOR_HEAT_COEFF * pExhaustMW / (1 + c.cooling / DIVERTOR_COOLING_SCALE)
    : DIVERTOR_BASE_C;
  p.divertorTempC += (targetDivC - p.divertorTempC) * 0.3; // thermal inertia

  // ---- Hazard countdowns: every violation gets a grace window to fix ----
  const violations = {
    greenwald: p.plasmaOn && !p.isStellarator && p.greenwaldFrac >= 0.98,
    beta: p.plasmaOn && !p.isStellarator && p.beta >= p.betaLimit,
    divertor: p.divertorTempC > p.divertorLimitC,
    magnets: c.B > p.magnetSafeB,
  };
  for (const key of Object.keys(violations)) {
    if (!violations[key]) {
      if (hz[key] !== 0) {
        // `remaining` = grace ticks still on the clock when the player fixed
        // it (0 if the breach had already begun). The advisor uses it to
        // recognize a save made with real margin.
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
      // grace expired. The consequence fires
      if (key === 'greenwald' || key === 'beta') {
        const severity = (0.8 + rng() * 0.7) * dmgMult;
        st.divertor -= 4 * severity * (p.divertorWearMult ?? 1);
        st.firstWall -= 2 * severity;
        st.magnets -= 2 * severity;
        p.W *= 0.02; // thermal quench
        events.push({ type: 'disruption', cause: key, severity });
        hz[key] = 0; // plasma is gone; re-arm if they relight into the same state
      } else if (key === 'magnets') {
        st.magnets -= (p.quenchDamagePct ?? QUENCH_DAMAGE_PCT) * dmgMult;
        p.W *= 0.01;
        c.B = Math.min(c.B, 3.0); // emergency field dump
        events.push({ type: 'quench' });
        hz[key] = 0;
      } else if (key === 'divertor') {
        hz[key] = -1; // erosion begins and continues until cooled
        events.push({ type: 'hazard', hazard: 'divertor', phase: 'breach' });
      }
    }
  }
  if (hz.divertor === -1) {
    st.divertor -= (DIVERTOR_DAMAGE_PCT_PER_S / TICKS_PER_REAL_S) * dmgMult * (p.divertorWearMult ?? 1);
  }

  // ---- Background disruptions: rare, random, unavoidable (tokamak tax) ----
  if (p.plasmaOn && !p.isStellarator
    && rng() < p.disruptionProbBase * (p.bgRiskScale ?? 1) * bgRiskMult) {
    const severity = (0.5 + rng()) * dmgMult;
    st.divertor -= 4 * severity * (p.divertorWearMult ?? 1);
    st.firstWall -= 2 * severity;
    st.magnets -= 2 * severity;
    p.W *= 0.02;
    events.push({ type: 'disruption', cause: 'random', severity });
  }

  // Stability readout: 100 when clear, counts down with the worst hazard
  const activeTimers = Object.values(hz).filter((v) => v > 0);
  p.stability = Object.values(hz).some((v) => v === -1) ? 5
    : activeTimers.length ? Math.round((Math.min(...activeTimers) / graceTicks) * 100)
    : 100;

  // ---- First wall neutron fluence (dpa) ----
  st.firstWall -= (p.pFusionMW * WALL_DPA_PCT_PER_S_PER_MW / TICKS_PER_REAL_S) * dmgMult;

  // ---- Fuel burn & breeding ----
  const burnG = FUEL_BURN_G_PER_MW_S * p.pFusionMW * dt;
  const tBurn = burnG * TRITIUM_MASS_FRACTION;
  fuel.tritium = Math.max(fuel.tritium - tBurn + tBurn * p.tbr, 0);
  fuel.deuterium = Math.max(fuel.deuterium - burnG * (1 - TRITIUM_MASS_FRACTION), 0);
  if (fuel.tritium <= 0.0005 && !fuel.exhaustedWarned) {
    fuel.exhaustedWarned = true;
    events.push({ type: 'fuel_exhausted' });
  } else if (fuel.tritium > 0.5) {
    fuel.exhaustedWarned = false;
  }

  // ---- Gain & grid delivery ----
  // Wall-plug draw: the as-built injector efficiency is what the vendor
  // actually delivered, not what the datasheet promised.
  p.pInputElecMW = c.heat / (INJECTOR_EFF * ab.injector);
  p.Q = p.pFusionMW / Math.max(p.pInputElecMW, 0.1);
  p.neutronRate = (pFusW * (1 - ALPHA_FRACTION)) / NEUTRON_J;
  p.tripleProduct = nM3 * p.T * p.tauE;
  p.ignition = p.tripleProduct >= IGNITION_TRIPLE && p.T > 4;

  p.magnetDrawMW = p.magnetOhmicCoeff * c.B * c.B;
  p.grossElecMW = (p.pFusionMW * BLANKET_MULT + c.heat) * THERMAL_EFF * ab.turbine;
  p.recircMW = p.pInputElecMW + p.magnetDrawMW + c.cooling * 0.3 + BASELINE_PLANT_MW;
  p.netElecMW = p.grossElecMW - p.recircMW;
  p.homesPowered = Math.max(Math.round(p.netElecMW * 1000), 0); // 1 kW avg per home

  // ---- Structural integrity ----
  st.firstWall = Math.max(st.firstWall, 0);
  st.divertor = Math.max(st.divertor, 0);
  st.magnets = Math.max(st.magnets, 0);
  st.integrity = Math.min(st.firstWall, st.divertor, st.magnets);
  if (st.integrity <= 0) events.push({ type: 'meltdown' });

  // "Stable operation" = plasma on with every hazard clear
  p.stable = p.plasmaOn && Object.values(hz).every((v) => v === 0);

  return { controls: c, physics: p, structure: st, fuel, hazards: hz, events };
}
