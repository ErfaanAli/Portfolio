/*
 * Interactive 3D microservices/network graph for the hero background.
 * Nodes = services/nodes in a distributed system, edges = connections,
 * traveling pulses = requests/data flowing between them.
 */
(function () {
  const canvas = document.getElementById("network-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 34);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const group = new THREE.Group();
  scene.add(group);

  const NODE_COUNT = window.innerWidth < 700 ? 26 : 46;
  const RADIUS_X = 26;
  const RADIUS_Y = 16;
  const RADIUS_Z = 14;

  const nodes = [];
  const nodeGeometry = new THREE.SphereGeometry(0.24, 12, 12);
  const hubGeometry = new THREE.SphereGeometry(0.4, 14, 14);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b4a, transparent: true, opacity: 0.9 });
  const hubMaterial = new THREE.MeshBasicMaterial({ color: 0x4ad9c0, transparent: true, opacity: 0.95 });

  for (let i = 0; i < NODE_COUNT; i++) {
    const isHub = i % 7 === 0;
    const mesh = new THREE.Mesh(isHub ? hubGeometry : nodeGeometry, isHub ? hubMaterial : nodeMaterial);
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 2 * RADIUS_X,
      (Math.random() - 0.5) * 2 * RADIUS_Y,
      (Math.random() - 0.5) * 2 * RADIUS_Z
    );
    mesh.position.copy(pos);
    group.add(mesh);
    nodes.push({ mesh, isHub, basePos: pos.clone(), phase: Math.random() * Math.PI * 2 });
  }

  // Build edges: connect each node to its nearest few neighbours
  const edges = [];
  const MAX_DIST = 13;
  const MAX_LINKS_PER_NODE = 3;

  nodes.forEach((n, i) => {
    const distances = nodes
      .map((other, j) => ({ j, d: n.basePos.distanceTo(other.basePos) }))
      .filter((e) => e.j !== i && e.d < MAX_DIST)
      .sort((a, b) => a.d - b.d)
      .slice(0, MAX_LINKS_PER_NODE);

    distances.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edges.find((e) => e.key === key)) {
        edges.push({ key, a: i, b: j });
      }
    });
  });

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8a8d99, transparent: true, opacity: 0.18 });
  const linePositions = new Float32Array(edges.length * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  function updateLinePositions() {
    edges.forEach((edge, idx) => {
      const a = nodes[edge.a].mesh.position;
      const b = nodes[edge.b].mesh.position;
      const off = idx * 6;
      linePositions[off] = a.x;
      linePositions[off + 1] = a.y;
      linePositions[off + 2] = a.z;
      linePositions[off + 3] = b.x;
      linePositions[off + 4] = b.y;
      linePositions[off + 5] = b.z;
    });
    lineGeometry.attributes.position.needsUpdate = true;
  }

  // Traveling data pulses along random edges
  const MAX_PULSES = 6;
  const pulseGeometry = new THREE.SphereGeometry(0.32, 10, 10);
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0 });
  const pulses = [];

  for (let i = 0; i < MAX_PULSES; i++) {
    const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial.clone());
    group.add(mesh);
    pulses.push({ mesh, edge: null, t: 1, speed: 0 });
  }

  function launchPulse(pulse) {
    if (!edges.length) return;
    pulse.edge = edges[Math.floor(Math.random() * edges.length)];
    pulse.t = 0;
    pulse.speed = 0.006 + Math.random() * 0.006;
    pulse.mesh.material.opacity = 0;
  }

  pulses.forEach((p, i) => setTimeout(() => launchPulse(p), i * 700));

  // Pointer parallax — mouse on desktop, touch drag on mobile
  let targetRotX = 0;
  let targetRotY = 0;

  function setTargetFromPoint(x, y) {
    const nx = (x / window.innerWidth) * 2 - 1;
    const ny = (y / window.innerHeight) * 2 - 1;
    targetRotY = nx * 0.35;
    targetRotX = ny * 0.2;
  }

  window.addEventListener("mousemove", (e) => setTargetFromPoint(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches.length) return;
      setTargetFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  let visible = true;
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });

  const clock = new THREE.Clock();

  // Respect reduced-motion by dropping the idle auto-drift, but keep the
  // graph interactive (pointer parallax + data pulses) either way — freezing
  // the whole scene made the hero look broken/static rather than accessible.
  const idleSpin = prefersReducedMotion ? 0 : 0.0009;
  const floatAmount = prefersReducedMotion ? 0 : 0.6;

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    const t = clock.getElapsedTime();

    group.rotation.y += (targetRotY - group.rotation.y) * 0.02 + idleSpin;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.02;

    nodes.forEach((n) => {
      n.mesh.position.x = n.basePos.x + Math.sin(t * 0.4 + n.phase) * floatAmount;
      n.mesh.position.y = n.basePos.y + Math.cos(t * 0.35 + n.phase) * floatAmount;
    });
    updateLinePositions();

    pulses.forEach((p) => {
      if (!p.edge) return;
      p.t += p.speed;
      if (p.t >= 1) {
        launchPulse(p);
        return;
      }
      const a = nodes[p.edge.a].mesh.position;
      const b = nodes[p.edge.b].mesh.position;
      p.mesh.position.lerpVectors(a, b, p.t);
      p.mesh.material.opacity = Math.sin(p.t * Math.PI) * 0.9;
    });

    renderer.render(scene, camera);
  }

  resize();
  updateLinePositions();
  window.addEventListener("resize", resize);
  animate();
})();
