// Server logs go to stderr. stdout carries the stdio JSON-RPC stream, and the
// MCP `notifications/message` logging channel is deprecated as of protocol
// 2026-07-28 (SEP-2577) in favor of stderr for stdio servers.
export async function log(
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error',
  data: unknown,
): Promise<void> {
  console.error(`[${level}]`, data);
}

export async function makeApiRequest(endpoint: string): Promise<unknown> {
  try {
    const url = `https://api.statbotics.io${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // statusText can be empty (it is under Node 26's fetch).
      const status = [response.status, response.statusText]
        .filter(Boolean)
        .join(' ');
      const errorMessage = `Statbotics API request failed: ${status} for endpoint ${endpoint}`;
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
