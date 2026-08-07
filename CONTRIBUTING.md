# Contributing to Statbotics MCP Server

## Prerequisites

- Node.js 24
- pnpm 11+ (`corepack enable`)

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

Note: No API key is required. The Statbotics API is freely accessible.

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
- Tool definitions (`tests/tools.spec.ts`)
- Handler functions (`tests/handlers.spec.ts`)

### Integration Tests (Playwright)

```bash
pnpm run test:integration         # Run all integration tests
pnpm run test:all                 # Run both unit and integration tests
```

**Requirements:**

- Project must be built first (`pnpm run build`)

Always run both test suites when making changes.

## Project Structure

### Source Code

- `src/index.ts` - Main server entry point
- `src/tools.ts` - Tool definitions
- `src/handlers.ts` - Tool execution handlers
- `src/schemas.ts` - Zod validation schemas
- `src/utils.ts` - Utility functions

### Tests

- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/tools.spec.ts` - Unit tests for tool definitions
- `tests/handlers.spec.ts` - Unit tests for handler functions
- `tests/integration/*.spec.ts` - Playwright integration tests

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
