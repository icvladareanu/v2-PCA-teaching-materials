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
    const btnEigen = btn('2. Find Eigenvectors', true);


    controls.append(inputRow, btnGen, btnCenter, btnEigen);

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

    function createThickArrow(dir, origin, length, hexColor, thickness = 0.12) {
      const group = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: hexColor, depthTest: false });

      // Shaft
      const cylinderLength = length - (thickness * 5);
      const cylinderGeo = new THREE.CylinderGeometry(thickness, thickness, cylinderLength, 12);
      const shaft = new THREE.Mesh(cylinderGeo, mat);
      shaft.position.y = cylinderLength / 2;

      // Head
      const coneGeo = new THREE.ConeGeometry(thickness * 2.5, thickness * 5, 12);
      const head = new THREE.Mesh(coneGeo, mat);
      head.position.y = cylinderLength + (thickness * 2.5);

      group.add(shaft);
      group.add(head);

      // Orient the arrow to point in the eigenvector direction
      const axis = new THREE.Vector3(0, 1, 0); 
      group.quaternion.setFromUnitVectors(axis, dir);
      group.position.copy(origin);
      group.renderOrder = 999; 

      return group;
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
      
      // 1. Remove the actual arrow objects from the Three.js scene
      state.eigenArrows.forEach(arrow => sceneB.remove(arrow));
      
      // 2. Clear the state array
      state.eigenArrows = [];

      draw(groupA, state.raw, matA);
      draw(groupB, state.raw, matB);

      btnCenter.disabled = false;
      btnEigen.disabled = false;

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
    // COVARIANCE
    // =========================
    function cov(data) {
      const n = data.length;

      const c = [[0,0,0],[0,0,0],[0,0,0]];

      for (const p of data) {
        c[0][0] += p.x * p.x;
        c[0][1] += p.x * p.y;
        c[0][2] += p.x * p.z;

        c[1][0] += p.y * p.x;
        c[1][1] += p.y * p.y;
        c[1][2] += p.y * p.z;

        c[2][0] += p.z * p.x;
        c[2][1] += p.z * p.y;
        c[2][2] += p.z * p.z;
      }

      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          c[i][j] /= (n - 1);

      return c;
    }

    // =========================
    // EIGENVECTORS 
    // =========================
    function eigen() {
      const m = new Matrix(cov(state.centered));
      const eig = new EigenvalueDecomposition(m);
    
      const v = eig.eigenvectorMatrix.to2DArray();
      const d = eig.realEigenvalues; // Extract the eigenvalues
    
      // 1. Extract eigenvectors by column
      const vec0 = new THREE.Vector3(v[0][0], v[1][0], v[2][0]).normalize();
      const vec1 = new THREE.Vector3(v[0][1], v[1][1], v[2][1]).normalize();
      const vec2 = new THREE.Vector3(v[0][2], v[1][2], v[2][2]).normalize();
    
      // 2. Pair them with their eigenvalues so we can sort them
      const eigenPairs = [
        { value: d[0], vector: vec0 },
        { value: d[1], vector: vec1 },
        { value: d[2], vector: vec2 }
      ];
    
      // 3. Sort descending (Largest eigenvalue = Principal Component 1)
      eigenPairs.sort((a, b) => b.value - a.value);
    
      // 4. Assign sorted vectors to state
      state.eigenvectors = [
        eigenPairs[0].vector,
        eigenPairs[1].vector,
        eigenPairs[2].vector
      ];
    
      drawEigen();
    }

    // =========================
    // DRAW EIGENVECTORS 
    // =========================
    function drawEigen() {
      const origin = new THREE.Vector3(0, 0, 0);
      
      // PC1: Red, PC2: Green, PC3: Blue
      const colors = [0xff3b30, 0x34c759, 0x007aff];

      // Clean up old arrows
      state.eigenArrows.forEach(arrow => sceneB.remove(arrow));
      state.eigenArrows = [];

      state.eigenvectors.forEach((v, i) => {
        // Use the new thick arrow helper. 
        // Length = 4, Thickness = 0.12
        const arrow = createThickArrow(v, origin, 4, colors[i], 0.12);

        sceneB.add(arrow);
        state.eigenArrows.push(arrow);
      });

      controlsA.update();
      controlsB.update();
      renderAll();
    }
   

    // =========================
    // EVENTS
    // =========================
    btnGen.onclick = generate;
    btnCenter.onclick = center;
    btnEigen.onclick = eigen;


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
