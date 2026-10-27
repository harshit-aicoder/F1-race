/**
 * FORMULA 1 RACE INTELLIGENCE - DATA LOADER SERVICE
 * Loads processed datasets via REST API or local fallback, managing cache and state.
 */

class DataLoader {
  constructor() {
    this.apiBase = "";
    this.data = {
      kpis: null,
      drivers: [],
      constructors: [],
      circuits: [],
      stories: [],
      raceResults: [],
      telemetry: []
    };
  }

  async init() {
    // 1. Immediately hydrate from embedded offline data so the page renders with zero wait
    if (typeof window.EMBEDDED_KPIS !== "undefined") {
      this.data.kpis = window.EMBEDDED_KPIS;
      this.data.drivers = window.EMBEDDED_DRIVERS || [];
      this.data.constructors = window.EMBEDDED_CONSTRUCTORS || [];
      this.data.circuits = window.EMBEDDED_CIRCUITS || [];
      this.data.stories = window.EMBEDDED_STORIES || [];
      this.data.raceResults = window.EMBEDDED_RACE_SAMPLE || [];
      window.f1Data = this.data;
    }

    // 2. If running under HTTP server, seamlessly upgrade with fresh live API data
    const isHttp = window.location.protocol.startsWith("http");
    if (isHttp) {
      try {
        console.log("[DataLoader] Querying local REST API for live data updates...");
        const [kpisRes, driversRes, teamsRes, circuitsRes, storiesRes] = await Promise.all([
          fetch("/api/kpis").catch(() => null),
          fetch("/api/drivers").catch(() => null),
          fetch("/api/constructors").catch(() => null),
          fetch("/api/circuits").catch(() => null),
          fetch("/api/stories").catch(() => null)
        ]);

        if (kpisRes && kpisRes.ok) this.data.kpis = await kpisRes.json();
        if (driversRes && driversRes.ok) this.data.drivers = await driversRes.json();
        if (teamsRes && teamsRes.ok) this.data.constructors = await teamsRes.json();
        if (circuitsRes && circuitsRes.ok) this.data.circuits = await circuitsRes.json();
        if (storiesRes && storiesRes.ok) this.data.stories = await storiesRes.json();

        const raceRes = await fetch("/api/race-results?season=2026").catch(() => null);
        if (raceRes && raceRes.ok) {
          this.data.raceResults = await raceRes.json();
        }
      } catch (err) {
        console.warn("[DataLoader] API fetch notice:", err);
      }
    }

    window.f1Data = this.data;
    console.log("[DataLoader] Master datasets ready:", this.data);
    return this.data;
  }

  async fetchFilteredResults(season, circuitId, team, driver) {
    let url = "/api/race-results?";
    const params = [];
    if (season && season !== "all") params.push(`season=${encodeURIComponent(season)}`);
    if (circuitId && circuitId !== "all") params.push(`circuit_id=${encodeURIComponent(circuitId)}`);
    if (team && team !== "all") params.push(`team=${encodeURIComponent(team)}`);
    if (driver && driver !== "all") params.push(`driver=${encodeURIComponent(driver)}`);

    url += params.join("&");
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("[DataLoader] Filtered fetch error:", e);
    }
    return [];
  }

  async fetchTelemetry(circuitId, season) {
    let url = `/api/telemetry?circuit_id=${encodeURIComponent(circuitId || "monza")}`;
    if (season) url += `&season=${encodeURIComponent(season)}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("[DataLoader] Telemetry fetch error:", e);
    }
    return [];
  }
}

window.dataLoader = new DataLoader();
