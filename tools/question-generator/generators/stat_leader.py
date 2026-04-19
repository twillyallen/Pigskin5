"""
Stat Leader Generator
=====================
"Who led the NFL in [stat] in [year]?"
"Which QB has more career [stat]?"
"How many [stat] did [player] have in [year]?"
"""

import random
from generators import BaseGenerator
from generators.nfl_data import (
    QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS,
    SEASON_LEADERS, RECORDS, MVP_WINNERS
)


class StatLeaderGenerator(BaseGenerator):

    def generate(self, difficulty: str = "medium") -> dict:
        """Pick a random stat leader sub-type and generate."""
        generators = [
            self._career_stat_comparison,
            self._season_leader,
            self._record_holder,
            self._stat_value_question,
        ]
        
        # Weight by difficulty
        if difficulty == "easy":
            # Easy: well-known records and big names
            weights = [0.3, 0.3, 0.3, 0.1]
        elif difficulty == "hard":
            weights = [0.3, 0.2, 0.1, 0.4]
        else:
            weights = [0.25, 0.25, 0.25, 0.25]
        
        gen_func = random.choices(generators, weights=weights, k=1)[0]
        q = gen_func(difficulty)
        q["_type"] = "stat_leader"
        q["_difficulty"] = difficulty
        return q

    def _career_stat_comparison(self, difficulty: str) -> dict:
        """Which player has more career X?"""
        # Pick a position group and stat
        options = [
            (QUARTERBACKS, "pass_yards", "Career Passing Yards"),
            (QUARTERBACKS, "pass_tds", "Career Passing TDs"),
            (RUNNING_BACKS, "rush_yards", "Career Rushing Yards"),
            (RUNNING_BACKS, "rush_tds", "Career Rushing TDs"),
            (WIDE_RECEIVERS, "rec_yards", "Career Receiving Yards"),
            (WIDE_RECEIVERS, "rec_tds", "Career Receiving TDs"),
        ]
        
        pool, stat_key, stat_label = random.choice(options)
        
        # Filter to players who have this stat
        eligible = [p for p in pool if stat_key in p[2]]
        if len(eligible) < 4:
            eligible = pool[:4]
        
        # Sort by stat value
        eligible.sort(key=lambda p: p[2].get(stat_key, 0), reverse=True)
        
        if difficulty == "hard":
            # Pick from the middle of the pack (less obvious)
            start = min(4, len(eligible) - 4)
            candidates = eligible[start:start+8]
        else:
            # Pick from top players
            candidates = eligible[:10]
        
        random.shuffle(candidates)
        
        # Pick 4, the one with highest stat is the answer
        chosen = random.sample(candidates, min(4, len(candidates)))
        chosen.sort(key=lambda p: p[2].get(stat_key, 0), reverse=True)
        correct = chosen[0]
        
        choices = [p[0] for p in chosen]
        random.shuffle(choices)
        answer_idx = choices.index(correct[0])
        
        return {
            "question": f"Which {chosen[0][1]} has more {stat_label}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _season_leader(self, difficulty: str) -> dict:
        """Who led the NFL in X in year Y?"""
        year = random.choice(list(SEASON_LEADERS.keys()))
        season = SEASON_LEADERS[year]

        # Pick a stat category
        stat_options = [k for k in season.keys() if isinstance(season[k], tuple)]
        if not stat_options:
            return self._career_stat_comparison(difficulty)

        stat_key = random.choice(stat_options)
        leader_name, leader_value = season[stat_key]

        stat_labels = {
            "passing_yards": "Passing Yards",
            "passing_tds": "Passing TDs",
            "rushing_yards": "Rushing Yards",
            "rushing_tds": "Rushing TDs",
            "receiving_yards": "Receiving Yards",
            "receptions": "Receptions",
            "sacks": "Sacks",
            "tackles": "Tackles",
        }

        label = stat_labels.get(stat_key, stat_key.replace("_", " ").title())

        year_int = int(year)

        def _is_relevant(player, year_val: int) -> bool:
            """
            Filter distractors so they make sense for the season in question.
            player tuple format: (name, position, stats, era, teams)
            era is one of: classic, modern, current
            """
            era = player[3]

            if year_val >= 2016:
                return era in ["modern", "current"]
            elif year_val >= 2000:
                return era == "modern"
            else:
                return era in ["classic", "modern"]

        # Generate distractors from same position group, filtered by year relevance
        if "pass" in stat_key:
            pool = [p for p in QUARTERBACKS if p[0] != leader_name and _is_relevant(p, year_int)]
        elif "rush" in stat_key:
            pool = [p for p in RUNNING_BACKS if p[0] != leader_name and _is_relevant(p, year_int)]
        elif "rec" in stat_key:
            pool = [p for p in (WIDE_RECEIVERS + TIGHT_ENDS) if p[0] != leader_name and _is_relevant(p, year_int)]
        elif "sack" in stat_key or "tackle" in stat_key:
            # Defensive players - keep curated list for now
            defensive_names = [
                "Myles Garrett", "T.J. Watt", "Nick Bosa", "Micah Parsons",
                "Aaron Donald", "Maxx Crosby", "Chris Jones", "Trey Hendrickson",
                "Khalil Mack", "Von Miller", "Cameron Jordan", "Danielle Hunter",
                "Josh Allen", "Matt Judon", "Rashan Gary", "Aidan Hutchinson",
                "Jordyn Brooks", "Fred Warner", "Roquan Smith", "Lavonte David",
            ]
            distractor_names = [n for n in defensive_names if n != leader_name]
            random.shuffle(distractor_names)
            distractors = distractor_names[:3]

            choices = [leader_name] + distractors
            random.shuffle(choices)
            answer_idx = choices.index(leader_name)

            return {
                "question": f"Who led the NFL in {label} in {year}?",
                "choices": choices,
                "answer": answer_idx,
            }
        else:
            pool = [
                p for p in (QUARTERBACKS + RUNNING_BACKS)
                if p[0] != leader_name and _is_relevant(p, year_int)
            ]

        # Fallback in case filtering gets too aggressive
        if len(pool) < 3:
            if "pass" in stat_key:
                pool = [p for p in QUARTERBACKS if p[0] != leader_name]
            elif "rush" in stat_key:
                pool = [p for p in RUNNING_BACKS if p[0] != leader_name]
            elif "rec" in stat_key:
                pool = [p for p in (WIDE_RECEIVERS + TIGHT_ENDS) if p[0] != leader_name]
            else:
                pool = [p for p in (QUARTERBACKS + RUNNING_BACKS) if p[0] != leader_name]

        # Map season stat key to career stat key for sorting
        career_stat_map = {
            "passing_yards": "pass_yards",
            "passing_tds": "pass_tds",
            "rushing_yards": "rush_yards",
            "rushing_tds": "rush_tds",
            "receiving_yards": "rec_yards",
            "receptions": "receptions",
        }
        career_key = career_stat_map.get(stat_key, stat_key)

        # Sort by career stat so the most notable players come first, then add some shuffle
        pool.sort(key=lambda p: p[2].get(career_key, 0), reverse=True)
        top_pool = pool[:12]
        random.shuffle(top_pool)
        distractors = [p[0] for p in top_pool[:3]]

        choices = [leader_name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(leader_name)

        return {
            "question": f"Who led the NFL in {label} in {year}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _record_holder(self, difficulty: str) -> dict:
        """Who holds the record for X?"""
        record_options = [
            ("single_season_rush_yards", "most rushing yards in a single season"),
            ("single_season_pass_tds", "most passing TDs in a single season"),
            ("single_season_rec_tds", "most receiving TDs in a single season"),
            ("single_season_rush_tds", "most rushing TDs in a single season"),
            ("single_game_rush_yards", "most rushing yards in a single game"),
            ("career_pass_yards", "most career passing yards"),
            ("career_rush_yards", "most career rushing yards"),
            ("career_rec_yards", "most career receiving yards"),
            ("career_total_tds", "most career total touchdowns"),
            ("career_sacks", "most career sacks"),
            ("career_te_rec_tds", "most career receiving TDs by a tight end"),
        ]

        if difficulty == "easy":
            # Easy records (well-known)
            record_options = record_options[:5]

        record_key, description = random.choice(record_options)
        record = RECORDS[record_key]
        correct = record["player"]

        def top_names_by_stat(players, stat_key, exclude_name=None, limit=10):
            eligible = [p for p in players if stat_key in p[2]]
            eligible.sort(key=lambda p: p[2].get(stat_key, 0), reverse=True)
            names = [p[0] for p in eligible if p[0] != exclude_name]
            return names[:limit]

        # Get smarter distractors by category
        if record_key == "career_total_tds":
            # Approximate all-time TD scorers from your available dataset:
            # RB total_tds + WR rec_tds + TE rec_tds + QB rush_tds only
            # Intentionally excludes passing TDs, because those are not scored by the QB.
            combined = []

            for p in RUNNING_BACKS:
                total = p[2].get("total_tds")
                if total is not None:
                    combined.append((p[0], total))

            for p in WIDE_RECEIVERS:
                total = p[2].get("rec_tds")
                if total is not None:
                    combined.append((p[0], total))

            for p in TIGHT_ENDS:
                total = p[2].get("rec_tds")
                if total is not None:
                    combined.append((p[0], total))

            for p in QUARTERBACKS:
                total = p[2].get("rush_tds")
                if total is not None and total > 0:
                    combined.append((p[0], total))

            combined.sort(key=lambda x: x[1], reverse=True)
            pool = [name for name, _ in combined if name != correct][:10]

        elif record_key == "career_pass_yards":
            pool = top_names_by_stat(QUARTERBACKS, "pass_yards", exclude_name=correct)

        elif record_key == "career_rush_yards":
            pool = top_names_by_stat(RUNNING_BACKS, "rush_yards", exclude_name=correct)

        elif record_key == "career_rec_yards":
            pool = top_names_by_stat(WIDE_RECEIVERS + TIGHT_ENDS, "rec_yards", exclude_name=correct)

        elif record_key == "career_te_rec_tds":
            pool = top_names_by_stat(TIGHT_ENDS, "rec_tds", exclude_name=correct)

        elif record_key == "single_season_pass_tds":
            pool = [n for n in [
                "Tom Brady", "Patrick Mahomes", "Dan Marino", "Drew Brees",
                "Aaron Rodgers", "Josh Allen", "Matthew Stafford", "Kurt Warner",
                "Lamar Jackson", "Dak Prescott", "Andy Dalton", "Nick Foles",
            ] if n != correct]

        elif record_key == "single_season_rush_yards":
            pool = [n for n in [
                "Adrian Peterson", "Barry Sanders", "Jamal Lewis", "Eric Dickerson",
                "LaDainian Tomlinson", "Earl Campbell", "Marcus Allen", "Derrick Henry",
                "Christian McCaffrey", "O.J. Simpson",
            ] if n != correct]

        elif record_key == "single_game_rush_yards":
            pool = [n for n in [
                "Adrian Peterson", "Barry Sanders", "LaDainian Tomlinson", "Jamal Lewis",
                "Bo Jackson", "Derrick Henry", "Christian McCaffrey", "Walter Payton",
            ] if n != correct]

        elif "rush" in record_key:
            pool = top_names_by_stat(RUNNING_BACKS, "rush_yards", exclude_name=correct)

        elif "pass" in record_key:
            pool = top_names_by_stat(QUARTERBACKS, "pass_yards", exclude_name=correct)

        elif record_key == "single_season_rec_tds":
            pool = top_names_by_stat(WIDE_RECEIVERS + TIGHT_ENDS, "rec_tds", exclude_name=correct)

        elif record_key == "career_rec_yards":
            pool = top_names_by_stat(WIDE_RECEIVERS + TIGHT_ENDS, "rec_yards", exclude_name=correct)

        elif record_key == "career_te_rec_tds":
            pool = top_names_by_stat(TIGHT_ENDS, "rec_tds", exclude_name=correct)

        elif "rec" in record_key or "te" in record_key:
            pool = top_names_by_stat(WIDE_RECEIVERS + TIGHT_ENDS, "rec_tds", exclude_name=correct)

        else:
            pool = [p[0] for p in QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS if p[0] != correct]

        random.shuffle(pool)
        distractors = pool[:3]

        # Fallback protection
        if len(distractors) < 3:
            fallback_pool = [p[0] for p in QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS if p[0] != correct]
            random.shuffle(fallback_pool)
            for name in fallback_pool:
                if name not in distractors:
                    distractors.append(name)
                if len(distractors) == 3:
                    break

        choices = [correct] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": f"Who holds the NFL record for {description}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _stat_value_question(self, difficulty: str) -> dict:
        """How many X did player have in year Y?"""
        # Use records with known values
        valued_records = {k: v for k, v in RECORDS.items() 
                          if "value" in v and "year" in v and "player" in v}
        
        if not valued_records:
            return self._record_holder(difficulty)
        
        record_key = random.choice(list(valued_records.keys()))
        record = valued_records[record_key]
        
        correct_val = record["value"]
        player = record["player"]
        year = record["year"]
        
        stat_descriptions = {
            "single_season_rush_yards": f"rushing yards did {player} have in {year}",
            "single_season_pass_yards": f"passing yards did {player} throw for in {year}",
            "single_season_pass_tds": f"passing TDs did {player} throw in {year}",
            "single_season_rec_tds": f"receiving TDs did {player} have in {year}",
            "single_season_rush_tds": f"rushing TDs did {player} score in {year}",
            "single_game_rush_yards": f"rushing yards did {player} have in his record single-game performance",
            "single_game_fgs": f"field goals did {player} make in his record single-game performance",
            "single_season_te_receptions": f"receptions did {player} have in {year}",
            "single_season_yards_from_scrimmage": f"yards from scrimmage did {player} have in {year}",
        }
        
        desc = stat_descriptions.get(record_key, f"{record_key.replace('_', ' ')} did {player} record")
        
        # Generate nearby wrong numbers
        if correct_val > 100:
            wrongs = self._nearby_numbers(correct_val, count=3, min_delta=3, max_delta=15)
        else:
            wrongs = self._nearby_numbers(correct_val, count=3, min_delta=1, max_delta=5)
        
        choices = [str(self._format_number(correct_val))] + [str(self._format_number(w)) for w in wrongs]
        random.shuffle(choices)
        answer_idx = choices.index(str(self._format_number(correct_val)))
        
        return {
            "question": f"How many {desc}?",
            "choices": choices,
            "answer": answer_idx,
        }
