// Headless verification of the design-token claims. The colour comments in
// src/index.css and the palette decisions in DEVELOPING.md cite measured
// numbers; this script is what keeps those numbers true when a token changes.
// It reads the real @theme block rather than a copy of it, so there is no
// second palette to fall out of sync. Run: npm run tokens
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures++;
};

// ---- pull the palette out of the @theme block in src/index.css ----
const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8');
const themeBlock = /@theme\s*\{([\s\S]*?)\}/.exec(css)?.[1] ?? '';
const tokens = {};
for (const m of themeBlock.matchAll(/--color-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) {
  tokens[m[1]] = m[2];
}
ok(
  ['base', 'panel', 'raise', 'raise-hi', 'ink', 'accent', 'safe', 'warn', 'crit']
    .every((k) => tokens[k]),
  `tokens: the @theme block still declares the full palette (found: ${Object.keys(tokens).join(', ')})`,
);

// ---- WCAG 2.x relative luminance and contrast ratio ----
function luminance(hex) {
  const chan = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(1) + 0.7152 * chan(3) + 0.0722 * chan(5);
}
function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
const r2 = (x) => Math.round(x * 10) / 10;

// ---- the documented ratios, asserted against the live tokens ----
// The ink and accent lines in @theme carry their measured contrast in the
// comment ("13.7:1 on panel"). The claim is read from the comment itself, so
// whichever side changes, token or prose, the mismatch fails here rather than
// shipping a palette whose own documentation is fiction.
for (const name of ['ink', 'accent']) {
  const cited = new RegExp(`--color-${name}:[^\\n]*?([\\d.]+):1 on panel`).exec(themeBlock)?.[1];
  const measured = contrast(tokens[name], tokens.panel);
  ok(cited != null && Math.abs(measured - Number(cited)) < 0.15,
    `documented: ${name} on panel matches its own comment (comment says ${cited ?? 'nothing'}:1, measured ${r2(measured)}:1)`);
}

// ---- AA floors for the pairings the UI actually renders ----
ok(contrast(tokens.ink, tokens.base) >= 7,
  `body text: ink on base clears AAA (${r2(contrast(tokens.ink, tokens.base))}:1)`);
ok(contrast(tokens.ink, tokens.raise) >= 4.5,
  `body text: ink on raised surfaces clears AA (${r2(contrast(tokens.ink, tokens.raise))}:1)`);
ok(contrast(tokens.base, tokens.accent) >= 4.5,
  `buttons: base text on accent fill clears AA (${r2(contrast(tokens.base, tokens.accent))}:1)`);

// Status colours appear as borders, gauge needles and tile edges against the
// panel: non-text UI, held to WCAG 1.4.11's 3:1.
for (const k of ['safe', 'warn', 'crit']) {
  ok(contrast(tokens[k], tokens.panel) >= 3,
    `status: ${k} against panel clears 3:1 non-text contrast (${r2(contrast(tokens[k], tokens.panel))}:1)`);
}

// ---- the alarm-red legend rule (DEVELOPING.md, "measure instead of asserting")
// On a solid crit fill, near-black base text clears AA and white does not.
// Both halves are asserted so the rule survives a crit-token change in either
// direction: if crit ever brightens until white passes, the second assert goes
// stale and should be reconsidered rather than silently ignored.
const baseOnCrit = contrast(tokens.base, tokens.crit);
const whiteOnCrit = contrast('#FFFFFF', tokens.crit);
ok(baseOnCrit >= 4.5,
  `alarm fills: base (near-black) text on crit clears AA (${r2(baseOnCrit)}:1)`);
ok(whiteOnCrit < 4.5,
  `alarm fills: white on crit measurably fails AA (${r2(whiteOnCrit)}:1), which is why text-base is the rule`);

// And the source obeys its own rule: no component pairs text-white with a
// solid bg-crit fill. (Translucent bg-crit/NN washes sit on dark panels, where
// the effective ground is still near-black; those are ink-on-dark, not this.)
{
  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(jsx?|css)$/.test(name)) {
        const src = readFileSync(p, 'utf8');
        src.split('\n').forEach((line, i) => {
          const solidCrit = /bg-crit(?![\w/])/.test(line);
          if (solidCrit && /text-white/.test(line)) {
            offenders.push(`${p.slice(ROOT.length + 1)}:${i + 1}`);
          }
        });
      }
    }
  };
  walk(join(ROOT, 'src'));
  ok(offenders.length === 0,
    `alarm fills: no source line pairs text-white with a solid bg-crit${offenders.length ? ` (${offenders.join(', ')})` : ''}`);
}

// ---- accent identity: brighter than every semantic colour, dimmer than ink --
// index.css: the accent "separates at 1.30 from the nearest semantic colour
// while still reading as an accent against body text (1.36)". The old sky-400
// sat at 1.00 against warn, indistinguishable by brightness; this pins the
// replacement's whole reason for existing.
{
  const sep = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const nearest = Math.min(...['safe', 'warn', 'crit'].map((k) => sep(tokens.accent, tokens[k])));
  ok(nearest >= 1.25,
    `accent: luminance separation from the nearest semantic colour holds (${nearest.toFixed(2)}, documented 1.30)`);
  const vsInk = sep(tokens.accent, tokens.ink);
  ok(vsInk >= 1.2 && vsInk <= 1.6,
    `accent: still reads as an accent against ink rather than as body text (${vsInk.toFixed(2)}, documented 1.36)`);
}

console.log(failures === 0 ? '\nALL TOKEN CHECKS PASSED' : `\n${failures} TOKEN CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
