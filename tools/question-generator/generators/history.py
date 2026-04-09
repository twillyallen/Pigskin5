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


class HistoryGenerator(BaseGenerator):
    
    def generate(self, difficulty: str = "medium") -> dict:
        generators = [
            self._super_bowl_question,
            self._iconic_moment,
            self._draft_question,
            self._award_question,
            self._coach_question,
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
                q_text = f"Which player caught the game-winning play in \"{name}\"?"
            else:
                q_text = f"Which player is associated with the \"{name}\"?"
            
            # Get players from similar era
            all_players = [p[0] for p in QUARTERBACKS + list(ICONIC_MOMENTS) 
                          if isinstance(p, tuple) and p[0] != correct]
            fallback_names = ["Tony Romo", "Peyton Manning", "Kurt Warner", 
                            "Steve McNair", "Michael Vick", "Brett Favre",
                            "Roger Craig", "Terrell Davis", "Jerome Bettis"]
            
            pool = [n for n in fallback_names if n != correct]
            random.shuffle(pool)
            distractors = pool[:3]
        else:
            correct = str(moment["year"])
            q_text = f"In what year did \"{moment['name']}\" occur?"
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
                return era == "current"
            elif year_val >= 2000:
                return era in ["modern", "current"]
            else:
                return True

        # Build smarter distractor pools by award type — ALL filtered by year relevance
        if "Coach" in award:
            # Coaches don't have era tags in the same shape; leave as-is for now
            pool = [c["name"] for c in COACHES if c["name"] != correct]

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
                fallback_pool = [p[0] for p in QUARTERBACKS if p[0] != correct]
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