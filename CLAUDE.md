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

Playing the app writes real save state. Use `scripts/save-snapshot.js`: paste it
into the browser console, run `await fcSnapshot()`, **save the printed JSON to a
file**, and `await fcRestore(json)` when done.

Do not invent your own backup. This instruction used to say only "snapshot the
keys", and on 2026-08-03 an agent followed it by copying them into a page
variable, reloaded the page, and destroyed a real career save. A reload clears
variables. Write to a file.

Two stores, and a snapshot must cover both. Anything that reads only
localStorage silently misses the reactor runs:

| store | keys |
|---|---|
| localStorage | `fusioncore_career_v1`, `fusioncore_career_runs_v1` |
| IndexedDB `keyval-store` | `fusioncore_save_v2_fusion`, `fusioncore_save_v2_fission` |

"Delete ALL saves" clears both. See `CAREER_STORAGE_KEYS` in
`src/store/reactorStore.js`.

## Working on this

Learned the hard way on this project, mostly by getting it wrong first.

**Show the smallest visible thing before building on it.** A painted-steel
console was specced, planned across fifteen tasks and half built before anyone
looked at it, and the first reaction was that it no longer felt like a game. It
was scrapped. A styleguide page would have surfaced that in fifteen minutes.
For anything visual, put pixels on screen first and build second.

**Measure instead of asserting, including against your own instinct.** The
things that held up here were the ones with a number behind them: black is the
only legend colour clearing AA on alarm red; the old sky-400 accent sat at the
identical luminance to the warning amber; 606 of 611 event flags are written and
never read. The things that failed were the ones that only sounded right.
`scripts/tokens_check.mjs` and `scripts/annunciator_check.mjs` exist so those
claims stay true; add to them rather than re-deriving by eye.

**Say whose decision a thing is.** "Should the SYSTEMS tab be cut or made
mandatory" is a game-design call and belongs to the owner. "Does this text clear
4.5:1" does not. Conflating the two is how a style brief gets executed as a spec
without anyone asking whether it serves the game.

**Authored prose is not a renewable resource.** Career mode has ~900 outcome
branches written by hand. Two engine changes made large fractions of it
unreachable without touching a word of it. Before changing resolution or
selection, measure what still renders. `FEEDBACK.md` tracks what is currently
orphaned.

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
