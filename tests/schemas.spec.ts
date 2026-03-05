import { describe, it, expect } from '@jest/globals';
import {
  TeamNumberSchema,
  YearSchema,
  EventKeySchema,
  MatchKeySchema,
  GetYearInputSchema,
  GetYearsInputSchema,
  GetTeamInputSchema,
  GetTeamsInputSchema,
  GetTeamYearInputSchema,
  GetTeamYearsInputSchema,
  GetEventInputSchema,
  GetEventsInputSchema,
  GetTeamEventInputSchema,
  GetTeamEventsInputSchema,
  GetMatchInputSchema,
  GetMatchesInputSchema,
  GetTeamMatchInputSchema,
  GetTeamMatchesInputSchema,
  toMCPSchema,
} from '../src/schemas.js';
import { z } from 'zod';

describe('Schema validation', () => {
  describe('TeamNumberSchema', () => {
    it('should validate team numbers', () => {
      expect(() => TeamNumberSchema.parse(86)).not.toThrow();
      expect(() => TeamNumberSchema.parse(1)).not.toThrow();
      expect(() => TeamNumberSchema.parse(9999)).not.toThrow();
    });

    it('should reject invalid team numbers', () => {
      expect(() => TeamNumberSchema.parse(0)).toThrow();
      expect(() => TeamNumberSchema.parse(-1)).toThrow();
      expect(() => TeamNumberSchema.parse(1.5)).toThrow();
      expect(() => TeamNumberSchema.parse('86')).toThrow();
    });
  });

  describe('YearSchema', () => {
    it('should validate year range', () => {
      expect(() => YearSchema.parse(2023)).not.toThrow();
      expect(() => YearSchema.parse(2002)).not.toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear())).not.toThrow();
    });

    it('should reject invalid years', () => {
      expect(() => YearSchema.parse(2001)).toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear() + 2)).toThrow();
      expect(() => YearSchema.parse(1999)).toThrow();
    });
  });

  describe('EventKeySchema', () => {
    it('should validate event keys', () => {
      expect(() => EventKeySchema.parse('2024flor')).not.toThrow();
      expect(() => EventKeySchema.parse('2023hop')).not.toThrow();
    });
  });

  describe('MatchKeySchema', () => {
    it('should validate match keys', () => {
      expect(() => MatchKeySchema.parse('2024flor_qm20')).not.toThrow();
      expect(() => MatchKeySchema.parse('2023hop_f1m1')).not.toThrow();
    });
  });

  describe('GetYearInputSchema', () => {
    it('should validate year input', () => {
      expect(() => GetYearInputSchema.parse({ year: 2024 })).not.toThrow();
    });

    it('should reject missing year', () => {
      expect(() => GetYearInputSchema.parse({})).toThrow();
    });
  });

  describe('GetYearsInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetYearsInputSchema.parse({})).not.toThrow();
    });

    it('should validate with optional parameters', () => {
      expect(() =>
        GetYearsInputSchema.parse({
          metric: 'epa_max',
          ascending: true,
          limit: 10,
          offset: 0,
        }),
      ).not.toThrow();
    });
  });

  describe('GetTeamInputSchema', () => {
    it('should validate team input', () => {
      expect(() => GetTeamInputSchema.parse({ team: 86 })).not.toThrow();
    });

    it('should reject missing team', () => {
      expect(() => GetTeamInputSchema.parse({})).toThrow();
    });

    it('should reject invalid team number', () => {
      expect(() => GetTeamInputSchema.parse({ team: -1 })).toThrow();
    });
  });

  describe('GetTeamsInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetTeamsInputSchema.parse({})).not.toThrow();
    });

    it('should validate with filters', () => {
      expect(() =>
        GetTeamsInputSchema.parse({
          country: 'USA',
          state: 'CA',
          district: 'fim',
          active: true,
          limit: 100,
        }),
      ).not.toThrow();
    });
  });

  describe('GetTeamYearInputSchema', () => {
    it('should validate team year input', () => {
      expect(() =>
        GetTeamYearInputSchema.parse({ team: 86, year: 2024 }),
      ).not.toThrow();
    });

    it('should reject missing fields', () => {
      expect(() => GetTeamYearInputSchema.parse({ team: 86 })).toThrow();
      expect(() => GetTeamYearInputSchema.parse({ year: 2024 })).toThrow();
    });
  });

  describe('GetTeamYearsInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetTeamYearsInputSchema.parse({})).not.toThrow();
    });

    it('should validate with optional filters', () => {
      expect(() =>
        GetTeamYearsInputSchema.parse({
          team: 86,
          year: 2024,
          country: 'USA',
        }),
      ).not.toThrow();
    });
  });

  describe('GetEventInputSchema', () => {
    it('should validate event input', () => {
      expect(() =>
        GetEventInputSchema.parse({ event: '2024flor' }),
      ).not.toThrow();
    });

    it('should reject missing event', () => {
      expect(() => GetEventInputSchema.parse({})).toThrow();
    });
  });

  describe('GetEventsInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetEventsInputSchema.parse({})).not.toThrow();
    });

    it('should validate with filters', () => {
      expect(() =>
        GetEventsInputSchema.parse({
          year: 2024,
          country: 'USA',
          type: 'regional',
          week: 1,
        }),
      ).not.toThrow();
    });
  });

  describe('GetTeamEventInputSchema', () => {
    it('should validate team event input', () => {
      expect(() =>
        GetTeamEventInputSchema.parse({ team: 86, event: '2024flor' }),
      ).not.toThrow();
    });

    it('should reject missing fields', () => {
      expect(() => GetTeamEventInputSchema.parse({ team: 86 })).toThrow();
      expect(() =>
        GetTeamEventInputSchema.parse({ event: '2024flor' }),
      ).toThrow();
    });
  });

  describe('GetTeamEventsInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetTeamEventsInputSchema.parse({})).not.toThrow();
    });
  });

  describe('GetMatchInputSchema', () => {
    it('should validate match input', () => {
      expect(() =>
        GetMatchInputSchema.parse({ match: '2024flor_qm20' }),
      ).not.toThrow();
    });

    it('should reject missing match', () => {
      expect(() => GetMatchInputSchema.parse({})).toThrow();
    });
  });

  describe('GetMatchesInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetMatchesInputSchema.parse({})).not.toThrow();
    });

    it('should validate with filters', () => {
      expect(() =>
        GetMatchesInputSchema.parse({
          team: 86,
          year: 2024,
          event: '2024flor',
          elim: false,
        }),
      ).not.toThrow();
    });
  });

  describe('GetTeamMatchInputSchema', () => {
    it('should validate team match input', () => {
      expect(() =>
        GetTeamMatchInputSchema.parse({
          team: 86,
          match: '2024flor_qm20',
        }),
      ).not.toThrow();
    });

    it('should reject missing fields', () => {
      expect(() => GetTeamMatchInputSchema.parse({ team: 86 })).toThrow();
    });
  });

  describe('GetTeamMatchesInputSchema', () => {
    it('should validate empty input', () => {
      expect(() => GetTeamMatchesInputSchema.parse({})).not.toThrow();
    });
  });

  describe('toMCPSchema', () => {
    it('should convert Zod schema to MCP-compatible JSON Schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      });

      const mcpSchema = toMCPSchema(schema);

      expect(mcpSchema.type).toBe('object');
      expect(mcpSchema.properties).toBeDefined();
      expect(mcpSchema['$schema']).toBeUndefined();
    });
  });

  describe('Pagination and sorting schemas', () => {
    it('should validate limit bounds', () => {
      expect(() => GetTeamsInputSchema.parse({ limit: 1 })).not.toThrow();
      expect(() => GetTeamsInputSchema.parse({ limit: 1000 })).not.toThrow();
    });

    it('should reject out-of-bounds limit', () => {
      expect(() => GetTeamsInputSchema.parse({ limit: 0 })).toThrow();
      expect(() => GetTeamsInputSchema.parse({ limit: 1001 })).toThrow();
    });

    it('should validate offset', () => {
      expect(() => GetTeamsInputSchema.parse({ offset: 0 })).not.toThrow();
      expect(() => GetTeamsInputSchema.parse({ offset: 100 })).not.toThrow();
    });

    it('should reject negative offset', () => {
      expect(() => GetTeamsInputSchema.parse({ offset: -1 })).toThrow();
    });
  });
});
