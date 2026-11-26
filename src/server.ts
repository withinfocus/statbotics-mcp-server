import { McpServer } from '@modelcontextprotocol/server';
import { executeTool } from './handlers.js';
import { READ_ONLY_API, tools } from './tools.js';

export const SERVER_NAME = 'Statbotics MCP Server';

/**
 * Short guidance for clients. Some clients load this into every
 * conversation, so it stays brief.
 */
export const SERVER_INSTRUCTIONS =
  'Statistics and predictions from Statbotics for FIRST Robotics Competition teams, seasons, events and matches. ' +
  "Most ratings use EPA (Expected Points Added), an estimate of a team's contribution to its alliance score in that season's points. " +
  'EPA values are not comparable across seasons; use normalized EPA (norm_epa) or percentiles for that. ' +
  'Win probabilities and predicted scores are model estimates made before a match, not results.';

/**
 * Builds the MCP server with every tool from the `tools` table registered.
 *
 * The server is returned unconnected so callers can extend it (for example
 * attach extensions, which must happen before `connect`) and then connect it
 * to a transport.
 */
export function createServer(version: string): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version },
    { instructions: SERVER_INSTRUCTIONS },
  );

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { ...READ_ONLY_API, title: tool.title },
      },
      (args) => executeTool(tool, args),
    );
  }

  return server;
}
