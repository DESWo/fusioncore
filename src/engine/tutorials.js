// Guided tutorials: one instruction at a time, in words that assume nothing.
// Each machine gets its own script. Steps either wait for a button press
// (`ack: true`) or watch the plant until `done(ctx)` turns true. `freeze`
// holds the simulation still while the player reads; `lock` greys out every
// control except the highlighted one. Pure data; the store runs the show.
//
// ctx: { c: sim.controls, p: sim.physics, viewMode }

export const TUTORIALS = {
  fusion: [
    {
      say: 'This is a fusion reactor: a star in a bottle.',
      detail: 'Instead of splitting heavy atoms, it squeezes light ones together until they merge and release energy. Nothing here can melt down. The hard part is keeping the star lit at all.',
      ack: true, freeze: true, lock: true,
    },
    {
      say: 'Build the bottle.',
      detail: 'Raise the MAGNETIC FIELD to 6 tesla. The fuel will be charged particles, and charged particles cannot cross magnetic field lines: the field itself becomes an invisible container.',
      highlight: 'B', freeze: true, lock: true,
      done: (x) => x.c.B >= 6,
    },
    {
      say: 'Light it.',
      detail: 'Set PLASMA HEATING to 15 megawatts. Watch the ring come alive.',
      highlight: 'heat', freeze: true, lock: true,
      done: (x) => x.c.heat >= 15,
    },
    {
      say: 'You are running a star.',
      detail: 'Hold it steady and Mission 1 is yours. One note on the clock: the T+ readout is plant time, and one real second is one plant minute at 1x. The speed buttons change how fast you watch, never what the plasma does. Try the PHYSICS view up in the corner to watch the fuel ions spiral along the field lines you just energized.',
      ack: true,
    },
  ],
  research: [
    {
      say: 'This is a nuclear reactor.',
      detail: 'Uranium atoms split, releasing heat plus a few neutrons, and those neutrons split more atoms. That is the chain reaction. Your whole job is controlling how fast it runs.',
      ack: true, freeze: true, lock: true,
    },
    {
      say: 'First, make the invisible visible.',
      detail: 'Press PHYSICS at the top-right of the view. Every dot you will see is a crowd of neutrons: the particles that do the splitting.',
      highlight: 'physics', freeze: true, lock: true,
      done: (x) => x.viewMode === 'process',
    },
    {
      say: 'The control rods are holding the reaction OFF.',
      detail: 'They hang between the fuel plates, swallowing neutrons before they can split anything. Drag the CONTROL RODS slider to 50% inserted: pulling rods out lets neutrons live longer.',
      highlight: 'rods',
      done: (x) => x.c.rods <= 50,
    },
    {
      say: 'Now ease them to 43% and watch the balance.',
      detail: 'Watch the REACTIVITY number: negative and the reaction shrinks, positive and it grows, zero and it exactly sustains itself. Near 43% the chain starts feeding itself and power begins to climb. If it stays flat, ease the rods out one more point. Despite the movies, this state, CRITICAL, just means "running steady".',
      highlight: 'rods',
      done: (x) => x.p.P >= 0.1,
    },
    {
      say: 'Critical. The reaction is feeding itself.',
      detail: 'Watch the neutron population hold steady, and power climb. Hotter fuel absorbs neutrons a little better, so the rise settles by itself: nature’s own thermostat. Wait for power to pass half a megawatt.',
      done: (x) => x.p.P >= 0.5,
    },
    {
      say: 'That is the whole game: balance.',
      detail: 'Everything ahead, bigger machines, steam, budgets, a career, builds on what you just did. Your first mission is live: hold power between 0.1 and 5 megawatts.',
      ack: true,
    },
  ],
  pwr: [
    {
      say: 'This is a commercial nuclear plant: 340 times the training pool.',
      detail: 'It starts stone cold, and cold water actually makes the core MORE reactive, so the control rods are locked in place until the plant is warm. Real plants work exactly this way.',
      ack: true, freeze: true, lock: true,
    },
    {
      say: 'Warm it up.',
      detail: 'Turn the HEATERS ON in the Plant Operations panel. Together with friction from the giant coolant pumps, they will walk the loop up toward 280 °C. Feel free to speed up time.',
      highlight: 'heaters',
      done: (x) => x.c.heaters === true,
    },
    {
      say: 'While it heats: this plant is a business.',
      detail: 'The reactor makes heat, heat makes steam, steam spins a turbine. The generator breaker (SYNC) is what actually sells the output; nothing earns a cent until it closes. For now, wait for HOT STANDBY at 280 °C.',
      done: (x) => x.p.TcoolC >= 280,
    },
    {
      say: 'Hot standby. The rod interlock just released.',
      detail: 'Withdraw the rods toward 64% inserted and take her critical: exactly what you would do at the pool, with 340 times the consequence.',
      highlight: 'rods',
      done: (x) => x.p.critical,
    },
    {
      say: 'From here, the missions and the dispatcher take over.',
      detail: 'Two things nobody will remind you of twice: fuel is bought, not free, and it ships slowly (the Fuel Cycle panel is yours now); and every trip spends fatigue life the plant never gets back.',
      ack: true,
    },
  ],
};

export function tutorialKeyFor(mode, plantKey) {
  if (mode === 'fusion') return 'fusion';
  return plantKey === 'research' ? 'research' : 'pwr';
}

export function tutorialStep(onboarding) {
  if (!onboarding?.active) return null;
  return TUTORIALS[onboarding.key]?.[onboarding.step] ?? null;
}
