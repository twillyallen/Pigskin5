
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
    "2026-01-20": { //Tuesday
    event: "",
    questions: [
    { question: "Which two teams are tied for the most Super Bowl losses?", choices: ["Broncos & Patriots", "Patriots & Bills", "Broncos & Bills", "Vikings & Patriots",], answer: 0 },
    { question: "Name the WR Career:\n17,492 Yards\n121 TDs\n41 Tackles\n29 Dropped Passes", choices: ["Terrell Owens", "Larry Fitzgerald", "Isaac Bruce", "Reggie Wayne"], answer: 1 },
    { question: "How many MVP Votes does Russell Wilson have in his Legendary Career?", choices: ["37", "0", "7", "24"], answer: 1 },
    { question: "Of these players, who had the most Rec. TDs this Post Season?", choices: ["Luther Burden III", "AJ Brown", "Courtland Sutton", "Matthew Golden"], answer: 3 },
    { question: "True or False: Caleb 'ICEMAN' Williams has a career playoff Comp. % of more then 53%?", choices: ["True", "False"], answer: 1 },
    ],
  },
    "2026-01-21": { //Wednesday
    event: "",
    questions: [
    { question: "Which NFL player once celebrated a TD by putting a cell phone under the goalpost?", choices: ["Terrell Owens", "Chad Johnson", "Randy Moss", "Joe Horn"], answer: 3 },
    { question: "Who has the best Pass TD-INT ratio in the 2025-26 Post Season?", choices: ["Bo Nix", "Matthew Stafford", "Jordan Love", "Josh Allen"], answer: 2 },
    { question: "What was the original location and name of the Kansas City Chiefs franchise?", choices: ["Dallas Texans", "Missouri Warriors", "Kansas Reds", "Chicago Hard-Hitters"], answer: 0 },
    { question: "Which pass catcher has the most career playoff TD receptions?", choices: ["Jerry Rice", "Rob Gronkowski", "Randy Moss", "Travis Kelce"], answer: 0 },
    { question: "Which team has ZERO takeaways this Post Season despite having the MOST takeaways in the Regular Season", choices: ["49ers", "Bears", "Chargers", "Panthers"], answer: 1 },
    ],
  },
    "2026-01-22": { //Thursday
    event: "",
    questions: [
    { question: "Which player NEVER won League MVP AND the Super Bowl in the same season?", choices: ["Patrick Mahomes", "Tom Brady", "Emmitt Smith", "Joe Montana"], answer: 1 }, 
    { question: "Which team has had the most 1st Overall Draft Picks?", choices: ["Colts", "Browns", "Buccaneers", "Bengals"], answer: 0 },
    { question: "Who had the most Yards After Catch in 2025?", choices: ["Puka Nacua", "JaMarr Chase", "Trey McBride", "Bijan Robinson"], answer: 3 },
    { question: "Which wide receiver caught the “Mile-High Miracle” in the 2012 playoffs?", choices: ["Torrey Smith", "Demaryius Thomas", "Anquan Boldin", "Jacoby Jones"], answer: 3 },
    { question: "Name the QBs Playoff Career:\n18 Games\n5,366 Yards\n37 TDs\n9-9 Playoff Record", choices: ["Aaron Rodgers", "Drew Brees", "Philip Rivers", "Josh Allen"], answer: 1 },
    ],
  },
    "2026-01-23": { //Friday
    event: "ConferenceChampionship",
    questions: [
    { question: "Who has more Conference Championship Appearances among these Quarterbacks?", choices: ["Jalen Hurts", "Josh Allen", "Brock Purdy", "Joe Flacco"], answer: 3 }, 
    { question: "Which defender laid the controversial hit on Tommylee Lewis in the 2018 NFC Championship?", choices: ["Marshon Lattimore", "Eli Apple", "Nickell Robey-Coleman", "Marcus Williams"], answer: 2 },
    { question: "Who was the winner of the final NFL Championship en route to the first 'Super Bowl'?", choices: ["Green Bay Packers", "Dallas Cowboys", "Kansas City Chiefs", "Cleveland Browns"], answer: 0 },
    { question: "Which legendary Vikings QB threw a game losing INT in the NFC Champtionship?", choices: ["Case Keenum", "Carson Wentz", "Brett Favre", "Fran Tarkenton"], answer: 2 },
    { question: "Which bozo lined up OFFSIDES, negating a Tom Brady game losing INT in the AFC Champtionship", choices: ["Frank Clark", "Chris Jones", "Dee Ford", "Charvarius Ward"], answer: 2 },
    ],
  },
    "2026-01-24": { //Saturday
    event: "PatriotsBroncos",
    questions: [
    { question: "These teams have met in the AFC Championship twice before.\nWhat is the record?", choices: ["Patriots 2-0", "Broncos 2-0", "Tied 1-1", ], answer: 1 }, 
    { question: "True or False: Patriots have MORE Super Bowl losses than the Broncos?", choices: ["True", "False"], answer: 1 },
    { question: "Who picked off Tom Brady's 2PT Attempt in the final moments of the 2015 AFC Championship?", choices: ["Bradley Roby", "Aqib Talib", "Chris Harris Jr.", "Von Miller"], answer: 0 },
    { question: "Guess the player in the Patriots vs Broncos Playoff Rivalry:\n2 Games\n289 Rec. Yards\n4 TDs\n18 Receptions?", choices: ["Wes Welker", "Julian Edelman", "Demaryius Thomas", "Rob Gronkowski"], answer: 3 },
    { question: "Who had the most Receiving Yards between these teams in 2025?", choices: ["Troy Franklin", "Kayshon Boutte", "Stefon Diggs", "Courtland Sutton"], answer: 3 },
    ],
  },
    "2026-01-25": { //Sunday
    event: "RamsSeahawks",
    questions: [
    { question: "Who won the last playoff matchup and during what season?", choices: ["Rams 2020", "Seahawks 2022", "Seahawks 2006", "Rams 2004"], answer: 0 }, 
    { question: "True or False: Sam Darnold is the only QB in NFL History to win 14+ games for 2 different teams in consecutive seasons?", choices: ["True", "False"], answer: 0 },
    { question: "How many teams has Sean McVay coached against in his 15 Playoff Games", choices: ["9", "11", "12", "15"], answer: 3 },
    { question: "What season was the 'Beast Quake' playoff game?", choices: ["2009", "2010", "2013", "2014"], answer: 1 },
    { question: "Who was the Rams' starting QB in their 2004 playoff win against Seattle?", choices: ["Trent Green", "Matt Hasselbeck", "Kurt Warner", "Marc Bulger"], answer: 3 },
    ],
  },
    "2026-01-26": { //Monday
    event: "",
    questions: [
    { question: "Who was last year's Super Bowl MVP?", choices: ["Cooper DeJean", "Jalen Hurts", "Josh Sweat", "Saquon Barkley"], answer: 1 }, 
    { question: "Since 2010, which team has the most Super Bowl Appearances?", choices: ["Chiefs", "Eagles", "49ers", "Patriots"], answer: 3 },
    { question: "Who has the most Sacks this Post Season?", choices: ["Will Anderson Jr", "K'Lavon Chaisson", "Danielle Hunter", "Odafe Oweh"], answer: 0 },
    { question: "What is the NFC Championship Trophy called?", choices: ["The Bart Starr Trophy", "The Chicago Trophy", "The George Halas Trophy", "The Lamar Hunt Trophy"], answer: 2 },
    { question: "Which team has had the most Points per Game this Post Season?", choices: ["Broncos", "Bills", "Seahawks", "Rams"], answer: 2 },
    ],
  },
    "2026-01-27": { //Tuesday
    event: "",
    questions: [
    { question: "Which of these franchises have never appeared in a Super Bowl?", choices: ["Chargers", "Cardinals", "Titans", "Lions"], answer: 3 }, 
    { question: "Who was the first player to ever rush for over 2,000 Yards?", choices: ["Eric Dickerson", "Jamal Lewis", "OJ Simpson", "Barry Sanders"], answer: 2 },
    { question: "Which quarterback threw a touchdown pass to himself in a playoff game?", choices: ["Patrick Mahomes", "Marcus Mariota", "Nick Foles", "Ben Roethlisberger"], answer: 1 },
    { question: "Who holds the record for most passing yards in a single season?", choices: ["Drew Brees", "Patrick Mahomes", "Jameis Winston", "Peyton Manning"], answer: 3 },
    { question: "Who is the shortest player in NFL history?", choices: ["Jack Shapiro", "Kyler Murray", "Darren Sproles", "Brandon Banks"], answer: 0 },
    ],
  },
    "2026-01-28": { //Wednesday
    event: "",
    questions: [
    { question: "Which defender had the most interceptions in a single season?", choices: ["Paul Krause", "Night Train Lane", "Trevon Diggs", "Antonio Cromartie"], answer: 1 }, 
    { question: "Which Super Bowl featured the 'Helmet Catch'?", choices: ["Super Bowl XLII", "Super Bowl XL", "Super Bowl XLIII", "Super Bowl XXXI"], answer: 0 },
    { question: "Name the Super Bowl MVP based off their stats:\n- 22/33\n- 287 Yards\n- 3TDs\n- 90.2 QBR", choices: ["Patrick Mahomes", "Peyton Manning", "Joe Flacco", "Nick Foles"], answer: 2 },
    { question: "True or False: The Seahawks have made the Super Bowl the past 3 times a new Pope has been elected.", choices: ["True", "False"], answer: 0 },
    { question: "Who led the NFL in total touchdowns (rushing + receiving) this season?", choices: ["Jahmyr Gibbs", "Josh Allen", "Davante Adams", "Jonathan Taylor"], answer: 3 },
    ],
  },
    "2026-01-29": { //Thursday
    event: "",
    questions: [
    { question: "Who led the AFC in Receiving TDs this season?", choices: ["Tee Higgins", "Quentin Johnston", "Brock Bowers", "JaMarr Chase"], answer: 0 }, 
    { question: "Which WR was this in 2025?\n- 100 Rec.\n- 1163 Yards\n- 9 TDs", choices: ["Amon-Ra St. Brown", "Nico Collins", "Chris Olave", "Justin Jefferson"], answer: 2 },
    { question: "How many different teams has Ryan Fitzpatrick started for?", choices: ["7", "9", "11", "13"], answer: 1 },
    { question: "How many NFL championships did the Lions win before the Super Bowl era?", choices: ["0", "2", "3", "4"], answer: 3 },
    { question: "True or False: No kicker has ever been selected in the first round of the NFL Draft", choices: ["True", "False"], answer: 1 },
    ],
  },
    "2026-01-30": { //Friday
    event: "",
    questions: [
    { question: "Which Offensive Lineman has the most Receiving Yards in the Super Bowl Era?", choices: ["Bob Pratt", "Joe Staley", "Ty Sambrailo", "Brian Baldinger"], answer: 3 }, 
    { question: "Who had the most Kick Return Yards this season?", choices: ["Myles Price", "Devin Duvernay", "KaVontae Turpin", "Ray Davis"], answer: 2 },
    { question: "Who leads this Postseason in Passer Rating?", choices: ["Jordan Love", "Sam Darnold", "Josh Allen", "Matthew Stafford"], answer: 1 },
    { question: "True or False: Brett Favre threw an interception on his first-ever NFL pass attempt (as a Falcon).", choices: ["True", "False"], answer: 0 },
    { question: "Who is the all-time leader in receptions for the Chargers?", choices: ["Antonio Gates", "Kellen Winslow", "Keenan Allen", "Lance Alworth"], answer: 2 },
    ],
  },
      "2026-01-31": { //Saturday
    event: "",
    questions: [
    { question: "How many INTs did Peyton Manning throw in his rookie season?", choices: ["28", "31", "32", "34"], answer: 0 }, 
    { question: "What was the score of Peyton Manning's 2nd Super Bowl LOSS?", choices: ["24-21", "43-19", "34-16", "43-8"], answer: 3 },
    { question: "Which of these players did Peyton Manning SHARE an MVP award with?", choices: ["Brett Favre", "Steve McNair", "Tom Brady", "Drew Brees"], answer: 1 },
    { question: "What year was Peyton Manning drafted?", choices: ["1996", "1998", "2000", "2001"], answer: 1 },
    { question: "True or False: Peyton Manning has the most Pass Yards in NFL History?", choices: ["True", "False"], answer: 1 },
    ],
  },
      "2026-02-01": { //Sunday
    event: "",
    questions: [
    { question: "Who led the Commanders in sacks in 2025?", choices: ["Bobby Wagner", "Jer'Zahn Newton", "Von Miller", "Dorrance Armstrong"], answer: 2 }, 
    { question: "True or False: Bill Belichick is a 1st Ballot Hall of Famer", choices: ["True", "False", "What the actual F*** were the voters thinking??"], answer: [1, 2] },
    { question: "How many NFC Championships has Davante Adams lost?", choices: ["2", "3", "4", "5"], answer: 3 },
    { question: "Who has the LEAST amount of Playoff Wins?", choices: ["Trevor Lawrence", "Caleb Williams", "Kirk Cousins", "Justin Herbert"], answer: 3 },
    { question: "Which of these players had the most Receiving Yards this Postseason?", choices: ["Josh Jacobs (RB, Green Bay)", "Mecole Hardman (WR, Buffalo)", "Darian Kinnard (Offensive Tackle, Green Bay)", "Jaleel McLaughlin (RB, Denver)"], answer: 2 },
    ],
  },
    "2026-02-02": { //Monday
    event: "SuperBowlWeek",
    questions: [
    { question: "Who famously \"Guaranteed\" a Super Bowl Victory?", choices: ["Russell Wilson", "Joe Namath", "Jalen Ramsey", "Jim Kelly"], answer: 1 }, 
    { question: "Which team won Super Bowl XXXIV with a tackle on the 1-yard line as time expired?", choices: ["Ravens", "Redskins", "Saints", "Rams"], answer: 3 },
    { question: "True or False: The Packers won the first two Super Bowls", choices: ["True", "False"], answer: 0 },
    { question: "Which kicker infamously went “Wide Right” in the Super Bowl?", choices: ["Scott Norwood", "John Kasay", "Blair Walsh", "Stephen Gostkowski"], answer: 0 },
    { question: "Who has scored the most career Super Bowl TDs?", choices: ["Rob Gronkowski", "Jerry Rice", "Emmitt Smith", "Roger Craig"], answer: 1 },
    ],
  },
    "2026-02-03": { //Tuesday
    event: "SuperBowlWeek",
    questions: [
    { question: "Which team completed the only undefeated season including a Super Bowl win?", choices: ["Packers", "Patriots", "Dolphins", "Chiefs"], answer: 2 }, 
    { question: "Who rushed for a Super Bowl record 204 yards?", choices: ["Marcus Allen", "Timmy Smith", "Emmitt Smith", "Terrell Davis"], answer: 1 },
    { question: "Which team lost four consecutive Super Bowls in the early 1990s?", choices: ["Vikings", "Bills", "Broncos", "Patriots"], answer: 1 },
    { question: "Which Super Bowl featured a power outage during the game?", choices: ["Super Bowl XXXI", "Super Bowl L", "Super Bowl XLIV", "Super Bowl XLVII"], answer: 3 },
    { question: "True or False: Only 1 Super Bowl has ever gone to Overtime", choices: ["True", "False"], answer: 1 },
    ],
  },
    "2026-02-04": { //Wednesday
    event: "SuperBowlWeek",
    questions: [
    { question: "Which Player holds the record for the most Super Bowl MVP Awards?", choices: ["Patrick Mahomes", "Tom Brady", "Joe Montana", "Terry Bradshaw"], answer: 1 }, 
    { question: "How many teams have never won a Super Bowl?", choices: ["12", "14", "15", "18"], answer: 0 },
    { question: "Who caught the game-winning Toe Tap TD against the Cardinals in Super Bowl XLIII?", choices: ["Larry Fitzgerald", "Hines Ward", "Santonio Holmes", "Antonio Brown"], answer: 2 },
    { question: "Who holds the record for the most receiving yards in a single Super Bowl?", choices: ["Isaac Bruce", "Jerry Rice", "Danny Amendola", "Lynn Swann"], answer: 1 },
    { question: "Who scored the game-winning TD vs the Falcons in Super Bowl LI?", choices: ["Julian Edelman", "LaGarrette Blount", "Danny Amendola", "James White"], answer: 3 },
    ],
  },
    "2026-02-05": { //Thursday
    event: "NFLHonorsEdition",
    questions: [
    { question: "Who was the oldest player to win NFL MVP?", choices: ["Tom Brady", "Peyton Manning", "Aaron Rodgers", "Adrian Peterson"], answer: 0 }, 
    { question: "Which quarterback famously won Comeback Player of the Year after recovering from a gruesome leg injury that included 17 surgeries?", choices: ["Joe Burrow", "Alex Smith", "Joe Theismann", "Ryan Tannehill"], answer: 1 },
    { question: "True or False: Tom Brady has won more Super Bowl MVP awards than regular season MVP awards.", choices: ["True", "False"], answer: 0 },
    { question: "Who was the first Defensive Player to win MVP?", choices: ["Lawrence Taylor", "Joe Greene", "Dick Anderson", "Alan Page"], answer: 3 },
    { question: "Which position has NEVER won NFL MVP?", choices: ["Defensive Tackle", "Kicker", "Wide Receiver", "Line Backer"], answer: 2 },
    ],
  },
    "2026-02-06": { //Friday
    event: "SeahawksEdition",
    questions: [
    { question: "Which RB holds the Seahawk’s All-Time Rushing Yard Record?", choices: ["Chris Warren", "Marshawn Lynch", "Curt Warner", "Shaun Alexander"], answer: 3 }, 
    { question: "What year were the Seattle Seahawks founded?", choices: ["1962", "1967", "1974", "1978"], answer: 2 },
    { question: "Which quarterback threw the infamous interception at the goal line in Super Bowl XLIX?", choices: ["Matt Hasselback", "Dave Krieg", "Geno Smith", "Russell Wilson"], answer: 3 },
    { question: "Before being retired for the 12th man, who wore #12 in Seattle?", choices: ["Sam Adkins", "Dave Krieg", "Jim Zorn", "Rick Mirer"], answer: 0 },
    { question: "Which Division did the Seattle Seahawks start their franchise in?", choices: ["AFC West", "NFC West", "AFC Central", "NFC North"], answer: 1 },
    ],
  },
    "2026-02-07": { //Saturday
    event: "PatriotsEdition",
    questions: [
    { question: "Who was the Patriots' head coach before Bill Belichick?", choices: ["Pete Carroll", "Bill Parcells", "Raymond Barry", "Mike Holgrem"], answer: 0 }, 
    { question: "Who is the Patriots' all-time leading receiver in career receiving yards?", choices: ["Stanley Morgan", "Troy Brown", "Rob Gronkowski", "Wes Welker"], answer: 0 },
    { question: "Before becoming the “New England Patriots”, what was the team’s official title?", choices: ["Boston Colonials", "Massachusetts Liberty", "Boston Patriots", "New England Muskets"], answer: 2 },
    { question: "True or False: The Patriots were the first team to finish a regular season 16-0.", choices: ["True", "False"], answer: 0 },
    { question: "In Super Bowl LI, what deficit did the Patriots overcome against the Atlanta Falcons?", choices: ["21-3", "25-3", "28-3", "28-0"], answer: 2 },
    ],
  },
    "2026-02-08": { //Sunday
    event: "SUPERBOWL",
    questions: [
    { question: "Dating back to 1977, which team leads the All-Time Patriots vs Seahawks Series?", choices: ["Seahawks", "Patriots", "Tied"], answer: 0 }, 
    { question: "Which Patriots player won Super Bowl XLIX MVP honors?", choices: ["Julian Edelman", "Malcolm Butler", "Rob Gronkowski", "Tom Brady"], answer: 3 },
    { question: "Which of the following Seahawks defenders was NOT a member of the “Legion of Boom” during Super Bowl XLIX?", choices: ["Kam Chancellor", "Shaquill Griffin", "Earl Thomas", "Byron Maxwell"], answer: 1 },
    { question: "Which 2025 WR Was this:\n- 119 Rec.\n- 1793 Yards\n- 10 TDs", choices: ["Cooper Kupp", "Stefon Diggs", "Jaxon Smith-Njigba", "Kayshon Boutte"], answer: 2 },
    { question: "True or False: 2025 was the Seahawks’ winningest regular season ever.", choices: ["True", "False"], answer: 0 },
    ],
  },
    "2026-02-09": { //Monday
    event: "",
    questions: [
    { question: "How many Field Goals did Jason Myers kick in Super Bowl 60?", choices: ["5/5", "4/6", "4/5", "4/4"], answer: 0 }, 
    { question: "Which QB had more Passing Yards?", choices: ["Sam Darnold", "Tommy DeVito", "Josh Dobbs", "Drake Maye"], answer: 3 },
    { question: "Which Seahawk scored the Pick Six deep in the 4th Quarter?", choices: ["Devon Witherspoon", "Josh Jobe", "Uchenna Nwosu", "Julian Love"], answer: 2 },
    { question: "Who had the most Receiving Yards in the Super Bowl?", choices: ["Cooper Kupp", "Mack Hollins", "Rhamondre Stevenson", "AJ Barner"], answer: 1 },
    { question: "True or False: The Patriots have the most Super Bowl losses in NFL History", choices: ["True", "False"], answer: 0 },
    ],
  },
    "2026-02-10": { //Tuesday
    event: "",
    questions: [
    { question: "Who was this season's Walter Payton Man of the Year recipient?", choices: ["Cameron Dicker", "Bobby Wagner", "Baker Mayfield", "Jordan Love"], answer: 1 }, 
    { question: "Which QB is NOT in the All-Time Top 10 Career Pass TDs?", choices: ["Matt Ryan", "Ben Roethlisberger", "Matthew Stafford", "Eli Manning"], answer: 3 },
    { question: "True or False: The Giants legal government official name is 'The New York Football Giants'.", choices: ["True", "False"], answer: 0 },
    { question: "Who was the first QB from the 2018 Draft Class to make a Super Bowl Appearance?", choices: ["Baker Mayfield", "Josh Allen", "Sam Darnold", "Lamar Jackson"], answer: 2 },
    { question: "Name the RB Career:\n- 13,018 Rush Yards\n- 122 Rush TDs\n- 24 Fumbles\n- 1,801 Rec. Yards", choices: ["LaDainian Tomlinson", "Derrick Henry", "Adrian Peterson", "Shaun Alexander"], answer: 1 },
    ],
  },
    "2026-02-11": { //Wednesday
    event: "",
    questions: [
    { question: "Who has the most Rushing Yards in Green Bay Packers history?", choices: ["Aaron Jones", "Jim Taylor", "Dorsey Levens", "Ahman Green"], answer: 3 }, 
    { question: "What year did the Cardinals move from St. Louis to Arizona", choices: ["1965", "1974", "1981", "1988"], answer: 3 },
    { question: "Who threw for the most yards in a single Super Bowl game?", choices: ["Nick Foles", "Tom Brady", "Dan Marino", "Patrick Mahomes"], answer: 1 },
    { question: "Which player won Comeback Player of the Year this season?", choices: ["Aidan Hutchinson", "Dak Prescott", "Christian McCaffrey", "Philip Rivers"], answer: 2 },
    { question: "Which QB threw the most interceptions ever in a single game?", choices: ["Jim Hardy", "Ken Stabler", "Peyton Manning", "Nathan Peterman"], answer: 0 },
    ],
  },
    "2026-02-12": { //Thursday
    event: "",
    questions: [
    { question: "How many teams has Peyton Manning played for?", choices: ["1", "3", "2", "1"], answer: 2 },
    { question: "Which is the oldest NFL Franchise", choices: ["Bears/Staleys", "Packers", "Cardinals", "Lions"], answer: 2 },
    { question: "What was the original name of the New York Jets?", choices: ["Giants", "Football Yankees", "Titans", "Flyers"], answer: 2 },
    { question: "First QB to throw for 5,000 Yards?", choices: ["Drew Brees", "Steve Young", "Dan Marino", "Brett Favre"], answer: 2 },
    { question: "Which two players SHARED the MVP Award?", choices: ["Brett Favre & Barry Sanders", "Steve Young & Kurt Warner", "Peyton Manning & Brett Favre", "LaDainian Tomlinson & Steve McNair"], answer: 0 },
    ],
  },
    "2026-02-13": { //Friday
    event: "",
    questions: [
    { question: "Who was the last player to win Back-to-Back MVP Awards?", choices: ["Peyton Manning", "Aaron Rodgers", "Lamar Jackson", "Tom Brady"], answer: 1 },
    { question: "What year were the Raiders established", choices: ["1955", "1960", "1963", "1966"], answer: 1 },
    { question: "What surface do the Arizona Cardinals play on?", choices: ["Matrix Turf", "Kentucky Bluegrass", "SIS Grass", "Bermuda Grass"], answer: 3 },
    { question: "Who was the last Giants player to win MVP?", choices: ["Y.A. Tittle", "Eli Manning", "Michael Strahan", "Lawrence Taylor"], answer: 3 },
    { question: "Who was the NFC's 3 Seed this season?", choices: ["Philadelphia Eagles", "Chicago Bears", "Los Angeles Rams", "Carolina Panthers"], answer: 0 },
    ],
  },
    "2026-02-14": { //Saturday
    event: "ValentinesDay",
    questions: [
    { question: "What day is the Super Bowl in 2027?", choices: ["February 8", "February 9", "February 11", "February 14"], answer: 3 },
    { question: "What year was Jordan LOVE drafted", choices: ["2018", "2020", "2021", "2023"], answer: 1 },
    { question: "What year did Travis Kelce start dating Taylor Swift?", choices: ["2021", "2022", "2023", "2024"], answer: 2 },
    { question: "Name the 2025 WR:\n- 55 Rec.\n- 724 Yards\n- 6 TDs", choices: ["ROMEO Doubs", "Colston LOVEland", "Blake WhiteHEART", "Carrington VALENTINE"], answer: 0 },
    { question: "Which NFL team plays in the 'City of Brotherly Love'?", choices: ["Dallas Cowboys", "Chicago Bears", "Philadelphia Eagles", "Los Angeles Rams"], answer: 2 },
    ],
  },
    "2026-02-15": { //Sunday
    event: "",
    questions: [
    { question: "Career pass TD leader?", choices: ["Tom Brady", "Drew Brees", "Peyton Manning", "Aaron Rodgers"], answer: 0 },
    { question: "Who was the Defensive Player of the Year in 2023?", choices: ["Nick Bosa", "TJ Watt", "Myles Garrett", "Micah Parsons"], answer: 2 },
    { question: "Which Head Coach is responsible for the largest blown lead in NFL History?", choices: ["Jack Pardee", "Dan Quinn", "Jeff Saturday", "Brandon Staley"], answer: 2 },
    { question: "Who has the most Yards from Scrimmage in a single season?", choices: ["Chris Johnson", "Barry Sanders", "Marshall Faulk", "Derrick Henry"], answer: 0 },
    { question: "Which WR had the 'Helmet Catch'?", choices: ["Plaxico Burress", "Victor Cruz", "David Tyree", "Mario Manningham"], answer: 2 },
    ],
  },
    "2026-02-16": { //Monday
    event: "",
    questions: [
    { question: "Name the QB Career:\n-22,464 Pass Yards\n- 6,109 Rush Yards\n- 133 Pass TDs\n- 36 Rush TDs ", choices: ["Cam Newton", "Michael Vick", "Lamar Jackson", "Josh Allen"], answer: 1 },
    { question: "What was the Wind-Chill in the coldest game of all time (1982 AFC Championship)?", choices: ["-59°F", "-48°F", "-44°F", "-25°F"], answer: 0 },
    { question: "Which Dolphins quarterback led the team to a perfect 17-0 season in 1972?", choices: ["Craig Morton", "Greg Landry", "Dan Marino", "Bob Griese"], answer: 3 },
    { question: "Who has the record for most Receiving Yards in a game?", choices: ["Calvin Johnson", "Flipper Anderson", "Stephone Paige", "Julio Jones"], answer: 1 },
    { question: "What season did the Ravens win their first Super Bowl?", choices: ["2000", "2008", "2011", "2012"], answer: 0 },
    ],
  },
    "2026-02-17": { //Tuesday
    event: "",
    questions: [
    { question: "Who led the Bills in sacks last season?", choices: ["Joey Bosa", "Matt Milano", "Ed Oliver", "Greg Rousseau"], answer: 3 },
    { question: "True or False: The Bengals have never won a Super Bowl.", choices: ["True", "False"], answer: 0 },
    { question: "Who was the MVP of Super Bowl X? (Cowboys vs Steelers)", choices: ["Franco Harris", "Roger Staubach", "Lynn Swann", "Terry Bradshaw"], answer: 2 },
    { question: "Who was the first team in win the Super Bowl in their home stadium?", choices: ["Buccaneers", "Rams", "Giants", "Colts"], answer: 0 },
    { question: "What is the most amount of Receiving Yards Antonio Brown ever had in a season?", choices: ["1,698", "1,943", "1,834", "1,572"], answer: 2 },
    ],
  },
    "2026-02-18": { //Wednesday
    event: "",
    questions: [
    { question: "Who has the longest Playoff Win drought?", choices: ["Dolphins", "Jets", "Raiders", "Cardinals"], answer: 0 },
    { question: "When was the season the Cowboys won a Super Bowl?", choices: ["1990", "1995", "2002", "2004"], answer: 1 },
    { question: "Which QB holds the record for most Passing TDs as a rookie?", choices: ["Bo Nix", "Peyton Manning", "Justin Herbert", "Baker Mayfield"], answer: 2 },
    { question: "Which WR had the most Receiving Yards ever in a season?", choices: ["Julio Jones", "Antonio Brown", "Calvin Johnson", "Cooper Kupp"], answer: 2 },
    { question: "True or False: Kirk Cousins has more Career Pass TDs than John Elway?", choices: ["True", "False"], answer: 1 },
    ],
  },
    "2026-02-19": { //Thursday
    event: "",
    questions: [
    { question: "Which legendary owner was known for his motto 'Just Win, Baby'?", choices: ["Mark Davis", "Jerry Jones", "Al Davis", "Lamar Hunt"], answer: 2 },
    { question: "Name the 2025 Rookie WR:\n- 938 Rec. Yards\n- 6 TDs\n- 63 Receptions", choices: ["Tet McMillan", "Emeka Egbuka", "Luther Burden III", "RJ Harvey"], answer: 1 },
    { question: "Who was the 2011 MVP?", choices: ["Drew Brees", "Tom Brady", "Matthew Stafford", "Aaron Rodgers"], answer: 3 },
    { question: "Who is the only Special Teamer to ever win Super Bowl MVP?", choices: ["Adam Vinatieri (Kicker)", "Ray Wersching (Kicker)", "Desmond Howard (Kick Returner)", "Michael Dickson (Punter)"], answer: 2 },
    { question: "Who holds the record for most career games played?", choices: ["Morten Anderson", "Brett Favre", "Tom Brady", "Gary Anderson"], answer: 0 },
    ],
  },
    "2026-02-20": { //Friday
    event: "",
    questions: [
    { question: "Which defense allows the FEWEST passing yards per game in 2025?", choices: ["Vikings", "Browns", "Bills", "Texans"], answer: 0 },
    { question: "Which Super Bowl featured the 'Philly Special' trick play?", choices: ["Super Bowl L", "Super Bowl XLII", "Super Bowl LII", "Super Bowl XXX"], answer: 2 },
    { question: "How many League MVP Awards did Peyton Manning win OUTRIGHT (Not sharing the award)?", choices: ["3", "4", "5", "6"], answer: 1 },
    { question: "How many League MVP Awards did Aaron Rodgers win OUTRIGHT?", choices: ["2", "3", "4", "5"], answer: 2 },
    { question: "True or False: The Cardinals franchise is older than the state of Arizona.", choices: ["True", "False"], answer: 0 },
    ],
  },
    "2026-02-21": { //Saturday
    event: "",
    questions: [
    { question: "Who was the first Wild Card team to win the Super Bowl?", choices: ["2010 Packers", "1988 Redskins", "1980 Raiders", "2007 Giants"], answer: 2 },
    { question: "Which team had the Most Rush Yards per Game in 2025?", choices: ["Buffalo Bills", "Baltimore Ravens", "Chicago Bears", "Atlanta Falcons"], answer: [0, 1] },
    { question: "_____ has 208 Career Touchdowns.", choices: ["Emmitt Smith", "Walter Payton", "Jerry Rice", "LaDainian Tomlinson"], answer: 2 },
    { question: "Who ran the fastest 40yd Dash in Combine History?", choices: ["Xavier Worthy", "John Ross III", "Tyreek Hill", "Chris Johnson"], answer: 0 },
    { question: "Who led the Buccaneers in receiving yards in 2025?", choices: ["Emeka Egbuka", "Mike Evans", "Chris Godwin", "Cade Otton"], answer: 0 },
    ],
  },
    "2026-02-22": { //Sunday
    event: "",
    questions: [
    { question: "Which city is hosting Super Bowl LXI?", choices: ["New Orleans, LA", "Glendale, AZ", "Inglewood, CA", "Las Vegas, NV"], answer: 2 },
    { question: "What was the original name of the Detroit Lions?", choices: ["Detroit Tigers", "Detroit Lions", "Portsmouth Spartans", "Motor City Monsters"], answer: 2 },
    { question: "How many MVP Votes does Russell Wilson have in his Legendary Career?", choices: ["37", "0", "7", "24"], answer: 1 },
    { question: "All-Time Career Rushing Yards Leader?", choices: ["Frank Gore", "Emmitt Smith", "LaDainian Tomlinson", "Barry Sanders"], answer: 1 },
    { question: "What city did the Chargers first belong to?", choices: ["Pasadena", "San Diego", "Los Angeles", "San Fransisco"], answer: 2 },
    ],
  },
};


export const POOL = [
  { question: "Mile High team?", choices:["Broncos","Bills","Bears","Bengals"], answer:0 }
];
