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
// Generated: 2026-11-16 15:28
// Days: 7
// ═══════════════════════════════════════════════════════════
// REVIEW CHECKLIST:
//   [ ] Spot-check 5 random answers for accuracy
//   [ ] Verify no duplicate questions across days
//   [ ] Check difficulty feels balanced
//   [ ] Merge into your main questions.js CALENDAR object
// ═══════════════════════════════════════════════════════════

const GENERATED = {
    "2026-11-18": { //Wednesday
    event: "",
    questions: [
    { question: "Guess the Career WR:\n- 6,703 Rec. Yards\n- 37 Rec. TDs\n- 539 Receptions", choices: ["Marty Booker", "Kevin Johnson", "Hines Ward", "David Patten"], answer: 0 },
    { question: "How many points scored did LaDainian Tomlinson record in their record-setting 2006 season?", choices: ["171", "173", "200", "186"], answer: 3 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Ventravian Winterbottom", "Jermissy Henrich", "Jermaine Goldsworth", "Amen Ogbongbemiga"], answer: 3 },
    { question: "What year did the Lions last win an NFL Championship before the Super Bowl era?", choices: ["1957", "1965", "1932", "1862"], answer: 0 },
    { question: "How many Super Bowls have the Washington Commanders won?", choices: ["2", "1", "6", "3"], answer: 3 },
    ],
  },
    "2026-11-19": { //Thursday
    event: "",
    questions: [
    { question: "OVER or UNDER: The Rams have been located in O/U 3.5 cities.", choices: ["OVER", "UNDER"], answer: 1 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE rushing yards.", choices: [] },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Zebrion Brightwater", "Mossis Madu", "Davoin Shower-Handel", "Jaiveon Willowbrook"], answer: 1 },
    { question: "True or False: A TE has led the league in receiving yards.", choices: ["True", "False"], answer: 1 },
    { question: "Which coach said the famous quote \"They are who we thought they were!\"?", choices: ["Herm Edwards", "Dennis Green", "Matt LaFleur", "Mike Tomlin"], answer: 1 },
    ],
  },
    "2026-11-20": { //Friday
    event: "",
    questions: [
    { question: "Who was the first Broncos player to win NFL MVP?", choices: ["Craig Morton", "Terrell Davis", "John Elway", "Peyton Manning"], answer: 2 },
    { question: "Who had more receptions: Jimmy Smith (1999) or Steve Smith (2005)?", choices: ["Jimmy Smith (1999)", "Steve Smith (2005)"], answer: 0 },
    { question: "True or False: 1960 was the Chargers' first season.", choices: ["True", "False"], answer: 0 },
    { question: "Guess the Career TE:\n- 2,033 Rec. Yards\n- 22 Rec. TDs\n- 150 Receptions", choices: ["Cole Kmet", "Kevin Boss", "Desmond Clark", "Jimmy Graham"], answer: 1 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Israel Idonije", "Sofia Crankshaw", "Montravius Tomlin", "Ruke Boonclap"], answer: 0 },
    ],
  },
    "2026-11-21": { //Saturday
    event: "",
    questions: [
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE scrimmage yards.", choices: [] },
    { question: "Who holds the NFL single-season record for rushing touchdowns?", choices: ["Kenyan Drake", "Sony Michel", "Rachaad White", "LaDainian Tomlinson"], answer: 3 },
    { question: "Guess the Career WR:\n- 13,113 Rec. Yards\n- 121 Rec. TDs\n- 1,047 Receptions", choices: ["Chris Olave", "DeVante Parker", "Brandon Aiyuk", "Davante Adams"], answer: 3 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Devon Bumbleton", "Peerless Price", "Lil'Jordan Hammersmith", "Trevontay Whistleblower"], answer: 1 },
    { question: "Who holds the NFL record for most career passing yards?", choices: ["Drew Brees", "Matthew Stafford", "Tom Brady", "Peyton Manning"], answer: 2 },
    ],
  },
    "2026-11-22": { //Sunday
    event: "",
    questions: [
    { question: "Guess the Career RB:\n- 2,067 Rush Yards\n- 9 Rush TDs\n- 3.8 Yards per Carry", choices: ["Isaiah Crowell", "Rachaad White", "Nick Chubb", "Jacquizz Rodgers"], answer: 3 },
    { question: "OVER or UNDER: Antonio Gibson has O/U 10 Career Rushing TDs.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["J'Dinkalage Morgoone", "Fair Hooker", "Sofia Dunder", "Ja'Vontavious Bonecastle"], answer: 1 },
    { question: "True or False: Brett Favre was originally drafted by the Atlanta Falcons.", choices: ["True", "False"], answer: 0 },
    { live: true, question: "Who leads the NFL in passing yards?", choices: [] },
    ],
  },
    "2026-11-23": { //Monday
    event: "",
    questions: [
    { question: "How many passing yards did Peyton Manning record in their record-setting 2013 season?", choices: ["5,477", "5,148", "5,803", "5,900"], answer: 0 },
    { question: "Guess the Career RB:\n- 4.5 Yards per Carry\n- 89 Total TDs\n- 73 Rush TDs\n- 15,000 Yards from Scrimmage", choices: ["Kareem Hunt", "Eddie Lacy", "LeSean McCoy", "Reggie Bush"], answer: 2 },
    { live: true, question: "OVER or UNDER: PLAYER NAME has O/U LINE sacks.", choices: [] },
    { question: "How many receiving TDs did Randy Moss have in 2007?", choices: ["25", "19", "23", "21"], answer: 2 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Stoney Case", "Ezekiel Hammersmith", "Brayquan Fender", "Funchy Butterfield"], answer: 0 },
    ],
  },
    "2026-11-24": { //Tuesday
    event: "",
    questions: [
    { question: "Guess the Career WR:\n- 5,644 Rec. Yards\n- 39 Rec. TDs\n- 458 Receptions", choices: ["Marvin Harrison", "Mike Williams", "Nate Burleson", "Bernard Berrian"], answer: 2 },
    { question: "Who is the NFL's all-time career leader in receiving yards?", choices: ["Jerry Rice", "Tony Gonzalez", "Terrell Owens", "Larry Fitzgerald"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Bender Bonecastle", "Sequester Grundelplith M.D.", "Quantrell Thundergood", "Pig Prather"], answer: 3 },
    { question: "True or False: Barry Sanders retired as the NFL's all-time leading rusher.", choices: ["True", "False"], answer: 1 },
    { question: "What year did the Raiders relocate to Las Vegas?", choices: ["2024", "2023", "2020", "2022"], answer: 2 },
    ],
  },
};