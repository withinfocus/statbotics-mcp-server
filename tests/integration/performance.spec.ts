import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Performance Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should respond to tool calls within acceptable time limits', async () => {
    const startTime = Date.now();

    await mcpClient.callTool('get_year', { year: 2024 });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });

  test('should handle concurrent requests efficiently', async () => {
    const startTime = Date.now();

    const promises = [
      mcpClient.callTool('get_year', { year: 2024 }),
      mcpClient.callTool('get_teams', { limit: 3 }),
      mcpClient.callTool('get_events', { year: 2024, limit: 3 }),
      mcpClient.callTool('get_team', { team: 86 }),
      mcpClient.callTool('get_team', { team: 1678 }),
    ];

    const results = await Promise.all(promises);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);
    expect(results).toHaveLength(5);

    results.forEach((result) => {
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');
    });
  });

  test('should handle rapid sequential requests', async () => {
    const teams = [86, 148, 1678, 973, 2468];
    const startTime = Date.now();

    for (const team of teams) {
      const result = await mcpClient.callTool('get_team', { team });
      expect(result.content).toBeInstanceOf(Array);
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(15000);
  });
});
