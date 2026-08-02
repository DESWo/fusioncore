// The annunciator: hard tiles wired to plant state, never to scripted events.
// Pure module, no React imports, so scripts/annunciator_check.mjs can drive it
// headlessly the same way balance_check drives the physics.
//
// Four fusion tiles have a matching entry in sim.hazards, which the physics
// engine already maintains with its own limit logic and grace countdown. Those
// tiles read the hazard for their ALARM state instead of re-deriving a
// threshold, so the annunciator can never disagree with the engine about
// whether a limit was crossed. Only the caution band belongs to the
// annunciator. The rest have no hazard entry and carry their own thresholds.

export const STATE_CODES = {
  off: '--',
  normal: 'NM',
  caution: 'CA',
  alarm: 'AL',
};

const hazardActive = (sim, key) => (sim.hazards?.[key] ?? 0) !== 0;

/** Ratio band shared by the four limit tiles. */
function limitTile(id, legend, hazardKey, ratioOf, cautionAt) {
  return {
    id,
    legend,
    hazardKey,
    evaluate(sim) {
      if (!sim.physics.plasmaOn) return 'off';
      if (hazardActive(sim, hazardKey)) return 'alarm';
      return ratioOf(sim) >= cautionAt ? 'caution' : 'normal';
    },
  };
}

/** Descending band: more remaining is better (structural health, inventory). */
function reserveTile(id, legend, valueOf, cautionBelow, alarmBelow) {
  return {
    id,
    legend,
    hazardKey: null,
    evaluate(sim) {
      const v = valueOf(sim);
      if (v <= alarmBelow) return 'alarm';
      if (v <= cautionBelow) return 'caution';
      return 'normal';
    },
  };
}

export const FUSION_TILES = [
  // Greenwald is an UPPER density bound: a tokamak disrupts from too much
  // density, not too little. The legend says so.
  limitTile('greenwald', 'GREENWALD LIMIT', 'greenwald',
    (s) => s.physics.greenwaldFrac, 0.90),
  limitTile('beta', 'BETA LIMIT', 'beta',
    (s) => (s.physics.betaLimit > 0 ? s.physics.beta / s.physics.betaLimit : 0), 0.85),
  limitTile('divertor', 'DIVERTOR HEAT FLUX', 'divertor',
    (s) => (s.physics.divertorLimitC > 0 ? s.physics.divertorTempC / s.physics.divertorLimitC : 0), 0.85),
  limitTile('tfcoil', 'TF COIL FIELD', 'magnets',
    (s) => (s.physics.magnetSafeB > 0 ? s.controls.B / s.physics.magnetSafeB : 0), 0.92),

  // Deliberately NOT a DISRUPTION RISK tile reading physics.stability.
  // stability is 100 when clear, 5 when breached, and only moves while another
  // hazard's countdown is already running, so such a tile would light in
  // lockstep with whichever limit tile was already in alarm and tell the
  // operator nothing new. Beam shine-through is independent, physically real,
  // and already surfaced in the old dashboard as a limiting factor.
  {
    id: 'shinethrough',
    legend: 'BEAM SHINE-THROUGH',
    hazardKey: null,
    evaluate(sim) {
      if (!sim.physics.plasmaOn) return 'off';
      const k = sim.physics.beamCoupling;
      if (k < 0.5) return 'alarm';
      if (k < 0.75) return 'caution';
      return 'normal';
    },
  },

  reserveTile('firstwall', 'FIRST WALL DPA', (s) => s.structure.firstWall, 60, 30),
  reserveTile('tritium', 'TRITIUM INVENTORY', (s) => s.fuel.tritium, 5, 0.5),

  {
    id: 'netpower',
    legend: 'NET POWER NEGATIVE',
    hazardKey: null,
    evaluate(sim) {
      if (!sim.physics.plasmaOn) return 'off';
      // A net importer is a commercial condition, not a safety one. It never
      // escalates past caution.
      return sim.physics.netElecMW < 0 ? 'caution' : 'normal';
    },
  },
];

/** Fission tiles land in Plan 2. Returning the fusion set keeps callers safe. */
export function tilesFor(mode) {
  return mode === 'fission' ? [] : FUSION_TILES;
}

/** Pure: returns { [tileId]: state } and never touches the sim it is handed. */
export function evaluateTiles(mode, sim) {
  const out = {};
  for (const tile of tilesFor(mode)) out[tile.id] = tile.evaluate(sim);
  return out;
}
