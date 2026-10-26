// Types for the app in mobile/, which shares this file. Keep in step with appliances.js.
export interface Appliance {
  id: string; group: string; name: string; icon: string; kWh: number; mins: number; perWeek: number; note: string;
  labelHint?: boolean; noTimer?: boolean; splittable?: boolean; profile?: string;
}
export const APPLIANCE_GROUPS: { id: string; name: string }[];
export const APPLIANCES: Appliance[];
export const PROFILES: Record<string, { shape: [number, number][]; note: string }>;
export const REGIONS: { code: string; name: string }[];
export function profileOf(id: string | null | undefined): [number, number][] | null;
