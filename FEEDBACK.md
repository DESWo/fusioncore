# Playtest feedback backlog

Raised 2026-08-01 while playing. Ordered roughly by how much they block play.
Delete an item when it lands.

## Not started

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
- **Choices now show whether you can carry them off.** A choice this character
  cannot clear is marked ("Grit · not enough, and you know it") and stays
  selectable, because its failure branch is authored prose written for exactly
  this character. This is the answer to 1a: those ~327 failure branches were
  never unreachable, they were unreachable *by accident*. Now reaching past
  what you are is a thing you choose on purpose. The mark comes from
  `resolveChoice` in the new `src/career/engine/choices.js`, which the store
  also commits with, so the preview and the outcome cannot drift apart.
- **Fixed the uniformity and concentration problems the dice had been hiding.**
  Each of the 20 pursuits now carries a `difficulty` (chasing money is harder
  than reading), so an even stat block no longer grades all twenty the same way
  for a whole run: it now spreads 12 excellent / 8 adequate at rest, and slides
  to 12 poor under stress. The concentration bonus dropped from 0.12 to 0.08 a
  block, so grinding one pursuit can no longer substitute for aptitude. Both
  asserted in `npm run career`.
- **Removed probability from career resolution.** `resolveCheck` and
  `resolveTiered` no longer roll: they compare the stat-derived threshold
  against `BALANCE.DECISIVE_BAR` and commit. Same character, same choice, same
  circumstances now always lands in the same place. No event data changed,
  because all 913 outcome branches were already authored and the dice were only
  ever picking between them. Note this covers outcome resolution only; which
  events are *offered* still uses randomness (see item 2).
