// Post-PhD events: early, mid and senior career, plus path-specific pools.
// The through-line is that the decisions stop being about competence and
// start being about what you are willing to trade.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE, PATH } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REP } from '../engine/reputation.js';
import { REL as RELD } from '../engine/relationships.js';

const E = STAGE.EARLY_CAREER;
const M = STAGE.MID_CAREER;
const S = STAGE.SENIOR;

export const CAREER_EVENTS = [
  // ---------------- EARLY CAREER ----------------
  {
    id: 'early_first_grant',
    title: 'Your name on the proposal',
    text: 'Your first grant as principal investigator. Forty pages, a budget you have never had to justify before, and a panel that funds roughly one in six.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    age_range: [28, 40],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    grant: true,
    choices: [
      {
        label: 'Propose the safe extension',
        stat_check: { stats: ['SM', 'CH'], modifier: 0.1 },
        outcomes: {
          success: {
            text: 'Funded. It is incremental work and everyone on the panel knew it, but incremental work keeps a lab alive and buys you the standing to try something harder.',
            stat_deltas: { CH: 0.5, CO: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { ...REP.GRANT_COPI, SCI: 2 },
            relationship_deltas: { npc_hartley: RELD.COLLABORATED },
            flags_set: ['first_grant', 'plays_it_safe'],
          },
          failure: {
            text: 'Declined, ranked in the top third. "Competitive but not compelling." You resubmit in the spring with the same idea and better prose.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['grant_rejected_once'],
          },
        },
      },
      {
        label: 'Propose the risky idea',
        stat_check: { stats: ['IN', 'CH'], modifier: -0.1 },
        outcomes: {
          success: {
            text: 'Funded, narrowly, with one reviewer calling it the only proposal in the stack that could fail interestingly. You now have three years to justify their nerve.',
            stat_deltas: { IN: 0.8, CH: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS + STRESS.HIGH_WORKLOAD,
            reputation_deltas: { SCI: 4, NET: 3 },
            relationship_deltas: { npc_hartley: RELD.COLLABORATED },
            flags_set: ['first_grant', 'takes_risks'],
          },
          failure: {
            text: 'Declined. "Ambitious, insufficiently justified." The panel wanted preliminary data you could only get with the money you were asking for, which is the oldest trap in the field.',
            stat_deltas: { GR: 0.5, IN: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['grant_rejected_once'],
          },
        },
      },
    ],
  },
  {
    id: 'early_authorship',
    title: 'The author list',
    text: 'The result is yours. The diagnostic that made it possible is Haddad\'s, built over two years, and he is not on the draft. Nobody would notice if he stayed off it.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    age_range: [27, 42],
    weight: 3,
    npcs: ['npc_haddad'],
    choices: [
      {
        label: 'Add him as co-author',
        outcomes: {
          success: {
            text: 'He is quietly, visibly grateful. Two years later he builds you something nobody else in the field has, and does not make you ask twice.',
            stat_deltas: { CH: 0.3, CO: 0.5 },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: { ...REP.PUBLISH, NET: 4 },
            relationship_deltas: { npc_haddad: RELD.SHARED_CREDIT },
            flags_set: ['shares_credit'],
            publications: 1,
          },
        },
      },
      {
        label: 'Keep it first-author clean',
        outcomes: {
          success: {
            text: 'The paper is stronger for having one name on it, and it does help your case for the fellowship. Haddad reads it, says nothing, and stops offering you beam time first.',
            stat_deltas: { SM: 0.3 },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: { ...REP.PUBLISH_TOP },
            relationship_deltas: { npc_haddad: RELD.SOLE_CREDIT },
            flags_set: ['took_sole_credit'],
            publications: 1,
          },
        },
      },
      {
        label: 'Ask him what he thinks is fair',
        stat_check: { stats: ['CH'] },
        outcomes: {
          success: {
            text: 'He says middle author is right, and means it. The conversation takes ten minutes and buys a decade of trust that no authorship line could have.',
            stat_deltas: { CH: 0.5, CO: 0.3 },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: { ...REP.PUBLISH, NET: 5 },
            relationship_deltas: { npc_haddad: RELD.SHARED_CREDIT + 4 },
            flags_set: ['shares_credit', 'honest_operator'],
            publications: 1,
          },
          failure: {
            text: 'He says it does not matter, in the tone that means it does. You put him second. Neither of you mentions it again, and something small is permanently different.',
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: REP.PUBLISH,
            relationship_deltas: { npc_haddad: -2 },
            flags_set: [],
            publications: 1,
          },
        },
      },
      {
        label: 'Hold the paper until it is bigger',
        outcomes: {
          success: {
            text: 'You fold it into a larger study that takes another year. It is a better paper with both names on it, and a year is a year you do not get back.',
            stat_deltas: { GR: 0.5, IN: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: { npc_haddad: RELD.SHARED_CREDIT },
            flags_set: ['kept_working'],
          },
        },
      },
    ],
  },
  {
    id: 'early_job_offer_pivot',
    title: 'A call from a startup',
    text: 'Ana Lindgren is funding a compact-tokamak company and wants you on the founding technical team. The equity is theoretical. The machine would be real, and soon.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    age_range: [30, 40],
    weight: 2,
    max_fires: 1,
    npcs: ['npc_lindgren'],
    pivot: true,
    choices: [
      {
        label: 'Take the leap',
        outcomes: {
          success: {
            text: 'You hand back your badge on a Friday and start somewhere with forty people and a lease on an aircraft hangar. It is the most frightened and most awake you have been in a decade.',
            stat_deltas: { GR: 0.5, IN: 0.5 },
            stress_delta: STRESS.LIFE_EVENT + STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 5 },
            relationship_deltas: { npc_lindgren: RELD.CHOSE_THEM },
            flags_set: ['went_startup'],
            set_path: PATH.STARTUP,
          },
        },
      },
      {
        label: 'Stay where you are',
        outcomes: {
          success: {
            text: 'You say no over a good dinner you did not pay for. The company ships a machine four years later. You read the paper and feel something complicated.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 0,
            reputation_deltas: {},
            relationship_deltas: { npc_lindgren: RELD.DISAGREED },
            flags_set: ['stayed_put'],
          },
        },
      },
    ],
  },
  {
    id: 'early_first_student',
    title: 'Your first student',
    text: 'Priya Agarwal wants you to supervise her doctorate. She is sharper than you were at her age and asks questions you cannot immediately answer.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    age_range: [30, 45],
    weight: 3,
    max_fires: 1,
    npcs: ['npc_agarwal'],
    choices: [
      {
        label: 'Take her on properly',
        outcomes: {
          success: {
            text: 'You block out Thursday afternoons and never move them. It costs you a paper a year. She will describe you, twenty years from now, as the reason she stayed in the field.',
            stat_deltas: { CH: 0.5, SM: 0.3 },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: REP.MENTOR,
            relationship_deltas: { npc_agarwal: RELD.HELPED },
            flags_set: ['first_mentee', 'real_mentor'],
            mentees: 1,
            mentoring: 1,
          },
        },
      },
      {
        label: 'Take her on, but stay busy',
        outcomes: {
          success: {
            text: 'She gets a project and an open door that is usually closed. She finishes, competently, and takes a job in industry without telling you first.',
            stat_deltas: { SM: 0.3 },
            stress_delta: 2,
            reputation_deltas: { NET: 1 },
            relationship_deltas: { npc_agarwal: RELD.IGNORED },
            flags_set: ['first_mentee'],
            mentees: 1,
          },
        },
      },
    ],
  },
  {
    id: 'early_null_result',
    title: 'The result that says no',
    text: 'Eighteen months of work, and the effect is not there. Not weakly there. Not there. You could bury it in an appendix, or you could write it up as what it is.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    age_range: [28, 45],
    weight: 2,
    choices: [
      {
        label: 'Publish the null result',
        outcomes: {
          success: {
            text: 'Barely cited, and it saves three other groups from spending the same eighteen months. One of them writes to thank you. That letter stays on your wall.',
            stat_deltas: { GR: 0.5, IN: 0.3 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: { ...REP.NULL_RESULT, ...REP.HONEST_NEGATIVE },
            relationship_deltas: {},
            flags_set: ['published_null', 'honest_operator'],
            publications: 1,
          },
        },
      },
      {
        label: 'Reframe it as a partial positive',
        stat_check: { stats: ['CH'] },
        outcomes: {
          success: {
            text: 'The framing holds up in review. It reads better than it deserves to, and you know exactly which sentence is doing the work.',
            stat_deltas: { CH: 0.5 },
            stress_delta: 4,
            reputation_deltas: REP.PUBLISH,
            relationship_deltas: {},
            flags_set: ['stretched_a_claim'],
            publications: 1,
          },
          failure: {
            text: 'A referee sees through it in one line: "The data do not support the abstract." You rewrite it honestly, humbled, and it is a better paper.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: REP.HYPE,
            relationship_deltas: {},
            flags_set: ['caught_stretching'],
          },
        },
      },
    ],
  },

  // ---------------- MID CAREER ----------------
  {
    id: 'mid_leadership_offer',
    title: 'They want you to run it',
    text: 'The group leadership is open. It means budget, hiring, and strategy. It also means the last experiment you personally run is the one you finished last month.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [35, 52],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Take the role',
        stat_check: { stats: ['CH', 'CO'] },
        outcomes: {
          success: {
            text: 'You are good at it, which is its own kind of loss. Your calendar fills with people who need decisions. The machine runs without you, better than it did with you.',
            stat_deltas: { CH: 0.8, CO: 0.8 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 6, SCI: 2 },
            relationship_deltas: {},
            flags_set: ['took_leadership'],
            leadership: true,
          },
          failure: {
            text: 'You take it and spend a year underwater. Two good people leave because you could not shield them from the budget process. You learn management the expensive way.',
            stat_deltas: { GR: 0.5, CH: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { NET: 2 },
            relationship_deltas: {},
            flags_set: ['took_leadership', 'rough_first_year'],
            leadership: true,
          },
        },
      },
      {
        label: 'Stay at the bench',
        outcomes: {
          success: {
            text: 'Someone else takes it. You keep your hands on the hardware and your name on first-author papers. In eight years you will not be sure which of you chose better.',
            stat_deltas: { IN: 0.5, SM: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { SCI: 4 },
            relationship_deltas: {},
            flags_set: ['stayed_at_bench'],
            stayed_in_lab: true,
          },
        },
      },
    ],
  },
  {
    id: 'mid_keynote',
    title: 'The keynote',
    text: 'Nine hundred people in the hall and a livestream. Forty minutes on where the field actually is, which is further than the public thinks and closer than the sceptics allow.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    age_range: [38, 62],
    weight: 2,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: { min_reputation: { SCI: 35 } },
    choices: [
      {
        label: 'Give the honest talk',
        stat_check: { stats: ['CH', 'IN'], tiered: true },
        outcomes: {
          excellent: {
            text: 'You show the failures alongside the progress and the room leans in. Three funding agencies email before you are off the stage. It gets clipped and shared for years.',
            stat_deltas: { CH: 0.8, CO: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { ...REP.KEYNOTE_EXCELLENT, SCI: 4 },
            relationship_deltas: {},
            flags_set: ['great_keynote'],
            keynote_excellent: 1,
          },
          success: {
            text: 'It lands well enough. Polite applause, good questions, a few new contacts. Nobody will remember it in five years, including you.',
            stat_deltas: { CH: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: REP.KEYNOTE_ADEQUATE,
            relationship_deltas: {},
            flags_set: [],
          },
          failure: {
            text: 'You lose the room in the second act, somewhere in a slide with too many curves on it. The questions are kind, which tells you everything.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: { PUB: 1 },
            relationship_deltas: {},
            flags_set: ['bad_keynote'],
          },
        },
      },
      {
        label: 'Give them the optimistic version',
        stat_check: { stats: ['CH'], modifier: 0.1 },
        outcomes: {
          success: {
            text: 'The room loves it. The clip goes further than anything you have published. A colleague in the third row does not clap, and finds you afterwards to say so.',
            stat_deltas: { CH: 0.5 },
            stress_delta: 2,
            reputation_deltas: { ...REP.VIRAL, ...REP.HYPE },
            relationship_deltas: { npc_bello: -6 },
            flags_set: ['hyped_publicly'],
          },
          failure: {
            text: 'A journalist checks one of your numbers against the literature and writes it up. The correction is small and the embarrassment is not.',
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { ...REP.HYPE, PUB: 2 },
            relationship_deltas: {},
            flags_set: ['caught_hyping'],
          },
        },
      },
    ],
  },
  {
    id: 'mid_rival_panel',
    title: 'Bello is on the panel',
    text: 'Your renewal goes to review, and Tomás Bello is on the committee. You have been circling the same problem for fifteen years, from opposite sides.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    age_range: [38, 60],
    weight: 2,
    npcs: ['npc_bello'],
    grant: true,
    choices: [
      {
        label: 'Submit it unchanged and let it stand',
        stat_check: { stats: ['SM', 'IN'] },
        outcomes: {
          success: {
            text: 'He argues for it. Not warmly, but on the merits, which from him is warmer than warm. Funded.',
            stat_deltas: { SM: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { SCI: 4, NET: 3 },
            relationship_deltas: { npc_bello: RELD.SPOKE_WELL },
            flags_set: ['won_on_merit'],
          },
          failure: {
            text: 'Declined, with a review that is technically fair and unmistakably his. You read it four times looking for malice and find only disagreement, which is worse.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: { npc_bello: -4 },
            flags_set: ['lost_to_rival'],
          },
        },
      },
      {
        label: 'Call him first',
        stat_check: { stats: ['CH', 'CO'], modifier: 0.05 },
        outcomes: {
          success: {
            text: 'An awkward twenty-minute call that ends with him telling you which section is weak. You fix it. He recuses himself from the vote, and the proposal is better.',
            stat_deltas: { CH: 0.5, CO: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { NET: 4 },
            relationship_deltas: { npc_bello: RELD.COLLABORATED },
            flags_set: ['made_peace_with_rival'],
          },
          failure: {
            text: 'He takes it as an attempt to influence the process, and says so, in writing, to the programme officer. Nothing formal comes of it. Nothing is the same either.',
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { NET: -4 },
            relationship_deltas: { npc_bello: -10 },
            flags_set: ['burned_rival'],
          },
        },
      },
    ],
  },
  {
    id: 'mid_testimony',
    title: 'Invited to testify',
    text: 'A legislative committee wants expert testimony on the fusion programme. Five minutes of opening remarks, then questions from people who have not read the brief.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    age_range: [40, 63],
    weight: 2,
    max_fires: 2,
    cooldown_years: 6,
    prerequisites: { min_reputation: { PUB: 50 } },
    policy: true,
    choices: [
      {
        label: 'Testify with the caveats intact',
        stat_check: { stats: ['CH', 'SM'], tiered: true },
        outcomes: {
          excellent: {
            text: 'You give them the timeline honestly, including what could go wrong, and a sceptical senator says on the record that it is the first briefing that did not oversell. The line item survives.',
            stat_deltas: { CH: 0.8, CO: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { ...REP.TESTIMONY_GOOD, SCI: 4 },
            relationship_deltas: {},
            flags_set: ['testified_well'],
            policy: 1,
          },
          success: {
            text: 'You get through it. The caveats survive, mostly. One quote gets used out of context by both sides, which is how you know it was balanced.',
            stat_deltas: { CH: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { PUB: 4 },
            relationship_deltas: {},
            flags_set: ['testified'],
            policy: 1,
          },
          failure: {
            text: 'You get drawn into a fight about timelines and lose your footing. The clip that circulates is eleven seconds long and makes you look evasive.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: REP.TESTIMONY_BAD,
            relationship_deltas: {},
            flags_set: ['testified_badly'],
            policy: 1,
          },
        },
      },
      {
        label: 'Decline. It is not your job.',
        outcomes: {
          success: {
            text: 'Someone less careful takes the seat. Their testimony is confident, wrong in two places, and shapes the next four years of funding.',
            stat_deltas: { SM: 0.3 },
            stress_delta: 0,
            reputation_deltas: { PUB: -2 },
            relationship_deltas: {},
            flags_set: ['declined_testimony'],
          },
        },
      },
    ],
  },

  // ---------------- SENIOR ----------------
  {
    id: 'sen_succession',
    title: 'Who gets the machine',
    text: 'Your programme needs a successor named. Fischer is careful and will not break it. Agarwal is brilliant and will change everything, including things you built.',
    type: EVENT_TYPE.DECISION,
    stage: [S],
    age_range: [55, 65],
    weight: 3,
    max_fires: 1,
    npcs: ['npc_fischer', 'npc_agarwal'],
    choices: [
      {
        label: 'Name Agarwal',
        outcomes: {
          success: {
            text: 'She rebuilds the diagnostic suite in eighteen months and gets a result you had been circling for a decade. Watching someone surpass you is not what you expected it to feel like.',
            stat_deltas: { CH: 0.3 },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: { NET: 5, SCI: 3 },
            relationship_deltas: { npc_agarwal: RELD.CHOSE_THEM, npc_fischer: -6 },
            flags_set: ['named_successor'],
            mentee_success: 1,
          },
        },
      },
      {
        label: 'Name Fischer',
        outcomes: {
          success: {
            text: 'He runs it cleanly for a decade and never once loses a campaign to carelessness. The programme is exactly as good as when you left it, which was the point.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: { NET: 4 },
            relationship_deltas: { npc_fischer: RELD.CHOSE_THEM, npc_agarwal: -6 },
            flags_set: ['named_successor'],
            mentee_success: 1,
          },
        },
      },
    ],
  },
  {
    id: 'sen_last_experiment',
    title: 'One more campaign',
    text: 'You could spend your last active years administering, or you could take beam time like a postdoc and chase the one measurement that got away from you in 2041.',
    type: EVENT_TYPE.DECISION,
    stage: [S],
    age_range: [56, 64],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Take the beam time',
        stat_check: { stats: ['IN', 'GR'] },
        outcomes: {
          success: {
            text: 'You get it. Thirty years late, on a machine three generations newer, with hands that are not as steady. It is the best week of your professional life.',
            stat_deltas: { IN: 0.8, GR: 0.5 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { ...REP.BREAKTHROUGH },
            relationship_deltas: {},
            flags_set: ['last_campaign_won'],
            breakthroughs: 1,
            publications: 1,
            stayed_in_lab: true,
          },
          failure: {
            text: 'The measurement stays out of reach. You write it up as a bound rather than a value, which is honest and unsatisfying, and you are at peace with it in a way that surprises you.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: REP.HONEST_NEGATIVE,
            relationship_deltas: {},
            flags_set: ['last_campaign_lost'],
            publications: 1,
            stayed_in_lab: true,
          },
        },
      },
      {
        label: 'Spend them on the programme',
        outcomes: {
          success: {
            text: 'You secure the funding line that keeps forty people employed through the next decade. No paper will carry your name. The building will still be running.',
            stat_deltas: { CO: 0.5, CH: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 8, PUB: 3 },
            relationship_deltas: {},
            flags_set: ['secured_the_programme'],
            policy: 1,
          },
        },
      },
    ],
  },

  // ---------------- PATH SPECIFIC ----------------
  {
    id: 'startup_funding_round',
    title: 'The round',
    text: 'The Series B needs a number for first plasma. Lindgren wants a date she can put in a deck. The honest answer has an error bar eighteen months wide.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    career_path: [PATH.STARTUP],
    age_range: [30, 52],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    npcs: ['npc_lindgren'],
    choices: [
      {
        label: 'Give her the honest range',
        stat_check: { stats: ['CH', 'IN'] },
        outcomes: {
          success: {
            text: 'She takes it to the investors with the error bar intact and raises anyway, at a lower valuation. The people who wired money knew what they were buying.',
            stat_deltas: { CH: 0.5, IN: 0.3 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { SCI: 4, NET: 4 },
            relationship_deltas: { npc_lindgren: RELD.COLLABORATED },
            flags_set: ['honest_fundraise', 'honest_operator'],
            commercialization: 1,
          },
          failure: {
            text: 'Two funds walk. The round closes small and the hiring plan halves. You keep your integrity and lose eleven months of runway for it.',
            stat_deltas: { GR: 0.8 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: { npc_lindgren: -3 },
            flags_set: ['lean_years', 'honest_operator'],
            commercialization: 1,
          },
        },
      },
      {
        label: 'Give her the aggressive date',
        outcomes: {
          success: {
            text: 'The round closes large and fast. Eighteen months later the date passes without a plasma, and every conversation since has started from a deficit of trust.',
            stat_deltas: { CO: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { ...REP.HYPE, NET: 5 },
            relationship_deltas: { npc_lindgren: 4 },
            flags_set: ['overpromised'],
            commercialization: 1,
          },
        },
      },
    ],
  },
  {
    id: 'academia_tenure',
    title: 'Tenure',
    text: 'Six years of work in one dossier. External letters from people you have disagreed with in print. A committee that will not tell you how it went.',
    type: EVENT_TYPE.DECISION,
    stage: [E, M],
    career_path: [PATH.ACADEMIA],
    age_range: [33, 45],
    weight: 4,
    max_fires: 1,
    choices: [
      {
        label: 'Submit the dossier',
        stat_check: { stats: ['SM', 'CO'], tiered: true },
        outcomes: {
          excellent: {
            text: 'Unanimous. One letter calls your null-result paper the most useful thing published in the subfield that decade. You read that sentence more times than you admit.',
            stat_deltas: { SM: 0.5, CO: 0.8 },
            stress_delta: -20,
            reputation_deltas: { SCI: 8, NET: 5 },
            relationship_deltas: {},
            flags_set: ['tenured'],
            leadership: true,
          },
          success: {
            text: 'Granted, with a note about needing a stronger funding record. You are permanent. The relief arrives about four days later, all at once.',
            stat_deltas: { CO: 0.5, GR: 0.3 },
            stress_delta: -15,
            reputation_deltas: { SCI: 4, NET: 3 },
            relationship_deltas: {},
            flags_set: ['tenured'],
          },
          failure: {
            text: 'Denied. You have a year to find somewhere else. The department is apologetic in a way that changes nothing about the outcome.',
            stat_deltas: { GR: 0.8 },
            stress_delta: STRESS.MAJOR_SETBACK + STRESS.LIFE_EVENT,
            reputation_deltas: { SCI: -2 },
            relationship_deltas: {},
            flags_set: ['tenure_denied'],
          },
        },
      },
    ],
  },
  {
    id: 'natlab_facility_case',
    title: 'The facility case',
    text: 'A billion-dollar upgrade proposal, eighteen months of preparation, and a review panel that has killed two of the last three. Dubois is presenting the competing case an hour after you.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    career_path: [PATH.NATIONAL_LAB],
    age_range: [38, 62],
    weight: 3,
    max_fires: 1,
    npcs: ['npc_dubois'],
    choices: [
      {
        label: 'Make the case on physics',
        stat_check: { stats: ['SM', 'CH'] },
        outcomes: {
          success: {
            text: 'The panel funds you, and funds Dubois at sixty percent, which he will never quite forgive. The machine gets built. It runs for twenty years.',
            stat_deltas: { SM: 0.5, CO: 0.8 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { SCI: 6, NET: 6 },
            relationship_deltas: { npc_dubois: RELD.COMPETED_WON },
            flags_set: ['won_facility'],
            leadership: true,
          },
          failure: {
            text: 'They fund Dubois. Your case was better physics and his was better politics, and you spend a long drive home deciding whether those are different things.',
            stat_deltas: { GR: 0.5, CH: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { NET: -2 },
            relationship_deltas: { npc_dubois: RELD.COMPETED_LOST },
            flags_set: ['lost_facility'],
          },
        },
      },
    ],
  },
  {
    id: 'intl_consortium',
    title: 'The consortium seat',
    text: 'Seven countries, one machine, and a governance structure designed by committee. Mbeki-Ross wants you as technical lead. It is the most important machine in the field and the slowest room on earth.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    career_path: [PATH.INTERNATIONAL],
    age_range: [38, 62],
    weight: 3,
    max_fires: 1,
    npcs: ['npc_mbeki'],
    choices: [
      {
        label: 'Take the seat',
        stat_check: { stats: ['CH', 'CO'] },
        outcomes: {
          success: {
            text: 'You spend four years getting seven procurement systems to agree on a tolerance. It is the least scientific and most consequential work you have ever done.',
            stat_deltas: { CH: 0.8, CO: 0.8, GR: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { ...REP.INTERNATIONAL, NET: 8, SCI: 3 },
            relationship_deltas: { npc_mbeki: RELD.COLLABORATED },
            flags_set: ['consortium_lead'],
            leadership: true,
          },
          failure: {
            text: 'The politics grind you down. You resign the seat after two years, having moved one specification and aged five. Someone with more patience takes over.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { NET: 3 },
            relationship_deltas: { npc_mbeki: -3 },
            flags_set: ['left_consortium'],
          },
        },
      },
    ],
  },

  // ---------------- RANDOM EVENTS ----------------
  {
    id: 'car_reviewer2',
    title: 'Reviewer 2',
    text: 'Three months of review, and the decisive comment is four words long: "The statistics are wrong." They are not wrong. Explaining why takes six weeks.',
    type: EVENT_TYPE.RANDOM,
    stage: [E, M, S],
    age_range: [28, 65],
    weight: 2,
    negative: true,
    effects: { stat_deltas: { GR: 0.3 }, stress_delta: STRESS.MINOR_SETBACK },
  },
  {
    id: 'car_good_run',
    title: 'A campaign that works',
    text: 'Everything holds. The diagnostics behave, the plasma behaves, and you get eleven good shots in a night. Nobody outside the control room will ever know it was a good week.',
    type: EVENT_TYPE.RANDOM,
    stage: [E, M, S],
    age_range: [28, 65],
    weight: 2,
    effects: { stat_deltas: { IN: 0.3 }, stress_delta: STRESS.SUCCESS, reputation_deltas: { SCI: 1 } },
  },
  {
    id: 'car_misquote',
    title: 'Misquoted',
    text: 'A trade publication renders your careful "within two decades, if funding holds" as "scientist says fusion is twenty years away." The comments are exactly what you would expect.',
    type: EVENT_TYPE.RANDOM,
    stage: [M, S],
    age_range: [35, 65],
    weight: 2,
    negative: true,
    effects: { stress_delta: STRESS.MINOR_SETBACK, reputation_deltas: REP.MISQUOTE_IGNORED },
  },
  {
    id: 'car_student_thanks',
    title: 'An email out of nowhere',
    text: 'A former student, six years gone, writes to say they got the position, and that a thing you said offhand in 2049 is why they did not quit. You do not remember saying it.',
    type: EVENT_TYPE.RANDOM,
    stage: [M, S],
    age_range: [40, 65],
    weight: 2,
    prerequisites: { flags: ['first_mentee'] },
    effects: { stress_delta: -8, reputation_deltas: REP.HELPED_SUCCESSOR, mentee_success: 1 },
  },
  {
    id: 'car_health',
    title: 'The doctor is direct',
    text: 'Blood pressure, sleep, the usual list. She asks how many hours you work and then asks again because she assumes she misheard.',
    type: EVENT_TYPE.RANDOM,
    stage: [M, S],
    age_range: [42, 65],
    weight: 2,
    negative: true,
    effects: { stress_delta: STRESS.LIFE_EVENT },
  },
  {
    id: 'car_conference_reunion',
    title: 'The same hotel bar',
    text: 'Twenty years of the same annual meeting. Half the people you started with have left the field. The ones who stayed order a second round and talk about the machine.',
    type: EVENT_TYPE.RANDOM,
    stage: [M, S],
    age_range: [42, 65],
    weight: 2,
    effects: { stress_delta: -6, reputation_deltas: REP.CONFERENCE },
  },

  // ---------------- MID CAREER: the quiet-year batch ----------------
  // QA 2026-07-22: a full life saw 15-26 years with no decision in them, and
  // they cluster in the mid-career stretch. These ten are that stretch's real
  // furniture: review panels, replication, students, the press, the body of
  // colleagues thinning out. Decisions, not lessons.
  {
    id: 'mid_review_panel',
    title: 'The proposal you wish you had written',
    text: 'Panel duty. Halfway through the pile is a proposal from Dubois that is, honestly, the best idea in the room, and it is aimed at the same budget line as yours.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [36, 52],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Score it as the best in the pile',
        outcomes: {
          success: {
            text: 'You write the strongest review in the batch for a direct competitor. Hartley notices the signature. So, eventually, does Dubois.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 4,
            reputation_deltas: { SCI: 5, NET: 3 },
            relationship_deltas: { npc_dubois: 12, npc_hartley: 6 },
            flags_set: ['reviews_straight'],
          },
        },
      },
      {
        label: 'Find honest reasons to rank it lower',
        outcomes: {
          success: {
            text: 'Every criticism you write is technically true. The proposal funds anyway, a year later and a size smaller, and you know exactly what you did.',
            stat_deltas: { CO: 0.2 },
            stress_delta: 7,
            reputation_deltas: { NET: -2 },
            relationship_deltas: { npc_dubois: -8 },
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'mid_replication',
    title: 'The result that will not repeat',
    text: 'Nakamura\'s group ran your confinement scaling on their machine and got noise. Their preprint is polite about it, which somehow makes it worse.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [36, 55],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Own it in public, in print',
        outcomes: {
          success: {
            text: 'A joint comment with Nakamura on what differs between the machines, and what that means your result actually was. It costs you a headline claim and buys you something slower and better.',
            stat_deltas: { GR: 0.5 },
            stress_delta: 6,
            reputation_deltas: { SCI: 4 },
            relationship_deltas: { npc_nakamura: 12 },
            flags_set: ['owned_the_null'],
            publications: 1,
          },
        },
      },
      {
        label: 'Defend the methodology line by line',
        stat_check: { stats: ['SM'] },
        outcomes: {
          success: {
            text: 'Your rebuttal holds: their gas fueling ran a regime your scaling never claimed. The field watches the exchange and learns something from both sides.',
            stat_deltas: { SM: 0.4 },
            stress_delta: 8,
            reputation_deltas: { SCI: 3 },
            relationship_deltas: { npc_nakamura: -4 },
          },
          failure: {
            text: 'Your rebuttal reads as defensive because it is. The original paper now carries a comment thread nobody enjoys, with your name all through it.',
            stat_deltas: {},
            stress_delta: 12,
            reputation_deltas: { SCI: -6 },
            relationship_deltas: { npc_nakamura: -8 },
          },
        },
      },
    ],
  },
  {
    id: 'mid_student_drowning',
    title: 'The student who stopped emailing',
    text: 'Fischer has not pushed a commit in three weeks. The milestone is in two months. You know exactly what the silence is because you have been the silence.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [36, 55],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Slow the project, keep the student',
        outcomes: {
          success: {
            text: 'You move the milestone and absorb the questions about why. Fischer comes back in weeks, not months, and stays in the field for thirty years.',
            stat_deltas: { CH: 0.3 },
            stress_delta: 4,
            reputation_deltas: { SCI: -2 },
            relationship_deltas: { npc_fischer: 15 },
            mentoring: 1,
            mentee_success: 1,
          },
        },
      },
      {
        label: 'Push to the milestone together',
        stat_check: { stats: ['CH', 'GR'] },
        outcomes: {
          success: {
            text: 'You sit in the lab with them every evening for eight weeks, doing the part of the job nobody publishes. The milestone lands and so does the student.',
            stat_deltas: { GR: 0.4 },
            stress_delta: 10,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: { npc_fischer: 10 },
            mentoring: 1,
            mentee_success: 1,
          },
          failure: {
            text: 'The milestone lands. Fischer defends, publishes, and quietly takes a job writing trading software, and you know which of those facts you caused.',
            stat_deltas: {},
            stress_delta: 8,
            reputation_deltas: { NET: -2 },
            relationship_deltas: { npc_fischer: -12 },
            mentoring: 1,
          },
        },
      },
    ],
  },
  {
    id: 'mid_sabbatical',
    title: 'A year at the other machine',
    text: 'Mbeki-Ross has an office with your name on it at the consortium facility, effective September. It is the best machine in the world and it is very far from your kitchen.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [37, 52],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Take the year, bring everyone',
        outcomes: {
          success: {
            text: 'New schools, new language, one shipping container. The family is furious in October and fluent by June, and you run shots on the machine you used to read about.',
            stat_deltas: { IN: 0.6 },
            stress_delta: 8,
            reputation_deltas: { SCI: 4, NET: 4 },
            relationship_deltas: { npc_mbeki: 10 },
            money_delta: -9000,
            partner_delta: -4,
          },
        },
      },
      {
        label: 'Take it alone, fly home monthly',
        outcomes: {
          success: {
            text: 'Twelve flights, two time zones, one calendar that never quite worked. The physics was worth it. Whether the year was is a question you get to keep.',
            stat_deltas: { IN: 0.6 },
            stress_delta: 12,
            reputation_deltas: { SCI: 5, NET: 4 },
            relationship_deltas: { npc_mbeki: 10 },
            partner_delta: -12,
          },
        },
      },
      {
        label: 'Stay, and write the review instead',
        outcomes: {
          success: {
            text: 'You turn the invitation into the field\'s definitive review article, written at your own desk, home for dinner. Nobody frames review articles. Everybody cites them.',
            stat_deltas: { SM: 0.4 },
            stress_delta: 2,
            reputation_deltas: { SCI: 3 },
            publications: 1,
            stayed_in_lab: true,
          },
        },
      },
    ],
  },
  {
    id: 'mid_ten_years_quote',
    title: 'Ten years away',
    text: 'Abara is writing the big fusion piece and wants one line: how far away is it really? The honest answer is a paragraph. The useful answer is a number.',
    type: EVENT_TYPE.DECISION,
    stage: [M, S],
    age_range: [38, 60],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Give the honest paragraph',
        outcomes: {
          success: {
            text: 'They print most of it, including the caveats. It converts nobody and misleads nobody, and three years later the piece still reads true, which Abara remembers.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 2,
            reputation_deltas: { SCI: 3, PUB: 2 },
            relationship_deltas: { npc_abara: 10 },
            outreach: 1,
            flags_set: ['straight_with_press'],
          },
        },
      },
      {
        label: 'Give them the number they need',
        outcomes: {
          success: {
            text: 'The headline writes itself, the piece travels, and two funding calls cite it. So does every sceptic when the number ages badly, with your name attached.',
            stat_deltas: {},
            stress_delta: 5,
            reputation_deltas: { PUB: 7, SCI: -4 },
            relationship_deltas: { npc_abara: 4 },
            outreach: 1,
            flags_set: ['gave_the_number'],
          },
        },
      },
    ],
  },
  {
    id: 'mid_data_request',
    title: 'The dataset Bello asked for',
    text: 'A short, correct email: Bello wants your raw shot data to test his competing model. You spent four years and two students collecting it.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [36, 55],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Send everything, formats and all',
        outcomes: {
          success: {
            text: 'His model fails on your data and he says so in print, citing the dataset generously. The whole exchange takes a year and moves the field more than either model did.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 3,
            reputation_deltas: { SCI: 5, NET: 3 },
            relationship_deltas: { npc_bello: 12 },
            flags_set: ['open_science'],
          },
        },
      },
      {
        label: 'Send the figures, keep the rest',
        outcomes: {
          success: {
            text: 'Technically responsive, mutually understood. His reply is one sentence long and you both file the exchange where such things are kept.',
            stat_deltas: {},
            stress_delta: 2,
            reputation_deltas: { NET: -2 },
            relationship_deltas: { npc_bello: -6 },
          },
        },
      },
    ],
  },
  {
    id: 'mid_admin_or_bench',
    title: 'The committee that eats the calendar',
    text: 'They want you to chair the facility programme committee. Real influence over the run schedule, and the end of your Tuesdays, Wednesdays, and unstructured thought.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [38, 55],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Give the bench two more years',
        outcomes: {
          success: {
            text: 'Someone else chairs it, adequately. You stay where the machine is, and the work you do in those two years is the reason anyone remembers you.',
            stat_deltas: { IN: 0.4 },
            stress_delta: 2,
            reputation_deltas: { SCI: 3, NET: -3 },
            stayed_in_lab: true,
          },
        },
      },
      {
        label: 'Chair it properly',
        outcomes: {
          success: {
            text: 'You run the fairest run-allocation the facility has had in a decade, and every physicist in the building owes you a favour they do not know about.',
            stat_deltas: { CO: 0.5 },
            stress_delta: 8,
            reputation_deltas: { NET: 6 },
            relationship_deltas: { npc_hartley: 8 },
          },
        },
      },
    ],
  },
  {
    id: 'mid_magnet_gamble',
    title: 'Petrov\'s improbable magnet',
    text: 'Petrov can rewind the central solenoid to run at a field nobody has certified, in the same shutdown you already scheduled. Fifteen percent more field, if the joints hold. He speaks in tolerances, and for once they are wide.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [38, 55],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Rebuild the campaign around it',
        stat_check: { stats: ['IN', 'SM'], tiered: true },
        outcomes: {
          excellent: {
            text: 'The joints hold at full field on the first attempt. Confinement scales the way the optimists always claimed, and your machine spends a year as the reference point for the whole field.',
            stat_deltas: { IN: 0.8 },
            stress_delta: 8,
            reputation_deltas: { SCI: 8 },
            relationship_deltas: { npc_petrov: 15 },
            publications: 1,
            breakthroughs: 1,
          },
          success: {
            text: 'It works at ninety percent of the promise, which is still the best campaign the machine has run. Petrov files the margin away for the next rewind.',
            stat_deltas: { IN: 0.5 },
            stress_delta: 8,
            reputation_deltas: { SCI: 4 },
            relationship_deltas: { npc_petrov: 10 },
            publications: 1,
          },
          failure: {
            text: 'A joint lets go on the second ramp, quietly and expensively. The shutdown doubles, the campaign halves, and the review panel uses the word ambitious the way panels do.',
            stat_deltas: { GR: 0.4 },
            stress_delta: 14,
            reputation_deltas: { SCI: -3 },
            relationship_deltas: { npc_petrov: 4 },
          },
        },
      },
      {
        label: 'Bank it for the next machine',
        outcomes: {
          success: {
            text: 'The certified field is enough for the campaign you planned. The uprated design goes in the next proposal, where risk is called innovation and priced accordingly.',
            stat_deltas: {},
            stress_delta: 2,
            reputation_deltas: { NET: 2 },
            relationship_deltas: { npc_petrov: 4 },
          },
        },
      },
    ],
  },
  {
    id: 'mid_friend_leaves',
    title: 'Haddad hands in his badge',
    text: 'Twenty years of fixing every instrument on the floor, and a medical devices firm has offered him double to fix theirs. He tells you first, over coffee, already decided.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [37, 52],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Talk him into one more campaign',
        stat_check: { stats: ['CH'] },
        outcomes: {
          success: {
            text: 'He stays for the campaign, which turns out to be the good one, and leaves anyway the year after, on his own terms, grinning about it.',
            stat_deltas: { CH: 0.3 },
            stress_delta: 3,
            reputation_deltas: { NET: 2 },
            relationship_deltas: { npc_haddad: 8 },
          },
          failure: {
            text: 'He listens to the whole speech, pays for the coffee, and takes the job. The next three diagnostics failures are yours to fix, and you finally learn what he did all day.',
            stat_deltas: {},
            stress_delta: 6,
            reputation_deltas: {},
            relationship_deltas: { npc_haddad: -4 },
          },
        },
      },
      {
        label: 'Help him pack, buy the drinks',
        outcomes: {
          success: {
            text: 'The send-off fills the seminar room. People leave the field; the friendship is not required to leave with them, and this one does not.',
            stat_deltas: { CH: 0.3 },
            stress_delta: -4,
            reputation_deltas: { NET: -2 },
            relationship_deltas: { npc_haddad: 15 },
          },
        },
      },
    ],
  },
  {
    id: 'mid_beam_time',
    title: 'One slot, two experiments',
    text: 'The scheduling committee gives you one high-field week. Your record attempt needs it. So does Fischer\'s thesis measurement, and theses have deadlines that records do not.',
    type: EVENT_TYPE.DECISION,
    stage: [M],
    age_range: [37, 55],
    weight: 3,
    max_fires: 1,
    choices: [
      {
        label: 'Give Fischer the week',
        outcomes: {
          success: {
            text: 'The thesis measurement comes out clean and defensible. Your record waits a cycle, and in the acknowledgements there is a sentence about you that you will not forget.',
            stat_deltas: { CH: 0.3 },
            stress_delta: 3,
            reputation_deltas: { SCI: -1 },
            relationship_deltas: { npc_fischer: 12 },
            mentoring: 1,
            mentee_success: 1,
          },
        },
      },
      {
        label: 'Keep the slot, share the shifts',
        outcomes: {
          success: {
            text: 'You interleave the run plans and both experiments get most of what they needed. Nobody is delighted, everybody defends on time, and the record falls next year to someone else.',
            stat_deltas: { IN: 0.3 },
            stress_delta: 6,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: { npc_fischer: 2 },
            mentoring: 1,
          },
        },
      },
    ],
  },
];
