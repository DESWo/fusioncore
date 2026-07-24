// Life events. None of these are about fusion, which is the point: a life is
// mostly the other thing, and the game only means something if the machine has
// to compete with it.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { COST } from '../engine/money.js';

const EVERY = [STAGE.COLLEGE, STAGE.GRAD_SCHOOL, STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR];
const WORKING = [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR];

export const LIFE_EVENTS = [
  {
    id: 'life_move_in',
    title: 'Moving in',
    text: 'Two leases, one relationship, and a conversation you have both been circling for months.',
    type: EVENT_TYPE.DECISION,
    stage: EVERY,
    age_range: [22, 55],
    weight: 3,
    max_fires: 1,
    prerequisites: { has_partner: true },
    choices: [
      {
        label: 'Find a place together',
        outcomes: {
          success: {
            text: 'A flat with bad light and a kitchen you both complain about. It is the first place that is yours rather than somewhere you sleep.',
            stat_deltas: { CH: 0.3 },
            stress_delta: -8,
            reputation_deltas: {},
            partner_delta: 12,
            flags_set: ['moved_in'],
          },
        },
      },
      {
        label: 'Keep your own place for now',
        outcomes: {
          success: {
            text: 'You give a reason about the commute that is true and not the reason. They accept it, and something waits a bit longer.',
            stat_deltas: {},
            stress_delta: 3,
            reputation_deltas: {},
            partner_delta: -8,
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'life_marriage',
    title: 'The question',
    text: 'Years in, and it comes up over an ordinary dinner rather than anywhere memorable. Neither of you is nervous, which is how you know.',
    type: EVENT_TYPE.DECISION,
    stage: EVERY,
    age_range: [24, 58],
    weight: 3,
    max_fires: 1,
    prerequisites: { has_partner: true, min_partner_score: 60, flags: ['moved_in'] },
    choices: [
      {
        label: 'Marry them',
        outcomes: {
          success: {
            text: 'Small, cheap, and the right people came. Your supervisor gave a speech that was mostly about neutron transport and somehow landed.',
            stat_deltas: { CH: 0.3, GR: 0.3 },
            stress_delta: -12,
            reputation_deltas: {},
            partner_delta: 18,
            money_delta: -12000,
            marry: true,
            flags_set: ['married'],
          },
        },
      },
      {
        label: 'Stay as you are',
        outcomes: {
          success: {
            text: 'You are both fine with it, mostly. It comes up again at intervals for years, always gently.',
            stat_deltas: {},
            stress_delta: 2,
            reputation_deltas: {},
            partner_delta: -4,
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'life_children',
    title: 'Whether to have a child',
    text: 'The timing will never be good. There is always a grant cycle, a campaign, a paper. That is the entire problem with waiting for the timing to be good.',
    type: EVENT_TYPE.DECISION,
    stage: EVERY,
    age_range: [26, 46],
    weight: 3,
    max_fires: 2,
    cooldown_years: 4,
    prerequisites: { has_partner: true, min_partner_score: 50 },
    choices: [
      {
        label: 'Have a child',
        outcomes: {
          text: '',
          success: {
            text: 'Everything reorganises around a person who weighs almost nothing. You will do the best work of your life on four hours less sleep a night.',
            stat_deltas: { GR: 0.5, CH: 0.3 },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            partner_delta: 10,
            have_child: true,
            flags_set: ['has_children'],
          },
        },
      },
      {
        label: 'Not now',
        outcomes: {
          success: {
            text: 'You agree to revisit it. Some couples revisit it and some let the question quietly age out, and you do not know yet which of those you are.',
            stat_deltas: {},
            stress_delta: 4,
            reputation_deltas: {},
            partner_delta: -3,
            flags_set: [],
          },
        },
      },
      {
        label: 'Decide against it, properly',
        outcomes: {
          success: {
            text: 'You talk it through fully and choose the life you already have. It is a real decision rather than a deferral, and it settles something in both of you.',
            stat_deltas: { GR: 0.3 },
            stress_delta: -6,
            reputation_deltas: {},
            partner_delta: 6,
            flags_set: ['chose_no_children'],
          },
        },
      },
    ],
  },
  {
    id: 'life_house',
    title: 'A place of your own',
    text: `The deposit is ${'$'}${(COST.HOME_DEPOSIT / 1000).toFixed(0)}k and it is most of what you have. Renting is money you never see again; owning is a decade of being unable to move for a job.`,
    type: EVENT_TYPE.DECISION,
    stage: WORKING,
    age_range: [28, 58],
    weight: 2,
    max_fires: 1,
    prerequisites: { min_money: COST.HOME_DEPOSIT },
    choices: [
      {
        label: 'Buy it',
        outcomes: {
          success: {
            text: 'A mortgage, a garden you will not have time for, and the specific relief of not being asked to leave every two years.',
            stat_deltas: { GR: 0.3 },
            stress_delta: -6,
            reputation_deltas: {},
            partner_delta: 6,
            money_delta: -COST.HOME_DEPOSIT,
            buy_home: true,
            flags_set: ['owns_home'],
          },
        },
      },
      {
        label: 'Keep renting, stay mobile',
        outcomes: {
          success: {
            text: 'You keep the cash and the option to move for the right position. Two colleagues buy that year and talk about nothing else.',
            stat_deltas: {},
            stress_delta: 2,
            reputation_deltas: {},
            flags_set: ['stayed_mobile'],
          },
        },
      },
    ],
  },
  {
    id: 'life_parent_ill',
    title: 'A call about a parent',
    text: 'They have been managing it quietly for months and have run out of ways to not mention it. They are four hours away.',
    type: EVENT_TYPE.DECISION,
    stage: WORKING,
    age_range: [34, 60],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Go. Be there for it.',
        outcomes: {
          success: {
            text: 'Months of weekends on trains and a campaign you hand to someone else. You do not regret it, and it costs you a year of the work.',
            stat_deltas: { GR: 0.5, CH: 0.3 },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: { SCI: -2 },
            health_delta: -3,
            flags_set: ['cared_for_parent'],
          },
        },
      },
      {
        label: 'Send money, call weekly',
        outcomes: {
          success: {
            text: 'It is the practical answer and everyone says it is fine. You think about the drive you did not make for a long time afterwards.',
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            money_delta: -18000,
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'life_health_scare',
    title: 'The scan',
    text: 'A routine check turns into a second appointment, then a third. Two weeks of waiting in which the machine and the grant and the paper become abruptly small.',
    type: EVENT_TYPE.DECISION,
    stage: WORKING,
    age_range: [42, 64],
    weight: 2,
    max_fires: 1,
    choices: [
      {
        label: 'Take the year seriously',
        outcomes: {
          success: {
            text: 'It turns out to be manageable, and you rearrange your life anyway. Everyone says you look better. You are furious it took this.',
            stat_deltas: { GR: 0.5 },
            stress_delta: -10,
            reputation_deltas: {},
            health_delta: 12,
            flags_set: ['health_wakeup'],
          },
        },
      },
      {
        label: 'Get the treatment, change nothing',
        outcomes: {
          success: {
            text: 'You are back at work inside a fortnight. The consultant uses the word "again" in a way that stays with you.',
            stat_deltas: { GR: 0.3 },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            health_delta: -6,
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'life_friend_wedding',
    title: 'Everyone else is getting on with it',
    text: 'A wedding where three people ask what you actually do, and one of them earns triple what you do and finds your answer charming.',
    type: EVENT_TYPE.RANDOM,
    stage: EVERY,
    age_range: [24, 40],
    weight: 2,
    max_fires: 2,
    cooldown_years: 6,
    effects: { stress_delta: 4, money_delta: -1200, stat_deltas: { CH: 0.2 } },
  },
  {
    id: 'life_money_tight',
    title: 'The account gets low',
    text: 'You run the numbers twice. Rent, the card, the thing the car needs. It is fine, but only just, and you are not twenty-two anymore.',
    type: EVENT_TYPE.RANDOM,
    stage: EVERY,
    age_range: [22, 45],
    weight: 2,
    negative: true,
    max_fires: 3,
    cooldown_years: 5,
    prerequisites: { max_money: 12000 },
    effects: { stress_delta: STRESS.LIFE_EVENT },
  },
  {
    id: 'life_good_year_home',
    title: 'An ordinary good year',
    text: 'Nothing happened. Meals, a holiday you actually took, a Sunday where nobody needed anything. You will remember it more fondly than several of the important ones.',
    type: EVENT_TYPE.RANDOM,
    stage: EVERY,
    age_range: [24, 65],
    weight: 2,
    max_fires: 4,
    cooldown_years: 5,
    prerequisites: { has_partner: true },
    effects: { stress_delta: -10, partner_delta: 6 },
  },
  {
    id: 'life_child_moment',
    title: 'They ask what you do',
    text: 'Your child wants to know what you actually do all day. You explain fusion with two oranges and a torch, and they are rapt for a full four minutes.',
    type: EVENT_TYPE.RANDOM,
    stage: WORKING,
    age_range: [32, 60],
    weight: 2,
    max_fires: 3,
    cooldown_years: 5,
    prerequisites: { has_children: true },
    effects: { stress_delta: -8, stat_deltas: { CH: 0.2 } },
  },

  // The money events. QA 2026-07-22 found the deepest hole in the game is
  // financial and the game never said so until the retrospective: a research
  // salary against compounding debt can be a forty-year losing position. The
  // economy stays exactly as harsh as it is; these two events make sure the
  // player hears the arithmetic while there is still time to act on it.
  {
    id: 'life_kitchen_table_math',
    title: 'The spreadsheet on the kitchen table',
    text: 'One evening you finally put every number in one place: the pay, the rent, the interest. The total at the bottom of the column has a minus sign, and it is growing on its own.',
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL, STAGE.EARLY_CAREER],
    age_range: [22, 40],
    weight: 4,
    max_fires: 1,
    prerequisites: { min_debt: 150000 },
    choices: [
      {
        label: 'Do the arithmetic honestly',
        outcomes: {
          success: {
            text: 'At five percent, what you owe costs more each year than any raise you can earn by working harder. Whatever you decide next, you decide it knowing that.',
            stat_deltas: { GR: 0.3 },
            stress_delta: 5,
            reputation_deltas: {},
            flags_set: ['did_the_math'],
          },
        },
      },
      {
        label: 'Take the consulting you keep refusing',
        outcomes: {
          success: {
            text: 'Evenings, mostly, and the occasional weekend. It pays like the problem it is solving, which the bench never has.',
            stat_deltas: { CO: 0.3 },
            stress_delta: 6,
            reputation_deltas: {},
            side_income: 22000,
            flags_set: ['did_the_math'],
          },
        },
      },
      {
        label: 'Put the spreadsheet away',
        outcomes: {
          success: {
            text: 'You know roughly what it says. Roughly is survivable this year, and this year is the part you can see.',
            stat_deltas: {},
            stress_delta: -3,
            reputation_deltas: {},
            flags_set: [],
          },
        },
      },
    ],
  },
  {
    id: 'life_underwater',
    title: 'Underwater',
    text: 'The debt has its own gravity now: the interest outruns what the household brings in, and pretending otherwise has stopped working. Something about how you live has to change, or nothing will.',
    type: EVENT_TYPE.DECISION,
    stage: WORKING,
    age_range: [30, 58],
    weight: 5,
    max_fires: 1,
    prerequisites: { min_debt: 350000 },
    choices: [
      {
        label: 'Consolidate and cut',
        outcomes: {
          success: {
            text: 'A morning at the bank and a worse car. The number stops growing by itself, which is the first good financial news in a decade.',
            stat_deltas: { GR: 0.4 },
            stress_delta: 5,
            reputation_deltas: {},
            debt_delta: -40000,
            partner_delta: -4,
            flags_set: ['consolidated'],
          },
        },
      },
      {
        label: 'Sell the expertise properly',
        outcomes: {
          success: {
            text: 'A standing retainer, real invoices, a rate that made you flinch to say out loud. The bench gets less of you, and the ledger finally gets enough.',
            stat_deltas: { CO: 0.4 },
            stress_delta: 4,
            reputation_deltas: { SCI: -3 },
            side_income: 45000,
            flags_set: ['sells_expertise'],
          },
        },
      },
      {
        label: 'Choose this life anyway, eyes open',
        outcomes: {
          success: {
            text: 'You run the numbers one more time, and then you keep the work and the family and the debt. Not everyone prices a life in dollars. It will cost you exactly what you think it will.',
            stat_deltas: { GR: 0.5 },
            stress_delta: -6,
            reputation_deltas: {},
            flags_set: ['chose_it_anyway'],
          },
        },
      },
    ],
  },
];
