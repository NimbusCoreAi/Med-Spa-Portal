# @baseplate/ui

Reusable, Tailwind-styled UI components shared across Baseplate apps.

## Component Inventory

| Component | Import | Notes |
|---|---|---|
| `Button` | `@baseplate/ui` or `@baseplate/ui/button` | |
| `Input` | `@baseplate/ui` or `@baseplate/ui/input` | |
| `Form` | `@baseplate/ui` or `@baseplate/ui/form` | generic field-driven form renderer |
| `Table` | `@baseplate/ui` or `@baseplate/ui/table` | generic data table |
| `Modal` | `@baseplate/ui` or `@baseplate/ui/modal` | |
| `PageLayout`, `Card` | `@baseplate/ui` or `@baseplate/ui/layout` | |
| `KPICard` | `@baseplate/ui` | stat card with trend indicator, icon, color variant |
| `StatusBadge` | `@baseplate/ui` | active/inactive/pending/cancelled pill |
| `RiskBadge` | `@baseplate/ui` | high/medium/low risk pill |

All components are vertical-agnostic — no med spa specific fields or copy. Consuming apps (e.g. `apps/portal-medspa`) supply their own field definitions and content.

## Hooks

| Hook | Purpose |
|---|---|
| `useTheme()` | wraps `next-themes`; returns `{ theme, setTheme, isDark, toggleTheme, isSystemTheme }` |
| `useMobile()` | boolean, true when viewport is below the `md` (768px) breakpoint |
| `useResponsive(breakpoint?)` | boolean, true when viewport is at or above the given breakpoint (default `md`) |

## Constants

`src/constants/colors.ts`, `spacing.ts`, `typography.ts` export the same values used in `tailwind.config.ts`, for places that need a raw value instead of a Tailwind class (e.g. chart series colors, computed inline styles). Keep these in sync with `tailwind.config.ts` `theme.extend.colors` when either changes.

## Color System

Defined in `tailwind.config.ts theme.extend.colors`:
- `service.{botox,massage,laser,skincare,consultation}` — appointment/service-type badges
- `status.{active,inactive,pending,cancelled}` — patient/record status badges
- `risk.{high,medium,low}` — risk-level badges

Components use semantic `dark:` variants on top of these (e.g. `bg-red-100 dark:bg-red-900`) rather than the raw hex values directly, so badges stay legible in both themes.

## Typography

See `src/constants/typography.ts` for the canonical scale (`pageTitle`, `sectionTitle`, `kpiValue`, `kpiLabel`, `body`, `muted`). Use these class strings directly rather than re-deriving font sizes per page.

## Dark Mode

Dark mode is class-based (`darkMode: 'class'` in both `packages/ui/tailwind.config.ts` and each consuming app's Tailwind config) and driven by `next-themes`. Every component that renders visible text or backgrounds must pair each light-mode class with a `dark:` variant — there is no automatic dark-mode derivation. `useTheme()` is the single source of truth for toggling; see `apps/portal-medspa/src/components/layout/DashboardHeader.tsx` for the toggle-button reference implementation.

## Responsive Design

Mobile-first. Breakpoints match Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280 — see `constants/spacing.ts`). Prefer Tailwind's `md:`/`lg:` variants in JSX over `useMobile`/`useResponsive`; reach for the hooks only when a layout decision can't be expressed in CSS alone (e.g. switching a table to a card list).

## Accessibility

- Interactive elements (`Button`, `Modal` close/overlay, table sort headers) must be reachable by keyboard and expose an accessible name (visible text, `aria-label`, or both).
- Status/risk badges convey meaning via text label, not color alone.
- `Modal` traps focus and restores it to the triggering element on close.

## Styling

Components use Tailwind utility classes. Consuming apps must include `../../packages/ui/src/**/*.{js,ts,jsx,tsx}` in their `tailwind.config.js` `content` array so classes aren't purged.

## Example Pages

`apps/portal-medspa/src/components/dashboard/DashboardOverview.tsx` and `PatientList.tsx` are the reference implementations for the KPI-row + card-grid pattern and the dark-mode-aware data table pattern, respectively.
