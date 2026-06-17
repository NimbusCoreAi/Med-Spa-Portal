export const metadata = {
  title: 'Baseplate Connect API',
  description: 'Unified API for B2B integrations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
