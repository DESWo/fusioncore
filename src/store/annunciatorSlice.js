// Annunciator latch state. Real control-room convention: a tile that goes into
// alarm latches and flashes until the operator acknowledges it, and then stays
// lit at the condition color until the condition itself clears. Acknowledging
// silences the flash; it does not clear the alarm.
//
// nextAnnunciator is pure and exported so scripts/annunciator_check.mjs can
// drive the latch logic without a store.

import { evaluateTiles } from '../engine/annunciator.js';

const LATCHING = new Set(['caution', 'alarm']);

export function freshAnnunciator() {
  return {
    state: {},     // tileId -> current evaluated state
    latched: {},   // tileId -> true while unacknowledged: flashing
    acked: {},     // tileId -> true: silenced, still lit
    muted: true,   // audible trip alert is off by default
  };
}

/**
 * Fold a freshly evaluated tile map into the previous latch state.
 * Pure: returns a new object, never mutates `prev`.
 */
export function nextAnnunciator(prev, nextState) {
  const latched = { ...prev.latched };
  const acked = { ...prev.acked };

  for (const [id, state] of Object.entries(nextState)) {
    const was = prev.state[id];
    if (LATCHING.has(state)) {
      // Latch on entry into a latching state, and only on entry: a tile that
      // is already acknowledged must not re-latch every tick.
      if (!LATCHING.has(was) && !acked[id]) latched[id] = true;
    } else {
      // Condition physically cleared. Drop both the flash and the ack, so a
      // re-occurrence latches again rather than staying silently silenced.
      delete latched[id];
      delete acked[id];
    }
  }

  return { ...prev, state: nextState, latched, acked };
}

/** Acknowledge every flashing tile. Silences the flash, keeps the tile lit. */
export function acknowledgeAll(prev) {
  const acked = { ...prev.acked };
  for (const id of Object.keys(prev.latched)) acked[id] = true;
  return { ...prev, latched: {}, acked };
}

/** Zustand slice factory, mounted by reactorStore. */
export const createAnnunciatorSlice = (set, get) => ({
  annunciator: freshAnnunciator(),

  /** Called once per tick with the current mode and sim. */
  tickAnnunciator(mode, sim) {
    const evaluated = evaluateTiles(mode, sim);
    const prev = get().annunciator;
    // Cheap bail-out: nothing changed, so do not churn a new object every
    // 100 ms and re-render the grid for nothing.
    let same = true;
    for (const id of Object.keys(evaluated)) {
      if (prev.state[id] !== evaluated[id]) { same = false; break; }
    }
    if (same) return;
    set({ annunciator: nextAnnunciator(prev, evaluated) });
  },

  ackAnnunciator() {
    set((s) => ({ annunciator: acknowledgeAll(s.annunciator) }));
  },

  toggleAnnunciatorMute() {
    set((s) => ({ annunciator: { ...s.annunciator, muted: !s.annunciator.muted } }));
  },
});
