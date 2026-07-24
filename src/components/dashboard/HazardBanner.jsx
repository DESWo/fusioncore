import { useReactorStore } from '../../store/reactorStore.js';
import Icon from '../common/Icon.jsx';

const HAZARD_INFO = {
  // fusion
  greenwald: { label: 'DENSITY LIMIT', outcome: 'plasma collapse', fix: 'Lower Fuel Density or raise Field' },
  beta: { label: 'PRESSURE LIMIT', outcome: 'plasma collapse', fix: 'Raise Field or cut Heating' },
  divertor: { label: 'DIVERTOR OVERHEATING', outcome: 'erosion starts', fix: 'Add Cooling or cut Heating' },
  magnets: { label: 'MAGNETS OVER RATING', outcome: 'coil quench', fix: 'Lower Field' },
  // fission
  fuelTemp: { label: 'FUEL OVER TEMPERATURE', outcome: 'cladding damage + trip', fix: 'Rods in or Pumps up' },
  coolant: { label: 'COOLANT NEAR BOILING', outcome: 'steam generator damage', fix: 'More Pump flow or Rods in' },
};

/** Live countdown strip: you crossed a limit. Fix it before the timer runs out. */
export default function HazardBanner() {
  const hazards = useReactorStore((s) => s.sim.hazards);
  const entries = Object.entries(hazards ?? {}).filter(([, v]) => v !== 0);
  if (entries.length === 0) return null;
  return (
    <div className="grid gap-1.5">
      {entries.map(([key, v]) => {
        const info = HAZARD_INFO[key];
        if (!info) return null;
        return (
          <div key={key} className="status-crit rounded-md bg-crit/15 px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-crit flex items-center gap-1.5">
              <Icon name="warn" className="w-3.5 h-3.5" />
              {info.label}
              {v === -1 ? ': TAKING DAMAGE' : ` : ${info.outcome} in ${Math.ceil(v / 10)}s`}
            </span>
            <span className="text-[10px] font-semibold text-warn whitespace-nowrap">{info.fix}</span>
          </div>
        );
      })}
    </div>
  );
}
