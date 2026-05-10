"""
Franchise All-Time Leaders — scraped from footballdb.com
Review this output carefully, then merge the leaders lists
into the FRANCHISES dict in generators/nfl_data.py.
"""

FRANCHISE_LEADERS = {
    "Arizona Cardinals": {
        "pass_leaders": [("Jim Hart", 34639, 209), ("Neil Lomax", 22771, 136), ("Kyler Murray", 20460, 121), ("Jake Plummer", 17622, 90), ("Carson Palmer", 16782, 105), ("Kurt Warner", 15843, 100), ("Charley Johnson", 14928, 108)],
        "rush_leaders": [("Ottis Anderson", 7999, 46), ("Stump Mitchell", 4649, 32), ("Jim Otis", 3863, 19), ("James Conner", 3763, 38), ("Johnny Roland", 3608, 27), ("Charlie Trippi", 3506, 23), ("John David Crow", 3489, 33)],
        "rec_leaders": [("Larry Fitzgerald", 17492, 121), ("Roy Green", 8496, 66), ("Jackie Smith", 7918, 40), ("Anquan Boldin", 7520, 44), ("Pat Tilley", 7005, 37), ("Mel Gray", 6644, 45), ("Frank Sanders", 6579, 24)],
        "sack_leaders": [("Chandler Jones", 71.5), ("Freddie Joe Nunn", 66.5), ("Calais Campbell", 63.0), ("Simeon Rice", 51.5), ("Curtis Greer", 50.5), ("Ken Harvey", 47.5), ("Eric Swann", 45.5)],
    },
    "Atlanta Falcons": {
        "pass_leaders": [("Matt Ryan", 59735, 367), ("Steve Bartkowski", 23470, 154), ("Chris Miller", 14066, 87), ("Chris Chandler", 13268, 87), ("Michael Vick", 11505, 71), ("Jeff George", 8575, 50), ("Bob Berry", 8489, 57)],
        "rush_leaders": [("Gerald Riggs", 6631, 48), ("Michael Turner", 6081, 60), ("William Andrews", 5986, 30), ("Warrick Dunn", 5981, 30), ("Jamal Anderson", 5336, 34), ("Devonta Freeman", 3972, 32), ("Bijan Robinson", 3910, 25)],
        "rec_leaders": [("Julio Jones", 12896, 60), ("Roddy White", 10863, 63), ("Terance Mathis", 7349, 57), ("Alfred Jenkins", 6267, 40), ("Andre Rison", 5633, 56), ("Jim Mitchell", 4358, 28), ("Michael Haynes", 4220, 34)],
        "sack_leaders": [("John Abraham", 68.5), ("Chuck Smith", 58.5), ("Patrick Kerney", 58.0), ("Travis Hall", 41.5), ("Vic Beasley", 37.5), ("Grady Jarrett", 36.5), ("Brady Smith", 32.0)],
    },
    "Baltimore Ravens": {
        "pass_leaders": [("Joe Flacco", 38245, 212), ("Lamar Jackson", 22608, 187), ("Kyle Boller", 7846, 45), ("Vinny Testaverde", 7148, 51), ("Steve McNair", 4163, 18), ("Tony Banks", 3714, 25), ("Elvis Grbac", 3033, 15)],
        "rush_leaders": [("Jamal Lewis", 7801, 45), ("Lamar Jackson", 6522, 35), ("Ray Rice", 6180, 37), ("Derrick Henry", 3516, 32), ("Gus Edwards", 3395, 26), ("Willis McGahee", 2802, 31), ("Priest Holmes", 2102, 10)],
        "rec_leaders": [("Mark Andrews", 5952, 56), ("Derrick Mason", 5777, 29), ("Todd Heap", 5492, 41), ("Torrey Smith", 3591, 30), ("Zay Flowers", 3128, 14), ("Mark Clayton", 3116, 12), ("Ray Rice", 3034, 6)],
        "sack_leaders": [("Terrell Suggs", 132.5), ("Peter Boulware", 70.0), ("Michael McCrary", 51.0), ("Ray Lewis", 41.5), ("Adalius Thomas", 38.5), ("Elvis Dumervil", 35.5), ("Matt Judon", 34.5)],
    },
    "Buffalo Bills": {
        "pass_leaders": [("Jim Kelly", 35467, 237), ("Josh Allen", 30102, 220), ("Joe Ferguson", 27590, 181), ("Jack Kemp", 15134, 77), ("Ryan Fitzpatrick", 11654, 80), ("Drew Bledsoe", 10151, 55), ("Tyrod Taylor", 8857, 51)],
        "rush_leaders": [("Thurman Thomas", 11938, 65), ("O.J. Simpson", 10183, 57), ("Fred Jackson", 5646, 30), ("Josh Allen", 4721, 79), ("Joe Cribbs", 4445, 21), ("James Cook", 4259, 32), ("Travis Henry", 3849, 27)],
        "rec_leaders": [("Andre Reed", 13095, 86), ("Eric Moulds", 9096, 48), ("Lee Evans", 5934, 43), ("Stefon Diggs", 5372, 37), ("Elbert Dubenion", 5294, 35), ("Frank Lewis", 4638, 24), ("Thurman Thomas", 4341, 22)],
        "sack_leaders": [("Bruce Smith", 171.0), ("Aaron Schobel", 78.0), ("Phil Hansen", 61.5), ("Jerry Hughes", 53.0), ("Cornelius Bennett", 52.5), ("Kyle Williams", 48.5), ("Mario Williams", 43.0)],
    },
    "Carolina Panthers": {
        "pass_leaders": [("Cam Newton", 29725, 186), ("Jake Delhomme", 19258, 120), ("Steve Beuerlein", 12690, 86), ("Kerry Collins", 8306, 47), ("Bryce Young", 8291, 49), ("Chris Weinke", 3800, 14), ("Teddy Bridgewater", 3733, 15)],
        "rush_leaders": [("Jonathan Stewart", 7318, 51), ("DeAngelo Williams", 6846, 46), ("Cam Newton", 5036, 63), ("Christian McCaffrey", 3980, 32), ("Chuba Hubbard", 3686, 23), ("DeShaun Foster", 3336, 10), ("Tim Biakabutuka", 2530, 14)],
        "rec_leaders": [("Steve Smith", 12197, 67), ("Muhsin Muhammad", 9255, 50), ("Greg Olsen", 6463, 39), ("D.J. Moore", 5201, 21), ("Wesley Walls", 3902, 44), ("Christian McCaffrey", 3292, 18), ("Mark Carrier", 2547, 13)],
        "sack_leaders": [("Julius Peppers", 97.0), ("Charles Johnson", 67.5), ("Mike Rucker", 55.5), ("Mario Addison", 55.0), ("Brian Burns", 46.0), ("Kevin Greene", 41.5), ("Greg Hardy", 34.0)],
    },
    "Chicago Bears": {
        "pass_leaders": [("Jay Cutler", 23443, 154), ("Sid Luckman", 14686, 137), ("Jim Harbaugh", 11567, 50), ("Jim McMahon", 11203, 67), ("Mitchell Trubisky", 10609, 64), ("Erik Kramer", 10582, 63), ("Billy Wade", 9958, 68)],
        "rush_leaders": [("Walter Payton", 16726, 110), ("Matt Forte", 8602, 45), ("Neal Anderson", 6166, 51), ("Rick Casares", 5657, 49), ("Gale Sayers", 4956, 39), ("David Montgomery", 3609, 26), ("Thomas Jones", 3493, 22)],
        "rec_leaders": [("Johnny Morris", 5059, 31), ("Harlon Hill", 4616, 40), ("Alshon Jeffery", 4549, 26), ("Walter Payton", 4538, 15), ("Mike Ditka", 4503, 34), ("Curtis Conway", 4498, 31), ("Matt Forte", 4116, 19)],
        "sack_leaders": [("Richard Dent", 124.5), ("Steve McMichael", 92.5), ("Dan Hampton", 57.0), ("Alex Brown", 43.5), ("Trace Armstrong", 42.0), ("Adewale Ogunleye", 42.0), ("Brian Urlacher", 41.5)],
    },
    "Cincinnati Bengals": {
        "pass_leaders": [("Ken Anderson", 32838, 197), ("Andy Dalton", 31594, 204), ("Boomer Esiason", 27149, 187), ("Carson Palmer", 22694, 154), ("Joe Burrow", 20810, 157), ("Jeff Blake", 15134, 93), ("Jon Kitna", 10707, 59)],
        "rush_leaders": [("Corey Dillon", 8061, 45), ("James Brooks", 6447, 37), ("Joe Mixon", 6412, 49), ("Rudi Johnson", 5742, 48), ("Pete Johnson", 5421, 64), ("Cedric Benson", 4176, 21), ("Harold Green", 3727, 8)],
        "rec_leaders": [("Chad Johnson", 10783, 66), ("A.J. Green", 9430, 65), ("Isaac Curtis", 7101, 53), ("Carl Pickens", 6887, 63), ("Ja'Marr Chase", 6837, 54), ("Cris Collinsworth", 6698, 36), ("Eddie Brown", 6134, 41)],
        "sack_leaders": [("Carlos Dunlap", 82.5), ("Geno Atkins", 75.5), ("Trey Hendrickson", 61.0), ("Eddie Edwards", 47.5), ("Justin Smith", 43.5), ("Reggie Williams", 41.0), ("Michael Johnson", 40.5)],
    },
    "Cleveland Browns": {
        "pass_leaders": [("Brian Sipe", 23713, 154), ("Bernie Kosar", 21904, 116), ("Baker Mayfield", 14125, 92), ("Otto Graham", 13499, 88), ("Frank Ryan", 13361, 134), ("Tim Couch", 11131, 64), ("Bill Nelsen", 9725, 71)],
        "rush_leaders": [("Jim Brown", 12312, 106), ("Leroy Kelly", 7274, 74), ("Nick Chubb", 6843, 51), ("Mike Pruitt", 6540, 47), ("Greg Pruitt", 5496, 25), ("Kevin Mack", 5123, 46), ("Earnest Byner", 3364, 27)],
        "rec_leaders": [("Ozzie Newsome", 7980, 47), ("Ray Renfro", 5508, 50), ("Gary Collins", 5299, 70), ("Paul Warfield", 5210, 52), ("Reggie Rucker", 4953, 32), ("Webster Slaughter", 4834, 27), ("Dave Logan", 4247, 24)],
        "sack_leaders": [("Myles Garrett", 125.5), ("Clay Matthews", 62.0), ("Michael Dean Perry", 51.5), ("Rob Burnett", 40.5), ("Carl Hairston", 37.5), ("Reggie Camp", 35.0), ("Anthony Pleasant", 33.5)],
    },
    "Dallas Cowboys": {
        "pass_leaders": [("Dak Prescott", 35989, 243), ("Tony Romo", 34183, 248), ("Troy Aikman", 32942, 165), ("Roger Staubach", 22700, 153), ("Danny White", 21959, 155), ("Don Meredith", 17199, 135), ("Craig Morton", 10279, 80)],
        "rush_leaders": [("Emmitt Smith", 17162, 153), ("Tony Dorsett", 12036, 72), ("Ezekiel Elliott", 8488, 71), ("Don Perkins", 6217, 42), ("Calvin Hill", 5009, 39), ("Robert Newhouse", 4784, 31), ("DeMarco Murray", 4526, 28)],
        "rec_leaders": [("Jason Witten", 12977, 72), ("Michael Irvin", 11904, 65), ("Tony Hill", 7988, 51), ("Drew Pearson", 7822, 48), ("Dez Bryant", 7459, 73), ("CeeDee Lamb", 7416, 41), ("Bob Hayes", 7295, 71)],
        "sack_leaders": [("Demarcus Ware", 117.0), ("Jim Jeffcoat", 94.5), ("Greg Ellis", 77.0), ("Demarcus Lawrence", 61.5), ("Tony Tolbert", 59.0), ("Too Tall Jones", 57.5), ("Micah Parsons", 52.5)],
    },
    "Denver Broncos": {
        "pass_leaders": [("John Elway", 51475, 300), ("Peyton Manning", 17112, 140), ("Craig Morton", 11895, 74), ("Brian Griese", 11763, 71), ("Jake Plummer", 11631, 71), ("Jay Cutler", 9024, 54), ("Kyle Orton", 8434, 49)],
        "rush_leaders": [("Terrell Davis", 7607, 60), ("Floyd Little", 6323, 43), ("Sammy Winder", 5427, 39), ("Otis Armstrong", 4453, 25), ("Mike Anderson", 3822, 36), ("Knowshon Moreno", 3468, 26), ("John Elway", 3407, 33)],
        "rec_leaders": [("Rod Smith", 11389, 68), ("Demaryius Thomas", 9055, 60), ("Shannon Sharpe", 8439, 55), ("Lionel Taylor", 6872, 44), ("Courtland Sutton", 6357, 39), ("Ed McCaffrey", 6200, 46), ("Steve Watson", 6112, 36)],
        "sack_leaders": [("Von Miller", 110.5), ("Simon Fletcher", 97.5), ("Karl Mecklenburg", 79.0), ("Trevor Pryce", 64.0), ("Elvis Dumervil", 63.5), ("Rulon Jones", 52.5), ("Nik Bonitto", 37.0)],
    },
    "Detroit Lions": {
        "pass_leaders": [("Matthew Stafford", 45109, 282), ("Jared Goff", 21451, 149), ("Bobby Layne", 15710, 118), ("Scott Mitchell", 12647, 79), ("Greg Landry", 12451, 80), ("Gary Danielson", 11885, 69), ("Eric Hipple", 10711, 55)],
        "rush_leaders": [("Barry Sanders", 15269, 99), ("Billy Sims", 5106, 42), ("Dexter Bussey", 5105, 18), ("Altie Taylor", 4297, 24), ("Nick Pietrosante", 3933, 28), ("Jahmyr Gibbs", 3580, 39), ("James Jones", 3452, 23)],
        "rec_leaders": [("Calvin Johnson", 11619, 83), ("Herman Moore", 9174, 62), ("Johnnie Morton", 6499, 35), ("Amon-Ra St. Brown", 6252, 44), ("Brett Perriman", 5244, 25), ("Gail Cogdill", 5221, 28), ("Charlie Sanders", 4817, 31)],
        "sack_leaders": [("Robert Porcher", 95.5), ("Mike Cofer", 62.5), ("Tracy Scroggins", 60.5), ("Ezekiel Ansah", 48.0), ("William Gay", 44.5), ("Aidan Hutchinson", 43.0), ("Cliff Avril", 39.5)],
    },
    "Green Bay Packers": {
        "pass_leaders": [("Brett Favre", 61655, 442), ("Aaron Rodgers", 59055, 475), ("Bart Starr", 24718, 152), ("Lynn Dickey", 21369, 133), ("Jordan Love", 11535, 83), ("Tobin Rote", 11535, 89), ("Don Majkowski", 10870, 56)],
        "rush_leaders": [("Ahman Green", 8322, 54), ("Jim Taylor", 8207, 81), ("Aaron Jones", 5940, 45), ("John Brockington", 5024, 29), ("Tony Canadeo", 4197, 26), ("Ryan Grant", 4143, 27), ("Dorsey Levens", 3937, 28)],
        "rec_leaders": [("Donald Driver", 10137, 61), ("James Lofton", 9656, 49), ("Sterling Sharpe", 8134, 65), ("Davante Adams", 8121, 73), ("Don Hutson", 7991, 99), ("Jordy Nelson", 7848, 69), ("Boyd Dowler", 6918, 40)],
        "sack_leaders": [("Clay Matthews", 83.5), ("Kabeer Gbaja-Biamila", 74.5), ("Reggie White", 68.5), ("Tim Harris", 55.0), ("Aaron Kampman", 54.0), ("Rashan Gary", 46.5), ("Preston Smith", 44.0)],
    },
    "Houston Texans": {
        "pass_leaders": [("Matt Schaub", 23221, 124), ("Deshaun Watson", 14539, 104), ("David Carr", 13391, 59), ("C.J. Stroud", 10876, 62), ("Davis Mills", 7082, 40), ("Sage Rosenfels", 3380, 24), ("Brock Osweiler", 2957, 15)],
        "rush_leaders": [("Arian Foster", 6472, 54), ("Domanick Williams", 3195, 23), ("Lamar Miller", 2934, 13), ("Alfred Blue", 2407, 8), ("Ben Tate", 1992, 10), ("Steve Slaton", 1832, 12), ("Deshaun Watson", 1677, 17)],
        "rec_leaders": [("Andre Johnson", 13597, 64), ("DeAndre Hopkins", 8602, 54), ("Owen Daniels", 4617, 29), ("Nico Collins", 4347, 24), ("Kevin Walter", 4083, 24), ("Will Fuller", 3110, 24), ("Brandin Cooks", 2886, 15)],
        "sack_leaders": [("J.J. Watt", 101.0), ("Whitney Mercilus", 57.0), ("Mario Williams", 53.0), ("Will Anderson", 30.0), ("Jadeveon Clowney", 29.0), ("Antonio Smith", 27.5), ("Danielle Hunter", 27.0)],
    },
    "Indianapolis Colts": {
        "pass_leaders": [("Peyton Manning", 54828, 399), ("Johnny Unitas", 39768, 287), ("Andrew Luck", 23671, 171), ("Bert Jones", 17663, 122), ("Jack Trudeau", 9647, 41), ("Jeff George", 9551, 41), ("Jim Harbaugh", 8705, 49)],
        "rush_leaders": [("Edgerrin James", 9226, 64), ("Jonathan Taylor", 7598, 69), ("Lydell Mitchell", 5487, 27), ("Marshall Faulk", 5320, 42), ("Eric Dickerson", 5194, 32), ("Lenny Moore", 5174, 63), ("Tom Matte", 4646, 45)],
        "rec_leaders": [("Marvin Harrison", 14580, 128), ("Reggie Wayne", 14345, 82), ("T.Y. Hilton", 9691, 53), ("Raymond Berry", 9275, 68), ("Lenny Moore", 6039, 48), ("Jimmy Orr", 5859, 50), ("Bill Brooks", 5818, 28)],
        "sack_leaders": [("Robert Mathis", 123.0), ("Dwight Freeney", 107.5), ("Duane Bickett", 50.0), ("DeForest Buckner", 43.0), ("Donnell Thompson", 40.0), ("Chad Bratzke", 37.0), ("Jon Hand", 35.5)],
    },
    "Jacksonville Jaguars": {
        "pass_leaders": [("Mark Brunell", 25698, 144), ("Trevor Lawrence", 17822, 98), ("Blake Bortles", 17646, 103), ("David Garrard", 16003, 89), ("Byron Leftwich", 9042, 51), ("Chad Henne", 5817, 27), ("Gardner Minshew", 5530, 37)],
        "rush_leaders": [("Fred Taylor", 11271, 62), ("Maurice Jones-Drew", 8071, 68), ("Travis Etienne", 3798, 25), ("James Stewart", 2951, 33), ("Leonard Fournette", 2631, 17), ("Mark Brunell", 2219, 14), ("James Robinson", 2177, 18)],
        "rec_leaders": [("Jimmy Smith", 12287, 67), ("Keenan McCardell", 6393, 30), ("Marcedes Lewis", 4502, 33), ("Maurice Jones-Drew", 2873, 11), ("Allen Robinson", 2848, 22), ("Allen Hurns", 2669, 21), ("Kyle Brady", 2500, 13)],
        "sack_leaders": [("Joshua Hines-Allen", 61.0), ("Tony Brackens", 55.0), ("Yannick Ngakoue", 37.5), ("Joel Smeenge", 34.0), ("Calais Campbell", 31.5), ("John Henderson", 29.0), ("Kevin Hardy", 28.5)],
    },
    "Kansas City Chiefs": {
        "pass_leaders": [("Patrick Mahomes", 35939, 267), ("Len Dawson", 28507, 237), ("Trent Green", 21459, 118), ("Alex Smith", 17608, 102), ("Bill Kenney", 17277, 105), ("Steve DeBerg", 11873, 67), ("Mike Livingston", 11295, 56)],
        "rush_leaders": [("Jamaal Charles", 7260, 43), ("Priest Holmes", 6070, 76), ("Larry Johnson", 6015, 55), ("Christian Okoye", 4897, 40), ("Ed Podolak", 4451, 34), ("Abner Haynes", 3814, 39), ("Marcus Allen", 3698, 44)],
        "rec_leaders": [("Travis Kelce", 13002, 82), ("Tony Gonzalez", 10940, 76), ("Otis Taylor", 7306, 57), ("Dwayne Bowe", 7155, 44), ("Tyreek Hill", 6630, 56), ("Henry Marshall", 6545, 33), ("Carlos Carson", 6360, 33)],
        "sack_leaders": [("Derrick Thomas", 126.5), ("Tamba Hali", 89.5), ("Chris Jones", 87.5), ("Neil Smith", 85.5), ("Justin Houston", 78.5), ("Eric Hicks", 44.5), ("Jared Allen", 43.0)],
    },
    "Las Vegas Raiders": {
        "pass_leaders": [("Derek Carr", 35222, 217), ("Ken Stabler", 19078, 150), ("Rich Gannon", 17585, 114), ("Daryle Lamonica", 16655, 148), ("Jim Plunkett", 12665, 80), ("Marc Wilson", 11760, 77), ("Tom Flores", 11635, 92)],
        "rush_leaders": [("Marcus Allen", 8545, 79), ("Mark van Eeghen", 5907, 35), ("Josh Jacobs", 5545, 46), ("Clem Daniels", 5103, 30), ("Napoleon Kaufman", 4792, 12), ("Marv Hubbard", 4394, 22), ("Darren McFadden", 4247, 25)],
        "rec_leaders": [("Tim Brown", 14734, 99), ("Fred Biletnikoff", 8974, 76), ("Cliff Branch", 8685, 67), ("Todd Christensen", 5872, 41), ("Art Powell", 4491, 50), ("James Jett", 4417, 30), ("Marcus Allen", 4258, 18)],
        "sack_leaders": [("Greg Townsend", 107.5), ("Howie Long", 84.0), ("Maxx Crosby", 69.5), ("Anthony Smith", 57.5), ("Bill Pickel", 53.0), ("Khalil Mack", 40.5), ("Chester McGlockton", 39.5)],
    },
    "Los Angeles Chargers": {
        "pass_leaders": [("Philip Rivers", 59271, 397), ("Dan Fouts", 43040, 254), ("John Hadl", 26938, 201), ("Justin Herbert", 24820, 163), ("Stan Humphries", 16085, 85), ("Drew Brees", 12348, 80), ("Jack Kemp", 5996, 37)],
        "rush_leaders": [("LaDainian Tomlinson", 12490, 138), ("Paul Lowe", 4972, 38), ("Austin Ekeler", 4355, 39), ("Marion Butts", 4297, 31), ("Melvin Gordon", 4240, 36), ("Ryan Mathews", 4061, 23), ("Natrone Means", 3885, 34)],
        "rec_leaders": [("Antonio Gates", 11841, 116), ("Keenan Allen", 11307, 63), ("Lance Alworth", 9584, 81), ("Charlie Joiner", 9203, 47), ("Gary Garrison", 7533, 58), ("Kellen Winslow", 6741, 45), ("Wes Chandler", 6132, 41)],
        "sack_leaders": [("Leslie O'Neal", 105.5), ("Joey Bosa", 72.0), ("Shaun Phillips", 69.5), ("Lee Williams", 65.5), ("Melvin Ingram", 49.0), ("Junior Seau", 47.0), ("Raylee Johnson", 46.0)],
    },
    "Los Angeles Rams": {
        "pass_leaders": [("Jim Everett", 23758, 142), ("Marc Bulger", 22814, 122), ("Roman Gabriel", 22223, 154), ("Matthew Stafford", 19407, 141), ("Jared Goff", 18171, 107), ("Norm Van Brocklin", 16114, 118), ("Kurt Warner", 14447, 102)],
        "rush_leaders": [("Steven Jackson", 10135, 56), ("Eric Dickerson", 7245, 56), ("Marshall Faulk", 6959, 58), ("Lawrence McCutcheon", 6186, 23), ("Dick Bass", 5417, 34), ("Todd Gurley", 5404, 58), ("Kyren Williams", 3834, 36)],
        "rec_leaders": [("Isaac Bruce", 14109, 84), ("Torry Holt", 12660, 74), ("Henry Ellard", 9761, 48), ("Cooper Kupp", 7776, 57), ("Elroy Hirsch", 6299, 53), ("Jack Snow", 6012, 45), ("Tom Fears", 5397, 38)],
        "sack_leaders": [("Aaron Donald", 111.0), ("Leonard Little", 87.5), ("Kevin Greene", 72.5), ("Kevin Carter", 62.5), ("Robert Quinn", 62.5), ("Chris Long", 54.5), ("Gary Jeter", 45.0)],
    },
    "Miami Dolphins": {
        "pass_leaders": [("Dan Marino", 61361, 420), ("Bob Griese", 25092, 192), ("Ryan Tannehill", 20434, 123), ("Tua Tagovailoa", 18166, 120), ("Jay Fiedler", 11040, 66), ("Chad Henne", 7114, 31), ("David Woodley", 5928, 34)],
        "rush_leaders": [("Larry Csonka", 6737, 53), ("Ricky Williams", 6436, 48), ("Ronnie Brown", 4815, 36), ("Mercury Morris", 3877, 29), ("Jim Kiick", 3644, 28), ("Tony Nathan", 3543, 16), ("Abdul-Karim Al-Jabbar", 3063, 33)],
        "rec_leaders": [("Mark Duper", 8869, 59), ("Mark Clayton", 8643, 81), ("Nat Moore", 7546, 74), ("Chris Chambers", 5688, 43), ("O.J. McDuffie", 5074, 29), ("Jaylen Waddle", 5039, 26), ("Tyreek Hill", 4733, 27)],
        "sack_leaders": [("Jason Taylor", 131.0), ("Cameron Wake", 98.0), ("Jeff Cross", 59.5), ("Trace Armstrong", 56.5), ("Doug Betters", 43.5), ("Zach Sieler", 35.5), ("Joey Porter", 32.0)],
    },
    "Minnesota Vikings": {
        "pass_leaders": [("Fran Tarkenton", 33098, 239), ("Tommy Kramer", 24775, 159), ("Kirk Cousins", 23265, 171), ("Daunte Culpepper", 20162, 135), ("Wade Wilson", 12135, 66), ("Brad Johnson", 11098, 65), ("Warren Moon", 10102, 58)],
        "rush_leaders": [("Adrian Peterson", 11747, 97), ("Robert Smith", 6818, 32), ("Dalvin Cook", 5993, 47), ("Chuck Foreman", 5887, 52), ("Bill Brown", 5757, 52), ("Ted Brown", 4546, 40), ("Dave Osborn", 4320, 29)],
        "rec_leaders": [("Cris Carter", 12383, 110), ("Randy Moss", 9316, 92), ("Justin Jefferson", 8480, 42), ("Anthony Carter", 7636, 52), ("Adam Thielen", 6751, 55), ("Jake Reed", 6433, 33), ("Sammy White", 6400, 50)],
        "sack_leaders": [("John Randle", 114.0), ("Chris Doleman", 96.5), ("Danielle Hunter", 87.5), ("Jared Allen", 85.5), ("Everson Griffen", 79.5), ("Brian Robison", 60.0), ("Kevin Williams", 60.0)],
    },
    "New England Patriots": {
        "pass_leaders": [("Tom Brady", 74571, 541), ("Drew Bledsoe", 29657, 166), ("Steve Grogan", 26886, 182), ("Babe Parilli", 16747, 132), ("Tony Eason", 10732, 60), ("Jim Plunkett", 9932, 62), ("Mac Jones", 8918, 46)],
        "rush_leaders": [("Sam Cunningham", 5453, 43), ("Jim Nance", 5323, 45), ("Tony Collins", 4647, 32), ("Curtis Martin", 3799, 32), ("Rhamondre Stevenson", 3669, 28), ("Kevin Faulk", 3607, 16), ("Don Calhoun", 3391, 23)],
        "rec_leaders": [("Stanley Morgan", 10352, 67), ("Rob Gronkowski", 7861, 79), ("Wes Welker", 7459, 37), ("Julian Edelman", 6822, 36), ("Troy Brown", 6366, 31), ("Irving Fryar", 5726, 38), ("Ben Coates", 5471, 50)],
        "sack_leaders": [("Andre Tippett", 100.0), ("Willie McGinest", 78.0), ("Chris Slade", 51.0), ("Mike Vrabel", 48.0), ("Rob Ninkovich", 46.0), ("Brent Williams", 43.5), ("Richard Seymour", 39.0)],
    },
    "New Orleans Saints": {
        "pass_leaders": [("Drew Brees", 68010, 491), ("Archie Manning", 21734, 115), ("Aaron Brooks", 19156, 120), ("Bobby Hebert", 14630, 85), ("Jim Everett", 10622, 60), ("Billy Kilmer", 7490, 47), ("Dave Wilson", 6987, 36)],
        "rush_leaders": [("Alvin Kamara", 7250, 61), ("Mark Ingram", 6500, 52), ("Deuce McAllister", 6096, 49), ("George Rogers", 4267, 23), ("Dalton Hilliard", 4164, 39), ("Pierre Thomas", 3745, 28), ("Rueben Mayes", 3408, 23)],
        "rec_leaders": [("Marques Colston", 9759, 72), ("Eric Martin", 7854, 48), ("Joe Horn", 7622, 50), ("Michael Thomas", 6569, 36), ("Alvin Kamara", 4948, 25), ("Danny Abramowicz", 4875, 37), ("Jimmy Graham", 4791, 55)],
        "sack_leaders": [("Cameron Jordan", 132.0), ("Rickey Jackson", 115.0), ("Wayne Martin", 82.5), ("Pat Swilling", 76.5), ("Will Smith", 67.5), ("Frank Warren", 52.5), ("Joe Johnson", 50.5)],
    },
    "New York Giants": {
        "pass_leaders": [("Eli Manning", 57023, 366), ("Phil Simms", 33462, 199), ("Charlie Conerly", 19488, 173), ("Kerry Collins", 16875, 81), ("Daniel Jones", 14582, 70), ("Fran Tarkenton", 13905, 103), ("Y.A. Tittle", 10439, 96)],
        "rush_leaders": [("Tiki Barber", 10449, 55), ("Rodney Hampton", 6897, 49), ("Joe Morris", 5296, 48), ("Saquon Barkley", 5211, 35), ("Brandon Jacobs", 5087, 60), ("Alex Webster", 4638, 39), ("Ahmad Bradshaw", 4232, 32)],
        "rec_leaders": [("Amani Toomer", 9497, 54), ("Odell Beckham Jr.", 5476, 44), ("Frank Gifford", 5434, 43), ("Tiki Barber", 5183, 12), ("Joe Morrison", 4993, 47), ("Homer Jones", 4845, 35), ("Kyle Rote", 4797, 48)],
        "sack_leaders": [("Michael Strahan", 141.5), ("Lawrence Taylor", 132.5), ("Leonard Marshall", 79.5), ("Osi Umenyiora", 75.0), ("Keith Hamilton", 63.0), ("Justin Tuck", 60.5), ("Jason Pierre-Paul", 58.5)],
    },
    "New York Jets": {
        "pass_leaders": [("Joe Namath", 27057, 170), ("Ken O'Brien", 24386, 124), ("Richard Todd", 18241, 110), ("Chad Pennington", 13738, 82), ("Vinny Testaverde", 12497, 77), ("Mark Sanchez", 12092, 68), ("Boomer Esiason", 8478, 49)],
        "rush_leaders": [("Curtis Martin", 10302, 58), ("Freeman McNeil", 8074, 38), ("Emerson Boozer", 5135, 52), ("Matt Snell", 4285, 24), ("Johnny Hector", 4280, 41), ("John Riggins", 3880, 25), ("Thomas Jones", 3833, 28)],
        "rec_leaders": [("Don Maynard", 11732, 88), ("Wesley Walker", 8306, 71), ("Wayne Chrebet", 7365, 41), ("Al Toon", 6605, 31), ("Laveranues Coles", 5941, 37), ("George Sauer", 4965, 28), ("Mickey Shuler", 4819, 37)],
        "sack_leaders": [("Mark Gastineau", 74.0), ("Shaun Ellis", 72.5), ("John Abraham", 53.5), ("Mo Lewis", 52.5), ("Calvin Pace", 46.0), ("Muhammad Wilkerson", 44.5), ("Quinnen Williams", 40.0)],
    },
    "Philadelphia Eagles": {
        "pass_leaders": [("Donovan McNabb", 32873, 216), ("Ron Jaworski", 26963, 175), ("Randall Cunningham", 22877, 150), ("Jalen Hurts", 17891, 110), ("Carson Wentz", 16811, 113), ("Norm Snead", 15672, 111), ("Tommy Thompson", 10240, 90)],
        "rush_leaders": [("LeSean McCoy", 6792, 44), ("Wilbert Montgomery", 6538, 45), ("Brian Westbrook", 5995, 37), ("Steve Van Buren", 5860, 69), ("Duce Staley", 4807, 22), ("Randall Cunningham", 4482, 32), ("Ricky Watters", 3794, 31)],
        "rec_leaders": [("Harold Carmichael", 8978, 79), ("Pete Retzlaff", 7412, 47), ("DeSean Jackson", 6512, 35), ("Mike Quick", 6464, 61), ("Zach Ertz", 6267, 38), ("Pete Pihos", 5619, 61), ("Tommy McDonald", 5499, 66)],
        "sack_leaders": [("Reggie White", 124.0), ("Trent Cole", 85.5), ("Brandon Graham", 79.5), ("Clyde Simmons", 76.0), ("Fletcher Cox", 70.0), ("Hugh Douglas", 54.5), ("Greg Brown", 50.5)],
    },
    "Pittsburgh Steelers": {
        "pass_leaders": [("Ben Roethlisberger", 64088, 418), ("Terry Bradshaw", 27989, 212), ("Kordell Stewart", 13328, 70), ("Neil O'Donnell", 12867, 68), ("Bubby Brister", 10104, 51), ("Bobby Layne", 9030, 66), ("Jim Finks", 8622, 55)],
        "rush_leaders": [("Franco Harris", 11950, 91), ("Jerome Bettis", 10571, 78), ("Willie Parker", 5378, 24), ("Le'Veon Bell", 5336, 35), ("John Henry Johnson", 4381, 26), ("Najee Harris", 4312, 28), ("Frank Pollard", 3989, 20)],
        "rec_leaders": [("Hines Ward", 12083, 85), ("Antonio Brown", 11207, 74), ("John Stallworth", 8723, 63), ("Heath Miller", 6569, 45), ("Louis Lipps", 6018, 39), ("Lynn Swann", 5462, 51), ("Elbie Nickel", 5131, 37)],
        "sack_leaders": [("T.J. Watt", 115.0), ("Cameron Heyward", 92.0), ("James Harrison", 80.5), ("Jason Gildon", 76.5), ("Joey Porter", 60.0), ("Keith Willis", 59.0), ("LaMarr Woodley", 57.0)],
    },
    "San Francisco 49ers": {
        "pass_leaders": [("Joe Montana", 35124, 244), ("John Brodie", 31548, 214), ("Steve Young", 29907, 221), ("Jeff Garcia", 16408, 113), ("Y.A. Tittle", 16016, 108), ("Alex Smith", 14280, 81), ("Jimmy Garoppolo", 13599, 82)],
        "rush_leaders": [("Frank Gore", 11073, 64), ("Joe Perry", 7344, 50), ("Roger Craig", 7064, 50), ("Ken Willard", 5930, 45), ("Garrison Hearst", 5535, 26), ("J.D. Smith", 4370, 37), ("Hugh McElhenny", 4288, 35)],
        "rec_leaders": [("Jerry Rice", 19247, 176), ("Terrell Owens", 8572, 81), ("George Kittle", 8008, 52), ("Dwight Clark", 6750, 48), ("Gene Washington", 6664, 59), ("Billy Wilson", 5902, 49), ("Vernon Davis", 5640, 55)],
        "sack_leaders": [("Bryant Young", 89.5), ("Charles Haley", 66.5), ("Nick Bosa", 64.5), ("Ahmad Brooks", 51.5), ("Dana Stubblefield", 46.5), ("Dwaine Board", 45.0), ("Aldon Smith", 44.0)],
    },
    "Seattle Seahawks": {
        "pass_leaders": [("Russell Wilson", 37059, 292), ("Matt Hasselbeck", 29434, 174), ("Dave Krieg", 26132, 195), ("Jim Zorn", 20122, 107), ("Geno Smith", 12961, 76), ("Rick Mirer", 9094, 41), ("Jon Kitna", 7552, 49)],
        "rush_leaders": [("Shaun Alexander", 9429, 100), ("Chris Warren", 6706, 44), ("Curt Warner", 6705, 55), ("Marshawn Lynch", 6381, 58), ("Russell Wilson", 4689, 23), ("John Williams", 4579, 17), ("Ricky Watters", 4009, 22)],
        "rec_leaders": [("Steve Largent", 13089, 100), ("Tyler Lockett", 8594, 61), ("Brian Blades", 7620, 34), ("Doug Baldwin", 6563, 49), ("Darrell Jackson", 6445, 47), ("D.K. Metcalf", 6324, 48), ("Bobby Engram", 4859, 18)],
        "sack_leaders": [("Jacob Green", 97.5), ("Michael Sinclair", 73.5), ("Jeff Bryant", 63.0), ("Cortez Kennedy", 58.0), ("Chad Brown", 48.0), ("Joseph Nash", 47.5), ("Michael Bennett", 39.0)],
    },
    "Tampa Bay Buccaneers": {
        "pass_leaders": [("Jameis Winston", 19737, 121), ("Vinny Testaverde", 14820, 77), ("Tom Brady", 14643, 108), ("Josh Freeman", 13534, 80), ("Trent Dilfer", 12969, 70), ("Doug Williams", 12648, 73), ("Baker Mayfield", 12237, 95)],
        "rush_leaders": [("James Wilder", 5957, 37), ("Mike Alstott", 5088, 58), ("Warrick Dunn", 4986, 19), ("Doug Martin", 4633, 26), ("Carnell Williams", 3677, 20), ("Michael Pittman", 3362, 10), ("Reggie Cobb", 3061, 21)],
        "rec_leaders": [("Mike Evans", 13052, 108), ("Chris Godwin", 7626, 41), ("Mark Carrier", 5018, 27), ("Kevin House", 4928, 31), ("Vincent Jackson", 4326, 20), ("Jimmie Giles", 4300, 34), ("Joey Galloway", 3912, 28)],
        "sack_leaders": [("Warren Sapp", 77.0), ("Simeon Rice", 69.5), ("Gerald McCoy", 54.5), ("Shaquil Barrett", 45.0), ("Lavonte David", 42.5), ("Vita Vea", 35.0), ("Chidi Ahanotu", 34.5)],
    },
    "Tennessee Titans": {
        "pass_leaders": [("Warren Moon", 33685, 196), ("Steve McNair", 27141, 156), ("George Blanda", 19149, 165), ("Dan Pastorini", 16864, 96), ("Ryan Tannehill", 14447, 93), ("Marcus Mariota", 13207, 76), ("Vince Young", 8098, 42)],
        "rush_leaders": [("Eddie George", 10009, 64), ("Derrick Henry", 9502, 90), ("Earl Campbell", 8574, 73), ("Chris Johnson", 7965, 50), ("Lorenzo White", 4079, 29), ("Hoyle Granger", 3514, 18), ("Steve McNair", 3439, 36)],
        "rec_leaders": [("Ernest Givins", 7935, 46), ("Drew Hill", 7477, 47), ("Ken Burrough", 6906, 47), ("Charley Hennigan", 6823, 51), ("Haywood Jeffires", 6119, 47), ("Derrick Mason", 6114, 37), ("Frank Wycheck", 4958, 27)],
        "sack_leaders": [("Ray Childress", 75.5), ("William Fuller", 59.0), ("Sean Jones", 57.5), ("Jevon Kearse", 52.0), ("Jurrell Casey", 51.0), ("Harold Landry", 50.5), ("Derrick Morgan", 44.5)],
    },
    "Washington Commanders": {
        "pass_leaders": [("Joe Theismann", 25206, 160), ("Sonny Jurgensen", 22585, 179), ("Sammy Baugh", 21886, 187), ("Kirk Cousins", 16206, 99), ("Mark Rypien", 15928, 101), ("Billy Kilmer", 12352, 103), ("Jason Campbell", 10860, 55)],
        "rush_leaders": [("John Riggins", 7472, 79), ("Clinton Portis", 6824, 46), ("Larry Brown", 5875, 35), ("Stephen Davis", 5790, 45), ("Alfred Morris", 4713, 29), ("Terry Allen", 4086, 37), ("Earnest Byner", 3950, 25)],
        "rec_leaders": [("Art Monk", 12026, 65), ("Charley Taylor", 9110, 79), ("Gary Clark", 8742, 58), ("Santana Moss", 7867, 47), ("Terry McLaurin", 6961, 41), ("Bobby Mitchell", 6492, 49), ("Ricky Sanders", 5854, 36)],
        "sack_leaders": [("Ryan Kerrigan", 95.5), ("Dexter Manley", 91.0), ("Charles Mann", 82.0), ("Monte Coleman", 43.5), ("Jonathan Allen", 42.0), ("Ken Harvey", 41.5), ("Brian Orakpo", 40.0)],
    },
}