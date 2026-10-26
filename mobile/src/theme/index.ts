import { Platform, useColorScheme } from 'react-native';

// Semantic colour tokens. iOS values mirror Apple's system colours (HIG); Android values are a
// Material 3 scheme generated from the brand navy (#1D3461, the website's primary colour).
// Text/background pairs meet WCAG AA contrast (4.5:1) in light and dark mode, except textTertiary,
// which is for decorative or non-essential text only. iOS secondary text uses opaque greys a shade
// darker than Apple's translucent default so it passes AA.

export interface Palette {
  /** Screen background (iOS: grouped background; Android: surface). */
  background: string;
  /** Card / grouped cell background. */
  card: string;
  /** Slightly raised surface inside a card (inputs, chips). */
  fill: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  separator: string;
  /** Brand/accent colour for interactive elements. */
  tint: string;
  onTint: string;
  /** Tinted container (Android: primaryContainer; iOS: tint at low opacity). */
  tintContainer: string;
  onTintContainer: string;
  good: string;
  goodContainer: string;
  bad: string;
  badContainer: string;
  warn: string;
  warnContainer: string;
}

const iosLight: Palette = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  fill: '#E9E9EF',
  text: '#000000',
  textSecondary: '#6C6C70',
  textTertiary: '#8E8E93',
  separator: '#3C3C4349',
  tint: '#1D3461',
  onTint: '#FFFFFF',
  tintContainer: '#1D34611A',
  onTintContainer: '#16294D',
  good: '#2D6A4F',
  goodContainer: '#EAF3EE',
  bad: '#C0392B',
  badContainer: '#FCE9E7',
  warn: '#8A5A00',
  warnContainer: '#FFF3D6',
};

const iosDark: Palette = {
  background: '#000000',
  card: '#1C1C1E',
  fill: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#8E8E93',
  separator: '#54545899',
  tint: '#A9C4F5',
  onTint: '#0B1E3D',
  tintContainer: '#A9C4F526',
  onTintContainer: '#C9DAFA',
  good: '#5CC08F',
  goodContainer: '#0F2E1F',
  bad: '#FF6B5E',
  badContainer: '#3A1512',
  warn: '#FFD60A',
  warnContainer: '#332A00',
};

const androidLight: Palette = {
  background: '#F8F9FC',
  card: '#FFFFFF',
  fill: '#E9ECF3',
  text: '#191C20',
  textSecondary: '#434654',
  textTertiary: '#737685',
  separator: '#C3C6D5',
  tint: '#1D3461',
  onTint: '#FFFFFF',
  tintContainer: '#D8E2FF',
  onTintContainer: '#001A41',
  good: '#2D6A4F',
  goodContainer: '#D3F3DE',
  bad: '#BA1A1A',
  badContainer: '#FFDAD6',
  warn: '#7A5900',
  warnContainer: '#FFDEA3',
};

const androidDark: Palette = {
  background: '#111318',
  card: '#1D2024',
  fill: '#282A2F',
  text: '#E2E2E9',
  textSecondary: '#C3C6D5',
  textTertiary: '#8D909F',
  separator: '#434654',
  tint: '#AEC6FF',
  onTint: '#002E69',
  tintContainer: '#1D3461',
  onTintContainer: '#D8E2FF',
  good: '#9BD4B0',
  goodContainer: '#0F3A25',
  bad: '#FFB4AB',
  badContainer: '#93000A',
  warn: '#F1C048',
  warnContainer: '#5C4300',
};

export const isIOS = Platform.OS === 'ios';

export interface Theme {
  dark: boolean;
  colors: Palette;
  /** Corner radius for cards/grouped sections (iOS inset grouped: 10; Material 3 medium: 12). */
  radius: number;
  /** Minimum touch target: 44pt (Apple HIG) / 48dp (Material). */
  minTouch: number;
  spacing: (n: number) => number;
}

export function getTheme(dark: boolean, os: string = Platform.OS): Theme {
  const ios = os === 'ios';
  return {
    dark,
    colors: ios ? (dark ? iosDark : iosLight) : dark ? androidDark : androidLight,
    radius: ios ? 10 : 12,
    minTouch: ios ? 44 : 48,
    spacing: (n) => n * 4,
  };
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return getTheme(scheme === 'dark');
}

// Text styles: iOS Dynamic Type sizes (HIG) / Material 3 type scale. React Native scales these
// with the user's system text size automatically.
export const type = isIOS
  ? {
      largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
      title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
      title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
      headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
      body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
      callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
      subhead: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
      footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
      caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
      sectionHeader: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, textTransform: 'uppercase' as const },
    }
  : {
      largeTitle: { fontSize: 32, fontWeight: '400' as const, lineHeight: 40 },
      title2: { fontSize: 24, fontWeight: '400' as const, lineHeight: 32 },
      title3: { fontSize: 22, fontWeight: '400' as const, lineHeight: 28 },
      headline: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24, letterSpacing: 0.15 },
      body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, letterSpacing: 0.5 },
      callout: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
      subhead: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0.25 },
      footnote: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0.4 },
      caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
      sectionHeader: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },
    };
