// R&D technology tree (spec §5). `apply` mutates a draft of the sim/econ state
// exactly once when the node is purchased; purchases persist in save files as
// a list of unlocked ids and are re-applied on load.
//
// Design rule: every upgrade carries a working downside. Real engineering is
// tradeoffs, and each `cons` entry is enforced by the physics or the ledger,
// not just displayed.
import {
  HMODE_DIV_PEAKING, HMODE_DIV_WEAR, W_ZEFF, HTS_QUENCH_DAMAGE_PCT,
  BLANKET_MAINT_MULT, SHAPING_DISRUPT_MULT,
} from './constants.js';

export const TECH_TREE = [
  {
    id: 'hmode',
    name: 'H-Mode Transition Control',
    cost: 800,
    minLevel: 3,
    requires: null,
    cite: 'hmode',
    desc: 'Edge barrier keeps heat in. Discovered 1982.',
    pros: [
      'Confinement ×1.4: the same heating holds a hotter plasma',
    ],
    cons: [
      'Edge bursts (ELMs) focus the exhaust: divertor runs ~15% hotter',
      'When the divertor is over its limit, ELMs erode it 50% faster',
    ],
    apply: ({ sim }) => {
      sim.physics.hFactor = 1.4;
      sim.physics.divertorPeaking = HMODE_DIV_PEAKING;
      sim.physics.divertorWearMult = HMODE_DIV_WEAR;
    },
  },
  {
    id: 'divertor2',
    name: 'Tungsten-Composite Divertor',
    cost: 1500,
    minLevel: 4,
    requires: null,
    cite: 'divertor_iter',
    desc: 'Tungsten armor on the exhaust plates.',
    pros: [
      'Survives 2200 °C instead of 1200 °C',
    ],
    cons: [
      'Tungsten atoms leak into the plasma: radiation loss up ~19% (Z_eff 1.6 → 1.9)',
    ],
    apply: ({ sim }) => {
      sim.physics.divertorLimitC = 2200;
      sim.physics.zEff = W_ZEFF;
    },
  },
  {
    id: 'hts',
    name: 'REBCO HTS Magnets',
    cost: 2000,
    minLevel: 4,
    requires: null,
    cite: 'rebco_arc',
    desc: 'High-temperature superconducting tape coils.',
    pros: [
      'Field ceiling raised to 20 T',
      'Magnet power draw −70%',
    ],
    cons: [
      'REBCO tape is a brittle ceramic: a quench now does 25% coil damage instead of 15%',
    ],
    apply: ({ sim }) => {
      sim.controls.bMax = 20.0;
      sim.physics.magnetSafeB = 19.5;
      sim.physics.magnetOhmicCoeff *= 0.3;
      sim.physics.quenchDamagePct = HTS_QUENCH_DAMAGE_PCT;
    },
  },
  {
    id: 'blanket',
    name: 'Lithium Breeding Blanket',
    cost: 2500,
    minLevel: 5,
    requires: null,
    cite: 'tbr',
    desc: 'Neutrons + lithium = fresh tritium.',
    pros: [
      'Breeds its own fuel: TBR 1.05, tritium bill nearly disappears',
    ],
    cons: [
      'Neutron-activated modules: maintenance costs +25%',
    ],
    apply: ({ sim, econ }) => {
      sim.physics.tbr = 1.05;
      econ.maintMult *= BLANKET_MAINT_MULT;
    },
  },
  {
    id: 'shaping',
    name: 'Advanced Tokamak Shaping',
    cost: 3000,
    minLevel: 5,
    requires: 'hmode',
    cite: 'ipb98',
    desc: 'Elongated, triangular plasma cross-section.',
    pros: [
      'Confinement ×1.9 total: the path to gigawatt output',
    ],
    cons: [
      'Runs closer to the stability edge: random disruptions ×1.6 more likely',
    ],
    apply: ({ sim }) => {
      sim.physics.hFactor = 1.9;
      sim.physics.disruptionProbBase *= SHAPING_DISRUPT_MULT;
    },
  },
  {
    id: 'stellarator',
    name: 'Stellarator Core Conversion',
    cost: 10000,
    minLevel: 8,
    requires: null,
    cite: 'stellarator_w7x',
    desc: 'Twisted coils hold the plasma without a driven current.',
    pros: [
      'Disruptions become physically impossible',
    ],
    cons: [
      'Coil geometry is brutally complex: all maintenance ×1.8',
    ],
    apply: ({ sim, econ }) => {
      sim.physics.isStellarator = true;
      sim.physics.disruptionProbBase = 0.0;
      econ.maintMult *= 1.8;
    },
  },
];

export function getTech(id) {
  return TECH_TREE.find((t) => t.id === id);
}

export function techAvailable(tech, unlockedIds, levelId) {
  if (unlockedIds.includes(tech.id)) return false;
  if (levelId < tech.minLevel) return false;
  if (tech.requires && !unlockedIds.includes(tech.requires)) return false;
  return true;
}

/** Re-apply all purchased tech to a fresh state (used on save-load). */
export function reapplyTech(unlockedIds, ctx) {
  for (const id of unlockedIds) {
    const t = getTech(id);
    if (t) t.apply(ctx);
  }
}
