# FusionCore

Confine a star, keep it lit, and sell the power.

A browser game about operating a fusion reactor, where the physics is real
enough to teach you something and honest about where it isn't.

**[Play it](https://fusioncore.wongdesmond.com/)** · no install, saves in your browser

## What you actually do

You run a tokamak from a control room. Three sliders do most of the work:
magnetic field, heating power, and how much fuel you inject. Everything else
follows from those.

The machine fights back. Push density too hard and the plasma disrupts. Push
the field past the coil rating and the magnets quench. Run the divertor over
its thermal limit and it erodes while you watch. You get a grace window on
every violation, and an alarm board that latches until you acknowledge it.

Eight missions, each one a real milestone in the history of the field:

| | |
|---|---|
| 1 · First Light | Sustain a stable plasma |
| 2 · Heating Up | 100 million °C (8.6 keV) |
| 3 · First Fusion | Measurable neutron flux |
| 4 · Breakeven | Q > 1.0, more energy out than in |
| 5 · Endurance | One hour without breaking the machine |
| 6 · First Customers | Net electricity to the grid |
| 7 · City Scale | Power a million homes |
| 8 · Commercial Era | Beat $100/MWh at commercial scale |

R&D points buy real technology: H-mode confinement, REBCO high-temperature
superconducting magnets, tungsten divertors, lithium breeding blankets, a
stellarator conversion. Each one changes the machine's physics constants, and
each one is a trade rather than an upgrade.

There is also a **fission plant** (rods, xenon, decay heat, a real fuel cycle)
and a **career mode** that runs a working life from age 18 to retirement.

## The physics, and where it bends

Every constant traces to a source. `src/data/sources.json` has the citations,
and the game shows them inline rather than in a footnote.

**Fusion power.** P = ¼ n² ⟨σv⟩ E V, with ⟨σv⟩ a 5th-degree log-log polynomial
fitted through six NRL Plasma Formulary points between 1 and 50 keV. The check
suite pins the fit against the Bosch–Hale parameterization at eight off-anchor
temperatures (within 10%, 3–40 keV) and asserts it stays monotonic, so an
anchor typo cannot bend the curve unnoticed.

**Confinement.** An IPB98(y,2)-inspired scaling:
τ_E = H · c₁ · B^0.15 · P^−0.69 · n^0.41, with machine size folded into c₁.

**Limits.** The Greenwald density limit and a Troyon-like beta limit drive
disruption probability. Divertor erosion runs at 1%/s over the thermal limit.
First-wall neutron damage depletes over 120 minutes at 500 MW.

**Economy.** $50/MWh spot with noise, $30,000/g tritium, 35% thermal
conversion, and recirculating power taken off the top before anything reaches
the meter. Two LCOE figures with two jobs: lifetime LCOE keeps the plant's
whole books (early mistakes included, deliberately), while mission objectives
grade a mission-window LCOE that starts counting when the mission does.

**Fission.** Point kinetics with delayed neutrons under the prompt-jump
approximation, Doppler and coolant temperature feedback, xenon poisoning,
decay heat and fuel burnup.

### What was deliberately simplified

Being upfront about this is the point. A simulation that hides its
approximations teaches the wrong lesson.

**The plasma is a single zone.** No radial profiles, no transport equation.
Real tokamaks have peaked density and temperature profiles that change the
answer; here everything is volume-averaged. This is the largest simplification
in the model and it is what makes a 10 Hz browser game possible.

**τ_E is calibrated, not derived.** The source spec pins τ_E(t=0) = 0.5 s, but
with its own scaling exponents that calibration makes Q > 1 mathematically
unreachable inside the slider bounds. The game would be unwinnable at Level 4.
The engine uses c₁ = 4.2 instead, giving τ_E ≈ 1.0 s at start. Verified
end-to-end by `npm run balance`: breakeven lands at Q ≈ 1.26 on a maxed
non-superconducting machine, and gigawatt scale requires the HTS and H-mode
path, which is exactly the progression the spec intends.

**Disruptions are probabilistic, not predicted.** Real disruption physics is an
open research problem. Here, crossing a limit raises a probability rather than
triggering a simulated instability.

**Fission uses the prompt-jump approximation.** Prompt neutron kinetics are
collapsed, so the model is accurate for the slow manoeuvres the game asks for
and would not be for a prompt-critical excursion.

**Q is engineering Q, not physics Q.** It is measured against wall-plug heating
draw, which is a tougher standard than the physics Q usually quoted for JET and
NIF. A machine at Q = 1 here has genuinely broken even.

## How it's checked

There is no typechecker, so the check scripts are the safety net:

```bash
npm run balance   # proves all 8 levels are winnable inside the slider bounds
npm run career    # career systems against the written spec
npm run tokens    # palette contrast claims, measured (chained into balance)
npm run test:e2e  # browser smoke: boots and plays the real app at 3 widths
```

`balance` runs the same pure engine modules in Node that the browser runs, so a
tuning change that quietly makes a level unreachable fails here rather than in
someone's playthrough.

## Accessibility

Text-to-speech on every message, three colourblind palettes with shape-coded
status (never colour alone), reduced-motion support, a locally hosted
OpenDyslexic option, UI scaling from 75% to 150%, and full keyboard operation.
Contrast is asserted by script rather than eyeballed: `scripts/tokens_check.mjs`
reads the live palette and fails the build if any documented ratio drifts.

## Running it locally

```bash
npm install
npm run dev
```

Architecture and contributor notes are in [DEVELOPING.md](DEVELOPING.md).

---

Built with AI assistance. The physics, the citations and the deliberate
deviations above are the parts worth reading.
