// Mirrors packages/ui/tailwind.config.ts theme.extend.colors — keep in sync.
// Use these when a JS/TS value is needed (e.g. chart series colors) instead of a Tailwind class.

export const serviceColors = {
  botox: '#3b82f6',
  massage: '#10b981',
  laser: '#f59e0b',
  skincare: '#ec4899',
  consultation: '#8b5cf6',
} as const;

export const statusColors = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#f59e0b',
  cancelled: '#ef4444',
} as const;

export const riskColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
} as const;

export type ServiceType = keyof typeof serviceColors;
export type StatusType = keyof typeof statusColors;
export type RiskLevel = keyof typeof riskColors;
