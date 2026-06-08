"""
NFL History & Iconic Moments Generator
=======================================
Super Bowls, draft history, famous plays, coaches, awards.
"""

import random
from generators import BaseGenerator
from generators.nfl_data import (
    SUPER_BOWLS, ICONIC_MOMENTS, COACHES, DRAFT_NOTABLES,
    RECORDS, NFL_FACTS, MVP_WINNERS, KICKER_MVP, SEASON_LEADERS,
    FRANCHISES, QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS,
    TIGHT_ENDS, DEFENSIVE_PLAYERS
)


# Only elite/high-profile QBs used as distractors for record-level questions.
# Keeps "Who holds the single-season passing yards record?" from producing
# Minshew / Henne as answer choices alongside Peyton Manning.
_RECORD_QB_POOL = [
    "Tom Brady", "Peyton Manning", "Drew Brees", "Aaron Rodgers",
    "Patrick Mahomes", "Brett Favre", "Dan Marino", "Philip Rivers",
    "Joe Montana", "Jameis Winston", "Matthew Stafford",
    "Ben Roethlisberger", "Andrew Luck", "Cam Newton",
    "Matt Ryan", "Tony Romo", "Eli Manning",
]


class HistoryGenerator(BaseGenerator):
    
    def generate(self, difficulty: str = "medium") -> dict:
        generators = [
            self._super_bowl_question,
            self._iconic_moment,
            self._draft_question,
            self._award_question,
            self._coach_question,
            self._single_season_record_who,
            self._single_season_record_how_many,
            self._career_leader_who,
            self._career_stat_how_many,
        ]
        
        gen_func = random.choice(generators)
        q = gen_func(difficulty)
        q["_type"] = "history"
        q["_difficulty"] = difficulty
        return q
    
    def _super_bowl_question(self, difficulty: str) -> dict:
        """Questions about Super Bowl matchups and results."""
        sb_key = random.choice(list(SUPER_BOWLS.keys()))
        sb = SUPER_BOWLS[sb_key]
        
        question_types = ["who_won", "who_lost", "opponent"]
        qtype = random.choice(question_types)
        
        # Get other team names for distractors
        all_teams = list(set(
            [sb2["winner"] for sb2 in SUPER_BOWLS.values()] +
            [sb2["loser"] for sb2 in SUPER_BOWLS.values()]
        ))
        
        if qtype == "opponent":
            correct = sb["loser"]
            q_text = f"Which team did the {sb['winner']} defeat in Super Bowl {sb_key}?"
            distractors = [t for t in all_teams if t != correct and t != sb["winner"]]
        else:
            correct = sb["winner"]
            q_text = f"Who won Super Bowl {sb_key}?"
            distractors = [t for t in all_teams if t != correct]
        
        random.shuffle(distractors)
        
        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)
        
        return {
            "question": q_text,
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _iconic_moment(self, difficulty: str) -> dict:
        """Questions about famous NFL plays and moments."""
        moment = random.choice(ICONIC_MOMENTS)
        
        question_types = []
        if "player" in moment:
            question_types.append("who")
        if "year" in moment:
            question_types.append("when")
        
        if not question_types:
            return self._super_bowl_question(difficulty)
        
        qtype = random.choice(question_types)
        
        if qtype == "who":
            correct = moment["player"]
            name = moment["name"]

            if "qb" in moment:
                q_text = f"Which player caught the game-winning play in the \"{name}\"?"
            else:
                q_text = f"Which player is associated with the \"{name}\"?"

            # Look up correct player's position to build era- and position-appropriate distractors
            all_players = QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS + DEFENSIVE_PLAYERS
            correct_player_data = next((p for p in all_players if p[0] == correct), None)

            if correct_player_data:
                pos = correct_player_data[1]
                era = correct_player_data[3]
                if pos in ("WR", "TE"):
                    pos_pool = WIDE_RECEIVERS + TIGHT_ENDS
                elif pos == "RB":
                    pos_pool = RUNNING_BACKS
                elif pos == "QB":
                    pos_pool = QUARTERBACKS
                else:
                    pos_pool = DEFENSIVE_PLAYERS
                pool = [p[0] for p in pos_pool if p[0] != correct and p[3] == era]
                if len(pool) < 3:
                    pool = [p[0] for p in pos_pool if p[0] != correct]
            else:
                fallback_names = [
                    "Tony Romo", "Peyton Manning", "Brett Favre", "Kurt Warner",
                    "Steve McNair", "Roger Craig", "Terrell Davis", "Jerome Bettis",
                    "Lynn Swann", "Jerry Rice", "Michael Irvin", "Randy Moss",
                ]
                pool = [n for n in fallback_names if n != correct]

            random.shuffle(pool)
            distractors = pool[:3]
        else:
            correct = str(moment["year"])
            q_text = f"In what season did the \"{moment['name']}\" occur?"
            year = moment["year"]
            wrongs = [year + d for d in random.sample([-2, -1, 1, 2, 3, -3], 3)]
            distractors = [str(w) for w in wrongs]
        
        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)
        
        return {
            "question": q_text,
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _draft_question(self, difficulty: str) -> dict:
        """Questions about notable draft picks."""
        pick = random.choice(DRAFT_NOTABLES)
        
        question_types = ["team", "round_pick"]
        
        if "traded_to" in pick:
            question_types.append("traded")
        
        qtype = random.choice(question_types)
        
        if qtype == "team":
            correct = pick["team"]
            q_text = f"Which franchise originally drafted {pick['player']}?"
            
            all_teams_short = list(set([d["team"] for d in DRAFT_NOTABLES if d["team"] != correct]))
            other_teams = ["Bears", "Packers", "Cowboys", "49ers", "Saints", "Jets", 
                          "Giants", "Eagles", "Dolphins", "Broncos", "Steelers"]
            pool = list(set(all_teams_short + other_teams))
            pool = [t for t in pool if t != correct]
            random.shuffle(pool)
            distractors = pool[:3]
        
        elif qtype == "round_pick":
            if "pick" in pick:
                correct = str(pick["pick"])
                q_text = f"What overall pick number was {pick['player']} drafted at?"
                
                pick_num = pick["pick"]
                wrongs = self._nearby_numbers(pick_num, count=3, min_delta=2, max_delta=15, floor=1)
                distractors = [str(w) for w in wrongs]
            else:
                correct = str(pick["round"])
                q_text = f"In what round was {pick['player']} drafted?"
                wrongs = [r for r in ["1", "2", "3", "4", "5", "6", "7"] if r != correct]
                random.shuffle(wrongs)
                distractors = wrongs[:3]
        
        elif qtype == "traded":
            correct = pick["traded_to"]
            q_text = f"Which team was {pick['player']} traded to on draft day?"
            other = ["Cowboys", "Bears", "Jets", "Dolphins", "Cardinals", "49ers"]
            distractors = [t for t in other if t != correct][:3]
        
        else:
            return self._super_bowl_question(difficulty)
        
        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)
        
        return {
            "question": q_text,
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _award_question(self, difficulty: str) -> dict:
        """Questions about MVP, OROY, DROY, etc."""
        options = []

        for year, data in SEASON_LEADERS.items():
            if "mvp" in data:
                options.append(("MVP", year, data["mvp"]))
            if "opoy" in data:
                options.append(("Offensive Player of the Year", year, data["opoy"]))
            if "oroy" in data:
                options.append(("Offensive Rookie of the Year", year, data["oroy"]))
            if "droy" in data:
                options.append(("Defensive Rookie of the Year", year, data["droy"]))
            if "coach_of_year" in data:
                options.append(("Coach of the Year", year, data["coach_of_year"]))
            if "dpoy" in data:
                options.append(("Defensive Player of the Year", year, data["dpoy"]))
            if "comeback_player" in data:
                options.append(("Comeback Player of the Year", year, data["comeback_player"]))

        if not options:
            return self._super_bowl_question(difficulty)

        award, year, correct = random.choice(options)
        year_int = int(year)

        def _is_relevant(player, year_val: int) -> bool:
            """
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

        # Build smarter distractor pools by award type — ALL filtered by year relevance
        if "Coach" in award:
            if year_int >= 2019:
                valid_eras = {"modern", "current"}
            elif year_int >= 2000:
                valid_eras = {"modern"}
            else:
                valid_eras = {"classic", "modern"}
            pool = [c["name"] for c in COACHES
                    if c["name"] != correct and c.get("era", "modern") in valid_eras]

        elif award in ["Defensive Player of the Year", "Defensive Rookie of the Year"]:
            pool = [
                p[0] for p in DEFENSIVE_PLAYERS
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        elif award == "Offensive Rookie of the Year":
            # Rookies are always "of their era" — filter offensive skill players by year
            pool = [
                p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS)
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        elif award == "Offensive Player of the Year":
            pool = [
                p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS)
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        elif award == "MVP":
            pool = [
                p[0] for p in QUARTERBACKS
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        elif award == "Comeback Player of the Year":
            pool = [
                p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS)
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        else:
            pool = [
                p[0] for p in QUARTERBACKS
                if p[0] != correct and _is_relevant(p, year_int)
            ]

        random.shuffle(pool)
        distractors = pool[:3]

        # Fallback if filtering was too aggressive — relax era constraint but stay in position group
        if len(distractors) < 3:
            if award in ["Defensive Player of the Year", "Defensive Rookie of the Year"]:
                fallback_pool = [p[0] for p in DEFENSIVE_PLAYERS if p[0] != correct]
            elif "Coach" in award:
                fallback_pool = [c["name"] for c in COACHES if c["name"] != correct]
            else:
                fallback_pool = [p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS) if p[0] != correct]
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
            "question": f"Who won {award} in {year}?",
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _coach_question(self, difficulty: str) -> dict:
        """Questions about coaches — quotes, records, Super Bowls."""
        # Famous quotes
        coaches_with_quotes = [c for c in COACHES if c.get("famous_quote")]
        
        if coaches_with_quotes and random.random() < 0.5:
            coach = random.choice(coaches_with_quotes)
            q_text = f"Which coach said the famous quote \"{coach['famous_quote']}\"?"
            correct = coach["name"]
            
            other_coaches = [c["name"] for c in COACHES if c["name"] != correct]
            random.shuffle(other_coaches)
            distractors = other_coaches[:3]
        else:
            # Coach Super Bowl record
            sb_coaches = [c for c in COACHES if c.get("super_bowls", 0) > 0]
            if not sb_coaches:
                return self._award_question(difficulty)
            
            coach = random.choice(sb_coaches)
            correct = coach["name"]
            
            if coach.get("consecutive_sb_losses"):
                q_text = f"Which head coach lost {coach['consecutive_sb_losses']} straight Super Bowls?"
            else:
                team = coach["teams"][-1] if coach["teams"] else "his team"
                q_text = f"Which coach led the {team} to a Super Bowl victory?"
            
            other_coaches = [c["name"] for c in COACHES if c["name"] != correct]
            random.shuffle(other_coaches)
            distractors = other_coaches[:3]
        
        choices = [correct] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(correct)

        return {
            "question": q_text,
            "choices": choices,
            "answer": answer_idx,
        }

    def _single_season_record_who(self, difficulty: str) -> dict:
        """Who holds the NFL single-season record for [stat]?"""
        SINGLE_SEASON_DEFS = [
            ("single_season_pass_yards", "passing yards", QUARTERBACKS),
            ("single_season_rush_yards", "rushing yards", RUNNING_BACKS),
            ("single_season_rec_yards", "receiving yards", WIDE_RECEIVERS + TIGHT_ENDS),
            ("single_season_pass_tds", "passing touchdowns", QUARTERBACKS),
            ("single_season_rush_tds", "rushing touchdowns", RUNNING_BACKS),
            ("single_season_points", "points scored", RUNNING_BACKS),
        ]
        eligible = [
            (key, label, pool) for key, label, pool in SINGLE_SEASON_DEFS
            if key in RECORDS and "player" in RECORDS[key] and "year" in RECORDS[key]
        ]
        if not eligible:
            return self._super_bowl_question(difficulty)
        key, label, pos_pool = random.choice(eligible)
        correct = RECORDS[key]["player"]
        if "pass" in key:
            pool = [p for p in _RECORD_QB_POOL if p != correct]
        else:
            pool = [p[0] for p in pos_pool if p[0] != correct]
        random.shuffle(pool)
        distractors = pool[:3]
        if len(distractors) < 3:
            extra = [p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS)
                     if p[0] != correct and p[0] not in distractors]
            random.shuffle(extra)
            distractors += extra[:3 - len(distractors)]
        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)
        return {
            "question": f"Who holds the NFL single-season record for {label}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _single_season_record_how_many(self, difficulty: str) -> dict:
        """How many [stat] did [player] record in their record-setting [year] season?"""
        SINGLE_SEASON_DEFS = [
            ("single_season_pass_yards", "passing yards"),
            ("single_season_rush_yards", "rushing yards"),
            ("single_season_rec_yards", "receiving yards"),
            ("single_season_pass_tds", "passing touchdowns"),
            ("single_season_rush_tds", "rushing touchdowns"),
            ("single_season_points", "points scored"),
        ]
        eligible = [
            (key, label) for key, label in SINGLE_SEASON_DEFS
            if key in RECORDS and "player" in RECORDS[key]
            and "value" in RECORDS[key] and "year" in RECORDS[key]
        ]
        if not eligible:
            return self._super_bowl_question(difficulty)
        key, label = random.choice(eligible)
        record = RECORDS[key]
        player = record["player"]
        year = record["year"]
        correct_val = record["value"]
        delta = max(int(correct_val * 0.10), 10)
        distractors = self._nearby_numbers(correct_val, count=3,
                                           min_delta=delta // 2, max_delta=delta, floor=1)
        correct_str = self._format_number(correct_val)
        choices = [correct_str] + [self._format_number(d) for d in distractors]
        random.shuffle(choices)
        answer_idx = choices.index(correct_str)
        return {
            "question": f"How many {label} did {player} record in their record-setting {year} season?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _career_leader_who(self, difficulty: str) -> dict:
        """Who is the NFL's all-time career leader in [stat]?"""
        CAREER_DEFS = [
            ("career_pass_yards", "passing yards", QUARTERBACKS),
            ("career_rush_yards", "rushing yards", RUNNING_BACKS),
            ("career_rec_yards", "receiving yards", WIDE_RECEIVERS + TIGHT_ENDS),
            ("career_pass_tds", "passing touchdowns", QUARTERBACKS),
            ("career_rush_tds", "rushing touchdowns", RUNNING_BACKS),
            ("career_total_tds", "total touchdowns", RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS),
        ]
        eligible = [
            (key, label, pool) for key, label, pool in CAREER_DEFS
            if key in RECORDS and "player" in RECORDS[key]
        ]
        if not eligible:
            return self._super_bowl_question(difficulty)
        key, label, pos_pool = random.choice(eligible)
        correct = RECORDS[key]["player"]
        if "pass" in key:
            pool = [p for p in _RECORD_QB_POOL if p != correct]
        else:
            pool = [p[0] for p in pos_pool if p[0] != correct]
        random.shuffle(pool)
        distractors = pool[:3]
        if len(distractors) < 3:
            extra = [p[0] for p in (QUARTERBACKS + RUNNING_BACKS + WIDE_RECEIVERS + TIGHT_ENDS)
                     if p[0] != correct and p[0] not in distractors]
            random.shuffle(extra)
            distractors += extra[:3 - len(distractors)]
        choices = [correct] + distractors[:3]
        random.shuffle(choices)
        answer_idx = choices.index(correct)
        return {
            "question": f"Who is the NFL's all-time career leader in {label}?",
            "choices": choices,
            "answer": answer_idx,
        }

    def _career_stat_how_many(self, difficulty: str) -> dict:
        """How many career [stat] does [player] have (NFL all-time record)?"""
        CAREER_DEFS = [
            ("career_pass_yards", "passing yards"),
            ("career_rush_yards", "rushing yards"),
            ("career_rec_yards", "receiving yards"),
            ("career_pass_tds", "passing touchdowns"),
            ("career_rush_tds", "rushing touchdowns"),
            ("career_total_tds", "total touchdowns"),
        ]
        eligible = [
            (key, label) for key, label in CAREER_DEFS
            if key in RECORDS and "player" in RECORDS[key] and "value" in RECORDS[key]
        ]
        if not eligible:
            return self._super_bowl_question(difficulty)
        key, label = random.choice(eligible)
        record = RECORDS[key]
        player = record["player"]
        correct_val = record["value"]
        delta = max(int(correct_val * 0.10), 20)
        distractors = self._nearby_numbers(correct_val, count=3,
                                           min_delta=delta // 2, max_delta=delta, floor=1)
        correct_str = self._format_number(correct_val)
        choices = [correct_str] + [self._format_number(d) for d in distractors]
        random.shuffle(choices)
        answer_idx = choices.index(correct_str)
        return {
            "question": f"How many career {label} does {player} have (NFL all-time record)?",
            "choices": choices,
            "answer": answer_idx,
        }