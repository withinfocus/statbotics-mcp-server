import { z } from 'zod';
import type { ToolAnnotations } from '@modelcontextprotocol/server';
import {
  RecordSchema,
  RecordListSchema,
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
} from './schemas.js';

/**
 * Annotations shared by every tool. All Statbotics tools are read-only HTTP
 * GETs against the public https://api.statbotics.io/v3/ API: they never
 * mutate state, and repeating a call is safe. openWorldHint is set because
 * results come from live external data that can change over time.
 */
export const READ_ONLY_API: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/**
 * One MCP tool, backed by a single Statbotics API GET endpoint.
 *
 * `inputSchema` is registered with the MCP SDK as-is: the SDK converts it to
 * JSON Schema for `tools/list` and validates `tools/call` arguments against
 * it before `endpoint` runs. `responseSchema` validates the Statbotics
 * response.
 */
export interface ToolDefinition<Input extends z.ZodObject = z.ZodObject> {
  /** Tool name exposed to MCP clients (snake_case, e.g. `get_team`). */
  name: string;
  /** Human-readable display name. */
  title: string;
  /** Description shown to the model when it picks a tool. */
  description: string;
  /** Zod object schema for the tool arguments. */
  inputSchema: Input;
  /** Builds the Statbotics API path (including `/v3`) from validated arguments. */
  endpoint(args: z.output<Input>): string;
  /** Zod schema the Statbotics API response must satisfy. */
  responseSchema: z.ZodType;
  /**
   * Optional post-processing of the validated response, for endpoints whose
   * raw payload is too large or noisy to hand to a model.
   */
  select?(response: unknown, args: z.output<Input>): unknown;
}

// A table entry before widening: `select` sees the parsed response type.
type TypedTool<I extends z.ZodObject, R extends z.ZodType> = Omit<
  ToolDefinition<I>,
  'responseSchema' | 'select'
> & {
  responseSchema: R;
  select?(response: z.output<R>, args: z.output<I>): unknown;
};

// Ties each entry's `endpoint` and `select` argument types to its own
// schemas, then widens it so entries with different schemas fit in one array.
function defineTool<I extends z.ZodObject, R extends z.ZodType>(
  definition: TypedTool<I, R>,
): ToolDefinition {
  return definition as ToolDefinition;
}

/**
 * Builds the query string for the list endpoints. Unset filters are left
 * out, so Statbotics applies its own defaults.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const tools: readonly ToolDefinition[] = [
  defineTool({
    name: 'get_year',
    title: 'Get FRC Season Statistics (Single Year)',
    description:
      'Look up Statbotics season summary statistics for a single FIRST Robotics Competition (FRC) year. ' +
      'Returns aggregate metrics for the game played that year: EPA (Expected Points Added) percentile breakpoints ' +
      '(mean, median, 75th/90th/95th/99th), score component averages, foul rates, RP (ranking point) rates, and ' +
      'the count of teams, events, and matches recorded. ' +
      'Use this to answer questions like "what was the average score in the 2024 FRC season?", ' +
      '"what EPA put a team in the top 10% in 2019?", or to calibrate per-year scoring before comparing teams across seasons. ' +
      'Data is available for years 2002 onward; pre-2016 seasons have less detail because the EPA model was less granular. ' +
      'For comparing many seasons in one call, use get_years instead.',
    inputSchema: GetYearInputSchema,
    endpoint: ({ year }) => `/v3/year/${year}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_years',
    title: 'List FRC Season Statistics (Multiple Years)',
    description:
      'List Statbotics season summary statistics across multiple FIRST Robotics Competition (FRC) years in a single call. ' +
      'Returns the same per-season aggregates as get_year (EPA percentiles, scoring averages, foul/RP rates, counts) ' +
      'but as an array, with optional sorting and pagination. ' +
      'Use this to chart trends over time, e.g. "how have average match scores evolved from 2002 to today?", ' +
      '"which seasons had the highest top-1% EPA?", or to dump the full season catalog for downstream analysis. ' +
      'Sort with `metric` (any returned column name, e.g. `epa_max`, `score_mean`) and `ascending`; ' +
      'paginate with `limit` (1-1000, default 1000) and `offset`.',
    inputSchema: GetYearsInputSchema,
    endpoint: (args) => `/v3/years${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
  defineTool({
    name: 'get_team',
    title: 'Get FRC Team Profile (Single Team)',
    description:
      'Look up the Statbotics profile for a single FIRST Robotics Competition (FRC) team by team number. ' +
      'Returns lifetime/career data for that team: team name, rookie year, location (city, state/province, country), ' +
      'active status, current and historical EPA ratings, normalized EPA (norm_epa), career win/loss/tie record, ' +
      'and career win rate. ' +
      'Use this to answer "tell me about FRC team 254", "where is team 2056 based?", or "what is team 1678\'s career EPA?". ' +
      'The team number is the bare integer with no FRC/frc prefix (e.g. 86, not "frc86"). ' +
      'For per-season detail, use get_team_year. For filtering or browsing many teams, use get_teams.',
    inputSchema: GetTeamInputSchema,
    endpoint: ({ team }) => `/v3/team/${team}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_teams',
    title: 'List/Search FRC Teams',
    description:
      'List FIRST Robotics Competition (FRC) teams from the Statbotics database with optional filters. ' +
      'Returns an array of team profiles (number, name, location, rookie year, active flag, career EPA stats, ' +
      'career win rate). ' +
      'Filter by `country` (e.g. "USA", "Canada"), `state` (two-letter code, e.g. "NC", "CA"), ' +
      '`district` (one of ca, fch, fim, fin, fit, fma, fnc, fsc, isr, ne, ont, pch, pnw, win), ' +
      'and `active` (true to limit to teams that competed in the last year). ' +
      'Sort with `metric`/`ascending` (e.g. metric="norm_epa", ascending=false to find the strongest active teams) ' +
      'and paginate with `limit`/`offset`. ' +
      'Use this to answer "which teams in Texas are most successful?", "list all teams in the FIM district", ' +
      'or "find the top 50 teams by normalized EPA".',
    inputSchema: GetTeamsInputSchema,
    endpoint: (args) => `/v3/teams${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
  defineTool({
    name: 'get_team_year',
    title: 'Get FRC Team Season Stats (Single Team-Year)',
    description:
      "Get one team's performance summary for one specific FIRST Robotics Competition (FRC) season. " +
      "Returns the team's EPA breakdown for that year (start, pre-playoffs, end, max, mean, ranks/percentiles), " +
      'win/loss/tie record and win rate, count and list of events attended, district points, and award totals. ' +
      'Use this to answer "how did team 2056 do in 2023?", "what was team 254\'s peak EPA in 2018?", or ' +
      '"how many events did team 1114 attend in 2024?". ' +
      'Requires both team number (integer, no prefix) and a 4-digit year >= 2002. ' +
      'For multi-team or multi-year browsing, use get_team_years.',
    inputSchema: GetTeamYearInputSchema,
    endpoint: ({ team, year }) => `/v3/team_year/${team}/${year}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_team_years',
    title: 'List/Search FRC Team Season Stats',
    description:
      'List per-season FIRST Robotics Competition (FRC) team statistics with flexible filters - useful for ' +
      'cross-team or cross-year analysis. ' +
      "Returns an array of team-year records (each row is one team's stats for one season: EPA, record, ranks, " +
      'awards, district points). ' +
      'Filter by `team` (a single team across many seasons), `year` (all teams in one season), `country`, ' +
      '`state`, and `district`. Combine filters - e.g. team+year is equivalent to get_team_year. ' +
      'Sort with `metric`/`ascending` and paginate with `limit`/`offset`. ' +
      'Use this to answer "show team 254 in every season", "rank all teams by EPA in 2023", or ' +
      '"find the strongest teams in the New England district in 2024".',
    inputSchema: GetTeamYearsInputSchema,
    endpoint: (args) => `/v3/team_years${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
  defineTool({
    name: 'get_event',
    title: 'Get FRC Event Details (Single Event)',
    description:
      'Look up a single FIRST Robotics Competition (FRC) event by its event key. ' +
      'Returns metadata (event name, year, week, type, location, dates, district), aggregate EPA stats for ' +
      'participating teams, qualification and playoff status, and Statbotics predictions for the event ' +
      '(e.g. winner probabilities). ' +
      'Event keys follow the format `<year><event-code>`, e.g. "2024flor" (FLOR = Orlando regional 2024), ' +
      '"2024necmp" (New England district championship 2024), "2024cmptx" (Houston champs 2024). ' +
      'Use this to answer "what happened at 2024flor?", "show predictions for 2024cmptx", or to get ' +
      'context (week, type, location) for an event you have the key for. ' +
      'For browsing events by season, district, or week, use get_events.',
    inputSchema: GetEventInputSchema,
    endpoint: ({ event }) => `/v3/event/${event}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_events',
    title: 'List/Search FRC Events',
    description:
      'List FIRST Robotics Competition (FRC) events with optional filters - the discovery tool for finding ' +
      'event keys and browsing the season schedule. ' +
      'Returns an array of events with name, key, dates, location, week, type, EPA stats, and predictions. ' +
      'Filter by `year` (4-digit, >=2002), `country`, `state`, `district`, `type` ' +
      '(regional, district, district_cmp, champs_div, einstein), and `week` ' +
      '(0-8 of the season; 8 = championship). ' +
      'Sort with `metric`/`ascending` and paginate with `limit`/`offset`. ' +
      'Use this to answer "what regionals were in California in 2024?", "list all week 1 events this year", ' +
      'or "find the FRC championship divisions" (year=YEAR, type="champs_div"). ' +
      'If you need a single event you already know, use get_event.',
    inputSchema: GetEventsInputSchema,
    endpoint: (args) => `/v3/events${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
  defineTool({
    name: 'get_team_event',
    title: 'Get FRC Team Performance at Event (Single Team-Event)',
    description:
      "Get one team's performance at one specific FIRST Robotics Competition (FRC) event. " +
      "Returns the team's qualification rank, qualification record (W-L-T), playoff alliance and result, " +
      'EPA at this event (start, end, mean, breakdown by score component), and award list. ' +
      'Requires both `team` (integer, no prefix) and `event` (event key like "2024flor"). ' +
      'Use this to answer "how did team 2056 do at 2024onham?", "what was team 254\'s EPA at champs?", ' +
      'or "what awards did team 1114 win at their district championship?". ' +
      'For browsing many team-event combinations, use get_team_events.',
    inputSchema: GetTeamEventInputSchema,
    endpoint: ({ team, event }) => `/v3/team_event/${team}/${event}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_team_events',
    title: 'List/Search FRC Team-Event Records',
    description:
      'List FIRST Robotics Competition (FRC) team-event records with flexible filters. Each row represents ' +
      "one team's performance at one event (rank, record, EPA, awards). " +
      'Filter any combination of `team` (one team across all events), `year`, `event` (all teams at one event - ' +
      "great for getting an event's full team list with stats), `country`, `state`, `district`, " +
      '`type` (regional, district, district_cmp, champs_div, einstein), and `week` (0-8). ' +
      'Sort with `metric`/`ascending` and paginate with `limit`/`offset`. ' +
      'Use this to answer "show every event team 254 has attended in 2024", "list all teams at 2024flor with their ranks", ' +
      'or "rank teams by EPA across all 2024 district championships".',
    inputSchema: GetTeamEventsInputSchema,
    endpoint: (args) => `/v3/team_events${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
  defineTool({
    name: 'get_match',
    title: 'Get FRC Match Details (Single Match)',
    description:
      'Look up a single FIRST Robotics Competition (FRC) match by its match key. ' +
      'Returns full match detail: red and blue alliance team lists, final scores by alliance and component ' +
      '(auto, teleop, endgame, fouls), ranking points awarded, win/tie outcome, the Statbotics pre-match ' +
      'win probability and predicted score, and elimination flag. ' +
      'Match keys follow the format `<event-key>_<match-code>`, e.g. "2024flor_qm20" (qualification match 20), ' +
      '"2024flor_sf2m1" (semifinal 2 match 1), "2024flor_f1m3" (finals match 3). ' +
      'Use this to answer "who won 2024flor_qm20?", "what was the predicted vs actual score?", or to get ' +
      'alliance compositions for a known match. ' +
      'For browsing many matches, use get_matches.',
    inputSchema: GetMatchInputSchema,
    endpoint: ({ match }) => `/v3/match/${match}`,
    responseSchema: RecordSchema,
  }),
  defineTool({
    name: 'get_matches',
    title: 'List/Search FRC Matches',
    description:
      'List FIRST Robotics Competition (FRC) matches with optional filters. ' +
      'Returns an array of match records (alliances, scores, predictions, EPA-based win probabilities, ' +
      'elim flag). ' +
      'Filter by `team` (every match a team played in), `year`, `event` ' +
      '(every match at one event), `week` (0-8), and `elim` (true for playoff/elimination matches only, ' +
      'false for qualifications only). ' +
      'Sort with `metric`/`ascending` and paginate with `limit`/`offset`. ' +
      'Use this to answer "show all of team 254\'s matches in 2024", "list every elim match at 2024cmptx", ' +
      'or "find the highest-scoring matches of week 6".',
    inputSchema: GetMatchesInputSchema,
    endpoint: (args) => `/v3/matches${buildQueryString(args)}`,
    responseSchema: RecordListSchema,
  }),
];
