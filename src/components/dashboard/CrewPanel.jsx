import { useReactorStore } from '../../store/reactorStore.js';

/**
 * The operations crew station: the senior posting's real control surface.
 * You choose the target and how much margin the crew may spend; they work
 * the sliders. Touching the controls yourself benches them for 30 seconds.
 */
export default function CrewPanel() {
  const career = useReactorStore((s) => s.career);
  const mode = useReactorStore((s) => s.mode);
  const crew = useReactorStore((s) => s.crew);
  const setCrew = useReactorStore((s) => s.setCrew);
  const pausedUntil = useReactorStore((s) => s.crewPausedUntil);
  const ticks = useReactorStore((s) => s.sim.time.ticks);
  const net = useReactorStore((s) => s.sim.physics.netElecMW);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  if (!career || mode !== 'fusion') return null;

  const paused = crew.enabled && ticks < pausedUntil;
  const onTarget = crew.enabled && Math.abs(net - crew.targetNetMW) <= 25;
  const status = !crew.enabled ? 'standing by'
    : paused ? `standing aside (you have the controls, ${((pausedUntil - ticks) / 10).toFixed(0)} s)`
    : !plasmaOn ? 'relighting the plasma'
    : onTarget ? `holding ${net.toFixed(0)} MW net`
    : `working toward target (now ${net.toFixed(0)} MW net)`;

  return (
    <div className="bg-panel p-3 border border-accent/25">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-accent">Operations Crew</span>
        <button
          onClick={() => setCrew({ enabled: !crew.enabled })}
          className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
            crew.enabled
              ? 'border-accent/70 bg-accent/15 text-accent'
              : 'border-raise-hi text-ink/85 hover:bg-raise'
          }`}
        >
          {crew.enabled ? 'CREW HAS THE MACHINE' : 'DELEGATE'}
        </button>
      </div>
      <p className="text-[9px] text-ink/55 italic mb-2">
        your job is the envelope; theirs is the sliders · status: {status}
      </p>

      <div className="flex items-baseline justify-between text-[10px]">
        <label htmlFor="crew-target" className="text-ink/70">Delivery target</label>
        <span className="font-mono text-accent">{crew.targetNetMW} MW net</span>
      </div>
      <input
        id="crew-target" type="range" min={0} max={1200} step={25}
        value={crew.targetNetMW}
        onChange={(e) => setCrew({ targetNetMW: parseInt(e.target.value, 10) })}
        className="w-full mt-1"
        aria-label={`Crew delivery target ${crew.targetNetMW} megawatts net`}
      />

      <div className="flex items-baseline justify-between text-[10px] mt-2">
        <label htmlFor="crew-gw" className="text-ink/70">Density ceiling</label>
        <span className={`font-mono ${crew.gwMax > 0.9 ? 'text-warn' : 'text-ink'}`}>
          {(crew.gwMax * 100).toFixed(0)}% of disruption limit
        </span>
      </div>
      <input
        id="crew-gw" type="range" min={0.7} max={0.95} step={0.01}
        value={crew.gwMax}
        onChange={(e) => setCrew({ gwMax: parseFloat(e.target.value) })}
        className="w-full mt-1"
        aria-label={`Crew density ceiling ${(crew.gwMax * 100).toFixed(0)} percent of the Greenwald limit`}
      />

      <div className="flex items-baseline justify-between text-[10px] mt-2">
        <label htmlFor="crew-div" className="text-ink/70">Divertor ceiling</label>
        <span className={`font-mono ${crew.divMax > 0.85 ? 'text-warn' : 'text-ink'}`}>
          {(crew.divMax * 100).toFixed(0)}% of thermal limit
        </span>
      </div>
      <input
        id="crew-div" type="range" min={0.6} max={0.95} step={0.01}
        value={crew.divMax}
        onChange={(e) => setCrew({ divMax: parseFloat(e.target.value) })}
        className="w-full mt-1"
        aria-label={`Crew divertor ceiling ${(crew.divMax * 100).toFixed(0)} percent of the thermal limit`}
      />

      <p className="text-[9px] text-ink/55 mt-2 leading-snug">
        The crew is competent, not brilliant: they will fly right up to whatever
        ceiling you write. A generous envelope is a bet with their hands and
        your name on it.
      </p>
    </div>
  );
}
