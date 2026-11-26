# EPA and its caveats

## What EPA is

EPA (Expected Points Added) is Statbotics' estimate of how many points a team adds to its alliance's score in an average match, in that season's points, not counting fouls. Three teams' EPAs add up to the alliance's predicted score before fouls.

How it's built (from the Statbotics model):

- After every match, the gap between the alliance's predicted and actual score is split evenly between its three teams, and each team's EPA moves part of the way toward its share. Recent matches count more than old ones.
- EPA moves fastest over a team's first six qualification matches of the season, then slows until about its twelfth.
- Playoff matches count a third as much as qualification matches.
- At the start of a season, a team's EPA comes from its two most recent seasons (70% the latest, 30% the one before), pulled 40% toward a slightly below-average baseline. Teams with no history start at that baseline.
- EPA carries over from event to event within a season, so it works before an event starts. That's its main advantage over OPR, which starts fresh at each event.

## Where EPA appears

- `get_team_year`, `get_team_years`: `epa.total_points` is the team's current (or season-final) EPA. `epa.stats` has `start`, `pre_champs` and `max` (`max` only counts from the team's ninth match on). `epa.ranks` has `rank`, `percentile` and `team_count` for `total` (worldwide), `country`, `state` and `district`. For a team outside a district, `district` ranks it among all teams outside districts.
- `get_team_event`, `get_team_events`: `epa.total_points` is the EPA after the event (for an upcoming event, the current EPA). `epa.stats` has `start` (going into the event), `pre_elim` (going into the team's last qualification match), and `mean` and `max` of its EPA going into each match there. Before a team has played at the event, `pre_elim`, `mean` and `max` are 0; ignore them.
- Both have `epa.breakdown`. Most seasons from 2016 on have `auto_points`, `teleop_points` and `endgame_points`, plus game-specific components whose names change every season (2025 has `coral_l4` and `total_coral_points`; 2026 has `total_fuel` and `total_tower`). 2021 has no breakdown. List the keys before using them, and read the name: some components are counts of game pieces (`coral_l4`, `total_fuel`) or seconds, not points.
- `epa.norm` is normalized EPA (see below). `epa.unitless` is an older normalization; prefer `epa.norm`.
- `get_match`, `get_matches`: `pre_epas` maps each team number (as a string) to its EPA going into that match: `epa`, plus `auto_epa`, `teleop_epa` and `endgame_epa` from 2016 on. The match's `epas` field is each team's EPA after the match; never use it to analyze the match itself.
- Ignore the ranking-point values (`rp_1_epa` and the named `..._rp` breakdown entries). They're on an internal scale, not probabilities.

## Normalized EPA

`norm_epa` (`epa.norm`, and `norm_epa` on `get_team`) places a team on a fixed scale by its percentile within its season. The scale is skewed, so 1500 isn't the middle and the steps aren't even:

| Percentile in its season | Normalized EPA (about) |
| ------------------------ | ---------------------- |
| 25th                     | 1440                   |
| 50th                     | 1490                   |
| 75th                     | 1550                   |
| 90th                     | 1625                   |
| 95th                     | 1680                   |
| 99th                     | 1810                   |

Use normalized EPA, or percentiles, to compare across seasons. Raw EPA isn't comparable across seasons: scoring changes completely from game to game. Small differences at the top of the scale are large differences in rank.

## Caveats to state whenever you use EPA

- EPA is an estimate from alliance scores, like OPR. It can't see which robot scored what. A team with strong partners all event can look better than it is, and the reverse.
- Early in the season EPA leans on past seasons. A rebuilt or much-improved robot is misrated until it has played several matches. Say how many matches a team has played this season when it's low.
- Fouls: EPA leaves out foul points (from 2016 on). Compare sums of EPA with `red_no_foul` and `blue_no_foul` in a match's `result`, not with the final scores.
- Treat EPA gaps smaller than a few points (or a few percent of a typical alliance score) as ties. Use tiers rather than fine rankings.
- EPA measures scoring. It says nothing direct about defense, driving, reliability or strategy; scouts see those.

## Win probabilities and predicted scores

`get_match` has `pred` with `red_win_prob` (0 to 1), `winner`, `red_score` and `blue_score`. These are computed before the match from the teams' EPAs at the time, even for matches already played.

- `red_win_prob` comes from the predicted margin without fouls, relative to the season's early score spread.
- `red_score` and `blue_score` add the season's average foul rate on top of the EPA sum, so they're a bit higher than the alliance's summed EPA. Compare them with the final scores (`result.red_score`, `result.blue_score`). In 2018 the predicted score uses a game-specific formula and won't match the EPA sum.
- A 60% favorite loses 4 times in 10. Present probabilities as odds, not verdicts.
- Statbotics reports how often its predicted winner won: `get_year` has `metrics.win_prob.season.acc` (all matches, playoffs included) and `metrics.win_prob.champs.acc` (championship matches), and `get_event` has `metrics.win_prob.acc` for one event. Quote those numbers rather than guessing. Event-level accuracy for an unfinished event covers only the matches played so far.
- Predictions are weakest early in the season and at the first event for teams without history.
