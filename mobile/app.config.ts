import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Cheap Watts',
  slug: 'cheap-watts',
  owner: 'jondoesflow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'cheapwatts',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'uk.co.cheapwatts.app',
    // Phone-first layouts; iPads run the app in iPhone compatibility mode until an iPad layout exists.
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: 'uk.co.cheapwatts.app',
    adaptiveIcon: {
      backgroundColor: '#1D3461',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-asset',
    'expo-web-browser',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 160, backgroundColor: '#FFFFFF', dark: { backgroundColor: '#000000' } },
    ],
    ['expo-notifications', { color: '#1D3461' }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    // Filled in after `npx eas-cli@latest init` (it can't write into a .ts config).
    eas: { projectId: '7b597654-8b48-4fa2-96d7-c04ee319b9f0' },
  },
};

export default config;
