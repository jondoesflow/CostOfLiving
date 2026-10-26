import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { whenLabel } from '../../lib/shared';
import { isIOS, useTheme } from '../../theme';
import { Icon } from '../Icon';
import { Button, Row, Section } from '../ui';

const ANY_TIME = 'Any time';

/** "Everything finished by": a row that opens a chooser of whole hours, like the website's select. */
export function FinishByPicker({ options, value, onChange }: { options: number[]; value: number | null; onChange: (t: number | null) => void }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = value == null ? ANY_TIME : whenLabel(value);
  const pick = (t: number | null) => {
    onChange(t);
    setOpen(false);
  };
  const tick = <Icon name="check" size={18} color={colors.tint} accessibilityLabel="Selected" />;
  return (
    <>
      <Row
        first
        title="Everything finished by"
        trailing={<Button title={current} variant="plain" onPress={() => setOpen(true)} accessibilityHint="Opens a list of finish times" />}
      />
      <Modal visible={open} animationType="slide" presentationStyle={isIOS ? 'pageSheet' : 'fullScreen'} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            <Section title="Everything finished by" flush>
              <Row first title={ANY_TIME} onPress={() => pick(null)} chevron={false} trailing={value == null ? tick : undefined} accessibilityLabel={ANY_TIME} />
              {options.map((t) => (
                <Row key={t} title={whenLabel(t)} onPress={() => pick(t)} chevron={false} trailing={value === t ? tick : undefined} accessibilityLabel={whenLabel(t)} />
              ))}
            </Section>
            <View style={{ marginHorizontal: 16, marginTop: 20 }}>
              <Button title="Cancel" variant="tonal" onPress={() => setOpen(false)} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
