# FusionCore console overhaul

Design spec, 2026-07-30.

## Problem

FusionCore currently renders a fusion reactor simulator as rounded cards on an
evenly padded grid over a deep navy ground. It reads as a settings page. The
game's premise is that you are the operator on duty at a working fusion plant,
and nothing in the interface commits to that.

## Direction

The whole interface is an operator station. Light painted steel panel faces,
dark recessed instrument wells cut into them, phosphor readouts glowing inside
the wells. The contrast between lit panel and dark well is what makes it read as
physical hardware rather than a web dashboard.

Two qualities lead:

- **Techy.** Physical instrumentation. Engraved legends, recessed wells,
  annunciator tiles, toggle guards. Every number carries units and fixed
  decimal places.
- **Immersive.** The player is on shift. A clock runs. Alarms arrive whether or
  not they are ready. The interface never breaks character to explain itself.

Explicitly not: another dark dashboard with a bright accent color.

## Scope

All four surfaces.

1. Fusion console (`Dashboard.jsx`, `TopHUD.jsx`, the R3F scene)
2. Fission console (`FissionDashboard.jsx`, `FissionScene.jsx`)
3. Career mode (`src/career/`), restyled as plant paperwork on the same steel
4. Shared chrome: title screen, all modals, notification stack, overlays

The physics, economy, level and career engines are not touched. `npm run
balance` and `npm run career` stay green at every stage.

## Token system

### Panel

```css
--panel      #B4B7AA   /* painted steel panel face */
--panel-hi   #C6C8BC   /* top and left bevel, catches light */
--panel-lo   #8E9186   /* bottom and right bevel, in shadow */
--panel-sub  #A5A89B   /* second painted tier for sub-panel groups */
--engrave    #3A3C36   /* engraved legend text, 5.47:1 on --panel */
```

### Wells

```css
--well         #0D0F0C   /* recessed instrument well */
--well-rule    #23261F   /* graticule and channel dividers */
--phosphor     #FFB03A   /* default data color, 10.6:1 on --well */
--phosphor-dim #7A5620   /* de-energized segments, present but unlit */
--plasma       #45C4DE   /* plasma views and cryo systems only, 9.4:1 */
```

`--phosphor-dim` exists because a real readout shows unlit segments rather than
blank space. Inactive channels dim; they do not disappear.

### Annunciator states

```css
--nm #5FA96F   /* normal  */
--ca #E8A93D   /* caution */
--al #D2483A   /* alarm   */
--tr #F2F0E6   /* trip, flashing until acknowledged */
--tile-off        #191B16
--tile-legend     #000000   /* 4.73:1 on --al, the tightest pair in the set */
--tile-legend-off #8A8E82   /* 5.18:1 on --tile-off */
```

**Contrast finding.** On the alarm-red tile, neither `--engrave` (4.35:1) nor
white (4.44:1) clears WCAG AA for normal text. Red `#D2483A` sits at relative
luminance 0.186, which boxes in both directions. Pure black clears at 4.73:1 and
is the only option that does. Annunciator legends are therefore `#000000`, not
`--engrave`. Every other foreground/background pair in the token set was checked
the same way and passes AA.

### Colorblind integration

The app ships three colorblind overlays (`body.cb-protanopia` and friends) that
swap `--color-safe`, `--color-warn` and `--color-crit`, plus shape-coded status
borders. If annunciator tiles use raw hex, that support silently breaks.

- The four annunciator states alias onto the existing semantic variables, so the
  overlays keep working with no new code.
- Each tile carries a two-character state code in its right gutter: `NM`, `CA`,
  `AL`, `TR`. This is plant legend, not decoration, so it satisfies the
  no-decorative-icons rule while giving non-color redundancy.

### Type

Two faces, three jobs.

- **Archivo**, condensed width, uppercase, letterspaced. Every panel legend and
  control label. Engraved lettering: small, tight, never sentence case.
- **IBM Plex Mono**, `font-variant-numeric: tabular-nums` mandatory. Every
  numeric readout, unit, log entry and axis label. Tabular figures are required
  so digits do not shift as values change.

Add `@fontsource-variable/archivo` and `@fontsource/ibm-plex-mono`, both at
5.3.0 and both confirmed present on the registry.

Archivo Variable carries a `wdth` axis, so the condensed look comes from
`font-variation-settings: 'wdth' 85`. Decision rule at install: if the
fontsource build ships the `wdth` axis, use the variable package and the
variation setting. If it ships weight only, drop to
`@fontsource/archivo-narrow` and delete the variation setting. The design does
not otherwise depend on which route is taken, and the choice is recorded in a
comment where the face is declared.

Existing font imports for Inter and Geist Mono are removed. The OpenDyslexic
accessibility override must still win over both new faces, and the existing
`body.font-dyslexic *` rule with `!important` already does this. The career
mode serif stack (Fraunces, Literata) is retained; see Career mode below.

### Construction rules

- `border-radius: 0` everywhere. No exceptions.
- Bevels, not shadows. A panel face gets 1px `--panel-hi` on top and left, 1px
  `--panel-lo` on bottom and right. That single rule is what makes it read as
  metal.
- Wells are inset: dark fill, bevel reversed, 2px inner border.
- Density is packed. Whitespace makes it a landing page.
- No glassmorphism. The existing `.glass` utility is deleted.

## Layout

Fixed operator station. Fills the viewport, does not scroll as a whole.
Individual wells scroll internally.

```
+=================================================================+
| ANNUNCIATOR  [GREENWALD ][BETA LIMIT][DIVERTOR  ][TF FIELD ]    |
|              [DISRUPTION][FIRST WALL][TRITIUM   ][NET POWER]    |
+-----------------------------------------+     SHIFT 03  T+04:17:22
| MODE FUSION | MISSION 4 BREAKEVEN |  x1 |     [ACK] [MUTE] [<>] |
+==================+========================+=====================+
| PARAMETER        |   PLASMA MIMIC         |  TREND  10 s/div    |
| READOUT STACK    |  [XSEC] [ISO]          |  +---------------+  |
|                  |                        |  | T      keV    |  |
| Ti      12.4 keV |      ,-----.           |  +---------------+  |
| ne      1.05 e20 |    ,'  ___  `.         |  | P_fus  MW     |  |
| tau_E   1.02 s   |   /  ,'   `. \         |  +---------------+  |
| Q       1.26     |   |  |  x  |  |        |  | Q       --    |  |
| beta_N  2.81     |   \  `.___,' /         |  +---------------+  |
| P_fus   412 MW   |    `.       ,'         |  | P_net  MW     |  |
| P_net   +38 MW   |      `--v--'           |  +---------------+  |
| n.T.tau 3.1e21   |     divertor           |                     |
+==================+========================+=====================+
| CONTROL BANK   [HEATING] [FUELING] [SHAPING] [SERVICE]          |
|  B  ####|----- 11.5 T   heat ##|------ 32 MW   n ###|--- 1.05   |
+-----------------------------------------------------------------+
| SHIFT LOG  T+04:17:08  BETA LIMIT EXCEEDED beta_N 3.41 (lim 3.20)|
+=================================================================+
```

Instruments cluster by function. Related controls sit directly beneath the
readouts they affect.

### Below 900px

Reflows into stacked panel groups. The annunciator grid pins to the top and the
control bank pins to the bottom; everything between scrolls.

```
+---------------------------+
| ANNUNCIATOR (2 rows, pinned)
+---------------------------+
| SHIFT 03  T+04:17:22  ACK |
+---------------------------+
|  scrolls:                 |
|  READOUT STACK            |
|  MIMIC                    |
|  TRENDS                   |
|  SHIFT LOG                |
+---------------------------+
| CONTROL BANK (pinned)     |
+---------------------------+
```

## Components

New directory `src/components/console/`:

| Component | Purpose |
|---|---|
| `Panel` | Beveled painted face. Variants: `face`, `sub`. |
| `Well` | Recessed dark region, reversed bevel, 2px inner border. |
| `Legend` | Engraved Archivo label. |
| `Readout` | Plex Mono value, fixed decimals, units, tabular. |
| `ReadoutStack` | One continuous well, engraved rules between channels. |
| `Annunciator` | The tile grid. |
| `AnnunciatorTile` | One latching tile. |
| `TrendStrip` | One scrolling channel on the shared time base. |
| `TrendBank` | Shared graticule, sweep-rate legend, N strips. |
| `TravelBar` | Detented control with setpoint and process-value ticks. |
| `GuardedToggle` | Guard you flip before the switch is live. |
| `ShiftHeader` | Shift number, T+ clock, ACK, MUTE, speed. |
| `ShiftLog` | Timestamped plant record. |
| `ProcedureCard` | Numbered imperative steps, in the log. |
| `BootSequence` | Staged power-up. |
| `Plate` | Panel-mounted modal surface. |

### Readout stack

One continuous recessed well with engraved horizontal rules between channels,
not eight separate wells. Values right-aligned on a fixed decimal column so
digits never move. Units engraved on the panel face outside the well.

### Trend strips

All strips share one time base, one graticule and one sweep-rate legend
(`10 s/div`). Each carries an engraved channel legend and a phosphor
current-value readout at the right edge where the trace enters. Continuous
right-to-left scroll. This replaces `HistoryChart` and `OverlayChart`; the
existing `history` array in the store already supplies the data, and the CSV
export is retained.

### Control bank

Not sliders with new paint. Each control is a detented travel bar in a well
with an engraved scale, a phosphor setpoint tick and a dimmer process-value
tick, so setpoint and actual can be seen to diverge. Danger bands are engraved
onto the scale rather than drawn as a colored fill.

Everything is keyboard reachable: arrows step by the control's `step`, Home and
End go to the bounds, Enter arms a guarded toggle. Focus is a phosphor outline.
This replaces `ControlSlider.jsx` and the `input[type=range]` styling.

`Gauge.jsx` is retained in concept as a real instrument face and restyled, not
replaced by a bar. Progress bars are removed wherever a gauge, trend or digital
readout is the right instrument. The mission-progress bar in `ObjectiveBanner`
becomes a digital hold counter (`HOLD 00:42 / 01:00`).

## Signature element: the annunciator grid

A row of hard rectangular tiles across the top, each engraved with a real fault
legend, wired directly to physics state and never to scripted events.

New pure module `src/engine/annunciator.js`. No React imports, testable
headlessly, same discipline as the rest of `src/engine/`. Exports a per-mode
tile registry, each entry a pure function of `sim`:

```js
{ id, legend, evaluate(sim) -> 'off' | 'normal' | 'caution' | 'alarm', priority }
```

### Fusion tiles

| Legend | Reads |
|---|---|
| `GREENWALD LIMIT` | `physics.greenwaldFrac` |
| `BETA LIMIT` | `physics.beta / physics.betaLimit` |
| `DIVERTOR HEAT FLUX` | `physics.divertorTempC / physics.divertorLimitC` |
| `TF COIL FIELD` | `controls.B / physics.magnetSafeB` |
| `DISRUPTION RISK` | `physics.stability` |
| `FIRST WALL DPA` | `structure.firstWall` |
| `TRITIUM INVENTORY` | `fuel.tritium` |
| `NET POWER NEGATIVE` | `physics.netElecMW < 0` |

### Fission tiles

| Legend | Reads |
|---|---|
| `FUEL OVER TEMPERATURE` | `physics.TfuelC` against the plant limit |
| `COOLANT NEAR SATURATION` | `physics.TcoolC` against the plant limit |
| `REACTOR TRIP` | `physics.scrammed`, `physics.tripCount` |
| `XENON TRANSIENT` | `physics.xenonPcm` |
| `CLADDING DAMAGE` | `structure.cladding` |
| `VESSEL FLUENCE` | `structure.vessel` |
| `SG TUBE FATIGUE` | `structure.steamGen` |

Every field above was checked against `src/engine/physics.js` and
`src/engine/fission.js` and already exists. No new physics.

Plant limits differ by plant: the research pool trips at 600 °C fuel and 95 °C
coolant, the PWR at 2200 °C and 345 °C. `src/engine/failure.js` already carries
these; the annunciator module reads them from the same place rather than
duplicating the constants.

### Corrections to the original brief

- `LOW DENSITY LIMIT` is wrong for a tokamak. Greenwald is an upper bound: you
  disrupt from too much density, not too little. This project's premise is that
  numbers are cited rather than tuned to feel good, so the legend reads
  `GREENWALD LIMIT`.
- `LOCKED MODE` is dropped. There is no locked-mode physics in the engine, and
  the requirement is that tiles are wired to state rather than to scripted
  events. Adding the tile would mean faking the condition.

### Latch and acknowledge

New store slice:

```js
annunciator: {
  state: { [tileId]: 'off' | 'normal' | 'caution' | 'alarm' },
  latched: { [tileId]: true },    // flashing white, unacknowledged
  acked:   { [tileId]: true },    // silenced, still lit at condition color
  muted: true,                    // audible alert off by default
}
```

Behavior:

1. A transition into `caution` or `alarm` latches the tile. It flashes `--tr`
   white and holds, regardless of what the player does elsewhere.
2. `ACK` clears the flash on all latched tiles.
3. An acknowledged tile stays lit at its condition color until the underlying
   condition actually clears in physics. It does not clear on acknowledgement.
4. A condition that clears and re-occurs latches again.

Evaluation runs in the existing store tick, which already computes `alarmLevel`
from `sim.hazards`. The annunciator supersedes `HazardBanner.jsx`.

### Audible alert

`src/audio/synth.js` already has a procedural LFO-gated alarm layer and a
volume system. The trip klaxon is added there rather than as a new subsystem.
Off by default, with a `MUTE` control in the shift header wired to the same
settings the rest of the audio already uses.

## Plasma mimic

The mimic well has two views, swapped by a hard bezel toggle.

**`XSEC` (default).** New SVG poloidal cross-section, `src/components/mimic/
PoloidalMimic.jsx`. Vessel wall, TF coil cross-sections, a separatrix that
breathes with beta, field lines that shift with `controls.B`, divertor legs that
glow with heat flux. Drawn in `--plasma` and steel against `--well`.

**`ISO`.** The existing R3F scene, retained in full including the thermal-stress
analysis view, retoned to the steel and cold-blue palette: coils in steel greys,
plasma in `--plasma`, background to `--well`. It stays lazy-loaded, so a player
who never opens `ISO` never downloads three.js.

Both render inside the same recessed well behind an engraved bezel with corner
registration marks.

## Motion

- **Boot sequence** on load, about 2s, skippable. Panels power up in stages,
  wells illuminate, a self test sweeps the annunciator row, then the shift clock
  starts.
- **Readout tick.** The last significant digit jitters within instrument noise
  even when the plant is steady.
- **Trend strips** scroll continuously right to left on a real time base with a
  labeled sweep rate.
- **Field lines** in the mimic move with plasma state.

### Jitter safety

The game gates missions on exact thresholds. A jittering `Q 1.00` that is really
`0.99` would be a lie at the moment it matters most.

- Jitter is display-only. It never feeds back into physics, history or save
  state.
- `Readout` takes a `critical` flag. Any readout gating a mission threshold or a
  hard limit is exempt from jitter entirely.
- Jitter is deterministic per channel, not `Math.random()` per frame, so a value
  does not visibly thrash.

### Reduced motion

Both `prefers-reduced-motion: reduce` and the existing in-game
`settings.reducedMotion` kill the boot sequence and the jitter. Data updates,
trend scrolling and annunciator state changes continue: suppressing an alarm
flash would be a safety regression, so a latched tile under reduced motion holds
solid white instead of flashing.

## Copy

Everything is written as a plant would write it. Procedures are numbered steps
in imperative voice. Alarms state the condition, not a feeling. The log records
events with timestamps and units.

Bad: `Oops, your plasma became unstable! Try increasing heating power.`

Good: `T+02:14:08 BETA LIMIT EXCEEDED beta_N 3.41 (limit 3.20) MODE: disruption`

### Teaching layer

Every teaching mechanism is kept. The register changes, the content does not.
This project exists to teach real plasma physics with citations, and losing that
to a style rule would be a bad trade.

- **`CalcDrawer`** becomes an engraved `CALC` pull-out on the panel. Same
  equation, same step table, same `limitedBy` list, same citations. Prose is
  rewritten as plant documentation: `Q = P_fus / P_heat-elec. Wall-plug draw
  20.0 MW. Absorbed 4.0 MW. Radiated 1.2 MW.`
- **`Cite`** markers and `SourcesFooter` are retained, restyled as engraved
  reference numbers keyed to a `REFERENCES` plate.
- **Advisor** messages become numbered procedure cards in the shift log.
- **Onboarding** becomes a `QUALIFICATION` run with signed-off steps.
- **Hazard fix hints** (`Lower Fuel Density or raise Field`) become imperative
  corrective actions on the procedure card the alarm raises.
- **`didyouknow.json`** entries become `TECHNICAL BULLETIN` entries in the log.

No tooltips in tutorial voice. No emoji. No decorative icons.

## Modals

Modals become panel-mounted plates: square, beveled, seated on a dimmed console
with the machine still live and audible behind them. Covers `SettingsModal`,
`CaseFilesModal`, `GameOverModal`, `CareerModal`, `AckModal`,
`LevelUpCutscene`, `TitleScreen`.

`GameOverModal` in particular is already an incident report from
`src/engine/failure.js`, which is exactly the right voice. It becomes a filed
`INCIDENT REPORT` plate with no rewriting of the analysis.

## Career mode

Career mode is a life story, not a control room. Forcing annunciator language
onto it would strain the metaphor and lose what the mode is for.

It becomes **plant paperwork**: typed memos, personnel files, carbon-copy forms
and route slips sitting on the console desk. Paper stays warm, because paper is
warm, but it is bound to the console by shared construction: square corners,
the same bevel language on folder edges, Archivo for stamped headers and form
legends, Plex Mono for dates, reference numbers and tabular figures. The
Fraunces and Literata serif stack is retained for body prose, since a personnel
file is typeset prose and reading it in condensed uppercase would be hostile.

`career-theme.css` is rewritten against the console tokens rather than deleted.
`CharacterCreation` becomes a personnel intake form, `EventCard` a memo,
`Retrospective` a filed performance review, `YearSummary` an annual report.

## Accessibility floor

- Every control keyboard reachable. A real operator station has hard buttons for
  everything.
- Visible focus using a phosphor outline, `2px solid var(--phosphor)` with
  offset, replacing the current accent outline.
- All foreground/background pairs clear WCAG AA. The tightest pair in the system
  is black on alarm red at 4.73:1.
- Annunciator state is carried by color, by the two-character state code, and by
  the flash behavior, so it never depends on hue alone.
- Existing colorblind overlays keep working through the semantic variable
  aliases.
- 44px minimum touch targets on coarse pointers, as today.
- Text-to-speech (`SpeakerIcon`, `useTTS`) is retained on every message.
- UI scaling 75 to 150% via `--ui-scale` is retained. Panel bevels stay 1px at
  all scales; they are hairlines, not scaled rules.

## Sequencing

Each stage leaves the app running and both suites green.

1. Tokens, `console.css`, and the console primitives
2. `src/engine/annunciator.js`, store slice, annunciator grid, shift header
3. Fusion console layout: readout stack, control bank, trends, shift log
4. Plasma mimic: `XSEC` SVG, `ISO` retone, bezel toggle
5. Fission console
6. Career mode as plant paperwork
7. Modals as plates, boot sequence, audible trip alert
8. Copy pass into operator voice across all surfaces

## Verification

- `npm run balance` green after every stage. It is the check that a change has
  not made a level unwinnable, and no visual inspection substitutes for it.
- `npm run career` green after every stage.
- New `scripts/annunciator_check.mjs`: drives `src/engine/annunciator.js`
  headlessly over known plant states and asserts each tile lights on the right
  condition and clears on the right condition. Wired into `npm run balance` so
  there is one command to trust.
- Contrast assertions for the token pairs, checked once and recorded here rather
  than eyeballed per component.
- Browser visual pass at desktop, 900px and mobile widths, plus a
  reduced-motion pass and a keyboard-only pass.

**Before any browser testing**, snapshot and restore these localStorage keys per
`CLAUDE.md`: `fusioncore_save_v2_fusion`, `fusioncore_save_v2_fission`,
`fusioncore_save_v2_career`, `fusioncore_career_v1`,
`fusioncore_career_runs_v1`. The reactor store also keeps the main run in
IndexedDB.

## Out of scope

- Physics, economy, level and career engine logic. Untouched.
- Content volume. The open item of roughly 92 authored career events against a
  250 to 300 target is a separate piece of work, authored in Desmond's voice.
- New game mechanics. This is a visual and copy overhaul, not a design change.
