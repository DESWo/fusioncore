# Developing FusionCore

Plain JavaScript with JSX. No TypeScript, so the check scripts are the only
safety net there is.

## Commands

```bash
npm run dev          # http://localhost:5199
npm run build        # dist/
npm run balance      # the verification loop, see below
npm run career       # career-mode systems against the spec
npm run annunciator  # alarm-board logic only (also runs inside balance)
npm run units        # number formatting rules (also runs inside balance)
```

**`npm run balance` is the loop that matters.** It proves every level is still
winnable inside the slider bounds, and it chains the annunciator and unit
checks. A tuning change that makes a level unreachable passes every visual
inspection and fails here. Run it after touching the engine, any level
definition, or any constant.

`npm run career` currently fails exactly one check, and has since the July 29
event-authoring commits: 133 choice labels run past the 40-character limit in
§7.1. Being fixed separately. Until it lands, the gate is "career reports that
one failure and no other" — a second failure means something broke.

## Back up saves before browser testing

Playing the app writes real save state. Use `scripts/save-snapshot.js`: paste it
into the browser console, run `await fcSnapshot()`, **save the printed JSON to a
file**, then `await fcRestore(json)` when finished.

Do not improvise a backup. A previous attempt copied the keys into a page-scoped
variable, reloaded the page, and destroyed a real career save. A reload clears
variables; a file survives.

Saves live in two stores and a backup must cover both. Anything reading only
localStorage silently misses the reactor runs:

| store | keys |
|---|---|
| localStorage | `fusioncore_career_v1`, `fusioncore_career_runs_v1` |
| IndexedDB `keyval-store` | `fusioncore_save_v2_fusion`, `fusioncore_save_v2_fission` |

"Delete ALL saves" clears both. See `CAREER_STORAGE_KEYS` in
`src/store/reactorStore.js`.

## House rules

**Physics numbers are cited, not tuned to feel good.** If a constant needs to
change, the citation changes with it. An uncited magic number in the engine is a
defect. Deliberate departures from the source material get written down in the
README rather than hidden.

**Show the smallest visible thing before building on it.** A full control-room
redesign was specced, planned across fifteen tasks and half built before anyone
looked at it, and was scrapped on sight for no longer feeling like a game. A
throwaway styleguide page would have caught that in fifteen minutes.

**Measure instead of asserting.** The decisions that held up here had a number
behind them: black is the only legend colour clearing AA on alarm red; the old
accent sat at the identical luminance to the warning amber; 606 of 611 event
flags are written and never read. The ones that failed only sounded right.
`scripts/tokens_check.mjs`, `annunciator_check.mjs` and `units_check.mjs` exist
to keep those claims true.

**Authored prose is not a renewable resource.** Career mode has roughly 900
outcome branches written by hand. Two engine changes made large fractions of it
unreachable without touching a word. Before changing resolution or selection,
measure what still renders.

## Layout

```
src/engine/    the simulation: physics, economy, levels, tech, annunciator
src/store/     reactorStore.js, run state and persistence
src/career/    careerStore.js, career mode and its own storage
src/data/      levels, events, citations, glossary
src/utils/     units.js sets one formatting rule per quantity
scripts/       the check scripts listed above
```

`src/engine/` is pure and headless: no React imports, so the check scripts can
drive the same code in Node that the game runs in the browser.
