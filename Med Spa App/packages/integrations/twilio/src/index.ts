import twilio from 'twilio';

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio configuration: set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }

  return twilio(accountSid, authToken);
}

export interface SendSmsParams {
  to: string;
  body: string;
}

export interface SendSmsResult {
  sid: string;
}

/**
 * Send an SMS via Twilio.
 */
export async function sendSMS(params: SendSmsParams): Promise<SendSmsResult> {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) throw new Error('Missing Twilio configuration: set TWILIO_PHONE_NUMBER');

  const client = getTwilioClient();

  const message = await client.messages.create({
    from,
    to: params.to,
    body: params.body
  });

  return { sid: message.sid };
}

/**
 * Send an appointment reminder SMS.
 */
export async function sendAppointmentReminderSMS(params: {
  to: string;
  patientName: string;
  scheduledTime: string;
  clinicName: string;
}): Promise<SendSmsResult> {
  const when = new Date(params.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return sendSMS({
    to: params.to,
    body: `Hi ${params.patientName}, this is a reminder of your appointment at ${params.clinicName} on ${when}.`
  });
}
