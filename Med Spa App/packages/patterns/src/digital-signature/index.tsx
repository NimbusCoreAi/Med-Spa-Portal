import React, { useState } from 'react';

export interface SignatureValue {
  /** Typed full name acting as the signature. */
  typedName: string;
  /** Whether the signer has checked the consent acknowledgement. */
  agreed: boolean;
  /** ISO timestamp the signature was captured, set on confirm. */
  signedAt?: string;
}

export interface SignatureCaptureProps {
  /** Consent / agreement text shown above the signature input. */
  consentText: string;
  /** Called with the captured signature once the signer confirms. */
  onSign: (value: SignatureValue) => void;
  /** Disable the confirm button (e.g. while submitting). */
  disabled?: boolean;
}

/**
 * Lightweight digital-signature capture: the signer types their full legal
 * name and checks an agreement box, which is recorded with a timestamp.
 * Vertical-agnostic — consentText is provided by the caller.
 */
export function SignatureCapture({ consentText, onSign, disabled }: SignatureCaptureProps) {
  const [typedName, setTypedName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const canConfirm = typedName.trim().length > 0 && agreed && !disabled;

  function handleConfirm() {
    if (!canConfirm) return;
    onSign({ typedName: typedName.trim(), agreed, signedAt: new Date().toISOString() });
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-gray-300 p-4">
      <p className="text-sm text-gray-700">{consentText}</p>

      <label htmlFor="signature-typed-name" className="text-sm font-medium text-gray-700">
        Type your full name to sign
      </label>
      <input
        id="signature-typed-name"
        type="text"
        value={typedName}
        onChange={(e) => setTypedName(e.target.value)}
        placeholder="Full legal name"
        className="rounded border border-gray-300 px-3 py-2 text-base font-signature focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        I have read and agree to the above.
      </label>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Confirm Signature
      </button>
    </div>
  );
}
