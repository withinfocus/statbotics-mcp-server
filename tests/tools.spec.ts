import { describe, it, expect } from '@jest/globals';
import { tools } from '../src/tools.js';

describe('Tool definitions', () => {
  describe('tools array', () => {
    it('should export an array of tools', () => {
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each tool', () => {
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    it('should have unique tool names', () => {
      const names = tools.map((tool) => tool.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have valid JSON Schema for inputSchema', () => {
      tools.forEach((tool) => {
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
      });
    });

    it('should have exactly 14 tools', () => {
      expect(tools.length).toBe(14);
    });
  });

  describe('specific tool definitions', () => {
    it('should have get_team tool', () => {
      const getTool = tools.find((t) => t.name === 'get_team');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('team');
    });

    it('should have get_year tool', () => {
      const getTool = tools.find((t) => t.name === 'get_year');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('year');
    });

    it('should have get_event tool', () => {
      const getTool = tools.find((t) => t.name === 'get_event');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('event');
    });

    it('should have get_match tool', () => {
      const getTool = tools.find((t) => t.name === 'get_match');
      expect(getTool).toBeDefined();
      expect(getTool?.description).toContain('match');
    });

    it('should have get_team_year tool', () => {
      const getTool = tools.find((t) => t.name === 'get_team_year');
      expect(getTool).toBeDefined();
    });

    it('should have get_team_event tool', () => {
      const getTool = tools.find((t) => t.name === 'get_team_event');
      expect(getTool).toBeDefined();
    });

    it('should have get_team_match tool', () => {
      const getTool = tools.find((t) => t.name === 'get_team_match');
      expect(getTool).toBeDefined();
    });
  });

  describe('tool categories', () => {
    it('should have year-related tools', () => {
      const yearTools = tools.filter((t) => t.name.startsWith('get_year'));
      expect(yearTools.length).toBe(2);
    });

    it('should have team-related tools', () => {
      const teamTools = tools.filter(
        (t) => t.name === 'get_team' || t.name === 'get_teams',
      );
      expect(teamTools.length).toBe(2);
    });

    it('should have event-related tools', () => {
      const eventTools = tools.filter(
        (t) => t.name === 'get_event' || t.name === 'get_events',
      );
      expect(eventTools.length).toBe(2);
    });

    it('should have match-related tools', () => {
      const matchTools = tools.filter(
        (t) => t.name === 'get_match' || t.name === 'get_matches',
      );
      expect(matchTools.length).toBe(2);
    });
  });

  describe('tool descriptions', () => {
    it('should have meaningful descriptions for all tools', () => {
      tools.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description?.length).toBeGreaterThan(10);
        expect(tool.description).not.toContain('TODO');
        expect(tool.description).not.toContain('FIXME');
      });
    });
  });
});
