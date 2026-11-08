/* Motor educativo de actina: estado y geometría numérica sin Three.js ni DOM. */
(function () {
  'use strict';

  const registry = window.CELMA_SIMULATIONS;
  if (!registry) throw new Error('Carga simulacion-motor.js antes de simulacion-actina.js.');
  const STEP = 1 / 60;
  const MAX_FILAMENTS = 96;
  const MAX_LENGTH = 1.2;
  const ROOT_SITES = 24;
  const BRANCH_ANGLE = 70 * Math.PI / 180;
  const MIN_BRANCH_PARENT_LENGTH = 0.18;
  const MAX_BRANCH_DEPTH = 3;
  const BASAL_Y = 0.18;
  const ELLIPSE_X = 5.3;
  const ELLIPSE_Z = 2.8;
  const CORTICAL_RADIUS = 0.73;

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
    return result >>> 0;
  }

  function randomAt(seed, key, tick, channel) {
    let value = (seed ^ Math.imul(key + 1, 0x9e3779b1) ^ Math.imul(tick + 1, 0x85ebca77) ^ Math.imul(channel + 1, 0xc2b2ae3d)) >>> 0;
    value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
    value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
  }

  function wrapAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function maximumLength(origin, direction) {
    const a = direction[0] * direction[0] / (ELLIPSE_X * ELLIPSE_X) + direction[2] * direction[2] / (ELLIPSE_Z * ELLIPSE_Z);
    const b = 2 * (origin[0] * direction[0] / (ELLIPSE_X * ELLIPSE_X) + origin[2] * direction[2] / (ELLIPSE_Z * ELLIPSE_Z));
    const c = origin[0] * origin[0] / (ELLIPSE_X * ELLIPSE_X) + origin[2] * origin[2] / (ELLIPSE_Z * ELLIPSE_Z) - 1;
    const intersection = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
    return Math.max(0, Math.min(MAX_LENGTH, intersection - 0.002));
  }

  function parametersFor(input, previous) {
    const result = {};
    const source = input && typeof input === 'object' ? input : {};
    definition.parameters.forEach(function (parameter) {
      let value = previous ? previous[parameter.key] : parameter.default;
      if (Object.prototype.hasOwnProperty.call(source, parameter.key)) {
        const candidate = Number(source[parameter.key]);
        if (Number.isFinite(candidate)) value = candidate;
      }
      result[parameter.key] = Math.min(parameter.max, Math.max(parameter.min, value));
    });
    result.initialSeeds = Math.round(result.initialSeeds);
    return result;
  }

  function corticalPart(filament) {
    let samples = 0;
    for (let index = 0; index < 5; index += 1) {
      const distance = filament.length * (index + 0.5) / 5;
      const x = filament.origin[0] + filament.direction[0] * distance;
      const z = filament.origin[2] + filament.direction[2] * distance;
      if (x * x / (ELLIPSE_X * ELLIPSE_X) + z * z / (ELLIPSE_Z * ELLIPSE_Z) >= CORTICAL_RADIUS * CORTICAL_RADIUS) samples += 1;
    }
    return samples / 5;
  }

  class ActinEngine {
    constructor(parameters, seed) {
      const numeric = Number(seed);
      this.seed = Number.isFinite(numeric) ? numeric >>> 0 : 12345;
      this.module = 'actin';
      this._parameters = parametersFor(parameters);
      this.reset();
    }

    get params() { return this.getParameters(); }
    get time() { return this._tick * STEP; }
    getParameters() { return Object.assign({}, this._parameters); }

    setParameters(patch) {
      this._parameters = parametersFor(patch, this._parameters);
      return this.getParameters();
    }

    _targetAngle(site) {
      const radial = Math.atan2(-site.origin[2], -site.origin[0]);
      const tangent = Math.atan2(ELLIPSE_Z * Math.cos(site.theta), -ELLIPSE_X * Math.sin(site.theta)) + site.reverse * Math.PI;
      return radial + this._parameters.cortical * wrapAngle(tangent - radial);
    }

    _newRoot(siteIndex, initial) {
      const site = this._sites[siteIndex];
      const generation = this._rootGenerations[siteIndex]++;
      const id = 'actin-r' + siteIndex + '-g' + generation;
      const angle = this._targetAngle(site);
      const direction = [Math.cos(angle), 0, Math.sin(angle)];
      const origin = site.origin.slice();
      const filament = {
        id: id,
        randomKey: hash(id),
        parentId: null,
        rootSite: siteIndex,
        depth: 0,
        branchCounter: 0,
        anchorDistance: 0,
        branchSide: 0,
        origin: origin,
        direction: direction,
        angle: angle,
        maxLength: maximumLength(origin, direction),
        length: initial ? 0.12 + 0.1 * randomAt(this.seed, siteIndex, 0, 0) : 0.003,
        state: 'growing'
      };
      filament.length = Math.min(filament.maxLength, filament.length);
      this._filaments.push(filament);
      this._rootOccupancy.set(siteIndex, id);
      return filament;
    }

    reset() {
      this._tick = 0;
      this._accumulator = 0;
      this._events = [];
      this._counters = { births: 0, losses: 0 };
      this._rootGenerations = Array(ROOT_SITES).fill(0);
      this._rootOccupancy = new Map();
      this._sites = Array.from({ length: ROOT_SITES }, (_, site) => {
        const theta = 2 * Math.PI * (site + 0.12 * (randomAt(this.seed, site, 0, 4) - 0.5)) / ROOT_SITES;
        const radius = 0.8 + 0.08 * randomAt(this.seed, site, 0, 5);
        return {
          theta: theta,
          origin: [ELLIPSE_X * radius * Math.cos(theta), BASAL_Y, ELLIPSE_Z * radius * Math.sin(theta)],
          reverse: randomAt(this.seed, site, 0, 6) < 0.5 ? 0 : 1
        };
      });
      this._filaments = [];
      for (let index = 0; index < this._parameters.initialSeeds; index += 1) {
        this._newRoot(Math.floor(index * ROOT_SITES / this._parameters.initialSeeds), true);
      }
      this._history = [];
      this._sample();
      return this.snapshot();
    }

    _record(type, filament) {
      this._events.push({ type: type, filament: filament.id, parentId: filament.parentId, time: (this._tick + 1) * STEP });
      if (this._events.length > 256) this._events.shift();
    }

    _removeFilaments(removed) {
      if (!removed.size) return;
      this._filaments = this._filaments.filter(filament => {
        if (!removed.has(filament.id)) return true;
        if (filament.parentId === null) this._rootOccupancy.delete(filament.rootSite);
        this._counters.losses += 1;
        this._record('loss', filament);
        return false;
      });
    }

    _branch(parent) {
      const sequence = parent.branchCounter;
      const anchorFraction = 0.25 + 0.5 * randomAt(this.seed, parent.randomKey, sequence, 7);
      const anchorDistance = parent.length * anchorFraction;
      const side = randomAt(this.seed, parent.randomKey, sequence, 8) < 0.5 ? -1 : 1;
      const angle = parent.angle + side * BRANCH_ANGLE;
      const origin = [parent.origin[0] + parent.direction[0] * anchorDistance, BASAL_Y, parent.origin[2] + parent.direction[2] * anchorDistance];
      const direction = [Math.cos(angle), 0, Math.sin(angle)];
      const maxLength = maximumLength(origin, direction);
      if (maxLength < 0.08) return;
      parent.branchCounter += 1;
      const id = parent.id + '-b' + sequence;
      const branch = {
        id: id,
        randomKey: hash(id),
        parentId: parent.id,
        rootSite: parent.rootSite,
        depth: parent.depth + 1,
        branchCounter: 0,
        anchorDistance: anchorDistance,
        branchSide: side,
        origin: origin,
        direction: direction,
        angle: angle,
        maxLength: maxLength,
        length: 0.003,
        state: 'growing'
      };
      this._filaments.push(branch);
      this._counters.births += 1;
      this._record('branch', branch);
    }

    _fixedStep() {
      const parameters = this._parameters;
      const netGrowth = 0.055 * parameters.monomers - 0.018 * parameters.turnover;
      const parentMap = new Map(this._filaments.map(filament => [filament.id, filament]));
      const removed = new Set();

      // El orden de nacimiento garantiza que un padre se actualice antes que su rama.
      for (const filament of this._filaments) {
        if (filament.parentId === null) {
          const target = this._targetAngle(this._sites[filament.rootSite]);
          filament.angle += wrapAngle(target - filament.angle) * Math.min(1, 0.4 * STEP);
        } else {
          const parent = parentMap.get(filament.parentId);
          if (!parent || removed.has(parent.id) || parent.length < filament.anchorDistance) {
            removed.add(filament.id);
            continue;
          }
          filament.origin[0] = parent.origin[0] + parent.direction[0] * filament.anchorDistance;
          filament.origin[2] = parent.origin[2] + parent.direction[2] * filament.anchorDistance;
          filament.angle = parent.angle + filament.branchSide * BRANCH_ANGLE;
        }
        filament.direction[0] = Math.cos(filament.angle);
        filament.direction[2] = Math.sin(filament.angle);
        filament.maxLength = maximumLength(filament.origin, filament.direction);
        filament.length = Math.max(0, Math.min(filament.maxLength, filament.length + netGrowth * STEP));
        if (filament.length === 0) {
          removed.add(filament.id);
        } else if (netGrowth < 0) {
          filament.state = 'shrinking';
        } else if (netGrowth > 0 && filament.length < filament.maxLength) {
          filament.state = 'growing';
        } else {
          filament.state = 'stable';
        }
      }
      this._removeFilaments(removed);

      const availability = parameters.monomers / (0.25 + parameters.monomers);
      const rootRate = 0.16 * parameters.nucleation * availability;
      const rootProbability = -Math.expm1(-rootRate * STEP);
      for (let site = 0; site < ROOT_SITES && this._filaments.length < MAX_FILAMENTS; site += 1) {
        if (!this._rootOccupancy.has(site) && randomAt(this.seed, site, this._tick, 1) < rootProbability) {
          const root = this._newRoot(site, false);
          this._counters.births += 1;
          this._record('birth', root);
        }
      }

      const eligible = this._filaments.slice();
      for (const parent of eligible) {
        if (this._filaments.length >= MAX_FILAMENTS) break;
        if (parent.length < MIN_BRANCH_PARENT_LENGTH || parent.depth >= MAX_BRANCH_DEPTH) continue;
        const branchRate = 0.08 * parameters.branching * availability * parent.length;
        if (randomAt(this.seed, parent.randomKey, this._tick, 2) < -Math.expm1(-branchRate * STEP)) this._branch(parent);
      }

      this._tick += 1;
      if (this._tick % 15 === 0) this._sample();
    }

    _metrics() {
      let totalLength = 0;
      let corticalLength = 0;
      let branches = 0;
      for (const filament of this._filaments) {
        totalLength += filament.length;
        corticalLength += filament.length * corticalPart(filament);
        if (filament.parentId !== null) branches += 1;
      }
      return {
        meanLength: this._filaments.length ? totalLength / this._filaments.length : 0,
        totalLength: totalLength,
        count: this._filaments.length,
        quantity: totalLength / (MAX_FILAMENTS * MAX_LENGTH),
        births: this._counters.births,
        branches: branches,
        losses: this._counters.losses,
        corticalFraction: totalLength ? corticalLength / totalLength : 0
      };
    }

    _sample() {
      this._history.push(Object.assign({ time: this.time }, this._metrics()));
      if (this._history.length > 1200) this._history.shift();
    }

    step(dt) { return this.advance(dt === undefined ? STEP : dt); }

    advance(seconds) {
      const duration = Number(seconds);
      if (!Number.isFinite(duration) || duration < 0) throw new RangeError('El tiempo simulado debe ser un número finito no negativo.');
      this._events = [];
      this._accumulator += duration;
      const steps = Math.floor((this._accumulator + STEP * 1e-8) / STEP);
      this._accumulator -= steps * STEP;
      if (this._accumulator < 0 && this._accumulator > -STEP * 1e-8) this._accumulator = 0;
      for (let index = 0; index < steps; index += 1) this._fixedStep();
      return this.snapshot();
    }

    snapshot() {
      return {
        module: this.module,
        time: this.time,
        seed: this.seed,
        parameters: this.getParameters(),
        filaments: this._filaments.map(filament => ({
          id: filament.id,
          parentId: filament.parentId,
          length: filament.length,
          state: filament.state,
          origin: filament.origin.slice(),
          direction: filament.direction.slice(),
          anchorDistance: filament.anchorDistance,
          cortical: corticalPart(filament) >= 0.5
        })),
        metrics: this._metrics(),
        limits: { capacity: MAX_FILAMENTS, reached: this._filaments.length >= MAX_FILAMENTS },
        events: this._events.map(event => Object.assign({}, event))
      };
    }

    getHistory() { return this._history.map(point => Object.assign({}, point)); }
  }

  const definition = {
    id: 'actin',
    title: 'Redes de actina',
    description: 'Explora cómo la disponibilidad de monómeros, nucleación, ramificación y recambio modifican una red basal y cortical simplificada.',
    explanation: 'Los monómeros disponibles contribuyen a la elongación, mientras el recambio elimina longitud. La nucleación genera filamentos primarios y la ramificación requiere un filamento previo. Una red sin semillas y sin nucleación no puede aparecer solo por activar ramas. La organización cortical representa una orientación impuesta por reguladores no resueltos, con cambios visuales graduales. Las cantidades y patrones resultantes pertenecen a este modelo, no son predicciones cuantitativas de una célula real.',
    parameters: [
      { key: 'monomers', label: 'Disponibilidad relativa de monómeros', min: 0, max: 2, step: 0.05, default: 1, description: 'Reservorio soluble relativo constante; controla elongación y posibilidad de nuevos filamentos.' },
      { key: 'nucleation', label: 'Nucleación primaria relativa', min: 0, max: 2, step: 0.05, default: 1, description: 'Activa sitios primarios disponibles, sin representar una proteína nucleadora específica.' },
      { key: 'branching', label: 'Ramificación relativa', min: 0, max: 2, step: 0.05, default: 1, description: 'Representa una vía de ramificación tipo Arp2/3; necesita un filamento padre de longitud suficiente.' },
      { key: 'turnover', label: 'Recambio / desensamblaje relativo', min: 0, max: 2, step: 0.05, default: 1, description: 'Resume pérdida de longitud por desensamblaje y no resuelve los reguladores individuales.' },
      { key: 'cortical', label: 'Organización cortical relativa', min: 0, max: 1, step: 0.05, default: 0.7, description: 'Orienta gradualmente la red desde direcciones internas hacia tangentes periféricas; regla visual educativa sin cálculo de fuerzas.' },
      { key: 'initialSeeds', label: 'Semillas iniciales', min: 0, max: 8, step: 1, default: 6, requiresReset: true, description: 'Condición inicial: se aplica al reiniciar. Permite explorar una red con o sin filamentos previos.' }
    ],
    metrics: [
      { key: 'meanLength', label: 'Longitud media', format: 'decimal' },
      { key: 'count', label: 'Filamentos presentes', format: 'integer' },
      { key: 'quantity', label: 'Cantidad relativa', format: 'percent' },
      { key: 'branches', label: 'Ramas presentes', format: 'integer' },
      { key: 'births', label: 'Nacimientos acumulados', format: 'integer' },
      { key: 'losses', label: 'Pérdidas acumuladas', format: 'integer' },
      { key: 'corticalFraction', label: 'Fracción de longitud cortical', format: 'percent' }
    ],
    charts: [
      { title: 'Longitud de polímeros frente al tiempo', series: [{ key: 'meanLength', label: 'Longitud media normalizada', color: '#18a5aa' }] },
      { title: 'Cantidad relativa de polímeros', series: [{ key: 'quantity', label: 'Fracción de capacidad visual', color: '#309daf' }] },
      { title: 'Formación y organización de la red', series: [{ key: 'count', label: 'Filamentos presentes', color: '#238eae' }, { key: 'branches', label: 'Ramas presentes', color: '#9a81c7' }] },
      { title: 'Evolución de la organización cortical', series: [{ key: 'corticalFraction', label: 'Fracción cortical de longitud', color: '#25a79b' }] },
      { title: 'Ensamblaje y pérdida de filamentos', series: [{ key: 'births', label: 'Nacimientos acumulados', color: '#318ea9' }, { key: 'losses', label: 'Pérdidas acumuladas', color: '#c184a3' }] }
    ],
    sources: [
      { label: 'Pollard (2016) · Actin and Actin-Binding Proteins', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4968159/' },
      { label: 'Nucleation, Stabilization and Disassembly of Branched Actin Networks · Trends in Cell Biology', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9018471/' },
      { label: 'New mechanisms and functions of actin nucleation · Current Opinion in Cell Biology', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3073586/' }
    ],
    simplifications: [
      'Tiempo, longitud y tasas normalizados; coeficientes educativos no calibrados con un experimento.',
      'Reservorio soluble ideal constante; no se calcula conservación global de monómeros, ATP/ADP ni proteínas reguladoras específicas.',
      'La elongación neta resume incorporación y pérdida: 0.055 × monómeros − 0.018 × recambio.',
      'Veinticuatro sitios primarios y un máximo visual de 96 filamentos, con longitud máxima 1.2; esos límites no son saturaciones biológicas.',
      'La red se sitúa en un plano basal y una elipse conservadora. Es una proyección didáctica que no representa toda la corteza tridimensional.',
      'La orientación cortical cambia gradualmente mediante una regla geométrica, sin resolver fuerzas, flujo retrógrado ni remodelado molecular.',
      'Ramas a aproximadamente 70 grados, hasta tres generaciones; no se afirma que todos los filamentos celulares tengan esta arquitectura.',
      'Las ramas siguen su punto de anclaje en el padre; al perderse ese segmento se retiran también sus ramas como simplificación de desensamblaje.',
      'La fracción cortical se estima mediante cinco muestras de cada filamento en la región periférica elegida; no es una medición de microscopía.',
      'Las semillas iniciales se aplican al reiniciar. Pueden desensamblarse aunque la disponibilidad de monómeros se reduzca a cero.'
    ],
    model: {
      timeStep: STEP,
      elongation: '0.055 × monomers',
      lengthLoss: '0.018 × turnover',
      rootRate: '0.16 × nucleation × monomers / (0.25 + monomers), por sitio libre',
      branchRate: '0.08 × branching × monomers / (0.25 + monomers) × longitud del padre',
      probability: '1 − exp(−tasa × dt)',
      branchAngleDegrees: 70,
      minimumParentLength: MIN_BRANCH_PARENT_LENGTH,
      maximumBranchDepth: MAX_BRANCH_DEPTH,
      visualCapacity: MAX_FILAMENTS,
      maximumLength: MAX_LENGTH,
      rootSites: ROOT_SITES,
      basalY: BASAL_Y,
      ellipseRadii: [ELLIPSE_X, ELLIPSE_Z],
      historyInterval: 0.25,
      historyLimit: 1200
    },
    create: function (parameters, seed) { return new ActinEngine(parameters, seed); }
  };

  registry.register(definition);
}());
