'use client';

import { useState, useEffect, useCallback } from 'react';

function ChatBubbleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'question', label: 'Question' },
  { value: 'complaint', label: 'Complaint' },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('improvement');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [pastFeedback, setPastFeedback] = useState<FeedbackItem[]>([]);

  const loadFeedback = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setPastFeedback(data.items ?? []);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Failed to load feedback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadFeedback();
    }
  }, [open, loadFeedback]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMessage('');
        setTimeout(() => {
          setSubmitted(false);
          setOpen(false);
        }, 2000);
        loadFeedback();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Submit feedback"
      >
        <ChatBubbleIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white dark:bg-slate-950 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Feedback"
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-50">Feedback</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300"
                aria-label="Close feedback"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {submitted ? (
                <div className="py-8 text-center">
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">Thank you!</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Your feedback has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fb-category" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      id="fb-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fb-message" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Message
                    </label>
                    <textarea
                      id="fb-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                      placeholder="Tell us what's on your mind..."
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}

              {pastFeedback.length > 0 && !submitted && (
                <div className="mt-6 border-t border-gray-200 dark:border-slate-800 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Recent Feedback
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {pastFeedback.slice(0, 5).map((item) => (
                      <li key={item.id} className="rounded-md bg-gray-50 dark:bg-slate-900 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium capitalize text-gray-700 dark:text-slate-300">{item.category}</span>
                          <span
                            className={`text-xs font-medium ${
                              item.priority === 'high' || item.priority === 'critical'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-400 dark:text-slate-500'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{item.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
