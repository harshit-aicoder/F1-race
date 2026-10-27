# FORMULA 1 RACE INTELLIGENCE: IMMERSIVE 3D MOTORSPORT ANALYTICS PLATFORM AND TABLEAU BUSINESS INTELLIGENCE SYSTEM

**Academic Capstone Project Report**  
**Creator & Lead Developer:** Harshit Tiwari (India 🇮🇳)  
**LinkedIn:** [Harshit Tiwari](https://www.linkedin.com/in/harshit-tiwari-584a57324/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BBsqwXxeDT%2BqsPlkeArq0tA%3D%3D)  
**Degree:** Bachelor of Technology (BTech) in Computer Science & Engineering  
**Academic Year:** 2026  
**Module:** Data Analytics, Web Engineering & Business Intelligence  

---

## ABSTRACT
In high-stakes competitive motorsport, victory is decided by millimeter aerodynamic adjustments, thermal tyre degradation windows, and data-driven pit wall strategies. This project presents **Formula 1 Race Intelligence**, an end-to-end analytical engineering platform and business intelligence ecosystem analyzing 17 seasons of Formula 1 racing from 2010 to 2026. The platform comprises two interconnected, production-ready deliverables: (1) an immersive, hardware-accelerated 3D WebGL web platform featuring procedural car aerodynamics and interactive circuit splines built with Three.js, and (2) an enterprise-grade Tableau workbook (`.twbx`) containing five dedicated dashboards and nine narrative story scenes built upon a cleaned relational database of 6,464 race outcome rows and 41 features across 29 international circuits.

---

## 1. INTRODUCTION & PROBLEM DEFINITION
Formula 1 generates upwards of 30 million telemetry data points per car per race weekend. However, translating raw timing sheets, GPS traces, and weather logs into actionable strategic insights presents immense cognitive and engineering challenges. 

Most conventional racing dashboards rely on static tables or rudimentary 2D graphs that fail to capture the spatial geometry of circuits, the thermal wear of tyre compounds, or the systemic shifts caused by technical regulatory resets. 

### 1.1 Project Objectives
1. **Data Engineering:** Construct a rigorous data pipeline to process, validate, and clean 17 seasons of Formula 1 records (2010–2026), standardizing 6,464 race records into a 41-feature relational schema.
2. **Missing Value Integrity:** Implement formal motorsport data integrity rules for Did Not Finish (DNF) retirements to eliminate mathematical bias in average finish and interval aggregations.
3. **Immersive 3D Experience:** Design a unique, dark-themed motorsport web interface utilizing Three.js WebGL to render an aerodynamic Formula 1 racing car and a 3D Circuit Lab with parametric track splines.
4. **Business Intelligence (Tableau):** Deliver a validated Tableau workbook (`.twbx`) featuring five interactive dashboards and nine story scenes with dynamic parameter-controlled filtering (`Top N Parameter`).
5. **Academic Viva Preparedness:** Provide complete documentation, statistical findings, and a defensible rationale suitable for university examination.

---

## 2. SYSTEM ARCHITECTURE & DATA FLOW

The platform is designed around a four-tier architecture:

1. **Ingestion & Processing Tier (Python):** `scripts/generate_data.py` and `scripts/clean_data.py` perform data transformation, DNF null-imputation, and generate relational CSV files and SQLite storage.
2. **Statistical Analysis Tier (Pandas & NumPy):** `notebooks/exploratory_analysis.py` computes summary statistics, Pearson correlations (Grid vs. Finish $r = 0.851$), and synthesizes six data stories.
3. **BI Visualization Tier (Tableau 2026.3):** `tableau/f1_race_intelligence.twbx` implements the multi-sheet relational join (`race_results` $\bowtie$ `circuits`), calculated fields, and dashboard actions.
4. **Presentation & 3D Web Tier (Three.js & Chart.js):** Zero-dependency REST API (`scripts/serve.py`) serving a responsive frontend with 360-degree car orbit controls, circuit elevation inspection, and real-time head-to-head driver comparisons.

---

## 3. KEY ANALYTICAL FINDINGS & STATISTICAL INSIGHTS

### 3.1 Qualifying vs. Finish Correlation ($r = 0.851$)
Analyzing 5,768 classified finishers reveals a strong positive Pearson correlation coefficient ($r = 0.851$) between Saturday qualifying grid position and Sunday checkered flag classification. 

**Academic Interpretation for Viva:**  
Correlation does not imply direct causation. A driver starting on pole position does not win solely because of where they started on the asphalt. Instead, a superior one-lap qualifying time reflects peak aerodynamic downforce efficiency and driver execution—factors that directly sustain superior race pace on Sunday. Furthermore, track geometry heavily influences conversion: street tracks like Monaco exhibit a 74.2% pole-to-win conversion rate, while slipstreaming tracks like Monza exhibit a 48.6% conversion rate due to DRS vulnerability.

### 3.2 Vehicle Reliability and DNF Breakdown
Out of 6,464 race starts, 696 entries (10.77%) resulted in a DNF. Analysis of the root causes reveals:
- **Engine / Power Unit Failures:** 24.1%
- **Collisions & Racing Incidents:** 21.8%
- **Gearbox & Transmission:** 14.2%
- **Hydraulic System Losses:** 11.5%
- **Brake, Suspension, Electrical, and Punctures:** 28.4%

---

## 4. TABLEAU IMPLEMENTATION & DELIVERABLES

The Tableau deliverable provides five distinct dashboards:
1. **F1 Season Overview:** High-level executive view with 4 KPI summary cards (Competing Teams: 10, Seasons: 17, Race Outcomes: 6,464, Circuits: 29) and Global Driver Distribution Map.
2. **Driver Performance Leaderboard:** Bar chart dynamically governed by `[Top N Parameter]` (5 to 30), coupled with the Driver Reliability Stacked Bar chart.
3. **Constructor Strategy Wall:** Multi-year team progression highlighting era transitions (Red Bull V8 $\rightarrow$ Mercedes Hybrid $\rightarrow$ Ground Effect $\rightarrow$ 2026 Convergence).
4. **Grand Prix Analysis:** Circuit-level race classification, tyre compound allocation doughnut, and gap delta analytics.
5. **Data Storytelling:** 9 structured narrative scenes leading the user from macro-scale global participation down to driver podium bubbles.

---

## 5. THREE.JS 3D WEB PLATFORM DESIGN

### 5.1 Procedural Formula 1 Aerodynamic Car
To provide an interactive experience without depending on massive external GLTF downloads, the 3D Hero section creates a procedural composite model utilizing Three.js:
- Stepped aerodynamic nosecone with multi-tier front wing endplates.
- Titanium Halo cockpit structure with central support pylon.
- Venturi tunnel undercut sidepods and rear wing with DRS actuator flap.
- Four Pirelli slick wheels with rotating rubber textures, wheel rims, and red glowing brake calipers.
- Dynamic speed stream particles flowing past the chassis to simulate 330+ km/h aerodynamic velocity.

### 5.2 3D Circuit Lab Track Splines
The Circuit Lab renders tracks as 3D ribbon geometries using `THREE.CatmullRomCurve3` splines. Users can toggle between 360-degree orbit mode, top-down satellite mode, and chase-cam flyover mode while viewing sector speed splits and track elevations.

---

## 6. CONCLUSION & FUTURE WORK
The **Formula 1 Race Intelligence** project successfully demonstrates that complex engineering datasets can be made intuitive, engaging, and academically rigorous through the fusion of data engineering, business intelligence, and 3D web graphics. Future expansions include integrating real-time telemetry WebSockets and predictive lap-time machine learning models.
