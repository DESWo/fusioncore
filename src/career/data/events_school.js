// College and graduate school events. These years are where stats are cheap
// to grow (diminishing returns have not bitten yet) and where the cast that
// follows you for forty years gets introduced.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REP } from '../engine/reputation.js';
import { REL as RELD } from '../engine/relationships.js';

const C = STAGE.COLLEGE;
const G = STAGE.GRAD_SCHOOL;

export const SCHOOL_EVENTS = [
  // ---------------- COLLEGE: decisions ----------------
  {
    id: 'col_first_lecture',
    title: 'Plasma Physics 301',
    text: 'The lecturer draws a tokamak cross-section and says, almost as an aside, that nobody has yet held one of these in a burning state for more than a few seconds. The room moves on. You do not.',
    type: EVENT_TYPE.DECISION,
    stage: [C],
    age_range: [18, 21],
    weight: 3,
    choices: [
      {
        label: 'Stay after and ask why',
        stat_check: { stats: ['CH'], modifier: 0.1 },
        outcomes: {
          success: {
            text: 'Dr. Okafor answers for forty minutes past the end of class. She writes three paper titles on the back of your problem set and tells you to come to office hours when you have read them.',
            stat_deltas: { IN: 0.5, CH: 0.3 },
            stress_delta: 0,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: RELD.CHOSE_THEM },
            flags_set: ['met_okafor', 'curious_start'],
            progress: 1,
          },
          failure: {
            text: 'She is already packing up. "Email me," she says, not unkindly, and is gone. You email her. She does not reply for three weeks, and by then you have looked most of it up yourself.',
            stat_deltas: { SM: 0.3, GR: 0.3 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['self_taught_start'],
            progress: 1,
          },
        },
      },
      {
        label: 'Read every paper she cited',
        outcomes: {
          success: {
            text: 'You spend the weekend with four decades of confinement scaling. Most of it is over your head. Enough of it is not. You start keeping a notebook of things that do not add up.',
            stat_deltas: { SM: 0.5, GR: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['curious_start', 'self_taught_start'],
            progress: 1,
          },
        },
      },
      {
        label: 'Ask the loud question in the lecture',
        stat_check: { stats: ['CH', 'SM'], modifier: -0.1 },
        outcomes: {
          success: {
            text: 'You put your hand up and ask why nobody has solved it. The room turns. She takes the question seriously for a full five minutes, and afterwards three people you have never met want to talk to you.',
            stat_deltas: { CH: 0.5, CO: 0.5 },
            stress_delta: 3,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: RELD.SPOKE_WELL, npc_varga: RELD.CHOSE_THEM },
            flags_set: ['met_okafor', 'visible_early'],
            progress: 1,
          },
          failure: {
            text: 'It comes out badly and somebody behind you snorts. She answers kindly and moves on. You think about it for a week longer than anyone else does.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['froze_once'],
            progress: 1,
          },
        },
      },
      {
        label: 'Nothing. It was just a lecture.',
        outcomes: {
          success: {
            text: 'You go to lunch. The thought resurfaces at odd moments for years, usually late, usually when something else is not working.',
            stat_deltas: { SM: 0.2 },
            stress_delta: -2,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: [],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'col_study_group',
    title: 'The study group',
    text: 'Réka Varga runs the unofficial problem-set group out of a seminar room she has no business booking. Six people, one whiteboard, every Thursday. There is a seat open.',
    type: EVENT_TYPE.DECISION,
    stage: [C],
    age_range: [18, 22],
    weight: 2,
    npcs: ['npc_varga'],
    choices: [
      {
        label: 'Join. Learn out loud.',
        outcomes: {
          success: {
            text: 'You are wrong in front of people every week. It is the fastest you have ever learned anything. Réka is merciless and generous in the same sentence.',
            stat_deltas: { SM: 0.5, CH: 0.3 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: { npc_varga: RELD.COLLABORATED },
            flags_set: ['study_group'],
            progress: 1,
          },
        },
      },
      {
        label: 'Work alone. Faster that way.',
        outcomes: {
          success: {
            text: 'Your marks are fine. Better than fine. But when the group solves something in an hour that took you a night, you notice, and you file it away.',
            stat_deltas: { SM: 0.5, GR: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: { npc_varga: RELD.DISAGREED },
            flags_set: ['works_alone'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'col_summer_choice',
    title: 'Summer, decided',
    text: 'Two offers. A paid internship at a utility, running compliance spreadsheets on a fission plant. Or an unpaid summer in Okafor\'s lab, cleaning vacuum flanges and reading.',
    type: EVENT_TYPE.DECISION,
    stage: [C],
    age_range: [19, 23],
    weight: 2,
    choices: [
      {
        label: 'The lab. Unpaid.',
        stat_check: { stats: ['GR'] },
        outcomes: {
          success: {
            text: 'You spend three months learning that experimental physics is 90% plumbing. By August you can find a leak by sound. Okafor notices you stayed.',
            stat_deltas: { IN: 0.5, GR: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: RELD.CHOSE_THEM },
            flags_set: ['lab_summer', 'met_okafor'],
            progress: 1,
          },
          failure: {
            text: 'The money runs out in July. You take shifts at a warehouse to cover rent and miss half the summer. You learned the plumbing anyway, just tired.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: 3 },
            flags_set: ['lab_summer', 'money_tight'],
            progress: 1,
          },
        },
      },
      {
        label: 'The utility. Take the money.',
        outcomes: {
          success: {
            text: 'You learn how a real plant is actually regulated, which almost nobody in your programme understands. It is less romantic and more useful than you expected.',
            stat_deltas: { SM: 0.3, CO: 0.5 },
            stress_delta: 0,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['industry_summer', 'money_ok'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'col_hard_course',
    title: 'The course that breaks people',
    text: 'Statistical mechanics with Petrov as guest lecturer. The historical pass rate is 60%. Your advisor says it will make grad applications easier. Your schedule says it will cost you everything else.',
    type: EVENT_TYPE.DECISION,
    stage: [C],
    age_range: [19, 23],
    weight: 2,
    choices: [
      {
        label: 'Take it',
        stat_check: { stats: ['SM', 'GR'] },
        outcomes: {
          success: {
            text: 'You pass. Not comfortably, but you pass, and something in the way you think about ensembles rearranges permanently.',
            stat_deltas: { SM: 0.8, GR: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['took_hard_course'],
            progress: 1,
          },
          failure: {
            text: 'You drop it in week nine, two days before the withdrawal deadline. It is the correct decision and it feels like nothing of the kind.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['dropped_hard_course'],
            progress: 1,
          },
        },
      },
      {
        label: 'Skip it. Protect the GPA.',
        outcomes: {
          success: {
            text: 'Your transcript stays clean. In two years an interviewer will ask why you never took stat mech, and you will not have a good answer.',
            stat_deltas: { CO: 0.3 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['avoided_hard_course'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'col_conference_poster',
    title: 'Undergraduate poster session',
    text: 'Your summer work is thin, but it is real, and there is a student session at the regional plasma meeting. Standing next to a poster for four hours is its own kind of exam.',
    type: EVENT_TYPE.DECISION,
    stage: [C],
    age_range: [20, 24],
    weight: 2,
    prerequisites: { flags: ['lab_summer'] },
    choices: [
      {
        label: 'Present it',
        stat_check: { stats: ['CH'] },
        outcomes: {
          success: {
            text: 'A senior scientist stops, asks two sharp questions, and tells you the negative result is the interesting part. You had been apologising for it all morning.',
            stat_deltas: { CH: 0.5, IN: 0.3 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { ...REP.TALK, ...REP.CONFERENCE },
            relationship_deltas: {},
            flags_set: ['first_poster'],
            progress: 1,
          },
          failure: {
            text: 'You freeze on the second question. Someone answers it for you, kindly, which is worse. You spend the train home rewriting how you would have said it.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: { PUB: 1 },
            relationship_deltas: {},
            flags_set: ['first_poster', 'froze_once'],
            progress: 1,
          },
        },
      },
    ],
  },

  // ---------------- COLLEGE: randoms ----------------
  {
    id: 'colr_allnighter',
    title: 'Three in the morning',
    text: 'The problem set is due at nine. You solve it at 03:40 and sit for a moment in the specific silence of a building with nobody else in it. You are, unexpectedly, happy.',
    type: EVENT_TYPE.RANDOM,
    stage: [C],
    age_range: [18, 24],
    weight: 2,
    effects: { stat_deltas: { GR: 0.3 }, stress_delta: 4 },
  },
  {
    id: 'colr_doubt',
    title: 'The doubt',
    text: 'Everyone in your cohort seems to understand something you do not. You look it up later and find that most of them were bluffing. It does not entirely help.',
    type: EVENT_TYPE.RANDOM,
    stage: [C],
    age_range: [18, 24],
    weight: 2,
    negative: true,
    effects: { stress_delta: STRESS.MINOR_SETBACK },
  },
  {
    id: 'colr_documentary',
    title: 'A documentary at 1am',
    text: 'A film crew tours a tokamak hall. The scale of it is absurd: a building-sized machine to hold something thinner than air. You rewind the shot twice.',
    type: EVENT_TYPE.RANDOM,
    stage: [C],
    age_range: [18, 24],
    weight: 1,
    effects: { stat_deltas: { IN: 0.3 }, stress_delta: -2 },
  },

  // ---------------- GRAD: decisions ----------------
  {
    id: 'grad_advisor_pick',
    title: 'Choosing an advisor',
    text: 'Lindqvist runs the biggest group in the department and is on three continents a month. Okafor takes two students at a time and reads every word they write. Both said yes.',
    type: EVENT_TYPE.DECISION,
    stage: [G],
    age_range: [21, 26],
    weight: 5,
    max_fires: 1,
    npcs: ['npc_lindqvist', 'npc_okafor'],
    choices: [
      {
        label: 'Lindqvist. Big group, big machine.',
        outcomes: {
          success: {
            text: 'You get beam time on hardware most students only read about. You also get eleven minutes of your advisor per month. You learn to be self-directed because there is no alternative.',
            stat_deltas: { GR: 0.5, CO: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 4 },
            relationship_deltas: { npc_lindqvist: RELD.CHOSE_THEM, npc_okafor: -3 },
            flags_set: ['advisor_lindqvist'],
            progress: 1,
          },
        },
      },
      {
        label: 'Okafor. Small group, close reading.',
        outcomes: {
          success: {
            text: 'She meets you weekly and takes your work seriously enough to tear it apart. Your writing improves faster than your physics, which turns out to matter more than you expect.',
            stat_deltas: { SM: 0.5, IN: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: RELD.CHOSE_THEM, npc_lindqvist: -3 },
            flags_set: ['advisor_okafor'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'grad_quals',
    title: 'Qualifying exams',
    text: 'Four hours of written, two hours of oral, three faculty across a table. Passing means you are a doctoral candidate. Failing means one more attempt, next year.',
    type: EVENT_TYPE.DECISION,
    stage: [G],
    age_range: [22, 27],
    weight: 4,
    max_fires: 1,
    choices: [
      {
        label: 'Sit the exam',
        stat_check: { stats: ['SM', 'GR'] },
        outcomes: {
          success: {
            text: 'The oral goes long because they get interested, which you later learn is the good sign. You walk out a candidate.',
            stat_deltas: { SM: 0.8, GR: 0.5 },
            stress_delta: -8,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: {},
            flags_set: ['passed_quals'],
            progress: 1,
          },
          failure: {
            text: 'They stop you nine minutes into the oral to ask something basic, and you cannot retrieve it. The letter arrives a week later. One more attempt, next year.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['failed_quals_once'],
            progress: 0,
          },
        },
      },
    ],
  },
  {
    id: 'grad_first_paper',
    title: 'The first paper',
    text: 'Eighteen months of data, and a result that is real but modest. Okafor says it is publishable. A voice in your head says it is not important enough to put your name on.',
    type: EVENT_TYPE.DECISION,
    stage: [G],
    age_range: [23, 28],
    weight: 3,
    choices: [
      {
        label: 'Submit it',
        stat_check: { stats: ['SM', 'CH'] },
        outcomes: {
          success: {
            text: 'Accepted with minor revisions. Seeing your own name in the author list does something permanent to your sense of what you are allowed to do.',
            stat_deltas: { SM: 0.5, CH: 0.3 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: REP.PUBLISH,
            relationship_deltas: {},
            flags_set: ['early_publisher'],
            publications: 1,
            progress: 1,
          },
          failure: {
            text: 'Reviewer 2 is thorough and correct. Rejected, with a page of things you should have checked. You check them. It takes four months.',
            stat_deltas: { GR: 0.5, SM: 0.3 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['rejected_once'],
            progress: 1,
          },
        },
      },
      {
        label: 'Hold it. Get more data.',
        outcomes: {
          success: {
            text: 'Six more months of running turns a modest result into a solid one. It is a better paper. It is also six months, and someone else was working on this too.',
            stat_deltas: { IN: 0.5, GR: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['kept_working'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'grad_scooped',
    title: 'Scooped',
    text: 'A group in Nagoya publishes the measurement you have been building toward for a year. Theirs is cleaner. Yours is not worthless, but it is no longer first.',
    type: EVENT_TYPE.DECISION,
    stage: [G],
    age_range: [24, 29],
    weight: 2,
    prerequisites: { flags: ['kept_working'], not_flags: ['early_publisher'] },
    choices: [
      {
        label: 'Publish as a replication',
        outcomes: {
          success: {
            text: 'You reframe it honestly: independent confirmation, different diagnostic, same conclusion. It will never be cited like theirs. It is, quietly, good science.',
            stat_deltas: { GR: 0.5, IN: 0.3 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: { ...REP.REPLICATED, ...REP.SCOOPED },
            relationship_deltas: {},
            flags_set: ['published_replication'],
            publications: 1,
            progress: 1,
          },
        },
      },
      {
        label: 'Abandon it. Pivot.',
        outcomes: {
          success: {
            text: 'You shelve a year of work in an afternoon. The new direction is more interesting anyway, which is either true or something you needed to believe.',
            stat_deltas: { IN: 0.5 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: REP.SCOOPED,
            relationship_deltas: {},
            flags_set: ['pivoted_topic'],
            progress: 1,
          },
        },
      },
    ],
  },
  {
    id: 'grad_teaching',
    title: 'Teaching assignment',
    text: 'The department needs someone for the undergraduate lab section. It is four hours a week you do not have, and the students are exactly as lost as you were.',
    type: EVENT_TYPE.DECISION,
    stage: [G],
    age_range: [22, 29],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: 'Take it seriously',
        outcomes: {
          success: {
            text: 'You learn the thing every teacher learns: you did not understand it until you had to explain it. Two students switch into plasma because of your section.',
            stat_deltas: { CH: 0.5, SM: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD + STRESS.MENTORING,
            reputation_deltas: REP.MENTOR,
            relationship_deltas: {},
            flags_set: ['taught_well'],
            mentoring: 1,
            progress: 1,
          },
        },
      },
      {
        label: 'Do the minimum',
        outcomes: {
          success: {
            text: 'You run the sections, you mark the reports, you get your evenings back. Nobody complains. Nobody remembers you either.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 0,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: [],
            progress: 1,
          },
        },
      },
    ],
  },

  // ---------------- GRAD: randoms ----------------
  {
    id: 'gradr_beamtime_3am',
    title: 'Beam time, 3am',
    text: 'The machine only runs at night because that is when the campus grid has headroom. You have not seen daylight on a weekday in a month. The data is beautiful.',
    type: EVENT_TYPE.RANDOM,
    stage: [G],
    age_range: [22, 30],
    weight: 2,
    effects: { stat_deltas: { GR: 0.3, IN: 0.3 }, stress_delta: 6 },
  },
  {
    id: 'gradr_vacuum_leak',
    title: 'A leak at the worst moment',
    text: 'Two weeks of preparation, and a flange seal fails ninety minutes into the campaign. You find it by helium sniffer at midnight. The run is gone.',
    type: EVENT_TYPE.RANDOM,
    stage: [G],
    age_range: [22, 30],
    weight: 2,
    negative: true,
    effects: { stat_deltas: { GR: 0.3 }, stress_delta: STRESS.STANDARD_SETBACK },
  },
  {
    id: 'gradr_stipend',
    title: 'The stipend conversation',
    text: 'Rent went up eleven percent. The stipend went up two. You do the arithmetic twice hoping to have made an error.',
    type: EVENT_TYPE.RANDOM,
    stage: [G],
    age_range: [22, 30],
    weight: 2,
    negative: true,
    effects: { stress_delta: STRESS.LIFE_EVENT },
  },
  {
    id: 'gradr_good_seminar',
    title: 'A seminar that lands',
    text: 'A visiting speaker presents a stellarator optimisation result so elegant that the room goes quiet. You take four pages of notes and think about it for a year.',
    type: EVENT_TYPE.RANDOM,
    stage: [G],
    age_range: [22, 30],
    weight: 2,
    effects: { stat_deltas: { IN: 0.3 }, stress_delta: -3, reputation_deltas: REP.CONFERENCE },
  },
];
