import { useState } from 'react';
import { COMPARISONS } from '../../lib/compare/comparisons';
import { electricOptions, pickElectricOption, resolveRate, type ElectricChoice } from '../../lib/compare/view';
import { useElectricity } from '../../lib/electricity';
import { gasRate } from '../../lib/shared';
import { useRequest } from '../../lib/useRequest';
import { PricesStatus } from '../PricesStatus';
import { Screen } from '../ui';
import { ComparisonCard } from './ComparisonCard';
import { PricesSection } from './PricesSection';

/** The "Gas or electric?" tool: a port of the website's src/tools/GasOrElectric.jsx. */
export function GasOrElectric() {
  const { slots, region, refRate, ready } = useElectricity();
  const [gasOverride, setGasOverride] = useState<number | null>(null);
  const [elecChoice, setElecChoice] = useState<ElectricChoice>('now');
  const [elecOverride, setElecOverride] = useState<number | null>(null);

  // The typical standard gas rate for the region, to pre-fill the gas price.
  const gas = useRequest(() => gasRate(region), [region], { auto: !!region });
  const fetchedGas = region && !gas.loading && !gas.error && gas.data ? gas.data.unitRate : null;

  const options = electricOptions(slots, refRate, ready);
  const picked = pickElectricOption(options, elecChoice);
  const elecRate = resolveRate(elecOverride, picked?.rate);
  const gasPrice = resolveRate(gasOverride, fetchedGas);

  return (
    <Screen>
      <PricesStatus waiting />
      {ready ? (
        <PricesSection
          electricOptions={options}
          picked={picked}
          elecOverride={elecOverride}
          onPickElectric={(id) => {
            setElecChoice(id);
            setElecOverride(null);
          }}
          onElecOverride={setElecOverride}
          gasValue={gasOverride ?? (fetchedGas != null ? Number(fetchedGas.toFixed(2)) : null)}
          onGasOverride={setGasOverride}
          fetchedGas={fetchedGas}
          hasRegion={!!region}
        />
      ) : null}
      {ready && elecRate != null && gasPrice != null
        ? COMPARISONS.map((c) => <ComparisonCard key={c.id} comparison={c} elecRate={elecRate} gasPrice={gasPrice} />)
        : null}
    </Screen>
  );
}
