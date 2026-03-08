// generate-archive.mjs
// Run with: node generate-archive.mjs
// Place this file in the same folder as archive-legacy.js and questions.js
// Output: archive-static.html (deploy this alongside your other HTML files)

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Read and eval the JS data files ──────────────────────────────────────────
// We strip the ES module export syntax so we can eval them as plain objects

function loadDataFile(filename) {
  let src = readFileSync(join(__dirname, filename), 'utf8');
  // Remove export const VARNAME = and replace with assignment
  src = src.replace(/export\s+const\s+\w+\s*=\s*/g, 'globalThis.__data = ');
  // Remove single-line comments that might break parsing
  src = src.replace(/\/\/[^\n]*/g, '');
  try {
    eval(src);
    return globalThis.__data;
  } catch(e) {
    console.error(`Error parsing ${filename}:`, e.message);
    process.exit(1);
  }
}

const LEGACY = loadDataFile('archive-legacy.js');
const CALENDAR = loadDataFile('questions.js');

// ── Normalize both formats ────────────────────────────────────────────────────
// Legacy early dates: { "2025-09-10": [ ...questions ] }
// Legacy later dates: { "2025-09-10": { event: "", questions: [...] } }
// CALENDAR: { "2026-03-07": { event: "", questions: [...] } }

function normalizeEntry(val) {
  if (Array.isArray(val)) return { event: '', questions: val };
  if (val && Array.isArray(val.questions)) return val;
  return null;
}

// Merge both sources, CALENDAR takes precedence
const ALL = {};
for (const [date, val] of Object.entries(LEGACY)) {
  const norm = normalizeEntry(val);
  if (norm && norm.questions.length > 0) ALL[date] = norm;
}
for (const [date, val] of Object.entries(CALENDAR)) {
  // Skip POOL key if present
  if (date === 'POOL') continue;
  const norm = normalizeEntry(val);
  if (norm && norm.questions.length > 0) ALL[date] = norm;
}

// Sort dates descending (newest first)
const sortedDates = Object.keys(ALL).sort((a, b) => b.localeCompare(a));

// ── Group by month ─────────────────────────────────────────────────────────
function getMonthLabel(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const byMonth = {};
for (const date of sortedDates) {
  const label = getMonthLabel(date);
  if (!byMonth[label]) byMonth[label] = [];
  byMonth[label].push(date);
}

// ── Format a single date nicely ───────────────────────────────────────────
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
}

// ── Build the HTML for all questions ─────────────────────────────────────────
function buildQuestionsHTML(questions) {
  return questions.map((q, qi) => {
    const answer = q.answer;
    const choicesHTML = q.choices.map((c, ci) => {
      const isAnswer = ci === answer;
      return `<li class="choice${isAnswer ? ' correct-answer' : ''}">${c}${isAnswer ? ' ✓' : ''}</li>`;
    }).join('\n            ');

    return `
        <div class="archive-question">
          <p class="question-text"><strong>Q${qi + 1}:</strong> ${q.question.replace(/\n/g, '<br>')}</p>
          <ul class="choices-list">
            ${choicesHTML}
          </ul>
        </div>`;
  }).join('');
}

// ── Build month sections ──────────────────────────────────────────────────────
function buildMonthSections() {
  return Object.entries(byMonth).map(([monthLabel, dates]) => {
    const daysHTML = dates.map(date => {
      const entry = ALL[date];
      const questionsHTML = buildQuestionsHTML(entry.questions);
      return `
      <div class="archive-day">
        <h3 class="day-heading">${formatDate(date)}</h3>
        ${questionsHTML}
      </div>`;
    }).join('');

    return `
    <section class="archive-month">
      <h2 class="month-heading">${monthLabel}</h2>
      ${daysHTML}
    </section>`;
  }).join('');
}

const totalQuestions = sortedDates.reduce((sum, d) => sum + ALL[d].questions.length, 0);
const totalDays = sortedDates.length;
const newestDate = sortedDates[0];
const oldestDate = sortedDates[sortedDates.length - 1];

// ── Full HTML output ──────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NFL Trivia Question Archive – Every Pigskin5 Quiz Since September 2025</title>
  <meta name="description" content="Browse every NFL trivia question from Pigskin5's daily quiz archive. ${totalQuestions}+ questions covering NFL history, records, players, Super Bowls, and current season stats since September 2025.">
  <link rel="canonical" href="https://pigskin5.com/archive-static.html" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="stylesheet" href="style.css" />

  <!-- Open Graph -->
  <meta property="og:title" content="NFL Trivia Archive – Every Pigskin5 Question">
  <meta property="og:description" content="${totalQuestions}+ NFL trivia questions from ${totalDays} daily quizzes. Browse by date and test your football knowledge.">
  <meta property="og:url" content="https://pigskin5.com/archive-static.html">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://pigskin5.com/logos/pigskin5share.png">

  <style>
    .archive-hero {
      text-align: center;
      padding: 32px 16px 24px;
    }
    .archive-hero h1 {
      font-size: clamp(24px, 5vw, 38px);
      font-weight: 900;
      margin: 0 0 10px;
    }
    .archive-hero p {
      font-size: clamp(13px, 2.5vw, 16px);
      opacity: 0.8;
      margin: 0 0 16px;
    }
    .archive-stats {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .archive-stat-pill {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 999px;
      padding: 5px 16px;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .archive-content {
      max-width: 760px;
      margin: 0 auto;
      padding: 0 16px 60px;
    }
    .archive-month {
      margin-bottom: 48px;
    }
    .month-heading {
      font-size: 1.3rem;
      font-weight: 900;
      border-bottom: 2px solid rgba(255,255,255,0.15);
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .archive-day {
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 20px 22px;
      margin-bottom: 20px;
    }
    .day-heading {
      font-size: 1rem;
      font-weight: 800;
      color: rgba(183,247,255,0.9);
      margin: 0 0 16px;
    }
    .archive-question {
      margin-bottom: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .archive-question:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .question-text {
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 10px;
      color: #fff;
    }
    .choices-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .choices-list li {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 5px 12px;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.7);
    }
    .choices-list li.correct-answer {
      background: rgba(54,196,106,0.2);
      border-color: rgba(54,196,106,0.5);
      color: #a8ffcc;
      font-weight: 700;
    }
    .play-cta {
      text-align: center;
      padding: 32px 16px;
      background: rgba(0,0,0,0.3);
      border-top: 1px solid rgba(255,255,255,0.08);
      margin-top: 40px;
    }
    .play-cta h2 {
      font-size: 1.4rem;
      margin: 0 0 12px;
    }
    .play-cta p {
      opacity: 0.7;
      margin: 0 0 20px;
    }
    .play-cta a {
      display: inline-block;
      background: var(--btn-cyan, #b7f7ff);
      color: #0a1628;
      font-weight: 900;
      font-size: 1rem;
      padding: 13px 32px;
      border-radius: 12px;
      text-decoration: none;
      letter-spacing: 0.03em;
    }
    .back-link {
      display: inline-block;
      margin: 24px 0 0 0;
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      text-decoration: none;
    }
    .back-link:hover { color: #fff; }
  </style>
</head>
<body>
  <nav class="site-nav" style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;padding:8px 16px;background:rgba(0,0,0,0.25);border-bottom:1px solid rgba(255,255,255,0.08);">
    <a href="index.html" style="color:rgba(255,255,255,0.75);font-size:0.78rem;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Home</a>
    <a href="question-archive.html" style="color:rgba(255,255,255,0.75);font-size:0.78rem;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Archive</a>
    <a href="blog/blog-index.html" style="color:rgba(255,255,255,0.75);font-size:0.78rem;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Blog</a>
    <a href="about.html" style="color:rgba(255,255,255,0.75);font-size:0.78rem;font-weight:700;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">About</a>
  </nav>

  <div class="archive-hero">
    <h1>Pigskin5 NFL Trivia Archive</h1>
    <p>Every question from every daily quiz — with answers. Browse by date or search your memory.</p>
    <div class="archive-stats">
      <span class="archive-stat-pill">${totalQuestions} Questions</span>
      <span class="archive-stat-pill">${totalDays} Daily Quizzes</span>
      <span class="archive-stat-pill">Since ${formatDate(oldestDate)}</span>
    </div>
    <a href="index.html" class="back-link">← Play Today's Quiz</a>
  </div>

  <main class="archive-content">
    ${buildMonthSections()}

    <div class="play-cta">
      <h2>Ready for Today's Quiz?</h2>
      <p>A fresh set of 5 NFL trivia questions drops every day at midnight.</p>
      <a href="index.html">Play Pigskin5 Now</a>
    </div>
  </main>

  <footer class="site-footer">
    <nav class="footer-links-grid" aria-label="Footer navigation">
      <a href="index.html">Home</a>
      <a href="question-archive.html">Question Archive</a>
      <a href="blog/blog-index.html">NFL Blog</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <a href="privacy.html">Privacy Policy</a>
      <a href="cookies.html">Cookie Policy</a>
      <a href="terms.html">Terms of Service</a>
    </nav>
    <small>&copy; 2026 Pigskin5 - Not affiliated with the NFL</small>
  </footer>
</body>
</html>`;

const outPath = join(__dirname, 'archive-static.html');
writeFileSync(outPath, html, 'utf8');
console.log(`✅ Done! Generated archive-static.html`);
console.log(`   ${totalDays} quiz dates | ${totalQuestions} total questions`);
console.log(`   Date range: ${oldestDate} → ${newestDate}`);
console.log(`\n📁 Deploy archive-static.html to your site root.`);
console.log(`🔗 Add a link to it from your index.html footer.`);
