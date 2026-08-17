// Headless verification that every quantity is formatted to its agreed rule.
// The rules themselves, and why each is what it is, live in src/utils/units.js.
// Run: npm run units
import {
  fmtQ, fmtRatio, fmtKeV, fmtMillionC, fmtSeconds, fmtDensity,
  fmtPercent, fmtCelsius, fmtPcm, fmtNet, fmtPower, fmtMoney, fmtTesla,
  bare, UNIT_SEP as U,
} from '../src/utils/units.js';

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures++;
};
const eq = (actual, expected, label) => ok(actual === expected, `${label} (got "${actual}", want "${expected}")`);

// ---- precision is where it earns its place ----
eq(fmtQ(1.004), '1.00', 'Q keeps 2dp: breakeven turns on the second decimal');
eq(fmtQ(0.996), '1.00', 'Q rounds honestly rather than truncating');
eq(fmtRatio(0.8749), '0.87', 'a limit ratio keeps 2dp');
eq(fmtKeV(8.64), `8.6${U}keV`, 'temperature in keV keeps 1dp, the mission gate');
eq(fmtSeconds(1.024), `1.02${U}s`, 'confinement time keeps 2dp');
eq(fmtDensity(1.05), `1.05${U}×10²⁰${U}m⁻³`, 'density matches its slider step');

// ---- and is dropped where it does not ----
eq(fmtPower(104.73), '105 MW', 'power above 10 MW is whole: 104.73 helps nobody');
eq(fmtMillionC(19.66), `228${U}million${U}°C`, 'millions of degrees are whole');
eq(fmtCelsius(985.4), `985${U}°C`, 'component temperatures are whole');
eq(fmtPercent(0.9337), '93%', 'percentages are whole');
eq(fmtPercent(93.37, true), '93%', 'percent accepts an already-scaled value');
eq(fmtPcm(-3067.2), `-3067${U}pcm`, 'pcm is whole');
eq(fmtTesla(10.47), `10.5${U}T`, 'magnetic field keeps 1dp, matching its slider step');

// ---- bare readouts: same rule, unit supplied by the caller ----
// `Gauge` prints the unit in its own label, so it needs the number alone. The
// point of deriving it is that it cannot drift from the unit-carrying version.
eq(bare(fmtKeV(8.64)), '8.6', 'a bare keV readout keeps the same 1dp as fmtKeV');
eq(bare(fmtSeconds(1.024)), '1.02', 'a bare confinement time keeps 2dp');
eq(bare(fmtMillionC(19.66)), '228', 'a bare million-°C readout is whole');
eq(bare(fmtDensity(1.05)), '1.05', 'a bare density keeps its slider-step precision');
// format.js separates with an ordinary space rather than NBSP; splitting on
// only NBSP returned these untouched, which renders as "105 MW MW".
eq(bare(fmtPower(104.73)), '105', 'bare strips an ordinary space too, not just NBSP');
eq(bare(fmtCelsius(NaN)), '--', 'a missing value stays -- rather than becoming empty');

// ---- the sign on net power is information, not decoration ----
eq(fmtNet(38.2), '+38 MW', 'exporting reads as a gain');
eq(fmtNet(-87.4), '−87 MW', 'importing reads as a loss, with a real minus sign');
ok(fmtNet(38.2)[0] !== fmtNet(-38.2)[0],
  'net power: export and import can never be confused at a glance');

// ---- non-finite input degrades to a dash rather than NaN ----
ok([fmtQ(NaN), fmtKeV(Infinity), fmtCelsius(undefined), fmtNet(NaN)]
  .every((s) => s.includes('--')),
  'every formatter renders -- rather than NaN for missing data');

// ---- money keeps its existing contract ----
eq(fmtMoney(19_800_000_000), '$19.80B', 'money is unchanged');

// ---- a level's displayed target must agree with its authoritative check ----
// `check` decides whether you passed. `target` only exists so the UI can draw
// progress toward it. If they ever disagree, the bar fills while the mission
// does not complete, which is worse than showing no bar at all.
{
  const { LEVELS } = await import('../src/engine/levels.js');
  const { createSimState } = await import('../src/engine/physics.js');
  const { createEconState } = await import('../src/engine/economy.js');

  let agree = true;
  for (const lvl of LEVELS) {
    if (!lvl.target) continue;
    const sim = createSimState();
    const econ = createEconState();
    // Force the target's own quantity just past its goal, leave the rest alone,
    // then ask the real check whether that counts.
    const t = lvl.target;
    const probe = JSON.parse(JSON.stringify(sim));
    const bump = t.goal === 0 ? 1 : t.goal * 1.0001 + 1e-9;
    if (t.label === 'Ti') probe.physics.T = bump;
    else if (t.label === 'Q') probe.physics.Q = bump;
    else if (t.label === 'neutrons') probe.physics.neutronRate = bump;
    else if (t.label === 'net') probe.physics.netElecMW = bump;
    else if (t.label === 'homes') probe.physics.homesPowered = bump;
    else if (t.label === 'worst part') {
      probe.structure.firstWall = probe.structure.divertor = probe.structure.magnets = bump;
    }
    probe.physics.plasmaOn = true;
    const reads = t.read(probe);
    const meetsTarget = reads >= t.goal;
    const passesCheck = lvl.check({ ...probe, econ });
    if (!(meetsTarget && passesCheck)) {
      agree = false;
      console.log(`      level ${lvl.id} ${lvl.name}: target reads ${reads}, goal ${t.goal}, check ${passesCheck}`);
    }
  }
  ok(agree, 'levels: every displayed target agrees with the check that actually gates the mission');
}

// ---- a stated hold time must be the hold time the engine enforces ----
// Level 1 read "10 seconds" while sustainTicks held it for 300 sim-seconds, and
// nothing caught it because the number lived only in prose. Durations are quoted
// in sim time, the clock the HUD shows: 1 tick = SIM_DT_S sim-seconds. Levels
// whose objective names no duration are none of this check's business.
{
  const { LEVELS } = await import('../src/engine/levels.js');
  const { SIM_DT_S } = await import('../src/engine/constants.js');
  const UNIT_S = { second: 1, minute: 60, hour: 3600 };

  let consistent = true;
  let checked = 0;
  for (const lvl of LEVELS) {
    const m = /(\d+(?:\.\d+)?)\s*(second|minute|hour)s?/i.exec(lvl.objective ?? '');
    if (!m) continue;
    checked++;
    const stated = Number(m[1]) * UNIT_S[m[2].toLowerCase()];
    const actual = lvl.sustainTicks * SIM_DT_S;
    if (stated !== actual) {
      consistent = false;
      console.log(`      level ${lvl.id} ${lvl.name}: says "${m[0]}" (${stated}s) but holds ${lvl.sustainTicks} ticks = ${actual} sim-seconds`);
    }
  }
  ok(consistent && checked > 0,
    `levels: every stated hold time matches its sustainTicks (${checked} checked, in sim seconds)`);
}


// ---- progressive disclosure: the arc has to actually be an arc ----
// The point of three states is that groups recede. If nothing ever steps back,
// level 8 is level 1 with seven more panels attached, which is the failure this
// table exists to prevent.
{
  const { FOCUS, FOCUS_GROUPS, FOCUS_LEVELS, focusFor } = await import('../src/engine/focus.js');
  const rank = { [FOCUS.HIDDEN]: 0, [FOCUS.PERIPHERAL]: 1, [FOCUS.PRIMARY]: 2 };

  // Every level names exactly one job. Two primaries is no hierarchy at all.
  const primaries = FOCUS_LEVELS.map((l) =>
    FOCUS_GROUPS.filter((g) => focusFor(l)[g] === FOCUS.PRIMARY));
  ok(primaries.every((p) => p.length === 1),
    `focus: every level has exactly one primary group (${primaries.map((p) => p[0]).join(' -> ')})`);

  // Nothing that has been shown is ever hidden again. Taking information away
  // reads as a bug, not as an interface with an opinion.
  let neverRegresses = true;
  for (const g of FOCUS_GROUPS) {
    let seen = false;
    for (const l of FOCUS_LEVELS) {
      const f = focusFor(l)[g];
      if (f !== FOCUS.HIDDEN) seen = true;
      else if (seen) { neverRegresses = false; console.log(`      ${g} went hidden again at level ${l}`); }
    }
  }
  ok(neverRegresses, 'focus: nothing that has been shown is ever hidden again');

  // And the half that matters: groups DO step back. A group that has been the
  // job and never yields is an accumulating dashboard wearing a disguise.
  const recedes = FOCUS_GROUPS.filter((g) => {
    const arc = FOCUS_LEVELS.map((l) => rank[focusFor(l)[g]]);
    const peak = Math.max(...arc);
    return peak === 2 && arc[arc.length - 1] < 2;
  });
  ok(recedes.length >= 4,
    `focus: groups recede after their moment (${recedes.join(', ')} step back from primary)`);

  // Level 1 is almost empty on purpose.
  const l1Visible = FOCUS_GROUPS.filter((g) => focusFor(1)[g] !== FOCUS.HIDDEN);
  ok(l1Visible.length === 1,
    `focus: level 1 shows one group and nothing else (${l1Visible.join(', ')})`);

  // Level 8 still has the plasma, just not as the headline.
  ok(focusFor(8).stability === FOCUS.PERIPHERAL && focusFor(8).economics === FOCUS.PRIMARY,
    'focus: at level 8 economics leads and the plasma is still there, quietly');

  // Out-of-range ids clamp rather than throwing: sandbox runs past level 8.
  ok(focusFor(99) === focusFor(8) && focusFor(0) === focusFor(1),
    'focus: level ids clamp, so sandbox and bad input do not crash the layout');
}

console.log(failures === 0 ? '\nALL UNIT CHECKS PASSED' : `\n${failures} UNIT CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

