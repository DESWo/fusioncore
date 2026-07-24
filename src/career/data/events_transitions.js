// Mandatory transitions and relationship callbacks.
// Transitions are the hinges of a career: graduation, the defense, the first
// real job, retirement. Callbacks are the field remembering what you did.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE, PATH } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REP } from '../engine/reputation.js';
import { REL as RELD } from '../engine/relationships.js';

export const TRANSITION_EVENTS = [
  {
    id: 'tr_college_grad',
    title: 'Commencement',
    text: 'A gown that does not fit, a name mispronounced, and a degree in nuclear engineering. The applications went out in December. Two acceptances came back.',
    type: EVENT_TYPE.TRANSITION,
    stage: [STAGE.COLLEGE],
    age_range: [21, 25],
    transition: 'college_graduate',
    choices: [
      {
        label: 'Go to grad school',
        outcomes: {
          success: {
            text: 'You move cities with two suitcases, a stipend that assumes you have no dependants and no car, and the tuition debt from four years that nobody mentions at commencement.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            debt_delta: 46000,
            flags_set: ['entered_grad_school'],
          },
        },
      },
    ],
  },
  {
    id: 'tr_defense',
    title: 'The defense',
    text: 'Ninety minutes, four examiners, and six years of work. Your advisor is not allowed to help you. The door closes and they ask you to leave while they decide.',
    type: EVENT_TYPE.TRANSITION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [25, 34],
    transition: 'defense',
    choices: [
      {
        label: 'Defend the thesis',
        stat_check: { stats: ['SM', 'GR'], tiered: true },
        outcomes: {
          excellent: {
            text: 'They call you back in after four minutes. The external examiner says it is the cleanest treatment of the transport problem she has read in years and asks whether you have considered publishing chapter four separately.',
            stat_deltas: { SM: 0.8, CH: 0.5, GR: 0.5 },
            stress_delta: -25,
            reputation_deltas: { SCI: 8, NET: 3 },
            relationship_deltas: { npc_okafor: RELD.SHARED_CREDIT },
            flags_set: ['defended', 'defended_well'],
            publications: 1,
          },
          success: {
            text: 'Twenty minutes of deliberation and a pass with minor corrections. Someone hands you a drink in the corridor and calls you doctor, and it takes a second to realise they mean you.',
            stat_deltas: { SM: 0.5, GR: 0.5 },
            stress_delta: -20,
            reputation_deltas: { SCI: 4 },
            relationship_deltas: { npc_okafor: RELD.COLLABORATED },
            flags_set: ['defended'],
          },
          failure: {
            text: 'Major revisions. Not a failure, they are careful to say, but six more months and a rewritten chapter three. You go home and do not speak for an evening.',
            stat_deltas: { GR: 0.8 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['defense_revisions'],
            progress: -1,
          },
        },
      },
    ],
  },
  {
    id: 'tr_first_job',
    title: 'Where the work happens next',
    text: 'The doctorate is done. Four directions are open, and the one you pick will shape which problems you are allowed to care about for the next thirty years.',
    type: EVENT_TYPE.TRANSITION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [25, 36],
    transition: 'first_job',
    choices: [
      {
        label: 'University postdoc',
        outcomes: {
          success: {
            text: 'Three years, renewable, on somebody else\'s grant. You will teach, you will write, and if it goes well there is a tenure track at the end of it. The pay is written for someone with no debt and no dependants, and it does not ask whether that is still you.',
            stat_deltas: { SM: 0.5 },
            stress_delta: 4,
            reputation_deltas: { SCI: 2 },
            relationship_deltas: {},
            flags_set: ['path_academia'],
            set_path: PATH.ACADEMIA,
          },
        },
      },
      {
        label: 'National laboratory',
        outcomes: {
          success: {
            text: 'Staff scientist on a machine that costs more than the town it sits next to. The bureaucracy is legendary. So is the hardware.',
            stat_deltas: { CO: 0.5, GR: 0.3 },
            stress_delta: 2,
            reputation_deltas: { NET: 4 },
            relationship_deltas: { npc_hartley: 4 },
            flags_set: ['path_national_lab'],
            set_path: PATH.NATIONAL_LAB,
          },
        },
      },
      {
        label: 'Fusion startup',
        outcomes: {
          success: {
            text: 'Forty people, private money, and a schedule that assumes nothing goes wrong. You will build more in five years here than in fifteen anywhere else, or the company will fold.',
            stat_deltas: { IN: 0.5, GR: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 3 },
            relationship_deltas: { npc_lindgren: 6 },
            flags_set: ['path_startup'],
            set_path: PATH.STARTUP,
          },
        },
      },
      {
        label: 'International programme',
        outcomes: {
          success: {
            text: 'You move countries again, to the biggest collaboration in the field. Seven languages in the control room and a machine nobody nation could afford alone.',
            stat_deltas: { CH: 0.5, CO: 0.5 },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: { ...REP.INTERNATIONAL },
            relationship_deltas: { npc_mbeki: 5 },
            flags_set: ['path_international'],
            set_path: PATH.INTERNATIONAL,
          },
        },
      },
    ],
  },
  {
    id: 'tr_retire',
    title: 'The last day',
    text: 'They want to do a symposium. You would rather they did not, but people are flying in, and some of them are your former students, and so you let them.',
    type: EVENT_TYPE.TRANSITION,
    stage: [STAGE.SENIOR, STAGE.MID_CAREER],
    age_range: [55, 65],
    transition: 'retire',
    choices: [
      {
        label: 'Close it out',
        outcomes: {
          success: {
            text: 'You hand over the keys, the badge, and a filing cabinet of notebooks that somebody will eventually digitise. Then you walk out through the turbine hall one last time.',
            stat_deltas: {},
            stress_delta: -30,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ['retired'],
          },
        },
      },
    ],
  },
];

/** Callbacks: the field remembering. Referenced by NPC callback_events. */
export const CALLBACK_EVENTS = [
  {
    id: 'cb_okafor_reference',
    title: 'A letter you did not ask for',
    text: 'Okafor wrote you a reference letter for a position you had not applied to, and told the committee to expect your application. She is usually right about timing.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [28, 50],
    npcs: ['npc_okafor'],
    choices: [
      {
        label: 'Apply',
        stat_check: { stats: ['CO', 'SM'], modifier: 0.1 },
        outcomes: {
          success: {
            text: 'You get it. Her name opened the door and your work kept you in the room, and it takes a few years to stop wondering about the ratio.',
            stat_deltas: { CO: 0.5, SM: 0.3 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { NET: 6, SCI: 3 },
            relationship_deltas: { npc_okafor: RELD.HELPED },
            flags_set: ['okafor_boost'],
          },
          failure: {
            text: 'They go with someone internal. Okafor calls to say it was politics, not merit, which is what people say either way.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: 2 },
            flags_set: [],
          },
        },
      },
      {
        label: 'Let it pass',
        outcomes: {
          success: {
            text: 'You thank her and stay where you are. She does not offer again, and you notice that she does not.',
            stat_deltas: {},
            stress_delta: 0,
            reputation_deltas: {},
            relationship_deltas: { npc_okafor: RELD.IGNORED },
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'cb_bello_panel',
    title: 'An old disagreement, formalised',
    text: 'Bello chairs the review panel for your renewal. Fifteen years ago you took something he considered his. He has never mentioned it once.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 62],
    npcs: ['npc_bello'],
    grant: true,
    choices: [
      {
        label: 'Let the work speak',
        stat_check: { stats: ['SM'], modifier: -0.1 },
        outcomes: {
          success: {
            text: 'Funded, over his abstention. The programme officer mentions afterwards that he argued against the ranking and lost, and that he did it on physics.',
            stat_deltas: { SM: 0.5, GR: 0.3 },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: { SCI: 4 },
            relationship_deltas: { npc_bello: 3 },
            flags_set: [],
          },
          failure: {
            text: 'Declined. The written review is scrupulously fair and it still ends your programme two years early. You never find out how he voted.',
            stat_deltas: { GR: 0.5 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { NET: -2 },
            relationship_deltas: {},
            flags_set: ['lost_to_rival'],
          },
        },
      },
    ],
  },
  {
    id: 'cb_agarwal_lab',
    title: 'A call from your former student',
    text: 'Priya Agarwal is starting her own group and has one senior slot she can fill however she likes. She would like to fill it with you.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [45, 63],
    npcs: ['npc_agarwal'],
    choices: [
      {
        label: 'Join her group',
        outcomes: {
          success: {
            text: 'You work for someone you trained, which is stranger and better than you anticipated. She runs a good lab. You tell her so, and mean it.',
            stat_deltas: { IN: 0.5, CH: 0.3 },
            stress_delta: -12,
            reputation_deltas: { NET: 6, SCI: 3 },
            relationship_deltas: { npc_agarwal: RELD.COLLABORATED },
            flags_set: ['joined_mentee_lab'],
            mentee_success: 1,
            stayed_in_lab: true,
          },
        },
      },
      {
        label: 'Decline, but send her people',
        outcomes: {
          success: {
            text: 'You stay where you are and spend two years quietly steering good postdocs her way. Her group is excellent within five. Nobody writes that down anywhere.',
            stat_deltas: { CO: 0.3 },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: { NET: 5 },
            relationship_deltas: { npc_agarwal: RELD.HELPED },
            flags_set: [],
            mentee_success: 1,
            mentoring: 1,
          },
        },
      },
    ],
  },
  {
    id: 'cb_varga_collab',
    title: 'Réka has a proposal',
    text: 'Varga runs a group on the other side of the world now. She has a diagnostic you do not and a problem you have already solved. She proposes the obvious thing.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 62],
    npcs: ['npc_varga'],
    choices: [
      {
        label: 'Collaborate',
        outcomes: {
          success: {
            text: 'Two groups, eight time zones, and the best paper either of you has produced in a decade. You argue constantly and neither of you takes it personally.',
            stat_deltas: { SM: 0.5, CO: 0.5 },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: { ...REP.COLLABORATION, ...REP.INTERNATIONAL, SCI: 5 },
            relationship_deltas: { npc_varga: RELD.COLLABORATED },
            flags_set: ['varga_collab'],
            publications: 1,
          },
        },
      },
      {
        label: 'Politely decline',
        outcomes: {
          success: {
            text: 'You have your own programme to run. She publishes it eighteen months later with someone else, and it is very good, and you read it twice.',
            stat_deltas: {},
            stress_delta: 2,
            reputation_deltas: { SCI: -1 },
            relationship_deltas: { npc_varga: RELD.IGNORED },
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'cb_lindqvist_lab',
    title: 'Lindqvist is stepping back',
    text: 'Your old advisor is winding down and wants to hand his group to someone who will not dismantle it. He has never once asked you for anything.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [40, 62],
    npcs: ['npc_lindqvist'],
    choices: [
      {
        label: 'Take the group',
        stat_check: { stats: ['CO', 'CH'], modifier: 0.1 },
        outcomes: {
          success: {
            text: 'You inherit eleven people, a machine with a maintenance backlog, and a reputation built over thirty years. He sends one email of advice and then stays out of it entirely.',
            stat_deltas: { CO: 0.5, CH: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { NET: 6, SCI: 3 },
            relationship_deltas: { npc_lindqvist: RELD.CHOSE_THEM },
            flags_set: ['inherited_group'],
            leadership: true,
          },
          failure: {
            text: 'The department gives it to an external hire. Lindqvist is gracious about it and you can tell he is disappointed, which is worse than if he were not.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: { npc_lindqvist: -2 },
            flags_set: [],
          },
        },
      },
      {
        label: 'Recommend someone younger',
        outcomes: {
          success: {
            text: 'You put forward a name he had not considered. She runs it for fifteen years. He tells you at a conference dinner that it was the right call, which from him is a speech.',
            stat_deltas: { CH: 0.3 },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: { ...REP.HELPED_SUCCESSOR, NET: 4 },
            relationship_deltas: { npc_lindqvist: RELD.SPOKE_WELL },
            flags_set: [],
            mentoring: 1,
          },
        },
      },
    ],
  },
  {
    id: 'cb_nakamura_scoop',
    title: 'Nakamura got there first',
    text: 'Emi publishes the result you were four months from. Her data is good. She emails you before it goes live, which she did not have to do.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 55],
    npcs: ['npc_nakamura'],
    choices: [
      {
        label: 'Confirm her result publicly',
        outcomes: {
          success: {
            text: 'You publish the independent confirmation and say plainly that she was first. It costs you a headline and buys you a collaborator for twenty years.',
            stat_deltas: { GR: 0.3, CH: 0.3 },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: { ...REP.REPLICATED, ...REP.SCOOPED, NET: 4 },
            relationship_deltas: { npc_nakamura: RELD.SPOKE_WELL },
            flags_set: ['confirmed_rival_result'],
            publications: 1,
          },
        },
      },
      {
        label: 'Rush yours out anyway',
        stat_check: { stats: ['SM'], modifier: -0.1 },
        outcomes: {
          success: {
            text: 'You get it out in six weeks. It stands up, barely, and the field treats it as a footnote to hers. She stops sending you drafts early.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: REP.PUBLISH,
            relationship_deltas: { npc_nakamura: RELD.COMPETED_WON },
            flags_set: [],
            publications: 1,
          },
          failure: {
            text: 'You rush it and a referee finds an error you would have caught with another month. Withdrawn before publication. Nobody outside the review process knows, which is the only mercy.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { SCI: -3 },
            relationship_deltas: { npc_nakamura: -4 },
            flags_set: ['rushed_and_erred'],
          },
        },
      },
    ],
  },
  {
    id: 'cb_petrov_magnet',
    title: 'Petrov needs a second opinion',
    text: 'Ilya has a coil design that is either elegant or catastrophic and he cannot tell which anymore. He wants someone who will tell him the truth.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 62],
    npcs: ['npc_petrov'],
    choices: [
      {
        label: 'Review it properly',
        stat_check: { stats: ['SM', 'IN'] },
        outcomes: {
          success: {
            text: 'You find the quench-propagation problem in the third evening. He redesigns the joint and the magnet runs for a decade without incident.',
            stat_deltas: { SM: 0.5, IN: 0.5 },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: { ...REP.COLLABORATION, SCI: 4 },
            relationship_deltas: { npc_petrov: RELD.HELPED },
            flags_set: ['saved_petrov_magnet'],
          },
          failure: {
            text: 'You miss it too. The coil quenches in commissioning and takes eight months of schedule with it. Neither of you says the other should have caught it.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: { SCI: -2 },
            relationship_deltas: { npc_petrov: -3 },
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'cb_hartley_funding',
    title: 'The programme officer calls',
    text: 'Margaret Hartley has a discretionary line she can direct, and a decade of watching how you spend money. She is calling you first.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [40, 63],
    npcs: ['npc_hartley'],
    choices: [
      {
        label: 'Take it for your own programme',
        outcomes: {
          success: {
            text: 'Two years of runway without a proposal cycle. It is the most valuable thing anyone gives you all decade, and it never appears on your CV.',
            stat_deltas: { CO: 0.5 },
            stress_delta: -10,
            reputation_deltas: { NET: 4, SCI: 2 },
            relationship_deltas: { npc_hartley: RELD.CHOSE_THEM },
            flags_set: [],
          },
        },
      },
      {
        label: 'Point her at a junior group',
        outcomes: {
          success: {
            text: 'You name three early-career people who need it more. Hartley funds two of them. One of them remembers, permanently.',
            stat_deltas: { CH: 0.3 },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: { ...REP.HELPED_SUCCESSOR, NET: 5 },
            relationship_deltas: { npc_hartley: RELD.SPOKE_WELL },
            flags_set: ['redirected_funding'],
            mentoring: 1,
          },
        },
      },
    ],
  },
];
