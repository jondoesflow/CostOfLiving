// Pure view-model logic for the "Plan my evening" screen: a port of the derivations in the
// website's src/tools/PlanEvening.jsx. The maths (scheduleJobs) comes from the shared code.
import {
  APPLIANCES,
  SITE_URL,
  SLOT_MS,
  money,
  profileOf,
  reminderTitle,
  scheduleJobs,
  timeLabel,
  ukMinutes,
  whenLabel,
  type Job,
  type Placed,
  type Slot,
  type Window,
} from '../shared';

export type LimitValue = '1' | '2' | '3' | 'any';

/** Mirrors the website's LIMITS select: the short segment label and the full wording. */
export const LIMITS: { value: LimitValue; label: string; max: number; short: string }[] = [
  { value: '1', short: '1', label: 'One at a time', max: 1 },
  { value: '2', short: '2', label: 'Up to 2 at once', max: 2 },
  { value: '3', short: '3', label: 'Up to 3 at once', max: 3 },
  { value: 'any', short: 'Any', label: 'No limit', max: Infinity },
];

export const DEFAULT_LIMIT: LimitValue = '2';

export const maxAtOnceFor = (value: LimitValue): number => LIMITS.find((l) => l.value === value)?.max ?? Infinity;

export const SAFETY_NOTE =
  'Running several big appliances together can trip a fuse or overload a socket, and some boilers and showers don\'t like it either. "One at a time" or "Up to 2" is the safe choice.';

/** The editable figures for one picked appliance (null while a field is empty). */
export interface Figures {
  kWh: number | null;
  mins: number | null;
}

export const defaultFigures = (id: string): Figures => {
  const a = APPLIANCES.find((x) => x.id === id);
  return { kWh: a?.kWh ?? null, mins: a?.mins ?? null };
};

export const applianceName = (id: string): string => APPLIANCES.find((a) => a.id === id)?.name ?? id;

/** Hours shown in the "Run time" field for a number of minutes (two decimal places, like the site). */
export const hoursFor = (mins: number | null): number | null => (mins == null ? null : Number((mins / 60).toFixed(2)));
export const minsFor = (hours: number | null): number | null => (hours == null ? null : Math.round(hours * 60));

/** The jobs to schedule: picked appliances with usable figures, in the order they were picked. */
export function buildJobs(chosen: string[], figures: Record<string, Figures | undefined>): Job[] {
  return chosen
    .map((id) => {
      const f = figures[id] ?? defaultFigures(id);
      return { id, name: applianceName(id), profile: profileOf(id), kWh: f.kWh ?? 0, mins: f.mins ?? 0 };
    })
    .filter((j) => j.kWh > 0 && j.mins > 0);
}

/** Whole hours, no sooner than the longest job could finish and no later than the prices run. */
export function finishOptions(slots: Slot[], jobs: Job[], now: number): number[] {
  const longest = Math.max(0, ...jobs.map((j) => j.mins));
  if (!slots.length || !longest) return [];
  const earliest = now + longest * 60000;
  const last = slots[slots.length - 1].start + SLOT_MS;
  return slots.map((s) => s.start + SLOT_MS).filter((t) => t >= earliest && t <= last && t % 3600000 === 0);
}

/** The finish time to use: the chosen one if it is still an option, otherwise "Any time". */
export const activeFinishBy = (finishBy: number | null, options: number[]): number | null =>
  finishBy != null && options.includes(finishBy) ? finishBy : null;

export type Scheduled = Placed & { window: Window; nowCost: number };

export interface Plan {
  scheduled: Scheduled[];
  missing: Placed[];
  /** Pence. */
  total: number;
  totalNow: number;
  /** Every job costs the same now as at its best time: a flat tariff. */
  allSame: boolean;
  saving: number;
  lastEnd: number;
  finishBy: number | null;
}

export function makePlan(slots: Slot[], jobs: Job[], maxAtOnce: number, finishBy: number | null): Plan | null {
  if (!slots.length || !jobs.length) return null;
  const placed = scheduleJobs(slots, jobs, { maxAtOnce, finishBy });
  const scheduled = placed.filter((p): p is Scheduled => p.window != null).map((p) => ({ ...p, nowCost: p.nowCost ?? 0 }));
  const missing = placed.filter((p) => !p.window);
  const total = scheduled.reduce((sum, p) => sum + p.window.cost, 0);
  const totalNow = scheduled.reduce((sum, p) => sum + p.nowCost, 0);
  const allSame = scheduled.length > 0 && scheduled.every((p) => Math.abs(p.window.cost - p.nowCost) < 0.05);
  return {
    scheduled,
    missing,
    total,
    totalNow,
    allSame,
    saving: totalNow - total,
    lastEnd: Math.max(0, ...scheduled.map((p) => p.window.end)),
    finishBy,
  };
}

/** The screen-reader summary announced when the plan changes (the site's LiveSummary). */
export function summaryText(plan: Plan | null): string {
  if (!plan) return '';
  if (plan.allSame) return `Your tariff costs the same at any time. Everything together costs about ${money(plan.total)}.`;
  return `Plan ready: ${money(plan.total)} for everything. ${plan.scheduled.map((p) => `${p.job.name} at ${whenLabel(p.window.start)}`).join(', ')}.`;
}

export const totalLine = (plan: Plan): string => `${money(plan.total)} for everything`;

export const ALL_SAME_LINE = 'Your tariff costs the same at any time, so run things whenever suits you.';

/** "Starting everything now would cost about X, so this plan saves Y." or null when there is nothing to save. */
export function savingLine(plan: Plan): { nowCost: string; saving: string } | null {
  if (plan.allSame || plan.saving <= 0.05) return null;
  return { nowCost: money(plan.totalNow), saving: money(plan.saving) };
}

/** "Start now, done by 9pm" or "Start 2am tomorrow, done by 4am". */
export const whenText = (p: Scheduled): string =>
  `${p.window.index === 0 ? 'Start now' : `Start ${whenLabel(p.window.start)}`}, done by ${timeLabel(p.window.end)}`;

/** "now: 45p" when starting straight away would cost noticeably more. */
export const nowText = (p: Scheduled): string | null => (p.nowCost - p.window.cost > 0.05 ? `now: ${money(p.nowCost)}` : null);

export function missingText(plan: Plan): string | null {
  if (!plan.missing.length) return null;
  const names = plan.missing.map((m) => m.job.name.toLowerCase()).join(', ');
  const where = plan.finishBy ? 'before your finish time' : 'the hours we have prices for';
  return `Couldn't fit ${names} in ${where}. Try a later finish time or allow more at once.`;
}

export const SHARE_URL = `${SITE_URL}/plan-my-evening/?utm_source=app&utm_medium=share&utm_campaign=plan`;

export function shareText(plan: Plan): string {
  return plan.saving > 0.05
    ? `I fitted ${plan.scheduled.length} jobs into the cheap hours and saved ${money(plan.saving)} on running them all now. Plan yours, free:`
    : 'Fit your washing, dishwasher and car charging into the cheapest hours, free:';
}

/* ------------------------------------------------------------------ Timeline */

export interface TimelineBar {
  id: string;
  name: string;
  /** Fractions of the axis, 0 to 1. */
  left: number;
  width: number;
}

export interface TimelineTick {
  t: number;
  left: number;
  label: string;
}

export interface TimelineGeometry {
  from: number;
  to: number;
  bars: TimelineBar[];
  ticks: TimelineTick[];
}

export const tickLabel = (t: number): string => (ukMinutes(t) === 0 ? '12am' : ukMinutes(t) === 720 ? '12pm' : timeLabel(t));

/** The Gantt-style view: one bar per scheduled job and a tick every six hours, as fractions of the axis. */
export function timelineGeometry(plan: Plan, slots: Slot[]): TimelineGeometry {
  const from = slots[0].start;
  const to = Math.max(plan.lastEnd, from + 6 * 3600 * 1000);
  const span = to - from;
  const frac = (t: number) => (t - from) / span;
  const ticks: TimelineTick[] = [];
  for (let t = Math.ceil(from / SLOT_MS) * SLOT_MS; t <= to; t += SLOT_MS) {
    if (ukMinutes(t) % 360 === 0) ticks.push({ t, left: frac(t), label: tickLabel(t) });
  }
  const bars = plan.scheduled.map((p) => ({
    id: p.job.id,
    name: p.job.name,
    left: frac(p.window.start),
    width: (p.window.end - p.window.start) / span,
  }));
  return { from, to, bars, ticks };
}

/* ------------------------------------------------------------------ Reminders */

export interface Reminder {
  id: string;
  title: string;
  body: string;
  at: number;
}

export const REMINDER_BODY = 'Part of your Cheap Watts plan';

/** One reminder per job that has not started yet (a "Start now" job needs no reminder). */
export function reminderPlan(plan: Plan, now: number): Reminder[] {
  return plan.scheduled
    .filter((p) => p.window.index !== 0 && p.window.start > now)
    .map((p) => ({ id: p.job.id, title: reminderTitle(p.job.name), body: REMINDER_BODY, at: p.window.start }));
}
