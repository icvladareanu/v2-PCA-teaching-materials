import { Matrix, EigenvalueDecomposition } from 'https://esm.sh/ml-matrix@6.10.0';
import gsap from 'https://esm.sh/gsap@3.9.1';

// A lightweight 2D Vector class for our math
class Vec2 {
  constructor(x, y) { this.x = x; this.y = y; }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  mult(s) { return new Vec2(this.x * s, this.y * s); }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  norm() { 
    const m = this.mag(); 
    return m === 0 ? new Vec2(0, 0) : new Vec2(this.x / m, this.y / m); 
  }
  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
  }
}

export default {
  render({ el }) {
    // =========================
    // UI SETUP
    // =========================
    const container = document.createElement('div');
    container.className = 'pca-container';

    // Controls
    const controls = document.createElement('div');
    controls.className = 'pca-controls';

    const inputRow = document.createElement('div');
    const label = document.createElement('label');
    label.innerText = 'Points:';
    const inputPoints = document.createElement('input');
    inputPoints.type = 'number';
    inputPoints.value = 50;
    inputPoints.min = 10;
    inputPoints.max = 100;
    inputRow.append(label, inputPoints);

    function btn(text, disabled = false) {
      const b = document.createElement('button');
      b.innerText = text;
      b.disabled = disabled;
      return b;
    }

    const btnGen = btn('Generate Data');
    const btnVar = btn('1. Max Variance Direction', true);
    const btnProjLine = btn('2. Show Projections', true);
    const btnProject = btn('3. Project Data', true);

    controls.append(inputRow, btnGen, btnVar, btnProjLine, btnProject);

    // Canvas Views
    const views = document.createElement('div');
    views.className = 'views-container';

    const view1 = document.createElement('div');
    view1.className = 'scene-container';
    view1.id = 'chart1-wrapper';
    const canvas1 = document.createElement('canvas');
    view1.appendChild(canvas1);

    const view2 = document.createElement('div');
    view2.className = 'scene-container';
    view2.id = 'chart2-wrapper';
    const canvas2 = document.createElement('canvas');
    view2.appendChild(canvas2);

    views.append(view1, view2);
    container.append(views, controls);
    el.appendChild(container);

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    // =========================
    // STATE
    // =========================
    const state = {
      raw: [],         
      mean: new Vec2(0, 0),
      pc1: new Vec2(1, 0), 
      animVar: 0,      
      animProjLine: 0, 
      animRotate: 0,   // Phase 1 of projection
      animCollapse: 0, // Phase 2 of projection
      scale: 15 
    };

    function randn() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    // =========================
    // CANVAS RENDERING
    // =========================
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      
      const rect1 = view1.getBoundingClientRect();
      canvas1.width = rect1.width * dpr;
      canvas1.height = rect1.height * dpr;
      ctx1.scale(dpr, dpr);
      canvas1.style.width = `${rect1.width}px`;
      canvas1.style.height = `${rect1.height}px`;

      const rect2 = view2.getBoundingClientRect();
      canvas2.width = rect2.width * dpr;
      canvas2.height = rect2.height * dpr;
      ctx2.scale(dpr, dpr);
      canvas2.style.width = `${rect2.width}px`;
      canvas2.style.height = `${rect2.height}px`;

      state.scale = rect1.width / 25; 
      renderFrame();
    }
    new ResizeObserver(resize).observe(views);

    function toPix(canvas, v) {
      const w = parseFloat(canvas.style.width);
      const h = parseFloat(canvas.style.height);
      return {
        x: (w / 2) + (v.x * state.scale),
        y: (h / 2) - (v.y * state.scale) 
      };
    }

    function renderFrame() {
      const w1 = parseFloat(canvas1.style.width);
      const h1 = parseFloat(canvas1.style.height);
      const w2 = parseFloat(canvas2.style.width);
      const h2 = parseFloat(canvas2.style.height);
      
      ctx1.clearRect(0, 0, w1, h1);
      ctx2.clearRect(0, 0, w2, h2);

      // ==========================================
      // CHART 1: Standard 2D View
      // ==========================================
      ctx1.strokeStyle = '#e1e4e8';
      ctx1.lineWidth = 1;
      ctx1.beginPath();
      ctx1.moveTo(0, h1/2); ctx1.lineTo(w1, h1/2);
      ctx1.moveTo(w1/2, 0); ctx1.lineTo(w1/2, h1);
      ctx1.stroke();

      if (state.raw.length === 0) return;

      const pMean = toPix(canvas1, state.mean);

      // LAYER 1: Max Variance Direction (PC1)
      if (state.animVar > 0) {
        const lineLen = 25 * state.animVar; 
        const pStart = toPix(canvas1, state.mean.add(state.pc1.mult(-lineLen)));
        const pEnd = toPix(canvas1, state.mean.add(state.pc1.mult(lineLen)));

        ctx1.strokeStyle = '#007aff';
        ctx1.lineWidth = 3;
        ctx1.beginPath();
        ctx1.moveTo(pStart.x, pStart.y);
        ctx1.lineTo(pEnd.x, pEnd.y);
        ctx1.stroke();
      }

      // LAYER 2: Original 2D Points
      state.raw.forEach(p => {
        const pPix = toPix(canvas1, p);
        ctx1.fillStyle = '#6a8ba4';
        ctx1.beginPath();
        ctx1.arc(pPix.x, pPix.y, 4, 0, Math.PI * 2);
        ctx1.fill();
      });

      // LAYER 3: Red Projection Lines
      state.raw.forEach(p => {
        if (state.animProjLine > 0) {
          const pPix = toPix(canvas1, p);
          const vFromMean = p.sub(state.mean);
          const distOnLine = vFromMean.dot(state.pc1);
          const projMath = state.mean.add(state.pc1.mult(distOnLine));
          const projPix = toPix(canvas1, projMath);

          const curX = pPix.x + (projPix.x - pPix.x) * state.animProjLine;
          const curY = pPix.y + (projPix.y - pPix.y) * state.animProjLine;

          ctx1.strokeStyle = '#ff3b30';
          ctx1.lineWidth = 1.5;
          ctx1.setLineDash([4, 4]);
          ctx1.beginPath();
          ctx1.moveTo(pPix.x, pPix.y);
          ctx1.lineTo(curX, curY);
          ctx1.stroke();
          ctx1.setLineDash([]); 
        }
      });

      // LAYER 4: Mean Point
      if (state.animVar > 0) {
        ctx1.fillStyle = '#000000';
        ctx1.beginPath();
        ctx1.arc(pMean.x, pMean.y, 5, 0, Math.PI * 2);
        ctx1.fill();
      }

      // ==========================================
      // CHART 2: Animated Projection View
      // ==========================================
      ctx2.strokeStyle = '#e1e4e8';
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.moveTo(0, h2/2); ctx2.lineTo(w2, h2/2);
      ctx2.stroke();

      // Math for rotation and collapse
      const pcAngle = Math.atan2(state.pc1.y, state.pc1.x);
      const currentRot = -pcAngle * state.animRotate;
      const yScale = 1 - state.animCollapse;
      
      // Translate the mean's Y position to 0 during the collapse
      const currentMeanY = state.mean.y * yScale;
      const currentMean = new Vec2(state.mean.x, currentMeanY);

      // LAYER 1: Rotating Max Variance Direction (PC1)
      if (state.animVar > 0) {
        const lineLen = 25 * state.animVar; 
        
        let dir = state.pc1.rotate(currentRot);
        dir.y *= yScale; 
        
        const pStartPix = toPix(canvas2, currentMean.add(dir.mult(-lineLen)));
        const pEndPix = toPix(canvas2, currentMean.add(dir.mult(lineLen)));

        ctx2.strokeStyle = '#007aff';
        ctx2.lineWidth = 3;
        ctx2.beginPath();
        ctx2.moveTo(pStartPix.x, pStartPix.y);
        ctx2.lineTo(pEndPix.x, pEndPix.y);
        ctx2.stroke();
      }

      // LAYER 2 & 3: Rotating Original 2D Points & Red Projection Lines
      state.raw.forEach(p => {
        // Rotate and collapse the point relative to the mean
        const v = p.sub(state.mean);
        let vRot = v.rotate(currentRot);
        vRot.y *= yScale;
        
        const pPix = toPix(canvas2, currentMean.add(vRot));

        // Rotate and collapse the projection path identically
        if (state.animProjLine > 0) {
          const distOnLine = v.dot(state.pc1);
          const proj = state.pc1.mult(distOnLine);
          
          let projRot = proj.rotate(currentRot);
          projRot.y *= yScale;
          
          const projPix = toPix(canvas2, currentMean.add(projRot));

          const curX = pPix.x + (projPix.x - pPix.x) * state.animProjLine;
          const curY = pPix.y + (projPix.y - pPix.y) * state.animProjLine;

          ctx2.strokeStyle = '#ff3b30';
          ctx2.lineWidth = 1.5;
          ctx2.setLineDash([4, 4]);
          ctx2.beginPath();
          ctx2.moveTo(pPix.x, pPix.y);
          ctx2.lineTo(curX, curY);
          ctx2.stroke();
          ctx2.setLineDash([]); 
        }

        ctx2.fillStyle = '#6a8ba4';
        ctx2.beginPath();
        ctx2.arc(pPix.x, pPix.y, 4, 0, Math.PI * 2);
        ctx2.fill();
      });

      // LAYER 4: Draw Mean Point
      if (state.animVar > 0) {
        const pMeanPix = toPix(canvas2, currentMean);
        ctx2.fillStyle = '#000000';
        ctx2.beginPath();
        ctx2.arc(pMeanPix.x, pMeanPix.y, 5, 0, Math.PI * 2);
        ctx2.fill();
      }
    }

    // =========================
    // ACTIONS
    // =========================
    function generate() {
      gsap.killTweensOf(state);
      state.animVar = 0;
      state.animProjLine = 0;
      state.animRotate = 0;
      state.animCollapse = 0;

      let n = parseInt(inputPoints.value);
      if (isNaN(n) || n < 10) n = 10;
      if (n > 100) n = 100;
      inputPoints.value = n;

      state.raw = [];
      const center = new Vec2((Math.random()-0.5)*2, (Math.random()-0.5)*2);
      
      // Calculate a random orientation for the cluster once per generation
      const randomAngle = Math.random() * Math.PI * 2;

      for (let i = 0; i < n; i++) {
        const spread = randn() * 5.0; 
        const noise = randn() * 1.8; 
        
        // Apply the random angle to every point
        const x = spread * Math.cos(randomAngle) - noise * Math.sin(randomAngle);
        const y = spread * Math.sin(randomAngle) + noise * Math.cos(randomAngle);

        state.raw.push(new Vec2(x, y).add(center));
      }

      btnVar.disabled = false;
     
      renderFrame();
    }

    function findVariance() {
      let sumX = 0, sumY = 0;
      state.raw.forEach(p => { sumX += p.x; sumY += p.y; });
      const n = state.raw.length;
      state.mean = new Vec2(sumX / n, sumY / n);

      let cxx = 0, cxy = 0, cyy = 0;
      state.raw.forEach(p => {
        const dx = p.x - state.mean.x;
        const dy = p.y - state.mean.y;
        cxx += dx * dx;
        cxy += dx * dy;
        cyy += dy * dy;
      });
      cxx /= (n - 1); cxy /= (n - 1); cyy /= (n - 1);

      const covMat = new Matrix([[cxx, cxy], [cxy, cyy]]);
      const eig = new EigenvalueDecomposition(covMat);
      const v = eig.eigenvectorMatrix.to2DArray();
      const d = eig.realEigenvalues;

      const vec0 = new Vec2(v[0][0], v[1][0]).norm();
      const vec1 = new Vec2(v[0][1], v[1][1]).norm();

      state.pc1 = d[0] > d[1] ? vec0 : vec1;

      gsap.to(state, {
        animVar: 1, duration: 1, ease: "power2.out",
        onUpdate: renderFrame
      });

    
      btnProjLine.disabled = false;
    }

    function showProjections() {
      gsap.to(state, {
        animProjLine: 1, duration: 1.5, ease: "power1.inOut",
        onUpdate: renderFrame
      });

    
      btnProject.disabled = false;
    }

    function projectData() {
      const tl = gsap.timeline({ onUpdate: renderFrame });
      
      // Step 1: Rotate the points so PC1 is horizontal
      tl.to(state, {
        animRotate: 1, 
        duration: 1.2, 
        ease: "power2.inOut"
      })
      // Step 2: Squash the points onto the line
      .to(state, {
        animCollapse: 1, 
        duration: 1.2, 
        ease: "power2.inOut"
      });

    
    }

    // =========================
    // EVENTS & INIT
    // =========================
    btnGen.onclick = generate;
    btnVar.onclick = findVariance;
    btnProjLine.onclick = showProjections;
    btnProject.onclick = projectData;

    setTimeout(() => {
      resize();
      generate();
    }, 100);

    return () => {
      gsap.killTweensOf(state);
    };
  }
};
