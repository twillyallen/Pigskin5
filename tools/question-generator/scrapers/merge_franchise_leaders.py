#!/usr/bin/env python3
"""
Merge Franchise Leaders
=======================
Reads franchise_leaders_output.py and patches the leaders lists into
the FRANCHISES dict in generators/nfl_data.py.

For each team it:
  - Adds pass_leaders, rush_leaders, rec_leaders, sack_leaders lists
  - Updates all_time_pass_leader / rush / rec / sacks_leader to match #1

Usage:
    python merge_franchise_leaders.py
    python merge_franchise_leaders.py --dry-run   # preview without writing
"""

import argparse
import importlib.util
import sys
from pathlib import Path


# ─── PATHS ───────────────────────────────────────────────────────────────────

SCRAPERS_DIR  = Path(__file__).parent
GENERATOR_DIR = SCRAPERS_DIR.parent / "generators"
LEADERS_FILE  = SCRAPERS_DIR / "franchise_leaders_output.py"
NFL_DATA_FILE = GENERATOR_DIR / "nfl_data.py"


# ─── LOADER ──────────────────────────────────────────────────────────────────

def load_module(path: Path, module_name: str):
    """Import a .py file as a module by path."""
    spec = importlib.util.spec_from_file_location(module_name, path)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ─── MERGE ───────────────────────────────────────────────────────────────────

def merge(franchises: dict, leaders: dict) -> dict:
    """
    Merge scraped leaders into the existing FRANCHISES dict.
    Returns the updated dict.
    """
    missing = []
    for team, data in leaders.items():
        if team not in franchises:
            missing.append(team)
            continue

        entry = franchises[team]

        # Add the full top-7 lists
        for key in ("pass_leaders", "rush_leaders", "rec_leaders", "sack_leaders"):
            if data.get(key):
                entry[key] = data[key]

        # Update the single all_time_*_leader strings from the #1 in each list
        if data.get("pass_leaders"):
            entry["all_time_pass_leader"] = data["pass_leaders"][0][0]
        if data.get("rush_leaders"):
            entry["all_time_rush_leader"] = data["rush_leaders"][0][0]
        if data.get("rec_leaders"):
            entry["all_time_rec_leader"] = data["rec_leaders"][0][0]
        if data.get("sack_leaders"):
            entry["all_time_sacks_leader"] = data["sack_leaders"][0][0]

    if missing:
        print(f"   ⚠️  Teams in leaders file not found in FRANCHISES: {missing}")

    return franchises


# ─── FORMATTER ───────────────────────────────────────────────────────────────

def _fmt_value(v) -> str:
    """Format a single Python value as source code."""
    if isinstance(v, str):
        escaped = v.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    if isinstance(v, bool):
        return "True" if v else "False"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        if not v:
            return "[]"
        # Tuples inside lists (leader entries)
        if isinstance(v[0], tuple):
            items = []
            for t in v:
                inner = ", ".join(_fmt_value(x) for x in t)
                items.append(f"({inner})")
            return f"[{', '.join(items)}]"
        # Plain list of strings/ints
        items = [_fmt_value(x) for x in v]
        return f"[{', '.join(items)}]"
    if isinstance(v, tuple):
        inner = ", ".join(_fmt_value(x) for x in v)
        return f"({inner})"
    return repr(v)


def format_franchises(franchises: dict) -> str:
    """Render the updated FRANCHISES dict as clean Python source."""
    lines = ["FRANCHISES = {"]
    for team, entry in franchises.items():
        lines.append(f'    "{team}": {{')
        for k, v in entry.items():
            lines.append(f'        "{k}": {_fmt_value(v)},')
        lines.append("    },")
    lines.append("}")
    return "\n".join(lines)


# ─── PATCHER ─────────────────────────────────────────────────────────────────

def patch_nfl_data(new_franchises_block: str, dry_run: bool = False) -> None:
    """
    Replace the FRANCHISES = { ... } block in nfl_data.py with the new one.
    Preserves everything before and after that block.
    """
    source = NFL_DATA_FILE.read_text(encoding="utf-8")

    start_marker = "FRANCHISES = {"
    start_idx = source.find(start_marker)
    if start_idx == -1:
        print("❌ Could not find 'FRANCHISES = {' in nfl_data.py")
        sys.exit(1)

    # Walk forward to find the matching closing brace at the top level
    depth   = 0
    end_idx = start_idx
    for i, ch in enumerate(source[start_idx:], start=start_idx):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end_idx = i + 1  # include the closing brace
                break

    before = source[:start_idx]
    after  = source[end_idx:]

    patched = before + new_franchises_block + after

    if dry_run:
        print("─── DRY RUN: new FRANCHISES block (first 60 lines) ───")
        for line in new_franchises_block.splitlines()[:60]:
            print(line)
        print("...")
        return

    NFL_DATA_FILE.write_text(patched, encoding="utf-8")
    print(f"   ✅ Patched {NFL_DATA_FILE}")


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Merge franchise leaders into nfl_data.py")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview the merge without writing to nfl_data.py")
    args = parser.parse_args()

    print("=" * 60)
    print("🏈 Merge Franchise Leaders")
    print(f"   Leaders : {LEADERS_FILE.name}")
    print(f"   Target  : {NFL_DATA_FILE.name}")
    print("=" * 60)

    # Load both files
    print("\n📂 Loading files...")
    leaders_mod   = load_module(LEADERS_FILE, "franchise_leaders_output")
    nfl_data_mod  = load_module(NFL_DATA_FILE, "nfl_data")

    leaders    = leaders_mod.FRANCHISE_LEADERS
    franchises = nfl_data_mod.FRANCHISES

    print(f"   {len(leaders)} teams in leaders file")
    print(f"   {len(franchises)} teams in FRANCHISES")

    # Merge
    print("\n🔀 Merging...")
    updated = merge(dict(franchises), leaders)

    # Format
    new_block = format_franchises(updated)

    # Stats
    teams_with_leaders = sum(1 for v in updated.values() if "pass_leaders" in v)
    print(f"   {teams_with_leaders}/{len(updated)} teams now have leaders lists")

    # Patch
    if args.dry_run:
        print("\n🔍 Dry run — no files written.\n")
    else:
        print(f"\n📝 Patching {NFL_DATA_FILE.name}...")

    patch_nfl_data(new_block, dry_run=args.dry_run)

    if not args.dry_run:
        print("\n   Done. Review nfl_data.py FRANCHISES, then run generate_questions.py.")


if __name__ == "__main__":
    main()
