import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import type { Palette } from '../theme';

/** The website owner's tip page (optional; the app is free). */

/**
 * Open a web page in the in-app browser (SFSafariViewController on iOS, Custom Tabs on Android),
 * falling back to the system browser if that isn't available.
 */
export async function openLink(url: string, colors?: Pick<Palette, 'tint' | 'background'>): Promise<void> {
  if (!/^https?:\/\//i.test(url)) return;
  try {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: colors?.tint,
      toolbarColor: colors?.background,
      dismissButtonStyle: 'done',
      enableBarCollapsing: true,
      showTitle: true,
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      // Nothing more we can do; the tap simply has no effect.
    }
  }
}
