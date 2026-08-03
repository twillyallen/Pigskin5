#!/usr/bin/env python3
"""
Pigskin5 Question Generator v1.0
================================
Generates daily NFL trivia questions in the exact format pigskin5.com expects.

Usage:
    python generate_questions.py --days 30 --start-date 2026-04-08
    python generate_questions.py --days 7 --start-date 2026-04-08 --enhance

Output:
    generated_questions.js  (drop-in replacement for your CALENDAR entries)

Requirements:
    pip install anthropic  (only needed if using --enhance flag)
"""

import json
import random
import argparse
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Import our modules
from generators.stat_leader import StatLeaderGenerator
from generators.true_false import TrueFalseGenerator
from generators.over_under import OverUnderGenerator
from generators.guess_player import GuessPlayerGenerator
from generators.franchise import FranchiseGenerator
from generators.history import HistoryGenerator
from generators.real_player import RealPlayerGenerator
from generators.evergreen import EvergreenGenerator

# ─── CONFIG ──────────────────────────────────────────────────────────────────

QUESTIONS_PER_DAY = 5

# Chance, per day, that one of the 5 slots is swapped for a hand-picked
# evergreen question instead of an auto-generated one. Kept separate from
# CATEGORY_POOL so it stays a rare mix-in rather than a peer category.
EVERGREEN_CHANCE = 0.15
DIFFICULTY_DISTRIBUTION = {
    "easy": 1,    # 1 easy per day
    "medium": 3,  # 3 medium per day
    "hard": 1,    # 1 hard per day
}

# Category balance: ensure variety each day
# Each day picks from these pools, never repeating a category
CATEGORY_POOL = [
    "stat_leader",
    "true_false",
    "over_under",
    "guess_player",
    "franchise",
    "history",
    "real_player",
]

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# How many days back/forward a question fingerprint can't repeat within.
# Checked against both the existing published history (questions.js /
# archive-legacy.js) and questions generated earlier in the same run.
DEFAULT_WINDOW_DAYS = 35

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_HISTORY_FILES = [REPO_ROOT / "questions.js", REPO_ROOT / "archive-legacy.js"]

_QUESTION_LINE_RE = re.compile(r'question:\s*"((?:[^"\\]|\\.)*)"\s*,\s*choices:\s*(\[[^\]]*\])')
_DATE_KEY_RE = re.compile(r'^\s*"(\d{4}-\d{2}-\d{2})"\s*:')


def fingerprint(question_text: str, choices: list[str] | None = None) -> str:
    """
    Normalize a question for duplicate detection. Some generators (e.g.
    real_player) reuse the exact same question text every time and vary
    only the choices, so the choice set has to be part of the fingerprint
    or those questions look identical no matter what they actually ask.
    Choices are sorted so re-shuffled option order still matches.
    """
    base = question_text[:80].lower().strip()
    if choices:
        base += "|" + "|".join(sorted(c.lower().strip() for c in choices))
    return base


def load_question_history(paths: list[Path]) -> dict[str, list[str]]:
    """
    Scan existing CALENDAR/LEGACY-style JS files (one question per line) and
    return {fingerprint: [dates the question appeared on]}. This lets us
    enforce the no-repeat window across separate generator runs, not just
    within a single batch.
    """
    history: dict[str, list[str]] = {}
    for path in paths:
        if not path.exists():
            print(f"   ⚠️  History file not found, skipping: {path}")
            continue
        current_date = None
        for line in path.read_text(encoding="utf-8").splitlines():
            date_match = _DATE_KEY_RE.match(line)
            if date_match:
                current_date = date_match.group(1)
                continue
            q_match = _QUESTION_LINE_RE.search(line)
            if q_match and current_date:
                text = q_match.group(1).replace('\\"', '"').replace('\\n', '\n')
                try:
                    choices = json.loads(q_match.group(2))
                except json.JSONDecodeError:
                    choices = None
                history.setdefault(fingerprint(text, choices), []).append(current_date)
    return history


def _days_between(date_a: str, date_b: str) -> int:
    return abs((datetime.strptime(date_a, "%Y-%m-%d") - datetime.strptime(date_b, "%Y-%m-%d")).days)


def recently_used(fp: str, target_date: str, history: dict[str, list[str]], window_days: int) -> bool:
    """True if this fingerprint appeared within window_days of target_date."""
    return any(_days_between(target_date, d) <= window_days for d in history.get(fp, []))


def get_daily_categories(day_index: int) -> list[str]:
    """
    Pick 5 question categories for a given day, ensuring variety.
    Uses the day_index to rotate which categories appear.
    """
    # Always include at least one of the fan-favorites
    must_have = []
    
    # Rotate the "anchor" question types across the week
    anchors = [
        ["guess_player", "true_false"],
        ["over_under", "history"],
        ["real_player", "franchise"],
        ["guess_player", "stat_leader"],
        ["true_false", "over_under"],
        ["history", "real_player"],
        ["franchise", "guess_player"],
    ]
    
    day_anchors = anchors[day_index % len(anchors)]
    
    # Fill remaining slots from the pool, avoiding duplicates
    remaining = [c for c in CATEGORY_POOL if c not in day_anchors]
    random.shuffle(remaining)
    
    categories = list(day_anchors) + remaining[:QUESTIONS_PER_DAY - len(day_anchors)]
    random.shuffle(categories)  # Randomize order within the day
    
    return categories[:QUESTIONS_PER_DAY]


def assign_difficulties(n: int) -> list[str]:
    """Assign difficulty levels to n questions based on distribution."""
    difficulties = []
    for diff, count in DIFFICULTY_DISTRIBUTION.items():
        difficulties.extend([diff] * count)
    
    # If we need more than the distribution covers, fill with medium
    while len(difficulties) < n:
        difficulties.append("medium")
    
    random.shuffle(difficulties)
    return difficulties[:n]


def generate_day(date: datetime, day_index: int, generators: dict, history: dict, window_days: int) -> dict:
    """Generate one day's worth of questions."""
    categories = get_daily_categories(day_index)
    difficulties = assign_difficulties(QUESTIONS_PER_DAY)

    # Every now and then, swap one slot for a hand-picked evergreen question.
    if random.random() < EVERGREEN_CHANCE:
        slot = random.randrange(len(categories))
        categories[slot] = "evergreen"

    date_str = date.strftime("%Y-%m-%d")
    questions = []
    for cat, diff in zip(categories, difficulties):
        gen = generators[cat]

        # Try up to 10 times to get a question that hasn't appeared within
        # `window_days` of this date (checked against published history and
        # anything already generated earlier in this run).
        for attempt in range(10):
            q = gen.generate(difficulty=diff)
            fp = fingerprint(q["question"], q.get("choices"))

            if not recently_used(fp, date_str, history, window_days):
                break
        else:
            print(f"   ⚠️  {date_str}: no fresh '{cat}' question found within "
                  f"{window_days} days after 10 tries — repeating: {q['question'][:70]!r}")

        questions.append(q)
        history.setdefault(fp, []).append(date_str)

    day_name = DAY_NAMES[date.weekday()]
    return {
        "date": date_str,
        "day_name": day_name,
        "questions": questions,
    }


def format_as_js(days: list[dict]) -> str:
    """Format generated questions as a JS file matching Pigskin5's CALENDAR format."""
    lines = []
    lines.append("")
    lines.append("// ═══════════════════════════════════════════════════════════")
    lines.append("// AUTO-GENERATED by Pigskin5 Question Generator")
    lines.append(f"// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"// Days: {len(days)}")
    lines.append("// ═══════════════════════════════════════════════════════════")
    lines.append("// REVIEW CHECKLIST:")
    lines.append("//   [ ] Spot-check 5 random answers for accuracy")
    lines.append("//   [ ] Verify no duplicate questions across days")
    lines.append("//   [ ] Check difficulty feels balanced")
    lines.append("//   [ ] Merge into your main questions.js CALENDAR object")
    lines.append("// ═══════════════════════════════════════════════════════════")
    lines.append("")
    
    for day in days:
        date_str = day["date"]
        day_name = day["day_name"]
        
        lines.append(f'    "{date_str}": {{ //{day_name}')
        lines.append('    event: "",')
        lines.append('    questions: [')
        
        for q in day["questions"]:
            # Format choices array
            choices_str = json.dumps(q["choices"], ensure_ascii=False)
            
            # Escape inner quotes in question text for JS
            question_text = q["question"].replace('"', '\\"').replace('\n', '\\n')
            
            # Handle answer (can be int or list for multi-answer)
            answer_val = q["answer"]
            
            line = f'    {{ question: "{question_text}", choices: {choices_str}, answer: {answer_val} }},'
            lines.append(line)
        
        lines.append('    ],')
        lines.append('  },')
    
    return "\n".join(lines)


def enhance_with_ai(days: list[dict]) -> list[dict]:
    """
    Optional: Use Anthropic API to polish question wording.
    Makes questions sound more natural and engaging.
    """
    try:
        import anthropic
        client = anthropic.Anthropic()
    except Exception as e:
        print(f"⚠️  AI enhancement skipped (couldn't init client): {e}")
        return days
    
    print("🤖 Enhancing questions with AI...")
    
    for day in days:
        for q in day["questions"]:
            # Only enhance questions that sound robotic
            if any(marker in q["question"].lower() for marker in [
                "which player", "who holds", "what is the", "how many"
            ]):
                try:
                    response = client.messages.create(
                        model="claude-sonnet-4-20250514",
                        max_tokens=200,
                        messages=[{
                            "role": "user",
                            "content": f"""Rewrite this NFL trivia question to sound more engaging and fun. 
Keep it concise. Don't change the factual content or answer. Return ONLY the rewritten question, nothing else.

Original: {q['question']}"""
                        }]
                    )
                    rewritten = response.content[0].text.strip()
                    # Only use if it's not way longer
                    if len(rewritten) < len(q["question"]) * 1.5:
                        q["question"] = rewritten
                except Exception as e:
                    pass  # Silently skip enhancement failures
    
    return days


def main():
    parser = argparse.ArgumentParser(description="Pigskin5 Question Generator")
    parser.add_argument("--days", type=int, default=7, help="Number of days to generate (default: 7)")
    parser.add_argument("--start-date", type=str, default=None, 
                       help="Start date YYYY-MM-DD (default: tomorrow)")
    parser.add_argument("--enhance", action="store_true",
                       help="Use Anthropic API to polish question wording")
    parser.add_argument("--output", type=str, default="generated_questions.js",
                       help="Output filename")
    parser.add_argument("--seed", type=int, default=None,
                       help="Random seed for reproducibility")
    parser.add_argument("--only", type=str, default=None,
                   choices=["stat_leader", "true_false", "over_under",
                            "guess_player", "franchise", "history", "real_player",
                            "evergreen"],
                   help="Generate only this question type (ignores day structure)")
    parser.add_argument("--count", type=int, default=10,
                   help="When using --only, how many questions to generate")
    parser.add_argument("--save", action="store_true",
                   help="When using --only, also write questions to the output file")
    parser.add_argument("--window-days", type=int, default=DEFAULT_WINDOW_DAYS,
                   help=f"Reject a generated question if the same fact appeared within "
                        f"this many days, checked against history + this run (default: {DEFAULT_WINDOW_DAYS})")
    parser.add_argument("--history-file", type=str, action="append", default=None,
                   help="JS file to scan for existing questions (repeatable). "
                        "Default: questions.js and archive-legacy.js at the repo root")
    
    args = parser.parse_args()

    # Set seed BEFORE initializing generators so TrueFalseGenerator's fact bank is deterministic
    if args.seed is not None:
        random.seed(args.seed)

    # Initialize generators
    generators = {
        "stat_leader": StatLeaderGenerator(),
        "true_false": TrueFalseGenerator(),
        "over_under": OverUnderGenerator(),
        "guess_player": GuessPlayerGenerator(),
        "franchise": FranchiseGenerator(),
        "history": HistoryGenerator(),
        "real_player": RealPlayerGenerator(),
        "evergreen": EvergreenGenerator(),
    }
    if args.only:
            gen = generators[args.only]
            print(f"🎯 Generating {args.count} {args.only} questions only")
            print()
            
            collected = []
            for i in range(args.count):
                diff = random.choice(["easy", "medium", "hard"])
                q = gen.generate(difficulty=diff)
                collected.append(q)
                
                print(f"[{i+1}] ({diff})")
                print(f"    Q: {q['question']}")
                for j, c in enumerate(q['choices']):
                    marker = "✅" if j == q['answer'] else "  "
                    print(f"    {marker} {c}")
                print()
            
            if args.save:
                # Wrap in a fake "day" so format_as_js works
                fake_day = {
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "day_name": "TestBatch",
                    "questions": collected,
                }
                js_output = format_as_js([fake_day])
                output_path = Path(args.output)
                output_path.write_text(js_output, encoding="utf-8")
                print(f"   📝 Wrote {len(collected)} questions to {args.output}")
            
            return

    # Parse start date
    if args.start_date:
        start = datetime.strptime(args.start_date, "%Y-%m-%d")
    else:
        start = datetime.now() + timedelta(days=1)
    
    print(f"🏈 Pigskin5 Question Generator")
    print(f"   Generating {args.days} days starting {start.strftime('%Y-%m-%d')}")
    print(f"   Output: {args.output}")
    print()

    history_paths = [Path(p) for p in args.history_file] if args.history_file else DEFAULT_HISTORY_FILES
    history = load_question_history(history_paths)
    print(f"   📚 Loaded {len(history)} known questions from {len(history_paths)} history file(s) "
          f"— enforcing a {args.window_days}-day no-repeat window")
    print()

    days = []

    for i in range(args.days):
        date = start + timedelta(days=i)
        day = generate_day(date, i, generators, history, args.window_days)
        days.append(day)
        
        # Progress indicator
        q_types = [q.get("_type", "?") for q in day["questions"]]
        print(f"   ✅ {day['date']} ({day['day_name']}) — {len(day['questions'])} questions")
    
    # Optional AI enhancement
    if args.enhance:
        days = enhance_with_ai(days)
    
    # Format and write output
    js_output = format_as_js(days)
    
    output_path = Path(args.output)
    output_path.write_text(js_output, encoding="utf-8")
    
    total = sum(len(d["questions"]) for d in days)
    print()
    print(f"   📝 Wrote {total} questions across {args.days} days to {args.output}")
    print(f"   ⚠️  REVIEW before merging into your CALENDAR!")
    print()


if __name__ == "__main__":
    main()
