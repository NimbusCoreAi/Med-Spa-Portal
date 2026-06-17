# @baseplate/ui

Reusable, Tailwind-styled UI components shared across Baseplate apps.

## Components

- **Button** — `import { Button } from '@baseplate/ui/button'`
- **Input** — `import { Input } from '@baseplate/ui/input'`
- **Form** — generic field-driven form renderer, `import { Form } from '@baseplate/ui/form'`
- **Table** — generic data table, `import { Table } from '@baseplate/ui/table'`
- **Modal** — `import { Modal } from '@baseplate/ui/modal'`
- **PageLayout / Card** — `import { PageLayout, Card } from '@baseplate/ui/layout'`

All components are vertical-agnostic — no med spa specific fields or copy. Consuming apps (e.g. `apps/portal-medspa`) supply their own field definitions and content.

## Styling

Components use Tailwind utility classes. Consuming apps must include `../../packages/ui/src/**/*.{js,ts,jsx,tsx}` in their `tailwind.config.js` `content` array so classes aren't purged.
