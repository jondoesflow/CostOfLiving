// Types for the app in mobile/, which shares this file. Keep in step with prices.js.
export interface Supplier { id: string; name: string; api?: string; list?: string }
export interface Tariff { id: string; supplier?: string; label: string; match?: RegExp; dynamic?: boolean; blurb: string }
export interface Slot { start: number; price: number }
export interface E7 { nightStart: string; nightEnd: string; dayRate: number; nightRate: number }
export const SUPPLIERS: Supplier[];
export const TARIFFS: Tariff[];
export const EXPORT_TARIFFS: Tariff[];
export const REFERENCE: Tariff;
export const SLOT_MS: number;
export function tariffsFor(supplierId: string): Tariff[];
export function gasRate(region: string, signal?: AbortSignal): Promise<{ unitRate: number; standingCharge: number }>;
export function regionFromPostcode(postcode: string, signal?: AbortSignal): Promise<string | null>;
export function currentSlotStart(now?: number): number;
export function loadSlots(tariffId: string, region: string, signal?: AbortSignal): Promise<Slot[]>;
export function standardRate(region: string, signal?: AbortSignal): Promise<number | null>;
export function ukMinutes(t: number): number;
export function economy7Slots(e7: E7, start?: number): Slot[];
