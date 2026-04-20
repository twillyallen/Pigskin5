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
├── questions.js                # Active CALENDAR object
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
├── archive-legacy.js           # Every Question. Ever. (Sep 2025 – early Mar 2026)
├── archive-static.html         # GENERATED, SEO-friendly static archive page
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
└── question-gen/               # Python question generation pipeline
    ├── generate_questions.py             # CLI entry point
    ├── generated_questions.js            # ** WHERE NEW QUESTIONS LAND **
    ├── awards_overlay.json               # Manual awards data (MVPs, SB wins, etc.)
    ├── nfl_data.py
    ├── nfl_data_original_recovered.py
    ├── nfl_data_GENERATED.py             # Core NFL data — ** USE THIS ONE **
    ├── update_nfl_data.py                # Script to refresh nfl_data.py
    └── generators/
        ├── __init__.py         # BaseGenerator ABC + shared utilities
        ├── stat_leader.py      # "Who led the NFL in X in Y?"
        ├── true_false.py       # True/False NFL fact questions
        ├── over_under.py       # "O/U: Player has X.5 career stat"
        ├── guess_player.py     # "Guess the QB/RB/WR from this stat line"
        ├── franchise.py        # Franchise history, all-time leaders
        ├── history.py          # Super Bowls, iconic moments, drafts, awards
        └── real_player.py      # "Which was an ACTUAL NFL player?"
```

---

## Question System

### Adding Questions Manually

1. Open `questions.js`.
2. Add a new date entry following the existing format.
3. Make sure the date doesn't already exist in `archive-legacy.js` (legacy takes lower priority, but avoid duplicates).
4. Deploy.

### Generating Questions Automatically

The Python pipeline in `question-gen/` automates bulk question creation.

```powershell
cd "C:\Users\twill\Desktop\Coding Projects\NFL Trivia\pigskin5\tools\question-generator"; py generate_questions.py --days 14 --start-date 2026-04-26

```

For specific subsets of questions, use `--only`. Add `--save` to write to `generated_questions.js`; without it, questions only print to the terminal for quick previewing.

```powershell
py .\generate_questions.py --only true_false --count 20 --save
py .\generate_questions.py --only over_under --count 15 --save
py .\generate_questions.py --only guess_player --count 10 --save
py .\generate_questions.py --only stat_leader --count 15 --save
py .\generate_questions.py --only franchise --count 10 --save
py .\generate_questions.py --only history --count 15 --save
py .\generate_questions.py --only real_player --count 10 --save
```

This is NOT a drop-in replacement — review the output and merge entries into the main `questions.js`.

**Review checklist** (also printed in the output file):

- [ ] Spot-check 5 random answers for accuracy
- [ ] Verify no duplicate questions across days
- [ ] Check difficulty feels balanced
- [ ] Merge into the main `questions.js` CALENDAR object

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

Each day gets 5 questions with a rotation system that ensures category variety (2 "anchor" types per day + 3 random). Difficulty distribution defaults to 1 easy, 3 medium, 1 hard per day.

### NFL Data Layer

All generators pull from `nfl_data_GENERATED.py`, which exports:

- `QUARTERBACKS`, `RUNNING_BACKS`, `WIDE_RECEIVERS`, `TIGHT_ENDS` — player tuples: `(name, position, stats_dict, era, teams_list)`
- `DEFENSIVE_PLAYERS` — same shape, used for DPOY/DROY distractors
- `FRANCHISES` — team history (founded, Super Bowls, all-time leaders, previous names, etc.)
- `SUPER_BOWLS` — winner/loser by numeral
- `SEASON_LEADERS` — yearly stat leaders and award winners
- `ICONIC_MOMENTS`, `COACHES`, `DRAFT_NOTABLES`, `RECORDS`, `NFL_FACTS`
- `MVP_WINNERS`, `KICKER_MVP`
- `REAL_UNUSUAL_PLAYERS`, `FAKE_NAME_PARTS` — for the Real Player question type

`awards_overlay.json` supplements `nfl_data.py` with manually tracked awards (MVPs, Super Bowl wins per QB, season awards by year) since nflverse doesn't track these. Update this file each offseason.

`update_nfl_data.py` is a script for refreshing the data layer (e.g., pulling updated career stats).

**Known data issues to fix when touching this file:**
- Duplicate `SEASON_LEADERS` definition (lines 701 and 1262 — second one wins, verify nothing important is in the first)
- Peyton Manning is mistagged as `"classic"` era — should be `"modern"`

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
- **`archive-static.html`** — a pre-rendered static HTML page containing ALL questions with answers visible. This is the SEO-critical version since search engines can crawl all the content.

The static archive is built from two data sources:

- `archive-legacy.js` — historical questions from September 2025 through early March 2026 (before `questions.js` existed as the primary source).
- `questions.js` — current/recent questions.

### Regenerating the Archive

Whenever you add new questions to `questions.js` or `archive-legacy.js`, regenerate the static archive:

```bash
node generate-archive.mjs
```

This outputs a fresh `archive-static.html` with all questions merged, sorted newest-first, grouped by month, with correct answers marked. Deploy the updated file.

**When to regenerate:**
- After adding a new batch of questions to `questions.js`
- After correcting any question or answer
- Periodically (weekly or monthly) to keep the archive current

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

**Event Theming:** The `event` field on a date entry triggers a themed logo and optional visual effects (snow for Christmas, hearts for Valentine's Day, confetti for celebrations). Event logos are mapped in the `EVENT_LOGOS` config object.

---

## Monetization

Pigskin5 is approved for Google AdSense.

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
| Generate questions in bulk | `cd question-gen && python generate_questions.py --days 14 --start-date YYYY-MM-DD` → review `generated_questions.js` → merge into `questions.js` |
| Test a specific date locally | Open `http://127.0.0.1:5500/index.html?date=2025-12-25` in browser |
| Reset today's attempt (signed-in or anon) | Open browser console → `__devResetToday()` |
| Update the quiz archive | `node generate-archive.mjs` → deploy `archive-static.html` |
| Add a new blog post | Create `blog/your-slug.html` → add entry to `ARTICLES` array in `blog/blog-index.html` → optionally add to `sitemap.xml` |
| Update awards data | Edit `question-gen/awards_overlay.json` with new season's MVP, OROY, DPOY, etc. |
| Shrink questions.js | Move older date entries from `questions.js` into `archive-legacy.js` → regenerate archive |
| Add an event theme | Set `event: "YourEvent"` on the date in `questions.js` → add `"YourEvent": "logos/yourlogo.png"` to `EVENT_LOGOS` in `main.js` (and `config.js`) → add the logo image to `logos/` |
| Update the leaderboard API | The endpoint URL is hardcoded in `main.js` as `LEADERBOARD_API_URL` — update there if the Google Apps Script deployment changes |