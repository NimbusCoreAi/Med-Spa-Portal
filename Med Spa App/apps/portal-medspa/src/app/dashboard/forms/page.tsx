import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { FormBuilder } from '@/components/forms/FormBuilder';
import { PageLayout } from '@baseplate/ui/layout';

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return (
    <PageLayout className="p-8">
      <h1 className="text-2xl font-bold mb-6">Intake Forms</h1>
      <FormBuilder clinicId={ctx.clinicId} />
    </PageLayout>
  );
}
