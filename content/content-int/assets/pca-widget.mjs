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

    const btnGen = btn('Generate');
    const btnCenter = btn('1. Center');
    const btnEigen = btn('2. Eigen', true);
    const btnPCs = btn('3. PCs', true);
    const btnProj = btn('4. Project', true);

    controls.append(inputRow, btnGen, btnCenter, btnEigen, btnPCs, btnProj);

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

    sceneA.add(new THREE.AxesHelper(3));
    sceneB.add(new THREE.AxesHelper(3));

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
    // GENERATE DATA (FIXED)
    // =========================
    function generate() {
      const n = parseInt(inputPoints.value) || 150;

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
      btnEigen.disabled = true;
      btnPCs.disabled = true;
      btnProj.disabled = true;

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

      btnEigen.disabled = false;
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
    // EIGENVECTORS (REAL PCA)
    // =========================
    function eigen() {
      const m = new Matrix(cov(state.centered));
      const eig = new EigenvalueDecomposition(m);

      const v = eig.eigenvectorMatrix.to2DArray();

      state.eigenvectors = [
        new THREE.Vector3(...v[0]).normalize(),
        new THREE.Vector3(...v[1]).normalize(),
        new THREE.Vector3(...v[2]).normalize()
      ];

      drawEigen();
      btnPCs.disabled = false;
    }

    // =========================
    // DRAW EIGENVECTORS (FIXED VISIBILITY)
    // =========================
    function drawEigen() {
      const origin = new THREE.Vector3(0, 0, 0);

      const colors = [0xff3b30, 0x34c759, 0x007aff];

      state.eigenArrows = [];

      state.eigenvectors.forEach((v, i) => {
        const arrow = new THREE.ArrowHelper(v, origin, 4, colors[i]);

        arrow.line.material.depthTest = false;
        arrow.cone.material.depthTest = false;
        arrow.renderOrder = 999;

        sceneB.add(arrow);
        state.eigenArrows.push(arrow);
      });

      controlsA.update();
      controlsB.update();
      renderAll();
    }

    // =========================
    // HIGHLIGHT PCS
    // =========================
    function pcs() {
      state.eigenArrows.forEach((a, i) => {
        const color = i === 0 ? 0xff0000 : i === 1 ? 0x00ff00 : 0x888888;
        a.setColor(new THREE.Color(color));
      });

      btnProj.disabled = false;
    }

    // =========================
    // PROJECT
    // =========================
    function project() {
      const [pc1, pc2] = state.eigenvectors;

      const projected = state.centered.map(p => {
        const x = p.dot(pc1);
        const y = p.dot(pc2);

        return new THREE.Vector3(
          x * pc1.x + y * pc2.x,
          x * pc1.y + y * pc2.y,
          x * pc1.z + y * pc2.z
        );
      });

      draw(groupB, projected, matB);
    }

    // =========================
    // EVENTS
    // =========================
    btnGen.onclick = generate;
    btnCenter.onclick = center;
    btnEigen.onclick = eigen;
    btnPCs.onclick = pcs;
    btnProj.onclick = project;

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
