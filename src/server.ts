import { McpServer } from '@modelcontextprotocol/server';
import type { SkillCatalog } from '@modelcontextprotocol/server/ext/skills';
import { executeTool } from './handlers.js';
import { READ_ONLY_API, tools } from './tools.js';

export const SERVER_NAME = 'Statbotics MCP Server';

/**
 * Short guidance for clients, including ones without the Skills extension.
 * Some clients load this into every conversation, so it stays brief.
 */
export const SERVER_INSTRUCTIONS =
  'Statistics and predictions from Statbotics for FIRST Robotics Competition teams, seasons, events and matches. ' +
  'It can help teams size up the field at an event, check their odds in a match, track a robot through a season, and set targets from past seasons. ' +
  "EPA (Expected Points Added) estimates a team's contribution to its alliance score in that season's points, so raw EPA is not comparable across seasons; use norm_epa or percentiles for that. " +
  'Win probabilities and predicted scores are model estimates made before a match, not results.';

/**
 * Builds the MCP server with every tool from the `tools` table registered,
 * and the skills extension attached when a catalog is given.
 *
 * The server is returned unconnected so callers can extend it further (for
 * example attach other extensions, which must happen before `connect`) and
 * then connect it to a transport.
 */
export function createServer(
  version: string,
  options: { skills?: SkillCatalog } = {},
): McpServer {
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

  options.skills?.attach(server);

  return server;
}
