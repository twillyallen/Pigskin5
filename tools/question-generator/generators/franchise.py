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
            self._stadium_question,
            self._relocation_question,
            self._division_question,
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
            ("all_time_pass_leader", "passing yards", "pass_leaders"),
            ("all_time_rush_leader", "rushing yards", "rush_leaders"),
            ("all_time_rec_leader", "receiving yards", "rec_leaders"),
        ]

        for _ in range(25):
            stat_key, stat_label, leader_list_key = random.choice(stat_options)

            eligible = [
                (name, data) for name, data in FRANCHISES.items()
                if stat_key in data and leader_list_key in data
            ]
            if not eligible:
                continue

            team_name, team_data = random.choice(eligible)
            correct = team_data[stat_key]

            # Use the franchise's own ranked leader list — guarantees top performers as distractors
            leader_list = team_data[leader_list_key]
            distractors = [entry[0] for entry in leader_list if entry[0] != correct][:3]

            if len(distractors) < 3:
                continue

            choices = [correct] + distractors
            random.shuffle(choices)
            answer_idx = choices.index(correct)

            return {
                "question": f"Who is the {team_name}' all-time leader in {stat_label}?",
                "choices": choices,
                "answer": answer_idx,
            }

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

    def _stadium_question(self, difficulty: str) -> dict:
        """Which NFL team plays their home games at {stadium}?"""
        options = [(name, data["stadium"]) for name, data in FRANCHISES.items() if "stadium" in data]
        if not options:
            return self._franchise_history(difficulty)

        team_name, stadium = random.choice(options)

        other_teams = [name for name, s in options if name != team_name and s != stadium]
        random.shuffle(other_teams)
        distractors = other_teams[:3]

        choices = [team_name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(team_name)

        return {
            "question": f"Which NFL team plays their home games at {stadium}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _relocation_question(self, difficulty: str) -> dict:
        """What year did the {team} relocate to {city}?"""
        RELOCATIONS = [
            ("Colts", "Indianapolis", 1984),
            ("Cardinals", "Arizona", 1988),
            ("Raiders", "Los Angeles", 1982),
            ("Raiders", "Las Vegas", 2020),
            ("Rams", "St. Louis", 1995),
            ("Rams", "Los Angeles", 2016),
            ("Chargers", "Los Angeles", 2017),
            ("Oilers", "Tennessee", 1997),
        ]

        team, city, year = random.choice(RELOCATIONS)
        correct = str(year)

        wrongs = self._nearby_numbers(year, count=3, min_delta=2, max_delta=6)
        distractors = [str(w) for w in wrongs]

        choices = [correct] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": f"What year did the {team} relocate to {city}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _which_team(self, difficulty: str) -> dict:
        """How many Super Bowls has [team] won?"""
        eligible = [(name, data) for name, data in FRANCHISES.items() if "super_bowls_won" in data]
        if not eligible:
            return self._franchise_history(difficulty)

        team_name, team_data = random.choice(eligible)
        correct_count = team_data["super_bowls_won"]

        other_counts = sorted(set(
            data["super_bowls_won"] for _, data in FRANCHISES.items()
            if "super_bowls_won" in data and data["super_bowls_won"] != correct_count
        ))

        for delta in [-1, 1, 2, 3]:
            n = correct_count + delta
            if n >= 0 and n not in other_counts and n != correct_count:
                other_counts.append(n)

        random.shuffle(other_counts)
        distractors = other_counts[:3]

        choices = [str(correct_count)] + [str(d) for d in distractors]
        random.shuffle(choices)
        answer_idx = choices.index(str(correct_count))

        return {
            "question": f"How many Super Bowls have the {team_name} won?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _division_question(self, difficulty: str) -> dict:
        """What division do the [Team] play in?"""
        ALL_DIVISIONS = [
            "AFC East", "AFC North", "AFC South", "AFC West",
            "NFC East", "NFC North", "NFC South", "NFC West",
        ]
        eligible = [(name, data) for name, data in FRANCHISES.items() if "division" in data]
        if not eligible:
            return self._franchise_history(difficulty)

        team_name, team_data = random.choice(eligible)
        correct = team_data["division"]

        distractors = [d for d in ALL_DIVISIONS if d != correct]
        random.shuffle(distractors)

        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": f"What division do the {team_name} play in?",
            "choices": choices,
            "answer": answer_idx,
        }