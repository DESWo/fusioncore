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
    maintMult: 1.0,
    lastPriceUpdate: 0,
    incomeRate: 0, // $/sim-hour, for the ledger display
  };
}

// Sum of 4 uniforms ~ approximate Gaussian, cheap and good enough for a ticker
function gaussNoise(rng) {
  return (rng() + rng() + rng() + rng() - 2) / Math.sqrt(1 / 3);
}

export function econTick(econ, sim, rng = Math.random) {
  const e = { ...econ };
  const dtH = SIM_DT_S / 3600;

  // Spot price random walk, updated every 30 operating seconds (spec §7)
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
