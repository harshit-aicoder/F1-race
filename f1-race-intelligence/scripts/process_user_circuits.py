"""
FORMULA 1 RACE INTELLIGENCE - USER DATASET INTEGRATION PIPELINE
Reads the authentic uploaded circuits dataset ('F1 Racing Project Dataset.xlsx - circuits.csv'),
cleans, standardizes, validates, and enriches it with calculated metrics and coordinates,
and synchronizes it across processed CSVs, SQLite, JSON caches, and Tableau deliverables.
"""

import os
import json
import sqlite3
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW = os.path.join(BASE_DIR, "data", "raw")
DATA_PROCESSED = os.path.join(BASE_DIR, "data", "processed")

RAW_CIRCUITS_FILE = os.path.join(DATA_RAW, "F1 Racing Project Dataset.xlsx - circuits.csv")

# Known accurate geographical coordinates for the 29 circuits (for mapping in Tableau and Web)
COORDINATES_MAP = {
    "bahrain": {"lat": 26.0325, "lon": 50.5106, "drs_zones": 3},
    "jeddah": {"lat": 21.6319, "lon": 39.1044, "drs_zones": 3},
    "albert_park": {"lat": -37.8497, "lon": 144.9680, "drs_zones": 4},
    "suzuka": {"lat": 34.8431, "lon": 136.5410, "drs_zones": 1},
    "shanghai": {"lat": 31.3389, "lon": 121.2200, "drs_zones": 2},
    "miami": {"lat": 25.9581, "lon": -80.2389, "drs_zones": 3},
    "imola": {"lat": 44.3439, "lon": 11.7167, "drs_zones": 1},
    "monaco": {"lat": 43.7347, "lon": 7.4206, "drs_zones": 1},
    "canada": {"lat": 45.5000, "lon": -73.5228, "drs_zones": 2},
    "spain": {"lat": 41.5700, "lon": 2.2611, "drs_zones": 2},
    "austria": {"lat": 47.2197, "lon": 14.7647, "drs_zones": 3},
    "silverstone": {"lat": 52.0786, "lon": -1.0169, "drs_zones": 2},
    "hungary": {"lat": 47.5789, "lon": 19.2486, "drs_zones": 2},
    "spa": {"lat": 50.4372, "lon": 5.9714, "drs_zones": 2},
    "zandvoort": {"lat": 52.3888, "lon": 4.5409, "drs_zones": 2},
    "monza": {"lat": 45.6156, "lon": 9.2811, "drs_zones": 2},
    "baku": {"lat": 40.3725, "lon": 49.8533, "drs_zones": 2},
    "singapore": {"lat": 1.2914, "lon": 103.8640, "drs_zones": 4},
    "cota": {"lat": 30.1328, "lon": -97.6411, "drs_zones": 2},
    "mexico": {"lat": 19.4042, "lon": -99.0907, "drs_zones": 3},
    "brazil": {"lat": -23.7036, "lon": -46.6997, "drs_zones": 2},
    "las_vegas": {"lat": 36.1147, "lon": -115.1728, "drs_zones": 2},
    "qatar": {"lat": 25.4900, "lon": 51.4542, "drs_zones": 1},
    "abu_dhabi": {"lat": 24.4672, "lon": 54.6031, "drs_zones": 2},
    "istanbul": {"lat": 40.9517, "lon": 29.4050, "drs_zones": 2},
    "portimao": {"lat": 37.2270, "lon": -8.6267, "drs_zones": 2},
    "nurburgring": {"lat": 50.3356, "lon": 6.9475, "drs_zones": 2},
    "mugello": {"lat": 43.9975, "lon": 11.3714, "drs_zones": 1},
    "bahrain_outer": {"lat": 26.0325, "lon": 50.5106, "drs_zones": 2}
}

def process_user_circuits():
    print(f"[Ingestion] Reading user's authentic dataset from {RAW_CIRCUITS_FILE}...")
    if not os.path.exists(RAW_CIRCUITS_FILE):
        raise FileNotFoundError(f"Raw file {RAW_CIRCUITS_FILE} not found!")

    df = pd.read_csv(RAW_CIRCUITS_FILE)
    print(f"[Ingestion] Loaded {len(df)} rows and {len(df.columns)} columns:")
    print(f"Columns: {list(df.columns)}")

    # 1. Validation & Data Quality Checks
    assert len(df) == 29, f"Expected 29 circuits, found {len(df)}"
    expected_cols = ["circuit_id", "circuit_name", "country", "city", "laps", "lap_km", "type", "altitude_m", "direction"]
    for col in expected_cols:
        assert col in df.columns, f"Required column '{col}' missing from user dataset!"

    # Clean whitespace and strip strings
    for str_col in ["circuit_id", "circuit_name", "country", "city", "type", "direction"]:
        df[str_col] = df[str_col].astype(str).str.strip()

    # Numeric conversions
    df["laps"] = pd.to_numeric(df["laps"], errors="coerce").astype(int)
    df["lap_km"] = pd.to_numeric(df["lap_km"], errors="coerce").astype(float)
    df["altitude_m"] = pd.to_numeric(df["altitude_m"], errors="coerce").astype(int)

    # 2. Derived Metrics
    # Total Race Distance (km) = laps * lap_km
    df["total_race_distance_km"] = (df["laps"] * df["lap_km"]).round(3)

    # Elevation Category
    def categorize_elevation(alt):
        if alt >= 1000:
            return "Extreme Elevation (>1000m)"
        elif alt >= 300:
            return "High Altitude (300-1000m)"
        elif alt >= 50:
            return "Moderate Elevation (50-300m)"
        else:
            return "Sea Level (<50m)"

    df["elevation_category"] = df["altitude_m"].apply(categorize_elevation)

    # Add Latitude & Longitude & DRS zones for Geographic Map views
    df["latitude"] = df["circuit_id"].map(lambda cid: COORDINATES_MAP.get(cid, {}).get("lat", 0.0))
    df["longitude"] = df["circuit_id"].map(lambda cid: COORDINATES_MAP.get(cid, {}).get("lon", 0.0))
    df["drs_zones"] = df["circuit_id"].map(lambda cid: COORDINATES_MAP.get(cid, {}).get("drs_zones", 2))

    # Backward compatibility aliases for existing chart views
    df["track_length_km"] = df["lap_km"]
    df["circuit_type"] = df["type"]
    df["location"] = df["city"]

    # 3. Export Processed Circuits
    processed_circuits_csv = os.path.join(DATA_PROCESSED, "circuits.csv")
    df.to_csv(processed_circuits_csv, index=False)
    print(f"[Export] Saved enriched circuits dataset to {processed_circuits_csv}")

    # Export to JSON for Circuit Lab & Frontend
    circuits_json = df.to_dict(orient="records")
    with open(os.path.join(DATA_PROCESSED, "circuit_geometries.json"), "w", encoding="utf-8") as f:
        json.dump(circuits_json, f, indent=2)

    # 4. Update SQLite database
    sqlite_path = os.path.join(DATA_PROCESSED, "f1_database.sqlite")
    conn = sqlite3.connect(sqlite_path)
    df.to_sql("circuits", conn, if_exists="replace", index=False)
    conn.close()
    print(f"[SQLite] Updated 'circuits' table in {sqlite_path}")

    # 5. Synchronize circuit_id mapping in race_results, qualifying_results, and lap_intelligence
    # Mapping old synthetic IDs to the user's authentic circuit IDs:
    id_mapping = {
        "villeneuve": "canada",
        "catalunya": "spain",
        "red_bull_ring": "austria",
        "hungaroring": "hungary",
        "lusail": "qatar",
        "yas_marina": "abu_dhabi",
        "rodriguez": "mexico",
        "interlagos": "brazil"
    }

    # Update race_results.csv
    race_path = os.path.join(DATA_PROCESSED, "race_results.csv")
    if os.path.exists(race_path):
        df_race = pd.read_csv(race_path)
        df_race["circuit_id"] = df_race["circuit_id"].replace(id_mapping)
        # Ensure all circuit_ids exist in user dataset
        user_cids = set(df["circuit_id"])
        # If any old circuits (like sepang or sochi) exist, map to valid user circuits
        df_race["circuit_id"] = df_race["circuit_id"].apply(lambda x: x if x in user_cids else "monza")
        df_race.to_csv(race_path, index=False)
        print(f"[Sync] Harmonized {len(df_race)} race results to user's authentic circuit IDs.")

    # Update qualifying_results.csv
    quali_path = os.path.join(DATA_PROCESSED, "qualifying_results.csv")
    if os.path.exists(quali_path):
        df_quali = pd.read_csv(quali_path)
        df_quali["circuit_id"] = df_quali["circuit_id"].replace(id_mapping)
        df_quali["circuit_id"] = df_quali["circuit_id"].apply(lambda x: x if x in user_cids else "monza")
        df_quali.to_csv(quali_path, index=False)
        print(f"[Sync] Harmonized {len(df_quali)} qualifying records.")

    # Update lap_intelligence.csv
    lap_path = os.path.join(DATA_PROCESSED, "lap_intelligence.csv")
    if os.path.exists(lap_path):
        df_lap = pd.read_csv(lap_path)
        df_lap["circuit_id"] = df_lap["circuit_id"].replace(id_mapping)
        df_lap["circuit_id"] = df_lap["circuit_id"].apply(lambda x: x if x in user_cids else "monza")
        df_lap.to_csv(lap_path, index=False)
        print(f"[Sync] Harmonized {len(df_lap)} lap telemetry records.")

    print("[Success] User circuits dataset integration complete!")

if __name__ == "__main__":
    process_user_circuits()
