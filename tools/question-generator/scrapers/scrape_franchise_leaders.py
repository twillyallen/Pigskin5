#!/usr/bin/env python3
"""
Franchise Leaders Scraper
=========================
Scrapes footballdb.com for all-time top-7 leaders per franchise:
  - Passing Yards
  - Rushing Yards
  - Receiving Yards
  - Sacks

Output: franchise_leaders_output.py — review it, then merge into nfl_data.py FRANCHISES.

Usage:
    pip install requests beautifulsoup4
    python scrape_franchise_leaders.py --team green-bay-packers   # test one team first
    python scrape_franchise_leaders.py                             # run all 32 teams
    python scrape_franchise_leaders.py --top 10 --delay 2.0       # slower, deeper
"""

import time
import argparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Missing dependencies. Run:")
    print("   pip install requests beautifulsoup4")
    raise SystemExit(1)


# ─── CONFIG ──────────────────────────────────────────────────────────────────

BASE_URL = "https://www.footballdb.com/teams/nfl/{slug}/leaders/{stat}"

STAT_CATEGORIES = {
    "pass_leaders": "career-passing-yards",
    "rush_leaders": "career-rushing-yards",
    "rec_leaders":  "career-receiving-yards",
    "sack_leaders": "career-defense-sacks",
}

# Maps nfl_data.py FRANCHISES key → footballdb.com team slug
TEAMS = {
    "Arizona Cardinals":    "arizona-cardinals",
    "Atlanta Falcons":      "atlanta-falcons",
    "Baltimore Ravens":     "baltimore-ravens",
    "Buffalo Bills":        "buffalo-bills",
    "Carolina Panthers":    "carolina-panthers",
    "Chicago Bears":        "chicago-bears",
    "Cincinnati Bengals":   "cincinnati-bengals",
    "Cleveland Browns":     "cleveland-browns",
    "Dallas Cowboys":       "dallas-cowboys",
    "Denver Broncos":       "denver-broncos",
    "Detroit Lions":        "detroit-lions",
    "Green Bay Packers":    "green-bay-packers",
    "Houston Texans":       "houston-texans",
    "Indianapolis Colts":   "indianapolis-colts",
    "Jacksonville Jaguars": "jacksonville-jaguars",
    "Kansas City Chiefs":   "kansas-city-chiefs",
    "Las Vegas Raiders":    "las-vegas-raiders",
    "Los Angeles Chargers": "los-angeles-chargers",
    "Los Angeles Rams":     "los-angeles-rams",
    "Miami Dolphins":       "miami-dolphins",
    "Minnesota Vikings":    "minnesota-vikings",
    "New England Patriots": "new-england-patriots",
    "New Orleans Saints":   "new-orleans-saints",
    "New York Giants":      "new-york-giants",
    "New York Jets":        "new-york-jets",
    "Philadelphia Eagles":  "philadelphia-eagles",
    "Pittsburgh Steelers":  "pittsburgh-steelers",
    "San Francisco 49ers":  "san-francisco-49ers",
    "Seattle Seahawks":     "seattle-seahawks",
    "Tampa Bay Buccaneers": "tampa-bay-buccaneers",
    "Tennessee Titans":     "tennessee-titans",
    "Washington Commanders":"washington-commanders",
}

# Browser-like headers — no "br" encoding since requests can't decompress Brotli
HEADERS = {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection":      "keep-alive",
    "Referer":         "https://www.footballdb.com/",
}


# ─── SCRAPER ─────────────────────────────────────────────────────────────────

def fetch_leaders(slug: str, stat: str, top_n: int = 7, debug: bool = False) -> list[tuple]:
    """
    Fetch top-N all-time leaders for one team/stat page.
    Returns list of (player_name, stat_value) tuples.
    """
    url = BASE_URL.format(slug=slug, stat=stat)

    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"      ⚠️  HTTP {resp.status_code} — {url}")
        return []
    except requests.RequestException as e:
        print(f"      ⚠️  Request failed: {e}")
        return []

    if debug:
        debug_path = Path(__file__).parent / f"debug_{slug}_{stat}.html"
        debug_path.write_text(resp.text, encoding="utf-8", errors="replace")
        print(f"      🔍 Debug HTML saved to {debug_path.name} ({len(resp.text)} chars)")

    soup = BeautifulSoup(resp.text, "html.parser")

    # Table class is "statistics" among others — BS4 matches if "statistics" is in the list
    table = soup.find("table", class_="statistics")
    if not table:
        print(f"      ⚠️  No table found at {url}")
        if not debug:
            print(f"      💡 Re-run with --debug to save the raw HTML for inspection")
        return []

    # Find TD column index from header so we can grab TDs alongside yards/sacks
    td_col_idx = None
    for header_row in table.find_all("tr"):
        ths = header_row.find_all("th")
        for i, th in enumerate(ths):
            if th.get_text(strip=True) == "TD":
                td_col_idx = i
                break
        if td_col_idx is not None:
            break

    leaders = []
    for row in table.find_all("tr"):
        # Data rows have class "row0", "row1", etc.
        row_classes = row.get("class", [])
        if not any(c.startswith("row") for c in row_classes):
            continue

        cols = row.find_all("td")
        if len(cols) < 2:
            continue

        # Player name: col[1] has two spans — grab the full name from "d-none d-xl-inline"
        name_cell = cols[1]
        full_span = name_cell.find("span", class_="d-none")
        if full_span:
            link = full_span.find("a")
            name = link.get_text(strip=True) if link else full_span.get_text(strip=True)
        else:
            link = name_cell.find("a")
            name = link.get_text(strip=True) if link else name_cell.get_text(strip=True)

        # Primary stat value is always in the td with class "hilite"
        hilite = row.find("td", class_="hilite")
        if not hilite:
            continue
        value_text = hilite.get_text(strip=True).replace(",", "").replace("*", "")
        try:
            value = float(value_text) if "." in value_text else int(value_text)
        except ValueError:
            continue

        # TD column (not present on sacks pages)
        tds = None
        if td_col_idx is not None and len(cols) > td_col_idx:
            td_text = cols[td_col_idx].get_text(strip=True).replace(",", "")
            try:
                tds = int(td_text)
            except ValueError:
                pass

        entry = (name, value, tds) if tds is not None else (name, value)
        leaders.append(entry)
        if len(leaders) >= top_n:
            break

    return leaders


def scrape_all(teams: dict, top_n: int = 7, delay: float = 1.5, debug: bool = False) -> dict:
    """Scrape all teams across all stat categories."""
    results = {}
    total = len(teams) * len(STAT_CATEGORIES)
    done = 0

    for team_name, slug in teams.items():
        print(f"\n📋 {team_name}")
        results[team_name] = {}

        for key, stat in STAT_CATEGORIES.items():
            leaders = fetch_leaders(slug, stat, top_n, debug=debug)
            results[team_name][key] = leaders
            status = f"✅ {len(leaders)} found" if leaders else "❌ 0 found"
            done += 1
            print(f"   {key:<15} {status}   [{done}/{total}]")
            time.sleep(delay)

    return results


# ─── OUTPUT ──────────────────────────────────────────────────────────────────

def format_output(results: dict) -> str:
    """Format scraped results as a Python file ready to review and merge."""
    lines = [
        '"""',
        "Franchise All-Time Leaders — scraped from footballdb.com",
        "Review this output carefully, then merge the leaders lists",
        "into the FRANCHISES dict in generators/nfl_data.py.",
        '"""',
        "",
        "FRANCHISE_LEADERS = {",
    ]

    for team_name, categories in results.items():
        lines.append(f'    "{team_name}": {{')
        for key, leaders in categories.items():
            if leaders:
                parts = []
                for entry in leaders:
                    if len(entry) == 3:
                        name, yards, tds = entry
                        parts.append(f'("{name}", {yards}, {tds})')
                    else:
                        name, val = entry
                        parts.append(f'("{name}", {val})')
                lines.append(f'        "{key}": [{", ".join(parts)}],')
            else:
                lines.append(f'        "{key}": [],  # scrape failed — fill manually')
        lines.append("    },")

    lines.append("}")
    return "\n".join(lines)


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape franchise all-time leaders from footballdb.com")
    parser.add_argument(
        "--team", type=str, default=None,
        help="Single team slug to test before full run (e.g. 'green-bay-packers')"
    )
    parser.add_argument(
        "--top", type=int, default=7,
        help="Leaders to fetch per category (default: 7)"
    )
    parser.add_argument(
        "--delay", type=float, default=1.5,
        help="Seconds between requests (default: 1.5, increase if getting blocked)"
    )
    parser.add_argument(
        "--output", type=str, default="franchise_leaders_output.py",
        help="Output filename (default: franchise_leaders_output.py)"
    )
    parser.add_argument(
        "--debug", action="store_true",
        help="Save raw HTML for each page to debug_*.html so you can inspect the structure"
    )
    args = parser.parse_args()

    if args.team:
        # Single-team test mode — good for verifying the scraper works before full run
        team_name = next((k for k, v in TEAMS.items() if v == args.team), args.team)
        teams_to_scrape = {team_name: args.team}
    else:
        teams_to_scrape = TEAMS

    print("=" * 60)
    print("🏈 Franchise Leaders Scraper")
    print(f"   Teams  : {len(teams_to_scrape)}")
    print(f"   Stats  : {', '.join(STAT_CATEGORIES.keys())}")
    print(f"   Top N  : {args.top}")
    print(f"   Delay  : {args.delay}s between requests")
    print(f"   Output : {args.output}")
    print("=" * 60)

    results = scrape_all(teams_to_scrape, top_n=args.top, delay=args.delay, debug=args.debug)

    output_text = format_output(results)
    out_path = Path(__file__).parent / args.output
    out_path.write_text(output_text, encoding="utf-8")

    # Summary
    successes = sum(
        1 for cats in results.values()
        for leaders in cats.values()
        if leaders
    )
    total_cells = len(results) * len(STAT_CATEGORIES)
    print(f"\n✅  Wrote {out_path}")
    print(f"   {successes}/{total_cells} stat categories scraped successfully")
    if successes < total_cells:
        print("   ⚠️  Some categories returned 0 results — review output and fill manually.")
    print("\n   Next: review franchise_leaders_output.py, then merge into nfl_data.py FRANCHISES.")


if __name__ == "__main__":
    main()
