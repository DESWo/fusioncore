// FEA-style false-color mapping: load 0 -> cool blue, ~0.7 -> yellow,
// 1.0 (at design limit) -> red, beyond -> saturated red.
export function heatColor(color, load) {
  const t = Math.min(Math.max(load, 0), 1);
  color.setHSL(0.58 * (1 - t), 0.9, 0.32 + 0.16 * t);
  return color;
}

/** 0..1 pulse used to flash components with an active hazard. */
export function hazardPulse(elapsed, active) {
  return active ? (Math.sin(elapsed * 6) + 1) / 2 : 0;
}
