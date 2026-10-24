"""
Current Season Generator
========================
Questions built only from the season in progress, pulled live from nflverse
(via nflreadpy) at generation time. Nothing here reads nfl_data.py.

Stats count every finished game, and each question is pinned to the date
of the last one ("through Oct 22"), so the answer stays correct after it is
published even though the season keeps moving. A Thursday night game counts
as soon as it's final, so nobody's stats are missing a game they played.

  "Through Oct 22, 2026, who leads the NFL in rushing yards?"
  "Through Oct 22, 2026, which rookie wide receiver has the most receptions?"
  "Who has more passing TDs through Oct 22, 2026?"
  "How many sacks does X have through Oct 22, 2026?"
  "Who had the most receiving yards in a single game in Week 6 of 2026?"
  "What is the Lions' record through Oct 22, 2026?"
  "OVER or UNDER: X has O/U 9.5 passing TDs through Oct 22, 2026."

Filters (constructor args, or --position / --rookies on the CLI):
  positions:    limit player questions to these groups (QB, RB, WR, TE, DEF, K).
                Team questions are skipped when set.
  rookies_only: limit player questions to players whose rookie year is this
                season. Team questions are skipped when set.
"""

import random
from generators import BaseGenerator

try:
    import nflreadpy as nfl
    import pandas as pd
except ImportError:  # generator just reports itself unavailable
    nfl = None
    pd = None


TEAM_NICKNAMES = {
    "ARI": "Cardinals", "ATL": "Falcons", "BAL": "Ravens", "BUF": "Bills",
    "CAR": "Panthers", "CHI": "Bears", "CIN": "Bengals", "CLE": "Browns",
    "DAL": "Cowboys", "DEN": "Broncos", "DET": "Lions", "GB": "Packers",
    "HOU": "Texans", "IND": "Colts", "JAX": "Jaguars", "KC": "Chiefs",
    "LA": "Rams", "LAC": "Chargers", "LAR": "Rams", "LV": "Raiders",
    "MIA": "Dolphins", "MIN": "Vikings", "NE": "Patriots", "NO": "Saints",
    "NYG": "Giants", "NYJ": "Jets", "PHI": "Eagles", "PIT": "Steelers",
    "SEA": "Seahawks", "SF": "49ers", "TB": "Buccaneers", "TEN": "Titans",
    "WAS": "Commanders",
}

# nflverse position_group -> the groups this generator filters on
GROUP_OF = {"QB": "QB", "RB": "RB", "WR": "WR", "TE": "TE",
            "DL": "DEF", "LB": "DEF", "DB": "DEF"}
GROUP_NOUN = {"QB": "quarterback", "RB": "running back", "WR": "wide receiver",
              "TE": "tight end", "DEF": "defender", "K": "kicker"}
ALL_GROUPS = set(GROUP_NOUN)

# stat column -> (label, groups the stat is asked about for)
SEASON_STATS = {
    "passing_yards":         ("passing yards", {"QB"}),
    "passing_tds":           ("passing TDs", {"QB"}),
    "passing_interceptions": ("interceptions thrown", {"QB"}),
    "rushing_yards":         ("rushing yards", {"QB", "RB", "WR"}),
    "rushing_tds":           ("rushing TDs", {"QB", "RB"}),
    "receptions":            ("receptions", {"RB", "WR", "TE"}),
    "receiving_yards":       ("receiving yards", {"RB", "WR", "TE"}),
    "receiving_tds":         ("receiving TDs", {"RB", "WR", "TE"}),
    "scrimmage_yards":       ("scrimmage yards", {"RB", "WR", "TE"}),
    "def_sacks":             ("sacks", {"DEF"}),
    "def_interceptions":     ("interceptions", {"DEF"}),
    "def_tackles_total":     ("total tackles", {"DEF"}),
    "fg_made":               ("field goals made", {"K"}),
}
# Single-game questions only use stats where one game can stand out
GAME_STATS = ["passing_yards", "passing_tds", "rushing_yards",
              "receiving_yards", "receptions", "def_sacks"]

# Chance an unfiltered player question narrows itself to a position / rookies
POSITION_QUALIFIER_CHANCE = 0.35
ROOKIE_QUALIFIER_CHANCE = 0.20


class CurrentSeasonData:
    """Loads and aggregates the in-progress season once per process."""

    _cache: dict = {}

    @classmethod
    def get(cls, season: int | None = None) -> "CurrentSeasonData":
        key = season or "current"
        if key not in cls._cache:
            cls._cache[key] = cls(season)
        return cls._cache[key]

    def __init__(self, season: int | None = None):
        self.error = None
        self.week = 0           # last fully completed week (single-game questions)
        self.through = None     # date of the last game counted
        self.through_label = ""  # "Oct 22"
        if nfl is None:
            self.error = "nflreadpy/pandas not installed (pip install -r requirements.txt)"
            return
        try:
            self.season = season or nfl.get_current_season()
            self._load()
        except Exception as e:  # network down, season not published yet, etc.
            self.error = f"couldn't load {season or 'current'} season data: {e}"

    @property
    def available(self) -> bool:
        return self.error is None and self.through is not None

    def _load(self):
        sched = nfl.load_schedules([self.season]).to_pandas()
        sched = sched[sched.game_type == "REG"]

        stats = nfl.load_player_stats([self.season], summary_level="week").to_pandas()
        stats = stats[stats.season_type == "REG"].copy()

        # Count every game that is final AND has player stats published
        # (nflverse rebuilds stats nightly, so a game can be final before its
        # stats exist). Stop at the first final game still missing stats so
        # "through <date>" covers every game up to that date.
        has_stats = set(stats.game_id)
        final = sched[sched.home_score.notna()].sort_values("gameday")
        missing = final[~final.game_id.isin(has_stats)]
        if len(missing):
            # Leave out that whole day, or "through <date>" would overstate it
            final = final[final.gameday < missing.gameday.min()]
        if final.empty:
            return
        played = final
        self.through = pd.Timestamp(played.gameday.max())
        self.through_label = f"{self.through:%b} {self.through.day}"
        self.team_records = self._team_records(played)
        stats = stats[stats.game_id.isin(set(played.game_id))]

        # Single-game "in Week N" questions only use weeks every team has played
        weeks = sched.groupby("week").game_id.apply(lambda ids: ids.isin(played.game_id).all())
        for wk, done in weeks.sort_index().items():
            if not done:
                break
            self.week = int(wk)
        stats["def_tackles_total"] = (stats.def_tackles_solo.fillna(0)
                                      + stats.def_tackle_assists.fillna(0))
        stats["scrimmage_yards"] = stats.rushing_yards.fillna(0) + stats.receiving_yards.fillna(0)
        stats["group"] = stats.position_group.map(GROUP_OF)
        stats.loc[stats.position == "K", "group"] = "K"
        stats = stats[stats.group.notna()]

        rosters = nfl.load_rosters([self.season]).to_pandas()
        rookie_ids = set(rosters.loc[rosters.rookie_year == self.season, "gsis_id"].dropna())
        stats["rookie"] = stats.player_id.isin(rookie_ids)
        self.weekly = stats

        cols = list(SEASON_STATS)
        totals = stats.groupby("player_id")[cols].sum()
        latest = (stats.sort_values("week").groupby("player_id")
                  [["player_display_name", "team", "group", "rookie"]].last())
        self.totals = latest.join(totals).rename(columns={"player_display_name": "name"})

    @staticmethod
    def _team_records(played) -> dict:
        rec = {}
        for _, g in played.iterrows():
            for team, pf, pa in ((g.home_team, g.home_score, g.away_score),
                                 (g.away_team, g.away_score, g.home_score)):
                r = rec.setdefault(team, {"w": 0, "l": 0, "t": 0, "pf": 0, "pa": 0})
                r["pf"] += int(pf)
                r["pa"] += int(pa)
                r["w" if pf > pa else "l" if pf < pa else "t"] += 1
        return rec


class CurrentSeasonGenerator(BaseGenerator):

    def __init__(self, positions: list[str] | None = None,
                 rookies_only: bool = False, season: int | None = None):
        self.positions = {p.upper() for p in positions} if positions else None
        self.rookies_only = rookies_only
        self._season = season

    @property
    def data(self) -> CurrentSeasonData:
        return CurrentSeasonData.get(self._season)

    @property
    def available(self) -> bool:
        return self.data.available

    def generate(self, difficulty: str = "medium") -> dict:
        d = self.data
        if not d.available:
            raise RuntimeError(d.error or f"No completed games yet in the {d.season} season")

        team_ok = not self.positions and not self.rookies_only
        funcs = [self._leader, self._head_to_head, self._stat_value,
                 self._single_game_best, self._over_under, self._team_question]
        if difficulty == "easy":
            weights = [0.30, 0.25, 0.05, 0.15, 0.10, 0.15]
        elif difficulty == "hard":
            weights = [0.20, 0.15, 0.25, 0.15, 0.15, 0.10]
        else:
            weights = [0.25, 0.20, 0.10, 0.15, 0.15, 0.15]
        if not team_ok:
            weights[-1] = 0

        # A sub-type can come up empty (e.g. a tie at the top, or too few
        # rookies at a position), so retry with a fresh pick.
        for _ in range(30):
            func = random.choices(funcs, weights=weights, k=1)[0]
            q = func(difficulty)
            if q:
                q["_type"] = "current_season"
                q["_difficulty"] = difficulty
                return q
        raise RuntimeError("Couldn't build a current-season question with these filters")

    # ─── helpers ────────────────────────────────────────────────────────────

    @property
    def _through(self) -> str:
        return f"through {self.data.through_label}, {self.data.season}"

    def _pick_pool(self, stat_groups: set[str]):
        """
        Choose who a player question is about. Returns (DataFrame, qualifier)
        where qualifier is e.g. "", "rookie", "tight end", "rookie tight end".
        """
        allowed = stat_groups & (self.positions or ALL_GROUPS)
        if not allowed:
            return None, ""
        df = self.data.totals
        df = df[df.group.isin(allowed)]

        words = []
        rookies = self.rookies_only or random.random() < ROOKIE_QUALIFIER_CHANCE
        if rookies:
            df = df[df.rookie]
            words.append("rookie")

        # Name the position when the user filtered on one, when the stat is
        # shared across groups and we randomly narrow it, or for rookies (a
        # "rookie leader" across all positions is usually a QB and dull).
        narrow = (self.positions is not None or rookies
                  or (len(allowed) > 1 and random.random() < POSITION_QUALIFIER_CHANCE))
        if narrow and (len(allowed) > 1 or self.positions):
            group = random.choice(sorted(allowed))
            df = df[df.group == group]
            words.append(GROUP_NOUN[group])
        return df, " ".join(words)

    def _ranked(self, stat: str, groups: set[str], min_players: int = 4):
        df, qual = self._pick_pool(groups)
        if df is None:
            return None, "", None
        df = df[df[stat] > 0].sort_values(stat, ascending=False)
        if len(df) < min_players:
            return None, "", None
        return df, qual, SEASON_STATS[stat][0]

    @staticmethod
    def _fmt(v) -> str:
        v = float(v)
        return f"{int(v):,}" if v.is_integer() else f"{v:,.1f}"

    def _distractor_ranks(self, n: int, difficulty: str) -> list[int]:
        """Row positions (excluding 0, the answer) to draw 3 wrong choices from."""
        if difficulty == "hard":
            ranks = list(range(1, min(4, n)))
        elif difficulty == "easy":
            ranks = list(range(3, min(12, n))) or list(range(1, n))
        else:
            ranks = list(range(1, min(7, n)))
        if len(ranks) < 3:
            ranks = list(range(1, min(n, 8)))
        return random.sample(ranks, 3)

    def _who(self, qual: str) -> str:
        return f"which {qual}" if qual else "who"

    # ─── question types ─────────────────────────────────────────────────────

    def _leader(self, difficulty: str) -> dict | None:
        stat = random.choice(list(SEASON_STATS))
        df, qual, label = self._ranked(stat, SEASON_STATS[stat][1])
        if df is None or df[stat].iloc[0] == df[stat].iloc[1]:
            return None
        names = df.name.tolist()
        choices = [names[0]] + [names[i] for i in self._distractor_ranks(len(names), difficulty)]
        choices, ans = self._shuffle_with_answer(choices, 0)
        if qual:
            text = f"Through {self.data.through_label}, {self.data.season}, which {qual} has the most {label}?"
        else:
            text = f"Through {self.data.through_label}, {self.data.season}, who leads the NFL in {label}?"
        return {"question": text, "choices": choices, "answer": ans}

    def _head_to_head(self, difficulty: str) -> dict | None:
        stat = random.choice(list(SEASON_STATS))
        df, qual, label = self._ranked(stat, SEASON_STATS[stat][1])
        if df is None:
            return None
        pair = df.head(15).sample(2)
        a, b = pair.iloc[0], pair.iloc[1]
        va, vb = a[stat], b[stat]
        if va == vb:
            return None
        gap = abs(va - vb) / max(va, vb)
        if difficulty == "hard" and gap > 0.15:
            return None
        if difficulty == "easy" and gap < 0.20:
            return None
        choices = [a["name"], b["name"]]
        return {
            "question": f"Who has more {label} {self._through}?",
            "choices": choices,
            "answer": 0 if va > vb else 1,
        }

    def _stat_value(self, difficulty: str) -> dict | None:
        stat = random.choice(list(SEASON_STATS))
        df, qual, label = self._ranked(stat, SEASON_STATS[stat][1])
        if df is None:
            return None
        p = df.head(10).sample(1).iloc[0]
        v = float(p[stat])
        if v < 3:
            return None
        if v >= 100:
            step = max(10, round(v * (0.03 if difficulty == "hard" else 0.08), -1))
            wrongs = {v + step * k for k in random.sample([-3, -2, -1, 1, 2, 3], 3)}
        else:
            # Counting stats: whole numbers apart (keeps half-sacks on .5)
            spread = [-3, -2, -1, 1, 2, 3] if difficulty == "hard" else [-6, -4, -2, 2, 4, 6]
            wrongs = {v + k for k in random.sample(spread, 3)}
        if len(wrongs) < 3 or min(wrongs) < 0:
            return None
        choices = [self._fmt(v)] + [self._fmt(w) for w in wrongs]
        choices, ans = self._shuffle_with_answer(choices, 0)
        return {
            "question": f"How many {label} does {p['name']} have {self._through}?",
            "choices": choices,
            "answer": ans,
        }

    def _single_game_best(self, difficulty: str) -> dict | None:
        d = self.data
        if d.week == 0:
            return None
        stat = random.choice(GAME_STATS)
        week = d.week if difficulty != "hard" else random.randint(1, d.week)
        label, groups = SEASON_STATS[stat]

        allowed = groups & (self.positions or ALL_GROUPS)
        if not allowed:
            return None
        # Unfiltered, the pool is everyone the stat applies to. Filtered, the
        # question has to say who it's limited to or it would be false.
        words = []
        if self.rookies_only:
            words.append("rookie")
        if self.positions:
            group = random.choice(sorted(allowed))
            allowed = {group}
            words.append(GROUP_NOUN[group])
        qual = " ".join(words)
        df = d.weekly[(d.weekly.week == week) & d.weekly.group.isin(allowed)]
        if self.rookies_only:
            df = df[df.rookie]
        df = df[df[stat] > 0].sort_values(stat, ascending=False)
        if len(df) < 4 or df[stat].iloc[0] == df[stat].iloc[1]:
            return None

        names = df.player_display_name.tolist()
        choices = [names[0]] + [names[i] for i in self._distractor_ranks(len(names), difficulty)]
        if len(set(choices)) < 4:
            return None
        choices, ans = self._shuffle_with_answer(choices, 0)
        who = f"Which {qual}" if qual else "Who"
        return {
            "question": f"{who} had the most {label} in a single game in Week {week} of {d.season}?",
            "choices": choices,
            "answer": ans,
        }

    def _over_under(self, difficulty: str) -> dict | None:
        stat = random.choice(list(SEASON_STATS))
        df, qual, label = self._ranked(stat, SEASON_STATS[stat][1])
        if df is None:
            return None
        p = df.head(15).sample(1).iloc[0]
        v = float(p[stat])
        frac = random.uniform(0.04, 0.10) if difficulty == "hard" else random.uniform(0.10, 0.25)
        offset = max(1, round(v * frac))
        line = int(v + random.choice([-1, 1]) * offset) + 0.5
        if line <= 0:
            return None
        return {
            "question": f"OVER or UNDER: {p['name']} has O/U {self._fmt(line)} {label} {self._through}.",
            "choices": ["OVER", "UNDER"],
            "answer": 0 if v > line else 1,
        }

    def _team_question(self, difficulty: str) -> dict | None:
        d = self.data
        recs = d.team_records
        kind = random.choice(["record", "most_pf", "fewest_pa", "best_diff"])

        if kind == "record":
            team = random.choice(list(recs))
            r = recs[team]
            gp = r["w"] + r["l"] + r["t"]

            def fmt(w, l, t):
                return f"{w}-{l}" + (f"-{t}" if t else "")

            correct = fmt(r["w"], r["l"], r["t"])
            spread = [-1, 1] if difficulty == "hard" else [-3, -2, -1, 1, 2, 3]
            wrongs = set()
            for k in spread:
                w = r["w"] + k
                if 0 <= w <= gp - r["t"]:
                    wrongs.add(fmt(w, gp - r["t"] - w, r["t"]))
            if len(wrongs) < 3:
                return None
            choices = [correct] + random.sample(sorted(wrongs), 3)
            choices, ans = self._shuffle_with_answer(choices, 0)
            return {
                "question": f"What is the {TEAM_NICKNAMES[team]}' record {self._through}?",
                "choices": choices,
                "answer": ans,
            }

        key, text = {
            "most_pf":   (lambda r: r["pf"], "has scored the most points"),
            "fewest_pa": (lambda r: -r["pa"], "has allowed the fewest points"),
            "best_diff": (lambda r: r["pf"] - r["pa"], "has the best point differential"),
        }[kind]
        ranked = sorted(recs, key=lambda t: key(recs[t]), reverse=True)
        if key(recs[ranked[0]]) == key(recs[ranked[1]]):
            return None
        choices = [ranked[0]] + [ranked[i] for i in self._distractor_ranks(len(ranked), difficulty)]
        choices = [TEAM_NICKNAMES[t] for t in choices]
        choices, ans = self._shuffle_with_answer(choices, 0)
        return {
            "question": f"Which team {text} {self._through}?",
            "choices": choices,
            "answer": ans,
        }
