# FORMULA 1 RACE INTELLIGENCE — COMPREHENSIVE DATA DICTIONARY

This data dictionary defines all 41 columns of the primary fact table `race_results.csv` (6,464 rows) and the 4 relational supporting tables (`circuits.csv`, `championship_standings.csv`, `qualifying_results.csv`, `lap_intelligence.csv`).

---

## 1. Primary Fact Table: `race_results.csv` (6,464 Rows × 41 Columns)

| # | Field Name | Data Type | Role | Constraint / Example | Description |
|---|---|---|---|---|---|
| 1 | `race_id` | Integer | Dimension | PK (1 – 331) | Unique identifier for each Grand Prix race event. |
| 2 | `season` | Integer | Dimension | 2010 – 2026 | Championship year. |
| 3 | `round` | Integer | Dimension | 1 – 21 | Race sequence within the specific season calendar. |
| 4 | `circuit_id` | String | Dimension | FK (`monza`, `spa`) | Foreign key linking to the `circuits` table. |
| 5 | `grand_prix_name` | String | Dimension | 'Italian Grand Prix' | Full official name of the Grand Prix. |
| 6 | `race_date` | Date | Dimension | YYYY-MM-DD | Date of the Grand Prix race Sunday. |
| 7 | `driver` | String | Dimension | 'Lewis Hamilton' | Full name of the Formula 1 driver. |
| 8 | `driver_number` | Integer | Dimension | 44, 1, 16 | Official permanent car number of the driver. |
| 9 | `driver_code` | String | Dimension | 'HAM', 'VER', 'LEC' | Standard three-letter timing broadcast abbreviation. |
| 10 | `nationality` | String | Dimension | 'British', 'Dutch' | Driver nationality. |
| 11 | `team` | String | Dimension | 'Mercedes-AMG PETRONAS' | Constructor team competing in the championship. |
| 12 | `engine_manufacturer` | String | Dimension | 'Mercedes', 'Honda RBPT' | Powertrain / engine supplier. |
| 13 | `grid_position` | Integer | Measure | 1 – 22 | Official starting grid position on Sunday. |
| 14 | `finish_position` | Integer / Null | Measure | 1 – 22 (Null for DNF) | Official finishing classification. Null for retirements. |
| 15 | `position_change` | Integer / Null | Measure | -15 to +18 | Grid position minus finish position (net places gained). |
| 16 | `status` | String | Dimension | 'Finished', 'DNF' | Race outcome classification status. |
| 17 | `dnf_flag` | Integer | Measure | 0 (Finished), 1 (DNF) | Binary flag indicating retirement. |
| 18 | `dnf_reason` | String / Null | Dimension | 'Engine failure', Null | Root cause category of retirement. |
| 19 | `points` | Real | Measure | 0.0 – 25.0 | Championship points awarded for race finish. |
| 20 | `laps_completed` | Integer | Measure | 3 – 90 | Number of laps completed by the car. |
| 21 | `laps_led` | Integer | Measure | 0 – 78 | Number of laps spent leading the race in P1. |
| 22 | `fastest_lap_rank` | Integer / Null | Measure | 1 – 20 | Relative ranking of the driver's fastest race lap. |
| 23 | `fastest_lap_time` | String | Dimension | '1:21.046' | Formatted lap time string (MM:SS.mmm). |
| 24 | `fastest_lap_speed_kmh` | Real | Measure | 195.4 – 258.9 | Average speed of the car during its fastest single lap. |
| 25 | `lap_time_s` | Real | Measure | 54.43 – 116.13 | Fastest lap expressed as continuous seconds. |
| 26 | `gap_to_leader_s` | Real / Null | Measure | 0.0 to +110.5 (Null for DNF) | Time gap to P1 race winner at checkered flag. |
| 27 | `pit_stops` | Integer | Measure | 0 – 4 | Number of pit stops executed during the race. |
| 28 | `drs_overtakes` | Integer | Measure | 0 – 16 | Number of overtakes completed within DRS zones. |
| 29 | `tyre_compound` | String | Dimension | 'Soft', 'Medium', 'Hard' | Starting / primary tyre compound chosen. |
| 30 | `tyre_stint_laps` | Integer | Measure | 8 – 55 | Stint length completed on the primary tyre set. |
| 31 | `air_temp_celsius` | Real | Measure | 18.0 – 34.5 | Ambient trackside air temperature in Celsius. |
| 32 | `track_temp_celsius` | Real | Measure | 28.5 – 52.7 | Asphalt track surface temperature in Celsius. |
| 33 | `humidity_pct` | Real | Measure | 32.0 – 84.0 | Relative atmospheric humidity percentage. |
| 34 | `rainfall_mm` | Real | Measure | 0.0 – 18.0 | Track precipitation during race in millimeters. |
| 35 | `safety_car_laps` | Integer | Measure | 0 – 9 | Total laps led by the Mercedes/Aston Safety Car. |
| 36 | `vsc_laps` | Integer | Measure | 0 – 5 | Virtual Safety Car neutralization periods. |
| 37 | `avg_speed_kmh` | Real | Measure | 165.0 – 248.5 | Overall average race speed across completed distance. |
| 38 | `qualifying_position` | Integer | Measure | 1 – 22 | Official Saturday qualifying session result. |
| 39 | `q3_time_s` | Real | Measure | 52.1 – 112.4 | Pole shoot-out lap time in seconds. |
| 40 | `points_cumulative` | Real | Measure | 0.0 – 575.0 | Running total of points accumulated by driver in season. |
| 41 | `dnf_count_career` | Integer | Measure | 0 – 42 | Cumulative career retirements logged up to this event. |

---

## 2. Table: `circuits.csv` (29 Rows × 14 Columns — Authentic Dataset + Enriched Metrics)

| Field Name | Type | Origin | Description |
|---|---|---|---|
| `circuit_id` | String (PK) | User Dataset | Unique track identifier (e.g., `bahrain`, `jeddah`, `imola`, `monza`, `spa`, `canada`, `mexico`). |
| `circuit_name` | String | User Dataset | Full venue name (e.g., 'Autodromo Nazionale Monza'). |
| `country` | String | User Dataset | Host nation. |
| `city` | String | User Dataset | Host city or region (e.g., 'Monza', 'Montreal', 'São Paulo'). |
| `laps` | Integer | User Dataset | Scheduled Grand Prix race laps (e.g., 53, 57, 78). |
| `lap_km` | Real | User Dataset | Official lap length in kilometers (e.g., 5.793, 3.337, 7.004). |
| `type` | String | User Dataset | Track categorization: 'Permanent', 'Street', 'Street/Park'. |
| `altitude_m` | Integer | User Dataset | Elevation above sea level in meters (ranges from 2m in Miami to 2,240m in Mexico City). |
| `direction` | String | User Dataset | Racing direction: 'Clockwise', 'Anti-clockwise', 'Mixed'. |
| `total_race_distance_km` | Real | Derived Metric | Total race distance: `laps * lap_km` (e.g., 307.029 km). |
| `elevation_category` | String | Derived Metric | Categorization: 'Extreme (>1000m)', 'High (300-1000m)', 'Moderate (50-300m)', 'Sea Level (<50m)'. |
| `latitude` | Real | Coordinates Map | Decimal latitude coordinates for Tableau & Web maps. |
| `longitude` | Real | Coordinates Map | Decimal longitude coordinates for Tableau & Web maps. |
| `drs_zones` | Integer | Technical Spec | Number of DRS activation zones (1 to 4). |

---

## 3. Supporting Relational Tables

- **`championship_standings.csv`**: Contains season-by-season final standings for both drivers and constructor teams, including total season points, wins, podiums, and championship finishing position.
- **`qualifying_results.csv`**: Contains granular Saturday qualifying records with Q1, Q2, and Q3 session lap times, gap to pole position, and starting grid penalties.
- **`lap_intelligence.csv`**: High-resolution lap-by-lap telemetry data points covering sector times (Sector 1, Sector 2, Sector 3), speed traps (km/h), tyre life degradation, throttle percentage, and brake wear.
