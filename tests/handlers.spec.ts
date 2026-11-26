import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from '@jest/globals';
import type { Client } from '@modelcontextprotocol/client';
import { executeTool } from '../src/handlers.js';
import { tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

type TextResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

function mockJson(data: unknown): void {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  } as Response);
}

describe('Handler functions', () => {
  let client: Client;

  // Calls a tool through the MCP SDK, so input validation and error mapping
  // run exactly as they do for a real client.
  async function handleToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<TextResult> {
    return (await client.callTool({ name, arguments: args })) as TextResult;
  }

  beforeAll(async () => {
    client = await connectInMemoryClient();
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tools/call', () => {
    it('should handle get_team tool', async () => {
      mockJson({ team: 86, name: 'Team Resistance', country: 'USA' });

      const result = await handleToolCall('get_team', { team: 86 });

      expect(result.content[0]!.type).toBe('text');
      expect(JSON.parse(result.content[0]!.text).team).toBe(86);
    });

    it('should handle get_year tool', async () => {
      mockJson({ year: 2024, epa_max: 95.2, count: 3500 });

      const result = await handleToolCall('get_year', { year: 2024 });

      expect(JSON.parse(result.content[0]!.text).year).toBe(2024);
    });

    it('should handle get_event tool', async () => {
      mockJson({ key: '2024flor', name: 'Orlando Regional', year: 2024 });

      const result = await handleToolCall('get_event', { event: '2024flor' });

      expect(JSON.parse(result.content[0]!.text).key).toBe('2024flor');
    });

    it('should handle get_teams with query parameters', async () => {
      mockJson([
        { team: 86, name: 'Team Resistance' },
        { team: 1678, name: 'Citrus Circuits' },
      ]);

      const result = await handleToolCall('get_teams', {
        country: 'USA',
        state: 'CA',
        limit: 10,
      });

      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        'https://api.statbotics.io/v3/teams?country=USA&state=CA&limit=10',
      );
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(Array.isArray(parsedContent)).toBe(true);
      expect(parsedContent).toHaveLength(2);
    });

    it('should handle get_match tool', async () => {
      mockJson({ key: '2024flor_qm20', year: 2024, event: '2024flor' });

      const result = await handleToolCall('get_match', {
        match: '2024flor_qm20',
      });

      expect(JSON.parse(result.content[0]!.text).key).toBe('2024flor_qm20');
    });

    it('should return an error result for an invalid team number', async () => {
      const result = await handleToolCall('get_team', { team: -1 });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toContain('team');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return an error result for an invalid year', async () => {
      const result = await handleToolCall('get_year', { year: 1990 });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toContain('year');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return an error result for missing required parameters', async () => {
      const result = await handleToolCall('get_team', {});

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toMatch(/team.*received undefined/);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject an unknown tool name with a protocol error', async () => {
      await expect(handleToolCall('unknown_tool', {})).rejects.toThrow(
        'Tool unknown_tool not found',
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await handleToolCall('get_team', { team: 999999 });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toBe(
        'Error: Statbotics API request failed: 404 Not Found for endpoint /v3/team/999999',
      );
    });

    it('should return an error result when the response has the wrong shape', async () => {
      mockJson([{ team: 86 }]);

      const result = await handleToolCall('get_team', { team: 86 });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toMatch(/^Error: /);
    });
  });

  describe('executeTool', () => {
    const getTeam = tools.find((tool) => tool.name === 'get_team')!;

    it('should request the tool endpoint and return pretty-printed JSON', async () => {
      const mockTeam = { team: 86, name: 'Team Resistance' };
      mockJson(mockTeam);

      const result = await executeTool(getTeam, { team: 86 });

      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        'https://api.statbotics.io/v3/team/86',
      );
      expect(result.isError).toBeUndefined();
      expect(result.content).toEqual([
        { type: 'text', text: JSON.stringify(mockTeam, null, 2) },
      ]);
    });

    it('should apply select to the validated response when defined', async () => {
      mockJson({ team: 86, name: 'Team Resistance' });

      const result = await executeTool(
        { ...getTeam, select: (response) => Object.keys(response as object) },
        { team: 86 },
      );

      expect(JSON.parse((result.content[0] as { text: string }).text)).toEqual([
        'team',
        'name',
      ]);
    });

    it('should return network failures as error results', async () => {
      mockFetch.mockRejectedValueOnce(new Error('socket hang up'));

      const result = await executeTool(getTeam, { team: 86 });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: socket hang up' }],
        isError: true,
      });
    });
  });
});
