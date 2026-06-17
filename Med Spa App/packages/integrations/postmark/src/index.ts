import { ServerClient } from 'postmark';

function getPostmarkClient(): ServerClient {
  const token = process.env.POSTMARK_API_TOKEN;
  if (!token) throw new Error('Missing Postmark configuration: set POSTMARK_API_TOKEN');
  return new ServerClient(token);
}

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
}

export interface SendEmailResult {
  messageId: string;
}

/**
 * Send a transactional email via Postmark.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const from = process.env.POSTMARK_FROM_EMAIL;
  if (!from) throw new Error('Missing Postmark configuration: set POSTMARK_FROM_EMAIL');

  const client = getPostmarkClient();

  const result = await client.sendEmail({
    From: from,
    To: params.to,
    Subject: params.subject,
    HtmlBody: params.htmlBody
  });

  return { messageId: result.MessageID };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send an appointment confirmation email with a link to the intake form.
 */
export async function sendAppointmentConfirmationEmail(params: {
  to: string;
  patientName: string;
  scheduledTime: string;
  clinicName: string;
  intakeFormUrl?: string;
}): Promise<SendEmailResult> {
  const when = new Date(params.scheduledTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const safeName = escapeHtml(params.patientName);
  const safeClinic = escapeHtml(params.clinicName);

  const intakeSection = params.intakeFormUrl
    ? `<p>Please complete your intake form before your visit: <a href="${escapeHtml(params.intakeFormUrl)}">${escapeHtml(params.intakeFormUrl)}</a></p>`
    : '';

  return sendEmail({
    to: params.to,
    subject: `Appointment Confirmed at ${params.clinicName}`,
    htmlBody: `<p>Hi ${safeName},</p><p>Your appointment at ${safeClinic} is confirmed for ${when}.</p>${intakeSection}`
  });
}
