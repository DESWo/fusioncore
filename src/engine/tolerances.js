// Manufacturing tolerances: the plant you got vs the plant you ordered.
// Real engineering is never deterministic; pumps, fuel batches, and turbine
// blades all arrive slightly off the datasheet. Values are sampled ONCE when
// a campaign starts (store.newGame) and live in sim.asBuilt for the rest of
// the save. createSimState / createFissionState default every multiplier to
// exactly 1.0 so the headless balance suite stays deterministic.
//
// Ranges are chosen so the campaign stays winnable with the briefed control
// settings on a worst-case roll (verified in scripts/balance_check.mjs).
import { INJECTOR_EFF, THERMAL_EFF } from './constants.js';

const uniform = (rng, lo, hi) => lo + rng() * (hi - lo);

// Per-mode tolerance catalog. `min`/`max` bound the sampled multiplier;
// `describe` renders the design vs as-built comparison for the UI.
export const TOLERANCE_SPECS = {
  fusion: [
    {
      key: 'confinement',
      label: 'Confinement quality',
      tech: 'effective H-factor multiplier',
      note: 'First-wall conditioning and field-alignment quality',
      min: 0.985, max: 1.005,
      describe: (m) => ({ design: '×1.000', actual: `×${m.toFixed(3)}` }),
    },
    {
      key: 'injector',
      label: 'Heating injector efficiency',
      tech: 'NBI/ICRF wall-plug efficiency',
      note: 'Vendor acceptance test vs datasheet',
      min: 0.96, max: 1.02,
      describe: (m) => ({
        design: `${(INJECTOR_EFF * 100).toFixed(1)}%`,
        actual: `${(INJECTOR_EFF * m * 100).toFixed(1)}%`,
      }),
    },
    {
      key: 'turbine',
      label: 'Turbine cycle efficiency',
      tech: 'balance-of-plant thermal efficiency',
      note: 'Blade finish and condenser performance as commissioned',
      min: 0.985, max: 1.015,
      describe: (m) => ({
        design: `${(THERMAL_EFF * 100).toFixed(1)}%`,
        actual: `${(THERMAL_EFF * m * 100).toFixed(1)}%`,
      }),
    },
  ],
  research: [
    {
      key: 'pumps',
      label: 'Pool circulation capacity',
      tech: 'primary flow vs nameplate',
      note: 'Impeller tolerance and pool hydraulic losses',
      min: 0.97, max: 1.01,
      describe: (m) => ({ design: '100.0%', actual: `${(m * 100).toFixed(1)}%` }),
    },
    {
      key: 'fuel',
      label: 'Fuel batch reactivity',
      tech: 'fresh-core excess reactivity',
      note: 'Enrichment assay of the delivered plates. Criticality sits at a slightly different rod position than the manual says',
      min: 0.975, max: 1.0,
      describe: (m) => ({ design: '4000 pcm', actual: `${Math.round(4000 * m)} pcm` }),
    },
    {
      key: 'turbine',
      label: 'Heat exchanger effectiveness',
      tech: 'pool-to-secondary heat transfer',
      note: 'Fouling factor as commissioned (no turbine: nothing here makes electricity)',
      min: 0.99, max: 1.01,
      describe: (m) => ({ design: '100.0%', actual: `${(m * 100).toFixed(1)}%` }),
    },
  ],
  fission: [
    {
      key: 'pumps',
      label: 'Coolant pump capacity',
      tech: 'RCS flow vs nameplate',
      note: 'Impeller tolerance and loop hydraulic losses',
      min: 0.97, max: 1.01,
      describe: (m) => ({ design: '100.0%', actual: `${(m * 100).toFixed(1)}%` }),
    },
    {
      key: 'fuel',
      label: 'Fuel batch reactivity',
      tech: 'fresh-core excess reactivity',
      note: 'Enrichment assay of the delivered batch. Criticality will sit at a slightly different rod position than the manual says',
      min: 0.975, max: 1.0,
      describe: (m) => ({ design: '6000 pcm', actual: `${Math.round(6000 * m)} pcm` }),
    },
    {
      key: 'turbine',
      label: 'Steam cycle efficiency',
      tech: 'gross thermal-to-electric conversion',
      note: 'Turbine and condenser performance as commissioned',
      min: 0.985, max: 1.015,
      describe: (m) => ({
        design: '33.0%',
        actual: `${(33 * m).toFixed(1)}%`,
      }),
    },
  ],
};

/**
 * Today's date in UTC, used as the daily-plant seed.
 *
 * UTC rather than local time so that everyone racing the same daily plant is
 * genuinely racing the same plant, whatever timezone they are in.
 */
export function dailySeedKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic PRNG from a string seed: FNV-1a to mix the string down to 32
 * bits, then mulberry32 to expand it. Same seed always yields the same plant.
 */
export function seededRng(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return function next() {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample this campaign's as-built plant. Mutates sim.asBuilt in place. */
export function applyManufacturingTolerances(sim, mode, rng = Math.random) {
  const specs = TOLERANCE_SPECS[mode] ?? [];
  const asBuilt = {};
  for (const s of specs) asBuilt[s.key] = uniform(rng, s.min, s.max);
  sim.asBuilt = asBuilt;
  return asBuilt;
}

/** Worst-case as-built plant (all multipliers at their minimum). For tests. */
export function worstCaseAsBuilt(mode) {
  const specs = TOLERANCE_SPECS[mode] ?? [];
  const asBuilt = {};
  for (const s of specs) asBuilt[s.key] = s.min;
  return asBuilt;
}
