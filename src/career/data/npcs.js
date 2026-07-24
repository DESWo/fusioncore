// The cast (spec §5.5). Fictional composites, names chosen to reflect how
// international fusion research actually is. A run draws 15 to 20 of these
// based on the player's path, so no two careers meet the same people.

export const NPCS = [
  // ---- college / grad ----
  { id: 'npc_okafor', name: 'Dr. Adaeze Okafor', role: 'advisor', stages: ['COLLEGE', 'GRAD_SCHOOL'], blurb: 'Plasma theorist. Reads drafts in red ink and means every mark kindly.', callback_events: ['cb_okafor_reference'] },
  { id: 'npc_lindqvist', name: 'Prof. Sten Lindqvist', role: 'advisor', stages: ['GRAD_SCHOOL'], blurb: 'Runs the tokamak group. Famous, busy, and absent exactly when you need him.', callback_events: ['cb_lindqvist_lab'] },
  { id: 'npc_varga', name: 'Réka Varga', role: 'peer', stages: ['COLLEGE', 'GRAD_SCHOOL', 'EARLY_CAREER'], blurb: 'Started the same year you did. Better at math, worse at sleeping.', callback_events: ['cb_varga_collab'] },
  { id: 'npc_haddad', name: 'Yusuf Haddad', role: 'peer', stages: ['GRAD_SCHOOL', 'EARLY_CAREER'], blurb: 'Diagnostics wizard. Can make any instrument work except his own car.', callback_events: [] },
  { id: 'npc_nakamura', name: 'Emi Nakamura', role: 'peer', stages: ['GRAD_SCHOOL', 'EARLY_CAREER', 'MID_CAREER'], blurb: 'Publishes fast and cites generously. Everyone likes her, which is suspicious.', callback_events: ['cb_nakamura_scoop'] },
  { id: 'npc_bello', name: 'Tomás Bello', role: 'rival', stages: ['GRAD_SCHOOL', 'EARLY_CAREER', 'MID_CAREER'], blurb: 'Working the same problem from the other side. Never quite hostile, never quite friendly.', callback_events: ['cb_bello_panel'] },

  // ---- early / mid career ----
  { id: 'npc_reyes', name: 'Dr. Camila Reyes', role: 'collaborator', stages: ['EARLY_CAREER', 'MID_CAREER'], blurb: 'Materials group lead. Knows exactly how long your first wall will last.', callback_events: [] },
  { id: 'npc_petrov', name: 'Dr. Ilya Petrov', role: 'collaborator', stages: ['EARLY_CAREER', 'MID_CAREER', 'SENIOR'], blurb: 'Superconducting magnets. Speaks in tolerances and dry jokes.', callback_events: ['cb_petrov_magnet'] },
  { id: 'npc_zhou', name: 'Dr. Wei Zhou', role: 'peer', stages: ['EARLY_CAREER', 'MID_CAREER'], blurb: 'Runs the biggest simulation cluster you have ever been given time on.', callback_events: [] },
  { id: 'npc_agarwal', name: 'Priya Agarwal', role: 'mentee', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Your first graduate student. Sharper than you were at that age.', callback_events: ['cb_agarwal_lab'] },
  { id: 'npc_fischer', name: 'Jonas Fischer', role: 'mentee', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Careful, slow, and right more often than the fast ones.', callback_events: [] },
  { id: 'npc_oyelaran', name: 'Dr. Funke Oyelaran', role: 'peer', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Moved from academia to a startup and back. Has opinions about both.', callback_events: [] },

  // ---- institutional / path specific ----
  { id: 'npc_hartley', name: 'Margaret Hartley', role: 'administrator', stages: ['EARLY_CAREER', 'MID_CAREER', 'SENIOR'], blurb: 'Programme officer. Controls more of your life than any physicist.', callback_events: ['cb_hartley_funding'] },
  { id: 'npc_dubois', name: 'Dr. Henri Dubois', role: 'rival', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Competing facility, competing approach, competing for the same budget line.', callback_events: [] },
  { id: 'npc_kaur', name: 'Simran Kaur', role: 'collaborator', stages: ['EARLY_CAREER', 'MID_CAREER'], blurb: 'Control systems. The reason your last campaign did not end in a disruption.', callback_events: [] },
  { id: 'npc_mbeki', name: 'Dr. Thabo Mbeki-Ross', role: 'peer', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Leads the international consortium liaison. Fluent in four languages and all of them are diplomacy.', callback_events: [] },
  { id: 'npc_lindgren', name: 'Ana Lindgren', role: 'investor', stages: ['EARLY_CAREER', 'MID_CAREER'], blurb: 'Deep-tech investor. Asks the one question your slide deck cannot answer.', callback_events: [] },
  { id: 'npc_castellanos', name: 'Dr. Rafael Castellanos', role: 'mentor', stages: ['EARLY_CAREER', 'MID_CAREER', 'SENIOR'], blurb: 'Senior figure who took an interest early. You never quite worked out why.', callback_events: [] },
  { id: 'npc_iwasaki', name: 'Dr. Hana Iwasaki', role: 'collaborator', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Divertor physics. Publishes the papers everyone actually reads twice.', callback_events: [] },
  { id: 'npc_abara', name: 'Chidi Abara', role: 'journalist', stages: ['MID_CAREER', 'SENIOR'], blurb: 'Science correspondent. Gets it right more often than most, if you give them time.', callback_events: [] },
];

/** Which NPCs a run should include, given the path (§5.5: 15 to 20 per run). */
export function castForRun(path, rng = Math.random) {
  const core = NPCS.filter((n) => ['advisor', 'peer', 'mentee', 'rival'].includes(n.role));
  const flavour = NPCS.filter((n) => !core.includes(n));
  const pathBias = {
    startup: ['npc_lindgren', 'npc_oyelaran'],
    academia: ['npc_lindqvist', 'npc_okafor'],
    national_lab: ['npc_hartley', 'npc_dubois'],
    international: ['npc_mbeki', 'npc_iwasaki'],
  }[path] ?? [];

  const picked = new Map();
  for (const n of core) picked.set(n.id, n);
  for (const id of pathBias) {
    const n = NPCS.find((x) => x.id === id);
    if (n) picked.set(n.id, n);
  }
  const shuffled = [...flavour].sort(() => rng() - 0.5);
  for (const n of shuffled) {
    if (picked.size >= 18) break;
    picked.set(n.id, n);
  }
  return [...picked.values()];
}

export function npcById(id) {
  return NPCS.find((n) => n.id === id) ?? null;
}
