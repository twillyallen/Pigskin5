"""
Live Template Generator
=======================
Writes LIVE question templates instead of finished questions: `live: true`,
`choices: []`, no answer. The fill-live-questions GitHub Action fills them
with real stats the day before they run (see fill_live_questions.py), so
unlike current_season questions they're never stale on quiz day.

  { live: true, question: "Who leads the NFL in rushing yards?", choices: [] }
  { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE sacks.", choices: [] }

Every template is test-filled against today's stats before it's returned, so
a shape the filler can't handle never makes it into the output.
"""

import random
from generators import BaseGenerator
from generators.current_season import (
    CurrentSeasonData, SEASON_STATS, GROUP_NOUN, TEAM_NICKNAMES,
)

ROOKIE_CHANCE = 0.25
TEAM_LEADER_QUESTIONS = [
    "Which team has scored the most points?",
    "Which team has allowed the fewest points?",
    "Which team has the best point differential?",
]


class LiveTemplateGenerator(BaseGenerator):

    def __init__(self):
        self._filler = None

    @property
    def data(self) -> CurrentSeasonData:
        return CurrentSeasonData.get()

    @property
    def available(self) -> bool:
        return self.data.available

    def generate(self, difficulty: str = "medium") -> dict:
        # Imported here: fill_live_questions imports generators.current_season
        from fill_live_questions import LiveFiller, LiveQuestionError
        if self._filler is None:
            self._filler = LiveFiller(self.data)

        shapes = {
            "easy": [self._leader, self._team_record],
            "medium": [self._over_under, self._team_leader, self._leader],
            "hard": [self._how_many, self._qualified_leader],
        }[difficulty]
        for _ in range(20):
            question = random.choice(shapes)()
            if question is None:
                continue
            try:
                self._filler.fill(question, [])
            except LiveQuestionError:
                continue
            return {
                "question": question,
                "choices": [],
                "live": True,
                "_type": "live",
                "_difficulty": difficulty,
            }
        raise RuntimeError("couldn't build a fillable LIVE template in 20 tries")

    # ─── shapes (all must be ones fill_live_questions.py understands) ───────

    @staticmethod
    def _stat():
        return random.choice(list(SEASON_STATS))

    def _leader(self):
        return f"Who leads the NFL in {SEASON_STATS[self._stat()][0]}?"

    def _qualified_leader(self):
        stat = self._stat()
        label, groups = SEASON_STATS[stat]
        noun = GROUP_NOUN[random.choice(sorted(groups))]
        rookie = "rookie " if random.random() < ROOKIE_CHANCE else ""
        if len(groups) == 1 and not rookie:
            return None  # "Which quarterback has the most passing yards?" = the NFL leader

        return f"Which {rookie}{noun} has the most {label}?"

    def _over_under(self):
        return f"OVER or UNDER: PLAYER NAME has O/U LINE {SEASON_STATS[self._stat()][0]}."

    def _how_many(self):
        # Name a top-10 player now; the count itself is filled on fill day
        stat = self._stat()
        top = self.data.totals[self.data.totals[stat] > 0].sort_values(stat, ascending=False).head(10)
        if top.empty:
            return None
        name = top.iloc[random.randrange(len(top))]["name"]
        return f"How many {SEASON_STATS[stat][0]} does {name} have?"

    def _team_record(self):
        nick = random.choice(sorted(set(TEAM_NICKNAMES.values())))
        return f"What is the {nick}' record?"

    def _team_leader(self):
        return random.choice(TEAM_LEADER_QUESTIONS)
