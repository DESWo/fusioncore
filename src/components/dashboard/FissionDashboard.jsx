import { useState } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';
import {
  fissionPlantOf, plantStateOf, fuelOrderCost, enrichExcessFactor,
  FUEL_ORDER_TICKS, FUEL_RELOAD_TICKS,
} from '../../engine/fission.js';
import { tutorialStep } from '../../engine/tutorials.js';
import { VESSEL_MATERIALS, vesselDesignPreview } from '../../engine/structural.js';
import CalcDrawer from '../common/CalcDrawer.jsx';
import { fmtPower, fmtMoney } from '../../utils/format.js';
import { CampaignMap, ObjectiveBanner, TelemetryPanel } from './Dashboard.jsx';
import HazardBanner from './HazardBanner.jsx';
import ScenarioPanel from './ScenarioPanel.jsx';
import DutiesPanel from './DutiesPanel.jsx';
import EngineeringPanel from './EngineeringPanel.jsx';
import AsBuiltPanel from './AsBuiltPanel.jsx';
import Gauge from './Gauge.jsx';
import ControlSlider from './ControlSlider.jsx';
import Finance from './Finance.jsx';
import Cite from '../common/Cite.jsx';

function ReactivityPanel() {
  const p = useReactorStore((s) => s.sim.physics);
  const rows = [
    ['Fresh fuel pushes up', p.excessPcm],
    ['Control rods hold down', p.rhoRods],
    ['Hot fuel pushes down', p.rhoDoppler],
    ['Hot coolant pushes down', p.rhoCoolant],
    ['Xenon poison pushes down', p.rhoXenon],
  ];
  const rho = p.reactivityPcm;
  const trend = rho > 100 ? 'RISING FAST' : rho > 10 ? 'rising' : rho > -10 ? 'steady' : rho > -400 ? 'falling' : 'falling fast';
  const rhoColor = rho > 400 ? 'text-crit' : rho > 100 ? 'text-warn' : rho > -100 ? 'text-safe' : 'text-ink/70';
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-0.5 flex items-center gap-1">
        Reaction Balance <Cite id="point_kinetics" />
      </div>
      <div className="text-[8px] text-ink/55 italic mb-1">technical: reactivity, in pcm</div>
      <div className="grid gap-0.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[10px]">
            <span className="text-ink/70">{k}</span>
            <span className={`font-mono ${v >= 0 ? 'text-safe' : 'text-ink/85'}`}>
              {v >= 0 ? '+' : ''}{v.toFixed(0)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-[11px] pt-1 mt-0.5 border-t border-raise">
          <span className="text-ink/85 font-semibold">Power trend: {trend}</span>
          <span className={`font-mono font-bold ${rhoColor}`}>{rho >= 0 ? '+' : ''}{rho.toFixed(0)} pcm</span>
        </div>
        <CalcDrawer calc={{
          meaning: `Everything that speeds up or slows down the chain reaction, summed. Right now the balance is ${rho >= 0 ? '+' : ''}${rho.toFixed(0)} pcm: power is ${trend}.`,
          drivers: 'Withdrawing rods adds. Hot fuel, hot coolant, and xenon all subtract. Zero means steady power.',
          equation: 'ρ = ρ_fuel + ρ_rods + ρ_Doppler + ρ_coolant + ρ_xenon',
          steps: rows.map(([k, v]) => [k, `${v >= 0 ? '+' : ''}${v.toFixed(0)} pcm`]).concat([
            ['Net reactivity', `${rho >= 0 ? '+' : ''}${rho.toFixed(0)} pcm`],
            ['Prompt-critical threshold', '+650 pcm'],
          ]),
          assumptions: 'Point kinetics with one effective delayed-neutron group; 1 pcm = 0.001% deviation from perfect balance.',
          cite: 'point_kinetics',
        }} />
      </div>
    </div>
  );
}

/** The user's engineering tradeoff: wall thickness and material vs cost. */
function VesselDesignPanel() {
  const design = useReactorStore((s) => s.sim.design) ?? { vesselT: 0.22, material: 'sa508' };
  const critical = useReactorStore((s) => s.sim.physics.critical);
  const funds = useReactorStore((s) => s.econ.funds);
  const apply = useReactorStore((s) => s.applyVesselDesign);
  const [t, setT] = useState(design.vesselT);
  const [mat, setMat] = useState(design.material);
  const prev = vesselDesignPreview(design, t, mat);
  const changed = Math.abs(t - design.vesselT) > 0.0001 || mat !== design.material;
  const canApply = changed && !critical && funds >= prev.refitCost;
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70">Vessel Design</div>
      <div className="text-[8px] text-ink/55 italic mb-1.5">
        change the wall, watch stress, weight, and cost move together
      </div>
      <div className="flex items-baseline justify-between text-[10px]">
        <label htmlFor="vessel-t" className="text-ink/70">Wall thickness</label>
        <span className="font-mono text-accent">{(t * 100).toFixed(0)} cm</span>
      </div>
      <input
        id="vessel-t" type="range" min={0.16} max={0.30} step={0.01} value={t}
        onChange={(e) => setT(parseFloat(e.target.value))} className="w-full mt-1"
        aria-label={`Vessel wall thickness ${(t * 100).toFixed(0)} centimeters`}
      />
      <div className="flex items-center justify-between mt-2 text-[10px]">
        <label htmlFor="vessel-mat" className="text-ink/70">Steel grade</label>
        <select
          id="vessel-mat" value={mat} onChange={(e) => setMat(e.target.value)}
          className="bg-base border border-raise-hi rounded text-[10px] p-1"
        >
          {Object.entries(VESSEL_MATERIALS).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-[10px]">
        <div className="flex justify-between"><span className="text-ink/70">Wall stress</span><span className="font-mono">{prev.stress.toFixed(0)} MPa</span></div>
        <div className="flex justify-between"><span className="text-ink/70">Allowable</span><span className="font-mono">{prev.allowMPa} MPa</span></div>
        <div className="flex justify-between">
          <span className="text-ink/70">Safety factor</span>
          <span className={`font-mono font-bold ${prev.fos >= 1.2 ? 'text-safe' : prev.fos >= 1.0 ? 'text-warn' : 'text-crit'}`}>{prev.fos.toFixed(2)}</span>
        </div>
        <div className="flex justify-between"><span className="text-ink/70">Vessel mass</span><span className="font-mono">{prev.massT.toFixed(0)} t</span></div>
      </div>
      <button
        onClick={() => apply(t, mat, prev.refitCost)}
        disabled={!canApply}
        title={critical ? 'SCRAM first' : !changed ? 'No change selected' : funds < prev.refitCost ? 'Insufficient funds' : ''}
        className={`mt-2 w-full py-1.5 rounded text-[10px] font-bold ${
          canApply ? 'bg-accent text-base hover:brightness-110' : 'bg-raise text-ink/55 cursor-not-allowed'
        }`}
      >
        {changed ? `APPLY REFIT ${fmtMoney(prev.refitCost)}` : 'CURRENT DESIGN'}
      </button>
      {prev.fos < 1.0 && (
        <p className="text-[9px] text-crit mt-1">Safety factor below 1.0: the wall would be over its allowable stress.</p>
      )}
      <CalcDrawer calc={{
        meaning: `At ${(t * 100).toFixed(0)} cm and ${VESSEL_MATERIALS[mat].label}, the wall carries ${prev.stress.toFixed(0)} MPa against ${prev.allowMPa} MPa allowable (safety factor ${prev.fos.toFixed(2)}).`,
        drivers: 'Thicker walls cut stress but add tonnes of steel and refit cost. Cheaper steel saves money but allows less stress.',
        equation: 'σ_hoop = P·r/t      FoS = σ_allowable/σ_hoop      m = ρ·2πr·t·h',
        steps: [
          ['Pressure P', '15.5 MPa'],
          ['Radius r', '2.2 m'],
          ['Thickness t', `${t.toFixed(2)} m`],
          ['Hoop stress', `${prev.stress.toFixed(0)} MPa`],
          ['Factor of safety', prev.fos.toFixed(2)],
          ['Mass', `${prev.massT.toFixed(0)} tonnes`],
          ['Refit cost', fmtMoney(prev.refitCost)],
        ],
        assumptions: 'Thin-wall hoop stress; refit cost is mobilization plus steel mass. Refits require shutdown.',
        cite: 'asme',
      }} />
    </div>
  );
}

/**
 * Plant operations: the switchgear between "a core" and "a power plant".
 * Heaters earn hot standby; the generator breaker earns revenue.
 */
function PlantOpsPanel({ plant }) {
  const sim = useReactorStore((s) => s.sim);
  const p = sim.physics;
  const c = sim.controls;
  const setControl = useReactorStore((s) => s.setControl);
  const tutStep = tutorialStep(useReactorStore((s) => s.onboarding));
  const state = plantStateOf(sim);
  const canSync = p.P >= plant.nominalMW * 0.08;
  const stateColor = state === 'ON LINE' ? 'text-safe'
    : state === 'CRITICAL' || state === 'HOT STANDBY' ? 'text-accent'
    : state === 'TRIPPED' || state === 'TRIPPED / HOT' ? 'text-crit'
    : 'text-ink/85';
  return (
    <div className="bg-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink/70">Plant Operations</span>
        <span className={`label-mono text-[10px] ${stateColor}`}>[ {state} ]</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {plant.heatupPlant && (
          <button
            onClick={() => setControl('heaters', !c.heaters)}
            className={`py-2 text-[10px] font-bold border ${
              c.heaters ? 'border-warn/70 bg-warn/10 text-warn' : 'border-raise-hi text-ink/85 hover:bg-raise'
            } ${tutStep?.highlight === 'heaters' ? 'ui-highlight' : ''}`}
            title="Pressurizer and heatup heaters. With the pumps, they warm the primary toward hot standby"
          >
            HEATERS {c.heaters ? 'ON' : 'OFF'}
          </button>
        )}
        {plant.gridConnected && (
        <button
          onClick={() => setControl('genOnline', !c.genOnline)}
          disabled={!c.genOnline && !canSync}
          className={`py-2 text-[10px] font-bold border ${
            c.genOnline
              ? 'border-safe/70 bg-safe/10 text-safe'
              : canSync
                ? 'border-accent/70 bg-accent/10 text-accent hover:bg-accent/20'
                : 'border-raise text-ink/55 cursor-not-allowed'
          }`}
          title={c.genOnline ? 'Open the breaker (stop selling)' : canSync ? 'Close the generator breaker and sell to the grid' : `Needs ~${(plant.nominalMW * 0.08).toFixed(0)} MW of steam first`}
        >
          {c.genOnline ? 'GENERATOR ON LINE' : 'SYNC GENERATOR'}
        </button>
        )}
      </div>
      {plant.heatupPlant && p.TcoolC < plant.critInterlockC && !p.critical && (
        <p className="text-[9px] text-ink/55 mt-1.5">
          Primary at {p.TcoolC.toFixed(0)} °C. Rod interlock releases at {plant.critInterlockC} °C:
          a cold core is a MORE reactive core, so criticality waits for temperature.
        </p>
      )}
    </div>
  );
}

/** The uranium you have to buy: enrichment choice, vendor chain, reload outage. */
function FuelCyclePanel({ plant }) {
  const sim = useReactorStore((s) => s.sim);
  const funds = useReactorStore((s) => s.econ.funds);
  const orderFuel = useReactorStore((s) => s.orderFuel);
  const reloadCore = useReactorStore((s) => s.reloadCore);
  const [enrich, setEnrich] = useState(plant.enrichment?.ref ?? 4.0);
  const fc = sim.fuelCycle ?? {};
  const core = sim.fuelCore ?? { enrichPct: 4.0 };
  const p = sim.physics;
  const cost = fuelOrderCost(enrich);
  const excessF = enrichExcessFactor(enrich, plant);
  const canOrder = !fc.order && funds >= cost.total * 1.06;
  const canReload = !!fc.onSite && !p.critical && !(fc.reloadTicksLeft > 0);
  const rows = [
    ['Uranium + conversion', `$${((cost.uranium + cost.conversion) / 1e6).toFixed(0)}M`],
    ['Enrichment (SWU)', `$${(cost.swu / 1e6).toFixed(1)}M`],
    ['Fabrication + logistics', `$${((cost.fabrication + cost.logistics) / 1e6).toFixed(0)}M`],
  ];
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 flex items-center gap-1">
        Fuel Cycle <Cite id="pwr" />
      </div>
      <div className="text-[8px] text-ink/55 italic mb-1.5">
        loaded core: {core.enrichPct.toFixed(2)}% U-235 · burnup {(p.burnup * 100).toFixed(1)}%
      </div>

      <div className="flex items-baseline justify-between text-[10px]">
        <label htmlFor="fuel-enrich" className="text-ink/70">Order enrichment</label>
        <span className="font-mono text-accent">{enrich.toFixed(2)}% U-235</span>
      </div>
      <input
        id="fuel-enrich" type="range"
        min={plant.enrichment?.min ?? 3} max={plant.enrichment?.max ?? 4.95} step={0.05}
        value={enrich} onChange={(e) => setEnrich(parseFloat(e.target.value))}
        className="w-full mt-1"
        aria-label={`Fuel enrichment ${enrich.toFixed(2)} percent`}
      />
      <div className="grid gap-0.5 mt-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[10px]">
            <span className="text-ink/70">{k}</span>
            <span className="font-mono text-ink">{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-[10px] pt-1 border-t border-raise">
          <span className="text-ink/85 font-semibold">Batch total (±market)</span>
          <span className="font-mono font-bold text-ink">${(cost.total / 1e6).toFixed(0)}M</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-ink/55">Excess reactivity vs standard core</span>
          <span className={`font-mono ${excessF >= 1 ? 'text-safe' : 'text-warn'}`}>×{excessF.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => orderFuel(enrich)}
        disabled={!canOrder}
        title={fc.order ? 'Order already in fabrication' : funds < cost.total * 1.06 ? 'Insufficient funds' : `Delivery in ${(FUEL_ORDER_TICKS / 600).toFixed(0)} sim-hours`}
        className={`mt-2 w-full py-1.5 rounded text-[10px] font-bold ${
          canOrder ? 'bg-accent text-base hover:brightness-110' : 'bg-raise text-ink/55 cursor-not-allowed'
        }`}
      >
        {fc.order ? `IN FABRICATION: ${(fc.order.ticksLeft / 600).toFixed(1)} h` : `ORDER FUEL ~$${(cost.total / 1e6).toFixed(0)}M`}
      </button>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-raise">
        <span className="text-[10px] text-ink/70">
          {fc.reloadTicksLeft > 0
            ? `Reload outage: ${(fc.reloadTicksLeft / 600).toFixed(1)} h remaining`
            : fc.onSite
              ? `On site: ${fc.onSite.enrichPct.toFixed(2)}% batch`
              : 'No fresh fuel on site'}
        </span>
        <button
          onClick={reloadCore}
          disabled={!canReload}
          title={p.critical ? 'SCRAM first' : !fc.onSite ? 'Order fuel first' : `${(FUEL_RELOAD_TICKS / 600).toFixed(0)} h outage`}
          className={`text-[9px] font-mono px-2 py-1 rounded ${
            canReload ? 'bg-warn text-base font-bold hover:brightness-110' : 'bg-raise text-ink/55 cursor-not-allowed'
          }`}
        >
          RELOAD CORE
        </button>
      </div>
      {fc.reloadTicksLeft > 0 && (
        <div className="h-1 bg-raise rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full bg-warn rounded-full"
            style={{ width: `${(1 - fc.reloadTicksLeft / FUEL_RELOAD_TICKS) * 100}%`, transition: 'width 0.3s' }}
          />
        </div>
      )}
      <CalcDrawer calc={{
        meaning: `A reload batch at ${enrich.toFixed(2)}% enrichment starts the core with ×${excessF.toFixed(2)} the standard excess reactivity and lasts about ${(excessF * 100).toFixed(0)}% as long.`,
        drivers: 'Higher enrichment costs more separative work but buys a longer cycle. The 4.95% ceiling is the LEU license limit. Watch the shutdown margin: a hotter core leaves the rods less to hold down.',
        equation: 'batch = yellowcake + conversion + SWU(e²) + fabrication',
        steps: [
          ['Enrichment target', `${enrich.toFixed(2)}% U-235`],
          ['Chain total', `$${(cost.total / 1e6).toFixed(0)}M before market swing`],
          ['Fabrication lead time', `${(FUEL_ORDER_TICKS / 600).toFixed(0)} sim-hours`],
          ['Reload outage', `${(FUEL_RELOAD_TICKS / 600).toFixed(0)} sim-hours, rods pinned in`],
        ],
        assumptions: 'One-batch reload economics, compressed timelines; real utilities reload a third of the core every 18 months on multi-year contracts.',
        cite: 'pwr',
      }} />
    </div>
  );
}

/** Engineering readouts a real control room would log. */
function PlantDataPanel({ plant }) {
  const p = useReactorStore((s) => s.sim.physics);
  const BETA = 650, LAMBDA = 0.08;
  const rho = p.reactivityPcm;
  const period = rho > 5 ? (BETA - Math.min(rho, 640)) / (LAMBDA * rho)
    : rho < -5 ? -(BETA - rho) / (LAMBDA * rho)
    : null;
  const keff = 1 / (1 - rho / 1e5);
  const rows = [
    ['k-effective', keff.toFixed(5)],
    ['Reactor period', period === null ? 'steady' : `${rho < 0 ? '−' : ''}${Math.abs(period).toFixed(0)} s`],
    ['Neutron flux', `${(p.fluxFrac * 100).toFixed(1)}% nominal`],
    ['Core ΔT (fuel−coolant)', `${(p.TfuelC - p.TcoolC).toFixed(0)} °C`],
    ['Rod position (actual)', `${(p.rodPos ?? 100).toFixed(1)}% in`],
    ['Capacity factor (run avg)', `${((p.avgP / plant.nominalMW) * 100).toFixed(1)}%`],
    ['Xenon worth', `−${p.xenonPcm.toFixed(0)} pcm`],
    ['Core burnup', `${(p.burnup * 100).toFixed(2)}%`],
  ];
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-1 flex items-center gap-1">
        Plant Data <Cite id="point_kinetics" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[10px]">
            <span className="text-ink/70">{k}</span>
            <span className="font-mono text-ink">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The setpoint (target insertion) and the physical rod position are two
 * different numbers: the rods drive toward the target at a finite speed, so
 * they lag behind whatever you just dragged to. This draws both on one
 * track (accent handle = target, ink triangle = actual) and spells out the
 * direction in words, since "100% insertion" reads backwards to anyone who
 * has not been told it means shut down.
 */
function RodSetpointControl({ highlight }) {
  const target = useReactorStore((s) => s.sim.controls.rods);
  const rodPos = useReactorStore((s) => s.sim.physics.rodPos);
  const setControl = useReactorStore((s) => s.setControl);
  const min = 0, max = 100;
  const actual = rodPos ?? target;
  const actualPct = Math.min(100, Math.max(0, ((actual - min) / (max - min)) * 100));
  // Matches the global range-thumb width (src/index.css, 18px) so the marker
  // lines up with where the setpoint handle itself sits at that value.
  const THUMB_PX = 18;
  const markerLeft = `calc(${THUMB_PX / 2}px + (100% - ${THUMB_PX}px) * ${(actualPct / 100).toFixed(4)})`;
  const traveling = Math.abs(actual - target) > 0.3;
  const triangle = {
    width: 0, height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '5px solid var(--color-ink)',
  };

  return (
    <div className={`px-3 py-2 bg-panel ${highlight ? 'ui-highlight' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor="ctl-rods" className="text-[10px] uppercase tracking-wider text-ink/70 flex items-center gap-1">
          Control Rods <Cite id="point_kinetics" />
        </label>
        <span className="font-mono text-xs font-bold text-accent">
          target {target.toFixed(1)}% IN
        </span>
      </div>
      <div className="relative mt-3">
        <div
          className="absolute -top-2 pointer-events-none"
          style={{ left: markerLeft, transform: 'translateX(-50%)', ...triangle }}
          title={`Actual rod position: ${actual.toFixed(1)}% in`}
        />
        <input
          id="ctl-rods"
          type="range"
          className="w-full"
          min={min} max={max} step={0.5} value={target}
          aria-label={`Control rods target insertion, ${target.toFixed(1)} percent. Zero is fully withdrawn, full power. One hundred is fully inserted, shut down.`}
          onChange={(e) => setControl('rods', parseFloat(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-[8px] text-ink/55 font-mono">
        <span>0% OUT &middot; FULL POWER</span>
        <span>100% IN &middot; SHUT DOWN</span>
      </div>
      <p className="text-[9px] text-ink/55 px-1 mt-1">
        Rods travel at drive speed.{' '}
        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 3, ...triangle }} />
        Marker shows actual position: <span className="font-mono text-ink/85">{actual.toFixed(1)}% in</span>
        {traveling ? ', still traveling' : ', settled'}
      </p>
    </div>
  );
}

function FissionStructurePanel({ plant }) {
  const st = useReactorStore((s) => s.sim.structure);
  const p = useReactorStore((s) => s.sim.physics);
  const funds = useReactorStore((s) => s.econ.funds);
  const repair = useReactorStore((s) => s.repairComponent);
  const scram = useReactorStore((s) => s.scramReactor);
  const refuel = useReactorStore((s) => s.refuelReactor);
  const loads = {
    cladding: Math.min(p.TfuelC / plant.fuelTempLimitC, 1.2),
    vessel: Math.min(p.fluxFrac, 1),
    steamGen: Math.min(p.TcoolC / plant.coolantLimitC, 1.2),
  };
  const bars = [
    ['cladding', plant.componentLabels.cladding, st.cladding, 'decay_heat'],
    ['vessel', plant.componentLabels.vessel, st.vessel, 'pwr'],
    ['steamGen', plant.componentLabels.steamGen, st.steamGen, 'pwr'],
  ];
  return (
    <div className="bg-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-ink/70">Structural Health &amp; Maintenance</span>
        {p.critical ? (
          <button
            onClick={scram}
            className="text-[9px] font-bold px-2 py-1 rounded bg-crit text-white hover:brightness-110"
            title="Insert all rods immediately"
          >
            SCRAM
          </button>
        ) : (
          <span className="text-[9px] font-mono text-safe">SHUTDOWN: MAINTENANCE OK</span>
        )}
      </div>
      <div className="grid gap-1.5">
        {bars.map(([key, label, v, cite]) => {
          const color = v > 60 ? 'var(--color-safe)' : v > 30 ? 'var(--color-warn)' : 'var(--color-crit)';
          const load = loads[key];
          const loadColor = load > 0.95 ? 'text-crit' : load > 0.8 ? 'text-warn' : 'text-ink/55';
          const worn = v < 99.95;
          const cost = ((100 - v) / 100) * plant.serviceCosts[key];
          const canService = worn && !p.critical && funds >= cost;
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-ink/70 flex items-center gap-1">
                  {label} <Cite id={cite} />
                  <span className={`font-mono text-[9px] ${loadColor}`}>load {(load * 100).toFixed(0)}%</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono" style={{ color }}>{v.toFixed(1)}%</span>
                  {worn && (
                    <button
                      onClick={() => repair(key)}
                      disabled={!canService}
                      title={p.critical ? 'SCRAM first' : funds < cost ? 'Insufficient funds' : `Restore for ${fmtMoney(cost)}`}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        canService ? 'bg-accent text-base font-bold hover:brightness-110' : 'bg-raise text-ink/55 cursor-not-allowed'
                      }`}
                    >
                      SERVICE {fmtMoney(cost)}
                    </button>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-raise rounded-full overflow-hidden mt-0.5">
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-raise">
        <span className="text-[10px] text-ink/70">
          Core burnup: <span className="font-mono text-ink">{(p.burnup * 100).toFixed(1)}%</span>
        </span>
        {plant.simpleRefuel ? (
          <button
            onClick={refuel}
            disabled={p.critical}
            title={p.critical ? 'SCRAM first' : `Fresh plates: ${fmtMoney(plant.refuelCost)}`}
            className={`text-[9px] font-mono px-2 py-1 rounded ${
              !p.critical ? 'bg-warn text-base font-bold hover:brightness-110' : 'bg-raise text-ink/55 cursor-not-allowed'
            }`}
          >
            REFUEL {fmtMoney(plant.refuelCost)}
          </button>
        ) : (
          <span className="text-[9px] text-ink/55">reloads run through the Fuel Cycle panel</span>
        )}
      </div>
    </div>
  );
}

export default function FissionDashboard({ tabletTab }) {
  const p = useReactorStore((s) => s.sim.physics);
  const sim = useReactorStore((s) => s.sim);
  const tutStep = tutorialStep(useReactorStore((s) => s.onboarding));
  const plant = fissionPlantOf(sim);
  const research = plant.key === 'research';
  // The floating column shows one section at a time on every screen size
  const controlsVis = tabletTab === 'controls' ? '' : 'hidden';
  const diagVis = tabletTab === 'diagnostics' ? '' : 'hidden';

  // Same reason as the fusion dashboard: an auto grid track is sized by its
  // widest child, which pushed the rod slider wider than the column it lives
  // in. See the note there.
  return (
    <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-[minmax(0,1fr)] gap-2.5 content-start min-h-0">
      <HazardBanner />
      <CampaignMap />
      <ObjectiveBanner />

      <div className={`${diagVis} grid gap-2.5`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-panel p-3 col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-ink/70">Thermal Power</div>
            <div className="font-mono text-2xl font-black text-accent">{fmtPower(p.P + p.decayMW)}</div>
            <div className="text-[8px] text-ink/55">
              fission {fmtPower(p.P)} · decay {fmtPower(p.decayMW)}
            </div>
          </div>
          <Gauge label="Fuel Temp" value={p.TfuelC} max={plant.fuelTempLimitC * 1.27} unit="°C" display={p.TfuelC.toFixed(0)} zones={[0.68, 0.79]} cite="decay_heat" />
          <Gauge label={research ? 'Pool Temp' : 'Coolant'} value={p.TcoolC} max={plant.coolantLimitC * 1.16} unit="°C" display={p.TcoolC.toFixed(0)} zones={[0.79, 0.86]} cite="pwr" />
          <Gauge label="Restart Poison (xenon)" value={p.xenonPcm} max={plant.xenonEqPcm * 2.22} unit="pcm" display={p.xenonPcm.toFixed(0)} zones={[0.5, 0.8]} cite="xenon" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {plant.gridConnected ? (
            <div className="bg-panel p-3 flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-ink/70">Net to Grid</div>
              <div className={`font-mono text-lg font-bold ${p.netElecMW >= 0 ? 'text-safe' : 'text-crit'}`}>
                {p.netElecMW >= 0 ? '+' : ''}{fmtPower(p.netElecMW)}
              </div>
              <div className="text-[8px] text-ink/55">{p.homesPowered.toLocaleString()} homes</div>
              <CalcDrawer calc={{
                meaning: `The plant makes ${fmtPower(p.grossElecMW)} of electricity and spends ${fmtPower(p.recircMW)} running itself. The grid gets the difference.`,
                drivers: 'More reactor power raises the gross. Pumps and house loads eat a nearly fixed bite.',
                equation: 'P_electric = P_thermal · η_cycle − P_internal',
                steps: [
                  ['Thermal power', fmtPower(p.P + p.decayMW)],
                  ['Steam-cycle efficiency η', '33%'],
                  ['Gross electric', fmtPower(p.grossElecMW)],
                  ['Plant internal use', fmtPower(p.recircMW)],
                  ['Net to grid', fmtPower(p.netElecMW)],
                ],
                limitedBy: [
                  'Steam cycle: ~67% of the thermal power is rejected at the condenser (thermodynamics, not a defect)',
                  `Reactor coolant pumps: ${(p.recircMW - 25).toFixed(0)} MW to move the primary loop`,
                  'House loads: 25 MW baseline to run the site',
                ],
                assumptions: 'Fixed cycle efficiency, adjusted by your as-built turbine; real plants also vary with condenser temperature and load.',
                cite: 'pwr',
              }} />
            </div>
          ) : (
            <div className="bg-panel p-3 flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-ink/70">License Headroom</div>
              <div className={`font-mono text-lg font-bold ${p.P <= plant.nominalMW ? 'text-safe' : 'text-warn'}`}>
                {((p.P / plant.nominalMW) * 100).toFixed(1)}%
              </div>
              <div className="text-[8px] text-ink/55">of the {plant.nominalMW} MW license</div>
              <CalcDrawer calc={{
                meaning: `This reactor is licensed for ${plant.nominalMW} MW thermal. It sells no electricity; the product is neutrons for research and training hours for operators.`,
                drivers: 'Rod position sets power. The protection system trips the reactor at 118% of license, no exceptions.',
                equation: 'headroom = P / P_license',
                steps: [
                  ['Reactor power', fmtPower(p.P)],
                  ['License limit', `${plant.nominalMW} MW`],
                  ['Automatic trip', `${(plant.nominalMW * 1.18).toFixed(1)} MW`],
                ],
                assumptions: 'Research reactor licenses cap steady-state thermal power; the RPS setpoint sits above it to allow transient wiggle.',
                cite: 'pwr',
              }} />
            </div>
          )}
          <ReactivityPanel />
        </div>
        <PlantDataPanel plant={plant} />
        {!research && <EngineeringPanel />}
        <AsBuiltPanel />
        <FissionStructurePanel plant={plant} />
        <TelemetryPanel />
        {plant.gridConnected && <Finance />}
      </div>

      <div className={`${controlsVis} grid gap-2.5`}>
        <DutiesPanel />
        {(plant.heatupPlant || plant.gridConnected) && <PlantOpsPanel plant={plant} />}
        <div className="grid gap-2">
          <RodSetpointControl highlight={tutStep?.highlight === 'rods'} />
          <ControlSlider
            controlKey="pumps" label="Coolant Pumps (flow)" unit="%" min={10} max={100} step={1}
            format={(v) => v.toFixed(0)} cite="decay_heat"
          />
        </div>
        <p className="text-[9px] text-ink/55 px-1">
          Reactor status: {p.critical ? `critical at ${((p.P / plant.nominalMW) * 100).toFixed(1)}% power` : p.scrammed ? 'tripped, rods in' : plantStateOf(sim).toLowerCase()}
          {p.xenonPcm > plant.xenonEqPcm * 1.18 && !p.critical ? ' · xenon pit in effect' : ''}
          {p.rodsLocked ? ' · rod interlock engaged' : ''}
        </p>
        {!plant.simpleRefuel && <FuelCyclePanel plant={plant} />}
        {plant.vesselDesign && <VesselDesignPanel />}
        <ScenarioPanel />
      </div>
    </div>
  );
}
