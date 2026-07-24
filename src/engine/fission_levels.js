// Fission campaign: four missions. All controls available from the start, // this is the "professional posting" for operators who finished fusion school.
import { LEVEL_SUSTAIN_TICKS } from './constants.js';

export const FISSION_LEVELS = [
  {
    id: 1,
    name: 'Criticality',
    objective: 'Hold the reactor critical at low power (10–600 MW)',
    hint: 'Heat the plant first. Cold rods will not withdraw.',
    why: 'A critical reactor is a balanced one. Every generation of neutrons exactly replaces itself.',
    brief: 'Heaters ON, pumps at 100%: pump friction and the heaters warm the primary. The rod interlock releases at 280 °C. Then set the rod target to ~64%.',
    terms: [
      { term: 'hot standby', def: 'primary at operating temperature and pressure, ready for criticality.' },
      { term: 'criticality', def: 'the chain reaction exactly sustains itself.' },
      { term: 'reactivity (pcm)', def: 'how far from balance you are. 0 = steady.' },
      { term: 'control rods', def: 'neutron absorbers. In = slower, out = faster. Locked in while the plant is cold.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => physics.P >= 10 && physics.P <= 600,
    cutscene: 'The chain reaction sustains itself for the first time.',
  },
  {
    id: 2,
    name: 'Full Power',
    objective: 'Reach 3,000 MW thermal',
    hint: 'Rods out further. The fuel’s own heat will push back.',
    why: 'Doppler feedback makes the core self-regulating: hotter fuel absorbs more neutrons.',
    brief: 'Withdraw in steps: 50%, 38%, then ~34%. Big steps trip the overpower protection. If your as-built fuel batch runs weak, trim a point or two further.',
    terms: [
      { term: 'Doppler feedback', def: 'hot fuel dampens the reaction automatically.' },
      { term: 'decay heat', def: 'fuel keeps making ~7% heat after shutdown. Never stop the pumps hot.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => physics.P >= 3000,
    cutscene: 'Three point four gigawatts of fission heat, held steady by physics itself.',
  },
  {
    id: 3,
    name: 'To the Grid',
    objective: 'Send 900+ MW net to the grid',
    hint: 'Steam turns turbines. The breaker sells it. SYNC the generator.',
    why: 'One PWR at full power runs a city around the clock, wind or shine.',
    brief: 'Hold full power, then close the generator breaker (SYNC, in Plant Operations). Nothing sells until it is closed. Avoid maneuvers: thermal cycles fatigue the steam generators.',
    terms: [
      { term: 'generator sync', def: 'closing the breaker that ties your turbine to the grid. Below ~8% power the reverse-power relay opens it again.' },
      { term: 'xenon', def: 'a neutron-eating byproduct. It builds after power drops and can lock you out for hours.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => physics.netElecMW >= 900,
    cutscene: 'Nine hundred megawatts, day and night. This is baseload.',
  },
  {
    id: 4,
    name: 'Fuel Cycle',
    objective: 'Burn 30% of the core with all components above 50%',
    hint: 'Endurance run. Order replacement fuel EARLY; it ships slowly.',
    why: 'Real plants live or die on capacity factor. The fraction of the year they actually run.',
    brief: 'Run at power. Order a reload batch from the Fuel Cycle panel well before the core dies: fabrication takes hours, and the reload outage takes two more.',
    terms: [
      { term: 'burnup', def: 'how much fuel you’ve consumed. Old cores can’t stay critical.' },
      { term: 'xenon pit', def: 'the hours after shutdown when xenon makes restart impossible.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics, structure }) =>
      physics.burnup >= 0.3 && structure.cladding > 50 && structure.vessel > 50 && structure.steamGen > 50,
    cutscene: 'A full fuel campaign, run clean. You are a nuclear operator now.',
  },
];

// Research reactor (career rung 1): the whole game's on-ramp. A 10 MW pool
// reactor with forgiving margins. Teaches criticality, feedback, and shutdown
// discipline before anything can really hurt.
export const RESEARCH_LEVELS = [
  {
    id: 1,
    name: 'First Criticality',
    objective: 'Bring the reactor critical and hold it between 0.1 and 5 MW',
    hint: 'Withdraw rods slowly. Watch the reactivity balance approach zero.',
    why: 'Critical does not mean dangerous. It means balanced: every neutron generation exactly replaces itself.',
    brief: 'Set the rod target to ~43% inserted and wait for the drive. Power climbs on a stable period, then fuel warmth settles it. If it stays dark, ease the rods out one more point.',
    terms: [
      { term: 'criticality', def: 'the chain reaction exactly sustains itself.' },
      { term: 'reactivity (pcm)', def: 'how far from balance you are. 0 = steady power.' },
      { term: 'neutron source', def: 'a starter emitter so the core is never truly dark. Watch it in the Physics view.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => physics.P >= 0.1 && physics.P <= 5,
    cutscene: 'Your first chain reaction, held in perfect balance. Every operator remembers this one.',
  },
  {
    id: 2,
    name: 'Licensed Power',
    objective: 'Reach full licensed power: 9 to 10.5 MW',
    hint: 'One rod point at a time. The overpower trip sits at 11.8 MW.',
    why: 'The license is a promise to the regulator: this much power, never more.',
    brief: 'Withdraw ONE point at a time toward ~40% inserted, letting power settle between steps. Big steps overshoot into the trip. Small core, fast physics.',
    terms: [
      { term: 'Doppler feedback', def: 'hot fuel absorbs more neutrons, damping the reaction automatically.' },
      { term: 'overpower trip', def: 'the protection system scrams at 118% of license. It is not negotiable.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => physics.P >= 9 && physics.P <= 10.5,
    cutscene: 'Ten megawatts, steady. The pool glows Cherenkov blue above the core.',
  },
  {
    id: 3,
    name: 'Shutdown Drill',
    objective: 'SCRAM from power, then bring the reactor back critical (0.5 to 5 MW)',
    hint: 'Press SCRAM, watch decay heat, then withdraw the rods again.',
    why: 'Shutting down is easy. Understanding what a shutdown core still does is the real qualification.',
    brief: 'SCRAM, watch the power fall to decay heat, note the xenon building, then withdraw rods to ~43% to restart.',
    terms: [
      { term: 'decay heat', def: 'fission products keep making heat after shutdown. Pools soak it up; big plants must pump.' },
      { term: 'xenon', def: 'a neutron-eating byproduct that builds after power drops. Small here; a lockout at big plants.' },
    ],
    unlocks: [],
    unlockText: '',
    sustainTicks: LEVEL_SUSTAIN_TICKS,
    check: ({ physics }) => (physics.tripCount ?? 0) >= 1 && physics.critical && physics.P >= 0.5 && physics.P <= 5,
    cutscene: 'Down and back up, by the book. You are a qualified operator now. The commercial fleet is hiring.',
  },
];

/** Level set for a fission plant. The research pool has its own syllabus. */
export function fissionLevelsFor(plantKey = 'pwr') {
  return plantKey === 'research' ? RESEARCH_LEVELS : FISSION_LEVELS;
}

export function getFissionLevel(id, plantKey = 'pwr') {
  const levels = fissionLevelsFor(plantKey);
  return levels.find((l) => l.id === id) ?? levels[levels.length - 1];
}
