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
      // The hazard is checked BEFORE the plasma gate, deliberately. physics.js
      // does not gate every violation on plasmaOn: `magnets` (B > magnetSafeB)
      // and `divertor` (divertorTempC > divertorLimitC) can be raised, run
      // their full grace countdown and do damage with the plasma down. Gating
      // the tile on plasmaOn first made the board go dark during exactly those
      // violations, which is the one thing an annunciator must never do.
      if (hazardActive(sim, hazardKey)) return 'alarm';
      // The caution band stays plasma-gated: the ratios it reads are only
      // meaningful while there is a plasma to measure.
      if (!sim.physics.plasmaOn) return 'off';
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
      // Caps at caution, and the 0.5 alarm band that used to sit below this is
      // gone. It was invented rather than taken from the engine, and it fired
      // on the game's own documented initial conditions: n20 = 0.1 gives
      // beamCoupling = 0.9 * (1 - exp(-0.1/0.4)) = 0.199, so every new
      // campaign booted with this tile already in ALARM. Poor coupling is a
      // thing to fix, not a limit you have breached. 0.75 is the engine's own
      // threshold, the one the dashboard already uses to call shine-through a
      // limiting factor on Q. Same reasoning as NET POWER NEGATIVE below.
      return sim.physics.beamCoupling < 0.75 ? 'caution' : 'normal';
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

/** Fission has no tiles yet. Returning an empty set keeps callers safe. */
export function tilesFor(mode) {
  return mode === 'fission' ? [] : FUSION_TILES;
}

/** Pure: returns { [tileId]: state } and never touches the sim it is handed. */
export function evaluateTiles(mode, sim) {
  const out = {};
  for (const tile of tilesFor(mode)) out[tile.id] = tile.evaluate(sim);
  return out;
}
