import { View } from 'react-native';
import { prefilledFlatRate, rateError } from '../../lib/settings/validate';
import { NumberField } from '../NumberField';
import { Button, Section, T } from '../ui';

/** The unit rate for a standard or fixed tariff, pre-filled from the region's standard rate. */
export function FlatRateSection({
  flatOverride,
  apiFlatRate,
  onChange,
}: {
  flatOverride: number | null;
  apiFlatRate: number | null;
  onChange: (rate: number | null) => void;
}) {
  const value = flatOverride ?? prefilledFlatRate(apiFlatRate);
  const error = flatOverride == null ? null : rateError(flatOverride);
  return (
    <Section title="Your unit rate">
      <View style={{ gap: 8 }}>
        <NumberField label="Your unit rate (from your bill)" suffix="p/kWh" value={value} onChange={onChange} />
        {error ? (
          <View accessibilityLiveRegion="polite">
            <T variant="footnote" color="bad">
              {error}
            </T>
          </View>
        ) : null}
        {apiFlatRate ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <T variant="footnote" color="textSecondary" style={{ flex: 1 }}>
              We&apos;ve filled in the typical standard rate for your region ({apiFlatRate.toFixed(1)}p).
            </T>
            {flatOverride != null ? (
              <Button title="Reset" variant="plain" onPress={() => onChange(null)} accessibilityHint="Goes back to the typical standard rate" />
            ) : null}
          </View>
        ) : null}
      </View>
    </Section>
  );
}
