import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { z } from 'zod';
import type { Client, Tool } from '@modelcontextprotocol/client';
import { READ_ONLY_API, buildQueryString, tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

// The Statbotics path each tool requested before the move to the tool table,
// for the sample arguments below. Guards against routing regressions.
const SAMPLE_ARGS = {
  team: 86,
  year: 2024,
  event: '2024flor',
  match: '2024flor_qm20',
};

const EXPECTED_ENDPOINTS: Record<string, string> = {
  get_year: '/v3/year/2024',
  get_years: '/v3/years',
  get_team: '/v3/team/86',
  get_teams: '/v3/teams',
  get_team_year: '/v3/team_year/86/2024',
  get_team_years: '/v3/team_years?team=86&year=2024',
  get_event: '/v3/event/2024flor',
  get_events: '/v3/events?year=2024',
  get_team_event: '/v3/team_event/86/2024flor',
  get_team_events: '/v3/team_events?team=86&year=2024&event=2024flor',
  get_match: '/v3/match/2024flor_qm20',
  get_matches: '/v3/matches?team=86&year=2024&event=2024flor',
  get_team_match: '/v3/team_match/86/2024flor_qm20',
  get_team_matches:
    '/v3/team_matches?team=86&year=2024&event=2024flor&match=2024flor_qm20',
};

describe('Tool table', () => {
  it('should define all 14 tools', () => {
    expect(tools).toHaveLength(14);
  });

  it('should have unique tool names', () => {
    const names = tools.map((tool) => tool.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should give every tool a title, description, schemas, and endpoint', () => {
    tools.forEach((tool) => {
      expect(tool.name).toMatch(/^get_[a-z_]+$/);
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(tool.responseSchema).toBeInstanceOf(z.ZodType);
      expect(typeof tool.endpoint).toBe('function');
    });
  });

  it('should build the same Statbotics endpoint for every tool as before', () => {
    expect(Object.keys(EXPECTED_ENDPOINTS).sort()).toEqual(
      tools.map((tool) => tool.name).sort(),
    );

    tools.forEach((tool) => {
      const args = tool.inputSchema.parse(
        Object.fromEntries(
          Object.keys(tool.inputSchema.shape).map((key) => [
            key,
            SAMPLE_ARGS[key as keyof typeof SAMPLE_ARGS],
          ]),
        ),
      );
      expect(tool.endpoint(args)).toBe(EXPECTED_ENDPOINTS[tool.name]);
    });
  });

  it('should pass every filter, sort, and page argument as a query parameter', () => {
    const getTeams = tools.find((tool) => tool.name === 'get_teams')!;
    const args = getTeams.inputSchema.parse({
      country: 'USA',
      state: 'NC',
      district: 'fnc',
      active: true,
      metric: 'norm_epa',
      ascending: false,
      limit: 10,
      offset: 20,
    });

    expect(getTeams.endpoint(args)).toBe(
      '/v3/teams?country=USA&state=NC&district=fnc&active=true&metric=norm_epa&ascending=false&limit=10&offset=20',
    );
  });

  describe('buildQueryString', () => {
    it('should return an empty string when no parameters are set', () => {
      expect(buildQueryString({})).toBe('');
      expect(buildQueryString({ year: undefined, team: null })).toBe('');
    });

    it('should encode values', () => {
      expect(buildQueryString({ country: 'United Kingdom' })).toBe(
        '?country=United+Kingdom',
      );
    });
  });
});

describe('Tool definitions served by tools/list', () => {
  let client: Client;
  let listed: Tool[];

  beforeAll(async () => {
    client = await connectInMemoryClient();
    listed = (await client.listTools()).tools;
  });

  afterAll(async () => {
    await client.close();
  });

  describe('tools array', () => {
    it('should list every tool in table order', () => {
      expect(listed.map((tool) => tool.name)).toEqual(
        tools.map((tool) => tool.name),
      );
    });

    it('should have all required properties for each tool', () => {
      listed.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    it('should have valid JSON Schema for inputSchema', () => {
      listed.forEach((tool) => {
        expect(tool.inputSchema.type).toBe('object');
        expect(typeof tool.inputSchema.properties).toBe('object');
      });
    });

    it('should carry the table title, description, and read-only annotations', () => {
      listed.forEach((tool) => {
        const definition = tools.find((t) => t.name === tool.name);
        expect(tool.title).toBe(definition?.title);
        expect(tool.description).toBe(definition?.description);
        expect(tool.annotations).toEqual({
          ...READ_ONLY_API,
          title: definition?.title,
        });
      });
    });
  });

  describe('specific tool definitions', () => {
    const find = (name: string) => listed.find((t) => t.name === name);

    it('should have get_year tool', () => {
      const getTool = find('get_year');
      expect(getTool?.description).toContain('year');
      expect(getTool?.inputSchema.required).toEqual(['year']);
    });

    it('should have get_team tool', () => {
      const getTool = find('get_team');
      expect(getTool?.description).toContain('team');
      expect(getTool?.inputSchema.required).toEqual(['team']);
    });

    it('should have get_team_year tool', () => {
      expect(find('get_team_year')?.inputSchema.required).toEqual([
        'team',
        'year',
      ]);
    });

    it('should have get_event tool', () => {
      const getTool = find('get_event');
      expect(getTool?.description).toContain('event');
      expect(getTool?.inputSchema.required).toEqual(['event']);
    });

    it('should have get_team_event tool', () => {
      expect(find('get_team_event')?.inputSchema.required).toEqual([
        'team',
        'event',
      ]);
    });

    it('should have get_match tool', () => {
      const getTool = find('get_match');
      expect(getTool?.description).toContain('match');
      expect(getTool?.inputSchema.required).toEqual(['match']);
    });

    it('should have get_team_match tool', () => {
      expect(find('get_team_match')?.inputSchema.required).toEqual([
        'team',
        'match',
      ]);
    });
  });

  describe('list tools', () => {
    it('should make every filter, sort, and page parameter optional', () => {
      listed
        .filter((tool) => tool.name.endsWith('s'))
        .forEach((tool) => {
          expect(tool.inputSchema.required ?? []).toEqual([]);
          expect(tool.inputSchema.properties).toHaveProperty('metric');
          expect(tool.inputSchema.properties).toHaveProperty('limit');
          expect(tool.inputSchema.properties).toHaveProperty('offset');
        });
    });

    it('should bound limit to 1-1000', () => {
      listed
        .filter((tool) => tool.inputSchema.properties?.['limit'])
        .forEach((tool) => {
          expect(tool.inputSchema.properties?.['limit']).toMatchObject({
            type: 'integer',
            minimum: 1,
            maximum: 1000,
          });
        });
    });
  });

  describe('year validation in schemas', () => {
    it('should have range validation for year parameters', () => {
      const toolsWithYear = listed.filter((t) =>
        Object.keys(t.inputSchema.properties || {}).includes('year'),
      );

      expect(toolsWithYear.length).toBeGreaterThan(0);

      toolsWithYear.forEach((tool) => {
        expect(tool.inputSchema.properties?.['year']).toMatchObject({
          minimum: 2002,
        });
        expect(tool.inputSchema.properties?.['year']).toHaveProperty('maximum');
      });
    });
  });

  describe('tool descriptions', () => {
    it('should have meaningful descriptions for all tools', () => {
      listed.forEach((tool) => {
        expect(tool.description?.length).toBeGreaterThan(10);
        expect(tool.description).not.toContain('TODO');
        expect(tool.description).not.toContain('FIXME');
      });
    });
  });

  describe('parameter descriptions', () => {
    it('should have descriptions for all parameters', () => {
      listed.forEach((tool) => {
        Object.values(tool.inputSchema.properties ?? {}).forEach(
          (paramSchema) => {
            expect(
              typeof (paramSchema as { description?: unknown }).description,
            ).toBe('string');
          },
        );
      });
    });
  });
});
