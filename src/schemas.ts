import { z } from 'zod';

// Input validation schemas
export const TeamNumberSchema = z
  .number()
  .int()
  .min(1)
  .describe('Team number (no prefix), e.g. 86');

export const YearSchema = z
  .number()
  .int()
  .min(2002)
  .max(new Date().getFullYear() + 1)
  .describe('Four-digit year (2002 onwards)');

export const EventKeySchema = z.string().describe('Event key, e.g. 2024flor');

export const MatchKeySchema = z
  .string()
  .describe('Match key, e.g. 2024flor_qm20');

export const MetricSchema = z
  .string()
  .optional()
  .describe(
    'How to sort the returned values. Any column in the table is valid.',
  );

export const AscendingSchema = z
  .boolean()
  .optional()
  .describe('Whether to sort in ascending order. Default is ascending.');

export const LimitSchema = z
  .number()
  .int()
  .min(1)
  .max(1000)
  .optional()
  .describe('Maximum number of results to return (1-1000). Default is 1000.');

export const OffsetSchema = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Offset from the first result to return.');

export const CountrySchema = z
  .string()
  .optional()
  .describe('Capitalized country name, e.g. USA or Canada.');

export const StateSchema = z
  .string()
  .optional()
  .describe('Capitalized two-letter state code, e.g. NC.');

export const DistrictSchema = z
  .string()
  .optional()
  .describe(
    'District abbreviation. One of: ca, fch, fim, fin, fit, fma, fnc, fsc, isr, ne, ont, pch, pnw, win.',
  );

export const EventTypeSchema = z
  .string()
  .optional()
  .describe(
    'One of: regional, district, district_cmp, champs_div, einstein, or offseason.',
  );

export const WeekSchema = z
  .number()
  .int()
  .min(0)
  .max(8)
  .optional()
  .describe('Week of the competition season. 8 is CMP.');

export const ActiveSchema = z
  .boolean()
  .optional()
  .describe('Whether the team has played in the last year.');

export const ElimSchema = z
  .boolean()
  .optional()
  .describe('Whether the match is an elimination match.');

// Shared pagination/sorting schema parts
const PaginationSortFields = {
  metric: MetricSchema,
  ascending: AscendingSchema,
  limit: LimitSchema,
  offset: OffsetSchema,
};

// Input schemas for tools
export const GetYearInputSchema = z.object({
  year: YearSchema,
});

export const GetYearsInputSchema = z.object({
  ...PaginationSortFields,
});

export const GetTeamInputSchema = z.object({
  team: TeamNumberSchema,
});

export const GetTeamsInputSchema = z.object({
  country: CountrySchema,
  state: StateSchema,
  district: DistrictSchema,
  active: ActiveSchema,
  ...PaginationSortFields,
});

export const GetTeamYearInputSchema = z.object({
  team: TeamNumberSchema,
  year: YearSchema,
});

export const GetTeamYearsInputSchema = z.object({
  team: TeamNumberSchema.optional().describe(
    'Team number (no prefix), e.g. 86',
  ),
  year: YearSchema.optional().describe('Four-digit year (2002 onwards)'),
  country: CountrySchema,
  state: StateSchema,
  district: DistrictSchema,
  ...PaginationSortFields,
});

export const GetEventInputSchema = z.object({
  event: EventKeySchema,
});

export const GetEventsInputSchema = z.object({
  year: YearSchema.optional().describe('Four-digit year (2002 onwards)'),
  country: CountrySchema,
  state: StateSchema,
  district: DistrictSchema,
  type: EventTypeSchema,
  week: WeekSchema,
  ...PaginationSortFields,
});

export const GetTeamEventInputSchema = z.object({
  team: TeamNumberSchema,
  event: EventKeySchema,
});

export const GetTeamEventsInputSchema = z.object({
  team: TeamNumberSchema.optional().describe(
    'Team number (no prefix), e.g. 86',
  ),
  year: YearSchema.optional().describe('Four-digit year (2002 onwards)'),
  event: EventKeySchema.optional().describe('Event key, e.g. 2024flor'),
  country: CountrySchema,
  state: StateSchema,
  district: DistrictSchema,
  type: EventTypeSchema,
  week: WeekSchema,
  ...PaginationSortFields,
});

export const GetMatchInputSchema = z.object({
  match: MatchKeySchema,
});

export const GetMatchesInputSchema = z.object({
  team: TeamNumberSchema.optional().describe(
    'Team number (no prefix), e.g. 86',
  ),
  year: YearSchema.optional().describe('Four-digit year (2002 onwards)'),
  event: EventKeySchema.optional().describe('Event key, e.g. 2024flor'),
  week: WeekSchema,
  elim: ElimSchema,
  ...PaginationSortFields,
});

export const GetTeamMatchInputSchema = z.object({
  team: TeamNumberSchema,
  match: MatchKeySchema,
});

export const GetTeamMatchesInputSchema = z.object({
  team: TeamNumberSchema.optional().describe(
    'Team number (no prefix), e.g. 86',
  ),
  year: YearSchema.optional().describe('Four-digit year (2002 onwards)'),
  event: EventKeySchema.optional().describe('Event key, e.g. 2024flor'),
  week: WeekSchema,
  match: MatchKeySchema.optional().describe('Match key, e.g. 2024flor_qm20'),
  elim: ElimSchema,
  ...PaginationSortFields,
});

// Helper function to convert Zod schema to MCP-compatible JSON Schema
export function toMCPSchema(zodSchema: z.ZodType): {
  type: 'object';
  properties?: { [key: string]: object };
  required?: string[];
  [key: string]: unknown;
} {
  const jsonSchema = z.toJSONSchema(zodSchema) as {
    type: 'object';
    properties?: { [key: string]: object };
    required?: string[];
    [key: string]: unknown;
  };

  // Remove $schema field for MCP compatibility
  delete jsonSchema['$schema'];

  return jsonSchema;
}
