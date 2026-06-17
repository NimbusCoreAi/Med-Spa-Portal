export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Baseplate Connect API</h1>
      <p>Health check: <a href="/api/health">/api/health</a></p>
      <p>Endpoints:</p>
      <ul>
        <li>POST /api/v1/communications/sms-reminder</li>
        <li>POST /api/v1/billing/package-deduct</li>
        <li>POST /api/v1/reporting/treatment-metrics</li>
      </ul>
    </main>
  );
}
