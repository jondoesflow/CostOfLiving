import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type, useTheme } from '../theme';
import { Icon } from './Icon';

export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

// Android/web: Material 3 segmented buttons (outlined, pill-shaped, check mark on the selected segment).
// iOS uses the native control in SegmentedControl.ios.tsx.
export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  // Material 3 drops the check mark when space is tight, so labels don't truncate with 4+ segments.
  const showCheck = options.length <= 3;
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.row, { borderColor: colors.textTertiary }]}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            android_ripple={{ color: colors.tintContainer }}
            style={[
              styles.segment,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.textTertiary },
              selected && { backgroundColor: colors.tintContainer },
            ]}
          >
            {selected && showCheck && <Icon name="check" size={16} color={colors.onTintContainer} />}
            <Text
              numberOfLines={1}
              style={[type.subhead, { fontWeight: '500', color: selected ? colors.onTintContainer : colors.text }]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: 1, borderRadius: 20, overflow: 'hidden', minHeight: 48 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
});
