// The event engine (spec §7). Filters the pool, weights it, and assembles a
// year's worth of events in the order the spec prescribes: callbacks, then
// mandatory transitions, then a reactor sim, then decisions, then randoms.
// Pure: RNG is injected, so a seeded run is fully reproducible.
import { BALANCE } from './balance.js';

export const EVENT_TYPE = {
  DECISION: 'decision',
  RANDOM: 'random',
  TRANSITION: 'transition',
  REACTOR_SIM: 'reactor_sim',
};

/** Does the player meet everything an event asks for (§7.1 prerequisites)? */
export function meetsPrerequisites(event, ctx) {
  const { player, reputation, flags, relationships } = ctx;
  const pre = event.prerequisites ?? {};

  for (const [k, min] of Object.entries(pre.min_stats ?? {})) {
    if ((player.stats[k] ?? 0) < min) return false;
  }
  for (const [k, min] of Object.entries(pre.min_reputation ?? {})) {
    if ((reputation[k] ?? 0) < min) return false;
  }
  for (const [k, max] of Object.entries(pre.max_reputation ?? {})) {
    if ((reputation[k] ?? 0) > max) return false;
  }
  for (const f of pre.flags ?? []) if (!flags.has(f)) return false;
  for (const f of pre.not_flags ?? []) if (flags.has(f)) return false;
  for (const [id, range] of Object.entries(pre.relationships ?? {})) {
    const rel = relationships.find((r) => r.id === id);
    if (!rel) return false;
    if (range.min !== undefined && rel.score < range.min) return false;
    if (range.max !== undefined && rel.score > range.max) return false;
  }
  if (pre.career_path && player.career_path !== pre.career_path) return false;

  // life-state gates: a wedding needs someone to marry, a mortgage needs a deposit
  if (pre.has_partner && !player.partner) return false;
  if (pre.no_partner && player.partner) return false;
  if (pre.min_partner_score && (player.partner?.score ?? 0) < pre.min_partner_score) return false;
  if (pre.has_children && (player.children ?? 0) === 0) return false;
  if (pre.min_money !== undefined && (player.money ?? 0) < pre.min_money) return false;
  if (pre.max_money !== undefined && (player.money ?? 0) > pre.max_money) return false;
  if (pre.max_health !== undefined && (player.health ?? 100) > pre.max_health) return false;
  if (pre.min_debt !== undefined && (player.debt ?? 0) < pre.min_debt) return false;
  return true;
}

/** Stage, age, path, fire-count, cooldown, prerequisites: the whole filter. */
export function isEligible(event, ctx) {
  const { player, history, cooldowns } = ctx;
  if (event.stage && !event.stage.includes(player.career_stage)) return false;
  if (event.career_path && !event.career_path.includes(player.career_path)) return false;
  const [minAge, maxAge] = event.age_range ?? [0, 200];
  if (player.age < minAge || player.age > maxAge) return false;

  const fires = history.filter((id) => id === event.id).length;
  if (fires >= (event.max_fires ?? 1)) return false;

  const last = cooldowns[event.id];
  if (last !== undefined && event.cooldown_years) {
    if (player.age - last < event.cooldown_years) return false;
  }
  return meetsPrerequisites(event, ctx);
}

/** Weighted pick without replacement. Mutates nothing. */
export function weightedPick(pool, rng) {
  const total = pool.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (const e of pool) {
    r -= e.weight ?? 1;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}

/** Which NPCs an event touches, so we never run two about the same person. */
function eventNpcs(event) {
  const ids = new Set(event.npcs ?? []);
  for (const c of event.choices ?? []) {
    for (const outcome of Object.values(c.outcomes ?? {})) {
      for (const id of Object.keys(outcome.relationship_deltas ?? {})) ids.add(id);
    }
  }
  return ids;
}

function pickBatch({ pool, count, rng, usedNpcs }) {
  const chosen = [];
  const remaining = [...pool];
  while (chosen.length < count && remaining.length > 0) {
    const pick = weightedPick(remaining, rng);
    if (!pick) break;
    const idx = remaining.indexOf(pick);
    remaining.splice(idx, 1);
    const npcs = eventNpcs(pick);
    // §7.2: never select two events that involve the same NPC
    if ([...npcs].some((id) => usedNpcs.has(id))) continue;
    npcs.forEach((id) => usedNpcs.add(id));
    chosen.push(pick);
  }
  return chosen;
}

/**
 * Build the year's event list (§7.2).
 *
 * `ctx` carries player, reputation, flags, relationships, history, cooldowns,
 * plus the callable hooks: allEvents, queuedCallbacks, transitions, sim.
 */
export function selectYearEvents(ctx, rng = Math.random) {
  const { allEvents, callbackQueue, player } = ctx;
  const byId = new Map(allEvents.map((e) => [e.id, e]));
  const usedNpcs = new Set();
  const out = [];

  // 1. queued callbacks fire first, regardless of pool eligibility
  const dueCallbacks = (callbackQueue ?? []).filter((c) => c.trigger_age <= player.age);
  for (const cb of dueCallbacks) {
    const event = byId.get(cb.event_id);
    if (!event) continue;
    eventNpcs(event).forEach((id) => usedNpcs.add(id));
    if (cb.npc_id) usedNpcs.add(cb.npc_id);
    out.push({ event, source: 'callback', callback: cb });
  }

  // 2. mandatory transitions (graduation, defense, job selection)
  for (const event of ctx.pendingTransitions ?? []) {
    out.push({ event, source: 'transition' });
  }

  // 3. a reactor sim, if one is due
  if (ctx.pendingSim) {
    out.push({ event: ctx.pendingSim, source: 'sim' });
  }

  // 4. decision events
  const decisionRoom = Math.max(
    0,
    Math.min(BALANCE.MAX_DECISION_EVENTS, BALANCE.MAX_EVENTS_PER_YEAR - out.length),
  );
  if (decisionRoom > 0) {
    const pool = allEvents.filter(
      (e) => e.type === EVENT_TYPE.DECISION && isEligible(e, ctx),
    );
    pickBatch({ pool, count: decisionRoom, rng, usedNpcs }).forEach((event) =>
      out.push({ event, source: 'decision' }));
  }

  // 5. random events; burnout risk doubles the weight of the bad ones (§7.2)
  const randomRoom = Math.max(
    0,
    Math.min(BALANCE.MAX_RANDOM_EVENTS, BALANCE.MAX_EVENTS_PER_YEAR - out.length),
  );
  if (randomRoom > 0) {
    const stressed = ctx.player.stress > 80;
    const pool = allEvents
      .filter((e) => e.type === EVENT_TYPE.RANDOM && isEligible(e, ctx))
      .map((e) => (stressed && e.negative
        ? { ...e, weight: (e.weight ?? 1) * BALANCE.NEGATIVE_WEIGHT_MULTIPLIER }
        : e));
    pickBatch({ pool, count: randomRoom, rng, usedNpcs }).forEach((event) =>
      out.push({ event, source: 'random' }));
  }

  // 6. cap the year, dropping the lowest-weight randoms first
  if (out.length > BALANCE.MAX_EVENTS_PER_YEAR) {
    const keep = [];
    const randoms = [];
    for (const entry of out) {
      if (entry.source === 'random') randoms.push(entry);
      else keep.push(entry);
    }
    randoms.sort((a, b) => (b.event.weight ?? 1) - (a.event.weight ?? 1));
    while (keep.length < BALANCE.MAX_EVENTS_PER_YEAR && randoms.length > 0) {
      keep.push(randoms.shift());
    }
    return keep.slice(0, BALANCE.MAX_EVENTS_PER_YEAR);
  }
  return out;
}

/** Reactor sims: max 5 a career, never inside the cooldown (§7.2, §8.1). */
export function simDue(player, simDefs, rng = Math.random) {
  if (player.reactor_sims_completed >= BALANCE.MAX_REACTOR_SIMS) return null;
  const since = player.age - (player.last_sim_age ?? -99);
  if (since < BALANCE.REACTOR_SIM_COOLDOWN_YEARS) return null;
  const due = simDefs.filter((s) => s.isDue(player));
  if (due.length === 0) return null;
  return due[Math.floor(rng() * due.length)];
}
