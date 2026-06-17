import { getServiceSupabaseClient } from '@baseplate/core';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
}

export default async function FeedbackPage() {
  let feedback: FeedbackItem[] = [];
  let error: string | null = null;

  try {
    const supabase = getServiceSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: staff } = await supabase.from('staff').select('clinic_id').eq('id', user.id).single();
      if (staff?.clinic_id) {
        const { data } = await supabase
          .from('feedback')
          .select('*')
          .eq('clinic_id', staff.clinic_id)
          .order('created_at', { ascending: false });
        feedback = (data as FeedbackItem[]) ?? [];
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load feedback';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="mt-1 text-sm text-gray-600">Submit bugs, feature requests, and improvements.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {feedback.length === 0 && !error ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No feedback yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Use the feedback button (bottom-right) to submit your first piece of feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                    {item.category}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    item.priority === 'high' || item.priority === 'critical'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium capitalize text-blue-700">
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
