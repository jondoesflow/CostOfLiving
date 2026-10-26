// Types for the app in mobile/, which shares this file. Keep in step with optimise.js.
import type { Slot, Tariff } from './prices.js';

export type Profile = [number, number][];
export interface Window { index: number; start: number; end: number; slotCount: number; cost: number }
export interface Best {
  best: Window;
  sooner: Window | null;
  now: Window;
  worst: Window;
  alternatives: Window[];
  allSame: boolean;
}
export interface Session { start: number; end: number; index: number; lastIndex: number; count: number; kWh: number; cost: number }
export interface ChargePlan { sessions: Session[]; cost: number; placed: number; remaining: number; nowCost: number; startsNow: boolean }
export interface Job { id: string; name: string; kWh: number; mins: number; profile?: Profile | null }
export interface Placed { job: Job; window: Window | null; nowCost: number | null }
export function windowCosts(slots: Slot[], kWh: number, mins: number, finishBy?: number | null, profile?: Profile | null): Window[];
export function bestWindows(slots: Slot[], kWh: number, mins: number, finishBy?: number | null, options?: { notBefore?: number | null; profile?: Profile | null }): Best | null;
export function cheapestSlots(slots: Slot[], kWh: number, mins: number, options?: { finishBy?: number | null; within?: number; cheapOnly?: boolean }): ChargePlan | null;
export function lastPossibleFinish(slots: Slot[]): number | null;
export function scheduleJobs(slots: Slot[], jobs: Job[], options?: { maxAtOnce?: number; finishBy?: number | null }): Placed[];
export function pricesPending(tariff: Tariff | undefined | null, slots: Slot[], now?: number): boolean;
export function nearPeak(slots: Slot[], w: Window): boolean;
