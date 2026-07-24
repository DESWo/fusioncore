// Career mode: the game as an engineering career. Pure module, runs headless.
// The ladder wraps the existing campaigns (rungs 2 and 4) without forking
// their code; unbuilt rungs stay visible so the arc is real from day one.
// Design doc: docs/CAREER_MODE.md.
import { FISSION_PLANTS } from './fission.js';

export const CAREER_POSTINGS = [
  {
    id: 'research',
    rung: 1,
    title: 'Trainee Operator',
    org: 'University research reactor, 10 MW pool type',
    tagline: 'Criticality, feedback, and shutdown discipline with forgiving margins. Where every operator starts.',
    mode: 'fission',
    plant: 'research',
    playable: true,
    boss: { name: 'Prof. E. Maruyama', role: 'Reactor Supervisor' },
    caseFiles: ['sl1', 'tokaimura'],
    mandate: [
      'Qualify as an operator: first criticality, licensed power, and a clean shutdown drill.',
      'This machine forgives. The habits you build here are for the machines that do not.',
      'Use the Physics view. Nowhere else can you watch a chain reaction balance itself, one neutron generation at a time.',
    ],
    roleLine: 'You follow orders and learn why they exist.',
    responsibilities: {
      gained: [
        'Execute the supervisor’s directives, by the book, as they arrive',
        'Keep the operating log: it is your qualification record',
      ],
      shed: [],
    },
  },
  {
    id: 'fission',
    rung: 2,
    title: 'Reactor Engineer',
    org: 'Commercial pressurized-water reactor, 3.4 GW thermal',
    tagline: 'Rods, xenon, decay heat, and a fatigue budget that never forgets.',
    mode: 'fission',
    playable: true,
    boss: { name: 'R. Vance', role: 'Plant Manager' },
    caseFiles: ['tmi', 'chernobyl', 'fukushima'],
    mandate: [
      'Take the core from first criticality through a full fuel cycle.',
      'The plant manager reads two numbers before any others: capacity factor and the fatigue budget. Trips are forever.',
      'Decay heat does not negotiate. Pumps stay on after every shutdown.',
    ],
    roleLine: 'The machine is yours now. The targets are not.',
    responsibilities: {
      gained: [
        'Dispatch obligations: the grid orders power and you deliver it on their clock',
        'The maintenance and fuel budget for the whole plant, including reload planning',
        'Heatup, criticality, and grid sync: the full plant lifecycle, start to finish',
      ],
      shed: [
        'Step-by-step supervision: nobody walks you through it anymore',
      ],
    },
  },
  {
    id: 'smr',
    rung: 3,
    title: 'Lead Engineer, SMR startup',
    org: 'Integral PWR, ~300 MW',
    tagline: 'Passive decay-heat removal, investor money, tighter margins. In development.',
    status: 'future',
  },
  {
    id: 'fusion',
    rung: 4,
    title: 'Senior Engineer, Fusion Program',
    org: 'Compact high-field tokamak, ARC class',
    tagline: 'From first plasma to selling power cheaper than gas.',
    mode: 'fusion',
    playable: true,
    boss: { name: 'Dr. I. Osei', role: 'Program Director' },
    caseFiles: ['sl1', 'windscale', 'tokaimura'],
    mandate: [
      'Take the machine from first plasma to commercial power. Eight missions, one machine.',
      'Every upgrade on the R&D tree buys a new problem. Read the cons before you spend.',
      'Disruptions and quenches are capital events. The program director reads the repair ledger first.',
    ],
    mandateNote: 'None of the recommended case files involve a fusion machine. The lessons transfer anyway: stored energy, single points of failure, and procedures written in blood.',
    roleLine: 'You decide. Others operate.',
    responsibilities: {
      gained: [
        'Program goals from the board: the path to them is yours to choose',
        'An operations crew: you write their operating envelope and own their mistakes',
        'R&D strategy and every tradeoff on the tree',
      ],
      shed: [
        'Hands-on-every-slider operation: delegation is the job now',
        'Being told which number matters: you decide what the program optimizes',
      ],
    },
  },
  {
    id: 'frc',
    rung: 5,
    title: 'Principal Engineer, pulsed-fusion startup',
    org: 'Field-reversed configuration with direct energy recovery',
    tagline: 'Pulse economics and a helium-3 supply problem. In development.',
    status: 'future',
  },
  {
    id: 'space',
    rung: 6,
    title: 'Surface Power Engineer',
    org: 'Lunar fission surface power, Kilopower class',
    tagline: 'Radiators instead of condensers, mass budgets instead of dollars. In development.',
    status: 'future',
  },
  {
    id: 'gen4',
    rung: 7,
    title: 'Chief Engineer, Generation IV',
    org: 'Sodium-cooled fast reactor',
    tagline: 'The final exam recreates EBR-II’s 1986 passive safety test. In development.',
    status: 'future',
  },
];

export const CAREER_EPILOGUE =
  'Two machines, one log. Your career file now spans a full fission fuel cycle '
  + 'and a fusion program from first plasma to commercial power. The next postings '
  + 'are in development: the SMR startup, pulsed fusion, lunar surface power, and '
  + 'Generation IV. Your notebook carries forward when they open.';

export function getPosting(id) {
  return CAREER_POSTINGS.find((p) => p.id === id);
}

export function playablePostings() {
  return CAREER_POSTINGS.filter((p) => p.playable);
}

export function firstPosting() {
  return playablePostings()[0];
}

/** The next playable rung after the given posting, or null at the top. */
export function nextPosting(currentId) {
  const seq = playablePostings();
  const i = seq.findIndex((p) => p.id === currentId);
  return i >= 0 && i + 1 < seq.length ? seq[i + 1] : null;
}

const fmtB = (v) => {
  const sign = v < 0 ? '−' : '+';
  const abs = Math.abs(v);
  if (abs < 1e6) return 'about even';
  return abs >= 1e9 ? `${sign}$${(abs / 1e9).toFixed(2)}B` : `${sign}$${(abs / 1e6).toFixed(0)}M`;
};

const GRADE_SUMMARY = {
  A: 'An exemplary posting. I would staff any plant in the fleet with you.',
  B: 'A strong posting. The rough edges are the kind experience files down.',
  C: 'A developing posting. The physics forgave more than a board of directors would.',
  D: 'A rough posting. The lessons in this file were bought at full price. Read them twice.',
};

/**
 * Generate a performance review from what actually happened on the posting.
 * Pure and deterministic: same run, same review. Grades never gate progress;
 * they go in the career log and nowhere else (design doc, non-goals).
 */
export function buildPerformanceReview(mode, { sim, econ, stats, difficulty, duties }) {
  const p = sim.physics;
  const plant = mode === 'fission'
    ? (FISSION_PLANTS[sim.plantKey ?? 'pwr'] ?? FISSION_PLANTS.pwr)
    : null;
  const startFunds = (difficulty?.funds ?? 10e9) * (plant?.fundsScale ?? 1);
  const dutyLog = duties?.log ?? [];
  const dutiesDone = dutyLog.filter((d) => d.result === 'done').length;
  const dutiesMissed = dutyLog.filter((d) => d.result === 'missed').length;
  const fundsDelta = econ.funds - startFunds;
  const soldPower = (econ.mwhCum ?? 0) > 1;
  const minHealth = Math.min(...Object.entries(sim.structure)
    .filter(([k]) => k !== 'integrity').map(([, v]) => v));

  let demerits = 0;
  demerits += (stats.repairs ?? 0) * 18;
  demerits += Math.min(dutiesMissed * 8, 24); // the org remembers missed orders
  if (fundsDelta <= -1e6) demerits += 8;
  if (econ.funds < startFunds * 0.6) demerits += 8;
  if (soldPower && econ.lcoe > 150) demerits += 8;
  if (minHealth < 30) demerits += 6;

  const strengths = [];
  const improvements = [];
  const metrics = [];

  if (mode === 'fission') {
    const trips = p.tripCount ?? 0;
    const capacity = (p.avgP ?? 0) / plant.nominalMW;
    // The shutdown drill requires a deliberate trip: trainees get one free
    const freeTrips = plant.key === 'research' ? 3 : 2;
    demerits += Math.min(Math.max(trips - freeTrips, 0) * 5, 25);

    metrics.push(
      ['Reactor trips', `${trips}`],
      ['Full rebuilds', `${stats.repairs ?? 0}`],
      ['Capacity factor', `${(capacity * 100).toFixed(0)}%`],
    );
    if (plant.gridConnected) {
      metrics.push(
        ['Core burnup', `${((p.burnup ?? 0) * 100).toFixed(0)}%`],
        ['Peak net output', `${(stats.peakNetMW ?? 0).toFixed(0)} MW`],
      );
    } else {
      metrics.push(['Peak thermal power', `${Math.max(p.avgP ?? 0, p.P ?? 0).toFixed(1)} MW`]);
    }
    metrics.push(['Funds vs opening', fmtB(fundsDelta)]);
    if (trips <= freeTrips) {
      strengths.push(plant.key === 'research'
        ? 'Every trip on the record was a drill, not a surprise. That is what qualification looks like.'
        : trips === 0
          ? 'Zero reactor trips. The fatigue budget never noticed you.'
          : `Only ${trips} trip${trips === 1 ? '' : 's'} logged. The fatigue budget barely noticed you.`);
    } else {
      improvements.push(`${trips} trips, and each one consumed a fatigue cycle the plant never gets back. Slower maneuvers, fewer surprises.`);
    }
    if (plant.gridConnected) {
      if (capacity >= 0.75) {
        strengths.push(`Capacity factor ${(capacity * 100).toFixed(0)}%. The grid could set its watch by this plant.`);
      } else if (capacity < 0.5) {
        improvements.push('Capacity factor under 50%. Baseload plants earn by being boring.');
      }
    }
  } else {
    const disruptions = stats.disruptions ?? 0;
    const quenches = stats.quenches ?? 0;
    demerits += Math.min(quenches * 10, 30);
    demerits += Math.min(Math.max(disruptions - 3, 0) * 3, 21);

    metrics.push(
      ['Peak gain Q', `${(stats.maxQ ?? 0).toFixed(1)}`],
      ['Disruptions', `${disruptions}`],
      ['Magnet quenches', `${quenches}`],
      ['Full rebuilds', `${stats.repairs ?? 0}`],
      ['Peak net output', `${(stats.peakNetMW ?? 0).toFixed(0)} MW`],
      ['Funds vs opening', fmtB(fundsDelta)],
    );
    if ((stats.maxQ ?? 0) >= 10) {
      strengths.push(`Peak gain Q = ${stats.maxQ.toFixed(1)}. Deep into burning-plasma territory.`);
    }
    if (quenches === 0) {
      strengths.push('Zero magnet quenches. The coils never saw the wrong side of their rating.');
    } else {
      improvements.push(`${quenches} magnet quench${quenches === 1 ? '' : 'es'}. Every one is a coil gambled against its rating.`);
    }
    if (disruptions <= 3) {
      strengths.push(`${disruptions} disruption${disruptions === 1 ? '' : 's'} across the whole program. Careful limit-keeping shows.`);
    } else {
      improvements.push(`${disruptions} disruptions. The limits give a countdown for a reason; use the whole window.`);
    }
    if (soldPower && econ.lcoe !== null && econ.lcoe <= 100) {
      strengths.push(`LCOE $${econ.lcoe.toFixed(0)}/MWh. Cheaper than gas, which was the whole point.`);
    }
  }

  if (soldPower && econ.lcoe !== null) {
    metrics.push(['LCOE', `$${econ.lcoe.toFixed(0)}/MWh`]);
  }
  if (dutyLog.length > 0) {
    metrics.push(['Directives', `${dutiesDone} of ${dutyLog.length} completed`]);
    if (dutiesMissed === 0) {
      strengths.push(`Every directive completed: ${dutiesDone} for ${dutiesDone}. The organization noticed.`);
    } else {
      const missed = dutyLog.filter((d) => d.result === 'missed');
      improvements.push(`${dutiesMissed} directive${dutiesMissed === 1 ? '' : 's'} missed (${missed.map((m) => m.from).join(', ')}). Orders are commitments someone else planned around.`);
    }
  }
  if ((stats.repairs ?? 0) === 0) {
    strengths.push('Zero capital rebuilds. Nothing on your watch wore to failure.');
  } else {
    improvements.push(`${stats.repairs} full rebuild${stats.repairs === 1 ? '' : 's'}. In the real fleet each one is a multi-year outage.`);
  }
  if (fundsDelta >= 1e6) {
    strengths.push(`Returned the plant ${fmtB(fundsDelta)} richer than you found it.`);
  } else if (fundsDelta <= -1e6) {
    improvements.push('The posting closed in the red. Watch the maintenance ledger, not just the core.');
  }
  if (strengths.length === 0) {
    strengths.push('Completed every mission objective the posting asked of you.');
  }
  if (improvements.length === 0) {
    improvements.push('Keep writing the reason down before you touch the control. The notebook is the engineer.');
  }

  const score = Math.max(100 - demerits, 0);
  const grade = score >= 88 ? 'A' : score >= 72 ? 'B' : score >= 55 ? 'C' : 'D';
  const gradeWord = { A: 'Outstanding', B: 'Strong', C: 'Developing', D: 'Rough' }[grade];

  return { score, grade, gradeWord, summary: GRADE_SUMMARY[grade], metrics, strengths, improvements };
}
