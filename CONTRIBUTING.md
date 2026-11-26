# Contributing to Statbotics MCP Server

## Prerequisites

- Node.js 26
- pnpm 12+

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/withinfocus/statbotics-mcp-server.git
cd statbotics-mcp-server
pnpm install --frozen-lockfile
```

### 2. Build the Project

```bash
pnpm run build
```

Note: An API key is optional. If you have one from <https://www.statbotics.io/apikey>, set it as `STATBOTICS_API_KEY`.

## Development Workflow

1. Make code changes
2. Build the project: `pnpm run build`
3. Run linting: `pnpm run lint` (fix with `pnpm run lint:fix`)
4. Run unit tests: `pnpm test`
5. Run integration tests: `pnpm run test:integration`
6. Ensure both test suites pass before committing

## Available Commands

```bash
pnpm run build                    # Build TypeScript to dist/
pnpm run lint                     # Run ESLint and Prettier
pnpm run lint:fix                 # Auto-fix linting issues
pnpm test                         # Run Jest unit tests
pnpm run test:watch               # Run tests in watch mode
pnpm run test:integration         # Run Playwright integration tests
pnpm run test:integration:ui      # Run with Playwright UI
pnpm run test:integration:debug   # Debug mode
pnpm run test:all                 # Run all tests (unit + integration)
pnpm run inspect                  # Launch MCP inspector for debugging
```

## Testing

### Unit Tests (Jest)

```bash
pnpm test                 # Run once
pnpm run test:watch       # Watch mode for development
```

Tests are located in `tests/*.spec.ts` and cover:

- Zod schemas (`tests/schemas.spec.ts`)
- Utility functions (`tests/utils.spec.ts`)
- The tool table and `tools/list` output (`tests/tools.spec.ts`)
- Tool calls through an in-memory SDK client (`tests/handlers.spec.ts`)
- The server factory (`tests/server.spec.ts`)

### Integration Tests (Playwright)

```bash
pnpm run test:integration         # Run all integration tests
pnpm run test:all                 # Run both unit and integration tests
```

**Requirements:**

- Project must be built first (`pnpm run build`)
- The live Statbotics API must be up; the tests call it directly

Always run both test suites when making changes.

## Project Structure

### Source Code

- `src/index.ts` - Main server entry point
  - Serves the MCP server over stdio with `serveStdio(() => createServer(version))`
  - Handles error logging and process lifecycle

- `src/server.ts` - Server factory
  - Exports `createServer(version)`, which builds an `McpServer` (from `@modelcontextprotocol/server`) and calls `registerTool()` once per entry in the `tools` table
  - Exports `SERVER_INSTRUCTIONS`, the short guidance sent to clients
  - Returns the server unconnected, so extensions can be attached before `serveStdio` connects it

- `src/tools.ts` - Tool table
  - Exports the `tools` array of `ToolDefinition` entries, one per MCP tool, built with `defineTool()`
  - Each entry has: `name`, `title`, `description`, `inputSchema` (a Zod object schema), `endpoint(args)` (builds the Statbotics API path), `responseSchema` (Zod), and an optional `select`
  - Exports `READ_ONLY_API`, the tool annotations every tool shares
  - Both server registration and the unit tests read from this table

- `src/handlers.ts` - Tool execution
  - Exports `executeTool(tool, args)`: calls `makeApiRequest(tool.endpoint(args))`, validates the response with `tool.responseSchema`, and returns the JSON as text content
  - Failures (HTTP, network, unexpected response shape) come back as `isError: true` results with an `Error: ...` message
  - Input validation is not done here: the SDK validates arguments against `inputSchema` before calling the handler

- `src/schemas.ts` - Zod validation schemas
  - Parameter schemas: TeamNumberSchema, YearSchema, EventKeySchema, etc.
  - Tool input schemas: `Get*InputSchema` (one `z.object` per tool)
  - API response schemas: `RecordSchema` and `RecordListSchema`

- `src/utils.ts` - Utility functions
  - `log()` - Writes server logs to stderr (stdout carries the stdio JSON-RPC stream)
  - `getApiKey()` - Reads the optional `STATBOTICS_API_KEY` environment variable
  - `makeApiRequest()` - Makes HTTP requests to the Statbotics API, with the `X-API-Key` header when a key is set

### Tests

- `tests/tools.spec.ts` - Unit tests for the tool table and the `tools/list` output (schemas, annotations, endpoints)
- `tests/handlers.spec.ts` - Unit tests for `tools/call` (input validation, error results) and `executeTool`
- `tests/server.spec.ts` - Unit tests for `createServer`
- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/in-memory-client.ts` - Test helper that connects an SDK `Client` to `createServer()` over `InMemoryTransport`
- `tests/integration/*.spec.ts` - Playwright integration tests for MCP protocol compliance, using a raw JSON-RPC stdio client (`tests/integration/mcp-client.ts`)

### Adding a New Tool

A tool is one `defineTool()` entry in the `tools` table in `src/tools.ts`, with no handler to write. The steps, with examples, are in the "How to Add a New Tool" section of [CLAUDE.md](CLAUDE.md).

## Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Jest for unit testing
- Playwright for integration testing

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines above
4. Run all tests (`pnpm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Questions or Issues?

- Open an issue on GitHub
- Review the [MCP specification](https://modelcontextprotocol.io/)
- Consult the [Statbotics API docs](https://api.statbotics.io/docs)
