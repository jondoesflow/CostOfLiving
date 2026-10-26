import { router } from 'expo-router';
import { Economy7Section } from '../../../components/settings/Economy7Section';
import { FlatRateSection } from '../../../components/settings/FlatRateSection';
import { Leading } from '../../../components/settings/Leading';
import { RegionSection } from '../../../components/settings/RegionSection';
import { SupplierSection } from '../../../components/settings/SupplierSection';
import { TariffSection } from '../../../components/settings/TariffSection';
import { Footnote, LoadingState, Row, Screen, Section } from '../../../components/ui';
import { useElectricity } from '../../../lib/electricity';
import { tariffAfterSupplierChange } from '../../../lib/settings/validate';

// My tariff: supplier, tariff, region and rates. A port of the website's TariffStep; everything is
// saved on the device by useElectricity.
export default function SettingsScreen() {
  const elec = useElectricity();
  if (!elec.restored) {
    return (
      <Screen>
        <LoadingState label="Loading your settings…" />
      </Screen>
    );
  }
  const { supplier, tariff, region } = elec;

  function chooseSupplier(id: string) {
    elec.setSupplier(id);
    elec.setTariff(tariffAfterSupplierChange(tariff, id));
  }

  return (
    <Screen>
      <SupplierSection supplier={supplier} onChoose={chooseSupplier} />
      {supplier ? <TariffSection supplier={supplier} tariff={tariff} onChoose={elec.setTariff} /> : null}
      {supplier ? <RegionSection region={region} tariff={tariff} onChange={elec.setRegion} /> : null}
      {supplier && tariff === 'e7' ? <Economy7Section e7={elec.e7} onChange={elec.setE7} /> : null}
      {supplier && tariff === 'flat' && region ? (
        <FlatRateSection flatOverride={elec.flatOverride} apiFlatRate={elec.apiFlatRate} onChange={elec.setFlatOverride} />
      ) : null}

      <Footnote>Prices come from the suppliers&apos; public price APIs. Your settings stay on this device.</Footnote>

      <Section flush>
        <Row first leading={<Leading name="info" />} title="About Cheap Watts" onPress={() => router.push('/settings/about')} />
        <Row
          leading={<Leading name="lock" />}
          title="Privacy"
          subtitle="No account, no ads, no tracking"
          onPress={() => router.push('/settings/about')}
          accessibilityLabel="Privacy. No account, no ads, no tracking"
          accessibilityHint="Shows the privacy statement on the About screen"
        />
      </Section>
    </Screen>
  );
}
