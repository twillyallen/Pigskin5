# Pigskin5

Daily NFL Trivia Quiz 

Live site: [pigskin5.com ](pigskin5.com) 

GitHub Pages (twillyallen.github.io)

Author: Thomas Allen (@TwillysTakes)

========================================

### Table of Contents

&#x09;Overview

Project Structure

&#x09;Local Development

Question System

&#x09;How Questions Are Structured

Adding Questions Manually

&#x09;Generating Questions Automatically

NFL Data Layer

&#x09;Testing Specific Dates

Quiz Archive

&#x09;How the Archive Works

Regenerating the Archive

&#x09;Blog System

Blog Structure

&#x09;Adding a New Blog Post

Updating the Blog Index

&#x09;Updating the Sitemap

Game Mechanics

&#x09;Monetization (AdSense)

SEO \& Infrastructure

&#x09;Key Workflows Cheat Sheet

========================================



Project Structure



pigskin5.com/

│

├── index.html                  # Main game page 

├── main.js                     # Game logic monolith 

├── questions.js                # Active CALENDAR object 

├── style.css                   # All site styling

│

├── modules/                    # Modular JS extractions (config, storage, etc.)

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

│   ├── \*.html                  # Individual blog articles

│   └── (articles follow a shared HTML template)

│

├── about.html                  # About page

├── contact.html                # Contact form 

├── privacy.html                # Privacy policy

├── terms.html                  # Terms of service

├── cookies.html                # Cookie policy

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

&#x20;   ├── generate\_questions.py   # CLI entry point

&#x20;   ├── generated\_questions.js  # **\*\*THESE ARE WHERE WE GET THE NEW QUESTIONS\*\***

&#x20;   ├── awards\_overlay.json     # Manual awards data (MVPs, SB wins, etc.)

&#x20;   ├── nfl\_data.py             

&#x20;   ├── nfl\_data\_original\_recovered.py

&#x20;   ├── nfl\_data\_GENERATED.py	 # Core NFL data: players, teams, records, etc. **\*\*USE THIS ONE\*\***

&#x20;   ├── update\_nfl\_data.py      # Script to refresh/update nfl\_data.py

&#x20;   └── generators/

&#x20;       ├── \_\_init\_\_.py         # BaseGenerator ABC + shared utilities

&#x20;       ├── stat\_leader.py      # "Who led the NFL in X in Y?"

&#x20;       ├── true\_false.py       # True/False NFL fact questions

&#x20;       ├── over\_under.py       # "O/U: Player has X.5 career stat"

&#x20;       ├── guess\_player.py     # "Guess the QB/RB/WR from this stat line"

&#x20;       ├── franchise.py        # Franchise history, all-time leaders

&#x20;       ├── history.py          # Super Bowls, iconic moments, drafts, awards

&#x20;       └── real\_player.py      # "Which was an ACTUAL NFL player?"



========================================

#### **Adding Questions Manually**

Open `questions.js`.

Add a new date entry following the format above.

Make sure the date doesn't already exist in `archive-legacy.js` (legacy takes lower priority, but avoid duplicates).

Deploy.

#### **Generating Questions Automatically**

The Python pipeline in `question-gen/` automates bulk question creation.



cd question-gen/



\# Generate 7 days of questions starting April 15



##### "py .\generate_questions.py --days 14 --start-date 2026-04-08"



This is NOT a drop-in replacement; you need to review the output and merge the entries into your main `questions.js`.



##### Review checklist (printed in the output file):

\[ ] Spot-check 5 random answers for accuracy

\[ ] Verify no duplicate questions across days

\[ ] Check difficulty feels balanced

\[ ] Merge into your main `questions.js` CALENDAR object



Generator Types

Generator	File			Question Format

Stat Leader	`stat\_leader.py`	"Who led the NFL in X in Y?" / "Which QB has more career X?"

True/False	`true\_false.py`		"True or False: \[NFL fact]"

Over/Under	`over\_under.py`		"O/U: \[Player] has X.5 \[career stat]"

Guess Player	`guess\_player.py`	"Guess the Career QB: \[stat line]"

Franchise	`franchise.py`		"Who is the \[Team]'s all-time leader in X?"

History		`history.py`		Super Bowls, iconic moments, draft picks, awards, coaches

Real Player	`real\_player.py`	"Which of these was an ACTUAL NFL player?" (real name vs. fakes)

Each day gets 5 questions with a rotation system that ensures category variety (2 "anchor" types per day + 3 random). Difficulty distribution defaults to 1 easy, 3 medium, 1 hard per day.



All generators pull from `nfl\_data\_GENERATED.py`, which exports:

`QUARTERBACKS`, `RUNNING\_BACKS`, `WIDE\_RECEIVERS`, `TIGHT\_ENDS` — player tuples: `(name, position, stats\_dict, era, teams\_list)`

`FRANCHISES` — team history (founded, Super Bowls, all-time leaders, previous names, etc.)

`SUPER\_BOWLS` — winner/loser by numeral

`SEASON\_LEADERS` — yearly stat leaders and award winners

`ICONIC\_MOMENTS`, `COACHES`, `DRAFT\_NOTABLES`, `RECORDS`, `NFL\_FACTS`

`MVP\_WINNERS`, `KICKER\_MVP`

`REAL\_UNUSUAL\_PLAYERS`, `FAKE\_NAME\_PARTS` — for the "Real Player" question type

`awards\_overlay.json` supplements `nfl\_data.py` with manually tracked awards (MVPs, Super Bowl wins per QB, season awards by year) since nflverse doesn't track these. Update this file each offseason.

`update\_nfl\_data.py` is a script for refreshing the data layer (e.g., pulling updated career stats).

========================================

#### **Testing Specific Dates**



In date-utils.js:


http://127.0.0.1:5500/index.html?date=2025-01-15 (change date here)



Then paste in your browser



Clear localStorage for that date if you've already "played" it: open DevTools → Application → Local Storage → delete keys starting with `ft5\_attempt\_` and `ft5\_result\_` for that date.

========================================

#### **Quiz Archive**



How the Archive Works

There are two archive systems:

* **`question-archive.html`** — a dynamic JS-powered archive viewer that imports `questions.js` at runtime.
* **`archive-static.html`** — a pre-rendered static HTML page containing ALL questions with answers visible. This is the SEO-critical version since search engines can crawl all the content.



The static archive is built from two data sources:

* `archive-legacy.js` — historical questions from September 2025 through early March 2026 (before `questions.js` existed as the primary source).
* `questions.js` — current/recent questions.



###### **Regenerating the Archive**

Whenever you add new questions to `questions.js` or `archive-legacy.js`, regenerate the static archive:

in terminal:

node generate-archive.mjs



This outputs a fresh `archive-static.html` with all questions merged, sorted newest-first, grouped by month, with correct answers marked. Deploy the updated file.

When to regenerate:

* After adding a new batch of questions to `questions.js`
* After correcting any question or answer
* Periodically (e.g., weekly or monthly) to keep the archive current



========================================



#### **Blog System**

Blog Structure

The blog lives in the `blog/` directory. It consists of:

`blog-index.html` — the hub page with search, category filters, and article cards

Individual `.html` article files — each is a standalone page with shared styling

Articles are categorized into 5 groups: Current Season, Draft, History, Teams, Trivia \& Strategy.

Adding a New Blog Post

Create the HTML file in `blog/`. Use any existing article as a template. The standard structure is:

```html

<!DOCTYPE html>

<html lang="en">

<head>

&#x20; <meta charset="UTF-8">

&#x20; <meta name="viewport" content="width=device-width, initial-scale=1.0">

&#x20; <title>Your Title | Pigskin5</title>

&#x20; <meta name="description" content="Your SEO description here.">

&#x20; <link rel="canonical" href="https://pigskin5.com/blog/your-slug.html">

&#x20; <link rel="stylesheet" href="../style.css">

&#x20; <!-- Standard article styles (copy from any existing post) -->

</head>

<body>

&#x20; <header class="topbar">

&#x20;   <a href="../index.html" class="icon-btn" title="Back to Game">

&#x20;     <img src="../back-icon.png" alt="Pigskin5" width="24" height="24" />

&#x20;   </a>

&#x20; </header>

&#x20; <main class="article-content">

&#x20;   <a href="blog-index.html" class="article-back">← Back to Blog</a>

&#x20;   <h1>Your Title</h1>

&#x20;   <p class="article-meta">By Twillyallen | Month Year | X min read</p>

&#x20;   <!-- Article body -->

&#x20;   <p>CTA: <a href="../index.html"><strong>Play today's Pigskin5 quiz!</strong></a></p>

&#x20; </main>

&#x20; <!-- Standard footer (copy from any existing post) -->

</body>

</html>

```

Newer posts use a category tag badge instead of the `article-meta` line:

```html

<div class="article-tag">Draft</div>

```

Updating the Blog Index

After creating the article file, you must add it to the `ARTICLES` array inside `blog/blog-index.html`. Open that file, find the `const ARTICLES = \[...]` array in the `<script>` block, and add a new entry:

```js

{

&#x20; slug: "your-slug.html",

&#x20; title: "Your Article Title",

&#x20; excerpt: "A 1-2 sentence preview for the card.",

&#x20; category: "draft",              // One of: season, draft, history, teams, trivia

&#x20; categoryLabel: "Draft",         // Display label

&#x20; published: "2026-04-05",        // YYYY-MM-DD

&#x20; section: "NFL Draft"            // Section heading the card groups under

},

```

The blog index auto-generates a "NEW" badge for articles published within the last 3 days. Update the article count in the `stat-pill` if you want it accurate (it also reads `ARTICLES.length` dynamically).

Updating the Sitemap

If the new blog post targets meaningful SEO keywords, add it to `sitemap.xml`:

```xml

<url>

&#x20; <loc>https://pigskin5.com/blog/your-slug.html</loc>

&#x20; <changefreq>monthly</changefreq>

&#x20; <priority>0.7</priority>

</url>

```

Use `0.7` for evergreen/reference content, `0.6` for timely/seasonal pieces.



========================================



#### **Game Mechanics**

Scoring: Each correct answer earns points. Faster answers earn more points (speed bonus based on time remaining out of 15 seconds). Total points = sum across all 5 questions.

Streaks:

Daily Streak — consecutive days played (any score counts).

Touchdown Streak — consecutive days with a perfect 5/5 score. Resets on any non-perfect day.

Streak Tiers:

Tier		Days	Emoji

Rookie		0+	🫡

Starter		7+	🏈

Pro		14+	🔥

All-Pro		30+	⭐

Hall of Fame	50+	🏆

Legend		100+	👑



Leaderboard: Optional. After finishing the quiz, players can submit a display name. Submissions go to a Google Apps Script endpoint that stores them in a Google Sheet. Names are validated against a banned words list and limited to 27 characters with no spaces.

Session Recovery: If a player refreshes the page or switches tabs mid-quiz, `sessionStorage` tracks the in-progress state. On return, the game detects the interrupted session and calls `forfeitAndFinish()` to close out the attempt (remaining questions are marked wrong).



Event Theming: The `event` field on a date entry triggers a themed logo and optional visual effects (snow for Christmas, hearts for Valentine's Day, confetti for celebrations). Event logos are mapped in the `EVENT\_LOGOS` config object.



========================================



#### **Monetization (AdSense)**

Pigskin5 is approved for Google AdSense 



========================================



#### **SEO \& Infrastructure**

Hosting: GitHub Pages with custom domain via `CNAME` → `pigskin5.com`

SSL: Provided by GitHub Pages

Sitemap: `sitemap.xml` covers core pages + blog articles

Robots: `robots.txt` allows all crawlers, points to sitemap

Static Archive: `archive-static.html` is the primary SEO play — thousands of questions rendered as crawlable HTML with structured headings, correct answers marked, and internal links back to the quiz

Blog: 29 articles across 5 categories targeting NFL search terms (draft prospects, free agency, history, rivalries, team analysis)

Contact: Formspree-backed form at `contact.html` (endpoint: `formspree.io/f/xpqjlkjp`)

\---

Key Workflows Cheat Sheet

Task	Steps

Add questions for next week	Edit `questions.js` → add date entries → deploy

Generate questions in bulk	`cd question-gen \&\& python generate\_questions.py --days 14 --start-date YYYY-MM-DD` → review `generated\_questions.js` → merge into `questions.js`

Test a specific date locally	`http://127.0.0.1:5500/index.html?date=2025-12-25`

Update the quiz archive	`node generate-archive.mjs` → deploy `archive-static.html`

Add a new blog post	Create `blog/your-slug.html` → add entry to `ARTICLES` array in `blog/blog-index.html` → optionally add to `sitemap.xml`

Update awards data	Edit `question-gen/awards\_overlay.json` with new season's MVP, OROY, DPOY, etc.

Shrink questions.js	Move older date entries from `questions.js` into `archive-legacy.js` → regenerate archive

Add an event theme	Set `event: "YourEvent"` on the date in `questions.js` → add `"YourEvent": "logos/yourlogo.png"` to `EVENT\_LOGOS` in `main.js` (and `config.js`) → add the logo image to `logos/`

Update the leaderboard API	The endpoint URL is hardcoded in `main.js` as `LEADERBOARD\_API\_URL` — update there if the Google Apps Script deployment changes



