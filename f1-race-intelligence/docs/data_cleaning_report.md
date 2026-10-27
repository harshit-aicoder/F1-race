# FORMULA 1 RACE INTELLIGENCE — DATA QUALITY & CLEANING REPORT

**Execution Date:** 2026-10-27
**Dataset Coverage:** 2010 – 2026 (17 Seasons, 29 Circuits, 10 Teams)
**Total Race Result Rows:** 6,464 (Exact match to specification)
**Total Features / Columns:** 41 columns
**Total Combined Relational Rows:** 19,230

## 1. Relational Layer Audit

| Table Name | Rows | Columns | Primary Key | Foreign Keys |
|---|---|---|---|---|
| `circuits` | 29 | 13 | `circuit_id` | None |
| `race_results` | 6,464 | 41 | `race_id`, `driver` | `circuit_id` -> `circuits.circuit_id` |
| `championship_standings` | 333 | 15 | `season`, `driver`, `team` | `team` |
| `qualifying_results` | 6,464 | 12 | `race_id`, `driver` | `race_id`, `circuit_id` |
| `lap_intelligence` | 5,940 | 15 | `race_id`, `driver`, `lap_number` | `race_id`, `circuit_id` |

## 2. Null Value Treatment & DNF Rules

- **DNF Entries:** Retained with `dnf_flag = 1` and `dnf_reason` rigorously populated across 9 failure classifications (Engine, Gearbox, Brake, Hydraulics, Collision, Suspension, Mechanical, Electrical, Puncture).
- **Gap to Leader Exclusion:** `gap_to_leader_s` is kept as `NULL` for DNF entries so that gap-based aggregations and delta times are not skewed by retired cars.
- **Finish Position:** Kept as `NULL` for DNF entries to preserve classification integrity.

## 3. Data Dictionary of Master Columns (41 Columns)

| # | Column Name | Data Type | Role | Description |
|---|---|---|---|---|
| 1 | `race_id` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 2 | `season` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 3 | `round` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 4 | `circuit_id` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 5 | `grand_prix_name` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 6 | `race_date` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 7 | `driver` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 8 | `driver_number` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 9 | `driver_code` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 10 | `nationality` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 11 | `team` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 12 | `engine_manufacturer` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 13 | `grid_position` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 14 | `finish_position` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 15 | `position_change` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 16 | `status` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 17 | `dnf_flag` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 18 | `dnf_reason` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 19 | `points` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 20 | `laps_completed` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 21 | `laps_led` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 22 | `fastest_lap_rank` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 23 | `fastest_lap_time` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 24 | `fastest_lap_speed_kmh` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 25 | `lap_time_s` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 26 | `gap_to_leader_s` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 27 | `pit_stops` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 28 | `drs_overtakes` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 29 | `tyre_compound` | `str` | Dimension (Discrete) | Motorsport analytics attribute |
| 30 | `tyre_stint_laps` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 31 | `air_temp_celsius` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 32 | `track_temp_celsius` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 33 | `humidity_pct` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 34 | `rainfall_mm` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 35 | `safety_car_laps` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 36 | `vsc_laps` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 37 | `avg_speed_kmh` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 38 | `qualifying_position` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 39 | `q3_time_s` | `float64` | Measure (Continuous) | Motorsport analytics attribute |
| 40 | `points_cumulative` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
| 41 | `dnf_count_career` | `int64` | Measure (Continuous) | Motorsport analytics attribute |
