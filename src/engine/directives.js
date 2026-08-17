// Directives: the orders that make each career rung a different JOB.
// A trainee is told exactly what to do. A reactor engineer gets targets from
// the dispatcher and memos from the manager. A senior engineer gets goals
// from the board and writes the orders herself (hers go to the crew).
// Pure module: the store owns the runtime (career.duties), this owns content.

// Directive shape:
//   id, from, text            what arrives and who signed it
//   minLevel                  earliest mission that can trigger it
//   check(ctx, baseline)      true while the directive is being satisfied
//   sustainTicks              consecutive passing ticks to complete
//   windowTicks (optional)    miss if not completed inside this window
//   failFast (optional)       a single failing tick after start = missed
//   baseline(ctx) (optional)  snapshot taken when issued, passed to check
//   doneText / missText       what goes in the log and the notification

export const DIRECTIVE_SETS = {
  research: [
    {
      id: 'r_hold2',
      from: 'Reactor Supervisor',
      minLevel: 2,
      // Durations here are plant time, like every clock in the game: 300
      // ticks x 6 sim-s = 30 minutes. Three of these once said "five minutes"
      // / "twenty minutes" / "ten minutes" for holds that were 6x longer;
      // units_check now parses every duration claim against sustainTicks.
      text: 'Hold the reactor at 2 MW (plus or minus half a megawatt) for thirty steady minutes. Smooth is the qualification, not fast.',
      check: (c) => c.P >= 1.5 && c.P <= 2.5,
      sustainTicks: 300,
      doneText: 'Logged: thirty minutes rock-steady at 2 MW. That is operator work.',
    },
    {
      id: 'r_isotope',
      from: 'Radiochemistry Lab',
      minLevel: 2,
      text: 'Isotope production run: the lab needs two hours of steady flux above 8 MW. Their samples are already loaded.',
      check: (c) => c.P >= 8,
      sustainTicks: 1200,
      doneText: 'Samples activated. The lab sends coffee and gratitude.',
    },
    {
      id: 'r_thermal',
      from: 'Reactor Supervisor',
      minLevel: 3,
      text: 'Night-shift task: at least 6 MW of flux while keeping the pool under 42 degrees. The pumps are yours to manage.',
      check: (c) => c.P >= 6 && c.TcoolC < 42,
      sustainTicks: 600,
      doneText: 'Thermal management signed off. You are ready for bigger water.',
    },
  ],
  pwr: [
    {
      id: 'p_first_dispatch',
      from: 'Grid Dispatcher',
      minLevel: 3,
      text: 'Dispatch order: sync the generator and hold at least 500 MW of net export. The city does not care how elegant your rod program is.',
      check: (c) => c.netElecMW >= 500,
      sustainTicks: 300,
      doneText: 'Dispatcher confirms delivery. You are on the board.',
    },
    {
      id: 'p_peak',
      from: 'Grid Dispatcher',
      minLevel: 3,
      text: 'Evening peak in three hours: deliver a full hour above 900 MW net inside the window. Miss it and they buy gas at triple price.',
      check: (c) => c.netElecMW >= 900,
      sustainTicks: 600,
      windowTicks: 1800,
      doneText: 'Peak carried. Baseload means the grid can set its watch by you.',
      missText: 'Peak missed. The dispatcher bought gas peakers at triple price, and your manager heard about it.',
    },
    {
      id: 'p_fatigue',
      from: 'Plant Manager',
      minLevel: 4,
      text: 'Memo: the fatigue budget is spent for the quarter. Six hours of operation, zero trips. Slow hands.',
      baseline: (c) => ({ trips: c.tripCount }),
      check: (c, b) => c.tripCount <= b.trips,
      sustainTicks: 3600,
      failFast: true,
      doneText: 'Six clean hours. The steam generators thank you.',
      missText: 'A trip went straight onto the quarterly report.',
    },
    {
      id: 'p_fuel_plan',
      from: 'Plant Manager',
      minLevel: 4,
      text: 'Plan the reload: fresh fuel ordered or on site before core burnup passes 60%. Outages are scheduled years ahead in the real world; you get hours.',
      check: (c) => c.fuelSecured,
      sustainTicks: 1,
      failWhen: (c) => c.burnup >= 0.6 && !c.fuelSecured,
      doneText: 'Outage planning has the batch on their board. Good.',
      missText: 'Burnup passed 60% with nothing ordered. The next outage just got longer and pricier.',
    },
  ],
  fusion: [
    {
      id: 'f_investor',
      from: 'Program Director',
      minLevel: 5,
      text: 'Investor day. Demonstrate a gain of Q = 5 or better held for a full hour. Nothing sells a fusion program like a burning plasma that stays lit.',
      check: (c) => c.Q >= 5,
      sustainTicks: 600,
      doneText: 'The room went quiet, then it went loud. Series funding secured.',
    },
    {
      id: 'f_clean',
      from: 'Program Director',
      minLevel: 6,
      text: 'Showcase week: a full hour exporting power with zero limit warnings. The regulator is watching the alarm log, not the output.',
      check: (c) => c.netElecMW > 0 && !c.hazardActive,
      sustainTicks: 600,
      doneText: 'One hour, zero alarms. That log page is going in the license application.',
    },
    {
      id: 'f_delegate',
      from: 'Program Director',
      minLevel: 6,
      text: 'You have an operations crew now. Write their envelope, hand them the machine, and keep your hands off the controls for thirty minutes. Supervision IS the job.',
      check: (c) => c.crewEnabled && c.plasmaOn && c.ticksSinceManual >= 5,
      sustainTicks: 300,
      doneText: 'The crew held it without you. That is what a senior engineer builds.',
    },
  ],
};

export function directiveSetFor(postingId) {
  return DIRECTIVE_SETS[postingId] ?? [];
}

/** Fresh duties runtime for a posting (lives in career.duties). */
export function createDuties() {
  return { idx: 0, current: null, cooldownUntil: 0, log: [] };
}

/**
 * Advance the duties state one tick. Pure: returns { duties, events }.
 * events: {type:'issued'|'done'|'missed', directive}
 */
export function dutiesTick(duties, set, ctx, levelId, tick) {
  if (!duties || duties.idx >= set.length && !duties.current) return { duties, events: [] };
  const events = [];
  let d = duties;

  if (d.current) {
    const spec = set.find((x) => x.id === d.current.id);
    if (!spec) return { duties: { ...d, current: null }, events };
    const passing = spec.check(ctx, d.current.baseline ?? {});
    const failed = (spec.failFast && d.current.started && !passing)
      || (spec.failWhen && spec.failWhen(ctx))
      || (spec.windowTicks && tick - d.current.issuedTick > spec.windowTicks);
    if (failed) {
      events.push({ type: 'missed', directive: spec });
      d = {
        ...d,
        current: null,
        cooldownUntil: tick + 1200,
        log: [...d.log, { id: spec.id, from: spec.from, text: spec.text, result: 'missed' }],
      };
    } else {
      const sustain = passing ? d.current.sustain + 1 : 0;
      const started = d.current.started || passing;
      if (sustain >= spec.sustainTicks) {
        events.push({ type: 'done', directive: spec });
        d = {
          ...d,
          current: null,
          cooldownUntil: tick + 1800,
          log: [...d.log, { id: spec.id, from: spec.from, text: spec.text, result: 'done' }],
        };
      } else {
        d = { ...d, current: { ...d.current, sustain, started } };
      }
    }
    return { duties: d, events };
  }

  // issue the next directive when its mission gate opens and the desk is clear
  if (d.idx < set.length && tick >= d.cooldownUntil) {
    const next = set[d.idx];
    if (levelId >= next.minLevel) {
      events.push({ type: 'issued', directive: next });
      d = {
        ...d,
        idx: d.idx + 1,
        current: {
          id: next.id,
          issuedTick: tick,
          sustain: 0,
          started: false,
          baseline: next.baseline ? next.baseline(ctx) : {},
        },
      };
    }
  }
  return { duties: d, events };
}
