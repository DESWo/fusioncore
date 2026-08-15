import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReactorStore, SERVICE_COSTS, levelsFor, levelFor } from '../../store/reactorStore.js';
import { unlockedFeatures } from '../../engine/levels.js';
import { focusFor, FOCUS, FOCUS_GROUPS } from '../../engine/focus.js';
import { tutorialStep } from '../../engine/tutorials.js';
import { nextPosting } from '../../engine/career.js';
import HazardBanner from './HazardBanner.jsx';
import ScenarioPanel from './ScenarioPanel.jsx';
import DutiesPanel from './DutiesPanel.jsx';
import CrewPanel from './CrewPanel.jsx';
import EngineeringPanel from './EngineeringPanel.jsx';
import Icon from '../common/Icon.jsx';
import { IGNITION_TRIPLE } from '../../engine/constants.js';
import {
  fmtPower, fmtSci, fmtMoney, fmtKeV, fmtQ, fmtCelsius,
  fmtMillionC, fmtSeconds, fmtDensity, fmtPercent, fmtPcm, fmtTesla, bare,
} from '../../utils/units.js';
import Gauge from './Gauge.jsx';
import ControlSlider from './ControlSlider.jsx';
import HistoryChart from './HistoryChart.jsx';
import OverlayChart from './OverlayChart.jsx';
import FuelPanel from './FuelPanel.jsx';
import TechTree from './TechTree.jsx';
import AsBuiltPanel from './AsBuiltPanel.jsx';
import Finance from './Finance.jsx';
import Cite from '../common/Cite.jsx';
import CalcDrawer from '../common/CalcDrawer.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

/**
 * The campaign map: always-visible answer to "what is the goal of this game".
 */
export function CampaignMap() {
  const mode = useReactorStore((s) => s.mode);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const levelId = useReactorStore((s) => s.level.id);
  const completed = useReactorStore((s) => s.level.completed);
  const levels = levelsFor(mode, plantKey);
  return (
    <div className="bg-panel px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-ink/70">
        {mode !== 'fission'
          ? 'Campaign goal: take fusion from first plasma to cheaper-than-gas commercial power'
          : plantKey === 'research'
            ? 'Posting goal: qualify as a reactor operator on the training pool'
            : 'Campaign goal: take a fission core from first criticality through a full fuel cycle'}
      </div>
      <div className="flex items-start gap-1 mt-1.5 overflow-x-auto pb-0.5">
        {levels.map((l, i) => {
          const done = completed || l.id < levelId;
          const current = !completed && l.id === levelId;
          return (
            <div
              key={l.id}
              className="flex items-center gap-1 min-w-0"
              title={`Level ${l.id} : ${l.name}: ${l.objective}`}
            >
              <div className="flex flex-col items-center w-14 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    done
                      ? 'bg-safe/20 border-safe text-safe'
                      : current
                        ? 'bg-accent text-base border-accent'
                        : 'bg-panel border-raise-hi text-ink/55'
                  }`}
                >
                  {done ? <Icon name="check" className="w-3 h-3" /> : current ? l.id : <Icon name="lock" className="w-2.5 h-2.5" />}
                </div>
                <span
                  className={`text-[8px] mt-0.5 text-center leading-tight ${
                    current ? 'text-accent font-semibold' : done ? 'text-ink/70' : 'text-ink/40'
                  }`}
                >
                  {l.name}
                </span>
              </div>
              {i < levels.length - 1 && (
                <div className={`h-px w-2 shrink-0 mt-[-10px] ${done ? 'bg-safe/60' : 'bg-raise'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The emergency stop, in the one place it is allowed to live: pinned to the
 * top of the instrument column, in both tabs, whatever you have scrolled to.
 *
 * Three things make it unlike every other button in the game.
 *   1. A hazard-striped guard plate. Nothing else wears stripes.
 *   2. Two stages. One press arms it, a second fires; it disarms itself after
 *      four seconds, so a stray click cannot vent the plasma and a half-armed
 *      control cannot sit waiting to catch you out.
 *   3. Firing flashes the panel red and the slot flips to the shutdown state,
 *      which is a state change rather than an animation and therefore still
 *      readable with motion turned off.
 *
 * Exported because fission's scram deserves exactly the same object; see the
 * handover note in the report. `onFire` is passed straight through: what the
 * control DOES is the store's business, not this component's.
 */
export function EmergencyStop({
  live, label, armedLabel, idleLabel, firedLabel, onFire, locked = false,
}) {
  const [armed, setArmed] = useState(false);
  const [fired, setFired] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const arm = () => {
    clearTimers();
    setArmed(true);
    timers.current.push(setTimeout(() => setArmed(false), 4000));
  };
  const fire = () => {
    clearTimers();
    setArmed(false);
    setFired(true);
    onFire();
    timers.current.push(setTimeout(() => setFired(false), 1600));
  };

  return (
    <div className={`estop-bar ${locked ? 'ui-locked' : ''}`}>
      {live ? (
        <div className="estop-guard">
          <button
            type="button"
            onClick={armed ? fire : arm}
            className={`estop ${armed ? 'is-armed' : ''}`}
            title={armed ? 'Press again to confirm' : 'Guarded: press once to arm, again to fire'}
            aria-label={armed
              ? `${armedLabel}. Armed. Activate again to confirm.`
              : `${label}. Guarded emergency control: activate once to arm, again to fire.`}
          >
            <span className="estop-cap" aria-hidden="true" />
            <span className="min-w-0">
              <span className="estop-kicker">{armed ? '▲ ARMED · CONFIRM' : 'EMERGENCY · PRESS TWICE'}</span>
              <span className="estop-label">{armed ? armedLabel : label}</span>
            </span>
          </button>
        </div>
      ) : (
        <div className="estop-idle">
          <span className="estop-idle-dot" aria-hidden="true" />
          <span className="label-mono text-[9px] text-ink/85" aria-live="polite">
            {fired ? firedLabel : idleLabel}
          </span>
        </div>
      )}
      {fired && <div className="estop-flash" aria-hidden="true" />}
    </div>
  );
}

export function ObjectiveBanner() {
  const mode = useReactorStore((s) => s.mode);
  const levelId = useReactorStore((s) => s.level.id);
  const sustain = useReactorStore((s) => s.level.sustain);
  const completed = useReactorStore((s) => s.level.completed);
  const career = useReactorStore((s) => s.career);
  const setCareerOpen = useReactorStore((s) => s.setCareerOpen);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const level = levelFor(mode, levelId, plantKey);
  const progress = Math.min(sustain / level.sustainTicks, 1);
  // Re-hides on every new mission, so the numbers are always asked for.
  const [showBrief, setShowBrief] = useState(false);
  useEffect(() => setShowBrief(false), [levelId, mode]);

  if (completed) {
    if (career) {
      const next = nextPosting(career.postingId);
      return (
        <div className="bg-panel p-3 border border-accent/40">
          <div className="text-[10px] uppercase tracking-widest text-accent">
            Posting complete: performance review filed
          </div>
          <p className="text-xs text-ink/85 mt-1">
            {next
              ? `A promotion offer is on your desk: ${next.title}. The plant keeps running until you sign.`
              : 'Top of the ladder for now. Operations continue; new postings are in development.'}
          </p>
          <button
            onClick={() => setCareerOpen(true)}
            className="btn-nav is-on mt-2 text-[10px] font-bold"
          >
            {next ? 'READ REVIEW & OFFER' : 'OPEN CAREER FILE'}
          </button>
        </div>
      );
    }
    return (
      <div className="bg-panel p-3 border border-safe/40">
        <div className="text-[10px] uppercase tracking-widest text-safe">Campaign complete: Sandbox mode</div>
        <p className="text-xs text-ink/85 mt-1">
          {mode === 'fission'
            ? 'Free operation. Load scenarios, run transients, watch the margins.'
            : 'The commercial fusion era is yours. All systems unlocked. Push the machine as far as physics allows.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel p-3 border border-accent/30">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-accent">
          Mission {level.id}: {level.name}
        </span>
        <SpeakerIcon text={`Mission ${level.id}, ${level.name}. Objective: ${level.objective}. ${showBrief ? level.brief : (level.hint ?? '')}`} />
      </div>
      <p className="text-xs font-semibold mt-1">{level.objective}</p>
      {/* The idea, always. The exact setpoints only if you ask: handing over
          "field 11.5 T, density 1.0" turns the mission into data entry. */}
      {level.hint && <p className="text-[10px] text-ink/70 mt-0.5">{level.hint}</p>}
      {level.brief && (
        showBrief ? (
          <p className="text-[10px] text-accent mt-1 leading-relaxed">▸ {level.brief}</p>
        ) : (
          <button
            type="button"
            onClick={() => setShowBrief(true)}
            className="mt-1 label-mono text-[9px] text-ink/55 hover:text-accent"
          >
            [ stuck? show the settings ]
          </button>
        )
      )}
      <div className="h-1.5 bg-raise rounded-full mt-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      {progress > 0 && progress < 1 && (
        <div className="text-[9px] text-accent mt-0.5 font-mono">holding objective… {Math.round(progress * 100)}%</div>
      )}
    </div>
  );
}

/**
 * Focus group: gain — "is it producing enough fusion to matter". Q, the
 * ignition triple product, and the neutron count. Both feature flags are
 * checked (rather than nesting under one) because `fulldash` implies
 * `neutrons` was already unlocked, but the group itself may be invoked
 * before either is true (a level can mark `gain` non-hidden ahead of the
 * mechanical unlock; see the hard constraint in the task: unlocked AND
 * non-hidden to render).
 */
function GainGroup({ features, primary }) {
  const Q = useReactorStore((s) => s.sim.physics.Q);
  const pFus = useReactorStore((s) => s.sim.physics.pFusionMW);
  const triple = useReactorStore((s) => s.sim.physics.tripleProduct);
  const ignition = useReactorStore((s) => s.sim.physics.ignition);
  const p = useReactorStore((s) => s.sim.physics);
  const c = useReactorStore((s) => s.sim.controls);

  if (!features.has('fulldash') && !features.has('neutrons')) return null;

  // "Currently limited by": every number should answer WHY it is what it is
  const qLimits = [];
  if (p.plasmaOn && p.beamCoupling < 0.75) {
    qLimits.push(`Beam shine-through: only ${fmtPercent(p.beamCoupling)} of the heating beam couples into fuel this thin`);
  }
  if (p.pBremsMW > 0.25 * Math.max(p.pAlphaMW + c.heat * p.beamCoupling, 0.1)) {
    qLimits.push(`Radiation loss: ${fmtPower(p.pBremsMW)} glows away as X-rays (impurities in the plasma raise this)`);
  }
  if (!ignition) {
    qLimits.push(`Confinement: n·T·τ is at ${fmtPercent(Math.min((triple / IGNITION_TRIPLE) * 100, 99), true)} of ignition; the plasma still needs external heat`);
  }
  if (p.greenwaldFrac > 0.9) {
    qLimits.push('Density limit: almost no headroom to add fuel at this field');
  }
  if (c.B >= c.bMax - 0.05) {
    qLimits.push('Magnetic field at the machine maximum');
  }

  const qColor = Q >= 1 ? 'text-safe' : Q >= 0.5 ? 'text-warn' : 'text-ink/85';
  return (
    <div className={`grid gap-2.5 ${primary ? 'focus-primary' : 'peripheral'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {features.has('fulldash') && (
          <div className="readout p-3 col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-ink/70 flex items-center gap-1">
              Q: Energy Gain <Cite id="jet_record" />
            </div>
            <div className={`font-mono text-3xl font-black ${qColor}`}>{fmtQ(Q)}</div>
            <div className="text-[8px] text-ink/55">fusion ÷ heating electrical draw</div>
            <div className="w-full text-left">
              <CalcDrawer calc={{
                meaning: `Every megawatt of electricity fed to the heating systems buys ${fmtQ(Q)} MW of fusion heat.`,
                drivers: 'Hotter, denser, better-confined plasma raises it. Radiation and beam shine-through losses eat it.',
                equation: 'Q = P_fusion / P_heating-electric',
                steps: [
                  ['Heating wall-plug draw', fmtPower(p.pInputElecMW)],
                  ['Absorbed by the plasma', fmtPower(c.heat * p.beamCoupling)],
                  ['Radiation loss (X-rays)', `−${fmtPower(p.pBremsMW)}`],
                  ['Alpha self-heating', `+${fmtPower(p.pAlphaMW)}`],
                  ['Fusion power out', fmtPower(p.pFusionMW)],
                  ['Q', fmtQ(Q)],
                ],
                limitedBy: qLimits.slice(0, 3),
                assumptions: 'Engineering Q against the wall-plug draw, a tougher standard than the physics Q quoted for JET and NIF.',
                cite: 'jet_record',
              }} />
            </div>
          </div>
        )}
        {features.has('neutrons') && (
          <div className="readout p-3 flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-ink/70">Fusion Power</div>
            <div className="font-mono text-lg font-bold text-accent">{fmtPower(pFus)}</div>
            <div className="text-[8px] text-ink/55">thermal</div>
          </div>
        )}
        {features.has('fulldash') && (
          <div className="readout p-3 flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-ink/70 flex items-center gap-1">
              n·T·τ <Cite id="lawson" />
            </div>
            <div className={`font-mono text-sm font-bold ${ignition ? 'text-accent' : 'text-ink'}`}>
              {fmtSci(triple)}
            </div>
            <div className="text-[8px] text-ink/55">
              {ignition ? '★ IGNITED' : `ignition at ${fmtSci(IGNITION_TRIPLE, 0)}`}
            </div>
          </div>
        )}
      </div>
      {features.has('neutrons') && <NeutronPanel />}
    </div>
  );
}

/**
 * Focus group: power — "does any of it reach the meter". Just the
 * recirculating-power tile; gated on `finance` since that is the first
 * feature that makes net power meaningful (see report for why `power` can
 * still render nothing between its own PERIPHERAL onset and the finance
 * unlock two levels later — the unlock/hidden intersection rule at work,
 * not a bug).
 */
function PowerGroup({ features, primary }) {
  const net = useReactorStore((s) => s.sim.physics.netElecMW);
  const p = useReactorStore((s) => s.sim.physics);
  const c = useReactorStore((s) => s.sim.controls);

  if (!features.has('finance')) return null;

  const recircItems = [
    [`Heating systems: ${fmtPower(p.pInputElecMW)} wall-plug draw`, p.pInputElecMW],
    [`Magnets: ${fmtPower(p.magnetDrawMW)} to hold ${fmtTesla(c.B)}`, p.magnetDrawMW],
    [`Divertor cooling pumps: ${fmtPower(c.cooling * 0.3)}`, c.cooling * 0.3],
    ['Plant baseline (cryo, tritium plant, controls): 15 MW', 15],
  ].sort((a, b) => b[1] - a[1]);
  const netLimits = [
    'Steam cycle: ~65% of thermal power is rejected at the condenser (thermodynamics, not a defect)',
    ...recircItems.slice(0, 2).map(([t]) => t),
  ];

  return (
    <div className={primary ? 'focus-primary' : 'peripheral'}>
      <div className={`readout ${primary ? 'p-5 max-w-sm' : 'p-3 max-w-[220px]'} flex flex-col items-center justify-center`}>
        <div className={`uppercase tracking-widest text-ink/70 ${primary ? 'text-[11px]' : 'text-[9px]'}`}>Net to Grid</div>
        <div className={`font-mono font-bold ${primary ? 'text-4xl' : 'text-lg'} ${net >= 0 ? 'text-safe' : 'text-crit'}`}>
          {net >= 0 ? '+' : ''}{fmtPower(net)}
        </div>
        <div className={`text-ink/55 ${primary ? 'text-[10px]' : 'text-[8px]'}`}>after recirculating power</div>
        <div className="w-full text-left">
          <CalcDrawer calc={{
            meaning: `The plant generates ${fmtPower(p.grossElecMW)} of electricity and spends ${fmtPower(p.recircMW)} running itself. The grid gets the difference.`,
            drivers: 'More fusion power raises the gross. Heating, magnets, cooling, and house loads all bite before the meter.',
            equation: 'P_net = P_gross − P_recirculating',
            steps: [
              ['Gross electric', fmtPower(p.grossElecMW)],
              ...recircItems.map(([t, v]) => [t.split(':')[0], `−${fmtPower(v)}`]),
              ['Net to grid', fmtPower(net)],
            ],
            limitedBy: netLimits,
            assumptions: 'Fixed steam-cycle efficiency around 35%, adjusted by your as-built turbine. Real plants also vary with condenser temperature.',
            cite: 'recirc',
          }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Focus group: scale — "is it a power station". Homes powered, pulled
 * straight from physics so it stands on its own rather than riding along
 * inside the financial ledger. Gated on `finance` for the same reason as
 * PowerGroup: homes powered is zero and meaningless before net export exists.
 */
function ScaleGroup({ features, primary }) {
  const homes = useReactorStore((s) => s.sim.physics.homesPowered);

  if (!features.has('finance')) return null;

  return (
    <div className={primary ? 'focus-primary' : 'peripheral'}>
      <div className={`readout ${primary ? 'p-5 max-w-sm' : 'p-3 max-w-[220px]'} flex flex-col items-center justify-center`}>
        <div className={`uppercase tracking-widest text-ink/70 ${primary ? 'text-[11px]' : 'text-[9px]'}`}>Homes Powered</div>
        <div className={`font-mono font-bold text-accent ${primary ? 'text-4xl' : 'text-lg'}`}>{homes.toLocaleString()}</div>
        <div className={`text-ink/55 ${primary ? 'text-[10px]' : 'text-[8px]'}`}>net export ÷ ~1 kW average home</div>
      </div>
    </div>
  );
}

function StructurePanel({ primary = false }) {
  const st = useReactorStore((s) => s.sim.structure);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  const funds = useReactorStore((s) => s.econ.funds);
  const repair = useReactorStore((s) => s.repairComponent);
  const pFus = useReactorStore((s) => s.sim.physics.pFusionMW);
  const divT = useReactorStore((s) => s.sim.physics.divertorTempC);
  const divLimit = useReactorStore((s) => s.sim.physics.divertorLimitC);
  const B = useReactorStore((s) => s.sim.controls.B);
  const safeB = useReactorStore((s) => s.sim.physics.magnetSafeB);
  // Instantaneous engineering load on each component (what's wearing it right now)
  const loads = {
    firstWall: Math.min(pFus / 3500, 1),      // neutron flux vs GW-class design point
    divertor: Math.min(divT / divLimit, 1.2), // thermal load vs damage threshold
    magnets: Math.min(B / safeB, 1.2),        // field vs coil rating (stress ∝ B²)
  };
  const bars = [
    ['firstWall', 'Inner Wall (first wall)', st.firstWall, 'dpa_materials'],
    ['divertor', 'Exhaust Plates (divertor)', st.divertor, 'divertor_iter'],
    ['magnets', 'Magnets', st.magnets, 'quench'],
  ];
  return (
    <div className={`readout ${primary ? 'p-5' : 'p-3'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`uppercase tracking-wider text-ink/70 ${primary ? 'text-xs' : 'text-[10px]'}`}>Structural Health &amp; Maintenance</span>
        {/* The shutdown button used to live here, nine pixels tall, three
            scrolls down. It is now the pinned emergency stop at the top of the
            column: one plasma-off control, in one place. This is the readout
            half of it. */}
        <span className={`font-mono ${primary ? 'text-[10px]' : 'text-[9px]'} ${plasmaOn ? 'text-ink/55' : 'text-safe'}`}>
          {plasmaOn ? 'SERVICE LOCKED: PLASMA ON' : 'MAINTENANCE WINDOW OPEN'}
        </span>
      </div>
      <div className={`grid ${primary ? 'gap-2.5' : 'gap-1.5'}`}>
        {bars.map(([key, label, v, cite]) => {
          const color = v > 60 ? 'var(--color-safe)' : v > 30 ? 'var(--color-warn)' : 'var(--color-crit)';
          const worn = v < 99.95;
          const cost = ((100 - v) / 100) * SERVICE_COSTS[key];
          const canService = worn && !plasmaOn && funds >= cost;
          const load = loads[key];
          const loadColor = load > 0.95 ? 'text-crit' : load > 0.8 ? 'text-warn' : 'text-ink/55';
          return (
            <div key={key}>
              <div className={`flex justify-between items-center ${primary ? 'text-xs' : 'text-[10px]'}`}>
                <span className="text-ink/70 flex items-center gap-1">
                  {label} <Cite id={cite} />
                  <span className={`font-mono text-[9px] ${loadColor}`}>load {fmtPercent(load)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono" style={{ color }}>{fmtPercent(v, true)}</span>
                  {worn && (
                    <button
                      onClick={() => repair(key)}
                      disabled={!canService}
                      title={plasmaOn ? 'Shut down the plasma first' : funds < cost ? 'Insufficient funds' : `Restore to 100% for ${fmtMoney(cost)}`}
                      className="btn-plant text-[9px]"
                    >
                      SERVICE {fmtMoney(cost)}
                    </button>
                  )}
                </span>
              </div>
              <div className={`bg-raise rounded-full overflow-hidden mt-0.5 ${primary ? 'h-2.5' : 'h-1.5'}`}>
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* `label` is what the chart is called; `short` is what fits on the tab. The
   full name still rides along to the plot, so nothing is renamed away. */
const TELEMETRY_TABS = [
  { id: 'T', label: 'Temperature', short: 'Temp', color: '#F59E0B', fmt: fmtKeV, feature: 'gauges' },
  { id: 'pFus', label: 'Fusion Power', short: 'Fusion', color: '#38BDF8', fmt: fmtPower, feature: 'neutrons' },
  { id: 'Q', label: 'Q Factor', short: 'Q', color: '#22C55E', fmt: fmtQ, feature: 'fulldash' },
  { id: 'net', label: 'Net Power', short: 'Net', color: '#A78BFA', fmt: fmtPower, feature: 'finance' },
];

const FISSION_TELEMETRY_TABS = [
  { id: 'P', label: 'Power', color: '#38BDF8', fmt: fmtPower },
  { id: 'Tfuel', label: 'Fuel Temp', short: 'Fuel T', color: '#F59E0B', fmt: fmtCelsius },
  { id: 'rho', label: 'Reactivity', color: '#22C55E', fmt: fmtPcm },
  { id: 'xe', label: 'Xenon', color: '#A78BFA', fmt: fmtPcm },
  { id: 'net', label: 'Net Power', short: 'Net', color: '#F8FAFC', fmt: fmtPower },
];

function exportTelemetryCsv(mode) {
  const hist = useReactorStore.getState().history;
  if (hist.length === 0) return;
  const keys = Object.keys(hist[hist.length - 1]);
  const csv = [keys.join(','), ...hist.map((h) => keys.map((k) => h[k] ?? '').join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mode === 'fission' ? 'fissioncore' : 'fusioncore'}_telemetry.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** One chart, several tabs, plus a normalized all-channels overlay. */
export function TelemetryPanel({ features }) {
  const mode = useReactorStore((s) => s.mode);
  const [metric, setMetric] = useState(null);
  const avail = mode === 'fission'
    ? FISSION_TELEMETRY_TABS
    : TELEMETRY_TABS.filter((t) => features?.has(t.feature));
  if (avail.length === 0) return null;
  const overlayReady = avail.length > 1;
  const overlayActive = metric === 'overlay' && overlayReady;
  const active = overlayActive ? null : (avail.find((t) => t.id === metric) ?? avail[0]);
  return (
    <div>
      <div className="flex gap-1 mb-1 items-center flex-wrap">
        {/* Navigation, not plant action: these change which trace you are
            looking at and touch nothing. Quiet by class. */}
        {avail.length > 1 && avail.map((t) => (
          <button
            key={t.id}
            onClick={() => setMetric(t.id)}
            aria-pressed={active?.id === t.id}
            title={t.label}
            className={`btn-nav text-[9px] ${active?.id === t.id ? 'is-on' : ''}`}
          >
            {t.short ?? t.label}
          </button>
        ))}
        {overlayReady && (
          <button
            onClick={() => setMetric('overlay')}
            aria-pressed={overlayActive}
            title="All channels on one plot, each scaled to its own peak"
            className={`btn-nav text-[9px] ${overlayActive ? 'is-on' : ''}`}
          >
            Overlay
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => exportTelemetryCsv(mode)}
          title="Download this run's telemetry as CSV"
          className="btn-nav text-[9px]"
        >
          CSV
        </button>
      </div>
      {overlayActive
        ? <OverlayChart channels={avail} />
        : <HistoryChart metric={active.id} label={active.label} color={active.color} formatMax={active.fmt} />}
    </div>
  );
}

function NeutronPanel() {
  const rate = useReactorStore((s) => s.sim.physics.neutronRate);
  return (
    <div className="readout p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-1 flex items-center gap-1">
        Neutron Monitoring <Cite id="dpa_materials" />
      </div>
      <div className="font-mono text-sm font-bold text-accent">{rate > 0 ? `${fmtSci(rate)} n/s` : ', no flux'}</div>
      <p className="text-[9px] text-ink/55 mt-1">Each count is one fusion reaction.</p>
    </div>
  );
}

function VacuumPanel() {
  const density = useReactorStore((s) => s.sim.controls.density);
  const gwLimit = useReactorStore((s) => s.sim.physics.greenwaldLimit20);
  const gwFrac = useReactorStore((s) => s.sim.physics.greenwaldFrac);
  const levelId = useReactorStore((s) => s.level.id);
  const named = levelId >= 3; // "Greenwald" is introduced in the Mission 3 briefing
  const color = gwFrac < 0.7 ? 'text-safe' : gwFrac < 0.95 ? 'text-warn' : 'text-crit';
  return (
    <div className="readout p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-1 flex items-center gap-1">
        Fuel Density Diagnostics <Cite id="greenwald" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <div className="text-ink/55 text-[9px]">DENSITY (10²⁰ m⁻³)</div>
          <div className="font-bold">{bare(fmtDensity(density))}</div>
        </div>
        <div>
          <div className="text-ink/55 text-[9px]">{named ? 'DENSITY LIMIT (GREENWALD)' : 'DENSITY LIMIT'}</div>
          <div className={`font-bold ${color}`}>{fmtPercent(gwFrac)} of {bare(fmtDensity(gwLimit))}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Focus group: stability — "is the plasma alive and behaving". The core
 * gauge row plus fuel density diagnostics. Never returns null: the core
 * temp gauge has no feature gate of its own, so this group is on screen
 * from the moment a plasma exists, matching its X,X,P,P,P,P,P,P arc (it is
 * shown from level 1 and never regresses to hidden).
 */
function StabilityGroup({ features, primary }) {
  const T = useReactorStore((s) => s.sim.physics.T);
  const tauE = useReactorStore((s) => s.sim.physics.tauE);
  const beta = useReactorStore((s) => s.sim.physics.beta);
  const betaLimit = useReactorStore((s) => s.sim.physics.betaLimit);
  const divT = useReactorStore((s) => s.sim.physics.divertorTempC);
  const divLimit = useReactorStore((s) => s.sim.physics.divertorLimitC);

  return (
    <div className={`grid gap-2.5 ${primary ? 'focus-primary' : 'peripheral'}`}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {features.has('density') ? (
          <Gauge label="Core Temp" value={T} max={40} unit="keV" display={bare(fmtKeV(T))} zones={[0.99, 0.995]} cite="ipb98" />
        ) : (
          <Gauge label="Core Temp" value={T} max={40} unit="million °C" display={bare(fmtMillionC(T))} zones={[0.99, 0.995]} cite="ipb98" />
        )}
        {features.has('fulldash') && (
          <Gauge label="Confinement τE" value={tauE} max={3} unit="s" display={bare(fmtSeconds(tauE))} zones={[0.99, 0.995]} cite="ipb98" />
        )}
        {features.has('density') && (
          <Gauge
            label={features.has('fulldash') ? 'Beta Limit' : 'Pressure Limit'}
            value={betaLimit > 0 ? beta / betaLimit : 0} max={1.2}
            unit={features.has('fulldash') ? 'β/βmax' : '% of max'}
            display={fmtPercent(betaLimit > 0 ? beta / betaLimit : 0)} zones={[0.7, 0.92]} cite="troyon"
          />
        )}
        {features.has('fulldash') && (
          <Gauge label="Divertor" value={divT} max={Math.max(divLimit * 1.3, 1)} unit="°C" display={bare(fmtCelsius(divT))} zones={[divLimit / (divLimit * 1.3) * 0.85, divLimit / (divLimit * 1.3)]} cite="divertor_iter" />
        )}
      </div>
      {features.has('vacuum') && <VacuumPanel />}
    </div>
  );
}

/**
 * Focus group: endurance — "will the machine survive the run". Structural
 * health, the engineering-margin readout, and the as-built plant. All three
 * live elsewhere or locally, so this is a pure grouping wrapper.
 */
function EnduranceGroup({ features, primary }) {
  if (!features.has('neutrons') && !features.has('fulldash')) return null;
  return (
    <div className={`grid gap-2.5 ${primary ? 'focus-primary' : 'peripheral'}`}>
      {features.has('neutrons') && <StructurePanel primary={primary} />}
      {features.has('fulldash') && <EngineeringPanel />}
      {features.has('fulldash') && <AsBuiltPanel />}
    </div>
  );
}

/**
 * Focus group: economics — "does it sell". Just the financial ledger; `Finance`
 * is owned elsewhere, so its own type never resizes, only the space around it.
 */
function EconomicsGroup({ features, primary }) {
  if (!features.has('finance')) return null;
  return (
    <div className={primary ? 'focus-primary' : 'peripheral'}>
      <Finance />
    </div>
  );
}

/** One entry per FOCUS_GROUPS key (src/engine/focus.js), so the render order
 *  below can be derived from focusFor() instead of hand-maintained. */
const GROUP_COMPONENTS = {
  stability: StabilityGroup,
  gain: GainGroup,
  endurance: EnduranceGroup,
  power: PowerGroup,
  scale: ScaleGroup,
  economics: EconomicsGroup,
};

export default function Dashboard({ tabletTab }) {
  const levelId = useReactorStore((s) => s.level.id);
  const onboarding = useReactorStore((s) => s.onboarding);
  const bMax = useReactorStore((s) => s.sim.controls.bMax);
  const safeB = useReactorStore((s) => s.sim.physics.magnetSafeB);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  const shutdown = useReactorStore((s) => s.shutdownPlasma);

  const features = unlockedFeatures(levelId);
  // The dashboard's shape for this level: which groups show, and which one
  // is today's job. Order is derived, not hand-listed — the PRIMARY group
  // (there is ever at most one; units_check.mjs asserts exactly one) floats
  // to the front and the rest keep FOCUS_GROUPS' order, via a stable sort.
  const focus = focusFor(levelId);
  const groupOrder = [...FOCUS_GROUPS]
    .filter((g) => focus[g] !== FOCUS.HIDDEN)
    .sort((a, b) => (focus[a] === FOCUS.PRIMARY ? -1 : 0) - (focus[b] === FOCUS.PRIMARY ? -1 : 0));
  const ob = onboarding.active;
  const tutStep = tutorialStep(onboarding);
  const lockAll = !!tutStep?.lock; // frozen tutorial steps lock all but the star

  // The floating column shows one section at a time on every screen size
  const controlsVis = tabletTab === 'controls' ? '' : 'hidden';
  const diagVis = tabletTab === 'diagnostics' ? '' : 'hidden';

  return (
    <div className="flex-1 overflow-y-auto p-2.5 grid gap-2.5 content-start min-h-0">
      {/* Pinned, both tabs, every scroll position: you should never have to go
          looking for the way to stop the machine. */}
      <EmergencyStop
        live={plasmaOn}
        label="SHUT DOWN PLASMA"
        armedLabel="VENT THE PLASMA NOW"
        idleLabel="PLASMA OFF · MAINTENANCE WINDOW OPEN"
        firedLabel="PLASMA VENTED · MAINTENANCE WINDOW OPEN"
        onFire={shutdown}
        locked={lockAll}
      />
      <HazardBanner />
      <CampaignMap />
      <ObjectiveBanner />

      <div className={`${diagVis} grid gap-2.5`}>
        {groupOrder.map((g) => {
          const GroupPanels = GROUP_COMPONENTS[g];
          return <GroupPanels key={g} features={features} primary={focus[g] === FOCUS.PRIMARY} />;
        })}
        {/* Spans every group rather than belonging to one: left in a fixed
            slot rather than reordered with the groups above. */}
        <TelemetryPanel features={features} />
      </div>

      <div className={`${controlsVis} grid gap-2.5`}>
        <DutiesPanel />
        <CrewPanel />
        <div className="grid gap-2">
          <ControlSlider
            controlKey="B" label="Magnetic Field" unit="T" min={1} max={bMax} step={0.1}
            cite="rebco_arc" danger={safeB}
            highlight={tutStep?.highlight === 'B'}
            disabled={lockAll && tutStep?.highlight !== 'B'}
          />
          <ControlSlider
            controlKey="heat"
            label={features.has('fulldash') ? 'Auxiliary Heating (NBI + ICRF)' : 'Plasma Heating'}
            unit="MW" min={0} max={50} step={0.5}
            cite="recirc"
            highlight={tutStep?.highlight === 'heat'}
            disabled={(lockAll && tutStep?.highlight !== 'heat') || (!ob && !features.has('heat'))}
          />
          {features.has('density') && (
            <ControlSlider
              controlKey="density" label="Fuel Density (gas fueling)" unit="×10²⁰ m⁻³" min={0.1} max={5} step={0.05}
              format={(v) => bare(fmtDensity(v))} cite="greenwald"
              disabled={lockAll}
            />
          )}
          {features.has('fuelmix') && (
            <ControlSlider
              controlKey="fuelMix" label="Tritium Fraction (D-T mix)" unit="" min={0.05} max={0.95} step={0.05}
              format={(v) => `${fmtPercent(v)} T`} cite="tbr"
              disabled={lockAll}
            />
          )}
          {features.has('fulldash') && (
            <ControlSlider
              controlKey="cooling" label="Divertor Active Cooling" unit="MW" min={0} max={100} step={1}
              format={(v) => String(Math.round(v))} cite="divertor_iter"
              disabled={lockAll}
            />
          )}
        </div>
        {features.has('neutrons') && <FuelPanel showBreeding={features.has('tritium')} />}
        {features.has('neutrons') && (
          <div className={lockAll ? 'ui-locked' : ''}>
            <TechTree />
          </div>
        )}
        {!lockAll && <ScenarioPanel />}
      </div>
    </div>
  );
}
