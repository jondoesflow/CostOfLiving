// One import point for the code shared with the website, so screens don't repeat the
// relative paths. Metro reaches ../../../src through watchFolders in metro.config.js.
export * from '../../../src/prices.js';
export * from '../../../src/optimise.js';
export * from '../../../src/appliances.js';
export * from '../../../src/carbon.js';
export * from '../../../src/lib/format.js';
export { reminderTitle } from '../../../src/lib/calendar.js';
export type { Slot, Tariff, Supplier, E7 } from '../../../src/prices.js';
export type { Window, Best, ChargePlan, Session, Job, Placed, Profile } from '../../../src/optimise.js';
export type { Appliance } from '../../../src/appliances.js';

export const SITE_URL = 'https://cheapwatts.co.uk';
