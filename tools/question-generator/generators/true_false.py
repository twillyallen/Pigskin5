"""
True/False Generator
====================
Generates True/False questions from NFL facts.
"""

import random
from generators import BaseGenerator
from generators.nfl_data import (
    FRANCHISES, RECORDS, QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS,
    TIGHT_ENDS, NFL_FACTS, SUPER_BOWLS, MVP_WINNERS, KICKER_MVP,
    DRAFT_NOTABLES, COACHES
)


class TrueFalseGenerator(BaseGenerator):
    
    def __init__(self):
        # Pre-built bank of true/false facts
        # Each is (statement, is_true)
        self._facts = self._build_fact_bank()
    
    def _build_fact_bank(self) -> list[tuple[str, bool]]:
        facts = []
        
        # === FRANCHISE FACTS ===
        
        # Super Bowl appearances
        for name, data in FRANCHISES.items():
            short = name.split()[-1]
            
            if data.get("super_bowl_appearances", 0) == 0 and data.get("super_bowls_won", 0) == 0:
                facts.append((f"The {short} have appeared in a Super Bowl.", False))
            
            if data.get("super_bowls_won", 0) > 0:
                wrong_count = data["super_bowls_won"] + random.choice([1, 2])
                facts.append((f"The {short} have won {wrong_count} Super Bowls.", False))
        
        # Previous names
        for name, data in FRANCHISES.items():
            short = name.split()[-1]
            if "previous_names" in data:
                old = data["previous_names"][0]
                facts.append((f"The {name} were originally called the {old}.", True))
        
        # Specific interesting facts
        facts.extend([
            ("The Tampa Bay Buccaneers once lost 26 straight games.", True),
            ("The Buccaneers were originally placed in the AFC West.", True),
            ("Brett Favre was originally drafted by the Green Bay Packers.", False),
            ("The Giants play their Home Games in the state of New York.", False),
            ("The Browns have appeared in a Super Bowl.", False),
            ("Drew Brees never won a League MVP award.", True),
            ("Jerry Rice is the only player with over 200 Career TDs.", True),
            ("A kicker has won NFL MVP.", True),
            ("Tom Brady has more division titles than the entire Jets franchise has in the Super Bowl era.", True),
            ("The Packers have more total NFL Championships (including pre-Super Bowl era) than any other franchise.", True),
            ("The Jets won a Super Bowl before the Giants did.", True),
            ("The Packers won the first three Super Bowls.", False),
            ("The Saints existed for more than 30 seasons before winning their first playoff game.", True),
            ("The Jaguars made the AFC Championship Game in both the 1996 and 1999 seasons.", True),
            ("Johnny Manziel started more than 10 career NFL games.", False),
            ("The Texans have reached a conference championship game.", False),
            ("Ray Lewis won Super Bowl MVP with ZERO sacks in that game.", True),
            ("The Super Bowl has been played on every day of the week at some point.", False),
            ("A TE has led the league in receiving yards.", False),
            ("An offensive lineman has caught a TD pass in the Super Bowl.", False),
            ("A QB has thrown for 600+ yards in a single game.", False),
            ("The Pittsburgh Steelers have always been called the Pittsburgh Steelers.", False),
            ("Steve Young made his first NFL starts for the Buccaneers.", True),
            ("The first Super Bowl to go into overtime was Patriots vs Falcons.", True),
        ])
        
        # Player stat facts
        for qb in QUARTERBACKS:
            name = qb[0]
            stats = qb[2]
            if stats.get("super_bowls_won", 0) >= 3:
                wrong = stats["super_bowls_won"] + 1
                facts.append((f"{name} has won {wrong} Super Bowls.", False))
                facts.append((f"{name} has won {stats['super_bowls_won']} Super Bowls.", True))
        
        return facts
    
    def generate(self, difficulty: str = "medium") -> dict:
        fact_text, is_true = random.choice(self._facts)
        
        # For hard difficulty, prefer the less obvious facts
        if difficulty == "hard":
            # Try to find a less well-known fact
            obscure_facts = [f for f in self._facts if any(kw in f[0].lower() for kw in [
                "conference", "division", "originally", "existed", "offensive lineman",
                "first nfl starts", "manziel", "te has led"
            ])]
            if obscure_facts:
                fact_text, is_true = random.choice(obscure_facts)
        elif difficulty == "easy":
            # Pick well-known facts
            easy_facts = [f for f in self._facts if any(kw in f[0].lower() for kw in [
                "super bowl", "brady", "rice", "brees", "favre", "giants", "browns"
            ])]
            if easy_facts:
                fact_text, is_true = random.choice(easy_facts)
        
        return {
            "question": f"True or False: {fact_text}",
            "choices": ["True", "False"],
            "answer": 0 if is_true else 1,
            "_type": "true_false",
            "_difficulty": difficulty,
        }
