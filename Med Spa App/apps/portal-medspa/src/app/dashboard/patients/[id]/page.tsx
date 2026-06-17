import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { RiskPanel } from '@/components/risk-panel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function PatientDetailPage({ params }: PageProps) {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/patients"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Patients
        </Link>
        <h1 className="text-2xl font-bold mt-2">Patient Detail</h1>
      </div>

      <RiskPanel patientId={params.id} clinicId={ctx.clinicId} />
    </div>
  );
}
