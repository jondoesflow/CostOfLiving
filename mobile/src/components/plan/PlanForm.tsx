import { StyleSheet, View } from 'react-native';
import {
  DEFAULT_LIMIT,
  LIMITS,
  SAFETY_NOTE,
  applianceName,
  hoursFor,
  minsFor,
  type Figures,
  type LimitValue,
} from '../../lib/plan/view';
import { useTheme } from '../../theme';
import { ApplianceGrid } from '../ApplianceGrid';
import { Icon } from '../Icon';
import { NumberField } from '../NumberField';
import { SegmentedControl } from '../SegmentedControl';
import { Section, T } from '../ui';
import { FinishByPicker } from './FinishByPicker';

export interface PlanFormProps {
  chosen: string[];
  onToggle: (id: string) => void;
  figures: Record<string, Figures | undefined>;
  onFigure: (id: string, key: keyof Figures, value: number | null) => void;
  limit: LimitValue;
  onLimit: (v: LimitValue) => void;
  finishOptions: number[];
  finishBy: number | null;
  onFinishBy: (t: number | null) => void;
}

/** Step 2 of the website: what needs doing, the figures for each, and the two options. */
export function PlanForm({ chosen, onToggle, figures, onFigure, limit, onLimit, finishOptions, finishBy, onFinishBy }: PlanFormProps) {
  const { colors } = useTheme();
  const limitLabel = LIMITS.find((l) => l.value === limit)?.label ?? LIMITS.find((l) => l.value === DEFAULT_LIMIT)!.label;
  return (
    <>
      <Section title="What needs doing?">
        <T variant="subhead" color="textSecondary" style={{ marginBottom: 12 }}>
          Pick everything you want to run. You can change the figures for each one.
        </T>
        <ApplianceGrid selected={chosen} onPick={onToggle} multi includeCustom={false} />
      </Section>

      {chosen.length > 0 ? (
        <Section title="Your figures">
          <View style={{ gap: 16 }}>
            {chosen.map((id) => {
              const f = figures[id];
              return (
                <View key={id} accessibilityLabel={applianceName(id)}>
                  <T variant="headline" accessibilityRole="header" style={{ marginBottom: 6 }}>
                    {applianceName(id)}
                  </T>
                  <View style={styles.pair}>
                    <NumberField label="Electricity used" suffix="kWh" value={f?.kWh ?? null} onChange={(v) => onFigure(id, 'kWh', v)} />
                    <NumberField label="Run time" suffix="hours" value={hoursFor(f?.mins ?? null)} onChange={(v) => onFigure(id, 'mins', minsFor(v))} />
                  </View>
                </View>
              );
            })}
          </View>
        </Section>
      ) : null}

      {chosen.length > 0 ? (
        <Section title="Options" footer={
          <View style={styles.note}>
            <Icon name="info" size={16} color={colors.textSecondary} />
            <T variant="footnote" color="textSecondary" style={{ flex: 1 }}>
              {SAFETY_NOTE}
            </T>
          </View>
        }>
          <T variant="subhead" color="textSecondary" style={{ marginBottom: 8 }}>
            How many can run at once?
          </T>
          <SegmentedControl
            options={LIMITS.map((l) => ({ value: l.value, label: l.short }))}
            value={limit}
            onChange={onLimit}
            accessibilityLabel="How many can run at once?"
          />
          <View accessibilityLiveRegion="polite" style={{ marginTop: 6, marginBottom: 12 }}>
            <T variant="footnote" color="textSecondary">
              {limitLabel}
            </T>
          </View>
          <FinishByPicker options={finishOptions} value={finishBy} onChange={onFinishBy} />
        </Section>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 12 },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
