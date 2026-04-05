"""Base generator class for all question types."""

import random
from abc import ABC, abstractmethod


class BaseGenerator(ABC):
    """
    All question generators inherit from this.
    Each must implement generate() and return a dict matching Pigskin5's format:
    
    {
        "question": str,
        "choices": list[str],   # 2 items for T/F and O/U, 4 for everything else
        "answer": int,          # 0-indexed correct answer
        "_type": str,           # internal tracking, stripped before output
        "_difficulty": str,     # internal tracking, stripped before output
    }
    """
    
    @abstractmethod
    def generate(self, difficulty: str = "medium") -> dict:
        """Generate a single question. difficulty: 'easy', 'medium', or 'hard'"""
        pass
    
    def _shuffle_with_answer(self, choices: list[str], correct_index: int) -> tuple[list[str], int]:
        """
        Shuffle choices and return (shuffled_choices, new_correct_index).
        Use this to randomize answer position.
        """
        correct_answer = choices[correct_index]
        shuffled = choices.copy()
        random.shuffle(shuffled)
        new_index = shuffled.index(correct_answer)
        return shuffled, new_index
    
    def _nearby_numbers(self, correct: int, count: int = 3, 
                         min_delta: int = 2, max_delta: int = 8,
                         floor: int = 0) -> list[int]:
        """
        Generate plausible wrong numeric answers near the correct one.
        Returns `count` wrong numbers, none equal to correct.
        """
        wrongs = set()
        attempts = 0
        while len(wrongs) < count and attempts < 100:
            delta = random.randint(min_delta, max_delta)
            wrong = correct + (delta * random.choice([-1, 1]))
            if wrong != correct and wrong >= floor:
                wrongs.add(wrong)
            attempts += 1
        
        # Fallback if we couldn't generate enough
        while len(wrongs) < count:
            wrongs.add(correct + len(wrongs) + 2)
        
        return list(wrongs)[:count]
    
    def _format_number(self, n) -> str:
        """Format numbers with commas for readability."""
        if isinstance(n, float):
            return f"{n:,.1f}"
        return f"{n:,}"
