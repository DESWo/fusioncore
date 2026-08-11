import { useReactorStore } from '../../store/reactorStore.js';
import { IGNITION_TRIPLE } from '../../engine/constants.js';
import { sigmaV } from '../../engine/reactivity.js';
import { fmtSci } from '../../utils/format.js';
import Cite from '../common/Cite.jsx';
import LawsonPlot from '../advisor/LawsonPlot.jsx';

// Reactivity at 1 keV, the game's own reference floor for "cold" plasma
// (sigmaV's own sub-1-keV branch is a steep extrapolation, not data).
const SIGMA_V_1KEV = sigmaV(1);

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

/**
 * Teaches the Lawson criterion / triple product beside the existing
 * "what you are seeing" legend: the three quantities that must hold at
 * once (density, temperature, confinement time), which of the player's
 * three sliders is currently pulling the least weight, and why the fuel
 * has to run so hot in the first place (the D-T reactivity curve).
 *
 * The three terms below map onto the three primary sliders: density -> the
 * density control directly, temperature -> the heating control that drives
 * it, confinement time -> the field control (its main lever here: tauE ~
 * B^0.15, and B also sets the Greenwald ceiling that lets density rise).
 * "Least pushed" is each control's own position in its own min-max range,
 * not a re-derived physics ranking -- the triple product is a straight
 * multiplication, so mathematically all three sit an equal ratio from
 * "would close the gap alone." Slider headroom is the only asymmetry that
 * is actually true of this specific machine.
 */
export default function LawsonLegend() {
  const p = useReactorStore((s) => s.sim.physics);
  const c = useReactorStore((s) => s.sim.controls);

  const nM3 = c.density * 1e20;
  const triple = p.tripleProduct;
  const pctIgnition = Math.min((triple / IGNITION_TRIPLE) * 100, 999);

  const terms = [
    {
      key: 'n', label: 'Density n', value: `${fmtSci(nM3, 1)} m⁻³`,
      frac: clamp01((c.density - c.densityMin) / (c.densityMax - c.densityMin)),
    },
    {
      key: 'T', label: 'Temperature T', value: `${p.T.toFixed(1)} keV`,
      frac: clamp01((c.heat - c.heatMin) / (c.heatMax - c.heatMin)),
    },
    {
      key: 'tau', label: 'Confinement τE', value: `${p.tauE.toFixed(2)} s`,
      frac: clamp01((c.B - c.bMin) / (c.bMax - c.bMin)),
    },
  ];
  const weakest = terms.reduce((a, b) => (b.frac < a.frac ? b : a));
  const svRatio = sigmaV(p.T) / SIGMA_V_1KEV;

  return (
    <div className="absolute top-2 left-2 z-10 w-56 grid gap-1.5">
      <div className="bg-base/90 border border-raise px-2 py-1.5 text-[8px] text-ink/85 grid gap-1">
        <div className="text-[8px] uppercase tracking-widest text-accent font-bold flex items-center gap-1">
          Ignition needs all three <Cite id="lawson" />
        </div>
        <div className="text-ink/70 leading-snug">
          Density, temperature and confinement time must hold together. Being great at one does not rescue the other two.
        </div>
        {terms.map((t) => (
          <div key={t.key} className="grid gap-0.5">
            <div className="flex justify-between gap-2">
              <span className={t.key === weakest.key ? 'text-warn font-bold' : 'text-ink/85'}>
                {t.label}{t.key === weakest.key ? ' ◀ least pushed' : ''}
              </span>
              <span className="font-mono text-ink shrink-0">{t.value}</span>
            </div>
            <div className="h-1 bg-raise rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${t.frac * 100}%`,
                  background: t.key === weakest.key ? 'var(--color-warn)' : 'var(--color-accent)',
                }}
              />
            </div>
          </div>
        ))}
        <div className="border-t border-raise pt-1 flex justify-between items-baseline">
          <span>n·T·τE</span>
          <span className={`font-mono ${p.ignition ? 'text-safe font-bold' : 'text-ink'}`}>{fmtSci(triple)}</span>
        </div>
        <div className="text-ink/55">
          {p.ignition
            ? '★ past the ignition threshold'
            : `${pctIgnition.toFixed(0)}% of ignition (needs ${fmtSci(IGNITION_TRIPLE, 0)} keV·s·m⁻³)`}
        </div>
        <div className="text-ink/55 border-t border-raise pt-1">
          Why so hot: reactivity ⟨σv⟩ <Cite id="nrl" /> at {p.T.toFixed(1)} keV runs {fmtSci(svRatio, 1)}×
          what it is at 1 keV. Below a few keV, D-T fuel barely reacts at all.
        </div>
      </div>
      {/* The full T vs n·τE operating-point plot needs real vertical room to
          stay readable, so it only joins the overlay once the stage has it
          (desktop, where the 3D pane runs the full viewport height). Below
          that breakpoint the stage is squeezed to 38% of the screen and the
          compact card above already carries the lesson. */}
      <div className="hidden lg:block">
        <LawsonPlot />
      </div>
    </div>
  );
}
