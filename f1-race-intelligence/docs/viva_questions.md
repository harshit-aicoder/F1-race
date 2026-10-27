# FORMULA 1 RACE INTELLIGENCE — 25 VIVA VOCE QUESTIONS & MODEL ANSWERS

Prepared specifically for 1st-Year BTech Computer Science students to defend their data analytics, web engineering, and Tableau capstone project with confidence.

---

### Q1: What is the main objective of this project?
**Answer:** The objective of **Formula 1 Race Intelligence** is to bridge data engineering, statistical data science, business intelligence, and 3D web technologies. It analyzes 17 seasons of Formula 1 data (2010–2026), providing an interactive 3D WebGL web platform alongside an enterprise-grade Tableau dashboard to evaluate driver performance, vehicle reliability, circuit geometry, and strategic race telemetry.

---

### Q2: Why did you choose the time period from 2010 to 2026 (17 seasons)?
**Answer:** Covering 2010 to 2026 spans four monumental regulatory eras:
1. **2010–2013 (V8 Blown Diffuser Era):** Red Bull and Sebastian Vettel won 4 consecutive titles.
2. **2014–2020 (1.6L V6 Turbo Hybrid Era):** Mercedes dominated with thermal efficiency, winning 7 consecutive drivers' titles.
3. **2021–2023 (Ground Effect Era):** Reintroduction of underfloor Venturi tunnels and Red Bull dominance with Max Verstappen.
4. **2024–2026 (Grid Convergence & 50/50 Active Powertrain Era):** Closer multi-team fights with McLaren and Ferrari, culminating in the 2026 active aerodynamics regulations.

---

### Q3: How did you handle missing values and DNF (Did Not Finish) records?
**Answer:** We implemented formal motorsport data cleaning rules:
- DNF records retain `finish_position` as `NULL` (`None`) instead of 0 or 20 to avoid corrupting arithmetic means.
- `gap_to_leader_s` is kept as `NULL` so gap aggregations only measure cars that took the checkered flag.
- Every DNF record has `dnf_flag = 1` and `dnf_reason` classified into 9 root causes (Engine failure, Gearbox, Brake, Hydraulics, Collision, Suspension, Mechanical, Electrical, Puncture).

---

### Q4: What is the Pearson correlation coefficient between Qualifying and Finishing position?
**Answer:** The Pearson correlation coefficient is **$r = 0.851$**, indicating a very strong positive linear relationship between starting position on the grid and final race finish.

---

### Q5: Does qualifying in pole position *cause* race victory?
**Answer:** No. Correlation does not imply causation. A pole position does not mechanically cause victory. Both Saturday pole position and Sunday victory share underlying common causes: peak aerodynamic downforce, chassis balance, engine power, and driver consistency. Furthermore, external factors such as pit strategy, tyre degradation, safety cars, and mechanical failures frequently overturn the qualifying order.

---

### Q6: What is the pole-to-win conversion rate across circuits?
**Answer:** Overall pole-to-win conversion is approximately **36.0% to 54%** across all venues. However, track geometry heavily influences this:
- **Street circuits (Monaco, Singapore):** Pole conversion surges to **74.2%** due to tight overtaking corridors and high track position value.
- **High-speed drafting circuits (Monza, Spa, Silverstone):** Pole conversion drops to **48-52%** due to slipstreams and powerful DRS overtaking zones.

---

### Q7: What are the two deliverables of this project and how do they work together?
**Answer:**
1. **Deliverable 1:** A responsive 3D Web Application built with Three.js WebGL and Chart.js, served by a zero-dependency Python REST API.
2. **Deliverable 2:** A functional Tableau Workbook (`.twbx` and `.twb`) containing 5 dedicated dashboards and 9 story scenes.
Both deliverables draw from the exact same validated CSV files in `data/processed/`, ensuring 100% metric consistency.

---

### Q8: What calculated fields did you create in Tableau?
**Answer:**
- `[DNF Count] = SUM([dnf_flag])`
- `[Points Cumulative] = RUNNING_SUM(SUM([points]))`
- `[Top N Filter] = INDEX() <= [Top N Parameter]`
- `[Pole Win Conversion] = SUM(IF [grid_position]=1 AND [finish_position]=1 THEN 1 ELSE 0 END) / SUM(IF [grid_position]=1 THEN 1 ELSE 0 END)`

---

### Q9: What is the difference between a `.twb` and a `.twbx` file?
**Answer:**
- A `.twb` (Tableau Workbook) is an XML file containing sheet definitions, calculations, visual formatting, and links to data sources, but it does NOT contain the data itself.
- A `.twbx` (Tableau Packaged Workbook) is a compressed ZIP archive containing the `.twb` XML file AND the packaged data files (CSVs or extracts). Anyone can open a `.twbx` on any computer without missing file path errors.

---

### Q10: How did you join the tables in Tableau?
**Answer:** In Tableau's Logical Layer, we joined the primary fact table `race_results.csv` to `circuits.csv` on the shared key `circuit_id` (Many-to-One inner join) to enrich race outcomes with latitude, longitude, track length, and turns. `championship_standings.csv` was kept as an independent sheet to prevent row inflation when analyzing season-by-season constructor totals.

---

### Q11: What technologies were used in the web application?
**Answer:**
- **Three.js (WebGL):** 3D hardware-accelerated rendering for the procedural F1 car and 3D Circuit Lab.
- **Chart.js:** Responsive 2D canvas charting for leaderboards, scatter plots, and doughnut charts.
- **Vanilla Modern JavaScript (ES6+):** Application coordination, cross-filtering, and head-to-head comparison logic.
- **Python 3.14:** High-speed REST API server (`scripts/serve.py`) providing dynamic querying with zero external dependencies.

---

### Q12: Why did you build a procedural 3D car instead of relying solely on an external 3D file?
**Answer:** External 3D GLTF/GLB files can be 20 to 50 MB, causing slow network load times and failing on restricted networks. Building a procedural composite model in Three.js ensures instant load times (<50ms), zero external file dependencies, and allows programmatically manipulating parts (wireframe aerodynamic modes, neon underglow, spinning wheels, camera angles).

---

### Q13: How does the 3D Circuit Lab generate race tracks?
**Answer:** The Circuit Lab uses Three.js `CatmullRomCurve3` 3D parametric splines. It samples coordinates representing the circuit layout and extrudes a bilateral 3D ribbon with track width, surface normals, and sector color coding (Sector 1: Yellow, Sector 2: Cyan, Sector 3: Red). An animated marker moves continuously along the spline to simulate lap progression.

---

### Q14: What is the significance of tyre compound thermal degradation?
**Answer:** Soft tyres provide higher initial mechanical grip (~0.8s faster per lap) but degrade steeply (+0.12s/lap degradation slope) after 14-16 laps due to thermal blistering. Hard tyres offer lower initial grip but maintain consistent lap times over 35+ laps. This trade-off dictates pit stop timing.

---

### Q15: What is an "undercut" in Formula 1 racing?
**Answer:** An undercut is a pit stop strategy where a trailing car enters the pit lane 1 to 2 laps earlier than the car ahead. By fitting fresh tyres, the driver sets a blisteringly fast out-lap, gaining enough track time to leapfrog the opponent when the rival subsequently pits.

---

### Q16: How does the Head-to-Head Driver Comparison tool work?
**Answer:** The comparator queries `driver_profiles.json` for any two selected drivers (e.g., Lewis Hamilton vs. Max Verstappen), extracts career metrics (Wins, Podiums, Points, Win %, DNF %, Avg Grid, Avg Finish), and calculates proportional percentage widths to animate dual progress bars.

---

### Q17: What are the 4 main KPI metrics displayed in Race Control?
**Answer:**
1. **Competing Teams:** 10
2. **Seasons in Play:** 17 (2010–2026)
3. **Race Outcomes Logged:** 6,464 verified rows
4. **Circuits Showcased:** 29 international tracks

---

### Q18: What is DRS and how does it affect overtaking?
**Answer:** DRS (Drag Reduction System) is a driver-controlled rear wing flap that opens on designated straights when within 1 second of the car ahead. Opening the flap reduces aerodynamic drag, increasing straight-line speed by 10–12 km/h to promote overtaking. Tracks with 3 or 4 DRS zones show significantly higher overtake numbers.

---

### Q19: What is the role of SQLite in your project?
**Answer:** We compiled the cleaned relational tables into `f1_database.sqlite`. SQLite provides ACID-compliant relational querying, indexed fast lookups, and allows running SQL queries (`SELECT COUNT(*) FROM race_results`) during verification tests.

---

### Q20: What is the 2026 Formula 1 regulation change?
**Answer:** The 2026 regulations represent a major powertrain and aerodynamic shift:
- 50% internal combustion engine + 50% electrical MGU-K power (350kW electric boost).
- Removal of the complex MGU-H.
- Mandatory 100% sustainable fuels.
- Active aerodynamics (straight-line low-drag mode and cornering high-downforce mode).

---

### Q21: What are the 9 Story Scenes in the Tableau Story?
**Answer:**
1. Global Scale Overview (KPIs)
2. Geographic Grand Prix Distribution Map
3. Driver Reliability & DNF Breakdown
4. Individual Driver Performance Leaderboard
5. Team Performance Ranking
6. Season-by-Season Championship Evolution
7. Tyre Compound Strategy & Degradation
8. Country-Level Participation Treemap
9. Podium Achievements Packed Bubble Chart

---

### Q22: How did you ensure responsive web design?
**Answer:** We used CSS Grid and Flexbox with media queries at 1200px and 868px breakpoints, responsive canvas containers with auto-resizing event listeners in Three.js and Chart.js, and touch-friendly UI controls.

---

### Q23: How are automated tests implemented?
**Answer:** In `tests/test_pipeline.py`, automated assertions check:
- Exactly 6,464 rows in `race_results.csv`.
- Exactly 41 columns.
- Correct DNF null-imputation rules.
- 29 circuits in catalog.
- Validity of `.twb` XML and `.twbx` ZIP archive.
- SQLite SQL queries.

---

### Q24: What were the biggest engineering challenges you encountered?
**Answer:**
1. Ensuring mathematical consistency across both the web app and Tableau.
2. Managing Three.js WebGL performance so 3D rendering runs smoothly at 60 FPS alongside Chart.js canvases.
3. Modeling complex motorsport rules like DNF nulls and cumulative running points without external third-party build tools.

---

### Q25: How would you summarize the value of this project in one sentence?
**Answer:** This project proves that complex engineering and motorsport telemetry can be transformed into an intuitive, visually captivating, and scientifically defensible analytical platform using a clean combination of Python data engineering, Tableau business intelligence, and 3D WebGL technology.
