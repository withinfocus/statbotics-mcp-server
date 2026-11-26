// Server logs go to stderr. stdout carries the stdio JSON-RPC stream, and the
// MCP `notifications/message` logging channel is deprecated as of protocol
// 2026-07-28 (SEP-2577) in favor of stderr for stdio servers.
export async function log(
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error',
  data: unknown,
): Promise<void> {
  console.error(`[${level}]`, data);
}

/**
 * The Statbotics API key from STATBOTICS_API_KEY, or undefined when it is
 * unset or blank. The key is optional: it is sent as the X-API-Key header
 * when present. Keys come from https://www.statbotics.io/apikey and are
 * rate limited to 100 requests per minute.
 */
export function getApiKey(): string | undefined {
  const key = process.env['STATBOTICS_API_KEY']?.trim();
  return key ? key : undefined;
}

// Added to 401 and 403 errors, which Statbotics returns for a missing,
// invalid, or revoked key.
const API_KEY_HINT =
  'Set STATBOTICS_API_KEY to a key from https://www.statbotics.io/apikey.';

export async function makeApiRequest(endpoint: string): Promise<unknown> {
  try {
    const url = `https://api.statbotics.io${endpoint}`;
    const apiKey = getApiKey();

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
    });

    if (!response.ok) {
      // statusText can be empty (it is under Node 26's fetch).
      const status = [response.status, response.statusText]
        .filter(Boolean)
        .join(' ');
      const hint =
        response.status === 401 || response.status === 403
          ? `. ${API_KEY_HINT}`
          : '';
      const errorMessage = `Statbotics API request failed: ${status} for endpoint ${endpoint}${hint}`;
      await log('error', errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = `API request error for endpoint ${endpoint}: ${error.message}`;
      await log('error', errorMessage);
      throw error;
    }
    const errorMessage = `Unknown error during API request for endpoint ${endpoint}`;
    await log('error', `${errorMessage}: ${error}`);
    throw new Error(errorMessage, { cause: error });
  }
}
