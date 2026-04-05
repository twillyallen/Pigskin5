"""
Franchise Facts Generator
=========================
Questions about franchise history, records, and trivia.
"""

import random
from generators import BaseGenerator
from generators.nfl_data import FRANCHISES, SUPER_BOWLS, QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS


class FranchiseGenerator(BaseGenerator):

    def generate(self, difficulty: str = "medium") -> dict:
        generators = [
            self._all_time_leader,
            self._franchise_history,
            self._which_team,
        ]

        gen_func = random.choice(generators)
        q = gen_func(difficulty)
        q["_type"] = "franchise"
        q["_difficulty"] = difficulty
        return q

    # ───────────────────────────────────────────────────────────────
    # 🔥 FIXED: TEAM-AWARE ALL-TIME LEADER
    # ───────────────────────────────────────────────────────────────
    def _all_time_leader(self, difficulty: str) -> dict:
        """Who is the [Team]'s all-time leader in [stat]?"""

        stat_options = [
            ("all_time_pass_leader", "passing yards", "QB"),
            ("all_time_rush_leader", "rushing yards", "RB"),
            ("all_time_rec_leader", "receiving yards", "REC"),
        ]

        def played_for_team(player, franchise_name):
            teams = player[4] if len(player) > 4 else []
            mascot = franchise_name.split()[-1]
            return any(mascot == t or mascot in t for t in teams)

        # Try multiple times to find a franchise/stat combo with enough valid same-team players
        for _ in range(25):
            stat_key, stat_label, stat_family = random.choice(stat_options)

            eligible = [(name, data) for name, data in FRANCHISES.items() if stat_key in data]
            if not eligible:
                continue

            team_name, team_data = random.choice(eligible)
            correct = team_data[stat_key]

            candidate_pool = []

            if stat_family == "QB":
                source_pool = QUARTERBACKS
            elif stat_family == "RB":
                source_pool = RUNNING_BACKS
            else:
                source_pool = WIDE_RECEIVERS + TIGHT_ENDS

            for p in source_pool:
                if p[0] == correct:
                    continue
                if not played_for_team(p, team_name):
                    continue
                candidate_pool.append(p[0])

            # Need at least 3 distractors from players who actually played for that team
            unique_candidates = list(dict.fromkeys(candidate_pool))
            if len(unique_candidates) < 3:
                continue

            random.shuffle(unique_candidates)
            distractors = unique_candidates[:3]

            choices = [correct] + distractors
            random.shuffle(choices)
            answer_idx = choices.index(correct)

            return {
                "question": f"Who is the {team_name}' all-time leader in {stat_label}?",
                "choices": choices,
                "answer": answer_idx,
            }

        # If no clean franchise leader question can be built, fall back to another franchise question type
        return self._franchise_history(difficulty)

    # ───────────────────────────────────────────────────────────────
    # Existing logic (unchanged)
    # ───────────────────────────────────────────────────────────────
    def _franchise_history(self, difficulty: str) -> dict:
        """Questions about franchise founding, moves, naming, etc."""
        questions = []

        for name, data in FRANCHISES.items():
            short = name.split()[-1]

            if "founded" in data:
                q_text = f"What year was the {short}' first season?"
                correct = str(data["founded"])
                year = data["founded"]
                wrongs = [str(year + d) for d in random.sample([-4, -2, 3, 5, 7, -6], 3)]
                questions.append((q_text, correct, wrongs))

            if "previous_names" in data and len(data["previous_names"]) > 0:
                old_name = data["previous_names"][0]
                short_old = old_name.split()[-1]
                q_text = f"What was the {name}'s original team name?"

                fake_names = [
                    "Mustangs", "Wildcats", "Thunderbolts", "Stallions",
                    "Renegades", "Rivermen", "Ironmen", "Aviators"
                ]
                random.shuffle(fake_names)
                wrongs = fake_names[:3]
                questions.append((q_text, short_old, wrongs))

        if not questions:
            return self._all_time_leader(difficulty)

        q_text, correct, wrongs = random.choice(questions)

        choices = [correct] + wrongs
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": q_text,
            "choices": choices,
            "answer": answer_idx,
        }

    def _which_team(self, difficulty: str) -> dict:
        """Which team does X belong to?"""
        teams = list(FRANCHISES.keys())

        team = random.choice(teams)
        correct = team

        wrongs = random.sample([t for t in teams if t != correct], 3)

        choices = [correct] + wrongs
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": "What year was the Packers' first season?",
            "choices": ["1919", "1921", "1925", "1930"],
            "answer": 0,
            "_type": "franchise",
            "_difficulty": difficulty,
        }