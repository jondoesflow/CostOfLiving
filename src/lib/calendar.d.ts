// Types for the app in mobile/, which shares this file. Keep in step with calendar.js.
export interface CalendarEvent { uid: string; start: number; end: number; title: string; description?: string }
export function reminderTitle(name: string): string;
export function icsCalendar(events: CalendarEvent[], options?: { name?: string; refreshHours?: number }): string;
export function feedUrl(settings: { tariff: string; region?: string; kWh: number; mins: number; name: string; appliance?: string | null; e7?: unknown }): string;
export function bestTimeUrl(settings: { tariff: string; region?: string; kWh: number; mins: number; name: string; appliance?: string | null; e7?: unknown }): string;
