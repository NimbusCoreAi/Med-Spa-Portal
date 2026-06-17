import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Home Services Portal',
  description: 'HVAC, Plumbing & Cleaning management powered by Baseplate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
