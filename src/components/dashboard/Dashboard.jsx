import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReactorStore, SERVICE_COSTS, levelsFor, levelFor } from '../../store/reactorStore.js';
import { unlockedFeatures } from '../../engine/levels.js';
import { tutorialStep } from '../../engine/tutorials.js';
import { nextPosting } from '../../engine/career.js';
import HazardBanner from './HazardBanner.jsx';
import ScenarioPanel from './ScenarioPanel.jsx';
import DutiesPanel from './DutiesPanel.jsx';
import CrewPanel from './CrewPanel.jsx';
import EngineeringPanel from './EngineeringPanel.jsx';
import Icon from '../common/Icon.jsx';
import { IGNITION_TRIPLE } from '../../engine/constants.js';
import { fmtPower, fmtSci, fmtMoney } from '../../utils/format.js';
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
    <div className="bg-panel rounded-lg px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-slate-400">
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
                        : 'bg-slate-800 border-slate-600 text-slate-500'
                  }`}
                >
                  {done ? <Icon name="check" className="w-3 h-3" /> : current ? l.id : <Icon name="lock" className="w-2.5 h-2.5" />}
                </div>
                <span
                  className={`text-[8px] mt-0.5 text-center leading-tight ${
                    current ? 'text-accent font-semibold' : done ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {l.name}
                </span>
              </div>
              {i < levels.length - 1 && (
                <div className={`h-px w-2 shrink-0 mt-[-10px] ${done ? 'bg-safe/60' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>
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

  if (completed) {
    if (career) {
      const next = nextPosting(career.postingId);
      return (
        <div className="bg-panel rounded-lg p-3 border border-violet-400/40">
          <div className="text-[10px] uppercase tracking-widest text-violet-300">
            Posting complete: performance review filed
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {next
              ? `A promotion offer is on your desk: ${next.title}. The plant keeps running until you sign.`
              : 'Top of the ladder for now. Operations continue; new postings are in development.'}
          </p>
          <button
            onClick={() => setCareerOpen(true)}
            className="mt-2 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded bg-violet-400/20 text-violet-200 hover:bg-violet-400/30"
          >
            {next ? 'READ REVIEW & OFFER' : 'OPEN CAREER FILE'}
          </button>
        </div>
      );
    }
    return (
      <div className="bg-panel rounded-lg p-3 border border-safe/40">
        <div className="text-[10px] uppercase tracking-widest text-safe">Campaign complete: Sandbox mode</div>
        <p className="text-xs text-slate-300 mt-1">
          {mode === 'fission'
            ? 'Free operation. Load scenarios, run transients, watch the margins.'
            : 'The commercial fusion era is yours. All systems unlocked. Push the machine as far as physics allows.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-lg p-3 border border-accent/30">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-accent">
          Mission {level.id}: {level.name}
        </span>
        <SpeakerIcon text={`Mission ${level.id}, ${level.name}. Objective: ${level.objective}. ${level.brief}`} />
      </div>
      <p className="text-xs font-semibold mt-1">{level.objective}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{level.brief}</p>
      <div className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
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

function BigMetrics({ features }) {
  const Q = useReactorStore((s) => s.sim.physics.Q);
  const pFus = useReactorStore((s) => s.sim.physics.pFusionMW);
  const net = useReactorStore((s) => s.sim.physics.netElecMW);
  const triple = useReactorStore((s) => s.sim.physics.tripleProduct);
  const ignition = useReactorStore((s) => s.sim.physics.ignition);
  const p = useReactorStore((s) => s.sim.physics);
  const c = useReactorStore((s) => s.sim.controls);

  // "Currently limited by": every number should answer WHY it is what it is
  const qLimits = [];
  if (p.plasmaOn && p.beamCoupling < 0.75) {
    qLimits.push(`Beam shine-through: only ${(p.beamCoupling * 100).toFixed(0)}% of the heating beam couples into fuel this thin`);
  }
  if (p.pBremsMW > 0.25 * Math.max(p.pAlphaMW + c.heat * p.beamCoupling, 0.1)) {
    qLimits.push(`Radiation loss: ${p.pBremsMW.toFixed(1)} MW glows away as X-rays (impurities in the plasma raise this)`);
  }
  if (!ignition) {
    qLimits.push(`Confinement: n·T·τ is at ${Math.min((triple / IGNITION_TRIPLE) * 100, 99).toFixed(0)}% of ignition; the plasma still needs external heat`);
  }
  if (p.greenwaldFrac > 0.9) {
    qLimits.push('Density limit: almost no headroom to add fuel at this field');
  }
  if (c.B >= c.bMax - 0.05) {
    qLimits.push('Magnetic field at the machine maximum');
  }

  const recircItems = [
    [`Heating systems: ${p.pInputElecMW.toFixed(0)} MW wall-plug draw`, p.pInputElecMW],
    [`Magnets: ${p.magnetDrawMW.toFixed(0)} MW to hold ${c.B.toFixed(1)} T`, p.magnetDrawMW],
    [`Divertor cooling pumps: ${(c.cooling * 0.3).toFixed(0)} MW`, c.cooling * 0.3],
    ['Plant baseline (cryo, tritium plant, controls): 15 MW', 15],
  ].sort((a, b) => b[1] - a[1]);
  const netLimits = [
    'Steam cycle: ~65% of thermal power is rejected at the condenser (thermodynamics, not a defect)',
    ...recircItems.slice(0, 2).map(([t]) => t),
  ];

  const qColor = Q >= 1 ? 'text-safe' : Q >= 0.5 ? 'text-warn' : 'text-slate-300';
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {features.has('fulldash') && (
        <div className="bg-panel rounded-lg p-3 col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
          <div className="text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-1">
            Q: Energy Gain <Cite id="jet_record" />
          </div>
          <div className={`font-mono text-3xl font-black ${qColor}`}>{Q.toFixed(2)}</div>
          <div className="text-[8px] text-slate-500">fusion ÷ heating electrical draw</div>
          <div className="w-full text-left">
            <CalcDrawer calc={{
              meaning: `Every megawatt of electricity fed to the heating systems buys ${Q.toFixed(2)} MW of fusion heat.`,
              drivers: 'Hotter, denser, better-confined plasma raises it. Radiation and beam shine-through losses eat it.',
              equation: 'Q = P_fusion / P_heating-electric',
              steps: [
                ['Heating wall-plug draw', `${p.pInputElecMW.toFixed(1)} MW`],
                ['Absorbed by the plasma', `${(c.heat * p.beamCoupling).toFixed(1)} MW`],
                ['Radiation loss (X-rays)', `−${p.pBremsMW.toFixed(1)} MW`],
                ['Alpha self-heating', `+${p.pAlphaMW.toFixed(1)} MW`],
                ['Fusion power out', `${p.pFusionMW.toFixed(1)} MW`],
                ['Q', Q.toFixed(2)],
              ],
              limitedBy: qLimits.slice(0, 3),
              assumptions: 'Engineering Q against the wall-plug draw, a tougher standard than the physics Q quoted for JET and NIF.',
              cite: 'jet_record',
            }} />
          </div>
        </div>
      )}
      {features.has('neutrons') && (
        <div className="bg-panel rounded-lg p-3 flex flex-col items-center justify-center">
          <div className="text-[9px] uppercase tracking-widest text-slate-400">Fusion Power</div>
          <div className="font-mono text-lg font-bold text-accent">{fmtPower(pFus)}</div>
          <div className="text-[8px] text-slate-500">thermal</div>
        </div>
      )}
      {features.has('finance') && (
        <div className="bg-panel rounded-lg p-3 flex flex-col items-center justify-center">
          <div className="text-[9px] uppercase tracking-widest text-slate-400">Net to Grid</div>
          <div className={`font-mono text-lg font-bold ${net >= 0 ? 'text-safe' : 'text-crit'}`}>
            {net >= 0 ? '+' : ''}{fmtPower(net)}
          </div>
          <div className="text-[8px] text-slate-500">after recirculating power</div>
          <div className="w-full text-left">
            <CalcDrawer calc={{
              meaning: `The plant generates ${fmtPower(p.grossElecMW)} of electricity and spends ${fmtPower(p.recircMW)} running itself. The grid gets the difference.`,
              drivers: 'More fusion power raises the gross. Heating, magnets, cooling, and house loads all bite before the meter.',
              equation: 'P_net = P_gross − P_recirculating',
              steps: [
                ['Gross electric', fmtPower(p.grossElecMW)],
                ...recircItems.map(([t, v]) => [t.split(':')[0], `−${v.toFixed(0)} MW`]),
                ['Net to grid', fmtPower(net)],
              ],
              limitedBy: netLimits,
              assumptions: 'Fixed steam-cycle efficiency around 35%, adjusted by your as-built turbine. Real plants also vary with condenser temperature.',
              cite: 'recirc',
            }} />
          </div>
        </div>
      )}
      {features.has('fulldash') && (
        <div className="bg-panel rounded-lg p-3 flex flex-col items-center justify-center">
          <div className="text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-1">
            n·T·τ <Cite id="lawson" />
          </div>
          <div className={`font-mono text-sm font-bold ${ignition ? 'text-accent' : 'text-ink'}`}>
            {fmtSci(triple)}
          </div>
          <div className="text-[8px] text-slate-500">
            {ignition ? '★ IGNITED' : `ignition at ${fmtSci(IGNITION_TRIPLE, 0)}`}
          </div>
        </div>
      )}
    </div>
  );
}

function StructurePanel() {
  const st = useReactorStore((s) => s.sim.structure);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  const funds = useReactorStore((s) => s.econ.funds);
  const repair = useReactorStore((s) => s.repairComponent);
  const shutdown = useReactorStore((s) => s.shutdownPlasma);
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
    <div className="bg-panel rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">Structural Health &amp; Maintenance</span>
        {plasmaOn ? (
          <button
            onClick={shutdown}
            className="text-[9px] font-semibold px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-warn"
            title="Vent the plasma to open a maintenance window"
          >
            SHUT DOWN PLASMA
          </button>
        ) : (
          <span className="text-[9px] font-mono text-safe">MAINTENANCE WINDOW OPEN</span>
        )}
      </div>
      <div className="grid gap-1.5">
        {bars.map(([key, label, v, cite]) => {
          const color = v > 60 ? 'var(--color-safe)' : v > 30 ? 'var(--color-warn)' : 'var(--color-crit)';
          const worn = v < 99.95;
          const cost = ((100 - v) / 100) * SERVICE_COSTS[key];
          const canService = worn && !plasmaOn && funds >= cost;
          const load = loads[key];
          const loadColor = load > 0.95 ? 'text-crit' : load > 0.8 ? 'text-warn' : 'text-slate-500';
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  {label} <Cite id={cite} />
                  <span className={`font-mono text-[9px] ${loadColor}`}>load {(load * 100).toFixed(0)}%</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono" style={{ color }}>{v.toFixed(1)}%</span>
                  {worn && (
                    <button
                      onClick={() => repair(key)}
                      disabled={!canService}
                      title={plasmaOn ? 'Shut down the plasma first' : funds < cost ? 'Insufficient funds' : `Restore to 100% for ${fmtMoney(cost)}`}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        canService ? 'bg-accent text-base font-bold hover:brightness-110' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      SERVICE {fmtMoney(cost)}
                    </button>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-500 mt-1.5">Service requires plasma off.</p>
    </div>
  );
}

const TELEMETRY_TABS = [
  { id: 'T', label: 'Temperature', color: '#F59E0B', fmt: (v) => `${v.toFixed(1)} keV`, feature: 'gauges' },
  { id: 'pFus', label: 'Fusion Power', color: '#38BDF8', fmt: fmtPower, feature: 'neutrons' },
  { id: 'Q', label: 'Q Factor', color: '#22C55E', fmt: (v) => v.toFixed(2), feature: 'fulldash' },
  { id: 'net', label: 'Net Power', color: '#A78BFA', fmt: fmtPower, feature: 'finance' },
];

const FISSION_TELEMETRY_TABS = [
  { id: 'P', label: 'Power', color: '#38BDF8', fmt: fmtPower },
  { id: 'Tfuel', label: 'Fuel Temp', color: '#F59E0B', fmt: (v) => `${v.toFixed(0)} °C` },
  { id: 'rho', label: 'Reactivity', color: '#22C55E', fmt: (v) => `${v.toFixed(0)} pcm` },
  { id: 'xe', label: 'Xenon', color: '#A78BFA', fmt: (v) => `${v.toFixed(0)} pcm` },
  { id: 'net', label: 'Net Power', color: '#F8FAFC', fmt: fmtPower },
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
        {avail.length > 1 && avail.map((t) => (
          <button
            key={t.id}
            onClick={() => setMetric(t.id)}
            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
              active?.id === t.id ? 'bg-accent text-base' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
        {overlayReady && (
          <button
            onClick={() => setMetric('overlay')}
            title="All channels on one plot, each scaled to its own peak"
            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
              overlayActive ? 'bg-accent text-base' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Overlay
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => exportTelemetryCsv(mode)}
          title="Download this run's telemetry as CSV"
          className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          Export CSV
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
    <div className="bg-panel rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
        Neutron Monitoring <Cite id="dpa_materials" />
      </div>
      <div className="font-mono text-sm font-bold text-accent">{rate > 0 ? `${fmtSci(rate)} n/s` : ', no flux'}</div>
      <p className="text-[9px] text-slate-500 mt-1">Each count is one fusion reaction.</p>
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
    <div className="bg-panel rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
        Fuel Density Diagnostics <Cite id="greenwald" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <div className="text-slate-500 text-[9px]">DENSITY (10²⁰ m⁻³)</div>
          <div className="font-bold">{density.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-[9px]">{named ? 'DENSITY LIMIT (GREENWALD)' : 'DENSITY LIMIT'}</div>
          <div className={`font-bold ${color}`}>{(gwFrac * 100).toFixed(0)}% of {gwLimit.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ tabletTab }) {
  const levelId = useReactorStore((s) => s.level.id);
  const onboarding = useReactorStore((s) => s.onboarding);
  const T = useReactorStore((s) => s.sim.physics.T);
  const tauE = useReactorStore((s) => s.sim.physics.tauE);
  const beta = useReactorStore((s) => s.sim.physics.beta);
  const betaLimit = useReactorStore((s) => s.sim.physics.betaLimit);
  const divT = useReactorStore((s) => s.sim.physics.divertorTempC);
  const divLimit = useReactorStore((s) => s.sim.physics.divertorLimitC);
  const bMax = useReactorStore((s) => s.sim.controls.bMax);
  const safeB = useReactorStore((s) => s.sim.physics.magnetSafeB);

  const features = unlockedFeatures(levelId);
  const ob = onboarding.active;
  const tutStep = tutorialStep(onboarding);
  const lockAll = !!tutStep?.lock; // frozen tutorial steps lock all but the star

  // The floating column shows one section at a time on every screen size
  const controlsVis = tabletTab === 'controls' ? '' : 'hidden';
  const diagVis = tabletTab === 'diagnostics' ? '' : 'hidden';

  return (
    <div className="flex-1 overflow-y-auto p-2.5 grid gap-2.5 content-start min-h-0">
      <HazardBanner />
      <CampaignMap />
      <ObjectiveBanner />

      <div className={`${diagVis} grid gap-2.5`}>
        {features.has('neutrons') && <BigMetrics features={features} />}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {features.has('density') ? (
            <Gauge label="Core Temp" value={T} max={40} unit="keV" display={T.toFixed(1)} zones={[0.99, 0.995]} cite="ipb98" />
          ) : (
            <Gauge label="Core Temp" value={T} max={40} unit="million °C" display={(T * 11.6).toFixed(0)} zones={[0.99, 0.995]} cite="ipb98" />
          )}
          {features.has('fulldash') && (
            <Gauge label="Confinement τE" value={tauE} max={3} unit="s" display={tauE.toFixed(2)} zones={[0.99, 0.995]} cite="ipb98" />
          )}
          {features.has('density') && (
            <Gauge
              label={features.has('fulldash') ? 'Beta Limit' : 'Pressure Limit'}
              value={betaLimit > 0 ? beta / betaLimit : 0} max={1.2}
              unit={features.has('fulldash') ? 'β/βmax' : '% of max'}
              display={`${((beta / betaLimit) * 100).toFixed(0)}%`} zones={[0.7, 0.92]} cite="troyon"
            />
          )}
          {features.has('fulldash') && (
            <Gauge label="Divertor" value={divT} max={Math.max(divLimit * 1.3, 1)} unit="°C" display={divT.toFixed(0)} zones={[divLimit / (divLimit * 1.3) * 0.85, divLimit / (divLimit * 1.3)]} cite="divertor_iter" />
          )}
        </div>
        {features.has('vacuum') && <VacuumPanel />}
        {features.has('neutrons') && <NeutronPanel />}
        {features.has('neutrons') && <StructurePanel />}
        {features.has('fulldash') && <EngineeringPanel />}
        {features.has('fulldash') && <AsBuiltPanel />}
        <TelemetryPanel features={features} />
        {features.has('finance') && <Finance />}
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
              format={(v) => v.toFixed(2)} cite="greenwald"
              disabled={lockAll}
            />
          )}
          {features.has('fuelmix') && (
            <ControlSlider
              controlKey="fuelMix" label="Tritium Fraction (D-T mix)" unit="" min={0.05} max={0.95} step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}% T`} cite="tbr"
              disabled={lockAll}
            />
          )}
          {features.has('fulldash') && (
            <ControlSlider
              controlKey="cooling" label="Divertor Active Cooling" unit="MW" min={0} max={100} step={1}
              format={(v) => v.toFixed(0)} cite="divertor_iter"
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
