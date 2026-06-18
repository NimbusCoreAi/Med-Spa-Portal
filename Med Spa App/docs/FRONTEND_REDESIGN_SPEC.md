# Med Spa App Frontend Redesign Spec — Hybrid Approach (Core-First)

**Date:** 2026-06-17  
**Scope:** Full frontend refresh (auth pages, public pages, dashboard) preserving all functionality  
**Target Aesthetic:** visactor-next-template (modern, clean, data-driven, light/dark mode)  
**Effort Level:** Full refresh (rebuild major sections)  
**Approach:** Hybrid — Phase A (core pages), Phase B (design system), Phase C (remaining pages)

> **STATUS (2026-06-17): Phase A complete** — Dashboard, Calendar, and Patient List all redesigned, dark-mode-enabled, typechecked, tested, and built clean. Implementation plan + per-task outcomes: `docs/superpowers/plans/2026-06-17-frontend-redesign-phase-a.md`. Progress tracked in root `MASTER_PROGRESS.md` under "Frontend Redesign (Med Spa Portal)". Note: Calendar and Patient List were restyled in place rather than rebuilt on `react-big-calendar`/`@tanstack/react-table` as Phase A's section below describes — see the plan file's Task 11/12 "ACTUAL OUTCOME" notes for the reasoning (preserve working functionality, avoid library-swap risk). **Phase B and Phase C are not started.**

---

## Project Overview

### Goals (Balanced Priority)
1. **Better usability** — Make core tasks (scheduling, patient management, billing) faster and more intuitive
2. **Modern professionalism** — Elevate brand perception for clinic owners
3. **Data-driven insights** — Add visual analytics and metrics (revenue, appointment trends, risk scoring)

### Constraints
- **All existing functionality must be preserved** — no feature removal or behavior changes
- **Components can be refactored** — rebuild @baseplate/ui as needed
- **No database schema changes** — all data structures stay the same
- **Supabase auth/RLS stays unchanged** — no auth layer modifications

### Reference Aesthetic (visactor-next-template)
- Modern, clean design with data visualization focus
- Light/dark mode support with system preference detection
- Shadcn/ui components + Tailwind CSS
- Card-based, widget-style dashboard layouts
- Contemporary, polished appearance
- Responsive design across all device sizes

---

## Phase A: Core Pages Redesign

### Overview
Redesign the three highest-traffic pages with new components and layouts. This establishes visual standards and demonstrates the modern aesthetic immediately.

**Target Pages:**
1. Dashboard Overview (`/dashboard`)
2. Calendar/Scheduling (`/dashboard/calendar`)
3. Patient List & Management (`/dashboard/patients`)

### 1.1 Dashboard Overview Page

**Current State:**
- File: `apps/portal-medspa/src/app/dashboard/page.tsx`
- Component: `src/components/dashboard/DashboardOverview.tsx`
- Shows basic stats and overview

**Redesigned State:**

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Search | Theme Toggle | User Menu       │
├─────────────────────────────────────────────────────────┤
│  Sidebar | Main Content Area                            │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ KPI Cards Section (Top)                 │  │
│          │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │
│          │  │ │Revenue  │ │Patients │ │Apps Sch.│   │  │
│          │  │ │$X,XXX   │ │XXX      │ │XXX/XXX  │   │  │
│          │  │ └─────────┘ └─────────┘ └─────────┘   │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Charts Section (2-column grid)         │  │
│          │  │ ┌──────────────────┐ ┌──────────────┐ │  │
│          │  │ │Revenue Trend     │ │Appointments  │ │  │
│          │  │ │(Line Chart)      │ │Trend (Bar)   │ │  │
│          │  │ └──────────────────┘ └──────────────┘ │  │
│          │  │ ┌──────────────────┐ ┌──────────────┐ │  │
│          │  │ │Risk Scoring      │ │Patient Status│ │  │
│          │  │ │(Gauge/Donut)     │ │(Donut)       │ │  │
│          │  │ └──────────────────┘ └──────────────┘ │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Quick Actions (Bottom)                 │  │
│          │  │ [Schedule] [Add Patient] [View Calen]  │  │
│          │  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components to Create/Modify

**1. KPI Cards**
- File: `apps/portal-medspa/src/components/dashboard/KPICard.tsx` (NEW)
- Props: `title`, `value`, `trend`, `icon`, `color` (primary|success|warning|danger)
- Features:
  - Display stat with big number + small trend indicator (↑/↓)
  - Hover state with subtle shadow increase
  - Dark mode support via Tailwind `dark:` prefix
  - Icon from lucide-react on left side
- Example usage:
  ```tsx
  <KPICard
    title="Revenue"
    value="$12,450"
    trend={{ value: 12, direction: 'up' }}
    icon={DollarSign}
    color="primary"
  />
  ```

**2. Chart Components**
- Files: Create in `apps/portal-medspa/src/components/charts/`
  - `RevenueTrendChart.tsx` (line chart — revenue over 30 days)
  - `AppointmentTrendChart.tsx` (bar chart — appointments by day)
  - `RiskScoringChart.tsx` (gauge or donut — risk distribution)
  - `PatientStatusChart.tsx` (donut — patient status breakdown)
- Tech: Use Recharts library (lightweight, Tailwind-friendly)
- Data source: Query from `/api/reporting/metrics` endpoint
- Features:
  - Responsive (adapts to container width)
  - Dark mode support
  - Tooltip on hover
  - Legend below chart

**3. Dashboard Grid Layout**
- File: `apps/portal-medspa/src/components/dashboard/DashboardOverview.tsx` (REFACTOR)
- Structure:
  ```tsx
  <div className="grid gap-6">
    {/* KPI Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <KPICard ... />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RevenueTrendChart />
      <AppointmentTrendChart />
    </div>

    {/* More Charts Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RiskScoringChart />
      <PatientStatusChart />
    </div>

    {/* Quick Actions */}
    <div className="flex gap-3">
      <Button>Schedule New</Button>
      <Button variant="secondary">Add Patient</Button>
      <Button variant="secondary">View Calendar</Button>
    </div>
  </div>
  ```

#### Styling Details
- **Colors:** Use Tailwind's slate-50/100 for cards (light), slate-900/950 (dark)
- **Cards:** `rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6`
- **Shadows:** `shadow-sm hover:shadow-md transition-shadow`
- **Spacing:** 24px (6 units × 4px) between sections
- **Typography:** 
  - KPI value: `text-3xl font-bold`
  - KPI label: `text-sm text-slate-600 dark:text-slate-400`
  - Section title: `text-lg font-semibold mb-4`

#### Data Flow
1. Component mounts → fetch `/api/reporting/metrics`
2. Parse response for: revenue, patient count, appointment counts, risk data
3. Compute trends (compare to previous period)
4. Render KPI cards + charts
5. Error state: Show error card "Unable to load metrics" with retry button

#### Testing
- Unit test: Chart component renders with sample data
- Integration test: Dashboard loads, calls `/api/reporting/metrics`, displays data
- Visual regression: Compare light/dark mode screenshots
- Responsiveness: Test at 375px, 768px, 1440px breakpoints

---

### 1.2 Calendar/Scheduling Page

**Current State:**
- File: `apps/portal-medspa/src/app/dashboard/calendar/page.tsx`
- Component: `src/components/scheduling/StaffCalendar.tsx`
- Shows calendar with appointments

**Redesigned State:**

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Search | Theme Toggle | User Menu       │
├─────────────────────────────────────────────────────────┤
│  Sidebar | Main Content Area                            │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Calendar Header + Filters              │  │
│          │  │ [< Prev] [Month/Week View] [Today]     │  │
│          │  │ [Filter by: Provider / Room / Status]  │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Full Calendar Grid                     │  │
│          │  │ (Color-coded by service/provider)      │  │
│          │  │ Appointments draggable, clickable      │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Right Sidebar: Appointment Details     │  │
│          │  │ (appears on click)                     │  │
│          │  │ - Patient name, service                │  │
│          │  │ - Provider, room, time                 │  │
│          │  │ - Status, notes                        │  │
│          │  │ - Actions: Edit, Cancel, Complete      │  │
│          │  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components to Create/Modify

**1. Calendar Component (Wrapper)**
- File: `apps/portal-medspa/src/components/scheduling/ModernCalendar.tsx` (NEW)
- Use library: `react-big-calendar` or `react-calendar` (both Tailwind-friendly)
- Props: `clinicId`, `view` (month|week|day), `onSelectEvent`, `onSelectSlot`
- Features:
  - Month/week/day view toggle
  - Color-coded appointments (by service/provider)
  - Drag-to-reschedule appointments
  - Click to view details
  - Conflict detection (visual warning if double-booked)
  - Dark mode support

**2. Appointment Card (In-Calendar)**
- File: `apps/portal-medspa/src/components/scheduling/AppointmentCard.tsx` (NEW)
- Displays: Service name, patient initials, time, provider name
- Colors: Different color per service type (styling in Tailwind config)
- Hover: Show full details tooltip
- Click: Open details sidebar

**3. Appointment Details Sidebar**
- File: `apps/portal-medspa/src/components/scheduling/AppointmentDetailsSidebar.tsx` (NEW)
- Props: `appointment`, `onClose`, `onUpdate`
- Sections:
  - Patient info (name, phone, email)
  - Service (type, duration, price)
  - Provider + Room assignment
  - Time + Status badge
  - Notes section (editable)
  - Actions: Edit, Complete, Reschedule, Cancel
- Width: 400px (fixed), slides in from right on mobile
- Animations: Smooth slide-in/out

**4. Calendar Filters**
- File: `apps/portal-medspa/src/components/scheduling/CalendarFilters.tsx` (NEW)
- Filters:
  - By provider (multi-select dropdown)
  - By room (multi-select dropdown)
  - By status (Scheduled, In-Progress, Completed, Cancelled)
  - By service type
- Design: Horizontal filter bar with collapsible on mobile

#### Styling Details
- **Calendar cell:** `border border-slate-200 dark:border-slate-700 p-2 min-h-[80px]`
- **Appointment badges:** `rounded px-2 py-1 text-xs font-medium text-white`
  - Service color map: Define in Tailwind config
  - Example: Botox → blue-600, Massage → green-600, etc.
- **Sidebar:** `w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-lg`
- **Sidebar header:** `sticky top-0 p-6 border-b border-slate-200 dark:border-slate-800`

#### Data Flow
1. Component mounts → fetch appointments for clinic + date range
2. Query params: `?start=YYYY-MM-DD&end=YYYY-MM-DD&clinicId=XXX`
3. Render calendar with appointments
4. User clicks appointment → fetch full details (patient, service, notes) → show sidebar
5. User drags appointment → call `/api/appointments/reschedule` → update calendar
6. Conflict detection: On reschedule, check if slot is occupied → show warning modal

#### Testing
- Unit test: Calendar renders, shows appointments
- Integration test: Fetch appointments, display, click to view details
- Interaction test: Drag to reschedule, verify API call
- Conflict detection: Attempt to double-book, verify error handling
- Responsiveness: Sidebar should collapse on mobile, open as modal instead

---

### 1.3 Patient List & Management Page

**Current State:**
- File: `apps/portal-medspa/src/app/dashboard/patients/page.tsx`
- Component: `src/components/dashboard/PatientList.tsx`
- Shows table of patients

**Redesigned State:**

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Search | Theme Toggle | User Menu       │
├─────────────────────────────────────────────────────────┤
│  Sidebar | Main Content Area                            │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Page Header                            │  │
│          │  │ Patients (XXX total)                   │  │
│          │  │ [Search] [Advanced Filters ▼]          │  │
│          │  │ [+ Add Patient Button]                 │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
│          │  ┌────────────────────────────────────────┐  │
│          │  │ Data Table (or Card Grid on Mobile)    │  │
│          │  │ Columns:                               │  │
│          │  │ - Name | Phone | Status | Risk | ...   │  │
│          │  │ - Actions (inline): View, Edit, Msg    │  │
│          │  │                                        │  │
│          │  │ Pagination: 50 rows per page           │  │
│          │  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Components to Create/Modify

**1. Patient Table**
- File: `apps/portal-medspa/src/components/dashboard/PatientTable.tsx` (NEW)
- Use library: `@tanstack/react-table` (headless, Tailwind-friendly)
- Columns:
  - Name (clickable → opens patient detail modal)
  - Phone (formatted)
  - Email
  - Status badge (Active, Inactive, Cancelled)
  - Risk badge (High, Medium, Low)
  - Last appointment date
  - Actions (View, Edit, Message, Delete)
- Features:
  - Sortable columns
  - Filterable (search, status, risk)
  - Paginated (50 per page)
  - Responsive (scrollable on mobile, switches to card view)
  - Dark mode support
- Row styling: Alternating bg colors (white/slate-50), hover effect

**2. Patient Search & Filters**
- File: `apps/portal-medspa/src/components/dashboard/PatientFilters.tsx` (NEW)
- Elements:
  - Search input (real-time filter by name/phone/email)
  - Status filter (multi-select)
  - Risk level filter (multi-select)
  - Date range filter (Last appointment between X and Y)
  - Advanced toggle (shows more filters)
- Collapsible on mobile

**3. Add Patient Button & Modal**
- File: `apps/portal-medspa/src/components/dashboard/AddPatientModal.tsx` (NEW)
- Modal content: Quick form (name, phone, email, service type)
- Full form available via "Edit" after creation
- Validation: Phone format, email format
- Success: Show toast "Patient created" + refresh table

**4. Patient Detail Modal**
- File: `apps/portal-medspa/src/components/dashboard/PatientDetailModal.tsx` (NEW)
- Tabs:
  - **Info:** Name, phone, email, date of birth, address
  - **History:** Past appointments, services, treatments
  - **Risk:** Risk scores, flags, notes
  - **Intake:** Linked intake forms, completion status
- Actions: Edit, Message, Schedule Appointment, View Full Profile
- Right-align action buttons

#### Styling Details
- **Table header:** `bg-slate-100 dark:bg-slate-800 font-semibold text-sm`
- **Table row:** `border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition`
- **Status badge:** 
  - Active → `bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100`
  - Inactive → `bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100`
- **Risk badge:**
  - High → `bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100`
  - Medium → `bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100`
  - Low → `bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100`
- **Action buttons:** Ghost style with hover effect

#### Data Flow
1. Component mounts → fetch patients (paginated, clinic-scoped)
2. Query: `/api/patients?clinicId=XXX&page=1&limit=50&search=&status=&risk=`
3. Display table with data
4. User filters → refetch with new params
5. User clicks row → fetch full patient details → show modal
6. User adds patient → POST `/api/patients` → refresh table
7. Error handling: Show error toast if fetch fails, provide retry

#### Testing
- Unit test: Table renders with sample data
- Sorting test: Click column header, verify sort order changes
- Filtering test: Filter by status, verify only matching rows shown
- Pagination test: Navigate between pages
- Modal test: Click patient, details modal opens with correct data
- Mobile test: Verify responsive layout switches to card view

---

## Phase B: Design System

### Overview
Codify the patterns and components established in Phase A into a reusable design system. This ensures consistency across Phase C pages and future development.

### 2.1 Component Library Restructure

**Current State:**
- `packages/ui/` has basic components (Button, Input, Form, Table, Modal, Layout)

**Target State:**
- Migrate to **shadcn/ui** components as the base
- Extend with custom components built on top
- Support light/dark mode throughout
- All Tailwind-styled (no CSS-in-JS)

**Directory Structure (packages/ui/src/):**
```
packages/ui/src/
├── components/
│   ├── core/                    (shadcn base + customizations)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Form.tsx
│   │   ├── Dialog.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   └── Badge.tsx
│   │
│   ├── layout/                  (custom layout components)
│   │   ├── Header.tsx           (site header with logo, search, theme toggle, user menu)
│   │   ├── Sidebar.tsx          (navigation sidebar, collapsible)
│   │   ├── Card.tsx             (generic card wrapper)
│   │   ├── Container.tsx        (max-width content wrapper)
│   │   └── Grid.tsx             (responsive grid helper)
│   │
│   ├── data-display/            (tables, lists, charts)
│   │   ├── DataTable.tsx        (searchable, sortable table)
│   │   ├── KPICard.tsx          (stat card with trend)
│   │   ├── StatusBadge.tsx      (status indicator with color)
│   │   ├── RiskBadge.tsx        (risk level indicator)
│   │   └── ChartWrapper.tsx     (responsive chart container)
│   │
│   └── forms/                   (form-specific components)
│       ├── FormField.tsx        (wrapper with label + error)
│       ├── FormSection.tsx      (grouped form fields)
│       ├── DatePicker.tsx
│       └── MultiSelect.tsx
│
├── hooks/
│   ├── useTheme.ts             (theme state, toggle)
│   ├── useMobile.ts            (mobile breakpoint detection)
│   └── useResponsive.ts        (responsive layout helper)
│
├── constants/
│   ├── colors.ts               (color palette for services, statuses)
│   ├── spacing.ts              (spacing scale)
│   └── typography.ts           (font scales)
│
├── styles/
│   ├── globals.css             (Tailwind directives)
│   ├── animations.css          (custom animations)
│   └── utilities.css           (custom utilities)
│
└── index.ts                    (export all components)
```

### 2.2 Tailwind Configuration

**File:** `packages/ui/tailwind.config.ts`

Add custom theme extensions:
```ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Service type colors (for appointment badges)
        service: {
          botox: '#3b82f6',      // blue
          massage: '#10b981',    // green
          laser: '#f59e0b',      // amber
          skincare: '#ec4899',   // pink
          consultation: '#8b5cf6', // purple
        },
        // Status colors
        status: {
          active: '#10b981',
          inactive: '#6b7280',
          pending: '#f59e0b',
          cancelled: '#ef4444',
        },
        // Risk level colors
        risk: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#3b82f6',
        },
      },
      spacing: {
        // Add custom spacing if needed
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class', // Enable dark mode via class
  plugins: [],
};
```

### 2.3 Light/Dark Mode Setup

**File:** `apps/portal-medspa/src/app/layout.tsx`

Add theme provider:
```tsx
'use client';

import { ThemeProvider } from 'next-themes';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark mode detection script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' ||
                    (!localStorage.getItem('theme') &&
                     window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Install dependency:**
```bash
pnpm add next-themes
```

### 2.4 Design System Documentation

**File:** `packages/ui/README.md`

Document:
1. **Component inventory** — list all components with props, usage examples
2. **Color system** — color palette, usage rules
3. **Typography** — font scales, heading hierarchy
4. **Spacing system** — spacing scale, layout rules
5. **Dark mode** — how components support dark mode
6. **Responsive design** — breakpoints, mobile-first approach
7. **Accessibility** — ARIA patterns, keyboard navigation
8. **Examples** — full page examples (dashboard, table, form)

### 2.5 Component Storybook Setup (Optional but Recommended)

**File:** `packages/ui/storybook/Button.stories.tsx`

Add Storybook for visual component testing:
```bash
pnpm add -D storybook @storybook/react @storybook/addon-essentials
```

Create stories for each component to enable:
- Visual regression testing
- Component prop exploration
- Dark mode testing
- Responsive testing

---

## Phase C: Remaining Pages Roll-Out

### Overview
Apply Phase B design system patterns to remaining pages systematically. This phase is executed after Phase A+B are stable.

### 3.1 Pages to Redesign (Priority Order)

#### Priority 1: Authentication Pages (High Visibility)
- **Files:**
  - `apps/portal-medspa/src/app/auth/login/page.tsx`
  - `apps/portal-medspa/src/app/auth/signup/page.tsx`
  - `apps/portal-medspa/src/app/auth/forgot-password/page.tsx`
- **Changes:**
  - Redesign form layout (centered, card-based)
  - Add modern form styling with labels, hints, validation messages
  - Add "Sign in with magic link" option
  - Improve error messages (clear, actionable)
  - Light/dark mode support
  - Responsive (mobile-first)
- **Components to create:**
  - `AuthCard.tsx` — wrapper for auth forms
  - `AuthForm.tsx` — base form layout
  - `PasswordStrengthIndicator.tsx` — password validation UI
- **Skill:** `add-feature` (auth redesign)

#### Priority 2: Settings Pages (Stable, Less Traffic)
- **Files:**
  - `apps/portal-medspa/src/app/dashboard/settings/page.tsx` (clinic settings)
  - `apps/portal-medspa/src/app/dashboard/settings/billing/page.tsx`
  - `apps/portal-medspa/src/app/dashboard/settings/profile/page.tsx`
- **Changes:**
  - Sidebar navigation (Settings > Clinic / Billing / Profile / Integrations)
  - Settings form styling
  - Billing table styling (invoices, subscriptions)
  - Add confirmation dialogs for dangerous actions
- **Components to create:**
  - `SettingsSidebar.tsx` — settings nav
  - `SettingsSection.tsx` — form section wrapper
  - `BillingTable.tsx` — invoices/subscriptions table
- **Skill:** `modify-feature` (settings redesign)

#### Priority 3: Forms & Intake Pages
- **Files:**
  - `apps/portal-medspa/src/app/dashboard/forms/page.tsx` (form builder)
  - `apps/portal-medspa/src/app/patient/intake/[formId]/page.tsx` (intake form display)
- **Changes:**
  - Form builder UI — drag-and-drop, field preview
  - Intake form display — better layout, progress indicator
  - Validation styling (errors, success states)
- **Components:**
  - `FormBuilder.tsx` — visual form editor
  - `FormPreview.tsx` — live preview
  - `IntakeFormDisplay.tsx` — patient-facing form
- **Skill:** `modify-feature` (form redesign)

#### Priority 4: Marketplace & Feedback Pages
- **Files:**
  - `apps/portal-medspa/src/app/dashboard/marketplace/page.tsx`
  - `apps/portal-medspa/src/app/dashboard/feedback/page.tsx`
- **Changes:**
  - Marketplace: Card grid layout, filter sidebar, install modals
  - Feedback: Data table, charts (feedback sentiment, trends)
- **Components:**
  - `MarketplaceGrid.tsx` — card grid with filters
  - `ModuleCard.tsx` — module preview card
  - `FeedbackChart.tsx` — sentiment visualization
- **Skill:** `add-feature` or `modify-feature` (marketplace/feedback redesign)

#### Priority 5: Management Pages (Lower Priority)
- **Files:**
  - `apps/portal-medspa/src/app/dashboard/providers/page.tsx` (staff)
  - `apps/portal-medspa/src/app/dashboard/rooms/page.tsx`
  - `apps/portal-medspa/src/app/dashboard/audit-logs/page.tsx`
- **Changes:**
  - Reuse PatientTable pattern for staff/rooms/audit logs
  - Consistent table styling, filters, actions
- **Skill:** `simplify` (apply existing patterns)

### 3.2 Execution Process for Each Page

For each page redesign, follow this workflow:

1. **Create design spec** (Brainstorming skill)
   - Take a screenshot of current page
   - Sketch new layout
   - List component changes
   - Document new props/data flow

2. **Extract reusable components** (Skill routing)
   - Identify patterns from Phase A/B
   - Create new page-specific components in Phase B library
   - Update packages/ui/index.ts with exports

3. **Implement page** (modify-feature or add-feature skill)
   - Reuse components from @baseplate/ui
   - Replace old components with new
   - Preserve all API calls and data flows
   - Add dark mode support
   - Test responsiveness

4. **Test & Verify** (verify skill)
   - Run app, test page functionality
   - Verify all existing features work
   - Test light/dark mode
   - Test mobile responsiveness
   - Take before/after screenshots

5. **Deploy & Document** (commit-and-push skill)
   - Commit changes
   - Update MASTER_PROGRESS.md
   - Document any new props/APIs in component README

---

## Implementation Timeline & Token Management

### Phase A (Weeks 1-2): Core Pages
**Estimated effort:** 40-60 hours / 150K-200K tokens

**Weekly breakdown:**
- **Week 1:**
  - Day 1-2: Refactor @baseplate/ui → shadcn components (new components library)
  - Day 3: Implement KPI cards + charts (dashboard)
  - Day 4-5: Implement calendar page (full refactor)
  - Token budget: 80K
  
- **Week 2:**
  - Day 1-2: Implement patient table page
  - Day 3: Testing & responsive fixes
  - Day 4-5: Staging deploy + feedback
  - Token budget: 80K

**Skill routing for Phase A:**
- `add-feature` for new KPI card, chart, calendar components
- `modify-feature` for dashboard, calendar, patient list pages
- `verify` for testing each page after implementation
- `commit-and-push` for syncing changes

**Token saving tips:**
- Use Agent(subagent_type="Explore") for finding existing code patterns
- Use Agent(subagent_type="code-reviewer") for design review checkpoints
- Batch related questions into single messages
- Don't re-read files you just edited

### Phase B (Week 3): Design System
**Estimated effort:** 20-30 hours / 80K-100K tokens

- Day 1-2: Organize component library structure
- Day 3: Document design system (README, examples)
- Day 4: Set up Tailwind config, dark mode
- Day 5: Create Storybook (optional)

**Skill routing for Phase B:**
- `simplify` for refactoring component organization
- `sync-docs` for documenting design system
- No major implementation — mostly organization + docs

### Phase C (Weeks 4-6): Remaining Pages
**Estimated effort:** 60-80 hours / 200K-250K tokens

Execute per-page redesigns using pattern:
- `modify-feature` for each page
- `verify` after each page
- Batch 2-3 related pages per commit

**Skill routing for Phase C:**
- Apply same patterns from Phase A
- Reuse components from Phase B
- Use `simplify` for pages that can reuse PatientTable pattern

### Token Budget Summary
- **Total project:** ~450K tokens (feasible in 3-4 sessions)
- **Per session:** Target 120K tokens max (allows context compression)
- **Session handoff:** After each week, use `session-handoff` skill to summarize progress
- **Sub-agents:** Use Explore/code-reviewer agents for research tasks (don't pollute main context)

---

## Handoff Instructions for Another Agent

### If You Need to Resume This Project

1. **Read This Document First**
   - Full spec is in `Med Spa App/docs/FRONTEND_REDESIGN_SPEC.md`
   - Architecture is in `Med Spa App/ARCHITECTURE.md`

2. **Check Progress**
   - Open `Med Spa App/MASTER_PROGRESS.md` — shows what's complete
   - Run `git log --oneline | head -20` — see recent commits
   - Check git branch status

3. **Identify Current Phase**
   - If Phase A incomplete: Resume from incomplete pages
   - If Phase B incomplete: Skip to organizing components
   - If Phase C: Execute per-page redesigns

4. **Relevant Files to Read**
   - Current page impl: `apps/portal-medspa/src/app/dashboard/page.tsx`
   - Component library: `packages/ui/src/components/`
   - Design system config: `packages/ui/tailwind.config.ts`
   - Page components: `apps/portal-medspa/src/components/`

5. **Key Commands**
   ```bash
   pnpm dev              # Start dev server
   pnpm typecheck        # Verify no TS errors
   pnpm test             # Run tests
   pnpm build            # Full build check
   cd apps/portal-medspa && pnpm dev # Just frontend
   ```

6. **Which Skill to Use**
   - Continuing Phase A: `modify-feature` + `verify`
   - Creating design system: `simplify` + `sync-docs`
   - Phase C pages: `modify-feature` per page
   - Overall: Follow `Skill Routing Guide.md` if unsure

7. **Common Issues & Fixes**
   - **Tailwind not applying:** Check tailwind.config.ts imports, restart dev server
   - **Dark mode not working:** Verify ThemeProvider in layout.tsx, check `dark:` prefixes in Tailwind classes
   - **Components not exporting:** Update packages/ui/src/index.ts with new exports
   - **Tests failing:** Check if test setup needs Tailwind config update
   - **Type errors:** Ensure component props are fully typed (no `any`)

8. **Token Optimization During Handoff**
   - Use `session-handoff` skill to compress prior work
   - Create a `.claudeignore` excluding node_modules, dist, build artifacts
   - Document any architectural decisions made (save to project memory)
   - Leave MASTER_PROGRESS.md updated with exact line numbers of incomplete work

---

## Testing Strategy

### Unit Tests (Per Component)
- **Files:** `src/components/__tests__/*.test.tsx`
- **Coverage:** All @baseplate/ui components
- **Tools:** Vitest + React Testing Library
- **Example:**
  ```tsx
  describe('KPICard', () => {
    it('renders with title and value', () => {
      render(<KPICard title="Revenue" value="$1,000" />);
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    it('shows trend indicator when provided', () => {
      render(
        <KPICard
          title="Revenue"
          value="$1,000"
          trend={{ value: 12, direction: 'up' }}
        />
      );
      expect(screen.getByText(/12%/)).toBeInTheDocument();
    });
  });
  ```

### Integration Tests (Page Level)
- **Files:** `src/app/__tests__/*.test.tsx`
- **Coverage:** Full page functionality (fetch data, render, interact)
- **Example:**
  ```tsx
  describe('Dashboard Page', () => {
    it('loads and displays KPI cards', async () => {
      const { container } = render(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText('Revenue')).toBeInTheDocument();
      });
    });

    it('opens patient details modal on click', async () => {
      render(<PatientListPage />);
      const patientRow = await screen.findByText('John Doe');
      fireEvent.click(patientRow);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
  ```

### Visual Regression Tests
- **Tool:** Percy.io or similar
- **Coverage:** Phase A pages (dashboard, calendar, patients)
- **Process:**
  - Baseline: Take screenshots of redesigned pages
  - Regression: Auto-compare future changes against baseline
  - Breakpoints: Test at 375px, 768px, 1440px

### Responsive Testing
- **Breakpoints:** Test at Tailwind defaults (640px, 768px, 1024px, 1280px)
- **Mobile:** Verify sidebar collapses, tables switch to cards
- **Desktop:** Verify full layout renders correctly
- **Tools:** Chrome DevTools device emulation or physical devices

### Dark Mode Testing
- **Steps:**
  1. Enable dark mode in browser (or toggle in UI)
  2. Visually inspect contrast ratios (text legible)
  3. Verify `dark:` Tailwind classes apply correctly
  4. Check color consistency across light/dark
- **Accessibility:** Use WebAIM contrast checker

---

## Success Criteria

### Phase A Complete When:
- ✅ Dashboard, Calendar, Patient pages redesigned with new components
- ✅ All existing features work (no broken functionality)
- ✅ Light/dark mode works across all three pages
- ✅ Responsive at 375px, 768px, 1440px breakpoints
- ✅ Zero TypeScript errors (`pnpm typecheck`)
- ✅ Tests pass (`pnpm test`)
- ✅ Screenshots show clear visual improvement from original

### Phase B Complete When:
- ✅ Component library organized in `packages/ui/`
- ✅ All components documented in README
- ✅ Tailwind config supports light/dark mode
- ✅ 3+ example pages show consistent pattern reuse
- ✅ Design system docs are comprehensive

### Phase C Complete When:
- ✅ All remaining pages redesigned (auth, settings, forms, marketplace, audit logs, rooms, providers)
- ✅ All existing functionality preserved
- ✅ Light/dark mode works throughout
- ✅ Consistent visual language across entire app
- ✅ Responsive design verified
- ✅ Zero console errors/warnings
- ✅ MASTER_PROGRESS.md updated with completion

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Functionality breaks** | High | Comprehensive integration tests, staging deploy before production |
| **Performance degradation** | Medium | Bundle size monitoring, lazy-load charts/modals |
| **Dark mode contrast issues** | Medium | WCAG contrast checker, manual QA review |
| **Responsive layout breaks on edge devices** | Low | Test on actual devices (iOS Safari, Android Chrome) |
| **Token overspend** | Medium | Use sub-agents, compress logs, doc handoffs, avoid file re-reads |
| **Design inconsistency** | Low | Design system docs, component Storybook, code review |

---

## Files to Create/Modify Summary

### New Files (Phase A)
```
apps/portal-medspa/src/components/
├── charts/
│   ├── RevenueTrendChart.tsx
│   ├── AppointmentTrendChart.tsx
│   ├── RiskScoringChart.tsx
│   └── PatientStatusChart.tsx
├── dashboard/
│   ├── KPICard.tsx
│   └── DashboardOverview.tsx (refactor)
├── scheduling/
│   ├── ModernCalendar.tsx
│   ├── AppointmentCard.tsx
│   ├── AppointmentDetailsSidebar.tsx
│   └── CalendarFilters.tsx
└── dashboard/
    ├── PatientTable.tsx
    ├── PatientFilters.tsx
    ├── AddPatientModal.tsx
    └── PatientDetailModal.tsx

packages/ui/src/
├── components/
│   ├── core/ (shadcn components)
│   ├── layout/ (Header, Sidebar, Card, etc.)
│   ├── data-display/ (DataTable, KPICard, Badges, etc.)
│   └── forms/ (FormField, FormSection, etc.)
├── hooks/
│   ├── useTheme.ts
│   ├── useMobile.ts
│   └── useResponsive.ts
└── constants/
    ├── colors.ts
    ├── spacing.ts
    └── typography.ts
```

### Modified Files (Phase A)
```
apps/portal-medspa/
├── src/app/dashboard/page.tsx
├── src/app/dashboard/calendar/page.tsx
├── src/app/dashboard/patients/page.tsx
└── src/app/layout.tsx (add ThemeProvider)

packages/ui/
├── tailwind.config.ts
├── README.md
└── src/index.ts (update exports)
```

### Phase B & C
- Auth pages: Login, Signup, Forgot Password
- Settings pages: Clinic, Billing, Profile
- Forms & Intake pages: FormBuilder, IntakeFormDisplay
- Marketplace & Feedback pages: Grid, Cards, Charts
- Management pages: Providers, Rooms, Audit Logs

---

## Appendix: Example Component Implementation

### Example: KPICard Component

**File:** `apps/portal-medspa/src/components/dashboard/KPICard.tsx`

```tsx
import { LucideIcon } from 'lucide-react';
import { TrendUp, TrendDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  color = 'primary',
  className = '',
}: KPICardProps) {
  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };

  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend?.direction === 'up' ? TrendUp : TrendDown;

  return (
    <div
      className={`
        rounded-lg border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-950 p-6
        shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon size={16} />
              <span className="text-sm font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
```

**Usage:**
```tsx
<KPICard
  title="Revenue (30 days)"
  value="$12,450"
  trend={{ value: 12, direction: 'up' }}
  icon={DollarSign}
  color="success"
/>
```

---

## Conclusion

This spec provides a complete roadmap for redesigning the Med Spa App frontend with a modern, data-driven aesthetic. By following the Hybrid (Core-First) approach:

1. **Phase A** establishes visual standards on high-traffic pages
2. **Phase B** codifies patterns into a reusable design system
3. **Phase C** scales the design across the entire application

All existing functionality is preserved, and the design system is documented for future development and agent handoffs.

**Key files to track progress:**
- `MASTER_PROGRESS.md` — weekly status updates
- `FRONTEND_REDESIGN_SPEC.md` — this document
- Commit messages — detailed change descriptions
- Test coverage — component + integration tests

For questions or design changes, refer back to this spec and update as needed. Good luck!
