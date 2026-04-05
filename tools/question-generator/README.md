# Pigskin5 Question Generator

Automated question generation for pigskin5.com. Generates trivia in the exact format your `CALENDAR` object expects.

## Quick Start

```bash
# Generate 7 days starting tomorrow
python generate_questions.py

# Generate 30 days starting from a specific date
python generate_questions.py --days 30 --start-date 2026-04-08

# Generate with AI polish (requires ANTHROPIC_API_KEY env var)
python generate_questions.py --days 7 --enhance

# Reproducible output (same seed = same questions)
python generate_questions.py --days 7 --seed 42
```

## Output

Drops a `generated_questions.js` file. Copy the entries into your `questions.js` CALENDAR object.

## Question Types (7 generators)

| Generator | Example |
|-----------|---------|
| `stat_leader` | "Who led the NFL in Passing TDs in 2025?" |
| `true_false` | "True or False: The Browns have appeared in a Super Bowl." |
| `over_under` | "OVER or UNDER: Tom Brady has O/U 5.5 Super Bowl MVPs" |
| `guess_player` | "Guess the Career QB:\n- 89,228 Pass Yards..." |
| `franchise` | "Who is the Bears' all-time leader in rushing yards?" |
| `history` | "Which player caught the play in 'The Catch'?" |
| `real_player` | "Which of these was an ACTUAL NFL player?" ← **NEW** |

## Difficulty System

Each day gets: 1 Easy + 3 Medium + 1 Hard

- **Easy**: Big names, well-known records, recent stars
- **Medium**: Solid trivia requiring real knowledge
- **Hard**: Deep cuts, obscure stats, trick questions

## File Structure

```
pigskin5_generator/
├── generate_questions.py      # Main script — run this
├── generators/
│   ├── __init__.py            # Base class (shared utils)
│   ├── nfl_data.py            # ALL NFL data lives here ← UPDATE THIS
│   ├── stat_leader.py         # "Who led / Who holds the record"
│   ├── true_false.py          # True/False facts
│   ├── over_under.py          # O/U stat lines
│   ├── guess_player.py        # Stat block → guess who
│   ├── franchise.py           # Team history & leaders
│   ├── history.py             # Super Bowls, drafts, iconic plays
│   └── real_player.py         # "Which name is real?" (East/West Bowl)
```

## Updating Data Each Season

Open `generators/nfl_data.py` and update:

1. **SEASON_LEADERS** — Add the new season's stat leaders and award winners
2. **Player lists** — Add/update current player stats (QBs, RBs, WRs, TEs)
3. **REAL_UNUSUAL_PLAYERS** — Add any new players with wild names
4. **SUPER_BOWLS** — Add the latest Super Bowl

Everything else (franchise history, records, iconic moments) only changes when records are broken.

## Your Workflow (5 min/month)

1. Run: `python generate_questions.py --days 30`
2. Open `generated_questions.js`
3. Skim through — spot-check 5-10 answers
4. Fix anything that looks off
5. Paste into your `questions.js` CALENDAR
6. Push to GitHub Pages

## Dependencies

- Python 3.10+
- No external packages required for base generation
- Optional: `pip install anthropic` for `--enhance` mode
