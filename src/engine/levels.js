// The 8-level progression matrix (spec §8). Each level's `check` runs every
// tick; the objective completes after `sustainTicks` consecutive passes.
// Copy rules: plain English first; each technical term is formally introduced
// via `terms` in the mission briefing of the level where it first matters,
// and only used freely after that.
import { LEVEL_SUSTAIN_TICKS } from './constants.js';

export const LEVELS = [
  {
    id: 1,
    name: 'First Light',
    objective: 'Hold a stable plasma for 10 seconds',
    hint: 'Field up, then heating.',
    why: 'No plasma, no fusion.',
    brief: 'Field to 6 T, heating to 15 MW.',
    terms: [],
    unlocks: ['heat', 'gauges'],
    unlockText: 'Heating controls · core temperature gauge',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    target: { label: 'Ti', read: (s) => s.physics.T, goal: 1.5, unit: 'keV', dp: 1 },
    check: ({ physics }) => physics.plasmaOn && physics.T >= 1.5,
    cutscene: 'For the first time, a star burns steadily inside your machine.',
  },
  {
    id: 2,
    name: 'Heating Up',
    objective: 'Reach 100 million °C (8.6 keV)',
    hint: 'Thin fuel heats faster.',
    why: 'Fusion needs ~10× the Sun’s core temperature.',
    brief: 'Push heating past ~20 MW. Keep density low.',
    terms: [
      { term: 'keV', def: '1 keV ≈ 11.6 million °C.' },
      { term: 'density limit', def: 'too much fuel collapses the plasma.' },
    ],
    unlocks: ['density', 'vacuum'],
    unlockText: 'Fuel density slider · density diagnostics',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    target: { label: 'Ti', read: (s) => s.physics.T, goal: 8.6, unit: 'keV', dp: 1 },
    check: ({ physics }) => physics.T >= 8.6,
    cutscene: 'Ten times hotter than the core of the Sun.',
  },
  {
    id: 3,
    name: 'First Fusion',
    objective: 'Get neutrons on the detector',
    hint: 'Fusion needs collisions. Add fuel.',
    why: 'Neutrons are the proof of fusion.',
    brief: 'Density to ~0.5, field ~8 T, heating ~40 MW.',
    terms: [
      { term: 'neutron', def: 'the particle each fusion reaction shoots out.' },
      { term: 'Greenwald limit', def: 'the density limit’s proper name.' },
    ],
    unlocks: ['neutrons', 'fuelmix'],
    unlockText: 'Neutron detector panel · fuel mix selector',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    // High enough that a hot-but-thin plasma (min density) does not pass:
    // the level's lesson is that fusion needs collisions, not just heat.
    target: { label: 'neutrons', read: (s) => s.physics.neutronRate, goal: 2e18, unit: 'n/s', sci: true },
    check: ({ physics }) => physics.neutronRate > 2e18,
    cutscene: 'Deuterium and tritium are fusing in your core.',
  },
  {
    id: 4,
    name: 'Breakeven',
    objective: 'Beat breakeven: Q above 1.0',
    hint: 'Field, density, heating. All at once.',
    why: 'More power out than in. Never done in the 1900s.',
    brief: 'Field to 11.5 T (the rating), density ~1.0, heating ~42 MW.',
    terms: [
      { term: 'Q factor', def: 'fusion power out ÷ power in.' },
      { term: 'confinement time (τE)', def: 'how long heat stays trapped.' },
      { term: 'divertor', def: 'the exhaust plates. The new cooling slider protects them.' },
    ],
    unlocks: ['fulldash'],
    unlockText: 'Full dashboard: Q readout, Lawson plot, structure health, divertor cooling',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    target: { label: 'Q', read: (s) => s.physics.Q, goal: 1.0, unit: '', dp: 2 },
    check: ({ physics }) => physics.Q > 1.0,
    cutscene: 'Q > 1. Headlines worldwide carry one word: BREAKEVEN.',
  },
  {
    id: 5,
    name: 'Endurance',
    objective: 'Run 1 hour with all parts above 50% health',
    hint: 'Cool the divertor. Stay off the limits.',
    why: 'A plant that breaks itself earns nothing.',
    brief: 'Cooling ~40 MW, calm burn. H-Mode research helps.',
    terms: [
      { term: 'first wall', def: 'plasma-facing armor; neutrons wear it out.' },
      { term: 'tritium breeding', def: 'make fuel from lithium.' },
    ],
    unlocks: ['tritium', 'blanket'],
    unlockText: 'Tritium inventory management · breeding blanket systems',
    sustainTicks: 600, // 1 sim-hour
    target: { label: 'worst part', read: (s) => Math.min(s.structure.firstWall, s.structure.divertor, s.structure.magnets), goal: 50, unit: '%', dp: 0 },
    check: ({ physics, structure }) =>
      physics.plasmaOn && structure.firstWall > 50 && structure.divertor > 50 && structure.magnets > 50,
    cutscene: 'One full hour of sustained burn. This is an operating regime.',
  },
  {
    id: 6,
    name: 'First Customers',
    objective: 'Send net power to the grid',
    hint: 'Your own plant eats power too.',
    why: 'The grid pays only for what’s left over.',
    brief: 'Buy REBCO magnets. Field ~16 T, density ~2.0.',
    terms: [
      { term: 'recirculating power', def: 'what your own plant consumes.' },
      { term: 'LCOE', def: 'total cost ÷ total energy sold.' },
    ],
    unlocks: ['finance'],
    unlockText: 'Financial ledger · live LCOE tracking',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    target: { label: 'net', read: (s) => s.physics.netElecMW, goal: 0, unit: 'MW', dp: 0 },
    check: ({ physics }) => physics.netElecMW > 0,
    cutscene: 'Somewhere, a kettle boils on fusion electrons.',
  },
  {
    id: 7,
    name: 'City Scale',
    objective: 'Power 1,000,000 homes with net fusion electricity',
    hint: 'HTS magnets, H-mode and plasma shaping. Then hold it.',
    why: 'A gigawatt is a real city.',
    // Measured, not guessed: shaping is what takes this from 0.52M homes to
    // 1.35M, and the tungsten divertor is what makes running there legal
    // (limit 1200 °C -> 2200 °C). The breeding blanket is not required for the
    // power target, and the stellarator does not unlock until level 8, so the
    // old "you need the full tech tree" was advice the player could not take.
    brief: 'HTS + H-mode + shaping + tungsten divertor. Field ~19 T, density ~3.0, max cooling.',
    terms: [
      { term: 'REBCO', def: 'superconducting tape enabling 20 T magnets.' },
    ],
    unlocks: ['advwarn'],
    unlockText: 'Advanced diagnostic warning overlays',
    // A city is not powered by a five-second spike. At the old 50 ticks you
    // could slam every slider to maximum, clip a gigawatt for five sim-seconds
    // while the machine tore itself apart, and be rewarded for it. Holding for
    // 30 s makes the reckless route pay for itself: over the divertor limit
    // erosion runs at 1%/s, so a burn like that spends roughly a third of the
    // divertor to pass, and drops below the health floor if it was already worn.
    sustainTicks: 300,
    target: { label: 'homes', read: (s) => s.physics.homesPowered, goal: 1_000_000, unit: '', dp: 0 },
    // The health floor is level 5's, deliberately: "a plant that breaks itself
    // earns nothing" is a lesson this level should not quietly repeal.
    check: ({ physics, structure }) =>
      physics.homesPowered >= 1_000_000
      && structure.firstWall > 50 && structure.divertor > 50 && structure.magnets > 50,
    cutscene: 'A million homes draw their light from your torus.',
  },
  {
    id: 8,
    name: 'Commercial Era',
    objective: 'LCOE under $100/MWh while exporting',
    hint: 'Run big, break nothing.',
    why: 'Cheaper than gas is the industry’s finish line.',
    brief: 'Sustain exports. Avoid repairs. Boring is profitable.',
    terms: [
      { term: 'stellarator', def: 'twisted-coil core that cannot disrupt.' },
    ],
    unlocks: ['sandbox', 'stellarator'],
    unlockText: 'Full sandbox configuration · Stellarator conversion',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics, econ }) => econ.lcoe !== null && econ.lcoe <= 100 && physics.netElecMW > 0,
    cutscene: 'Utilities sign forty-year contracts. The fusion era begins.',
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[LEVELS.length - 1];
}

/** Union of feature keys unlocked at or below the given level. */
export function unlockedFeatures(levelId) {
  const set = new Set();
  for (const l of LEVELS) {
    if (l.id <= levelId) l.unlocks.forEach((u) => set.add(u));
  }
  return set;
}
