// Physical and game-balance constants. Sources for the physics values live in
// src/data/sources.json, keyed by the `cite` ids referenced from the UI.

export const KEV_J = 1.602e-16;          // 1 keV in joules
export const E_FUSION_J = 2.82e-12;      // 17.6 MeV per D-T reaction
export const ALPHA_FRACTION = 0.2;       // 3.5 MeV alpha / 17.6 MeV total
export const NEUTRON_J = 2.26e-12;       // 14.1 MeV neutron energy
export const MU0 = 4 * Math.PI * 1e-7;

export const PLASMA_VOLUME_M3 = 100;     // compact high-field reactor (ARC-class)
export const BREMS_COEFF = 5.35e-37;     // W·m^3, Z_eff folded in separately
export const Z_EFF_BASE = 1.6;

// IPB98(y,2)-inspired confinement scaling: tau_E = H * C1 * B^0.15 * P_MW^-0.69 * n19^0.41
// C1 calibrated so Q ~= 1 is just reachable at B=12T, n=1e20, P_heat=40MW with H=1.
// NOTE: deviates from the spec's tau_E(t=0)=0.5s. With 0.5s the spec's own
// exponents make breakeven unreachable inside the slider bounds. See README.
export const TAU_C1 = 4.2;
export const H_FACTOR_BASE = 1.0;

export const INJECTOR_EFF = 0.5;         // wall-plug -> beam efficiency (NBI/ICRF)
export const HEAT_ABSORB = 0.9;          // beam absorption ceiling at high density
// Beam shine-through: absorption = HEAT_ABSORB * (1 - exp(-n20/SHINE_N0)).
// A thin plasma lets most of the beam pass straight through to the far wall,
// so heating a near-vacuum is wildly inefficient (as in real NBI systems).
export const SHINE_N0 = 0.4;
// Transport floor: tau_E saturates at low heating power instead of growing
// without bound (P^-0.69 alone would let a 3 MW plasma confine for seconds).
export const TAU_CAP_BASE = 1.2;         // seconds, scaled by the H-factor
export const MAGNET_OHMIC_COEFF = 0.35;  // MW per T^2 (resistive LTS cryo + feeds)
export const BASELINE_PLANT_MW = 15;     // pumps, cryo, tritium plant, controls
export const THERMAL_EFF = 0.35;         // balance-of-plant steam cycle
export const BLANKET_MULT = 1.15;        // neutron energy multiplication in blanket

export const IGNITION_TRIPLE = 3e21;     // keV·s·m^-3
export const GREENWALD_COEFF = 0.191;    // n_GW(1e20 m^-3) = 0.191 * B_T  (I_p ~ 2.4*B, a=2m)
export const BETA_LIMIT = 0.028;         // Troyon-like limit

// Divertor: T_div(C) = 300 + 12 * P_exhaust_MW / (1 + cooling_MW/20)
export const DIVERTOR_BASE_C = 300;
export const DIVERTOR_HEAT_COEFF = 12;
export const DIVERTOR_COOLING_SCALE = 20;
export const DIVERTOR_LIMIT_BASE_C = 1200;
export const DIVERTOR_DAMAGE_PCT_PER_S = 1.0;   // when over the thermal limit (spec)

// First wall: 500 MW continuous burn depletes 100% in 120 real minutes (spec)
export const WALL_DPA_PCT_PER_S_PER_MW = 100 / (500 * 120 * 60);

export const MAGNET_SAFE_B_LTS = 11.5;   // quench risk above this (Nb3Sn-class)
export const MAGNET_SAFE_B_HTS = 19.5;   // after REBCO upgrade
export const QUENCH_DAMAGE_PCT = 15;

export const DISRUPTION_BASE_P = 0.0004;         // per tick, tokamak background

// Tech-tree downsides: every upgrade is a compromise (see tech.js)
export const HMODE_DIV_PEAKING = 1.15;   // ELMs focus exhaust heat onto the divertor
export const HMODE_DIV_WEAR = 1.5;       // ELM erosion multiplier when the divertor is damaged
export const W_ZEFF = 1.9;               // tungsten contamination raises Z_eff from 1.6
export const HTS_QUENCH_DAMAGE_PCT = 25; // brittle REBCO tape: a quench does more damage
export const BLANKET_MAINT_MULT = 1.25;  // activated blanket modules cost more to maintain
export const SHAPING_DISRUPT_MULT = 1.6; // shaped plasma runs closer to stability limits
export const FUEL_BURN_G_PER_MW_S = 3e-6;        // total D-T mass (spec)
export const TRITIUM_MASS_FRACTION = 0.6;        // T is 3 of 5 amu in a D-T pair

// Economy
export const STARTING_FUNDS = 1e10;              // $10B (spec)
export const BASE_PRICE_MWH = 50;                // $/MWh (spec)
export const PRICE_NOISE_SD = 0.05;              // ~ +-10% swings (spec)
export const PRICE_UPDATE_SIM_S = 30;            // every 30 operating seconds (spec)
export const TRITIUM_PRICE_G = 30000;            // $/gram (spec)
export const MAINT_PER_SIM_HOUR = 12000;         // O&M baseline
export const CAPITAL_AMORT_PER_SIM_HOUR = 19000; // $5B over 30 years
export const WALL_REPLACE_COST = 50e6;           // spec
export const HOME_AVG_KW = 1.0;                  // avg continuous draw per home

// R&D
export const RD_PER_STABLE_SIM_HOUR = 10;        // spec
export const RD_BONUS_Q1 = 500;                  // first Q>1 (spec)
export const RD_BONUS_LEVEL = 1000;              // per level completed (spec)

// Simulation timing: fixed 10 Hz tick; at 1x speed 1 real second = 1 sim minute,
// so each 100 ms tick advances 6 sim seconds.
// Grace window after a limit violation before the consequence fires.
// Fix the violation inside the window and nothing happens (12 s at 1x).
export const HAZARD_GRACE_TICKS = 120;

// Difficulty modes: budget, warning window, hardware fragility, random-disruption rate
export const DIFFICULTIES = {
  engineer: {
    key: 'engineer', label: 'Engineer',
    tagline: '$20B · 20s warnings · tough hardware · no random disruptions',
    funds: 20e9, graceTicks: 200, damageMult: 0.5, bgRiskMult: 0,
  },
  operator: {
    key: 'operator', label: 'Operator',
    tagline: '$10B · 12s warnings. The intended experience',
    funds: 10e9, graceTicks: 120, damageMult: 1, bgRiskMult: 1,
  },
  director: {
    key: 'director', label: 'Director',
    tagline: '$4B · 6s warnings · brittle hardware · frequent disruptions',
    funds: 4e9, graceTicks: 60, damageMult: 1.5, bgRiskMult: 2,
  },
};

export const TICK_MS = 100;
export const SIM_DT_S = 6;
export const TICKS_PER_REAL_S = 10;
export const LEVEL_SUSTAIN_TICKS = 50;           // 5 real seconds (spec)
