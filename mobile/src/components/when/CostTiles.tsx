import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';
import { T } from '../ui';

interface Tile { label: string; value: string; note?: string }

/** "Cost then" against "If you start it now", side by side. */
export function CostTiles({ then, now }: { then: Tile; now: Tile }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.grid}>
      <View accessible accessibilityLabel={`${then.label}: ${then.value}${then.note ? `. ${then.note}` : ''}`} style={[styles.tile, { backgroundColor: colors.goodContainer, borderRadius: radius }]}>
        <T variant="footnote" color="textSecondary">
          {then.label}
        </T>
        <T variant="title2" color="good" style={styles.value}>
          {then.value}
        </T>
        {then.note ? (
          <T variant="footnote" color="good">
            {then.note}
          </T>
        ) : null}
      </View>
      <View accessible accessibilityLabel={`${now.label}: ${now.value}`} style={[styles.tile, { backgroundColor: colors.fill, borderRadius: radius }]}>
        <T variant="footnote" color="textSecondary">
          {now.label}
        </T>
        <T variant="title2" color="textSecondary" style={styles.value}>
          {now.value}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  tile: { flexGrow: 1, flexBasis: '45%', padding: 12, gap: 2 },
  value: { fontWeight: '700', fontVariant: ['tabular-nums'] },
});
