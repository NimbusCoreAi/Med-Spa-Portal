# @baseplate/patterns

Reusable workflow patterns shared across verticals. Zero vertical-specific code —
consuming apps provide copy/content (e.g. consent text) as props.

## Modules

### `digital-signature`

`SignatureCapture` — captures a typed-name signature plus an explicit
consent checkbox, returning `{ typedName, agreed, signedAt }` on confirm.
Used by the Med Spa portal's patient intake flow to record consent.

```tsx
import { SignatureCapture } from '@baseplate/patterns/digital-signature';

<SignatureCapture
  consentText="I consent to the treatment described above."
  onSign={(value) => submitIntake({ ...formData, signedConsent: value.agreed })}
/>
```
