
// Exactly 5 questions per date. Each: { question, choices[4], answer(0..3), explanation? }
export const CALENDAR = {
  "2025-12-25": { //Thursday
    event: "Christmas",
    questions: [
    { question: "Which player had 6 TDs on Christmas Day 2020?", choices: ["Irv Smith Jr.", "Dalvin Cook", "Davante Adams", "Alvin Kamara"], answer: 3 },
    { question: "Which player famously celebrated a TD by sitting in a Salvation Army red kettle?", choices: ["Dak Prescott", "Odell Beckham Jr.", "Ezekiel Elliott", "Antonio Brown"], answer: 2 },
    { question: "True or False: There has never been a Christmas Day playoff game.", choices: ["True", "False"], answer: 1 },
    { question: "True or False: The Longest Game in NFL History was played on Christmas Day", choices: ["True", "False"], answer: 0 },
    { question: "Who won the first ever Christmas Game (Also the Longest Game in NFL History) in 1971?", choices: ["Chiefs", "Vikings", "Dolphins", "Cowboys"], answer: 2 },
    ],
  },
  "2025-12-26": { //Friday
    event: "",
    questions: [
    { question: "Which coach has the most career wins without a Super Bowl victory?", choices: ["Bud Grant", "Marty Schottenheimer", "Paul Brown", "George Allen"], answer: 1 },
    { question: "Which stadium has hosted the most Super Bowls?", choices: ["Caesars Superdome", "Rose Bowl", "Hard Rock Stadium", "AT&T Stadium"], answer: 0 },
    { question: "Who was the last non-QB to be drafted #1 overall?", choices: ["Myles Garrett", "Aidan Hutchinson", "Derek Stingley Jr", "Travon Walker"], answer: 3 },
    { question: "Which team has the most Rushing Yards this season?", choices: ["Colts", "Bears", "Bills", "Ravens"], answer: 2 },
    { question: "Which team has committed the most penalties per game this season?", choices: ["Broncos", "Titans", "Cowboys", "Bears"], answer: 1 },
    ],
  },
  "2025-12-27": { //Saturday
    event: "college",
    questions: [
    { question: "Which school has produced the most Heisman Trophy winners?", choices: ["USC", "Ohio St", "Oklahoma", "Notre Dame"], answer: 0 },
    { question: "Who holds the single-season record for most passing yards in college football?", choices: ["Case Keenum", "Joe Burrow", "Tim Tebow", "Bailey Zappe"], answer: 3 },
    { question: "What is the oldest rivalry in college football?", choices: ["South Dakota - South Dakota St.", "Yale - Princeton", "North Dakota St - Alabama", "Princeton - Harvard"], answer: 1 },
    { question: "Which team has the most Rushing Yards this season?", choices: ["Colts", "Bears", "Bills", "Ravens"], answer: 2 },
    { question: "Who has the most career receiving yards in FBS history?", choices: ["James Washington", "Zay Jones", "Trevor Insley", "Corey Davis"], answer: 3 },
    ],
  },
  "2025-12-28": { //Sunday
    event: "",
    questions: [
    { question: "True or False: The Packers were eliminated from the Playoffs following their loss to Baltimore", choices: ["True", "False (but it felt like it)"], answer: 1 },
    { question: "Which AFC division has it's winner CLINCHED (before Sundays Games)", choices: ["AFC West", "AFC East", "AFC South", "AFC North"], answer: 0 },
    { question: "Myles Garrett has a chance to break *this* record in Week 17", choices: ["Career Interceptions for a DE", "Career Sacks", "Single Season Sacks", "Browns All-Time Sack Leader"], answer: 2 },
    { question: "True or False: All the NFC Playoff Teams are SET heading into Week 17", choices: ["True", "False"], answer: 1 },
    { question: "Which team hasn't won their Division since 2018, but has now won in 2025?", choices: ["Broncos", "Patriots", "Bears", "Jaguars"], answer: 2 },
    ],
  },
  "2025-12-29": { //Monday
    event: "",
    questions: [
    { question: "Who holds the record for most career games played?", choices: ["Morten Andersen", "Tom Brady", "Jerry Rice", "Jeff Feagles"], answer: 0 },
    { question: "Who leads the San Francisco 49ers in career rushing yards?", choices: ["Steve Young", "Roger Craig", "Frank Gore", "Christian McCaffrey"], answer: 2 },
    { question: "True or False: A touchdown is worth 7 points.", choices: ["True", "False"], answer: 1 },
    { question: "What team has the highest scoring offense this season (PPG)?", choices: ["Bills", "Seahawks", "Cowboys", "Rams"], answer: 3 },
    { question: "Which player has fumbled the most this season (Not only lost fumbles)", choices: ["Derrick Henry", "Josh Allen", "Caleb Williams", "Tua Tagovailoa"], answer: 2 },
    ],
  },
  "2025-12-30": { //Tuesday
    event: "",
    questions: [
    { question: "Which was ACTUALLY St. Louis' first NFL team?", choices: ["Rams", "Cardinals", "Staleys", "All-Stars"], answer: 3 },
    { question: "Who is the Washington Commanders' all-time leading rusher?", choices: ["Clinton Portis", "John Riggins", "Alfred Morris", "Brian Robinson Jr"], answer: 1 },
    { question: "Which kicker has made the most field goals this season?", choices: ["Ka'imi Fairbairn", "Cameron Dicker", "Will Reichard", "Jason Myers"], answer: 0 },
    { question: "Which player has the most Career Fumble Recoveries?", choices: ["Russell Wilson", "Tom Brady", "Boomer Esiason", "Warren Moon"], answer: 3 },
    { question: "Which active player has the most Career Rushing TDs", choices: ["Derrick Henry", "Josh Allen", "Jalen Hurts", "Josh Jacobs"], answer: 0 },
    ],
  },
  "2025-12-31": { //Wednesday
    event: "",
    questions: [
    { question: "Who was the first quarterback to win MVP unanimously?", choices: ["Lamar Jackson", "Emmitt Smith", "Tom Brady", "Cam Newton"], answer: 2 },
    { question: "Which quarterback has the highest career passer rating (minimum 1,500 attempts)?", choices: ["Patrick Mahomes", "Aaron Rodgers", "Lamar Jackson", "Russell Wilson"], answer: 1 },
    { question: "Who leads the Patriots in receiving yards this season?", choices: ["Stefon Diggs", "Kayshon Boutte", "Hunter Henry", "Mack Hollins"], answer: 0 },
    { question: "Which AFC North team has the longest Playoff Win drought?", choices: ["Ravens", "Browns", "Steelers", "Bengals"], answer: 2 },
    { question: "Who is the Baltimore Ravens' all-time leading rusher?", choices: ["Ray Rice", "Lamar Jackson", "Priest Homles", "Jamal Lewis"], answer: 3 },
    ],
  },
  "2026-01-01": { //Thursday
    event: "NYE",
    questions: [
    { question: "Who is the Cleveland Browns' all-time leading passer?", choices: ["Brian Sipe", "Baker Mayfield", "Otto Graham", "Tim Couch"], answer: 0 },
    { question: "True or False: The Rams were in St. Louis before returning to Los Angeles.", choices: ["True", "False"], answer: 0 },
    { question: "Guess the Career:\n18,355 Rush Yards\n164 TDs\n22 Fumbles Lost", choices: ["LaDainian Tomlinson", "Derrick Henry", "Emmitt Smith", "Adrian Peterson"], answer: 2 },
    { question: "Who led the Steelers in receiving yards last season?", choices: ["Pat Freiermith", "Juju Smith-Schuester", "Calvin Austin III", "George Pickens"], answer: 3 },
    { question: "Who leads all tight ends in receiving yards this season?", choices: ["Brock Bowers", "Trey McBride", "Travis Kelce", "Tyler Warren"], answer: 1 },
    ],
  },
  "2026-01-02": { //Friday
    event: "",
    questions: [
    { question: "Who is the Green Bay Packers' all-time leading rusher?", choices: ["Aaron Jones", "Jim Taylor", "Ryan Grant", "Ahman Green"], answer: 3 },
    { question: "True or False: The Buffalo Bills won four consecutive Super Bowls.", choices: ["True", "False"], answer: 1 },
    { question: "Which Super Bowl was the first to go into overtime?", choices: ["Steelers - Cowboys (1976)", "Patriots - Falcons (2016)", "Chiefs - 49ers (2023)", "Ravens - 49ers (2013)"], answer: 1 },
    { question: "What was the Jets' original name in the AFL?", choices: ["Titans", "Football Yankees", "Crashers", "Crimson-Giants"], answer: 0 },
    { question: "Which team has the highest-scoring offense this season?", choices: ["Cowboys", "Bills", "Rams", "Seahawks"], answer: 2 },
    ],
  },
  "2026-01-03": { //Saturday
    event: "college",
    questions: [
    { question: "Which of the 4 remaining CFP Teams have won a National Championship most recently?", choices: ["Indiana", "Ole Miss", "Oregon", "Miami"], answer: 3 },
    { question: "Who won the 2025 Heisman Trophy, becoming his school's first-ever winner?", choices: ["Dante Moore", "Fernando Mendoza", "Carson Beck", "Trinidad Chambliss"], answer: 1 },
    { question: "How long was Indiana's losing streak to Ohio St.?", choices: ["29 Games", "12 Games", "26 Games", "22 Games"], answer: 0 },
    { question: "What did Indiana coach Curt Cignetti famously say at his introductory press conference?", choices: ["'Hoosiers to the Natty, Bruh!'", "'Hoo-Hoo-Hoo-HOOSIERS'", "'I win. Google Me.'", "'Indiana is BACK!'"], answer: 2 },
    { question: "Oregon last played in a National Championship in the 2014-15 Season.\nWho did they face?", choices: ["Clemson", "Ohio St.", "Alabama", "LSU"], answer: 1 },
    ],
  },
  "2026-01-04": { //Sunday
    event: "",
    questions: [
    { question: "STEELERS vs RAVENS!\n4 of the last 6 MVPs were won by Aaron Rodgers and Lamar Jackson.\nWhich QB has more playoff wins in that stretch?", choices: ["Aaron Rodgers", "Lamar Jackson"], answer: 1 },
    { question: "Which NFC South Team has the longest Playoff Appearance Drought?", choices: ["Falcons", "Panthers", "Saints", "Buccaneers"], answer: 1 },
    { question: "True or False: Neither of Last Year's #1 Seeds are in the playoffs", choices: ["True", "False"], answer: 0 },
    { question: "Which team is NOT in play for the AFC's #1 Seed?", choices: ["Jaguars", "Patriots", "Broncos", "Bills"], answer: 3 },
    { question: "Who won Coach of the Year last season?", choices: ["Dan Campbell", "Kevin O'Connell", "Dan Quinn", "Sean Payton"], answer: 1 },
    ],
  },
  "2026-01-05": { //Monday
    event: "2025Wrapped",
    questions: [
    { question: "Who led the league in Completion % (min. 100 Att.)", choices: ["Brock Purdy", "Jared Goff", "Sam Darnold", "Drake Maye"], answer: 3 },
    { question: "Which defense forced the most Turnovers in 2025?", choices: ["Jaguars", "Bears", "Steelers", "Texans"], answer: 1 },
    { question: "Which player had the most tackles?", choices: ["Jordyn Brooks", "Bobby Wagner", "Devin White", "Nick Bolton"], answer: 0 },
    { question: "True or False: Josh Allen had the most Fantasy Points in 2025 (PPR)", choices: ["True", "False"], answer: 1 },
    { question: "Which RB was this in 2025?\n- 1,478 Rush Yards\n- 11 Total TDs\n- 5.3 Y/A\n- 93yd Longest Rush", choices: ["Derrick Henry", "Jonathan Taylor", "Bijan Robinson", "Christian McCaffrey"], answer: 2 },
    ],
  },
  "2026-01-06": { //Tuesday
    event: "2025Wrapped",
    questions: [
    { question: "Which Standout Rookie was this?\n- 817 Rec Yards\n- 76 Receptions\n- 4 Rec TDs\n- 1 Rush TD", choices: ["Tyler Warren", "Emeka Egbuka", "Harold Fannin", "Woody Marks"], answer: 0 },
    { question: "How many Interceptions did the NY Jets get this season?", choices: ["0", "2", "7", "11"], answer: 0 },
    { question: "Which stat did Davante Adams lead the league in?", choices: ["Yards After Catch", "Receiving TDs", "Receiving Yards", "Receptions"], answer: 1 },
    { question: "Who set the record for Longest FG in NFL History?", choices: ["Brandon Aubrey", "Chase McLaughlin", "Cam Little", "Will Reichard"], answer: 2 },
    { question: "Who was the only team to go undefeated on the road in 2025?", choices: ["Patriots", "49ers", "Broncos", "Seahawks"], answer: 0 },
    ],
  },
  "2026-01-07": { //Wednesday
    event: "RamsPanthers",
    questions: [
    { question: "True or False:\nThis is the first Playoff meeting between the Panthers and Rams.", choices: ["True", "False"], answer: 1 },
    { question: "What year did the Carolina Panthers enter the NFL as an expansion franchise?", choices: ["1992", "2001", "1999", "1995"], answer: 3 },
    { question: "Who is the All-Time leading Passer in Panthers history?", choices: ["Chris Weinke", "Jake Delhomme", "Cam Newton", "Steve Beurelein"], answer: 2 },
    { question: "Which team leads the All-Time series?", choices: ["Panthers", "Rams"], answer: 0 },
    { question: "The only previous Playoff meeting was a 2x Overtime Thriller\n\nWhat season did the Panthers beat the Rams on a Steve Smith walk-off TD?", choices: ["2010", "2007", "2005", "2003"], answer: 3 },
    ],
  },
    "2026-01-08": { //Thursday
    event: "BillsJaguars",
    questions: [
    { question: "The Bills and Jaguars have met twice in the playoffs. Which team leads the other 2-0?", choices: ["Bills", "Jaguars"], answer: 1 },
    { question: "The Bills haven't won a road playoff game since what season?", choices: ["2022", "2023", "2001", "1992"], answer: 3 },
    { question: "Josh Allen vs Trevor Lawrence: Who has won more of their head-to-head matchups?", choices: ["3-0 (Allen undefeated)", "2-1 (Lawrence leads)", "2-1 (Allen leads)", "0-3 (Allen winless)"], answer: 1 },
    { question: "Jacksonville entered the 2026 playoffs riding a massive winning streak. How many consecutive games did the Jaguars win to end the regular season?", choices: ["8", "6", "10", "7"], answer: 0 },
    { question: "James Cook led the league in rushing in 2025 with 1,621 yards. Who was the last Bills RB to lead the league in rushing?", choices: ["Thurman Thomas", "Cookie Gilchrist", "O.J. Simpson", "Fred Jackson"], answer: 2 },
    ],
  },
    "2026-01-09": { //Friday
    event: "49ersEagles",
    questions: [
    { question: "These NFC Staples have a long history... Who leads the all-time series INCLUDING Playoffs?", choices: ["49ers", "Eagles"], answer: 0 },
    { question: "In the 2022/23 NFC Championship, who played most of the QB Snaps for the 49ers following Purdy's injury?", choices: ["Deebo Samuel", "Jimmy Garoppolo", "Christian McCaffrey", "Josh Johnson"], answer: 3 },
    { question: "Who has more Super Bowl Appearances since the turn of the century (2000)", choices: ["49ers", "Eagles"], answer: 1 },
    { question: "How many Super Bowl championships has each franchise won all-time?", choices: ["49ers 5, Eagles 2", "49ers 6, Eagles 1", "49ers 4, Eagles 2", "Both have 3"], answer: 0 },
    { question: "Between both teams, who had the most receiving yards this season?", choices: ["Jauan Jennings", "DeVonta Smith", "Christian McCaffrey", "AJ Brown"], answer: 1 },
    ],
  },
    "2026-01-10": { //Saturday
    event: "PackersBears",
    questions: [
    { question: "The Packers and Bears have faced each other twice in the playoffs.\nWhat year did the Bears last win a playoff game against Green Bay?", choices: ["1994", "1985", "1941", "1923"], answer: 2 },
    { question: "True or False: The Bears FINALLY have a 4,000 Yard single season passer!", choices: ["True", "False"], answer: 1 },
    { question: "Between both teams, which player finished the 2025 regular season with the most receiving yards?", choices: ["Christian Watson", "DJ Moore", "Rome Odunze", "Romeo Doubs"], answer: 3 },
    { question: "Which team has more playoff wins during the Super Bowl Era?", choices: ["Bears", "Packers"], answer: 1 },
    { question: "Which Bears QB has the most Single Season Passing Yards in Franchise History?", choices: ["Caleb Williams", "Jay Cutler", "Sid Luckman", "Erik Kramer"], answer: 0 },
    ],
  },
    "2026-01-11": { //Sunday
    event: "ChargersPatriots",
    questions: [
    { question: "Drake Maye is among the MVP frontrunners in 2025. How many passing touchdowns has Maye thrown this season?", choices: ["29", "31", "34", "38"], answer: 1 },
    { question: "Chargers and Patriots met in the 2007 AFC Championship...\nWhat injury was Philip Rivers playing through?", choices: ["AC Joint Sprain", "Broken Foot", "Torn ACL", "Bulging Disc"], answer: 2 },
    { question: "The Patriots hold a 6-2 Playoff Record over the Chargers. What season did they most recently beat the Chargers?", choices: ["2007", "2009", "2015", "2018"], answer: 3 },
    { question: "Which Player leads the AFC in Passing Yards?", choices: ["Bo Nix", "Drake Maye", "Justin Herbert", "Josh Allen"], answer: 1 },
    { question: "Who forced the infamous fumble on Chargers' Marlon McCree after his interception of Tom Brady in the 2006 AFC Divisional Game?", choices: ["Jabar Gafney", "Mike Vrabel", "Troy Brown", "Kevin Faulk"], answer: 2 },
    ],
  },
    "2026-01-12": { //Monday
    event: "SteelersTexans",
    questions: [
    { question: "In their first ever meeting in 2002, the expansion Texans beat the Steelers with how many total yards of offense?", choices: ["47", "93", "159", "184"], answer: 0 },
    { question: "What is the Steelers' all-time record against the Texans (including playoffs)?", choices: ["3-5", "5-3", "6-2", "4-4"], answer: 1 },
    { question: "What year was the last time these teams met in the playoffs?", choices: ["2008", "2010", "2019", "Never"], answer: 3 },
    { question: "True or False: Mike Tomlin has never finished with a losing record", choices: ["True", "False"], answer: 0 },
    { question: "The Steelers are hosting their first playoff game since 2020. When was the last time they won a playoff a game?", choices: ["2020", "2019", "2016", "2014"], answer: 2 },
    ],
  },
    "2026-01-13": { //Tuesday
    event: "",
    questions: [
    { question: "Who has the most playoff wins of these QBs?", choices: ["Baker Mayfield", "Tua Tagovailoa", "Jordan Love", "Trevor Lawrence"], answer: 0 },
    { question: "Guess the QB based off their Playoff Career:\n- 8 Pass TDs\n- 3 INTs\n- 1,605 Yards\n- 61.9 Comp.%\n- 93.8 Rating?\n- 5 QB Wins", choices: ["Jalen Hurts", "Joe Burrow", "Brock Purdy", "Jared Goff"], answer: 2 },
    { question: "True or False: Josh Allen has the most Playoff wins of any QB left in the playoffs.", choices: ["True", "False"], answer: 0 },
    { question: "'Beast Quake' refers to a playoff run by which player?", choices: ["Derrick Henry", "Marshawn Lynch", "Adrian Peterson", "Shaun Alexander"], answer: 1 },
    { question: "Of the remaining teams, who had the most Rushing TDs in the 2025 Regular Season?", choices: ["Patriots", "Bears", "Seahawks", "Bills"], answer: 3 },
    ],
  },
    "2026-01-14": { //Wednesday
    event: "",
    questions: [
    { question: "Guess the WR in 2025:\n- 789 Yards\n- 14 TDs\n- 60 Rec", choices: ["Rashid Shaheed", "Stefon Diggs", "Davante Adams", "Jauan Jennings"], answer: 2 },
    { question: "Who led 2025 in Tackles for Loss?", choices: ["Will Anderson", "Maxx Crosby", "Brian Burns", "Myles Garrett"], answer: 3 },
    { question: "Who led the Broncos in receiving yards this season?", choices: ["Troy Franklin", "Courtland Sutton", "RJ Harvey", "Evan Engram"], answer: 1 },
    { question: "True or False: The Seahawks allowed the least amount of points in 2025", choices: ["True", "False"], answer: 0 },
    { question: "Who threw Stefon Diggs the game winning TD over the Saints in the 2017 Playoffs?", choices: ["Teddy Bridgewater", "Case Keenum", "Kirk Cousins", "Ryan Fitzpatrick"], answer: 1 },
    ],
  },
    "2026-01-15": { //Thursday
    event: "BillsBroncos",
    questions: [
    { question: "Who leads the all-time playoff series between the Bills and Broncos?", choices: ["Broncos", "Bills"], answer: 1 },
    { question: "Who were the Broncos playing in the 1986 AFC Championship when John Elway orchestrated “The Drive”?", choices: ["Bills", "Seahawks", "Steelers", "Browns"], answer: 3 },
    { question: "The Bills went to four straight Super Bowls. Which team did they face in Super Bowl XXVII (Jan 30th, 1994)?", choices: ["Redskins", "Cowboys", "49ers", "Packers"], answer: 1 },
    { question: "Which Bills QB led them to four straight Super Bowl appearances?", choices: ["Jim Kelly", "Doug Flutie", "Drew Bledsoe", "Joe Ferguson"], answer: 0 },
    { question: "Between both teams, which defender came away with the most interceptions in 2025?", choices: ["JaQuan McMillian", "Cole Bishop", "AJ Epenesa", "Pat Surtain II"], answer: 1 },
    ],
  },
    "2026-01-16": { //Friday
    event: "49ersSeahawks",
    questions: [
    { question: "The 49ers and Seahawks rivalry is one of the NFL's most intense. Which team leads the all-time series INCLUDING playoffs?", choices: ["Seahawks", "49ers"], answer: 0 },
    { question: "True or False: The Seahawks have never won a playoff game at Levi's Stadium.", choices: ["True", "False"], answer: 0 },
    { question: "Who is the 49ers' all-time leading rusher?", choices: ["Christian McCaffrey", "Joe Perry", "Frank Gore", "Roger Craig"], answer: 2 },
    { question: "The 49ers and Seahawks met in the 2013 NFC Championship Game.\nWho tipped the game-sealing interception intended for Michael Crabtree?", choices: ["Kam Chancellor", "Richard Sherman", "Earl Thomas", "Bobby Wagner"], answer: 1 },
    { question: "Who has the most Receiving Yards in Post-Season Career history?", choices: ["Steve Largent", "Jerry Rice", "Tyler Lockett", "Travis Kelce"], answer: 1 },
    ],
  },
    "2026-01-17": { //Saturday
    event: "TexansPatriots",
    questions: [
    { question: "What year did the Houston Texans enter the NFL as an expansion franchise?", choices: ["1995", "2000", "2001", "2002",], answer: 3 },
    { question: "True or False: The Texans have never beaten the Patriots in a playoff game.", choices: ["True", "False"], answer: 0 },
    { question: "How many Super Bowls have the Patriots gone to as a Franchise?", choices: ["8", "9", "10", "11"], answer: 3 },
    { question: "Between both teams, who led the NFL in receiving yards during the 2025 regular season?", choices: ["Stefon Diggs", "Nico Collins", "Dalton Schultz", "Kayshon Boutte"], answer: 1 },
    { question: "How many division titles did the Patriots win during their dynasty run from 2001–2019?", choices: ["12", "14", "17", "19"], answer: 2 },
    ],
  },
    "2026-01-18": { //Sunday
    event: "RamsBears",
    questions: [
    { question: "Who leads the all-time playoff series between the Rams and Bears?", choices: ["Rams", "Bears", "Never Played in the Playoffs", "Tied",], answer: 3 },
    { question: "The Bears won Super Bowl XX in dominant fashion. Who was their head coach during that championship season?", choices: ["Dick Butkus", "George Halas", "Mike Ditka", "Buddy Ryan"], answer: 2 },
    { question: "The Rams originally began their franchise in which city?", choices: ["Los Angeles", "Cleveland", "St. Louis", "Chicago"], answer: 1 },
    { question: "Between both teams, which player had the most sacks in 2025?", choices: ["Byron Young", "Montez Sweat", "Jared Verse", "Austin Booker"], answer: 0 },
    { question: "What season did the Rams win their first ever Super Bowl?", choices: ["1980", "1999", "2001", "2021"], answer: 1 },
    ],
  },
    "2026-01-19": { //Monday
    event: "",
    questions: [
    { question: "Who is the Arizona Cardinals' all-time leading passer?", choices: ["Kyler Murray", "Jake Plummer", "Jim Hart", "Kurt Warner",], answer: 2 },
    { question: "Who was the last running back to win NFL MVP?", choices: ["Jonathan Taylor", "Adrian Peterson", "LaDainian Tomlinson", "Shaun Alexander"], answer: 1 },
    { question: "Which kicker has made the most field goals in 2025?", choices: ["Kaimi Fairbairn", "Will Reichard", "Cameron Dicker", "Jason Myers"], answer: 0 },
    { question: "How many Rush TDs did Jalen Hurts have in 2025?", choices: ["3", "8", "11", "13"], answer: 1 },
    { question: "What city do the NY Giants/Jets play their home games?", choices: ["Manhattan, NY", "New York City, NY", "East Rutherford, NJ", "Brooklyn, NY"], answer: 2 },
    ],
  },
};


export const POOL = [
  { question: "Mile High team?", choices:["Broncos","Bills","Bears","Bengals"], answer:0 }
];
