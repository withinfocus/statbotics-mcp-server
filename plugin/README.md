# Statbotics

FIRST Robotics Competition statistics and predictions from [Statbotics](https://www.statbotics.io), plus four skills that turn them into answers a team can use. This is a community plugin. Statbotics doesn't build or support it.

## What you get

The plugin adds 12 read-only tools covering the Statbotics API from 2002 to the current season: seasons, teams, team seasons, events, team performance at events, and matches. Ratings use EPA (Expected Points Added), which estimates how many points a team adds to its alliance's score and carries over from event to event. Matches include Statbotics' pre-match win probability and predicted score.

It also adds four skills:

| Skill                | Use it                         | What you get                                                                                                    |
| -------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `event-favorites`    | Before or during an event      | The teams at an event ranked by EPA, with auto, teleop and endgame breakdowns, tiers, and where your team fits  |
| `match-odds`         | Before a match                 | The win probability and predicted score, and where the match is likely won or lost by phase                     |
| `team-season-report` | Any time in the season         | A team's EPA event by event, its world, country, state and district ranks, and its strongest and weakest phases |
| `season-benchmarks`  | Build season or between events | Targets from real season data and fair comparisons across seasons with normalized EPA                           |

## Setup

1. Install [Node.js](https://nodejs.org) 26 or later. The plugin starts the server with `npx`, which comes with Node.js.
2. Install the plugin. In Claude Code:

   ```text
   /plugin install statbotics --marketplace withinfocus/statbotics-mcp-server
   ```

The tools run on your computer, so they work in Claude Code and in Cowork sessions on your computer. Claude chat on the web, desktop, and mobile loads the skills but doesn't start local servers, so the skills there have no Statbotics data to work with.

## Use it

Ask in your own words. You don't need tool or skill names.

- "Who are the favorites at 2025casj? We're team 649."
- "What are our odds in 2025casj_qm10?"
- "How's our robot doing this season? We're 5511."
- "What EPA does it take to be a top-8 seed at a regional?"

Each skill has a coach mode, which gives a concrete answer and says where strong teams would disagree, and an analyst mode, which gives you the numbers and leaves the decision to you. Say which you want, or the skill asks.

The skills stick to what EPA can tell you. EPA is estimated from alliance scores, so it can't see which robot scored what, defense, or reliability, and early in a season it leans on a team's past seasons. Teams a few points apart are treated as tied. Raw EPA isn't comparable across seasons, so cross-season comparisons use normalized EPA. For a finished event or a played match, the skills use only what was known beforehand and show the real result separately.

## Data

- The plugin runs the [`@withinfocus/statbotics-mcp-server`](https://www.npmjs.com/package/@withinfocus/statbotics-mcp-server) package from npm on your computer. `npx` downloads it the first time.
- The server sends requests to `api.statbotics.io/v3`. Each request names only the team, event, match, or year being looked up, plus any filters.
- Nothing you type in a conversation is sent to Statbotics or stored by the plugin.

Source, issues, and the full tool list: [github.com/withinfocus/statbotics-mcp-server](https://github.com/withinfocus/statbotics-mcp-server).
