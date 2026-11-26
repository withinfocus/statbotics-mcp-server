# Data Schemas

All API inputs are validated using Zod schemas ensuring type safety and consistency. Responses are checked for shape before they are returned.

## Table of Contents

- [Input Schemas](#input-schemas)
  - [Common Parameters](#common-parameters)
  - [Year Schemas](#year-schemas)
  - [Team Schemas](#team-schemas)
  - [Team Year Schemas](#team-year-schemas)
  - [Event Schemas](#event-schemas)
  - [Team Event Schemas](#team-event-schemas)
  - [Match Schemas](#match-schemas)
  - [Response Schemas](#response-schemas)
- [Schema Validation](#schema-validation)

## Input Schemas

### Common Parameters

#### Resource Identifiers

- **`TeamNumberSchema`** - Positive integer (min 1) identifying an FRC team
- **`YearSchema`** - Integer between 2002 and current year + 1
- **`EventKeySchema`** - String identifying an event (e.g., "2024flor")
- **`MatchKeySchema`** - String identifying a match (e.g., "2024flor_qm20")

#### Sorting and Pagination

- **`MetricSchema`** - Optional string specifying the field to sort by
- **`AscendingSchema`** - Optional boolean for sort direction
- **`LimitSchema`** - Optional integer (1-1000) for result count
- **`OffsetSchema`** - Optional non-negative integer for pagination offset

#### Filters

- **`CountrySchema`** - Optional string for country filter
- **`StateSchema`** - Optional string for state/province filter
- **`DistrictSchema`** - Optional string for district filter
- **`EventTypeSchema`** - Optional string: `regional`, `district`, `district_cmp`, `champs_div`, or `einstein`
- **`WeekSchema`** - Optional integer (0-8) for competition week; 8 is the championship
- **`ActiveSchema`** - Optional boolean for active team filter
- **`ElimSchema`** - Optional boolean for elimination match filter

### Year Schemas

#### `GetYearInputSchema`

- `year` (required) - Competition year (2002 to current+1)

#### `GetYearsInputSchema`

- `metric`, `ascending`, `limit`, `offset` (all optional)

### Team Schemas

#### `GetTeamInputSchema`

- `team` (required) - Team number (positive integer)

#### `GetTeamsInputSchema`

- `country`, `state`, `district`, `active` (optional filters)
- `metric`, `ascending`, `limit`, `offset` (optional sorting/pagination)

### Team Year Schemas

#### `GetTeamYearInputSchema`

- `team` (required) - Team number
- `year` (required) - Competition year

#### `GetTeamYearsInputSchema`

- `team`, `year` (optional resource filters)
- `country`, `state`, `district` (optional location filters)
- `metric`, `ascending`, `limit`, `offset` (optional sorting/pagination)

### Event Schemas

#### `GetEventInputSchema`

- `event` (required) - Event key string

#### `GetEventsInputSchema`

- `year`, `country`, `state`, `district`, `type`, `week` (optional filters)
- `metric`, `ascending`, `limit`, `offset` (optional sorting/pagination)

### Team Event Schemas

#### `GetTeamEventInputSchema`

- `team` (required) - Team number
- `event` (required) - Event key string

#### `GetTeamEventsInputSchema`

- `team`, `year`, `event` (optional resource filters)
- `country`, `state`, `district`, `type`, `week` (optional filters)
- `metric`, `ascending`, `limit`, `offset` (optional sorting/pagination)

### Match Schemas

#### `GetMatchInputSchema`

- `match` (required) - Match key string

#### `GetMatchesInputSchema`

- `team`, `year`, `event` (optional resource filters)
- `week`, `elim` (optional week and elimination filters)
- `metric`, `ascending`, `limit`, `offset` (optional sorting/pagination)

## Response Schemas

- **`RecordSchema`** - One Statbotics record (a JSON object). Used by the single-record tools: `get_year`, `get_team`, `get_team_year`, `get_event`, `get_team_event`, and `get_match`
- **`RecordListSchema`** - An array of records. Used by the list tools: `get_years`, `get_teams`, `get_team_years`, `get_events`, `get_team_events`, and `get_matches`

Both keep every field Statbotics returns. A response of the wrong shape (for example, a list where one record was expected) comes back as an `isError: true` tool result.

## Schema Validation

The MCP SDK validates tool arguments against these schemas before a tool runs, and the same schemas produce the JSON Schema clients see in `tools/list`. All inputs are validated to ensure:

- **Type Safety**: Correct data types for all parameters
- **Range Validation**: Years within valid range, team numbers positive, limits within bounds
- **Required Fields**: Essential parameters are always provided
- **Optional Handling**: Missing optional parameters are excluded from API requests
- **Error Prevention**: Invalid inputs are caught before reaching the Statbotics API
