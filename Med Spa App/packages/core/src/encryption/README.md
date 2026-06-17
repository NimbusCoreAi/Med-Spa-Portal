# Encryption

Symmetric encryption utilities using NaCl Secretbox (XSalsa20 + Poly1305) via `tweetnacl`. Encrypts plaintext with a 32-byte key and returns hex-encoded `nonce || ciphertext`.

Part of `@baseplate/core`.

## Quick Start

```ts
import { encryptData, decryptData, generateKey } from '@baseplate/core/encryption';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `encryptData` | `(plaintext: string, key: string) => string` | Encrypt plaintext; returns hex `nonce\|\|ciphertext` |
| `decryptData` | `(ciphertext: string, key: string) => string` | Decrypt hex `nonce\|\|ciphertext`; returns plaintext |
| `generateKey` | `() => string` | Generate a new random 32-byte key (hex-encoded, 64 chars) |

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `plaintext` | `string` | UTF-8 string to encrypt |
| `key` | `string` | Hex-encoded 32-byte key (64 hex characters) |
| `ciphertext` | `string` | Hex-encoded `nonce\|\|ciphertext` from `encryptData` |

## Usage

```ts
import { encryptData, decryptData, generateKey } from '@baseplate/core/encryption';

// Generate a key (do this once, store securely)
const key = generateKey(); // → 'a1b2c3...'(64 hex chars)

// Encrypt
const encrypted = encryptData('sensitive data', key);
// → '9f8e7d...'(hex nonce + ciphertext)

// Decrypt
const decrypted = decryptData(encrypted, key);
// → 'sensitive data'
```

## Return Values

- **`encryptData`** — Hex string containing 24-byte nonce concatenated with ciphertext.
- **`decryptData`** — Original UTF-8 plaintext; throws `Error('Decryption failed')` if verification fails.
- **`generateKey`** — 64-character hex string (32 random bytes).

## Environment Variables

None — the key is passed as a parameter. Store generated keys securely (e.g., in a secrets manager).

> Vertical-agnostic — no med-spa-specific code.
