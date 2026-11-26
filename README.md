# Statbotics MCP Server

A Model Context Protocol (MCP) server that provides access to the Statbotics API for FIRST Robotics Competition statistical data and predictions. Enables AI assistants and other MCP clients to retrieve FRC team EPA ratings, event predictions, and match analytics.

## Features

- **Team Statistics**: Get EPA ratings, win rates, and historical performance for FRC teams
- **Event Data**: Access event details, predictions, and team performance at events
- **Match Analytics**: Retrieve match predictions and results
- **Year-over-Year Data**: Query statistical trends from 2002 to the current year
- **Type Safety**: All responses validated with Zod schemas
- **API Key Optional**: Works without a key; set `STATBOTICS_API_KEY` to send one
- **Analytics Skills**: Four skills for sizing up an event, match odds, season reports and season benchmarks

## For FRC teams

The server ships four skills that tell Claude how to turn Statbotics data into answers a team can use. You don't need to know any tool names. Ask in your own words and the client loads the matching skill.

| Skill                | Use it                         | What you get                                                                                                                      |
| -------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `event-favorites`    | Before or during an event      | The teams at an event ranked by EPA, with auto, teleop and endgame breakdowns, tiers, and where your team fits                    |
| `match-odds`         | Before a match                 | Statbotics' win probability and predicted score, and where the match is likely won or lost by phase                               |
| `team-season-report` | Any time in the season         | A team's EPA event by event, its world, country, state and district ranks, and its strongest and weakest phases                   |
| `season-benchmarks`  | Build season or between events | Targets from real season data (what a top-8 or champs-level robot scores) and fair comparisons across seasons with normalized EPA |

Each skill has two modes. Coach mode gives a concrete answer, such as tiers or targets, states the rules it used, and says where strong teams would disagree. Analyst mode gives you the data and the caveats and leaves the decision to you. The skill picks the mode from how you ask ("what should we work on?" versus "show me the numbers"), asks once if it can't tell, and switches whenever you say so.

Example prompts:

- "Who are the favorites at 2025casj? We're team 649."
- "How strong is the field at our district championship?"
- "What are our odds in 2025casj_qm10?"
- "Our next match, numbers only. We're team 1700 at 2025casj."
- "How's our robot doing this season? We're 5511."
- "Are we improving? Where do we rank in our district?"
- "What EPA does it take to be a top-8 seed at a regional?"
- "Was 2018 254 better than 2024 1690?"

The skills are careful about what EPA can and can't tell you. EPA is estimated from alliance scores, so it can't see which robot scored what, defense, or reliability. Early in a season it leans on a team's past seasons. Raw EPA isn't comparable across seasons, so cross-season comparisons use normalized EPA. For a finished event or a played match, the skills analyze only what was known beforehand and show the real result separately.

Skills are served through the [MCP Skills extension](https://modelcontextprotocol.io/extensions/skills/overview). Clients that support it include Claude, Claude Code 2.1.331 and later, and VS Code Copilot. Other MCP clients still get every tool, plus short guidance in the server's instructions. Set `STATBOTICS_MCP_SKILLS=off` to serve the tools without the skills.

## Installation

### npm (Recommended)

```bash
npm install -g @withinfocus/statbotics-mcp-server
```

### Docker

Pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/withinfocus/statbotics-mcp-server:latest
```

Or build locally:

```bash
git clone https://github.com/withinfocus/statbotics-mcp-server.git
cd statbotics-mcp-server
docker build -t statbotics-mcp-server .
```

## Usage

### With npm

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "statbotics": {
      "command": "npx",
      "args": ["-y", "@withinfocus/statbotics-mcp-server"]
    }
  }
}
```

### With Docker

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "statbotics": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--init",
        "ghcr.io/withinfocus/statbotics-mcp-server:latest"
      ]
    }
  }
}
```

### API Key (Optional)

The server works without an API key. Statbotics also accepts an `X-API-Key`
header, rate limited to 100 requests per minute per key. To send one, get a key
at <https://www.statbotics.io/apikey> and set `STATBOTICS_API_KEY`:

```json
{
  "mcpServers": {
    "statbotics": {
      "command": "npx",
      "args": ["-y", "@withinfocus/statbotics-mcp-server"],
      "env": {
        "STATBOTICS_API_KEY": "your-key-here"
      }
    }
  }
}
```

With Docker, add `"-e", "STATBOTICS_API_KEY"` to `args` before the image name
and set the variable in `env` the same way.

If Statbotics answers 401 or 403, the error message points to this setting.

## Available Tools

### Year Tools (2 tools)

Query season-level statistical data.

**Tools**: `get_year`, `get_years`

### Team Tools (2 tools)

Access team profiles and EPA ratings.

**Tools**: `get_team`, `get_teams`

### Team Year Tools (2 tools)

Get team statistics for specific seasons.

**Tools**: `get_team_year`, `get_team_years`

### Event Tools (2 tools)

Query event details and predictions.

**Tools**: `get_event`, `get_events`

### Team Event Tools (2 tools)

Get team performance at specific events.

**Tools**: `get_team_event`, `get_team_events`

### Match Tools (2 tools)

Retrieve match data and predictions.

**Tools**: `get_match`, `get_matches`

## Quick Examples

### Get team information

```typescript
// Get team EPA ratings and statistics
get_team(team: 86)

// Get team's performance in a specific year
get_team_year(team: 86, year: 2024)
```

### Analyze an event

```typescript
// Get event statistics
get_event(event: "2024flor")

// Get all team performances at an event
get_team_events(event: "2024flor")
```

### Get match data

```typescript
// Get match predictions and results
get_match(match: "2024flor_qm20")

// Get every match a team played at an event
get_matches(team: 86, event: "2024flor")
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing guidelines, and how to add new tools.

## Related Links

- [Statbotics](https://statbotics.io/) - FRC statistical analysis
- [Statbotics API Documentation](https://api.statbotics.io/docs) - Official API docs
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
