# Playtest feedback backlog

Raised 2026-08-01 while playing. Ordered roughly by how much they block play.
Delete an item when it lands.

## Not started

**1a. Determinism made most authored failure prose unreachable. Needs a decision.**
Found by review, not by playing, and it is the biggest consequence of removing
the dice. Resolution is now a pure function of combined stat, the per-choice
modifier (only ever -0.2 to +0.15 in the data) and stress, and below stress 60
the stress term is exactly zero. So a character's answer for every checked
choice is fixed at creation and only improves.

Measured across the 327 choices carrying a `stat_check`:

| build | outcome split |
|---|---|
| 6/6/6/6/6, stress 0 | 320 success, 5 excellent, 2 failure |
| 8 flat, stress 0 | 322 success, 5 excellent, 0 failure |
| 500 random legal builds, stress <= 60 | median 18 failures of 327 |
| 6/6/6/6/6, stress 85 | 42 success, 285 failure |

So roughly 95% of the authored `failure` branches never render in normal play,
and at high stress it inverts and you see almost nothing else. That is a lot of
hand-written prose made unreachable, on a project whose one open lever is
content volume.

Options: widen the modifier range so choices differentiate; make DECISIVE_BAR
per-choice rather than global; or accept it and treat failure prose as
something only weak or exhausted characters see. Worth adding a reachability
assertion to `npm run career` either way, so a branch going dead fails the
suite instead of going unnoticed.

**1b. Balance question opened by removing the dice.**
`resolveYearPlan` gives `(blocks - 1) * 0.12` for concentrating a year on one
pursuit. Under dice that shifted the odds. Deterministically it is worth four
stat points, which is enough on its own to lift a stats-1, stress-70 character
from a failing year to an adequate one. So grinding a single pursuit now
substitutes for aptitude entirely, which cuts against "each pick puts you down
a different path". Left as-is rather than retuned, because it is a game-feel
call. Options: drop the per-block bonus to ~0.08, or cap total modifiers so
they cannot alone clear `DECISIVE_BAR`.

Review also measured the effect: a flat 6/6/6/6/6 build (the exact even split
of the 30-point creation pool, and the build `career_check` itself uses) grades
**every one of the 20 pursuits identically**, every year, for the whole run.
Stress 0 through 59 gives 20 excellent; 70 gives 20 adequate; 76+ gives 20
poor. So 40 of the 60 authored grade blocks never render for that build, and
the year summary prints the same three lines for four decades. A specialised
build does mix, so this hits the default shape worst. Same lever.

**2. Events do not follow each other.**
"They just seem like you're throwing random shit at me and making me pick
stuff." There IS a callback system (`callbackQueue`, NPC `callback_events`,
the "Someone remembered" kicker in `EventCard.jsx`) but it is not landing often
enough to read as continuity. Needs investigation: is it firing at all, and is
it weighted enough against the random pool?

**3. Character creation does not ask for gender.**

**4. Events assume physics knowledge the player does not have.**
Example: an event turns on a fabricated fourth peak in Franck-Hertz data, with
no indication of what that experiment is or why a fourth peak is impossible.

**5. Fission: the rod slider and the actual rods disagree with no feedback.**
The slider jumps to your setpoint; the rods travel at drive speed. The bar
shows only the setpoint, so the lag looks like a bug. Fix: draw actual position
as a second marker on the track.

**6. Fission mission 2 is opaque and reads as luck.**
"Getting past the first mission is almost purely luck based, I don't even know
how to get past it." Root cause: the control is labelled TARGET INSERTION, so
100% means fully shut down, and the slider's maximum is therefore "off". The
withdraw-in-steps guidance (50 → 38 → 34) exists but is hidden behind
`[ STUCK? SHOW THE SETTINGS ]`. `npm run balance` proves it is winnable, so
this is purely a discoverability failure.

**7. SYSTEMS and ADVISOR tabs do not earn their place.**
"There's literally no reason to even have these other two tabs, they both don't
contribute anything, either remove them or make them a necessary part of the
game." Currently read-only reference. Either cut them or give each something
you must act on to progress.

**8. The PHYSICS view is shallow.**
It explains the mechanism (ions spiral, they fuse, the alpha stays bottled, the
neutron escapes) but never the criterion: why temperature, density and
confinement time have to be satisfied together. The engine already computes
`tripleProduct` and `IGNITION_TRIPLE`, and `LawsonPlot.jsx` already exists but
is buried in the advisor tab.

**9. README physics section, after the in-game one.**
Same complaint, applied to the written model. Do this once the in-game view
settles so the two agree.

## Done this session

- 3D fission plant was an unreadable black silhouette: metalness 0.75 with no
  environment map. Added hemisphere + fill lights, labelled the parts, added a
  RESET VIEW button because scroll-to-zoom had no way back.
- Removed the odds hints ("a coin flip", "favourable", "someone vouched for
  you") from career event cards. Which stat is tested stays; that is a rule,
  not a hint. The year planner was cleaned up in the same pass.
- Added the annunciator to the fusion dashboard, pinned above the scroll.
- **Removed probability from career resolution.** `resolveCheck` and
  `resolveTiered` no longer roll: they compare the stat-derived threshold
  against `BALANCE.DECISIVE_BAR` and commit. Same character, same choice, same
  circumstances now always lands in the same place. No event data changed,
  because all 913 outcome branches were already authored and the dice were only
  ever picking between them. Note this covers outcome resolution only; which
  events are *offered* still uses randomness (see item 2).
