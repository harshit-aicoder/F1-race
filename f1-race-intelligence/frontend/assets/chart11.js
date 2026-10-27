// Global variable to track the chart instance and allow redrawing
let telemetryChartInstance = null;

/**
 * Renders the Lap-Time Telemetry Degradation Curve Chart
 * @param {Array} telemetryData - Array of objects: [{ driver: "VER", lap_number: 1, lap_time_s: 82.5 }, ...]
 */
function renderTelemetryPace(telemetryData) {
  const ctx = document.getElementById("chart-telemetry-pace");

  // Guard clause: Ensure element exists, Chart.js is loaded, and telemetry data is present
  if (!ctx || typeof Chart === "undefined" || !Array.isArray(telemetryData) || telemetryData.length === 0) {
    console.warn("Chart rendering skipped: Missing canvas, Chart.js library, or data.");
    return;
  }

  // Destroy previous chart instance to avoid rendering overlaps
  if (telemetryChartInstance) {
    telemetryChartInstance.destroy();
  }

  // Get unique driver names (up to top 3)
  const drivers = [...new Set(telemetryData.map(t => t.driver))].slice(0, 3);
  const colors = ["#00F5D4", "#E10600", "#F59E0B"];

  // Format data for Chart.js
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

  // Render the Chart
  telemetryChartInstance = new Chart(ctx, {
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
          type: "linear", // Essential for coordinate point data (x, y)
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