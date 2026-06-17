import { encryptData, decryptData, generateKey } from '../index';

describe('encryption module', () => {
  it('generates a 32-byte hex key', () => {
    const key = generateKey();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates a different key each time', () => {
    expect(generateKey()).not.toBe(generateKey());
  });

  it('encrypts and decrypts a round trip back to the original plaintext', () => {
    const key = generateKey();
    const plaintext = 'sensitive patient data: 555-1234';

    const ciphertext = encryptData(plaintext, key);
    expect(ciphertext).not.toBe(plaintext);

    const decrypted = decryptData(ciphertext, key);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for the same plaintext (random nonce)', () => {
    const key = generateKey();
    const plaintext = 'repeat me';

    const a = encryptData(plaintext, key);
    const b = encryptData(plaintext, key);

    expect(a).not.toBe(b);
  });

  it('throws when decrypting with the wrong key', () => {
    const key = generateKey();
    const wrongKey = generateKey();
    const ciphertext = encryptData('top secret', key);

    expect(() => decryptData(ciphertext, wrongKey)).toThrow('Decryption failed');
  });
});
