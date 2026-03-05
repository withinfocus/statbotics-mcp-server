import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  toMCPSchema,
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
} from './schemas.js';

export const tools: Tool[] = [
  {
    name: 'get_year',
    description:
      'Get statistical data for a specific FRC season year including EPA percentiles and scoring averages',
    inputSchema: toMCPSchema(GetYearInputSchema),
  },
  {
    name: 'get_years',
    description:
      'Get statistical data for multiple FRC season years. Returns data from 2002 onwards.',
    inputSchema: toMCPSchema(GetYearsInputSchema),
  },
  {
    name: 'get_team',
    description:
      'Get statistical data for a specific FRC team including EPA ratings, win rate, and location',
    inputSchema: toMCPSchema(GetTeamInputSchema),
  },
  {
    name: 'get_teams',
    description:
      'Get statistical data for multiple FRC teams with optional filtering by country, state, district, and active status',
    inputSchema: toMCPSchema(GetTeamsInputSchema),
  },
  {
    name: 'get_team_year',
    description:
      "Get a team's statistics for a specific year including EPA ratings, win/loss record, and event results",
    inputSchema: toMCPSchema(GetTeamYearInputSchema),
  },
  {
    name: 'get_team_years',
    description:
      'Get team-year statistics with optional filtering by team, year, location, and district',
    inputSchema: toMCPSchema(GetTeamYearsInputSchema),
  },
  {
    name: 'get_event',
    description:
      'Get statistical data for a specific FRC event including EPA stats, qualification and playoff predictions',
    inputSchema: toMCPSchema(GetEventInputSchema),
  },
  {
    name: 'get_events',
    description:
      'Get statistical data for multiple FRC events with optional filtering by year, location, type, and week',
    inputSchema: toMCPSchema(GetEventsInputSchema),
  },
  {
    name: 'get_team_event',
    description:
      "Get a team's statistics at a specific event including EPA, rank, and match record",
    inputSchema: toMCPSchema(GetTeamEventInputSchema),
  },
  {
    name: 'get_team_events',
    description:
      'Get team-event statistics with optional filtering by team, year, event, location, type, and week',
    inputSchema: toMCPSchema(GetTeamEventsInputSchema),
  },
  {
    name: 'get_match',
    description:
      'Get statistical data for a specific match including alliances, scores, and EPA predictions',
    inputSchema: toMCPSchema(GetMatchInputSchema),
  },
  {
    name: 'get_matches',
    description:
      'Get statistical data for multiple matches with optional filtering by team, year, event, week, and elimination status',
    inputSchema: toMCPSchema(GetMatchesInputSchema),
  },
  {
    name: 'get_team_match',
    description:
      "Get a team's statistics for a specific match including EPA contributions and alliance info",
    inputSchema: toMCPSchema(GetTeamMatchInputSchema),
  },
  {
    name: 'get_team_matches',
    description:
      'Get team-match statistics with optional filtering by team, year, event, week, match, and elimination status',
    inputSchema: toMCPSchema(GetTeamMatchesInputSchema),
  },
];
