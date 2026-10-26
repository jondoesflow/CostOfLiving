import { useState } from 'react';
import { View } from 'react-native';
import { normaliseTime, rateError, timeError } from '../../lib/settings/validate';
import type { E7 } from '../../lib/shared';
import { NumberField } from '../NumberField';
import { Section, T, TextField } from '../ui';

/** A 24-hour "HH:MM" field. The value is only passed up once it's a real time of day. */
function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (time: string) => void }) {
  const [text, setText] = useState(value);
  const error = timeError(text);
  return (
    <TextField
      label={label}
      value={text}
      onChangeText={(t) => {
        setText(t);
        const time = normaliseTime(t);
        if (time) onChange(time);
      }}
      onBlur={() => {
        const time = normaliseTime(text);
        if (time && time !== text) setText(time);
      }}
      error={error}
      keyboardType="numbers-and-punctuation"
      autoCorrect={false}
      placeholder="00:30"
      maxLength={5}
    />
  );
}

/** Cheap hours and rates for Economy 7 or any other off-peak tariff. Mirrors the website's TariffStep. */
export function Economy7Section({ e7, onChange }: { e7: E7; onChange: (e7: E7) => void }) {
  // Rates stay as the last good number while a field is empty, so the rest of the app keeps working.
  const [dayRate, setDayRate] = useState<number | null>(e7.dayRate);
  const [nightRate, setNightRate] = useState<number | null>(e7.nightRate);
  const dayError = rateError(dayRate);
  const nightError = rateError(nightRate);
  return (
    <Section title="Your cheap hours" footer="Cheap hours vary by tariff and by meter. Check your bill or app and change these to match yours.">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TimeField label="Cheap rate starts" value={e7.nightStart} onChange={(nightStart) => onChange({ ...e7, nightStart })} />
          <TimeField label="Cheap rate ends" value={e7.nightEnd} onChange={(nightEnd) => onChange({ ...e7, nightEnd })} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <NumberField
            label="Normal rate"
            suffix="p/kWh"
            value={dayRate}
            onChange={(v) => {
              setDayRate(v);
              if (!rateError(v)) onChange({ ...e7, dayRate: v as number });
            }}
          />
          <NumberField
            label="Cheap rate"
            suffix="p/kWh"
            value={nightRate}
            onChange={(v) => {
              setNightRate(v);
              if (!rateError(v)) onChange({ ...e7, nightRate: v as number });
            }}
          />
        </View>
        {dayError || nightError ? (
          <View accessibilityLiveRegion="polite">
            <T variant="footnote" color="bad">
              {dayError ? `Normal rate: ${dayError}` : `Cheap rate: ${nightError}`}
            </T>
          </View>
        ) : null}
      </View>
    </Section>
  );
}
