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
- `src/tools.ts` - Tool definitions
- `src/handlers.ts` - Tool execution handlers
- `src/schemas.ts` - Zod validation schemas
- `src/utils.ts` - Utility functions

### Test Architecture

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

## Development Commands

pnpm run build # Build TypeScript to dist/
pnpm run lint # Run ESLint and Prettier
pnpm run lint:fix # Auto-fix linting issues
pnpm test # Run Jest unit tests
pnpm run test:watch # Run tests in watch mode
pnpm run test:integration # Run Playwright integration tests
pnpm run test:all # Run all tests (unit + integration)
pnpm run inspect # Launch MCP inspector for debugging

## MCP Server Details

- **Name**: Statbotics MCP Server
- **Transport**: StdioServerTransport
- **API**: https://api.statbotics.io/v3/ (no API key required)

## When Working on The Project

1. Always run `pnpm run build` after making changes
2. Run `pnpm run lint` to ensure code quality
3. Run tests with `pnpm run test` and `pnpm run test:integration` before committing
4. Use `pnpm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
6. Keep the separation of concerns: tools -> schemas -> handlers -> tests
