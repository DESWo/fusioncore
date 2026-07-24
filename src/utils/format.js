export function fmtPower(mw) {
  const abs = Math.abs(mw);
  if (abs >= 1000) return `${(mw / 1000).toFixed(2)} GW`;
  if (abs >= 10) return `${mw.toFixed(0)} MW`;
  if (abs >= 0.01) return `${mw.toFixed(2)} MW`;
  return `${(mw * 1000).toFixed(1)} kW`;
}

/**
 * The same scaling decision as fmtPower, but split so a digit-rolling display
 * can animate the number while the unit stays put. Returns the value in the
 * chosen unit plus how many decimals that unit is read to.
 */
export function powerParts(mw) {
  const abs = Math.abs(mw);
  if (abs >= 1000) return { value: mw / 1000, unit: 'GW', digits: 2 };
  if (abs >= 10) return { value: mw, unit: 'MW', digits: 0 };
  if (abs >= 0.01) return { value: mw, unit: 'MW', digits: 2 };
  return { value: mw * 1000, unit: 'kW', digits: 1 };
}

export function fmtSci(v, digits = 2) {
  if (v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  const mant = v / 10 ** exp;
  return `${mant.toFixed(digits)}×10${sup(exp)}`;
}

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sup(n) {
  return String(n).split('').map((c) => SUP[c] ?? c).join('');
}

export function fmtMoney(v) {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}
