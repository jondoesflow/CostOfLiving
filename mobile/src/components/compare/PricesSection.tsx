import { StyleSheet, View } from 'react-native';
import type { ElectricChoice, ElectricOption } from '../../lib/compare/view';
import { NumberField } from '../NumberField';
import { Chip, Section, T } from '../ui';
import { Note } from './Note';

/** "Your prices": which electricity price to compare with, and the gas unit rate. */
export function PricesSection({
  electricOptions,
  picked,
  elecOverride,
  onPickElectric,
  onElecOverride,
  gasValue,
  onGasOverride,
  fetchedGas,
  hasRegion,
}: {
  electricOptions: ElectricOption[];
  picked: ElectricOption | undefined;
  elecOverride: number | null;
  onPickElectric: (id: ElectricChoice) => void;
  onElecOverride: (value: number | null) => void;
  /** What the gas field shows: the user's own figure or the fetched one. */
  gasValue: number | null;
  onGasOverride: (value: number | null) => void;
  fetchedGas: number | null;
  hasRegion: boolean;
}) {
  const gasHint =
    fetchedGas != null
      ? `Filled in with the typical standard gas rate for your region (${fetchedGas.toFixed(1)}p). Your bill shows your own.`
      : `Enter the gas unit rate from your bill${hasRegion ? '' : ', or choose your region in My tariff to fill in a typical rate'}.`;
  return (
    <Section title="Your prices">
      <View style={styles.stack}>
        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Electricity price to use">
          <T variant="subhead" color="textSecondary">
            Electricity price to use
          </T>
          <View style={styles.chips}>
            {electricOptions.map((o) => (
              <Chip
                role="radio"
                key={o.id}
                label={`${o.label} ${o.rate.toFixed(1)}p`}
                selected={elecOverride == null && picked?.id === o.id}
                onPress={() => onPickElectric(o.id)}
              />
            ))}
          </View>
          <NumberField label="Or type your own" value={elecOverride} onChange={onElecOverride} suffix="p/kWh" />
        </View>
        <NumberField label="Gas price" value={gasValue} onChange={onGasOverride} suffix="p/kWh" hint={gasHint} />
        <Note>
          Standing charges are the same whatever you use, so they&apos;re left out. Gas is usually cheaper per unit, but electric appliances often waste less, so the answer depends on the job.
        </Note>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  group: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 6 },
});
