// Types for the app in mobile/, which shares this file. Keep in step with carbon.js.
import type { Slot } from './prices.js';

  export function loadCarbon(region: string, signal?: AbortSignal): Promise<Slot[]>;
