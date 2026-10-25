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
// Generated: 2026-10-24 10:17
// Days: 3
// ═══════════════════════════════════════════════════════════
// REVIEW CHECKLIST:
//   [ ] Spot-check 5 random answers for accuracy
//   [ ] Verify no duplicate questions across days
//   [ ] Check difficulty feels balanced
//   [ ] Merge into your main questions.js CALENDAR object
// ═══════════════════════════════════════════════════════════

    "2026-11-02": { //Monday
    event: "",
    questions: [
    { question: "Which NFL team plays their home games at Caesars Superdome?", choices: ["New Orleans Saints", "Indianapolis Colts", "Dallas Cowboys", "Detroit Lions"], answer: 0 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Kayvontez Johnson", "Ezekiel Quartermaine", "Beezer Twelve Washingbeard", "Toi Cook"], answer: 3 },
    { question: "True or False: The Arizona Cardinals were originally called the Chicago Cardinals.", choices: ["True", "False"], answer: 0 },
    { question: "How many points scored did LaDainian Tomlinson record in their record-setting 2006 season?", choices: ["186", "174", "171", "177"], answer: 0 },
    { question: "Guess the Career QB:\n- 27,989 Pass Yards\n- 212 Pass TDs\n- 210 INTs\n- 70.9 Passer Rating", choices: ["Mark Brunell", "Carson Wentz", "Terry Bradshaw", "Joe Burrow"], answer: 2 },
    ],
  },
    "2026-11-03": { //Tuesday
    event: "",
    questions: [
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Deontarius Willowbrook", "Adolfo Crumbleton", "Ja'Quan Stormbreaker", "Isaiahh Loudermilk"], answer: 3 },
    { question: "True or False: The Eagles have won 3 Super Bowls.", choices: ["True", "False"], answer: 1 },
    { question: "OVER or UNDER: Jimmy Smith has O/U 40 Career Receiving TDs.", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Which franchise originally drafted Eli Manning?", choices: ["Chargers", "Cowboys", "Eagles", "Giants"], answer: 0 },
    { question: "Who led the NFL in Passing Yards in 2007?", choices: ["Mark Brunell", "Kerry Collins", "Tom Brady", "Trent Green"], answer: 2 },
    ],
  },
    "2026-11-04": { //Wednesday
    event: "",
    questions: [
    { question: "How many passing yards does Jordan Love have through Oct 22, 2026?", choices: ["1,814", "1,944", "1,684", "2,074"], answer: 2 },
    { question: "Which of these was an ACTUAL NFL player?", choices: ["Quantrell Finnenbaum", "Zohnathan Fettergun II", "Tavontay Crumbleton", "Tutan Reyes"], answer: 3 },
    { question: "What was the Kansas City Chiefs' original team name?", choices: ["Renegades", "Wildcats", "Aviators", "Texans"], answer: 3 },
    { question: "True or False: The Cincinnati Bengals play their home games at Paycor Stadium.", choices: ["True", "False"], answer: 0 },
    { question: "OVER or UNDER: The Rams have been located in O/U 3.5 cities.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },