import { IntakeFormRenderer } from '@/components/forms/IntakeFormRenderer';

export default function PatientIntakePage({
  params,
  searchParams
}: {
  params: { formId: string };
  searchParams: { appointmentId?: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <IntakeFormRenderer formId={params.formId} appointmentId={searchParams.appointmentId} />
    </div>
  );
}
