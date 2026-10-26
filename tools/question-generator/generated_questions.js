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
// Generated: 2026-10-26 16:14
// Days: 3
// ═══════════════════════════════════════════════════════════
// REVIEW CHECKLIST:
//   [ ] Spot-check 5 random answers for accuracy
//   [ ] Verify no duplicate questions across days
//   [ ] Check difficulty feels balanced
//   [ ] Merge into your main questions.js CALENDAR object
// ═══════════════════════════════════════════════════════════

const GENERATED = {
    "2026-10-30": { //Friday
    event: "",
    questions: [
    { question: "True or False: The Chicago Bears were originally called the Decatur Staleys.", choices: ["True", "False"], answer: 0 },
    { question: "Who led the NFL in Rushing TDs in 2021?", choices: ["Derrick Henry", "Jonathan Taylor", "Marshawn Lynch", "Adrian Peterson"], answer: 1 },
    { live: true, question: "Who leads the NFL in receiving yards?", choices: [] },
    { question: "What division do the Denver Broncos play in?", choices: ["NFC North", "AFC West", "AFC South", "NFC South"], answer: 1 },
    { question: "Guess the Career RB:\n- 3,914 Rush Yards\n- 42 Rush TDs\n- 3.9 Yards per Carry\n- 42 Total TDs", choices: ["Anthony Thomas", "Chester Taylor", "BenJarvus Green-Ellis", "Willie Parker"], answer: 2 },
    ],
  },
    "2026-10-31": { //Saturday
    event: "",
    questions: [
    { question: "Guess the Career QB:\n- 41,245 Pass Yards\n- 257 Pass TDs\n- 112 INTs\n- 92.8 Passer Rating", choices: ["Dak Prescott", "Derek Carr", "Carson Palmer", "Ryan Fitzpatrick"], answer: 1 },
    { question: "OVER or UNDER: The Lions have O/U 3.5 NFL championships (all-time).", choices: ["OVER", "UNDER"], answer: 0 },
    { question: "Who holds the NFL record for most receiving TDs in a single season?", choices: ["Larry Fitzgerald", "Marvin Harrison", "Randy Moss", "Mike Evans"], answer: 2 },
    { question: "Who is the NFL's all-time career leader in passing touchdowns?", choices: ["Eli Manning", "Tom Brady", "Matthew Stafford", "Philip Rivers"], answer: 1 },
    { question: "What year was the Commanders' first season?", choices: ["1935", "1928", "1932", "1939"], answer: 2 },
    ],
  },
    "2026-11-01": { //Sunday
    event: "",
    questions: [
    { question: "Which of these was an ACTUAL NFL player?", choices: ["BenJarvus Green-Ellis", "Fredrick Van Der Berg", "Jaqwellius Crankshaw", "Dequavious Crumbleton"], answer: 0 },
    { question: "True or False: The Washington Commanders were originally called the Boston Braves.", choices: ["True", "False"], answer: 0 },
    { question: "Who is the Chicago Bears' all-time leader in receiving yards?", choices: ["Alshon Jeffery", "Harlon Hill", "Johnny Morris", "Walter Payton"], answer: 2 },
    { question: "Which QB has more Career Passing Yards?", choices: ["Aaron Rodgers", "Dan Marino", "Matthew Stafford", "Eli Manning"], answer: 0 },
    { question: "OVER or UNDER: The Raiders have been located in O/U 3.5 cities.", choices: ["OVER", "UNDER"], answer: 1 },
    ],
  },
};