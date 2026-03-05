import { test as base } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import path from 'path';

const SERVER_PATH = path.join(process.cwd(), 'dist/index.js');

/**
 * Get the server path
 */
export function getServerPath(): string {
  return SERVER_PATH;
}

/**
 * Create and start a new MCP client instance
 */
export async function createMCPClient(): Promise<MCPClient> {
  const client = new MCPClient(SERVER_PATH, {});
  await client.start();
  return client;
}

/**
 * Create, start MCP client and get server info
 */
export async function createAndInitializeMCPClient(): Promise<MCPClient> {
  const client = await createMCPClient();
  await client.getServerInfo();
  return client;
}

export const test = base.extend<{ mcpClient: MCPClient }>({
  // eslint-disable-next-line no-empty-pattern
  mcpClient: async ({}, use) => {
    const client = await createAndInitializeMCPClient();
    await use(client);
    await client.stop();
  },
});

export { expect } from '@playwright/test';
