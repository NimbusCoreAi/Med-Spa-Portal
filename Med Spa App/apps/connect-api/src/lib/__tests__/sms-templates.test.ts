import { buildSmsMessage } from '../sms-templates';

describe('buildSmsMessage', () => {
  const baseParams = {
    patientName: 'Jane Doe',
    appointmentTime: '2024-06-15T14:00:00Z',
    clinicName: 'Glow Aesthetics',
  };

  describe('pre-appointment template', () => {
    it('builds a standard reminder message', () => {
      const message = buildSmsMessage('pre-appointment', baseParams);

      expect(message).toContain('Jane Doe');
      expect(message).toContain('Glow Aesthetics');
      expect(message).toContain('STOP');
    });

    it('does not include intake URL', () => {
      const message = buildSmsMessage('pre-appointment', {
        ...baseParams,
        intakeUrl: 'https://example.com/intake',
      });

      expect(message).not.toContain('intake');
    });
  });

  describe('intake-reminder template', () => {
    it('includes intake URL when provided', () => {
      const message = buildSmsMessage('intake-reminder', {
        ...baseParams,
        intakeUrl: 'https://example.com/intake',
      });

      expect(message).toContain('intake form');
      expect(message).toContain('https://example.com/intake');
    });

    it('falls back to pre-appointment message when no intake URL', () => {
      const message = buildSmsMessage('intake-reminder', baseParams);

      expect(message).not.toContain('intake');
      expect(message).toContain('STOP');
    });
  });

  describe('formatTime', () => {
    it('formats time in a human-readable format', () => {
      const message = buildSmsMessage('pre-appointment', {
        ...baseParams,
        appointmentTime: '2024-12-25T09:30:00Z',
      });

      expect(message).toContain('December');
      expect(message).toContain('25');
    });
  });
});
