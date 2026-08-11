import { useReactorStore } from '../../store/reactorStore.js';
import { TRITIUM_PRICE_G } from '../../engine/constants.js';
import { fmtMoney } from '../../utils/format.js';
import Cite from '../common/Cite.jsx';

export default function FuelPanel({ showBreeding }) {
  const tritium = useReactorStore((s) => s.sim.fuel.tritium);
  const deuterium = useReactorStore((s) => s.sim.fuel.deuterium);
  const tbr = useReactorStore((s) => s.sim.physics.tbr);
  const autoBuy = useReactorStore((s) => s.sim.controls.autoBuyTritium);
  const setControl = useReactorStore((s) => s.setControl);
  const buy = useReactorStore((s) => s.buyTritiumAction);

  const tClass = tritium < 2 ? 'text-crit' : tritium < 8 ? 'text-warn' : 'text-safe';

  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-2 flex items-center gap-1">
        Fuel Inventory <Cite id="tritium_price" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <div className="text-ink/70 text-[9px]">TRITIUM</div>
          <div className={`font-bold ${tClass}`}>{tritium.toFixed(2)} g</div>
        </div>
        <div>
          <div className="text-ink/70 text-[9px]">DEUTERIUM</div>
          <div className="font-bold text-ink">{deuterium.toFixed(2)} g</div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {[1, 10].map((g) => (
          <button
            key={g}
            onClick={() => buy(g)}
            className="flex-1 text-[10px] py-1 rounded bg-raise hover:bg-raise-hi font-mono"
          >
            Buy {g}g ({fmtMoney(g * TRITIUM_PRICE_G)})
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 mt-2 text-[10px] text-ink/85 cursor-pointer">
        <input
          type="checkbox"
          checked={autoBuy}
          onChange={(e) => setControl('autoBuyTritium', e.target.checked)}
          className="accent-accent"
        />
        Auto-purchase when inventory &lt; 2 g
      </label>
      {showBreeding && (
        <div className="mt-2 pt-2 border-t border-raise text-[10px] flex items-center justify-between">
          <span className="text-ink/70 flex items-center gap-1">
            BREEDING RATIO (TBR) <Cite id="tbr" />
          </span>
          <span className={`font-mono font-bold ${tbr > 1 ? 'text-safe' : 'text-ink/55'}`}>
            {tbr.toFixed(2)} {tbr > 1 ? ', self-sufficient' : ', no blanket'}
          </span>
        </div>
      )}
    </div>
  );
}
