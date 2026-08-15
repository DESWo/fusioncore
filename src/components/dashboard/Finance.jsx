import { useReactorStore } from '../../store/reactorStore.js';
import { fmtMoney, fmtNet } from '../../utils/units.js';
import Cite from '../common/Cite.jsx';
import CalcDrawer from '../common/CalcDrawer.jsx';

export default function Finance() {
  const econ = useReactorStore((s) => s.econ);
  const netMW = useReactorStore((s) => s.sim.physics.netElecMW);
  const homes = useReactorStore((s) => s.sim.physics.homesPowered);

  const lcoeClass = econ.lcoe === null ? 'text-ink/55'
    : econ.lcoe <= 100 ? 'text-safe' : econ.lcoe <= 300 ? 'text-warn' : 'text-crit';

  const rows = [
    ['Grid spot price', `$${econ.price.toFixed(2)}/MWh`, 'lcoe_lazard'],
    // Same quantity as the Net to Grid tile, so it must read the same: this
    // said "-80.6 MWe" beside the tile's "-81 MW" for the identical number.
    ['Net to grid', fmtNet(netMW), 'recirc'],
    ['Homes powered', homes.toLocaleString(), null],
    ['Operating margin', `${fmtMoney(econ.incomeRate)}/h`, null],
    ['Cumulative export', `${econ.mwhCum.toFixed(0)} MWh`, null],
    ['Lifetime revenue', fmtMoney(econ.revenueCum), null],
    ['Lifetime opex', fmtMoney(econ.opexCum), null],
  ];

  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-2">Financial Ledger</div>
      <div className="grid gap-1">
        {rows.map(([k, v, cite]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-ink/70 flex items-center gap-1">{k} {cite && <Cite id={cite} />}</span>
            <span className="font-mono">{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-[11px] pt-1 mt-1 border-t border-raise">
          <span className="text-ink/70 flex items-center gap-1">
            Average electricity cost
            <span className="text-[8px] text-ink/55 italic">(LCOE)</span>
            <Cite id="lcoe_lazard" />
          </span>
          <span className={`font-mono font-bold ${lcoeClass}`}>
            {econ.lcoe === null ? 'no exports yet' : `$${econ.lcoe.toFixed(0)}/MWh`}
          </span>
        </div>
        <p className="text-[9px] text-ink/55 leading-snug mt-1">Target: ≤ $100/MWh. Cheaper than gas.</p>
        <CalcDrawer calc={{
          meaning: econ.lcoe === null
            ? 'Every dollar ever spent, divided by every unit of electricity ever sold. Nothing sold yet, so no average exists.'
            : `Every dollar ever spent, divided by every unit sold: $${econ.lcoe.toFixed(0)} per MWh so far.`,
          drivers: 'Selling more power spreads the costs thinner. Repairs and outages push it back up. Early mistakes haunt it forever.',
          equation: 'LCOE = (construction + operations + repairs) / electricity sold',
          steps: [
            ['Amortized construction', fmtMoney(econ.capitalCum)],
            ['Operations and repairs', fmtMoney(econ.opexCum)],
            ['Electricity sold', `${econ.mwhCum.toFixed(0)} MWh`],
            ['Average cost', econ.lcoe === null ? 'n/a' : `$${econ.lcoe.toFixed(0)}/MWh`],
          ],
          assumptions: 'Deterministic costs, no financing interest or discounting yet; capital amortizes at $19k per plant-hour.',
          cite: 'lcoe_lazard',
        }} />
      </div>
    </div>
  );
}
