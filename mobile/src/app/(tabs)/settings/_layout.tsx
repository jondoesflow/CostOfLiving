import { Stack } from 'expo-router';
import { stackOptions } from '../../../components/stackOptions';
import { useTheme } from '../../../theme';

export default function Layout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="index" options={{ title: 'My tariff' }} />
      <Stack.Screen name="about" options={{ title: 'About', headerLargeTitle: false }} />
    </Stack>
  );
}
