import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Protocol Compliance Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should support MCP protocol initialization', async () => {
    const serverInfo = await mcpClient.getServerInfo();

    expect(serverInfo).toHaveProperty('protocolVersion');
    expect(serverInfo).toHaveProperty('capabilities');
    expect(serverInfo).toHaveProperty('serverInfo');

    expect(serverInfo.capabilities).toHaveProperty('tools');
  });

  test('should list all tools with proper structure', async () => {
    const toolsResponse = await mcpClient.listTools();

    expect(toolsResponse).toHaveProperty('tools');
    expect(toolsResponse.tools).toBeInstanceOf(Array);
    expect(toolsResponse.tools.length).toBe(14);

    for (const tool of toolsResponse.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');

      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);

      expect(tool.inputSchema).toHaveProperty('type');
      expect(tool.inputSchema['type']).toBe('object');
    }
  });

  test('should handle invalid JSON-RPC requests', async () => {
    await expect(mcpClient.sendRequest('invalid_method')).rejects.toThrow();
  });

  test('should enforce required parameters', async () => {
    const toolsResponse = await mcpClient.listTools();
    const getTeamTool = toolsResponse.tools.find(
      (tool: { name: string }) => tool.name === 'get_team',
    );

    expect(getTeamTool).toBeDefined();
    if (getTeamTool) {
      const schema = getTeamTool.inputSchema as { required: string[] };
      expect(schema.required).toContain('team');
    }
  });

  test('should maintain consistent response format', async () => {
    const result = await mcpClient.callTool('get_year', { year: 2024 });

    expect(result).toHaveProperty('content');
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content[0]).toHaveProperty('type');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0]?.type).toBe('text');
  });
});
