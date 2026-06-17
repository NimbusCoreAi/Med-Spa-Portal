export type DateRangePreset = 'this_month' | 'last_month' | 'ytd';

export function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDateRange(preset: DateRangePreset): { from?: string; to?: string; label: string } {
  const now = new Date();
  const labels: Record<DateRangePreset, string> = {
    this_month: 'This Month',
    last_month: 'Last Month',
    ytd: 'Year to Date',
  };

  if (preset === 'this_month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), label: labels[preset] };
  }
  if (preset === 'last_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
      label: labels[preset],
    };
  }
  return { from: new Date(now.getFullYear(), 0, 1).toISOString(), label: labels[preset] };
}
