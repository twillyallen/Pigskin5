"""
NFL Data Module — The Knowledge Backbone
==========================================
Structured data for question generation. Organized by category.

TO UPDATE: Each offseason, update the current-season sections.
Everything else is historical and stable.

LAST UPDATED: April 2026 (through 2025 NFL season)
"""

# ═══════════════════════════════════════════════════════════════
# PLAYER CAREER STATS (for Guess the Player, Stat Leader, etc.)
# ═══════════════════════════════════════════════════════════════

# Format: (name, position, {stat_category: value, ...}, era, teams[])
# era: "classic" (pre-2000), "modern" (2000-2015), "current" (2016+)

QUARTERBACKS = [
    # All-timers
    ("Tom Brady", "QB", {"pass_yards": 89228, "pass_tds": 649, "ints": 212, "passer_rating": 97.2, "super_bowls_won": 7, "mvps": 3}, "modern", ["Patriots", "Buccaneers"]),
    ("Peyton Manning", "QB", {"pass_yards": 71940, "pass_tds": 539, "ints": 251, "passer_rating": 96.5, "super_bowls_won": 2, "mvps": 5}, "modern", ["Colts", "Broncos"]),
    ("Drew Brees", "QB", {"pass_yards": 80358, "pass_tds": 571, "ints": 243, "passer_rating": 98.7, "super_bowls_won": 1, "mvps": 0}, "modern", ["Chargers", "Saints"]),
    ("Aaron Rodgers", "QB", {"pass_yards": 59055, "pass_tds": 475, "ints": 105, "passer_rating": 103.6, "super_bowls_won": 1, "mvps": 4}, "modern", ["Packers", "Jets"]),
    ("Brett Favre", "QB", {"pass_yards": 71838, "pass_tds": 508, "ints": 336, "passer_rating": 86.0, "super_bowls_won": 1, "mvps": 3}, "classic", ["Falcons", "Packers", "Jets", "Vikings"]),
    ("Dan Marino", "QB", {"pass_yards": 61361, "pass_tds": 420, "ints": 252, "passer_rating": 86.4, "super_bowls_won": 0, "mvps": 1}, "classic", ["Dolphins"]),
    ("Joe Montana", "QB", {"pass_yards": 40551, "pass_tds": 273, "ints": 139, "passer_rating": 92.3, "super_bowls_won": 4, "mvps": 2}, "classic", ["49ers", "Chiefs"]),
    ("John Elway", "QB", {"pass_yards": 51475, "pass_tds": 300, "ints": 226, "passer_rating": 79.9, "super_bowls_won": 2, "mvps": 1}, "classic", ["Broncos"]),
    ("Patrick Mahomes", "QB", {"pass_yards": 32000, "pass_tds": 238, "ints": 65, "passer_rating": 104.1, "super_bowls_won": 3, "mvps": 2}, "current", ["Chiefs"]),
    ("Josh Allen", "QB", {"pass_yards": 26000, "pass_tds": 195, "ints": 82, "passer_rating": 93.5, "rush_tds": 50, "rush_yards": 4200, "super_bowls_won": 0, "mvps": 1}, "current", ["Bills"]),
    ("Lamar Jackson", "QB", {"pass_yards": 18000, "pass_tds": 135, "ints": 50, "passer_rating": 101.5, "rush_yards": 6200, "rush_tds": 35, "super_bowls_won": 0, "mvps": 2}, "current", ["Ravens"]),
    ("Joe Burrow", "QB", {"pass_yards": 15000, "pass_tds": 110, "ints": 40, "passer_rating": 99.0, "super_bowls_won": 0}, "current", ["Bengals"]),
    ("Matthew Stafford", "QB", {"pass_yards": 60000, "pass_tds": 380, "ints": 175, "passer_rating": 92.0, "super_bowls_won": 1, "mvps": 1}, "modern", ["Lions", "Rams"]),
    ("Philip Rivers", "QB", {"pass_yards": 63440, "pass_tds": 421, "ints": 209, "passer_rating": 95.2, "super_bowls_won": 0}, "modern", ["Chargers", "Colts"]),
    ("Ben Roethlisberger", "QB", {"pass_yards": 64088, "pass_tds": 418, "ints": 211, "passer_rating": 93.5, "super_bowls_won": 2}, "modern", ["Steelers"]),
    ("Eli Manning", "QB", {"pass_yards": 57023, "pass_tds": 366, "ints": 244, "passer_rating": 84.1, "super_bowls_won": 2}, "modern", ["Giants"]),
    ("Russell Wilson", "QB", {"pass_yards": 43000, "pass_tds": 320, "ints": 100, "passer_rating": 100.3, "super_bowls_won": 1}, "current", ["Seahawks", "Broncos", "Steelers"]),
    ("Jameis Winston", "QB", {"pass_yards": 22000, "pass_tds": 145, "ints": 100, "passer_rating": 87.0, "super_bowls_won": 0}, "current", ["Buccaneers", "Saints", "Browns"]),
    ("Ryan Fitzpatrick", "QB", {"pass_yards": 34990, "pass_tds": 223, "ints": 169, "passer_rating": 82.3, "super_bowls_won": 0}, "modern", ["Rams", "Bengals", "Bills", "Titans", "Texans", "Jets", "Buccaneers", "Dolphins", "Washington"]),
    ("Terry Bradshaw", "QB", {"pass_yards": 27989, "pass_tds": 212, "ints": 210, "passer_rating": 70.9, "super_bowls_won": 4}, "classic", ["Steelers"]),
    ("Troy Aikman", "QB", {"pass_yards": 32942, "pass_tds": 165, "ints": 141, "passer_rating": 81.6, "super_bowls_won": 3}, "classic", ["Cowboys"]),
    ("Kurt Warner", "QB", {"pass_yards": 32344, "pass_tds": 208, "ints": 128, "passer_rating": 93.7, "super_bowls_won": 1, "mvps": 2}, "modern", ["Rams", "Giants", "Cardinals"]),
    ("Steve Young", "QB", {"pass_yards": 33124, "pass_tds": 232, "ints": 107, "passer_rating": 96.8, "super_bowls_won": 1, "mvps": 2}, "classic", ["Buccaneers", "49ers"]),
    ("Matt Ryan", "QB", {"pass_yards": 62792, "pass_tds": 381, "ints": 180, "passer_rating": 93.6, "super_bowls_won": 0, "mvps": 1}, "modern", ["Falcons", "Colts"]),
    ("Cam Newton", "QB", {"pass_yards": 32382, "pass_tds": 194, "ints": 123, "rush_tds": 75, "passer_rating": 86.1, "super_bowls_won": 0, "mvps": 1}, "modern", ["Panthers", "Patriots"]),
    ("Dak Prescott", "QB", {"pass_yards": 30000, "pass_tds": 210, "ints": 80, "passer_rating": 96.0, "super_bowls_won": 0}, "current", ["Cowboys"]),
    ("Jared Goff", "QB", {"pass_yards": 28000, "pass_tds": 180, "ints": 85, "passer_rating": 93.0, "super_bowls_won": 0}, "current", ["Rams", "Lions"]),
]

RUNNING_BACKS = [
    ("Emmitt Smith", "RB", {"rush_yards": 18355, "rush_tds": 164, "ypc": 4.2, "rec_yards": 3224, "total_tds": 175}, "classic", ["Cowboys", "Cardinals"]),
    ("Walter Payton", "RB", {"rush_yards": 16726, "rush_tds": 110, "ypc": 4.4, "rec_yards": 4538, "total_tds": 125}, "classic", ["Bears"]),
    ("Barry Sanders", "RB", {"rush_yards": 15269, "rush_tds": 99, "ypc": 5.0, "rec_yards": 2921, "total_tds": 109}, "classic", ["Lions"]),
    ("Adrian Peterson", "RB", {"rush_yards": 14918, "rush_tds": 120, "ypc": 4.7, "single_game_rush": 296}, "modern", ["Vikings", "Saints", "Cardinals", "Washington", "Lions", "Seahawks", "Titans"]),
    ("LaDainian Tomlinson", "RB", {"rush_yards": 13684, "rush_tds": 145, "ypc": 4.3, "rec_tds": 17, "total_tds": 162, "single_season_rush_tds": 28}, "modern", ["Chargers", "Jets"]),
    ("Marshawn Lynch", "RB", {"rush_yards": 10413, "rush_tds": 85, "ypc": 4.3, "yards_from_scrimmage": 12979}, "modern", ["Bills", "Seahawks", "Raiders"]),
    ("Christian McCaffrey", "RB", {"rush_yards": 6500, "rush_tds": 50, "ypc": 4.6, "rec_yards": 4200, "total_tds": 98, "yards_from_scrimmage": 12979}, "current", ["Panthers", "49ers"]),
    ("Derrick Henry", "RB", {"rush_yards": 11000, "rush_tds": 100, "ypc": 4.9}, "current", ["Titans", "Ravens"]),
    ("Eric Dickerson", "RB", {"rush_yards": 13259, "rush_tds": 90, "ypc": 4.4, "single_season_rush_yards": 2105}, "classic", ["Rams", "Colts", "Raiders", "Falcons"]),
    ("Shaun Alexander", "RB", {"rush_yards": 9453, "rush_tds": 100, "single_season_rush_tds": 27, "mvp_year": 2005}, "modern", ["Seahawks", "Washington"]),
    ("Priest Holmes", "RB", {"rush_yards": 6070, "rush_tds": 76, "single_season_rush_tds": 27}, "modern", ["Ravens", "Chiefs"]),
    ("Jim Brown", "RB", {"rush_yards": 12312, "rush_tds": 106, "ypc": 5.2, "mvps": 3}, "classic", ["Browns"]),
    ("Jonathan Taylor", "RB", {"rush_yards": 6500, "rush_tds": 50, "ypc": 4.8}, "current", ["Colts"]),
    ("James Cook", "RB", {"rush_yards": 4000, "rush_tds": 30}, "current", ["Bills"]),
    ("Alvin Kamara", "RB", {"rush_yards": 5500, "rush_tds": 55, "rec_yards": 4000, "total_tds": 80}, "current", ["Saints"]),
    ("Aaron Jones", "RB", {"rush_yards": 7000, "rush_tds": 60, "ypc": 4.8}, "current", ["Packers", "Vikings", "Seahawks"]),
    ("Chris Johnson", "RB", {"rush_yards": 9651, "rush_tds": 55, "ypc": 4.6, "single_season_yards_from_scrimmage": 2509}, "modern", ["Titans", "Jets", "Cardinals"]),
    ("Jahmyr Gibbs", "RB", {"rush_yards": 2500, "rush_tds": 25}, "current", ["Lions"]),
]

WIDE_RECEIVERS = [
    ("Jerry Rice", "WR", {"rec_yards": 22895, "rec_tds": 197, "receptions": 1549, "total_tds": 208}, "classic", ["49ers", "Raiders", "Seahawks"]),
    ("Randy Moss", "WR", {"rec_yards": 15292, "rec_tds": 156, "receptions": 982, "single_season_rec_tds": 23}, "modern", ["Vikings", "Raiders", "Patriots", "Titans", "49ers"]),
    ("Terrell Owens", "WR", {"rec_yards": 15934, "rec_tds": 153, "receptions": 1078}, "modern", ["49ers", "Eagles", "Cowboys", "Bills", "Bengals"]),
    ("Larry Fitzgerald", "WR", {"rec_yards": 17492, "rec_tds": 121, "receptions": 1432, "career_drops": 29}, "modern", ["Cardinals"]),
    ("Calvin Johnson", "WR", {"rec_yards": 11619, "rec_tds": 83, "receptions": 731}, "modern", ["Lions"]),
    ("Antonio Brown", "WR", {"rec_yards": 12291, "rec_tds": 83, "receptions": 928, "100_rec_seasons": 6}, "modern", ["Steelers", "Raiders", "Patriots", "Buccaneers"]),
    ("Davante Adams", "WR", {"rec_yards": 10000, "rec_tds": 96, "receptions": 800, "single_season_tds": 18, "100_rec_seasons": 5}, "current", ["Packers", "Raiders", "Jets"]),
    ("Tyreek Hill", "WR", {"rec_yards": 10000, "rec_tds": 80, "receptions": 700}, "current", ["Chiefs", "Dolphins"]),
    ("Stefon Diggs", "WR", {"rec_yards": 9500, "rec_tds": 65, "receptions": 700}, "current", ["Vikings", "Bills", "Texans"]),
    ("Justin Jefferson", "WR", {"rec_yards": 6500, "rec_tds": 35, "receptions": 450}, "current", ["Vikings"]),
    ("CeeDee Lamb", "WR", {"rec_yards": 5500, "rec_tds": 35, "receptions": 400}, "current", ["Cowboys"]),
    ("Brandon Marshall", "WR", {"rec_yards": 12351, "rec_tds": 83, "receptions": 970, "100_rec_seasons": 6}, "modern", ["Broncos", "Dolphins", "Bears", "Jets", "Giants", "Seahawks"]),
    ("Chad Johnson", "WR", {"rec_yards": 11059, "rec_tds": 67, "receptions": 766}, "modern", ["Bengals", "Patriots", "Dolphins"]),
    ("Marvin Harrison", "WR", {"rec_yards": 14580, "rec_tds": 128, "receptions": 1102}, "modern", ["Colts"]),
    ("Don Hutson", "WR", {"rec_yards": 7991, "rec_tds": 99, "receptions": 488}, "classic", ["Packers"]),
    ("Steve Smith Sr.", "WR", {"rec_yards": 14731, "rec_tds": 81, "receptions": 1031}, "modern", ["Panthers", "Ravens"]),
    ("Cris Collinsworth", "WR", {"rec_yards": 6698, "rec_tds": 36, "receptions": 417}, "classic", ["Bengals"]),
    ("Keenan Allen", "WR", {"rec_yards": 8500, "rec_tds": 50, "receptions": 700, "100_rec_seasons": 5}, "current", ["Chargers", "Bears"]),
    ("Doug Baldwin", "WR", {"rec_yards": 6563, "rec_tds": 49, "receptions": 493}, "modern", ["Seahawks"]),
    ("Michael Thomas", "WR", {"rec_yards": 5500, "rec_tds": 32, "receptions": 510, "single_season_receptions": 149}, "current", ["Saints"]),
    ("Tetairoa McMillan", "WR", {"rec_yards": 1200, "rec_tds": 8, "receptions": 90}, "current", ["Cardinals"]),
]

TIGHT_ENDS = [
    ("Tony Gonzalez", "TE", {"rec_yards": 15127, "rec_tds": 111, "receptions": 1325}, "modern", ["Chiefs", "Falcons"]),
    ("Rob Gronkowski", "TE", {"rec_yards": 9286, "rec_tds": 92, "receptions": 621}, "modern", ["Patriots", "Buccaneers"]),
    ("Travis Kelce", "TE", {"rec_yards": 12000, "rec_tds": 75, "receptions": 900}, "current", ["Chiefs"]),
    ("Antonio Gates", "TE", {"rec_yards": 11841, "rec_tds": 116, "receptions": 955}, "modern", ["Chargers"]),
    ("Shannon Sharpe", "TE", {"rec_yards": 10060, "rec_tds": 62, "receptions": 815}, "classic", ["Broncos", "Ravens"]),
    ("Trey McBride", "TE", {"rec_yards": 1500, "rec_tds": 5, "receptions": 126, "single_season_te_receptions": 126}, "current", ["Cardinals"]),
]


# ═══════════════════════════════════════════════════════════════
# FRANCHISE DATA
# ═══════════════════════════════════════════════════════════════

FRANCHISES = {
    "Arizona Cardinals": {
        "founded": 1898, "joined_nfl": 1920,
        "super_bowls_won": 0, "super_bowl_appearances": 1,
        "previous_names": ["Chicago Cardinals", "St. Louis Cardinals", "Phoenix Cardinals"],
        "previous_cities": ["Chicago", "St. Louis", "Phoenix"],
        "moved_to_arizona": 1988,
        "all_time_pass_leader": "Carson Palmer",
        "all_time_rush_leader": "Ottis Anderson",
        "all_time_rec_leader": "Larry Fitzgerald",
        "stadium": "State Farm Stadium",
        "division": "NFC West",
        "hof_players": 10,
    },
    "Atlanta Falcons": {
        "founded": 1965, "joined_nfl": 1966,
        "super_bowls_won": 0, "super_bowl_appearances": 2,
        "all_time_pass_leader": "Matt Ryan",
        "all_time_rush_leader": "Gerald Riggs",
        "all_time_rec_leader": "Julio Jones",
        "stadium": "Mercedes-Benz Stadium",
        "division": "NFC South",
    },
    "Baltimore Ravens": {
        "founded": 1996,
        "super_bowls_won": 2, "super_bowl_years": [2000, 2012],
        "first_super_bowl_year": 2000,
        "all_time_pass_leader": "Joe Flacco",
        "all_time_rush_leader": "Jamal Lewis",
        "all_time_rec_leader": "Derrick Mason",
        "all_time_sacks_leader": "Terrell Suggs",
        "stadium": "M&T Bank Stadium",
        "division": "AFC North",
    },
    "Buffalo Bills": {
        "founded": 1960,
        "super_bowls_won": 0, "super_bowl_losses": 4, "consecutive_sb_losses": 4,
        "all_time_pass_leader": "Jim Kelly",
        "all_time_rush_leader": "Thurman Thomas",
        "all_time_rec_leader": "Andre Reed",
        "stadium": "Highmark Stadium",
        "division": "AFC East",
        "notable": "Lost 4 consecutive Super Bowls (XXV-XXVIII)",
    },
    "Carolina Panthers": {
        "founded": 1995,
        "super_bowls_won": 0, "super_bowl_appearances": 2,
        "all_time_pass_leader": "Cam Newton",
        "all_time_rush_leader": "DeAngelo Williams",
        "all_time_rec_leader": "Steve Smith Sr.",
        "stadium": "Bank of America Stadium",
        "division": "NFC South",
    },
    "Chicago Bears": {
        "founded": 1919, "joined_nfl": 1920,
        "super_bowls_won": 1, "super_bowl_year": 1985,
        "previous_names": ["Decatur Staleys", "Chicago Staleys"],
        "nfl_championships": 9,
        "all_time_pass_leader": "Jay Cutler",
        "all_time_rush_leader": "Walter Payton",
        "all_time_rec_leader": "Johnny Morris",
        "hof_players": 30,
        "stadium": "Soldier Field",
        "division": "NFC North",
    },
    "Cincinnati Bengals": {
        "founded": 1968,
        "super_bowls_won": 0, "super_bowl_appearances": 3,
        "all_time_pass_leader": "Ken Anderson",
        "all_time_rush_leader": "Cedric Benson",
        "all_time_rec_leader": "Chad Johnson",
        "stadium": "Paycor Stadium",
        "division": "AFC North",
    },
    "Cleveland Browns": {
        "founded": 1946, "original_league": "AAFC",
        "super_bowls_won": 0, "super_bowl_appearances": 0,
        "aafc_championships": 4, "nfl_championships": 4,
        "all_time_pass_leader": "Brian Sipe",
        "all_time_rush_leader": "Jim Brown",
        "stadium": "Cleveland Browns Stadium",
        "division": "AFC North",
    },
    "Dallas Cowboys": {
        "founded": 1960,
        "super_bowls_won": 5,
        "all_time_pass_leader": "Tony Romo",
        "all_time_rush_leader": "Emmitt Smith",
        "all_time_rec_leader": "Jason Witten",
        "all_time_sacks_leader": "DeMarcus Ware",
        "stadium": "AT&T Stadium",
        "division": "NFC East",
    },
    "Denver Broncos": {
        "founded": 1960,
        "super_bowls_won": 3, "super_bowl_losses": 5,
        "all_time_pass_leader": "John Elway",
        "all_time_rush_leader": "Terrell Davis",
        "all_time_rec_leader": "Rod Smith",
        "stadium": "Empower Field at Mile High",
        "division": "AFC West",
    },
    "Detroit Lions": {
        "founded": 1930,
        "super_bowls_won": 0, "super_bowl_appearances": 0,
        "nfl_championships": 4,
        "all_time_pass_leader": "Matthew Stafford",
        "all_time_rush_leader": "Barry Sanders",
        "all_time_rec_leader": "Calvin Johnson",
        "stadium": "Ford Field",
        "division": "NFC North",
    },
    "Green Bay Packers": {
        "founded": 1919, "joined_nfl": 1921,
        "super_bowls_won": 4, "nfl_championships": 13,
        "total_championships": 13,
        "all_time_pass_leader": "Brett Favre",
        "all_time_rush_leader": "Ahman Green",
        "all_time_rec_leader": "Donald Driver",
        "all_time_sacks_leader": "Kabeer Gbaja-Biamila",
        "stadium": "Lambeau Field",
        "division": "NFC North",
    },
    "Houston Texans": {
        "founded": 2002, "last_expansion_team": True,
        "super_bowls_won": 0, "super_bowl_appearances": 0,
        "conference_championship_appearances": 0,
        "first_draft_pick": "David Carr",
        "all_time_pass_leader": "Matt Schaub",
        "all_time_rush_leader": "Arian Foster",
        "all_time_rec_leader": "Andre Johnson",
        "stadium": "NRG Stadium",
        "division": "AFC South",
    },
    "Indianapolis Colts": {
        "founded": 1953, "previous_city": "Baltimore",
        "super_bowls_won": 2,
        "all_time_pass_leader": "Peyton Manning",
        "all_time_rush_leader": "Edgerrin James",
        "all_time_rec_leader": "Marvin Harrison",
        "stadium": "Lucas Oil Stadium",
        "division": "AFC South",
    },
    "Jacksonville Jaguars": {
        "founded": 1995,
        "super_bowls_won": 0,
        "afc_championship_years": [1996, 1999, 2017],
        "all_time_pass_leader": "Mark Brunell",
        "all_time_rush_leader": "Fred Taylor",
        "all_time_rec_leader": "Jimmy Smith",
        "stadium": "EverBank Stadium",
        "division": "AFC South",
    },
    "Kansas City Chiefs": {
        "founded": 1960,
        "previous_names": ["Dallas Texans"],
        "super_bowls_won": 4,
        "all_time_pass_leader": "Len Dawson",
        "all_time_rush_leader": "Priest Holmes",
        "all_time_rec_leader": "Tony Gonzalez",
        "all_time_sacks_leader": "Derrick Thomas",
        "stadium": "GEHA Field at Arrowhead Stadium",
        "division": "AFC West",
    },
    "Las Vegas Raiders": {
        "founded": 1960,
        "previous_cities": ["Oakland", "Los Angeles", "Oakland", "Las Vegas"],
        "cities_count": 3,
        "super_bowls_won": 3,
        "all_time_pass_leader": "Ken Stabler",
        "all_time_rush_leader": "Marcus Allen",
        "all_time_rec_leader": "Tim Brown",
        "stadium": "Allegiant Stadium",
        "division": "AFC West",
    },
    "Los Angeles Chargers": {
        "founded": 1960,
        "super_bowls_won": 0, "super_bowl_appearances": 1,
        "all_time_pass_leader": "Philip Rivers",
        "all_time_rush_leader": "LaDainian Tomlinson",
        "all_time_rec_leader": "Antonio Gates",
        "stadium": "SoFi Stadium",
        "division": "AFC West",
    },
    "Los Angeles Rams": {
        "founded": 1936,
        "super_bowls_won": 2,
        "previous_cities": ["Cleveland", "Los Angeles", "St. Louis", "Los Angeles"],
        "all_time_pass_leader": "Jim Everett",
        "all_time_rush_leader": "Eric Dickerson",
        "all_time_rec_leader": "Isaac Bruce",
        "stadium": "SoFi Stadium",
        "division": "NFC West",
    },
    "Miami Dolphins": {
        "founded": 1966,
        "super_bowls_won": 2,
        "perfect_season": 1972, "perfect_record": "17-0",
        "all_time_pass_leader": "Dan Marino",
        "all_time_rush_leader": "Larry Csonka",
        "all_time_rec_leader": "Mark Duper",
        "stadium": "Hard Rock Stadium",
        "division": "AFC East",
    },
    "Minnesota Vikings": {
        "founded": 1961,
        "super_bowls_won": 0, "super_bowl_losses": 4,
        "all_time_pass_leader": "Fran Tarkenton",
        "all_time_rush_leader": "Adrian Peterson",
        "all_time_rec_leader": "Cris Carter",
        "defensive_nickname_70s": "Purple People Eaters",
        "stadium": "U.S. Bank Stadium",
        "division": "NFC North",
    },
    "New England Patriots": {
        "founded": 1960,
        "super_bowls_won": 6, "super_bowl_losses": 5,
        "all_time_pass_leader": "Tom Brady",
        "all_time_rush_leader": "Sam Cunningham",
        "all_time_rec_leader": "Stanley Morgan",
        "stadium": "Gillette Stadium",
        "division": "AFC East",
    },
    "New Orleans Saints": {
        "founded": 1967,
        "super_bowls_won": 1, "super_bowl_year": 2009,
        "years_before_first_playoff_win": 33,
        "fan_chant": "WHO DAT",
        "all_time_pass_leader": "Drew Brees",
        "all_time_rush_leader": "Deuce McAllister",
        "all_time_rec_leader": "Marques Colston",
        "stadium": "Caesars Superdome",
        "division": "NFC South",
    },
    "New York Giants": {
        "founded": 1925,
        "super_bowls_won": 4,
        "plays_in_state": "New Jersey",
        "all_time_pass_leader": "Eli Manning",
        "all_time_rush_leader": "Tiki Barber",
        "all_time_rec_leader": "Amani Toomer",
        "stadium": "MetLife Stadium",
        "division": "NFC East",
    },
    "New York Jets": {
        "founded": 1960,
        "super_bowls_won": 1, "super_bowl_year": 1968,
        "won_sb_before_giants": True,
        "longest_playoff_drought_years": 14,
        "all_time_pass_leader": "Joe Namath",
        "all_time_rush_leader": "Curtis Martin",
        "all_time_rec_leader": "Don Maynard",
        "stadium": "MetLife Stadium",
        "division": "AFC East",
    },
    "Philadelphia Eagles": {
        "founded": 1933,
        "super_bowls_won": 1,
        "fan_threw_snowballs_at_santa": True,
        "all_time_pass_leader": "Donovan McNabb",
        "all_time_rush_leader": "LeSean McCoy",
        "all_time_rec_leader": "Harold Carmichael",
        "stadium": "Lincoln Financial Field",
        "division": "NFC East",
    },
    "Pittsburgh Steelers": {
        "founded": 1933,
        "previous_names": ["Pittsburgh Pirates"],
        "super_bowls_won": 6,
        "all_time_pass_leader": "Ben Roethlisberger",
        "all_time_rush_leader": "Franco Harris",
        "all_time_rec_leader": "Hines Ward",
        "all_time_sacks_leader": "T.J. Watt",
        "stadium": "Acrisure Stadium",
        "division": "AFC North",
    },
    "San Francisco 49ers": {
        "founded": 1946,
        "super_bowls_won": 5,
        "all_time_pass_leader": "Joe Montana",
        "all_time_rush_leader": "Frank Gore",
        "all_time_rec_leader": "Jerry Rice",
        "stadium": "Levi's Stadium",
        "division": "NFC West",
    },
    "Seattle Seahawks": {
        "founded": 1976,
        "super_bowls_won": 1,
        "all_time_pass_leader": "Russell Wilson",
        "all_time_rush_leader": "Shaun Alexander",
        "all_time_rec_leader": "Steve Largent",
        "stadium": "Lumen Field",
        "division": "NFC West",
    },
    "Tampa Bay Buccaneers": {
        "founded": 1976,
        "super_bowls_won": 2,
        "original_division": "AFC West",
        "lost_first_26_games": True,
        "longest_losing_streak": 26,
        "all_time_pass_leader": "Jameis Winston",
        "all_time_rush_leader": "James Wilder",
        "all_time_rec_leader": "Mike Evans",
        "stadium": "Raymond James Stadium",
        "division": "NFC South",
    },
    "Tennessee Titans": {
        "founded": 1960,
        "previous_names": ["Houston Oilers", "Tennessee Oilers"],
        "previous_city": "Houston",
        "super_bowls_won": 0, "super_bowl_appearances": 1,
        "all_time_pass_leader": "Warren Moon",
        "all_time_rush_leader": "Eddie George",
        "all_time_rec_leader": "Ernest Givins",
        "stadium": "Nissan Stadium",
        "division": "AFC South",
    },
    "Washington Commanders": {
        "founded": 1932,
        "previous_names": ["Boston Braves", "Boston Redskins", "Washington Redskins", "Washington Football Team"],
        "super_bowls_won": 3,
        "all_time_pass_leader": "Joe Theismann",
        "all_time_rush_leader": "John Riggins",
        "stadium": "Northwest Stadium",
        "division": "NFC East",
    },
}


# ═══════════════════════════════════════════════════════════════
# SEASON-SPECIFIC DATA (2024, 2025 leaders and award winners)
# ═══════════════════════════════════════════════════════════════

SEASON_LEADERS = {
    2025: {
        "passing_yards": ("Matthew Stafford", 5100),
        "passing_tds": ("Matthew Stafford", 46),
        "rushing_yards": ("Jonathan Taylor", 1621),
        "rushing_tds": ("Jonathan Taylor", 14),
        "receiving_yards": ("Ja'Marr Chase", 1700),
        "receptions": ("Trey McBride", 126),
        "sacks": ("Myles Garrett", 16),
        "tackles": ("Jordyn Brooks", 180),
        "interceptions": ("Multiple", 8),
        "mvp": "Matthew Stafford",
        "opoy": "Ja'Marr Chase",
        "dpoy": "Myles Garrett",
        "oroy": "Tetairoa McMillan",
        "droy": "Carson Schwesinger",
        "coach_of_year": "Mike Vrabel",
        "comeback_player": "Joe Burrow",
    },
    2024: {
        "passing_yards": ("Joe Burrow", 4918),
        "passing_tds": ("Lamar Jackson", 41),
        "rushing_yards": ("Saquon Barkley", 2005),
        "rushing_tds": ("Derrick Henry", 16),
        "receiving_yards": ("Ja'Marr Chase", 1708),
        "receptions": ("Ja'Marr Chase", 127),
        "sacks": ("Trey Hendrickson", 17.5),
        "mvp": "Josh Allen",
        "opoy": "Saquon Barkley",
        "dpoy": "Myles Garrett",
        "oroy": "Jayden Daniels",
        "droy": "Jared Verse",
        "coach_of_year": "Kevin O'Connell",
    },
}


# ═══════════════════════════════════════════════════════════════
# SUPER BOWL DATA
# ═══════════════════════════════════════════════════════════════

SUPER_BOWLS = {
    "I": {"year": 1966, "winner": "Packers", "loser": "Chiefs", "score": "35-10"},
    "II": {"year": 1967, "winner": "Packers", "loser": "Raiders", "score": "33-14"},
    "III": {"year": 1968, "winner": "Jets", "loser": "Colts", "score": "16-7"},
    "IV": {"year": 1969, "winner": "Chiefs", "loser": "Vikings", "score": "23-7"},
    "V": {"year": 1970, "winner": "Colts", "loser": "Cowboys", "score": "16-13"},
    "XX": {"year": 1985, "winner": "Bears", "loser": "Patriots", "score": "46-10"},
    "XXXI": {"year": 1996, "winner": "Packers", "loser": "Patriots", "score": "35-21"},
    "XXXIV": {"year": 1999, "winner": "Rams", "loser": "Titans", "score": "23-16", "notable": "The Tackle"},
    "XXXVI": {"year": 2001, "winner": "Patriots", "loser": "Rams", "score": "20-17"},
    "XLI": {"year": 2006, "winner": "Colts", "loser": "Bears", "score": "29-17", "notable": "Devin Hester opening kickoff return TD"},
    "XLII": {"year": 2007, "winner": "Giants", "loser": "Patriots", "score": "17-14", "notable": "Helmet Catch"},
    "L": {"year": 2015, "winner": "Broncos", "loser": "Panthers", "score": "24-10", "notable": "Von Miller strip-sacked Cam Newton"},
    "LI": {"year": 2016, "winner": "Patriots", "loser": "Falcons", "score": "34-28 OT", "notable": "First overtime SB, 28-3 comeback", "first_ot": True},
    "LII": {"year": 2017, "winner": "Eagles", "loser": "Patriots", "score": "41-33", "notable": "Philly Special"},
}


# ═══════════════════════════════════════════════════════════════
# NFL HISTORY FACTS (for True/False, Multiple Choice)
# ═══════════════════════════════════════════════════════════════

NFL_FACTS = {
    "nfl_founded": 1920,
    "first_super_bowl_year": 1966,
    "first_ot_super_bowl": "LI",
    "32_team_expansion": "Houston Texans (2002)",
    "14_team_playoff_format_year": 2020,
    "first_outdoor_cold_sb_stadium": "MetLife Stadium",
    "sacks_became_official": 1982,
}


# ═══════════════════════════════════════════════════════════════
# REAL PLAYER NAMES (for "Which Player Was Real?" question type)
# Players with unusual/memorable names who had 50+ career snaps
# ═══════════════════════════════════════════════════════════════

REAL_UNUSUAL_PLAYERS = [
    {"name": "Ha Ha Clinton-Dix", "position": "S", "teams": ["Packers", "Washington", "Bears", "Cowboys"], "years": "2014-2020"},
    {"name": "D'Brickashaw Ferguson", "position": "OT", "teams": ["Jets"], "years": "2006-2015"},
    {"name": "Barkevious Mingo", "position": "LB", "teams": ["Browns", "Patriots", "Colts", "Seahawks", "Bears", "Falcons"], "years": "2013-2021"},
    {"name": "Manti Te'o", "position": "LB", "teams": ["Chargers", "Saints", "Bears"], "years": "2013-2020"},
    {"name": "Captain Munnerlyn", "position": "CB", "teams": ["Panthers", "Vikings"], "years": "2009-2018"},
    {"name": "Equanimeous St. Brown", "position": "WR", "teams": ["Packers", "Bears"], "years": "2018-2023"},
    {"name": "Ndamukong Suh", "position": "DT", "teams": ["Lions", "Dolphins", "Rams", "Buccaneers", "Eagles"], "years": "2010-2022"},
    {"name": "D'Ante Hightower", "position": "LB", "teams": ["Patriots"], "years": "2012-2022"},
    {"name": "Ziggy Ansah", "position": "DE", "teams": ["Lions", "Seahawks"], "years": "2013-2019"},
    {"name": "HaHa Clinton-Dix", "position": "S", "teams": ["Packers"], "years": "2014-2020"},
    {"name": "Bud Dupree", "position": "LB", "teams": ["Steelers", "Titans", "Falcons"], "years": "2015-2022"},
    {"name": "Craphonso Thorpe", "position": "WR", "teams": ["Colts"], "years": "2007-2008"},
    {"name": "Fair Hooker", "position": "WR", "teams": ["Browns"], "years": "1969-1974"},
    {"name": "Dick Butkus", "position": "LB", "teams": ["Bears"], "years": "1965-1973"},
    {"name": "Wonderful Monds", "position": "CB", "teams": ["49ers"], "years": "1974-1976"},
    {"name": "J.J. Jansen", "position": "LS", "teams": ["Panthers"], "years": "2009-2023"},
    {"name": "Booger McFarland", "position": "DT", "teams": ["Buccaneers", "Colts"], "years": "1999-2007"},
    {"name": "Pig Prather", "position": "OL", "teams": ["Packers"], "years": "1981-1985"},
    {"name": "Peerless Price", "position": "WR", "teams": ["Bills", "Falcons", "Cowboys"], "years": "1999-2005"},
    {"name": "Taco Charlton", "position": "DE", "teams": ["Cowboys", "Dolphins", "Chiefs", "Steelers"], "years": "2017-2021"},
    {"name": "BenJarvus Green-Ellis", "position": "RB", "teams": ["Patriots", "Bengals"], "years": "2008-2013"},
    {"name": "Colt McCoy", "position": "QB", "teams": ["Browns", "Washington", "Giants", "Cardinals"], "years": "2010-2023"},
    {"name": "Smoke Monday", "position": "S", "teams": ["Giants"], "years": "2022-2023"},
    {"name": "Aeneas Williams", "position": "CB", "teams": ["Cardinals", "Rams"], "years": "1991-2004"},
    {"name": "A.J. Hawk", "position": "LB", "teams": ["Packers", "Bengals", "Falcons"], "years": "2006-2015"},
    {"name": "Takkarist McKinley", "position": "DE", "teams": ["Falcons", "Browns", "Raiders"], "years": "2017-2021"},
    {"name": "Bazzel Adderley", "position": "CB", "teams": ["Packers", "Cowboys"], "years": "1961-1972"},
    {"name": "Dee Virgin", "position": "CB", "teams": ["Lions", "Texans"], "years": "2018-2020"},
    {"name": "Haha Clinton-Dix", "position": "S", "teams": ["Packers"], "years": "2014-2020"},
    {"name": "Jackrabbit Jenkins", "position": "CB", "teams": ["Rams", "Giants", "Saints", "Titans"], "years": "2012-2021"},
    {"name": "Adoree' Jackson", "position": "CB", "teams": ["Titans", "Giants"], "years": "2017-2023"},
    {"name": "Lavonte David", "position": "LB", "teams": ["Buccaneers"], "years": "2012-2024"},
    {"name": "Quinnen Williams", "position": "DT", "teams": ["Jets"], "years": "2019-present"},
    {"name": "D'Onta Foreman", "position": "RB", "teams": ["Texans", "Titans", "Panthers", "Bears", "Browns"], "years": "2017-2023"},
    {"name": "Rock Ya-Sin", "position": "CB", "teams": ["Colts", "Raiders", "Dolphins"], "years": "2019-present"},
    {"name": "Mecole Hardman", "position": "WR", "teams": ["Chiefs", "Jets"], "years": "2019-present"},
    {"name": "Quez Watkins", "position": "WR", "teams": ["Eagles", "Steelers"], "years": "2020-present"},
]

# Fake name components for generating plausible fake NFL names
FAKE_NAME_PARTS = {
    "first": [
        "Tavarius", "Dequavious", "Breshawn", "Kendarious", "Ja'Quan",
        "Trevontay", "D'Markus", "Quantrell", "Jaiveon", "Shaqavian",
        "Treshon", "La'Vondrius", "Brayquan", "Deontarius", "Kayvontez",
        "Zecharion", "Jaqwellius", "Montravius", "Dekambrian", "Rashontez",
        "Desharious", "Treqwan", "Jakorious", "Ventravian", "Quandarious",
        "Bresharius", "Tavontay", "Devontarius", "Javorius", "Tresharius",
        "Malcontavious", "Zebrion", "Quavondre", "Ja'Vontavious", "Traequan",
    ],
    "last": [
        "McThunderson", "Willowbrook", "Quartermaine", "St. Germaine", "Featherbottom",
        "Thunderclap", "Van Der Berg", "Blackenstein", "Hammersmith", "Goldsworth",
        "Pennywhistle", "Crumbleton", "Dandridge", "Butterfield", "Whistleblower",
        "Drakesworth", "Hartfordshire", "Bonecastle", "Stormbreaker", "Thundergood",
        "Crankshaw", "Bumbleton", "Winterbottom", "Fairweather", "Ashcastle",
        "Beauregard-Jones", "Picklesworth", "Wainwright III", "Stonehammer", "Brightwater",
    ],
}


# ═══════════════════════════════════════════════════════════════
# ICONIC MOMENTS & PLAYS
# ═══════════════════════════════════════════════════════════════

ICONIC_MOMENTS = [
    {"name": "The Catch", "year": 1981, "player": "Dwight Clark", "qb": "Joe Montana", "teams": "49ers vs Cowboys"},
    {"name": "Immaculate Reception", "year": 1972, "player": "Franco Harris", "teams": "Steelers vs Raiders"},
    {"name": "Beast Quake", "year": 2010, "player": "Marshawn Lynch", "teams": "Seahawks vs Saints", "type": "playoff"},
    {"name": "Philly Special", "year": 2017, "player": "Nick Foles", "teams": "Eagles vs Patriots", "type": "super_bowl", "sb": "LII"},
    {"name": "Minneapolis Miracle", "year": 2017, "player": "Stefon Diggs", "qb": "Case Keenum", "teams": "Vikings vs Saints", "type": "playoff"},
    {"name": "Helmet Catch", "year": 2007, "player": "David Tyree", "qb": "Eli Manning", "teams": "Giants vs Patriots", "type": "super_bowl"},
    {"name": "28-3 Comeback", "year": 2016, "player": "Tom Brady", "teams": "Patriots vs Falcons", "type": "super_bowl", "sb": "LI"},
    {"name": "The Tackle", "year": 1999, "player": "Kevin Dyson", "tackler": "Mike Jones", "teams": "Rams vs Titans", "type": "super_bowl"},
    {"name": "Fail Mary", "year": 2012, "teams": "Seahawks vs Packers", "notable": "Replacement referee controversial call"},
]


# ═══════════════════════════════════════════════════════════════
# COACH DATA
# ═══════════════════════════════════════════════════════════════

COACHES = [
    {"name": "Vince Lombardi", "teams": ["Packers", "Washington"], "super_bowls": 2, "win_pct": 0.738},
    {"name": "John Madden", "teams": ["Raiders"], "super_bowls": 1, "win_pct": 0.759, "min_100_games": True},
    {"name": "Bill Belichick", "teams": ["Browns", "Patriots"], "super_bowls": 6, "win_pct": 0.656},
    {"name": "Mike Ditka", "teams": ["Bears", "Saints"], "super_bowls": 1, "famous_quote": None},
    {"name": "Marv Levy", "teams": ["Chiefs", "Bills"], "super_bowls": 0, "consecutive_sb_losses": 4},
    {"name": "Mike Tomlin", "teams": ["Steelers"], "super_bowls": 1, "notable": "Tripped kick returner on sideline"},
    {"name": "Jim Mora", "teams": ["Saints", "Colts"], "famous_quote": "Playoffs?! Don't talk about playoffs!"},
    {"name": "Dennis Green", "teams": ["Vikings", "Cardinals"], "famous_quote": "They are who we thought they were!"},
    {"name": "Herm Edwards", "teams": ["Jets", "Chiefs"], "famous_quote": "You play to win the game!"},
    {"name": "Matt LaFleur", "teams": ["Packers"], "win_pct": 0.720},
    {"name": "Andy Reid", "teams": ["Eagles", "Chiefs"], "super_bowls": 3, "win_pct": 0.630},
]


# ═══════════════════════════════════════════════════════════════
# DRAFT NOTABLE PICKS
# ═══════════════════════════════════════════════════════════════

DRAFT_NOTABLES = [
    {"player": "Tom Brady", "year": 2000, "round": 6, "pick": 199, "team": "Patriots"},
    {"player": "JaMarcus Russell", "year": 2007, "round": 1, "pick": 1, "team": "Raiders", "bust": True},
    {"player": "Ryan Leaf", "year": 1998, "round": 1, "pick": 2, "team": "Chargers", "bust": True},
    {"player": "David Carr", "year": 2002, "round": 1, "pick": 1, "team": "Texans", "first_texans_pick": True},
    {"player": "Tony Mandarich", "year": 1989, "round": 1, "pick": 2, "team": "Packers", "bust": True, "notable": "Picked one spot before Barry Sanders"},
    {"player": "Eli Manning", "year": 2004, "round": 1, "pick": 1, "team": "Chargers", "traded_to": "Giants"},
    {"player": "Charles Woodson", "year": 1998, "round": 1, "pick": 4, "team": "Raiders"},
    {"player": "Russell Wilson", "year": 2012, "round": 3, "pick": 75, "team": "Seahawks", "also_drafted_by": "Colorado Rockies (MLB)"},
    {"player": "Bo Jackson", "year": 1986, "round": 1, "pick": 1, "team": "Buccaneers", "refused": True, "later_drafted_by": "Raiders (1987)"},
]


# ═══════════════════════════════════════════════════════════════
# RECORDS
# ═══════════════════════════════════════════════════════════════

RECORDS = {
    "single_season_rush_yards": {"player": "Eric Dickerson", "value": 2105, "year": 1984, "team": "Rams"},
    "single_season_pass_yards": {"player": "Peyton Manning", "value": 5477, "year": 2013, "team": "Broncos"},
    "single_season_pass_tds": {"player": "Peyton Manning", "value": 55, "year": 2013, "team": "Broncos"},
    "single_season_rec_tds": {"player": "Randy Moss", "value": 23, "year": 2007, "team": "Patriots"},
    "single_season_rush_tds": {"player": "LaDainian Tomlinson", "value": 28, "year": 2006, "team": "Chargers"},
    "single_game_rush_yards": {"player": "Adrian Peterson", "value": 296, "year": 2007, "team": "Vikings"},
    "career_pass_yards": {"player": "Tom Brady", "value": 89228},
    "career_pass_tds": {"player": "Tom Brady", "value": 649},
    "career_rush_yards": {"player": "Emmitt Smith", "value": 18355},
    "career_rush_tds": {"player": "Emmitt Smith", "value": 164},
    "career_rec_yards": {"player": "Jerry Rice", "value": 22895},
    "career_rec_tds": {"player": "Jerry Rice", "value": 197},
    "career_total_tds": {"player": "Jerry Rice", "value": 208},
    "career_receptions": {"player": "Jerry Rice", "value": 1549},
    "career_sacks": {"player": "Bruce Smith", "value": 200},
    "career_ints": {"player": "Paul Krause", "value": 81},
    "career_te_rec_tds": {"player": "Antonio Gates", "value": 116},
    "career_points_kicker": {"player": "Adam Vinatieri", "value": 2673},
    "single_game_fgs": {"player": "Rob Bironas", "value": 8, "year": 2007, "team": "Titans"},
    "most_points_season_team": {"team": "Broncos", "value": 606, "year": 2013},
    "single_season_yards_from_scrimmage": {"player": "Chris Johnson", "value": 2509, "year": 2009, "team": "Titans"},
    "career_game_winning_fgs": {"player": "Adam Vinatieri"},
    "consecutive_games_with_reception": {"player": "Jerry Rice"},
    "single_season_te_receptions": {"player": "Trey McBride", "value": 126, "year": 2025, "team": "Cardinals"},
    "longest_fg_return_td": {"player": "Antonio Cromartie", "value": 109, "year": 2007},
    "qb_td_pass_to_self": {"player": "Marcus Mariota", "year": 2015, "context": "playoff game"},
    "heaviest_player_td_pass": {"player": "Dontari Poe", "weight": 346, "team": "Chiefs"},
}


# ═══════════════════════════════════════════════════════════════
# AWARD WINNERS (for broader question generation)
# ═══════════════════════════════════════════════════════════════

MVP_WINNERS = [
    ("Patrick Mahomes", 2022), ("Patrick Mahomes", 2018),
    ("Josh Allen", 2024),
    ("Lamar Jackson", 2023), ("Lamar Jackson", 2019),
    ("Aaron Rodgers", 2021), ("Aaron Rodgers", 2020), ("Aaron Rodgers", 2014), ("Aaron Rodgers", 2011),
    ("Tom Brady", 2017), ("Tom Brady", 2010), ("Tom Brady", 2007),
    ("Matt Ryan", 2016),
    ("Cam Newton", 2015),
    ("Peyton Manning", 2013), ("Peyton Manning", 2009), ("Peyton Manning", 2008), ("Peyton Manning", 2004), ("Peyton Manning", 2003),
    ("Adrian Peterson", 2012),
    ("Brett Favre", 1997), ("Brett Favre", 1996), ("Brett Favre", 1995),
    ("Barry Sanders", 1997),  # Co-MVP with Favre
    ("Steve Young", 1992),
    ("Shaun Alexander", 2005),
    ("Mark Moseley", 1982),  # Kicker who won MVP
    ("Matthew Stafford", 2025),
]

KICKER_MVP = {"player": "Mark Moseley", "year": 1982, "team": "Washington"}
