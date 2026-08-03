// Headless annunciator verification: proves each tile lights on the right
// condition and clears on the right condition, using only the pure module.
// Run: npm run annunciator
import { createSimState } from '../src/engine/physics.js';
import { FUSION_TILES, tilesFor, evaluateTiles, STATE_CODES } from '../src/engine/annunciator.js';

let failures = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} (got ${actual}, want ${expected})`);
  if (!ok) failures++;
}

/**
 * Purity check: reports which top-level sim keys changed rather than dumping
 * the whole (~1400 char) serialized state on every run, pass or fail.
 */
function checkNoMutation(label, before, after) {
  const changedKeys = Object.keys(after).filter(
    (key) => JSON.stringify(after[key]) !== JSON.stringify(before[key]));
  const ok = changedKeys.length === 0;
  const detail = ok ? '' : ` (changed: ${changedKeys.join(', ')})`;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail}`);
  if (!ok) failures++;
}

/** A sim with specific fields overridden, everything else at fresh defaults. */
function simWith(patch) {
  const s = createSimState();
  return {
    ...s,
    physics: { ...s.physics, ...(patch.physics ?? {}) },
    controls: { ...s.controls, ...(patch.controls ?? {}) },
    structure: { ...s.structure, ...(patch.structure ?? {}) },
    fuel: { ...s.fuel, ...(patch.fuel ?? {}) },
    hazards: { ...(s.hazards ?? {}), ...(patch.hazards ?? {}) },
  };
}

const stateOf = (id, sim) => evaluateTiles('fusion', sim)[id];

// --- registry shape ---
check('registry has 8 fusion tiles', FUSION_TILES.length, 8);
// Identity check, not a value check: dumping two 8-object arrays through a
// template string coerces every entry to "[object Object]", so compare the
// reference equality itself instead of the arrays.
check('tilesFor("fusion") returns the fusion registry',
  tilesFor('fusion') === FUSION_TILES, true);
check('state code for alarm', STATE_CODES.alarm, 'AL');
check('every tile has a unique id',
  new Set(FUSION_TILES.map((t) => t.id)).size, FUSION_TILES.length);

// --- greenwald: alarm rides the engine's own hazard flag ---
check('greenwald normal at 50% of limit',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: true } })), 'normal');
check('greenwald caution at 92% of limit',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.92, plasmaOn: true } })), 'caution');
check('greenwald alarm when the engine raises the hazard',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 1.05, plasmaOn: true }, hazards: { greenwald: 40 } })), 'alarm');
check('greenwald clears when the hazard clears',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: true }, hazards: { greenwald: 0 } })), 'normal');
check('greenwald off with the plasma down',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.5, plasmaOn: false } })), 'off');
// Hazard authority: physics.js only raises this hazard at greenwaldFrac >=
// 0.98, so 0.90-0.98 is a real reachable state where the tile's own caution
// ratio has fired but the engine has not called it a breach yet. The hazard
// key is set explicitly to 0 (not just defaulted) so this proves the tile
// reads the flag rather than re-deriving alarm from the ratio.
check('greenwald caution (not alarm) above the caution ratio while the hazard is still clear',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 0.95, plasmaOn: true }, hazards: { greenwald: 0 } })), 'caution');
// physics.js gates the greenwald hazard on !isStellarator, so a stellarator
// never raises it at any density. The tile must still trust that: ratio 1.5
// with the hazard explicitly clear reads caution, never alarm. This is the
// hazard-authority design working as intended, worth pinning on its own.
check('greenwald stays caution for a stellarator even far past the ratio, because the engine never raises that hazard for one',
  stateOf('greenwald', simWith({ physics: { greenwaldFrac: 1.5, plasmaOn: true, isStellarator: true }, hazards: { greenwald: 0 } })), 'caution');

// --- beta ---
check('beta caution at 88% of limit',
  stateOf('beta', simWith({ physics: { beta: 0.88, betaLimit: 1.0, plasmaOn: true } })), 'caution');
check('beta alarm on the hazard',
  stateOf('beta', simWith({ physics: { beta: 1.1, betaLimit: 1.0, plasmaOn: true }, hazards: { beta: 30 } })), 'alarm');
// Hazard authority: physics.js raises this hazard at ratio >= 1.0, so 0.85-1.0
// is reachable with the hazard still clear.
check('beta caution (not alarm) above the caution ratio while the hazard is still clear',
  stateOf('beta', simWith({ physics: { beta: 0.95, betaLimit: 1.0, plasmaOn: true }, hazards: { beta: 0 } })), 'caution');
check('beta off with the plasma down',
  stateOf('beta', simWith({ physics: { beta: 0.95, betaLimit: 1.0, plasmaOn: false } })), 'off');
// Zero-denominator guard: ratioOf returns 0 (not NaN) when betaLimit hasn't
// been initialized yet, which reads as normal, never caution or alarm.
check('beta reads normal, not NaN, when betaLimit is zero',
  stateOf('beta', simWith({ physics: { beta: 0.5, betaLimit: 0, plasmaOn: true }, hazards: { beta: 0 } })), 'normal');

// --- divertor ---
check('divertor caution at 90% of the thermal limit',
  stateOf('divertor', simWith({ physics: { divertorTempC: 900, divertorLimitC: 1000, plasmaOn: true } })), 'caution');
check('divertor alarm on the hazard',
  stateOf('divertor', simWith({ physics: { divertorTempC: 1100, divertorLimitC: 1000, plasmaOn: true }, hazards: { divertor: -1 } })), 'alarm');
// Hazard authority: physics.js raises this hazard only once temp strictly
// exceeds the limit, so ratio == 1.0 exactly is reachable with the hazard
// still clear.
check('divertor caution (not alarm) at the thermal limit while the hazard is still clear',
  stateOf('divertor', simWith({ physics: { divertorTempC: 1000, divertorLimitC: 1000, plasmaOn: true }, hazards: { divertor: 0 } })), 'caution');
check('divertor off with the plasma down',
  stateOf('divertor', simWith({ physics: { divertorTempC: 1000, divertorLimitC: 1000, plasmaOn: false } })), 'off');
// Zero-denominator guard: ratioOf returns 0 (not NaN) when divertorLimitC
// hasn't been initialized yet.
check('divertor reads normal, not NaN, when divertorLimitC is zero',
  stateOf('divertor', simWith({ physics: { divertorTempC: 500, divertorLimitC: 0, plasmaOn: true }, hazards: { divertor: 0 } })), 'normal');

// --- TF coil field ---
check('tf coil caution at 95% of the safe field',
  stateOf('tfcoil', simWith({ controls: { B: 9.5 }, physics: { magnetSafeB: 10, plasmaOn: true } })), 'caution');
check('tf coil alarm on the hazard',
  stateOf('tfcoil', simWith({ controls: { B: 11 }, physics: { magnetSafeB: 10, plasmaOn: true }, hazards: { magnets: 20 } })), 'alarm');
// Hazard authority: physics.js raises this hazard only once B strictly
// exceeds the safe field, so ratio == 1.0 exactly is reachable with the
// hazard still clear.
check('tf coil caution (not alarm) at the safe field while the hazard is still clear',
  stateOf('tfcoil', simWith({ controls: { B: 10 }, physics: { magnetSafeB: 10, plasmaOn: true }, hazards: { magnets: 0 } })), 'caution');
check('tf coil off with the plasma down',
  stateOf('tfcoil', simWith({ controls: { B: 10 }, physics: { magnetSafeB: 10, plasmaOn: false } })), 'off');
// Zero-denominator guard: ratioOf returns 0 (not NaN) when magnetSafeB hasn't
// been initialized yet.
check('tf coil reads normal, not NaN, when magnetSafeB is zero',
  stateOf('tfcoil', simWith({ controls: { B: 5 }, physics: { magnetSafeB: 0, plasmaOn: true }, hazards: { magnets: 0 } })), 'normal');

// --- structural and inventory tiles: no hazard entry, own thresholds ---
check('first wall normal at 80% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 80 } })), 'normal');
check('first wall caution at 50% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 50 } })), 'caution');
check('first wall alarm at 25% remaining',
  stateOf('firstwall', simWith({ structure: { firstWall: 25 } })), 'alarm');

// Beam shine-through. beamCoupling = HEAT_ABSORB * (1 - exp(-n20 / SHINE_N0))
// with HEAT_ABSORB 0.9 and SHINE_N0 0.4, so it ranges 0 to 0.9 and falls as the
// plasma thins. 0.75 is the threshold the existing dashboard already uses to
// report shine-through as a limiting factor.
check('shine-through normal at 83% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.83, plasmaOn: true } })), 'normal');
check('shine-through caution at 70% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.70, plasmaOn: true } })), 'caution');
// Caps at caution. Poor coupling is something to fix, not a limit you have
// breached, and an alarm band here fired on the game's own opening state.
check('shine-through caps at caution even at 40% coupling',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.40, plasmaOn: true } })), 'caution');
check('shine-through off with the plasma down',
  stateOf('shinethrough', simWith({ physics: { beamCoupling: 0.40, plasmaOn: false } })), 'off');

// A fresh campaign must not open with anything latched. createSimState starts
// at n20 = 0.1, which is beamCoupling 0.199 and netElecMW well negative; an
// invented alarm band meant every new run booted mid-alarm.
{
  const fresh = createSimState();
  const opening = evaluateTiles('fusion', fresh);
  const loud = Object.entries(opening).filter(([, v]) => v === 'alarm');
  check('a fresh campaign opens with no tile in alarm', loud.length, 0);
}

// Two of the four engine hazards are NOT gated on plasmaOn: magnets fires on
// B > magnetSafeB and divertor on divertorTempC > divertorLimitC, either of
// which can run a full countdown with the plasma down. The tile must follow
// the engine, or the board goes dark during a violation that is doing damage.
check('TF coil alarms with the plasma down when the engine raised the hazard',
  stateOf('tfcoil', simWith({
    controls: { B: 12 }, physics: { magnetSafeB: 10, plasmaOn: false }, hazards: { magnets: -1 },
  })), 'alarm');
check('divertor alarms with the plasma down when the engine raised the hazard',
  stateOf('divertor', simWith({
    physics: { divertorTempC: 1400, divertorLimitC: 1000, plasmaOn: false }, hazards: { divertor: 25 },
  })), 'alarm');

check('tritium caution at 4 g',
  stateOf('tritium', simWith({ fuel: { tritium: 4 } })), 'caution');
check('tritium alarm at 0.2 g',
  stateOf('tritium', simWith({ fuel: { tritium: 0.2 } })), 'alarm');

check('net power caution when the plant is a net importer',
  stateOf('netpower', simWith({ physics: { netElecMW: -12, plasmaOn: true } })), 'caution');
check('net power normal when exporting',
  stateOf('netpower', simWith({ physics: { netElecMW: 38, plasmaOn: true } })), 'normal');

// --- purity: evaluation must not mutate the sim it is handed ---
const probe = simWith({ physics: { greenwaldFrac: 0.92, plasmaOn: true } });
const probeSnapshot = JSON.parse(JSON.stringify(probe));
evaluateTiles('fusion', probe);
checkNoMutation('evaluateTiles does not mutate its input', probeSnapshot, probe);

// --- latch and acknowledge ---
import { nextAnnunciator, freshAnnunciator } from '../src/store/annunciatorSlice.js';

let a = freshAnnunciator();
check('starts with nothing latched', Object.keys(a.latched).length, 0);
check('starts muted', a.muted, true);

a = nextAnnunciator(a, { greenwald: 'normal', beta: 'normal' });
check('normal states do not latch', Object.keys(a.latched).length, 0);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('an alarm latches', a.latched.greenwald, true);
check('a latched tile is unacknowledged', a.acked.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('the latch holds while the condition holds', a.latched.greenwald, true);

a = { ...a, latched: {}, acked: { ...a.acked, greenwald: true } };   // player pressed ACK
a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('acknowledged stays lit at the condition color', a.state.greenwald, 'alarm');
check('acknowledged does not re-latch while the condition holds', a.latched.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'normal', beta: 'normal' });
check('the ack clears when the condition clears', a.acked.greenwald, undefined);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'normal' });
check('a re-occurring condition latches again', a.latched.greenwald, true);

a = nextAnnunciator(a, { greenwald: 'alarm', beta: 'caution' });
check('caution latches too', a.latched.beta, true);

// Escalation after an acknowledgement. The operator acked a caution; the
// condition then got worse. That is news they have not seen, so it must flash
// again. Latching only on entry from a quiet state missed this entirely and
// let a tile recolour amber to red in silence with ACK sitting disabled.
{
  let e = freshAnnunciator();
  e = nextAnnunciator(e, { greenwald: 'caution' });
  check('escalation: caution latches', e.latched.greenwald, true);

  e = { ...e, latched: {}, acked: { greenwald: true } };   // operator pressed ACK
  e = nextAnnunciator(e, { greenwald: 'caution' });
  check('escalation: an acked caution stays quiet while it holds', e.latched.greenwald, undefined);

  e = nextAnnunciator(e, { greenwald: 'alarm' });
  check('escalation: caution to alarm re-latches after an ack', e.latched.greenwald, true);
  check('escalation: the stale ack is dropped', e.acked.greenwald, undefined);

  // The reverse must NOT re-latch: easing off is not news.
  let d = freshAnnunciator();
  d = nextAnnunciator(d, { beta: 'alarm' });
  d = { ...d, latched: {}, acked: { beta: true } };
  d = nextAnnunciator(d, { beta: 'caution' });
  check('de-escalation: alarm easing to caution does not re-latch', d.latched.beta, undefined);
}

console.log(failures === 0 ? '\nALL ANNUNCIATOR CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
