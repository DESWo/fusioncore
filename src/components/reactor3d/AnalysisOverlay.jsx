import { useReactorStore } from '../../store/reactorStore.js';
import { fmtSci } from '../../utils/format.js';
import { tutorialStep } from '../../engine/tutorials.js';
import LawsonLegend from './LawsonLegend.jsx';

const MODES = [
  ['normal', 'NORMAL'],
  ['process', 'PHYSICS'],
  ['stress', 'STRESS'],
];

function Chip({ color, children }) {
  return (
    <div className="flex items-start gap-1.5 leading-snug">
      <span
        className="mt-[3px] w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span>{children}</span>
    </div>
  );
}

/** Plain-language key to the visible-physics view, with the real numbers. */
function ProcessLegend() {
  const mode = useReactorStore((s) => s.mode);
  const p = useReactorStore((s) => s.sim.physics);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const fuelMix = useReactorStore((s) => s.sim.controls.fuelMix);

  if (mode === 'fission') {
    // A 3.4 GW PWR core holds roughly 4e15 free neutrons at full power; the
    // view shows ~150 dots, so each dot is a very large crowd. The research
    // pool runs 340x less power, so its crowds are smaller.
    const perDot = plantKey === 'research' ? 1e11 : 3e13;
    return (
      <div className="absolute bottom-6 right-2 lg:right-[424px] z-10 w-56 bg-slate-900/90 border border-slate-700 rounded-md px-2 py-1.5 text-[8px] text-slate-300 grid gap-1">
        <div className="text-[8px] uppercase tracking-widest text-accent font-bold">
          What you are seeing
        </div>
        <Chip color="#FFFFFF">
          Fast neutron, fresh from a split nucleus. Too fast to cause the next split reliably.
        </Chip>
        <Chip color="#67C7F5">
          Slowed to thermal speed by the water. The water is the moderator; only slow neutrons split U-235 well.
        </Chip>
        <Chip color="#FCD34D">
          Flash: a uranium nucleus splits. Heat, plus 2 to 3 fresh neutrons. That is the chain reaction.
        </Chip>
        <Chip color="#94A3B8">
          Dots vanishing near the top are being eaten by the control rods ({(p.rodPos ?? 100).toFixed(0)}% inserted).
        </Chip>
        <Chip color="#C084FC">
          Xenon-135 poison, also eating neutrons (worth {p.xenonPcm.toFixed(0)} pcm right now).
        </Chip>
        <Chip color="#38BDF8">
          Coolant rising through the core, carrying the heat away. It leaves warmer than it came.
        </Chip>
        <div className="text-slate-500 border-t border-slate-700 pt-1">
          Each dot stands for ≈ {fmtSci(perDot, 0)} real neutrons. The population you
          see grows and shrinks exactly as reactor power does.
        </div>
      </div>
    );
  }

  const streaksPerSec = Math.min(p.pFusionMW / 30, 10);
  return (
    <div className="absolute bottom-6 right-2 lg:right-[424px] z-10 w-56 bg-slate-900/90 border border-slate-700 rounded-md px-2 py-1.5 text-[8px] text-slate-300 grid gap-1">
      <div className="text-[8px] uppercase tracking-widest text-accent font-bold">
        What you are seeing
      </div>
      <Chip color="#7DD3FC">
        Deuterium ions at {(p.T * 11.6).toFixed(0)} million °C, spiraling along the magnetic field lines. The field is the bottle.
      </Chip>
      <Chip color="#FCA5A5">
        Tritium ions ({(fuelMix * 100).toFixed(0)}% of the fuel mix). Raise the field and every spiral tightens.
      </Chip>
      <Chip color="#FDE68A">
        Flash: two nuclei fuse into helium plus a neutron.
      </Chip>
      <Chip color="#FB923C">
        The helium keeps its charge, stays bottled, and re-heats the fuel (alpha heating: {p.pAlphaMW.toFixed(1)} MW).
      </Chip>
      <Chip color="#F8FAFC">
        The neutron has no charge, so the bottle cannot hold it. It flies straight out to the blanket and becomes heat.
      </Chip>
      <div className="text-slate-500 border-t border-slate-700 pt-1">
        {p.pFusionMW > 0.5
          ? `Real rate: ${fmtSci(p.neutronRate)} fusions/s. Each streak here stands for ≈ ${fmtSci(p.neutronRate / Math.max(streaksPerSec, 0.3), 0)} of them.`
          : 'No fusion yet. Heat the fuel and add density to see reactions.'}
      </div>
    </div>
  );
}

function StressLegend() {
  return (
    <div className="absolute bottom-6 right-2 lg:right-[424px] z-10 bg-slate-900/85 border border-slate-700 rounded-md px-2 py-1.5 pointer-events-none">
      <div
        className="h-1.5 w-32 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(209,90%,32%), hsl(125,90%,38%), hsl(63,90%,42%), hsl(0,90%,48%))' }}
      />
      <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-mono">
        <span>0%</span><span>load vs design limit</span><span>100%+</span>
      </div>
      <div className="text-[8px] text-crit mt-0.5">pulsing = active hazard countdown</div>
    </div>
  );
}

/**
 * View switch for the 3D pane: NORMAL machine view, PHYSICS process view
 * (see the actual neutrons/ions doing their thing), STRESS false-color view.
 */
export default function AnalysisOverlay() {
  const viewMode = useReactorStore((s) => s.viewMode);
  const setViewMode = useReactorStore((s) => s.setViewMode);
  const mode = useReactorStore((s) => s.mode);
  const tutHighlight = useReactorStore((s) => tutorialStep(s.onboarding)?.highlight === 'physics');
  return (
    <>
      {/* The instrument column is 404px wide and pinned right from lg up, so
          a plain right-2 put this toggle underneath it on desktop. Same offset
          the notification stack already uses in App.jsx. */}
      <div className={`absolute top-2 right-2 lg:right-[424px] z-10 flex rounded overflow-hidden border border-slate-600 ${tutHighlight ? 'ui-highlight' : ''}`}>
        {MODES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`text-[9px] font-bold px-2 py-1 ${
              viewMode === key
                ? 'bg-accent text-base'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {viewMode === 'stress' && <StressLegend />}
      {viewMode === 'process' && <ProcessLegend />}
      {/* Lawson criterion / triple product: fusion-only concept, no fission
          analogue, so it joins the physics view for that mode alone. */}
      {viewMode === 'process' && mode === 'fusion' && <LawsonLegend />}
    </>
  );
}
