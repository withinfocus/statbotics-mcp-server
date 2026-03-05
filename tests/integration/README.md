# Integration Tests for Statbotics MCP Server

Comprehensive Playwright-based integration tests for the Statbotics MCP Server.

## Setup

1. Install dependencies:

```bash
npm ci
```

2. Build the project:

```bash
npm run build
```

No API key is required. The Statbotics API is free and open.

## Running Tests

### All Integration Tests

```bash
npm run test:integration
```

### Debug Mode

```bash
npm run test:integration:debug
```

### UI Mode

```bash
npm run test:integration:ui
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

## Notes

- No API key is required to run tests
- Tests are designed to be resilient to API changes and data availability
- Run tests in headless mode for CI/CD environments
