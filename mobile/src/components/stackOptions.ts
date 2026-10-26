import type { ComponentProps } from 'react';
import type { Stack } from 'expo-router';
import { isIOS, type Theme } from '../theme';

type ScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/** Native stack header styling: large collapsing titles on iOS, Material top app bar on Android. */
export function stackOptions(theme: Theme): Exclude<ScreenOptions, (...args: never[]) => unknown> {
  const { colors } = theme;
  return isIOS
    ? {
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: true,
        headerBlurEffect: 'systemChromeMaterial',
        headerLargeStyle: { backgroundColor: colors.background },
        headerTintColor: colors.tint,
        headerTitleStyle: { color: colors.text },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }
    : {
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontSize: 22, fontWeight: '400' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade_from_bottom',
      };
}
