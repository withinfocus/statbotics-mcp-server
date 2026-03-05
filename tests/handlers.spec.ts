import { describe, it, expect, beforeEach, jest } from '@jest/globals';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Handler functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleToolCall', () => {
    it('should handle get_team tool', async () => {
      const mockTeamData = {
        team: 86,
        name: 'Team Resistance',
        country: 'USA',
        state: 'FL',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      const result = await handleToolCall('get_team', { team: 86 });

      expect(result.content).toBeDefined();
      expect(result.content[0]!.type).toBe('text');
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.team).toBe(86);
    });

    it('should handle get_year tool', async () => {
      const mockYearData = {
        year: 2024,
        epa_max: 95.2,
        count: 3500,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockYearData,
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      const result = await handleToolCall('get_year', { year: 2024 });

      expect(result.content).toBeDefined();
      expect(result.content[0]!.type).toBe('text');
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.year).toBe(2024);
    });

    it('should handle get_event tool', async () => {
      const mockEventData = {
        key: '2024flor',
        name: 'Orlando Regional',
        year: 2024,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventData,
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      const result = await handleToolCall('get_event', {
        event: '2024flor',
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.key).toBe('2024flor');
    });

    it('should handle get_teams with query parameters', async () => {
      const mockTeams = [
        { team: 86, name: 'Team Resistance' },
        { team: 1678, name: 'Citrus Circuits' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeams,
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      const result = await handleToolCall('get_teams', {
        country: 'USA',
        state: 'CA',
        limit: 10,
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(Array.isArray(parsedContent)).toBe(true);
    });

    it('should handle get_match tool', async () => {
      const mockMatch = {
        key: '2024flor_qm20',
        year: 2024,
        event: '2024flor',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatch,
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      const result = await handleToolCall('get_match', {
        match: '2024flor_qm20',
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.key).toBe('2024flor_qm20');
    });

    it('should throw error for invalid team number', async () => {
      const { handleToolCall } = await import('../src/handlers.js');

      await expect(handleToolCall('get_team', { team: -1 })).rejects.toThrow();
    });

    it('should throw error for invalid year', async () => {
      const { handleToolCall } = await import('../src/handlers.js');

      await expect(
        handleToolCall('get_year', { year: 1990 }),
      ).rejects.toThrow();
    });

    it('should throw error for missing required parameters', async () => {
      const { handleToolCall } = await import('../src/handlers.js');

      await expect(handleToolCall('get_team', {})).rejects.toThrow();
    });

    it('should throw error for unknown tool name', async () => {
      const { handleToolCall } = await import('../src/handlers.js');

      await expect(handleToolCall('unknown_tool', {})).rejects.toThrow(
        'Unknown tool: unknown_tool',
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const { handleToolCall } = await import('../src/handlers.js');

      await expect(
        handleToolCall('get_team', { team: 999999 }),
      ).rejects.toThrow('Statbotics API request failed: 404 Not Found');
    });
  });
});
