import { useReactorStore } from '../../store/reactorStore.js';
import { fmtMoney, fmtNet } from '../../utils/units.js';
import Cite from '../common/Cite.jsx';
import CalcDrawer from '../common/CalcDrawer.jsx';

export default function Finance() {
  const econ = useReactorStore((s) => s.econ);
  const netMW = useReactorStore((s) => s.sim.physics.netElecMW);
  const homes = useReactorStore((s) => s.sim.physics.homesPowered);
  const mode = useReactorStore((s) => s.mode);

  const tone = (v) => (v == null ? 'text-ink/55'
    : v <= 100 ? 'text-safe' : v <= 300 ? 'text-warn' : 'text-crit');
  const missionTone = tone(econ.missionLcoe);
  const lcoeClass = tone(econ.lcoe);

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
        {/* Two LCOEs, two jobs. Mission LCOE counts from the current mission's
            start and is what mission 8 gates on; lifetime LCOE is the plant's
            books since construction, where early mistakes rightly linger. */}
        <div className="flex justify-between text-[11px] pt-1 mt-1 border-t border-raise">
          <span
            className="text-ink/70 flex items-center gap-1"
            title="Cost per MWh counted from the start of the current mission. Mission targets use this number."
          >
            Mission LCOE
            <span className="text-[8px] text-ink/55 italic">(this mission)</span>
            <Cite id="lcoe_lazard" />
          </span>
          <span className={`font-mono font-bold ${missionTone}`}>
            {econ.missionLcoe == null ? 'no exports yet' : `$${econ.missionLcoe.toFixed(0)}/MWh`}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span
            className="text-ink/70 flex items-center gap-1"
            title="Cost per MWh over the plant's whole life, construction included. Repairs and early mistakes stay on these books."
          >
            Lifetime LCOE
            <span className="text-[8px] text-ink/55 italic">(whole campaign)</span>
          </span>
          <span className={`font-mono ${lcoeClass}`}>
            {econ.lcoe === null ? 'no exports yet' : `$${econ.lcoe.toFixed(0)}/MWh`}
          </span>
        </div>
        {/* Only the fusion campaign has a mission gated on this number; the
            PWR ledger showing the same sentence would announce a target no
            fission mission actually has. */}
        {mode === 'fusion' && (
          <p className="text-[9px] text-ink/55 leading-snug mt-1">Target: mission LCOE ≤ $100/MWh. Cheaper than gas.</p>
        )}
        <CalcDrawer calc={{
          meaning: econ.lcoe === null
            ? 'Dollars spent divided by electricity sold. Nothing sold yet, so no average exists. Mission LCOE counts from the current mission; lifetime LCOE counts from construction.'
            : `Dollars spent divided by electricity sold. This mission: $${econ.missionLcoe == null ? '--' : econ.missionLcoe.toFixed(0)}/MWh. Lifetime: $${econ.lcoe.toFixed(0)}/MWh.`,
          drivers: 'Selling more power spreads the costs thinner. Repairs and outages push it back up. The lifetime number never forgets an early mistake; the mission number starts clean each mission.',
          equation: 'LCOE = (construction + operations + repairs) / electricity sold, over the chosen window',
          steps: [
            ['Amortized construction (lifetime)', fmtMoney(econ.capitalCum)],
            ['Operations and repairs (lifetime)', fmtMoney(econ.opexCum)],
            ['Electricity sold (lifetime)', `${econ.mwhCum.toFixed(0)} MWh`],
            ['Lifetime average', econ.lcoe === null ? 'n/a' : `$${econ.lcoe.toFixed(0)}/MWh`],
            ['This mission’s average', econ.missionLcoe == null ? 'n/a' : `$${econ.missionLcoe.toFixed(0)}/MWh`],
          ],
          assumptions: 'Deterministic costs, no financing interest or discounting yet; capital amortizes at $19k per plant-hour and accrues in both windows.',
          cite: 'lcoe_lazard',
        }} />
      </div>
    </div>
  );
}
