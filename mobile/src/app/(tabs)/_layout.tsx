import { NativeTabs } from 'expo-router/native-tabs';
import { useTheme } from '../../theme';

// System tab bar: UITabBar on iOS (Liquid Glass on iOS 26), Material 3 navigation bar on Android.
export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <NativeTabs tintColor={colors.tint}>
      <NativeTabs.Trigger name="when">
        <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} md="schedule" />
        <NativeTabs.Trigger.Label>Cheapest time</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.clipboard', selected: 'list.bullet.clipboard.fill' }} md="checklist" />
        <NativeTabs.Trigger.Label>Plan evening</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="compare">
        <NativeTabs.Trigger.Icon sf={{ default: 'flame', selected: 'flame.fill' }} md="local_fire_department" />
        <NativeTabs.Trigger.Label>Gas or electric</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf={{ default: 'bolt', selected: 'bolt.fill' }} md="bolt" />
        <NativeTabs.Trigger.Label>My tariff</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
