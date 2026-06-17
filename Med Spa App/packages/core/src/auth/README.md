# Auth

Authentication module for user login, sign-up, and logout via Supabase Auth.

Part of `@baseplate/core`.

## Quick Start

```ts
import { login, signUp, logout } from '@baseplate/core/auth';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `login` | `(params: LoginParams) => Promise<SupabaseAuthData>` | Log in with email + password |
| `signUp` | `(params: SignUpParams) => Promise<{ user, clinic }>` | Sign up a new user and create their clinic |
| `logout` | `() => Promise<void>` | Log out the current user |
| `LoginParams` | `{ email: string; password: string }` | Params for `login` |
| `SignUpParams` | `{ email: string; password: string; clinic_name: string; clinic_location?: string }` | Params for `signUp` |

## Usage

```ts
import { login, signUp, logout, type LoginParams, type SignUpParams } from '@baseplate/core/auth';

// Sign up — creates an auth user and a clinic record
const { user, clinic } = await signUp({
  email: 'owner@clinic.com',
  password: 'securePassword123',
  clinic_name: 'Glow Aesthetics',
  clinic_location: 'Austin, TX',
});

// Log in an existing user
const params: LoginParams = { email: 'owner@clinic.com', password: 'securePassword123' };
const session = await login(params);

// Log out
await logout();
```

## Return Values

- **`login`** — Returns the Supabase `signInWithPassword` data object (session, user, etc.).
- **`signUp`** — Returns `{ user: User; clinic: ClinicRow }` where `clinic` is the newly inserted `clinics` record.
- **`logout`** — Returns `void`; throws on failure.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Yes (one) | Supabase project URL |
| `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (one) | Supabase anon key |

> Vertical-agnostic — no med-spa-specific code.
