import { StyleSheet, Text, View } from 'react-native';
import type { TimelineGeometry } from '../../lib/plan/view';
import { type, useTheme } from '../../theme';

const TICK_WIDTH = 56;

// A simple Gantt-style view of when each appliance runs. Decorative: the list above it carries
// the same information for screen readers, so it is hidden from them like the website's.
export function Timeline({ geometry }: { geometry: TimelineGeometry }) {
  const { colors } = useTheme();
  const pct = (f: number) => `${f * 100}%` as const;
  return (
    <View style={styles.wrap} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={{ gap: 8 }}>
        {geometry.bars.map((b) => (
          <View key={b.id} style={[styles.track, { backgroundColor: colors.fill }]}>
            <View style={[styles.bar, { left: pct(b.left), width: pct(b.width), backgroundColor: colors.good }]} />
            <View style={styles.labelWrap}>
              <Text numberOfLines={1} style={[type.caption, styles.label, { color: colors.text, backgroundColor: colors.card }]}>
                {b.name}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        {geometry.ticks.map((tick) => (
          <View key={tick.t} style={[styles.tick, { left: pct(tick.left) }]}>
            <Text numberOfLines={1} style={[type.caption, { color: colors.textSecondary }]}>
              {tick.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20 },
  track: { height: 28, borderRadius: 6, overflow: 'hidden' },
  bar: { position: 'absolute', top: 0, bottom: 0, borderRadius: 6 },
  labelWrap: { position: 'absolute', top: 0, bottom: 0, left: 8, right: 8, justifyContent: 'center', alignItems: 'flex-start' },
  label: { fontWeight: '600', borderRadius: 4, paddingHorizontal: 4, overflow: 'hidden' },
  axis: { position: 'relative', height: 20, marginTop: 4 },
  tick: { position: 'absolute', width: TICK_WIDTH, marginLeft: -TICK_WIDTH / 2, alignItems: 'center' },
});
