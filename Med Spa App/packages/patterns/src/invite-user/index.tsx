'use client';

import React, { useState } from 'react';
import { Input } from '@baseplate/ui/input';
import { Button } from '@baseplate/ui/button';
import { Card } from '@baseplate/ui/layout';

export interface InviteUserProps {
  onInvite: (params: { email: string; role: string }) => Promise<void>;
  roles?: string[];
}

/**
 * Invite form for sending team-member invitations. Collects an email and role,
 * calls onInvite, and surfaces loading, error, and success states.
 */
export function InviteUser({ onInvite, roles = ['staff', 'admin'] }: InviteUserProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onInvite({ email: email.trim(), role });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@clinic.com"
          required
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="invite-role" className="text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Invitation sent successfully.</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Invitation'}
        </Button>
      </form>
    </Card>
  );
}
