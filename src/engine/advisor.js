// Rule-based Chief Engineer advisor (spec §9). Triggers live in
// src/data/advisor_triggers.json as structured conditions. No eval().

const OPS = {
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
};

function resolveValue(v, ctx) {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && v.metric) {
    return (ctx[v.metric] ?? 0) * (v.times ?? 1);
  }
  return 0;
}

function conditionMet(cond, ctx) {
  const left = ctx[cond.metric];
  if (left === undefined) return false;
  const right = resolveValue(cond.value, ctx);
  return OPS[cond.op]?.(left, right) ?? false;
}

/** Build the flat metric context the triggers evaluate against. */
export function buildAdvisorContext(sim, econ) {
  const { physics: p, structure: st, fuel, controls: c } = sim;
  return {
    T: p.T, Q: p.Q, tauE: p.tauE, pFusionMW: p.pFusionMW,
    netElecMW: p.netElecMW, grossElecMW: p.grossElecMW, recircMW: p.recircMW,
    greenwaldFrac: p.greenwaldFrac, beta: p.beta, betaLimit: p.betaLimit,
    divertorTempC: p.divertorTempC, divertorLimitC: p.divertorLimitC,
    B: c.B, magnetSafeB: p.magnetSafeB, heat: c.heat, density: c.density,
    tritiumG: fuel.tritium, funds: econ.funds, beamCoupling: p.beamCoupling ?? 1,
    firstWall: st.firstWall, divertorHealth: st.divertor, magnetsHealth: st.magnets,
    integrity: st.integrity,
    plasmaOn: p.plasmaOn ? 1 : 0, ignition: p.ignition ? 1 : 0,
    tripleProduct: p.tripleProduct, tbr: p.tbr,
  };
}

/**
 * Evaluate all triggers. `memory` is a mutable map of triggerId -> lastFiredTick
 * kept by the store. Returns the triggers that fire this tick.
 */
export function evaluateTriggers(triggers, ctx, memory, nowTick) {
  const fired = [];
  for (const t of triggers) {
    const last = memory[t.id];
    if (t.once && last !== undefined) continue;
    if (last !== undefined && nowTick - last < (t.cooldownTicks ?? 900)) continue;
    const conds = Array.isArray(t.conditions) ? t.conditions : [t.conditions];
    if (conds.every((cond) => conditionMet(cond, ctx))) {
      memory[t.id] = nowTick;
      fired.push(t);
    }
  }
  return fired;
}
