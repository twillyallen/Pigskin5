#!/usr/bin/env python3
"""
Fill LIVE questions in questions.js
===================================
Lets you schedule current-season stat questions without knowing the answer
yet. Mark a question with `live: true` and leave out `answer` (and usually
the choices). This script fills them in with real nflverse stats shortly
before the quiz date, counting every game finished by then.

  { live: true, question: "Who leads the NFL in passing yards?", choices: [] },
      -> { live: true, question: "Who leads the NFL in passing yards?",
           choices: ["Matthew Stafford", "C.J. Stroud", ...], answer: 0 },

If you supply choices, they're kept and only the answer is filled in:

  { live: true, question: "Which player has more receiving yards?",
    choices: ["A.J. Brown", "Rome Odunze", "Romeo Doubs", "Luther Burden"] },

Question shapes it understands (case-insensitive; a trailing "this season",
"so far" or "in 2026" is fine):

  Who leads the NFL in <stat>?
  Which <rookie / position / player> has the most <stat>?
  Which <rookie / position / player> has more <stat>?         (needs choices)
  How many <stat> does <player> have?
  OVER or UNDER: <player> has O/U LINE <stat>.       (LINE is set from real stats)
  OVER or UNDER: <player> has O/U <number> <stat>.   (or pick your own number)
  What is the <team>' record?
  Which team has scored the most points? / allowed the fewest points? /
             has the best point differential? / has the best record? / worst record?

Stats: passing yards, passing TDs, interceptions thrown, rushing yards,
rushing TDs, receptions, receiving yards, receiving TDs, scrimmage yards,
sacks, interceptions, tackles, field goals.

Usage:
    py fill_live_questions.py              # fill everything dated tomorrow (US Eastern) or earlier
    py fill_live_questions.py --through 2026-11-02
    py fill_live_questions.py --check      # validate every unfilled LIVE question, write nothing

A filled question has an `answer`, so it is never touched again.
"""

import argparse
import difflib
import json
import random
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from generators.current_season import (
    CurrentSeasonData, SEASON_STATS, GROUP_NOUN, TEAM_NICKNAMES,
)

QUESTIONS_FILE = Path(__file__).resolve().parents[2] / "questions.js"

_DATE_KEY_RE = re.compile(r'^\s*"(\d{4}-\d{2}-\d{2})"\s*:')
_LIVE_RE = re.compile(r'\blive:\s*true\b')
_QUESTION_RE = re.compile(r'question:\s*"((?:[^"\\]|\\.)*)"')
_CHOICES_RE = re.compile(r'choices:\s*(\[[^\]]*\])')
_ANSWER_RE = re.compile(r'\banswer:')

STAT_ALIASES = {
    "passing yards": "passing_yards", "pass yards": "passing_yards",
    "passing tds": "passing_tds", "pass tds": "passing_tds", "td passes": "passing_tds",
    "touchdown passes": "passing_tds",
    "interceptions thrown": "passing_interceptions", "ints thrown": "passing_interceptions",
    "rushing yards": "rushing_yards", "rush yards": "rushing_yards",
    "rushing tds": "rushing_tds", "rush tds": "rushing_tds",
    "receptions": "receptions", "catches": "receptions",
    "receiving yards": "receiving_yards", "rec yards": "receiving_yards",
    "receiving tds": "receiving_tds", "rec tds": "receiving_tds",
    "scrimmage yards": "scrimmage_yards", "yards from scrimmage": "scrimmage_yards",
    "sacks": "def_sacks",
    "interceptions": "def_interceptions", "ints": "def_interceptions",
    "tackles": "def_tackles_total", "total tackles": "def_tackles_total",
    "field goals": "fg_made", "field goals made": "fg_made",
}
POSITION_ALIASES = {
    "qb": "QB", "quarterback": "QB",
    "rb": "RB", "running back": "RB",
    "wr": "WR", "wide receiver": "WR", "receiver": "WR",
    "te": "TE", "tight end": "TE",
    "defender": "DEF", "defensive player": "DEF",
    "kicker": "K",
}
_SCOPE_SUFFIX_RE = re.compile(
    r"\s+(this season|so far( this season)?|in (the )?20\d\d( season)?|through week \d+|through [a-z]{3} \d+)$")


class LiveQuestionError(Exception):
    pass


# ─── parsing helpers ─────────────────────────────────────────────────────────

def _plain(text: str) -> str:
    t = text.strip().rstrip("?.").strip().lower()
    while True:
        stripped = _SCOPE_SUFFIX_RE.sub("", t)
        if stripped == t:
            return t
        t = stripped


def _stat(raw: str, group: str | None = None) -> str:
    s = raw.strip().lower().replace("touchdowns", "tds").replace("yds", "yards")
    s = re.sub(r"\s+", " ", s)
    if s in ("interceptions", "ints") and group == "QB":
        return "passing_interceptions"
    if s not in STAT_ALIASES:
        raise LiveQuestionError(
            f"unknown stat '{raw}'. Known: {', '.join(sorted(set(STAT_ALIASES)))}")
    return STAT_ALIASES[s]


def _qualifier(raw: str | None) -> tuple[bool, str | None]:
    """'rookie wide receiver' -> (True, 'WR'); 'player' -> (False, None)."""
    if not raw:
        return False, None
    words = raw.strip().lower()
    rookie = "rookie" in words
    words = words.replace("rookie", "").strip()
    if words in ("", "player"):
        return rookie, None
    if words not in POSITION_ALIASES:
        raise LiveQuestionError(f"unknown position '{words}'. Known: {', '.join(POSITION_ALIASES)}")
    return rookie, POSITION_ALIASES[words]


def _norm_name(name: str) -> str:
    n = re.sub(r"[.'’]", "", name.lower())
    n = re.sub(r"\s+(jr|sr|ii|iii|iv|v)$", "", n.strip())
    return re.sub(r"\s+", " ", n)


def _fmt(v) -> str:
    v = float(v)
    return f"{int(v):,}" if v.is_integer() else f"{v:,.1f}"


# ─── the filler ──────────────────────────────────────────────────────────────

class LiveFiller:

    def __init__(self, data: CurrentSeasonData):
        self.d = data
        self._by_name = {}
        for pid, row in data.totals.iterrows():
            self._by_name.setdefault(_norm_name(row["name"]), []).append(pid)

    def player(self, name: str, stat: str | None = None):
        ids = self._by_name.get(_norm_name(name))
        if not ids:
            close = difflib.get_close_matches(_norm_name(name), self._by_name, n=3)
            hint = f" Did you mean: {', '.join(self.d.totals.loc[self._by_name[c][0], 'name'] for c in close)}?" if close else ""
            raise LiveQuestionError(f"no {self.d.season} stats for player '{name}'.{hint}")
        rows = self.d.totals.loc[ids]
        # Two players sharing a name: go with the one who actually has the stat
        return rows.sort_values(stat, ascending=False).iloc[0] if stat else rows.iloc[0]

    def team(self, name: str) -> str:
        n = name.strip().lower()
        for abbr, nick in TEAM_NICKNAMES.items():
            if n in (nick.lower(), abbr.lower()) or n.endswith(" " + nick.lower()):
                return abbr
        raise LiveQuestionError(f"unknown team '{name}'")

    def fill(self, question: str, choices: list[str]) -> tuple[str, list[str], int]:
        t = _plain(question)

        m = re.match(r"^over or under:\s*(?P<p>.+?) (?:has|have) o/u (?P<line>[\d,]+(?:\.\d+)?|line) (?P<stat>.+)$", t)
        if m:
            stat = _stat(m["stat"])
            p = self.player(m["p"], stat)
            v = float(p[stat])
            if m["line"] == "line":
                # Set the line 10-25% (at least 1) above or below the real
                # total, on a .5 so it can't push. Coin flip which side.
                offset = max(1, round(v * random.uniform(0.10, 0.25)))
                line = max(0, int(v + random.choice([-1, 1]) * offset)) + 0.5
                question = re.sub(r"(o/u\s+)line\b", lambda mm: mm.group(1) + _fmt(line),
                                  question, count=1, flags=re.I)
            else:
                line = float(m["line"].replace(",", ""))
            if v == line:
                raise LiveQuestionError(f"{p['name']} is exactly at the line ({_fmt(v)}): use a .5 line")
            return question, ["OVER", "UNDER"], 0 if v > line else 1

        m = re.match(r"^how many (?P<stat>.+?) does (?P<p>.+?) have$", t)
        if m:
            stat = _stat(m["stat"])
            v = float(self.player(m["p"], stat)[stat])
            if choices:
                return question, choices, self._match_number(v, choices)
            return (question, *self._number_choices(v))

        m = re.match(r"^what is the (?P<team>.+?)(?:'s|')? record$", t)
        if m:
            r = self.d.team_records[self.team(m["team"])]
            correct = self._record(r["w"], r["l"], r["t"])
            if choices:
                if correct not in choices:
                    raise LiveQuestionError(f"actual record {correct} isn't one of the choices")
                return question, choices, choices.index(correct)
            return (question, *self._record_choices(r))

        if t.startswith("which team"):
            return (question, *self._team_leader(t, choices))

        m = re.match(r"^(?:who|which (?P<qual>.+?)) (?:leads the (?:nfl|league) in|(?:has|had) (?P<cmp>the most|more)) (?P<stat>.+)$", t)
        if m:
            rookie, group = _qualifier(m["qual"])
            stat = _stat(m["stat"], group)
            comparative = m["cmp"] == "more"
            return (question, *self._player_leader(stat, rookie, group, choices, comparative))

        raise LiveQuestionError("question shape not recognized (see the top of fill_live_questions.py)")

    # ─── builders ───────────────────────────────────────────────────────────

    def _player_leader(self, stat, rookie, group, choices, comparative):
        pool = self.d.totals
        if rookie:
            pool = pool[pool.rookie]
        if group:
            pool = pool[pool.group == group]
        ranked = pool[pool[stat] > 0].sort_values(stat, ascending=False)

        if comparative:
            if len(choices) < 2:
                raise LiveQuestionError("'has more' questions need the players listed in choices")
            vals = [float(self.player(c, stat)[stat]) for c in choices]
            best = max(vals)
            if vals.count(best) > 1:
                raise LiveQuestionError(f"tie among choices at {_fmt(best)}")
            return choices, vals.index(best)

        if len(ranked) < 2:
            raise LiveQuestionError("not enough players with this stat yet")
        top_val = ranked[stat].iloc[0]
        # Ties for the lead are common in counting stats. Any co-leader is a
        # correct answer, so the choices must contain exactly one of them.
        leaders = ranked[ranked[stat] == top_val].name.tolist()
        lead_keys = {_norm_name(n) for n in leaders}
        if len(leaders) > 1:
            print(f"      ⚖ tied for the lead at {_fmt(top_val)}: {', '.join(leaders)}")

        if choices:
            # "Leads the NFL" is only true if a leader is a choice. The
            # leader can change between scheduling and filling, so swap one
            # in for the lowest choice rather than fail the day.
            hits = [i for i, c in enumerate(choices) if _norm_name(c) in lead_keys]
            if len(hits) > 1:
                raise LiveQuestionError(f"choices include co-leaders {', '.join(choices[i] for i in hits)}: keep only one")
            if hits:
                return choices, hits[0]
            vals = [float(self.player(c, stat)[stat]) if self._has(c) else -1 for c in choices]
            low = vals.index(min(vals))
            print(f"      ↻ leader {leaders[0]} wasn't a choice; replaced {choices[low]}")
            choices = list(choices)
            choices[low] = leaders[0]
            return choices, low

        # Small pools (e.g. rookie QBs) get 2-3 choices instead of failing
        others = ranked[ranked[stat] < top_val].name.tolist()
        if not others:
            raise LiveQuestionError("everyone with this stat is tied")
        picks = [random.choice(leaders)] + random.sample(others[:6], min(3, len(others)))
        return self._shuffle(picks)

    def _has(self, name) -> bool:
        return _norm_name(name) in self._by_name

    def _team_leader(self, t, choices):
        recs = self.d.team_records
        pct = lambda r: (r["w"] + 0.5 * r["t"]) / max(1, r["w"] + r["l"] + r["t"])
        if "most points" in t or "scored the most" in t:
            key = lambda a: recs[a]["pf"]
        elif "fewest points" in t:
            key = lambda a: -recs[a]["pa"]
        elif "differential" in t:
            key = lambda a: recs[a]["pf"] - recs[a]["pa"]
        elif "best record" in t:
            key = lambda a: pct(recs[a])
        elif "worst record" in t:
            key = lambda a: -pct(recs[a])
        else:
            raise LiveQuestionError("team question not recognized (most points / fewest points / differential / best or worst record)")

        ranked = sorted(recs, key=key, reverse=True)
        top_val = key(ranked[0])
        # Same rule as players: exactly one co-leader among the choices.
        leaders = [a for a in ranked if key(a) == top_val]
        if len(leaders) > 1:
            print(f"      ⚖ tied at the top: {', '.join(TEAM_NICKNAMES[a] for a in leaders)}")

        if choices:
            abbrs = [self.team(c) for c in choices]
            hits = [i for i, a in enumerate(abbrs) if a in leaders]
            if len(hits) > 1:
                raise LiveQuestionError(f"choices include co-leaders {', '.join(choices[i] for i in hits)}: keep only one")
            if hits:
                return choices, hits[0]
            low = min(range(len(abbrs)), key=lambda i: key(abbrs[i]))
            print(f"      ↻ leader {TEAM_NICKNAMES[leaders[0]]} wasn't a choice; replaced {choices[low]}")
            choices = list(choices)
            choices[low] = TEAM_NICKNAMES[leaders[0]]
            return choices, low

        others = [a for a in ranked if key(a) < top_val]
        picks = [random.choice(leaders)] + random.sample(others[:6], 3)
        return self._shuffle([TEAM_NICKNAMES[a] for a in picks])

    @staticmethod
    def _record(w, l, t):
        return f"{w}-{l}" + (f"-{t}" if t else "")

    def _record_choices(self, r):
        gp = r["w"] + r["l"] + r["t"]
        decided = gp - r["t"]
        alts = [w for w in range(decided + 1) if w != r["w"]]
        alts.sort(key=lambda w: abs(w - r["w"]))
        picks = [self._record(r["w"], r["l"], r["t"])] + [
            self._record(w, decided - w, r["t"]) for w in alts[:3]]
        if len(picks) < 4:
            raise LiveQuestionError("too few games played to build record choices")
        return self._shuffle(picks)

    def _number_choices(self, v):
        if v >= 100:
            step = max(10, round(v * 0.06, -1))
            wrongs = [v + step * k for k in random.sample([-3, -2, -1, 1, 2, 3], 3)]
        else:
            wrongs = [v + k for k in random.sample([-3, -2, -1, 1, 2, 3], 3)]
        wrongs = [w for w in wrongs if w >= 0]
        while len(wrongs) < 3:
            wrongs.append(max(wrongs + [v]) + 1)
        return self._shuffle([_fmt(v)] + [_fmt(w) for w in wrongs])

    @staticmethod
    def _match_number(v, choices):
        for i, c in enumerate(choices):
            try:
                if float(c.replace(",", "")) == v:
                    return i
            except ValueError:
                pass
        raise LiveQuestionError(f"actual value {_fmt(v)} isn't one of the choices")

    @staticmethod
    def _shuffle(picks):
        correct = picks[0]
        picks = picks[:]
        random.shuffle(picks)
        return picks, picks.index(correct)


# ─── questions.js I/O ────────────────────────────────────────────────────────

def find_live_lines(lines: list[str]):
    """Yield (line_index, date, question, choices) for every unfilled LIVE question."""
    date = None
    for i, line in enumerate(lines):
        dm = _DATE_KEY_RE.match(line)
        if dm:
            date = dm.group(1)
            continue
        if not _LIVE_RE.search(line) or _ANSWER_RE.search(line):
            continue
        qm = _QUESTION_RE.search(line)
        if not qm:
            continue
        cm = _CHOICES_RE.search(line)
        choices = json.loads(cm.group(1)) if cm else []
        question = json.loads(f'"{qm.group(1)}"')
        yield i, date, question, choices


def render_line(original: str, question: str, choices: list[str], answer: int) -> str:
    indent = original[: len(original) - len(original.lstrip())]
    comma = "," if original.rstrip().endswith(",") else ""
    q = json.dumps(question, ensure_ascii=False)
    c = json.dumps(choices, ensure_ascii=False)
    return f"{indent}{{ live: true, question: {q}, choices: {c}, answer: {answer} }}{comma}"


def eastern_today() -> datetime:
    # The quiz day starts at local midnight; Eastern is close enough to the
    # earliest big US audience without needing tzdata on Windows.
    return (datetime.now(timezone.utc) - timedelta(hours=5)).replace(tzinfo=None)


def main():
    ap = argparse.ArgumentParser(description="Fill LIVE questions in questions.js with current-season stats")
    ap.add_argument("--through", help="Fill LIVE questions dated on or before this date (default: tomorrow, US Eastern)")
    ap.add_argument("--check", action="store_true", help="Validate every unfilled LIVE question; write nothing")
    ap.add_argument("--file", default=str(QUESTIONS_FILE), help="questions.js to edit")
    args = ap.parse_args()

    path = Path(args.file)
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    through = args.through or (eastern_today() + timedelta(days=1)).strftime("%Y-%m-%d")

    pending = [x for x in find_live_lines(lines) if args.check or (x[1] and x[1] <= through)]
    if not pending:
        print(f"No unfilled LIVE questions {'anywhere' if args.check else f'dated {through} or earlier'}.")
        return

    data = CurrentSeasonData.get()
    if not data.available:
        print(f"❌ {data.error or f'No completed games yet in the {data.season} season'}")
        sys.exit(1)
    print(f"📡 {data.season} stats through {data.through_label} (every game finished by then)")
    filler = LiveFiller(data)

    errors = 0
    for i, date, question, choices in pending:
        print(f"  {date}  {question}")
        try:
            q_out, c_out, ans = filler.fill(question, choices)
        except LiveQuestionError as e:
            errors += 1
            print(f"      ❌ {e}")
            continue
        print(f"      ✅ {c_out[ans]}   ({' / '.join(c_out)})")
        if not args.check:
            lines[i] = render_line(lines[i], q_out, c_out, ans)

    if not args.check:
        new_text = "\n".join(lines)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(f"📝 Updated {path.name}")

    if errors:
        print(f"❌ {errors} LIVE question(s) couldn't be filled")
        sys.exit(1)


if __name__ == "__main__":
    main()
