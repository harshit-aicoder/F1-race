# FORMULA 1 RACE INTELLIGENCE — TABLEAU CALCULATED FIELDS DICTIONARY

This document contains all calculated fields, formulas, parameters, and logical relationship rules used in the **Formula 1 Race Intelligence** Tableau workbook.

---

## 1. Parameters Configured

### Parameter 1: `[Top N Parameter]`
- **Data Type:** Integer
- **Allowable Values:** Range
- **Minimum:** 5
- **Maximum:** 30
- **Step Size:** 1
- **Current / Default Value:** 10
- **Purpose:** Dynamically controls the number of ranked drivers displayed on the *Driver Performance Leaderboard* bar chart without hardcoding filters.

### Parameter 2: `[Selected Season]`
- **Data Type:** Integer
- **Allowable Values:** Range
- **Minimum:** 2010
- **Maximum:** 2026
- **Current / Default Value:** 2026
- **Purpose:** Allows season-by-season parameter swapping for comparative analytics.

---

## 2. Calculated Fields & Tableau Formulas

### Calculation 1: `[DNF Count]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  SUM([dnf_flag])
  ```
- **Description:** Sums the binary `dnf_flag` (1 for retirement, 0 for finish) to aggregate total retirements by driver, constructor, or engine manufacturer.

### Calculation 2: `[Points Cumulative]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  RUNNING_SUM(SUM([points]))
  ```
- **Compute Using:** Specific Dimensions -> `[round]` or `[race_date]` within each `[season]` and `[driver]`
- **Description:** Calculates running season point totals to render championship progression curves over successive Grand Prix rounds.

### Calculation 3: `[Top N Filter]`
- **Role:** Dimension (Boolean)
- **Tableau Formula:**
  ```tableau
  INDEX() <= [Top N Parameter]
  ```
- **Compute Using:** Table (Down)
- **Description:** Placed on the Filters shelf with value set to `True` to dynamically restrict visible drivers to the top $N$ ranked individuals.

### Calculation 4: `[Driver Win Count]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  COUNTD(IF [finish_position] = 1 THEN [race_id] END)
  ```
- **Description:** Counts distinct race victories achieved by a driver across selected seasons.

### Calculation 5: `[Driver Podium Count]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  COUNTD(IF [finish_position] <= 3 AND [finish_position] >= 1 THEN [race_id] END)
  ```
- **Description:** Aggregates P1, P2, and P3 podium finishes.

### Calculation 6: `[Reliability Rate (%)]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  (1 - (SUM([dnf_flag]) / COUNT([race_id]))) * 100
  ```
- **Format:** Percentage (1 decimal place)
- **Description:** Computes the percentage of race entries successfully completed.

### Calculation 7: `[Net Position Change]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  ZN([grid_position]) - ZN([finish_position])
  ```
- **Description:** Positive values indicate grid positions gained during the race (overtakes/climbing through the field); negative values indicate lost positions.

### Calculation 8: `[Pole Position Win Conversion]`
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  SUM(IF [grid_position] = 1 AND [finish_position] = 1 THEN 1 ELSE 0 END) / 
  SUM(IF [grid_position] = 1 THEN 1 ELSE 0 END)
  ```
- **Format:** Percentage (1 decimal place)
- **Description:** Measures the tactical conversion efficiency of converting Saturday pole positions into Sunday race victories.

### Calculation 9: `[Total Race Distance (KM)]` (From User Authentic Circuits)
- **Role:** Measure (Continuous)
- **Tableau Formula:**
  ```tableau
  [laps] * [lap_km]
  ```
- **Description:** Computes the total scheduled Grand Prix distance in kilometers from authentic circuit laps and lap length.

### Calculation 10: `[Elevation Category]` (From User Authentic Circuits)
- **Role:** Dimension (Discrete)
- **Tableau Formula:**
  ```tableau
  IF [altitude_m] >= 1000 THEN "Extreme Elevation (>1000m)"
  ELSEIF [altitude_m] >= 300 THEN "High Altitude (300-1000m)"
  ELSEIF [altitude_m] >= 50 THEN "Moderate Elevation (50-300m)"
  ELSE "Sea Level (<50m)"
  END
  ```
- **Description:** Classifies circuits according to atmospheric density and engine/brake cooling strain.

### Calculation 11: `[High Altitude Filter]`
- **Role:** Dimension (Boolean)
- **Tableau Formula:**
  ```tableau
  [altitude_m] >= 300
  ```
- **Description:** Isolates high-elevation circuits (Mexico City 2240m, Spielberg 678m, Las Vegas 620m, Spa 401m).

---

## 3. Data Relationships and Logical Joins

In Tableau's Logical Layer:
- **Root Table:** `race_results.csv` (Cardinality: Fact Table, 6,464 rows)
- **Joined Dimension:** `circuits.csv`
  - **Relationship Clause:** `[race_results].[circuit_id] = [circuits].[circuit_id]`
  - **Join Type:** Many-to-One (Inner Join)
  - **Enriched Attributes:** `[country]`, `[circuit_name]`, `[latitude]`, `[longitude]`, `[circuit_type]`, `[track_length_km]`, `[drs_zones]`
- **Independent Sheet:** `championship_standings.csv`
  - Utilized for macro-level constructor and driver championship progression without inflating row counts.
- **Relational Child:** `lap_intelligence.csv`
  - Joined on `race_id` and `driver` for deep-dive telemetry and sector analysis.
