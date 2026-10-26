import { Stack } from 'expo-router';
import { stackOptions } from '../../../components/stackOptions';
import { useTheme } from '../../../theme';

export default function Layout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={stackOptions(theme)}>
      <Stack.Screen name="index" options={{ title: 'Cheapest time' }} />

    </Stack>
  );
}
