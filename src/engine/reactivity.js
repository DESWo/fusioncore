// D-T Maxwellian reactivity <sigma·v> as a 5th-degree polynomial in log10(T)
// space, fit exactly through six NRL Plasma Formulary anchor points (spec §6).
// Valid 1–50 keV; extended with a steep power law below and a plateau above.

const ANCHORS_KEV = [1, 2, 5, 10, 20, 50];
const ANCHORS_M3S = [5.5e-27, 2.6e-25, 1.3e-23, 1.1e-22, 4.2e-22, 8.7e-22];

// Solve the 6x6 Vandermonde system once at module load (Gaussian elimination).
function fitPolynomial(xs, ys) {
  const n = xs.length;
  const A = xs.map((x) => Array.from({ length: n }, (_, j) => x ** j));
  const b = [...ys];
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    }
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / A[col][col];
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const coeffs = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r][c] * coeffs[c];
    coeffs[r] = s / A[r][r];
  }
  return coeffs;
}

const COEFFS = fitPolynomial(
  ANCHORS_KEV.map((t) => Math.log10(t)),
  ANCHORS_M3S.map((v) => Math.log10(v)),
);

const SIGMA_V_1KEV = ANCHORS_M3S[0];
const SIGMA_V_50KEV = ANCHORS_M3S[ANCHORS_M3S.length - 1];

/** D-T reactivity in m^3/s for ion temperature in keV. */
export function sigmaV(tKev) {
  if (tKev <= 0.05) return 0;
  if (tKev < 1) return SIGMA_V_1KEV * tKev ** 6.5; // steep sub-keV falloff
  if (tKev > 50) return SIGMA_V_50KEV;             // broad 50–100 keV plateau
  const x = Math.log10(tKev);
  let logV = 0;
  for (let i = COEFFS.length - 1; i >= 0; i--) logV = logV * x + COEFFS[i];
  return 10 ** logV;
}
