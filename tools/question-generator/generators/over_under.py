"""
Over/Under Generator
====================
"OVER or UNDER: [Player/Team] has O/U X.5 [stat]"
"""

import random
from generators import BaseGenerator
from generators.nfl_data import (
    QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS,
    FRANCHISES, RECORDS
)


class OverUnderGenerator(BaseGenerator):
    
    def generate(self, difficulty: str = "medium") -> dict:
        generators = [
            self._player_career_stat,
            self._franchise_super_bowls,
            self._franchise_misc,
        ]
        
        gen_func = random.choice(generators)
        q = gen_func(difficulty)
        q["_type"] = "over_under"
        q["_difficulty"] = difficulty
        return q
    
    def _player_career_stat(self, difficulty: str) -> dict:
        """O/U on a player's career stat."""
        options = []
        
        for qb in QUARTERBACKS:
            name, _, stats = qb[0], qb[1], qb[2]
            if "pass_tds" in stats:
                options.append((name, "Career Passing TDs", stats["pass_tds"]))
            if "pass_yards" in stats:
                options.append((name, "Career Passing Yards", stats["pass_yards"]))
            if stats.get("super_bowls_won", 0) > 0:
                options.append((name, "Super Bowl Victories", stats["super_bowls_won"]))
            if stats.get("mvps", 0) > 0:
                options.append((name, "MVP Awards", stats["mvps"]))
            if stats.get("ints", 0) > 0:
                options.append((name, "Career Interceptions Thrown", stats["ints"]))
        
        for rb in RUNNING_BACKS:
            name, _, stats = rb[0], rb[1], rb[2]
            if "rush_yards" in stats:
                options.append((name, "Career Rushing Yards", stats["rush_yards"]))
            if "rush_tds" in stats:
                options.append((name, "Career Rushing TDs", stats["rush_tds"]))
            if "total_tds" in stats:
                options.append((name, "Career Total TDs", stats["total_tds"]))
        
        for wr in WIDE_RECEIVERS:
            name, _, stats = wr[0], wr[1], wr[2]
            if "rec_yards" in stats:
                options.append((name, "Career Receiving Yards", stats["rec_yards"]))
            if "rec_tds" in stats:
                options.append((name, "Career Receiving TDs", stats["rec_tds"]))
        
        for te in TIGHT_ENDS:
            name, _, stats = te[0], te[1], te[2]
            if "rec_tds" in stats:
                options.append((name, "Career Receiving TDs", stats["rec_tds"]))
        
        player_name, stat_label, actual_value = random.choice(options)
        
        # Set the line so the answer isn't always obvious
        # Difficulty affects how close the line is to actual
        if difficulty == "hard":
            # Line very close to actual — tough call
            offset = random.choice([-0.5, 0.5, -1.5, 1.5])
        elif difficulty == "easy":
            # Line far from actual — obvious answer
            if actual_value > 100:
                offset = random.choice([-20, -30, 20, 30]) + 0.5
            else:
                offset = random.choice([-5, -8, 5, 8]) + 0.5
        else:
            # Medium
            if actual_value > 1000:
                offset = random.choice([-50, -100, 50, 100]) + 0.5
            elif actual_value > 100:
                offset = random.choice([-10, -15, 10, 15]) + 0.5
            else:
                offset = random.choice([-2, -3, 2, 3]) + 0.5
        
        line = actual_value + offset
        
        # Ensure line ends in .5 for clean O/U format
        line = round(line) + 0.5 if line % 1 != 0.5 else line
        
        is_over = actual_value > line
        
        # Format the line value
        if line > 999:
            line_str = f"{line:,.1f}"
        else:
            line_str = f"{line}"
        
        return {
            "question": f"OVER or UNDER: {player_name} has O/U {line_str} {stat_label}.",
            "choices": ["OVER", "UNDER"],
            "answer": 0 if is_over else 1,
        }
    
    def _franchise_super_bowls(self, difficulty: str) -> dict:
        """O/U on franchise Super Bowl wins/losses/appearances."""
        options = []
        
        for name, data in FRANCHISES.items():
            short = name.split()[-1]
            
            if "super_bowls_won" in data:
                options.append((f"The {short}", "Super Bowl victories", data["super_bowls_won"]))
            if "super_bowl_losses" in data and data["super_bowl_losses"] > 0:
                options.append((f"The {short}", "Super Bowl losses", data["super_bowl_losses"]))
            if "super_bowl_appearances" in data and data["super_bowl_appearances"] > 0:
                options.append((f"The {short}", "Super Bowl appearances", data["super_bowl_appearances"]))
        
        team_label, stat_label, actual = random.choice(options)
        
        # Set line
        offset = random.choice([-0.5, 0.5])
        if difficulty == "easy" and actual > 2:
            offset = random.choice([-2.5, -1.5])
        
        line = actual + offset
        # Ensure .5
        if line % 1 != 0.5:
            line = int(line) + 0.5
        if line < 0:
            line = 0.5
        
        is_over = actual > line
        
        return {
            "question": f"OVER or UNDER: {team_label} have O/U {line} {stat_label} all-time.",
            "choices": ["OVER", "UNDER"],
            "answer": 0 if is_over else 1,
        }
    
    def _franchise_misc(self, difficulty: str) -> dict:
        """O/U on misc franchise facts (cities, championships, etc.)."""
        options = []
        
        for name, data in FRANCHISES.items():
            short = name.split()[-1]
            if "cities_count" in data:
                options.append((f"The {short}", "been located in O/U", data["cities_count"], "cities"))
            if "nfl_championships" in data and data["nfl_championships"] > 2:
                options.append((f"The {short}", "have O/U", data["nfl_championships"], "NFL championships (all-time)"))
        
        if not options:
            return self._franchise_super_bowls(difficulty)
        
        team, prefix, actual, suffix = random.choice(options)
        
        line = actual + random.choice([-0.5, 0.5])
        if line < 0.5:
            line = 0.5
        
        is_over = actual > line
        
        return {
            "question": f"OVER or UNDER: {team} {prefix} {line} {suffix}.",
            "choices": ["OVER", "UNDER"],
            "answer": 0 if is_over else 1,
        }
