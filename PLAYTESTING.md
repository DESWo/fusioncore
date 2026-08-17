# Playtesting FusionCore

A protocol for a small observational playtest: 3–5 players, one at a time,
30–45 minutes each. The goal is to watch real people meet the game, not to
collect opinions about it. Behavior is the data; the questionnaire at the end
is eight questions and exists mostly to catch what observation missed.

No results live in this file. Record each session in its own notes file and
keep those out of the repo (see `.gitignore`'s FEEDBACK.md rationale).

## Who to recruit

Three profiles, at least one player from each if possible:

1. **No physics background.** The game claims to teach; only this player can
   prove it.
2. **Games-literate, physics-naive.** Separates "confused by the physics"
   from "confused by the interface".
3. **Some physics or engineering.** Finds the places where the simplifications
   read as wrong rather than as simplified.

Do not recruit anyone who has watched the game being developed.

## Session structure

**Setup (2 min).** Fresh browser profile, `https://deswo.github.io/fusioncore/`
full screen, phone put away. One sentence of framing, verbatim: *"This is a
game about running a reactor. Play however you like; I can't answer questions
while you play, but say whatever you're thinking out loud."* Nothing else. If
they ask something during play, note the question — the question IS the
finding — and answer only "whatever you think."

**Part 1 — Fusion campaign (15–20 min).** Let them start wherever they click.
Most will take "Start / First Light." Let them play through at least Missions
1–3; stop at 20 minutes regardless.

**Part 2 — One other mode (10 min).** Ask them to try either Fission or
Career, their choice. Which they pick is itself data.

**Part 3 — Questionnaire (5 min).** Below. Read the answers back to them to
confirm you heard right.

## What to record (the observation sheet)

Timestamp each entry. Shorthand is fine; write it up the same day.

- **Hesitations.** Anywhere the cursor circles or the player stops moving for
  5+ seconds. Note what was on screen.
- **Questions asked aloud**, word for word. Especially any of the form "what
  does X mean?" — that term failed its introduction.
- **Ignored information.** Panels or numbers they never look at (watch their
  eyes/cursor). The advisor, the annunciator codes, the citations, the sim
  clock, the mission "why" line.
- **Brute force vs. understanding.** When a mission completes, did the player
  arrive by reasoning ("thin fuel heats faster, so…") or by slider-sweeping
  until the bar filled? Note which mission and which style.
- **Failure comprehension.** After a disruption, quench, or game over: can
  they say in one sentence what happened? Write down their sentence, verbatim.
- **Success comprehension.** After Q > 1 or a mission clear, ask nothing —
  but if they explain it aloud unprompted, record whether the explanation is
  physically right.
- **Speed-control usage.** Do they discover pause and 8x? Do they understand
  the sim clock is plant time (watch for "wait, five minutes?!" moments)?
- **The E-stop.** Noticed? Used? Armed by accident?
- **Difficulty spikes.** Missions retried more than twice, and what the
  player changed between attempts.
- **Mode coherence.** On entering Fission or Career: does it read to them as
  the same product or as a different game stapled on? Their words.

The game itself records the run: after the session, screenshot the campaign
scorecard and note `stats` (max Q, disruptions, quenches, repairs) from the
Systems panel. That is the objective record of how far they actually got.

## Post-play questionnaire

Behavior-anchored on purpose; "did you like the UI" produces nothing usable.

1. In one sentence: what is this game about?
2. What does Q mean, without looking? (Then: what does the game want Q to be?)
3. Mission you're most confident you could redo right now, and why?
4. A moment you felt lost. What were you looking for that wasn't there?
5. When the machine broke (if it did): what had you done wrong, in your words?
6. The clock reads T+2h. How long did that take in your chair, roughly?
7. One thing you'd remove. One thing you'd want more of.
8. Would you open it again tomorrow unprompted? (Watch the hesitation more
   than the answer.)

## After each session

Write the session up the same day into a private notes file: top 3 findings,
each tagged with the mission/screen it happened on and a severity
(BLOCKER / FRICTION / POLISH). After all sessions, cluster the findings; a
problem seen with 2+ players out of 4 is real. File the clusters as GitHub
Issues, one per problem, with the observed behavior — never the proposed fix —
as the issue title.

## What this protocol does not do

It does not measure balance (the headless suites prove winnability), does not
compare variants, and does not attempt statistical significance with n=4.
It finds the places where the game and a human fail to meet. That is all,
and that is enough.
