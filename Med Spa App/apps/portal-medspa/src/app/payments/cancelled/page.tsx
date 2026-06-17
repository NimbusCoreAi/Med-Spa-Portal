import Link from 'next/link';
import { Card } from '@baseplate/ui/layout';

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-gray-600">Your payment was not completed. No charges have been made.</p>
        <Link
          href="/dashboard"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </Card>
    </div>
  );
}
