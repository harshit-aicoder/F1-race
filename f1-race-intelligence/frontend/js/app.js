/**
 * FORMULA 1 RACE INTELLIGENCE - APPLICATION COORDINATOR
 * Orchestrates views, cross-filtering, comparisons, and interactive sections.
 */

class F1App {
  constructor() {
    this.currentTopN = 10;
    this.selectedSeason = "all";
    this.selectedTeam = "all";
    this.selectedDriver = "all";
    this.selectedCircuit = "all";

    this.driverA = "Lewis Hamilton";
    this.driverB = "Max Verstappen";
  }

  async start() {
    console.log("[F1App] Initializing F1 Race Intelligence platform...");

    // 1. Fetch data
    const data = await window.dataLoader.init();

    // 2. Populate KPI cards
    this.renderKpis(data.kpis);

    // 3. Populate Filters
    this.setupFilters(data);

    // 4. Render All Visualizations
    this.renderAllCharts(data);

    // 5. Initialize Driver Comparison (Head-to-Head)
    this.setupDriverComparison(data.drivers);

    // 6. Initialize Grand Prix Explorer
    this.setupGrandPrixExplorer(data);

    // 7. Initialize Data Stories
    this.renderDataStories(data.stories);

    // 8. Initialize Viva Accordion & Search
    this.setupVivaSection();

    // 9. Navigation Router
    this.setupNavigation();

    console.log("[F1App] Platform fully operational!");
  }

  renderKpis(kpis) {
    if (!kpis) return;
    const teamsEl = document.getElementById("kpi-teams");
    const seasonsEl = document.getElementById("kpi-seasons");
    const outcomesEl = document.getElementById("kpi-outcomes");
    const circuitsEl = document.getElementById("kpi-circuits");

    if (teamsEl) teamsEl.textContent = kpis.competing_teams;
    if (seasonsEl) seasonsEl.textContent = kpis.seasons_in_play;
    if (outcomesEl) outcomesEl.textContent = kpis.race_outcomes_logged.toLocaleString();
    if (circuitsEl) circuitsEl.textContent = kpis.circuits_showcased;

    const heroSubtitle = document.getElementById("hero-sub-stats");
    if (heroSubtitle) {
      heroSubtitle.textContent = `Analyzing ${kpis.race_outcomes_logged.toLocaleString()} race results across ${kpis.seasons_in_play} seasons (${kpis.era_span}) and ${kpis.circuits_showcased} international circuits.`;
    }
  }

  setupFilters(data) {
    const seasonSelect = document.getElementById("filter-season");
    const teamSelect = document.getElementById("filter-team");
    const topNSlider = document.getElementById("filter-top-n");
    const topNVal = document.getElementById("top-n-display");
    const resetBtn = document.getElementById("filter-reset");

    // Populate Season dropdown
    if (seasonSelect && data.kpis && data.kpis.seasons_list) {
      seasonSelect.innerHTML = `<option value="all">All Seasons (2010 - 2026)</option>`;
      data.kpis.seasons_list.forEach((s) => {
        seasonSelect.innerHTML += `<option value="${s}">Season ${s}</option>`;
      });
      seasonSelect.addEventListener("change", (e) => {
        this.selectedSeason = e.target.value;
        this.applyFilters();
      });
    }

    // Populate Team dropdown
    if (teamSelect && data.constructors) {
      teamSelect.innerHTML = `<option value="all">All Constructors (10 Teams)</option>`;
      data.constructors.forEach((t) => {
        teamSelect.innerHTML += `<option value="${t.team}">${t.team}</option>`;
      });
      teamSelect.addEventListener("change", (e) => {
        this.selectedTeam = e.target.value;
        this.applyFilters();
      });
    }

    // Top N slider
    if (topNSlider) {
      topNSlider.addEventListener("input", (e) => {
        this.currentTopN = parseInt(e.target.value);
        if (topNVal) topNVal.textContent = this.currentTopN;
        if (window.f1Data && window.f1Data.drivers) {
          window.chartEngine.renderDriverLeaderboard(window.f1Data.drivers, this.currentTopN);
          window.chartEngine.renderDriverReliability(window.f1Data.drivers, this.currentTopN);
        }
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (seasonSelect) seasonSelect.value = "all";
        if (teamSelect) teamSelect.value = "all";
        if (topNSlider) {
          topNSlider.value = 10;
          this.currentTopN = 10;
          if (topNVal) topNVal.textContent = 10;
        }
        this.selectedSeason = "all";
        this.selectedTeam = "all";
        this.applyFilters();
      });
    }
  }

  async applyFilters() {
    console.log(`[F1App] Applying filters: Season=${this.selectedSeason}, Team=${this.selectedTeam}`);
    const filteredResults = await window.dataLoader.fetchFilteredResults(
      this.selectedSeason,
      this.selectedCircuit,
      this.selectedTeam,
      this.selectedDriver
    );

    // Update scatter
    if (filteredResults && filteredResults.length > 0) {
      window.chartEngine.renderQualiVsFinishScatter(filteredResults);
    }
  }

  renderAllCharts(data) {
    if (!window.chartEngine) return;

    if (data.drivers && data.drivers.length > 0) {
      window.chartEngine.renderDriverLeaderboard(data.drivers, this.currentTopN);
      window.chartEngine.renderDriverReliability(data.drivers, this.currentTopN);
      window.chartEngine.renderPodiumsBubble(data.drivers);
    }

    if (data.constructors && data.constructors.length > 0) {
      window.chartEngine.renderTeamPerformance(data.constructors);
      window.chartEngine.renderTeamProgression(data.constructors);
    }

    if (data.circuits && data.circuits.length > 0) {
      window.chartEngine.renderCircuitElevation(data.circuits);
      window.chartEngine.renderCircuitDirection(data.circuits);
      this.populateCircuitLabDropdown(data.circuits);
    }

    window.chartEngine.renderTyreDistribution();

    if (data.raceResults && data.raceResults.length > 0) {
      window.chartEngine.renderQualiVsFinishScatter(data.raceResults);
    }

    // Load Telemetry sample for Monza
    window.dataLoader.fetchTelemetry("monza", 2026).then((telemetry) => {
      if (telemetry && telemetry.length > 0) {
        window.chartEngine.renderTelemetryPace(telemetry);
      }
    });
  }

  populateCircuitLabDropdown(circuits) {
    const sel = document.getElementById("circuit-lab-select");
    if (!sel || !circuits) return;

    sel.innerHTML = circuits.map((c) => `<option value="${c.circuit_id}">${c.circuit_name} (${c.city}, ${c.country})</option>`).join("");
    sel.value = "monza";
    if (window.circuitLab3D) {
      window.circuitLab3D.updateCircuitCardInfo("monza");
    }
  }

  setupDriverComparison(drivers) {
    const selA = document.getElementById("h2h-select-a");
    const selB = document.getElementById("h2h-select-b");
    if (!selA || !selB || !drivers) return;

    // Populate dropdowns
    const driverOptions = drivers.map((d) => `<option value="${d.driver}">${d.driver} (${d.current_team})</option>`).join("");
    selA.innerHTML = driverOptions;
    selB.innerHTML = driverOptions;

    selA.value = "Lewis Hamilton";
    selB.value = "Max Verstappen";

    const updateH2H = () => {
      const drvA = drivers.find((d) => d.driver === selA.value);
      const drvB = drivers.find((d) => d.driver === selB.value);
      if (!drvA || !drvB) return;

      // Update names & numbers
      document.getElementById("h2h-name-a").textContent = drvA.driver;
      document.getElementById("h2h-team-a").textContent = drvA.current_team;
      document.getElementById("h2h-num-a").textContent = `#${drvA.number} • ${drvA.nationality}`;

      document.getElementById("h2h-name-b").textContent = drvB.driver;
      document.getElementById("h2h-team-b").textContent = drvB.current_team;
      document.getElementById("h2h-num-b").textContent = `#${drvB.number} • ${drvB.nationality}`;

      // Update metrics
      this.updateMetricRow("wins", drvA.wins, drvB.wins);
      this.updateMetricRow("podiums", drvA.podiums, drvB.podiums);
      this.updateMetricRow("points", drvA.total_points, drvB.total_points);
      this.updateMetricRow("winrate", `${drvA.win_rate}%`, `${drvB.win_rate}%`, drvA.win_rate, drvB.win_rate);
      this.updateMetricRow("dnfrate", `${drvA.dnf_rate}%`, `${drvB.dnf_rate}%`, 100 - drvA.dnf_rate, 100 - drvB.dnf_rate);
      this.updateMetricRow("avgfinish", `P${drvA.avg_finish || 10}`, `P${drvB.avg_finish || 10}`, 22 - (drvA.avg_finish || 10), 22 - (drvB.avg_finish || 10));
    };

    selA.addEventListener("change", updateH2H);
    selB.addEventListener("change", updateH2H);
    updateH2H();
  }

  updateMetricRow(key, valA, valB, numA = null, numB = null) {
    const elA = document.getElementById(`h2h-val-a-${key}`);
    const elB = document.getElementById(`h2h-val-b-${key}`);
    const barA = document.getElementById(`h2h-bar-a-${key}`);
    const barB = document.getElementById(`h2h-bar-b-${key}`);

    if (elA) elA.textContent = valA;
    if (elB) elB.textContent = valB;

    const nA = numA !== null ? numA : parseFloat(valA) || 0;
    const nB = numB !== null ? numB : parseFloat(valB) || 0;
    const total = nA + nB || 1;
    const pctA = ((nA / total) * 100).toFixed(1);
    const pctB = (100 - pctA).toFixed(1);

    if (barA) barA.style.width = `${pctA}%`;
    if (barB) barB.style.width = `${pctB}%`;
  }

  setupGrandPrixExplorer(data) {
    const gpSeason = document.getElementById("gp-select-season");
    const gpCircuit = document.getElementById("gp-select-circuit");
    const gpTableBody = document.getElementById("gp-table-body");

    if (gpSeason && data.kpis && data.kpis.seasons_list) {
      gpSeason.innerHTML = data.kpis.seasons_list.map((s) => `<option value="${s}">Season ${s}</option>`).join("");
      gpSeason.value = "2026";
    }

    if (gpCircuit && data.circuits) {
      gpCircuit.innerHTML = data.circuits.map((c) => `<option value="${c.circuit_id}">${c.circuit_name} (${c.country})</option>`).join("");
      gpCircuit.value = "monza";
    }

    const loadGrandPrix = async () => {
      const s = gpSeason ? gpSeason.value : 2026;
      const c = gpCircuit ? gpCircuit.value : "monza";
      const results = await window.dataLoader.fetchFilteredResults(s, c);

      if (!results || results.length === 0) {
        if (gpTableBody) gpTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No race records found for this selection.</td></tr>`;
        return;
      }

      // Sort by finish position (finishers first, then DNFs)
      results.sort((a, b) => {
        if (a.finish_position === null) return 1;
        if (b.finish_position === null) return -1;
        return a.finish_position - b.finish_position;
      });

      // Update Winner Box
      const winner = results[0];
      const winNameEl = document.getElementById("gp-winner-name");
      const winTeamEl = document.getElementById("gp-winner-team");
      const winGapEl = document.getElementById("gp-winner-gap");
      if (winner) {
        if (winNameEl) winNameEl.textContent = winner.driver;
        if (winTeamEl) winTeamEl.textContent = winner.team;
        if (winGapEl) winGapEl.textContent = `Fastest Lap: ${winner.fastest_lap_time} (P1 Grid: ${winner.grid_position})`;
      }

      // Populate Table
      if (gpTableBody) {
        gpTableBody.innerHTML = results.map((r, idx) => {
          const posDisplay = r.finish_position !== null ? `P${r.finish_position}` : `<span style="color:#EF4444; font-weight:700;">DNF</span>`;
          const changeVal = r.position_change;
          let changeBadge = "-";
          if (changeVal > 0) changeBadge = `<span style="color:#10B981;">+${changeVal} ▲</span>`;
          else if (changeVal < 0) changeBadge = `<span style="color:#EF4444;">${changeVal} ▼</span>`;
          else if (changeVal === 0) changeBadge = `<span style="color:#94A3B8;">0 ▬</span>`;

          const statusDisplay = r.status === "DNF" ? `${r.status} (${r.dnf_reason})` : (r.gap_to_leader_s === 0 ? "Winner" : `+${r.gap_to_leader_s}s`);

          return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 0.85rem 1rem; font-weight: 800; font-family: var(--font-heading);">${posDisplay}</td>
              <td style="padding: 0.85rem 1rem; font-weight: 700; color: #FFFFFF;">${r.driver} <span style="font-size: 0.75rem; color: #64748B;">#${r.driver_number}</span></td>
              <td style="padding: 0.85rem 1rem; color: #94A3B8;">${r.team}</td>
              <td style="padding: 0.85rem 1rem;">P${r.grid_position}</td>
              <td style="padding: 0.85rem 1rem;">${changeBadge}</td>
              <td style="padding: 0.85rem 1rem; font-family: var(--font-mono); font-size: 0.82rem;">${statusDisplay}</td>
              <td style="padding: 0.85rem 1rem; font-weight: 800; color: #00F5D4;">+${r.points}</td>
            </tr>
          `;
        }).join("");
      }
    };

    if (gpSeason) gpSeason.addEventListener("change", loadGrandPrix);
    if (gpCircuit) gpCircuit.addEventListener("change", loadGrandPrix);
    loadGrandPrix();
  }

  renderDataStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container || !stories) return;

    container.innerHTML = stories.map((s, idx) => `
      <div class="story-card">
        <div class="story-num">Story 0${idx + 1} • ${s.supporting_metric}</div>
        <h3 class="story-heading">${s.title}</h3>
        <div class="story-question">🔍 Research Question: "${s.question}"</div>
        <div class="story-body">${s.observation}</div>
        <div class="story-body" style="color: #CBD5E1;"><strong>Strategic Interpretation:</strong> ${s.interpretation}</div>
        <div class="story-conclusion">
          <strong>Key Academic Takeaway:</strong> ${s.conclusion}
        </div>
      </div>
    `).join("");
  }

  setupVivaSection() {
    const listEl = document.getElementById("viva-list");
    const searchInput = document.getElementById("viva-search");
    if (!listEl) return;

    const vivaQuestions = [
      {
        q: "1. What is the overall architecture and data flow of this project?",
        a: "The project uses a 4-tier decoupled architecture: (1) Data Engineering Pipeline in Python extracting and transforming 6,464 race records into 5 relational tables; (2) Data Validation & Metric Engine enforcing DNF null rules and calculating running cumulative points; (3) High-performance zero-dependency REST API server; (4) Interactive 3D Web Platform with Three.js WebGL and responsive Chart.js analytics, alongside a dedicated Tableau Desktop/Public .twbx workbook."
      },
      {
        q: "2. Why are 17 seasons (2010 to 2026) covered in this study?",
        a: "Spanning 2010 to 2026 captures four distinct Formula 1 aerodynamic and engine regulatory cycles: (1) 2010–2013 V8 Red Bull Era; (2) 2014–2020 1.6L V6 Turbo Hybrid Mercedes Era; (3) 2021–2023 Ground Effect Red Bull Era; (4) 2024–2026 Multi-Team Convergence and New Active Power Unit Regulations."
      },
      {
        q: "3. How were missing values and DNFs handled during data preparation?",
        a: "In accordance with motorsport data integrity standards, DNF entries retain 'finish_position' and 'gap_to_leader_s' as NULL to prevent mathematical skew in average finish and gap aggregations. Crucially, 'dnf_flag' is set to 1 and 'dnf_reason' is populated across 9 root-cause failure categories to enable the Driver Reliability Analysis."
      },
      {
        q: "4. What is the difference between correlation and causation in the qualifying analysis?",
        a: "Qualifying position and finish position exhibit a strong correlation (r = 0.85). However, starting P1 does not mechanically cause victory. Both Saturday pace and Sunday victory stem from shared root causes: aerodynamic efficiency, tire degradation management, and driver skill. In addition, pit strategy, undercuts, and safety cars act as independent variables."
      },
      {
        q: "5. How does the Tableau workbook connect to the data?",
        a: "The Tableau workbook utilizes Tableau's logical layer relationships. The primary fact table 'race_results' is connected to 'circuits' via 'circuit_id' to inherit track metadata. 'championship_standings' is kept as an independent sheet to evaluate constructor points over time without duplicate row counting."
      },
      {
        q: "6. What calculated fields and parameters did you implement in Tableau?",
        a: "We implemented: (1) [Top N Parameter] (Integer 5-30) to dynamically filter driver rankings; (2) [DNF Count] = SUM([dnf_flag]); (3) [Points Cumulative] = RUNNING_SUM(SUM([points])) computed along race rounds; (4) [Top N Filter] = INDEX() <= [Top N Parameter]; (5) [Pole Position Win Conversion Rate]."
      },
      {
        q: "7. Why did you choose Three.js for the 3D car and circuit visualization?",
        a: "Three.js provides native hardware-accelerated WebGL rendering in the browser without plugins. It allows real-time camera orbits, custom PBR (Physically Based Rendering) carbon-fiber shaders, dynamic spotlights, and procedural spline extrusion for the 3D race tracks."
      },
      {
        q: "8. What is the significance of tire compound degradation in race strategy?",
        a: "Soft tires provide an initial pace advantage of ~0.8s over Hard tires, but degrade rapidly (+0.12s/lap degradation slope). Strategic undercuts allow a trailing car to pit early and utilize fresh tire grip to leapfrog competitors who remain on worn rubber."
      },
      {
        q: "9. How did you verify data consistency between the website and Tableau?",
        a: "Both deliverables share identical source CSVs in 'data/processed/'. The total race outcomes (6,464), total circuits (29), total teams (10), driver career points (Lewis Hamilton P1), and DNF counts are verified via automated Python assertions in 'tests/test_pipeline.py'."
      },
      {
        q: "10. What is a DRS zone and how does it impact overtaking statistics?",
        a: "DRS (Drag Reduction System) opens a flap on the rear wing to reduce aerodynamic drag when a trailing car is within 1.0 second of the car ahead. Circuits with 3 or 4 DRS zones (e.g., Bahrain, Melbourne) exhibit significantly higher overtake volumes compared to single-zone tracks."
      },
      {
        q: "11. How does the 3D Circuit Lab construct track geometries?",
        a: "The Circuit Lab utilizes 3D Catmull-Rom parametric splines (`THREE.CatmullRomCurve3`). It samples 240 vertices along the spline and extrudes bilateral ribbon faces with surface normals and sector color gradients (Sector 1: Yellow, Sector 2: Cyan, Sector 3: Red)."
      },
      {
        q: "12. What are the 9 visual sheets required in the Tableau specification?",
        a: "The 9 visualizations are: (1) 4 KPI Summary Cards; (2) Global Driver Distribution Map; (3) Driver Reliability Stacked Bar; (4) Driver Performance Leaderboard; (5) Team Performance Ranking; (6) Team Championship Progression Grouped Bar; (7) Tyre Compound Usage Pie Chart; (8) Country Participation Treemap; (9) Podium Achievements Packed Bubble Chart."
      },
      {
        q: "13. Can you explain the Ground Effect regulation change of 2022?",
        a: "In 2022, Formula 1 transitioned from upper-body vortex aerodynamic surfaces to underfloor Venturi tunnels ('Ground Effect'). This channeled underbody airflow to generate downforce while dramatically reducing turbulent aerodynamic wake ('dirty air'), enabling closer wheel-to-wheel racing."
      },
      {
        q: "14. How does the platform handle low-power or mobile devices?",
        a: "The application employs responsive CSS grid breakpoints, hardware-accelerated canvas sizing, and a graceful WebGL fallback that disables intensive particle loops if the device lacks sufficient GPU memory."
      },
      {
        q: "15. What are the key features of the 2026 regulations modeled in this project?",
        a: "The 2026 regulations mandate 50% internal combustion and 50% electrical MGU-K power (350kW boost), active aerodynamics (straight-line low-drag mode), and 100% sustainable fuels."
      },
      {
        q: "16. How is the Head-to-Head Driver comparison calculated?",
        a: "The comparison engine pulls career metrics for Driver A and Driver B, computing win percentage, podium conversion rate, average grid, average finish, and DNF rate, rendering dual animated progress bars with proportional color fills."
      },
      {
        q: "17. What database was used, and why is SQLite included alongside CSVs?",
        a: "SQLite (`f1_database.sqlite`) is included for zero-latency relational SQL queries with indexing across `race_results`, `circuits`, and `championship_standings`, while CSVs provide direct connectivity for Tableau Desktop and Excel."
      },
      {
        q: "18. What is the purpose of the packaged workbook (.twbx)?",
        a: "A `.twbx` is an encrypted ZIP archive that packages both the `.twb` XML structure and the underlying data extracts in a single portable file, allowing any user with Tableau Desktop or Tableau Reader to open it without broken file paths."
      },
      {
        q: "19. What is an undercut versus an overcut in Grand Prix strategy?",
        a: "An undercut occurs when a driver pits a lap earlier than their rival, exploiting the superior grip of new tires on the out-lap to gain track position. An overcut occurs when a driver stays out on clean air while the opponent gets stuck in traffic after pitting."
      },
      {
        q: "20. How would you defend the validity of this project to an external viva examiner?",
        a: "I would emphasize that this project bridges the entire data lifecycle: from raw relational data engineering (6,464 race results, 41 features) to statistical EDA, automated Tableau BI packaging, and an original 3D WebGL web platform adhering to professional motorsport design standards."
      }
    ];

    const renderQuestions = (filterText = "") => {
      const qLower = filterText.toLowerCase();
      const filtered = vivaQuestions.filter((item) => item.q.toLowerCase().includes(qLower) || item.a.toLowerCase().includes(qLower));

      listEl.innerHTML = filtered.map((item, idx) => `
        <div class="viva-item ${idx === 0 ? 'open' : ''}">
          <div class="viva-question">
            <span>${item.q}</span>
            <span class="viva-arrow">▾</span>
          </div>
          <div class="viva-answer">${item.a}</div>
        </div>
      `).join("");

      // Re-bind click events
      listEl.querySelectorAll(".viva-question").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.parentElement.classList.toggle("open");
        });
      });
    };

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderQuestions(e.target.value);
      });
    }

    renderQuestions();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item a, .nav-brand");
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener("click", () => {
        navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
      });
    }

    // Smooth section scrolling and active state
    window.addEventListener("scroll", () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollY = window.pageYOffset;

      sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute("id");

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll(".nav-item").forEach((li) => {
            li.classList.remove("active");
            const a = li.querySelector(`a[href="#${sectionId}"]`);
            if (a) li.classList.add("active");
          });
        }
      });
    });
  }
}

// Start app
window.addEventListener("DOMContentLoaded", () => {
  window.f1App = new F1App();
  window.f1App.start();
});
