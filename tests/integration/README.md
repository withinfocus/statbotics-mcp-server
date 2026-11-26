# Integration Tests for Statbotics MCP Server

Comprehensive Playwright-based integration tests for the Statbotics MCP Server.

## Setup

1. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

2. Build the project:

```bash
pnpm run build
```

An API key is optional. If you have one from
<https://www.statbotics.io/apikey>, set `STATBOTICS_API_KEY` and the server
under test sends it. The tests call the live Statbotics API, so they fail when
the API is down.

## Running Tests

### All Integration Tests

```bash
pnpm run test:integration
```

### Debug Mode

```bash
pnpm run test:integration:debug
```

### UI Mode

```bash
pnpm run test:integration:ui
```

## Test Structure

### Basic Tests (`basic.spec.ts`)

- Server startup and initialization
- Basic tool listing and calling
- Simple API status checks

### Statbotics API Tests (`statbotics-api.spec.ts`)

- Year operations (get_year, get_years)
- Team operations (get_team, get_teams)
- Event operations (get_event, get_events)
- Match operations (get_match, get_matches)
- Team-year, team-event, and team-match operations
- Workflow tests combining multiple API calls

### Error Handling Tests (`error-handling.spec.ts`)

- Invalid input validation
- API error scenarios
- Tool not found errors
- Malformed request handling

### Performance Tests (`performance.spec.ts`)

- Response time validation
- Concurrent request handling

### Reliability Tests (`reliability.spec.ts`)

- Server restart handling
- State maintenance across requests
- Data integrity validation

### Data Validation Tests (`data-validation.spec.ts`)

- Schema validation for all response types
- Data consistency across endpoints
- Response format compliance

## Test Utilities

### MCPClient (`mcp-client.ts`)

Custom client for communicating with the MCP server via stdio protocol.

### Test Data (`test-data.ts`)

Predefined test data including known teams, events, and validation helpers.

### Setup (`setup.ts`)

Test fixtures for automatically managing MCP client lifecycle.

## Environment Variables

- `CI`: Affects retry and worker configuration
- `STATBOTICS_API_KEY`: Optional Statbotics API key, passed through to the server

## Notes

- An API key is optional when running tests
- Tests are designed to be resilient to API changes and data availability
- Run tests in headless mode for CI/CD environments
