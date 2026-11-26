# Statbotics MCP Server

A Model Context Protocol (MCP) server that provides access to the Statbotics API for FIRST Robotics Competition statistical data and predictions. Enables AI assistants and other MCP clients to retrieve FRC team EPA ratings, event predictions, and match analytics.

## Features

- **Team Statistics**: Get EPA ratings, win rates, and historical performance for FRC teams
- **Event Data**: Access event details, predictions, and team performance at events
- **Match Analytics**: Retrieve match predictions, results, and team-level match statistics
- **Year-over-Year Data**: Query statistical trends from 2002 to the current year
- **Type Safety**: All responses validated with Zod schemas
- **API Key Optional**: Works without a key; set `STATBOTICS_API_KEY` to send one

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
