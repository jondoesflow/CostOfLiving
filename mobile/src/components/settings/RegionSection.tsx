import { useRef, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { cleanPostcode, regionName } from '../../lib/settings/validate';
import { REGIONS, regionFromPostcode } from '../../lib/shared';
import { isIOS, useTheme } from '../../theme';
import { Button, Row, Section, T, TextField } from '../ui';
import { ChoiceRow } from './ChoiceRow';

type Lookup = { state: 'idle' } | { state: 'loading' } | { state: 'done'; name: string } | { state: 'error' };

/** Region: pick from the list (in a sheet) or find it by postcode. Mirrors the website's TariffStep. */
export function RegionSection({ region, tariff, onChange }: { region: string; tariff: string; onChange: (code: string) => void }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });
  const inFlight = useRef<AbortController | null>(null);

  async function findRegion() {
    const clean = cleanPostcode(postcode);
    if (!clean) return;
    inFlight.current?.abort();
    const ctrl = new AbortController();
    inFlight.current = ctrl;
    setLookup({ state: 'loading' });
    try {
      const code = await regionFromPostcode(clean, ctrl.signal);
      if (ctrl.signal.aborted) return;
      const name = code ? regionName(code) : null;
      if (!code || !name) throw new Error('Unknown region');
      onChange(code);
      setLookup({ state: 'done', name });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setLookup({ state: 'error' });
    }
  }

  function pick(code: string) {
    onChange(code);
    setLookup({ state: 'idle' });
    setOpen(false);
  }

  const chosen = regionName(region);
  const help = tariff === 'e7' ? 'Your region (optional) lets us show the greenest time too.' : 'Prices depend on where you live.';

  return (
    <>
      <Section title="Region" flush footer={help}>
        <Row
          first
          title="Region"
          trailing={
            <T variant="body" color={chosen ? 'textSecondary' : 'textTertiary'} numberOfLines={1}>
              {chosen ?? 'Choose…'}
            </T>
          }
          onPress={() => setOpen(true)}
          accessibilityLabel={chosen ? `Region: ${chosen}` : 'Region: not chosen'}
          accessibilityHint="Opens the list of regions"
        />
      </Section>

      <Section title="Or find it by postcode">
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <TextField
            label="Postcode"
            value={postcode}
            onChangeText={(t) => {
              setPostcode(t);
              if (lookup.state !== 'idle') setLookup({ state: 'idle' });
            }}
            onSubmitEditing={findRegion}
            autoComplete="postal-code"
            textContentType="postalCode"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            placeholder="SW1A 1AA"
            accessibilityHint="Type your postcode, then tap Find"
          />
          <Button
            title="Find"
            icon="location"
            variant="tonal"
            onPress={findRegion}
            loading={lookup.state === 'loading'}
            disabled={!cleanPostcode(postcode)}
            accessibilityHint="Looks up the region for this postcode"
          />
        </View>
        <View accessibilityLiveRegion="polite" style={{ minHeight: lookup.state === 'idle' ? 0 : 20, marginTop: lookup.state === 'idle' ? 0 : 8 }}>
          {lookup.state === 'loading' ? (
            <T variant="subhead" color="textSecondary">
              Looking up your region…
            </T>
          ) : lookup.state === 'done' ? (
            <T variant="subhead" color="good">
              Found it: {lookup.name}.
            </T>
          ) : lookup.state === 'error' ? (
            <T variant="subhead" color="warn">
              We couldn&apos;t find that postcode. Pick your region from the list instead.
            </T>
          ) : null}
        </View>
        <T variant="footnote" color="textSecondary" style={{ marginTop: 8 }}>
          Your postcode is only used to find your region. It isn&apos;t stored.
        </T>
      </Section>

      <Modal visible={open} animationType="slide" presentationStyle={isIOS ? 'pageSheet' : 'fullScreen'} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 20,
              paddingRight: 8,
              paddingTop: isIOS ? 16 : 48,
              paddingBottom: 4,
            }}
          >
            <T variant="headline" accessibilityRole="header">
              Choose your region
            </T>
            <Button title="Done" variant="plain" onPress={() => setOpen(false)} accessibilityHint="Closes the list" />
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Section flush footer="The region on your bill, or the area you live in. Prices and the carbon forecast differ by region.">
              {REGIONS.map((r, i) => (
                <ChoiceRow key={r.code} first={i === 0} title={r.name} checked={r.code === region} onPress={() => pick(r.code)} />
              ))}
            </Section>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
