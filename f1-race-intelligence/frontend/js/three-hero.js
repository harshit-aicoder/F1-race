/**
 * FORMULA 1 RACE INTELLIGENCE - 3D HERO MOTORSPORT SCENE
 * Interactive Three.js scene with a procedural aerodynamic Formula 1 car,
 * racing circuit environment, lighting, speed stream particles, and telemetry HUD.
 */

class Hero3DScene {
  constructor() {
    this.container = document.getElementById("hero-three-canvas-container");
    this.canvas = document.getElementById("hero-three-canvas");
    this.isInitialized = false;
    this.autoRotate = true;
    this.wireframeMode = false;
    this.underglowActive = true;
    this.cameraView = "isometric";

    this.carGroup = null;
    this.particles = null;
    this.underglowLight = null;
    this.wheels = [];

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    if (typeof THREE === "undefined") {
      console.warn("[Hero3D] Three.js not loaded. Activating fallback.");
      this.showFallback();
      return;
    }

    try {
      // 1. Scene, Camera, Renderer
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x07090E, 0.035);

      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.setCameraView("isometric");

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;

      // 2. Lighting Setup
      this.setupLighting();

      // 3. Build Procedural Circuit Environment
      this.buildTrackEnvironment();

      // 4. Build Procedural High-Detail Formula 1 Car
      this.buildF1Car();

      // 5. Build High-Speed Aero Particle Streams
      this.buildAeroParticles();

      // 6. Setup Orbit Controls (if available)
      if (typeof THREE.OrbitControls !== "undefined") {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera clipping under ground
        this.controls.minDistance = 4;
        this.controls.maxDistance = 25;
      }

      // 7. Event Listeners
      window.addEventListener("resize", () => this.onWindowResize());
      this.bindHudControls();

      // 8. Animation Loop
      this.clock = new THREE.Clock();
      this.isInitialized = true;
      this.animate();

      // 9. Start Telemetry HUD updates
      this.startTelemetrySimulation();

      console.log("[Hero3D] 3D Racing scene successfully mounted.");
    } catch (err) {
      console.error("[Hero3D] WebGL Initialization Error:", err);
      this.showFallback();
    }
  }

  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x101726, 1.8);
    this.scene.add(ambient);

    // Key Light (Racing Scarlet overhead spot)
    const redSpot = new THREE.SpotLight(0xE10600, 4.5, 30, Math.PI / 4, 0.4, 1);
    redSpot.position.set(-6, 8, 6);
    redSpot.castShadow = true;
    redSpot.shadow.bias = -0.0001;
    this.scene.add(redSpot);

    // Fill Light (Electric Cyan from opposite side)
    const cyanSpot = new THREE.SpotLight(0x00D2BE, 3.5, 30, Math.PI / 3, 0.4, 1);
    cyanSpot.position.set(6, 6, -5);
    this.scene.add(cyanSpot);

    // Rim overhead light
    const whiteTop = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    whiteTop.position.set(0, 12, 0);
    this.scene.add(whiteTop);

    // Ground Venturi Underglow Light
    this.underglowLight = new THREE.PointLight(0x00F5D4, 3.0, 6);
    this.underglowLight.position.set(0, 0.15, 0);
    this.scene.add(this.underglowLight);
  }

  buildTrackEnvironment() {
    // Wet reflective asphalt ground plane
    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070A10,
      roughness: 0.28,
      metalness: 0.85
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Racing Kerbs (Alternating Red and White curbs on track edge)
    const kerbGroup = new THREE.Group();
    const kerbCount = 36;
    for (let i = 0; i < kerbCount; i++) {
      const kerbGeo = new THREE.BoxGeometry(0.8, 0.08, 0.4);
      const isRed = i % 2 === 0;
      const kerbMat = new THREE.MeshStandardMaterial({
        color: isRed ? 0xE10600 : 0xFFFFFF,
        roughness: 0.4,
        metalness: 0.2
      });
      const kerb = new THREE.Mesh(kerbGeo, kerbMat);
      kerb.position.set(-5.5 + Math.sin(i * 0.15) * 0.4, 0.04, -18 + i * 1.0);
      kerb.rotation.y = 0.1;
      kerbGroup.add(kerb);
    }
    this.scene.add(kerbGroup);

    // Grid Starting Box Markings (White painted track box)
    const boxGeo = new THREE.PlaneGeometry(2.8, 5.0);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const gridBox = new THREE.Mesh(boxGeo, boxMat);
    gridBox.rotation.x = -Math.PI / 2;
    gridBox.position.set(0, 0.01, 0);
    this.scene.add(gridBox);
  }

  buildF1Car() {
    this.carGroup = new THREE.Group();

    // Car Materials
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0B0E14,
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 1.5
    });

    const liveryRedMat = new THREE.MeshStandardMaterial({
      color: 0xE10600,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x550000,
      emissiveIntensity: 0.2
    });

    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00D2BE,
      roughness: 0.3,
      metalness: 0.8
    });

    const tyreRubberMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.85,
      metalness: 0.1
    });

    const wheelRimMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.3,
      metalness: 0.95
    });

    const caliperRedMat = new THREE.MeshBasicMaterial({ color: 0xFF1E27 });
    const haloTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1A2230,
      roughness: 0.2,
      metalness: 0.95
    });

    // 1. Central Monocoque Body
    const bodyGeo = new THREE.BoxGeometry(0.9, 0.5, 3.8);
    const bodyMesh = new THREE.Mesh(bodyGeo, liveryRedMat);
    bodyMesh.position.set(0, 0.45, 0);
    bodyMesh.castShadow = true;
    this.carGroup.add(bodyMesh);

    // 2. Tapered Front Nosecone
    const noseGeo = new THREE.ConeGeometry(0.42, 1.6, 6);
    const noseMesh = new THREE.Mesh(noseGeo, liveryRedMat);
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(0, 0.38, 2.6);
    noseMesh.castShadow = true;
    this.carGroup.add(noseMesh);

    // 3. Front Wing Multi-Element Assembly
    const fwMainGeo = new THREE.BoxGeometry(2.3, 0.05, 0.7);
    const fwMainMesh = new THREE.Mesh(fwMainGeo, carbonMat);
    fwMainMesh.position.set(0, 0.18, 3.2);
    this.carGroup.add(fwMainMesh);

    // Front Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.04, 0.25, 0.7);
    const epLeft = new THREE.Mesh(endplateGeo, cyanAccentMat);
    epLeft.position.set(-1.15, 0.25, 3.2);
    const epRight = new THREE.Mesh(endplateGeo, cyanAccentMat);
    epRight.position.set(1.15, 0.25, 3.2);
    this.carGroup.add(epLeft, epRight);

    // 4. Sculpted Aerodynamic Sidepods (Ground Effect Undercut)
    const podGeo = new THREE.BoxGeometry(0.5, 0.42, 2.0);
    const podLeft = new THREE.Mesh(podGeo, carbonMat);
    podLeft.position.set(-0.65, 0.4, 0.2);
    const podRight = new THREE.Mesh(podGeo, carbonMat);
    podRight.position.set(0.65, 0.4, 0.2);
    this.carGroup.add(podLeft, podRight);

    // 5. Air Intake Engine Roll Hoop
    const airboxGeo = new THREE.BoxGeometry(0.4, 0.45, 0.8);
    const airboxMesh = new THREE.Mesh(airboxGeo, liveryRedMat);
    airboxMesh.position.set(0, 0.85, -0.2);
    this.carGroup.add(airboxMesh);

    // 6. Halo Cockpit Protection Structure
    const haloTorus = new THREE.TorusGeometry(0.38, 0.04, 8, 24, Math.PI);
    const haloMesh = new THREE.Mesh(haloTorus, haloTitaniumMat);
    haloMesh.rotation.x = -Math.PI / 2.3;
    haloMesh.position.set(0, 0.8, 0.5);
    this.carGroup.add(haloMesh);

    // Center Halo Support Pylon
    const pylonGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35);
    const pylonMesh = new THREE.Mesh(pylonGeo, haloTitaniumMat);
    pylonMesh.position.set(0, 0.65, 0.85);
    this.carGroup.add(pylonMesh);

    // 7. Rear Wing Assembly & DRS Actuator
    const rwTopGeo = new THREE.BoxGeometry(1.6, 0.04, 0.5);
    const rwTopMesh = new THREE.Mesh(rwTopGeo, liveryRedMat);
    rwTopMesh.position.set(0, 1.05, -2.1);
    const rwPylonGeo = new THREE.BoxGeometry(0.06, 0.65, 0.2);
    const rwPylon = new THREE.Mesh(rwPylonGeo, carbonMat);
    rwPylon.position.set(0, 0.75, -2.05);
    const rwEndplateGeo = new THREE.BoxGeometry(0.04, 0.65, 0.6);
    const rwEpL = new THREE.Mesh(rwEndplateGeo, cyanAccentMat);
    rwEpL.position.set(-0.8, 0.95, -2.1);
    const rwEpR = new THREE.Mesh(rwEndplateGeo, cyanAccentMat);
    rwEpR.position.set(0.8, 0.95, -2.1);
    this.carGroup.add(rwTopMesh, rwPylon, rwEpL, rwEpR);

    // 8. Pirelli Slick Wheels with Rim Accents & Red Glowing Calipers
    const wheelPositions = [
      { x: -1.05, y: 0.36, z: 1.8, isFront: true },  // Front Left
      { x: 1.05, y: 0.36, z: 1.8, isFront: true },   // Front Right
      { x: -1.15, y: 0.42, z: -1.6, isFront: false },// Rear Left (Wider)
      { x: 1.15, y: 0.42, z: -1.6, isFront: false }  // Rear Right (Wider)
    ];

    wheelPositions.forEach((pos) => {
      const wGroup = new THREE.Group();
      const radius = pos.isFront ? 0.36 : 0.42;
      const width = pos.isFront ? 0.34 : 0.46;

      // Rubber Tyre
      const tyreGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
      const tyreMesh = new THREE.Mesh(tyreGeo, tyreRubberMat);
      tyreMesh.rotation.z = Math.PI / 2;
      tyreMesh.castShadow = true;
      wGroup.add(tyreMesh);

      // Wheel Rim
      const rimGeo = new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width * 1.02, 16);
      const rimMesh = new THREE.Mesh(rimGeo, wheelRimMat);
      rimMesh.rotation.z = Math.PI / 2;
      wGroup.add(rimMesh);

      // Red Brake Caliper
      const calGeo = new THREE.BoxGeometry(0.08, 0.16, 0.16);
      const calMesh = new THREE.Mesh(calGeo, caliperRedMat);
      calMesh.position.set(pos.x > 0 ? -0.1 : 0.1, 0.12, 0);
      wGroup.add(calMesh);

      wGroup.position.set(pos.x, pos.y, pos.z);
      this.carGroup.add(wGroup);
      this.wheels.push(wGroup);
    });

    this.carGroup.position.set(0, 0, 0);
    this.scene.add(this.carGroup);
  }

  buildAeroParticles() {
    // Flowing aerodynamic stream particles past the car
    const particleCount = 280;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x00F5D4);
    const cRed = new THREE.Color(0xE10600);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 4.5;
      positions[idx + 1] = 0.2 + Math.random() * 1.5;
      positions[idx + 2] = -12 + Math.random() * 24;

      const pickColor = Math.random() > 0.4 ? cCyan : cRed;
      colors[idx] = pickColor.r;
      colors[idx + 1] = pickColor.g;
      colors[idx + 2] = pickColor.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Auto rotate turntable if enabled
    if (this.autoRotate && this.carGroup) {
      this.carGroup.rotation.y += delta * 0.25;
    }

    // Spin wheels
    this.wheels.forEach((w) => {
      w.rotation.x += delta * 12.0;
    });

    // Flow particles backwards (relative to car forward speed)
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 2; i < pos.length; i += 3) {
        pos[i] -= delta * 32.0;
        if (pos[i] < -12.0) {
          pos[i] = 12.0;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  setCameraView(viewName) {
    this.cameraView = viewName;
    if (!this.camera) return;

    if (viewName === "isometric") {
      this.camera.position.set(6.5, 4.2, 7.5);
      this.camera.lookAt(0, 0.4, 0);
    } else if (viewName === "front") {
      this.camera.position.set(0, 0.8, 6.2);
      this.camera.lookAt(0, 0.35, 1.5);
    } else if (viewName === "cockpit") {
      this.camera.position.set(0, 1.15, 0.85);
      this.camera.lookAt(0, 0.6, 3.5);
    } else if (viewName === "rear") {
      this.camera.position.set(-3.5, 2.2, -5.5);
      this.camera.lookAt(0, 0.5, -1.0);
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    if (this.carGroup) {
      this.carGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = this.wireframeMode;
        }
      });
    }
    return this.wireframeMode;
  }

  toggleUnderglow() {
    this.underglowActive = !this.underglowActive;
    if (this.underglowLight) {
      this.underglowLight.intensity = this.underglowActive ? 3.0 : 0.0;
    }
    return this.underglowActive;
  }

  bindHudControls() {
    const btnRotate = document.getElementById("toggle-rotate-btn");
    const btnWire = document.getElementById("toggle-wireframe-btn");
    const btnGlow = document.getElementById("toggle-glow-btn");
    const viewButtons = document.querySelectorAll(".cam-view-btn");

    if (btnRotate) {
      btnRotate.addEventListener("click", () => {
        const active = this.toggleAutoRotate();
        btnRotate.classList.toggle("active", active);
      });
    }

    if (btnWire) {
      btnWire.addEventListener("click", () => {
        const active = this.toggleWireframe();
        btnWire.classList.toggle("active", active);
      });
    }

    if (btnGlow) {
      btnGlow.addEventListener("click", () => {
        const active = this.toggleUnderglow();
        btnGlow.classList.toggle("active", active);
      });
    }

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        viewButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.view;
        this.setCameraView(view);
      });
    });
  }

  startTelemetrySimulation() {
    // Dynamic live telemetry readouts
    const speedEl = document.getElementById("telemetry-speed");
    const rpmEl = document.getElementById("telemetry-rpm");
    const gearEl = document.getElementById("telemetry-gear");
    const ersEl = document.getElementById("telemetry-ers");

    setInterval(() => {
      if (speedEl) {
        const baseSpeed = 336;
        const fluc = (Math.random() * 4 - 2).toFixed(0);
        speedEl.textContent = `${baseSpeed + parseInt(fluc)} KM/H`;
      }
      if (rpmEl) {
        const baseRpm = 12400;
        const rpmFluc = (Math.random() * 250 - 120).toFixed(0);
        rpmEl.textContent = `${baseRpm + parseInt(rpmFluc)} RPM`;
      }
      if (ersEl) {
        const pct = (93 + Math.random() * 4).toFixed(0);
        ersEl.textContent = `${pct}%`;
      }
    }, 450);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  showFallback() {
    if (this.canvas) {
      this.canvas.style.display = "none";
    }
    const fallbackBox = document.getElementById("hero-canvas-fallback");
    if (fallbackBox) {
      fallbackBox.style.display = "flex";
    }
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.hero3D = new Hero3DScene();
});
