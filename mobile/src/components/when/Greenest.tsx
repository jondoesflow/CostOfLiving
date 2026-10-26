import { greenestText, type Green } from '../../lib/when/view';
import type { Window } from '../../lib/shared';
import { T } from '../ui';
import { Callout } from './Callout';

/** Greenest time to run, from the regional carbon forecast. Nothing when there is no forecast. */
export function Greenest({ green, cheapest, allSame }: { green: Green | null; cheapest: Window | null; allSame: boolean }) {
  const text = greenestText(green, cheapest, allSame);
  if (!text) return null;
  return (
    <Callout icon="leaf" iconColor="good" title={text.title}>
      <T>{text.body}</T>
      <T variant="footnote" color="textSecondary">
        From National Grid&apos;s carbon forecast for your region. When more wind and solar are on the grid, each unit is cleaner.
      </T>
    </Callout>
  );
}
