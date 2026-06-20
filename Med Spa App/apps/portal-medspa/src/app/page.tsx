import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@baseplate/ui/button';

export default function HomePage() {
  // ⚠️ TEMP: auth bypassed for testing. Remove this redirect to restore login.
  redirect('/dashboard');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-4xl font-bold">Baseplate Med Spa Portal</h1>
      <p className="max-w-md text-gray-600">
        HIPAA-compliant intake, scheduling, and payments for med spas.
      </p>
      <div className="flex gap-4">
        <Link href="/auth/login">
          <Button variant="primary">Login</Button>
        </Link>
        <Link href="/auth/signup">
          <Button variant="secondary">Sign Up</Button>
        </Link>
      </div>
    </main>
  );
}
