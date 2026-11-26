# Statbotics keys and identifiers

## Teams

Teams are bare numbers: `254`, not `frc254`. Strip a `frc` prefix if the user gives one.

## Events

An event key is the year plus the event code: `2025casj`, `2024necmp`, `2024cmptx`. If the user gives a name ("Silicon Valley Regional", "our district championship"), find the key with `get_events` (filters: `year`, `country`, `state`, `district`, `type`, `week`) or with `get_team_events` for their team and year. Confirm the event when more than one could match.

- `type` is one of `regional`, `district`, `district_cmp`, `champs_div` or `einstein`.
- `week` is the competition week: 1 to 7 for the regular season, and 8 for the championship.
- `status` is `Upcoming`, `Ongoing` or `Completed`.

## Matches

A match key is the event key, an underscore, and the match code:

- Qualification: `2025casj_qm10`. "Q10", "qual 10" and "match 10" usually mean this.
- Playoffs: `sf` (semifinal or double-elimination round) and `f` (final), as `<level><set>m<match>`: `2025casj_sf4m1`, `2025casj_f1m2`. Older events also have `qf` and `ef`.

Each match has `alliances.red.team_keys` and `alliances.blue.team_keys` (team numbers), `status` (`Upcoming` or `Completed`) and `elim` (true for playoffs). `match_name` is a readable label such as "Qual 10" or "Quarters 2 Match 1".

If the user doesn't know the key ("our next match"), call `get_matches` with `team`, `event`, `ascending: true` and `metric: "time"`, and take the first match whose `status` is `Upcoming`.

## Districts and locations

`district` is one of `ca`, `fch`, `fim`, `fin`, `fit`, `fma`, `fnc`, `fsc`, `isr`, `ne`, `ont`, `pch`, `pnw` or `win`. `country` is a capitalized name (`USA`, `Canada`, `Israel`); `state` is a two-letter code such as `CA` or `ON`.
