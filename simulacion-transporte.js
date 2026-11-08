/*
 * Transporte educativo sobre rutas radiales normalizadas.
 * Este motor no depende de Three.js, del DOM ni del tiempo de renderizado.
 * La cinesina-1 representada avanza hacia + y la dineína citoplasmática-1
 * hacia −. No se atribuye esa polaridad a todas las familias de cinesinas.
 */
(function () {
  'use strict';

  const STEP = 1 / 60;
  const ROUTES = 26;
  const SAMPLE_STEPS = 15;
  const MAX_HISTORY = 1200;
  const MAX_EVENTS = 256;
  const GAP_START = 0.42;
  const GAP_END = 0.58;
  const MODES = ['mixed', 'kinesin1', 'dynein1'];
  const registry = window.CELMA_SIMULATIONS;
  if (!registry) throw new Error('Cargar simulacion-motor.js antes de simulacion-transporte.js.');

  function normalizedSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number >>> 0 : 12345;
  }

  function randomAt(seed, route, channel) {
    let hash = (seed ^ Math.imul(route + 1, 0x9e3779b1) ^ Math.imul(channel + 1, 0xc2b2ae3d)) >>> 0;
    hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
    hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
  }

  /* Rangos independientes para integridad, motores, polaridad y presencia de red. */
  function ranks(seed, channel) {
    const indices = Array.from({ length: ROUTES }, (_, index) => index);
    indices.sort((left, right) => randomAt(seed, left, channel) - randomAt(seed, right, channel) || left - right);
    const rank = new Array(ROUTES);
    indices.forEach((index, position) => { rank[index] = position; });
    return rank;
  }

  function parametersFor(input, previous) {
    const source = input && typeof input === 'object' ? input : {};
    const values = previous ? Object.assign({}, previous) : { speed: 1, integrity: 1, motor: 'mixed', motorAvailability: 1, cargoCount: ROUTES, networkAvailability: 1 };
    const maximums = { speed: 2, integrity: 1, motorAvailability: 1, cargoCount: ROUTES, networkAvailability: 1 };
    Object.keys(maximums).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) return;
      const candidate = Number(source[key]);
      if (Number.isFinite(candidate)) values[key] = Math.max(0, Math.min(maximums[key], candidate));
    });
    values.cargoCount = Math.round(values.cargoCount);
    if (MODES.includes(source.motor)) values.motor = source.motor;
    return values;
  }

  class TransportEngine {
    constructor(parameters, seed) {
      this.module = 'transport';
      this.seed = normalizedSeed(seed);
      this._parameters = parametersFor(parameters);
      this._routeRanks = ranks(this.seed, 1);
      this._availabilityRanks = ranks(this.seed, 2);
      this._motorRanks = ranks(this.seed, 3);
      this._networkRanks = ranks(this.seed, 4);
      this.reset();
    }

    get params() { return this.getParameters(); }
    get time() { return this._tick * STEP; }

    getParameters() { return Object.assign({}, this._parameters); }

    _motorFor(route) {
      return this._parameters.motor === 'mixed'
        ? (this._motorRanks[route] < ROUTES / 2 ? 'kinesin1' : 'dynein1')
        : this._parameters.motor;
    }

    setParameters(patch) {
      this._events = [];
      this._parameters = parametersFor(patch, this._parameters);
      this._synchronizeRoutes();
      this._vesicles.forEach(vesicle => {
        const motor = this._motorFor(vesicle.route);
        if (motor !== vesicle.motor) {
          vesicle.motor = motor;
          this._record('motor-change', vesicle, this.time);
        }
        this._refreshState(vesicle, this.time);
      });
      return this.getParameters();
    }

    reset() {
      this._tick = 0;
      this._accumulator = 0;
      this._events = [];
      this._routes = Array.from({ length: ROUTES }, (_, id) => ({ id: id, intact: true, available: true, gapStart: GAP_START, gapEnd: GAP_END }));
      this._synchronizeRoutes(false);
      this._vesicles = Array.from({ length: this._parameters.cargoCount }, (_, route) => {
        const motor = this._motorFor(route);
        // La población física inicial depende solo de semilla y ruta, nunca
        // del parámetro motor: A/B parte de las mismas posiciones incluso
        // cuando se comparan polaridades diferentes.
        const position = this._motorRanks[route] < ROUTES / 2 ? 0.1 : 0.9;
        return { id: 'vesicle-' + route, route: route, position: position, initialPosition: position, motor: motor, state: 'running', distance: 0 };
      });
      this._vesicles.forEach(vesicle => this._refreshState(vesicle, 0, false));
      this._history = [];
      this._sample();
      return this.snapshot();
    }

    _record(type, vesicle, time) {
      this._events.push({ type: type, vesicle: vesicle.id, route: vesicle.route, time: time });
      if (this._events.length > MAX_EVENTS) this._events.shift();
    }

    _synchronizeRoutes(record) {
      const continuous = Math.round(ROUTES * this._parameters.integrity);
      const present = Math.round(ROUTES * this._parameters.networkAvailability);
      this._routes.forEach(route => {
        const intact = this._routeRanks[route.id] < continuous;
        const available = this._networkRanks[route.id] < present;
        if (record !== false && intact !== route.intact) {
          this._events.push({ type: intact ? 'route-restored' : 'route-broken', route: route.id, time: this.time });
          if (this._events.length > MAX_EVENTS) this._events.shift();
        }
        if (record !== false && available !== route.available) {
          this._events.push({ type: available ? 'route-added' : 'route-removed', route: route.id, time: this.time });
          if (this._events.length > MAX_EVENTS) this._events.shift();
        }
        route.intact = intact;
        route.available = available;
      });
    }

    _stateFor(vesicle) {
      const positive = vesicle.motor === 'kinesin1';
      if ((positive && vesicle.position >= 1) || (!positive && vesicle.position <= 0)) return 'delivered';
      const route = this._routes[vesicle.route];
      // Sin un microtúbulo disponible, un motor no puede desplazar su carga.
      // Retirar la ruta conserva la posición, incluso fuera del intervalo roto.
      if (!route.available) return 'blocked';
      const available = Math.round(ROUTES * this._parameters.motorAvailability);
      if (this._availabilityRanks[vesicle.route] >= available) return 'waiting';
      if (!route.intact) {
        // Una rotura que aparece alrededor de una carga no cambia su posición.
        // Cada borde bloquea solo el avance que entraría en el intervalo roto.
        const blocked = positive
          ? vesicle.position >= GAP_START && vesicle.position < GAP_END
          : vesicle.position > GAP_START && vesicle.position <= GAP_END;
        if (blocked) return 'blocked';
      }
      return 'running';
    }

    _refreshState(vesicle, time, record) {
      const next = this._stateFor(vesicle);
      if (next === vesicle.state) return;
      vesicle.state = next;
      if (record !== false) this._record(next === 'running' ? 'resumed' : next, vesicle, time);
    }

    _fixedStep() {
      const time = (this._tick + 1) * STEP;
      const increment = 0.06 * this._parameters.speed * STEP;
      this._vesicles.forEach(vesicle => {
        this._refreshState(vesicle, time);
        if (vesicle.state !== 'running') return;
        const previous = vesicle.position;
        const positive = vesicle.motor === 'kinesin1';
        let next = Math.max(0, Math.min(1, previous + (positive ? increment : -increment)));
        if (!this._routes[vesicle.route].intact) {
          if (positive && previous < GAP_START && next >= GAP_START) next = GAP_START;
          if (!positive && previous > GAP_END && next <= GAP_END) next = GAP_END;
        }
        vesicle.position = next;
        vesicle.distance += Math.abs(next - previous);
        this._refreshState(vesicle, time);
      });
      this._tick += 1;
      if (this._tick % SAMPLE_STEPS === 0) this._sample();
    }

    _metrics() {
      let displacement = 0;
      let distance = 0;
      let blocked = 0;
      let delivered = 0;
      let running = 0;
      let waiting = 0;
      let kinesinDisplacement = 0;
      let dyneinDisplacement = 0;
      let kinesinCount = 0;
      let dyneinCount = 0;
      this._vesicles.forEach(vesicle => {
        const net = vesicle.position - vesicle.initialPosition;
        displacement += net;
        distance += vesicle.distance;
        if (vesicle.state === 'blocked') blocked += 1;
        if (vesicle.state === 'delivered') delivered += 1;
        if (vesicle.state === 'running') running += 1;
        if (vesicle.state === 'waiting') waiting += 1;
        if (vesicle.motor === 'kinesin1') { kinesinDisplacement += net; kinesinCount += 1; }
        else { dyneinDisplacement += net; dyneinCount += 1; }
      });
      const availableRoutes = this._routes.reduce((sum, route) => sum + Number(route.available && route.intact), 0);
      const count = this._vesicles.length;
      return {
        displacement: displacement / (count || 1),
        distance: distance / (count || 1),
        kinesinDisplacement: kinesinCount ? kinesinDisplacement / kinesinCount : 0,
        dyneinDisplacement: dyneinCount ? dyneinDisplacement / dyneinCount : 0,
        quantity: availableRoutes / ROUTES,
        count: count,
        blocked: blocked,
        delivered: delivered,
        running: running,
        waiting: waiting,
        availableRoutes: availableRoutes
      };
    }

    _sample() {
      this._history.push(Object.assign({ time: this.time }, this._metrics()));
      if (this._history.length > MAX_HISTORY) this._history.shift();
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
        routes: this._routes.map(route => Object.assign({}, route)),
        vesicles: this._vesicles.map(vesicle => ({
          id: vesicle.id,
          route: vesicle.route,
          position: vesicle.position,
          motor: vesicle.motor,
          state: vesicle.state,
          distance: vesicle.distance,
          displacement: vesicle.position - vesicle.initialPosition
        })),
        metrics: this._metrics(),
        events: this._events.map(event => Object.assign({}, event))
      };
    }

    getHistory() { return this._history.map(point => Object.assign({}, point)); }
  }

  const definition = {
    id: 'transport',
    title: 'Transporte intracelular',
    description: 'Explora cómo la polaridad de motores seleccionados y las interrupciones de microtúbulos modifican el movimiento de cargas.',
    describe: function (parameters, snapshot) {
      const values = parametersFor(parameters);
      const metrics = snapshot && snapshot.metrics;
      const statements = [values.motor === 'mixed'
        ? 'La mezcla contiene cargas transportadas por cinesina-1 hacia + y por dineína citoplasmática-1 hacia −; una media neta cercana a cero puede ocultar movimiento en ambos sentidos.'
        : values.motor === 'kinesin1'
          ? 'La cinesina-1 representada se dirige hacia el extremo +, situado aquí hacia la periferia.'
          : 'La dineína citoplasmática-1 representada se dirige hacia el extremo −, situado aquí cerca del centrosoma.'];
      if (values.speed === 0) statements.push('La velocidad seleccionada es cero: los motores activos no desplazan las cargas.');
      else statements.push('La celeridad elegida es ' + (0.06 * values.speed).toFixed(3) + ' longitudes de ruta por unidad de tiempo normalizado; no es una velocidad experimental.');
      const cargoCount = metrics ? metrics.count : values.cargoCount;
      if (cargoCount === 0) statements.push('No hay cargas en esta condición inicial; añadir motores o rutas no crea vesículas por sí solo.');
      else statements.push('Hay ' + cargoCount + ' cargas presentes en la simulación.');
      if (values.networkAvailability === 0) statements.push('No hay microtúbulos disponibles: las cargas pendientes se bloquean sin cambiar de posición, aunque tengan motores activos.');
      else if (values.networkAvailability < 1) statements.push('La red contiene ' + Math.round(ROUTES * values.networkAvailability) + ' de las 26 rutas potenciales; su integridad determina cuáles son continuas.');
      if (values.motorAvailability === 0) statements.push('No hay motores activos: las cargas pendientes esperan en su posición y las ya entregadas permanecen en su destino.');
      else if (values.motorAvailability < 1) statements.push('La disponibilidad de motores habilita un subconjunto reproducible de los 26 sitios potenciales. Las cargas presentes sin motor activo esperan cuando tienen una ruta disponible.');
      if (values.integrity < 1) statements.push('Entre las rutas potenciales hay ' + (ROUTES - Math.round(ROUTES * values.integrity)) + ' con una interrupción. Sobre una ruta disponible, una carga se detiene al intentar entrar en el tramo roto; las cargas situadas al otro lado pueden continuar hacia su destino.');
      if (metrics && metrics.blocked) statements.push('En este instante, ' + metrics.blocked + ' cargas están bloqueadas. Reponer las rutas ausentes y reparar las interrupciones permite reanudar el transporte.');
      if (metrics && metrics.delivered) statements.push(metrics.delivered + ' cargas alcanzaron el destino de su motor actual y permanecen allí sin reciclaje automático.');
      statements.push('El desplazamiento se mide respecto a la posición inicial; la distancia recorrida acumula movimiento aunque cambie la dirección.');
      return statements.join(' ');
    },
    explanation: 'El extremo menos de estas rutas se sitúa cerca del centrosoma y el extremo más hacia la periferia. La cinesina-1 representada transporta hacia + y la dineína citoplasmática-1 hacia −. Sin una ruta disponible no hay transporte activo, aunque existan motores. Una discontinuidad detiene una carga que intenta cruzarla; restaurar la ruta permite continuar. Distancia recorrida y desplazamiento neto son magnitudes diferentes; una media firmada puede combinar movimientos opuestos.',
    parameters: [
      { key: 'speed', label: 'Velocidad relativa de los motores', min: 0, max: 2, step: 0.05, default: 1, description: 'Multiplica la celeridad normalizada; no corresponde a una velocidad medida en micrómetros por segundo.' },
      { key: 'integrity', label: 'Integridad de las rutas', min: 0, max: 1, step: 0.05, default: 1, description: 'Fracción de rutas continuas, redondeada a 26 rutas. Las restantes tienen una interrupción central; reducir integridad conserva un subconjunto de las rutas disponibles.' },
      { key: 'motor', label: 'Motor representado', type: 'select', options: [{ value: 'mixed', label: 'Mezcla de ambos motores' }, { value: 'kinesin1', label: 'Cinesina-1 → extremo +' }, { value: 'dynein1', label: 'Dineína citoplasmática-1 → extremo −' }], default: 'mixed', description: 'La mezcla asigna motores según la semilla y está equilibrada en la referencia de 26 cargas. Cambiar el motor conserva la posición e invierte la dirección cuando corresponde.' },
      { key: 'motorAvailability', label: 'Disponibilidad relativa de motores', min: 0, max: 1, step: 0.05, default: 1, description: 'Activa un subconjunto de los 26 sitios potenciales según la semilla. Una carga pendiente necesita también una ruta disponible; las ya entregadas permanecen en su destino.' },
      { key: 'cargoCount', label: 'Vesículas iniciales', min: 0, max: ROUTES, step: 1, default: ROUTES, integer: true, requiresReset: true, description: 'Condición inicial: se aplica al reiniciar. Cero cargas mantiene vacío el transporte aunque se añadan motores o microtúbulos.' },
      { key: 'networkAvailability', label: 'Disponibilidad de microtúbulos', min: 0, max: 1, step: 0.05, default: 1, description: 'Selecciona cuántas rutas existen, independientemente de sus interrupciones. Sin microtúbulos, las cargas pendientes quedan bloqueadas sin desplazarse.' }
    ],
    metrics: [
      { key: 'displacement', label: 'Desplazamiento neto medio', format: 'decimal' },
      { key: 'distance', label: 'Distancia recorrida media', format: 'decimal' },
      { key: 'running', label: 'Cargas en ruta', format: 'integer' },
      { key: 'blocked', label: 'Cargas bloqueadas', format: 'integer' },
      { key: 'waiting', label: 'Cargas sin motor activo', format: 'integer' },
      { key: 'delivered', label: 'Cargas en destino', format: 'integer' },
      { key: 'availableRoutes', label: 'Rutas continuas', format: 'integer' }
    ],
    charts: [
      { title: 'Desplazamiento neto y distancia recorrida', series: [{ key: 'displacement', label: 'Desplazamiento medio firmado', color: '#367ee8' }, { key: 'distance', label: 'Distancia media acumulada', color: '#1aabb0' }] },
      { title: 'Desplazamiento según el motor actual', series: [{ key: 'kinesinDisplacement', label: 'Cargas con cinesina-1', color: '#239d78' }, { key: 'dyneinDisplacement', label: 'Cargas con dineína-1', color: '#8765c9' }] },
      { title: 'Estado de las cargas', series: [{ key: 'running', label: 'En ruta', color: '#367ee8' }, { key: 'blocked', label: 'Bloqueadas', color: '#c99536' }, { key: 'delivered', label: 'En destino', color: '#239d78' }] },
      { title: 'Integridad relativa de la red', series: [{ key: 'quantity', label: 'Fracción de rutas continuas', color: '#367ee8' }] }
    ],
    sources: [
      { label: 'Reck-Peterson et al. (2018) · The cytoplasmic dynein transport machinery and its many cargoes', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6457270/' },
      { label: 'Barlan y Gelfand · Microtubule-Based Transport and the Distribution, Tethering, and Organization of Organelles', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5411697/' },
      { label: 'Emerging mechanisms of dynein transport in the cytoplasm versus the cilium', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6103457/' }
    ],
    simplifications: [
      'Tiempo, longitud y celeridad normalizados; los coeficientes son educativos y no un ajuste experimental.',
      'Veintiséis rutas radiales potenciales y entre cero y 26 cargas iniciales, con 26 como referencia; no constituyen un recuento celular real.',
      'Se representan específicamente cinesina-1 y dineína citoplasmática-1. No todas las cinesinas tienen la misma dirección.',
      'Cada carga usa un único motor efectivo; no se simulan competencia entre motores, adaptadores, ATP, tráfico ni desprendimiento estocástico.',
      'Integridad selecciona un subconjunto reproducible de rutas continuas. Las rotas presentan una interrupción entre 0.42 y 0.58 de su longitud.',
      'La disponibilidad de red decide qué rutas existen mediante un ranking independiente de las interrupciones. Sin ruta, la carga pendiente se bloquea en su posición, aunque tenga un motor activo.',
      'Una rotura que aparece alrededor de una carga la inmoviliza en su posición actual, sin trasladarla artificialmente al borde. Reparar la ruta permite continuar.',
      'Las cargas entregadas permanecen en el destino, sin reciclaje automático. Cambiar de motor puede iniciar el viaje opuesto.',
      'La referencia de 26 cargas contiene trece en 0.1 y trece en 0.9. Poblaciones menores toman un subconjunto de esas rutas; sus posiciones dependen de la semilla y no del motor. Cambiar la cantidad inicial es una diferencia explícita entre condiciones.',
      'Disponibilidad e integridad se redondean al número entero más próximo entre 0 y 26; no se describen fracciones de una carga.',
      'El desplazamiento neto es posición actual menos posición inicial. La distancia acumula el valor absoluto de cada movimiento; la media neta de la mezcla puede cancelarse.',
      'Las curvas por motor agrupan las cargas según su motor actual; tras un cambio de motor mantienen el desplazamiento respecto a su posición inicial.',
      'La red no se remodela por la carga ni hay transferencia entre microtúbulos; las rutas radiales son una simplificación de un fibroblasto de interfase.'
    ],
    model: {
      timeStep: STEP,
      routes: ROUTES,
      vesicles: ROUTES,
      initialCargoParameter: 'round(cargoCount), aplicado al reiniciar; entre cero y 26',
      velocity: 'ds/dτ = 0.06 × speed × sign; sign = +1 para cinesina-1 y −1 para dineína citoplasmática-1',
      intactRoutes: 'round(26 × integrity), seleccionadas mediante rangos deterministas de la semilla',
      existingRoutes: 'round(26 × networkAvailability), ranking independiente de las interrupciones',
      activeMotors: 'round(26 × motorAvailability), rangos independientes de la integridad',
      initialPositions: 'Subconjunto de cargoCount rutas; en la referencia completa, trece cargas en 0.1 y trece en 0.9 según la semilla. Independientes del modo motor',
      interruption: '[0.42, 0.58]; no se atraviesa un tramo roto',
      netDisplacement: 's(τ) − s(0)',
      traveledDistance: 'Σ abs(s(t + dt) − s(t))',
      historyInterval: 0.25,
      historyLimit: MAX_HISTORY
    },
    create: function (parameters, seed) { return new TransportEngine(parameters, seed); }
  };

  registry.register(definition);
}());
