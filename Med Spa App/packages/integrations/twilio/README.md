# Twilio Integration

SMS integration via Twilio — sends raw text messages and pre-templated appointment reminder SMS.

Part of `@baseplate/integrations` (`@baseplate/twilio`).

## Quick Start

```ts
import { sendSMS, sendAppointmentReminderSMS } from '@baseplate/twilio';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `sendSMS` | `(params: SendSmsParams) => Promise<SendSmsResult>` | Send an SMS message |
| `sendAppointmentReminderSMS` | `(params: AppointmentReminderParams) => Promise<SendSmsResult>` | Send a templated reminder SMS |
| `SendSmsParams` | `{ to: string; body: string }` | Params for `sendSMS` |
| `SendSmsResult` | `{ sid: string }` | Twilio message SID |

### `AppointmentReminderParams` (inline)

```ts
{
  to: string;
  patientName: string;
  scheduledTime: string;   // ISO date string
  clinicName: string;
}
```

## Usage

```ts
import { sendSMS, sendAppointmentReminderSMS } from '@baseplate/twilio';

// Send a raw SMS
await sendSMS({
  to: '+15125551234',
  body: 'Your code is 123456',
});

// Send an appointment reminder
const { sid } = await sendAppointmentReminderSMS({
  to: '+15125551234',
  patientName: 'Jane Doe',
  scheduledTime: '2026-06-20T14:00:00Z',
  clinicName: 'Glow Aesthetics',
});
```

## Return Values

- **`sendSMS`** — `{ sid: string }` (the Twilio message resource SID).
- **`sendAppointmentReminderSMS`** — Delegates to `sendSMS` after formatting the message body; returns the same `{ sid }`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | Sender phone number (Twilio number) |

> Vertical-agnostic — no med-spa-specific code.
