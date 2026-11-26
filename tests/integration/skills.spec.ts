import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/client';
import { SkillsClient } from '@modelcontextprotocol/client/ext/skills';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { tools as toolTable } from '../../src/tools.js';
import { getServerPath } from './setup.js';

const ANALYTICS_SKILLS = [
  'event-favorites',
  'match-odds',
  'season-benchmarks',
  'team-season-report',
];

async function connect(
  modern: boolean,
  extraEnv: Record<string, string> = {},
): Promise<Client> {
  const client = new Client(
    { name: 'skills-integration-test', version: '1.0.0' },
    modern ? { versionNegotiation: { mode: { pin: '2026-07-28' } } } : {},
  );
  await client.connect(
    new StdioClientTransport({
      command: 'node',
      args: [getServerPath()],
      env: { ...process.env, ...extraEnv } as Record<string, string>,
      stderr: 'ignore',
    }),
  );
  return client;
}

test.describe('Analytics skills over stdio', () => {
  test('lists and reads skills on the 2026-07-28 protocol', async () => {
    const client = await connect(true);
    try {
      const skills = new SkillsClient(client);
      expect(skills.supported).toBe(true);

      const { skills: entries } = await skills.list();
      expect(entries.map((s) => s.frontmatter.name).sort()).toEqual(
        ANALYTICS_SKILLS,
      );

      const matchOdds = entries.find(
        (s) => s.uri === 'skill://match-odds/SKILL.md',
      );
      expect(matchOdds).toBeDefined();

      const manifest = await skills.read(matchOdds!);
      expect(manifest.verified).toBe(true);
      expect(manifest.text).toContain('## Coach mode');

      const epa = await skills.read(matchOdds!, 'references/epa.md');
      expect(epa.verified).toBe(true);
      expect(new TextDecoder().decode(epa.bytes)).toContain('EPA');
    } finally {
      await client.close();
    }
  });

  test('legacy clients still get every tool', async () => {
    const client = await connect(false);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual(
        toolTable.map((t) => t.name).sort(),
      );
    } finally {
      await client.close();
    }
  });

  test('STATBOTICS_MCP_SKILLS=off serves tools without skills', async () => {
    const client = await connect(true, { STATBOTICS_MCP_SKILLS: 'off' });
    try {
      expect(new SkillsClient(client).supported).toBe(false);

      const { tools } = await client.listTools();
      expect(tools).toHaveLength(toolTable.length);
    } finally {
      await client.close();
    }
  });
});
