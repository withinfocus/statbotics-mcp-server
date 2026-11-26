---
name: event-favorites
description: Use when an FRC team wants to know how strong the field is at an event, for example "who are the favorites at 2025casj?", "how strong is our regional this year?", "who are the top robots at our district event?" or "where do we stack up at champs?". Ranks the teams attending by Statbotics EPA, which carries over from earlier events, with auto, teleop and endgame breakdowns.
---

# Event favorites

Size up the field at one event: who the strongest teams are by EPA, what each is strong at, and where the user's team fits. EPA carries over from earlier events, so this works before an event starts, when event-only ratings like OPR don't exist yet.

Reference files (read when you need the detail):

- `references/epa.md`: what EPA measures, its breakdown fields, and the caveats to state.
- `references/statbotics-keys.md`: finding the event key and the user's team.
- `references/statbotics-data.md`: sorting, keeping results small, and the no-hindsight rules for finished events.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "who should we worry about?", "who are the favorites?", "where do we fit?"
- Analyst mode: "show me the field", "give me a table", "rank every team".
- If it isn't clear, ask once: "Do you want tiers and what they mean for your team, or just the ranked data?"

## Steps

1. Find the event key (see `references/statbotics-keys.md`) and call `get_event`. Note `status`, `week`, `num_teams`, and the field summary in `epa`: `max`, `mean`, `sd`, and `top_8` and `top_24`, which are the EPA of the 8th-best and 24th-best team (not averages). The summary is built from each team's EPA at this event, so for a `Completed` event it reflects the event itself; compute it from `epa.stats.start` in step 3 instead.
2. Get the roster with EPA in one call: `get_team_events` with `event`, `metric: "epa"`, `ascending: false`. Keep, per team: `team`, `team_name`, `epa.total_points`, `epa.stats.start`, `auto_points`, `teleop_points` and `endgame_points` from `epa.breakdown`, and `first_event`.
3. Choose the EPA column by event status:
   - `Upcoming`: `epa.total_points` is each team's current EPA. Use it.
   - `Ongoing`: `epa.total_points` includes matches played here so far. Show `epa.stats.start` next to it so the user sees who has moved.
   - `Completed`: use `epa.stats.start` only (EPA going into the event) and follow "Past matches and finished events" in `references/statbotics-data.md`. The breakdown fields are after the event, so leave them out or label them hindsight. Sort by `epa.stats.start` yourself.
4. Season context for the teams that matter (the top of the field, the user's team, any team the user names, usually 8–12 teams): `get_team_year` gives `epa.ranks` (worldwide, country, state, district percentile) and `record`. Skip this for a finished event, because season fields include later matches.
5. Experience: count each shortlisted team's earlier events this season with `get_team_events` for `team` and `year`, keeping only events with an earlier `week`. A team whose first event this is (`first_event: true`) is rated on last season's robot; flag it.
6. Game components: most seasons from 2016 on have game-specific components beyond auto, teleop and endgame (see `references/epa.md`). List the keys once and pick one to three that matter in this game (for example the main scoring piece). Some are piece counts, not points; label the units.

Tell the user before making more than about 15 calls.

## Output

- One line on the field: how deep it is (place `top_8` and `top_24` between the season's `percentiles.total_points` cutoffs from `get_year`), and the event's status.
- A roster table sorted by the EPA column chosen in step 3:

| Rank | Team | Name | EPA | Auto | Teleop | Endgame | Season percentile | Events so far |

- Below it, the user's team (if attending): its place in the table and its biggest gaps to the top 8.

### Coach mode

Add:

- Tiers with the rule stated (for example "likely captains: top 8 by EPA", "strong: EPA at or above `top_24`, the 24th-best team here", "unknown: first event of the season"). Teams within a few points are tied, so tiers matter more than order.
- Three to six teams to watch, one line each on why (what they score, how sure the rating is).
- Where the user's team fits and what that suggests (a likely captain, a likely first pick, or a team that needs a strong qualification run).
- Where strong teams would disagree: how much to trust EPA carried in from earlier events (robots change between events, and some scouting leads only trust what they see at this event), and whether a team with one great event is a real threat or a lucky schedule. Say which way you leaned.

### Analyst mode

The roster table, sortable by any column the user names, plus the field summary and the caveats. No tiers or advice.

## Caveats to always include

- EPA is estimated from alliance scores and carries over from earlier events. Robots change between events; a team's EPA can lag a big upgrade or a breakdown.
- Teams at their first event of the season are rated mostly on past seasons (see `references/epa.md`). Say "uncertain" for them rather than ranking them as weak.
- Teams a few EPA points apart are effectively tied.
- EPA doesn't measure defense, driving or reliability. Scouting and match video do.
- For a finished event: the analysis uses EPA going into the event; the actual results are listed separately.
