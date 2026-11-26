# Getting Statbotics data efficiently

## Which tool

- One record: `get_team`, `get_team_year`, `get_team_event`, `get_event`, `get_match`, `get_year`.
- Many records: `get_teams`, `get_team_years`, `get_team_events`, `get_events`, `get_matches`, `get_years`. Filters combine: `get_team_events` with `event` gives every team at an event with its EPA there; with `team` and `year` it gives one team's season, event by event.

## Sorting and paging

- `metric` sorts by a database column. Use the flat column names, not the nested JSON paths, and only the ones that exist for that tool. An unknown name fails with an empty server error.
  - `get_team_years` and `get_team_events`: `epa`, `auto_epa`, `teleop_epa`, `endgame_epa`, `norm_epa`, `epa_start`, `epa_max`, `week` (team events only).
  - `get_events`: `epa_max`, `epa_top_8`, `epa_top_24`, `epa_mean`, `week`.
  - `get_matches`: `time`.
  - `get_teams`: `norm_epa`.
  - Rows where that column is empty are left out.
- Always pass `ascending` with `metric`. Pass `ascending: false` for "highest first" and `true` for "earliest first"; don't rely on the default.
- `limit` is 1 to 1000; `offset` pages through more. For "top N", sort and set `limit: N` rather than fetching everything.

## Keeping results small

- Match rows are much larger than team rows because of `pre_epas` and the per-component results. Fetch an event's roster (`get_team_events` with `event`) or schedule (`get_matches` with `event`) once and reuse it; don't fetch per team.
- Reduce each result to the fields you need right away (team, name, `epa.total_points`, a few breakdown components, ranks, record) and don't quote raw JSON.
- Tell the user before a long run (for example, one call per team for 40 teams).

## Past matches and finished events (no hindsight)

Check the status before analyzing anything as if it were ahead of you. An event with `status: "Completed"`, or a match with `status: "Completed"`, is in the past.

- For a finished event, use each team's `epa.stats.start` from `get_team_event` (its EPA going into the event), not `epa.total_points` (after the event). Season fields from `get_team_year` (current EPA, ranks, record) include everything after the event too, so don't use them to size up an old event.
- For a played match, use `pre_epas` and `pred` from that match; both were set before it was played. Don't use the match's `epas` (after the match), or EPA, ranks or results from later matches.
- Put real results (scores, winners, final ranks, playoff alliances) in a separate "what actually happened" section at the end, clearly labeled. Never let them shape the analysis above it.
- If the user explicitly asks for a retrospective ("how accurate were the predictions?"), comparing predictions with results is the point; say that's what you're doing.
