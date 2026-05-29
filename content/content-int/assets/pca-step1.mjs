import * as THREE from 'https://esm.sh/three@0.128.0';
import { OrbitControls } from 'https://esm.sh/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { Matrix, EigenvalueDecomposition } from 'https://esm.sh/ml-matrix@6.10.0';
import gsap from 'https://esm.sh/gsap@3.9.1';

export default {
  render({ el }) {

    // =========================
    // UI
    // =========================
    const container = document.createElement('div');
    container.className = 'pca-container';

    const controls = document.createElement('div');
    controls.className = 'pca-controls';

    const inputRow = document.createElement('div');
    const label = document.createElement('label');
    label.innerText = 'Points:';

    const inputPoints = document.createElement('input');
    inputPoints.type = 'number';
    inputPoints.value = 150;
    inputPoints.min = 10;
    inputPoints.max = 2000;

    inputRow.append(label, inputPoints);

    const btnGen = btn('Generate Random Data');
    const btnCenter = btn('1. Center Data');

    controls.append(inputRow, btnGen, btnCenter);

    const views = document.createElement('div');
    views.className = 'views-container';

    const viewA = document.createElement('div');
    const viewB = document.createElement('div');
    viewA.className = 'scene-container';
    viewB.className = 'scene-container';

    views.append(viewA, viewB);

    container.append(views, controls);
    el.appendChild(container);

    // =========================
    // THREE SETUP
    // =========================
    const sceneA = new THREE.Scene();
    const sceneB = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(6, 5, 6);

    const rendererA = new THREE.WebGLRenderer({ antialias: true });
    const rendererB = new THREE.WebGLRenderer({ antialias: true });

    rendererA.setClearColor(0xf4f6f8, 1);
    rendererB.setClearColor(0xf4f6f8, 1);

    viewA.appendChild(rendererA.domElement);
    viewB.appendChild(rendererB.domElement);

    const controlsA = new OrbitControls(camera, rendererA.domElement);
    const controlsB = new OrbitControls(camera, rendererB.domElement);

    controlsA.addEventListener('change', renderAll);
    controlsB.addEventListener('change', renderAll);

    // Create Axes and force them to be gray
    const axesA = new THREE.AxesHelper(3);
    axesA.material.vertexColors = false; // Disable default RGB
    axesA.material.color.setHex(0x888888); // Set to uniform gray
    sceneA.add(axesA);

    const axesB = new THREE.AxesHelper(3);
    axesB.material.vertexColors = false; 
    axesB.material.color.setHex(0x888888);
    sceneB.add(axesB);

    // =========================
    // STATE
    // =========================
    const state = {
      raw: [],
      centered: [],
      mean: new THREE.Vector3(),
      eigenvectors: [],
      eigenArrows: []
    };

    const groupA = new THREE.Group();
    const groupB = new THREE.Group();
    sceneA.add(groupA);
    sceneB.add(groupB);

    const sphere = new THREE.SphereGeometry(0.08);
    const matA = new THREE.MeshBasicMaterial({ color: 0x9fb5c7 });
    const matB = new THREE.MeshBasicMaterial({ color: 0x6a8ba4 });

    const arrows = [];

    // =========================
    // HELPERS
    // =========================
    function btn(text, disabled = false) {
      const b = document.createElement('button');
      b.innerText = text;
      b.disabled = disabled;
      return b;
    }

    function randn() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function renderAll() {
      rendererA.render(sceneA, camera);
      rendererB.render(sceneB, camera);
    }

    function resize() {
      const w = container.clientWidth / 2;
      const h = container.clientHeight;

      rendererA.setSize(w, h);
      rendererB.setSize(w, h);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    new ResizeObserver(resize).observe(container);

    function draw(group, points, mat) {
      group.clear();
      for (const p of points) {
        const m = new THREE.Mesh(sphere, mat);
        m.position.copy(p);
        group.add(m);
      }
    }

    // =========================
    // GENERATE DATA 
    // =========================
    function generate() {
      // Get the value, default to 0 if empty, and clamp between 0 and 1000
      let n = parseInt(inputPoints.value);
      if (isNaN(n) || n < 10) n = 10;
      if (n > 2000) n = 2000;
      
      // Force the UI input to reflect the clamped value
      inputPoints.value = n;

      state.raw = [];

      const center = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8
      );

      const spread = new THREE.Vector3(
        1 + Math.random() * 3,
        0.5 + Math.random() * 2,
        0.2 + Math.random() * 1.5
      );

      for (let i = 0; i < n; i++) {
        const p = new THREE.Vector3(
          randn() * spread.x,
          randn() * spread.y,
          randn() * spread.z
        );

        p.add(center);
        state.raw.push(p);
      }

      state.centered = [];
      state.eigenvectors = [];
      state.eigenArrows = [];

      arrows.forEach(a => sceneB.remove(a));
      arrows.length = 0;

      draw(groupA, state.raw, matA);
      draw(groupB, state.raw, matB);

      btnCenter.disabled = false;

      renderAll();
    }

    // =========================
    // CENTER DATA
    // =========================
    function center() {
      const mean = new THREE.Vector3();

      state.raw.forEach(p => mean.add(p));
      mean.divideScalar(state.raw.length);

      state.mean = mean;

      state.centered = state.raw.map(p => p.clone().sub(mean));

      draw(groupB, state.centered, matB);

      renderAll();
    }

    // =========================
    // EVENTS
    // =========================
    btnGen.onclick = generate;
    btnCenter.onclick = center;
   

    // =========================
    // INIT
    // =========================
    generate();
    resize();
    renderAll();

    function cleanup() {
      rendererA.dispose();
      rendererB.dispose();
    }

    return cleanup;
  }
};
