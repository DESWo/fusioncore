// Reactor sim set-pieces (spec §8). Five moments across a career where the
// narrative hands control to the physics engine the rest of the game is built
// on. Skipping always resolves as ADEQUATE: an accessibility feature, not a
// punishment (§8.3).
import { PATH } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REP } from '../engine/reputation.js';

export const CAREER_SIMS = [
  {
    sim_id: 'sim_thesis',
    order: 1,
    title: 'Your thesis experiment',
    narrative_setup:
      'Six years of work comes down to one campaign. Hold the plasma steady and get the measurement. Your committee reads the result, not the effort.',
    difficulty: 'Tutorial. Generous limits, guidance on.',
    preset: {
      mode: 'fusion',
      target_metric: 'q_factor',
      target_value: 0.6,
      time_limit_seconds: 180,
      guidance: true,
    },
    isDue: (p) => p.career_stage === 'GRAD_SCHOOL' && p.grad_progress >= 2,
    effects: {
      excellent: {
        text: 'Clean data, first attempt. Chapter four writes itself and the external examiner will call it the strongest section.',
        stat_deltas: { IN: 0.8, SM: 0.5 },
        stress_delta: STRESS.MAJOR_SUCCESS,
        reputation_deltas: { SCI: 6 },
        publications: 1,
      },
      adequate: {
        text: 'You get the measurement. The error bars are wider than you would like and the result is real, which is what matters.',
        stat_deltas: { IN: 0.5, GR: 0.3 },
        stress_delta: STRESS.SUCCESS,
        reputation_deltas: { SCI: 3 },
        publications: 1,
      },
      failure: {
        text: 'The campaign ends early and the data will not support the claim. You get one more run next quarter, and you spend the interval learning exactly why it failed.',
        stat_deltas: { GR: 0.5 },
        stress_delta: STRESS.MAJOR_SETBACK,
        reputation_deltas: {},
      },
    },
  },
  {
    sim_id: 'sim_first_lab',
    order: 2,
    title: 'Your first campaign as lead',
    narrative_setup:
      'Your name is on the run plan. Eight people are in the control room because you asked them to be. Get the machine to the operating point and hold it.',
    difficulty: 'Standard. Tighter targets, no guidance.',
    preset: {
      mode: 'fusion',
      target_metric: 'q_factor',
      target_value: 1.0,
      time_limit_seconds: 150,
      guidance: false,
    },
    isDue: (p) => p.career_stage === 'EARLY_CAREER' && p.years_since_first_job >= 2,
    effects: {
      excellent: {
        text: 'Breakeven, on your run plan, with your team. Somebody photographs the control room screen and it ends up framed in the corridor.',
        stat_deltas: { IN: 0.8, CH: 0.5 },
        stress_delta: STRESS.MAJOR_SUCCESS,
        reputation_deltas: { ...REP.BREAKTHROUGH },
        publications: 1,
        breakthroughs: 1,
      },
      adequate: {
        text: 'You reach the operating point and hold it long enough to matter. The paper is solid. Nobody frames a photograph of it.',
        stat_deltas: { IN: 0.5, CH: 0.3 },
        stress_delta: STRESS.SUCCESS,
        reputation_deltas: { ...REP.PUBLISH },
        publications: 1,
      },
      failure: {
        text: 'A disruption at minute nine ends the shot and the shift. You debrief honestly in front of your own team, which is harder than the physics.',
        stat_deltas: { GR: 0.5, CH: 0.3 },
        stress_delta: STRESS.MAJOR_SETBACK,
        reputation_deltas: { SCI: -1 },
      },
    },
  },
  {
    sim_id: 'sim_crisis',
    order: 3,
    title: 'The night something breaks',
    narrative_setup:
      'A cooling pump fails mid-campaign with the machine near its limits. You have the controls and about ninety seconds of useful margin. Bring it down safely, or save the run.',
    difficulty: 'Time pressure. Something fails mid-run.',
    preset: {
      mode: 'fission',
      target_metric: 'stability',
      target_value: 1,
      time_limit_seconds: 120,
      guidance: false,
      inject_fault: 'pump_trip',
    },
    isDue: (p) =>
      p.age >= 38 && p.age <= 45 && p.career_path !== PATH.STARTUP,
    effects: {
      excellent: {
        text: 'You bring it to a controlled shutdown without a single limit exceeded. The incident report is two pages and reads like a training document, which is what it becomes.',
        stat_deltas: { GR: 0.8, IN: 0.5 },
        stress_delta: STRESS.STANDARD_SETBACK,
        reputation_deltas: { SCI: 5, NET: 4 },
      },
      adequate: {
        text: 'You get it down. Something is damaged and nobody is hurt, and the review finds your actions reasonable throughout.',
        stat_deltas: { GR: 0.5 },
        stress_delta: STRESS.MAJOR_SETBACK,
        reputation_deltas: { SCI: 2 },
      },
      failure: {
        text: 'The machine protects itself before you do. Six months of repairs and a formal investigation that concludes, gently, that you were slow.',
        stat_deltas: { GR: 0.5 },
        stress_delta: STRESS.MAJOR_SETBACK + STRESS.LIFE_EVENT,
        reputation_deltas: { SCI: -4 },
      },
    },
  },
  {
    sim_id: 'sim_record',
    order: 4,
    title: 'The record attempt',
    narrative_setup:
      'The machine has never been pushed this far. The window is narrow, the margins are thin, and there are people watching who do not usually watch.',
    difficulty: 'Precision. Very tight target window.',
    preset: {
      mode: 'fusion',
      target_metric: 'q_factor',
      target_value: 5.0,
      time_limit_seconds: 150,
      guidance: false,
    },
    isDue: (p, rep) => p.age >= 45 && p.age <= 55 && (rep?.SCI ?? 0) >= 50,
    effects: {
      excellent: {
        text: 'You hold it well past the target and the data is unambiguous. It leads every science bulletin in the field for a week, and the number goes into textbooks.',
        stat_deltas: { IN: 0.8, CH: 0.5 },
        stress_delta: STRESS.MAJOR_SUCCESS,
        reputation_deltas: { ...REP.BREAKTHROUGH, PUB: 10 },
        publications: 1,
        breakthroughs: 1,
      },
      adequate: {
        text: 'You reach it, briefly, and the measurement stands up to scrutiny. Not the headline anyone hoped for. A real number, honestly obtained.',
        stat_deltas: { IN: 0.5 },
        stress_delta: STRESS.SUCCESS,
        reputation_deltas: { SCI: 6, PUB: 4 },
        publications: 1,
      },
      failure: {
        text: 'The window closes without the shot. The press release is never sent. Your team takes it harder than you do, and you spend a week telling them why it was still worth trying.',
        stat_deltas: { GR: 0.5, CH: 0.3 },
        stress_delta: STRESS.MAJOR_SETBACK,
        reputation_deltas: { SCI: 1 },
      },
    },
  },
  {
    sim_id: 'sim_legacy',
    order: 5,
    title: 'One more time, with your own hands',
    narrative_setup:
      'No committee, no press, no deliverable. A machine, a question you have carried for thirty years, and an afternoon of beam time nobody else wanted.',
    difficulty: 'Open ended. No single correct approach.',
    preset: {
      mode: 'fusion',
      target_metric: 'burn_duration',
      target_value: 60,
      time_limit_seconds: 240,
      guidance: false,
      open_ended: true,
    },
    isDue: (p) => p.age >= 58 && p.age <= 64 && p.stayed_in_lab,
    effects: {
      excellent: {
        text: 'It works. Not spectacularly, not for the record books, but exactly as you predicted in a notebook in 2038. You sit in the empty control room afterwards for a long time.',
        stat_deltas: { IN: 0.8 },
        stress_delta: -20,
        reputation_deltas: { SCI: 6 },
        publications: 1,
      },
      adequate: {
        text: 'Close. Close enough to know the idea was sound and the machine was never going to be the one that showed it. You write it up for whoever comes next.',
        stat_deltas: { IN: 0.5, GR: 0.3 },
        stress_delta: -12,
        reputation_deltas: { SCI: 3 },
        publications: 1,
      },
      failure: {
        text: 'It does not work, and at this point in a career that is simply information. You leave the notebook open on the desk for the next person.',
        stat_deltas: { GR: 0.3 },
        stress_delta: -8,
        reputation_deltas: { SCI: 1 },
      },
    },
  },
];

export function simById(id) {
  return CAREER_SIMS.find((s) => s.sim_id === id) ?? null;
}

/** Which sim is due this year, honouring order, cooldown and the cap. */
export function dueSim(player, reputation) {
  const done = new Set(player.sims_done ?? []);
  return (
    CAREER_SIMS.find((s) => !done.has(s.sim_id) && s.isDue(player, reputation)) ?? null
  );
}
