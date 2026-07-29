// End-of-campaign grading.
//
// Every input here is a number the run already tracked, so this is a readout,
// not new simulation. The bands are set so a careful operator who finishes the
// campaign lands around B, beating them all takes deliberate restraint, and a
// plant that got there on luck and repairs still gets an honest pass.

/** Letter for a 0..100 score, matching the career-mode review scale. */
export function gradeFor(score) {
  if (score >= 92) return 'A+';
  if (score >= 84) return 'A';
  if (score >= 74) return 'B';
  if (score >= 62) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

/** Linear 0..1, clamped, where `best` scores full marks and `worst` scores none. */
const band = (v, worst, best) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return 0;
  const t = (v - worst) / (best - worst);
  return Math.max(0, Math.min(1, t));
};

/**
 * Score a finished fusion campaign out of 100.
 *
 * Weighting reflects what the campaign actually asked of the player: cheap
 * power is the stated goal, so LCOE carries the most, then the physics result
 * (Q), then how much plant they wrecked getting there.
 */
export function scoreCampaign({ stats, econ, structure, simSeconds, difficulty }) {
  const lcoe = econ?.lcoe ?? null;
  const maxQ = stats?.maxQ ?? 0;
  const disruptions = stats?.disruptions ?? 0;
  const quenches = stats?.quenches ?? 0;
  const hull = Math.min(
    structure?.firstWall ?? 100,
    structure?.divertor ?? 100,
    structure?.magnets ?? 100,
  );
  const hours = (simSeconds ?? 0) / 3600;

  // $100/MWh clears the campaign; $40 is genuinely cheaper than gas.
  const economics = band(lcoe === null ? 999 : lcoe, 160, 40);
  // Q=1 is breakeven, Q=30 is a commercial burning plasma.
  const physics = band(maxQ, 1, 30);
  // Every disruption is a wrecked pulse; a quench is worse.
  const discipline = band(disruptions + quenches * 2, 14, 0);
  // What is left of the machine you were given.
  const condition = band(hull, 40, 100);

  const parts = [
    { id: 'economics', label: 'Cost of power', weight: 35, fraction: economics,
      detail: lcoe === null ? 'never exported' : `$${Math.round(lcoe)}/MWh` },
    { id: 'physics', label: 'Peak energy gain', weight: 25, fraction: physics,
      detail: `Q ${maxQ.toFixed(1)}` },
    { id: 'discipline', label: 'Operating discipline', weight: 25, fraction: discipline,
      detail: `${disruptions} disruption${disruptions === 1 ? '' : 's'}, ${quenches} quench${quenches === 1 ? '' : 'es'}` },
    { id: 'condition', label: 'Plant condition', weight: 15, fraction: condition,
      detail: `${Math.round(hull)}% worst component` },
  ];

  const score = Math.round(parts.reduce((sum, p) => sum + p.weight * p.fraction, 0));

  return {
    score,
    grade: gradeFor(score),
    parts,
    summary: {
      lcoe, maxQ, disruptions, quenches, hull,
      hours, funds: econ?.funds ?? 0, difficulty: difficulty ?? 'operator',
    },
    // The one sentence a player actually reads.
    verdict: verdictFor(score, { lcoe, disruptions, maxQ }),
  };
}

function verdictFor(score, { lcoe, disruptions, maxQ }) {
  if (score >= 92) return 'A plant the industry would copy. Cheap, calm, and still in one piece.';
  if (score >= 84) return 'A commercial machine run by someone who knew where the limits were.';
  if (score >= 74) {
    return disruptions > 4
      ? 'It works and it sells power. It also spent a lot of time on the floor.'
      : 'Solid. The economics are there and the machine survived the learning.';
  }
  if (score >= 62) {
    return lcoe === null
      ? 'You confined a star and never sold a kilowatt-hour. The physics was the easy half.'
      : 'Power on the grid, but not yet at a price anyone would sign for.';
  }
  if (score >= 50) return 'It ran. Barely, expensively, and not for long at a time.';
  return maxQ < 1
    ? 'Never past breakeven. The plasma won this round.'
    : 'A working reactor and a ruined balance sheet.';
}
