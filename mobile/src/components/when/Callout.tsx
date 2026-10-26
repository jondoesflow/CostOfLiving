import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, type Palette } from '../../theme';
import { Icon, type IconName } from '../Icon';
import { T } from '../ui';

/** A bordered box with an icon, a bold title and body text, like the website's result side notes. */
export function Callout({
  icon,
  iconColor = 'tint',
  title,
  children,
  tone = 'outline',
  accessibilityRole,
}: {
  icon?: IconName;
  iconColor?: keyof Palette;
  title?: string;
  children?: ReactNode;
  /** outline: bordered; fill: filled surface; warn: warning container. */
  tone?: 'outline' | 'fill' | 'warn';
  accessibilityRole?: 'alert' | 'summary';
}) {
  const { colors, radius } = useTheme();
  const bg = tone === 'warn' ? colors.warnContainer : tone === 'fill' ? colors.fill : 'transparent';
  return (
    <View
      accessibilityRole={accessibilityRole}
      style={[
        styles.box,
        { borderRadius: radius, backgroundColor: bg, borderColor: tone === 'warn' ? colors.warn : colors.separator, borderWidth: tone === 'fill' ? 0 : 1 },
      ]}
    >
      {icon ? (
        <View style={styles.icon}>
          <Icon name={icon} size={22} color={colors[iconColor]} />
        </View>
      ) : null}
      <View style={styles.body}>
        {title ? (
          <T variant="headline" accessibilityRole="header">
            {title}
          </T>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 12, padding: 14, marginTop: 16 },
  icon: { paddingTop: 2 },
  body: { flex: 1, gap: 4 },
});
