import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Utility functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env['STATBOTICS_API_KEY'];
  });

  describe('API Request handling', () => {
    it('should handle successful API responses', async () => {
      const mockData = {
        team: 86,
        name: 'Team Resistance',
        epa: { total_points: { mean: 85.5 } },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/v3/team/86');

      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/v3/team/999999')).rejects.toThrow(
        'Statbotics API request failed: 404 Not Found',
      );
    });

    it('should omit an empty status text from API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: '',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/v3/team/999999')).rejects.toThrow(
        'Statbotics API request failed: 404 for endpoint /v3/team/999999',
      );
    });

    it('should construct correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await makeApiRequest('/v3/year/2024');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.statbotics.io/v3/year/2024',
        expect.any(Object),
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/v3/team/86')).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/v3/team/86')).rejects.toThrow(
        'Statbotics API request failed: 500 Internal Server Error',
      );
    });

    it('should include Accept header in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await makeApiRequest('/v3/team/86');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should handle empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/v3/team/86');

      expect(result).toBeNull();
    });

    it('should handle array responses', async () => {
      const mockArray = [{ team: 1 }, { team: 2 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArray,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/v3/teams');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockArray);
    });
  });

  describe('API key', () => {
    function sentHeaders(): Record<string, string> {
      return mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
    }

    it('should send no X-API-Key header when STATBOTICS_API_KEY is unset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');
      await makeApiRequest('/v3/team/86');

      expect(sentHeaders()).not.toHaveProperty('X-API-Key');
    });

    it('should send STATBOTICS_API_KEY as the X-API-Key header', async () => {
      process.env['STATBOTICS_API_KEY'] = ' test-key ';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');
      await makeApiRequest('/v3/team/86');

      expect(sentHeaders()).toMatchObject({ 'X-API-Key': 'test-key' });
    });

    it('should treat an unexpanded placeholder as unset', async () => {
      process.env['STATBOTICS_API_KEY'] = '${user_config.statbotics_api_key}';

      const { getApiKey } = await import('../src/utils.js');

      expect(getApiKey()).toBeUndefined();
    });

    it('should treat a blank STATBOTICS_API_KEY as unset', async () => {
      process.env['STATBOTICS_API_KEY'] = '  ';

      const { getApiKey } = await import('../src/utils.js');

      expect(getApiKey()).toBeUndefined();
    });

    it.each([401, 403])(
      'should point to STATBOTICS_API_KEY on a %i response',
      async (status) => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          statusText: '',
        } as Response);

        const { makeApiRequest } = await import('../src/utils.js');

        await expect(makeApiRequest('/v3/team/86')).rejects.toThrow(
          `Statbotics API request failed: ${status} for endpoint /v3/team/86. Set STATBOTICS_API_KEY to a key from https://www.statbotics.io/apikey.`,
        );
      },
    );
  });

  describe('log function', () => {
    it('should not throw when called without server', async () => {
      const { log } = await import('../src/utils.js');

      await expect(log('info', 'test message')).resolves.not.toThrow();
    });

    it('should handle different log levels', async () => {
      const { log } = await import('../src/utils.js');

      await expect(log('debug', 'debug message')).resolves.not.toThrow();
      await expect(log('info', 'info message')).resolves.not.toThrow();
      await expect(log('notice', 'notice message')).resolves.not.toThrow();
      await expect(log('warning', 'warning message')).resolves.not.toThrow();
      await expect(log('error', 'error message')).resolves.not.toThrow();
    });
  });
});
