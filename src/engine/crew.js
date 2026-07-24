// The operations crew: what a senior engineer actually manages. You write
// the envelope (how close to the limits they may fly) and the target; the
// crew works the sliders. They are competent, not brilliant: a sloppy
// envelope WILL be ridden right up to its edge. Pure module, runs headless.

export const CREW_DEFAULTS = {
  enabled: false,
  targetNetMW: 300,   // what you asked them to deliver
  gwMax: 0.85,        // envelope: max fraction of the density limit
  divMax: 0.8,        // envelope: max fraction of the divertor thermal limit
};

/**
 * One crew decision per tick: at most one small control nudge, safety first.
 * Returns {} when the crew is happy, or {heat|density|cooling: newValue}.
 */
export function crewControl(sim, crew) {
  const p = sim.physics;
  const c = sim.controls;
  if (!p.plasmaOn) {
    // relight procedure: gentle heat until the plasma is back
    if (c.heat < 20) return { heat: Math.min(c.heat + 0.5, 20) };
    return {};
  }

  // Envelope first. The crew never argues with the envelope.
  if (p.greenwaldFrac > crew.gwMax) {
    return { density: Math.max(c.density - 0.03, c.densityMin) };
  }
  if (p.betaLimit > 0 && p.beta / p.betaLimit > 0.9) {
    return { heat: Math.max(c.heat - 0.5, 5) };
  }
  if (p.divertorTempC > p.divertorLimitC * crew.divMax) {
    if (c.cooling < c.coolingMax) return { cooling: Math.min(c.cooling + 2, c.coolingMax) };
    return { heat: Math.max(c.heat - 0.5, 5) };
  }

  // Then the target
  const err = crew.targetNetMW - p.netElecMW;
  if (err > 25) {
    // more power: density when there is headroom, otherwise more heating
    if (p.greenwaldFrac < crew.gwMax - 0.08) {
      return { density: Math.min(c.density + 0.015, c.densityMax) };
    }
    if (c.heat < c.heatMax) return { heat: Math.min(c.heat + 0.25, c.heatMax) };
    return {};
  }
  if (err < -25) {
    return { density: Math.max(c.density - 0.01, c.densityMin) };
  }
  // on target: trim divertor cooling toward efficiency without leaving margin
  if (p.divertorTempC < p.divertorLimitC * (crew.divMax - 0.25) && c.cooling > 10) {
    return { cooling: c.cooling - 1 };
  }
  return {};
}
