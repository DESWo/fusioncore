// Career stages (spec §6). The player never sees these labels; they decide
// which event pool is live. Progress through school is event-driven, not
// calendar-driven, so a player who engages more finishes sooner.
import { BALANCE } from './balance.js';

export const STAGE = {
  COLLEGE: 'COLLEGE',
  GRAD_SCHOOL: 'GRAD_SCHOOL',
  EARLY_CAREER: 'EARLY_CAREER',
  MID_CAREER: 'MID_CAREER',
  SENIOR: 'SENIOR',
  RETIRED: 'RETIRED',
};

export const PATH = {
  ACADEMIA: 'academia',
  NATIONAL_LAB: 'national_lab',
  STARTUP: 'startup',
  INTERNATIONAL: 'international',
};

export const PATH_LABELS = {
  [PATH.ACADEMIA]: 'Academia',
  [PATH.NATIONAL_LAB]: 'National Lab',
  [PATH.STARTUP]: 'Fusion Startup',
  [PATH.INTERNATIONAL]: 'International Program',
};

/** Can the player graduate college this year (§6.2)? */
export function canGraduateCollege(player) {
  return (
    player.college_progress >= BALANCE.COLLEGE_MIN_PROGRESS &&
    player.age >= BALANCE.COLLEGE_MIN_AGE
  );
}
export function mustGraduateCollege(player) {
  return player.age >= BALANCE.COLLEGE_MAX_AGE;
}

/** Can the defense fire (§6.2)? Needs progress AND four years served. */
export function canDefend(player) {
  const yearsIn = player.age - (player.college_grad_age ?? BALANCE.COLLEGE_MIN_AGE);
  return (
    player.grad_progress >= BALANCE.GRAD_MIN_PROGRESS &&
    yearsIn >= BALANCE.GRAD_MIN_YEARS
  );
}
export function mustDefend(player) {
  const yearsIn = player.age - (player.college_grad_age ?? BALANCE.COLLEGE_MIN_AGE);
  return yearsIn >= BALANCE.GRAD_MAX_YEARS;
}

/** Mid-career gate (§6.1): age plus any one marker of having arrived. */
export function qualifiesMidCareer(player, reputation) {
  if (player.age < BALANCE.MID_CAREER_MIN_AGE) return false;
  return (
    player.has_leadership_role ||
    player.publications >= BALANCE.MID_CAREER_MIN_PUBS ||
    reputation.NET >= BALANCE.MID_CAREER_MIN_NET
  );
}

/** Senior gate (§6.1). */
export function qualifiesSenior(player, reputation) {
  if (player.age < BALANCE.SENIOR_MIN_AGE) return false;
  return reputation.SCI >= BALANCE.SENIOR_MIN_SCI || player.has_leadership_role;
}

/**
 * The stage the player should be in right now. School stages are advanced by
 * their own transition events, so this only promotes forward through the
 * post-PhD stages.
 */
export function resolveStage(player, reputation) {
  const stage = player.career_stage;
  if (stage === STAGE.COLLEGE || stage === STAGE.GRAD_SCHOOL || stage === STAGE.RETIRED) {
    return stage;
  }
  if (qualifiesSenior(player, reputation)) return STAGE.SENIOR;
  if (qualifiesMidCareer(player, reputation)) return STAGE.MID_CAREER;
  return STAGE.EARLY_CAREER;
}

export function canRetire(player) {
  return player.age >= BALANCE.RETIRE_AVAILABLE_AGE;
}
export function mustRetire(player) {
  return player.age >= BALANCE.FORCED_RETIRE_AGE;
}

/** The one window where the player may switch tracks (§6.4). */
export function canPivot(player) {
  return (
    !player.pivoted &&
    player.career_path !== null &&
    player.age >= BALANCE.PIVOT_MIN_AGE &&
    player.age <= BALANCE.PIVOT_MAX_AGE
  );
}

/** Shown in the header. Deliberately job-flavoured, not stage-labelled. */
export function stageTitle(player) {
  switch (player.career_stage) {
    case STAGE.COLLEGE: return 'Undergraduate';
    case STAGE.GRAD_SCHOOL: return 'Doctoral Candidate';
    case STAGE.EARLY_CAREER:
      return player.career_path === PATH.STARTUP ? 'Founding Engineer' : 'Postdoctoral Researcher';
    case STAGE.MID_CAREER:
      return player.has_leadership_role ? 'Group Leader' : 'Research Scientist';
    case STAGE.SENIOR:
      return player.has_leadership_role ? 'Program Director' : 'Senior Scientist';
    case STAGE.RETIRED: return 'Retired';
    default: return 'Researcher';
  }
}
