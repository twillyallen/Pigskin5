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
// Generated: 2026-10-31 07:30
// Days: 6
// ═══════════════════════════════════════════════════════════
// REVIEW CHECKLIST:
//   [ ] Spot-check 5 random answers for accuracy
//   [ ] Verify no duplicate questions across days
//   [ ] Check difficulty feels balanced
//   [ ] Merge into your main questions.js CALENDAR object
// ═══════════════════════════════════════════════════════════

const GENERATED = {
    "2026-11-03": { //Tuesday
    event: "",
    questions: [
    { live: true, question: "How many field goals made does Andre Szmyt have?", choices: [] },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Tretavious Humperdink", "Marquaveon Thunderclap", "Isaiahh Loudermilk", "D'Markus Winterbottom"], answer: 2 },
    { question: "True or False: The Carolina Panthers play their home games at Highmark Stadium.", choices: ["True", "False"], answer: 1 },
    { question: "Guess the Career QB:\n- 13,493 Pass Yards\n- 96 Pass TDs\n- 36 INTs\n- 95.8 Passer Rating", choices: ["Jordan Love", "Bryce Young", "Derek Anderson", "Gus Frerotte"], answer: 0 },
    { question: "OVER or UNDER: Alex Smith has O/U 210 Career Passing TDs.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
    "2026-11-04": { //Wednesday
    event: "",
    questions: [
    { question: "True or False: Terry Bradshaw has won 5 Super Bowls.", choices: ["True", "False"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Jaqwellius Henrich", "Rashaan Salaam", "Devontarius Bonecastle", "Johnson Martin III"], answer: 1 },
    { question: "What overall pick number was Ryan Leaf drafted at?", choices: ["14", "7", "15", "2"], answer: 3 },
    { question: "Guess the Career WR:\n- 15,934 Rec. Yards\n- 153 Rec. TDs\n- 1,078 Receptions", choices: ["Nate Burleson", "Muhsin Muhammad", "Terrell Owens", "Bernard Berrian"], answer: 2 },
    { question: "OVER or UNDER: Cameron Brate has O/U 45 Career Receiving TDs.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
    "2026-11-05": { //Thursday
    event: "",
    questions: [
    { question: "How many longest fg return td did Antonio Cromartie record?", choices: ["118", "104", "114", "109"], answer: 3 },
    { question: "What year did the Cardinals relocate to Arizona?", choices: ["1993", "1984", "1988", "1986"], answer: 2 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Ladel Hammersmith", "Devontarius Brightwater", "Ja'Vontavious Butterfield", "Dee Virgin"], answer: 3 },
    { question: "OVER or UNDER: Patrick Mahomes has O/U 0.5 Super Bowl Victories.", choices: ["OVER", "UNDER"], answer: 0 },
    { live: true, question: "Which rookie kicker has the most field goals made?", choices: [] },
    ],
  },
    "2026-11-06": { //Friday
    event: "",
    questions: [
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Markson McNeail", "Peter Van Der Berg", "Jaqwellius Whistleblower", "Beau Brade"], answer: 3 },
    { live: true, question: "Which team has allowed the fewest points?", choices: [] },
    { question: "Guess the Career TE:\n- 2,501 Rec. Yards\n- 26 Rec. TDs\n- 221 Receptions", choices: ["Daniel Graham", "Fred Davis", "Billy Miller", "Tyler Eifert"], answer: 3 },
    { question: "What division do the Baltimore Ravens play in?", choices: ["AFC North", "NFC West", "AFC East", "NFC North"], answer: 0 },
    { question: "Which RB has more Career Rushing Yards?", choices: ["Derrick Henry", "Thurman Thomas", "Steven Jackson", "Corey Dillon"], answer: 0 },
    ],
  },
    "2026-11-07": { //Saturday
    event: "",
    questions: [
    { question: "Which coach led the Bears to a Super Bowl victory?", choices: ["Matt LaFleur", "Mike Ditka", "Andy Reid", "Dennis Green"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Jermissy Wainwright III", "Zackson Fairweather", "Zecharion Stonehammer", "Toi Cook"], answer: 3 },
    { question: "True or False: The Indianapolis Colts play in the NFC East.", choices: ["True", "False"], answer: 1 },
    { question: "OVER or UNDER: T.J. Houshmandzadeh has O/U 7,300 Career Receiving Yards.", choices: ["OVER", "UNDER"], answer: 1 },
    { question: "Which RB has more Career Rushing Yards?", choices: ["Jim Brown", "LaDainian Tomlinson", "Thurman Thomas", "Adrian Peterson"], answer: 3 },
    ],
  },
    "2026-11-08": { //Sunday
    event: "",
    questions: [
    { question: "Guess the Career WR:\n- 3,228 Rec. Yards\n- 20 Rec. TDs\n- 244 Receptions", choices: ["Travis Benjamin", "Michael Crabtree", "Ja'Marr Chase", "Josh Reynolds"], answer: 3 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Javorius Drakesworth", "Hingle McCringleberry", "Jermissy Finnenbaum", "De'Anthony Thomas"], answer: 3 },
    { question: "In what season did the \"28-3 Comeback\" occur?", choices: ["2016", "2015", "2014", "2019"], answer: 0 },
    { question: "Who holds the NFL record for most rushing yards in a single season?", choices: ["Barry Sanders", "LaDainian Tomlinson", "Christian McCaffrey", "Eric Dickerson"], answer: 3 },
    { question: "What division do the Atlanta Falcons play in?", choices: ["AFC East", "AFC North", "NFC South", "NFC West"], answer: 2 },
    ],
  },
};