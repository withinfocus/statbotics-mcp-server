import { expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import { createAndInitializeMCPClient } from './setup.js';
import { test } from './setup.js';

test.describe('Data Validation Integration Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Schema Validation', () => {
    test('should return valid team schema', async () => {
      const result = await mcpClient.callTool('get_team', { team: 86 });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');

      expect(teamData).toHaveProperty('team');
      expect(teamData).toHaveProperty('name');
      expect(teamData.team).toBe(86);
    });

    test('should return valid year schema', async () => {
      const result = await mcpClient.callTool('get_year', { year: 2024 });

      expect(result.content).toBeInstanceOf(Array);
      const yearData = JSON.parse(result.content[0]?.text || '');

      expect(yearData).toHaveProperty('year');
      expect(yearData.year).toBe(2024);
    });
  });

  test.describe('Response Format Validation', () => {
    test('should always return properly formatted MCP responses', async () => {
      const tools = [
        { name: 'get_year', args: { year: 2024 } },
        { name: 'get_team', args: { team: 86 } },
        { name: 'get_events', args: { year: 2024, limit: 3 } },
        { name: 'get_teams', args: { limit: 3 } },
      ];

      for (const tool of tools) {
        const result = await mcpClient.callTool(tool.name, tool.args);

        expect(result).toHaveProperty('content');
        expect(result.content).toBeInstanceOf(Array);
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.content[0]).toMatchObject({
          type: 'text',
          text: expect.any(String),
        });

        expect(() => JSON.parse(result.content[0]?.text || '')).not.toThrow();
      }
    });
  });
});
