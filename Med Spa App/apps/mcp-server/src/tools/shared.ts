export async function callConnectApi(
  apiKey: string,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const baseUrl = process.env.CONNECT_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Connect API error (${res.status}): ${JSON.stringify(err)}`);
  }
  return res.json();
}
