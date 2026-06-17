import nacl from 'tweetnacl';
import { randomBytes } from 'crypto';

/**
 * Encrypt plaintext using a hex-encoded 32-byte key.
 * Returns hex-encoded `nonce || ciphertext`.
 */
export function encryptData(plaintext: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(
    new Uint8Array(Buffer.from(plaintext, 'utf-8')),
    nonce,
    new Uint8Array(keyBuffer)
  );

  const encryptedData = Buffer.concat([Buffer.from(nonce), Buffer.from(encrypted)]);
  return encryptedData.toString('hex');
}

/**
 * Decrypt a hex-encoded `nonce || ciphertext` string using a hex-encoded 32-byte key.
 */
export function decryptData(ciphertext: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const encryptedData = Buffer.from(ciphertext, 'hex');
  const nonce = encryptedData.subarray(0, nacl.secretbox.nonceLength);
  const encrypted = encryptedData.subarray(nacl.secretbox.nonceLength);

  const decrypted = nacl.secretbox.open(
    new Uint8Array(encrypted),
    new Uint8Array(nonce),
    new Uint8Array(keyBuffer)
  );
  if (!decrypted) throw new Error('Decryption failed');

  return Buffer.from(decrypted).toString('utf-8');
}

/**
 * Generate a new random 32-byte encryption key, hex-encoded.
 */
export function generateKey(): string {
  return randomBytes(32).toString('hex');
}
