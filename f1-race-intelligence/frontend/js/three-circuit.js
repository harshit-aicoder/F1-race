/**
 * FORMULA 1 RACE INTELLIGENCE - 3D CIRCUIT LAB
 * Interactive 3D track environment with spline extrusion, elevation contours,
 * DRS zones, sector coding, animated racing car locator, and camera modes.
 */

class CircuitLab3D {
  constructor() {
    this.container = document.getElementById("circuit-canvas-box");
    this.canvas = document.getElementById("circuit-three-canvas");
    this.isInitialized = false;
    this.currentCircuitId = "monza";
    this.cameraMode = "orbit"; // "orbit", "topdown", "chase"

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.trackSpline = null;
    this.trackMesh = null;
    this.carMarker = null;
    this.carProgress = 0;

    // Track Spline Coordinates for user's circuits
    this.circuitSplines = {
      monza: [
        [0, 0, 5], [1, 0, 8], [2.5, 0, 9], [4, 0, 8.5], [5, 0, 6], [4.5, 0.2, 2],
        [4, 0.4, -2], [5.5, 0.6, -5], [6, 0.5, -8], [4, 0.3, -10], [1, 0.1, -9],
        [-2, 0, -8], [-4, 0.1, -5], [-3, 0.1, -1], [-1, 0, 1]
      ],
      silverstone: [
        [0, 0, 6], [2, 0.2, 7.5], [4.5, 0.4, 7], [6, 0.3, 4], [5.5, 0.2, 1],
        [7, 0.1, -2], [6, 0.2, -5], [3, 0.4, -6], [0, 0.3, -4.5], [-2, 0.1, -6],
        [-5, 0.2, -5], [-6, 0.1, -2], [-4, 0, 1], [-2, 0, 4]
      ],
      spa: [
        [0, 0, 6], [1.5, 0.1, 7], [3, 0.3, 7.5], [4, 0.8, 5], [5, 1.4, 2], // Eau Rouge & Raidillon climb!
        [6.5, 1.8, -2], [7, 1.5, -6], [4.5, 1.0, -8], [2, 0.6, -9], [-1, 0.3, -8],
        [-3.5, 0.1, -6], [-5, 0.1, -2], [-3, 0, 2]
      ],
      monaco: [
        [0, 0, 4], [1.5, 0.3, 5], [2.8, 0.6, 4.5], [3.5, 0.8, 2.5], [2.5, 0.5, 0], // Casino climb & Mirabeau
        [1.2, 0.2, -1.5], [0.8, 0.1, -2.5], [1.5, 0, -4], [2.2, 0, -5.5], [1.0, 0, -6.5], // Tunnel & Chicane
        [-1, 0, -6], [-2.5, 0, -4.5], [-2, 0, -2], [-1.2, 0, 1]
      ],
      austria: [
        [0, 0, 4], [1, 0.4, 6], [2.5, 0.8, 7], [4, 1.2, 5.5], [3.5, 0.8, 2], // Turn 1 & 2 steep uphill (Spielberg 678m altitude)
        [4.5, 0.5, -2], [3.8, 0.2, -5], [1.5, 0.1, -6], [-1, 0, -4], [-1.8, 0, 0]
      ],
      suzuka: [
        [0, 0, 5], [2, 0.1, 6], [3.5, 0.3, 4], [2, 0.4, 2], [3.8, 0.5, 0], // S-Curves
        [5, 0.6, -3], [4, 0.5, -6], [1.5, 0.8, -4], [-1, 1.2, -2], // Crossover bridge
        [-3.5, 0.7, -4], [-4.5, 0.4, -7], [-3, 0.2, -9], [-1, 0.1, -8], [-2, 0, -2]
      ],
      mexico: [
        [0, 0, 5], [1.5, 0.1, 7], [3, 0.2, 6], [4.5, 0.1, 3], [5, 0, 0], // High altitude Autodromo Hermanos Rodriguez (2240m)
        [4, 0, -3], [2.5, 0, -6], [0, 0, -7], [-2.5, 0, -5], [-4, 0, -2], [-2, 0, 2]
      ],
      las_vegas: [
        [0, 0, 6], [1, 0, 9], [3, 0, 8.5], [4.5, 0, 4], [3, 0, 0], // Las Vegas Strip Circuit
        [4.5, 0, -4], [3, 0, -8], [0, 0, -9], [-2, 0, -6], [-3.5, 0, -2], [-1.5, 0, 2]
      ]
    };

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    if (typeof THREE === "undefined") {
      console.warn("[CircuitLab3D] Three.js unavailable.");
      return;
    }

    try {
      const width = this.container.clientWidth || 800;
      const height = this.container.clientHeight || 550;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x05070B, 0.025);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.setCameraMode("orbit");

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

      // Lights
      const ambient = new THREE.AmbientLight(0x1A2233, 1.5);
      this.scene.add(ambient);

      const spot = new THREE.SpotLight(0x00D2BE, 3.5, 40, Math.PI / 4, 0.5);
      spot.position.set(0, 20, 10);
      this.scene.add(spot);

      const redLight = new THREE.PointLight(0xE10600, 2.5, 30);
      redLight.position.set(-8, 6, -8);
      this.scene.add(redLight);

      // Ground plane
      const groundGeo = new THREE.PlaneGeometry(80, 80);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x07090E,
        roughness: 0.7,
        metalness: 0.3
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.1;
      this.scene.add(ground);

      // Grid helper on ground
      const grid = new THREE.GridHelper(80, 40, 0x1E293B, 0x0F172A);
      grid.position.y = -0.05;
      this.scene.add(grid);

      // Controls
      if (typeof THREE.OrbitControls !== "undefined") {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
      }

      // Build Initial Track (Monza)
      this.buildTrack("monza");

      // Build Animated Car Marker
      this.buildCarMarker();

      // Listeners
      window.addEventListener("resize", () => this.onWindowResize());
      this.bindControls();

      this.clock = new THREE.Clock();
      this.isInitialized = true;
      this.animate();

      console.log("[CircuitLab3D] 3D Circuit lab successfully mounted.");
    } catch (err) {
      console.error("[CircuitLab3D] Init error:", err);
    }
  }

  buildTrack(circuitId) {
    this.currentCircuitId = circuitId;

    // Remove existing track meshes
    if (this.trackMesh) {
      this.scene.remove(this.trackMesh);
    }
    if (this.kerbMesh) {
      this.scene.remove(this.kerbMesh);
    }
    if (this.gantryMesh) {
      this.scene.remove(this.gantryMesh);
    }

    // Get or fallback spline points
    const pts = this.circuitSplines[circuitId] || this.circuitSplines.monza;
    const vectors = pts.map((p) => new THREE.Vector3(p[0] * 1.6, p[1] * 1.5, p[2] * 1.6));

    this.trackSpline = new THREE.CatmullRomCurve3(vectors, true, "centripetal");

    // Extrude 3D Ribbon Track Geometry
    const trackWidth = 0.85;
    const segments = 240;
    const ribbonGeo = new THREE.BufferGeometry();

    const positions = [];
    const colors = [];
    const normals = [];

    const colorS1 = new THREE.Color(0xF59E0B); // Yellow
    const colorS2 = new THREE.Color(0x00D2BE); // Cyan
    const colorS3 = new THREE.Color(0xE10600); // Red

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = this.trackSpline.getPointAt(t);
      const tangent = this.trackSpline.getTangentAt(t).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const leftP = new THREE.Vector3().copy(point).addScaledVector(normal, trackWidth / 2);
      const rightP = new THREE.Vector3().copy(point).addScaledVector(normal, -trackWidth / 2);

      positions.push(leftP.x, leftP.y, leftP.z);
      positions.push(rightP.x, rightP.y, rightP.z);

      normals.push(0, 1, 0);
      normals.push(0, 1, 0);

      // Assign sector color
      let secColor = colorS1;
      if (t > 0.33 && t <= 0.66) secColor = colorS2;
      else if (t > 0.66) secColor = colorS3;

      colors.push(secColor.r, secColor.g, secColor.b);
      colors.push(secColor.r, secColor.g, secColor.b);
    }

    const indices = [];
    for (let i = 0; i < segments; i++) {
      const idx = i * 2;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }

    ribbonGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    ribbonGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    ribbonGeo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    ribbonGeo.setIndex(indices);

    const ribbonMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.6,
      side: THREE.DoubleSide
    });

    this.trackMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);

    // Start-Finish Gantry Archway at t = 0
    const startPt = this.trackSpline.getPointAt(0);
    const startTan = this.trackSpline.getTangentAt(0).normalize();
    const gantryGeo = new THREE.BoxGeometry(trackWidth * 1.4, 0.15, 0.15);
    const gantryMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    this.gantryMesh = new THREE.Mesh(gantryGeo, gantryMat);
    this.gantryMesh.position.set(startPt.x, startPt.y + 0.8, startPt.z);
    this.scene.add(this.gantryMesh);
  }

  buildCarMarker() {
    this.carMarker = new THREE.Group();

    // Glowing cyan F1 car dot indicator
    const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00F5D4 });
    const sphere = new THREE.Mesh(markerGeo, markerMat);

    // Glowing light halo
    const haloLight = new THREE.PointLight(0x00F5D4, 2.5, 3.5);
    this.carMarker.add(sphere);
    this.carMarker.add(haloLight);

    this.scene.add(this.carMarker);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Move car marker along 3D track spline
    if (this.trackSpline && this.carMarker) {
      this.carProgress = (this.carProgress + delta * 0.08) % 1.0;
      const point = this.trackSpline.getPointAt(this.carProgress);
      const tangent = this.trackSpline.getTangentAt(this.carProgress);

      this.carMarker.position.set(point.x, point.y + 0.18, point.z);

      // Chase Cam mode: lock camera behind car
      if (this.cameraMode === "chase") {
        const offset = new THREE.Vector3().copy(tangent).multiplyScalar(-3.0);
        this.camera.position.set(point.x + offset.x, point.y + 1.8, point.z + offset.z);
        this.camera.lookAt(point.x, point.y + 0.5, point.z);
      }
    }

    if (this.controls && this.cameraMode !== "chase") {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (!this.camera) return;

    if (mode === "orbit") {
      if (this.controls) this.controls.enabled = true;
      this.camera.position.set(0, 18, 22);
      this.camera.lookAt(0, 0, 0);
    } else if (mode === "topdown") {
      if (this.controls) this.controls.enabled = true;
      this.camera.position.set(0, 32, 0.1);
      this.camera.lookAt(0, 0, 0);
    } else if (mode === "chase") {
      if (this.controls) this.controls.enabled = false;
    }
  }

  bindControls() {
    const sel = document.getElementById("circuit-lab-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        const cid = e.target.value;
        this.buildTrack(cid);
        this.updateCircuitCardInfo(cid);
      });
    }

    const camButtons = document.querySelectorAll(".circuit-cam-btn");
    camButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        camButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.setCameraMode(btn.dataset.cam);
      });
    });
  }

  updateCircuitCardInfo(circuitId) {
    // Updates HUD and technical card for selected circuit using authentic user dataset
    if (window.f1Data && window.f1Data.circuits) {
      const c = window.f1Data.circuits.find((x) => x.circuit_id === circuitId);
      if (c) {
        const nameEl = document.getElementById("circuit-hud-name");
        const locEl = document.getElementById("circuit-hud-loc");
        const lenEl = document.getElementById("circuit-stat-len");
        const lapsEl = document.getElementById("circuit-stat-laps");
        const distEl = document.getElementById("circuit-stat-dist");
        const altEl = document.getElementById("circuit-stat-alt");
        const dirEl = document.getElementById("circuit-stat-dir");
        const typeEl = document.getElementById("circuit-stat-type");

        if (nameEl) nameEl.textContent = c.circuit_name;
        if (locEl) locEl.textContent = `${c.city}, ${c.country}`;
        if (lenEl) lenEl.textContent = `${c.lap_km || c.track_length_km} KM`;
        if (lapsEl) lapsEl.textContent = `${c.laps} Laps`;
        if (distEl) distEl.textContent = `${c.total_race_distance_km || (c.laps * c.lap_km).toFixed(2)} KM`;
        if (altEl) altEl.textContent = `${c.altitude_m} M (${c.elevation_category || 'Elevation'})`;
        if (dirEl) dirEl.textContent = c.direction || 'Clockwise';
        if (typeEl) typeEl.textContent = c.type || c.circuit_type;
      }
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.circuitLab3D = new CircuitLab3D();
});
