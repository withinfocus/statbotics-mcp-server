import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { TEST_TEAMS } from './test-data.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Reliability Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Server Stability', () => {
    test('should handle server restart gracefully', async () => {
      const result1 = await mcpClient.callTool('get_year', { year: 2024 });
      expect(result1.content).toBeInstanceOf(Array);

      await mcpClient.stop();

      mcpClient = await createAndInitializeMCPClient();

      const result2 = await mcpClient.callTool('get_year', { year: 2024 });
      expect(result2.content).toBeInstanceOf(Array);
    });

    test('should maintain state across multiple requests', async () => {
      const requests = 10;
      const results = [];

      for (let i = 0; i < requests; i++) {
        const result = await mcpClient.callTool('get_year', { year: 2024 });
        results.push(result);
      }

      expect(results).toHaveLength(requests);
      results.forEach((result) => {
        expect(result.content).toBeInstanceOf(Array);
        expect(result.content[0]?.type).toBe('text');
      });
    });

    test('should handle rapid fire requests without losing data', async () => {
      const teamNumbers = Object.values(TEST_TEAMS);

      const promises = teamNumbers.map((team) =>
        mcpClient.callTool('get_team', { team }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(teamNumbers.length);

      results.forEach((result, index) => {
        expect(result.content).toBeInstanceOf(Array);
        const teamData = JSON.parse(result.content[0]?.text || '');
        expect(teamData.team).toBe(teamNumbers[index]);
      });
    });
  });

  test.describe('Data Integrity', () => {
    test('should return identical data on repeated requests', async () => {
      const team = TEST_TEAMS.TEAM_RESISTANCE;

      const result1 = await mcpClient.callTool('get_team', { team });
      const result2 = await mcpClient.callTool('get_team', { team });

      const team1 = JSON.parse(result1.content[0]?.text || '');
      const team2 = JSON.parse(result2.content[0]?.text || '');

      expect(team1).toEqual(team2);
    });
  });

  test.describe('Resource Management', () => {
    test('should handle cleanup properly after errors', async () => {
      try {
        await mcpClient.callTool('get_team', { team: -1 });
      } catch {
        // Expected error
      }

      const result = await mcpClient.callTool('get_team', {
        team: TEST_TEAMS.TEAM_RESISTANCE,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData.team).toBe(TEST_TEAMS.TEAM_RESISTANCE);
    });
  });
});
