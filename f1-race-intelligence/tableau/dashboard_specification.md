# FORMULA 1 RACE INTELLIGENCE — TABLEAU DASHBOARD SPECIFICATION

This specification outlines the architecture, sheet construction, filter configurations, and story points for the **Formula 1 Race Intelligence** Tableau deliverable, covering the 17-season dataset (2010–2026).

---

## 1. Five Dedicated Dashboards

### Dashboard A: F1 Season Overview (Race Control)
- **Target Audience:** Motorsport Strategists, Team Principals, College Viva Evaluators.
- **Visualizations Included:**
  1. **Four KPI Banner Tiles:**
     - Competing Teams (10)
     - Seasons in Play (17)
     - Race Outcomes Logged (6,464)
     - Circuits Showcased (29)
  2. **Global Driver Distribution Map:** Worldwide geographical distribution of Grand Prix host nations with interactive point markers sized by total races hosted.
  3. **Constructor Points Progression:** Line / area chart showing points evolution across the 17 seasons.
- **Global Filters:** `[Season]`, `[Team]`.

### Dashboard B: Driver Performance & Reliability
- **Target Audience:** Driver Performance Analysts, Race Engineers.
- **Visualizations Included:**
  1. **Driver Performance Leaderboard:** Horizontal/vertical bar chart controlled by `[Top N Parameter]`, colored by team palette.
  2. **Driver Reliability Stacked Bar:** Aggregation of `[DNF Count]` broken down by `[dnf_reason]` (Engine, Gearbox, Collision, etc.).
  3. **Qualifying vs. Finish Delta Scatter:** Scatter plot showing correlation ($r = 0.85$) between Saturday grid position and Sunday classification.
- **Global Filters:** `[Driver]`, `[DNF Reason]`, `[Top N Parameter]`.

### Dashboard C: Constructor Analysis (Strategy Wall)
- **Target Audience:** Technical Directors, Powertrain Engineers.
- **Visualizations Included:**
  1. **Team Cumulative Performance Ranking:** Horizontal bar chart of total constructor points (Mercedes vs Red Bull vs Ferrari vs McLaren).
  2. **Season-by-Season Championship Grouped Bar:** Multi-year team points breakdown highlighting the transition from Red Bull V8 era (2010-2013) to Mercedes V6 Hybrid era (2014-2020) to Verstappen Ground Effect (2021-2023) and McLaren resurgence (2024-2026).
  3. **Driver Contribution Matrix:** Highlight table showing intra-team points distribution between teammates.
- **Global Filters:** `[Team]`, `[Engine Manufacturer]`.

### Dashboard D: Grand Prix Analysis & Telemetry
- **Target Audience:** Race Tacticians, Pit Wall Strategists.
- **Visualizations Included:**
  1. **Race Results Classification Grid:** Complete race classification with finish position, driver, gaps, and status.
  2. **Tyre Compound Usage Distribution:** Donut / Pie chart displaying Soft, Medium, Hard, Intermediate, and Wet tyre allocations.
  3. **Lap-Time Progression Curve:** High-resolution telemetry plot showing tyre degradation gradient and lap time trends.
- **Global Filters:** `[Season]`, `[Grand Prix Name]`, `[Circuit ID]`.

### Dashboard E: Data Storytelling (The 9 Narrative Scenes)
- **Format:** Tableau Story Workbook (`.twbx` Story Component)
- **Scene 1:** *Global Scale Overview* — 4 KPI metrics establishing the scope of 17 seasons and 6,464 race results.
- **Scene 2:** *Geographic Grand Prix Distribution* — Global map of the 29 circuits across Europe, the Americas, Asia, and the Middle East.
- **Scene 3:** *Driver Reliability & DNF Mechanics* — Stacked bar chart analyzing 696 retirements across 9 mechanical and collision categories.
- **Scene 4:** *Driver Performance Leaderboard* — Dynamic Top N ranking showing Lewis Hamilton (103 wins) and Max Verstappen.
- **Scene 5:** *Team Performance Ranking* — Constructor supremacy led by Mercedes-AMG and Red Bull Racing.
- **Scene 6:** *Championship Evolution Across Eras* — Grouped bars showing regulatory shifts between 2010 and 2026.
- **Scene 7:** *Tyre Compound Strategy Patterns* — Analysis of stint durations, thermal degradation, and pit-stop tactics.
- **Scene 8:** *Country-Level Participation Heatmap* — Treemap illustrating race concentration across host nations.
- **Scene 9:** *Podium Achievements Packed Bubble* — Bubble chart illustrating driver and constructor podium distributions.

---

## 2. Color Palette & Styling System

To evoke the high-stakes, aerodynamic aesthetic of Formula 1:
- **Canvas Background:** Deep Motorsport Charcoal (`#0B0D13` / `#121620`)
- **Card Containers:** Dark Metallic Slate (`#1A1F2C`) with subtle 1px border (`#2A3245`)
- **Accent Primary:** Racing Scarlet Red (`#E10600`)
- **Accent Secondary:** Telemetry Electric Cyan (`#00D2BE`)
- **Constructor Palette:**
  - Red Bull Racing: `#1E41FF`
  - Mercedes-AMG: `#00D2BE`
  - Scuderia Ferrari: `#E10600`
  - McLaren: `#FF8000`
  - Aston Martin: `#006F62`
  - Alpine: `#0090FF`
  - Williams: `#005AFF`
  - VCARB: `#6692FF`
  - Sauber: `#52E252`
  - Haas: `#B6BABD`
- **Font:** Orbitron / Space Grotesk / Titillium Web / Segoe UI Bold

---

## 3. How to Open and Review in Tableau Desktop

1. Open **Tableau Desktop 2026.3** (installed at `C:\Program Files\Tableau\Tableau 2026.3\bin\tableau.exe`).
2. Go to **File -> Open** and select:
   `C:\Users\HP\.gemini\antigravity\scratch\f1-race-intelligence\tableau\f1_race_intelligence.twbx`
3. The packaged workbook will unpack the data extracts automatically and render the complete multi-sheet dashboard.
4. Interact with the filters:
   - Change `[Top N Parameter]` slider from 10 to 15 or 5.
   - Filter by `[Season]` to explore specific regulatory eras.
   - Filter by `[DNF Reason]` to isolate engine versus collision retirements.
