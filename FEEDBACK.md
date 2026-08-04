# Playtest feedback backlog

Raised 2026-08-01 while playing. Ordered roughly by how much they block play.
Delete an item when it lands.

## Not started

**2b. 606 of 611 flags are written and never read.** The deeper half of the
continuity problem, and it is authoring work rather than engine work. Events
set 611 distinct flags across 852 set-operations; exactly 5 are ever read back,
and only 4 of 262 events are gated on one. The machinery is all there:
`meetsPrerequisites` already supports `prerequisites.flags` and `not_flags`.
Nothing uses it. Until events ask about what you did, the game cannot refer
back to it. Threading (done) makes the *cast* recur; flags are what would make
the *consequences* recur.


**4. Events assume physics knowledge the player does not have.**
Example: an event turns on a fabricated fourth peak in Franck-Hertz data, with
no indication of what that experiment is or why a fourth peak is impossible.

**7. SYSTEMS and ADVISOR tabs do not earn their place.**
"There's literally no reason to even have these other two tabs, they both don't
contribute anything, either remove them or make them a necessary part of the
game." Currently read-only reference. Either cut them or give each something
you must act on to progress.

## Done this session

- 3D fission plant was an unreadable black silhouette: metalness 0.75 with no
  environment map. Added hemisphere + fill lights, labelled the parts, added a
  RESET VIEW button because scroll-to-zoom had no way back.
- Removed the odds hints ("a coin flip", "favourable", "someone vouched for
  you") from career event cards. Which stat is tested stays; that is a rule,
  not a hint. The year planner was cleaned up in the same pass.
- Added the annunciator to the fusion dashboard, pinned above the scroll.
- **Character creation asks for gender.** Four options including non-binary and
  prefer-not-to-say, its own step, persisted through save/load. Checked first
  whether any prose renders a third-person pronoun for the player: none does,
  career mode is second person throughout, so a pronoun set is stored but no
  rewriting layer was built for nothing to consume.
- **The fission rod control is legible.** The actual rod position now draws as a
  marker on the same track as the setpoint, so you can watch it travel instead
  of reading a number underneath. The track ends read `0% OUT · FULL POWER` and
  `100% IN · SHUT DOWN`, and the header says `target 34.0% IN`, so the direction
  is no longer something you infer. Mission 2's always-visible hint now carries
  the withdraw-in-small-steps strategy; the exact 50/38/34 stays behind "stuck?".
  No thresholds or check functions touched: difficulty is unchanged.
- **The PHYSICS view teaches the criterion, not just the mechanism.** A new panel
  breaks n, T and tau_E into three live rows, flags whichever one the player is
  pushing least (which maps straight onto their three sliders), shows the triple
  product against ignition as a percentage, and explains the temperature with
  the real sigmaV reactivity curve rather than asserting it. Reuses the existing
  LawsonPlot rather than rebuilding it. README's physics section updated to match.
- **Events now belong to threads instead of a shuffle.** The decision pool was
  weighted purely on a static `weight`, so a stranger's crisis was exactly as
  likely as the next beat with the advisor you had known for six years. It now
  also weighs how much you have dealt with the people an event involves, and
  how far that relationship has moved off neutral. Measured over 40 simulated
  12-year runs: recurring-cast rate 51.8% -> 62.7%, with a tighter cast. The
  bonus caps at five dealings so one relationship cannot swallow the pool.
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
