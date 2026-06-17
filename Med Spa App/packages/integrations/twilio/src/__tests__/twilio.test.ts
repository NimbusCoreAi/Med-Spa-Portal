const mockMessagesCreate = jest.fn();

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate }
  }));
});

import { sendSMS, sendAppointmentReminderSMS } from '../index';

describe('twilio integration', () => {
  beforeEach(() => {
    process.env.TWILIO_ACCOUNT_SID = 'AC123';
    process.env.TWILIO_AUTH_TOKEN = 'token123';
    process.env.TWILIO_PHONE_NUMBER = '+15555550100';
    jest.clearAllMocks();
  });

  describe('sendSMS', () => {
    it('sends an SMS and returns the message sid', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM123' });

      const result = await sendSMS({ to: '+15555550200', body: 'Hello' });

      expect(mockMessagesCreate).toHaveBeenCalledWith({
        from: '+15555550100',
        to: '+15555550200',
        body: 'Hello'
      });
      expect(result).toEqual({ sid: 'SM123' });
    });

    it('throws when TWILIO_ACCOUNT_SID is missing', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      await expect(sendSMS({ to: '+15555550200', body: 'Hello' })).rejects.toThrow(
        'Missing Twilio configuration: set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN'
      );
    });

    it('throws when TWILIO_PHONE_NUMBER is missing', async () => {
      delete process.env.TWILIO_PHONE_NUMBER;

      await expect(sendSMS({ to: '+15555550200', body: 'Hello' })).rejects.toThrow(
        'Missing Twilio configuration: set TWILIO_PHONE_NUMBER'
      );
    });
  });

  describe('sendAppointmentReminderSMS', () => {
    it('sends a reminder SMS with the formatted appointment time', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM456' });

      const result = await sendAppointmentReminderSMS({
        to: '+15555550200',
        patientName: 'Jane',
        scheduledTime: '2026-07-06T09:00:00.000Z',
        clinicName: 'Glow Med Spa'
      });

      const call = mockMessagesCreate.mock.calls[0][0];
      expect(call.to).toBe('+15555550200');
      expect(call.body).toContain('Jane');
      expect(call.body).toContain('Glow Med Spa');
      expect(result).toEqual({ sid: 'SM456' });
    });
  });
});
