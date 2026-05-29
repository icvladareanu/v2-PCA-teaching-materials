import gsap from 'https://esm.sh/gsap@3.9.1';

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
    inputPoints.max = 200;
    inputRow.append(label, inputPoints);

    function btn(text, disabled = false) {
      const b = document.createElement('button');
      b.innerText = text;
      b.disabled = disabled;
      return b;
    }

    const btnGen = btn('1. Generate Data');
    const btnMean = btn('2. Find Mean', true);

    controls.append(inputRow, btnGen, btnMean);

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
    
    // CHANGED: Append views first, then controls to put them at the bottom
    container.append(views, controls);
    el.appendChild(container);

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    // =========================
    // STATE
    // =========================
    const state = {
      raw: [],         
      mean: { x: 0, y: 0 },
      animMean: 0,     // Animation progress (0 to 1)
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

      // Scale based on the width of a single chart
      state.scale = rect1.width / 20; 
      renderFrame();
    }
    new ResizeObserver(resize).observe(views);

    // Transforms Math coords (x, y) to Canvas coords
    function toPix(canvas, x, y) {
      const w = parseFloat(canvas.style.width);
      const h = parseFloat(canvas.style.height);
      return {
        x: (w / 2) + (x * state.scale),
        y: (h / 2) - (y * state.scale) 
      };
    }

    function renderFrame() {
      const w1 = parseFloat(canvas1.style.width);
      const h1 = parseFloat(canvas1.style.height);
      const w2 = parseFloat(canvas2.style.width);
      const h2 = parseFloat(canvas2.style.height);
      
      ctx1.clearRect(0, 0, w1, h1);
      ctx2.clearRect(0, 0, w2, h2);

      // Draw Grid/Axes on Chart 1
      ctx1.strokeStyle = '#e1e4e8';
      ctx1.lineWidth = 2;
      ctx1.beginPath();
      ctx1.moveTo(0, h1/2); ctx1.lineTo(w1, h1/2); // X-axis
      ctx1.moveTo(w1/2, 0); ctx1.lineTo(w1/2, h1); // Y-axis
      ctx1.stroke();

      // Draw Grid/Axes on Chart 2 (X-axis only)
      ctx2.strokeStyle = '#e1e4e8';
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.moveTo(0, h2/2); ctx2.lineTo(w2, h2/2);
      ctx2.stroke();

      if (state.raw.length === 0) return;

      // 1. Draw Data Points
      state.raw.forEach(p => {
        // 2D Point
        const pPix1 = toPix(canvas1, p.x, p.y);
        ctx1.fillStyle = '#6a8ba4';
        ctx1.globalAlpha = 0.6;
        ctx1.beginPath();
        ctx1.arc(pPix1.x, pPix1.y, 4, 0, Math.PI * 2);
        ctx1.fill();

        // 1D Point (Projected onto X-axis)
        const pPix2 = toPix(canvas2, p.x, 0);
        ctx2.fillStyle = '#6a8ba4';
        ctx2.beginPath();
        ctx2.arc(pPix2.x, h2/2, 4, 0, Math.PI * 2);
        ctx2.fill();
      });
      ctx1.globalAlpha = 1.0;
      ctx2.globalAlpha = 1.0;

      // 2. Draw the Mean Point and Animations
      if (state.animMean > 0) {
        const meanPix1 = toPix(canvas1, state.mean.x, state.mean.y);
        const meanPix2 = toPix(canvas2, state.mean.x, 0);

        // Red Mean Dot in 2D
        ctx1.fillStyle = '#ff3b30';
        ctx1.beginPath();
        ctx1.arc(meanPix1.x, meanPix1.y, 7 * state.animMean, 0, Math.PI * 2);
        ctx1.fill();
        ctx1.strokeStyle = '#ffffff';
        ctx1.lineWidth = 2;
        ctx1.stroke();

        // Red Mean Dot in 1D
        ctx2.fillStyle = '#ff3b30';
        ctx2.beginPath();
        ctx2.arc(meanPix2.x, h2/2, 7 * state.animMean, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.strokeStyle = '#ffffff';
        ctx2.lineWidth = 2;
        ctx2.stroke();
      }
    }

    // =========================
    // ACTIONS
    // =========================
    function generate() {
      gsap.killTweensOf(state);
      state.animMean = 0;

      let n = parseInt(inputPoints.value);
      if (isNaN(n) || n < 10) n = 10;
      if (n > 200) n = 200;
      inputPoints.value = n;

      state.raw = [];
      const centerX = (Math.random() - 0.5) * 8;
      const centerY = (Math.random() - 0.5) * 8;

      for (let i = 0; i < n; i++) {
        const spreadX = 2 + Math.random() * 2;
        const spreadY = 2 + Math.random() * 2;
        
        state.raw.push({
          x: centerX + randn() * spreadX,
          y: centerY + randn() * spreadY
        });
      }

      btnMean.disabled = false;
      renderFrame();
    }

    function findMean() {
      let sumX = 0, sumY = 0;
      state.raw.forEach(p => { 
        sumX += p.x; 
        sumY += p.y; 
      });
      
      const n = state.raw.length;
      state.mean = { x: sumX / n, y: sumY / n };

      gsap.to(state, {
        animMean: 1, 
        duration: 0.8, 
        ease: "back.out(1.5)",
        onUpdate: renderFrame
      });

      btnMean.disabled = false;
    }

    // =========================
    // EVENTS & INIT
    // =========================
    btnGen.onclick = generate;
    btnMean.onclick = findMean;

    setTimeout(() => {
      resize();
      generate();
    }, 100);

    return () => {
      gsap.killTweensOf(state);
    };
  }
};
