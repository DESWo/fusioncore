// The first events gated on a pattern of behaviour rather than a single moment.
//
// Every other event asks what you are now: your stats, your reputation, who you
// know. These ask what you have repeatedly done. `honest_operator` is written by
// 37 different events scattered across a whole career, and until now nothing
// ever read it, so a player could be scrupulous for forty years and the game
// would never once notice.
//
// They use min_flag_count / max_flag_count (see meetsPrerequisites), so the
// gates count occurrences instead of asking "ever?". Deliberately few: three
// gates already consult well over a hundred authored decisions between them,
// and the point is that each one lands rarely and means something when it does.
//
// The copy here follows the house voice (concrete, physical, no moralising) but
// it is the most rewritable part of this file. The gates are the load-bearing
// bit.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';

export const INTEGRITY_EVENTS = [
  // ---- the honest path pays, eventually and quietly ----
  {
    id: 'int_the_one_they_ask',
    title: 'The one they ask',
    text: "A vendor's acceptance numbers do not reconcile and two directorates each want the review to land their way. The programme office wants a name on the arbitration that nobody can accuse of having a side. Someone in a meeting you were not in said yours, apparently without much discussion.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 62],
    weight: 4,
    max_fires: 1,
    // Fourteen separate times you were straight when it cost you something.
    // Not a moment: a habit, assembled from decisions years apart.
    //
    // The number is measured, not chosen for flavour. Over 40 seeded careers a
    // scrupulous run accumulates 14-23 and an expedient one 3-12, so 14 is the
    // lowest threshold that every scrupulous career clears and no expedient
    // career reaches. At 6, where this started, 38 of 40 expedient careers
    // qualified too, which is a gate that only looks like one.
    prerequisites: { min_flag_count: { honest_operator: 14 } },
    choices: [
      {
        label: 'Take it, and read every page',
        stat_check: { stats: ['IN', 'CO'], tiered: true },
        outcomes: {
          excellent: {
            text: 'You find the discrepancy on page ninety of an appendix: a units conversion applied twice. Neither directorate gets what it wanted and both accept it, because the finding is boring and checkable and yours. That reputation is now load-bearing.',
            stat_deltas: { IN: 0.5, CO: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { SCI: 4, NET: 3 },
            flags_set: ['honest_operator', 'trusted_arbiter'],
          },
          success: {
            text: 'It takes three weekends and the answer is unglamorous: both sides were rounding in their own favour. You write it plainly. Nobody thanks you and everybody remembers.',
            stat_deltas: { CO: 0.4 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { SCI: 2, NET: 2 },
            flags_set: ['honest_operator', 'trusted_arbiter'],
          },
          failure: {
            text: 'You give it the weekend it deserves and miss the appendix entirely. The review stands, and eighteen months later somebody else finds the double conversion. It is not a scandal. It is just a thing that was yours to catch.',
            stat_deltas: { CO: 0.2 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: { SCI: -1 },
            flags_set: ['missed_one'],
          },
        },
      },
      {
        label: 'Decline, and say why',
        outcomes: {
          success: {
            text: "You tell them you have worked with the vendor twice and will not pretend that is nothing. They are visibly irritated and they use somebody else. Two years on, a different panel asks you for exactly the same reason, and this time you have no conflict to declare.",
            stat_deltas: { CO: 0.3 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { SCI: 1, NET: 1 },
            flags_set: ['honest_operator', 'declared_a_conflict'],
          },
        },
      },
    ],
  },

  // ---- the questionable path is patient ----
  {
    id: 'int_the_number_comes_back',
    title: 'The number comes back',
    text: "A postdoc three institutions away is building on your result and cannot reproduce the margin. Their email is polite, thorough, and attaches your own figure with the error bars redrawn honestly. You recognise the shape of it immediately, because you remember choosing it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [34, 62],
    weight: 5,
    max_fires: 1,
    // Twice is a pattern. Once is a bad week.
    prerequisites: { min_flag_count: { stretched_a_claim: 2 } },
    choices: [
      {
        label: 'Correct it publicly, name the error',
        stat_check: { stats: ['CO'] },
        outcomes: {
          success: {
            text: 'The erratum is four paragraphs and one of the worst days of your career. The postdoc cites it approvingly. Two people who had quietly stopped recommending you start again, and you never find out who they were.',
            stat_deltas: { CO: 0.6 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { SCI: -2, PUB: 1 },
            flags_set: ['honest_operator', 'filed_erratum'],
          },
          failure: {
            text: 'You write the erratum badly, hedging in the second paragraph, and the hedge is the part that gets quoted. It is still the right thing to have done. It just costs more than it needed to.',
            stat_deltas: { CO: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { SCI: -4 },
            flags_set: ['honest_operator', 'filed_erratum'],
          },
        },
      },
      {
        label: 'Reply privately, let it rest',
        outcomes: {
          success: {
            text: "You send a warm, technical, entirely unfalsifiable reply about differing analysis choices. They stop emailing. The result stays in the literature, and so does the margin, and you think about it at odd moments for years.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: { NET: -1 },
            flags_set: ['stretched_a_claim', 'buried_one'],
          },
        },
      },
    ],
  },

  // ---- and the door that only stays open if it was never closed ----
  {
    id: 'int_clean_record_clearance',
    title: 'The clearance interview',
    text: 'The programme is classified enough that the vetting is done in person, by someone with your entire published record in a folder and no apparent interest in any of it. She asks, twice, in slightly different words, whether there is anything in your work you would not want read closely.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 60],
    weight: 3,
    max_fires: 1,
    // A record, and the absence of a specific kind of blemish. This is the one
    // gate here that can be permanently closed by a single decision, which is
    // why it asks for so little on the positive side.
    prerequisites: {
      min_flag_count: { honest_operator: 10 },
      max_flag_count: { cut_a_corner: 0 },
    },
    choices: [
      {
        label: 'Answer plainly. There is nothing.',
        outcomes: {
          success: {
            text: 'It is the easiest interview of your life and the only one where that has ever been true. You realise afterwards that the answer was assembled years ago, in a series of small annoying decisions you did not enjoy making at the time.',
            stat_deltas: { CO: 0.4 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { NET: 4 },
            relationship_deltas: {},
            flags_set: ['honest_operator', 'cleared'],
          },
        },
      },
      {
        label: 'Ask what happens to people who say yes',
        stat_check: { stats: ['CH'] },
        outcomes: {
          success: {
            text: '"Mostly they get cleared," she says, "and mostly a lot faster, because I stop looking." She signs the form. You get the sense you have been assessed on something other than the answer.',
            stat_deltas: { CH: 0.4 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { NET: 3 },
            flags_set: ['honest_operator', 'cleared'],
          },
          failure: {
            text: 'She looks at you for slightly too long before answering, and the rest of the interview takes ninety minutes instead of twenty. You are cleared. The file notes that you were curious about the process.',
            stat_deltas: {},
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 1 },
            flags_set: ['cleared'],
          },
        },
      },
    ],
  },
];
