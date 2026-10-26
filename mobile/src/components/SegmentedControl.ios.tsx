import SegmentedControlModule from '@react-native-segmented-control/segmented-control';
import type { ComponentType } from 'react';
import type { SegmentedControlProps } from './SegmentedControl';

// The package's class component typing doesn't satisfy React 19's JSX types; it renders fine.
const NativeSegmentedControl = SegmentedControlModule as unknown as ComponentType<Record<string, unknown>>;

// iOS: the system UISegmentedControl.
export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedControlProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <NativeSegmentedControl
      values={options.map((o) => o.label)}
      selectedIndex={index}
      onChange={(e: { nativeEvent: { selectedSegmentIndex: number } }) => onChange(options[e.nativeEvent.selectedSegmentIndex].value)}
      accessibilityLabel={accessibilityLabel}
      style={{ minHeight: 32 }}
    />
  );
}
