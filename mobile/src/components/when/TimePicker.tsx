import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { whenLabel } from '../../lib/shared';
import { isIOS, useTheme } from '../../theme';
import { Icon } from '../Icon';
import { Button, Row, T } from '../ui';

/**
 * A row showing the chosen time that opens a full-screen list to pick another. Stands in for the
 * website's <select> of hourly times.
 */
export function TimePicker({
  label,
  noneLabel,
  value,
  options,
  onChange,
  first,
}: {
  label: string;
  /** The wording for "no time chosen", e.g. "Any time" or "Not set". */
  noneLabel: string;
  value: number | null;
  options: number[];
  onChange: (t: number | null) => void;
  first?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const current = value == null ? noneLabel : whenLabel(value);
  const choose = (t: number | null) => {
    onChange(t);
    setOpen(false);
  };
  return (
    <>
      <Row
        title={label}
        trailing={
          <T color="textSecondary" numberOfLines={2} style={{ textAlign: 'right' }}>
            {current}
          </T>
        }
        onPress={() => setOpen(true)}
        first={first}
        accessibilityLabel={`${label}: ${current}`}
        accessibilityHint="Opens a list of times"
      />
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingTop: isIOS ? 16 : insets.top + 8 }]}>
          <View style={styles.header}>
            <T variant="title3" accessibilityRole="header" style={{ flex: 1 }}>
              {label}
            </T>
            <Button title="Done" variant="plain" onPress={() => setOpen(false)} accessibilityHint="Closes the list without changing the time" />
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            <View style={[styles.list, { backgroundColor: colors.card, borderRadius: 12 }]}>
              <Option label={noneLabel} selected={value == null} onPress={() => choose(null)} first />
              {options.map((t) => (
                <Option key={t} label={whenLabel(t)} selected={value === t} onPress={() => choose(t)} />
              ))}
            </View>
            {options.length === 0 ? (
              <T variant="footnote" color="textSecondary" style={{ margin: 16 }}>
                We don&apos;t have prices far enough ahead for this run yet.
              </T>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function Option({ label, selected, onPress, first }: { label: string; selected: boolean; onPress: () => void; first?: boolean }) {
  const { colors } = useTheme();
  return (
    <Row
      title={label}
      onPress={onPress}
      first={first}
      chevron={false}
      trailing={selected ? <Icon name="check" size={18} color={colors.tint} accessibilityLabel="Selected" /> : undefined}
      accessibilityLabel={selected ? `${label}, selected` : label}
    />
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  list: { marginHorizontal: 16, marginTop: 8, overflow: 'hidden' },
});
