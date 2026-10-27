/**
 * FORMULA 1 RACE INTELLIGENCE - CHART ENGINE
 * Responsive motorsport charts utilizing Chart.js with dark aesthetic,
 * custom tooltips, animated transitions, and telemetry styling.
 */

class ChartEngine {
  constructor() {
    this.charts = {};
    this.teamColors = {
      "Red Bull Racing": "#1E41FF",
      "Mercedes-AMG PETRONAS": "#00D2BE",
      "Scuderia Ferrari": "#E10600",
      "McLaren Formula 1 Team": "#FF8000",
      "Aston Martin Aramco": "#006F62",
      "Alpine F1 Team": "#0090FF",
      "Williams Racing": "#005AFF",
      "Visa Cash App RB": "#6692FF",
      "Stake F1 Team Kick Sauber": "#52E252",
      "Haas F1 Team": "#B6BABD"
    };
  }

  getTeamColor(teamName) {
    return this.teamColors[teamName] || "#94A3B8";
  }

  // 1. Driver Performance Leaderboard (Top N parameter-controlled)
  renderDriverLeaderboard(drivers, topN = 10) {
    const ctx = document.getElementById("chart-driver-leaderboard");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.driverLeaderboard) {
      this.charts.driverLeaderboard.destroy();
    }

    const topDrivers = drivers.slice(0, topN);
    const labels = topDrivers.map((d) => d.driver);
    const points = topDrivers.map((d) => d.total_points);
    const backgroundColors = topDrivers.map((d) => this.getTeamColor(d.current_team));

    this.charts.driverLeaderboard = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Career Points",
            data: points,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderRadius: 6,
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: "y", // Horizontal bar
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(14, 19, 31, 0.95)",
            titleColor: "#FFFFFF",
            bodyColor: "#00F5D4",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            callbacks: {
              afterLabel: (ctx) => {
                const drv = topDrivers[ctx.dataIndex];
                return `Team: ${drv.current_team}\nWins: ${drv.wins} | Podiums: ${drv.podiums}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          },
          y: {
            grid: { display: false },
            ticks: { color: "#FFFFFF", font: { weight: "600" } }
          }
        }
      }
    });
  }

  // 2. Driver Reliability Stacked Bar (by DNF Reason)
  renderDriverReliability(drivers, topN = 10) {
    const ctx = document.getElementById("chart-driver-reliability");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.driverReliability) {
      this.charts.driverReliability.destroy();
    }

    const targetDrivers = drivers.slice(0, topN);
    const labels = targetDrivers.map((d) => d.driver);
    const dnfReasons = [
      "Engine failure", "Collision", "Gearbox", "Mechanical",
      "Hydraulics", "Brake failure", "Electrical", "Suspension", "Puncture"
    ];

    const reasonColors = [
      "#E10600", "#F59E0B", "#8B5CF6", "#00D2BE",
      "#3B82F6", "#EC4899", "#10B981", "#6366F1", "#9CA3AF"
    ];

    const datasets = dnfReasons.map((reason, idx) => {
      const data = targetDrivers.map((d) => (d.dnf_reasons && d.dnf_reasons[reason]) || 0);
      return {
        label: reason,
        data: data,
        backgroundColor: reasonColors[idx % reasonColors.length],
        stack: "dnf_stack",
        borderRadius: 2
      };
    });

    this.charts.driverReliability = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94A3B8", boxWidth: 10, font: { size: 10 } }
          },
          tooltip: {
            backgroundColor: "rgba(14, 19, 31, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: "#FFFFFF", maxRotation: 45, minRotation: 45, font: { size: 10 } }
          },
          y: {
            stacked: true,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          }
        }
      }
    });
  }

  // 3. Team Performance Ranking
  renderTeamPerformance(teams) {
    const ctx = document.getElementById("chart-team-ranking");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.teamRanking) {
      this.charts.teamRanking.destroy();
    }

    const sorted = [...teams].sort((a, b) => b.total_points - a.total_points);
    const labels = sorted.map((t) => t.team);
    const points = sorted.map((t) => t.total_points);
    const colors = sorted.map((t) => this.getTeamColor(t.team));

    this.charts.teamRanking = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Constructor Points",
            data: points,
            backgroundColor: colors,
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const t = sorted[ctx.dataIndex];
                return `Wins: ${t.wins} | Podiums: ${t.podiums}\nPower Unit: ${t.power_unit}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94A3B8" } },
          y: { grid: { display: false }, ticks: { color: "#FFFFFF", font: { weight: "600" } } }
        }
      }
    });
  }

  // 4. Team Championship Progression Across Eras (2010 - 2026)
  renderTeamProgression(teams) {
    const ctx = document.getElementById("chart-team-progression");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.teamProgression) {
      this.charts.teamProgression.destroy();
    }

    const seasons = Array.from({ length: 17 }, (_, i) => 2010 + i);
    // Select top 4 constructors for clean readability
    const topTeams = ["Mercedes-AMG PETRONAS", "Red Bull Racing", "Scuderia Ferrari", "McLaren Formula 1 Team"];

    const datasets = topTeams.map((teamName) => {
      const t = teams.find((x) => x.team === teamName);
      const data = seasons.map((yr) => (t && t.season_points && t.season_points[yr]) || 0);
      const color = this.getTeamColor(teamName);
      return {
        label: teamName,
        data: data,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6
      };
    });

    this.charts.teamProgression = new Chart(ctx, {
      type: "line",
      data: {
        labels: seasons,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "#FFFFFF", boxWidth: 12 } },
          tooltip: {
            backgroundColor: "rgba(14, 19, 31, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1
          }
        },
        scales: {
          x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94A3B8" } },
          y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94A3B8" } }
        }
      }
    });
  }

  // 5. Tyre Compound Usage Distribution
  renderTyreDistribution() {
    const ctx = document.getElementById("chart-tyre-distribution");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.tyreDistribution) {
      this.charts.tyreDistribution.destroy();
    }

    this.charts.tyreDistribution = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Medium (Yellow)", "Hard (White)", "Soft (Red)", "Intermediate (Green)", "Wet (Blue)"],
        datasets: [
          {
            data: [42.4, 31.8, 18.2, 5.2, 2.4],
            backgroundColor: ["#EAB308", "#E2E8F0", "#E10600", "#10B981", "#3B82F6"],
            borderWidth: 0,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#94A3B8", boxWidth: 12 } }
        },
        cutout: "65%"
      }
    });
  }

  // 6. Qualifying Position vs Finish Position Correlation
  renderQualiVsFinishScatter(raceResults) {
    const ctx = document.getElementById("chart-quali-vs-finish");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.qualiVsFinish) {
      this.charts.qualiVsFinish.destroy();
    }

    // Filter finishers
    const finishers = raceResults.filter((r) => r.finish_position !== null && r.grid_position !== null);
    const sample = finishers.slice(0, 300); // 300 sample points for high speed

    const points = sample.map((r) => ({
      x: r.grid_position,
      y: r.finish_position,
      driver: r.driver,
      team: r.team
    }));

    this.charts.qualiVsFinish = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Grand Prix Outcomes",
            data: points,
            backgroundColor: "rgba(0, 210, 190, 0.65)",
            borderColor: "rgba(0, 210, 190, 0.9)",
            pointRadius: 4.5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const p = ctx.raw;
                return `${p.driver} (${p.team}): Grid P${p.x} -> Finished P${p.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Grid Position (Qualifying)", color: "#94A3B8" },
            min: 1,
            max: 22,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          },
          y: {
            title: { display: true, text: "Finish Position (Race Result)", color: "#94A3B8" },
            min: 1,
            max: 22,
            reverse: false,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          }
        }
      }
    });
  }

// 7. Telemetry Lap Degradation Curve
renderTelemetryPace(telemetryData) {
  const ctx = document.getElementById("chart-telemetry-pace");
  
  // Guard clause: Ensure canvas exists, Chart.js is loaded, and valid data is provided
  if (!ctx || typeof Chart === "undefined" || !Array.isArray(telemetryData) || telemetryData.length === 0) {
    return;
  }

  // Safely initialize charts container and destroy existing instance[cite: 3]
  this.charts = this.charts || {};
  if (this.charts.telemetryPace) {
    this.charts.telemetryPace.destroy();
  }

  // Group by driver (up to top 3)[cite: 3]
  const drivers = [...new Set(telemetryData.map(t => t.driver))].slice(0, 3);
  const colors = ["#00F5D4", "#E10600", "#F59E0B"];

  const datasets = drivers.map((dName, idx) => {
    const dLaps = telemetryData
      .filter(t => t.driver === dName)
      .sort((a, b) => a.lap_number - b.lap_number);

    return {
      label: dName,
      data: dLaps.map(l => ({ x: l.lap_number, y: l.lap_time_s })),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length],
      borderWidth: 2,
      tension: 0.2,
      fill: false,
      pointRadius: 2.5
    };
  });

  // Render Chart.js instance[cite: 3]
  this.charts.telemetryPace = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#FFFFFF" }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const point = context.raw;
              return `${context.dataset.label}: ${point?.y?.toFixed(3) ?? 0}s (Lap ${point?.x ?? 0})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: "linear", // Required for numeric {x, y} coordinate objects[cite: 4]
          title: { display: true, text: "Lap Number", color: "#94A3B8" },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#94A3B8", precision: 0 }
        },
        y: {
          title: { display: true, text: "Lap Time (Seconds)", color: "#94A3B8" },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#94A3B8" }
        }
      }
    }
  });
}

  // 8. Podium Achievements Packed Bubble / Scatter
  renderPodiumsBubble(drivers) {
    const ctx = document.getElementById("chart-podiums-bubble");
    if (!ctx || typeof Chart === "undefined") return;

    if (this.charts.podiumsBubble) {
      this.charts.podiumsBubble.destroy();
    }

    const top20 = drivers.slice(0, 20);
    const bubbleData = top20.map((d) => ({
      x: d.wins,
      y: d.podiums,
      r: Math.max(6, Math.min(26, Math.sqrt(d.total_points) * 0.45)),
      driver: d.driver,
      team: d.current_team,
      points: d.total_points
    }));

    this.charts.podiumsBubble = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "Drivers",
            data: bubbleData,
            backgroundColor: bubbleData.map((d) => this.getTeamColor(d.team) + "99"),
            borderColor: bubbleData.map((d) => this.getTeamColor(d.team)),
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const b = ctx.raw;
                return `${b.driver} (${b.team})\nWins: ${b.x} | Podiums: ${b.y} | Points: ${b.points}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Grand Prix Wins", color: "#94A3B8" },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          },
          y: {
            title: { display: true, text: "Total Podiums (P1 - P3)", color: "#94A3B8" },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          }
        }
      }
    });
  }
  // 9. Authentic Circuit Elevation & Altitude Analysis (From User Dataset)
  renderCircuitElevation(circuits) {
    const ctx = document.getElementById("chart-circuit-elevation");
    if (!ctx || typeof Chart === "undefined" || !circuits) return;

    if (this.charts.circuitElevation) {
      this.charts.circuitElevation.destroy();
    }

    // Sort by altitude descending
    const sorted = [...circuits].sort((a, b) => b.altitude_m - a.altitude_m);
    const top15 = sorted.slice(0, 15); // Top 15 circuits by elevation

    const labels = top15.map((c) => `${c.circuit_name} (${c.country})`);
    const altitudes = top15.map((c) => c.altitude_m);
    const bgColors = top15.map((c) => (c.altitude_m >= 1000 ? "#E10600" : c.altitude_m >= 300 ? "#F59E0B" : "#00D2BE"));

    this.charts.circuitElevation = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Track Altitude (Meters Above Sea Level)",
            data: altitudes,
            backgroundColor: bgColors,
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const c = top15[ctx.dataIndex];
                return `City: ${c.city}\nLaps: ${c.laps} (${c.lap_km} km/lap)\nTotal Distance: ${c.total_race_distance_km} km\nDirection: ${c.direction}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Altitude (Meters)", color: "#94A3B8" },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94A3B8" }
          },
          y: {
            grid: { display: false },
            ticks: { color: "#FFFFFF", font: { size: 11, weight: "600" } }
          }
        }
      }
    });
  }

  // 10. Authentic Circuit Type & Direction Distribution (From User Dataset)
  renderCircuitDirection(circuits) {
    const ctx = document.getElementById("chart-circuit-direction");
    if (!ctx || typeof Chart === "undefined" || !circuits) return;

    if (this.charts.circuitDirection) {
      this.charts.circuitDirection.destroy();
    }

    const counts = {};
    circuits.forEach((c) => {
      counts[c.direction] = (counts[c.direction] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    this.charts.circuitDirection = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#E10600", "#00D2BE", "#F59E0B"],
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#94A3B8", boxWidth: 12 } }
        },
        cutout: "60%"
      }
    });
  }
}

window.chartEngine = new ChartEngine();
