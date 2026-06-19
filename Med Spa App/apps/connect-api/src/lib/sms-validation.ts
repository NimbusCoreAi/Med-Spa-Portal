// SMS destination validation helpers for the Connect API.
//
// The SMS reminder endpoint accepts a caller-supplied recipient (`patient_phone`),
// a clinic display name, and (for intake reminders) an `intake_url`. Without
// validation these enable SMS-pumping / toll fraud and phishing (a clinic key
// can text an arbitrary number with an arbitrary link). These helpers enforce:
//   1. E.164 phone format (limits junk and clearly-invalid numbers)
//   2. An allowlist of permitted intake_url hosts (stops arbitrary phishing links)
//
// Per-clinic daily volume is capped separately in rate-limit.ts (checkSmsDailyLimit).

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function isE164(phone: string): boolean {
  return E164_REGEX.test(phone.trim());
}

/**
 * Permitted hosts for the `intake_url` embedded in SMS bodies.
 *
 * Sourced from CONNECT_INTAKE_URL_ALLOWLIST (comma-separated, e.g.
 * "intake.baseplate.app,baseplate.app"). When unset, this returns an empty
 * array and isAllowedIntakeUrl falls back to allowing any URL so existing
 * deployments keep working — production should set the env to lock this down.
 */
export function getAllowedIntakeHosts(): string[] {
  const raw = process.env.CONNECT_INTAKE_URL_ALLOWLIST;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedIntakeUrl(url: string): boolean {
  const allowlist = getAllowedIntakeHosts();
  if (allowlist.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[sms] CONNECT_INTAKE_URL_ALLOWLIST not set; intake_url not host-restricted');
    }
    return true;
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowlist.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}
