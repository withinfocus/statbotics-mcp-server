import { expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import { createMCPClient } from './setup.js';
import { test } from './setup.js';

test.describe('Basic MCP Server Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should start MCP server successfully', async () => {
    const serverInfo = await mcpClient.getServerInfo();
    expect(serverInfo).toBeDefined();
  });

  test('should list tools successfully', async () => {
    const toolsResponse = await mcpClient.listTools();
    expect(toolsResponse.tools).toBeInstanceOf(Array);
    expect(toolsResponse.tools.length).toBeGreaterThan(0);
  });

  test('should get year data', async () => {
    const result = await mcpClient.callTool('get_year', { year: 2024 });
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]?.type).toBe('text');

    const yearData = JSON.parse(result.content[0]?.text || '');
    expect(yearData).toHaveProperty('year');
    expect(yearData.year).toBe(2024);
  });

  test('should get team information', async () => {
    const result = await mcpClient.callTool('get_team', { team: 86 });

    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]?.type).toBe('text');

    const teamData = JSON.parse(result.content[0]?.text || '');
    expect(teamData.team).toBe(86);
    expect(teamData).toHaveProperty('name');
  });
});
