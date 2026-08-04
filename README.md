# FusionCore

You run the world's first commercially viable fusion reactor. Confine a star,
balance the books, power a city.

An educational browser game: a real-time tokamak engineering simulation where every
micro-adjustment changes how the reactor behaves, and every number carries a citation
to real plasma-physics literature.

## Run it

```bash
npm install
npm run dev        # http://localhost:5199
npm run build      # production bundle in dist/
npm run balance    # levels are winnable, plus the annunciator and contrast checks
```

## The game

Eight levels, each unlocked by holding a real reactor milestone:

1. **First Light**. Sustain a stable plasma
2. **Heating Up**: T ≥ 8.6 keV (≈ 100 million °C)
3. **First Fusion**. Measurable neutron flux
4. **Breakeven**: Q > 1.0
5. **Endurance**. One hour without breaking the machine
6. **First Customers**. Net electricity to the grid
7. **City Scale**. Power 1,000,000 homes
8. **Commercial Era**. Lifetime LCOE under $100/MWh

R&D points buy real technologies (H-mode control, REBCO HTS magnets, tungsten
divertors, lithium breeding blankets, a stellarator conversion), each of which
mutates the machine's physics constants.

## Architecture

- `src/engine/`. Pure, headless physics/economy/levels/tech. No React imports;
  `scripts/balance_check.mjs` runs the same code in Node to prove winnability.
- `src/engine/annunciator.js`: the alarm board. Eight tiles wired to plant
  state, never to scripted events. Four of them read `sim.hazards` for their
  alarm state rather than re-deriving a threshold, so the panel can never
  disagree with the physics about whether a limit was crossed; only the caution
  band is the annunciator's own. A tile latches on any rise in severity and flashes until
  acknowledged, then stays lit until the condition physically clears.
  `scripts/annunciator_check.mjs` drives it headlessly (57 assertions).
- `src/store/reactorStore.js`: Zustand store owning the fixed 10 Hz tick loop
  (100 ms ticks; speed changes retime the interval: 0.25x → 400 ms). Saves go to
  IndexedDB via `idb-keyval` on a 60 s autosave, on level completion, and manually.
- `src/components/`: React UI subscribed through granular selectors. The R3F
  scene reads state inside `useFrame` via `getState()` so the 3D view never
  triggers React re-renders.
- `src/audio/synth.js`. Fully procedural Web Audio soundscape (no audio files):
  50 Hz plant hum, a magnet tone tracking the field slider, LFO-gated alarms.
- `src/data/`: `sources.json` (every citation), `advisor_triggers.json`
  (rule-based advisor conditions, no eval), `didyouknow.json`.

## Physics model (and honest deviations)

- **Fusion power**: P = ¼ n² ⟨σv⟩ E V with ⟨σv⟩ a 5th-degree log-log polynomial
  through six NRL Plasma Formulary points (1–50 keV).
- **Confinement**: IPB98(y,2)-inspired τ_E = H · c₁ · B^0.15 · P^−0.69 · n^0.41
  with machine size folded into c₁.
- **Ignition criterion**: the Lawson triple product n·T·τ_E must clear
  3×10²¹ keV·s·m⁻³, a single-power fit to Lawson's 1957 power-balance
  argument. The PHYSICS view breaks the product into its three factors live,
  flags whichever of the player's sliders is contributing least, and ties the
  100-million-°C operating point back to the D-T reactivity curve ⟨σv⟩(T) so
  the temperature requirement reads as a consequence of the reaction cross
  section, not an arbitrary target.
- **Limits**: Greenwald density limit and a Troyon-like beta limit drive
  disruption probability; exceeding the divertor thermal limit erodes it at the
  spec's 1%/s; first-wall dpa depletes in 120 minutes at 500 MW per the spec.
- **Economy**: $50/MWh spot with Gaussian noise, $30,000/g tritium, 35% thermal
  conversion, recirculating power (heating wall-plug draw, magnets, cooling,
  plant baseline), cumulative LCOE.

**Deviation from the spec, deliberately:** the spec pins τ_E(t=0) = 0.5 s, but with
its own scaling exponents that calibration makes Q > 1 mathematically unreachable
inside the slider bounds. The game would be unwinnable at Level 4. The engine
uses c₁ = 4.2 (initial τ_E ≈ 1.0 s) instead, verified end-to-end by
`npm run balance`: breakeven lands at Q ≈ 1.26 with a maxed non-superconducting
machine, and gigawatt scale requires the HTS + H-mode tech path, exactly the
progression arc the spec intends.

## Accessibility

Text-to-speech on every message (Web Speech API, with graceful degradation),
three colorblind palettes with shape-coded statuses, reduced-motion mode,
locally-hosted OpenDyslexic font, UI scaling 75–150%, full keyboard focus rings.
Keyboard: **Space** pause/resume, **1–4** speed steps.
