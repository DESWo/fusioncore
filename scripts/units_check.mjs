// Headless verification that every quantity is formatted to its agreed rule.
// The rules themselves, and why each is what it is, live in src/utils/units.js.
// Run: npm run units
import {
  fmtQ, fmtRatio, fmtKeV, fmtMillionC, fmtSeconds, fmtDensity,
  fmtPercent, fmtCelsius, fmtPcm, fmtNet, fmtPower, fmtMoney, UNIT_SEP as U,
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

console.log(failures === 0 ? '\nALL UNIT CHECKS PASSED' : `\n${failures} UNIT CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

