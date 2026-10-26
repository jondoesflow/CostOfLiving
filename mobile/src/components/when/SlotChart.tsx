import { StyleSheet, View } from 'react-native';
import { chartBars, chartTicks } from '../../lib/when/view';
import type { Slot } from '../../lib/shared';
import { useTheme } from '../../theme';
import { T } from '../ui';

const HEIGHT = 140;

/**
 * Half-hourly price bars with the chosen window(s) highlighted. Built from Views so it needs no
 * chart library; the bars are decorative and the figure is described in one label.
 */
export function SlotChart({
  slots,
  highlights,
  title,
  legend,
  accessibilityLabel,
  refValue,
  refLabel = 'Standard rate',
}: {
  slots: Slot[];
  highlights: { from: number; count: number }[];
  title: string;
  /** What the highlighted bars mean, e.g. "Your cheapest window". */
  legend: string;
  accessibilityLabel: string;
  refValue?: number | null;
  refLabel?: string;
}) {
  const { colors } = useTheme();
  const bars = chartBars(slots, highlights);
  if (!bars.length) return null;
  const values = bars.map((b) => b.value);
  const max = Math.max(0, ...values, refValue ?? 0);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const yOf = (v: number) => ((v - min) / span) * HEIGHT;
  const zero = yOf(0);
  const ticks = chartTicks(bars);
  const width = 100 / bars.length;

  return (
    <View style={styles.figure} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <T variant="headline">{title}</T>
      <View style={styles.legend}>
        <Swatch color={colors.good} label={legend} />
        <Swatch color={colors.textTertiary} label="Other times" />
        {refValue != null ? <Swatch color={colors.textSecondary} label={refLabel} dashed /> : null}
      </View>
      <View style={styles.plot} importantForAccessibility="no-hide-descendants">
        <View style={styles.axis}>
          <T variant="caption" color="textSecondary" style={styles.tabular}>{`${Math.round(max)}p`}</T>
          {min < 0 ? <T variant="caption" color="textSecondary" style={styles.tabular}>{`${Math.round(min)}p`}</T> : <T variant="caption" color="textSecondary">0p</T>}
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.bars, { height: HEIGHT }]}>
            {bars.map((b) => {
              const h = Math.abs(yOf(b.value) - zero);
              const bottom = b.value >= 0 ? zero : yOf(b.value);
              return (
                <View key={b.start} style={{ width: `${width}%`, height: HEIGHT }}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 0.5,
                      right: 0.5,
                      bottom,
                      height: Math.max(1, h),
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                      backgroundColor: b.highlighted ? colors.good : colors.textTertiary,
                    }}
                  />
                </View>
              );
            })}
            {refValue != null ? (
              <View pointerEvents="none" style={[styles.refLine, { bottom: yOf(refValue), borderColor: colors.textSecondary }]} />
            ) : null}
            <View pointerEvents="none" style={[styles.zero, { bottom: zero, backgroundColor: colors.separator }]} />
          </View>
          <View style={styles.ticks}>
            {ticks.map((t) => (
              <T key={t.index} variant="caption" color="textSecondary" style={{ position: 'absolute', left: `${t.index * width}%` }}>
                {t.label}
              </T>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function Swatch({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={styles.swatch}>
      <View style={dashed ? { width: 14, borderTopWidth: 2, borderStyle: 'dashed', borderColor: color } : { width: 12, height: 12, borderRadius: 3, backgroundColor: color }} />
      <T variant="footnote" color="textSecondary">
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { marginTop: 20, gap: 6 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 },
  swatch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  plot: { flexDirection: 'row', gap: 6, marginTop: 6 },
  axis: { justifyContent: 'space-between', height: HEIGHT, alignItems: 'flex-end', minWidth: 30 },
  tabular: { fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
  refLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  zero: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  ticks: { height: 18, marginTop: 4 },
});
