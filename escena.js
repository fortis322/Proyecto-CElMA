/* CELMA · Visualizaciones didácticas del citoesqueleto.
 * Diagramas cualitativos: el tiempo y las distancias no son una simulación física.
 */
(function () {
  'use strict';

  const COLORS = {
    actin: '#50ded0', microtubules: '#77a7ff', intermediate: '#dfb6fa',
    energy: '#f9cb72', text: '#e5f1ff', muted: '#9cb9d0', background: '#071e36'
  };
  const TAU = Math.PI * 2;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const fract = n => n - Math.floor(n);
  const noise = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

  class CelmaScene {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.scale = 1;
      this.state = { mode: 'map', component: 'all', progress: 0, concentration: 1 };
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || 900));
      const height = Math.max(1, Math.round(rect.height || this.canvas.clientHeight || 560));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (width !== this.width || height !== this.height || dpr !== this.dpr) {
        this.width = width;
        this.height = height;
        this.dpr = dpr;
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
      }
      this.scale = Math.min(width / 1000, height / 620);
      this.offsetX = (width - 1000 * this.scale) / 2;
      this.offsetY = (height - 620 * this.scale) / 2;
    }

    render(next) {
      if (!this.ctx) return;
      this.state = Object.assign({}, this.state, next || {});
      this.state.progress = clamp(Number(this.state.progress) || 0, 0, 1);
      this.state.concentration = clamp(Math.round(Number(this.state.concentration) || 0), 0, 2);
      this.resize();
      const c = this.ctx;
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.clearRect(0, 0, this.width, this.height);
      const background = c.createRadialGradient(this.width * .51, this.height * .46, 0, this.width * .5, this.height * .5, this.width * .78);
      background.addColorStop(0, '#103855');
      background.addColorStop(.55, '#0b2946');
      background.addColorStop(1, COLORS.background);
      c.fillStyle = background;
      c.fillRect(0, 0, this.width, this.height);
      c.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale,
        this.dpr * this.offsetX, this.dpr * this.offsetY);
      c.save();
      this.background();
      if (this.state.mode !== 'process') this.map();
      else {
        switch (this.state.id) {
          case 'actin-growth': this.actinProcess('growth'); break;
          case 'actin-shrink': this.actinProcess('shrink'); break;
          case 'treadmilling': this.actinProcess('treadmill'); break;
          case 'critical': this.critical(); break;
          case 'motility': this.motility(); break;
          case 'contraction': this.contraction(); break;
          case 'micro-growth': this.microProcess('growth'); break;
          case 'micro-shrink': this.microProcess('shrink'); break;
          case 'catastrophe': this.microProcess('catastrophe'); break;
          case 'rescue': this.microProcess('rescue'); break;
          case 'transport': this.transport(); break;
          case 'intermediate': this.intermediate(); break;
          default: this.map();
        }
      }
      c.restore();
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    background() {
      const c = this.ctx;
      c.save();
      c.strokeStyle = 'rgba(149,193,222,.045)';
      c.lineWidth = 1;
      for (let x = 0; x <= 1000; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 620); c.stroke(); }
      for (let y = 0; y <= 620; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(1000, y); c.stroke(); }
      for (let i = 0; i < 74; i++) {
        const x = 30 + noise(i + 1) * 940;
        const y = 30 + noise(i + 112) * 560;
        this.circle(x, y, .9 + noise(i + 322) * 1.5, 'rgba(162,211,232,.14)');
      }
      c.restore();
    }

    circle(x, y, r, fill, stroke, lineWidth = 1) {
      const c = this.ctx;
      c.beginPath(); c.arc(x, y, Math.max(.01, r), 0, TAU);
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
    }

    ellipse(x, y, rx, ry, fill, stroke, lineWidth = 1, rotation = 0) {
      const c = this.ctx;
      c.beginPath(); c.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rotation, 0, TAU);
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
    }

    line(points, color, width = 2, alpha = 1, dash) {
      const c = this.ctx;
      c.save(); c.globalAlpha *= alpha; c.strokeStyle = color; c.lineWidth = width;
      c.lineCap = 'round'; c.lineJoin = 'round';
      if (dash) c.setLineDash(dash);
      c.beginPath();
      points.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.stroke(); c.restore();
    }

    curve(points, color, width = 2, alpha = 1) {
      const c = this.ctx;
      c.save(); c.globalAlpha *= alpha; c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round';
      c.beginPath(); c.moveTo(points[0], points[1]);
      c.bezierCurveTo(...points.slice(2)); c.stroke(); c.restore();
    }

    arrow(x1, y1, x2, y2, color = COLORS.text, width = 2.5, size = 10, alpha = 1) {
      const c = this.ctx;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      c.save(); c.globalAlpha *= alpha;
      this.line([[x1, y1], [x2, y2]], color, width);
      c.fillStyle = color;
      c.beginPath(); c.moveTo(x2, y2);
      c.lineTo(x2 - Math.cos(angle - .48) * size, y2 - Math.sin(angle - .48) * size);
      c.lineTo(x2 - Math.cos(angle + .48) * size, y2 - Math.sin(angle + .48) * size);
      c.closePath(); c.fill(); c.restore();
    }

    label(text, x, y, options = {}) {
      const c = this.ctx;
      const font = Math.max(options.size || 18, (options.small ? 9 : 10.5) / this.scale);
      const maxWidth = options.maxWidth || 260;
      c.save();
      c.font = `${options.bold ? 600 : 450} ${font}px Inter, system-ui, sans-serif`;
      c.fillStyle = options.color || COLORS.text;
      c.textAlign = options.align || 'center';
      c.textBaseline = 'middle';
      const rows = [];
      for (const paragraph of String(text).split('\n')) {
        let row = '';
        for (const word of paragraph.split(' ')) {
          const proposed = row ? row + ' ' + word : word;
          if (row && c.measureText(proposed).width > maxWidth) { rows.push(row); row = word; }
          else row = proposed;
        }
        rows.push(row);
      }
      const lineHeight = font * 1.28;
      rows.forEach((row, i) => c.fillText(row, x, y + i * lineHeight));
      c.restore();
      return rows.length * lineHeight;
    }

    tag(text, x, y, color, maxWidth = 300) {
      const c = this.ctx;
      const font = Math.max(16, 9.5 / this.scale);
      c.save(); c.font = `600 ${font}px Inter, system-ui, sans-serif`;
      const w = Math.min(maxWidth, c.measureText(text).width + 28);
      const h = font * 1.6;
      this.roundRect(x - w / 2, y - h / 2, w, h, 12, 'rgba(5,22,39,.85)', color, 1);
      this.label(text, x, y, { color, size: font, bold: true, maxWidth: maxWidth - 22, small: true });
      c.restore();
    }

    roundRect(x, y, w, h, radius, fill, stroke, lineWidth = 1) {
      const c = this.ctx;
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, radius);
      else {
        const r = Math.min(radius, w / 2, h / 2);
        c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r); c.closePath();
      }
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
    }

    bead(x, y, r = 11, color = COLORS.actin, highlight = false) {
      const c = this.ctx;
      const gradient = c.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r);
      gradient.addColorStop(0, highlight ? '#fff0b8' : '#d4fff4');
      gradient.addColorStop(.32, color);
      gradient.addColorStop(1, highlight ? '#967d36' : '#185e70');
      this.circle(x, y, r, gradient, color, .8);
      this.circle(x - r * .28, y - r * .29, r * .16, 'rgba(255,255,255,.45)');
    }

    actin(x1, x2, y, options = {}) {
      const c = this.ctx;
      const spacing = options.spacing || 19;
      const phase = options.phase || 0;
      const amp = options.amp || 9;
      const radius = options.radius || 11;
      const color = options.color || COLORS.actin;
      c.save(); c.globalAlpha *= options.alpha === undefined ? 1 : options.alpha;
      this.line([[x1, y], [x2, y]], color, radius * .95, .15);
      const count = Math.ceil((x2 - x1 + phase) / spacing);
      for (let strand = 0; strand < 2; strand++) {
        for (let i = -1; i <= count + 1; i++) {
          const x = x1 + i * spacing + (strand ? spacing / 2 : 0) - phase;
          if (x < x1 || x > x2) continue;
          const wave = Math.sin((x - x1 + phase) / 35 + strand * Math.PI);
          const cap = options.cap && x > x2 - (options.capSize || 75);
          this.bead(x, y + wave * amp, radius * (1 + wave * .065), cap ? COLORS.energy : color, !!cap);
        }
      }
      c.restore();
    }

    microtube(x1, x2, y, options = {}) {
      const c = this.ctx;
      const height = options.height || 60;
      const rows = 5;
      const cap = Math.max(0, options.cap === undefined ? 75 : options.cap);
      const spacing = options.spacing || 19;
      c.save(); c.globalAlpha *= options.alpha === undefined ? 1 : options.alpha;
      const body = c.createLinearGradient(0, y - height / 2, 0, y + height / 2);
      body.addColorStop(0, 'rgba(119,167,255,.25)'); body.addColorStop(.5, 'rgba(65,98,160,.6)');
      body.addColorStop(1, 'rgba(28,59,101,.25)');
      this.roundRect(x1, y - height / 2, Math.max(1, x2 - x1), height, height / 2, body);
      for (let row = 0; row < rows; row++) {
        const yy = y - height * .4 + row * height * .2;
        this.line([[x1 + 5, yy], [x2 - 4, yy]], '#8bb7ff', 1, .22);
        const rowScale = 1 - Math.abs(row - 2) * .12;
        for (let x = x1 + 11 + (row % 2) * 3; x < x2 - 3; x += spacing) {
          const gold = x > x2 - cap;
          const fill = gold ? (row % 2 ? '#d0b773' : COLORS.energy) : (row % 2 ? '#4f80c4' : '#79aaff');
          this.ellipse(x, yy, spacing * .43, height * .094 * rowScale, fill, 'rgba(202,230,255,.26)', .65);
          this.ellipse(x - 2, yy - 1.5, spacing * .19, height * .025, 'rgba(255,255,255,.3)');
        }
      }
      this.ellipse(x1, y, 9, height / 2, '#132e4e', '#83b4ff', 2);
      this.ellipse(x1, y, 5, height * .32, '#061a30', '#4375b5', 1);
      if (!options.peel) this.ellipse(x2, y, 7, height / 2, 'rgba(129,170,233,.13)', cap ? COLORS.energy : '#82abec', 1.5);
      if (options.peel) {
        const amount = options.peel;
        for (let row = 0; row < rows; row++) {
          const yy = y - height * .4 + row * height * .2;
          const direction = (row - 2) / 2 || .22;
          const path = [x2 - 14, yy, x2 + 37 * amount, yy, x2 + 68 * amount, yy + direction * 68 * amount, x2 + 39 * amount, yy + direction * 98 * amount];
          this.curve(path, '#86b2ff', 5, .75);
          for (let i = 1; i <= 6; i++) {
            const t = i / 6;
            const x = (1-t)**3*path[0]+3*(1-t)**2*t*path[2]+3*(1-t)*t*t*path[4]+t**3*path[6];
            const yb = (1-t)**3*path[1]+3*(1-t)**2*t*path[3]+3*(1-t)*t*t*path[5]+t**3*path[7];
            this.ellipse(x, yb, 7, 4.5, '#78a8f6', '#c0dcff', .6, direction * t);
          }
        }
      }
      c.restore();
    }

    ends(x1, x2, y, color, below = false) {
      this.tag('−', x1 - 35, y + (below ? 48 : 0), color, 80);
      this.tag('+', x2 + 35, y + (below ? 48 : 0), color, 80);
    }

    map() {
      const c = this.ctx;
      const selected = this.state.component || 'all';
      const intensity = key => selected === 'all' || selected === key ? 1 : .17;
      const p = this.state.progress;
      c.save();
      const cytoplasm = c.createRadialGradient(480, 300, 20, 500, 315, 440);
      cytoplasm.addColorStop(0, 'rgba(41,90,121,.27)'); cytoplasm.addColorStop(1, 'rgba(28,71,100,.13)');
      this.ellipse(500, 316, 422, 239, cytoplasm, 'rgba(162,205,226,.48)', 3);
      this.ellipse(500, 316, 412, 230, null, 'rgba(145,197,228,.11)', 8);
      // Transparent peripheral organelles give the network depth without hiding it.
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU + .15;
        const x = 500 + Math.cos(a) * (265 + noise(i + 20) * 75);
        const y = 316 + Math.sin(a) * 160;
        this.ellipse(x, y, 31, 12, 'rgba(107,150,165,.045)', 'rgba(127,173,184,.11)', 1, a + .4);
      }
      // Radial microtubules originate at the centrosome beside the nucleus.
      c.save(); c.globalAlpha = intensity('microtubules');
      for (let i = 0; i < 27; i++) {
        const a = i / 27 * TAU;
        const endX = 500 + Math.cos(a) * (370 + noise(i + 30) * 25);
        const endY = 316 + Math.sin(a) * (198 + noise(i + 60) * 20);
        const path = [547, 245, 555 + Math.cos(a) * 110, 248 + Math.sin(a) * 78, endX - Math.cos(a) * 100, endY - Math.sin(a) * 45, endX, endY];
        this.curve(path, COLORS.microtubules, 3.6, .7);
        this.curve(path.map((v, j) => j % 2 ? v + 3 : v), '#bed4ff', .65, .4);
        const t = fract(p * .75 + i * .159);
        const x = (1-t)**3*path[0]+3*(1-t)**2*t*path[2]+3*(1-t)*t*t*path[4]+t**3*path[6];
        const y = (1-t)**3*path[1]+3*(1-t)**2*t*path[3]+3*(1-t)*t*t*path[5]+t**3*path[7];
        this.circle(x, y, 3.4, '#d8e8ff');
      }
      c.restore();
      // Nonpolar, sinuous intermediate filaments form a mechanical cage.
      c.save(); c.globalAlpha = intensity('intermediate');
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU;
        const x1 = 427 + Math.cos(a) * 168;
        const y1 = 335 + Math.sin(a) * 111;
        const x2 = 500 + Math.cos(a + .19) * 339;
        const y2 = 315 + Math.sin(a + .19) * 195;
        this.curve([x1, y1, x1 + Math.cos(a + .8) * 100, y1 + Math.sin(a + .8) * 65, x2 - Math.cos(a - .4) * 115, y2 - Math.sin(a - .4) * 78, x2, y2], COLORS.intermediate, 2.6, .61);
      }
      for (let ring = 0; ring < 3; ring++) {
        const points = [];
        for (let i = 0; i <= 110; i++) {
          const a = i / 110 * TAU;
          const wobble = Math.sin(a * 7 + ring) * 9;
          points.push([427 + Math.cos(a) * (168 + ring * 14 + wobble), 334 + Math.sin(a) * (110 + ring * 10 + wobble)]);
        }
        this.line(points, COLORS.intermediate, 2.3, .5);
      }
      c.restore();
      // Branched cortical actin follows the cell membrane.
      c.save(); c.globalAlpha = intensity('actin');
      for (let layer = 0; layer < 3; layer++) {
        const points = [];
        for (let i = 0; i <= 180; i++) {
          const a = i / 180 * TAU;
          points.push([500 + Math.cos(a) * (395 - layer * 10 + Math.sin(a * 11) * 3), 316 + Math.sin(a) * (216 - layer * 8 + Math.sin(a * 9) * 3)]);
        }
        this.line(points, COLORS.actin, 2.7, .72);
      }
      for (let i = 0; i < 75; i++) {
        const a = i / 75 * TAU;
        const x = 500 + Math.cos(a) * 385, y = 316 + Math.sin(a) * 208;
        const bx = x - Math.cos(a + .4) * (24 + noise(i) * 33);
        const by = y - Math.sin(a + .4) * (20 + noise(i) * 32);
        this.line([[x, y], [bx, by]], COLORS.actin, 2, .75);
        this.line([[lerp(x, bx, .55), lerp(y, by, .55)], [bx + Math.sin(a) * 15, by - Math.cos(a) * 12]], COLORS.actin, 1.6, .52);
        this.circle(x, y, 2.1, '#8af3df');
      }
      c.restore();
      const nucleus = c.createRadialGradient(395, 309, 12, 427, 334, 140);
      nucleus.addColorStop(0, '#1c4a67'); nucleus.addColorStop(1, '#16374f');
      this.ellipse(427, 334, 139, 97, nucleus, '#688aab', 2.4, -.16);
      this.ellipse(427, 334, 129, 88, null, 'rgba(147,180,213,.22)', 1.4, -.16);
      for (let i = 0; i < 18; i++) {
        const a = noise(i + 89) * TAU;
        const rr = noise(i + 94) * 80;
        this.curve([427 + Math.cos(a) * rr, 334 + Math.sin(a) * rr * .6, 400 + Math.cos(a) * rr, 330, 465, 355 + Math.sin(a) * rr * .6, 427 + Math.cos(a + .7) * rr, 334 + Math.sin(a + .7) * rr * .6], '#8fb0d2', 1.2, .12);
      }
      this.ellipse(405, 319, 26, 20, '#315e7f', 'rgba(145,184,213,.23)', 1);
      this.label('Núcleo', 425, 368, { size: 16, color: '#bed1e2', maxWidth: 160 });
      c.save(); c.translate(547, 245); c.rotate(-.45);
      this.roundRect(-17, -7, 35, 14, 4, '#a98c55', COLORS.energy, 1.4);
      c.rotate(Math.PI / 2); this.roundRect(-17, -7, 35, 14, 4, '#c09d58', COLORS.energy, 1.4); c.restore();
      this.line([[554, 232], [584, 197], [619, 197]], COLORS.energy, 1.2, .8);
      this.label('Centrosoma', 623, 196, { size: 15, color: COLORS.energy, align: 'left', maxWidth: 220, small: true });
      if (selected === 'all' || selected === 'actin') {
        this.line([[214, 112], [257, 151]], COLORS.actin, 1.4, .75);
        this.label('Actina', 196, 77, { color: COLORS.actin, bold: true, maxWidth: 225 });
        this.label('Corteza celular', 196, 103, { color: COLORS.muted, size: 14, maxWidth: 225, small: true });
      }
      if (selected === 'all' || selected === 'microtubules') {
        this.line([[802, 143], [756, 222]], COLORS.microtubules, 1.4, .75);
        this.label('Microtúbulos', 795, 78, { color: COLORS.microtubules, bold: true, maxWidth: 285 });
        this.label('Red radial', 795, 107, { color: COLORS.muted, size: 14, maxWidth: 240, small: true });
      }
      if (selected === 'all' || selected === 'intermediate') {
        this.line([[745, 486], [686, 438]], COLORS.intermediate, 1.4, .75);
        this.label('Filamentos intermedios', 764, 507, { color: COLORS.intermediate, bold: true, maxWidth: 360 });
      }
      this.label('Membrana plasmática', 233, 547, { color: COLORS.muted, size: 14, maxWidth: 320, small: true });
      c.restore();
    }

    actinProcess(type) {
      const p = this.state.progress;
      const stage = Math.min(3, Math.floor(p * 4));
      const cycle = fract(p * 4);
      let x1 = 230, x2 = 650;
      if (type === 'growth' && p < .5) {
        const nucleating = p >= .25;
        const converge = smooth(clamp((p - .25) / .19, 0, 1));
        for (let i = 0; i < 9; i++) {
          const angle = i / 9 * TAU;
          let x = 500 + Math.cos(angle) * (145 + noise(i + 7) * 80);
          let y = 306 + Math.sin(angle) * (95 + noise(i + 8) * 30);
          if (nucleating && i < 3) {
            x = lerp(x, 481 + i * 19, converge);
            y = lerp(y, 310 + (i % 2 ? 9 : -4), converge);
          } else {
            x += Math.sin(p * TAU * 2 + i) * 8;
            y += Math.cos(p * TAU * 2 + i) * 6;
          }
          this.bead(x, y, 13, COLORS.energy, true);
        }
        this.label(nucleating ? 'Núcleo de tres monómeros' : 'Monómeros de G-actina', 500, 115,
          { color: COLORS.actin, bold: true, size: 22, maxWidth: 770 });
        if (nucleating) {
          this.ellipse(500, 312, 62, 35, null, 'rgba(80,222,208,.5)', 1.5);
          this.line([[500, 348], [500, 407]], COLORS.actin, 1.2, .65);
          this.label('Nucleación', 500, 439, { color: COLORS.actin, bold: true, maxWidth: 540 });
        }
        this.tag('Actina unida a ATP', 500, 534, COLORS.energy, 465);
        return;
      }
      if (type === 'growth') {
        const elongation = smooth(clamp((p - .5) / .25, 0, 1));
        x1 = lerp(481, 230, elongation);
        x2 = lerp(520, 725, elongation);
      }
      if (type === 'shrink') x2 = 740 - clamp((p - .25) / .6, 0, 1) * 180;
      const capSize = type === 'growth' && stage === 3 ? 80 - (p - .75) * 120 : 80;
      this.actin(x1, x2, 316, { cap: type !== 'shrink', capSize, phase: type === 'treadmill' && stage > 0 ? (p - .25) * 102 : 0 });
      this.ends(x1, x2, 316, COLORS.actin, true);
      this.label('F-actina · dos hebras helicoidales', 492, 470, { color: COLORS.actin, maxWidth: 590, size: 20, bold: true });
      if ((type === 'growth' && stage < 3) || (type === 'treadmill' && stage > 0)) {
        for (let i = 0; i < 4; i++) {
          const t = fract(cycle + i * .25);
          const x = lerp(x2 + 150, x2 + 12, smooth(t));
          const y = lerp(179 - i * 10, 311, smooth(t));
          this.bead(x, y, 12, COLORS.energy, true);
        }
        this.arrow(x2 + 130, 234, x2 + 29, 290, COLORS.energy, 2.5, 11, .8);
        this.label('Actina–ATP', 755, 132, { color: COLORS.energy, maxWidth: 290, bold: true });
        this.label('Incorporación al extremo +', 730, 167, { color: COLORS.muted, size: 15, maxWidth: 340, small: true });
        this.label('ATP → ADP + Pi', 486, 398, { color: COLORS.muted, size: 15, maxWidth: 310, small: true });
      }
      if ((type === 'shrink' && stage > 0) || (type === 'treadmill' && stage > 1)) {
        const end = type === 'treadmill' ? x1 : x2;
        const direction = type === 'treadmill' ? -1 : 1;
        for (let i = 0; i < 4; i++) {
          const t = fract(cycle + i * .25);
          const x = end + direction * (16 + t * 125);
          const y = 320 + Math.sin(t * Math.PI / 2) * (70 + i * 11);
          const recycled = type === 'shrink' && stage === 3;
          this.bead(x, y, 11, recycled ? COLORS.energy : '#58a5b2', recycled);
        }
        this.arrow(end + direction * 25, 340, end + direction * 123, 417, COLORS.actin, 2.4, 11, .8);
        this.label(type === 'shrink' && stage === 3 ? 'Actina–ATP' : 'Actina–ADP', type === 'treadmill' ? 178 : 790, type === 'treadmill' ? 153 : 160, { color: COLORS.actin, maxWidth: 290, bold: true });
        this.label(type === 'shrink' && stage === 3 ? 'ADP → ATP · reciclaje' : 'Liberación de subunidades', type === 'treadmill' ? 187 : 788, type === 'treadmill' ? 185 : 193, { color: COLORS.muted, size: 15, maxWidth: 290, small: true });
      }
      if (type === 'growth' && stage === 3) {
        this.label('Maduración · ATP → ADP + Pi', 500, 139, { color: COLORS.energy, bold: true, maxWidth: 760 });
        this.label('El interior más antiguo se enriquece en actina–ADP', 500, 190, { color: COLORS.muted, size: 15, maxWidth: 810, small: true });
      }
      if (type === 'shrink' && stage === 2) {
        for (let i = 0; i < 7; i++) this.ellipse(300 + i * 31, 314 + (i % 2 ? 22 : -22), 10, 7, COLORS.intermediate, '#f0d7ff', .8, i % 2 ? -.3 : .3);
        this.label('Cofilina · recambio regulado', 429, 162, { color: COLORS.intermediate, bold: true, maxWidth: 520 });
      }
      if (type === 'treadmill') {
        if (stage > 0) {
          this.arrow(613, 254, 315, 254, COLORS.actin, 2, 11, .75);
          const markerX = 615 - clamp((p - .25) / .75, 0, 1) * 285;
          this.circle(markerX, 316, 15, null, '#edfff9', 2.2);
        }
        this.tag(stage === 0 ? 'Cc+ < C < Cc−' : 'Longitud media constante', 500, 540, COLORS.actin, 470);
      } else this.tag(type === 'growth' ? 'Polimerización' : 'Despolimerización', 500, 539, COLORS.actin, 400);
    }

    critical() {
      const p = this.state.progress, concentration = this.state.concentration;
      const states = [
        { equation: 'C < Cc+', title: 'Ambos extremos pierden subunidades', left: -1, right: -1 },
        { equation: 'Cc+ < C < Cc−', title: 'Crece el + · se acorta el −', left: -1, right: 1 },
        { equation: 'C > Cc−', title: 'Ambos extremos incorporan subunidades', left: 1, right: 1 }
      ];
      const state = states[concentration];
      const x1 = 300 - state.left * p * 72;
      const x2 = 700 + state.right * p * 72;
      this.actin(x1, x2, 310, { cap: true, phase: concentration === 1 ? p * 65 : 0 });
      this.ends(x1, x2, 310, COLORS.actin, true);
      this.tag(state.equation, 500, 102, COLORS.energy, 370);
      this.label(state.title, 500, 160, { bold: true, maxWidth: 820, size: 21 });
      const arrowLength = 68;
      if (state.left > 0) this.arrow(x1 - 96, 242, x1 - 18, 284, COLORS.energy, 3, 12);
      else this.arrow(x1 - 18, 284, x1 - 96, 242, COLORS.actin, 3, 12);
      if (state.right > 0) this.arrow(x2 + 96, 242, x2 + 18, 284, COLORS.energy, 3, 12);
      else this.arrow(x2 + 18, 284, x2 + 96, 242, COLORS.actin, 3, 12);
      for (let side = 0; side < 2; side++) {
        const grows = side ? state.right > 0 : state.left > 0;
        for (let i = 0; i < 3; i++) {
          const t = fract(p * 3 + i / 3);
          const flow = grows ? 1 - t : t;
          const x = (side ? x2 : x1) + (side ? 1 : -1) * (15 + flow * 100);
          const y = 308 - flow * 105;
          this.bead(x, y, 10, grows ? COLORS.energy : COLORS.actin, grows);
        }
      }
      this.label('Cc+ < Cc−', 500, 444, { color: COLORS.energy, bold: true, size: 20, maxWidth: 340 });
      this.label('C: concentración de actina libre\nCc: umbral de crecimiento de cada extremo', 500, 491, { color: COLORS.muted, size: 15, maxWidth: 775, small: true });
    }

    motility() {
      const c = this.ctx, p = this.state.progress;
      const stage = Math.min(3, Math.floor(p * 4));
      const move = clamp((p - .5) / .5, 0, 1) * 60;
      const edge = 770 + clamp(p / .25, 0, 1) * 30 + move * .8;
      this.line([[105, 479], [924, 479]], '#5c7c95', 3);
      for (let i = 0; i < 28; i++) this.line([[110 + i * 30, 490], [121 + i * 30, 481]], '#4c6d85', 1.3, .5);
      const membrane = c.createLinearGradient(180, 200, edge, 440);
      membrane.addColorStop(0, 'rgba(64,114,141,.27)'); membrane.addColorStop(1, 'rgba(55,172,158,.22)');
      c.beginPath(); c.moveTo(238 + move, 444);
      c.bezierCurveTo(119 + move, 387, 144 + move, 235, 314 + move, 220);
      c.bezierCurveTo(516 + move, 185, 538 + move, 288, 667 + move, 321);
      c.bezierCurveTo(752 + move, 339, edge - 12, 345, edge, 407);
      c.bezierCurveTo(edge + 1, 439, 730 + move, 451, 678 + move, 446);
      c.bezierCurveTo(505 + move, 476, 386 + move, 480, 238 + move, 444);
      c.closePath(); c.fillStyle = membrane; c.fill(); c.strokeStyle = '#72cfca'; c.lineWidth = 3; c.stroke();
      this.ellipse(332 + move, 345, 78, 58, 'rgba(52,92,122,.85)', '#698eac', 2, -.2);
      this.label('Núcleo', 332 + move, 352, { color: COLORS.muted, size: 15, maxWidth: 150, small: true });
      // Arp2/3-like branching is schematic: newly assembled filaments push the edge.
      for (let i = 0; i < 19; i++) {
        const y = 351 + i * 4.5;
        const x1 = 491 + move + noise(i + 32) * 114;
        const x2 = edge - 14 - Math.abs(i - 9) * 3;
        this.line([[x1, y + 33], [x2, y]], COLORS.actin, 3.7, .72);
        for (let j = 0; j < 3; j++) {
          const bx = lerp(x1, x2, .35 + j * .18);
          const by = lerp(y + 33, y, .35 + j * .18);
          this.line([[bx, by], [bx + 43, by - 22]], COLORS.actin, 2.3, .75);
          this.circle(bx, by, 3.6, '#98f4dd');
        }
        this.circle(x2, y, 3.4, COLORS.energy);
      }
      for (let i = 0; i < 6; i++) {
        const x = 378 + i * 69;
        const active = stage > 0 && (stage < 3 || i > 1);
        this.ellipse(x, 470, 18, 6, active ? '#d4ac62' : 'rgba(212,172,98,.26)', COLORS.energy, .8);
        this.line([[x, 463], [x - 10 + move * .2, 431]], COLORS.energy, 2, active ? .8 : .2);
      }
      if (stage > 1) {
        for (let i = 0; i < 4; i++) {
          const x = 418 + i * 44;
          this.line([[x - 23, 406], [x + 29, 401]], COLORS.intermediate, 4, .85);
          this.line([[x - 20, 406], [x - 33, 389]], COLORS.intermediate, 2.8);
          this.line([[x + 24, 402], [x + 37, 415]], COLORS.intermediate, 2.8);
        }
        this.arrow(406 + move, 437, 468 + move, 437, COLORS.intermediate, 2, 9, .9);
        this.label('Miosina II · tracción', 289, 156, { color: COLORS.intermediate, size: 16, maxWidth: 310 });
      }
      this.arrow(544 + move, 253, 779 + move, 253, COLORS.actin, 3, 13);
      this.label('Avance celular', 668 + move, 208, { color: COLORS.actin, bold: true, maxWidth: 320 });
      this.arrow(edge - 44, 424, edge - 183, 424, '#b5eade', 2, 10, .7);
      this.label('Lamellipodio', 760, 121, { color: COLORS.actin, bold: true, maxWidth: 320 });
      this.label('Red ramificada de actina', 760, 153, { color: COLORS.muted, size: 15, maxWidth: 340, small: true });
      this.line([[767, 183], [edge - 60, 341]], COLORS.actin, 1.2, .55);
      this.label('Adhesiones al sustrato', 553, 536, { color: COLORS.energy, size: 17, maxWidth: 500 });
      this.label('Flujo retrógrado', 721, 584, { color: COLORS.muted, size: 14, maxWidth: 390, small: true });
    }

    contraction() {
      const p = this.state.progress;
      const stage = Math.min(3, Math.floor(p * 4));
      const slide = clamp((p - .5) / .5, 0, 1);
      const left = 195 + slide * 64, right = 805 - slide * 64;
      const c = this.ctx;
      this.roundRect(left - 10, 231, 16, 184, 5, '#4b8b93', '#91e8df', 1);
      this.roundRect(right - 6, 231, 16, 184, 5, '#4b8b93', '#91e8df', 1);
      this.actin(left + 13, 555 + slide * 64, 277, { radius: 9, amp: 7, spacing: 16 });
      this.actin(445 - slide * 64, right - 13, 367, { radius: 9, amp: 7, spacing: 16 });
      this.tag('+', 574 + slide * 64, 277, COLORS.actin, 70);
      this.tag('+', 426 - slide * 64, 367, COLORS.actin, 70);
      this.tag('−', left - 42, 277, COLORS.actin, 70);
      this.tag('−', right + 42, 367, COLORS.actin, 70);
      const gradient = c.createLinearGradient(345, 0, 655, 0);
      gradient.addColorStop(0, '#9170b3'); gradient.addColorStop(.5, '#e5c1fc'); gradient.addColorStop(1, '#9170b3');
      this.roundRect(347, 314, 306, 15, 7, gradient, COLORS.intermediate, .9);
      for (let i = 0; i < 6; i++) {
        const x = 374 + i * 50;
        const wave = Math.sin(p * TAU * 4 + i * .6) * 9;
        const leftHead = i < 3;
        const yy = (leftHead ? 282 : 362) + (stage === 1 ? (leftHead ? 12 : -12) : 0);
        const xx = x + (leftHead ? 18 : -18) + wave;
        this.curve([x, 321, x, leftHead ? 294 : 350, xx - 12, yy + (leftHead ? 7 : -7), xx, yy], COLORS.intermediate, 3.5, .9);
        this.ellipse(xx, yy, 11, 7, COLORS.intermediate, '#f7e8ff', 1, leftHead ? -.4 : .4);
        if (stage > 0) this.circle(xx - 7, yy + (leftHead ? 8 : -8), 3.8, COLORS.energy);
      }
      this.arrow(275, 177, 409, 177, COLORS.actin, 3, 12);
      this.arrow(725, 177, 591, 177, COLORS.actin, 3, 12);
      this.label('Deslizamiento de la actina', 500, 115, { color: COLORS.actin, size: 22, bold: true, maxWidth: 670 });
      this.label('Miosina II · consume ATP', 500, 457, { color: COLORS.intermediate, bold: true, maxWidth: 660 });
      this.line([[500, 430], [500, 343]], COLORS.intermediate, 1.4, .7);
      this.line([[left, 497], [right, 497]], '#9cb9d0', 1, .5);
      this.line([[left, 486], [left, 508]], '#9cb9d0', 1.5, .7);
      this.line([[right, 486], [right, 508]], '#9cb9d0', 1.5, .7);
      this.label('La distancia disminuye; los filamentos conservan su longitud', 500, 552, { color: COLORS.muted, size: 15, maxWidth: 780, small: true });
    }

    microProcess(type) {
      const p = this.state.progress;
      const stage = Math.min(3, Math.floor(p * 4));
      let length = 440, cap = 77, peel = 0;
      let title = 'Incorporación de tubulina–GTP';
      let growing = true;
      if (type === 'growth') {
        length = stage < 2 ? 42 + p * 96 : 90 + smooth(clamp((p - .5) / .25, 0, 1)) * 485;
        cap = Math.min(77, length * .5);
        title = ['Nucleación · plantilla de γ-tubulina', 'Dímeros disponibles de tubulina α/β', 'Elongación por el extremo +', 'Casquete terminal estabilizador'][stage];
      }
      if (type === 'shrink') {
        length = 590 - clamp((p - .45) / .35, 0, 1) * 240;
        cap = 0; peel = clamp((p - .25) / .2, 0, 1) * .8;
        growing = false;
        title = ['Extremo inestable · cuerpo rico en GDP', 'Curvatura de los protofilamentos', 'Liberación de tubulina–GDP', 'Reciclaje · GDP → GTP'][stage];
      }
      if (type === 'catastrophe') {
        const collapse = clamp((p - .5) / .5, 0, 1);
        length = 460 + Math.min(p, .5) * 100 - collapse * 195;
        cap = p < .25 ? 77 : 77 * (1 - clamp((p - .25) / .25, 0, 1));
        peel = p < .5 ? 0 : Math.min(1, (p - .5) * 6);
        growing = p < .5;
        title = ['Crecimiento · casquete estabilizador', 'El casquete de GTP se reduce', 'Pérdida del casquete → transición', 'Acortamiento rápido'][stage];
      }
      if (type === 'rescue') {
        const recovery = clamp((p - .5) / .5, 0, 1);
        length = 510 - Math.min(p / .25, 1) * 135 + recovery * 220;
        cap = p < .25 ? 0 : p < .5 ? 22 * ((p - .25) / .25) : 22 + recovery * 55;
        peel = p < .25 ? .8 : .8 * Math.max(0, 1 - (p - .25) * 4);
        growing = p >= .5;
        title = ['Fase de acortamiento', 'Estabilización local del extremo', 'Se restablece el crecimiento', 'Nueva elongación'][stage];
      }
      const x1 = 185, x2 = x1 + length;
      this.microtube(x1, x2, 314, { cap, peel });
      this.ends(x1, x2, 314, COLORS.microtubules, true);
      this.label(title, 500, 103, { size: 22, bold: true, maxWidth: 820, color: growing ? COLORS.energy : COLORS.microtubules });
      this.label('Dímero α/β-tubulina', 772, 163, { color: growing ? COLORS.energy : COLORS.microtubules, maxWidth: 340, size: 17 });
      for (let i = 0; i < 4; i++) {
        const t = fract(p * 4 + i * .25);
        const flow = growing ? 1 - t : t;
        const xx = x2 + 16 + flow * 120;
        const yy = 305 - flow * (105 + i * 12);
        const recycled = type === 'shrink' && stage === 3;
        this.ellipse(xx - 5, yy, 7, 5.2, growing || recycled ? COLORS.energy : '#78a7ef', '#cce0ff', .6, -.5);
        this.ellipse(xx + 5, yy - 4, 7, 5.2, growing || recycled ? '#d4b263' : '#527fcc', '#cce0ff', .6, -.5);
      }
      if (type === 'growth' && stage === 0) {
        this.ellipse(x1 - 7, 314, 13, 44, null, COLORS.intermediate, 4);
        for (let i = 0; i < 13; i++) this.circle(x1 - 7 + Math.cos(i / 13 * TAU) * 12, 314 + Math.sin(i / 13 * TAU) * 43, 3.7, COLORS.intermediate);
        this.label('γ-TuRC', 138, 432, { color: COLORS.intermediate, size: 16, maxWidth: 200, bold: true });
      }
      if (cap > 7) {
        this.line([[x2 - cap / 2, 275], [x2 - cap / 2 - 15, 214]], COLORS.energy, 1.4, .8);
        this.label('Casquete de GTP', x2 - cap / 2 - 50, 186, { color: COLORS.energy, maxWidth: 285, size: 16, bold: true });
      } else if (peel > .05) {
        this.label('Protofilamentos curvados', x2 + 54, 441, { color: COLORS.microtubules, maxWidth: 370, size: 16 });
      }
      if (growing) this.arrow(x2 + 90, 247, x2 + 19, 280, COLORS.energy, 2.5, 10);
      else this.arrow(x2 + 29, 277, x2 + 112, 227, COLORS.microtubules, 2.5, 10);
      this.label('Microtúbulo · 13 protofilamentos', 468, 490, { color: COLORS.microtubules, maxWidth: 700, bold: true, size: 20 });
      this.label('Tubo hueco; la vista muestra parte de la pared', 500, 531, { color: COLORS.muted, maxWidth: 780, size: 15, small: true });
      this.label('GTP → GDP + Pi', 403, 415, { color: COLORS.muted, maxWidth: 340, size: 15, small: true });
    }

    motor(x, y, top, phase, color) {
      const sign = top ? -1 : 1;
      const stride = Math.sin(phase * TAU) * 11;
      this.line([[x, y + sign * 8], [x - 16 + stride, y]], color, 4);
      this.line([[x, y + sign * 8], [x + 16 - stride, y]], color, 4);
      this.ellipse(x - 16 + stride, y, 10, 5, color, '#fff1bc', .6);
      this.ellipse(x + 16 - stride, y, 10, 5, color, '#fff1bc', .6);
      this.curve([x, y + sign * 8, x + 4, y + sign * 27, x - 4, y + sign * 50, x, y + sign * 67], color, 4);
      this.circle(x, y + sign * 12, 9, color, '#fff1bc', .6);
    }

    vesicle(x, y, r, color) {
      const c = this.ctx;
      const fill = c.createRadialGradient(x - r * .35, y - r * .35, 3, x, y, r);
      fill.addColorStop(0, 'rgba(130,203,214,.4)'); fill.addColorStop(1, 'rgba(26,74,98,.8)');
      this.circle(x, y, r, fill, color, 3);
      this.circle(x, y, r - 5, null, color, 1);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * TAU;
        this.circle(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5, 4 + (i % 3), 'rgba(153,211,223,.36)');
      }
    }

    transport() {
      const p = this.state.progress;
      const travel = smooth(clamp((p - .5) / .5, 0, 1));
      const docking = 1 - clamp(p / .25, 0, 1);
      const kinesinX = 270 + travel * 448, dyneinX = 730 - travel * 448;
      this.microtube(161, 839, 320, { cap: 63, height: 54 });
      this.ends(161, 839, 320, COLORS.microtubules, false);
      this.motor(kinesinX, 287, true, p > .5 ? p * 13 : 0, COLORS.actin);
      this.vesicle(kinesinX, 181 - docking * 42, 39, COLORS.actin);
      this.motor(dyneinX, 353, false, p > .5 ? p * 11 : 0, COLORS.intermediate);
      this.vesicle(dyneinX, 454 + docking * 31, 36, COLORS.intermediate);
      this.arrow(255, 95, 740, 95, COLORS.actin, 2.8, 13);
      this.label('Kinesina-1 → extremo +', 500, 53, { color: COLORS.actin, bold: true, maxWidth: 700, size: 20 });
      this.arrow(742, 548, 258, 548, COLORS.intermediate, 2.8, 13);
      this.label('Dineína → extremo −', 500, 592, { color: COLORS.intermediate, bold: true, maxWidth: 700, size: 20 });
      this.label('Vesícula', 872, 196, { color: COLORS.muted, size: 15, maxWidth: 190, small: true });
      this.line([[835, 211], [kinesinX + 39, 191]], COLORS.muted, 1, .35);
      this.tag('ATP', 135, 431, COLORS.energy, 145);
      this.label('Transporte dirigido', 500, 378, { color: COLORS.microtubules, size: 15, maxWidth: 475, small: true });
    }

    intermediate() {
      const p = this.state.progress;
      const stage = Math.min(3, Math.floor(p * 4));
      const c = this.ctx;
      const cableY = 386;
      // Assembly of parallel coiled-coil dimers and antiparallel tetramers.
      c.save(); c.globalAlpha = stage === 0 ? 1 : .6;
      for (let strand = 0; strand < 2; strand++) {
        const points = [];
        for (let i = 0; i <= 48; i++) {
          const x = 131 + i * 3;
          points.push([x, 190 + Math.sin(i / 4 + strand * Math.PI) * 8]);
        }
        this.line(points, strand ? '#a882bf' : '#e8caff', 4);
      }
      c.restore(); c.save(); c.globalAlpha = stage === 1 ? 1 : .6;
      for (let lane = 0; lane < 2; lane++) {
        for (let strand = 0; strand < 2; strand++) {
          const points = [];
          for (let i = 0; i <= 48; i++) {
            const x = 417 + i * 3 + (lane ? 25 : 0);
            points.push([x, 185 + lane * 15 + Math.sin(i / 4 + strand * Math.PI) * 5]);
          }
          this.line(points, strand ? '#a882bf' : '#e8caff', 3);
        }
      }
      c.restore(); c.save(); c.globalAlpha = stage === 2 ? 1 : .6;
      for (let lane = 0; lane < 5; lane++) {
        const points = [];
        for (let i = 0; i <= 48; i++) points.push([719 + i * 3, 172 + lane * 9 + Math.sin(i / 4 + lane) * 3]);
        this.line(points, lane % 2 ? '#b695d5' : '#e7c9ff', 3);
      }
      c.restore();
      this.arrow(301, 190, 382, 190, COLORS.intermediate, 2, 10, .6);
      this.arrow(602, 190, 684, 190, COLORS.intermediate, 2, 10, .6);
      this.label('Dímero', 205, 112, { color: COLORS.intermediate, maxWidth: 270, bold: true, size: 19 });
      this.label('Tetrámero', 500, 112, { color: COLORS.intermediate, maxWidth: 270, bold: true, size: 19 });
      this.label('Unión lateral', 792, 112, { color: COLORS.intermediate, maxWidth: 290, bold: true, size: 19 });
      this.label('Dos cadenas enrolladas', 205, 239, { color: COLORS.muted, maxWidth: 260, size: 14, small: true });
      this.label('Disposición antiparalela', 500, 239, { color: COLORS.muted, maxWidth: 285, size: 14, small: true });
      this.label('Compactación', 792, 239, { color: COLORS.muted, maxWidth: 265, size: 14, small: true });
      this.arrow(790, 288, 729, 341, COLORS.intermediate, 2, 10, .6);
      const gradient = c.createLinearGradient(0, cableY - 23, 0, cableY + 23);
      gradient.addColorStop(0, 'rgba(223,182,250,.07)'); gradient.addColorStop(.5, 'rgba(223,182,250,.28)'); gradient.addColorStop(1, 'rgba(223,182,250,.04)');
      this.roundRect(151, cableY - 23, 698, 46, 22, gradient);
      for (let strand = 0; strand < 10; strand++) {
        const points = [];
        const end = 515 + clamp((p - .5) / .25, 0, 1) * 340;
        for (let x = 155; x <= end; x += 3) {
          points.push([x, cableY + Math.sin((x - 155) / 17 + strand * TAU / 10) * 17 + Math.sin(x / 87) * 2]);
        }
        this.line(points, strand % 2 ? '#b18acb' : '#e8caff', 3.1, .8);
      }
      if (stage === 3) {
        for (let i = 0; i < 5; i++) {
          const x = 280 + i * 105;
          this.curve([x, cableY - 8, x - 35, cableY - 70, x + 51, cableY - 74, x + 57, cableY - 34], COLORS.intermediate, 2, .5);
          this.circle(x, cableY, 5, COLORS.energy);
        }
        this.arrow(134, cableY, 88, cableY, COLORS.energy, 2, 10);
        this.arrow(866, cableY, 912, cableY, COLORS.energy, 2, 10);
      }
      this.line([[886, cableY - 21], [886, cableY + 21]], COLORS.muted, 1.5);
      this.line([[878, cableY - 21], [894, cableY - 21]], COLORS.muted, 1.5);
      this.line([[878, cableY + 21], [894, cableY + 21]], COLORS.muted, 1.5);
      this.label('~10 nm', 877, 447, { color: COLORS.muted, maxWidth: 190, size: 14, small: true });
      this.label('Filamento intermedio · cable resistente', 500, 480, { color: COLORS.intermediate, maxWidth: 840, size: 21, bold: true });
      this.tag('Sin polaridad + / −', 500, 546, COLORS.intermediate, 530);
    }
  }

  // A standalone class: the application owns animation timing and pause/play.
  window.CelmaScene = CelmaScene;
})();
