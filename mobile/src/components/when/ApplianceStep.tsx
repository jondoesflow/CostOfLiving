import { StyleSheet, View } from 'react-native';
import { APPLIANCES, PROFILES } from '../../lib/shared';
import { WAITS, hoursFromMins, minsFromHours, type WaitValue } from '../../lib/when/view';
import { useTheme } from '../../theme';
import { ApplianceGrid } from '../ApplianceGrid';
import { NumberField } from '../NumberField';
import { SegmentedControl } from '../SegmentedControl';
import { Section, T } from '../ui';
import { TimePicker } from './TimePicker';

export interface ApplianceStepProps {
  applianceId: string | null;
  pick: (id: string) => void;
  kWh: number | null;
  setKWh: (v: number | null) => void;
  mins: number | null;
  setMins: (v: number | null) => void;
  finishBy: number | null;
  setFinishBy: (t: number | null) => void;
  finishOptions: number[];
  upAt: number | null;
  setUpAt: (t: number | null) => void;
  wait: number;
  setWait: (mins: number) => void;
}

/** Step 2 on the website: pick an appliance, then its figures, deadline and wake-up time. */
export function ApplianceStep({ applianceId, pick, kWh, setKWh, mins, setMins, finishBy, setFinishBy, finishOptions, upAt, setUpAt, wait, setWait }: ApplianceStepProps) {
  const { colors } = useTheme();
  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  const note = appliance
    ? `Typical figures for ${/^[aeiou]/i.test(appliance.name) ? 'an' : 'a'} ${appliance.name.toLowerCase()} (${appliance.note}). Change them if you know yours.`
    : 'Enter how much electricity it uses and how long it runs. The power rating (in kW) multiplied by the hours gives you the kWh.';
  const profileNote = appliance?.profile ? PROFILES[appliance.profile].note : null;
  const dryer = appliance?.id === 'dryer' || appliance?.id === 'hpdryer';

  return (
    <>
      <Section title="What do you want to run?">
        <ApplianceGrid selected={applianceId} onPick={pick} />
      </Section>

      {applianceId ? (
        <Section title="Your figures">
          <T variant="subhead" color="textSecondary">
            {note}
            {profileNote ? ` ${profileNote}` : ''}
          </T>
          {appliance?.labelHint ? (
            <T variant="subhead" color="textSecondary" style={{ marginTop: 8 }}>
              For your exact model, check its energy label for a figure in kWh per 100 cycles. Divide it by 100 and enter that below: 49kWh per 100 cycles is 0.49kWh a cycle.
              {dryer ? ' Older tumble dryer labels show kWh per year instead, based on 160 cycles, so divide that by 160.' : ''}
            </T>
          ) : null}
          <View style={styles.fields}>
            <NumberField label="Electricity used" value={kWh} onChange={setKWh} suffix="kWh" />
            <NumberField label="Run time" value={hoursFromMins(mins)} onChange={(v) => setMins(minsFromHours(v))} suffix="hours" />
          </View>
          <View style={[styles.rows, { borderTopColor: colors.separator }]}>
            <TimePicker label="Needs to be finished by" noneLabel="Any time" value={finishBy} options={finishOptions} onChange={setFinishBy} first />
          </View>
        </Section>
      ) : null}

      {applianceId && !appliance?.splittable ? (
        <Section
          title="Don't want it sitting in the machine?"
          footer="Tell us when you'll be up, and it'll be ready around then instead of hours before."
          flush
        >
          <TimePicker label="I'll be up at" noneLabel="Not set" value={upAt} options={finishOptions} onChange={setUpAt} first />
          {upAt ? (
            <View style={[styles.wait, { borderTopColor: colors.separator }]}>
              <T variant="subhead" color="textSecondary" style={{ marginBottom: 8 }}>
                It can wait up to
              </T>
              <SegmentedControl<WaitValue>
                options={[...WAITS]}
                value={String(wait) as WaitValue}
                onChange={(v) => setWait(Number(v))}
                accessibilityLabel="It can wait up to"
              />
            </View>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  fields: { flexDirection: 'row', gap: 12, marginTop: 12 },
  rows: { marginTop: 12, marginHorizontal: -16, borderTopWidth: StyleSheet.hairlineWidth },
  wait: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
