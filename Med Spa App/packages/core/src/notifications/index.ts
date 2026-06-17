export interface SendConfirmationParams {
  clinicName: string;
  patientName: string;
  scheduledTime: string;
  email?: string;
  phone?: string;
  intakeFormUrl?: string;
}

export interface NotificationResult {
  email?: { messageId: string };
  sms?: { messageSid: string };
}

export interface EmailService {
  sendAppointmentConfirmationEmail(params: {
    to: string;
    patientName: string;
    scheduledTime: string;
    clinicName: string;
    intakeFormUrl?: string;
  }): Promise<{ messageId: string }>;
}

export interface SmsService {
  sendAppointmentReminderSMS(params: {
    to: string;
    patientName: string;
    scheduledTime: string;
    clinicName: string;
  }): Promise<{ messageSid: string }>;
}

/**
 * Send appointment confirmation via email and/or SMS.
 * Services are injected to keep this module decoupled from specific providers.
 */
export async function sendAppointmentConfirmation(
  params: SendConfirmationParams,
  emailService?: EmailService,
  smsService?: SmsService
): Promise<NotificationResult> {
  const results: NotificationResult = {};

  if (params.email && emailService) {
    results.email = await emailService.sendAppointmentConfirmationEmail({
      to: params.email,
      patientName: params.patientName,
      scheduledTime: params.scheduledTime,
      clinicName: params.clinicName,
      intakeFormUrl: params.intakeFormUrl,
    });
  }

  if (params.phone && smsService) {
    results.sms = await smsService.sendAppointmentReminderSMS({
      to: params.phone,
      patientName: params.patientName,
      scheduledTime: params.scheduledTime,
      clinicName: params.clinicName,
    });
  }

  return results;
}
