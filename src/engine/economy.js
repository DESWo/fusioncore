// Plant economics: spot market, O&M, fuel purchasing, LCOE. Pure module.
import {
  STARTING_FUNDS, BASE_PRICE_MWH, PRICE_NOISE_SD, PRICE_UPDATE_SIM_S,
  TRITIUM_PRICE_G, MAINT_PER_SIM_HOUR, CAPITAL_AMORT_PER_SIM_HOUR,
  SIM_DT_S,
} from './constants.js';

export function createEconState() {
  return {
    funds: STARTING_FUNDS,
    price: BASE_PRICE_MWH,
    revenueCum: 0,
    opexCum: 0,
    capitalCum: 0,
    mwhCum: 0,
    lcoe: null,
    // Two LCOEs with two jobs. `lcoe` is the plant's lifetime books: every
    // dollar since construction over every MWh ever sold. Early mistakes haunt
    // it forever, which is the lesson the ledger teaches. `missionLcoe` is the
    // same ratio measured only inside the current mission window, and it is
    // what mission objectives gate on: a single $200M learning-phase repair
    // otherwise needs ~2,000,000 exported MWh (days of play) to dilute below
    // the $100/MWh bar, so the lifetime number would grade the player's past,
    // not the operating regime the mission asks them to demonstrate.
    missionLcoe: null,
    // Cumulative-counter snapshot taken when the current mission began.
    missionStart: { opexCum: 0, capitalCum: 0, mwhCum: 0 },
    maintMult: 1.0,
    lastPriceUpdate: 0,
    incomeRate: 0, // $/sim-hour, for the ledger display
  };
}

/**
 * Open a fresh mission accounting window: mission LCOE measures spend and
 * exports from this moment on. The store calls it on every mission advance;
 * the headless walkthrough mirrors it at each phase boundary.
 */
export function beginMissionWindow(econ) {
  return {
    ...econ,
    missionLcoe: null,
    missionStart: { opexCum: econ.opexCum, capitalCum: econ.capitalCum, mwhCum: econ.mwhCum },
  };
}

// Sum of 4 uniforms ~ approximate Gaussian, cheap and good enough for a ticker
function gaussNoise(rng) {
  return (rng() + rng() + rng() + rng() - 2) / Math.sqrt(1 / 3);
}

export function econTick(econ, sim, rng = Math.random) {
  const e = { ...econ };
  const dtH = SIM_DT_S / 3600;

  // Spot price: an independent gaussian draw around the base every 30 operating
  // seconds, clamped to ±10% (spec §7). Not a random walk: the price has no
  // memory, so it cannot drift away from $50 over a long campaign.
  if (sim.time.simSeconds - e.lastPriceUpdate >= PRICE_UPDATE_SIM_S) {
    e.lastPriceUpdate = sim.time.simSeconds;
    const p = BASE_PRICE_MWH * (1 + gaussNoise(rng) * PRICE_NOISE_SD);
    e.price = Math.min(Math.max(p, BASE_PRICE_MWH * 0.9), BASE_PRICE_MWH * 1.1);
  }

  // Grid settlement: sell surplus, buy shortfall at the same spot price
  const net = sim.physics.netElecMW;
  let flow = 0;
  if (net >= 0) {
    flow = net * e.price * dtH;
    e.funds += flow;
    e.revenueCum += flow;
    e.mwhCum += net * dtH;
  } else {
    flow = net * e.price * dtH; // negative
    e.funds += flow;
    e.opexCum -= flow;
  }

  const maint = MAINT_PER_SIM_HOUR * e.maintMult * dtH;
  e.funds -= maint;
  e.opexCum += maint;
  e.capitalCum += CAPITAL_AMORT_PER_SIM_HOUR * dtH;

  e.incomeRate = flow / dtH - MAINT_PER_SIM_HOUR * e.maintMult;
  e.lcoe = e.mwhCum > 1 ? (e.capitalCum + e.opexCum) / e.mwhCum : null;
  // Mission window: identical formula over the deltas since the mission began.
  // Old saves get a snapshot stamped by the load migration; the zeros here are
  // a second line of defense for any state that skipped it, and they degrade
  // safely - a zero window makes missionLcoe equal lifetime lcoe, never lower.
  const w = e.missionStart ?? { opexCum: 0, capitalCum: 0, mwhCum: 0 };
  const missionMwh = e.mwhCum - w.mwhCum;
  e.missionLcoe = missionMwh > 1
    ? ((e.capitalCum - w.capitalCum) + (e.opexCum - w.opexCum)) / missionMwh
    : null;
  return e;
}

/** Buy tritium from the open market. Returns [newEcon, newFuel] or null if unaffordable. */
export function buyTritium(econ, fuel, grams) {
  const cost = grams * TRITIUM_PRICE_G;
  if (econ.funds < cost) return null;
  return [
    { ...econ, funds: econ.funds - cost, opexCum: econ.opexCum + cost },
    { ...fuel, tritium: fuel.tritium + grams, deuterium: fuel.deuterium + grams * 0.7 },
  ];
}
