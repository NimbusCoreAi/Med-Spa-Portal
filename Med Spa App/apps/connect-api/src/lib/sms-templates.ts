interface TemplateParams {
  patientName: string;
  appointmentTime: string;
  clinicName: string;
  intakeUrl?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function buildSmsMessage(
  template: 'pre-appointment' | 'intake-reminder',
  params: TemplateParams
): string {
  const time = formatTime(params.appointmentTime);

  if (template === 'intake-reminder' && params.intakeUrl) {
    return `Hi ${params.patientName}, this is ${params.clinicName}. Please complete your intake form before your appointment on ${time}: ${params.intakeUrl}`;
  }

  return `Hi ${params.patientName}, this is ${params.clinicName}. Your appointment is scheduled for ${time}. Reply STOP to opt out.`;
}
