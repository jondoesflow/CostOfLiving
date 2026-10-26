import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { stackOptions } from '../components/stackOptions';
import { ElectricityProvider } from '../lib/electricity';
import { useTheme } from '../theme';

// Reminders are local notifications; show them even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export default function RootLayout() {
  const theme = useTheme();
  const base = theme.dark ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: theme.colors.tint, background: theme.colors.background, card: theme.colors.card, text: theme.colors.text, border: theme.colors.separator },
      }}
    >
      <ElectricityProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={stackOptions(theme)}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ElectricityProvider>
    </ThemeProvider>
  );
}
