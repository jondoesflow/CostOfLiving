import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

// One semantic name per icon, mapped to an SF Symbol (iOS) and a Material icon (Android/web),
// so each platform shows its own native iconography. Appliance icons use the website's ids.
const ICONS = {
  clock: { sf: 'clock', md: 'schedule' },
  timer: { sf: 'timer', md: 'timer' },
  bolt: { sf: 'bolt.fill', md: 'bolt' },
  leaf: { sf: 'leaf.fill', md: 'eco' },
  piggy: { sf: 'sterlingsign.circle', md: 'savings' },
  bell: { sf: 'bell', md: 'notifications' },
  bellOn: { sf: 'bell.fill', md: 'notifications-active' },
  hourglass: { sf: 'hourglass', md: 'hourglass-empty' },
  warning: { sf: 'exclamationmark.triangle.fill', md: 'warning' },
  info: { sf: 'info.circle', md: 'info-outline' },
  chevron: { sf: 'chevron.right', md: 'chevron-right' },
  check: { sf: 'checkmark', md: 'check' },
  close: { sf: 'xmark.circle.fill', md: 'cancel' },
  external: { sf: 'arrow.up.right.square', md: 'open-in-new' },
  share: { sf: 'square.and.arrow.up', md: 'share' },
  location: { sf: 'location.fill', md: 'my-location' },
  lock: { sf: 'lock.shield', md: 'privacy-tip' },
  settings: { sf: 'slider.horizontal.3', md: 'tune' },
  flame: { sf: 'flame', md: 'local-fire-department' },
  house: { sf: 'house', md: 'home' },
  calendar: { sf: 'calendar.badge.plus', md: 'event' },
  sun: { sf: 'sun.max', md: 'wb-sunny' },
  // Appliances
  WashingMachine: { sf: 'washer', md: 'local-laundry-service' },
  Wind: { sf: 'dryer', md: 'dry' },
  Fan: { sf: 'fan', md: 'heat-pump' },
  Rows3: { sf: 'rectangle.grid.1x2', md: 'view-agenda' },
  Shirt: { sf: 'tshirt', md: 'iron' },
  Utensils: { sf: 'dishwasher', md: 'dinner-dining' },
  Flame: { sf: 'oven', md: 'microwave' },
  Soup: { sf: 'frying.pan', md: 'soup-kitchen' },
  CookingPot: { sf: 'cooktop', md: 'outdoor-grill' },
  Croissant: { sf: 'birthday.cake', md: 'bakery-dining' },
  Droplets: { sf: 'drop.fill', md: 'water-drop' },
  ShowerHead: { sf: 'shower', md: 'shower' },
  Heater: { sf: 'heater.vertical', md: 'heat-pump' },
  BedDouble: { sf: 'bed.double', md: 'bed' },
  AirVent: { sf: 'humidifier', md: 'air' },
  Bike: { sf: 'bicycle', md: 'electric-bike' },
  Accessibility: { sf: 'figure.roll', md: 'accessible' },
  Car: { sf: 'bolt.car', md: 'electric-car' },
  SlidersHorizontal: { sf: 'slider.horizontal.3', md: 'tune' },
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  accessibilityLabel,
}: {
  name: IconName;
  size?: number;
  color: string;
  /** Omit for decorative icons (hidden from screen readers). */
  accessibilityLabel?: string;
}) {
  const icon = ICONS[name];
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityLabel, accessibilityRole: 'image' as const }
    : { accessible: false, importantForAccessibility: 'no-hide-descendants' as const };
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={icon.sf as ComponentProps<typeof SymbolView>['name']}
        size={size}
        tintColor={color}
        style={{ width: size, height: size }}
        {...a11y}
      />
    );
  }
  return (
    <MaterialIcons
      name={icon.md as ComponentProps<typeof MaterialIcons>['name']}
      size={size}
      color={color}
      {...a11y}
    />
  );
}
