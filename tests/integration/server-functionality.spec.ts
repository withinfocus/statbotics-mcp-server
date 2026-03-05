import { expect } from '@playwright/test';
import { test, createMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Functionality Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should have all expected Statbotics tools available', async () => {
    const toolsResponse = await mcpClient.listTools();
    const toolNames = toolsResponse.tools.map(
      (tool: { name: string }) => tool.name,
    );

    const expectedCoreTools = [
      'get_year',
      'get_years',
      'get_team',
      'get_teams',
      'get_team_year',
      'get_team_years',
      'get_event',
      'get_events',
      'get_team_event',
      'get_team_events',
      'get_match',
      'get_matches',
      'get_team_match',
      'get_team_matches',
    ];

    for (const expectedTool of expectedCoreTools) {
      expect(toolNames).toContain(expectedTool);
    }

    expect(toolNames.length).toBe(14);
  });

  test('should have properly structured tool schemas', async () => {
    const toolsResponse = await mcpClient.listTools();

    for (const tool of toolsResponse.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');

      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toHaveProperty('type');
      expect(tool.inputSchema['type']).toBe('object');
    }
  });

  test('should handle missing required parameters', async () => {
    try {
      await mcpClient.callTool('get_team', {});
    } catch (error) {
      expect(String(error)).toMatch(/required|missing|invalid input/i);
    }
  });

  test('should handle unknown tools gracefully', async () => {
    try {
      await mcpClient.callTool('nonexistent_tool', {});
    } catch (error) {
      expect(String(error)).toContain('Unknown tool');
    }
  });
});
