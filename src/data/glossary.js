// One-line definitions for the technical vocabulary, for hover.
//
// The rule: one sentence, and it must carry WHY the player should care, not
// just what the letters stand for. "Q is the energy gain factor" tells a player
// nothing they can act on. "Fusion power out divided by heating power in; above
// 1 you are getting more than you put in" tells them what they are steering
// toward.
//
// These are deliberately NOT the deep explanation. CalcDrawer already does that
// properly, in four layers, with the live substituted numbers, and it stays the
// place you go when you want the equation. This is the glance.
//
// The terms themselves never get renamed. Beta, Greenwald, confinement time and
// TBR are what this field calls these things, and a player who learns them here
// has learned something real. Making them understandable is the job; replacing
// them with "Plasma Stability Meter" is not.

export const GLOSSARY = {
  // ---- fusion ----
  Q: 'Fusion power out ÷ heating power in. Above 1.0 is scientific breakeven.',
  'triple product':
    'Density × temperature × confinement time. All three at once, or no ignition.',
  'confinement time':
    'How long the plasma holds its heat. Longer means less heating to stay hot.',
  'beta limit':
    'Plasma pressure against magnetic pressure. Past the limit the plasma tears itself apart.',
  'Greenwald limit':
    'The density ceiling for a given field. Cross it and the plasma disrupts.',
  disruption:
    'The plasma losing confinement all at once, dumping its stored energy into the wall.',
  divertor:
    'The exhaust plates that take the heat leaving the plasma. They erode above their thermal limit.',
  'first wall':
    'The inner surface facing the plasma. Neutrons embrittle it over the machine’s life.',
  TBR:
    'Tritium breeding ratio. Above 1.0 the blanket makes more tritium than the plasma burns.',
  'shine-through':
    'Heating beam passing straight through thin plasma instead of depositing in it.',
  'H-mode':
    'A confinement regime with an edge transport barrier. Roughly 1.4× the confinement, and it brings ELMs.',
  keV: 'A temperature unit. 1 keV is about 11.6 million °C.',
  ignition:
    'The plasma heating itself from its own alpha particles, with the external heating off.',
  quench:
    'A superconducting magnet losing superconductivity and dumping its stored energy as heat.',

  // ---- fission ----
  pcm:
    'Reactivity, in hundred-thousandths. 100 pcm is a 0.1% change in the chain reaction.',
  'Doppler feedback':
    'Hot fuel absorbs more neutrons, damping the reaction by itself. It is why the core is self-regulating.',
  xenon:
    'A fission product that eats neutrons. It builds after shutdown and fights a restart.',
  burnup: 'How much of the fuel has been consumed. An old core has little reactivity in reserve.',
  'decay heat':
    'Heat the fuel keeps making after shutdown, about 7% at first. Shutdown is not cold.',
  scram: 'Emergency shutdown. Every rod drops into the core at once.',
  'k-effective':
    'Neutrons in one generation ÷ the generation before. Exactly 1.0 holds steady power.',

  // ---- economics ----
  LCOE:
    'Lifetime cost per MWh, including building the plant. The number that decides if fusion sells.',
  'recirculating power':
    'Power the plant spends running itself. It comes off the top before anything reaches the grid.',
};

/** Case-insensitive lookup, so call sites can use natural casing. */
export function defineTerm(term) {
  if (!term) return null;
  if (GLOSSARY[term]) return GLOSSARY[term];
  const key = Object.keys(GLOSSARY).find((k) => k.toLowerCase() === String(term).toLowerCase());
  return key ? GLOSSARY[key] : null;
}
