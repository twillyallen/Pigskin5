// ╔═══════════════════════════════════════════════════════════════════════╗
// ║ LIVE QUESTION TEMPLATES ── START                                      ║
// ║ The generator keeps everything between START and END exactly as it   ║
// ║ is (including your edits) every time it rewrites this file.          ║
// ╚═══════════════════════════════════════════════════════════════════════╝
//
// HOW TO USE
//   Copy a line into questions.js under a date. Replace PLAYER NAME and
//   TEAM; leave LINE as-is. Leave `answer` OUT. That's what makes it live.
//   choices: []     → filled with 4 choices automatically
//   choices: [...]  → your choices kept, only the answer is filled
//   Stats count every game finished by fill day (the day before the quiz).
//   Check before pushing:  py fill_live_questions.py --check
//
    "2026-11-03": { //Tuesday
    event: "",
    questions: [
// ── 1. NFL LEADER (anyone in the league) ─────────────────────────────────
{ live: true, question: "Who leads the NFL in passing yards?", choices: [] },
{ live: true, question: "Who leads the NFL in passing TDs?", choices: [] },
{ live: true, question: "Who leads the NFL in interceptions thrown?", choices: [] },
{ live: true, question: "Who leads the NFL in rushing yards?", choices: [] },
{ live: true, question: "Who leads the NFL in rushing TDs?", choices: [] },
{ live: true, question: "Who leads the NFL in receptions?", choices: [] },
{ live: true, question: "Who leads the NFL in receiving yards?", choices: [] },
{ live: true, question: "Who leads the NFL in receiving TDs?", choices: [] },
{ live: true, question: "Who leads the NFL in scrimmage yards?", choices: [] },
{ live: true, question: "Who leads the NFL in sacks?", choices: [] },
{ live: true, question: "Who leads the NFL in interceptions?", choices: [] },
{ live: true, question: "Who leads the NFL in tackles?", choices: [] },
{ live: true, question: "Who leads the NFL in field goals made?", choices: [] },
//
// ── 2. POSITION LEADER (only that position) ──────────────────────────────
{ live: true, question: "Which QB has the most rushing yards?", choices: [] },
{ live: true, question: "Which QB has the most rushing TDs?", choices: [] },
{ live: true, question: "Which running back has the most receptions?", choices: [] },
{ live: true, question: "Which running back has the most receiving yards?", choices: [] },
{ live: true, question: "Which wide receiver has the most rushing yards?", choices: [] },
{ live: true, question: "Which tight end has the most receptions?", choices: [] },
{ live: true, question: "Which tight end has the most receiving yards?", choices: [] },
{ live: true, question: "Which tight end has the most receiving TDs?", choices: [] },
//
// ── 3. ROOKIE LEADER (this season's rookies only) ────────────────────────
{ live: true, question: "Which rookie QB has the most passing yards?", choices: [] },
{ live: true, question: "Which rookie QB has the most passing TDs?", choices: [] },
{ live: true, question: "Which rookie running back has the most rushing yards?", choices: [] },
{ live: true, question: "Which rookie running back has the most scrimmage yards?", choices: [] },
{ live: true, question: "Which rookie wide receiver has the most receptions?", choices: [] },
{ live: true, question: "Which rookie wide receiver has the most receiving yards?", choices: [] },
{ live: true, question: "Which rookie tight end has the most receiving yards?", choices: [] },
{ live: true, question: "Which rookie defender has the most sacks?", choices: [] },
{ live: true, question: "Which rookie defender has the most tackles?", choices: [] },
{ live: true, question: "Which rookie has the most scrimmage yards?", choices: [] },
//
// ── 4. LEADER, YOUR CHOICES (if the real leader isn't listed on fill day,
//       it replaces your lowest choice) ────────────────────────────────────
{ live: true, question: "Who leads the NFL in sacks?", choices: ["PLAYER NAME", "PLAYER NAME", "PLAYER NAME", "PLAYER NAME"] },
//
// ── 5. HEAD-TO-HEAD (choices REQUIRED: 2 to 4 players) ───────────────────
{ live: true, question: "Which player has more passing yards?", choices: ["PLAYER NAME", "PLAYER NAME", "PLAYER NAME", "PLAYER NAME"] },
{ live: true, question: "Which player has more rushing yards?", choices: ["PLAYER NAME", "PLAYER NAME", "PLAYER NAME", "PLAYER NAME"] },
{ live: true, question: "Which player has more receiving yards?", choices: ["PLAYER NAME", "PLAYER NAME", "PLAYER NAME", "PLAYER NAME"] },
{ live: true, question: "Which player has more sacks?", choices: ["PLAYER NAME", "PLAYER NAME"] },
//
// ── 6. EXACT NUMBER (one player) ─────────────────────────────────────────
{ live: true, question: "How many passing yards does PLAYER NAME have?", choices: [] },
{ live: true, question: "How many passing TDs does PLAYER NAME have?", choices: [] },
{ live: true, question: "How many rushing yards does PLAYER NAME have?", choices: [] },
{ live: true, question: "How many receiving yards does PLAYER NAME have?", choices: [] },
{ live: true, question: "How many receptions does PLAYER NAME have?", choices: [] },
{ live: true, question: "How many sacks does PLAYER NAME have?", choices: [] },
//
// ── 7. OVER / UNDER (LINE is set from real stats on fill day, 10-25% above
//       or below the real total. Or type your own number, ending in .5)
{ live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE passing yards.", choices: [] },
{ live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE passing TDs.", choices: [] },
{ live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE rushing yards.", choices: [] },
{ live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE receiving yards.", choices: [] },
{ live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE sacks.", choices: [] },
//
// ── 8. TEAMS (TEAM = nickname: Cowboys, 49ers, Chiefs...) ────────────────
{ live: true, question: "What is the TEAM' record?", choices: [] },
{ live: true, question: "Which team has scored the most points?", choices: [] },
{ live: true, question: "Which team has allowed the fewest points?", choices: [] },
{ live: true, question: "Which team has the best point differential?", choices: [] },
// "best record" / "worst record" work too, but ties for first are common
// and a tie can't be filled. Use them late in the season, if at all:
{ live: true, question: "Which team has the best record?", choices: [] },
    
//
// ╔═══════════════════════════════════════════════════════════════════════╗
// ║ LIVE QUESTION TEMPLATES ── END                                        ║
// ╚═══════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════
// AUTO-GENERATED by Pigskin5 Question Generator
// Generated: 2026-11-21 15:04
// Days: 20
// ═══════════════════════════════════════════════════════════
// REVIEW CHECKLIST:
//   [ ] Spot-check 5 random answers for accuracy
//   [ ] Verify no duplicate questions across days
//   [ ] Check difficulty feels balanced
//   [ ] Merge into your main questions.js CALENDAR object
// ═══════════════════════════════════════════════════════════

const GENERATED = {
    "2026-11-23": { //Monday
    event: "",
    questions: [
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE scrimmage yards.", choices: [] },
    { question: "Who won Offensive Rookie of the Year in 2023?", choices: ["Adam Thielen", "Reggie Bush", "Muhsin Muhammad", "C.J. Stroud"], answer: 3 },
    { question: "What year was the Jets' first season?", choices: ["1958", "1965", "1954", "1960"], answer: 3 },
    { question: "True or False: The Carolina Panthers play their home games at Acrisure Stadium.", choices: ["True", "False"], answer: 1 },
    { question: "Guess the Career QB:\n- 32,942 Pass Yards\n- 165 Pass TDs\n- 141 INTs\n- 81.6 Passer Rating", choices: ["Jon Kitna", "Baker Mayfield", "Alex Smith", "Troy Aikman"], answer: 3 },
    ],
  },
    "2026-11-24": { //Tuesday
    event: "",
    questions: [
    { question: "Who had more rushing yards: Curtis Martin (2004) or LeSean McCoy (2013)?", choices: ["Curtis Martin (2004)", "LeSean McCoy (2013)"], answer: 0 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE sacks.", choices: [] },
    { question: "OVER or UNDER: Derek Carr has O/U 120 Career Interceptions Thrown.", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "True or False: The New York Giants play in the AFC South.", choices: ["True", "False"], answer: 1 },
    { question: "How many career passing yards does Tom Brady have (NFL all-time record)?", choices: ["89,214", "80,712", "81,506", "95,742"], answer: 0 },
    ],
  },
    "2026-11-25": { //Wednesday
    event: "",
    questions: [
    { question: "Which WR has more Career Receiving Yards?", choices: ["Larry Fitzgerald", "Reggie Wayne", "Randy Moss", "Isaac Bruce"], answer: 0 },
    { question: "OVER or UNDER: The Rams have been located in O/U 2.5 cities.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Devontarius Hammersmith", "Peter St. Germaine", "Booger McFarland", "Piggy Fender"], answer: 2 },
    { question: "What division do the Denver Broncos play in?", choices: ["AFC North", "NFC East", "AFC West", "AFC South"], answer: 2 },
    { question: "Guess the Career RB:\n- 3,351 Rush Yards\n- 14 Rush TDs\n- 4.9 Yards per Carry", choices: ["Brian Robinson", "Jaylen Warren", "Nick Chubb", "Stevan Ridley"], answer: 1 },
    ],
  },
    "2026-11-26": { //Thursday
    event: "",
    questions: [
    { question: "Guess the Career RB:\n- 2,370 Rush Yards\n- 18 Rush TDs\n- 4.5 Yards per Carry\n- 23 Total TDs", choices: ["T.J. Yeldon", "Nick Chubb", "Jeff Wilson", "Austin Ekeler"], answer: 2 },
    { question: "True or False: The Seattle Seahawks play their home games at Bank of America Stadium.", choices: ["True", "False"], answer: 1 },
    { live: true, question: "Who leads the NFL in scrimmage yards?", choices: [] },
    { question: "OVER or UNDER: LenDale White has O/U 5 Career Total TDs.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which QB has more Career Passing Yards?", choices: ["Peyton Manning", "Dan Marino", "Matthew Stafford", "Aaron Rodgers"], answer: 3 },
    ],
  },
    "2026-11-27": { //Friday
    event: "",
    questions: [
    { question: "OVER or UNDER: Bijan Robinson has O/U 40 Career Rushing TDs.", choices: ["OVER", "UNDER"], answer: 1 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE interceptions thrown.", choices: [] },
    { question: "Guess the Career QB:\n- 23,676 Pass Yards\n- 136 Pass TDs\n- 91 INTs\n- 84.4 Passer Rating", choices: ["Steve McNair", "Jason Campbell", "Drew Bledsoe", "Trent Green"], answer: 0 },
    { question: "Which QB was drafted #1 overall in 2007?", choices: ["Matthew Stafford", "Mario Williams", "JaMarcus Russell", "Reggie Bush"], answer: 2 },
    { question: "True or False: The Browns have appeared in a Super Bowl.", choices: ["True", "False"], answer: 1 },
    ],
  },
    "2026-11-28": { //Saturday
    event: "",
    questions: [
    { question: "What year was the Titans' first season?", choices: ["1956", "1963", "1960", "1958"], answer: 2 },
    { question: "How many career total touchdowns does Ezekiel Elliott have?", choices: ["88", "114", "64", "79"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Fredrick Drakesworth", "Tavarius Bonecastle", "Treshon Boonclap", "Barkevious Mingo"], answer: 3 },
    { question: "True or False: The Tennessee Titans were originally called the Houston Oilers.", choices: ["True", "False"], answer: 0 },
    { question: "Which coach led the Steelers to a Super Bowl victory?", choices: ["Andy Reid", "Matt LaFleur", "Herm Edwards", "Mike Tomlin"], answer: 3 },
    ],
  },
    "2026-11-29": { //Sunday
    event: "",
    questions: [
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE passing TDs.", choices: [] },
    { question: "Who led the NFL in Receiving Yards in 2020?", choices: ["Cooper Kupp", "Stefon Diggs", "Antonio Brown", "Julio Jones"], answer: 1 },
    { question: "Which coach led the Raiders to a Super Bowl victory?", choices: ["John Madden", "Vince Lombardi", "Marv Levy", "Mike Ditka"], answer: 0 },
    { question: "What division do the Atlanta Falcons play in?", choices: ["NFC West", "NFC South", "AFC West", "AFC North"], answer: 1 },
    { question: "Guess the Career QB:\n- 68,201 Pass Yards\n- 513 Pass TDs\n- 223 INTs\n- 98.1 Passer Rating", choices: ["Eli Manning", "Joe Flacco", "Peyton Manning", "Matt Ryan"], answer: 2 },
    ],
  },
    "2026-11-30": { //Monday
    event: "",
    questions: [
    { question: "Guess the Career WR:\n- 6,468 Rec. Yards\n- 33 Rec. TDs\n- 426 Receptions", choices: ["Jerry Rice", "David Boston", "Kevin Johnson", "Terry Glenn"], answer: 3 },
    { question: "Who had more rushing yards: Arian Foster (2010) or Kareem Hunt (2017)?", choices: ["Arian Foster (2010)", "Kareem Hunt (2017)"], answer: 0 },
    { question: "True or False: The Detroit Lions have won a Super Bowl.", choices: ["True", "False"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Treshon Whistleblower", "Mecole Hardman", "Tavarius Bonecastle", "Jermaine St. Germaine"], answer: 1 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE receiving TDs.", choices: [] },
    ],
  },
    "2026-12-01": { //Tuesday
    event: "",
    questions: [
    { question: "True or False: Dan Marino retired without ever winning a Super Bowl.", choices: ["True", "False"], answer: 0 },
    { question: "Who is the NFL's all-time career leader in rushing touchdowns?", choices: ["LaDainian Tomlinson", "Marcus Allen", "Emmitt Smith", "Walter Payton"], answer: 2 },
    { question: "OVER or UNDER: The Falcons have O/U 0.5 Super Bowl victories all-time.", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "Guess the Career QB:\n- 20,022 Pass Yards\n- 130 Pass TDs\n- 52 INTs\n- 97.7 Passer Rating", choices: ["Deshaun Watson", "Trevor Lawrence", "Lamar Jackson", "Drew Bledsoe"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Ventravian Butterfield", "Luiji Vilain", "George Goldsworth", "Piggy Junior"], answer: 1 },
    ],
  },
    "2026-12-02": { //Wednesday
    event: "",
    questions: [
    { live: true, question: "Who leads the NFL in interceptions thrown?", choices: [] },
    { question: "What year did the Rams relocate to Los Angeles?", choices: ["2011", "2020", "2016", "2012"], answer: 2 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Traequan Bonecastle", "Zak Zinter", "Malcontavious Pennywhistle", "Markson Hartfordshire"], answer: 1 },
    { question: "Which player caught the game-winning play in the \"Helmet Catch\"?", choices: ["Tony Romo", "Peyton Manning", "Jerome Bettis", "David Tyree"], answer: 3 },
    { question: "True or False: Patrick Mahomes has won 3 Super Bowls.", choices: ["True", "False"], answer: 0 },
    ],
  },
    "2026-12-03": { //Thursday
    event: "",
    questions: [
    { question: "In what season did the \"Minneapolis Miracle\" occur?", choices: ["2017", "2015", "2020", "2016"], answer: 0 },
    { live: true, question: "Who leads the NFL in receiving TDs?", choices: [] },
    { question: "Guess the Career RB:\n- 3,651 Rush Yards\n- 13 Rush TDs\n- 4.2 Yards per Carry", choices: ["Mewelde Moore", "Clinton Portis", "Maurice Morris", "Shonn Greene"], answer: 2 },
    { question: "Who had more passing yards: Joe Burrow (2024) or Peyton Manning (2000)?", choices: ["Joe Burrow (2024)", "Peyton Manning (2000)"], answer: 0 },
    { question: "OVER or UNDER: Doug Baldwin has O/U 6,700 Career Receiving Yards.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
    "2026-12-04": { //Friday
    event: "",
    questions: [
    { question: "Which of these was an ACTUAL NFL player?", choices: ["DJ Glaze", "Zackson Thundergood", "Zecharion Fairweather", "Dequavious St. Germaine"], answer: 0 },
    { live: true, question: "Which running back has the most receiving TDs?", choices: [] },
    { question: "True or False: The Miami Dolphins play their home games at Raymond James Stadium.", choices: ["True", "False"], answer: 1 },
    { question: "OVER or UNDER: The Panthers have O/U 1.5 Super Bowl appearances all-time.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which team did the Ravens defeat in Super Bowl XLVII?", choices: ["Patriots", "Chiefs", "Buccaneers", "49ers"], answer: 3 },
    ],
  },
    "2026-12-05": { //Saturday
    event: "",
    questions: [
    { question: "True or False: Joe Montana has won 5 Super Bowls.", choices: ["True", "False"], answer: 1 },
    { question: "OVER or UNDER: Aaron Rodgers has O/U 150 Career Interceptions Thrown.", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "Guess the Career QB:\n- 34,982 Pass Yards\n- 223 Pass TDs\n- 169 INTs\n- 82.3 Passer Rating", choices: ["Cam Newton", "Ryan Fitzpatrick", "Baker Mayfield", "Trent Green"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Isaiahh Loudermilk", "Piggy Fender", "Sofia Allen-Finn", "Bender Willowbrook"], answer: 0 },
    { question: "Who is the NFL's all-time career leader in passing yards?", choices: ["Peyton Manning", "Brett Favre", "Drew Brees", "Tom Brady"], answer: 3 },
    ],
  },
    "2026-12-06": { //Sunday
    event: "",
    questions: [
    { question: "Which player caught the “Immaculate Reception”?", choices: ["Rocky Bleier", "John Stallworth", "Lynn Swann", "Franco Harris"], answer: 3 },
    { question: "OVER or UNDER: Marcus Mariota has O/U 18,500 Career Passing Yards.", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "Guess the Career RB:\n- 6,554 Rush Yards\n- 51 Total TDs\n- 42 Rush TDs\n- 4.1 Yards per Carry", choices: ["James Conner", "Arian Foster", "Zack Moss", "Le'Veon Bell"], answer: 3 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["D'Brickashaw Ferguson", "La'Dain Dandridge", "Benedictus Thundergoose", "Tennison Thundergood"], answer: 0 },
    { question: "Which NFL team plays their home games at Caesars Superdome?", choices: ["New Orleans Saints", "Buffalo Bills", "Washington Commanders", "Detroit Lions"], answer: 0 },
    ],
  },
    "2026-12-07": { //Monday
    event: "",
    questions: [
    { question: "True or False: The Commanders have won 4 Super Bowls.", choices: ["True", "False"], answer: 1 },
    { question: "What overall pick number was Bo Jackson drafted at?", choices: ["1", "12", "15", "6"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Zohnathan Allen-Finn", "Tashard Choice", "Traequan Ashcastle", "Quantrell Crankshaw"], answer: 1 },
    { live: true, question: "Who leads the NFL in passing TDs?", choices: [] },
    { question: "Guess the Career QB:\n- 32,295 Pass Yards\n- 233 Pass TDs\n- 101 INTs\n- 94.6 Passer Rating", choices: ["Josh Allen", "Jay Cutler", "Joe Burrow", "Jameis Winston"], answer: 0 },
    ],
  },
    "2026-12-08": { //Tuesday
    event: "",
    questions: [
    { question: "OVER or UNDER: Chuba Hubbard has O/U 4,100 Career Rushing Yards.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which QB has more Career Passing TDs?", choices: ["Aaron Rodgers", "Drew Brees", "Matthew Stafford", "Philip Rivers"], answer: 1 },
    { question: "Which franchise originally drafted Russell Wilson?", choices: ["Seahawks", "Giants", "Steelers", "Raiders"], answer: 0 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE total tackles.", choices: [] },
    { question: "Guess the Career RB:\n- 2,370 Rush Yards\n- 18 Rush TDs\n- 4.5 Yards per Carry\n- 23 Total TDs", choices: ["Chris Carson", "Jeff Wilson", "Tyler Allgeier", "Kareem Hunt"], answer: 1 },
    ],
  },
    "2026-12-09": { //Wednesday
    event: "",
    questions: [
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Ruke Goldsworth", "Malcontavious Pennywhistle", "George Johnson", "Divine Deablo"], answer: 3 },
    { question: "Who is the Pittsburgh Steelers' all-time leader in passing yards?", choices: ["Terry Bradshaw", "Kordell Stewart", "Neil O'Donnell", "Ben Roethlisberger"], answer: 3 },
    { question: "Who holds the NFL record for most rushing yards in a single season?", choices: ["Eric Dickerson", "Marcus Allen", "Adrian Peterson", "Jamal Lewis"], answer: 0 },
    { question: "Who won Offensive Rookie of the Year in 2003?", choices: ["Justin Fargas", "Jerry Porter", "Anquan Boldin", "Jerramy Stevens"], answer: 2 },
    { question: "OVER or UNDER: Cam Newton has O/U 34,500 Career Passing Yards.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
    "2026-12-10": { //Thursday
    event: "",
    questions: [
    { question: "OVER or UNDER: The Dolphins have O/U 1.5 Super Bowl victories all-time.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["La'Dain Nickelstein", "HaHa Clinton-Dix", "Hingle McCringleberry", "Jaqwellius Finnenbaum"], answer: 1 },
    { question: "Guess the Career QB:\n- 21,909 Pass Yards\n- 133 Pass TDs\n- 91 INTs\n- 86.0 Passer Rating", choices: ["Tua Tagovailoa", "Sam Darnold", "Jacoby Brissett", "David Garrard"], answer: 1 },
    { question: "Who holds the NFL record for most career receiving yards?", choices: ["Marvin Harrison", "Andre Johnson", "Anquan Boldin", "Jerry Rice"], answer: 3 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE rushing TDs.", choices: [] },
    ],
  },
    "2026-12-11": { //Friday
    event: "",
    questions: [
    { question: "Which NFL team plays their home games at Raymond James Stadium?", choices: ["San Francisco 49ers", "Houston Texans", "Green Bay Packers", "Tampa Bay Buccaneers"], answer: 3 },
    { question: "True or False: The Tampa Bay Buccaneers play in the NFC West.", choices: ["True", "False"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Tyroil Smoochie-Wallace", "Lil'Jordan Marcus", "Ifeanyi Ohalete", "Donkey Teeth"], answer: 2 },
    { question: "Which player is associated with the \"Philly Special\"?", choices: ["Jay Cutler", "Joe Flacco", "Blake Bortles", "Nick Foles"], answer: 3 },
    { question: "OVER or UNDER: John Brown has O/U 40 Career Receiving TDs.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
    "2026-12-12": { //Saturday
    event: "",
    questions: [
    { question: "What division do the Cincinnati Bengals play in?", choices: ["AFC North", "AFC West", "NFC West", "NFC East"], answer: 0 },
    { question: "OVER or UNDER: The Packers have O/U 13.5 NFL championships (all-time).", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "What overall pick number was Tony Mandarich drafted at?", choices: ["14", "2", "12", "13"], answer: 1 },
    { question: "Guess the Career WR:\n- 3,944 Rec. Yards\n- 16 Rec. TDs\n- 314 Receptions", choices: ["Reggie Wayne", "Steve Johnson", "Santana Moss", "Bryant Johnson"], answer: 3 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Tutan Reyes", "Hingle McCringleberry", "Ja'Vontavious Hartfordshire", "Johnson Fettergun II"], answer: 0 },
    ],
  },
};