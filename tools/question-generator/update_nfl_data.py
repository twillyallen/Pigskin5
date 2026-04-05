#!/usr/bin/env python3
"""
Pigskin5 nflverse Data Pipeline v1.0
=====================================
Pulls real NFL stats from nflverse via nflreadpy and rebuilds nfl_data.py
with accurate, up-to-date numbers.

What it updates:
  - QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS (career stats)
  - SEASON_LEADERS (per-season stat leaders + award stubs)
  - Leaves historical/curated data intact (SUPER_BOWLS, ICONIC_MOMENTS, etc.)

Usage:
    pip install nflreadpy pandas
    python update_nfl_data.py                    # default: 1999-current
    python update_nfl_data.py --seasons 2020-2025
    python update_nfl_data.py --dry-run          # preview without writing

Output:
    nfl_data_GENERATED.py  (drop-in replacement for generators/nfl_data.py)
    You review it, then copy it into your generators/ folder.

Data source: nflverse (CC-BY-SA 4.0)
"""

import argparse
import sys
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

try:
    import nflreadpy as nfl
    import pandas as pd
except ImportError:
    print("❌ Missing dependencies. Run:")
    print("   pip install nflreadpy pandas")
    sys.exit(1)


# ─── CONFIG ──────────────────────────────────────────────────────────────────

# Minimum career thresholds to be included in Pigskin5 data
MIN_CAREER = {
    "QB": {"pass_yards": 10000},
    "RB": {"rush_yards": 2000},
    "WR": {"rec_yards": 3000},
    "TE": {"rec_yards": 2000},
}

# Era classification
def classify_era(seasons_played: list[int]) -> str:
    """Classify a player's era based on seasons they played."""
    if not seasons_played:
        return "modern"
    latest = max(seasons_played)
    earliest = min(seasons_played)
    if latest >= 2016:
        return "current"
    elif earliest >= 2000:
        return "modern"
    else:
        return "classic"


# ─── DATA FETCHERS ───────────────────────────────────────────────────────────

def fetch_player_stats(seasons: list[int]) -> pd.DataFrame:
    """
    Fetch season-level player stats from nflverse.
    Returns a DataFrame with one row per player-season.
    """
    print(f"📡 Fetching player stats for {min(seasons)}-{max(seasons)}...")
    
    # Load season-aggregated stats (reg season only)
    try:
        stats = nfl.load_player_stats(seasons, summary_level="reg")
        df = stats.to_pandas() if hasattr(stats, 'to_pandas') else stats
    except Exception as e:
        print(f"   ⚠️  load_player_stats failed: {e}")
        print(f"   Trying weekly stats and aggregating manually...")
        stats = nfl.load_player_stats(seasons, summary_level="week")
        df = stats.to_pandas() if hasattr(stats, 'to_pandas') else stats
        # Filter to regular season and aggregate
        df = df[df['season_type'] == 'REG']
        df = aggregate_weekly_to_season(df)
    
    print(f"   ✅ Got {len(df)} player-season rows")
    return df


def aggregate_weekly_to_season(weekly_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate weekly stats to season level if needed."""
    numeric_cols = [
        'completions', 'attempts', 'passing_yards', 'passing_tds', 'interceptions',
        'sacks', 'sack_yards',
        'carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles',
        'receptions', 'targets', 'receiving_yards', 'receiving_tds',
        'receiving_fumbles', 'passing_2pt_conversions',
        'rushing_2pt_conversions', 'receiving_2pt_conversions',
    ]
    
    # Only include columns that exist
    agg_cols = {c: 'sum' for c in numeric_cols if c in weekly_df.columns}
    
    # Group by player + season
    group_cols = ['player_id', 'player_name', 'player_display_name', 'position', 
                  'position_group', 'season']
    group_cols = [c for c in group_cols if c in weekly_df.columns]
    
    # Add recent_team as last team
    if 'recent_team' in weekly_df.columns:
        agg_cols['recent_team'] = 'last'
    
    result = weekly_df.groupby(group_cols, as_index=False).agg(agg_cols)
    return result


def fetch_rosters(seasons: list[int]) -> pd.DataFrame:
    """Fetch roster data to get team history for players."""
    print(f"📡 Fetching roster data...")
    try:
        rosters = nfl.load_rosters(seasons)
        df = rosters.to_pandas() if hasattr(rosters, 'to_pandas') else rosters
        print(f"   ✅ Got {len(df)} roster entries")
        return df
    except Exception as e:
        print(f"   ⚠️  Roster fetch failed: {e}")
        return pd.DataFrame()


def fetch_draft_picks() -> pd.DataFrame:
    """Fetch historical draft pick data."""
    print(f"📡 Fetching draft picks...")
    try:
        picks = nfl.load_draft_picks()
        df = picks.to_pandas() if hasattr(picks, 'to_pandas') else picks
        print(f"   ✅ Got {len(df)} draft picks")
        return df
    except Exception as e:
        print(f"   ⚠️  Draft picks fetch failed: {e}")
        return pd.DataFrame()


# ─── CAREER STAT BUILDERS ───────────────────────────────────────────────────
def _first_existing_col(df: pd.DataFrame, candidates: list[str], label: str) -> str:
    """Return the first matching column from candidates or raise a helpful error."""
    for col in candidates:
        if col in df.columns:
            return col
    raise KeyError(
        f"Could not find a column for {label}. "
        f"Available columns include: {list(df.columns)[:50]}"
    )
def build_career_qbs(stats_df: pd.DataFrame, rosters_df: pd.DataFrame) -> list[tuple]:
    """Build QUARTERBACKS list from nflverse data."""
    print("🏈 Building QB career stats...")

    # Filter to QB stats
    qb_mask = stats_df['position'].isin(['QB']) | stats_df['position_group'].isin(['QB'])
    qb_df = stats_df[qb_mask].copy()

    # Debug print so we can see the actual schema if needed
    print("QB columns:", sorted(qb_df.columns.tolist()))

    # nflverse schemas can vary a bit, so detect the INT column name
    int_col = _first_existing_col(
        qb_df,
        ['interceptions', 'passing_interceptions', 'pass_interceptions', 'ints'],
        'QB interceptions'
    )

    # Aggregate across all seasons for career totals
    career = qb_df.groupby(['player_id', 'player_display_name']).agg({
        'passing_yards': 'sum',
        'passing_tds': 'sum',
        int_col: 'sum',
        'completions': 'sum',
        'attempts': 'sum',
        'rushing_yards': 'sum',
        'rushing_tds': 'sum',
        'season': lambda x: sorted(x.unique().tolist()),
    }).reset_index()

    # Normalize the detected INT column name
    if int_col != 'interceptions':
        career = career.rename(columns={int_col: 'interceptions'})

    # Get team history from rosters or stats
    team_history = _get_team_history(qb_df, rosters_df)

    # Calculate passer rating
    career['passer_rating'] = career.apply(
        lambda r: _passer_rating(
            r['completions'],
            r['attempts'],
            r['passing_yards'],
            r['passing_tds'],
            r['interceptions'],
        ),
        axis=1
    )

    # Filter by minimum career yards
    career = career[career['passing_yards'] >= MIN_CAREER['QB']['pass_yards']]

    result = []
    for _, row in career.iterrows():
        pid = row['player_id']
        name = row['player_display_name']
        seasons = row['season']
        era = classify_era(seasons)
        teams = team_history.get(pid, [])

        stat_dict = {
            "pass_yards": int(row['passing_yards']),
            "pass_tds": int(row['passing_tds']),
            "ints": int(row['interceptions']),
            "passer_rating": round(row['passer_rating'], 1),
        }

        # Add rushing stats if significant
        if row['rushing_yards'] > 500:
            stat_dict["rush_yards"] = int(row['rushing_yards'])
        if row['rushing_tds'] > 10:
            stat_dict["rush_tds"] = int(row['rushing_tds'])

        result.append((name, "QB", stat_dict, era, teams))

    # Sort by career passing yards descending
    result.sort(key=lambda x: x[2].get('pass_yards', 0), reverse=True)

    print(f"   ✅ {len(result)} QBs built")
    return result


def build_career_rbs(stats_df: pd.DataFrame, rosters_df: pd.DataFrame) -> list[tuple]:
    """Build RUNNING_BACKS list from nflverse data."""
    print("🏈 Building RB career stats...")
    
    rb_mask = stats_df['position'].isin(['RB', 'FB']) | stats_df['position_group'].isin(['RB'])
    rb_df = stats_df[rb_mask].copy()
    
    career = rb_df.groupby(['player_id', 'player_display_name']).agg({
        'rushing_yards': 'sum',
        'rushing_tds': 'sum',
        'carries': 'sum',
        'receiving_yards': 'sum',
        'receiving_tds': 'sum',
        'receptions': 'sum',
        'season': lambda x: sorted(x.unique().tolist()),
    }).reset_index()
    
    # Calculate YPC
    career['ypc'] = (career['rushing_yards'] / career['carries'].replace(0, 1)).round(1)
    
    # Total TDs and yards from scrimmage
    career['total_tds'] = career['rushing_tds'] + career['receiving_tds']
    career['yards_from_scrimmage'] = career['rushing_yards'] + career['receiving_yards']
    
    # Filter
    career = career[career['rushing_yards'] >= MIN_CAREER['RB']['rush_yards']]
    
    team_history = _get_team_history(rb_df, rosters_df)
    
    result = []
    for _, row in career.iterrows():
        pid = row['player_id']
        name = row['player_display_name']
        seasons = row['season']
        era = classify_era(seasons)
        teams = team_history.get(pid, [])
        
        stat_dict = {
            "rush_yards": int(row['rushing_yards']),
            "rush_tds": int(row['rushing_tds']),
            "ypc": float(row['ypc']),
        }
        
        if row['receiving_yards'] > 500:
            stat_dict["rec_yards"] = int(row['receiving_yards'])
        if row['total_tds'] > 20:
            stat_dict["total_tds"] = int(row['total_tds'])
        if row['yards_from_scrimmage'] > 5000:
            stat_dict["yards_from_scrimmage"] = int(row['yards_from_scrimmage'])
        
        result.append((name, "RB", stat_dict, era, teams))
    
    result.sort(key=lambda x: x[2].get('rush_yards', 0), reverse=True)
    
    print(f"   ✅ {len(result)} RBs built")
    return result


def build_career_wrs(stats_df: pd.DataFrame, rosters_df: pd.DataFrame) -> list[tuple]:
    """Build WIDE_RECEIVERS list from nflverse data."""
    print("🏈 Building WR career stats...")
    
    wr_mask = stats_df['position'].isin(['WR']) | stats_df['position_group'].isin(['WR'])
    wr_df = stats_df[wr_mask].copy()
    
    career = wr_df.groupby(['player_id', 'player_display_name']).agg({
        'receiving_yards': 'sum',
        'receiving_tds': 'sum',
        'receptions': 'sum',
        'season': lambda x: sorted(x.unique().tolist()),
    }).reset_index()
    
    career = career[career['receiving_yards'] >= MIN_CAREER['WR']['rec_yards']]
    
    team_history = _get_team_history(wr_df, rosters_df)
    
    result = []
    for _, row in career.iterrows():
        pid = row['player_id']
        name = row['player_display_name']
        seasons = row['season']
        era = classify_era(seasons)
        teams = team_history.get(pid, [])
        
        stat_dict = {
            "rec_yards": int(row['receiving_yards']),
            "rec_tds": int(row['receiving_tds']),
            "receptions": int(row['receptions']),
        }
        
        result.append((name, "WR", stat_dict, era, teams))
    
    result.sort(key=lambda x: x[2].get('rec_yards', 0), reverse=True)
    
    print(f"   ✅ {len(result)} WRs built")
    return result


def build_career_tes(stats_df: pd.DataFrame, rosters_df: pd.DataFrame) -> list[tuple]:
    """Build TIGHT_ENDS list from nflverse data."""
    print("🏈 Building TE career stats...")
    
    te_mask = stats_df['position'].isin(['TE']) | stats_df['position_group'].isin(['TE'])
    te_df = stats_df[te_mask].copy()
    
    career = te_df.groupby(['player_id', 'player_display_name']).agg({
        'receiving_yards': 'sum',
        'receiving_tds': 'sum',
        'receptions': 'sum',
        'season': lambda x: sorted(x.unique().tolist()),
    }).reset_index()
    
    career = career[career['receiving_yards'] >= MIN_CAREER['TE']['rec_yards']]
    
    team_history = _get_team_history(te_df, rosters_df)
    
    result = []
    for _, row in career.iterrows():
        pid = row['player_id']
        name = row['player_display_name']
        seasons = row['season']
        era = classify_era(seasons)
        teams = team_history.get(pid, [])
        
        stat_dict = {
            "rec_yards": int(row['receiving_yards']),
            "rec_tds": int(row['receiving_tds']),
            "receptions": int(row['receptions']),
        }
        
        result.append((name, "TE", stat_dict, era, teams))
    
    result.sort(key=lambda x: x[2].get('rec_yards', 0), reverse=True)
    
    print(f"   ✅ {len(result)} TEs built")
    return result


def build_season_leaders(stats_df: pd.DataFrame) -> dict:
    """
    Build SEASON_LEADERS dict from nflverse data.
    Returns {year: {stat_key: (player_name, value), ...}}
    """
    print("📊 Building season leaders...")
    
    leaders = {}
    
    for season in sorted(stats_df['season'].unique()):
        season_data = stats_df[stats_df['season'] == season]
        year_leaders = {}
        
        # Passing yards leader
        leader = _get_leader(season_data, 'passing_yards', min_val=1000, position_filter=['QB'])
        if leader:
            year_leaders['passing_yards'] = leader
        
        # Passing TDs leader
        leader = _get_leader(season_data, 'passing_tds', min_val=10, position_filter=['QB'])
        if leader:
            year_leaders['passing_tds'] = leader
        
        # Rushing yards leader
        leader = _get_leader(season_data, 'rushing_yards', min_val=500)
        if leader:
            year_leaders['rushing_yards'] = leader
        
        # Rushing TDs leader
        leader = _get_leader(season_data, 'rushing_tds', min_val=5)
        if leader:
            year_leaders['rushing_tds'] = leader
        
        # Receiving yards leader
        leader = _get_leader(season_data, 'receiving_yards', min_val=500)
        if leader:
            year_leaders['receiving_yards'] = leader
        
        # Receptions leader
        leader = _get_leader(season_data, 'receptions', min_val=50)
        if leader:
            year_leaders['receptions'] = leader
        
        if year_leaders:
            leaders[int(season)] = year_leaders
    
    print(f"   ✅ {len(leaders)} seasons of leaders built")
    return leaders


# ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

def _get_team_history(stats_df: pd.DataFrame, rosters_df: pd.DataFrame) -> dict:
    """
    Build {player_id: [team1, team2, ...]} from stats or rosters.
    Teams in chronological order, no duplicates.
    """
    team_map = defaultdict(list)
    
    # Try rosters first (more complete)
    if not rosters_df.empty and 'gsis_id' in rosters_df.columns and 'team' in rosters_df.columns:
        for _, row in rosters_df.iterrows():
            pid = row.get('gsis_id', '')
            team = row.get('team', '')
            if pid and team and team not in team_map[pid]:
                team_map[pid].append(team)
    
    # Fall back to stats data
    if not team_map and 'recent_team' in stats_df.columns:
        grouped = stats_df.sort_values('season').groupby('player_id')
        for pid, group in grouped:
            teams = group['recent_team'].unique().tolist()
            team_map[pid] = [t for t in teams if pd.notna(t)]
    
    # Convert team abbreviations to names
    abbrev_to_name = _team_abbrev_map()
    result = {}
    for pid, teams in team_map.items():
        result[pid] = [abbrev_to_name.get(t, t) for t in teams]
    
    return result


def _team_abbrev_map() -> dict:
    """Map nflverse team abbreviations to Pigskin5 short names."""
    return {
        "ARI": "Cardinals", "ATL": "Falcons", "BAL": "Ravens", "BUF": "Bills",
        "CAR": "Panthers", "CHI": "Bears", "CIN": "Bengals", "CLE": "Browns",
        "DAL": "Cowboys", "DEN": "Broncos", "DET": "Lions", "GB": "Packers",
        "HOU": "Texans", "IND": "Colts", "JAX": "Jaguars", "KC": "Chiefs",
        "LA": "Rams", "LAC": "Chargers", "LAR": "Rams", "LV": "Raiders",
        "MIA": "Dolphins", "MIN": "Vikings", "NE": "Patriots", "NO": "Saints",
        "NYG": "Giants", "NYJ": "Jets", "OAK": "Raiders", "PHI": "Eagles",
        "PIT": "Steelers", "SEA": "Seahawks", "SF": "49ers", "TB": "Buccaneers",
        "TEN": "Titans", "WAS": "Commanders", "SD": "Chargers", "STL": "Rams",
    }


def _passer_rating(comp, att, yds, tds, ints) -> float:
    """Calculate NFL passer rating."""
    if att == 0:
        return 0.0
    
    a = max(0, min(2.375, ((comp / att) - 0.3) * 5))
    b = max(0, min(2.375, ((yds / att) - 3) * 0.25))
    c = max(0, min(2.375, (tds / att) * 20))
    d = max(0, min(2.375, 2.375 - ((ints / att) * 25)))
    
    return round(((a + b + c + d) / 6) * 100, 1)


def _get_leader(season_data: pd.DataFrame, stat_col: str, 
                min_val: int = 0, position_filter: list = None) -> tuple | None:
    """Get the season leader for a stat column."""
    if stat_col not in season_data.columns:
        return None
    
    df = season_data.copy()
    if position_filter:
        df = df[df['position'].isin(position_filter) | df['position_group'].isin(position_filter)]
    
    df = df[df[stat_col] >= min_val]
    
    if df.empty:
        return None
    
    idx = df[stat_col].idxmax()
    leader = df.loc[idx]
    
    name = leader.get('player_display_name', leader.get('player_name', 'Unknown'))
    value = int(leader[stat_col])
    
    return (name, value)


# ─── PRE-NFLVERSE LEGENDS ───────────────────────────────────────────────────
# nflverse only has data from 1999+. These legends played before that.
# We keep them as static entries merged into the output.

PRE_NFLVERSE_QBS = [
    ("Dan Marino", "QB", {"pass_yards": 61361, "pass_tds": 420, "ints": 252, "passer_rating": 86.4, "super_bowls_won": 0, "mvps": 1}, "classic", ["Dolphins"]),
    ("Joe Montana", "QB", {"pass_yards": 40551, "pass_tds": 273, "ints": 139, "passer_rating": 92.3, "super_bowls_won": 4, "mvps": 2}, "classic", ["49ers", "Chiefs"]),
    ("John Elway", "QB", {"pass_yards": 51475, "pass_tds": 300, "ints": 226, "passer_rating": 79.9, "super_bowls_won": 2, "mvps": 1}, "classic", ["Broncos"]),
    ("Terry Bradshaw", "QB", {"pass_yards": 27989, "pass_tds": 212, "ints": 210, "passer_rating": 70.9, "super_bowls_won": 4}, "classic", ["Steelers"]),
    ("Troy Aikman", "QB", {"pass_yards": 32942, "pass_tds": 165, "ints": 141, "passer_rating": 81.6, "super_bowls_won": 3}, "classic", ["Cowboys"]),
    ("Steve Young", "QB", {"pass_yards": 33124, "pass_tds": 232, "ints": 107, "passer_rating": 96.8, "super_bowls_won": 1, "mvps": 2}, "classic", ["Buccaneers", "49ers"]),
]

PRE_NFLVERSE_RBS = [
    ("Emmitt Smith", "RB", {"rush_yards": 18355, "rush_tds": 164, "ypc": 4.2, "rec_yards": 3224, "total_tds": 175}, "classic", ["Cowboys", "Cardinals"]),
    ("Walter Payton", "RB", {"rush_yards": 16726, "rush_tds": 110, "ypc": 4.4, "rec_yards": 4538, "total_tds": 125}, "classic", ["Bears"]),
    ("Barry Sanders", "RB", {"rush_yards": 15269, "rush_tds": 99, "ypc": 5.0, "rec_yards": 2921, "total_tds": 109}, "classic", ["Lions"]),
    ("Jim Brown", "RB", {"rush_yards": 12312, "rush_tds": 106, "ypc": 5.2, "mvps": 3}, "classic", ["Browns"]),
    ("Eric Dickerson", "RB", {"rush_yards": 13259, "rush_tds": 90, "ypc": 4.4, "single_season_rush_yards": 2105}, "classic", ["Rams", "Colts", "Raiders", "Falcons"]),
]

PRE_NFLVERSE_WRS = [
    ("Jerry Rice", "WR", {"rec_yards": 22895, "rec_tds": 197, "receptions": 1549, "total_tds": 208}, "classic", ["49ers", "Raiders", "Seahawks"]),
    ("Don Hutson", "WR", {"rec_yards": 7991, "rec_tds": 99, "receptions": 488}, "classic", ["Packers"]),
    ("Cris Collinsworth", "WR", {"rec_yards": 6698, "rec_tds": 36, "receptions": 417}, "classic", ["Bengals"]),
]

PRE_NFLVERSE_TES = [
    ("Shannon Sharpe", "TE", {"rec_yards": 10060, "rec_tds": 62, "receptions": 815}, "classic", ["Broncos", "Ravens"]),
]


# ─── SUPER BOWL / AWARDS / CURATED DATA ─────────────────────────────────────
# These don't come from nflverse stats. Kept as-is from nfl_data.py.
# The pipeline only touches the player stat arrays and season leaders.

STATIC_SECTIONS = '''

# ═══════════════════════════════════════════════════════════════
# FRANCHISE DATA
# ═══════════════════════════════════════════════════════════════
# NOTE: Franchise data is curated and not auto-updated.
# Copy FRANCHISES from your existing nfl_data.py here, or
# the pipeline will include it from the template.
# ═══════════════════════════════════════════════════════════════
'''


# ─── OUTPUT GENERATION ───────────────────────────────────────────────────────

def format_player_list(players: list[tuple], var_name: str) -> str:
    """Format a list of player tuples as Python source code."""
    lines = [f"{var_name} = ["]
    
    for p in players:
        name, pos, stats, era, teams = p
        stats_str = json.dumps(stats, ensure_ascii=False)
        # Make it look like the original format
        stats_str = stats_str.replace('"', '"')  # keep double quotes
        teams_str = json.dumps(teams)
        lines.append(f'    ("{name}", "{pos}", {stats_str}, "{era}", {teams_str}),')
    
    lines.append("]")
    return "\n".join(lines)


def format_season_leaders(leaders: dict) -> str:
    """Format SEASON_LEADERS dict as Python source code."""
    lines = ["SEASON_LEADERS = {"]
    
    for year in sorted(leaders.keys(), reverse=True):
        data = leaders[year]
        lines.append(f"    {year}: {{")
        for key, value in data.items():
            if isinstance(value, tuple):
                name, val = value
                if isinstance(val, float):
                    lines.append(f'        "{key}": ("{name}", {val}),')
                else:
                    lines.append(f'        "{key}": ("{name}", {val}),')
            else:
                lines.append(f'        "{key}": "{value}",')
        lines.append("    },")
    
    lines.append("}")
    return "\n".join(lines)


def merge_with_legends(nflverse_players: list[tuple], legends: list[tuple]) -> list[tuple]:
    """
    Merge nflverse-derived players with pre-1999 legends.
    If a player appears in both (e.g., Brett Favre), prefer the nflverse data
    but merge in any extra fields from the legend entry (like super_bowls_won, mvps).
    """
    nflverse_names = {p[0] for p in nflverse_players}
    
    merged = list(nflverse_players)
    
    for legend in legends:
        if legend[0] not in nflverse_names:
            merged.append(legend)
        else:
            # Find the nflverse entry and merge in award data
            for i, p in enumerate(merged):
                if p[0] == legend[0]:
                    # Merge stats: keep nflverse numbers but add awards
                    combined_stats = dict(p[2])
                    for k, v in legend[2].items():
                        if k not in combined_stats:
                            combined_stats[k] = v
                    merged[i] = (p[0], p[1], combined_stats, p[3], p[4])
                    break
    
    # Re-sort by primary stat
    if merged and 'pass_yards' in merged[0][2]:
        merged.sort(key=lambda x: x[2].get('pass_yards', 0), reverse=True)
    elif merged and 'rush_yards' in merged[0][2]:
        merged.sort(key=lambda x: x[2].get('rush_yards', 0), reverse=True)
    elif merged and 'rec_yards' in merged[0][2]:
        merged.sort(key=lambda x: x[2].get('rec_yards', 0), reverse=True)
    
    return merged


def generate_output(qbs, rbs, wrs, tes, season_leaders, 
                     existing_file: Path = None) -> str:
    """Generate the full nfl_data.py output file."""
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    
    output = f'''"""
NFL Data Module — The Knowledge Backbone
==========================================
Structured data for question generation. Organized by category.

AUTO-GENERATED by Pigskin5 nflverse Pipeline
Generated: {now}
Data source: nflverse (CC-BY-SA 4.0, attribution to nflverse/FTN Data)

Sections updated automatically:
  - QUARTERBACKS, RUNNING_BACKS, WIDE_RECEIVERS, TIGHT_ENDS
  - SEASON_LEADERS

Sections preserved from existing nfl_data.py (curated/manual):
  - FRANCHISES, SUPER_BOWLS, ICONIC_MOMENTS, COACHES
  - DRAFT_NOTABLES, RECORDS, MVP_WINNERS, NFL_FACTS
  - REAL_UNUSUAL_PLAYERS, FAKE_NAME_PARTS
"""

# ═══════════════════════════════════════════════════════════════
# PLAYER CAREER STATS (auto-generated from nflverse)
# ═══════════════════════════════════════════════════════════════
# Format: (name, position, {{stat_dict}}, era, [teams])
# era: "classic" (pre-2000), "modern" (2000-2015), "current" (2016+)
# nflverse data starts 1999; pre-1999 legends are static entries.

{format_player_list(qbs, "QUARTERBACKS")}

{format_player_list(rbs, "RUNNING_BACKS")}

{format_player_list(wrs, "WIDE_RECEIVERS")}

{format_player_list(tes, "TIGHT_ENDS")}


# ═══════════════════════════════════════════════════════════════
# SEASON-SPECIFIC DATA (auto-generated from nflverse)
# ═══════════════════════════════════════════════════════════════
# Awards (mvp, opoy, dpoy, etc.) must still be added manually
# after each season since nflverse doesn't track them.

{format_season_leaders(season_leaders)}

'''
    
    # Now append the static/curated sections from existing nfl_data.py
    if existing_file and existing_file.exists():
        existing_content = existing_file.read_text()
        
        # Extract everything from FRANCHISES onward
        static_markers = [
            "# ═══════════════════════════════════════════════════════════════\n# FRANCHISE DATA",
            "FRANCHISES = {",
        ]
        
        for marker in static_markers:
            idx = existing_content.find(marker)
            if idx != -1:
                # Go back to find the section comment
                comment_start = existing_content.rfind("\n# ═══", 0, idx)
                if comment_start == -1:
                    comment_start = idx
                output += "\n" + existing_content[comment_start:]
                break
        else:
            output += "\n# ⚠️  Could not find FRANCHISES section in existing nfl_data.py\n"
            output += "# You need to manually paste the following sections:\n"
            output += "#   FRANCHISES, SUPER_BOWLS, NFL_FACTS, REAL_UNUSUAL_PLAYERS,\n"
            output += "#   FAKE_NAME_PARTS, ICONIC_MOMENTS, COACHES, DRAFT_NOTABLES,\n"
            output += "#   RECORDS, MVP_WINNERS, KICKER_MVP\n"
    else:
        output += "\n# ⚠️  No existing nfl_data.py provided.\n"
        output += "# Copy the FRANCHISES, SUPER_BOWLS, etc. sections from your\n"
        output += "# current nfl_data.py and paste them below.\n"
    
    return output


# ─── MANUAL AWARD OVERLAY ───────────────────────────────────────────────────

def apply_award_overlay(qbs: list[tuple], overlay: dict) -> list[tuple]:
    """
    Apply manually-maintained award data (Super Bowls, MVPs) to nflverse stats.
    overlay format: {"Tom Brady": {"super_bowls_won": 7, "mvps": 3}, ...}
    """
    result = []
    for p in qbs:
        name = p[0]
        if name in overlay:
            stats = dict(p[2])
            stats.update(overlay[name])
            result.append((name, p[1], stats, p[3], p[4]))
        else:
            result.append(p)
    return result


# Default award overlay — update this each offseason
QB_AWARDS = {
    "Tom Brady": {"super_bowls_won": 7, "mvps": 3},
    "Peyton Manning": {"super_bowls_won": 2, "mvps": 5},
    "Aaron Rodgers": {"super_bowls_won": 1, "mvps": 4},
    "Brett Favre": {"super_bowls_won": 1, "mvps": 3},
    "Patrick Mahomes": {"super_bowls_won": 3, "mvps": 2},
    "Drew Brees": {"super_bowls_won": 1, "mvps": 0},
    "Ben Roethlisberger": {"super_bowls_won": 2},
    "Eli Manning": {"super_bowls_won": 2},
    "Russell Wilson": {"super_bowls_won": 1},
    "Matt Ryan": {"super_bowls_won": 0, "mvps": 1},
    "Cam Newton": {"super_bowls_won": 0, "mvps": 1},
    "Kurt Warner": {"super_bowls_won": 1, "mvps": 2},
    "Josh Allen": {"super_bowls_won": 0, "mvps": 1},
    "Lamar Jackson": {"super_bowls_won": 0, "mvps": 2},
    "Matthew Stafford": {"super_bowls_won": 1, "mvps": 1},
    "Joe Burrow": {"super_bowls_won": 0},
    "Dak Prescott": {"super_bowls_won": 0},
    "Jared Goff": {"super_bowls_won": 0},
    "Ryan Fitzpatrick": {"super_bowls_won": 0},
    "Jameis Winston": {"super_bowls_won": 0},
    "Philip Rivers": {"super_bowls_won": 0},
    "Matt Stafford": {"super_bowls_won": 1, "mvps": 1},
}


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Pigskin5 nflverse Data Pipeline")
    parser.add_argument("--seasons", type=str, default="1999-2025",
                       help="Season range, e.g. '1999-2025' or '2020-2025'")
    parser.add_argument("--existing", type=str, default=None,
                       help="Path to existing nfl_data.py (to preserve curated sections)")
    parser.add_argument("--output", type=str, default="nfl_data_GENERATED.py",
                       help="Output filename")
    parser.add_argument("--dry-run", action="store_true",
                       help="Preview stats without writing file")
    parser.add_argument("--min-qb-yards", type=int, default=10000,
                       help="Minimum career pass yards for QB inclusion")
    parser.add_argument("--min-rb-yards", type=int, default=2000,
                       help="Minimum career rush yards for RB inclusion")
    
    args = parser.parse_args()
    
    # Parse season range
    if '-' in args.seasons:
        start, end = args.seasons.split('-')
        seasons = list(range(int(start), int(end) + 1))
    else:
        seasons = [int(s) for s in args.seasons.split(',')]
    
    # Override minimums if provided
    MIN_CAREER['QB']['pass_yards'] = args.min_qb_yards
    MIN_CAREER['RB']['rush_yards'] = args.min_rb_yards
    
    print("=" * 60)
    print("🏈 Pigskin5 nflverse Data Pipeline")
    print(f"   Seasons: {min(seasons)}-{max(seasons)}")
    print(f"   Output: {args.output}")
    print("=" * 60)
    print()
    
    # 1. Fetch data
    stats_df = fetch_player_stats(seasons)
    rosters_df = fetch_rosters(seasons[-5:])  # Only recent rosters needed
    
    print()
    
    # 2. Build career stats
    qbs = build_career_qbs(stats_df, rosters_df)
    rbs = build_career_rbs(stats_df, rosters_df)
    wrs = build_career_wrs(stats_df, rosters_df)
    tes = build_career_tes(stats_df, rosters_df)
    
    # 3. Merge with pre-nflverse legends
    qbs = merge_with_legends(qbs, PRE_NFLVERSE_QBS)
    rbs = merge_with_legends(rbs, PRE_NFLVERSE_RBS)
    wrs = merge_with_legends(wrs, PRE_NFLVERSE_WRS)
    tes = merge_with_legends(tes, PRE_NFLVERSE_TES)
    
    # 4. Apply award overlay
    qbs = apply_award_overlay(qbs, QB_AWARDS)
    
    # 5. Build season leaders
    season_leaders = build_season_leaders(stats_df)
    
    print()
    
    # 6. Summary
    print("📊 Pipeline Summary:")
    print(f"   QBs: {len(qbs)}")
    print(f"   RBs: {len(rbs)}")
    print(f"   WRs: {len(wrs)}")
    print(f"   TEs: {len(tes)}")
    print(f"   Seasons w/ leaders: {len(season_leaders)}")
    
    if args.dry_run:
        print()
        print("🔍 DRY RUN — Top 5 QBs by career passing yards:")
        for p in qbs[:5]:
            print(f"   {p[0]}: {p[2].get('pass_yards', 0):,} yds, {p[2].get('pass_tds', 0)} TDs")
        print()
        print("🔍 DRY RUN — 2024 Season Leaders:")
        if 2024 in season_leaders:
            for k, v in season_leaders[2024].items():
                if isinstance(v, tuple):
                    print(f"   {k}: {v[0]} ({v[1]:,})")
        return
    
    # 7. Generate output
    existing = Path(args.existing) if args.existing else None
    output = generate_output(qbs, rbs, wrs, tes, season_leaders, existing)
    
    Path(args.output).write_text(output, encoding='utf-8')
    
    print()
    print(f"   📝 Wrote {args.output}")
    print()
    print("   ⚠️  NEXT STEPS:")
    print("   1. Review the generated file for accuracy")
    print("   2. Manually add awards to SEASON_LEADERS (mvp, opoy, dpoy, etc.)")
    print("   3. Copy to generators/nfl_data.py")
    print("   4. Run: python generate_questions.py --days 3 --start-date 2026-04-08")
    print("   5. Spot-check generated questions")
    print()


if __name__ == "__main__":
    main()
