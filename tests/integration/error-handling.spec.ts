import { expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import { createAndInitializeMCPClient } from './setup.js';
import { test } from './setup.js';

test.describe('MCP Server Error Handling Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Invalid Input Validation', () => {
    test('should reject invalid team numbers', async () => {
      await expect(
        mcpClient.callTool('get_team', { team: -1 }),
      ).rejects.toThrow();

      await expect(
        mcpClient.callTool('get_team', { team: 0 }),
      ).rejects.toThrow();
    });

    test('should reject invalid years', async () => {
      const invalidYears = [2001, new Date().getFullYear() + 2, -1, 0];

      for (const invalidYear of invalidYears) {
        await expect(
          mcpClient.callTool('get_year', { year: invalidYear }),
        ).rejects.toThrow();
      }
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpClient.callTool('get_team', {})).rejects.toThrow();
      await expect(mcpClient.callTool('get_year', {})).rejects.toThrow();
      await expect(
        mcpClient.callTool('get_team_year', { team: 86 }),
      ).rejects.toThrow();
    });
  });

  test.describe('Tool Not Found', () => {
    test('should handle unknown tool calls', async () => {
      await expect(mcpClient.callTool('unknown_tool', {})).rejects.toThrow(
        /Unknown tool/,
      );
    });

    test('should handle tool name typos', async () => {
      await expect(
        mcpClient.callTool('get_tema', { team: 86 }),
      ).rejects.toThrow(/Unknown tool/);
    });
  });

  test.describe('Malformed Requests', () => {
    test('should handle null parameters', async () => {
      await expect(
        mcpClient.callTool('get_team', { team: null }),
      ).rejects.toThrow();
    });

    test('should handle wrong parameter types', async () => {
      await expect(
        mcpClient.callTool('get_team', { team: 'not_a_number' }),
      ).rejects.toThrow();
    });
  });
});
