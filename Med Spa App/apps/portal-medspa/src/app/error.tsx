'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center max-w-lg">
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        <pre className="mt-4 rounded-md bg-gray-100 p-4 text-left text-xs text-red-600 overflow-auto whitespace-pre-wrap break-all">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ''}
          {process.env.NODE_ENV === 'development' && error.stack ? `\n\n${error.stack}` : ''}
        </pre>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
