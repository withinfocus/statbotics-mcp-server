import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('Statbotics API Integration Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Year Operations', () => {
    test('should get year data', async () => {
      const result = await mcpClient.callTool('get_year', { year: 2024 });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const yearData = JSON.parse(result.content[0]?.text || '');
      expect(yearData.year).toBe(2024);
    });

    test('should get multiple years', async () => {
      const result = await mcpClient.callTool('get_years', { limit: 5 });

      expect(result.content).toBeInstanceOf(Array);
      const years = JSON.parse(result.content[0]?.text || '');
      expect(years).toBeInstanceOf(Array);
      expect(years.length).toBeGreaterThan(0);
    });
  });

  test.describe('Team Operations', () => {
    test('should get team information', async () => {
      const result = await mcpClient.callTool('get_team', { team: 86 });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData.team).toBe(86);
      expect(teamData).toHaveProperty('name');
    });

    test('should get multiple teams', async () => {
      const result = await mcpClient.callTool('get_teams', {
        country: 'USA',
        state: 'FL',
        limit: 5,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);
      expect(teams.length).toBeGreaterThan(0);
    });

    test('should get team year data', async () => {
      const result = await mcpClient.callTool('get_team_year', {
        team: 86,
        year: 2024,
      });

      expect(result.content).toBeInstanceOf(Array);
      const data = JSON.parse(result.content[0]?.text || '');
      expect(data.team).toBe(86);
      expect(data.year).toBe(2024);
    });
  });

  test.describe('Event Operations', () => {
    test('should get event data', async () => {
      const result = await mcpClient.callTool('get_event', {
        event: '2024flor',
      });

      expect(result.content).toBeInstanceOf(Array);
      const eventData = JSON.parse(result.content[0]?.text || '');
      expect(eventData.key).toBe('2024flor');
    });

    test('should get multiple events', async () => {
      const result = await mcpClient.callTool('get_events', {
        year: 2024,
        limit: 5,
      });

      expect(result.content).toBeInstanceOf(Array);
      const events = JSON.parse(result.content[0]?.text || '');
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
    });

    test('should get team event data', async () => {
      const result = await mcpClient.callTool('get_team_event', {
        team: 86,
        event: '2024flor',
      });

      expect(result.content).toBeInstanceOf(Array);
      const data = JSON.parse(result.content[0]?.text || '');
      expect(data).toHaveProperty('team');
    });
  });

  test.describe('Match Operations', () => {
    test('should get matches for an event', async () => {
      const result = await mcpClient.callTool('get_matches', {
        event: '2024flor',
        limit: 5,
      });

      expect(result.content).toBeInstanceOf(Array);
      const matches = JSON.parse(result.content[0]?.text || '');
      expect(matches).toBeInstanceOf(Array);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid team number', async () => {
      await expect(
        mcpClient.callTool('get_team', { team: -1 }),
      ).rejects.toThrow();
    });

    test('should handle invalid year', async () => {
      await expect(
        mcpClient.callTool('get_year', { year: 1990 }),
      ).rejects.toThrow();
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpClient.callTool('get_team', {})).rejects.toThrow();
    });

    test('should handle unknown tool', async () => {
      await expect(mcpClient.callTool('unknown_tool', {})).rejects.toThrow();
    });
  });
});
