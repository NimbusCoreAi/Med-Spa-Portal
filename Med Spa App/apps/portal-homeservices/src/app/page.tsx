import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Home Services Portal</h1>
          <p className="mt-3 text-gray-600">
            HVAC, Plumbing & Cleaning management powered by Baseplate OS
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="block w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
