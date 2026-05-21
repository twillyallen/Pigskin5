"""
Standalone fake NFL name generator.
Usage: python generate_names.py [count]
"""

import random
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from generators.nfl_data import FAKE_NAME_PARTS
from generators.real_player import RealPlayerGenerator

HAND_CRAFTED = [
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


def generate_names(count: int = 20) -> list[str]:
    firsts = FAKE_NAME_PARTS["first"]
    lasts = FAKE_NAME_PARTS["last"]

    names = set(HAND_CRAFTED)
    while len(names) < count + len(HAND_CRAFTED):
        names.add(f"{random.choice(firsts)} {random.choice(lasts)}")

    all_names = list(names)
    random.shuffle(all_names)
    return all_names[:count]


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    for name in generate_names(count):
        print(name)
