// One formatter per physical quantity, and one rule for how precise each is.
//
// WHY THIS EXISTS
// There were 151 raw `.toFixed(n)` calls across the components, each picking its
// own precision. The same quantity read `104.73 MW` in one panel and `105 MW`
// in another, and a temperature and a coolant flow got the same decimal
// treatment despite one mattering to a tenth and the other not at all. That is
// not a style problem: excess digits are visual noise that competes with the
// two or three numbers a player actually steers by.
//
// THE RULE
// Show the smallest precision at which a gameplay-relevant change is visible.
// If a digit can move without changing any decision, it should not be there.
//
//   Q            2dp   the whole game turns on 1.00 vs 0.99 at breakeven
//   beta/max     2dp   a ratio hovering near its limit; tenths are too coarse
//   tau_E        2dp   moves slowly, small changes are the signal
//   density      2dp   the slider steps in 0.05
//   T (keV)      1dp   Mission 2 gates on 8.6 keV
//   T (million)  0dp   nobody plays differently at 228 vs 228.4 million degrees
//   power        0dp above 10 MW; a megawatt either way changes nothing
//   percent      0dp   structural health, capacity, fractions of a limit
//   degrees C    0dp   divertor and coolant temperatures
//
// Anything not listed here does not have an agreed rule yet. Add it here rather
// than reaching for toFixed in a component: that is how the drift started.

import { fmtPower, powerParts, fmtSci, fmtMoney } from './format.js';

export { fmtPower, powerParts, fmtSci, fmtMoney };

/**
 * The separator between a number and its unit. A no-break space, so `105 MW`
 * can never wrap onto two lines with the unit orphaned.
 *
 * Exported deliberately. The first version used a THIN SPACE (U+2009), which
 * looks identical to a normal space and silently broke every string comparison
 * in the check script: "got 8.6 keV, want 8.6 keV". Anything asserting against
 * these strings must use this constant rather than typing a space and hoping.
 */
export const UNIT_SEP = '\u00A0';
const NB = UNIT_SEP;

const fixed = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : '--');

/* ---- dimensionless ratios: precision genuinely matters ---- */

/** Energy gain. 2dp, because breakeven is the entire mid-game. */
export const fmtQ = (q) => fixed(q, 2);

/** Any ratio against its own limit (beta/max, greenwald fraction). */
export const fmtRatio = (r) => fixed(r, 2);

/* ---- plasma state ---- */

/** Ion temperature in keV. 1dp: Mission 2 gates on 8.6. */
export const fmtKeV = (kev) => `${fixed(kev, 1)}${NB}keV`;

/** The same temperature for people who do not think in keV. 0dp. */
export const fmtMillionC = (kev) => `${fixed(kev * 11.6, 0)}${NB}million${NB}°C`;

/** Energy confinement time. 2dp: it moves slowly and slowly is the point. */
export const fmtSeconds = (s) => `${fixed(s, 2)}${NB}s`;

/** Fuel density in units of 1e20 m^-3, matching the control's own steps. */
export const fmtDensity = (n20) => `${fixed(n20, 2)}${NB}×10²⁰${NB}m⁻³`;

/* ---- engineering ---- */

/** Structural health, capacity factor, fraction of a limit. Always whole. */
export const fmtPercent = (frac01, alreadyPercent = false) =>
  `${fixed(alreadyPercent ? frac01 : frac01 * 100, 0)}%`;

/** Divertor, coolant, fuel. Whole degrees; tenths here are meaningless. */
export const fmtCelsius = (c) => `${fixed(c, 0)}${NB}°C`;

/** Reactivity, in pcm. Whole numbers: it is already a fine-grained unit. */
export const fmtPcm = (pcm) => `${fixed(pcm, 0)}${NB}pcm`;

/**
 * Net power to the grid. Always carries its sign, because the sign IS the
 * information: a plant that consumes 40 MW and one that exports 40 MW are
 * opposite outcomes and should never look similar at a glance.
 */
export function fmtNet(mw) {
  if (!Number.isFinite(mw)) return '--';
  const s = fmtPower(Math.abs(mw));
  return `${mw < 0 ? '−' : '+'}${s}`;
}
