"""
Real Player Generator (aka "East/West Bowl Mode")
===================================================
"Which of these was an ACTUAL NFL player?"

Takes a real player with an unusual/memorable name and puts them
against 3 convincingly fake names. Inspired by Key & Peele.
"""

import random
from generators import BaseGenerator
from generators.nfl_data import REAL_UNUSUAL_PLAYERS, FAKE_NAME_PARTS


class RealPlayerGenerator(BaseGenerator):

    def __init__(self):
        # De-duplicate the real players list and optionally enforce snap threshold
        seen = set()
        self._players = []

        for p in REAL_UNUSUAL_PLAYERS:
            name = p.get("name")
            if not name or name in seen:
                continue

            # Optional guardrail: if career_snaps exists, require at least 50
            if p.get("career_snaps") is not None and p.get("career_snaps", 0) < 50:
                continue

            seen.add(name)
            self._players.append(p)

        # Track which real players we've already used
        self._used_real = set()

        # Pre-generate a large pool of fake names
        self._fake_names = self._generate_fake_names(200)

    def _generate_fake_names(self, count: int) -> list[str]:
        """
        Generate plausible-sounding fake NFL player names.
        Mix real naming patterns with absurd combinations.
        """
        names = set()

        firsts = FAKE_NAME_PARTS["first"]
        lasts = FAKE_NAME_PARTS["last"]

        # Method 1: Combine from parts
        while len(names) < count:
            first = random.choice(firsts)
            last = random.choice(lasts)
            names.add(f"{first} {last}")

        # Method 2: Hand-crafted gems that sound plausible
        hand_crafted = [
            "Scoobius Threadgill",
            "Marquaveon Thunderclap",
            "Bresharius McWilliamson",
            "D'Glester Hardunkichud",
            "Torque Lewith",
            "Hingle McCringleberry",
            "Jackmerius Tacktheritrix",
            "Tyroil Smoochie-Wallace",
            "Quatro Quatro",
            "Ozmatazz Buckshank",
            "Beezer Twelve Washingbeard",
            "Shakiraquan T.G.I.F. Carter",
            "Donkey Teeth",
            "Xmus Jaxon Flaxon-Waxon",
            "Sequester Grundelplith M.D.",
            "Javaris Jamar Javarison-Lamar",
            "Davoin Shower-Handel",
            "Jammie Jammie-Jammie",
            "Leotrimarvydaquantalius Washington",
            "Fartrell Cluggins",
            "Blythe Battersworth III",
            "Cornelius Vanderjagt-Smythe",
            "Throckmorton Sketchington",
            "Benedictus Thundergoose",
            "Zayvarious Picklesmith",
            "Tretavious Humperdink",
            "L'Carpetron Dookmarriot",
            "Bismarck Rutherford-Hayes",
            "Quandavious Bumbershoot",
            "Mergatroyd Skullbuster",
            "A.A. Ron Balakay",
            "Velociraptor Malone",
            "Dan Smith",
            "Grunthaven Wollstonecraft",
            "J'Dinkalage Morgoone",
            "Construction Noise Peterson",
            "Devontavious McThunderclap",
            "Cartwright Beauregard VII",
            "Firstname Lastname",
            "Ravioli Buccatini Sr.",
        ]

        for name in hand_crafted:
            names.add(name)

        return list(names)

    def _name_parts(self, name: str) -> set[str]:
        """Split a name into normalized parts for similarity checks."""
        cleaned = (
            name.replace(".", "")
            .replace("-", " ")
            .replace("'", " ")
        )
        return {part.lower() for part in cleaned.split() if part.strip()}

    def _is_too_similar(self, candidate: str, chosen_names: list[str], real_name: str) -> bool:
        """
        Reject names that share parts with already chosen options or the real answer.
        Prevents stuff like 'Thunderclap' appearing twice in one question.
        """
        candidate_parts = self._name_parts(candidate)
        compare_against = chosen_names + [real_name]

        for other in compare_against:
            other_parts = self._name_parts(other)
            if candidate_parts & other_parts:
                return True

        return False

    def generate(self, difficulty: str = "medium") -> dict:
        """Generate a 'Which player was ACTUALLY in the NFL?' question."""

        # Reset used list if we've exhausted the pool
        available = [p for p in self._players if p["name"] not in self._used_real]
        if not available:
            self._used_real.clear()
            available = self._players.copy()

        real_player = random.choice(available)
        self._used_real.add(real_player["name"])

        # Build fake choices that are distinct from each other and from the real player
        fake_choices = []
        shuffled_fakes = self._fake_names.copy()
        random.shuffle(shuffled_fakes)

        for fake in shuffled_fakes:
            if fake == real_player["name"]:
                continue
            if self._is_too_similar(fake, fake_choices, real_player["name"]):
                continue

            fake_choices.append(fake)

            if len(fake_choices) == 3:
                break

        # Fallback if filtering was too strict
        if len(fake_choices) < 3:
            for fake in shuffled_fakes:
                if fake == real_player["name"]:
                    continue
                if fake not in fake_choices:
                    fake_choices.append(fake)
                if len(fake_choices) == 3:
                    break

        choices = [real_player["name"]] + fake_choices[:3]
        random.shuffle(choices)
        answer_idx = choices.index(real_player["name"])

        # Optional hint text
        question = "Which of these was an ACTUAL NFL player?"
        #if difficulty == "easy" and real_player.get("position"):
            #uestion += f" (Hint: played {real_player['position']})"

        return {
            "question": question,
            "choices": choices,
            "answer": answer_idx,
            "_type": "real_player",
            "_difficulty": difficulty,
        }