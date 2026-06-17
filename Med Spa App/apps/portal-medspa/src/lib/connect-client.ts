/**
 * Typed helper for calling the Connect API from the portal.
 * All calls include the X-API-Key header automatically.
 */
export async function callConnectApi(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const baseUrl = process.env.CONNECT_API_URL;
  const apiKey = process.env.CONNECT_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('CONNECT_API_URL or CONNECT_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Connect API error (${response.status}): ${JSON.stringify(error)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
