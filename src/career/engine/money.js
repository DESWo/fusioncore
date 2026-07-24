// Money. A research career is not paid like the other careers a person with
// your marks could have had, and the game should say so plainly: a stipend
// that does not cover rent, a postdoc that pays less than your friends in
// software, and a late career that is comfortable but never rich unless you
// took the startup bet and it landed.
//
// Pure module. All figures are annual, in dollars.
import { STAGE, PATH } from './stages.js';

/** Base salary by stage and path, before standing and leadership. */
const SALARY = {
  [STAGE.COLLEGE]: { base: 0 },
  [STAGE.GRAD_SCHOOL]: { base: 32000 },
  [STAGE.EARLY_CAREER]: {
    base: 62000,
    [PATH.ACADEMIA]: 62000,
    [PATH.NATIONAL_LAB]: 88000,
    [PATH.STARTUP]: 105000,
    [PATH.INTERNATIONAL]: 78000,
  },
  [STAGE.MID_CAREER]: {
    base: 115000,
    [PATH.ACADEMIA]: 112000,
    [PATH.NATIONAL_LAB]: 134000,
    [PATH.STARTUP]: 165000,
    [PATH.INTERNATIONAL]: 128000,
  },
  [STAGE.SENIOR]: {
    base: 155000,
    [PATH.ACADEMIA]: 152000,
    [PATH.NATIONAL_LAB]: 178000,
    [PATH.STARTUP]: 225000,
    [PATH.INTERNATIONAL]: 172000,
  },
  [STAGE.RETIRED]: { base: 0 },
};

export const COST = {
  LIVING_BASE: 26000,        // one person, modestly
  PARTNER_EXTRA: 11000,      // two live cheaper than two apart, not than one
  CHILD_EXTRA: 14000,        // per child, per year, and this is generous
  RENT: 15000,
  MORTGAGE: 19000,           // higher outgoing, but it buys equity
  HOME_DEPOSIT: 70000,
  HOME_EQUITY_GAIN: 9000,    // per year owned, crudely
  DEBT_INTEREST: 0.05,
  LIFESTYLE_CREEP: 0.55,     // share of any surplus that quietly becomes spending
};

/**
 * A flat-ish effective rate standing in for the whole tax system. Without it
 * a mid-career salary saves absurd amounts over forty years and money stops
 * being a constraint, which defeats the point of having it.
 */
export function afterTax(gross) {
  if (gross <= 20000) return gross;
  if (gross <= 60000) return Math.round(gross * 0.82);
  if (gross <= 120000) return Math.round(gross * 0.74);
  return Math.round(gross * 0.68);
}

/** Gross annual pay, before tax, given who you are right now. */
export function salaryFor(player, reputation = {}) {
  const table = SALARY[player.career_stage] ?? { base: 0 };
  let base = table[player.career_path] ?? table.base ?? 0;
  if (player.has_leadership_role) base *= 1.18;
  // standing pays, slowly: renown moves you up bands rather than doubling pay
  base *= 1 + Math.min((reputation.SCI ?? 0) + (reputation.NET ?? 0), 160) / 160 * 0.22;
  if (player.career_stage === STAGE.RETIRED) {
    // pension, roughly half of a senior salary
    return Math.round((SALARY[STAGE.SENIOR][player.career_path] ?? 150000) * 0.45);
  }
  return Math.round(base);
}

/**
 * What the year costs you, before anything you choose to buy. Students live
 * like students: housemates, cheap food, and a tolerance for discomfort that
 * quietly disappears around thirty.
 */
export function annualExpenses(player, netIncome = null) {
  const student = player.career_stage === STAGE.COLLEGE || player.career_stage === STAGE.GRAD_SCHOOL;
  let cost = student ? COST.LIVING_BASE * 0.62 : COST.LIVING_BASE;
  if (player.partner) cost += COST.PARTNER_EXTRA;
  cost += (player.children ?? 0) * COST.CHILD_EXTRA;
  if (player.owns_home) cost += COST.MORTGAGE;
  else cost += student ? COST.RENT * 0.55 : COST.RENT;

  // Lifestyle creep: people spend a good share of a rise rather than banking
  // it. Without this a senior salary compounds into millions and money stops
  // being a constraint at exactly the age it should start mattering.
  if (netIncome !== null && netIncome > cost) {
    cost += (netIncome - cost) * COST.LIFESTYLE_CREEP;
  }
  return Math.round(cost);
}

/**
 * Settle one year: pay, spend, service debt, accrue a little home equity.
 * Returns { money, debt, equity, income, expenses, interest, net }.
 */
export function settleYear(player, reputation) {
  const gross = salaryFor(player, reputation) + (player.side_income ?? 0);
  const income = afterTax(gross);
  const expenses = annualExpenses(player, income);
  const interest = Math.round((player.debt ?? 0) * COST.DEBT_INTEREST);

  // No explicit student-loan line: graduate debt arises naturally below,
  // because a stipend genuinely does not cover a life and the shortfall has
  // to come from somewhere.
  let money = (player.money ?? 0) + income - expenses - interest;
  let debt = player.debt ?? 0;

  // if cash runs out, the shortfall becomes debt rather than a hard stop
  if (money < 0) {
    debt += -money;
    money = 0;
  } else if (debt > 0) {
    // pay debt down with a share of anything spare
    const payment = Math.min(debt, Math.round(money * 0.35));
    debt -= payment;
    money -= payment;
  }

  const equity = (player.equity ?? 0) + (player.owns_home ? COST.HOME_EQUITY_GAIN : 0);

  return {
    money: Math.round(money),
    debt: Math.round(debt),
    equity,
    gross,
    income,
    expenses: expenses + interest,
    interest,
    net: income - expenses - interest,
  };
}

export function netWorth(player) {
  return Math.round((player.money ?? 0) + (player.equity ?? 0) - (player.debt ?? 0));
}

/** Compact money for a phone-width column: $34k, $1.2M, −$18k. */
export function fmtMoney(v) {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(Math.round(v));
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}k`;
  return `${sign}$${abs}`;
}

/** A plain read on where you stand financially, for the HUD. */
export function moneyNote(player) {
  const worth = netWorth(player);
  const debt = player.debt ?? 0;
  if (debt > 40000 && worth < 0) return 'underwater';
  if (debt > 0 && worth <= 0) return 'in the red';
  if (worth < 20000) return 'living close to it';
  if (worth < 120000) return 'comfortable enough';
  if (worth < 500000) return 'secure';
  if (worth < 1_500_000) return 'well off';
  return 'wealthy';
}

export function canAfford(player, amount) {
  return (player.money ?? 0) >= amount;
}
