// Engineering-margin analysis: transparent closed-form methods with the
// equations, substituted values, and assumptions exposed to the user.
// 0-D estimates for education: NOT a qualified engineering code.
import { FISSION_NOMINAL_MW } from './fission.js';
import { MU0, PLASMA_VOLUME_M3 } from './constants.js';

// ---- Fission plant geometry / limits (PWR class) ----
export const RCS_PRESSURE_MPA = 15.5;
const TSAT_C = 345;                 // saturation temperature at 15.5 MPa
export const VESSEL_R_M = 2.2;      // inner radius
export const VESSEL_H_M = 11;       // shell height
const PTS_SCREEN_C = 132;           // 10 CFR 50.61 screening (270 °F) for welds
const PCT_LIMIT_C = 1204;           // 10 CFR 50.46 peak cladding temperature
const DNBR_LIMIT = 1.30;            // W-3 correlation design limit
const DESIGN_TRIPS = 400;           // ASME design-basis trip cycle allowance
const STEEL_DENSITY = 7850;         // kg/m^3

// Vessel material catalog: the design tradeoff the user can actually turn
export const VESSEL_MATERIALS = {
  sa508: { label: 'SA-508 forged steel', allowMPa: 184, costPerTonne: 60000 },
  econ: { label: 'Commodity pressure steel', allowMPa: 130, costPerTonne: 28000 },
};
export const DEFAULT_DESIGN = { vesselT: 0.22, material: 'sa508' };

export function vesselMassTonnes(t) {
  return (STEEL_DENSITY * 2 * Math.PI * VESSEL_R_M * t * VESSEL_H_M) / 1000;
}

/** Preview a vessel design change: stress, safety factor, mass, refit cost. */
export function vesselDesignPreview(design, newT, newMaterial) {
  const mat = VESSEL_MATERIALS[newMaterial] ?? VESSEL_MATERIALS.sa508;
  const stress = (RCS_PRESSURE_MPA * VESSEL_R_M) / newT;
  const fos = mat.allowMPa / stress;
  const massT = vesselMassTonnes(newT);
  const curMassT = vesselMassTonnes(design?.vesselT ?? DEFAULT_DESIGN.vesselT);
  const matChanged = newMaterial !== (design?.material ?? DEFAULT_DESIGN.material);
  const refitCost = (Math.abs(newT - (design?.vesselT ?? 0.22)) > 0.0001 || matChanged)
    ? 5e6 + Math.abs(massT - curMassT) * mat.costPerTonne + (matChanged ? 15e6 : 0)
    : 0;
  return { stress, fos, massT, refitCost, allowMPa: mat.allowMPa };
}

function row(id, label, techName, value, unit, limit, opts = {}) {
  const { lowerIsBad = false, cite, fmt = 1, calc } = opts;
  const used = lowerIsBad
    ? (value <= 0 ? 1 : Math.min(limit / value, 1.5))
    : Math.min(value / limit, 1.5);
  const status = used < 0.7 ? 'ok' : used < 1.0 ? 'warn' : 'crit';
  return {
    id, label, techName, unit, cite, status, calc,
    value: Number.isFinite(value) ? value.toFixed(fmt) : 'n/a',
    limit: limit.toFixed(fmt),
    used: Math.max(Math.min(used, 1.5), 0),
    lowerIsBad,
  };
}

/** Fission engineering margins. Reads the player's vessel design choices. */
export function fissionAnalysis(sim) {
  const p = sim.physics;
  const design = sim.design ?? DEFAULT_DESIGN;
  const mat = VESSEL_MATERIALS[design.material] ?? VESSEL_MATERIALS.sa508;
  const flow = Math.max((sim.controls.pumps ?? 100) / 100, 0.05);
  const totalMW = p.P + p.decayMW;

  const dTloop = totalMW / (flow * 103);
  const tHot = p.TcoolC + dTloop / 2;
  const subcool = TSAT_C - tHot;

  const dnbr = p.fluxFrac < 0.02
    ? Infinity
    : 2.1 * (1 / Math.max(p.fluxFrac, 0.02)) * Math.sqrt(Math.max(subcool, 0.1) / 13);

  const hoop = (RCS_PRESSURE_MPA * VESSEL_R_M) / design.vesselT;
  const fos = mat.allowMPa / hoop;

  const fluenceFrac = 1 - sim.structure.vessel / 100;
  const rtShift = 160 * Math.sqrt(Math.max(fluenceFrac, 0));

  const pct = p.TcoolC + (p.TfuelC - p.TcoolC) * 0.25;
  const cuf = (p.tripCount ?? 0) / DESIGN_TRIPS;

  return {
    header: [
      ['Coolant pressure', `${RCS_PRESSURE_MPA.toFixed(1)} MPa`],
      ['Hot / cold leg', `${tHot.toFixed(1)} / ${(p.TcoolC - dTloop / 2).toFixed(1)} °C`],
      ['Trips logged', `${p.tripCount ?? 0}`],
    ],
    rows: [
      row('subcool', 'Boiling margin', 'subcooling margin', subcool, '°C', 5, {
        lowerIsBad: true, cite: 'pwr',
        calc: {
          meaning: `The hottest coolant is ${Math.max(subcool, 0).toFixed(1)} °C below its boiling point at this pressure.`,
          drivers: 'More reactor power or less pump flow heats the coolant and shrinks the margin.',
          equation: 'margin = T_saturation(P) − T_hot-leg',
          steps: [
            ['Saturation temp at 15.5 MPa', `${TSAT_C} °C`],
            ['Hot leg temperature', `${tHot.toFixed(1)} °C`],
            ['Margin', `${subcool.toFixed(1)} °C`],
          ],
          assumptions: 'Single-node coolant model; saturation temperature fixed at nominal pressure (no pressurizer dynamics yet).',
        },
      }),
      row('dnbr', 'Boiling-crisis ratio', 'DNBR', dnbr === Infinity ? 99 : dnbr, '', DNBR_LIMIT, {
        lowerIsBad: true, cite: 'dnbr', fmt: 2,
        calc: {
          meaning: dnbr === Infinity
            ? 'Reactor is shut down; boiling crisis is not possible.'
            : `Heat flux could rise ${dnbr.toFixed(1)}× before a vapor blanket forms on the fuel.`,
          drivers: 'Higher power lowers it. More subcooling (cooler coolant) raises it. Plants must stay above 1.30.',
          equation: 'DNBR ≈ 2.1 · (1 / flux) · √(subcooling / 13)',
          steps: [
            ['Neutron flux', `${(p.fluxFrac * 100).toFixed(1)} % nominal`],
            ['Subcooling', `${Math.max(subcool, 0).toFixed(1)} °C`],
            ['DNBR', dnbr === Infinity ? 'n/a (shutdown)' : dnbr.toFixed(2)],
            ['Design limit', DNBR_LIMIT.toFixed(2)],
          ],
          assumptions: 'Shape-only proxy of the W-3 critical-heat-flux correlation; real analysis uses local channel conditions.',
        },
      }),
      row('pct', 'Fuel-cover temperature', 'peak cladding temperature', pct, '°C', PCT_LIMIT_C, {
        cite: 'ecc', fmt: 0,
        calc: {
          meaning: `The fuel-rod covering surface is near ${pct.toFixed(0)} °C. Above ${PCT_LIMIT_C} °C it oxidizes runaway-fast in steam.`,
          drivers: 'Power raises it. Coolant flow lowers it. The 1204 °C limit is federal law for accident analysis.',
          equation: 'T_clad ≈ T_coolant + 0.25 · (T_fuel − T_coolant)',
          steps: [
            ['Coolant temperature', `${p.TcoolC.toFixed(0)} °C`],
            ['Fuel temperature', `${p.TfuelC.toFixed(0)} °C`],
            ['Cladding surface', `${pct.toFixed(0)} °C`],
            ['10 CFR 50.46 limit', `${PCT_LIMIT_C} °C`],
          ],
          assumptions: 'Fixed conduction fraction between fuel and coolant nodes; real analysis resolves the rod radially.',
        },
      }),
      row('hoop', 'Vessel wall stress', 'hoop stress', hoop, 'MPa', mat.allowMPa, {
        cite: 'asme', fmt: 0,
        calc: {
          meaning: `The coolant pushes outward on the vessel wall, using ${((hoop / mat.allowMPa) * 100).toFixed(0)}% of the steel's allowable strength (safety factor ${fos.toFixed(2)}).`,
          drivers: 'Higher pressure raises stress. A thicker wall lowers it, but adds mass and cost. Change both in Vessel Design.',
          equation: 'σ_hoop = P · r / t      FoS = σ_allowable / σ_hoop',
          steps: [
            ['Pressure P', `${RCS_PRESSURE_MPA.toFixed(1)} MPa`],
            ['Radius r', `${VESSEL_R_M.toFixed(1)} m`],
            ['Wall thickness t', `${design.vesselT.toFixed(2)} m`],
            ['Hoop stress', `${hoop.toFixed(0)} MPa`],
            [`Allowable (${mat.label})`, `${mat.allowMPa} MPa`],
            ['Factor of safety', fos.toFixed(2)],
          ],
          assumptions: 'Thin-wall approximation, uniform temperature, no nozzles or weld residual stress. Real vessels use ASME Section III methods.',
        },
      }),
      row('rtndt', 'Steel brittleness shift', 'RT_NDT shift', rtShift, '°C', PTS_SCREEN_C, {
        cite: 'pts', fmt: 0,
        calc: {
          meaning: `Neutron bombardment has shifted the steel's brittle-transition temperature by ${rtShift.toFixed(0)} °C.`,
          drivers: 'Fast-neutron fluence accumulates with power over years. Only servicing (annealing/replacement) resets it.',
          equation: 'ΔRT_NDT ≈ 160 · √(fluence fraction)',
          steps: [
            ['Vessel fluence consumed', `${(fluenceFrac * 100).toFixed(1)} %`],
            ['Shift', `${rtShift.toFixed(0)} °C`],
            ['PTS screening limit', `${PTS_SCREEN_C} °C`],
          ],
          assumptions: 'Simplified Reg Guide 1.99 shape with fixed chemistry factor; real screening uses weld copper/nickel content.',
        },
      }),
      row('cuf', 'Fatigue budget used', 'cumulative usage factor', cuf, 'CUF', 1.0, {
        cite: 'asme', fmt: 3,
        calc: {
          meaning: `${p.tripCount ?? 0} of ${DESIGN_TRIPS} design-basis trip cycles consumed. Every trip thermally shocks the plant.`,
          drivers: 'Each SCRAM (manual or automatic) adds one cycle. Nothing removes them: fatigue is forever.',
          equation: 'CUF = Σ nᵢ / Nᵢ   (Miner’s rule)',
          steps: [
            ['Trip cycles n', `${p.tripCount ?? 0}`],
            ['Design allowance N', `${DESIGN_TRIPS}`],
            ['CUF', cuf.toFixed(3)],
          ],
          assumptions: 'Only trip cycles counted; real CUF sums many transient categories with different allowances.',
        },
      }),
    ],
  };
}

/** Fusion engineering margins. */
export function fusionAnalysis(sim, stats = {}) {
  const p = sim.physics;
  const c = sim.controls;
  const TF_STRESS_FACTOR = 4;
  const TF_ALLOWABLE_MPA = 660;
  const DIVERTOR_AREA_M2 = 8;
  const DIVERTOR_FLUX_LIMIT = 20;
  const WALL_AREA_M2 = 300;
  const WALL_LOAD_LIMIT = 4;
  const WALL_LIFE_DPA = 20;
  const DISRUPTION_ALLOWANCE = 100;

  const magPressureMPa = (c.B * c.B) / (2 * MU0) / 1e6;
  const tfStress = magPressureMPa * TF_STRESS_FACTOR;
  const divFlux = ((c.heat * 0.9 + p.pAlphaMW) || 0) / DIVERTOR_AREA_M2;
  const wallLoad = (p.pFusionMW * 0.8) / WALL_AREA_M2;
  const dpa = (1 - sim.structure.firstWall / 100) * WALL_LIFE_DPA;
  const disrCycles = stats.disruptions ?? 0;

  return {
    header: [
      ['Plasma volume', `${PLASMA_VOLUME_M3} m³`],
      ['Magnetic pressure', `${magPressureMPa.toFixed(0)} MPa`],
      ['Disruptions logged', `${disrCycles}`],
    ],
    rows: [
      row('tf', 'Magnet structure stress', 'TF hoop stress', tfStress, 'MPa', TF_ALLOWABLE_MPA, {
        cite: 'quench', fmt: 0,
        calc: {
          meaning: `The field squeezes its own coils. The support steel carries ${tfStress.toFixed(0)} MPa (safety factor ${(TF_ALLOWABLE_MPA / tfStress).toFixed(2)}).`,
          drivers: 'Stress grows with the SQUARE of field strength. Doubling B quadruples the load.',
          equation: 'σ ≈ (B² / 2μ₀) · k_structure',
          steps: [
            ['Field B', `${c.B.toFixed(1)} T`],
            ['Magnetic pressure B²/2μ₀', `${magPressureMPa.toFixed(0)} MPa`],
            ['Structure factor k', `${TF_STRESS_FACTOR}`],
            ['Structural stress', `${tfStress.toFixed(0)} MPa`],
            ['Cryogenic steel allowable', `${TF_ALLOWABLE_MPA} MPa`],
          ],
          assumptions: 'Fixed geometry amplification factor; real coils use full electromagnetic-structural FEA.',
        },
      }),
      row('divflux', 'Exhaust plate heat', 'divertor heat flux', divFlux, 'MW/m²', DIVERTOR_FLUX_LIMIT, {
        cite: 'divertor_iter',
        calc: {
          meaning: `${divFlux.toFixed(1)} MW hits every square meter of the exhaust plates. Rocket-nozzle territory.`,
          drivers: 'Heating power and alpha self-heating both exhaust through this surface. Cooling changes the temperature, not this flux.',
          equation: 'q = P_exhaust / A_divertor',
          steps: [
            ['Exhaust power', `${(c.heat * 0.9 + p.pAlphaMW).toFixed(0)} MW`],
            ['Wetted area', `${DIVERTOR_AREA_M2} m²`],
            ['Heat flux', `${divFlux.toFixed(1)} MW/m²`],
            ['Tungsten target limit', `${DIVERTOR_FLUX_LIMIT} MW/m²`],
          ],
          assumptions: 'Uniform deposition over a fixed wetted area; real machines fight peaking factors and transients.',
        },
      }),
      row('wall', 'Inner wall neutron load', 'neutron wall load', wallLoad, 'MW/m²', WALL_LOAD_LIMIT, {
        cite: 'dpa_materials', fmt: 2,
        calc: {
          meaning: `Fusion neutrons carry ${wallLoad.toFixed(2)} MW through each square meter of the inner wall.`,
          drivers: 'Scales directly with fusion power. This is what ages the wall.',
          equation: 'load = 0.8 · P_fusion / A_wall',
          steps: [
            ['Fusion power', `${p.pFusionMW.toFixed(0)} MW`],
            ['Neutron fraction', '0.8'],
            ['Wall area', `${WALL_AREA_M2} m²`],
            ['Wall load', `${wallLoad.toFixed(2)} MW/m²`],
          ],
          assumptions: 'Uniform flux on a fixed area; blanket design limit taken as 4 MW/m².',
        },
      }),
      row('dpa', 'Wall damage accumulated', 'displacement dose (dpa)', dpa, 'dpa', WALL_LIFE_DPA, {
        cite: 'dpa_materials',
        calc: {
          meaning: `Every atom in the inner wall has been knocked out of place ~${dpa.toFixed(1)} times.`,
          drivers: 'Neutron fluence accumulates with fusion power over time. Servicing replaces the wall.',
          equation: 'dpa = (1 − health) · life_dpa',
          steps: [
            ['Wall health', `${sim.structure.firstWall.toFixed(1)} %`],
            ['Replacement budget', `${WALL_LIFE_DPA} dpa`],
            ['Accumulated', `${dpa.toFixed(1)} dpa`],
          ],
          assumptions: 'Linear damage-to-fluence mapping; compressed timescale for gameplay.',
        },
      }),
      row('emc', 'Disruption shock count', 'EM-load cycles', disrCycles, 'cycles', DISRUPTION_ALLOWANCE, {
        cite: 'scram', fmt: 0,
        calc: {
          meaning: `${disrCycles} disruption shocks absorbed of the ${DISRUPTION_ALLOWANCE} the structure is rated for.`,
          drivers: 'Every plasma disruption slams electromagnetic loads into the vessel. Stellarators never take these.',
          equation: 'usage = cycles / allowance',
          steps: [
            ['Cycles', `${disrCycles}`],
            ['Rated allowance', `${DISRUPTION_ALLOWANCE}`],
          ],
          assumptions: 'All disruptions counted as equal severity.',
        },
      }),
    ],
  };
}
