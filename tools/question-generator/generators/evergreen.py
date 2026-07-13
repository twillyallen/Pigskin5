"""
Evergreen Generator
====================
Pulls from a hand-picked bank of fun general trivia (generators/evergreen_bank.py)
instead of algorithmically generating a question. Ignores `difficulty` since these
questions are curated by hand, not tiered.

Only invoked occasionally by generate_questions.py (see EVERGREEN_CHANCE) so the
daily set stays mostly auto-generated with the occasional handpicked question mixed in.
"""

import random
from generators import BaseGenerator
from generators.evergreen_bank import EVERGREEN_QUESTIONS


class EvergreenGenerator(BaseGenerator):

    def __init__(self):
        self._pool = list(EVERGREEN_QUESTIONS)
        self._used = set()

    def generate(self, difficulty: str = "medium") -> dict:
        if not self._pool:
            raise ValueError(
                "EVERGREEN_QUESTIONS is empty — add questions to generators/evergreen_bank.py"
            )

        available = [q for q in self._pool if q["question"] not in self._used]
        if not available:
            # Exhausted the bank this run — allow repeats rather than crashing.
            available = self._pool

        q = random.choice(available)
        self._used.add(q["question"])

        return {
            "question": q["question"],
            "choices": q["choices"],
            "answer": q["answer"],
            "_type": "evergreen",
            "_difficulty": difficulty,
        }
