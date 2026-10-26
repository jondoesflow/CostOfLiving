import { Pressable, StyleSheet, View } from 'react-native';
import { APPLIANCES, APPLIANCE_GROUPS, type Appliance } from '../lib/shared';
import { isIOS, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { T } from './ui';

export const CUSTOM: Appliance = { id: 'custom', group: 'charging', name: 'Something else', icon: 'SlidersHorizontal', kWh: 1, mins: 60, perWeek: 0, note: '' };

function Tile({ a, on, multi, onPick }: { a: Appliance; on: boolean; multi: boolean; onPick: (id: string) => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={() => onPick(a.id)}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: on, selected: on }}
      accessibilityLabel={a.name}
      android_ripple={{ color: colors.separator, foreground: true }}
      style={({ pressed }) => [
        styles.tile,
        {
          borderRadius: radius,
          backgroundColor: on ? colors.tintContainer : colors.card,
          borderColor: on ? colors.tint : colors.separator,
          opacity: isIOS && pressed ? 0.7 : 1,
        },
      ]}
    >
      {multi && on ? (
        <View style={styles.tick}>
          <Icon name="check" size={14} color={colors.onTintContainer} />
        </View>
      ) : null}
      <Icon name={a.icon as IconName} size={26} color={on ? colors.onTintContainer : colors.textSecondary} />
      <T variant="footnote" color={on ? 'onTintContainer' : 'text'} style={{ textAlign: 'center', fontWeight: on ? '600' : '400' }} numberOfLines={2}>
        {a.name}
      </T>
    </Pressable>
  );
}

/**
 * Appliance tiles in groups: pick one (`selected` is an id) or, with `multi`, several
 * (`selected` is a list of ids). Mirrors the website's ApplianceGrid.
 */
export function ApplianceGrid({
  selected,
  onPick,
  multi = false,
  includeCustom = true,
}: {
  selected: string | string[] | null;
  onPick: (id: string) => void;
  multi?: boolean;
  includeCustom?: boolean;
}) {
  const isOn = (id: string) => (Array.isArray(selected) ? selected.includes(id) : selected === id);
  const last = APPLIANCE_GROUPS[APPLIANCE_GROUPS.length - 1].id;
  return (
    <View style={{ gap: 16 }}>
      {APPLIANCE_GROUPS.map((g) => (
        <View key={g.id} accessibilityRole="radiogroup" accessibilityLabel={g.name}>
          <T variant="sectionHeader" color={isIOS ? 'textSecondary' : 'tint'} accessibilityRole="header" style={{ marginBottom: 8 }}>
            {g.name}
          </T>
          <View style={styles.grid}>
            {APPLIANCES.filter((a) => a.group === g.id).map((a) => (
              <Tile key={a.id} a={a} on={isOn(a.id)} multi={multi} onPick={onPick} />
            ))}
            {includeCustom && g.id === last ? <Tile a={CUSTOM} on={isOn(CUSTOM.id)} multi={multi} onPick={onPick} /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31%', flexGrow: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderWidth: 1 },
  tick: { position: 'absolute', top: 6, right: 6 },
});
