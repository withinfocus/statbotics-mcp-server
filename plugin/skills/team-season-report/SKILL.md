---
name: team-season-report
description: Use when an FRC team wants to know how a team is doing over a season, for example "how's our robot doing this year?", "are we getting better?", "where do we rank in our district?", "how did 254 do in 2024?" or "what should we improve before our next event?". Tracks Statbotics EPA event by event, with world, country, state and district ranks and an auto, teleop and endgame breakdown against the season's percentiles.
---

# Team season report

One team's season in Statbotics numbers: how its EPA moved from event to event, where it ranks, and which parts of its game are strong or weak compared with the rest of the season.

Reference files (read when you need the detail):

- `references/epa.md`: EPA fields, ranks, percentiles and caveats.
- `references/statbotics-keys.md`: team numbers and event keys.
- `references/statbotics-data.md`: sorting and keeping results small.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "what should we work on?", "are we improving?", "how do we get to the next level?"
- Analyst mode: "show me our season", "give me the numbers", "table of our events".
- If it isn't clear, ask once: "Do you want suggestions on what to work on, or just the season data?"

## Steps

1. Get the team number and season (default: the current season). Call `get_team_year`. Keep: `epa.total_points`, `epa.norm`, `epa.stats` (`start`, `pre_champs`, `max`), `epa.ranks` (`total`, `country`, `state`, `district`: `rank`, `percentile`, `team_count`), `epa.breakdown`, and `record`. In the current season, `competing.next_event_name` and `next_event_week` say what's next.
2. Event by event: `get_team_events` with `team`, `year`, `metric: "week"`, `ascending: true`. Per event keep `event_name`, `week`, `status`, `epa.stats.start`, `epa.stats.pre_elim` (EPA going into its last qualification match; 0 if it hasn't played there yet), `epa.total_points`, `record.qual.rank` and `record.qual.num_teams`, and `record.elim.alliance` and `record.elim.is_captain`.
3. Season percentiles: `get_year` for the season. `percentiles` has `p25`, `p75`, `p90` and `p99` for `total_points` and for most breakdown components (`auto_points`, `teleop_points`, `endgame_points` and the numbered game-specific ones). Combined components such as `total_coral_points` or `total_fuel` have no percentiles. Place each of the team's components between those cutoffs.
4. Local comparison (when the user cares about their district or state): `get_team_years` with `year`, the team's `district` (or `state`), `metric: "epa"`, `ascending: false`, `limit: 25`. This shows what the top of their district looks like, component by component.
5. Game components: list the breakdown keys once and pick one to three game-specific components that matter in this game, besides auto, teleop and endgame. Some are piece counts or seconds, not points; label the units.
6. Ranks: for a team outside a district, `epa.ranks.district` ranks it among all teams outside districts. Say that, or use the state or country rank instead.

## Output

- Summary line: current EPA, worldwide and district (or state) rank and percentile, record.
- Event table, in week order:

| Week | Event | EPA in | EPA late in quals | EPA out | Qual rank | Playoffs |

- Component profile: each of auto, teleop, endgame and the chosen components, with the team's value and the season percentile band it falls in (for example "between p75 and p90").
- Trend in one sentence: how EPA moved from the season start to now, and in which events it moved most.

### Coach mode

Ask what target the team cares about if they haven't said (for example "top 25% in our district", "a top-8 seed at our next regional", "worldwide top 10%"). Then:

- The gap to that target, total and per component, using the percentile cutoffs or the local comparison from step 4.
- The one or two components where closing the gap looks most achievable, with the numbers behind that (for example "endgame is at p25 while auto is at p75; moving endgame to p75 is worth about X points"). Only put a points value on components measured in points.
- Say plainly that EPA shows where points are missing, not why. Whether the cause is the mechanism, the driving, the strategy or reliability is for the team to judge from video and its own scouting.
- Where strong teams would disagree: fixing the weakest component versus doubling down on what the robot already does well, and how much an upgrade between events is worth versus practice. Lay out both and leave it to the team.

### Analyst mode

The summary, event table and component profile, with the caveats. No advice.

## Caveats to always include

- EPA changes slowly by design and leans on past seasons early on. A big upgrade shows up over several matches, not at once.
- EPA is estimated from alliance scores; an event with very strong or very weak partners can move it more than the robot changed.
- Percentiles early in the season include teams that haven't played yet, whose EPA is still from past seasons.
- Raw EPA can't be compared with other seasons; use `epa.norm` or percentiles for that (see `season-benchmarks` if the user wants a cross-season comparison).
- Playoff matches count a third as much as qualification matches in EPA.
