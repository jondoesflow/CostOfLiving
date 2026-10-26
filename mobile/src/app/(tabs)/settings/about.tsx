import Constants from 'expo-constants';
import { View } from 'react-native';
import { Icon } from '../../../components/Icon';
import { Footnote, Row, Screen, Section, T } from '../../../components/ui';
import { openLink } from '../../../lib/openLink';
import { SITE_URL } from '../../../lib/shared';
import { useTheme } from '../../../theme';

const PRIVACY_URL = `${SITE_URL}/privacy/`;

function Para({ children }: { children: React.ReactNode }) {
  return <T variant="body">{children}</T>;
}

export default function AboutScreen() {
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const external = <Icon name="external" size={16} color={colors.textTertiary} />;
  const link = (title: string, url: string, subtitle?: string, first = false) => (
    <Row
      key={url}
      first={first}
      title={title}
      subtitle={subtitle}
      trailing={external}
      chevron={false}
      onPress={() => openLink(url, colors)}
      accessibilityHint="Opens in an in-app browser"
    />
  );

  return (
    <Screen>
      <Section>
        <View style={{ gap: 10 }}>
          <T variant="title3" accessibilityRole="header">
            Cheap Watts
          </T>
          <Para>
            Find the cheapest and greenest time to run your washing machine, dishwasher, tumble dryer or car charger on your
            electricity tariff, plan an evening of jobs, and see whether gas or electric is cheaper for cooking and heating.
            It&apos;s the app version of cheapwatts.co.uk, and it&apos;s free.
          </Para>
        </View>
      </Section>

      <Section title="Privacy">
        <View style={{ gap: 10 }}>
          <Para>No account and no sign-up. No adverts. The app has no analytics or tracking.</Para>
          <Para>
            To get prices, the app sends your chosen tariff and region letter to your supplier&apos;s public price API, and to
            Octopus Energy&apos;s API for the standard-rate comparison and the gas rate. Your region is also sent to the
            National Grid carbon intensity API for the greenest time.
          </Para>
          <Para>
            If you tap Find, your postcode is sent to Octopus Energy&apos;s grid-supply-point lookup to work out your region.
            The app doesn&apos;t store it.
          </Para>
          <Para>
            Your supplier, tariff, region, cheap hours and any rates you type in are saved on this device only. Reminders are
            local notifications scheduled on your phone; nothing is sent anywhere.
          </Para>
          <Para>Links open in an in-app browser and are covered by those sites&apos; own privacy policies.</Para>
        </View>
      </Section>

      <Section flush>{link('Full privacy policy', PRIVACY_URL, 'Opens cheapwatts.co.uk', true)}</Section>

      <Section title="Where the data comes from" flush>
        {link('Octopus Energy', 'https://developer.octopus.energy/', 'Prices and postcode lookup (api.octopus.energy)', true)}
        {link('EDF', 'https://www.edfenergy.com/', 'Prices (api.edfgb-kraken.energy)')}
        {link('E.ON Next', 'https://www.eonnext.com/', 'Prices (api.eonnext-kraken.energy)')}
        {link('National Grid ESO', 'https://carbonintensity.org.uk/', 'Carbon intensity forecast (api.carbonintensity.org.uk)')}
      </Section>
      <Footnote>
        Prices for other suppliers come from the times and rates you type in. These services are run by third parties and may
        keep routine technical logs.
      </Footnote>

      <Section title="Please note">
        <Para>
          Costs are estimates based on typical appliance figures and the prices published for your tariff. Always check your
          own tariff and bill. Cheap Watts is independent and not affiliated with any energy supplier.
        </Para>
      </Section>

      <Section title="Made by" flush>
        {link('Jon Russell (JonDoesFlow)', 'https://www.jondoesflow.com', undefined, true)}
        {link('LinkedIn', 'https://www.linkedin.com/in/jondoesflow')}
        {link('GitHub', 'https://github.com/jondoesflow')}
        {link('cheapwatts.co.uk', SITE_URL)}
      </Section>

      <Footnote>Version {version}</Footnote>
    </Screen>
  );
}
