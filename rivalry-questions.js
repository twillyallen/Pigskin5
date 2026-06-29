// rivalry-questions.js
// Evergreen NFL trivia questions for the Rivalry feature.
// Answers NEVER change — no current-season stats, no weekly leaders, no college questions.
// Format: { question, choices (4 options), answer (0-based index), explanation (optional) }
// Add new questions to the bottom. Do not reorder existing entries — indices are stored in the DB.
//
// archive-legacy.js questions are filtered and appended at runtime (see bottom of file).
// The filtered pool is stable as long as archive-legacy.js remains unchanged.

import { LEGACY } from "./archive-legacy.js";
import { CALENDAR } from "./questions.js";

// Patterns that mark a question as non-evergreen (mid-season stats or college content).
const _NON_EVERGREEN = [
  // Current-season / in-game stats — answers change weekly
  /leads?\s+the\s+(league|NFL)\s+in/i,
  /current\s+season\s+leader/i,
  /is\s+the\s+20\d\d\s+leader\s+in/i,
  /leads?\s+the\s+20\d\d\s+season/i,
  /before\s+today/i,
  /tonight/i,
  /prior\s+to\s+today/i,
  /this\s+season/i,
  /yesterday/i,
  /which\s+rookie/i,
  /led\s+the\s+(league|NFL)\s+in.*\bweek\b/i,
  /which\s+(team|offense|defense)\s+leads?\s+the\s+league/i,
  /which\s+20\d\d/i,
  // College football content
  /college\s+football/i,
  /which\s+school\s+has\s+produced/i,
  /which\s+university/i,
  /\bFBS\b/,
  /\bNCAA\b/,
  /\bCFP\b/,
  /heisman/i,
  /national\s+champion(ship|s)?/i,
  /national\s+title/i,
  /what\s+college\s+team/i,
  /\bBig\s+Ten\b/i,
  /\bSEC\b/,
];

function _isEvergreen(q) {
  return !_NON_EVERGREEN.some((p) => p.test(q.question));
}

// Flatten one or more date-keyed source objects (LEGACY, CALENDAR) into a filtered,
// deduplicated pool appended after the hand-curated base.
// Handles both array-entry and { event, questions } formats.
// Skips event:"college" dates. Only accepts 4-choice questions.
function _buildPool(base, ...sources) {
  const seen = new Set(base.map((q) => q.question));
  const out = [];
  for (const source of sources) {
    for (const entry of Object.values(source)) {
      const isObj = !Array.isArray(entry);
      if (isObj && entry.event === "college") continue;
      const qs = isObj ? entry.questions ?? [] : entry;
      for (const q of qs) {
        if (!q?.question || !Array.isArray(q.choices) || q.choices.length !== 4) continue;
        if (seen.has(q.question)) continue;
        if (!_isEvergreen(q)) continue;
        seen.add(q.question);
        out.push({ question: q.question, choices: q.choices, answer: q.answer });
      }
    }
  }
  return out;
}

const _BASE = [
  // ── Super Bowls ──
  { question: "Which team won Super Bowl I?", choices: ["Kansas City Chiefs", "Green Bay Packers", "Dallas Cowboys", "Oakland Raiders"], answer: 1 },
  { question: "Who has won the most Super Bowls as a head coach?", choices: ["Bill Belichick", "Chuck Noll", "Joe Gibbs", "Don Shula"], answer: 0 },
  { question: "Which franchise has won the most Super Bowls all-time?", choices: ["Dallas Cowboys", "San Francisco 49ers", "New England Patriots", "Pittsburgh Steelers"], answer: [2, 3] },
  { question: "Which QB won Super Bowl MVP honors in back-to-back years?", choices: ["Tom Brady", "Bart Starr", "Terry Bradshaw", "Joe Montana"], answer: 1 },
  { question: "What is the largest margin of victory in Super Bowl history?", choices: ["35 points", "45 points", "43 points", "36 points"], answer: 2 },
  { question: "Which team lost four consecutive Super Bowls?", choices: ["Minnesota Vikings", "Buffalo Bills", "Denver Broncos", "Miami Dolphins"], answer: 1 },
  { question: "Who was the oldest starting QB to win a Super Bowl?", choices: ["Peyton Manning", "Tom Brady", "John Elway", "Brett Favre"], answer: 1 },
  { question: "Which Super Bowl was the first to go to overtime?", choices: ["Super Bowl LI", "Super Bowl XLVII", "Super Bowl XLIX", "Super Bowl LV"], answer: 0 },
  { question: "Who holds the record for most career Super Bowl touchdown passes?", choices: ["Joe Montana", "Tom Brady", "Terry Bradshaw", "Peyton Manning"], answer: 1 },
  { question: "Which team completed the only undefeated Super Bowl-winning season in NFL history?", choices: ["1972 Miami Dolphins", "1985 Chicago Bears", "2007 New England Patriots", "1989 San Francisco 49ers"], answer: 0 },

  // ── Career Records ──
  { question: "Who holds the NFL record for most career passing yards?", choices: ["Peyton Manning", "Drew Brees", "Tom Brady", "Brett Favre"], answer: 2 },
  { question: "Who holds the NFL record for most career passing touchdowns?", choices: ["Peyton Manning", "Brett Favre", "Drew Brees", "Tom Brady"], answer: 3 },
  { question: "Who holds the NFL record for most career rushing yards?", choices: ["Barry Sanders", "Emmitt Smith", "Adrian Peterson", "Walter Payton"], answer: 1 },
  { question: "Who holds the NFL record for most career receiving yards?", choices: ["Jerry Rice", "Randy Moss", "Larry Fitzgerald", "Terrell Owens"], answer: 0 },
  { question: "Who holds the NFL record for most career receptions?", choices: ["Tony Gonzalez", "Jerry Rice", "Larry Fitzgerald", "Jason Witten"], answer: 2 },
  { question: "Who holds the NFL record for most career receiving touchdowns?", choices: ["Randy Moss", "Terrell Owens", "Jerry Rice", "Tony Gonzalez"], answer: 2 },
  { question: "Who holds the NFL single-season record for most rushing yards?", choices: ["Barry Sanders", "Eric Dickerson", "Adrian Peterson", "Jamal Lewis"], answer: 1 },
  { question: "Who holds the NFL single-season record for most receiving touchdowns?", choices: ["Jerry Rice", "Randy Moss", "Sterling Sharpe", "Cris Carter"], answer: 1 },
  { question: "Who holds the NFL single-season record for most passing touchdowns?", choices: ["Tom Brady", "Peyton Manning", "Patrick Mahomes", "Drew Brees"], answer: 1 },
  { question: "Who holds the NFL single-season record for most sacks?", choices: ["Lawrence Taylor", "Michael Strahan", "Reggie White", "Deacon Jones"], answer: 1 },
  { question: "Who holds the NFL record for most career interceptions?", choices: ["Ed Reed", "Ronnie Lott", "Dick 'Night Train' Lane", "Paul Krause"], answer: 3 },
  { question: "Which QB threw for the most yards in a single game (regular season)?", choices: ["Drew Brees", "Norm Van Brocklin", "Philip Rivers", "Nick Foles"], answer: 1 },
  { question: "Who holds the NFL record for most career rushing touchdowns?", choices: ["Emmitt Smith", "LaDainian Tomlinson", "Marcus Allen", "Jim Brown"], answer: 1 },
  { question: "Who holds the NFL single-season record for most rushing touchdowns?", choices: ["Shaun Alexander", "LaDainian Tomlinson", "Emmitt Smith", "Priest Holmes"], answer: 1 },

  // ── Draft History ──
  { question: "Who was the #1 overall pick in the 1998 NFL Draft?", choices: ["Ryan Leaf", "Charles Woodson", "Peyton Manning", "Randy Moss"], answer: 2 },
  { question: "Who was the #1 overall pick in the 2001 NFL Draft?", choices: ["LaDainian Tomlinson", "Reggie Wayne", "Michael Vick", "Drew Brees"], answer: 2 },
  { question: "Tom Brady was selected in which round of the 2000 NFL Draft?", choices: ["3rd round", "4th round", "5th round", "6th round"], answer: 3 },
  { question: "Who was the #1 overall pick in the 2012 NFL Draft?", choices: ["Andrew Luck", "Robert Griffin III", "Trent Richardson", "Ryan Tannehill"], answer: 0 },
  { question: "Who was the #1 overall pick in the 2004 NFL Draft?", choices: ["Philip Rivers", "Eli Manning", "Larry Fitzgerald", "Ben Roethlisberger"], answer: 1 },
  { question: "In which round was Jerry Rice drafted by the San Francisco 49ers?", choices: ["1st round", "2nd round", "3rd round", "1st round — 16th overall"], answer: 3 },

  // ── Franchise History ──
  { question: "Which team plays home games at Lambeau Field?", choices: ["Minnesota Vikings", "Chicago Bears", "Green Bay Packers", "Detroit Lions"], answer: 2 },
  { question: "Which franchise was the first to win back-to-back Super Bowls twice?", choices: ["San Francisco 49ers", "Pittsburgh Steelers", "Dallas Cowboys", "New England Patriots"], answer: 1 },
  { question: "What year did the Houston Texans play their first NFL game?", choices: ["1999", "2000", "2002", "2004"], answer: 2 },
  { question: "The Dallas Cowboys are nicknamed what?", choices: ["America's Team", "The Lone Stars", "The Blue Stars", "The Silver Stars"], answer: 0 },
  { question: "Which city did the Baltimore Ravens move from in 1996?", choices: ["Philadelphia", "Cleveland", "St. Louis", "Oakland"], answer: 1 },
  { question: "Which team has the all-time record for most wins in NFL regular season history?", choices: ["Chicago Bears", "Green Bay Packers", "New England Patriots", "Dallas Cowboys"], answer: 0 },
  { question: "Which AFC team relocated to Las Vegas in 2020?", choices: ["San Diego Chargers", "Oakland Raiders", "St. Louis Rams", "San Francisco 49ers"], answer: 1 },
  { question: "The New England Patriots play their home games at which stadium?", choices: ["Foxboro Stadium", "Gillette Stadium", "Patriot Place", "Sullivan Stadium"], answer: 1 },
  { question: "Which NFC team has the nickname 'The 12th Man' for their fans?", choices: ["Carolina Panthers", "New Orleans Saints", "Seattle Seahawks", "Atlanta Falcons"], answer: 2 },

  // ── Player Achievements & Awards ──
  { question: "Who is the only player to win the NFL MVP award in five different seasons?", choices: ["Tom Brady", "Brett Favre", "Peyton Manning", "Aaron Rodgers"], answer: 2 },
  { question: "Who won the first Heisman Trophy awarded to a player who would later win a Super Bowl?", choices: ["Roger Staubach", "Chuck Bednarik", "O.J. Simpson", "Earl Campbell"], answer: 0 },
  { question: "Which defensive player won the NFL MVP award in 1986?", choices: ["Mike Singletary", "Reggie White", "Lawrence Taylor", "Ronnie Lott"], answer: 2 },
  { question: "Which wide receiver holds the record for most consecutive 1,000-yard receiving seasons?", choices: ["Jerry Rice", "Marvin Harrison", "Larry Fitzgerald", "Tim Brown"], answer: 0 },
  { question: "Who was the first player selected to 14 Pro Bowls?", choices: ["Jerry Rice", "Tom Brady", "Peyton Manning", "Bruce Matthews"], answer: 3 },
  { question: "Barry Sanders retired at age 31 with how many career rushing yards?", choices: ["14,234", "15,269", "16,112", "17,022"], answer: 1 },
  { question: "Who was the first tight end inducted into the Pro Football Hall of Fame?", choices: ["Mike Ditka", "Kellen Winslow", "Ozzie Newsome", "Charlie Sanders"], answer: 0 },

  // ── Historic Games & Moments ──
  { question: "What game is known as 'The Immaculate Reception'?", choices: ["1958 NFL Championship", "1972 AFC Divisional Playoff", "1982 NFC Championship", "1967 Ice Bowl"], answer: 1 },
  { question: "What was special about the 1958 NFL Championship Game?", choices: ["First game played in snow", "First nationally televised game to go to overtime", "First game with over 100,000 fans", "First game with instant replay"], answer: 1 },
  { question: "Who caught 'The Catch' in the 1981 NFC Championship Game?", choices: ["Jerry Rice", "Dwight Clark", "Fred Dean", "Charlie Young"], answer: 1 },
  { question: "What happened in the 1982 Super Bowl 'The Catch' by Dwight Clark's 49ers that season?", choices: ["Beat the Bengals 26-21", "Beat the Cowboys 31-17", "Beat the Raiders 38-9", "Beat the Cowboys 28-27"], answer: 0 },
  { question: "Which game featured 'The Music City Miracle'?", choices: ["2000 Wild Card: Titans vs Bills", "2001 Wild Card: Steelers vs Ravens", "1999 Divisional: Cowboys vs Vikings", "2001 Wild Card: Packers vs Seahawks"], answer: 0 },
  { question: "Who threw the 'Hail Mary' TD pass to beat the Vikings in 1975?", choices: ["Craig Morton", "Danny White", "Roger Staubach", "Clint Longley"], answer: 2 },

  // ── Positions & Rules ──
  { question: "How many points is a safety worth in the NFL?", choices: ["1", "2", "3", "6"], answer: 1 },
  { question: "In the NFL, how many yards must a team gain to earn a new set of downs?", choices: ["5 yards", "10 yards", "15 yards", "20 yards"], answer: 1 },
  { question: "What is the width of an NFL goal post (distance between the uprights)?", choices: ["18 feet 6 inches", "20 feet", "23 feet 4 inches", "24 feet"], answer: 0 },
  { question: "How long is an NFL field goal attempt from the line of scrimmage for a 50-yard field goal?", choices: ["50 yards from the LOS", "It's measured from behind the LOS + 7 yards", "Exactly 50 yards", "53 yards from the kicker"], answer: 1 },

  // ── Hall of Fame ──
  { question: "Where is the Pro Football Hall of Fame located?", choices: ["Cleveland, Ohio", "Pittsburgh, Pennsylvania", "Canton, Ohio", "Indianapolis, Indiana"], answer: 2 },
  { question: "Who was the first player inducted into the Pro Football Hall of Fame?", choices: ["Jim Thorpe", "Red Grange", "Sammy Baugh", "Bronko Nagurski"], answer: 0 },
  { question: "Which player was inducted into the Hall of Fame in his first year of eligibility and had played only 9 seasons?", choices: ["Gale Sayers", "Barry Sanders", "Walter Payton", "Jim Brown"], answer: 0 },
  { question: "How many seasons does a player need to be retired before becoming eligible for the Hall of Fame?", choices: ["3 seasons", "5 seasons", "7 seasons", "10 seasons"], answer: 1 },

  // ── Coaches ──
  { question: "Who was the first Black head coach to win a Super Bowl?", choices: ["Tony Dungy", "Lovie Smith", "Marvin Lewis", "Dennis Green"], answer: 0 },
  { question: "Which coach led the Miami Dolphins to their perfect season in 1972?", choices: ["Don Shula", "George Wilson", "Chuck Fairbanks", "Joe Thomas"], answer: 0 },
  { question: "Which coach holds the record for most career NFL wins (regular season + playoffs)?", choices: ["Don Shula", "Bill Belichick", "Tom Landry", "Curly Lambeau"], answer: 1 },
  { question: "Which coach is known for the 'West Coast Offense' he pioneered with the 49ers?", choices: ["Mike Holmgren", "Bill Walsh", "George Seifert", "Don Coryell"], answer: 1 },
  { question: "How many seasons did Tom Landry coach the Dallas Cowboys?", choices: ["20 seasons", "25 seasons", "29 seasons", "32 seasons"], answer: 2 },

  // ── Rivalries & Divisions ──
  { question: "The NFC East includes which four teams?", choices: ["Cowboys, Giants, Eagles, Commanders", "Cowboys, Giants, Eagles, Bears", "Cowboys, Giants, Eagles, Saints", "Cowboys, Giants, Eagles, Packers"], answer: 0 },
  { question: "Which division has been called the toughest in the NFL for multiple years running?", choices: ["NFC North", "AFC West", "AFC East", "NFC West"], answer: 3 },
  { question: "How many teams are in the NFL?", choices: ["28", "30", "32", "34"], answer: 2 },
  { question: "How many teams make the NFL playoffs each season (since 2020)?", choices: ["12", "14", "16", "18"], answer: 1 },

  // ── Quarterback Records ──
  { question: "Who is the only QB to throw for 5,000+ yards in three different seasons?", choices: ["Drew Brees", "Tom Brady", "Peyton Manning", "Dan Marino"], answer: 0 },
  { question: "Dan Marino set the single-season passing record in 1984 with how many yards?", choices: ["4,800", "5,084", "5,232", "5,476"], answer: 1 },
  { question: "Which QB won the most consecutive NFL MVP awards?", choices: ["Peyton Manning", "Tom Brady", "Brett Favre", "Patrick Mahomes"], answer: 2 },
  { question: "Who was the first QB to throw 400+ touchdown passes in his career?", choices: ["Dan Marino", "Brett Favre", "John Elway", "Fran Tarkenton"], answer: 0 },

  // ── Running Back Records ──
  { question: "Jim Brown retired at his peak after how many seasons?", choices: ["7", "9", "11", "13"], answer: 1 },
  { question: "Walter Payton's nickname was what?", choices: ["Sweetness", "The Galloping Ghost", "The Electric Eel", "Bullet"], answer: 0 },
  { question: "LaDainian Tomlinson scored how many touchdowns (all types) in his record 2006 season?", choices: ["24", "26", "28", "31"], answer: 3 },
  { question: "Who was the first player in NFL history to rush for 2,000 yards in a season?", choices: ["Barry Sanders", "O.J. Simpson", "Eric Dickerson", "Earl Campbell"], answer: 1 },

  // ── Defensive Greats ──
  { question: "Who is known as 'The Minister of Defense'?", choices: ["Lawrence Taylor", "Reggie White", "Deacon Jones", "Bruce Smith"], answer: 1 },
  { question: "Deacon Jones is credited with coining which football term?", choices: ["Blitz", "Sack", "Red zone", "Cover 2"], answer: 1 },
  { question: "Who holds the NFL record for most career interceptions by a safety?", choices: ["Ed Reed", "Ronnie Lott", "Paul Krause", "Dick LeBeau"], answer: 2 },
  { question: "Mean Joe Greene played for which team his entire career?", choices: ["Cleveland Browns", "Pittsburgh Steelers", "Dallas Cowboys", "Oakland Raiders"], answer: 1 },
  { question: "Which cornerback is known for 'No stats on the stat sheet'?", choices: ["Deion Sanders", "Darrelle Revis", "Mel Blount", "Rod Woodson"], answer: 0 },

  // ── Kickers & Special Teams ──
  { question: "Who scored the most points in NFL history?", choices: ["Adam Vinatieri", "Morten Andersen", "Gary Anderson", "Jason Hanson"], answer: 1 },
  { question: "What is the longest field goal ever kicked in an NFL regular season game?", choices: ["63 yards", "64 yards", "66 yards", "67 yards"], answer: 2 },
  { question: "Who holds the record for most consecutive extra points made?", choices: ["Adam Vinatieri", "Stephen Gostkowski", "Blair Walsh", "Jason Elam"], answer: 1 },

  // ── Miscellaneous / Trivia ──
  { question: "What do the letters 'AFC' stand for in NFL conference names?", choices: ["American Football Collective", "American Football Conference", "Athletic Football Conference", "American Federation Conference"], answer: 1 },
  { question: "In what year did the AFL and NFL officially merge?", choices: ["1966", "1968", "1970", "1972"], answer: 2 },
  { question: "Which team plays in the NFC South?", choices: ["Atlanta Falcons", "Baltimore Ravens", "Cincinnati Bengals", "Cleveland Browns"], answer: 0 },
  { question: "What is the official length of an NFL game (four quarters)?", choices: ["48 minutes", "60 minutes", "64 minutes", "70 minutes"], answer: 1 },
  { question: "Before the NFL Draft existed, how were players assigned to teams?", choices: ["Free agent signings only", "A territorial draft by region", "Teams bid for players in an open auction", "Assigned by the league commissioner"], answer: 1 },
  { question: "What year was the first NFL Draft held?", choices: ["1930", "1933", "1936", "1940"], answer: 2 },
  { question: "Who was the first overall pick in the first NFL Draft in 1936?", choices: ["Sid Luckman", "Jay Berwanger", "Sammy Baugh", "Don Hutson"], answer: 1 },
  { question: "How many players are on the field for each team during an NFL game?", choices: ["10", "11", "12", "13"], answer: 1 },
  { question: "A regulation NFL football must weigh between what range?", choices: ["12–14 oz", "14–15 oz", "15–17 oz", "14–16 oz"], answer: 1 },
  { question: "Which legendary coach famously said 'Winning isn't everything, it's the only thing'?", choices: ["Paul Brown", "Vince Lombardi", "Tom Landry", "George Halas"], answer: 1 },
  { question: "What is the name of the trophy awarded to the Super Bowl winner?", choices: ["The George Halas Trophy", "The Pete Rozelle Trophy", "The Vince Lombardi Trophy", "The Commissioner's Trophy"], answer: 2 },
  { question: "Which team was the first expansion franchise in the modern era to win a Super Bowl?", choices: ["Carolina Panthers", "Jacksonville Jaguars", "Tennessee Titans", "Tampa Bay Buccaneers"], answer: 3 },
  { question: "Peyton Manning was drafted by the Indianapolis Colts with the #1 pick. Which school did he play for?", choices: ["Alabama", "Florida", "Tennessee", "Ohio State"], answer: 2 },
  { question: "Which linebacker holds the NFL record for most career forced fumbles?", choices: ["Derrick Thomas", "Jason Taylor", "Ray Lewis", "Dwight Freeney"], answer: 0 },
  { question: "The Kansas City Chiefs play at what stadium?", choices: ["Arrowhead Stadium", "Chiefs Stadium", "Kauffman Stadium", "Ford Field"], answer: 0 },
  { question: "Which team has retired the most uniform numbers in NFL history?", choices: ["New York Giants", "Chicago Bears", "Dallas Cowboys", "Pittsburgh Steelers"], answer: 1 },
  { question: "What does 'QB Rating' (passer rating) max out at in the NFL?", choices: ["100", "115.8", "158.3", "200"], answer: 2 },
  { question: "Who holds the record for most career playoff wins as a starting quarterback?", choices: ["Joe Montana", "Peyton Manning", "Tom Brady", "John Elway"], answer: 2 },
  { question: "Which player was nicknamed 'The Galloping Ghost'?", choices: ["Jim Thorpe", "Red Grange", "Ernie Nevers", "Bronko Nagurski"], answer: 1 },
  { question: "True or False: An NFL team can score a 1-point safety.", choices: ["True — after a failed PAT attempt", "False — safeties are always 2 points", "True — on a conversion attempt only", "False — no such rule exists"], answer: 0 },
  { question: "Which team has won the most NFC Championship Games?", choices: ["San Francisco 49ers", "Dallas Cowboys", "Los Angeles Rams", "New York Giants"], answer: 1 },
  { question: "Which player returned a kickoff for a touchdown in Super Bowl XLVII?", choices: ["Devin Hester", "Jacoby Jones", "Percy Harvin", "Leon Washington"], answer: 1 },
  { question: "Who holds the NFL record for most career punt return touchdowns?", choices: ["Deion Sanders", "Brian Mitchell", "Eric Metcalf", "Dante Hall"], answer: 0 },
  { question: "The Pittsburgh Steelers' defense of the 1970s was nicknamed what?", choices: ["The Orange Crush", "The Steel Curtain", "The Purple People Eaters", "The Doomsday Defense"], answer: 1 },
  { question: "Which team's defense was nicknamed 'The Purple People Eaters'?", choices: ["Baltimore Ravens", "Minnesota Vikings", "New York Jets", "Los Angeles Rams"], answer: 1 },
  { question: "Who quarterbacked the New York Jets in their Super Bowl III victory?", choices: ["Bob Griese", "Joe Namath", "Len Dawson", "Earl Morrall"], answer: 1 },

  // ── Additional Trivia ──
  { question: "Who has the most Rushing Yards in Green Bay Packers history?", choices: ["Aaron Jones", "Jim Taylor", "Dorsey Levens", "Ahman Green"], answer: 3 },
  { question: "What year did the Cardinals move from St. Louis to Arizona", choices: ["1965", "1974", "1981", "1988"], answer: 3 },
  { question: "Who threw for the most yards in a single Super Bowl game?", choices: ["Nick Foles", "Tom Brady", "Dan Marino", "Patrick Mahomes"], answer: 1 },
  { question: "Which QB threw the most interceptions ever in a single game?", choices: ["Jim Hardy", "Ken Stabler", "Peyton Manning", "Nathan Peterman"], answer: 0 },
  { question: "How many teams has Peyton Manning played for?", choices: ["1", "3", "2", "1"], answer: 2 },
  { question: "Which is the oldest NFL Franchise", choices: ["Bears/Staleys", "Packers", "Cardinals", "Lions"], answer: 2 },
  { question: "What was the original name of the New York Jets?", choices: ["Giants", "Football Yankees", "Titans", "Flyers"], answer: 2 },
  { question: "First QB to throw for 5,000 Yards?", choices: ["Drew Brees", "Steve Young", "Dan Marino", "Brett Favre"], answer: 2 },
  { question: "Which two players SHARED the MVP Award?", choices: ["Brett Favre & Barry Sanders", "Steve Young & Kurt Warner", "Peyton Manning & Brett Favre", "LaDainian Tomlinson & Steve McNair"], answer: 0 },
  { question: "Who was the last player to win Back-to-Back MVP Awards?", choices: ["Peyton Manning", "Aaron Rodgers", "Lamar Jackson", "Tom Brady"], answer: 1 },
  { question: "What year were the Raiders established", choices: ["1955", "1960", "1963", "1966"], answer: 1 },
  { question: "What surface do the Arizona Cardinals play on?", choices: ["Matrix Turf", "Kentucky Bluegrass", "SIS Grass", "Bermuda Grass"], answer: 3 },
  { question: "Who was the last Giants player to win MVP?", choices: ["Y.A. Tittle", "Eli Manning", "Michael Strahan", "Lawrence Taylor"], answer: 3 },
  { question: "Who was the Defensive Player of the Year in 2023?", choices: ["Nick Bosa", "TJ Watt", "Myles Garrett", "Micah Parsons"], answer: 2 },
  { question: "Which Head Coach is responsible for the largest blown lead in NFL History?", choices: ["Jack Pardee", "Dan Quinn", "Jeff Saturday", "Brandon Staley"], answer: 2 },
  { question: "Who has the most Yards from Scrimmage in a single season?", choices: ["Chris Johnson", "Barry Sanders", "Marshall Faulk", "Derrick Henry"], answer: 0 },
  { question: "Which WR had the 'Helmet Catch'?", choices: ["Plaxico Burress", "Victor Cruz", "David Tyree", "Mario Manningham"], answer: 2 },
  { question: "Name the QB Career:\n-22,464 Pass Yards\n- 6,109 Rush Yards\n- 133 Pass TDs\n- 36 Rush TDs ", choices: ["Cam Newton", "Michael Vick", "Lamar Jackson", "Josh Allen"], answer: 1 },
  { question: "What was the Wind-Chill in the coldest game of all time (1982 AFC Championship)?", choices: ["-59°F", "-48°F", "-44°F", "-25°F"], answer: 0 },
  { question: "Which Dolphins quarterback led the team to a perfect 17-0 season in 1972?", choices: ["Craig Morton", "Greg Landry", "Dan Marino", "Bob Griese"], answer: 3 },
  { question: "Who has the record for most Receiving Yards in a game?", choices: ["Calvin Johnson", "Flipper Anderson", "Stephone Paige", "Julio Jones"], answer: 1 },
  { question: "What season did the Ravens win their first Super Bowl?", choices: ["2000", "2008", "2011", "2012"], answer: 0 },
  { question: "True or False: The Bengals have never won a Super Bowl.", choices: ["True", "False"], answer: 0 },
  { question: "Who was the MVP of Super Bowl X? (Cowboys vs Steelers)", choices: ["Franco Harris", "Roger Staubach", "Lynn Swann", "Terry Bradshaw"], answer: 2 },
  { question: "Who was the first team in win the Super Bowl in their home stadium?", choices: ["Buccaneers", "Rams", "Giants", "Colts"], answer: 0 },
  { question: "What is the most amount of Receiving Yards Antonio Brown ever had in a season?", choices: ["1,698", "1,943", "1,834", "1,572"], answer: 2 },
  { question: "Which legendary owner was known for his motto 'Just Win, Baby'?", choices: ["Mark Davis", "Jerry Jones", "Al Davis", "Lamar Hunt"], answer: 2 },
  { question: "Name the Packer Career:\n- 61,655 Pass Yards\n- 442 Pass TDs\n- 3.3% Int Rate\n- 1,786 Rush Yards?", choices: ["Bart Starr", "Brett Favre", "Aaron Rodgers", "Lynn Dickey"], answer: 1 },
  { question: "True or False: The Lions have been NFC Champions", choices: ["True", "False"], answer: 1 },
  { question: "LaDainian Tomlinson scored 186 points in 2006.\nWhich entire NFL franchise scored LESS points than LT did that same season?", choices: ["Oakland Raiders", "Cleveland Browns", "Tampa Bay Buccaneers", "Miami Dolphins"], answer: 0 },
  { question: "Which franchise is the ONLY one in NFL history that has never had a 4,000-yard passer in a single season?", choices: ["Cleveland Browns", "Jacksonville Jaguars", "Miami Dolphins", "Chicago Bears"], answer: 3 },
  { question: "True or False: Tom Brady has more Super Bowl rings than any single NFL franchise.", choices: ["True", "False"], answer: 0 },
  { question: "Which Franchise left Chicago to go to St. Louis?", choices: ["Bears", "Rams", "Cardinals", "Triangles"], answer: 2 },
  { question: "Which tight end holds the single-season record for most receiving yards by a TE?", choices: ["Rob Gronkowski", "Shannon Sharpe", "Travis Kelce", "Jimmy Graham"], answer: 2 },
  { question: "The Tampa Bay Buccaneers set the record for the longest losing streak in NFL history (Super Bowl Era).\nHow many consecutive games did they lose across 1976–77?", choices: ["26", "27", "29", "31"], answer: 0 },
  { question: "Which QB threw for 5,000+ yards in a season but did NOT win MVP that year?", choices: ["Peyton Manning", "Drew Brees", "Patrick Mahomes", "Tom Brady"], answer: 1 },
  { question: "True or False: Brett Favre once threw 6 touchdown passes in a playoff game.", choices: ["True", "False"], answer: 1 },
  { question: "True or False: Brett Favre once threw 6 interceptions in a playoff game.", choices: ["True", "False"], answer: 0 },
  { question: "Which QB has the highest single-season passer rating in NFL history?", choices: ["Tom Brady", "Dak Prescott", "Lamar Jackson", "Aaron Rodgers"], answer: 3 },
  { question: "Which team finished 0-16 before the Browns did in 2017?", choices: ["Raiders", "Lions", "Cardinals", "Browns Again"], answer: 1 },
  { question: "How many Super Bowls have the Los Angeles Chargers won?", choices: ["0", "2", "5", "1"], answer: 0 },
  { question: "Guess the All-Time QB:\n- 33,124 Pass Yards\n- 232 Pass TDs\n- 107 INTs\n- 96.8 Passer Rating", choices: ["Kerry Collins", "Steve Young", "Jake Plummer", "Patrick Mahomes"], answer: 1 },
  { question: "OVER or UNDER: Eddie Lacy has O/U 3,664.5 Career Rushing Yards.", choices: ["OVER", "UNDER"], answer: 1 },
  { question: "True or False: The Buccaneers were originally placed in the AFC West.", choices: ["True", "False"], answer: 0 },
  { question: "Which coach led the Chiefs to a Super Bowl victory?", choices: ["Romeo Crennel", "Herm Edwards", "Andy Reid", "John Madden"], answer: 2 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Fargus Marsh", "D'Ante Hightower", "Brayquan Dandridge", "Ventravian Winterbottom"], answer: 1 },
  { question: "How many Super Bowls have the Houston Texans won?", choices: ["5", "3", "0", "2"], answer: 2 },
  { question: "Guess the Career WR:\n- 5,630 Rec. Yards\n- 39 Rec. TDs\n- 457 Receptions", choices: ["Koren Robinson", "Kevin Curtis", "Javon Walker", "Nate Burleson"], answer: 3 },
  { question: "Who led the NFL in Passing TDs in 2001?", choices: ["Mike Vick", "Kurt Warner", "Tom Brady", "Marc Bulger"], answer: 1 },
  { question: "OVER or UNDER: Jonathan Stewart has O/U 46.5 Career Rushing TDs.", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "Guess the Career TE:\n- 5,291 Rec. Yards\n- 54 Rec. TDs\n- 450 Receptions", choices: ["Jordan Cameron", "Wesley Walls", "Tyler Conklin", "Dallas Goedert"], answer: 1 },
  { question: "Who is the Detroit Lions' all-time leader in receiving yards?", choices: ["Marvin Jones", "Amon-Ra St. Brown", "Brett Perriman", "Calvin Johnson"], answer: 3 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Smoke Monday", "Dequavious Drake", "Tavontay Van Der Berg", "Desharious Ashcastle"], answer: 0 },
  { question: "In what season did \"The Tackle\" occur?", choices: ["2002", "1996", "1999", "1997"], answer: 2 },
  { question: "OVER or UNDER: The Colts have O/U 1.5 Super Bowl victories all-time.", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "OVER or UNDER: The Cardinals have O/U 1.5 Super Bowl appearances all-time.", choices: ["OVER", "UNDER"], answer: 1 },
  { question: "What overall pick number was Charles Woodson drafted at?", choices: ["13", "4", "16", "2"], answer: 1 },
  { question: "What was the Chicago Bears's original team name?", choices: ["Staleys", "Cubs", "Stallions", "Bears"], answer: 0 },
  { question: "True or False: The Texans have reached a conference championship game.", choices: ["True", "False"], answer: 1 },
  { question: "Guess the Career QB:\n- 23,671 Pass Yards\n- 171 Pass TDs\n- 83 INTs\n- 89.5 Passer Rating", choices: ["Andrew Luck", "Josh McCown", "Joe Burrow", "Tua Tagovailoa"], answer: 0 },
  { question: "Which player threw the pass in the \"Helmet Catch\"?", choices: ["Peyton Manning", "Eli Manning", "Steve McNair", "Kurt Warner"], answer: 1 },
  { question: "Which WR has more Career Receiving TDs?", choices: ["Randy Moss", "Davante Adams", "Terrell Owens", "Larry Fitzgerald"], answer: 0 },
  { question: "Guess the Career RB:\n- 5,746 Rush Yards\n- 8,643 Yards from Scrimmage\n- 4.4 Yards per Carry\n- 30 Rush TDs", choices: ["Fred Jackson", "Garrison Hearst", "Tatum Bell", "Justin Fargas"], answer: 0 },
  { question: "Who is the Dallas Cowboys' all-time leader in receiving yards?", choices: ["Brandin Cooks", "Amari Cooper", "Jason Witten", "Michael Irvin"], answer: 2 },
  { question: "True or False: The first Super Bowl to go into overtime was Patriots vs Falcons.", choices: ["True", "False"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Pisa Tinoisamoa", "Zebrion Winterbottom", "Malcontavious Jargon", "Treqwan Linding"], answer: 0 },
  { question: "OVER or UNDER: The Raiders been located in O/U 3.5 cities.", choices: ["OVER", "UNDER"], answer: 1 },
  { question: "True or False: Tom Brady has won 7 Super Bowls.", choices: ["True", "False"], answer: 0 },
  { question: "Who won Offensive Rookie of the Year in 2010?", choices: ["Sam Bradford", "Mike Williams", "Mike Vick", "Maurkice Pouncey"], answer: 0 },
  { question: "How many Super Bowls have the Tampa Bay Buccaneers won?", choices: ["0", "2", "1", "3"], answer: 1 },
  { question: "Who won Offensive Rookie of the Year in 2025?", choices: ["Tetairoa McMillan", "Tyler Shough", "Jaxson Dart", "TreVeyon Henderson"], answer: 0 },
  { question: "OVER or UNDER: The Packers have O/U 12.5 NFL championships (all-time).", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Wonderful Monds", "Bresharius Crankshaw", "Trevontay Stormbreaker", "Rashontez Blackenstein"], answer: 0 },
  { question: "Who holds the NFL record for most career receiving TDs by a tight end?", choices: ["Jimmy Graham", "Mark Andrews", "Antonio Gates", "Rob Gronkowski"], answer: 2 },
  { question: "True or False: Steve Young made his first NFL starts for the Buccaneers.", choices: ["True", "False"], answer: 0 },
  { question: "Guess the Career TE:\n- 2,002 Rec. Yards\n- 16 Rec. TDs\n- 219 Receptions", choices: ["Dalton Schultz", "Kellen Winslow", "Cade Otton", "Logan Thomas"], answer: 3 },
  { question: "True or False: The Bears have won 2 Super Bowls.", choices: ["True", "False"], answer: 1 },
  { question: "OVER or UNDER: The Commanders have O/U 2.5 Super Bowl victories all-time.", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "Who won Offensive Rookie of the Year in 2008?", choices: ["Matt Ryan", "Ocho Cinco", "Ryan Clady", "Matt Forte"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Pig Prather", "Ja'Vontavious Van Der Berg", "Jammie Johnson IV", "Dequavious Lamb"], answer: 0 },
  { question: "What was the Kansas City Chiefs's original team name?", choices: ["Texans", "Rivermen", "Renegades", "Wildcats"], answer: 0 },
  { question: "Guess the All-Time WR:\n- 7,624 Rec. Yards\n- 54 Rec. TDs\n- 630 Receptions", choices: ["Devin Hester", "Randall Cobb", "Brandin Cooks", "Jamison Crowder"], answer: 1 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Varce Upton", "BenJarvus Green-Ellis", "Nyjah West", "Deontarius Sentra-Benz"], answer: 1 },
  { question: "True or False: Wide Receivers have more MVP Awards than Defensive Players.", choices: ["True", "False"], answer: 1 },
  { question: "OVER or UNDER: The Seahawks have O/U 1.5 Super Bowl losses all-time.", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "How many rushing TDs did LaDainian Tomlinson score in 2006?", choices: ["30", "24", "28", "26"], answer: 2 },
  { question: "Guess the Career TE:\n- 2,501 Rec. Yards\n- 26 Rec. TDs\n- 221 Receptions", choices: ["Heath Miller", "Tyler Eifert", "T.J. Hockenson", "Marcus Pollard"], answer: 1 },
  { question: "What year was the Saints' first season?", choices: ["1965", "1967", "1970", "1961"], answer: 1 },
  { question: "True or False: The Packers won the first two Super Bowls.", choices: ["True", "False"], answer: 0 },
  { question: "True or False: The Kansas City Chiefs were originally called the Dallas Texans.", choices: ["True", "False"], answer: 0 },
  { question: "Who won Super Bowl XXXI?", choices: ["Cowboys", "Broncos", "Packers", "Patriots"], answer: 2 },
  { question: "Guess the All-Time QB:\n- 35,989 Pass Yards\n- 243 Pass TDs\n- 92 INTs\n- 98.3 Passer Rating", choices: ["Dak Prescott", "Tyrod Taylor", "Jay Cutler", "Ryan Fitzpatrick"], answer: 0 },
  { question: "What year was the Commanders' first season?", choices: ["1932", "1928", "1937", "1930"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Dick Shiner", "Shaqavian Goldsworth", "Kendarious McThunderson", "La'Vondrius Willowbrook"], answer: 0 },
  { question: "Who holds the NFL record for most rushing yards in a single season?", choices: ["Jonathan Taylor", "Felix Jones", "OJ Simpson", "Eric Dickerson"], answer: 3 },
  { question: "Guess the Career TE:\n- 11,841 Rec. Yards\n- 116 Rec. TDs\n- 955 Receptions", choices: ["Jason Witten", "Antonio Gates", "Rob Gronkowski", "Frank Wycheck"], answer: 1 },
  { question: "Who won Defensive Player of the Year in 2009?", choices: ["Darrelle Revis", "Jared Allen", "Charles Woodson", "James Harrison"], answer: 2 },
  { question: "OVER or UNDER: The Ravens have O/U 1.5 Super Bowl victories all-time.", choices: ["OVER", "UNDER"], answer: 0 },
  { question: "Which team was originally called the Boston Braves.", choices: ["Washington Commanders", "NY Giants", "New England Patriots", "Buffalo Bills"], answer: 0 },
  { question: "In what season did \"28-3 Comeback\" occur?", choices: ["2014", "2019", "2016", "2017"], answer: 2 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Takkarist McKinley", "Bresharius Wainwright III", "Desharious St. Germaine", "Javorius Featherworth"], answer: 0 },
  { question: "Who is the Kansas City Chiefs' all-time leader in receiving yards?", choices: ["Dwayne Bowe", "Travis Kelce", "Tyreek Hill", "Tony Gonzalez"], answer: 1 },
  { question: "True or False: Tom Brady has more division titles than the entire Jets franchise has in the Super Bowl era.", choices: ["True", "False"], answer: 0 },
  { question: "Guess the All-Time WR:\n- 7,499 Rec. Yards\n- 54 Rec. TDs\n- 637 Receptions", choices: ["Mike Williams", "Michael Crabtree", "Brandon LaFell", "Amari Cooper"], answer: 1 },
  { question: "True or False: The Tennessee Titans were originally called the Houston Oilers.", choices: ["True", "False"], answer: 0 },
  { question: "OVER or UNDER: Eddie Kennison has O/U 8,346.5 Career Receiving Yards.", choices: ["OVER", "UNDER"], answer: 1 },
  { question: "What year was the Falcons' first season?", choices: ["1965", "1972", "1961", "1959"], answer: 0 },
  { question: "Who is the Los Angeles Rams' all-time leader in rushing yards?", choices: ["Todd Gurley", "Eric Dickerson", "Marshall Faulk", "Steven Jackson"], answer: 3 },
  { question: "How many yards from scrimmage did Chris Johnson have in 2009?", choices: ["2,509", "2,496", "2,499", "2,505"], answer: 0 },
  { question: "Who is the San Francisco 49ers' 2nd all-time leader in receiving yards?", choices: ["Deebo Samuel Sr.", "Terrell Owens", "Jerry Rice", "Vernon Davis"], answer: 1 },
  { question: "Guess the All-Time QB:\n- 27,989 Pass Yards\n- 212 Pass TDs\n- 210 INTs\n- 70.9 Passer Rating", choices: ["Terry Bradshaw", "Peyton Manning", "Troy Aikman", "Matt Hasselbeck"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Nnamdi Asomugha", "Breshawn Slycastle", "La'Vondrius McWeeson", "Ventravian Penny"], answer: 0 },
  { question: "Who led the NFL in Rushing Yards in 2005?", choices: ["Tiki Barber", "LaDainian Tomlinson", "Edgerrin James", "Shaun Alexander"], answer: 3 },
  { question: "True or False: The Browns have OVER 3.5 NFL championships.", choices: ["True", "False"], answer: 0 },
  { question: "OVER or UNDER: The Cowboys have O/U 5.5 NFL championships/Super Bowls (all-time).", choices: ["OVER", "UNDER"], answer: 1 },
  { question: "Guess the All-Time QB:\n- 12,741 Pass Yards\n- 67 Pass TDs\n- 50 INTs\n- 86.9 Passer Rating", choices: ["Colin Kaepernick", "Rex Grossman", "Mac Jones", "Gardner Minshew"], answer: 2 },
  { question: "Who is the Buffalo Bills' all-time leader in receiving yards?", choices: ["Stefon Diggs", "Amari Cooper", "Brandin Cooks", "Andre Reed"], answer: 3 },
  { question: "True or False: Ray Lewis won Super Bowl MVP with ZERO sacks in that game.", choices: ["True", "False"], answer: 0 },
  { question: "Which of these was an ACTUAL NFL player?", choices: ["Dekambrian Crankshaw", "Ventravian Winterbottom", "Rashaan Salaam", "Mergatroyd Smoot"], answer: 2 },
  { question: "Who is the Philadelphia Eagles' all-time leader in rushing yards?", choices: ["Randall Cunningham", "Saquon Barkley", "LeSean McCoy", "Wilbert Montgomerey"], answer: 2 },
  { question: "Guess the Career RB:\n- 78 Total TDs\n- 69 Rush TDs\n- 4.1 Yards per Carry\n- 15,122 Yards from Scrimmage", choices: ["Ray Rice", "Steven Jackson", "Laurence Maroney", "Willie Parker"], answer: 1 },
  { question: "True or False: Terry Bradshaw has won 4 Super Bowls.", choices: ["True", "False"], answer: 0 },
  { question: "Who led the NFL in Rushing Yards in 2024?", choices: ["James Cook III", "Jahmyr Gibbs", "Derrick Henry", "Josh Jacobs"], answer: 2 },
  { question: "OVER or UNDER: The Vikings have O/U 1.5 NFL championships (all-time).", choices: ["OVER", "UNDER"], answer: 1 },
];

// RIVALRY_BASE_COUNT marks the boundary between hand-curated questions and the
// auto-filtered pool. New assignments should never draw past this index.
export const RIVALRY_BASE_COUNT = _BASE.length;
export const RIVALRY_QUESTIONS = [..._BASE, ..._buildPool(_BASE, LEGACY, CALENDAR)];
