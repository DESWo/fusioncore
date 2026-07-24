// Career mode tuning constants. Transcribed from the systems specification
// (§11) so every magic number in the career engine has exactly one home.
// Adjust here, never inline.

export const BALANCE = {
  // Stat system
  STAT_POOL: 30,
  STAT_MIN: 1,
  STAT_MAX: 12,
  STAT_CREATION_MAX: 10,
  GROWTH_MINOR: 0.3,
  GROWTH_STANDARD: 0.5,
  GROWTH_MAJOR: 0.8,
  LOSS_MINOR: -0.2,
  LOSS_STANDARD: -0.4,
  LOSS_MAJOR: -0.8,
  // keyed by the UPPER bound of each band: stat <= key uses that factor
  DIMINISHING: { 4: 1.0, 6: 0.75, 8: 0.5, 10: 0.25, 12: 0.1 },
  AGE_GROWTH_PENALTY_START: 50,
  AGE_GROWTH_MULTIPLIER: 0.5,

  // Stat checks
  CHECK_BASE: 0.3,
  CHECK_PER_STAT: 0.06,
  CHECK_MIN: 0.05,
  CHECK_MAX: 0.95,
  EXCELLENT_OFFSET: 0.15,
  FAVORABLE_MOD: 0.10,
  UNFAVORABLE_MOD: -0.10,

  // Stress
  STRESS_MAX: 100,
  STRESS_PENALTY_START: 60,
  STRESS_PENALTY_PER_POINT: 0.01,
  STRESS_RANDOM_NEGATIVE_THRESHOLD: 81,
  STRESS_RANDOM_NEGATIVE_CHANCE: 0.3,
  STRESS_BURNOUT: 100,
  STRESS_BURNOUT_RECOVERY: 40,
  STRESS_YEARLY_BASE: 2,
  STRESS_YEARLY_BASE_OVER_40: 4,
  STRESS_YEARLY_BASE_AGE: 40,

  // Events
  MAX_EVENTS_PER_YEAR: 4,
  MAX_DECISION_EVENTS: 2,
  MAX_RANDOM_EVENTS: 2,
  MAX_REACTOR_SIMS: 5,
  REACTOR_SIM_COOLDOWN_YEARS: 4,
  NEGATIVE_WEIGHT_MULTIPLIER: 2,

  // College and grad
  START_AGE: 18,
  COLLEGE_MIN_PROGRESS: 4,
  COLLEGE_MIN_AGE: 21,
  COLLEGE_MAX_AGE: 24,
  GRAD_MIN_PROGRESS: 4,
  GRAD_MIN_YEARS: 4,
  GRAD_MAX_YEARS: 8,

  // Career transitions
  MID_CAREER_MIN_AGE: 35,
  MID_CAREER_MIN_PUBS: 10,
  MID_CAREER_MIN_NET: 40,
  SENIOR_MIN_AGE: 50,
  SENIOR_MIN_SCI: 50,
  RETIRE_AVAILABLE_AGE: 55,
  FORCED_RETIRE_AGE: 65,
  PIVOT_MIN_AGE: 32,
  PIVOT_MAX_AGE: 40,

  // Relationships
  REL_DEFAULT_SCORE: 50,
  REL_MIN: 0,
  REL_MAX: 100,
  REL_HOSTILE_MAX: 20,
  REL_COLD_MAX: 40,
  REL_NEUTRAL_MAX: 60,
  REL_WARM_MAX: 80,

  // Reputation gates (§4.4)
  REP_SCI_PANEL: 60,
  REP_SCI_KEYNOTE: 80,
  REP_SCI_LOW: 20,
  REP_SCI_LOW_MOD: -0.10,
  REP_PUB_TESTIMONY: 50,
  REP_PUB_MEDIA: 70,
  REP_PUB_INVISIBLE: 10,
  REP_NET_BETTER_OFFERS: 50,
  REP_NET_COLLAB: 70,
  REP_NET_LOW: 20,
  REP_NET_LOW_MOD: -0.05,
};

export const STATS = ['SM', 'IN', 'CH', 'GR', 'CO'];

export const STAT_LABELS = {
  SM: 'Smarts',
  IN: 'Intuition',
  CH: 'Charisma',
  GR: 'Grit',
  CO: 'Connections',
};

export const STAT_BLURBS = {
  SM: 'Raw analytical horsepower. Physics, math, and seeing the flaw in a derivation.',
  IN: 'The hunch that pays off. Knowing which experiment is worth running.',
  CH: 'Talks, interviews, and convincing a room that your idea deserves money.',
  GR: 'Staying when it stops being fun. Failed runs, rejected papers, year eleven.',
  CO: 'Who takes your call. The people who remember you when a seat opens up.',
};

export const REPUTATION_LABELS = {
  SCI: 'Scientific Credibility',
  PUB: 'Public Profile',
  NET: 'Network Strength',
};
