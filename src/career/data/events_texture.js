// Texture: the recurring weather of a research life. These are repeatable on
// long cooldowns so a forty-year career never runs out of years that feel
// lived in. They carry small stakes by design; the decision events carry the
// large ones.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REP } from '../engine/reputation.js';

const ALL_WORK = [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR];
const EVERYWHERE = [STAGE.GRAD_SCHOOL, ...ALL_WORK];

const texture = (id, title, text, opts = {}) => ({
  id,
  title,
  text,
  type: EVENT_TYPE.RANDOM,
  stage: opts.stage ?? EVERYWHERE,
  age_range: opts.age_range ?? [22, 65],
  weight: opts.weight ?? 1,
  max_fires: opts.max_fires ?? 4,
  cooldown_years: opts.cooldown_years ?? 6,
  negative: opts.negative ?? false,
  effects: opts.effects ?? {},
});

export const TEXTURE_EVENTS = [
  // ---- the undergraduate years, which are short and crowded ----
  texture('tx_col_exam_week', 'Exam week',
    'Four papers in six days. You revise in a stairwell because every study room on campus was taken by eight in the morning.',
    { stage: [STAGE.COLLEGE], age_range: [18, 24], cooldown_years: 2, max_fires: 3,
      effects: { stress_delta: 6, stat_deltas: { GR: 0.3 } }, negative: true }),

  texture('tx_col_lab_class', 'The teaching lab',
    'An experiment designed in 1978 to demonstrate a principle you already understand. You get a result that disagrees with the manual and spend an hour finding out why.',
    { stage: [STAGE.COLLEGE], age_range: [18, 24], cooldown_years: 2, max_fires: 3,
      effects: { stat_deltas: { IN: 0.3, SM: 0.3 }, stress_delta: 3 } }),

  texture('tx_col_friend', 'Someone switches out',
    'A friend from first year moves to computer science. They are relieved. You spend an evening wondering, briefly and privately, whether they were the smart one.',
    { stage: [STAGE.COLLEGE], age_range: [18, 24], cooldown_years: 3, max_fires: 2,
      effects: { stress_delta: STRESS.MINOR_SETBACK }, negative: true }),

  texture('tx_col_seminar', 'A talk you were not ready for',
    'A visiting researcher presents work three years past your level. You understand maybe a fifth of it and write down every unfamiliar term.',
    { stage: [STAGE.COLLEGE], age_range: [18, 24], cooldown_years: 2, max_fires: 3,
      effects: { stat_deltas: { SM: 0.3 }, stress_delta: 2 } }),

  texture('tx_proposal_season', 'Proposal season',
    'Six weeks where nobody in the group does any physics. Budgets, biosketches, and a facilities statement that has not changed since 2043.',
    { effects: { stress_delta: STRESS.HIGH_WORKLOAD, stat_deltas: { GR: 0.3 } }, negative: true }),

  texture('tx_committee', 'Committee work',
    'Safety review, curriculum review, or the search committee. Somebody has to, and this year it is you.',
    { effects: { stress_delta: 5, stat_deltas: { CO: 0.3 }, reputation_deltas: { NET: 2 } } }),

  texture('tx_good_student', 'A student gets it',
    'You explain the same thing you have explained a hundred times, and this time you watch it land. They will be better than you at this.',
    { stage: ALL_WORK, effects: { stress_delta: STRESS.MENTORING, reputation_deltas: REP.MENTOR, mentoring: 1 } }),

  texture('tx_hallway_idea', 'A conversation by the coffee machine',
    'Somebody from the materials group mentions a problem in passing, and you realise it is your problem wearing different clothes.',
    { effects: { stat_deltas: { IN: 0.3 }, stress_delta: -3, reputation_deltas: { NET: 2 } } }),

  texture('tx_travel', 'Too many airports',
    'Four countries in nine days. You give the same talk three times and improve it twice. You do not see any of the cities.',
    { stage: ALL_WORK, age_range: [30, 65], effects: { stress_delta: 7, reputation_deltas: { ...REP.CONFERENCE, PUB: 1 } } }),

  texture('tx_equipment_win', 'The thing finally works',
    'Eight months of a diagnostic that would not calibrate, and then on an ordinary Tuesday it calibrates. Nobody else in the building understands why you are elated.',
    { effects: { stat_deltas: { IN: 0.3, GR: 0.3 }, stress_delta: STRESS.SUCCESS } }),

  texture('tx_budget_cut', 'The budget letter',
    'A flat allocation, which after inflation is a cut. You lose a postdoc line and rewrite the year plan around it.',
    { stage: ALL_WORK, negative: true, effects: { stress_delta: STRESS.STANDARD_SETBACK, reputation_deltas: { NET: -1 } } }),

  texture('tx_paper_accepted', 'Accepted',
    'The email arrives at 06:12 and you read it twice. Minor revisions. After eleven months, minor revisions feels like a standing ovation.',
    { effects: { stress_delta: STRESS.SUCCESS, reputation_deltas: REP.PUBLISH, publications: 1 } }),

  texture('tx_outreach', 'A school visit',
    'Thirty teenagers, one plasma ball, and a question you cannot answer from a fourteen-year-old at the back.',
    { stage: ALL_WORK, effects: { stat_deltas: { CH: 0.3 }, stress_delta: -4, reputation_deltas: REP.OUTREACH, outreach: 1 } }),

  texture('tx_family', 'Something at home',
    'A parent is unwell, or a relationship needs attention you have not been giving it. The work will still be there. You tell yourself that and half believe it.',
    { age_range: [28, 65], negative: true, effects: { stress_delta: STRESS.LIFE_EVENT } }),

  texture('tx_rest', 'Two weeks with the phone off',
    'You go somewhere without a conference attached and do not check the run logs. It takes four days to stop thinking about the machine.',
    { effects: { stress_delta: STRESS.REST } }),

  texture('tx_referee', 'You are reviewer 2',
    'A manuscript lands in your inbox with a claim that is one careful check away from falling apart. You could be brief. You write four pages instead.',
    { stage: ALL_WORK, effects: { stat_deltas: { SM: 0.3 }, stress_delta: 4, reputation_deltas: { SCI: 1, NET: 1 } } }),

  texture('tx_field_moves', 'The field moves',
    'A result out of a group you had not heard of changes what everyone will work on for five years. You spend a weekend reading and feel briefly obsolete.',
    { effects: { stat_deltas: { IN: 0.3 }, stress_delta: 4 } }),

  texture('tx_night_shift', 'Night shift',
    'The machine runs when the grid is cheap, which means you are in the control room at four in the morning with cold coffee and good data.',
    { effects: { stat_deltas: { GR: 0.3 }, stress_delta: 5, reputation_deltas: { SCI: 1 } } }),

  texture('tx_colleague_leaves', 'Someone good leaves the field',
    'A person you rated goes to finance, or software, or anywhere with a salary and a schedule. They are happier. You are pleased for them and something else as well.',
    { stage: ALL_WORK, negative: true, effects: { stress_delta: STRESS.RELATIONSHIP_CONFLICT, reputation_deltas: { NET: -1 } } }),

  texture('tx_grant_renewed', 'Renewed',
    'No fanfare, no announcement. A line in a portal changes from PENDING to AWARDED and forty people keep their jobs for three more years.',
    { stage: ALL_WORK, age_range: [32, 65], effects: { stress_delta: STRESS.MAJOR_SUCCESS, reputation_deltas: { NET: 2, SCI: 1 } } }),
];
