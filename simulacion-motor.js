/*
 * Motor científico educativo: no depende de Three.js ni de la interfaz.
 * Longitudes, tiempo, disponibilidades y tasas están normalizados.
 * Los coeficientes son elecciones del modelo, no constantes experimentales.
 */
(function () {
  'use strict';

  const STEP = 1 / 60;
  const ROUTES = 26;
  const INITIAL_FILAMENTS = 14;
  const SAMPLE_STEPS = 15; // Una muestra cada 0.25 unidades de tiempo.
  const MAX_HISTORY = 1200;
  const MAX_RECENT_EVENTS = 256;
  const DISCLAIMER = 'Simulación educativa basada en principios de biología celular. Los resultados representan un modelo simplificado y no sustituyen mediciones experimentales.';
  const definitions = new Map();

  function normalizedSeed(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric >>> 0 : 12345;
  }

  /*
   * Aleatoriedad por contador: cada sorteo depende de semilla, ruta, paso y
   * canal de evento. A/B conserva los mismos sorteos potenciales aunque una
   * condición cambie el número de nacimientos o transiciones.
   */
  function randomAt(seed, route, tick, channel) {
    let hash = (seed ^ Math.imul(route + 1, 0x9e3779b1) ^ Math.imul(tick + 1, 0x85ebca77) ^ Math.imul(channel + 1, 0xc2b2ae3d)) >>> 0;
    hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
    hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
  }

  function parametersFor(definition, input, previous) {
    const result = {};
    const source = input && typeof input === 'object' ? input : {};
    definition.parameters.forEach(function (parameter) {
      let value = previous ? previous[parameter.key] : parameter.default;
      if (Object.prototype.hasOwnProperty.call(source, parameter.key)) {
        const candidate = Number(source[parameter.key]);
        if (Number.isFinite(candidate)) value = candidate;
      }
      result[parameter.key] = Math.min(parameter.max, Math.max(parameter.min, value));
      if (parameter.integer) result[parameter.key] = Math.round(result[parameter.key]);
    });
    return result;
  }

  class MicrotubuleEngine {
    constructor(definition, parameters, seed) {
      this.module = definition.id;
      this.seed = normalizedSeed(seed);
      this._definition = definition;
      this._parameters = parametersFor(definition, parameters);
      this.reset();
    }

    get params() {
      return this.getParameters();
    }

    get time() {
      return this._tick * STEP;
    }

    getParameters() {
      return Object.assign({}, this._parameters);
    }

    setParameters(patch) {
      this._parameters = parametersFor(this._definition, patch, this._parameters);
      return this.getParameters();
    }

    /* Reiniciar conserva los parámetros elegidos y vuelve a la misma semilla. */
    reset() {
      this._tick = 0;
      this._accumulator = 0;
      this._counters = { catastrophes: 0, rescues: 0, births: 0 };
      this._events = [];
      const initialRoutes = new Set();
      const initialCount = Math.round(this._parameters.initialSeeds);
      for (let index = 0; index < initialCount; index += 1) {
        initialRoutes.add(Math.floor(index * ROUTES / initialCount));
      }
      this._filaments = Array.from({ length: ROUTES }, (_, route) => ({
        id: 'mt-' + route,
        route: route,
        length: initialRoutes.has(route) ? 0.08 + 0.24 * randomAt(this.seed, route, 0, 0) : 0,
        state: initialRoutes.has(route) ? 'growing' : 'inactive'
      }));
      this._history = [];
      this._sample();
      return this.snapshot();
    }

    _record(type, filament) {
      this._events.push({ type: type, filament: filament.id, route: filament.route, time: (this._tick + 1) * STEP });
      if (this._events.length > MAX_RECENT_EVENTS) this._events.shift();
    }

    _fixedStep() {
      const parameters = this._parameters;
      const growthSpeed = 0.075 * parameters.growth * Math.max(parameters.tubulin - 0.12, 0);
      const shrinkSpeed = 0.18;
      const catastropheRate = 0.25 * parameters.catastrophe * (1 - 0.9 * parameters.stabilization);
      const rescueRate = 0.18 * parameters.rescue;
      const birthRate = 0.18 * parameters.nucleation * parameters.tubulin / (0.25 + parameters.tubulin);
      const catastropheProbability = -Math.expm1(-catastropheRate * STEP);
      const rescueProbability = -Math.expm1(-rescueRate * STEP);
      const birthProbability = -Math.expm1(-birthRate * STEP);

      for (const filament of this._filaments) {
        if (filament.state === 'inactive') {
          if (randomAt(this.seed, filament.route, this._tick, 1) < birthProbability) {
            filament.state = 'growing';
            // Semilla por debajo de la resolución del modelo; no una longitud molecular.
            filament.length = 0.003;
            this._counters.births += 1;
            this._record('birth', filament);
          }
        } else if (filament.state === 'growing') {
          filament.length = Math.min(1, filament.length + growthSpeed * STEP);
          if (randomAt(this.seed, filament.route, this._tick, 2) < catastropheProbability) {
            filament.state = 'shrinking';
            this._counters.catastrophes += 1;
            this._record('catastrophe', filament);
          }
        } else {
          filament.length = Math.max(0, filament.length - shrinkSpeed * STEP);
          if (filament.length === 0) {
            filament.state = 'inactive';
            this._record('loss', filament);
          } else if (randomAt(this.seed, filament.route, this._tick, 3) < rescueProbability) {
            filament.state = 'growing';
            this._counters.rescues += 1;
            this._record('rescue', filament);
          }
        }
      }

      this._tick += 1;
      if (this._tick % SAMPLE_STEPS === 0) this._sample();
    }

    _metrics() {
      let totalLength = 0;
      let count = 0;
      let growing = 0;
      let shrinking = 0;
      for (const filament of this._filaments) {
        totalLength += filament.length;
        if (filament.state !== 'inactive') count += 1;
        if (filament.state === 'growing') growing += 1;
        if (filament.state === 'shrinking') shrinking += 1;
      }
      return {
        meanLength: count ? totalLength / count : 0,
        totalLength: totalLength,
        count: count,
        quantity: totalLength / ROUTES,
        growing: growing,
        shrinking: shrinking,
        catastrophes: this._counters.catastrophes,
        rescues: this._counters.rescues,
        births: this._counters.births
      };
    }

    _sample() {
      this._history.push(Object.assign({ time: this.time }, this._metrics()));
      if (this._history.length > MAX_HISTORY) this._history.shift();
    }

    /*
     * step y advance comparten acumulador. El estado para un mismo tiempo
     * simulado no depende de cómo el navegador reparta los fotogramas.
     * events contiene los eventos de esta llamada; los contadores y la
     * historia son acumulativos. Los eventos recientes se limitan a 256.
     */
    step(dt) {
      return this.advance(dt === undefined ? STEP : dt);
    }

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
        filaments: this._filaments.map(filament => Object.assign({}, filament)),
        metrics: this._metrics(),
        events: this._events.map(event => Object.assign({}, event))
      };
    }

    getHistory() {
      return this._history.map(point => Object.assign({}, point));
    }
  }

  const registry = {
    register: function (definition) {
      if (!definition || typeof definition.id !== 'string' || !definition.id || typeof definition.create !== 'function' || !Array.isArray(definition.parameters)) {
        throw new TypeError('Un módulo de simulación necesita id, parameters y una fábrica create.');
      }
      if (definitions.has(definition.id)) throw new Error('El módulo ya está registrado: ' + definition.id);
      definitions.set(definition.id, definition);
      return definition;
    },
    create: function (id, parameters, seed) {
      const definition = definitions.get(id);
      if (!definition) throw new Error('Módulo de simulación desconocido: ' + id);
      return definition.create(parameters || {}, seed === undefined ? 12345 : seed);
    },
    get: function (id) {
      return definitions.get(id);
    },
    list: function () {
      return Array.from(definitions.values());
    },
    disclaimer: DISCLAIMER,
    fixedStep: STEP
  };

  const microtubules = {
    id: 'microtubules',
    title: 'Dinámica de microtúbulos',
    description: 'Explora crecimiento, acortamiento, catástrofe y rescate en una red de microtúbulos con parámetros normalizados.',
    explanation: 'La tubulina disponible modifica la elongación. Las catástrofes cambian un filamento al estado de acortamiento; los rescates lo devuelven al de crecimiento. En este modelo, la estabilización reduce la tasa de catástrofe y la nucleación activa sitios vacíos. El estado final también depende del azar y del tiempo simulado: una corrida no es una medición biológica ni garantiza una respuesta monotónica.',
    parameters: [
      { key: 'tubulin', label: 'Disponibilidad relativa de tubulina', min: 0, max: 2, step: 0.05, default: 1, description: 'Reservorio soluble relativo mantenido constante; no representa una concentración absoluta.' },
      { key: 'growth', label: 'Velocidad relativa de crecimiento', min: 0, max: 2, step: 0.05, default: 1, description: 'Multiplica la elongación dependiente de tubulina, sin alterar directamente las transiciones.' },
      { key: 'catastrophe', label: 'Frecuencia relativa de catástrofe', min: 0, max: 2, step: 0.05, default: 1, description: 'Controla la probabilidad de pasar de crecimiento a acortamiento.' },
      { key: 'rescue', label: 'Frecuencia relativa de rescate', min: 0, max: 2, step: 0.05, default: 1, description: 'Controla la probabilidad de volver al crecimiento mientras el filamento acorta.' },
      { key: 'nucleation', label: 'Nucleación relativa', min: 0, max: 2, step: 0.05, default: 1, description: 'Regula la activación de sitios vacíos; requiere tubulina disponible.' },
      { key: 'stabilization', label: 'Estabilización relativa', min: 0, max: 1, step: 0.05, default: 0.2, description: 'Reduce la tasa de catástrofe en este modelo; no aumenta automáticamente el rescate ni la elongación.' },
      { key: 'initialSeeds', label: 'Microtúbulos iniciales', min: 0, max: ROUTES, step: 1, default: INITIAL_FILAMENTS, integer: true, requiresReset: true, description: 'Condición inicial: se aplica al reiniciar. Con cero microtúbulos y nucleación cero, la red permanece vacía.' }
    ],
    metrics: [
      { key: 'meanLength', label: 'Longitud media', format: 'decimal' },
      { key: 'count', label: 'Microtúbulos presentes', format: 'integer' },
      { key: 'quantity', label: 'Cantidad relativa', format: 'percent' },
      { key: 'growing', label: 'Estado de crecimiento', format: 'integer' },
      { key: 'shrinking', label: 'Estado de acortamiento', format: 'integer' },
      { key: 'catastrophes', label: 'Catástrofes acumuladas', format: 'integer' },
      { key: 'rescues', label: 'Rescates acumulados', format: 'integer' }
    ],
    charts: [
      { title: 'Longitud de polímeros frente al tiempo', series: [{ key: 'meanLength', label: 'Longitud media normalizada', color: '#367ee8' }] },
      { title: 'Cantidad relativa de polímeros', series: [{ key: 'quantity', label: 'Fracción de longitud respecto a capacidad visual', color: '#1aabb0' }] },
      { title: 'Evolución de los estados dinámicos', series: [{ key: 'growing', label: 'Filamentos en estado de crecimiento', color: '#338cc9' }, { key: 'shrinking', label: 'Filamentos en acortamiento', color: '#d58a7b' }] },
      { title: 'Eventos acumulados de transición', series: [{ key: 'catastrophes', label: 'Catástrofes', color: '#c57a99' }, { key: 'rescues', label: 'Rescates', color: '#7b73ca' }] }
    ],
    sources: [
      { label: 'Walker et al. (1988) · Dynamic instability of individual microtubules · DOI 10.1083/jcb.107.4.1437', url: 'https://pubmed.ncbi.nlm.nih.gov/3170635/' },
      { label: 'Goodson y Jonasson (2018) · Microtubules and Microtubule-Associated Proteins', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5983186/' }
    ],
    simplifications: [
      'Tiempo y longitud normalizados; coeficientes educativos sin ajuste a un experimento.',
      'Disponibilidad soluble fijada por un reservorio ideal; no se calcula conservación global de tubulina.',
      'Veintiséis rutas potenciales; el número inicial se configura entre cero y 26, con catorce como referencia. No es un recuento celular real.',
      'El extremo menos está anclado. No se resuelven protofilamentos, casquete GTP, fuerzas ni proteínas reguladoras individuales.',
      'La longitud máxima de cada ruta vale una unidad. Llegar al borde limita crecimiento y no se cuenta como catástrofe.',
      'El estado de crecimiento puede estar limitado por tubulina o por el borde; no implica elongación positiva en todo instante.',
      'La cantidad relativa es longitud total dividida por 26; no una concentración de polímeros.',
      'Las longitudes iniciales y las semillas de nucleación son representaciones por debajo de la resolución geométrica.',
      'Las probabilidades por paso son 1−exp(−tasa·dt), con paso fijo de 1/60 unidades de tiempo.'
    ],
    model: {
      timeStep: STEP,
      routes: ROUTES,
      initialFilaments: INITIAL_FILAMENTS,
      initialFilamentsParameter: 'round(initialSeeds), aplicado al reiniciar',
      growth: '0.075 × growth × max(tubulin − 0.12, 0)',
      shrinkage: '0.18',
      catastropheRate: '0.25 × catastrophe × (1 − 0.9 × stabilization)',
      rescueRate: '0.18 × rescue',
      nucleationRate: '0.18 × nucleation × tubulin / (0.25 + tubulin)',
      availability: 'Reservorio soluble relativo constante, sistema abierto',
      historyInterval: 0.25,
      historyLimit: MAX_HISTORY
    },
    create: function (parameters, seed) {
      return new MicrotubuleEngine(microtubules, parameters, seed);
    }
  };

  registry.register(microtubules);
  window.CELMA_SIMULATIONS = registry;
}());
