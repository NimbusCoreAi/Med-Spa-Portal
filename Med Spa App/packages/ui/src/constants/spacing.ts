// Layout spacing conventions used across redesigned pages (Dashboard, Calendar, Patients).
// These are documentation/reference constants, not a replacement for Tailwind's spacing scale.

export const sectionGap = 'gap-6'; // 24px between major page sections (KPI row, chart rows, etc.)
export const cardPadding = 'p-6'; // standard card interior padding
export const cardGap = 'gap-4'; // gap between cards within a grid row

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
