---
name: season-benchmarks
description: Use when an FRC team wants targets or comparisons from Statbotics season data, for example "what EPA does it take to be a top-8 seed?", "what does a champs-level robot look like this year?", "what should our auto be worth?", "was 2018 254 better than 2024 1690?" or "how does this year's robot compare to our best ever?". Uses each season's EPA percentiles, event fields and normalized EPA to set benchmarks and compare across seasons.
---

# Season benchmarks

Turn Statbotics season data into concrete targets ("what does a top-8 robot score in auto?") and fair comparisons across seasons ("our best robot ever"). Raw EPA can't be compared across seasons, so cross-season work uses normalized EPA and percentiles.

Reference files (read when you need the detail):

- `references/epa.md`: EPA, `norm_epa`, percentiles and caveats.
- `references/statbotics-keys.md`: event types and weeks.
- `references/statbotics-data.md`: sorting, paging and keeping results small.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "what should we aim for?", "set our targets", "what does it take?"
- Analyst mode: "show me the percentiles", "compare these teams", "give me the table".
- If it isn't clear, ask once: "Do you want targets for your team, or just the benchmark data?"

## Steps

### Targets within one season

1. Pick the season. For build season, before the new game has been played, use the latest finished season and say the targets will need translating to the new game (see the Coach mode section).
2. Season cutoffs: `get_year` gives `percentiles` (`p25`, `p75`, `p90`, `p99`) for `total_points` and each breakdown component, plus `breakdown` averages (`auto_points_mean` and so on) and `score_mean`. Those averages are per alliance, from week 1 matches only, and `score_mean` includes fouls, so use them only as a rough early-season baseline. There's no median in the data; don't invent one. Combined components (such as `total_coral_points`) have no percentiles.
3. Benchmarks from real events, depending on the question:
   - "Top-8 at a regional (or district event)": `get_events` with `year`, `type: "regional"` (or `district`), `metric: "epa_top_8"`, `ascending: false`. Each event's `epa.top_8` is the EPA of its 8th-best team, roughly the bar for being an alliance captain or an early pick there. Report the typical value and the range across events, not just the strongest event.
   - "Champs level": `get_team_events` with `year`, `type: "champs_div"`, `metric: "epa_start"`, `ascending: false`. `epa.stats.start` is each team's EPA arriving at champs. Report percentiles of that list. This describes the robots that were there; it isn't how teams qualify, which depends on district points, awards and other rules.
   - "Top of our district or state": `get_team_years` with `year`, `district` (or `state`), `metric: "epa"`, `ascending: false`, and a `limit` that covers the rank the user cares about.
4. Components: compare the benchmark teams' `epa.breakdown` (auto, teleop, endgame, and one to three game-specific components) so the target says where the points come from, not just the total.

### Comparing across seasons

1. For each team-season, call `get_team_year` and use `epa.norm` and `epa.ranks.total.percentile`. Never compare raw `epa.total_points` across seasons.
2. For "our best season ever", `get_team_years` with `team`, `metric: "norm_epa"`, `ascending: false`. `get_team` also has `norm_epa` with `current`, `recent`, `mean` and `max` for a quick summary.
3. For "the best robots ever", `get_team_years` with `metric: "norm_epa"`, `ascending: false`, `limit: 25`, with or without a `year`.

## Output

- Targets: a table of the benchmark (for example "typical regional 8th-best EPA", "p90 worldwide", "champs median arrival EPA") with total, auto, teleop and endgame values in that season's points, and any game components in their own units.
- Cross-season: a table of team-seasons with normalized EPA, worldwide percentile and rank, and one line on what the difference means.

### Coach mode

- Turn the benchmarks into a small set of targets for the user's team (total plus the one or two components that matter most), each with the benchmark it comes from.
- Across seasons, express a target as a percentile or normalized EPA (for example "top 10% worldwide", about norm EPA 1625; see the scale in `references/epa.md`), since points don't carry over to a new game. Once the new game has been played, translate it into points with that season's `get_year` percentiles.
- Where strong teams would disagree: setting targets by total EPA versus by the components a team can control, and whether last season's bar is a fair guide when the new game rewards different things. Give both views and say which you used.

### Analyst mode

The benchmark tables and cross-season comparisons with the caveats. No targets or advice.

## Caveats to always include

- Raw EPA isn't comparable across seasons. Normalized EPA and percentiles are, but only roughly: the field changes from year to year, and normalized EPA ranks a robot against its own season.
- Season percentiles move during the season; numbers from an unfinished season are "as of now".
- EPA measures scoring estimated from alliance scores, not defense, driving or reliability.
- Event benchmarks like `top_8` (the 8th-best team's EPA) use EPA after each event, so they describe finished events; they aren't predictions for a future one.
- Champs attendance depends on qualification rules, not EPA; the champs benchmark describes the robots that attended.
