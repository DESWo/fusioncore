// Failure analysis: turns a game over into an engineering incident report.
// Primary cause from the failed component, contributing factors read from the
// actual plant state at the moment of failure (never boilerplate), and one
// actionable recommendation. Pure module; runs headless.

const FISSION_PRIMARY = {
  cladding: 'Fuel temperature exceeded the cladding design limit. The rods ruptured and released fission products into the primary coolant.',
  vessel: 'Cumulative fast-neutron fluence consumed the pressure vessel’s fracture margin. The steel is too brittle to certify.',
  steamGen: 'Thermal-cycling fatigue cracked the steam generator tube bundles. Primary coolant is leaking to the secondary side.',
};

const FUSION_PRIMARY = {
  firstWall: 'Cumulative neutron damage embrittled the first wall past its fracture margin. It cracked and the vacuum was lost.',
  divertor: 'The divertor targets ran past their thermal limit until the armor failed. Tungsten vapor poisoned the plasma.',
  magnets: 'Accumulated electromagnetic and thermal shocks cracked the coil structure. No field, no bottle, no machine.',
};

function pct(v) { return `${v.toFixed(0)}%`; }

/**
 * Build the incident report. All factors are checked against real state:
 * a factor only appears if the plant data actually supports it.
 * Returns { primary, factors: string[], recommendation }.
 */
export function buildFailureReport(mode, sim, stats, failedComponent) {
  return mode === 'fission'
    ? fissionReport(sim, stats, failedComponent)
    : fusionReport(sim, stats, failedComponent);
}

function fissionReport(sim, stats, failed) {
  const p = sim.physics;
  const c = sim.controls;
  const st = sim.structure;
  const hz = sim.hazards ?? {};
  // plant-aware limits (research pool vs PWR); PWR defaults for old saves
  const fuelLimit = sim.plantKey === 'research' ? 600 : 2200;
  const coolLimit = sim.plantKey === 'research' ? 95 : 345;
  const factors = [];
  let recommendation = 'Increase safety margin: run further from the limits and act inside the warning window.';

  if (c.pumps < 60) {
    factors.push(`Coolant pumps were at ${c.pumps.toFixed(0)}% of capacity while the core was hot.`);
    recommendation = 'Keep coolant pumps at full flow whenever the core is hot. Decay heat continues for hours after shutdown.';
  }
  if (!p.critical && p.decayMW > 30) {
    factors.push(`Decay heat was still producing ${p.decayMW.toFixed(0)} MW after shutdown. Shutdown does not mean cold.`);
    if (c.pumps >= 60) recommendation = 'After any trip, treat decay heat as a live threat: full cooling until the core is genuinely cold.';
  }
  if (hz.fuelTemp === -1 || p.TfuelC > fuelLimit) {
    factors.push(`Fuel temperature reached ${p.TfuelC.toFixed(0)} °C, past the ${fuelLimit} °C cladding damage threshold.`);
  } else if (p.TfuelC > fuelLimit * 0.82) {
    factors.push(`Fuel was running hot (${p.TfuelC.toFixed(0)} °C) with little margin to the ${fuelLimit} °C limit.`);
  }
  if (hz.coolant === -1 || p.TcoolC > coolLimit) {
    factors.push(`Coolant reached ${p.TcoolC.toFixed(0)} °C, at the boiling threshold for this plant.`);
  }
  if ((p.tripCount ?? 0) >= 5) {
    factors.push(`${p.tripCount} protection trips this campaign. Every trip thermally shocks the plant (fatigue).`);
    if (failed === 'steamGen') recommendation = 'Reduce power in steps and avoid maneuvers that trip the plant. Fatigue never heals; it can only be budgeted.';
  }
  if (p.burnup > 0.8) {
    factors.push(`Core burnup at ${(p.burnup * 100).toFixed(0)}%: an old core with almost no excess reactivity in reserve.`);
  }
  if (p.xenonPcm > 3000) {
    factors.push(`A xenon transient was in progress (${p.xenonPcm.toFixed(0)} pcm of poison), complicating power control.`);
  }
  // Deferred maintenance on the parts that had NOT yet failed
  for (const [key, label] of [['cladding', 'fuel cladding'], ['vessel', 'pressure vessel'], ['steamGen', 'steam generators']]) {
    if (key !== failed && st[key] < 35) {
      factors.push(`The ${label} was already down to ${pct(st[key])} before the failure. Service was overdue.`);
    }
  }
  if (failed === 'vessel') {
    recommendation = 'Vessel embrittlement only accumulates. Plan vessel service before fluence consumes the margin, not after.';
  }
  if (factors.length === 0) {
    factors.push('No single operating error stands out. The failure accumulated from sustained operation at high load.');
  }

  return { primary: FISSION_PRIMARY[failed], factors, recommendation };
}

function fusionReport(sim, stats, failed) {
  const p = sim.physics;
  const c = sim.controls;
  const st = sim.structure;
  const hz = sim.hazards ?? {};
  const factors = [];
  let recommendation = 'Increase safety margin: stay off the operating limits and open maintenance windows before health runs low.';

  if (hz.divertor === -1 || p.divertorTempC > p.divertorLimitC) {
    factors.push(`Divertor at ${p.divertorTempC.toFixed(0)} °C against a ${p.divertorLimitC.toFixed(0)} °C limit at the moment of failure.`);
  }
  const exhaustMW = (c.heat ?? 0) + (p.pAlphaMW ?? 0);
  if ((c.cooling ?? 0) < 20 && exhaustMW > 40) {
    factors.push(`Divertor cooling was at ${(c.cooling ?? 0).toFixed(0)} MW against ~${exhaustMW.toFixed(0)} MW of exhaust heat.`);
    recommendation = 'Scale divertor cooling with exhaust power (heating plus alpha self-heating), not with habit.';
  }
  if ((stats.disruptions ?? 0) >= 3) {
    factors.push(`${stats.disruptions} plasma disruptions this campaign, each one an electromagnetic hammer blow to the structure.`);
    recommendation = 'Treat the density and pressure limits as walls, not targets. Every disruption spends structural life.';
  }
  if ((stats.quenches ?? 0) >= 1) {
    factors.push(`${stats.quenches} magnet quench${stats.quenches > 1 ? 'es' : ''} dumped coil energy into the structure.`);
    if (failed === 'magnets') recommendation = 'Keep the field under the coil rating. The last tesla is never worth a quench.';
  }
  if (c.B > p.magnetSafeB) {
    factors.push(`Field was at ${c.B.toFixed(1)} T, above the ${p.magnetSafeB.toFixed(1)} T coil rating.`);
  }
  if (p.greenwaldFrac >= 0.95) {
    factors.push(`Density was at ${(p.greenwaldFrac * 100).toFixed(0)}% of the disruption limit.`);
  }
  if (p.betaLimit > 0 && p.beta / p.betaLimit >= 0.95) {
    factors.push(`Plasma pressure was at ${((p.beta / p.betaLimit) * 100).toFixed(0)}% of the stability limit.`);
  }
  if ((p.divertorWearMult ?? 1) > 1 && failed === 'divertor') {
    factors.push('H-mode edge bursts (ELMs) were accelerating divertor erosion. That was the known price of the confinement upgrade.');
  }
  if (p.pFusionMW > 800 && failed === 'firstWall') {
    factors.push(`Sustained ${p.pFusionMW.toFixed(0)} MW of fusion power: gigawatt-class neutron load ages the wall fast.`);
    recommendation = 'At high power, schedule wall service as a routine cost of operation, the way ITER plans blanket campaigns.';
  }
  for (const [key, label] of [['firstWall', 'first wall'], ['divertor', 'divertor'], ['magnets', 'magnet system']]) {
    if (key !== failed && st[key] < 35) {
      factors.push(`The ${label} was already down to ${pct(st[key])} before the failure. Service was overdue.`);
    }
  }
  if (factors.length === 0) {
    factors.push('No single operating error stands out. The failure accumulated from sustained operation at high load.');
  }

  return { primary: FUSION_PRIMARY[failed], factors, recommendation };
}
