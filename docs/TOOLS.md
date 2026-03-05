# Available Tools

Tools for accessing the Statbotics API. All tools validate input parameters and return structured, type-safe data.

## Table of Contents

- [Year Tools](#year-tools)
- [Team Tools](#team-tools)
- [Team Year Tools](#team-year-tools)
- [Event Tools](#event-tools)
- [Team Event Tools](#team-event-tools)
- [Match Tools](#match-tools)
- [Team Match Tools](#team-match-tools)
- [Common Parameters](#common-parameters)
- [Data Response Formats](#data-response-formats)
- [Common Patterns](#common-patterns)

## Year Tools

### `get_year`

Get statistics and metadata for a specific FRC competition year.

- **Parameters**: `year` (number, 2002 to current+1)
- **Returns**: Year data including EPA statistics, percentiles, and competition metrics
- **Example**: `get_year(year: 2024)`

### `get_years`

Get a list of years with optional sorting and pagination.

- **Parameters**: `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of year objects

## Team Tools

### `get_team`

Get detailed information about a specific FRC team.

- **Parameters**: `team` (number, min 1)
- **Returns**: Complete team profile including name, location, EPA stats, and competition history
- **Example**: `get_team(team: 86)`

### `get_teams`

Get a list of teams with optional filtering, sorting, and pagination.

- **Parameters**: `country` (string, optional), `state` (string, optional), `district` (string, optional), `active` (boolean, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of team objects

## Team Year Tools

### `get_team_year`

Get a team's statistics for a specific year.

- **Parameters**: `team` (number), `year` (number)
- **Returns**: Team-year data including EPA stats, event results, and rankings
- **Example**: `get_team_year(team: 86, year: 2024)`

### `get_team_years`

Get team-year records with optional filtering, sorting, and pagination.

- **Parameters**: `team` (number, optional), `year` (number, optional), `country` (string, optional), `state` (string, optional), `district` (string, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of team-year objects

## Event Tools

### `get_event`

Get detailed information about a specific FRC event.

- **Parameters**: `event` (string)
- **Returns**: Complete event details including dates, location, EPA stats, and results
- **Example**: `get_event(event: "2024flor")`

### `get_events`

Get a list of events with optional filtering, sorting, and pagination.

- **Parameters**: `year` (number, optional), `country` (string, optional), `state` (string, optional), `district` (string, optional), `type` (number, optional), `week` (number, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of event objects

## Team Event Tools

### `get_team_event`

Get a team's performance at a specific event.

- **Parameters**: `team` (number), `event` (string)
- **Returns**: Team-event data including EPA stats, match results, and rankings
- **Example**: `get_team_event(team: 86, event: "2024flor")`

### `get_team_events`

Get team-event records with optional filtering, sorting, and pagination.

- **Parameters**: `team` (number, optional), `year` (number, optional), `event` (string, optional), `country` (string, optional), `state` (string, optional), `district` (string, optional), `type` (number, optional), `week` (number, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of team-event objects

## Match Tools

### `get_match`

Get detailed information about a specific FRC match.

- **Parameters**: `match` (string)
- **Returns**: Complete match data with scores, alliances, and EPA predictions
- **Example**: `get_match(match: "2024flor_qm20")`

### `get_matches`

Get a list of matches with optional filtering, sorting, and pagination.

- **Parameters**: `year` (number, optional), `event` (string, optional), `team` (number, optional), `elim` (boolean, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of match objects

## Team Match Tools

### `get_team_match`

Get a team's performance in a specific match.

- **Parameters**: `team` (number), `match` (string)
- **Returns**: Team-match data including alliance position and EPA contributions
- **Example**: `get_team_match(team: 86, match: "2024flor_qm20")`

### `get_team_matches`

Get team-match records with optional filtering, sorting, and pagination.

- **Parameters**: `team` (number, optional), `year` (number, optional), `event` (string, optional), `match` (string, optional), `elim` (boolean, optional), `metric` (string, optional), `ascending` (boolean, optional), `limit` (number, optional), `offset` (number, optional)
- **Returns**: Array of team-match objects

## Common Parameters

### Sorting and Pagination

All list tools support these parameters:

- **`metric`** (string): Field to sort results by
- **`ascending`** (boolean): Sort direction (default: varies by endpoint)
- **`limit`** (number, 1-1000): Maximum number of results to return
- **`offset`** (number): Number of results to skip for pagination

### Filtering

List tools support various filters depending on the resource type:

- **`country`** (string): Filter by country name
- **`state`** (string): Filter by state/province
- **`district`** (string): Filter by district key
- **`active`** (boolean): Filter by active/inactive status (teams only)
- **`type`** (number): Filter by event type (events only)
- **`week`** (number): Filter by competition week (events only)
- **`elim`** (boolean): Filter by elimination vs qualification matches (matches only)

## Data Response Formats

All tools return JSON-formatted data with consistent structure:

- **Single resource tools** (`get_team`, `get_year`, etc.): Return a single JSON object
- **List tools** (`get_teams`, `get_years`, etc.): Return a JSON array of objects

All responses include EPA (Expected Points Added) statistics where applicable.

## Common Patterns

### Find a team's performance at a specific event

1. Use `get_team_event` to get their overall event performance
2. Use `get_team_matches` with `team` and `event` filters to see individual matches

### Analyze an event

1. Use `get_event` for event info and overall stats
2. Use `get_team_events` with the event filter to see all team performances
3. Use `get_matches` with the event filter to see all matches

### Compare teams across a season

1. Use `get_team_years` with year filter and sort by EPA metric
2. Use `get_team_year` for individual team deep-dives

### Track a team's history

1. Use `get_team` for overall team info
2. Use `get_team_years` with team filter to see year-by-year performance
