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
    const btnPCs = btn('3. Find PCs', true);
    const btnProj = btn('4. Project Data', true);

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

    // Create Axes and force them to be gray
    const axesA = new THREE.AxesHelper(3);
    axesA.material.vertexColors = false; 
    axesA.material.color.setHex(0x888888); 
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
      eigenArrows: [],
      labels: [],
      volumeA: null, // 3D Mesh for Scene A
      volumeB: null, // 3D Mesh for Scene B
      plane: null    // 2D Plane for Projection
    };

    const groupA = new THREE.Group();
    const groupB = new THREE.Group();
    sceneA.add(groupA);
    sceneB.add(groupB);

    const sphere = new THREE.SphereGeometry(0.08);
    const matA = new THREE.MeshBasicMaterial({ color: 0x9fb5c7 });
    const matB = new THREE.MeshBasicMaterial({ color: 0x6a8ba4 });

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

    // Creates an ellipsoid that encapsulates the point cloud
    function createBoundingEllipsoid(points, colorHex) {
      const box = new THREE.Box3().setFromPoints(points);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const geo = new THREE.SphereGeometry(1, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ 
        color: colorHex, 
        transparent: true, 
        opacity: 0.12, 
        depthWrite: false 
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(center);
      // Pad scale by 1.1 so it wraps around the points nicely
      mesh.scale.set(size.x / 2 * 1.1, size.y / 2 * 1.1, size.z / 2 * 1.1);
      
      return mesh;
    }

    function createThickArrow(dir, origin, length, hexColor, thickness = 0.12) {
      const group = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: hexColor, depthTest: false });

      const cylinderLength = length - (thickness * 5);
      const cylinderGeo = new THREE.CylinderGeometry(thickness, thickness, cylinderLength, 12);
      const shaft = new THREE.Mesh(cylinderGeo, mat);
      shaft.position.y = cylinderLength / 2;

      const coneGeo = new THREE.ConeGeometry(thickness * 2.5, thickness * 5, 12);
      const head = new THREE.Mesh(coneGeo, mat);
      head.position.y = cylinderLength + (thickness * 2.5);

      group.add(shaft);
      group.add(head);

      const axis = new THREE.Vector3(0, 1, 0); 
      group.quaternion.setFromUnitVectors(axis, dir);
      group.position.copy(origin);
      group.renderOrder = 999; 

      return group;
    }

    function createTextSprite(text, colorStr) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = colorStr;
      ctx.font = 'bold 96px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      
      sprite.scale.set(3.0, 1.5, 1); 
      sprite.renderOrder = 9999;
      return sprite;
    }

    function resetProjection() {
      // 1. Kill any active GSAP tweens to prevent them from fighting the reset
      if (state.plane) gsap.killTweensOf(state.plane.material);
      if (state.volumeB) gsap.killTweensOf(state.volumeB.material);
      groupB.children.forEach(mesh => gsap.killTweensOf(mesh.position));

      // 2. Remove plane
      if (state.plane) {
        sceneB.remove(state.plane);
        state.plane.geometry.dispose();
        state.plane.material.dispose();
        state.plane = null;
      }

      // 3. Restore 3D volume visibility
      if (state.volumeB) {
        state.volumeB.material.opacity = 0.12;
      }

      // 4. Stop GSAP projection animations from triggering continuous rendering
      gsap.ticker.remove(renderAll);

      // 5. Reset point positions to centered data
      state.centered.forEach((p, index) => {
        if (groupB.children[index]) {
          groupB.children[index].position.copy(p);
        }
      });

      renderAll();
    }

    // =========================
    // GENERATE DATA 
    // =========================
    function generate() {
      resetProjection();
      let n = parseInt(inputPoints.value);
      if (isNaN(n) || n < 10) n = 10;
      if (n > 2000) n = 2000;
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
      
      gsap.ticker.remove(renderAll);
      
      // Cleanup old meshes & labels
      state.labels.forEach(l => sceneB.remove(l));
      state.labels = [];

      state.eigenArrows.forEach(arrow => {
        gsap.killTweensOf(arrow.scale);
        sceneB.remove(arrow);
      });
      state.eigenArrows = [];
      
      if (state.volumeA) sceneA.remove(state.volumeA);
      if (state.volumeB) sceneB.remove(state.volumeB);
      if (state.plane) sceneB.remove(state.plane);

      // Create new 3D volumes
      state.volumeA = createBoundingEllipsoid(state.raw, 0x9fb5c7);
      state.volumeB = createBoundingEllipsoid(state.raw, 0x6a8ba4);
      sceneA.add(state.volumeA);
      sceneB.add(state.volumeB);

      draw(groupA, state.raw, matA);
      draw(groupB, state.raw, matB);

      btnCenter.disabled = false;
      btnEigen.disabled = false;
      btnPCs.disabled = false;
      btnProj.disabled = false;

      renderAll();
    }

    // =========================
    // CENTER DATA
    // =========================
    function center() {
      resetProjection();
      const mean = new THREE.Vector3();

      state.raw.forEach(p => mean.add(p));
      mean.divideScalar(state.raw.length);
      state.mean = mean;

      state.centered = state.raw.map(p => p.clone().sub(mean));

      draw(groupB, state.centered, matB);

      // Update the 3D volume in Scene B to match the centered data
      if (state.volumeB) sceneB.remove(state.volumeB);
      state.volumeB = createBoundingEllipsoid(state.centered, 0x6a8ba4);
      sceneB.add(state.volumeB);

      btnCenter.disabled = false;
      btnEigen.disabled = false;
      btnPCs.disabled = false;
      btnProj.disabled = false;

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
      resetProjection();
      const m = new Matrix(cov(state.centered));
      const eig = new EigenvalueDecomposition(m);
      
      const v = eig.eigenvectorMatrix.to2DArray();
      const d = eig.realEigenvalues; 
      
      const vec0 = new THREE.Vector3(v[0][0], v[1][0], v[2][0]).normalize();
      const vec1 = new THREE.Vector3(v[0][1], v[1][1], v[2][1]).normalize();
      const vec2 = new THREE.Vector3(v[0][2], v[1][2], v[2][2]).normalize();
      
      const eigenPairs = [
        { value: d[0], vector: vec0 },
        { value: d[1], vector: vec1 },
        { value: d[2], vector: vec2 }
      ];
      
      eigenPairs.sort((a, b) => b.value - a.value);
      
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
      const colors = [0xff3b30, 0x34c759, 0x007aff];

      gsap.ticker.remove(renderAll);

      state.labels.forEach(l => sceneB.remove(l));
      state.labels = [];

      state.eigenArrows.forEach(arrow => {
        gsap.killTweensOf(arrow.scale);
        sceneB.remove(arrow);
      });
      state.eigenArrows = [];
      
      state.eigenvectors.forEach((v, i) => {
        const arrow = createThickArrow(v, origin, 4, colors[i], 0.12);
        sceneB.add(arrow);
        state.eigenArrows.push(arrow);
      });

      controlsA.update();
      controlsB.update();

      btnCenter.disabled = false;
      btnEigen.disabled = false;
      btnPCs.disabled = false;
      btnProj.disabled = false;
      renderAll();
    }

    // =========================
    // HIGHLIGHT PCS
    // =========================
    function pcs() {
      resetProjection();
      state.labels.forEach(label => sceneB.remove(label));
      state.labels = [];

      state.eigenArrows.forEach((arrowGroup, i) => {
        gsap.killTweensOf(arrowGroup.scale);
        arrowGroup.scale.set(1, 1, 1);

        if (i === 0 || i === 1) {
          const labelText = i === 0 ? "PC1" : "PC2";
          const colorStr = i === 0 ? "#ff3b30" : "#34c759";
          
          const tipPos = state.eigenvectors[i].clone().multiplyScalar(5.0);
          const labelSprite = createTextSprite(labelText, colorStr);
          labelSprite.position.copy(tipPos);
          
          sceneB.add(labelSprite);
          state.labels.push(labelSprite);

          gsap.to(arrowGroup.scale, {
            x: 1.15, y: 1.15, z: 1.15,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });

        } else {
          arrowGroup.children.forEach(mesh => {
            mesh.material.color.setHex(0xaaaaaa);
            mesh.material.transparent = true;
            mesh.material.opacity = 0.2;
          });
        }
      });

      btnCenter.disabled = false;
      btnEigen.disabled = false;
      btnPCs.disabled = false;
      btnProj.disabled = false;

      gsap.ticker.add(renderAll);
      
  
    }

    // =========================
    // PROJECT
    // =========================
    function project() {
      resetProjection(); // Fix: Stop any ongoing projection before starting a new one

      const [pc1, pc2, pc3] = state.eigenvectors;
    
      // -----------------------------------------
      // 1. Compute projection bounds in PC1/PC2
      // -----------------------------------------
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
    
      state.centered.forEach(p => {
        const x = p.dot(pc1);
        const y = p.dot(pc2);
    
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    
      const width = (maxX - minX) * 1.2;
      const height = (maxY - minY) * 1.2;
    
      // -----------------------------------------
      // 2. Create rectangular projection plane
      // -----------------------------------------
      const planeGeo = new THREE.PlaneGeometry(width, height);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x34c759,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    
      state.plane = new THREE.Mesh(planeGeo, planeMat);
    
      // Align plane so its normal is PC3
      state.plane.lookAt(pc3);
      sceneB.add(state.plane);
    
      // -----------------------------------------
      // 3. Animate plane in & 3D volume out
      // -----------------------------------------
      gsap.to(planeMat, {
        opacity: 0.18,
        duration: 1.5,
        ease: "power2.inOut"
      });
    
      if (state.volumeB) {
        gsap.to(state.volumeB.material, {
          opacity: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    
      // -----------------------------------------
      // 4. Animate points onto PC1/PC2 plane
      // -----------------------------------------
      state.centered.forEach((p, index) => {
        const x = p.dot(pc1);
        const y = p.dot(pc2);
    
        const targetPos = new THREE.Vector3(
          x * pc1.x + y * pc2.x,
          x * pc1.y + y * pc2.y,
          x * pc1.z + y * pc2.z
        );
    
        const mesh = groupB.children[index];
    
        gsap.to(mesh.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.5,
          ease: "power2.inOut"
        });
      });

      btnCenter.disabled = false;
      btnEigen.disabled = false;
      btnPCs.disabled = false;
      btnProj.disabled = false;
    
      gsap.ticker.add(renderAll);
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
      gsap.ticker.remove(renderAll);
    }

    return cleanup;
  }
};

