import type React from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { isIOS, type, useTheme, type Palette } from '../theme';
import { Icon, type IconName } from './Icon';

// Platform-adaptive building blocks.
// iOS follows the Human Interface Guidelines (inset grouped lists, large titles, tinted buttons,
// chevrons on navigable rows). Android follows Material 3 (surface cards, filled/tonal buttons,
// outlined text fields, filter chips, ripples). Both honour dark mode and the system text size.

/* ------------------------------------------------------------------ Screen */

export function Screen({
  children,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
  ...rest
}: ScrollViewProps & { onRefresh?: () => void; refreshing?: boolean }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      // Lets the iOS large title collapse and content scroll under translucent bars.
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={isIOS ? 'interactive' : 'on-drag'}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[{ paddingBottom: 32, paddingTop: isIOS ? 0 : 8 }, contentContainerStyle]}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} colors={[colors.tint]} /> : undefined
      }
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ Text */

export function T({
  children,
  variant = 'body',
  color,
  style,
  ...rest
}: {
  children: ReactNode;
  variant?: keyof typeof type;
  color?: keyof Palette;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'header' | 'text' | 'summary';
  selectable?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text style={[type[variant], { color: colors[color ?? 'text'] }, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ Sections */

/** A titled group. iOS: inset grouped section. Android: Material card with a title. */
export function Section({
  title,
  footer,
  children,
  style,
  flush = false,
}: {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Content supplies its own padding (e.g. a list of Rows). */
  flush?: boolean;
}) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <T
          variant="sectionHeader"
          color={isIOS ? 'textSecondary' : 'tint'}
          accessibilityRole="header"
          style={styles.sectionTitle}
        >
          {title}
        </T>
      ) : null}
      <View
        style={[
          { backgroundColor: colors.card, borderRadius: radius, overflow: 'hidden' },
          !flush && styles.sectionBody,
          !isIOS && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator },
        ]}
      >
        {children}
      </View>
      {footer ? (
        typeof footer === 'string' ? (
          <T variant="footnote" color="textSecondary" style={styles.sectionFooter}>
            {footer}
          </T>
        ) : (
          <View style={styles.sectionFooter}>{footer}</View>
        )
      ) : null}
    </View>
  );
}

/** A tappable or static list row with optional leading icon, subtitle and trailing content. */
export function Row({
  title,
  subtitle,
  detail,
  leading,
  trailing,
  onPress,
  chevron,
  first,
  accessibilityLabel,
  accessibilityHint,
  titleLines = 2,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small text under the subtitle. */
  detail?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Show the iOS disclosure chevron. Defaults to true on iOS when onPress is set. */
  chevron?: boolean;
  /** No top separator (first row in a section). */
  first?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  titleLines?: number;
}) {
  const { colors, minTouch } = useTheme();
  const showChevron = chevron ?? (isIOS && !!onPress);
  const content = (
    <View style={[styles.row, { minHeight: minTouch }]}>
      {leading ? <View style={styles.rowLeading}>{leading}</View> : null}
      <View
        style={[
          styles.rowMain,
          !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
        ]}
      >
        <View style={{ flex: 1, paddingVertical: 11 }}>
          {typeof title === 'string' ? (
            <T numberOfLines={titleLines}>{title}</T>
          ) : (
            title
          )}
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <T variant="subhead" color="textSecondary" numberOfLines={2} style={{ marginTop: 2 }}>
                {subtitle}
              </T>
            ) : (
              subtitle
            )
          ) : null}
          {detail ? (
            typeof detail === 'string' ? (
              <T variant="footnote" color="textSecondary" style={{ marginTop: 2 }}>
                {detail}
              </T>
            ) : (
              detail
            )
          ) : null}
        </View>
        {trailing ? <View style={styles.rowTrailing}>{trailing}</View> : null}
        {showChevron ? <Icon name="chevron" size={14} color={colors.textTertiary} /> : null}
      </View>
    </View>
  );
  if (!onPress) {
    return (
      <View accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: colors.separator }}
      style={({ pressed }) => (isIOS && pressed ? { backgroundColor: colors.fill } : null)}
    >
      {content}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Buttons */

type ButtonVariant = 'filled' | 'tonal' | 'plain';

/**
 * iOS: large rounded "filled"/"tinted" button or a plain text button.
 * Android: Material 3 filled / filled-tonal / text button (full pill radius, 40dp tall, 48dp touch).
 */
export function Button({
  title,
  onPress,
  variant = 'filled',
  icon,
  disabled,
  loading,
  accessibilityHint,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, minTouch } = useTheme();
  const bg = variant === 'filled' ? colors.tint : variant === 'tonal' ? colors.tintContainer : 'transparent';
  const fg = variant === 'filled' ? colors.onTint : variant === 'tonal' ? colors.onTintContainer : colors.tint;
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: colors.separator, foreground: true }}
      style={({ pressed }) => [
        {
          minHeight: minTouch,
          borderRadius: isIOS ? 12 : 24,
          backgroundColor: bg,
          opacity: inactive ? 0.5 : isIOS && pressed ? 0.7 : 1,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: variant === 'plain' ? 8 : 20,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={[isIOS ? type.headline : { fontSize: 14, fontWeight: '500', letterSpacing: 0.1 }, { color: fg }]}>
        {title}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Inputs */

/**
 * iOS: label above a rounded filled field. Android: Material 3 outlined text field with the label
 * above (kept static rather than floating, so it stays readable at large text sizes).
 */
export function TextField({ label, error, hint, style, ref, ...rest }: React.ComponentProps<typeof TextInput> & { label: string; error?: string | null; hint?: string }) {
  const { colors, minTouch } = useTheme();
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <T variant={isIOS ? 'footnote' : 'subhead'} color={error ? 'bad' : 'textSecondary'} style={isIOS ? { textTransform: 'uppercase' } : null}>
        {label}
      </T>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        style={[
          type.body,
          {
            minHeight: minTouch,
            color: colors.text,
            paddingHorizontal: 12,
            paddingVertical: isIOS ? 10 : 8,
            borderRadius: isIOS ? 10 : 4,
          },
          isIOS
            ? { backgroundColor: colors.fill }
            : { borderWidth: error ? 2 : 1, borderColor: error ? colors.bad : colors.textTertiary },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <T variant="footnote" color="bad" accessibilityRole="text">
          {error}
        </T>
      ) : hint ? (
        <T variant="footnote" color="textSecondary">
          {hint}
        </T>
      ) : null}
    </View>
  );
}

/** A toggleable filter chip (Material 3 filter chip / iOS capsule). */
export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      android_ripple={{ color: colors.separator, foreground: true }}
      hitSlop={{ top: 6, bottom: 6 }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 32,
        paddingHorizontal: 14,
        borderRadius: isIOS ? 16 : 8,
        overflow: 'hidden',
        backgroundColor: selected ? (isIOS ? colors.tint : colors.tintContainer) : isIOS ? colors.fill : 'transparent',
        borderWidth: isIOS || selected ? 0 : 1,
        borderColor: colors.textTertiary,
        opacity: isIOS && pressed ? 0.7 : 1,
      })}
    >
      {selected && !isIOS ? <Icon name="check" size={16} color={colors.onTintContainer} /> : icon ? <Icon name={icon} size={14} color={selected ? colors.onTint : colors.textSecondary} /> : null}
      <Text
        style={[
          type.subhead,
          { fontWeight: '500', color: selected ? (isIOS ? colors.onTint : colors.onTintContainer) : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {children}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ Data display */

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'good' | 'bad' | 'warn' | 'neutral' | 'tint' }) {
  const { colors } = useTheme();
  const map = {
    good: [colors.goodContainer, colors.good],
    bad: [colors.badContainer, colors.bad],
    warn: [colors.warnContainer, colors.warn],
    tint: [colors.tintContainer, colors.onTintContainer],
    neutral: [colors.fill, colors.textSecondary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text style={[type.caption, { color: fg, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

/** A grid of label/value tiles (2 per row on phones). */
export function StatGrid({ items }: { items: { label: string; value: string; tone?: 'good' | 'bad'; accessibilityLabel?: string }[] }) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.statGrid}>
      {items.map((s) => (
        <View
          key={s.label}
          accessible
          accessibilityLabel={s.accessibilityLabel ?? `${s.label}: ${s.value}`}
          style={[styles.statTile, { backgroundColor: colors.card, borderRadius: radius }, !isIOS && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator }]}
        >
          <T variant="footnote" color="textSecondary">
            {s.label}
          </T>
          <T variant="title3" color={s.tone ?? 'text'} style={{ fontVariant: ['tabular-nums'], marginTop: 2 }}>
            {s.value}
          </T>
        </View>
      ))}
    </View>
  );
}

/** Bold price with tabular figures; coloured green/red when a tone is given. */
export function Price({ pence, tone, size = 'headline' }: { pence: string; tone?: 'good' | 'bad'; size?: keyof typeof type }) {
  return (
    <T variant={size} color={tone ?? 'text'} style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }}>
      {pence}
    </T>
  );
}

/* ------------------------------------------------------------------ States */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.tint} size="large" />
      <T variant="subhead" color="textSecondary" style={{ marginTop: 12, textAlign: 'center' }}>
        {label}
      </T>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.state} accessibilityLiveRegion="assertive">
      <Icon name="warning" size={32} color={colors.bad} />
      <T variant="body" style={{ marginTop: 12, textAlign: 'center' }} accessibilityRole="text">
        {message}
      </T>
      {onRetry ? <Button title="Try again" variant="tonal" onPress={onRetry} style={{ marginTop: 16, minWidth: 160 }} /> : null}
    </View>
  );
}

export function EmptyState({ icon = 'info', title, message, action }: { icon?: IconName; title: string; message?: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.state}>
      <Icon name={icon} size={36} color={colors.textTertiary} />
      <T variant="headline" style={{ marginTop: 12, textAlign: 'center' }}>
        {title}
      </T>
      {message ? (
        <T variant="subhead" color="textSecondary" style={{ marginTop: 6, textAlign: 'center' }}>
          {message}
        </T>
      ) : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

/** Small print under a screen (sources, caveats). */
export function Footnote({ children }: { children: ReactNode }) {
  return (
    <T variant="footnote" color="textSecondary" style={{ marginHorizontal: 20, marginTop: 8 }}>
      {children}
    </T>
  );
}

export const layout = {
  /** Horizontal inset used by sections (iOS inset grouped: 16/20; Material: 16). */
  inset: 16,
  gap: Platform.select({ ios: 8, default: 12 }),
};

const styles = StyleSheet.create({
  section: { marginHorizontal: layout.inset, marginTop: isIOS ? 20 : 16 },
  sectionTitle: { marginHorizontal: isIOS ? 16 : 4, marginBottom: 6 },
  sectionBody: { padding: 16 },
  sectionFooter: { marginHorizontal: isIOS ? 16 : 4, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
  rowLeading: { marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 16, gap: 8 },
  rowTrailing: { alignItems: 'flex-end', justifyContent: 'center', maxWidth: '45%' },
  chipRow: { gap: 8, paddingHorizontal: layout.inset, paddingVertical: 4 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: layout.inset, marginTop: 12 },
  statTile: { flexGrow: 1, flexBasis: '45%', padding: 12 },
  state: { alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 220 },
});
