
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const NUCLEUS = [-.8, 1.07, 0];
  const PCM = [.98, 1.09, .97];
  const COLORS = {
    membrane: '#a8dbe9', nucleus: '#b4b8e5', nucleolus: '#8275bd', nuclearEnvelope: '#969acb',
    mitochondria: '#edaa79', roughER: '#78b7ce', smoothER: '#8accc9', golgi: '#e8b5a2',
    ribosomes: '#7d9bb9', lysosomes: '#d6a3bf', peroxisomes: '#abd4a9', endosomes: '#8cbbd8',
    vesicles: '#d9b3a2', centrosome: '#e2bf75', centrioles: '#cba05f',
    microtubules: '#5594ec', actin: '#26c2a2', intermediate: '#ac8bd6'
  };
  const LABELS = {
    membrane: 'Membrana plasmática', nucleus: 'Núcleo', nucleolus: 'Nucléolo', nuclearEnvelope: 'Envoltura nuclear',
    mitochondria: 'Mitocondrias', roughER: 'Retículo endoplasmático rugoso', smoothER: 'Retículo endoplasmático liso',
    golgi: 'Aparato de Golgi', ribosomes: 'Ribosomas', lysosomes: 'Lisosomas', peroxisomes: 'Peroxisomas',
    endosomes: 'Endosomas', vesicles: 'Vesículas de transporte', centrosome: 'Centrosoma', centrioles: 'Centriolos',
    microtubules: 'Microtúbulos', actin: 'Microfilamentos de actina', intermediate: 'Filamentos intermedios de vimentina'
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const nextTurn = () => new Promise(resolve => setTimeout(resolve, 0));

  async function create(T, options = {}) {
    if (!T || !T.Group || !T.BufferGeometry) throw new Error('CelmaCell necesita una biblioteca Three.js compatible.');
    const group = new T.Group();
    group.name = 'Celma · fibroblasto adherente en interfase';
    group.userData.cellModel = true;
    group.userData.cellVersion = 'fibroblast-v1';
    group.userData.cellInfo = {
      type: 'Célula animal adherente en interfase, de tipo fibroblasto',
      representation: 'Modelo educativo procedimental original; no es una reconstrucción experimental.',
      organization: 'Célula extendida sobre un sustrato, con actina cortical y basal, microtúbulos de origen centrosomal y filamentos intermedios de vimentina.',
      simplifications: [
        'Se exageran los diámetros de filamentos, ribosomas y poros para que sean visibles.',
        'Las cantidades, dimensiones y posiciones son representativas, no mediciones de una célula concreta.',
        'Se abre parcialmente la superficie de algunas mitocondrias para mostrar pliegues internos esquemáticos.',
        'La transparencia de membranas y núcleo es una herramienta de observación.',
        'Las redes no muestran todas sus proteínas reguladoras ni todos sus sitios de anclaje.'
      ],
      license: 'MIT', author: 'Geometría original creada para el proyecto Celma', coordinateSystem: 'Y vertical; plano basal XZ; unidades normalizadas'
    };
    const paths = { microtubules: [], actin: [], intermediate: [] };
    const anchors = {
      membrane: [4.8, .34, 1.35], nucleus: NUCLEUS.slice(), nucleolus: [-1.08, 1.19, .19],
      nuclearEnvelope: [-1.77, 1.49, .39], mitochondria: [2.9, .62, -.72],
      roughER: [-2.45, .86, -.92], smoothER: [-3.17, .73, -1.53], golgi: [1.22, .97, -.7],
      ribosomes: [-2.52, .96, -.97], lysosomes: [2.08, .54, 1.28], peroxisomes: [-3.62, .42, .74],
      endosomes: [3.74, .38, 1.11], vesicles: [2.02, .75, -.69], centrosome: PCM.slice(),
      centrioles: [1.08, 1.12, 1.02], microtubules: [2.7, .85, 1.15],
      actin: [4.62, .23, .79], intermediate: [-2.3, .95, 1.13]
    };
    group.userData.cellPaths = paths;
    group.userData.anchors = anchors;
    group.userData.cellAnchors = anchors;
    let seed = 725103;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    const materials = new Map();
    function material(key, settings = {}) {
      const identity = key + JSON.stringify(settings);
      if (!materials.has(identity)) materials.set(identity, new T.MeshStandardMaterial({
        name: LABELS[key], color: COLORS[key], roughness: .65, metalness: 0,
        side: T.DoubleSide, ...settings
      }));
      return materials.get(identity);
    }
    function mesh(key, geometry, name, settings = {}, userData = {}) {
      const object = new T.Mesh(geometry, material(key, settings));
      object.name = name || LABELS[key];
      object.userData.celmaComponent = key;
      object.userData.organelle = key;
      Object.assign(object.userData, userData);
      group.add(object);
      return object;
    }
    function merge(geometries) {
      const list = geometries.filter(Boolean);
      let vertexCount = 0, indexCount = 0;
      for (const geometry of list) {
        if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
        vertexCount += geometry.getAttribute('position').count;
        indexCount += geometry.index ? geometry.index.count : geometry.getAttribute('position').count;
      }
      const positions = new Float32Array(vertexCount * 3), normals = new Float32Array(vertexCount * 3);
      const indices = vertexCount > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
      let vertexOffset = 0, indexOffset = 0;
      for (const geometry of list) {
        const position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal');
        for (let i = 0; i < position.count; i++) {
          const at = (vertexOffset + i) * 3;
          positions[at] = position.getX(i); positions[at + 1] = position.getY(i); positions[at + 2] = position.getZ(i);
          normals[at] = normal.getX(i); normals[at + 1] = normal.getY(i); normals[at + 2] = normal.getZ(i);
        }
        const count = geometry.index ? geometry.index.count : position.count;
        for (let i = 0; i < count; i++) indices[indexOffset++] = vertexOffset + (geometry.index ? geometry.index.getX(i) : i);
        vertexOffset += position.count;
        geometry.dispose();
      }
      const result = new T.BufferGeometry();
      result.setAttribute('position', new T.BufferAttribute(positions, 3));
      result.setAttribute('normal', new T.BufferAttribute(normals, 3));
      result.setIndex(new T.BufferAttribute(indices, 1));
      result.computeBoundingSphere();
      return result;
    }
    function ellipsoid(center, radii, width = 18, height = 10, partial = false) {
      const geometry = partial ? new T.SphereGeometry(1, width, height, Math.PI * .65, Math.PI * 1.5) : new T.SphereGeometry(1, width, height);
      geometry.scale(...radii); geometry.translate(...center);
      return geometry;
    }
    function tube(points, radius, segments = 24, radial = 6, saveKey) {
      const curve = new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point)), false, 'centripetal', .5);
      if (saveKey) paths[saveKey].push(curve.getSpacedPoints(40).map(point => point.toArray()));
      return new T.TubeGeometry(curve, segments, radius, radial, false);
    }
    function footprint(angle, radius = 1) {
      const shape = 1 + .075 * Math.cos(angle * 3 + .25) + .045 * Math.sin(angle * 5);
      return [Math.cos(angle) * 5.85 * shape * radius, Math.sin(angle) * 3.18 * shape * radius];
    }
    function shell() {
      const rings = 25, segments = 80, positions = [], indices = [];
      for (let side = 0; side < 2; side++) for (let ring = 0; ring <= rings; ring++) {
        const r = ring / rings;
        for (let i = 0; i <= segments; i++) {
          const angle = i / segments * TAU, xz = footprint(angle, r);
          const y = side ? .075 + .055 * (1 - r * r) : .21 + 2.43 * Math.pow(Math.max(0, 1 - r * r), 1.38);
          positions.push(xz[0], y, xz[1]);
        }
      }
      const surface = (rings + 1) * (segments + 1);
      for (let side = 0; side < 2; side++) for (let ring = 0; ring < rings; ring++) for (let i = 0; i < segments; i++) {
        const a = side * surface + ring * (segments + 1) + i, b = a + segments + 1;
        if (side) indices.push(a, b, a + 1, b, b + 1, a + 1);
        else indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
      for (let i = 0; i < segments; i++) {
        const a = rings * (segments + 1) + i, b = a + surface;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
      return geometry;
    }
    function arcSheet({ cx = NUCLEUS[0], cz = 0, rx, rz, from, to, y, width = .24, tilt = 0 }) {
      const positions = [], indices = [], steps = 28;
      for (let i = 0; i <= steps; i++) for (let edge = 0; edge < 2; edge++) {
        const a = lerp(from, to, i / steps), offset = (edge - .5) * width;
        positions.push(cx + (rx + offset) * Math.cos(a), y + .045 * Math.sin(a * 3) + tilt * (i / steps - .5), cz + (rz + offset) * Math.sin(a));
      }
      for (let i = 0; i < steps; i++) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
      const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
    }
    async function progress(fraction, label) {
      if (typeof options.onProgress === 'function') options.onProgress({ fraction, label });
      await nextTurn();
    }
    await progress(.03, 'Definiendo la forma de una célula adherente');
    mesh('membrane', shell(), 'Membrana plasmática · contorno de fibroblasto', { transparent: true, opacity: .08, depthWrite: false }, { pickThrough: true });
    const edge = [];
    for (let i = 0; i <= 90; i++) { const point = footprint(i / 90 * TAU); edge.push([point[0], .16, point[1]]); }
    mesh('membrane', tube(edge, .017, 90, 5), 'Membrana plasmática · borde celular', { transparent: true, opacity: .36, depthWrite: false }, { pickThrough: true });
    mesh('nucleus', ellipsoid(NUCLEUS, [1.38, .72, 1.04], 30, 18), 'Núcleo · nucleoplasma', { transparent: true, opacity: .27, depthWrite: false });
    mesh('nucleolus', ellipsoid(anchors.nucleolus, [.33, .26, .29], 20, 12), 'Nucléolo · dominio nuclear');
    mesh('nuclearEnvelope', ellipsoid(NUCLEUS, [1.44, .77, 1.10], 30, 18), 'Envoltura nuclear · doble membrana esquemática', { transparent: true, opacity: .18, depthWrite: false }, { pickThrough: true });
    const pores = [];
    for (let i = 0; i < 24; i++) {
      const a = i * 2.399963, y = -.75 + 1.5 * (i + .5) / 24, radial = Math.sqrt(1 - y * y);
      const normal = new T.Vector3(Math.cos(a) * radial / 1.44, y / .77, Math.sin(a) * radial / 1.10).normalize();
      const geometry = new T.TorusGeometry(.052, .012, 5, 9);
      geometry.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), normal));
      geometry.translate(NUCLEUS[0] + Math.cos(a) * radial * 1.45, NUCLEUS[1] + y * .775, Math.sin(a) * radial * 1.11);
      pores.push(geometry);
    }
    mesh('nuclearEnvelope', merge(pores), 'Envoltura nuclear · poros representativos', { transparent: true, opacity: .64, depthWrite: false }, { pickThrough: true });

    await progress(.16, 'Organizando el retículo y el aparato de Golgi');
    const roughSheets = [], boundRibosomes = [];
    for (let layer = 0; layer < 5; layer++) {
      const rx = 1.80 + layer * .11, rz = 1.30 + layer * .09, y = .62 + layer * .18;
      roughSheets.push(arcSheet({ rx, rz, from: .78 * Math.PI, to: 1.72 * Math.PI, y, width: .25, tilt: .05 }));
      for (let i = 0; i < 15; i++) {
        const a = lerp(.8 * Math.PI, 1.70 * Math.PI, (i + .2 * random()) / 15);
        const r = (random() - .5) * .18;
        boundRibosomes.push(ellipsoid([NUCLEUS[0] + (rx + r) * Math.cos(a), y + .075 + .045 * Math.sin(a * 3), (rz + r) * Math.sin(a)], [.041, .033, .041], 6, 4));
      }
    }
    mesh('roughER', merge(roughSheets), 'RER · cisternas perinucleares con ribosomas');
    mesh('roughER', merge([
      tube([[-1.84, 1.12, -.70], [-2.06, 1.11, -.89], [-2.25, 1.12, -.99]], .07, 12, 6),
      tube([[-1.86, .91, -.72], [-2.15, .90, -.92], [-2.36, .88, -1.02]], .06, 12, 6)
    ]), 'RER · continuidad con la envoltura nuclear');
    mesh('ribosomes', merge(boundRibosomes), 'Ribosomas · unidos a la cara citosólica del RER');
    const smoothTubes = [];
    for (let i = 0; i < 8; i++) {
      const a = 1.12 * Math.PI + i * .095, x = NUCLEUS[0] + 2.15 * Math.cos(a), z = 1.63 * Math.sin(a), y = .54 + (i % 3) * .16;
      smoothTubes.push(tube([[x, y, z], [x - .25, y + .13, z - .19], [x - .56, y + .08, z - .25], [x - .72, y - .04, z - .02]], .061, 18, 6));
      if (i % 2 === 0) smoothTubes.push(tube([[x - .25, y + .13, z - .19], [x - .39, y + .29, z - .49], [x - .14, y + .24, z - .63]], .047, 14, 6));
    }
    mesh('smoothER', merge(smoothTubes), 'REL · red tubular continua con el retículo');
    const golgiSheets = [];
    for (let layer = 0; layer < 6; layer++) golgiSheets.push(arcSheet({ cx: .44 + layer * .027, cz: -.72, rx: .91, rz: .83, from: -.40 * Math.PI, to: .43 * Math.PI, y: .53 + layer * .155, width: .29, tilt: -.12 }));
    mesh('golgi', merge(golgiSheets), 'Golgi · pilas de cisternas curvas yuxtanucleares');
    const freeRibosomes = [];
    for (let i = 0; i < 74; i++) {
      const a = i * 2.399963 + .25, r = .44 + random() * .39, xz = footprint(a, r);
      if (((xz[0] + .8) / 1.65) ** 2 + (xz[1] / 1.30) ** 2 < 1) continue;
      freeRibosomes.push(ellipsoid([xz[0], .30 + random() * .38, xz[1]], [.041, .033, .041], 6, 4));
    }
    mesh('ribosomes', merge(freeRibosomes), 'Ribosomas · población libre citosólica');

    await progress(.34, 'Distribuyendo mitocondrias y compartimentos de transporte');
    const mitoSites = [
      { p: [2.90, .62, -.72], angle: .12, size: .95 }, { p: [3.58, .50, 1.04], angle: -.4, size: .88 },
      { p: [-3.54, .53, 1.13], angle: -.15, size: 1.0 }, { p: [-3.71, .60, -1.37], angle: .42, size: .85 },
      { p: [.55, .57, -2.12], angle: .10, size: .81 }, { p: [4.47, .40, -.15], angle: .60, size: .70 },
      { p: [-.58, .54, 2.14], angle: -.18, size: .91 }
    ];
    for (let number = 0; number < mitoSites.length; number++) {
      const site = mitoSites[number], outer = ellipsoid([0, 0, 0], [.72 * site.size, .21, .25], 22, 10, true);
      outer.rotateY(site.angle); outer.translate(...site.p);
      mesh('mitochondria', outer, 'Mitocondria ' + (number + 1) + ' · corte didáctico de membranas', { side: T.DoubleSide });
      const folds = [];
      for (let i = 0; i < 7; i++) {
        const x = (-.49 + i * .16) * site.size;
        const fold = tube([[x, -.135, -.06], [x - .025, -.07, .12], [x + .025, .08, .12], [x, .135, -.05]], .021, 10, 5);
        fold.rotateY(site.angle); fold.translate(...site.p); folds.push(fold);
      }
      mesh('mitochondria', merge(folds), 'Mitocondria ' + (number + 1) + ' · crestas simplificadas', { color: '#ca7e53' });
    }
    mesh('mitochondria', merge([
      tube([[-2.84, .53, 1.84], [-2.43, .58, 1.97], [-1.96, .57, 1.87]], .17, 18, 8),
      tube([[-2.43, .58, 1.97], [-2.31, .64, 2.23], [-2.02, .62, 2.35]], .14, 14, 8)
    ]), 'Mitocondria · segmento de red ramificada');
    function bodies(key, positions, radius, suffix, color) {
      return mesh(key, merge(positions.map((point, index) => ellipsoid(point, [radius * (1 + index % 2 * .1), radius, radius * .92], 12, 8))), LABELS[key] + ' · ' + suffix, color ? { color } : {});
    }
    bodies('lysosomes', [[2.08, .54, 1.28], [1.88, .58, -1.48], [-2.13, .51, 1.49]], .17, 'compartimentos degradativos');
    bodies('peroxisomes', [[-3.62, .42, .74], [2.61, .46, 1.82], [3.17, .43, -1.54]], .115, 'organelos oxidativos');
    bodies('endosomes', [[3.74, .38, 1.11], [-4.18, .35, -.64], [1.69, .62, 1.42]], .14, 'ruta desde la periferia hacia el interior');
    bodies('endosomes', [[2.21, .56, 1.06], [-1.96, .57, -1.36]], .19, 'compartimentos de maduración', '#93a7ce');
    bodies('vesicles', [[1.78, .67, -.48], [1.94, .91, -.80], [1.99, .66, -1.07], [1.74, .54, -1.36], [2.24, .53, -.57]], .085, 'tráfico próximo al Golgi', '#dfb49c');
    bodies('vesicles', [[4.61, .29, .86], [4.08, .37, -1.17], [-4.56, .30, .87], [-3.91, .30, -1.55], [2.96, .38, 1.86]], .078, 'tráfico periférico', '#9fcbda');

    await progress(.50, 'Construyendo el centrosoma y los microtúbulos');
    mesh('centrosome', ellipsoid(PCM, [.32, .25, .31], 18, 10), 'Centrosoma · material pericentriolar', { transparent: true, opacity: .29, depthWrite: false });
    for (let axis = 0; axis < 2; axis++) {
      const triplets = [];
      for (let spoke = 0; spoke < 9; spoke++) for (let sub = 0; sub < 3; sub++) {
        const a = spoke / 9 * TAU, r = .099 + sub * .024;
        const geometry = new T.CylinderGeometry(.013, .013, .28, 5, 1);
        geometry.translate(Math.cos(a) * r, 0, Math.sin(a) * r);
        if (axis) geometry.rotateX(Math.PI / 2);
        geometry.translate(PCM[0] + (axis ? .12 : -.11), PCM[1] + (axis ? -.04 : .05), PCM[2] + (axis ? .12 : -.08));
        triplets.push(geometry);
      }
      mesh('centrioles', merge(triplets), 'Centriolo ' + (axis + 1) + ' · nueve tripletes esquemáticos');
    }
    const mtGeometries = [[], [], []];
    const originAngle = Math.atan2(PCM[2], PCM[0] - NUCLEUS[0]);
    for (let i = 0; i < 26; i++) {
      const a = (i + .2) / 26 * TAU, endpoint = footprint(a, .80 + random() * .115);
      const endAngle = Math.atan2(endpoint[1], endpoint[0] - NUCLEUS[0]);
      let angleDelta = endAngle - originAngle;
      while (angleDelta > Math.PI) angleDelta -= TAU;
      while (angleDelta < -Math.PI) angleDelta += TAU;
      const endRadius = Math.hypot(endpoint[0] - NUCLEUS[0], endpoint[1]);
      const route = [PCM.slice()];
      for (let j = 1; j <= 7; j++) {
        const t = j / 7, angle = originAngle + angleDelta * Math.pow(t, .68), radius = lerp(1.99, endRadius, t);
        route.push([NUCLEUS[0] + Math.cos(angle) * radius, lerp(PCM[1], .27 + .20 * random(), t) + .12 * Math.sin(Math.PI * t), Math.sin(angle) * radius]);
      }
      // Radial routes begin in PCM. Their angular sweep avoids the nuclear volume.
      mtGeometries[i % 3].push(tube(route, .036, 32, 6, 'microtubules'));
    }
    mtGeometries.forEach((geometries, index) => mesh('microtubules', merge(geometries), 'Microtúbulos · abanico centrosomal ' + (index + 1)));

    await progress(.70, 'Trazando actina cortical, haces basales y red de vimentina');
    const cortical = [], stress = [], leading = [];
    for (let band = 0; band < 3; band++) {
      const route = [];
      for (let i = 0; i <= 70; i++) {
        const a = i / 70 * TAU, r = .91 - band * .04 + .008 * Math.sin(a * 7), xz = footprint(a, r);
        route.push([xz[0], .26 + band * .10 + .035 * Math.sin(a * 5), xz[1]]);
      }
      cortical.push(tube(route, .022, 70, 5, 'actin'));
    }
    for (let i = 0; i < 14; i++) {
      const z = -2.05 + i * .31, half = 4.95 * Math.sqrt(Math.max(.1, 1 - (z / 2.8) ** 2));
      const route = [[-half, .18, z - .12], [-half * .36, .19, z + .08], [half * .38, .20, z - .05], [half, .20, z + .10]];
      stress.push(tube(route, .026, 27, 5, 'actin'));
    }
    for (let i = 0; i < 13; i++) {
      const z = -.98 + i * .15, x = 4.35 - Math.abs(z) * .22;
      leading.push(tube([[x, .22, z], [x + .51, .23, z + .06], [x + .96, .23, z + .10]], .018, 16, 5, 'actin'));
      leading.push(tube([[x + .48, .23, z + .06], [x + .65, .25, z + .23], [x + .84, .24, z + .37]], .014, 12, 5, 'actin'));
    }
    mesh('actin', merge(cortical), 'Actina · red cortical periférica');
    mesh('actin', merge(stress), 'Actina · haces basales de tensión');
    mesh('actin', merge(leading), 'Actina · red ramificada del borde anterior');
    const intermediate = [[], [], []];
    for (let layer = 0; layer < 3; layer++) {
      const route = [];
      for (let i = 0; i <= 55; i++) {
        const a = i / 55 * TAU, wobble = .045 * Math.sin(a * 8 + layer);
        route.push([NUCLEUS[0] + (1.64 + layer * .07 + wobble) * Math.cos(a), .73 + layer * .23 + .07 * Math.sin(a * 3), (1.27 + layer * .05 + wobble) * Math.sin(a)]);
      }
      intermediate[layer].push(tube(route, .025, 55, 6, 'intermediate'));
    }
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * TAU, xz = footprint(a + .12, .79 + random() * .09);
      const route = [[NUCLEUS[0] + 1.74 * Math.cos(a), .88 + .16 * Math.sin(a * 2), 1.38 * Math.sin(a)],
        [NUCLEUS[0] + 2.18 * Math.cos(a + .13), .67 + .10 * Math.sin(a), 1.69 * Math.sin(a + .13)],
        [xz[0] * .82, .47, xz[1] * .86], [xz[0], .35, xz[1]]];
      intermediate[i % 3].push(tube(route, .024, 24, 6, 'intermediate'));
    }
    intermediate.forEach((geometries, index) => mesh('intermediate', merge(geometries), 'Vimentina · red perinuclear y radial ' + (index + 1)));

    await progress(.94, 'Preparando las estructuras para selección y observación');
    group.updateMatrixWorld(true);
    let vertices = 0, triangles = 0, meshes = 0;
    group.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.computeBoundingBox(); object.geometry.computeBoundingSphere();
      vertices += object.geometry.getAttribute('position').count;
      triangles += (object.geometry.index ? object.geometry.index.count : object.geometry.getAttribute('position').count) / 3;
      meshes++;
    });
    group.userData.cellInfo.geometry = { meshes, vertices, triangles, progressiveBatches: 7 };
    await progress(1, 'Célula didáctica lista');
    return group;
  }
  window.CelmaCell = { create, version: 'fibroblast-v1' };
})();
