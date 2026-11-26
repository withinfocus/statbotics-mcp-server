---
name: match-odds
description: Use when an FRC team asks about its chances in a specific match, for example "what are our odds in qm34?", "who's favored in the final?", "how close is our next match?" or "what's the predicted score for 2025casj_qm10?". Gives Statbotics' pre-match win probability and predicted score, and compares the two alliances' auto, teleop and endgame EPA to show where the match is likely won or lost.
---

# Match odds

Who's favored in one match, by how much, and where the match is likely decided. Built from Statbotics' pre-match prediction and the six teams' EPA going into the match.

Reference files (read when you need the detail):

- `references/epa.md`: EPA, `pre_epas`, win probabilities and how far to trust them.
- `references/statbotics-keys.md`: match keys and finding "our next match".
- `references/statbotics-data.md`: the no-hindsight rules for played matches.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "how do we win this?", "what should we focus on?", "are we in trouble?"
- Analyst mode: "show me the numbers", "compare the alliances", "what's the prediction?"
- If it isn't clear, ask once: "Do you want what the numbers mean for your plan, or just the prediction and the breakdown?"

## Steps

1. Find the match (see `references/statbotics-keys.md`). For "our next match", ask for the team number and event if you don't know them, then use `get_matches` as described there. Call `get_match` for the match.
2. Check `status`. If it's `Completed`, follow "Past matches and finished events" in `references/statbotics-data.md`: everything below comes from `pred` and `pre_epas`, which were set before the match, and the result goes at the end.
3. The prediction: from `pred`, take `red_win_prob` (blue's is 1 minus it), `red_score` and `blue_score`. Express it from the user's alliance if they're in the match.
4. The six teams: `alliances.red.team_keys` and `alliances.blue.team_keys`. For each, read its entry in `pre_epas` (keyed by team number as a string): `epa`, `auto_epa`, `teleop_epa`, `endgame_epa`. Never use the match's `epas` field; it's after the match.
   - If `pre_epas` is empty for the match, use `epa.stats.start` and the breakdown from `get_team_event` for each team instead, and say these are from the start of the event, not this match.
   - Before 2016, `pre_epas` has only `epa`, and 2021 has no breakdown. Skip the phase table for those seasons and say why.
5. The phase matchup: sum `auto_epa`, `teleop_epa` and `endgame_epa` per alliance and compare. The phase with the biggest gap (relative to its size) is where the match is most likely decided. The numbered game-specific values in `pre_epas` (`comp_0_epa` and so on) are hard to name reliably; leave them out. The total EPA per alliance will be a little below `pred`'s predicted score, because the prediction adds the season's average foul points; say so if the user compares them.
6. How much to trust it: `get_year` for the match's year gives `metrics.win_prob.season.acc` (all matches) and `metrics.win_prob.champs.acc` (championship matches; use it for a champs match). Use it to say how often the favorite wins. Note teams with few matches played this season; their EPA is less certain.
7. Playoffs: alliances in playoff matches are the drafted alliances. If a team has a surrogate or DQ (`surrogate_team_keys`, `dq_team_keys`), say so.

## Output

One screen. Lead with the odds.

- Header: match label (`match_name`), event, status, and the user's alliance if known.
- The prediction: "Red is favored, about 65% (predicted 142–128)". Round probabilities to the nearest 5% and scores to whole points.
- Phase table, one row per alliance:

| Alliance | Teams | Auto EPA | Teleop EPA | Endgame EPA | Total EPA |

- Key teams: the one or two robots that carry each alliance, by EPA.
- For a played match only, a final "What actually happened" line with the score and winner from `result`.

### Coach mode

Add what the numbers suggest for the plan: which phase the user's alliance should lean on, which phase to deny the opponents, and how much the odds should change their approach (a 55% match is close to a coin flip; a 25% match may call for a higher-variance plan). Say that EPA can't see defense, robot problems or a partner's plan, so the drive team should confirm the plan with partners.

Name the call where strong teams would disagree, if the plan makes one: playing it safe as a favorite versus pushing for ranking points, or an underdog trying a risky strategy versus playing for a clean match. Lay out both sides and leave the choice to the team.

### Analyst mode

The prediction, the phase table with all six teams listed individually (`epa`, `auto_epa`, `teleop_epa`, `endgame_epa`), the season accuracy figure, and the caveats. No strategy.

## Caveats to always include

- The win probability is a model estimate. Quote Statbotics' season accuracy so the user knows how often favorites win.
- EPA comes from alliance scores and can't see which robot scored what, defense, or robot breakdowns.
- Win probability is based on scoring without fouls. The predicted scores add an average foul rate, but actual foul points vary a lot from match to match.
- Teams with few matches this season are rated mostly on past seasons, so early-season odds are less certain.
- For a played match, the analysis uses only what was known before it; the result is shown separately.
