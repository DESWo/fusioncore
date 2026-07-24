// Character creation: where you came from, and why you are here.
// Backgrounds add +1/+2 to specific stats and may push a stat past the
// creation cap of 10 (hard cap stays 12).

export const BACKGROUNDS = [
  {
    id: 'company_town',
    label: 'Power plant town',
    blurb: 'You grew up in the shadow of cooling towers. Half the town worked there. You learned early that electricity is a place, not a bill.',
    bonuses: { GR: 2, SM: 1 },
  },
  {
    id: 'academic_family',
    label: 'Academic household',
    blurb: 'Dinner table arguments came with citations. You knew what a referee report was before you knew what a mortgage was.',
    bonuses: { SM: 2, CO: 1 },
  },
  {
    id: 'immigrant_scholarship',
    label: 'Scholarship, far from home',
    blurb: 'You crossed an ocean on a stipend that barely covered the room. Nobody here knew your name and you had no fallback.',
    bonuses: { GR: 2, IN: 1 },
  },
  {
    id: 'machine_shop',
    label: 'Machine shop kid',
    blurb: 'You could weld before you could integrate. Hardware never intimidated you, which turns out to be rarer than it should be.',
    bonuses: { IN: 2, GR: 1 },
  },
  {
    id: 'debate_captain',
    label: 'Debate captain',
    blurb: 'You learned that being right is only half of it. The other half is the room.',
    bonuses: { CH: 2, CO: 1 },
  },
  {
    id: 'late_switcher',
    label: 'Switched in late',
    blurb: 'You were going to do something sensible. Then you read one paper about confinement and quietly changed your entire plan.',
    bonuses: { IN: 2, CH: 1 },
  },
  {
    id: 'legacy_network',
    label: 'Well-connected',
    blurb: 'Your family knows people. It opens doors you did not earn, and you will spend years proving you belong on the other side of them.',
    bonuses: { CO: 2, CH: 1 },
  },
];

export function backgroundById(id) {
  return BACKGROUNDS.find((b) => b.id === id) ?? null;
}
