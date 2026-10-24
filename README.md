# Pigskin5

Daily NFL Trivia Quiz

Live site: [pigskin5.com](https://pigskin5.com)
GitHub Pages (twillyallen.github.io)
Author: Thomas Allen (@TwillysTakes)

---

## Table of Contents

- Project Structure
- Question System
  - Adding Questions Manually
  - Generating Questions Automatically
  - Keeping the Data Accurate
  - NFL Data Layer
  - Testing Specific Dates
- Quiz Archive
- Blog System
- Game Mechanics
- Monetization
- SEO & Infrastructure
- Key Workflows Cheat Sheet

---

## Project Structure

```
pigskin5.com/
│
├── index.html                  # Main game page
├── main.js                     # Game logic monolith
├── questions.js                # Active CALENDAR object (current + upcoming questions)
├── style.css                   # All site styling
│
├── modules/                    # Modular JS extractions
│   ├── config.js               # Constants, storage keys, API URLs, streak tiers
│   ├── date-utils.js           # Date parsing, formatting, ?date= override
│   ├── storage.js              # localStorage wrapper (attempts, results, streaks)
│   ├── streak.js               # Daily streak + touchdown streak logic
│   ├── effects.js              # Snow, hearts, confetti particle effects
│   ├── name-validator.js       # Leaderboard name sanitization
│   └── ui-helpers.js           # Toast notifications, tier badge popup
│
├── archive-legacy.js           # Every question ever (Sep 2025 – early Mar 2026)
├── archive-static.html         # GENERATED — SEO-friendly static archive page
├── generate-archive.mjs        # Node script to rebuild archive-static.html
├── question-archive.html       # Dynamic JS-based archive viewer
│
├── blog/
│   ├── blog-index.html         # Blog hub (SPA with search + category filters)
│   ├── *.html                  # Individual blog articles
│   └── (articles follow a shared HTML template)
│
├── about.html
├── contact.html
├── privacy.html
├── terms.html
├── cookies.html
│
├── logos/                      # Event logos, share images
├── favicon.png / favicon.ico
│
├── CNAME                       # Custom domain: pigskin5.com
├── robots.txt                  # Crawl rules
├── sitemap.xml                 # Sitemap for Google
├── ads.txt                     # AdSense publisher verification
│
└── tools/
    └── question-generator/     # Python question generation pipeline
        ├── generate_questions.py         # CLI entry point — run this
        ├── generated_questions.js        # ** OUTPUT: new questions land here **
        ├── generated_by_type.js          # Scratch output from one-off per-type batches (not used by the site)
        ├── generate_names.py             # Standalone fake-name generator for Real Player questions
        ├── awards_overlay.json           # Unused — awards live in QB_AWARDS in update_nfl_data.py
        ├── update_nfl_data.py            # Refreshes player stats from nflverse (runs weekly via GitHub Action)
        ├── requirements.txt              # Packages for update_nfl_data.py
        ├── generators/
        │   ├── __init__.py               # BaseGenerator ABC + shared utilities
        │   ├── nfl_data.py               # Core NFL data — player stats auto-refreshed; see "Keeping the Data Accurate"
        │   ├── stat_leader.py            # "Who led the NFL in X in Y?"
        │   ├── true_false.py             # True/False NFL fact questions
        │   ├── over_under.py             # "O/U: Player has X.5 career stat"
        │   ├── guess_player.py           # "Guess the QB/RB/WR from this stat line"
        │   ├── franchise.py              # Franchise history, all-time leaders
        │   ├── history.py                # Super Bowls, iconic moments, drafts, awards
        │   ├── real_player.py            # "Which was an ACTUAL NFL player?"
        │   ├── evergreen.py              # Mixes in hand-picked questions from evergreen_bank.py
        │   └── evergreen_bank.py         # ** Hand-written evergreen questions — add new ones here **
        └── scrapers/
            ├── scrape_franchise_leaders.py   # Scrapes footballdb.com for franchise all-time leaders
            └── merge_franchise_leaders.py    # Patches scraped leaders into FRANCHISES in nfl_data.py
```

---

## Question System

### Adding Questions Manually

1. Open `questions.js`.
2. Add a new date entry following the existing format.
3. Make sure the date doesn't already exist in `archive-legacy.js` (legacy takes lower priority, but avoid duplicates).
4. Deploy.

### LIVE Questions (current-season stats, filled automatically)

To schedule a current-season stat question without knowing the answer yet, add `live: true` and leave out `answer`. A copy/paste list of every supported phrasing is at the top of `tools/question-generator/generated_questions.js`, between the `LIVE QUESTION TEMPLATES ── START` and `END` markers. The generator keeps that block unchanged every time it rewrites the file.

```js
{ live: true, question: "Who leads the NFL in passing yards?", choices: [] },
{ live: true, question: "Which rookie wide receiver has the most receptions?", choices: [] },
{ live: true, question: "Which player has more receiving yards?", choices: ["A.J. Brown", "Rome Odunze", "Romeo Doubs", "Luther Burden"] },
```

The **Fill LIVE questions** GitHub Action fills them the day before (6am and 6pm ET) with real nflverse stats, counting every game finished by then (Thursday nights included), and pushes. The question text is left as you wrote it. For over/unders, write `O/U LINE` and the line is set from the player's real total on fill day. With `choices: []` it picks the choices itself. With choices listed, it keeps them and only fills `answer`. For "leads the NFL" questions, if the actual leader isn't one of your choices, the leader replaces the lowest one.

Supported shapes: "Who leads the NFL in X", "Which [rookie] [position] has the most X", "Which player has more X" (needs choices), "How many X does Player have", "OVER or UNDER: Player has O/U N X", "What is the Team' record", and "Which team has scored the most points / allowed the fewest points / has the best point differential / has the best or worst record". Stats: passing yards/TDs, interceptions thrown, rushing yards/TDs, receptions, receiving yards/TDs, scrimmage yards, sacks, interceptions, tackles, field goals.

- **Pushing `questions.js` checks every unfilled LIVE question.** A typo or unknown player fails the Action right away (GitHub emails you), days before the quiz.
- **The Action commits to `main`, so `git pull` before editing `questions.js`.**
- Run it locally: `cd tools/question-generator; py fill_live_questions.py --check` (validate only) or `py fill_live_questions.py --through 2026-11-02`.

### Generating Questions Automatically

The Python pipeline in `tools/question-generator/` automates bulk question creation.

#### Step 0 — Make sure you have the latest stats

Player stats in `generators/nfl_data.py` are refreshed automatically every Tuesday by a GitHub Action (see [Keeping the Data Accurate](#keeping-the-data-accurate)). That commit lands on GitHub, not your machine, so **always pull first**:

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5"; git pull
```

Check the `Generated:` line at the top of `generators/nfl_data.py`. During the season it should be from the most recent Tuesday. If it's older, check the **Actions** tab on GitHub for a failed run, or click **Run workflow** on "Refresh NFL stats from nflverse" to refresh on demand.

**In-season tip:** generate in smaller batches (about 7 days) right after the Tuesday refresh. Career totals for active players change every week. A question generated today but published 3 weeks from now will be 3 games out of date. That's enough to flip an over/under line or make a "Guess the Player" stat line wrong. In the offseason, numbers are frozen and big batches are fine.

#### Step 1 — Run the generator

Navigate to the tool directory first, then run:

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5\tools\question-generator"
```

Generate a full batch of days (this is the standard workflow):

```powershell
py generate_questions.py --days 21 --start-date 2026-06-16
```

Replace `--start-date` with the first date you need covered. `--days` controls how many consecutive days are generated. Without either flag it generates 7 days starting tomorrow. Output is written to `generated_questions.js` in the same folder, **overwriting what's there**.

Optional flags:
- `--enhance` — uses the Anthropic API to rewrite robotic-sounding questions (requires `ANTHROPIC_API_KEY`)
- `--seed 42` — reproducible output (same seed = same questions every run)

#### Step 2 — Preview a single question type (optional)

Use `--only` to preview questions from one generator without generating a full calendar. Omit `--save` to print to the terminal only; add `--save` to write to `generated_questions.js`:

```powershell
py generate_questions.py --only true_false --count 20
py generate_questions.py --only over_under --count 15
py generate_questions.py --only guess_player --count 10
py generate_questions.py --only stat_leader --count 15
py generate_questions.py --only franchise --count 10
py generate_questions.py --only history --count 15
py generate_questions.py --only real_player --count 10
```

#### Step 3 — Review the output

Open `tools/question-generator/generated_questions.js` and check the output before merging. The file prints a review checklist at the top:

- [ ] Spot-check 5 random answers for accuracy
- [ ] Verify no duplicate questions across days
- [ ] Check difficulty feels balanced

#### Step 4 — Merge into questions.js

Copy the date entries from `generated_questions.js` into the `CALENDAR` object in `questions.js`. The format is identical — paste the new entries after the last existing date, keeping the object alphabetically sorted by date.

This is NOT a drop-in replacement — always review before merging.

#### Step 5 — Rebuild the static archive

Any time `questions.js` changes, regenerate `archive-static.html` so the SEO archive stays in sync:

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5"; node generate-archive.mjs
```

Then deploy both `questions.js` and `archive-static.html` together.

### Generator Types

| Generator | File | Question Format |
|---|---|---|
| Stat Leader | `stat_leader.py` | "Who led the NFL in X in Y?" / "Which QB has more career X?" |
| True/False | `true_false.py` | "True or False: [NFL fact]" |
| Over/Under | `over_under.py` | "O/U: [Player] has X.5 [career stat]" |
| Guess Player | `guess_player.py` | "Guess the Career QB: [stat line]" |
| Franchise | `franchise.py` | "Who is the [Team]'s all-time leader in X?" |
| History | `history.py` | Super Bowls, iconic moments, draft picks, awards, coaches |
| Real Player | `real_player.py` | "Which of these was an ACTUAL NFL player?" (real vs. fakes) |
| Evergreen | `evergreen.py` | Hand-written trivia from `evergreen_bank.py`. Not a regular category: on ~15% of days (`EVERGREEN_CHANCE`) one slot is swapped for one of these |

Each day gets 5 questions with a rotation system that ensures category variety (2 "anchor" types per day + 3 random). Difficulty distribution defaults to 1 easy, 3 medium, 1 hard per day:

- **Easy**: big names, well-known records, recent stars
- **Medium**: solid trivia requiring real knowledge
- **Hard**: deep cuts, obscure stats, trick questions

### Generator Dependencies

- Python 3.10+
- Question generation itself needs no external packages
- Stats refresh (`update_nfl_data.py`): `py -m pip install -r requirements.txt`
- `--enhance` mode: `py -m pip install anthropic`
- Franchise scraper: `py -m pip install requests beautifulsoup4`

### Keeping the Data Accurate

Every generated question is only as good as `generators/nfl_data.py`. Part of it updates itself; the rest is curated by hand.

#### Automatic: weekly nflverse refresh

`.github/workflows/update-nfl-data.yml` runs every **Tuesday at 12:00 UTC** (after Monday Night Football). It:

1. Runs `update_nfl_data.py`, which pulls regular-season stats from [nflverse](https://github.com/nflverse/nflverse-data/releases/tag/stats_player) for 1999 through the current season (nflverse rebuilds these nightly during the season).
2. Imports the result to confirm it isn't broken.
3. Commits to `main` **only if the numbers changed**, so offseason runs do nothing.

Commits that only touch `tools/` don't bump `version.json`, so this never force-reloads players' pages mid-game.

What the refresh **overwrites** in `nfl_data.py`:
- `QUARTERBACKS`, `RUNNING_BACKS`, `WIDE_RECEIVERS`, `TIGHT_ENDS` (career stats, eras, teams)
- `DEFENSIVE_PLAYERS`: sacks and INTs from nflverse for notable defenders (60+ sacks, 30+ INTs or heavy tackle volume), plus every DPOY/DROY winner. DPOY/DROY counts are read from the curated `SEASON_LEADERS` awards, so new winners appear the Tuesday after you add them. Pre-1999 legends, retired players' official tackle totals, and stars below the thresholds are hand-kept in `DEFENSIVE_LEGENDS` / `DEFENSIVE_OVERLAY` in `update_nfl_data.py`. Tackles are never auto-filled, because nflverse's play-by-play tackle counts don't match official totals.
- The **first** `SEASON_LEADERS` block (auto-generated, raw stat leaders)

Everything else in the file is preserved exactly as-is.

To run the refresh locally instead (e.g. to test a change to the pipeline):

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5\tools\question-generator"
py -m pip install -r requirements.txt
py update_nfl_data.py --existing generators/nfl_data.py --output generators/nfl_data.py
git diff generators/nfl_data.py
```

#### Manual: things nflverse can't provide

Update these by hand. The refresh never touches them, except where noted.

| What | Where | When |
|---|---|---|
| Season leaders + AP awards (MVP, OPOY, DPOY, ROY, Coach, Comeback) | The **second** `SEASON_LEADERS` block in `nfl_data.py`, the one generators actually use since it overrides the first | After NFL Honors (early Feb) |
| Super Bowl result | `SUPER_BOWLS` in `nfl_data.py` | After the Super Bowl |
| MVP list | `MVP_WINNERS` in `nfl_data.py` | After NFL Honors |
| QB Super Bowl wins / MVP counts | `QB_AWARDS` in `update_nfl_data.py` (**not** `nfl_data.py`, which the refresh overwrites) | After the Super Bowl / NFL Honors |
| A defensive star missing from `DEFENSIVE_PLAYERS`, a wrong position, or a pre-1999 player | `DEFENSIVE_OVERLAY` (add `"Name": {}` to force someone in) or `DEFENSIVE_LEGENDS` in `update_nfl_data.py` | When you notice it |
| Franchise all-time leaders, records | `FRANCHISES` / `RECORDS` in `nfl_data.py` | When a record is broken |
| Fixes to bad/truncated nflverse stats (e.g. players with pre-1999 seasons) | `MANUAL_STAT_CORRECTIONS` in `update_nfl_data.py`. **Never** hand-edit the 5 player lists (QB/RB/WR/TE/defense) in `nfl_data.py`, because the next refresh erases the edit | Whenever you spot a wrong career number |

#### Accuracy checklist before merging generated questions

- [ ] `git pull` done, and `Generated:` date in `nfl_data.py` is recent
- [ ] Questions about **active** players' career stats will publish within ~1 week (in-season)
- [ ] "Who led the NFL in X in [year]?" questions only reference **completed** seasons
- [ ] Spot-check defensive tackle numbers against Pro Football Reference (tackles are hand-maintained; sacks/INTs are automatic)
- [ ] Spot-check 5 random answers overall

### NFL Data Layer

All generators pull from `tools/question-generator/generators/nfl_data.py`, which exports:

- `QUARTERBACKS`, `RUNNING_BACKS`, `WIDE_RECEIVERS`, `TIGHT_ENDS` — player tuples: `(name, position, stats_dict, era, teams_list)`
- `DEFENSIVE_PLAYERS` — same shape, auto-built from nflverse; used for DPOY/DROY distractors, which are drawn from the 15 most notable era-relevant defenders
- `FRANCHISES` — team history (founded, Super Bowls, all-time leaders, previous names, etc.)
- `SUPER_BOWLS` — winner/loser by numeral
- `SEASON_LEADERS` — yearly stat leaders and award winners
- `ICONIC_MOMENTS`, `COACHES`, `DRAFT_NOTABLES`, `RECORDS`, `NFL_FACTS`
- `MVP_WINNERS`, `KICKER_MVP`
- `REAL_UNUSUAL_PLAYERS`, `FAKE_NAME_PARTS` — for the Real Player question type

`update_nfl_data.py` refreshes the five player lists (QB/RB/WR/TE/defense) and the first `SEASON_LEADERS` block from nflverse. It runs weekly via GitHub Action. See [Keeping the Data Accurate](#keeping-the-data-accurate) for what's automatic vs. manual.

`SEASON_LEADERS` is defined **twice** on purpose. The first block is auto-generated raw stat leaders. The second block, further down, is the curated one with AP awards, and since Python uses the last definition, it's the one generators read. Put award updates in the second block.

`awards_overlay.json` is not read by any code. QB award counts live in `QB_AWARDS` inside `update_nfl_data.py`.

**Known data issues to fix when touching this file:**
- Peyton Manning is mistagged as `"classic"` era — should be `"modern"`. Fix it with `"Peyton Manning": {"era": "modern"}` in `MANUAL_STAT_CORRECTIONS` (`update_nfl_data.py`), not in `nfl_data.py`, or the weekly refresh will undo it. `MANUAL_STAT_CORRECTIONS` also accepts `"teams"` and any stat key.

### Testing Specific Dates

In `date-utils.js`, you can override the active date with a query string (non-production only — disabled on `pigskin5.com` and `twillyallen.github.io`):

```
http://127.0.0.1:5500/index.html?date=2026-05-07
```

### Resetting a Quiz Attempt

After playing, both localStorage and Supabase remember your attempt — clearing just localStorage won't work if you're signed in, because `showStartScreen()` re-fetches the server attempt and syncs it back.

**Use the dev helper in the browser console:**

```js
__devResetToday()
```

This wipes today's localStorage keys (`ft5_attempt_`, `ft5_result_`, `ps5_leaderboard_submit_`), clears sessionStorage, deletes the Supabase row if you're signed in, and reloads the start screen. Works for both signed-in and anonymous users.

To reset a **different date** (not today), you need to manually:
1. Delete these localStorage keys from DevTools → Application → Local Storage:
   - `ft5_attempt_YYYY-MM-DD`
   - `ft5_result_YYYY-MM-DD`
   - `ps5_leaderboard_submit_YYYY-MM-DD`
2. If signed in, delete the matching row from Supabase `quiz_attempts` (by `quiz_date`).

---

## Quiz Archive

### How the Archive Works

There are two archive systems:

- **`question-archive.html`** — a dynamic JS-powered archive viewer that imports `questions.js` at runtime.
- **`archive-static.html`** — a pre-rendered static HTML page with ALL questions and correct answers visible. This is the SEO-critical version since search engines can crawl all the content.

The static archive is built from two data sources:

- `archive-legacy.js` — historical questions from September 2025 through early March 2026.
- `questions.js` — current and upcoming questions.

### Regenerating the Static Archive

Run this after any change to `questions.js` or `archive-legacy.js`:

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5"; node generate-archive.mjs
```

This outputs a fresh `archive-static.html` with all questions merged, sorted newest-first, grouped by month, with correct answers marked. Deploy the updated file alongside `questions.js`.

**When to regenerate:**
- After merging a new batch of questions into `questions.js`
- After correcting any question or answer
- After moving old entries from `questions.js` into `archive-legacy.js` (see below)

### Archiving Old Questions (Shrinking questions.js)

`questions.js` is the live file — it only needs to hold current and upcoming dates. Once past dates are no longer needed in the live file, move them to `archive-legacy.js` to keep `questions.js` lean.

**Step by step:**

1. Open `questions.js` and identify the date entries you want to archive (typically anything older than ~3 months).
2. Cut those date entries out of the `CALENDAR` object in `questions.js`.
3. Paste them into the `CALENDAR` object in `archive-legacy.js`, keeping the dates in order.
4. Run `node generate-archive.mjs` to rebuild `archive-static.html` from both files.
5. Deploy both `questions.js`, `archive-legacy.js`, and `archive-static.html`.

> The static archive reads from both files, so nothing is lost from the archive after the move. The dynamic viewer (`question-archive.html`) only reads `questions.js`, so very old dates will disappear from that view — that's expected.

---

## Blog System

### Blog Structure

The blog lives in the `blog/` directory:

- `blog-index.html` — the hub page with search, category filters, and article cards
- Individual `.html` article files — each is a standalone page with shared styling

Articles are categorized into 5 groups: Current Season, Draft, History, Teams, Trivia & Strategy.

### Adding a New Blog Post

Create the HTML file in `blog/`. Use any existing article as a template. The standard structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Title | Pigskin5</title>
  <meta name="description" content="Your SEO description here.">
  <link rel="canonical" href="https://pigskin5.com/blog/your-slug.html">
  <link rel="stylesheet" href="../style.css">
  <!-- Standard article styles (copy from any existing post) -->
</head>
<body>
  <header class="topbar">
    <a href="../index.html" class="icon-btn" title="Back to Game">
      <img src="../back-icon.png" alt="Pigskin5" width="24" height="24" />
    </a>
  </header>
  <main class="article-content">
    <a href="blog-index.html" class="article-back">← Back to Blog</a>
    <h1>Your Title</h1>
    <p class="article-meta">By Twillyallen | Month Year | X min read</p>
    <!-- Article body -->
    <p>CTA: <a href="../index.html"><strong>Play today's Pigskin5 quiz!</strong></a></p>
  </main>
  <!-- Standard footer (copy from any existing post) -->
</body>
</html>
```

Newer posts use a category tag badge instead of the `article-meta` line:

```html
<div class="article-tag">Draft</div>
```

### Updating the Blog Index

After creating the article file, add it to the `ARTICLES` array inside `blog/blog-index.html`. Find the `const ARTICLES = [...]` array in the `<script>` block and add a new entry:

```js
{
  slug: "your-slug.html",
  title: "Your Article Title",
  excerpt: "A 1-2 sentence preview for the card.",
  category: "draft",              // One of: season, draft, history, teams, trivia
  categoryLabel: "Draft",         // Display label
  published: "2026-04-05",        // YYYY-MM-DD
  section: "NFL Draft"            // Section heading the card groups under
},
```

The blog index auto-generates a "NEW" badge for articles published within the last 3 days. The article count in the `stat-pill` reads `ARTICLES.length` dynamically.

### Updating the Sitemap

If the new blog post targets meaningful SEO keywords, add it to `sitemap.xml`:

```xml
<url>
  <loc>https://pigskin5.com/blog/your-slug.html</loc>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Use `0.7` for evergreen/reference content, `0.6` for timely/seasonal pieces.

---

## Daily Reminder Popups

A lightweight popup system lets you broadcast a message to all players when they open the game — handy for game-day alerts, weekly contests, site announcements, etc.

### How to set a reminder

Open `modules/reminders.js` and edit the `REMINDERS` object. Each key is a day of the week (0 = Sunday, 6 = Saturday). Set the value to an object with `title` and `message`, or leave it as `null` for no popup that day.

```js
export const REMINDERS = {
  0: null, // Sunday
  1: null, // Monday
  2: null, // Tuesday
  3: null, // Wednesday
  4: { title: "MNF Tonight! 🏈", message: "Chiefs vs Eagles, 8:20 ET on ESPN. Come back and brag after your pick!" },
  5: null, // Friday
  6: null, // Saturday
};
```

- `title` is optional — defaults to `"Heads Up"` if omitted.
- `message` is the body text shown to the player.
- Deploy `modules/reminders.js` to push the reminder live.

### Behavior

- Shows on page load, on the start screen, before the player starts the quiz.
- Each visitor sees the reminder **once per day** — dismissed state is stored in `localStorage` under `p5_reminder_YYYY-MM-DD`.
- Dismissable via the × button, "Got it!" button, or clicking the backdrop.
- **Sunday:** If the weekly podium card is showing (last week's top 3), the reminder automatically waits until after the player dismisses the podium before appearing. Falls back after 8 seconds if the podium never shows (e.g., no last-week data).

### Clearing a reminder

Set the day back to `null` and deploy. Visitors who already dismissed it today won't see a new one until midnight anyway (new `localStorage` key per date).

---

## Game Mechanics

**Scoring:** Each correct answer earns points. Faster answers earn more points (speed bonus based on time remaining out of 15 seconds). Total points = sum across all 5 questions.

**Streaks:**
- **Daily Streak** — consecutive days played (any score counts).
- **Touchdown Streak** — consecutive days with a perfect 5/5 score. Resets on any non-perfect day.

**Streak Tiers:**

| Tier | Days | Emoji |
|---|---|---|
| Rookie | 0+ | 🫡 |
| Starter | 7+ | 🏈 |
| Pro | 14+ | 🔥 |
| All-Pro | 30+ | ⭐ |
| Hall of Fame | 50+ | 🏆 |
| Legend | 100+ | 👑 |

**Leaderboard:** Optional. After finishing the quiz, players can submit a display name. Submissions go to a Google Apps Script endpoint that stores them in a Google Sheet. Names are validated against a banned words list and limited to 27 characters with no spaces.

**Session Recovery:** If a player refreshes the page or switches tabs mid-quiz, `sessionStorage` tracks the in-progress state. On return, the game detects the interrupted session and calls `forfeitAndFinish()` to close out the attempt (remaining questions are marked wrong).

**Event Theming:** The `event` field on a date entry triggers a themed logo and optional visual effects (snow for Christmas, hearts for Valentine's Day, confetti for celebrations, sandstorm for the Australia Edition). Event logos are mapped in the `EVENT_LOGOS` config object.

---

## Monetization

Pigskin5 is approved for Google AdSense.

### Ad Interstitial

After a player presses **START**, a full-screen interstitial ad plays before the quiz begins. The ad reuses slot `3343356628` (250×250 rectangle).

**Countdown behavior** is controlled by a single constant at the top of the interstitial script block in `index.html`:

```js
var COUNTDOWN_SECONDS = 0; // set to 3 to re-enable the countdown
```

| Value | Behavior |
|---|---|
| `0` | ▶ button is immediately active — player can skip instantly |
| `3` | 3-second countdown before the ▶ button unlocks |

To enforce the countdown (when your playerbase grows), find this line in the inline `<script>` block near the bottom of `index.html` and change `0` to `3`.

---

## SEO & Infrastructure

- **Hosting:** GitHub Pages with custom domain via `CNAME` → `pigskin5.com`
- **SSL:** Provided by GitHub Pages
- **Sitemap:** `sitemap.xml` covers core pages + blog articles
- **Robots:** `robots.txt` allows all crawlers, points to sitemap
- **Static Archive:** `archive-static.html` is the primary SEO play — thousands of questions rendered as crawlable HTML with structured headings, correct answers marked, and internal links back to the quiz
- **Blog:** 29 articles across 5 categories targeting NFL search terms (draft prospects, free agency, history, rivalries, team analysis)
- **Contact:** Formspree-backed form at `contact.html` (endpoint: `formspree.io/f/xpqjlkjp`)

---

## Key Workflows Cheat Sheet

| Task | Steps |
|---|---|
| Add questions for next week | Edit `questions.js` → add date entries → deploy |
| Generate questions in bulk | `git pull` (gets the Tuesday stats refresh) → `cd tools/question-generator` → `py generate_questions.py --days 7 --start-date YYYY-MM-DD` (bigger batches OK in offseason) → review `generated_questions.js` → merge into `questions.js` |
| Refresh NFL stats now | GitHub → Actions → "Refresh NFL stats from nflverse" → **Run workflow** → `git pull` |
| Test a specific date locally | Open `http://127.0.0.1:5500/index.html?date=2025-12-25` in browser |
| Reset today's attempt (signed-in or anon) | Open browser console → `__devResetToday()` |
| Update the quiz archive | `node generate-archive.mjs` (run from `pigskin5/`) → deploy `archive-static.html` |
| Add a new blog post | Create `blog/your-slug.html` → add entry to `ARTICLES` array in `blog/blog-index.html` → optionally add to `sitemap.xml` |
| Update awards data (after NFL Honors) | Add the season's awards to the **second** `SEASON_LEADERS` block + `MVP_WINNERS` in `nfl_data.py`; update QB SB/MVP counts in `QB_AWARDS` in `update_nfl_data.py` |
| Shrink questions.js | Cut old date entries from `questions.js` → paste into `archive-legacy.js` → `node generate-archive.mjs` → deploy all three files |
| Add an event theme | Set `event: "YourEvent"` on the date in `questions.js` → add `"YourEvent": "logos/yourlogo.png"` to `EVENT_LOGOS` in `modules/config.js` → add the logo image to `logos/` |
| Set a daily reminder popup | Edit `REMINDERS` in `modules/reminders.js` → set day key to `{ title, message }` (or `null` to clear) → deploy |
| Enable interstitial countdown | In `index.html`, find `var COUNTDOWN_SECONDS = 0` in the interstitial script → change to `3` |
| Update the leaderboard API | The endpoint URL is hardcoded in `main.js` as `LEADERBOARD_API_URL` — update there if the Google Apps Script deployment changes |