import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('Statbotics MCP Server Integration Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should initialize server and return server info', async () => {
    const serverInfo = await mcpClient.getServerInfo();

    expect(serverInfo).toMatchObject({
      protocolVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      capabilities: expect.objectContaining({
        tools: expect.any(Object),
      }),
    });
  });

  test('should list all available tools', async () => {
    const toolsResponse = await mcpClient.listTools();

    expect(toolsResponse.tools).toBeInstanceOf(Array);
    expect(toolsResponse.tools.length).toBe(14);

    const toolNames = toolsResponse.tools.map(
      (tool: { name: string }) => tool.name,
    );

    const expectedTools = [
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

    for (const expectedTool of expectedTools) {
      expect(toolNames).toContain(expectedTool);
    }
  });

  test('should validate tool schemas', async () => {
    const toolsResponse = await mcpClient.listTools();

    for (const tool of toolsResponse.tools as Array<{
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }>) {
      expect(tool).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        inputSchema: expect.objectContaining({
          type: 'object',
        }),
      });
    }
  });
});
