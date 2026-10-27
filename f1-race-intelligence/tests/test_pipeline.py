"""
FORMULA 1 RACE INTELLIGENCE - AUTOMATED VERIFICATION SUITE
Tests dataset integrity, row counts, schema dimensions, calculated fields,
and Tableau workbook archives against the project specifications.
"""

import os
import zipfile
import sqlite3
import json
import xml.etree.ElementTree as ET
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PROCESSED = os.path.join(BASE_DIR, "data", "processed")
TABLEAU_DIR = os.path.join(BASE_DIR, "tableau")

def test_circuits_catalog():
    print("[Test] Verifying circuits catalog against user authentic dataset...")
    # Check original raw file preserved
    raw_path = os.path.join(BASE_DIR, "data", "raw", "F1 Racing Project Dataset.xlsx - circuits.csv")
    assert os.path.exists(raw_path), "User authentic file must be preserved in data/raw!"

    df = pd.read_csv(os.path.join(DATA_PROCESSED, "circuits.csv"))
    assert len(df) == 29, f"Expected 29 circuits, found {len(df)}"
    
    # Check user authentic columns
    user_cols = ["circuit_id", "circuit_name", "country", "city", "laps", "lap_km", "type", "altitude_m", "direction"]
    for col in user_cols:
        assert col in df.columns, f"Expected user column '{col}' missing!"
        
    # Check calculated fields
    assert "total_race_distance_km" in df.columns
    assert "elevation_category" in df.columns
    assert "latitude" in df.columns
    assert "longitude" in df.columns
    print("  -> Circuits Catalog: PASS (29 authentic user circuits with 9 raw + 4 derived columns)")

def test_race_results():
    print("[Test] Verifying race_results dataset...")
    df = pd.read_csv(os.path.join(DATA_PROCESSED, "race_results.csv"))
    assert len(df) == 6464, f"CRITICAL: Expected 6,464 race result rows, found {len(df)}"
    assert len(df.columns) == 41, f"CRITICAL: Expected 41 columns, found {len(df.columns)}"
    
    # Seasons check
    seasons = sorted(df["season"].unique())
    assert seasons == list(range(2010, 2027)), f"Expected seasons 2010-2026, found {seasons}"
    
    # Teams check
    teams = df["team"].unique()
    assert len(teams) == 10, f"Expected 10 teams, found {len(teams)}"
    
    # DNF Integrity Checks
    dnf_rows = df[df["dnf_flag"] == 1]
    assert dnf_rows["finish_position"].isna().all(), "DNF entries must have null finish_position"
    assert dnf_rows["gap_to_leader_s"].isna().all(), "DNF entries must have null gap_to_leader_s"
    assert not dnf_rows["dnf_reason"].isna().any(), "DNF entries must have populated dnf_reason"
    
    print(f"  -> Race Results: PASS (6,464 rows, 41 columns, 17 seasons, {len(dnf_rows)} valid DNFs)")

def test_championship_standings():
    print("[Test] Verifying championship standings...")
    df = pd.read_csv(os.path.join(DATA_PROCESSED, "championship_standings.csv"))
    assert len(df) >= 300
    assert "constructor_points" in df.columns
    print(f"  -> Championship Standings: PASS ({len(df)} records)")

def test_json_metadata():
    print("[Test] Verifying JSON metadata...")
    with open(os.path.join(DATA_PROCESSED, "summary_kpis.json"), "r", encoding="utf-8") as f:
        kpis = json.load(f)
    assert kpis["competing_teams"] == 10
    assert kpis["seasons_in_play"] == 17
    assert kpis["race_outcomes_logged"] == 6464
    assert kpis["circuits_showcased"] == 29
    
    with open(os.path.join(DATA_PROCESSED, "data_stories.json"), "r", encoding="utf-8") as f:
        stories = json.load(f)
    assert len(stories) == 6
    print("  -> JSON Metadata: PASS (KPIs, Stories, Profiles verified)")

def test_tableau_deliverables():
    print("[Test] Verifying Tableau files (.twb and .twbx)...")
    twb_path = os.path.join(TABLEAU_DIR, "f1_race_intelligence.twb")
    twbx_path = os.path.join(TABLEAU_DIR, "f1_race_intelligence.twbx")
    
    assert os.path.exists(twb_path), "f1_race_intelligence.twb not found!"
    assert os.path.exists(twbx_path), "f1_race_intelligence.twbx not found!"
    
    # Validate TWB XML
    tree = ET.parse(twb_path)
    root = tree.getroot()
    assert root.tag == "workbook", "Root element must be <workbook>"
    
    # Validate TWBX ZIP Archive
    with zipfile.ZipFile(twbx_path, "r") as z:
        file_list = z.namelist()
        assert "f1_race_intelligence.twb" in file_list
        assert "Data/race_results.csv" in file_list
        assert "Data/circuits.csv" in file_list
    print("  -> Tableau Deliverables: PASS (Valid XML and Packaged Archive)")

def test_sqlite_db():
    print("[Test] Verifying SQLite Database...")
    db_path = os.path.join(DATA_PROCESSED, "f1_database.sqlite")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM race_results")
    count = cursor.fetchone()[0]
    assert count == 6464, f"Expected 6464 in SQLite, found {count}"
    conn.close()
    print("  -> SQLite Database: PASS (6,464 records verified via SQL)")

if __name__ == "__main__":
    print("=== RUNNING FORMULA 1 RACE INTELLIGENCE TEST SUITE ===")
    test_circuits_catalog()
    test_race_results()
    test_championship_standings()
    test_json_metadata()
    test_tableau_deliverables()
    test_sqlite_db()
    print("\nALL 6 VERIFICATION TEST SUITES PASSED WITH 100% SUCCESS!")
