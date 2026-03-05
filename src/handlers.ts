import { makeApiRequest } from './utils.js';
import {
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

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function handleToolCall(
  name: string,
  args: unknown,
): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  switch (name) {
    case 'get_year': {
      const { year } = GetYearInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/year/${year}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_years': {
      const { metric, ascending, limit, offset } =
        GetYearsInputSchema.parse(args);
      const qs = buildQueryString({ metric, ascending, limit, offset });
      const data = await makeApiRequest(`/v3/years${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team': {
      const { team } = GetTeamInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/team/${team}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_teams': {
      const {
        country,
        state,
        district,
        active,
        metric,
        ascending,
        limit,
        offset,
      } = GetTeamsInputSchema.parse(args);
      const qs = buildQueryString({
        country,
        state,
        district,
        active,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/teams${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_year': {
      const { team, year } = GetTeamYearInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/team_year/${team}/${year}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_years': {
      const {
        team,
        year,
        country,
        state,
        district,
        metric,
        ascending,
        limit,
        offset,
      } = GetTeamYearsInputSchema.parse(args);
      const qs = buildQueryString({
        team,
        year,
        country,
        state,
        district,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/team_years${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_event': {
      const { event } = GetEventInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/event/${event}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_events': {
      const {
        year,
        country,
        state,
        district,
        type,
        week,
        metric,
        ascending,
        limit,
        offset,
      } = GetEventsInputSchema.parse(args);
      const qs = buildQueryString({
        year,
        country,
        state,
        district,
        type,
        week,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/events${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_event': {
      const { team, event } = GetTeamEventInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/team_event/${team}/${event}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_events': {
      const {
        team,
        year,
        event,
        country,
        state,
        district,
        type,
        week,
        metric,
        ascending,
        limit,
        offset,
      } = GetTeamEventsInputSchema.parse(args);
      const qs = buildQueryString({
        team,
        year,
        event,
        country,
        state,
        district,
        type,
        week,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/team_events${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_match': {
      const { match } = GetMatchInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/match/${match}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_matches': {
      const {
        team,
        year,
        event,
        week,
        elim,
        metric,
        ascending,
        limit,
        offset,
      } = GetMatchesInputSchema.parse(args);
      const qs = buildQueryString({
        team,
        year,
        event,
        week,
        elim,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/matches${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_match': {
      const { team, match } = GetTeamMatchInputSchema.parse(args);
      const data = await makeApiRequest(`/v3/team_match/${team}/${match}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    case 'get_team_matches': {
      const {
        team,
        year,
        event,
        week,
        match,
        elim,
        metric,
        ascending,
        limit,
        offset,
      } = GetTeamMatchesInputSchema.parse(args);
      const qs = buildQueryString({
        team,
        year,
        event,
        week,
        match,
        elim,
        metric,
        ascending,
        limit,
        offset,
      });
      const data = await makeApiRequest(`/v3/team_matches${qs}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
