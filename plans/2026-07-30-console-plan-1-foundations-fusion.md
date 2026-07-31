# FusionCore Console, Plan 1: Foundations and Fusion Console

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fusion mode's rounded-card dashboard with a fixed painted-steel operator console: annunciator grid, parameter readout stack, plasma mimic, trend strips, control bank and shift log.

**Architecture:** A new token layer and a `console.css` primitive sheet are added *additively* alongside the existing navy tokens, so fission and career mode keep working untouched until Plans 2 and 3. Annunciator logic goes into a new pure module `src/engine/annunciator.js` with no React imports, verified headlessly by a Node script in the same style as `scripts/balance_check.mjs`. Latch and acknowledge state lives in a new store slice evaluated from the existing tick.

**Tech Stack:** React 19, Vite 6, Tailwind 4 (`@theme` tokens), Zustand 5, plain JavaScript with JSX (no TypeScript, no typechecker), `@fontsource-variable/archivo`, `@fontsource/ibm-plex-mono`.

**Spec:** `specs/2026-07-30-console-overhaul-design.md`

## Global Constraints

- **`border-radius: 0` everywhere in console code.** No exceptions.
- **Bevels, not shadows.** Panel face: 1px `--panel-hi` top and left, 1px `--panel-lo` bottom and right. Wells reverse it and add a 2px inner border.
- **No glassmorphism, no drop shadows lifting surfaces, no emoji, no decorative icons.** Every symbol on the panel means something.
- **Every numeric readout uses IBM Plex Mono with `font-variant-numeric: tabular-nums`** and a fixed decimal count. Digits must not shift as values change.
- **Every panel legend and control label uses Archivo, condensed, uppercase, letterspaced.** Never sentence case.
- **Copy is written as a plant would write it.** Alarms state the condition, not a feeling. Log lines carry timestamps and units. No tutorial voice.
- **`npm run balance` and `npm run career` must pass at the end of every task.** They are the only automated safety net; there is no typechecker.
- **Physics, economy, level and career engine logic is not touched.** If a physics constant appears to need changing, that is out of scope for this plan.
- **Existing accessibility must survive:** three colorblind overlays that swap `--color-safe`/`--color-warn`/`--color-crit`, `body.reduced-motion`, `--ui-scale` 0.75 to 1.5, OpenDyslexic override, TTS on every message, 44px touch targets on coarse pointers.
- **Do not delete the old navy tokens (`--color-base`, `--color-panel`, `--color-raise`, `--color-accent`) or `.glass` in this plan.** Fission and career mode still consume them. Removal is Plan 4.
- **Before any browser testing**, snapshot and restore localStorage keys `fusioncore_save_v2_fusion`, `fusioncore_save_v2_fission`, `fusioncore_save_v2_career`, `fusioncore_career_v1`, `fusioncore_career_runs_v1`.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/styles/tokens.css` | The console token layer. Colors only, no rules. |
| `src/styles/console.css` | Panel, well, bevel, legend, readout, tile primitives. |
| `src/engine/annunciator.js` | Pure tile registry and evaluation. No React. |
| `src/store/annunciatorSlice.js` | Latch, acknowledge, mute state and reducers. |
| `src/components/console/Panel.jsx` | Beveled painted face. |
| `src/components/console/Well.jsx` | Recessed dark region. |
| `src/components/console/Legend.jsx` | Engraved Archivo label. |
| `src/components/console/Readout.jsx` | Phosphor numeric value with jitter policy. |
| `src/components/console/ReadoutStack.jsx` | Continuous well, engraved channel rules. |
| `src/components/console/Annunciator.jsx` | The tile grid. |
| `src/components/console/AnnunciatorTile.jsx` | One latching tile. |
| `src/components/console/ShiftHeader.jsx` | Shift number, T+ clock, ACK, MUTE, speed. |
| `src/components/console/TravelBar.jsx` | Detented control, setpoint and process ticks. |
| `src/components/console/GuardedToggle.jsx` | Guard flipped before the switch arms. |
| `src/components/console/TrendStrip.jsx` | One scrolling channel. |
| `src/components/console/TrendBank.jsx` | Shared graticule, sweep legend, N strips. |
| `src/components/console/ShiftLog.jsx` | Timestamped plant record. |
| `src/components/console/BootSequence.jsx` | Staged power-up. |
| `src/components/console/FusionConsole.jsx` | The fusion station layout. |
| `src/components/mimic/PoloidalMimic.jsx` | SVG cross-section mimic. |
| `src/components/mimic/MimicWell.jsx` | Bezel, XSEC/ISO toggle, view host. |
| `src/utils/consoleFormat.js` | `fmtShiftClock`, `fmtFixed`, `shiftNumber`. |
| `scripts/tokens_check.mjs` | WCAG contrast assertions over the token pairs. |
| `scripts/annunciator_check.mjs` | Headless tile behavior assertions. |

**Modified:**

| Path | Change |
|---|---|
| `package.json` | Add two font deps; fold new checks into `npm run balance`. |
| `src/index.css` | Import the new sheets, swap font faces, phosphor focus ring. |
| `src/store/reactorStore.js` | Mount the annunciator slice, evaluate it in the tick. |
| `src/App.jsx` | Route fusion mode to `FusionConsole`, host `BootSequence`. |
| `src/components/reactor3d/ReactorScene.jsx` | Retone materials to steel and `--plasma`. |

**Retired in this plan:** `src/components/dashboard/HazardBanner.jsx` (superseded by the annunciator). Left on disk, no longer rendered by the fusion console, still used by `FissionDashboard` until Plan 2.

---

### Task 1: Token layer with verified contrast

**Files:**
- Create: `src/styles/tokens.css`
- Create: `scripts/tokens_check.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties consumed by every later task. Exact names in the token block below. `scripts/tokens_check.mjs` exports nothing; it is a process that exits 0 or 1.

- [ ] **Step 1: Write the failing contrast check**

The spec records exact contrast ratios. This script proves them rather than trusting them. Create `scripts/tokens_check.mjs`:

```js
// Headless contrast verification for the console token layer.
// Parses src/styles/tokens.css so the assertions cannot drift from the values
// the app actually ships. Run: npm run tokens
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

/** Pull `--name: #RRGGBB;` pairs out of the sheet. */
function parseTokens(text) {
  const out = {};
  for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

/** WCAG 2.x relative luminance. */
function luminance(hex) {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const T = parseTokens(css);
let failures = 0;

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ['--engrave', '--panel', 4.5, 'engraved legend on panel face'],
  ['--phosphor', '--well', 4.5, 'readout in well'],
  ['--plasma', '--well', 4.5, 'plasma trace in well'],
  ['--phosphor-dim', '--well', 3.0, 'unlit segment, non-text UI'],
  // The tightest pair in the system. Neither --engrave (4.35) nor white (4.44)
  // clears AA on alarm red; pure black is the only foreground that does.
  ['--tile-legend', '--al', 4.5, 'legend on alarm tile'],
  ['--tile-legend', '--ca', 4.5, 'legend on caution tile'],
  ['--tile-legend', '--nm', 4.5, 'legend on normal tile'],
  ['--tile-legend', '--tr', 4.5, 'legend on trip tile'],
  ['--tile-legend-off', '--tile-off', 4.5, 'legend on unlit tile'],
];

for (const [fg, bg, min, why] of PAIRS) {
  if (!T[fg] || !T[bg]) {
    console.log(`FAIL  token missing: ${!T[fg] ? fg : bg}`);
    failures++;
    continue;
  }
  const ratio = contrast(T[fg], T[bg]);
  const ok = ratio >= min;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1 (min ${min}) ${why}`);
  if (!ok) failures++;
}

console.log(failures === 0 ? '\nALL TOKEN CHECKS PASSED' : `\n${failures} TOKEN CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
```

Add to the `scripts` block in `package.json`:

```json
"tokens": "node scripts/tokens_check.mjs",
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run tokens`
Expected: FAIL. The script cannot read `src/styles/tokens.css` and throws `ENOENT`, because the sheet does not exist yet.

- [ ] **Step 3: Write the token sheet**

Create `src/styles/tokens.css`. Values are copied verbatim from the spec; do not adjust them to taste, they are contrast-verified.

```css
/* Console token layer. Painted steel panel faces, dark recessed instrument
   wells, phosphor readouts glowing inside the wells. The contrast between lit
   panel and dark well is what makes it read as hardware.

   Added alongside the old navy tokens rather than replacing them: fission and
   career mode still consume --color-base and friends. See Plan 4 for removal.

   Contrast is asserted by scripts/tokens_check.mjs, not eyeballed. If you
   change a value here, run `npm run tokens`. */
:root {
  /* panel */
  --panel: #B4B7AA;       /* painted steel panel face */
  --panel-hi: #C6C8BC;    /* top and left bevel, catches light */
  --panel-lo: #8E9186;    /* bottom and right bevel, in shadow */
  --panel-sub: #A5A89B;   /* second painted tier, sub-panel groups */
  --engrave: #3A3C36;     /* engraved legend text */

  /* wells */
  --well: #0D0F0C;        /* recessed instrument well */
  --well-rule: #23261F;   /* graticule and channel dividers */
  --phosphor: #FFB03A;    /* the default data color */
  --phosphor-dim: #7A5620;/* de-energized segments: present, unlit */
  --plasma: #45C4DE;      /* plasma views and cryo systems ONLY */

  /* annunciator faces */
  --nm: #5FA96F;
  --ca: #E8A93D;
  --al: #D2483A;
  --tr: #F2F0E6;
  --tile-off: #191B16;
  --tile-legend: #000000;
  --tile-legend-off: #8A8E82;
}

/* The three colorblind overlays already swap --color-safe/warn/crit. Alias the
   annunciator faces onto them so those overlays keep working with no new code.
   Declared after :root so the body-class overlays in index.css win. */
:root {
  --nm-live: var(--color-safe, var(--nm));
  --ca-live: var(--color-warn, var(--ca));
  --al-live: var(--color-crit, var(--al));
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm run tokens`
Expected: nine PASS lines and `ALL TOKEN CHECKS PASSED`, exit 0. The alarm-tile line should read `4.73:1 (min 4.5) legend on alarm tile`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css scripts/tokens_check.mjs package.json
git commit -m "Add the console token layer, with contrast asserted not assumed

Black is the only legend color that clears WCAG AA on the alarm-red tile at
4.73:1. Neither the engrave grey (4.35) nor white (4.44) does. tokens_check
parses the sheet itself so the assertions cannot drift from what ships."
```

---

### Task 2: Fonts and console primitive sheet

**Files:**
- Modify: `package.json` (dependencies)
- Create: `src/styles/console.css`
- Modify: `src/index.css:1-20` (imports and `@theme`), `:224-228` (focus ring)

**Interfaces:**
- Consumes: `src/styles/tokens.css` from Task 1.
- Produces: CSS classes `.panel`, `.panel-sub`, `.well`, `.legend`, `.readout`, `.readout--dim`, `.tile`, `.engrave-rule`. Consumed by every React component from Task 6 onward.

- [ ] **Step 1: Install the two faces**

```bash
npm install @fontsource-variable/archivo@5.3.0 @fontsource/ibm-plex-mono@5.3.0
```

Then check whether the variable build carries the width axis:

```bash
ls node_modules/@fontsource-variable/archivo/files/ | grep -i wdth | head
```

**Decision rule.** If files matching `wdth` are listed, Archivo Variable carries the axis: keep the variable package and use `font-variation-settings: 'wdth' 85`. If nothing is listed, the build is weight-only: run `npm uninstall @fontsource-variable/archivo && npm install @fontsource/archivo-narrow`, import `@fontsource/archivo-narrow` instead, and delete the `font-variation-settings` line. Record which route was taken in a comment beside the `@font-face` import.

- [ ] **Step 2: Write the primitive sheet**

Create `src/styles/console.css`:

```css
/* Console construction primitives. Bevels rather than shadows: a 1px light
   edge on top and left and a 1px dark edge on bottom and right is the entire
   trick that makes a flat rectangle read as painted steel. Radius is zero
   everywhere by rule, so it is set here once rather than per component. */

.panel,
.panel-sub,
.well,
.tile {
  border-radius: 0;
}

/* ---- panel faces ---- */
.panel {
  background: var(--panel);
  border-top: 1px solid var(--panel-hi);
  border-left: 1px solid var(--panel-hi);
  border-bottom: 1px solid var(--panel-lo);
  border-right: 1px solid var(--panel-lo);
  color: var(--engrave);
}
.panel-sub {
  background: var(--panel-sub);
  border-top: 1px solid var(--panel-hi);
  border-left: 1px solid var(--panel-hi);
  border-bottom: 1px solid var(--panel-lo);
  border-right: 1px solid var(--panel-lo);
  color: var(--engrave);
}

/* ---- recessed wells: the bevel reverses, plus a 2px inner border so the
   cut reads as depth rather than as a dark box drawn on the panel ---- */
.well {
  background: var(--well);
  border-top: 1px solid var(--panel-lo);
  border-left: 1px solid var(--panel-lo);
  border-bottom: 1px solid var(--panel-hi);
  border-right: 1px solid var(--panel-hi);
  box-shadow: inset 0 0 0 2px #000;
  color: var(--phosphor);
}

/* ---- engraved lettering ---- */
.legend {
  font-family: var(--font-legend);
  font-variation-settings: 'wdth' 85;   /* delete if on archivo-narrow */
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
  color: var(--engrave);
  line-height: 1.1;
}
/* A legend cut into a well is lit, not engraved */
.well .legend {
  color: var(--phosphor-dim);
}

/* ---- numeric readouts. Tabular figures are mandatory: without them the
   last digit shifts the whole column every tick. ---- */
.readout {
  font-family: var(--font-readout);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  color: var(--phosphor);
  letter-spacing: 0.02em;
}
.readout--dim { color: var(--phosphor-dim); }
.readout--plasma { color: var(--plasma); }

/* Channel divider inside a continuous well */
.engrave-rule { border-top: 1px solid var(--well-rule); }

/* ---- annunciator tile ---- */
.tile {
  background: var(--tile-off);
  color: var(--tile-legend-off);
  border-top: 1px solid var(--panel-lo);
  border-left: 1px solid var(--panel-lo);
  border-bottom: 1px solid var(--panel-hi);
  border-right: 1px solid var(--panel-hi);
}
.tile[data-state='normal']  { background: var(--nm-live); color: var(--tile-legend); }
.tile[data-state='caution'] { background: var(--ca-live); color: var(--tile-legend); }
.tile[data-state='alarm']   { background: var(--al-live); color: var(--tile-legend); }

/* Unacknowledged: flashes white and holds, regardless of what else is
   happening. Under reduced motion it holds solid white instead of flashing:
   suppressing an alarm entirely would be a safety regression. */
.tile[data-latched='true'] {
  animation: tile-flash 0.7s steps(1, end) infinite;
}
@keyframes tile-flash {
  0%, 49%   { background: var(--tr); color: var(--tile-legend); }
  50%, 100% { background: var(--tile-off); color: var(--tile-legend-off); }
}
body.reduced-motion .tile[data-latched='true'],
@media (prefers-reduced-motion: reduce) {
  .tile[data-latched='true'] {
    animation: none;
    background: var(--tr);
    color: var(--tile-legend);
  }
}
```

Note: the `body.reduced-motion` selector and the media query cannot share a rule block in plain CSS. Write them as two separate blocks:

```css
body.reduced-motion .tile[data-latched='true'] {
  animation: none;
  background: var(--tr);
  color: var(--tile-legend);
}
@media (prefers-reduced-motion: reduce) {
  .tile[data-latched='true'] {
    animation: none;
    background: var(--tr);
    color: var(--tile-legend);
  }
}
```

- [ ] **Step 3: Wire the sheets and faces into `src/index.css`**

Replace lines 1 to 20 (the `@import` block and `@theme`) with:

```css
@import "tailwindcss";
@import "@fontsource-variable/archivo";     /* wdth axis confirmed at install */
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";
@import "./styles/tokens.css";
@import "./styles/console.css";

/* Career mode keeps its serif stack; see src/career/career-theme.css. */
@import "@fontsource-variable/inter";
@import "@fontsource/geist-mono/400.css";
@import "@fontsource/geist-mono/500.css";

@theme {
  /* Old navy tokens: still consumed by fission and career mode. Plan 4 removes
     them once nothing references them. */
  --color-base: #16233A;
  --color-panel: #1C2B44;
  --color-raise: #24344F;
  --color-ink: #EEF2F5;
  --color-accent: #38BDF8;
  --color-safe: #22C55E;
  --color-warn: #F59E0B;
  --color-crit: #EF4444;

  --font-legend: "Archivo Variable", Archivo, ui-sans-serif, system-ui, sans-serif;
  --font-readout: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: "Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Then replace the focus ring at lines 224 to 228 with a phosphor outline:

```css
:focus-visible {
  outline: 2px solid var(--phosphor);
  outline-offset: 2px;
  border-radius: 0;
}
```

- [ ] **Step 4: Verify the app still boots and nothing regressed**

Run: `npm run tokens && npm run balance && npm run career`
Expected: all three exit 0. None of them touch CSS, so this is a regression gate, not a proof the sheet works.

Then start the dev server with the preview tool at `http://localhost:5199` and confirm: the app loads, the title screen renders, fission and career mode still look exactly as before (they consume the untouched navy tokens), and the console fonts are downloaded. Check the network panel for `archivo` and `ibm-plex-mono` woff2 requests.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/styles/console.css src/index.css
git commit -m "Add console primitives: bevels, wells, engraved legends

Bevels rather than shadows, radius zero by rule. Archivo for engraved legends,
IBM Plex Mono with tabular figures for every readout so digits do not shift as
values change. Old navy tokens stay: fission and career still consume them."
```

---

### Task 3: The annunciator engine

**Files:**
- Create: `src/engine/annunciator.js`
- Create: `scripts/annunciator_check.mjs`
- Modify: `package.json` (fold into `balance`)

**Interfaces:**
- Consumes: `sim` state shaped by `src/engine/physics.js` (`physics`, `controls`, `structure`, `fuel`, `hazards`).
- Produces:
  - `FUSION_TILES: Array<{id, legend, code, evaluate(sim) => 'off'|'normal'|'caution'|'alarm'}>`
  - `tilesFor(mode) => Array<Tile>`
  - `evaluateTiles(mode, sim) => { [tileId]: state }`
  - `STATE_CODES = { off: '--', normal: 'NM', caution: 'CA', alarm: 'AL' }`

**Design note for the implementer.** Four of the eight fusion tiles have a matching entry in `sim.hazards`, which the physics engine already maintains as its own authoritative limit logic with a countdown. Those tiles read `hazards` for their alarm state rather than re-deriving a threshold, so the annunciator can never disagree with the engine about whether a limit was crossed. Only the caution band is the annunciator's own. The remaining four tiles have no hazard entry and use their own thresholds against `structure` and `fuel`.

- [ ] **Step 1: Write the failing check**

Create `scripts/annunciator_check.mjs`:

```js
// Headless annunciator verification: proves each tile lights on the right
// condition and clears on the right condition, using only the pure module.
// Run: npm run annunciator
import { createSimState } from '../src/engine/physics.js';
import { FUSION_TILES, tilesFor, evaluateTiles, STATE_CODES } from '../src/engine/annunciator.js';

let failures = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} (got ${actual}, want ${expected})`);
  if (!ok) failures++;
}

/** A sim with specific fields overridden, everything else at fresh defaults. */
function simWith(patch) {
  const s = createSimState();
  return {
    ...s,
    physics: { ...s.physics, ...(patch.physics ?? {}) },
    controls: { ...s.controls, ...(patch.controls ?? {}) },
    structure: { ...s.structure, ...(patch.structure ?? {}) },
    fuel: { ...s.fuel, ...(patch.fuel ?? {}) },
    hazards: { ...(s.hazards ?? {}), ...(patch.hazards ?? {}) },
  };
}

const stateOf = (id, sim) => evaluateTiles('fusion', sim)[id];

// --- registry shape ---
check('registry has 8 fusion tiles', FUSION_TILES.length, 8);
check('tilesFor("fusion") returns the fusion registry', tilesFor('fusion'), FUSION_TILES);
check('state code for alarm', STATE_CODES.alarm, 'AL');
check('every tile has a unique id',
  new Set(FUSION_TILES.map((t) => t.id)).size, FUSION_TILES.length);

// --- greenwald: alarm rides the engine's own hazard flag ---
check('greenwald normal at 50% of limit',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: true } })), 'normal');
check('greenwald caution at 92% of limit',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.92, plasmaOn: true } })), 'caution');
check('greenwald alarm when the engine raises the hazard',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 1.05, plasmaOn: true }, hazards: { greenwald: 40 } })), 'alarm');
check('greenwald clears when the hazard clears',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: true }, hazards: { greenwald: 0 } })), 'normal');
check('greenwald off with the plasma down',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: false } })), 'off');

// --- beta ---
check('beta caution at 88% of limit',
  stateOf('beta', simWith({ physics: { beta: 0.88, betaLimit: 1.0, plasmaOn: true } })), 'caution');
check('beta alarm on the hazard',
  stateOf('beta', simWith({ physics: { beta: 1.1, betaLimit: 1.0, plasmaOn: true }, hazards: { beta: 30 } })), 'alarm');

// --- divertor ---
check('divertor caution at 90% of the thermal limit',
  stateOf('divertor', simWith({ physics: { divertorTempC: 900, divertorLimitC: 1000, plasmaOn: true } })), 'caution');
check('divertor alarm on the hazard',
  stateOf('divertor', simWith({ physics: { divertorTempC: 1100, divertorLimitC: 1000, plasmaOn: true }, hazards: { divertor: -1 } })), 'alarm');

// --- TF coil field ---
check('tf coil caution at 95% of the safe field',
  stateOf('tfcoil', simWith({ controls: { B: 9.5 }, physics: { magnetSafeB: 10, plasmaOn: true } })), 'caution');
check('tf coil alarm on the hazard',
  stateOf('tfcoil', simWith({ controls: { B: 11 }, physics: { magnetSafeB: 10, plasmaOn: true }, hazards: { magnets: 20 } })), 'alarm');

// --- structural and inventory tiles: no hazard entry, own thresholds ---
check('first wall normal at 80% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 80 } })), 'normal');
check('first wall caution at 50% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 50 } })), 'caution');
check('first wall alarm at 25% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 25 } })), 'alarm');

// Beam shine-through. beamCoupling = HEAT_ABSORB * (1 - exp(-n20 / SHINE_N0))
// with HEAT_ABSORB 0.9 and SHINE_N0 0.4, so it ranges 0 to 0.9 and falls as the
// plasma thins. 0.75 is the threshold the existing dashboard already uses to
// report shine-through as a limiting factor.
check('shine-through normal at 83% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.83, plasmaOn: true } })), 'normal');
check('shine-through caution at 70% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.70, plasmaOn: true } })), 'caution');
check('shine-through alarm at 40% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.40, plasmaOn: true } })), 'alarm');
check('shine-through off with the plasma down',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.40, plasmaOn: false } })), 'off');

check('tritium caution at 4 g',
  stateOf('tritium', simWith({ fuel: { tritium: 4 } })), 'caution');
check('tritium alarm at 0.2 g',
  stateOf('tritium', simWith({ fuel: { tritium: 0.2 } })), 'alarm');

check('net power caution when the plant is a net importer',
  stateOf('netpower', simWith({ physics: { netElecMW: -12, plasmaOn: true } })), 'caution');
check('net power normal when exporting',
  stateOf('netpower', simWith({ physics: { netElecMW: 38, plasmaOn: true } })), 'normal');

// --- purity: evaluation must not mutate the sim it is handed ---
const probe = simWith({ physics: { greenwaldFrac: 0.92, plasmaOn: true } });
const before = JSON.stringify(probe);
evaluateTiles('fusion', probe);
check('evaluateTiles does not mutate its input', JSON.stringify(probe), before);

console.log(failures === 0 ? '\nALL ANNUNCIATOR CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
```

Add to `package.json` scripts, and fold it into `balance` so there is one command to trust:

```json
"annunciator": "node scripts/annunciator_check.mjs",
"balance": "node scripts/balance_check.mjs && node scripts/annunciator_check.mjs && node scripts/tokens_check.mjs",
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run annunciator`
Expected: FAIL. `ERR_MODULE_NOT_FOUND` for `src/engine/annunciator.js`.

- [ ] **Step 3: Write the module**

Create `src/engine/annunciator.js`:

```js
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
      if (!sim.physics.plasmaOn) return 'off';
      if (hazardActive(sim, hazardKey)) return 'alarm';
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
      const k = sim.physics.beamCoupling;
      if (k < 0.5) return 'alarm';
      if (k < 0.75) return 'caution';
      return 'normal';
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

/** Fission tiles land in Plan 2. Returning the fusion set keeps callers safe. */
export function tilesFor(mode) {
  return mode === 'fission' ? [] : FUSION_TILES;
}

/** Pure: returns { [tileId]: state } and never touches the sim it is handed. */
export function evaluateTiles(mode, sim) {
  const out = {};
  for (const tile of tilesFor(mode)) out[tile.id] = tile.evaluate(sim);
  return out;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm run annunciator`
Expected: 27 PASS lines and `ALL ANNUNCIATOR CHECKS PASSED`, exit 0. (Registry 4, greenwald 5, beta 2, divertor 2, TF coil 2, first wall 3, shine-through 4, tritium 2, net power 2, purity 1.)

Then run the full gate: `npm run balance && npm run career`
Expected: both exit 0. `balance` now runs three scripts and prints all three summaries.

- [ ] **Step 5: Commit**

```bash
git add src/engine/annunciator.js scripts/annunciator_check.mjs package.json
git commit -m "Add the annunciator engine, wired to plant state

Four tiles read sim.hazards for their alarm state rather than re-deriving a
threshold, so the annunciator cannot disagree with the physics engine about
whether a limit was crossed. Only the caution band is the annunciator's own.

GREENWALD LIMIT, not LOW DENSITY LIMIT: Greenwald is an upper bound. LOCKED
MODE is absent because there is no locked-mode physics to wire it to."
```

---

### Task 4: Latch, acknowledge and mute state

**Files:**
- Create: `src/store/annunciatorSlice.js`
- Modify: `src/store/reactorStore.js` (initial state near `:245`, tick step 8 near `:1328`)

**Interfaces:**
- Consumes: `evaluateTiles`, `tilesFor` from Task 3.
- Produces: store fields `annunciator: { state, latched, acked, muted }` and actions `ackAnnunciator()`, `toggleAnnunciatorMute()`, plus the pure helper `nextAnnunciator(prev, nextState)` exported for the check script.

- [ ] **Step 1: Extend the check with latch behavior**

Append to `scripts/annunciator_check.mjs`, above the final summary lines:

```js
// --- latch and acknowledge ---
import { nextAnnunciator, freshAnnunciator } from '../src/store/annunciatorSlice.js';

let a = freshAnnunciator();
check('starts with nothing latched', Object.keys(a.latched).length, 0);
check('starts muted', a.muted, true);

a = nextAnnunciator(a, { greenwald: 'normal', beta: 'normal' });
check('normal states do not latch', Object.keys(a.latched).length, 0);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('an alarm latches', a.latched.greenwald, true);
check('a latched tile is unacknowledged', a.acked.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('the latch holds while the condition holds', a.latched.greenwald, true);

a = { ...a, latched: {}, acked: { ...a.acked, greenwald: true } };   // player pressed ACK
a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('acknowledged stays lit at the condition color', a.state.greenwald, 'alarm');
check('acknowledged does not re-latch while the condition holds', a.latched.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'normal', beta: 'normal' });
check('the ack clears when the condition clears', a.acked.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('a re-occurring condition latches again', a.latched.greenwald, true);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'caution' });
check('caution latches too', a.latched.beta, true);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run annunciator`
Expected: FAIL. `ERR_MODULE_NOT_FOUND` for `src/store/annunciatorSlice.js`.

- [ ] **Step 3: Write the slice**

Create `src/store/annunciatorSlice.js`:

```js
// Annunciator latch state. Real control-room convention: a tile that goes into
// alarm latches and flashes until the operator acknowledges it, and then stays
// lit at the condition color until the condition itself clears. Acknowledging
// silences the flash; it does not clear the alarm.
//
// nextAnnunciator is pure and exported so scripts/annunciator_check.mjs can
// drive the latch logic without a store.

import { evaluateTiles } from '../engine/annunciator.js';

const LATCHING = new Set(['caution', 'alarm']);

export function freshAnnunciator() {
  return {
    state: {},     // tileId -> current evaluated state
    latched: {},   // tileId -> true while unacknowledged: flashing
    acked: {},     // tileId -> true: silenced, still lit
    muted: true,   // audible trip alert is off by default
  };
}

/**
 * Fold a freshly evaluated tile map into the previous latch state.
 * Pure: returns a new object, never mutates `prev`.
 */
export function nextAnnunciator(prev, nextState) {
  const latched = { ...prev.latched };
  const acked = { ...prev.acked };

  for (const [id, state] of Object.entries(nextState)) {
    const was = prev.state[id];
    if (LATCHING.has(state)) {
      // Latch on entry into a latching state, and only on entry: a tile that
      // is already acknowledged must not re-latch every tick.
      if (!LATCHING.has(was) && !acked[id]) latched[id] = true;
    } else {
      // Condition physically cleared. Drop both the flash and the ack, so a
      // re-occurrence latches again rather than staying silently silenced.
      delete latched[id];
      delete acked[id];
    }
  }

  return { ...prev, state: nextState, latched, acked };
}

/** Acknowledge every flashing tile. Silences the flash, keeps the tile lit. */
export function acknowledgeAll(prev) {
  const acked = { ...prev.acked };
  for (const id of Object.keys(prev.latched)) acked[id] = true;
  return { ...prev, latched: {}, acked };
}

/** Zustand slice factory, mounted by reactorStore. */
export const createAnnunciatorSlice = (set, get) => ({
  annunciator: freshAnnunciator(),

  /** Called once per tick with the current mode and sim. */
  tickAnnunciator(mode, sim) {
    const evaluated = evaluateTiles(mode, sim);
    const prev = get().annunciator;
    // Cheap bail-out: nothing changed, so do not churn a new object every
    // 100 ms and re-render the grid for nothing.
    let same = true;
    for (const id of Object.keys(evaluated)) {
      if (prev.state[id] !== evaluated[id]) { same = false; break; }
    }
    if (same) return;
    set({ annunciator: nextAnnunciator(prev, evaluated) });
  },

  ackAnnunciator() {
    set((s) => ({ annunciator: acknowledgeAll(s.annunciator) }));
  },

  toggleAnnunciatorMute() {
    set((s) => ({ annunciator: { ...s.annunciator, muted: !s.annunciator.muted } }));
  },
});
```

- [ ] **Step 4: Mount the slice in the store**

In `src/store/reactorStore.js`, add the import beside the other engine imports at the top:

```js
import { createAnnunciatorSlice, freshAnnunciator } from './annunciatorSlice.js';
```

Spread the slice into the store creator alongside the existing state. Find the object containing `alarmLevel: 'none',` near line 245 and add the slice spread immediately after the state literal's opening, so its actions are available on `get()`:

```js
  ...createAnnunciatorSlice(set, get),
```

Then in the tick, at step 8 near line 1328 where `alarmLevel` is computed, add the evaluation immediately before it:

```js
    // 8. annunciator: tiles read plant state, latch on entry, hold until ACK
    get().tickAnnunciator(s.mode, sim);
```

Finally, reset the annunciator wherever a run starts fresh. There are exactly three sites; do not pattern-match on `notifications:` alone, because one occurrence of it is a filter in the repair path rather than a reset, and a repair must not silence live alarms.

1. `freshGameState()`, in the returned object beside `notifications: []` (around line 217). This covers `newGame`, which spreads `fresh`.
2. The load path's explicit `set({ ... })` (around line 484, the block containing `settings: { ...defaultSettings(), ...save.settings }`). The annunciator is not persisted, so without this a loaded run inherits the previous run's latches.
3. The scenario loader's `set({ ... })` (around line 689, the block containing `history: []` and `notifications: []`).

Add to each:

```js
      annunciator: freshAnnunciator(),
```

Do **not** add it to the repair path around line 1065. That block filters notifications rather than clearing them, and the annunciator must keep reporting whatever the plant is actually doing; the next tick re-evaluates it anyway.

- [ ] **Step 5: Run the full gate**

Run: `npm run annunciator`
Expected: the ten new latch lines PASS, total 37 PASS, exit 0.

Run: `npm run balance && npm run career`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/store/annunciatorSlice.js src/store/reactorStore.js scripts/annunciator_check.mjs
git commit -m "Latch and acknowledge for the annunciator

Acknowledging silences the flash but does not clear the alarm: the tile stays
lit at the condition color until the condition physically clears. Clearing the
condition drops the ack too, so a re-occurrence latches again rather than
staying silently silenced."
```

---

### Task 5: Console formatting helpers

**Files:**
- Create: `src/utils/consoleFormat.js`
- Modify: `scripts/annunciator_check.mjs` (append assertions)

**Interfaces:**
- Produces: `fmtShiftClock(sec) => 'HH:MM:SS'`, `shiftNumber(sec) => number`, `fmtFixed(value, decimals) => string`, `SHIFT_LENGTH_S`.

- [ ] **Step 1: Append the failing assertions**

Add to `scripts/annunciator_check.mjs` above the summary:

```js
// --- console formatting ---
import { fmtShiftClock, shiftNumber, fmtFixed } from '../src/utils/consoleFormat.js';

check('clock is zero padded', fmtShiftClock(3 * 3600 + 7 * 60 + 5), '03:07:05');
check('clock does not roll over at a day', fmtShiftClock(30 * 3600), '30:00:00');
check('clock floors fractional seconds', fmtShiftClock(61.9), '00:01:01');
check('shift 1 at the start of the run', shiftNumber(0), 1);
check('still shift 1 just before the handover', shiftNumber(8 * 3600 - 1), 1);
check('shift 2 at the handover', shiftNumber(8 * 3600), 2);
check('shift 4 on the second day', shiftNumber(25 * 3600), 4);
check('fixed decimals pad out', fmtFixed(1.5, 2), '1.50');
check('fixed decimals do not go exponential', fmtFixed(0.00004, 2), '0.00');
check('fixed decimals keep the sign', fmtFixed(-12.345, 1), '-12.3');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run annunciator`
Expected: FAIL, `ERR_MODULE_NOT_FOUND` for `src/utils/consoleFormat.js`.

- [ ] **Step 3: Write the helpers**

Create `src/utils/consoleFormat.js`:

```js
// Console formatting. The existing src/utils/format.js formats for prose
// ("4h 17m", "$1.2M"); a control room does not. Hours never roll over into
// days on a T+ clock, and every field is fixed width so the column does not
// dance.

export const SHIFT_LENGTH_S = 8 * 3600;

/** T+ elapsed clock, zero padded, hours unbounded. 30 h reads 30:00:00. */
export function fmtShiftClock(sec) {
  const t = Math.max(0, Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Shifts are 8 hours and 1-indexed: the run starts on shift 1, not shift 0. */
export function shiftNumber(sec) {
  return Math.floor(Math.max(0, sec) / SHIFT_LENGTH_S) + 1;
}

/** Fixed decimals, never exponential, sign preserved. */
export function fmtFixed(value, decimals = 1) {
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(decimals);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm run annunciator`
Expected: 47 PASS, exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/utils/consoleFormat.js scripts/annunciator_check.mjs
git commit -m "Add console formatting: T+ clock, shift number, fixed decimals

Hours do not roll into days on a T+ clock, and every numeric field is fixed
width so the readout column does not dance as values change."
```

---

### Task 6: Console primitives in React

**Files:**
- Create: `src/components/console/Panel.jsx`, `Well.jsx`, `Legend.jsx`, `Readout.jsx`

**Interfaces:**
- Consumes: `.panel`, `.well`, `.legend`, `.readout` from Task 2; `fmtFixed` from Task 5.
- Produces:
  - `<Panel as="section" sub className="...">` renders `.panel` or `.panel-sub`.
  - `<Well className="...">` renders `.well`.
  - `<Legend size="sm|md">` renders `.legend`.
  - `<Readout value={number} decimals={2} unit="keV" critical plasma dim />`

**Design note.** `Readout` owns the jitter policy. Jitter is display-only, never written back to state, deterministic per channel rather than `Math.random()` per frame, and entirely suppressed when `critical` is set. Any readout gating a mission threshold or a hard limit passes `critical`, so a jittering `Q 1.00` can never read `0.99` at the moment it decides whether the player passed.

- [ ] **Step 1: Write the four primitives**

Create `src/components/console/Panel.jsx`:

```jsx
/** A painted steel panel face. `sub` selects the second, darker painted tier. */
export default function Panel({ as: Tag = 'div', sub = false, className = '', children, ...rest }) {
  return (
    <Tag className={`${sub ? 'panel-sub' : 'panel'} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
```

Create `src/components/console/Well.jsx`:

```jsx
/** A recessed instrument well cut into a panel face. */
export default function Well({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`well ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
```

Create `src/components/console/Legend.jsx`:

```jsx
const SIZES = { xs: 'text-[8px]', sm: 'text-[9px]', md: 'text-[10px]' };

/** Engraved lettering. Uppercase is enforced by the stylesheet, not here, so
    the accessible name keeps its original casing for screen readers. */
export default function Legend({ size = 'sm', className = '', children, ...rest }) {
  return (
    <span className={`legend ${SIZES[size] ?? SIZES.sm} ${className}`} {...rest}>
      {children}
    </span>
  );
}
```

Create `src/components/console/Readout.jsx`:

```jsx
import { memo } from 'react';
import { fmtFixed } from '../../utils/consoleFormat.js';

/**
 * A phosphor numeric readout.
 *
 * Instrument noise: the last significant digit ticks within the noise floor
 * even when the plant is steady, which is what makes a real panel feel alive.
 * Three rules keep that honest:
 *   1. It is display-only. Nothing is written back to state or history.
 *   2. It is deterministic per channel and per tick, not Math.random() per
 *      frame, so a value ticks rather than thrashing.
 *   3. `critical` disables it outright. Every readout that gates a mission
 *      threshold or a hard limit sets it, so a jittering Q never lies at the
 *      moment it matters.
 */
function jitterFor(value, decimals, tick, seed) {
  // One count in the last displayed decimal, +1 / 0 / -1, cycling on a hash of
  // the channel seed and the tick.
  const step = 10 ** -decimals;
  const h = (seed * 2654435761 + tick * 40503) >>> 0;
  return value + ((h % 3) - 1) * step;
}

function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function Readout({
  value, decimals = 1, unit, channel = '', tick = 0,
  critical = false, plasma = false, dim = false, reducedMotion = false,
  className = '', ...rest
}) {
  const jitters = !critical && !reducedMotion && Number.isFinite(value);
  const shown = jitters
    ? fmtFixed(jitterFor(value, decimals, tick, hashSeed(channel)), decimals)
    : fmtFixed(value, decimals);

  return (
    <span
      className={`readout ${plasma ? 'readout--plasma' : ''} ${dim ? 'readout--dim' : ''} ${className}`}
      {...rest}
    >
      {shown}
      {unit ? <span className="ml-1 opacity-70">{unit}</span> : null}
    </span>
  );
}

export default memo(Readout);
```

- [ ] **Step 2: Verify nothing regressed**

Run: `npm run balance && npm run career`
Expected: both exit 0. These components are not yet rendered anywhere, so this only proves the imports do not break the build.

Run: `npm run build`
Expected: exits 0 with a bundle written to `dist/`. This is the check that the new JSX actually compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/console/
git commit -m "Add console primitives: Panel, Well, Legend, Readout

Readout owns the instrument-noise policy: display-only, deterministic per
channel, and disabled outright on any value that gates a mission threshold, so
a jittering Q cannot read 0.99 at the moment it decides whether you passed."
```

---

### Task 7: The annunciator grid

**Files:**
- Create: `src/components/console/AnnunciatorTile.jsx`, `src/components/console/Annunciator.jsx`

**Interfaces:**
- Consumes: `tilesFor` and `STATE_CODES` from Task 3; store fields `annunciator` and action `ackAnnunciator` from Task 4; `Legend` from Task 6.
- Produces: `<Annunciator />`, self-subscribing to the store. Rendered by `FusionConsole` in Task 11.

- [ ] **Step 1: Write the tile**

Create `src/components/console/AnnunciatorTile.jsx`:

```jsx
import { memo } from 'react';
import { STATE_CODES } from '../../engine/annunciator.js';

/**
 * One annunciator tile. Colour carries the state, and so does the two-character
 * code in the gutter: the app ships three colorblind overlays and the tile must
 * not depend on hue alone. The code is plant legend, not decoration.
 */
function AnnunciatorTile({ legend, state, latched }) {
  const code = STATE_CODES[state] ?? '--';
  const label = `${legend}: ${
    { off: 'off', normal: 'normal', caution: 'caution', alarm: 'alarm' }[state] ?? 'off'
  }${latched ? ', unacknowledged' : ''}`;

  return (
    <div
      className="tile flex items-center justify-between gap-1 px-2 py-1.5 min-w-0"
      data-state={state}
      data-latched={latched ? 'true' : 'false'}
      role="status"
      aria-label={label}
    >
      <span className="legend text-[8px] leading-tight truncate">{legend}</span>
      <span className="readout text-[8px] shrink-0 tabular-nums" style={{ color: 'inherit' }}>
        {code}
      </span>
    </div>
  );
}

export default memo(AnnunciatorTile);
```

- [ ] **Step 2: Write the grid**

Create `src/components/console/Annunciator.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import { tilesFor } from '../../engine/annunciator.js';
import AnnunciatorTile from './AnnunciatorTile.jsx';
import Legend from './Legend.jsx';

/**
 * The annunciator grid. Wired to plant state through the store slice, never to
 * scripted events. An unacknowledged tile keeps flashing no matter what else
 * the player is doing.
 */
export default function Annunciator() {
  const mode = useReactorStore((s) => s.mode);
  const ann = useReactorStore((s) => s.annunciator);
  const ack = useReactorStore((s) => s.ackAnnunciator);
  const tiles = tilesFor(mode);
  if (tiles.length === 0) return null;

  const unacked = Object.keys(ann.latched).length;

  return (
    <section className="panel px-2 py-1.5" aria-label="Annunciator">
      <div className="flex items-center gap-2 mb-1.5">
        <Legend size="xs">Annunciator</Legend>
        <div className="flex-1" />
        <button
          type="button"
          onClick={ack}
          disabled={unacked === 0}
          className="panel-sub legend text-[9px] px-3 py-1 disabled:opacity-40"
          aria-label={unacked === 0 ? 'Acknowledge, no active alarms' : `Acknowledge ${unacked} alarms`}
        >
          Ack{unacked > 0 ? ` ${unacked}` : ''}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {tiles.map((t) => (
          <AnnunciatorTile
            key={t.id}
            legend={t.legend}
            state={ann.state[t.id] ?? 'off'}
            latched={Boolean(ann.latched[t.id])}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build && npm run balance`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/console/AnnunciatorTile.jsx src/components/console/Annunciator.jsx
git commit -m "Add the annunciator grid

Each tile carries a two-character state code beside the legend so the state
never depends on hue alone: the app ships three colorblind overlays and the
grid has to survive all of them."
```

---

### Task 8: Shift header

**Files:**
- Create: `src/components/console/ShiftHeader.jsx`

**Interfaces:**
- Consumes: `fmtShiftClock`, `shiftNumber` from Task 5; store fields `sim.time.simSeconds`, `speed`, `mode`, `level`, `annunciator.muted`, actions `setSpeed`, `toggleAnnunciatorMute`.
- Produces: `<ShiftHeader />`. Replaces `TopHUD` for fusion mode only; `TopHUD.jsx` is left in place for fission until Plan 2.

- [ ] **Step 1: Write the header**

Create `src/components/console/ShiftHeader.jsx`:

```jsx
import { useReactorStore, levelFor } from '../../store/reactorStore.js';
import { fmtShiftClock, shiftNumber } from '../../utils/consoleFormat.js';
import Legend from './Legend.jsx';

const SPEEDS = [0.25, 1, 2, 4, 8];

/**
 * The station header: who is on shift, how long the run has been up, and the
 * two hard controls that belong to the operator rather than to the plant.
 */
export default function ShiftHeader() {
  const simSeconds = useReactorStore((s) => s.sim.time.simSeconds);
  const speed = useReactorStore((s) => s.speed);
  const setSpeed = useReactorStore((s) => s.setSpeed);
  const mode = useReactorStore((s) => s.mode);
  const levelId = useReactorStore((s) => s.level.id);
  const completed = useReactorStore((s) => s.level.completed);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const muted = useReactorStore((s) => s.annunciator.muted);
  const toggleMute = useReactorStore((s) => s.toggleAnnunciatorMute);
  const setSettingsOpen = useReactorStore((s) => s.setSettingsOpen);
  const level = levelFor(mode, levelId, plantKey);

  return (
    <header className="panel flex items-center gap-3 px-3 py-1.5 shrink-0" aria-label="Station header">
      <Legend size="md">Fusioncore</Legend>

      <span className="panel-sub px-2 py-0.5">
        <Legend size="xs">
          {completed ? 'Sandbox' : `Mission ${level.id} ${level.name}`}
        </Legend>
      </span>

      <div className="flex-1" />

      <Legend size="xs">Shift</Legend>
      <span className="readout text-[11px]">{String(shiftNumber(simSeconds)).padStart(2, '0')}</span>

      <Legend size="xs">T+</Legend>
      <span className="readout text-[11px]" aria-label={`Elapsed ${fmtShiftClock(simSeconds)}`}>
        {fmtShiftClock(simSeconds)}
      </span>

      <div className="flex items-center">
        {[0, ...SPEEDS].map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => setSpeed(sp)}
            aria-label={sp === 0 ? 'Hold simulation' : `Simulation rate ${sp} times`}
            aria-pressed={speed === sp}
            className={`legend text-[9px] px-2 py-1 ${
              speed === sp ? 'well' : 'panel-sub'
            }`}
          >
            {sp === 0 ? 'Hold' : `${sp}x`}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={!muted}
        aria-label={muted ? 'Enable audible alarm' : 'Mute audible alarm'}
        className="panel-sub legend text-[9px] px-2 py-1"
      >
        {muted ? 'Alarm off' : 'Alarm on'}
      </button>

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Station settings"
        className="panel-sub legend text-[9px] px-2 py-1"
      >
        Cfg
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build && npm run balance`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/console/ShiftHeader.jsx
git commit -m "Add the shift header: shift number, T+ clock, rate, alarm mute

The T+ clock reads HH:MM:SS with hours unbounded, so a long run reads 30:00:00
rather than rolling into a day count. Audible alarm is off by default."
```

---

### Task 9: Parameter readout stack

**Files:**
- Create: `src/components/console/ReadoutStack.jsx`

**Interfaces:**
- Consumes: `Well`, `Legend`, `Readout` from Task 6; store `sim.physics`, `sim.controls`, `sim.time.ticks`, `settings.reducedMotion`.
- Produces: `<ReadoutStack />`.

**Design note.** One continuous well with engraved rules between channels, not eight separate wells. Values are right-aligned on a fixed decimal column. Units are engraved on the panel face outside the well, so the well contains only lit data.

- [ ] **Step 1: Write the stack**

Create `src/components/console/ReadoutStack.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import { unlockedFeatures } from '../../engine/levels.js';
import Well from './Well.jsx';
import Legend from './Legend.jsx';
import Readout from './Readout.jsx';

// `critical` marks a channel that gates a mission objective or a hard limit.
// Those never jitter. See Readout for why.
const CHANNELS = [
  { id: 'T',      legend: 'Ti',      unit: 'keV',  decimals: 1, critical: true,  feature: null,
    read: (p) => p.T },
  { id: 'ne',     legend: 'ne',      unit: 'e20 m-3', decimals: 2, critical: false, feature: 'density',
    read: (p, c) => c.density },
  { id: 'tauE',   legend: 'tau_E',   unit: 's',    decimals: 2, critical: false, feature: 'fulldash',
    read: (p) => p.tauE },
  { id: 'Q',      legend: 'Q',       unit: '',     decimals: 2, critical: true,  feature: 'fulldash',
    read: (p) => p.Q },
  // The ratio, not a fabricated Troyon beta_N. The engine carries beta and
  // betaLimit; multiplying by an invented 3.2 to make the number look like a
  // literature beta_N would be exactly the uncited magic number CLAUDE.md
  // calls a defect. The existing Gauge shows this same ratio.
  { id: 'beta',   legend: 'beta/max', unit: '',    decimals: 2, critical: true,  feature: 'density',
    read: (p) => (p.betaLimit > 0 ? p.beta / p.betaLimit : 0) },
  { id: 'pFus',   legend: 'P_fus',   unit: 'MW',   decimals: 0, critical: false, feature: 'neutrons',
    read: (p) => p.pFusionMW },
  { id: 'pNet',   legend: 'P_net',   unit: 'MW',   decimals: 0, critical: true,  feature: 'finance',
    read: (p) => p.netElecMW },
  { id: 'divT',   legend: 'T_div',   unit: 'degC', decimals: 0, critical: true,  feature: 'fulldash',
    read: (p) => p.divertorTempC },
];

/**
 * The parameter stack: one recessed well, engraved rules between channels,
 * values right-aligned on a fixed decimal column so digits never move. Units
 * are engraved on the panel outside the well; the well holds only lit data.
 */
export default function ReadoutStack() {
  const physics = useReactorStore((s) => s.sim.physics);
  const controls = useReactorStore((s) => s.sim.controls);
  const ticks = useReactorStore((s) => s.sim.time.ticks);
  const levelId = useReactorStore((s) => s.level.id);
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const features = unlockedFeatures(levelId);

  const rows = CHANNELS.filter((ch) => !ch.feature || features.has(ch.feature));

  return (
    <section className="panel p-2 flex flex-col min-h-0" aria-label="Parameter readouts">
      <Legend size="xs" className="mb-1.5">Parameter readout</Legend>
      <Well className="flex-1 overflow-y-auto py-1">
        {rows.map((ch, i) => (
          <div
            key={ch.id}
            className={`flex items-baseline gap-2 px-2 py-1 ${i > 0 ? 'engrave-rule' : ''}`}
          >
            <span className="legend text-[9px] w-14 shrink-0" style={{ color: 'var(--phosphor-dim)' }}>
              {ch.legend}
            </span>
            <span className="flex-1 text-right">
              <Readout
                value={ch.read(physics, controls)}
                decimals={ch.decimals}
                channel={ch.id}
                tick={ticks}
                critical={ch.critical}
                reducedMotion={reducedMotion}
                className="text-[13px]"
              />
            </span>
            <span className="legend text-[8px] w-16 shrink-0" style={{ color: 'var(--phosphor-dim)' }}>
              {ch.unit}
            </span>
          </div>
        ))}
      </Well>
    </section>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build && npm run balance`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/console/ReadoutStack.jsx
git commit -m "Add the parameter readout stack

One continuous well with engraved channel rules rather than eight separate
wells, values right-aligned on a fixed decimal column. Channels that gate a
mission objective are marked critical and never jitter."
```

---

### Task 10: Control bank

**Files:**
- Create: `src/components/console/TravelBar.jsx`, `src/components/console/GuardedToggle.jsx`, `src/components/console/ControlBank.jsx`

**Interfaces:**
- Consumes: store `sim.controls`, `setControl`; `Well`, `Legend`, `Readout`.
- Produces: `<ControlBank />`, `<TravelBar controlKey unit min max step decimals danger disabled />`, `<GuardedToggle label armedLabel onCommit />`.

**Design note.** Not a restyled slider. A travel bar shows a phosphor setpoint tick and a dimmer process-value tick so the operator can see commanded and actual diverge. Danger bands are engraved onto the scale rather than drawn as a coloured fill. Every control is keyboard reachable: arrows step by `step`, Home and End go to the bounds.

- [ ] **Step 1: Write the travel bar**

Create `src/components/console/TravelBar.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import Legend from './Legend.jsx';
import Readout from './Readout.jsx';

/**
 * A detented travel control in a recessed well.
 *
 * The phosphor tick is the setpoint the operator commanded. The dim tick is
 * the process value the plant actually reached. On controls where the plant
 * follows instantly the two coincide; where it lags, the gap is the point.
 *
 * The underlying input is a native range so keyboard, screen readers and touch
 * all work without reimplementing them. It is made invisible rather than
 * replaced.
 */
export default function TravelBar({
  controlKey, label, unit, min, max, step, decimals = 1,
  danger, processValue, disabled = false,
}) {
  const value = useReactorStore((s) => s.sim.controls[controlKey]);
  const setControl = useReactorStore((s) => s.setControl);
  const frac = max > min ? (value - min) / (max - min) : 0;
  const procFrac = processValue !== undefined && max > min
    ? Math.min(Math.max((processValue - min) / (max - min), 0), 1)
    : null;
  const dangerFrac = danger !== undefined && max > min ? (danger - min) / (max - min) : null;
  const past = danger !== undefined && value > danger;

  return (
    <div className={`panel-sub px-2 py-1.5 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <Legend size="xs">
          <label htmlFor={`ctl-${controlKey}`}>{label}</label>
        </Legend>
        <Readout
          value={value}
          decimals={decimals}
          unit={unit}
          critical
          className={`text-[11px] ${past ? 'readout--dim' : ''}`}
        />
      </div>

      <div className="relative mt-1">
        <div className="well h-5 relative overflow-hidden">
          {/* engraved scale: ten detents */}
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${i * 10}%`, background: 'var(--well-rule)' }}
            />
          ))}
          {/* engraved danger band boundary, not a coloured fill */}
          {dangerFrac !== null && dangerFrac >= 0 && dangerFrac <= 1 && (
            <span
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${dangerFrac * 100}%`, background: 'var(--al-live)' }}
              aria-hidden="true"
            />
          )}
          {/* process value: where the plant actually is */}
          {procFrac !== null && (
            <span
              className="absolute top-1 bottom-1 w-[2px]"
              style={{ left: `${procFrac * 100}%`, background: 'var(--phosphor-dim)' }}
              aria-hidden="true"
            />
          )}
          {/* setpoint: what the operator commanded */}
          <span
            className="absolute top-0 bottom-0 w-[3px]"
            style={{ left: `calc(${frac * 100}% - 1px)`, background: 'var(--phosphor)' }}
            aria-hidden="true"
          />
        </div>

        <input
          id={`ctl-${controlKey}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => setControl(controlKey, parseFloat(e.target.value))}
          aria-label={`${label}, ${value.toFixed(decimals)} ${unit ?? ''}`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-between mt-0.5">
        <Legend size="xs" className="opacity-60">{min}</Legend>
        {danger !== undefined && <Legend size="xs" style={{ color: 'var(--al-live)' }}>Lim {danger}</Legend>}
        <Legend size="xs" className="opacity-60">{max}</Legend>
      </div>
    </div>
  );
}
```

Note: the native range must still receive a visible focus ring even though it is transparent. The global `:focus-visible` phosphor outline from Task 2 applies to it and will outline the input's box, which sits exactly over the well. No extra code needed; verify it in Step 4.

- [ ] **Step 2: Write the guarded toggle**

Create `src/components/console/GuardedToggle.jsx`:

```jsx
import { useState } from 'react';
import Legend from './Legend.jsx';

/**
 * A guarded switch. The guard has to be lifted before the switch is live,
 * which is what a real panel does for anything you cannot casually undo.
 * Keyboard: the guard and the switch are both buttons, in tab order.
 */
export default function GuardedToggle({ label, armedLabel, onCommit, disabled = false }) {
  const [armed, setArmed] = useState(false);

  return (
    <div className={`panel-sub px-2 py-1.5 ${disabled ? 'opacity-40' : ''}`}>
      <Legend size="xs">{label}</Legend>
      <div className="flex gap-1 mt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setArmed((a) => !a)}
          aria-pressed={armed}
          className="legend text-[9px] px-2 py-1 panel flex-1"
        >
          {armed ? 'Guard up' : 'Guard down'}
        </button>
        <button
          type="button"
          disabled={disabled || !armed}
          onClick={() => { onCommit(); setArmed(false); }}
          className="legend text-[9px] px-3 py-1 well flex-1 disabled:opacity-30"
          style={{ color: armed ? 'var(--al-live)' : 'var(--phosphor-dim)' }}
        >
          {armedLabel}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the bank**

Create `src/components/console/ControlBank.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import { unlockedFeatures } from '../../engine/levels.js';
import TravelBar from './TravelBar.jsx';
import GuardedToggle from './GuardedToggle.jsx';
import Legend from './Legend.jsx';

/**
 * The control bank. Controls sit directly beneath the readouts they affect,
 * grouped by function the way they are on a real panel.
 */
export default function ControlBank() {
  const bMax = useReactorStore((s) => s.sim.controls.bMax);
  const safeB = useReactorStore((s) => s.sim.physics.magnetSafeB);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  const shutdown = useReactorStore((s) => s.shutdownPlasma);
  const levelId = useReactorStore((s) => s.level.id);
  const features = unlockedFeatures(levelId);

  return (
    <section className="panel p-2" aria-label="Control bank">
      <Legend size="xs" className="mb-1.5">Control bank</Legend>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1.5">
        <TravelBar
          controlKey="B" label="Shaping / toroidal field" unit="T"
          min={1} max={bMax} step={0.1} decimals={1} danger={Number(safeB.toFixed(1))}
        />
        <TravelBar
          controlKey="heat" label="Heating / NBI + ICRF" unit="MW"
          min={0} max={50} step={0.5} decimals={1}
          disabled={!features.has('heat')}
        />
        {features.has('density') && (
          <TravelBar
            controlKey="density" label="Fueling / gas injection" unit="e20 m-3"
            min={0.1} max={5} step={0.05} decimals={2}
          />
        )}
        {features.has('fuelmix') && (
          <TravelBar
            controlKey="fuelMix" label="Fueling / tritium fraction" unit=""
            min={0.05} max={0.95} step={0.05} decimals={2}
          />
        )}
        {features.has('fulldash') && (
          <TravelBar
            controlKey="cooling" label="Divertor / active cooling" unit="MW"
            min={0} max={100} step={1} decimals={0}
          />
        )}
        {plasmaOn && (
          <GuardedToggle
            label="Plasma / termination"
            armedLabel="Vent plasma"
            onCommit={shutdown}
          />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify build and keyboard reach**

Run: `npm run build && npm run balance`
Expected: both exit 0.

After Task 11 wires the console into the app, come back and verify in the browser: Tab reaches every travel bar, arrow keys step the value by exactly `step`, Home and End jump to `min` and `max`, and the phosphor focus outline is visible over the well. Native range inputs give all of this for free; this step confirms the transparent overlay did not break it.

- [ ] **Step 5: Commit**

```bash
git add src/components/console/TravelBar.jsx src/components/console/GuardedToggle.jsx src/components/console/ControlBank.jsx
git commit -m "Add the control bank: travel bars and guarded switches

A travel bar shows the commanded setpoint in phosphor and the process value in
dim, so the operator can see the two diverge. Danger is an engraved boundary on
the scale, not a coloured fill. The native range input is kept underneath and
made transparent, so keyboard and screen reader support come for free."
```

---

### Task 11: Console shell and app wiring

**Files:**
- Create: `src/components/console/FusionConsole.jsx`
- Modify: `src/App.jsx:142-199`

**Interfaces:**
- Consumes: `Annunciator`, `ShiftHeader`, `ReadoutStack`, `ControlBank` from Tasks 7 to 10.
- Produces: `<FusionConsole />`, rendered by `App` when `mode !== 'fission'`.

**Design note.** The station fills the viewport and does not scroll as a whole. Only wells scroll internally. Below 900px it reflows into stacked groups with the annunciator pinned to the top and the control bank pinned to the bottom. Tailwind's `lg` breakpoint is 1024px, so the 900px reflow needs an arbitrary variant: `min-[900px]:`.

- [ ] **Step 1: Write the shell**

Create `src/components/console/FusionConsole.jsx`:

```jsx
import { Suspense, lazy } from 'react';
import Annunciator from './Annunciator.jsx';
import ShiftHeader from './ShiftHeader.jsx';
import ReadoutStack from './ReadoutStack.jsx';
import ControlBank from './ControlBank.jsx';
import Legend from './Legend.jsx';

const MimicWell = lazy(() => import('../mimic/MimicWell.jsx'));

/** Holds the mimic well's shape while its chunk arrives, so nothing reflows. */
function MimicFallback() {
  return (
    <div className="well h-full w-full flex items-center justify-center">
      <Legend size="xs" style={{ color: 'var(--phosphor-dim)' }}>Mimic warming</Legend>
    </div>
  );
}

/**
 * The operator station. Fixed to the viewport: the console does not scroll as
 * a whole, individual wells scroll internally.
 *
 * Below 900px it reflows to stacked groups with the annunciator pinned top and
 * the control bank pinned bottom, because those are the two things an operator
 * must never have to scroll to reach.
 */
export default function FusionConsole() {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--panel-lo)' }}
    >
      <div className="shrink-0">
        <Annunciator />
        <ShiftHeader />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto min-[900px]:overflow-hidden grid gap-1 p-1 grid-cols-1 min-[900px]:grid-cols-[minmax(210px,240px)_1fr_minmax(220px,280px)]">
        <ReadoutStack />
        <Suspense fallback={<MimicFallback />}>
          <MimicWell />
        </Suspense>
        <section className="panel p-2 min-h-0" aria-label="Trend strips">
          <Legend size="xs">Trend</Legend>
          {/* TrendBank lands in Plan 1 Task 13 */}
        </section>
      </div>

      <div className="shrink-0">
        <ControlBank />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route fusion mode to the console in `src/App.jsx`**

Add the import beside the other eager imports at the top:

```jsx
import FusionConsole from './components/console/FusionConsole.jsx';
```

Replace the entire returned JSX block at lines 142 to 199 (from `return (` through the closing of the instrument column div, keeping the modal block below it) with:

```jsx
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {mode === 'fission' ? (
        <>
          <TopHUD />
          <div className="flex-1 relative min-h-0">
            <div className="h-[38%] lg:h-full lg:absolute lg:inset-0">
              <Suspense fallback={<SceneFallback />}>
                <FissionScene />
              </Suspense>
            </div>
            <div className="absolute top-2 right-2 lg:right-[424px] w-64 sm:w-72 z-20">
              <NotificationStack />
            </div>
            <HeroOverlay />
            <TutorialOverlay />
            <div className="absolute inset-x-0 bottom-0 top-[38%] lg:left-auto lg:top-3 lg:right-3 lg:bottom-3 lg:w-[404px] z-10 flex flex-col min-h-0 lg:rounded-2xl glass overflow-hidden framed [--frame-inset:0px] lg:[--frame-inset:7px]">
              <div className="flex border-b border-slate-700/60 shrink-0">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 py-2.5 label-mono text-[10px] ${
                      tab === t.id ? 'text-ink bg-raise/60 border-b-2 border-accent' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {tab === 'advisor' ? (
                <AdvisorPanel />
              ) : (
                <>
                  <Suspense fallback={null}>
                    <FissionDashboard tabletTab={tab} />
                  </Suspense>
                  <SourcesFooter />
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <FusionConsole />
      )}
```

The modal block (`{pendingCutscene && ...}` through `<AckModal />`) and the closing `</div>` stay exactly as they are.

This keeps fission mode byte-identical to today while fusion mode moves to the console. Plan 2 deletes the fission branch.

- [ ] **Step 3: Verify in the browser**

**Back up the saves first**, per the global constraints. In the browser console before doing anything else:

```js
copy(JSON.stringify(['fusioncore_save_v2_fusion','fusioncore_save_v2_fission','fusioncore_save_v2_career','fusioncore_career_v1','fusioncore_career_runs_v1'].reduce((a,k)=>(a[k]=localStorage.getItem(k),a),{})))
```

Save that output to a scratch file. Restore it after testing with the matching `localStorage.setItem` loop.

Run: `npm run build && npm run balance && npm run career`
Expected: all exit 0.

Start the dev server and confirm:
1. Starting a fusion run shows the console: annunciator across the top, shift header beneath it, readout stack on the left, control bank pinned to the bottom.
2. The T+ clock advances and the shift number is `01`.
3. Moving the field control moves the phosphor setpoint tick.
4. Driving density up past the Greenwald limit latches the `GREENWALD LIMIT` tile, it flashes white, `ACK` silences it, and it stays red until density comes back down.
5. Fission mode still looks exactly as it did before.
6. At 880px wide the console reflows to a single column with the annunciator and control bank still visible without scrolling.
7. With `prefers-reduced-motion` on, a latched tile holds solid white instead of flashing.

- [ ] **Step 4: Commit**

```bash
git add src/components/console/FusionConsole.jsx src/App.jsx
git commit -m "Wire the fusion console into the app

Fusion mode routes to the new station; fission stays byte-identical on the old
dashboard until Plan 2. The station fills the viewport and does not scroll as a
whole: below 900px the annunciator pins top and the control bank pins bottom,
because those are the two things an operator must never scroll to reach."
```

---

### Task 12: Plasma mimic

**Files:**
- Create: `src/components/mimic/PoloidalMimic.jsx`, `src/components/mimic/MimicWell.jsx`
- Modify: `src/components/reactor3d/ReactorScene.jsx:50-56` (coil material), and the scene background

**Interfaces:**
- Consumes: store `sim.physics` (`beta`, `betaLimit`, `divertorTempC`, `divertorLimitC`, `plasmaOn`, `T`), `sim.controls.B`.
- Produces: `<MimicWell />`, default export, lazy-loaded by `FusionConsole`.

- [ ] **Step 1: Write the cross-section**

Create `src/components/mimic/PoloidalMimic.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';

// Poloidal cross-section in a 200 x 220 viewBox. The machine is drawn once as
// static geometry; only the separatrix, the field lines and the divertor glow
// respond to plant state.
const CX = 100;
const CY = 100;

/**
 * The mimic board: a cross-section through the machine, the way a plant draws
 * itself on a wall panel. Steel for structure, --plasma for the plasma and the
 * cryogenic systems, phosphor for anything that is a reading.
 */
export default function PoloidalMimic() {
  const beta = useReactorStore((s) => s.sim.physics.beta);
  const betaLimit = useReactorStore((s) => s.sim.physics.betaLimit);
  const B = useReactorStore((s) => s.sim.controls.B);
  const bMax = useReactorStore((s) => s.sim.controls.bMax);
  const divT = useReactorStore((s) => s.sim.physics.divertorTempC);
  const divLimit = useReactorStore((s) => s.sim.physics.divertorLimitC);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);

  // The separatrix breathes with pressure: more beta, a fatter plasma.
  const betaFrac = betaLimit > 0 ? Math.min(beta / betaLimit, 1.2) : 0;
  const a = 34 + betaFrac * 10;            // minor radius
  const elong = 1.6;                        // elongation, fixed by the machine

  // Field lines crowd inboard as the field rises.
  const fieldFrac = bMax > 0 ? Math.min(B / bMax, 1) : 0;
  const lines = [0.45, 0.65, 0.85];

  // Divertor legs glow with heat flux.
  const divFrac = divLimit > 0 ? Math.min(divT / divLimit, 1.2) : 0;
  const divGlow = plasmaOn ? Math.min(divFrac, 1) : 0;

  return (
    <svg viewBox="0 0 200 220" className="w-full h-full" role="img"
         aria-label={`Machine cross-section. Field ${B.toFixed(1)} tesla, divertor ${divT.toFixed(0)} degrees.`}>
      {/* graticule */}
      <g stroke="var(--well-rule)" strokeWidth="0.5">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="220" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20} x2="200" y2={i * 20} />
        ))}
      </g>

      {/* vacuum vessel */}
      <ellipse cx={CX} cy={CY} rx="62" ry={62 * elong * 0.62} fill="none"
               stroke="#8E9186" strokeWidth="3" />
      <ellipse cx={CX} cy={CY} rx="55" ry={55 * elong * 0.62} fill="none"
               stroke="#6B6E64" strokeWidth="1.5" />

      {/* TF coil cross-sections, inboard and outboard */}
      {[CX - 78, CX + 78].map((x) => (
        <rect key={x} x={x - 7} y={CY - 34} width="14" height="68"
              fill="#8E9186" stroke="#C6C8BC" strokeWidth="0.75" />
      ))}

      {/* field lines: nested flux surfaces, crowding inboard with B */}
      {plasmaOn && lines.map((f, i) => (
        <ellipse
          key={i}
          cx={CX - fieldFrac * 4}
          cy={CY}
          rx={a * f}
          ry={a * f * elong}
          fill="none"
          stroke="var(--plasma)"
          strokeWidth="0.75"
          opacity={0.25 + fieldFrac * 0.35}
        />
      ))}

      {/* separatrix: the plasma boundary, breathing with beta */}
      {plasmaOn && (
        <ellipse cx={CX} cy={CY} rx={a} ry={a * elong}
                 fill="var(--plasma)" fillOpacity="0.10"
                 stroke="var(--plasma)" strokeWidth="1.5" />
      )}

      {/* divertor legs and target plates */}
      <g stroke={divGlow > 0.85 ? 'var(--al-live)' : 'var(--phosphor)'}
         strokeWidth="2" opacity={0.35 + divGlow * 0.65}>
        <line x1={CX - 18} y1={CY + a * elong} x2={CX - 30} y2={CY + 74} />
        <line x1={CX + 18} y1={CY + a * elong} x2={CX + 30} y2={CY + 74} />
      </g>
      <rect x={CX - 42} y={CY + 74} width="84" height="5"
            fill={divGlow > 0.85 ? 'var(--al-live)' : '#6B6E64'} />

      {/* corner registration marks */}
      <g stroke="var(--phosphor-dim)" strokeWidth="1" fill="none">
        <path d="M 4 12 L 4 4 L 12 4" />
        <path d="M 188 4 L 196 4 L 196 12" />
        <path d="M 4 208 L 4 216 L 12 216" />
        <path d="M 188 216 L 196 216 L 196 208" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Write the well and bezel toggle**

Create `src/components/mimic/MimicWell.jsx`:

```jsx
import { lazy, Suspense, useState } from 'react';
import Well from '../console/Well.jsx';
import Legend from '../console/Legend.jsx';
import PoloidalMimic from './PoloidalMimic.jsx';

// The 3D scene stays lazy: a player who never opens ISO never downloads three.
const ReactorScene = lazy(() => import('../reactor3d/ReactorScene.jsx'));

/**
 * The mimic well. XSEC is the cross-section board and the default view. ISO is
 * the existing 3D machine, kept because being able to look at the plasma from
 * any angle is worth having, but it is a viewport rather than an instrument, so
 * it is not what you are looking at by default.
 */
export default function MimicWell() {
  const [view, setView] = useState('xsec');

  return (
    <section className="panel p-2 flex flex-col min-h-0" aria-label="Plasma mimic">
      <div className="flex items-center gap-2 mb-1.5">
        <Legend size="xs">Plasma mimic</Legend>
        <div className="flex-1" />
        {[['xsec', 'Xsec'], ['iso', 'Iso']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`legend text-[9px] px-2 py-0.5 ${view === id ? 'well' : 'panel-sub'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Well className="flex-1 min-h-0 relative">
        {view === 'xsec' ? (
          <PoloidalMimic />
        ) : (
          <Suspense fallback={<div className="w-full h-full" />}>
            <ReactorScene />
          </Suspense>
        )}
      </Well>
    </section>
  );
}
```

- [ ] **Step 3: Retone the 3D scene**

In `src/components/reactor3d/ReactorScene.jsx`, the coil material at lines 50 to 56 currently sets `color="#64748B"` (slate blue). Change both the mesh material and the `m.color.set('#64748B')` in the `useFrame` normal-view branch to the console's steel:

```jsx
            <meshStandardMaterial color="#8E9186" metalness={0.85} roughness={0.35} />
```

```js
        m.color.set('#8E9186');
```

Then find the `<Canvas>` background or scene clear color and set it to the well color `#0D0F0C`, so the ISO view sits in the same darkness as the XSEC board rather than on navy.

Leave the plasma shader, the analysis heatmap and `Effects` alone. The heatmap is a diagnostic scale, not decoration, and retoning it would break the stress view's meaning.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run balance && npm run career`
Expected: all exit 0.

In the browser, with saves backed up:
1. The mimic well shows the cross-section by default, with the graticule and corner marks.
2. Raising the field crowds the flux surfaces inboard.
3. Raising heating raises beta and the separatrix visibly fattens.
4. Driving the divertor hot turns the target plate and legs red.
5. Pressing `ISO` loads the 3D scene into the same well, on the dark well ground with steel coils.
6. The three.js chunk is not requested until `ISO` is pressed. Confirm in the network panel.

- [ ] **Step 5: Commit**

```bash
git add src/components/mimic/ src/components/reactor3d/ReactorScene.jsx
git commit -m "Add the plasma mimic: cross-section board, 3D as second view

XSEC is a real mimic board driven by plant state: flux surfaces crowd inboard
with field, the separatrix breathes with beta, divertor legs glow with heat
flux. ISO keeps the 3D machine, retoned to steel on the well ground, and stays
lazy so a player who never opens it never downloads three.js."
```

---

### Task 13: Trend strips

**Files:**
- Create: `src/components/console/TrendStrip.jsx`, `src/components/console/TrendBank.jsx`
- Modify: `src/components/console/FusionConsole.jsx` (replace the trend placeholder)

**Interfaces:**
- Consumes: store `history` (ring buffer, 240 entries, one sample every 5 ticks, so 0.5 s per sample and a 120 s window), `unlockedFeatures`.
- Produces: `<TrendBank />`.

**Design note.** All strips share one time base, one graticule and one sweep-rate legend. The window is 120 s across 12 divisions, so the legend reads `10 s/div`. Each strip carries an engraved channel legend and a phosphor current value at the right edge where the trace enters. This replaces `HistoryChart` and `OverlayChart` for the fusion console; both files stay on disk for fission until Plan 2.

- [ ] **Step 1: Write the strip**

Create `src/components/console/TrendStrip.jsx`:

```jsx
import { memo } from 'react';
import Legend from './Legend.jsx';
import Readout from './Readout.jsx';

const W = 240;   // one x unit per sample: 240 samples, 120 s
const H = 34;

/**
 * One trend channel on the shared time base. The trace enters at the right
 * edge, where the current value is also printed: that is where the pen would
 * be on a real strip chart.
 */
function TrendStrip({ legend, unit, decimals, samples, color = 'var(--phosphor)' }) {
  const values = samples.filter(Number.isFinite);
  const current = values.length > 0 ? values[values.length - 1] : NaN;

  // Autoscale to the window, with a floor so a flat trace does not fill the
  // strip with noise amplified to full height.
  const lo = values.length > 0 ? Math.min(...values) : 0;
  const hi = values.length > 0 ? Math.max(...values) : 1;
  const span = Math.max(hi - lo, Math.abs(hi) * 0.05, 1e-6);

  const points = values
    .map((v, i) => {
      const x = W - (values.length - 1 - i);
      const y = H - ((v - lo) / span) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex items-center gap-1.5">
      <Legend size="xs" className="w-12 shrink-0" style={{ color: 'var(--phosphor-dim)' }}>
        {legend}
      </Legend>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="flex-1 h-9" aria-hidden="true">
        <g stroke="var(--well-rule)" strokeWidth="0.5">
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={i * 20} y1="0" x2={i * 20} y2={H} />
          ))}
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} />
        </g>
        {values.length > 1 && (
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.25"
                    vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <span className="w-16 shrink-0 text-right">
        <Readout value={current} decimals={decimals} unit={unit} critical className="text-[10px]" />
      </span>
    </div>
  );
}

export default memo(TrendStrip);
```

- [ ] **Step 2: Write the bank**

Create `src/components/console/TrendBank.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import { unlockedFeatures } from '../../engine/levels.js';
import Well from './Well.jsx';
import Legend from './Legend.jsx';
import TrendStrip from './TrendStrip.jsx';

// The store samples history every 5 ticks at 10 Hz, so 0.5 s per sample and
// 240 samples is a 120 s window. Twelve divisions puts it at 10 s per division.
const SWEEP_LABEL = '10 s/div';

const CHANNELS = [
  { key: 'T',    legend: 'Ti',    unit: 'keV', decimals: 1, feature: null },
  { key: 'pFus', legend: 'P_fus', unit: 'MW',  decimals: 0, feature: 'neutrons' },
  { key: 'Q',    legend: 'Q',     unit: '',    decimals: 2, feature: 'fulldash' },
  { key: 'net',  legend: 'P_net', unit: 'MW',  decimals: 0, feature: 'finance' },
];

function exportTelemetryCsv() {
  const hist = useReactorStore.getState().history;
  if (hist.length === 0) return;
  const keys = Object.keys(hist[hist.length - 1]);
  const csv = [keys.join(','), ...hist.map((h) => keys.map((k) => h[k] ?? '').join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fusioncore_telemetry.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/** Trend strips on one shared time base and one graticule. */
export default function TrendBank() {
  const history = useReactorStore((s) => s.history);
  const levelId = useReactorStore((s) => s.level.id);
  const features = unlockedFeatures(levelId);
  const shown = CHANNELS.filter((c) => !c.feature || features.has(c.feature));

  return (
    <section className="panel p-2 flex flex-col min-h-0" aria-label="Trend strips">
      <div className="flex items-center gap-2 mb-1.5">
        <Legend size="xs">Trend</Legend>
        <Legend size="xs" className="opacity-70">{SWEEP_LABEL}</Legend>
        <div className="flex-1" />
        <button type="button" onClick={exportTelemetryCsv}
                className="panel-sub legend text-[9px] px-2 py-0.5">
          Csv
        </button>
      </div>
      <Well className="flex-1 min-h-0 overflow-y-auto p-1.5 grid gap-1 content-start">
        {shown.map((c) => (
          <TrendStrip
            key={c.key}
            legend={c.legend}
            unit={c.unit}
            decimals={c.decimals}
            samples={history.map((h) => h[c.key])}
          />
        ))}
      </Well>
    </section>
  );
}
```

- [ ] **Step 3: Replace the placeholder in `FusionConsole.jsx`**

Add the import:

```jsx
import TrendBank from './TrendBank.jsx';
```

Replace the placeholder `<section className="panel p-2 min-h-0" aria-label="Trend strips">...</section>` with:

```jsx
        <TrendBank />
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run balance && npm run career`
Expected: all exit 0.

In the browser: run a fusion campaign for two simulated minutes and confirm the traces fill the window right to left, the sweep legend reads `10 s/div`, the current value at the right edge matches the readout stack, and the CSV export still downloads.

- [ ] **Step 5: Commit**

```bash
git add src/components/console/TrendStrip.jsx src/components/console/TrendBank.jsx src/components/console/FusionConsole.jsx
git commit -m "Add trend strips on one shared time base

The store samples every 5 ticks at 10 Hz, so 240 samples is a 120 s window and
the sweep legend reads 10 s/div. Each strip prints its current value at the
right edge, where the pen would be on a real chart."
```

---

### Task 14: Shift log and boot sequence

**Files:**
- Create: `src/components/console/ShiftLog.jsx`, `src/components/console/BootSequence.jsx`
- Modify: `src/components/console/FusionConsole.jsx`

**Interfaces:**
- Consumes: store `notebook`, `notifications`, `sim.time.simSeconds`, `settings.reducedMotion`; `fmtShiftClock`.
- Produces: `<ShiftLog />`, `<BootSequence onDone />`.

- [ ] **Step 1: Write the shift log**

Create `src/components/console/ShiftLog.jsx`:

```jsx
import { useReactorStore } from '../../store/reactorStore.js';
import { fmtShiftClock } from '../../utils/consoleFormat.js';
import Well from './Well.jsx';
import Legend from './Legend.jsx';

/**
 * The shift log. Events with timestamps and units, in the order they happened.
 * The plant writes this, so it does not editorialise.
 */
export default function ShiftLog() {
  const notebook = useReactorStore((s) => s.notebook);
  const entries = [...notebook].slice(-40).reverse();

  return (
    <section className="panel p-2 flex flex-col min-h-0" aria-label="Shift log">
      <Legend size="xs" className="mb-1">Shift log</Legend>
      <Well className="flex-1 min-h-0 overflow-y-auto p-1.5" role="log" aria-live="polite">
        {entries.length === 0 ? (
          <span className="readout readout--dim text-[10px]">No entries this shift.</span>
        ) : (
          entries.map((n, i) => (
            <div key={n.id ?? i} className="readout text-[10px] leading-relaxed flex gap-2">
              <span className="readout--dim shrink-0">
                T+{fmtShiftClock(n.simTime ?? 0)}
              </span>
              <span className="min-w-0">{n.text}</span>
            </div>
          ))
        )}
      </Well>
    </section>
  );
}
```

`logNote` already stamps every entry with `simTime` (see `src/store/reactorStore.js:980`, which builds `{ id, simTime, kind, text, reason }`). No store change is needed. Entries also carry `kind`, one of `decision` or `event`; the log does not currently distinguish them visually, and does not need to.

- [ ] **Step 2: Write the boot sequence**

Create `src/components/console/BootSequence.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';
import Legend from './Legend.jsx';

// Staged power-up, about 2 s total. Skippable by any key or click.
const STAGES = [
  { at: 0,    text: 'Station bus energized' },
  { at: 350,  text: 'Instrument wells illuminated' },
  { at: 750,  text: 'Annunciator self test' },
  { at: 1350, text: 'Diagnostics online' },
  { at: 1750, text: 'Shift clock running' },
];

/**
 * The console powers up rather than appearing. Two seconds, skippable, and
 * skipped entirely under reduced motion: the boot is atmosphere, not
 * information, so it is the first thing to go.
 */
export default function BootSequence({ onDone }) {
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reducedMotion) { onDone(); return undefined; }
    const timers = STAGES.map((s, i) => setTimeout(() => setStage(i + 1), s.at));
    const done = setTimeout(onDone, 2000);
    const skip = () => { onDone(); };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [reducedMotion, onDone]);

  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center"
         style={{ background: 'var(--well)' }}
         role="status" aria-label="Console starting">
      <div className="grid gap-1">
        {STAGES.slice(0, stage).map((s) => (
          <div key={s.at} className="readout text-[11px]">
            <span className="readout--dim">[ ok ]</span> {s.text}
          </div>
        ))}
      </div>
      <Legend size="xs" className="mt-4" style={{ color: 'var(--phosphor-dim)' }}>
        Any key to skip
      </Legend>
    </div>
  );
}
```

- [ ] **Step 3: Host both in `FusionConsole.jsx`**

Add imports and a `booted` state:

```jsx
import { useState, useCallback } from 'react';
import ShiftLog from './ShiftLog.jsx';
import BootSequence from './BootSequence.jsx';
```

Inside the component, before the return:

```jsx
  const [booted, setBooted] = useState(false);
  const finishBoot = useCallback(() => setBooted(true), []);
```

Wrap the outer div with `relative`, add the boot overlay as its first child, and add `<ShiftLog />` as a sibling of `<ControlBank />` in the bottom block:

```jsx
      {!booted && <BootSequence onDone={finishBoot} />}
```

```jsx
      <div className="shrink-0 grid gap-1 min-[900px]:grid-cols-[1fr_minmax(280px,380px)]">
        <ControlBank />
        <ShiftLog />
      </div>
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run balance && npm run career`
Expected: all exit 0.

In the browser, with saves backed up:
1. Starting a run plays the boot sequence for about 2 s, then the console appears.
2. Pressing any key during boot skips straight to the console.
3. With reduced motion on, boot is skipped entirely and the console appears immediately.
4. The shift log shows timestamped entries as events occur.
5. Tab order runs annunciator ACK, header controls, control bank, log, with a visible phosphor outline at every stop.

- [ ] **Step 5: Commit**

```bash
git add src/components/console/ShiftLog.jsx src/components/console/BootSequence.jsx src/components/console/FusionConsole.jsx
git commit -m "Add the shift log and the boot sequence

The console powers up in stages rather than appearing. Boot is atmosphere
rather than information, so reduced motion skips it entirely while the data
keeps updating."
```

---

## Plan self-review

**Spec coverage for stages 1 to 4.** Token layer, Task 1. Fonts and construction primitives, Task 2. Annunciator engine, Task 3. Latch and acknowledge, Task 4. Formatting, Task 5. React primitives with the jitter policy, Task 6. Annunciator grid, Task 7. Shift header, Task 8. Readout stack, Task 9. Control bank with travel bars and guarded toggles, Task 10. Console shell and responsive reflow, Task 11. Mimic, XSEC and ISO, Task 12. Trend strips, Task 13. Shift log and boot, Task 14.

**Deferred to later plans, deliberately:**

- **Audible trip klaxon** in `src/audio/synth.js`. The `MUTE` control and the `muted` flag ship in this plan, but the sound itself lands in Plan 4 alongside the rest of the audio work, so the synth is opened once rather than twice. The control is honest in the meantime: it toggles a real flag that nothing yet reads.
- **`CalcDrawer`, `Cite`, advisor and onboarding rewrites** are the stage 8 copy pass, Plan 4.
- **`ObjectiveBanner`, `CampaignMap`, `TechTree`, `FuelPanel`, `Finance`, `StructurePanel`, `EngineeringPanel`, `AsBuiltPanel`, `ScenarioPanel`, `CrewPanel`, `DutiesPanel`** are not yet placed on the console. This plan builds the station; those panels move onto it in Plan 4's copy and consolidation pass. **This is a real gap:** between Task 11 and Plan 4, fusion players lose access to the tech tree, fuel purchasing and finance. Plan 4 must land before this is shippable, or an interim task must re-host them. Flag this at the Plan 1 review gate.
- **`NotificationStack`, `HeroOverlay`, `TutorialOverlay`, modals** still render over fission mode only. Fusion mode loses them at Task 11 and regains them as panel-mounted plates in Plan 4.

**Type consistency check.** `evaluateTiles(mode, sim)` returns `{[id]: state}` in Task 3 and is consumed with that shape by `tickAnnunciator` in Task 4 and `ann.state[t.id]` in Task 7. `nextAnnunciator(prev, nextState)` and `freshAnnunciator()` are exported from `annunciatorSlice.js` in Task 4 and imported under those exact names by the check script. `fmtShiftClock`, `shiftNumber`, `fmtFixed` are defined in Task 5 and used under those names in Tasks 8, 9, 13 and 14. `Readout` takes `value, decimals, unit, channel, tick, critical, plasma, dim, reducedMotion` in Task 6 and every call site passes a subset of exactly those.

**Known risk.** Task 11 rewires `App.jsx` by replacing a large JSX block. The fission branch is reproduced verbatim from the current file; if it has drifted by the time the task runs, diff against `git show HEAD:src/App.jsx` rather than trusting the block quoted here.
