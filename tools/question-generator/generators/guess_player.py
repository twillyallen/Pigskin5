"""
Guess the Player Generator
===========================
Shows a stat line and asks who it belongs to.
"Guess the [Year] [Position]:\n- X Pass Yards\n- Y Pass TDs\n..."
"""

import random
from generators import BaseGenerator
from generators.nfl_data import (
    QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS,
    SEASON_LEADERS
)


class GuessPlayerGenerator(BaseGenerator):
    
    def generate(self, difficulty: str = "medium") -> dict:
        # Pick position group
        position_choice = random.choices(
            ["QB", "RB", "WR", "TE"],
            weights=[0.35, 0.30, 0.25, 0.10],
            k=1
        )[0]
        
        is_career = random.random() < 0.5
        
        if position_choice == "QB":
            q = self._qb_guess(difficulty, is_career)
        elif position_choice == "RB":
            q = self._rb_guess(difficulty, is_career)
        elif position_choice == "WR":
            q = self._wr_guess(difficulty, is_career)
        else:
            q = self._te_guess(difficulty, is_career)
        
        q["_type"] = "guess_player"
        q["_difficulty"] = difficulty
        return q
    
    def _qb_guess(self, difficulty: str, career: bool) -> dict:
        """Guess the QB from stats."""
        pool = QUARTERBACKS.copy()
        
        if difficulty == "easy":
            # Only big names
            pool = [p for p in pool if p[2].get("pass_yards", 0) > 50000 or p[2].get("super_bowls_won", 0) >= 2]
        elif difficulty == "hard":
            # Mid-tier guys
            pool = [p for p in pool if 20000 < p[2].get("pass_yards", 0) < 50000]
        
        if len(pool) < 4:
            pool = QUARTERBACKS[:12]
        
        correct = random.choice(pool)
        name, pos, stats = correct[0], correct[1], correct[2]
        
        # Build stat line
        label = "All-Time" if career else "Career"
        lines = []
        if "pass_yards" in stats:
            lines.append(f"{stats['pass_yards']:,} Pass Yards")
        if "pass_tds" in stats:
            lines.append(f"{stats['pass_tds']} Pass TDs")
        if "ints" in stats:
            lines.append(f"{stats['ints']} INTs")
        if "passer_rating" in stats:
            lines.append(f"{stats['passer_rating']} Passer Rating")
        
        # Show 3-4 stats
        if len(lines) > 4:
            lines = random.sample(lines, 4)
        
        stat_block = "\n".join(f"- {l}" for l in lines)
        
        # Get distractors with similar career stat magnitude
        correct_yards = stats.get("pass_yards", 0)
        if correct_yards > 0:
            # Find QBs within ±30% of the correct player's pass yards
            lower = correct_yards * 0.70
            upper = correct_yards * 1.30
            similar_tier = [
                p for p in QUARTERBACKS 
                if p[0] != name 
                and lower <= p[2].get("pass_yards", 0) <= upper
            ]
            
            # If too few in tight band, expand to ±50%
            if len(similar_tier) < 3:
                lower = correct_yards * 0.50
                upper = correct_yards * 1.50
                similar_tier = [
                    p for p in QUARTERBACKS 
                    if p[0] != name 
                    and lower <= p[2].get("pass_yards", 0) <= upper
                ]
            
            # Final fallback: any QB
            if len(similar_tier) < 3:
                similar_tier = [p for p in QUARTERBACKS if p[0] != name]
        else:
            similar_tier = [p for p in QUARTERBACKS if p[0] != name]

        random.shuffle(similar_tier)
        distractors = [p[0] for p in similar_tier[:3]]
        
        choices = [name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(name)
        
        return {
            "question": f"Guess the {label} QB:\n{stat_block}",
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _rb_guess(self, difficulty: str, career: bool) -> dict:
        """Guess the RB from stats."""
        pool = RUNNING_BACKS.copy()
        
        if difficulty == "easy":
            pool = [p for p in pool if p[2].get("rush_yards", 0) > 10000]
        elif difficulty == "hard":
            pool = [p for p in pool if p[2].get("rush_yards", 0) < 10000]
        
        if len(pool) < 4:
            pool = RUNNING_BACKS[:10]
        
        correct = random.choice(pool)
        name, pos, stats = correct[0], correct[1], correct[2]
        
        label = "All-Time" if career else "Career"
        lines = []
        if "rush_yards" in stats:
            lines.append(f"{stats['rush_yards']:,} Rush Yards")
        if "rush_tds" in stats:
            lines.append(f"{stats['rush_tds']} Rush TDs")
        if "ypc" in stats:
            lines.append(f"{stats['ypc']} Yards per Carry")
        if "total_tds" in stats:
            lines.append(f"{stats['total_tds']} Total TDs")
        if "yards_from_scrimmage" in stats:
            lines.append(f"{stats['yards_from_scrimmage']:,} Yards from Scrimmage")
        
        if len(lines) > 4:
            lines = random.sample(lines, 4)
        elif len(lines) < 3:
            lines = lines  # use what we have
        
        stat_block = "\n".join(f"- {l}" for l in lines)
        
        # Distractors
        same_era = [p for p in RUNNING_BACKS if p[3] == correct[3] and p[0] != name]
        if len(same_era) < 3:
            same_era = [p for p in RUNNING_BACKS if p[0] != name]
        
        random.shuffle(same_era)
        distractors = [p[0] for p in same_era[:3]]
        
        choices = [name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(name)
        
        return {
            "question": f"Guess the {label} RB:\n{stat_block}",
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _wr_guess(self, difficulty: str, career: bool) -> dict:
        """Guess the WR from stats."""
        pool = WIDE_RECEIVERS.copy()
        
        if difficulty == "easy":
            pool = [p for p in pool if p[2].get("rec_yards", 0) > 12000]
        elif difficulty == "hard":
            pool = [p for p in pool if 5000 < p[2].get("rec_yards", 0) < 10000]
        
        if len(pool) < 4:
            pool = WIDE_RECEIVERS[:10]
        
        correct = random.choice(pool)
        name, pos, stats = correct[0], correct[1], correct[2]
        
        label = "All-Time" if career else "Career"
        lines = []
        if "rec_yards" in stats:
            lines.append(f"{stats['rec_yards']:,} Rec. Yards")
        if "rec_tds" in stats:
            lines.append(f"{stats['rec_tds']} Rec. TDs")
        if "receptions" in stats:
            lines.append(f"{stats['receptions']:,} Receptions")
        
        if len(lines) > 3:
            lines = random.sample(lines, 3)
        
        stat_block = "\n".join(f"- {l}" for l in lines)
        
        same_era = [p for p in WIDE_RECEIVERS if p[3] == correct[3] and p[0] != name]
        if len(same_era) < 3:
            same_era = [p for p in WIDE_RECEIVERS if p[0] != name]
        
        random.shuffle(same_era)
        distractors = [p[0] for p in same_era[:3]]
        
        choices = [name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(name)
        
        return {
            "question": f"Guess the {label} WR:\n{stat_block}",
            "choices": choices,
            "answer": answer_idx,
        }
    
    def _te_guess(self, difficulty: str, career: bool) -> dict:
        """Guess the TE from stats."""
        pool = TIGHT_ENDS.copy()
        
        if len(pool) < 4:
            # Not enough TEs, supplement with WRs
            return self._wr_guess(difficulty, career)
        
        correct = random.choice(pool)
        name, pos, stats = correct[0], correct[1], correct[2]
        
        lines = []
        if "rec_yards" in stats:
            lines.append(f"{stats['rec_yards']:,} Rec. Yards")
        if "rec_tds" in stats:
            lines.append(f"{stats['rec_tds']} Rec. TDs")
        if "receptions" in stats:
            lines.append(f"{stats['receptions']:,} Receptions")
        
        stat_block = "\n".join(f"- {l}" for l in lines)
        
        distractors = [p[0] for p in TIGHT_ENDS if p[0] != name]
        if len(distractors) < 3:
            distractors += [p[0] for p in WIDE_RECEIVERS[:3]]
        
        random.shuffle(distractors)
        distractors = distractors[:3]
        
        choices = [name] + distractors
        random.shuffle(choices)
        answer_idx = choices.index(name)
        
        return {
            "question": f"Guess the Career TE:\n{stat_block}",
            "choices": choices,
            "answer": answer_idx,
        }
