# Postmark Integration

Transactional email integration via Postmark — sends raw HTML emails and pre-templated appointment confirmation emails.

Part of `@baseplate/integrations` (`@baseplate/postmark`).

## Quick Start

```ts
import { sendEmail, sendAppointmentConfirmationEmail } from '@baseplate/postmark';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `sendEmail` | `(params: SendEmailParams) => Promise<SendEmailResult>` | Send a transactional email |
| `sendAppointmentConfirmationEmail` | `(params: AppointmentConfirmationParams) => Promise<SendEmailResult>` | Send a templated confirmation email |
| `SendEmailParams` | `{ to: string; subject: string; htmlBody: string }` | Params for `sendEmail` |
| `SendEmailResult` | `{ messageId: string }` | Postmark message ID |

### `AppointmentConfirmationParams` (inline)

```ts
{
  to: string;
  patientName: string;
  scheduledTime: string;   // ISO date string
  clinicName: string;
  intakeFormUrl?: string;  // optional link included in the email body
}
```

## Usage

```ts
import { sendEmail, sendAppointmentConfirmationEmail } from '@baseplate/postmark';

// Send a raw HTML email
await sendEmail({
  to: 'patient@example.com',
  subject: 'Welcome',
  htmlBody: '<p>Thanks for signing up!</p>',
});

// Send a confirmation email with an intake form link
const { messageId } = await sendAppointmentConfirmationEmail({
  to: 'patient@example.com',
  patientName: 'Jane Doe',
  scheduledTime: '2026-06-20T14:00:00Z',
  clinicName: 'Glow Aesthetics',
  intakeFormUrl: 'https://app.example.com/intake/abc123',
});
```

## Return Values

- **`sendEmail`** — `{ messageId: string }` (the Postmark `MessageID`).
- **`sendAppointmentConfirmationEmail`** — Delegates to `sendEmail` after formatting the date and HTML body; returns the same `{ messageId }`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTMARK_API_TOKEN` | Yes | Postmark server API token |
| `POSTMARK_FROM_EMAIL` | Yes | Sender email address |

> Vertical-agnostic — no med-spa-specific code.
