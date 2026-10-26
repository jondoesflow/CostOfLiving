import { StyleSheet, View } from 'react-native';
import { money } from '../../lib/shared';
import type { Comparison } from '../../lib/compare/comparisons';
import { comparisonRows, type ComparisonRow } from '../../lib/compare/view';
import { useTheme } from '../../theme';
import { Section, T } from '../ui';
import { Note } from './Note';

/** One job (boil water, cook dinner...) with its options ranked cheapest first. */
export function ComparisonCard({ comparison, elecRate, gasPrice }: { comparison: Comparison; elecRate: number; gasPrice: number }) {
  const rows = comparisonRows(comparison, elecRate, gasPrice);
  return (
    <Section title={comparison.title}>
      <View style={styles.list} accessibilityRole="list">
        {rows.map((r) => (
          <BarRow key={r.name} row={r} />
        ))}
      </View>
      <Note style={{ marginTop: 16 }}>{comparison.note}</Note>
    </Section>
  );
}

function BarRow({ row }: { row: ComparisonRow }) {
  const { colors } = useTheme();
  const cost = money(row.cost);
  return (
    <View
      accessible
      accessibilityLabel={`${row.cheapest ? 'Cheapest: ' : ''}${row.name} (${row.fuelLabel}), ${cost}`}
      style={styles.item}
    >
      {/* Name and amount wrap onto separate lines at large text sizes rather than truncating. */}
      <View style={styles.line}>
        <T variant="subhead" color={row.cheapest ? 'good' : 'text'} style={[styles.name, row.cheapest && styles.bold]}>
          {row.name}{' '}
          <T variant="subhead" color="textSecondary" style={{ fontWeight: '400' }}>
            ({row.fuelLabel})
          </T>
        </T>
        <T variant="subhead" style={[styles.bold, { fontVariant: ['tabular-nums'] }]}>
          {cost}
        </T>
      </View>
      <View style={[styles.track, { backgroundColor: colors.fill }]} importantForAccessibility="no-hide-descendants">
        <View style={[styles.bar, { width: `${row.fraction * 100}%`, backgroundColor: row.cheapest ? colors.good : colors.tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: { gap: 4 },
  line: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 12 },
  name: { flexGrow: 1, flexShrink: 1, flexBasis: 160 },
  bold: { fontWeight: '600' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
});
