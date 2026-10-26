import { Pressable, StyleSheet, View } from 'react-native';
import { isIOS, useTheme } from '../../theme';
import { Icon } from '../Icon';
import { T } from '../ui';

/**
 * One option in a single-choice list: a list row with a tick on the chosen one.
 * Announced as a radio button, like the website's Choice.
 */
export function ChoiceRow({
  title,
  subtitle,
  checked,
  onPress,
  first,
}: {
  title: string;
  subtitle?: string;
  checked: boolean;
  onPress: () => void;
  first?: boolean;
}) {
  const { colors, minTouch } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked, selected: checked }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      android_ripple={{ color: colors.separator }}
      style={({ pressed }) => (isIOS && pressed ? { backgroundColor: colors.fill } : null)}
    >
      <View style={[styles.row, { minHeight: minTouch }]}>
        <View style={[styles.main, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }]}>
          <View style={{ flex: 1, paddingVertical: 11 }}>
            <T style={checked ? { fontWeight: '600' } : undefined}>{title}</T>
            {subtitle ? (
              <T variant="subhead" color="textSecondary" style={{ marginTop: 2 }}>
                {subtitle}
              </T>
            ) : null}
          </View>
          {/* Keep the width so titles don't shift when the tick moves. */}
          <View style={{ width: 20, alignItems: 'flex-end' }}>{checked ? <Icon name="check" size={18} color={colors.tint} /> : null}</View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 16, gap: 8 },
});
