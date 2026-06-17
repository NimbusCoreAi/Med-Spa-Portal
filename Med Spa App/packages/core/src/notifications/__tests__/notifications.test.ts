import { sendAppointmentConfirmation, EmailService, SmsService } from '../index';

describe('notifications module', () => {
  const mockEmailService: EmailService = {
    sendAppointmentConfirmationEmail: jest.fn().mockResolvedValue({ messageId: 'msg-123' }),
  };
  const mockSmsService: SmsService = {
    sendAppointmentReminderSMS: jest.fn().mockResolvedValue({ messageSid: 'SM123' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends both email and SMS when both are provided', async () => {
    const result = await sendAppointmentConfirmation(
      {
        clinicName: 'Glow Spa',
        patientName: 'Jane Doe',
        scheduledTime: '2024-01-15T10:00:00Z',
        email: 'jane@example.com',
        phone: '+1234567890',
      },
      mockEmailService,
      mockSmsService
    );

    expect(result.email).toEqual({ messageId: 'msg-123' });
    expect(result.sms).toEqual({ messageSid: 'SM123' });
    expect(mockEmailService.sendAppointmentConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(mockSmsService.sendAppointmentReminderSMS).toHaveBeenCalledTimes(1);
  });

  it('sends only email when no phone', async () => {
    const result = await sendAppointmentConfirmation(
      {
        clinicName: 'Glow Spa',
        patientName: 'Jane Doe',
        scheduledTime: '2024-01-15T10:00:00Z',
        email: 'jane@example.com',
      },
      mockEmailService,
      mockSmsService
    );

    expect(result.email).toBeDefined();
    expect(result.sms).toBeUndefined();
    expect(mockSmsService.sendAppointmentReminderSMS).not.toHaveBeenCalled();
  });

  it('sends only SMS when no email', async () => {
    const result = await sendAppointmentConfirmation(
      {
        clinicName: 'Glow Spa',
        patientName: 'Jane Doe',
        scheduledTime: '2024-01-15T10:00:00Z',
        phone: '+1234567890',
      },
      mockEmailService,
      mockSmsService
    );

    expect(result.email).toBeUndefined();
    expect(result.sms).toBeDefined();
    expect(mockEmailService.sendAppointmentConfirmationEmail).not.toHaveBeenCalled();
  });

  it('sends nothing when no services', async () => {
    const result = await sendAppointmentConfirmation({
      clinicName: 'Glow Spa',
      patientName: 'Jane Doe',
      scheduledTime: '2024-01-15T10:00:00Z',
      email: 'jane@example.com',
      phone: '+1234567890',
    });

    expect(result).toEqual({});
  });

  it('passes intakeFormUrl to email service', async () => {
    await sendAppointmentConfirmation(
      {
        clinicName: 'Glow Spa',
        patientName: 'Jane Doe',
        scheduledTime: '2024-01-15T10:00:00Z',
        email: 'jane@example.com',
        intakeFormUrl: 'https://example.com/intake/123',
      },
      mockEmailService,
      mockSmsService
    );

    expect(mockEmailService.sendAppointmentConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ intakeFormUrl: 'https://example.com/intake/123' })
    );
  });
});
