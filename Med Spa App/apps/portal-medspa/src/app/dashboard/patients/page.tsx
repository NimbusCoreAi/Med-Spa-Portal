import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { PatientList } from '@/components/dashboard/PatientList';

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return <PatientList clinicId={ctx.clinicId} />;
}
