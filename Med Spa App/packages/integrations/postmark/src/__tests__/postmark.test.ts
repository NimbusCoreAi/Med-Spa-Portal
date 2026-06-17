const mockSendEmail = jest.fn();

jest.mock('postmark', () => ({
  ServerClient: jest.fn().mockImplementation(() => ({
    sendEmail: mockSendEmail
  }))
}));

import { sendEmail, sendAppointmentConfirmationEmail } from '../index';

describe('postmark integration', () => {
  beforeEach(() => {
    process.env.POSTMARK_API_TOKEN = 'token-123';
    process.env.POSTMARK_FROM_EMAIL = 'no-reply@clinic.com';
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('sends an email and returns the message id', async () => {
      mockSendEmail.mockResolvedValue({ MessageID: 'msg-1' });

      const result = await sendEmail({ to: 'jane@example.com', subject: 'Hi', htmlBody: '<p>Hi</p>' });

      expect(mockSendEmail).toHaveBeenCalledWith({
        From: 'no-reply@clinic.com',
        To: 'jane@example.com',
        Subject: 'Hi',
        HtmlBody: '<p>Hi</p>'
      });
      expect(result).toEqual({ messageId: 'msg-1' });
    });

    it('throws when POSTMARK_API_TOKEN is missing', async () => {
      delete process.env.POSTMARK_API_TOKEN;

      await expect(sendEmail({ to: 'jane@example.com', subject: 'Hi', htmlBody: '<p>Hi</p>' })).rejects.toThrow(
        'Missing Postmark configuration: set POSTMARK_API_TOKEN'
      );
    });

    it('throws when POSTMARK_FROM_EMAIL is missing', async () => {
      delete process.env.POSTMARK_FROM_EMAIL;

      await expect(sendEmail({ to: 'jane@example.com', subject: 'Hi', htmlBody: '<p>Hi</p>' })).rejects.toThrow(
        'Missing Postmark configuration: set POSTMARK_FROM_EMAIL'
      );
    });
  });

  describe('sendAppointmentConfirmationEmail', () => {
    it('sends a confirmation email including the intake form link', async () => {
      mockSendEmail.mockResolvedValue({ MessageID: 'msg-2' });

      const result = await sendAppointmentConfirmationEmail({
        to: 'jane@example.com',
        patientName: 'Jane',
        scheduledTime: '2026-07-06T09:00:00.000Z',
        clinicName: 'Glow Med Spa',
        intakeFormUrl: 'https://app.example.com/patient/intake/form-1'
      });

      expect(mockSendEmail).toHaveBeenCalled();
      const call = mockSendEmail.mock.calls[0][0];
      expect(call.To).toBe('jane@example.com');
      expect(call.Subject).toContain('Glow Med Spa');
      expect(call.HtmlBody).toContain('https://app.example.com/patient/intake/form-1');
      expect(result).toEqual({ messageId: 'msg-2' });
    });

    it('sends a confirmation email without an intake form link', async () => {
      mockSendEmail.mockResolvedValue({ MessageID: 'msg-3' });

      await sendAppointmentConfirmationEmail({
        to: 'jane@example.com',
        patientName: 'Jane',
        scheduledTime: '2026-07-06T09:00:00.000Z',
        clinicName: 'Glow Med Spa'
      });

      const call = mockSendEmail.mock.calls[0][0];
      expect(call.HtmlBody).not.toContain('intake');
    });
  });
});
