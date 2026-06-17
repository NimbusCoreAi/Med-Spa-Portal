import { getSubscription } from '@baseplate/core';
import { getServiceSupabaseClient } from '@baseplate/core';
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton';

export const dynamic = 'force-dynamic';

export default async function BillingSettingsPage() {
  let subscription: Awaited<ReturnType<typeof getSubscription>> = null;
  let error: string | null = null;

  try {
    const supabase = getServiceSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: staff } = await supabase.from('staff').select('clinic_id').eq('id', user.id).single();
      if (staff?.clinic_id) {
        subscription = await getSubscription(supabase, staff.clinic_id);
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load subscription';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your subscription and billing details.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
        {subscription ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900 capitalize">{subscription.plan}</span> plan
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium capitalize">{subscription.status}</span>
            </p>
            {subscription.current_period_end && (
              <p className="text-sm text-gray-600">
                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <ManageSubscriptionButton />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              You&apos;re on the free pilot plan. Upgrade to unlock Connect API and priority support.
            </p>
            <a
              href="/pricing"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
