# Claude Instructions for Statbotics MCP Server

Model Context Protocol (MCP) server that provides access to the Statbotics API for FIRST Robotics Competition statistical data and predictions.

## Project Overview

- **Language**: TypeScript with Node.js
- **Framework**: Model Context Protocol SDK
- **Package Manager**: pnpm (version pinned in `packageManager`; settings in `pnpm-workspace.yaml`)
- **Main Entry**: `src/index.ts`
- **Build Output**: `dist/`
- **Transport**: stdio for MCP communication

## Project Structure

### Source Code Architecture

The codebase is organized into separate modules for maintainability:

- `src/index.ts` - Main server entry point
  - Loads the skills catalog once at startup (`loadScoutingSkills`), unless `STATBOTICS_MCP_SKILLS` turns skills off
  - Serves the MCP server over stdio with `serveStdio(() => createServer(version, { skills }))`
  - Handles error logging and process lifecycle

- `src/server.ts` - Server factory
  - Exports `createServer(version, { skills })`, which builds an `McpServer` (from `@modelcontextprotocol/server`), calls `registerTool()` once per entry in the `tools` table, and attaches the skills catalog when one is given
  - Exports `SERVER_INSTRUCTIONS`, the short guidance sent to clients in the `initialize` result
  - Returns the server unconnected, so extensions can be attached before `serveStdio` connects it

- `src/tools.ts` - Tool table
  - Exports the `tools` array of `ToolDefinition` entries, one per MCP tool, built with `defineTool()`
  - Each entry has: `name`, `title`, `description`, `inputSchema` (a Zod object schema), `endpoint(args)` (builds the Statbotics API path), `responseSchema` (Zod), and an optional `select(response, args)` that trims a response before it is returned
  - Exports `READ_ONLY_API`, the tool annotations every tool shares, and `buildQueryString()`, which the list endpoints use for their filters
  - Both server registration and the unit tests read from this table

- `src/handlers.ts` - Tool execution
  - Exports `executeTool(tool, args)`: calls `makeApiRequest(tool.endpoint(args))`, validates the response with `tool.responseSchema`, applies `tool.select` if there is one, and returns the JSON as text content
  - Failures (HTTP, network, unexpected response shape) come back as `isError: true` results with an `Error: ...` message
  - Input validation is not done here: the SDK validates arguments against `inputSchema` before calling the handler

- `src/schemas.ts` - Zod validation schemas
  - Parameter schemas: TeamNumberSchema, YearSchema, EventKeySchema, MatchKeySchema, and the filter, sort, and pagination schemas
  - Tool input schemas: `Get*InputSchema` (one `z.object` per tool)
  - API response schemas: `RecordSchema` (one record) and `RecordListSchema` (a list of records)
  - All schemas use Zod for runtime type validation

- `src/skills.ts` - Skills loader
  - Exports `skillsRootFor(moduleUrl)`, which resolves the package's `skills/` folder from a module URL (`dist/index.js` at runtime)
  - Exports `skillsEnabled()`, which is false when `STATBOTICS_MCP_SKILLS` is `off`, `false` or `0`
  - Exports `loadScoutingSkills(root, { strict })`, which loads `skills/` into a `SkillCatalog` with `loadSkills` from `@modelcontextprotocol/server/ext/skills/node`. Failures are logged and return `undefined`, so the server starts without skills instead of crashing

- `src/utils.ts` - Utility functions
  - `log()` - Writes server logs to stderr (stdout carries the stdio JSON-RPC stream)
  - `getApiKey()` - Reads the optional `STATBOTICS_API_KEY` environment variable
  - `makeApiRequest()` - Makes HTTP requests to the Statbotics API, with the `X-API-Key` header when a key is set

### Test Architecture

Tests are organized to mirror the source structure:

- `tests/tools.spec.ts` - Unit tests for the tool table and the `tools/list` output (schemas, annotations, endpoints)
- `tests/handlers.spec.ts` - Unit tests for `tools/call` (input validation, error results) and `executeTool`
- `tests/server.spec.ts` - Unit tests for `createServer`
- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/in-memory-client.ts` - Test helper that connects an SDK `Client` to `createServer()` over `InMemoryTransport`
- `tests/skills.spec.ts` - Unit tests for loading and serving skills (fixture in `tests/fixtures/skills/`)
- `tests/skills-content.spec.ts` - Guard tests for skill content: shared references in sync, only real tool names, `SKILL.md` structure, strict catalog load, and npm packaging
- `tests/integration/*.spec.ts` - Playwright integration tests for MCP protocol compliance, using a raw JSON-RPC stdio client (`tests/integration/mcp-client.ts`); `tests/integration/skills.spec.ts` uses the SDK `Client` and `SkillsClient` over stdio

### Skills

- `skills/<name>/` - Analytics skills served over MCP (`SKILL.md` plus `references/`), shipped in the npm package and Docker image
- `skills-src/shared/` - Shared reference files, copied into each skill by `scripts/sync-skills.mjs` (`pnpm run skills:sync`)

### Configuration Files

- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `jest.config.js` - Jest test configuration (looks for `*.spec.ts` files)
- `playwright.config.ts` - Playwright integration test configuration

## Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Jest for unit testing
- Playwright for integration testing

## Development Commands

```bash
pnpm run build                    # Build TypeScript to dist/
pnpm run lint                     # Run ESLint and Prettier
pnpm run lint:fix                 # Auto-fix linting issues
pnpm test                         # Run Jest unit tests
pnpm run test:watch               # Run tests in watch mode
pnpm run test:integration         # Run Playwright integration tests
pnpm run test:all                 # Run all tests (unit + integration)
pnpm run inspect                  # Launch MCP inspector for debugging
pnpm run skills:sync              # Copy shared skill references into every skill
```

The integration tests call the live Statbotics API, so they fail when the API is down. Check the API directly before chasing a failure in the server.

## MCP Server Details

- **Name**: Statbotics MCP Server
- **SDK**: MCP TypeScript SDK v2 (`@modelcontextprotocol/server`; `@modelcontextprotocol/client` is a dev dependency for unit tests)
- **Server class**: `McpServer`, tools registered with `registerTool()`
- **Transport**: stdio via `serveStdio()`, which answers both the 2025-era `initialize` handshake and the 2026-07-28 `server/discover` opening
- **API**: <https://api.statbotics.io/v3/>. An API key is optional: `makeApiRequest()` sends `STATBOTICS_API_KEY` as the `X-API-Key` header when it is set

## How to Add a New Tool

Most tools are one entry in the `tools` table. Follow these steps when adding a new MCP tool to the server. The examples show how `get_team_year` is defined.

### 1. Create the Input Schema (`src/schemas.ts`)

Add a `z.object` describing the tool arguments. Reuse the parameter schemas (`TeamNumberSchema`, `YearSchema`, ...) so ranges and descriptions stay consistent:

```typescript
export const GetTeamYearInputSchema = z.object({
  team: TeamNumberSchema,
  year: YearSchema,
});
```

The SDK converts this schema to JSON Schema for `tools/list` and validates `tools/call` arguments against it, so constraints such as `.int()`, `.min()`, `.max()`, and `.describe()` are what clients see and what the server enforces.

For a list endpoint, make every filter optional and spread `PaginationSortFields` in for `metric`, `ascending`, `limit`, and `offset`.

### 2. Pick a Response Schema (`src/schemas.ts`)

Use `RecordSchema` for an endpoint that returns one record and `RecordListSchema` for one that returns a list. If the tool needs to rely on particular fields, add a schema for them:

```typescript
export const TeamYearSchema = z.looseObject({
  team: z.number(),
  year: z.number(),
  epa: z.looseObject({}),
});
```

Use `z.looseObject` so fields the schema doesn't name still reach the client. Export the schemas and import them in `src/tools.ts`.

### 3. Add the Tool to the Table (`src/tools.ts`)

Add a `defineTool()` entry to the `tools` array:

```typescript
defineTool({
  name: 'get_team_year',
  title: 'Get FRC Team Season Stats (Single Team-Year)',
  description:
    "Get one team's performance summary for one specific FIRST Robotics Competition (FRC) season. ...",
  inputSchema: GetTeamYearInputSchema,
  endpoint: ({ team, year }) => `/v3/team_year/${team}/${year}`,
  responseSchema: RecordSchema,
}),
```

A list endpoint passes its arguments as the query string:

```typescript
endpoint: (args) => `/v3/team_years${buildQueryString(args)}`,
```

**Entry pattern:**

- `endpoint` receives arguments that are already validated and typed from `inputSchema`; it returns the path (including `/v3`) under `https://api.statbotics.io`
- `responseSchema` validates the Statbotics response before it is returned
- `select` is optional; add it only when a response is too large or noisy to hand to a model
- `createServer()` registers the entry with `registerTool()`, adding the shared read-only annotations (`READ_ONLY_API`) and the `title`
- `executeTool()` in `src/handlers.ts` runs the request and formats the result as `JSON.stringify(data, null, 2)` text content; errors become `isError: true` results

There is no handler or `switch` case to write. Only change `src/handlers.ts` or `src/server.ts` if a tool needs behavior the table cannot express.

### 4. Add Unit Tests

Add unit tests based on what you modified:

**If you added a new schema** (`tests/schemas.spec.ts`):

```typescript
describe('TeamYearSchema', () => {
  it('should accept a team-year record', () => {
    const teamYear = { team: 86, year: 2024, epa: { total_points: {} } };

    expect(() => TeamYearSchema.parse(teamYear)).not.toThrow();
  });

  it('should reject a record without a team number', () => {
    expect(() => TeamYearSchema.parse({ year: 2024, epa: {} })).toThrow();
  });
});
```

**If you added a new tool** (`tests/tools.spec.ts`):

- Add the expected path to `EXPECTED_ENDPOINTS` (the endpoint test fails until you do) and bump the tool count
- Add a check against the listed definition if the tool has notable parameters:

```typescript
it('should have get_team_year tool', () => {
  expect(find('get_team_year')?.inputSchema.required).toEqual(['team', 'year']);
});
```

**To test a tool call** (`tests/handlers.spec.ts`), call it through the in-memory SDK client (the `handleToolCall` helper in that spec) with a mocked `fetch`:

```typescript
it('should handle get_team_year', async () => {
  mockJson({ team: 86, year: 2024 });

  const result = await handleToolCall('get_team_year', {
    team: 86,
    year: 2024,
  });

  expect(result.content[0]!.type).toBe('text');
  expect(JSON.parse(result.content[0]!.text).year).toBe(2024);
});
```

**If you modified utility functions** (`tests/utils.spec.ts`):

Add tests to validate the utility function behavior.

### 5. Add Integration Tests (`tests/integration/statbotics-api.spec.ts`)

Add an integration test that calls your new tool via the MCP protocol:

```typescript
// Inside the existing describe block, which creates `mcpClient` in beforeEach
test('should get team year data', async () => {
  const result = await mcpClient.callTool('get_team_year', {
    team: 254,
    year: 2024,
  });

  expect(result.content).toBeInstanceOf(Array);
  expect(result.content[0]?.type).toBe('text');
  const content = JSON.parse(result.content[0]?.text || '');
  expect(content.team).toBe(254);
});
```

### 6. Build and Test

```bash
pnpm run build                # Build TypeScript
pnpm run lint                 # Check code quality
pnpm test                     # Run unit tests
pnpm run test:integration     # Run integration tests
```

## How to Add or Edit a Skill

The server serves FRC analytics skills through the MCP Skills extension (`io.modelcontextprotocol/skills`). Skills are plain files; no TypeScript changes are needed to add one. `STATBOTICS_MCP_SKILLS=off` (or `false`, `0`) turns them off.

### Layout

```text
skills-src/shared/                 # shared references, edited here only
skills/<skill-name>/SKILL.md       # the skill itself
skills/<skill-name>/references/    # shared copies plus skill-specific files
```

### Rules

- The folder name and the frontmatter `name` must match. `SKILL.md` starts with YAML frontmatter containing `name` and `description`. The description says when to use the skill, in the words an FRC student would use.
- Keep `SKILL.md` under 200 lines. Put detail in `references/` and point to it from the skill.
- Every skill has a `## Coach mode` and an `## Analyst mode` section, and coach mode names where strong teams would disagree.
- Name only real tools (`get_...` names from `src/tools.ts`).
- Don't let a skill invent data Statbotics doesn't have (per-robot game-piece counts, defense, driver skill, reliability), and keep the EPA caveats in `skills-src/shared/epa.md`.
- No hindsight: a skill that analyzes a finished event or a played match uses only what was known before it (`epa.stats.start`, `pre_epas`, `pred`) and shows the real result separately. See `skills-src/shared/statbotics-data.md`.
- Response field names in skills must match the API. Season-specific breakdown keys change every year; have the skill list them rather than hard-coding them.

### Shared references

Skills can only read files in their own folder, so shared references are copied into each skill. Edit them only in `skills-src/shared/`, then run:

```bash
pnpm run skills:sync
```

This copies every shared file into each skill's `references/` folder. Commit the copies.

### Guard tests

`tests/skills-content.spec.ts` fails if a shared copy differs from its source, if a skill names a tool that doesn't exist, if a `SKILL.md` breaks the rules above, if the catalog doesn't load under `strict: true`, or if the npm package would leave out `skills/`. `tests/skills.spec.ts` checks that each skill is served. Add a skill's name to the expected list there (and in `tests/integration/skills.spec.ts`) when you add a skill. `tests/integration/skills.spec.ts` lists and reads the skills over stdio.

## When Working on The Project

1. Always run `pnpm run build` after making changes
2. Run `pnpm run lint` to ensure code quality
3. Run tests with `pnpm run test` and `pnpm run test:integration` before committing
4. Use `pnpm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
6. When adding new tools, follow the 6-step process outlined above
7. Keep the separation of concerns: schemas → tool table (`tools.ts`) → execution (`handlers.ts`) → registration (`server.ts`) → tests
