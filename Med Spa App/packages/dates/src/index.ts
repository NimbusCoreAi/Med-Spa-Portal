export const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export const WEEK_START = 1;

export type DayName = typeof DAY_NAMES[number];

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day - WEEK_START + 7) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setUTCDate(d.getUTCDate() + 6);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getDayName(date: Date): DayName {
  return DAY_NAMES[date.getUTCDay()];
}

export const DATE_RANGE_PRESETS = {
  this_month: 'This Month',
  last_month: 'Last Month',
  ytd: 'Year to Date',
} as const;

export type DateRangePreset = keyof typeof DATE_RANGE_PRESETS;

export function getDateRange(preset: DateRangePreset): { from?: string; to?: string } {
  const now = new Date();

  if (preset === 'this_month') {
    return { from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString() };
  }
  if (preset === 'last_month') {
    return {
      from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString(),
      to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59)).toISOString(),
    };
  }
  return { from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString() };
}
