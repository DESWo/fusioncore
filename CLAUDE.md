# FusionCore

Real-time tokamak engineering simulation, played as a game. React + Vite,
JavaScript (not TypeScript), Zustand-style store. Every number carries a citation
to real plasma-physics literature. See @README.md for the levels and the physics.

## Commands

```bash
npm run dev       # http://localhost:5199
npm run build     # dist/
npm run balance   # headless proof that all 8 levels are winnable
npm run career    # headless career-mode check
npm run annunciator # alarm-board logic only (also runs inside balance)
```

**`npm run balance` is the verification loop.** It is the check to run after
touching the engine, tuning, or any level definition. A change that makes a level
unwinnable passes every visual inspection and fails here.

## Back up saves before any browser testing

Playing the app in a browser session writes real save state. Before driving it
with browser tools, snapshot these localStorage keys and restore them afterwards:

```
fusioncore_save_v2_fusion
fusioncore_save_v2_fission
fusioncore_save_v2_career
```

Career mode also uses `fusioncore_career_v1` and `fusioncore_career_runs_v1`, and
the reactor store keeps the main run in IndexedDB. "Delete ALL saves" clears both
stores; see `CAREER_STORAGE_KEYS` in `src/store/reactorStore.js` for the full list.

## Status

Shipped at quality: visual pass done, QA complete. The only open lever is
content volume, roughly 92 authored events against a 250 to 300 target. New
events are written in my voice, so draft them for review rather than generating
filler.

**`npm run career` currently fails one check** and has since the July 29
event-authoring commits: `content: every event is well-formed and choice labels
fit 40 chars (§7.1)`, from 133 choice labels running 41 to 65 characters. Being
fixed on the `career-label-lengths` branch. Until that lands, the gate for any
change is "career reports that one failure and no other" — a second failing
check means something broke. `npm run balance` is fully green and must stay so.

## Gotchas

- **Physics numbers are cited, not tuned to feel good.** If a constant needs to
  change, the citation has to change with it. Uncited magic numbers in the engine
  are a defect.
- Plain JavaScript with JSX. There is no typechecker, so `npm run balance` and
  `npm run career` are the only automated safety net.
- Lives at `~/fusioncore`, outside the GitHub folder.

## Layout

```
src/engine/       the simulation itself
src/store/        reactorStore.js, the run state and persistence
src/career/       careerStore.js, career mode and its own storage
src/data/         levels, events, citations
scripts/          balance_check.mjs, career_check.mjs, annunciator_check.mjs
```
