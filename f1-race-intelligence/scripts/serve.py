"""
FORMULA 1 RACE INTELLIGENCE - HIGH-PERFORMANCE LOCAL SERVER & REST API
Zero-dependency Python 3 HTTP server serving the 3D analytics platform,
providing dynamic REST API endpoints for race filtering, and serving Tableau deliverables.
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import pandas as pd

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

PORT = 8000
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DATA_PROCESSED = os.path.join(BASE_DIR, "data", "processed")
TABLEAU_DIR = os.path.join(BASE_DIR, "tableau")

print(f"[Server] Base directory: {BASE_DIR}")
print(f"[Server] Frontend directory: {FRONTEND_DIR}")

# Cache master dataframes for instant API response
print("[Server] Pre-loading datasets into memory...")
try:
    df_race_results = pd.read_csv(os.path.join(DATA_PROCESSED, "race_results.csv"))
    df_circuits = pd.read_csv(os.path.join(DATA_PROCESSED, "circuits.csv"))
    df_champ = pd.read_csv(os.path.join(DATA_PROCESSED, "championship_standings.csv"))
    df_lap = pd.read_csv(os.path.join(DATA_PROCESSED, "lap_intelligence.csv"))
    with open(os.path.join(DATA_PROCESSED, "summary_kpis.json"), "r", encoding="utf-8") as f:
        summary_kpis = json.load(f)
    with open(os.path.join(DATA_PROCESSED, "driver_profiles.json"), "r", encoding="utf-8") as f:
        driver_profiles = json.load(f)
    with open(os.path.join(DATA_PROCESSED, "constructor_profiles.json"), "r", encoding="utf-8") as f:
        constructor_profiles = json.load(f)
    with open(os.path.join(DATA_PROCESSED, "circuit_geometries.json"), "r", encoding="utf-8") as f:
        circuit_geometries = json.load(f)
    with open(os.path.join(DATA_PROCESSED, "data_stories.json"), "r", encoding="utf-8") as f:
        data_stories = json.load(f)
    print("[Server] All datasets and metadata successfully loaded in memory.")
except Exception as e:
    print(f"[Server] Warning during pre-load: {e}")

class F1IntelligenceHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. API Endpoints
        if path.startswith("/api/"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            if path == "/api/kpis":
                self.wfile.write(json.dumps(summary_kpis).encode("utf-8"))
            elif path == "/api/drivers":
                self.wfile.write(json.dumps(driver_profiles).encode("utf-8"))
            elif path == "/api/constructors":
                self.wfile.write(json.dumps(constructor_profiles).encode("utf-8"))
            elif path == "/api/circuits":
                self.wfile.write(json.dumps(circuit_geometries).encode("utf-8"))
            elif path == "/api/stories":
                self.wfile.write(json.dumps(data_stories).encode("utf-8"))
            elif path == "/api/race-results":
                # Dynamic filtering
                filtered = df_race_results.copy()
                if "season" in query:
                    try:
                        s_val = int(query["season"][0])
                        filtered = filtered[filtered["season"] == s_val]
                    except ValueError:
                        pass
                if "circuit_id" in query:
                    filtered = filtered[filtered["circuit_id"] == query["circuit_id"][0]]
                if "driver" in query:
                    filtered = filtered[filtered["driver"] == query["driver"][0]]
                if "team" in query:
                    filtered = filtered[filtered["team"] == query["team"][0]]
                
                # Replace NaN with None for valid JSON serialization
                records = filtered.where(pd.notnull(filtered), None).to_dict(orient="records")
                self.wfile.write(json.dumps(records).encode("utf-8"))
            elif path == "/api/telemetry":
                filtered = df_lap.copy()
                if "circuit_id" in query:
                    filtered = filtered[filtered["circuit_id"] == query["circuit_id"][0]]
                if "season" in query:
                    try:
                        filtered = filtered[filtered["season"] == int(query["season"][0])]
                    except ValueError:
                        pass
                records = filtered.head(500).where(pd.notnull(filtered), None).to_dict(orient="records")
                self.wfile.write(json.dumps(records).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"error": "Unknown API endpoint"}).encode("utf-8"))
            return

        # 2. Root Redirect to Frontend
        if path == "/" or path == "/index.html":
            self.path = "/frontend/index.html"

        # 3. Static Files
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def run(port=PORT):
    server_address = ("", port)
    httpd = HTTPServer(server_address, F1IntelligenceHandler)
    print(f"\n========================================================")
    print(f"  🏎️  FORMULA 1 RACE INTELLIGENCE PLATFORM RUNNING")
    print(f"  🌐  Local Web App:   http://localhost:{port}")
    print(f"  📊  Tableau Files:   http://localhost:{port}/tableau/f1_race_intelligence.twbx")
    print(f"  📡  API Status:      http://localhost:{port}/api/kpis")
    print(f"========================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(p)
