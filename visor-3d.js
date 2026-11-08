/* CELMA · Visor de modelos GLB reales.
 * La selección anatómica usa nombres o asignaciones del usuario. El visor no
 * genera anatomía, extremos, movimientos ni procesos ausentes del archivo.
 */
(function () {
  'use strict';

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clean = value => String(value || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 180);
  const normalize = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[_\s]+/g, '-');
  const DEFAULT_COLORS = {
    actin: '#50ded0', microtubules: '#77a7ff', intermediate: '#dfb6fa',
    myosin: '#dfb6fa', adhesion: '#f9cb72', kinesin: '#50ded0',
    dynein: '#dfb6fa', centrosome: '#f9cb72', mitochondria: '#f6ae67', other: '#97b6cf'
  };

  class Celma3DView {
    constructor(container, options = {}) {
      if (!container || !container.appendChild) throw new Error('El visor necesita un contenedor HTML.');
      this.container = container;
      this.options = options;
      this.state = { mode: 'map', id: '', component: 'all', progress: 0, playing: false, concentration: 1, stage: 0 };
      this.parts = [];
      this._partById = new Map();
      this._partByMesh = new Map();
      this._model = null;
      this._gltf = null;
      this._modelName = '';
      this._selectedId = '';
      this._contextVisible = true;
      this._visible = true;
      this._disposed = false;
      this._webglLost = false;
      this._loadToken = 0;
      this._raf = 0;
      this._fetchController = null;
      this._nativeClip = null;
      this._nativeAction = null;
      this._mixer = null;
      this._lastStatus = '';
      this._pointer = null;
      this._pointers = new Set();
      this._listeners = [];
      this._rules = [];
      this._activeKeys = new Set();
      this._pickables = [];
      this._hits = [];
      this._clonedMaterials = new Set();
      this._regions = [];
      this._regionMarkers = new Map();
      this._regionSerial = 0;
      this._regionRevision = 0;
      this._definitions = new Map();
      this._loading = false;
      this._organelleStates = new Map();
      this._isolatedComponents = null;
      this._focusComponents = null;
      this._brush = { enabled: false, editing: false, mode: 'paint', component: 'actin', radius: .08 };
      this._brushMeshes = new Map();
      this._brushKeys = [''];
      this._brushCounts = new Uint32Array(32);
      this._brushUndo = [];
      this._brushRedo = [];
      this._brushStroke = null;
      this._brushPointer = null;
      this._brushMultitouch = false;
      this._pointerEvents = new Map();

      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
      this.message = document.createElement('div');
      this.message.className = 'celma-3d-message';
      this.message.setAttribute('role', 'status');
      this.message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:30px;text-align:center;color:' + (options.background === 'transparent' ? '#234778;background:rgba(234,247,255,.72)' : '#bdd0e1;background:#071e36') + ';font:500 14px/1.6 system-ui,sans-serif;z-index:2;pointer-events:none;';
      this.message.textContent = 'Carga un archivo GLB para explorar su estructura real en 3D.';
      container.appendChild(this.message);
      this._initialize();
    }

    _emit(name, payload) {
      const callback = this.options[name];
      if (!this._disposed && typeof callback === 'function') {
        try { callback(payload); } catch (error) { console.warn('CELMA: un evento del visor no pudo completarse.', error); }
      }
    }

    _status(phase, text) {
      if (this._disposed) return;
      const identity = phase + ':' + text;
      if (identity === this._lastStatus) return;
      this._lastStatus = identity;
      this._emit('onStatus', { phase, text });
    }

    _error(message) {
      if (this._disposed) return;
      this._status('error', message);
      this.message.textContent = message;
      this.message.style.display = this._model ? 'none' : 'flex';
      this._emit('onError', message);
    }

    _initialize() {
      if (this.renderer || this._disposed) return !!this.renderer;
      const libs = window.Celma3DLibraries;
      if (!libs || !libs.THREE || !libs.OrbitControls || !libs.GLTFLoader) {
        this._error('La biblioteca 3D no está disponible. La exploración 2D sigue funcionando.');
        return false;
      }
      this.libs = libs;
      this.THREE = libs.THREE;
      const T = this.THREE;
      let renderer;
      try {
        renderer = new T.WebGLRenderer({ antialias: true, alpha: this.options.background === 'transparent', powerPreference: 'high-performance' });
      } catch (error) {
        this._error('Este navegador no pudo iniciar WebGL. Prueba otro navegador o continúa con los esquemas 2D.');
        return false;
      }
      this.renderer = renderer;
      if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
      if (T.ACESFilmicToneMapping !== undefined) renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = .95;
      renderer.setClearColor('#071e36', this.options.background === 'transparent' ? 0 : 1);
      renderer.domElement.className = 'celma-3d-canvas';
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;';
      renderer.domElement.setAttribute('aria-label', 'Modelo celular 3D. Arrastra para girar, usa la rueda o dos dedos para acercar y pulsa una pieza para seleccionarla.');
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.tabIndex = 0;
      this.container.insertBefore(renderer.domElement, this.message);

      this.scene = new T.Scene();
      this.scene.background = this.options.background === 'transparent' ? null : new T.Color('#071e36');
      this.camera = new T.PerspectiveCamera(42, 1, .01, 10000);
      this.camera.position.set(5, 3, 7);
      this.scene.add(new T.HemisphereLight('#d9f0ff', '#314362', 2.1));
      const key = new T.DirectionalLight('#e4f4ff', 2.2);
      key.position.set(4, 7, 5);
      this.scene.add(key);
      const rim = new T.DirectionalLight('#81baff', 1.35);
      rim.position.set(-5, 2, -4);
      this.scene.add(rim);
      const fill = new T.DirectionalLight('#b7f1ea', .8);
      fill.position.set(0, -2, 5);
      this.scene.add(fill);

      this.controls = new libs.OrbitControls(this.camera, renderer.domElement);
      this.controls.enableDamping = false;
      this.controls.enablePan = true;
      this.controls.rotateSpeed = .75;
      this.controls.zoomSpeed = .8;
      this.controls.screenSpacePanning = true;
      this.controls.addEventListener('change', this._onControlsChange = () => this._schedule());
      this.raycaster = new T.Raycaster();
      this._mouse = new T.Vector2();
      this._bounds = new T.Box3();
      this._partBounds = new T.Box3();
      this._center = new T.Vector3();
      this._size = new T.Vector3();
      this._direction = new T.Vector3(1, .55, 1.25).normalize();
      this._color = new T.Color();
      this._black = new T.Color(0, 0, 0);
      this._normal = new T.Vector3();
      this._normalMatrix = new T.Matrix3();
      this._regionPoint = new T.Vector3();
      this._regionBox = new T.Box3();
      this._regionExtent = new T.Vector3();
      this._regionUniforms = {
        celmaRegionCount: { value: 0 },
        celmaRegionSeeds: { value: Array.from({ length: 24 }, () => new T.Vector4()) },
        celmaRegionColors: { value: Array.from({ length: 24 }, () => new T.Color('#50ded0')) },
        celmaRegionEnabled: { value: new Float32Array(24) },
        celmaRegionMode: { value: 0 }, celmaRegionContext: { value: 1 },
        celmaRegionPulse: { value: 1 }
      };
      this._brushUniforms = {
        celmaBrushColors: { value: Array.from({ length: 32 }, () => new T.Color('#97b6cf')) },
        celmaBrushEnabled: { value: new Float32Array(32) }
      };
      this._brushCursor = document.createElement('div');
      this._brushCursor.className = 'celma-brush-cursor';
      this._brushCursor.setAttribute('aria-hidden', 'true');
      this._brushCursor.style.cssText = 'display:none;position:absolute;pointer-events:none;z-index:5;box-sizing:border-box;border:2px solid #50ded0;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 1px rgba(255,255,255,.9),inset 0 0 0 1px rgba(255,255,255,.6);';
      this.container.appendChild(this._brushCursor);
      this._markerGeometry = new T.SphereGeometry(1, 12, 8);
      this._markerGroup = new T.Group();
      this._markerGroup.name = 'CELMA · anotaciones de superficie';
      this.scene.add(this._markerGroup);
      this._setupLoader();
      this._setupInput();
      if (typeof ResizeObserver !== 'undefined') {
        this._observer = new ResizeObserver(() => this.resize());
        this._observer.observe(this.container);
      }
      this.resize();
      this._status('empty', 'Carga un GLB real; las piezas se reconocerán por sus nombres o por tus asignaciones.');
      return true;
    }

    _setupLoader() {
      const { GLTFLoader, DRACOLoader, KTX2Loader, MeshoptDecoder } = this.libs;
      this.loader = new GLTFLoader();
      if (DRACOLoader) {
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath(new URL('vendor/draco/', document.baseURI).href);
        this.dracoLoader.setWorkerLimit(Math.min(2, Math.max(1, (navigator.hardwareConcurrency || 2) - 1)));
        this.loader.setDRACOLoader(this.dracoLoader);
      }
      if (KTX2Loader) {
        this.ktx2Loader = new KTX2Loader();
        this.ktx2Loader.setTranscoderPath(new URL('vendor/basis/', document.baseURI).href);
        this.ktx2Loader.setWorkerLimit(2);
        this.ktx2Loader.detectSupport(this.renderer);
        this.loader.setKTX2Loader(this.ktx2Loader);
      }
      if (MeshoptDecoder) this.loader.setMeshoptDecoder(MeshoptDecoder);
    }

    _listen(element, type, callback, options) {
      element.addEventListener(type, callback, options);
      this._listeners.push(() => element.removeEventListener(type, callback, options));
    }

    _setupInput() {
      const canvas = this.renderer.domElement;
      this._listen(canvas, 'pointerdown', event => {
        if (this._replayingPointer) return;
        this._pointers.add(event.pointerId);
        this._pointerEvents.set(event.pointerId, { pointerId: event.pointerId, pointerType: event.pointerType, clientX: event.clientX, clientY: event.clientY, button: event.button });
        if (this._brush.enabled) {
          if (this._pointers.size > 1) {
            this._cancelBrushStroke();
            this._brushPointer = null;
            this._brushMultitouch = true;
            this._brushCursor.style.display = 'none';
            this.controls.enabled = this._visible;
            const first = [...this._pointerEvents.values()].find(item => item.pointerId !== event.pointerId);
            if (first && this._pointers.size === 2) {
              this._replayingPointer = true;
              canvas.dispatchEvent(new PointerEvent('pointerdown', { ...first, bubbles: true, isPrimary: true }));
              this._replayingPointer = false;
            }
            return;
          }
          if (event.button !== 0) return;
          event.preventDefault(); event.stopImmediatePropagation();
          this.controls.enabled = false;
          this._brushPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
          this._brushStroke = new Map();
          try { canvas.setPointerCapture(event.pointerId); } catch (error) { /* Some embedded browsers do not capture synthetic pointers. */ }
          this._paintBrushAt(event.clientX, event.clientY);
          this._showBrushCursor(event.clientX, event.clientY);
          return;
        }
        if (this._pointers.size > 1) { if (this._pointer) this._pointer.dragged = true; return; }
        if (event.button !== 0) { this._pointer = null; return; }
        this._pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
      }, { capture: true });
      this._listen(canvas, 'pointermove', event => {
        const tracked = this._pointerEvents.get(event.pointerId);
        if (tracked) { tracked.clientX = event.clientX; tracked.clientY = event.clientY; }
        if (this._brush.enabled) {
          if (this._brushMultitouch) return;
          this._showBrushCursor(event.clientX, event.clientY);
          const pointer = this._brushPointer;
          if (pointer && pointer.id === event.pointerId) {
            event.preventDefault(); event.stopImmediatePropagation();
            const distance = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
            const step = Math.max(3, (this._brushCursorPixels || 18) * .24);
            const samples = Math.min(12, Math.max(1, Math.ceil(distance / step)));
            for (let sample = 1; sample <= samples; sample++) {
              const fraction = sample / samples;
              this._paintBrushAt(pointer.x + (event.clientX - pointer.x) * fraction, pointer.y + (event.clientY - pointer.y) * fraction);
            }
            pointer.x = event.clientX; pointer.y = event.clientY;
          }
          return;
        }
        if (this._pointer && this._pointer.id === event.pointerId && Math.hypot(event.clientX - this._pointer.x, event.clientY - this._pointer.y) > 6) this._pointer.dragged = true;
      }, { capture: true });
      this._listen(canvas, 'pointerup', event => {
        this._pointers.delete(event.pointerId);
        this._pointerEvents.delete(event.pointerId);
        if (this._brush.enabled) {
          if (this._brushMultitouch) {
            if (!this._pointers.size) { this._brushMultitouch = false; queueMicrotask(() => { if (!this._disposed) this.controls.enabled = this._visible && !this._brush.enabled; }); }
            return;
          }
          event.preventDefault(); event.stopImmediatePropagation();
          if (this._brushPointer && this._brushPointer.id === event.pointerId) this._commitBrushStroke();
          this._brushPointer = null;
          try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch (error) { /* Optional pointer capture. */ }
          if (event.pointerType === 'touch') this._brushCursor.style.display = 'none';
          return;
        }
        const pointer = this._pointer;
        if (pointer && pointer.id === event.pointerId && !pointer.dragged && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) <= 6) this._pick(event.clientX, event.clientY);
        this._pointer = null;
      }, { capture: true });
      this._listen(canvas, 'pointercancel', event => {
        this._pointers.delete(event.pointerId); this._pointerEvents.delete(event.pointerId); this._pointer = null;
        if (this._brush.enabled) {
          this._cancelBrushStroke(); this._brushPointer = null;
          if (!this._pointers.size) { this._brushMultitouch = false; this.controls.enabled = false; }
          this._brushCursor.style.display = 'none';
        }
      }, { capture: true });
      this._listen(canvas, 'pointerleave', () => { if (!this._brushPointer && this._brushCursor) this._brushCursor.style.display = 'none'; });
      this._listen(canvas, 'lostpointercapture', () => { if (this._brushPointer && !this._brushMultitouch) { this._commitBrushStroke(); this._brushPointer = null; } });
      this._listen(canvas, 'keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? this.redoBrush() : this.undoBrush(); return; }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); this.redoBrush(); return; }
        if (event.key.toLowerCase() === 'r' || event.key === 'Home') { event.preventDefault(); this.resetCamera(); }
      });
      this._listen(canvas, 'webglcontextlost', event => {
        event.preventDefault();
        this._webglLost = true;
        if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
        this._error('Se interrumpió el contexto WebGL del visor. El navegador puede recuperarlo; los esquemas 2D siguen disponibles.');
      });
      this._listen(canvas, 'webglcontextrestored', () => {
        this._webglLost = false;
        this._updateStatus();
        this._schedule();
      });
    }

    _beginLoad(label) {
      const token = ++this._loadToken;
      this._loading = true;
      if (this._fetchController) this._fetchController.abort();
      this._fetchController = null;
      this._status('loading', 'Cargando ' + label + '…');
      if (!this._model) {
        this.message.style.display = 'flex';
        this.message.textContent = 'Cargando el modelo real… Los archivos grandes pueden tardar unos instantes.';
      }
      return token;
    }

    async loadObject(object, label = 'Modelo celular educativo') {
      if (this._disposed || !this._initialize()) return false;
      const token=this._beginLoad(label);
      try {
        const scene=object && object.scene || object;
        if(token!==this._loadToken || !scene?.isObject3D)return false;
        this._install({scene,animations:[]},label);
        return true;
      } catch(error){this._loading=false;this._error(error.message || 'No se pudo preparar el modelo celular.');return false;}
    }

    async loadFile(file) {
      if (this._disposed) return false;
      if (!this._initialize()) return false;
      if (!file || typeof file.arrayBuffer !== 'function') { this._error('Selecciona un archivo GLB válido.'); return false; }
      const label = clean(file.name) || 'archivo GLB';
      const size = Number(file.size);
      const token = this._beginLoad(label + (size ? ' · ' + (size / 1048576).toFixed(1) + ' MB' : ''));
      try {
        const data = await file.arrayBuffer();
        if (token !== this._loadToken || this._disposed) return false;
        this._validateGLB(data);
        this._status('loading', 'Preparando geometrías y materiales de ' + label + '…');
        return await this._parse(data, new URL('.', document.baseURI).href, label, token);
      } catch (error) {
        if (token === this._loadToken && !this._disposed) { this._loading = false; this._error(this._loadError(error, false)); }
        return false;
      }
    }

    async loadURL(url) {
      if (this._disposed) return false;
      if (!this._initialize()) return false;
      let address;
      try {
        address = new URL(String(url || '').trim(), document.baseURI);
        if (!String(url || '').trim() || !['https:', 'http:', 'blob:', 'file:'].includes(address.protocol)) throw new Error('Usa un enlace HTTP o HTTPS directo a un archivo GLB.');
      } catch (error) { this._error('Usa un enlace válido y directo al archivo GLB.'); return false; }
      let label = address.pathname.split('/').pop() || 'modelo GLB';
      try { label = decodeURIComponent(label); } catch (error) { /* Keep literal filename for malformed URL escapes. */ }
      label = clean(label);
      const token = this._beginLoad(label);
      const controller = new AbortController();
      this._fetchController = controller;
      try {
        const response = await fetch(address.href, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!response.ok) throw new Error('HTTP ' + response.status + ': no se pudo descargar el modelo.');
        const data = await response.arrayBuffer();
        if (token !== this._loadToken || this._disposed) return false;
        this._validateGLB(data);
        this._status('loading', 'Preparando geometrías y materiales de ' + label + '…');
        const resourcePath = address.protocol === 'blob:' ? new URL('.', document.baseURI).href : new URL('.', address).href;
        return await this._parse(data, resourcePath, label, token);
      } catch (error) {
        if (token === this._loadToken && !this._disposed && error.name !== 'AbortError') { this._loading = false; this._error(this._loadError(error, true)); }
        return false;
      } finally {
        if (this._fetchController === controller) this._fetchController = null;
      }
    }

    _validateGLB(data) {
      if (!(data instanceof ArrayBuffer) || data.byteLength < 20) throw new Error('El archivo no contiene un GLB completo.');
      const header = new DataView(data, 0, 12);
      if (header.getUint32(0, true) !== 0x46546c67) throw new Error('El archivo no es un GLB binario. Comprueba que descargaste el modelo y no una página web o un ZIP.');
      if (header.getUint32(4, true) !== 2) throw new Error('El visor admite archivos GLB de glTF 2.0. Exporta el modelo en esa versión.');
      if (header.getUint32(8, true) > data.byteLength) throw new Error('El archivo GLB está incompleto. Vuelve a descargarlo o selecciona el original.');
    }

    _parse(data, resourcePath, label, token) {
      return new Promise((resolve, reject) => {
        this.loader.parse(data, resourcePath, gltf => {
          if (token !== this._loadToken || this._disposed) { this._disposeGLTF(gltf); resolve(false); return; }
          try {
            this._install(gltf, label);
            resolve(true);
          } catch (error) {
            if (this._gltf !== gltf) this._disposeGLTF(gltf);
            reject(error);
          }
        }, reject);
      });
    }

    _loadError(error, remote) {
      const detail = clean(error && error.message);
      if (/GLB|glTF 2\.0|HTTP \d|incompleto|archivo no/i.test(detail)) return detail;
      if (/draco|ktx2|basis|wasm|meshopt|decoder|transcoder/i.test(detail)) return 'No se pudo descomprimir el modelo. Comprueba los decodificadores locales y abre la página desde un servidor HTTP.';
      if (remote && /fetch|network|cors|failed to load/i.test(detail)) return 'No se pudo descargar el GLB. El enlace debe apuntar al archivo y permitir acceso desde este sitio (CORS). También puedes cargarlo desde tu dispositivo.';
      if (location.protocol === 'file:') return 'No se pudo leer el modelo o sus recursos. Abre la página desde un servidor HTTP, o selecciona un GLB con texturas integradas.';
      return 'No se pudo abrir el modelo GLB. Comprueba que es glTF 2.0, que el archivo está completo y que sus texturas y compresiones son compatibles.';
    }

    _componentDefinitions() {
      const source = window.CELMA_3D_COMPONENTS || {};
      if (Array.isArray(source)) return source.map(item => [item.key || item.id, item]);
      return Object.entries(source);
    }

    _compileRules() {
      this._rules = [];
      this._definitions.clear();
      for (const [key, definition] of this._componentDefinitions()) {
        this._definitions.set(key, definition);
        if (!key || key === 'all' || key === 'other') continue;
        const patterns = [];
        for (const candidate of definition.patterns || []) {
          try { patterns.push(candidate instanceof RegExp ? new RegExp(candidate.source, candidate.flags.replace(/[gy]/g, '')) : new RegExp(candidate, 'i')); } catch (error) { /* Ignore invalid, nonessential classification rules. */ }
        }
        this._rules.push({ key, patterns });
      }
    }

    _classify(mesh, materialNames) {
      if(this._definitions.has(mesh.userData.celmaComponent))return mesh.userData.celmaComponent;
      const nearest = [clean(mesh.name), ...materialNames];
      const inspect = names => {
        const keys = new Set();
        for (const rule of this._rules) for (const name of names) if (name && rule.patterns.some(pattern => pattern.test(name))) keys.add(rule.key);
        return keys;
      };
      let keys = inspect(nearest);
      if (keys.size) return keys.size === 1 ? [...keys][0] : 'other';
      let node = mesh.parent;
      while (node && node !== this.scene) {
        keys = inspect([clean(node.name)]);
        if (keys.size) return keys.size === 1 ? [...keys][0] : 'other';
        node = node.parent;
      }
      return 'other';
    }

    _install(gltf, label) {
      const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
      if (!model) throw new Error('El GLB no incluye una escena que pueda mostrarse.');
      const meshes = [];
      model.traverse(node => { if (node.isMesh && node.geometry) meshes.push(node); });
      if (!meshes.length) throw new Error('El GLB no contiene mallas visibles.');
      model.updateMatrixWorld(true);
      const modelBounds = new this.THREE.Box3().setFromObject(model);
      if (modelBounds.isEmpty()) throw new Error('Las geometrías del GLB no tienen límites válidos.');
      const size = modelBounds.getSize(new this.THREE.Vector3());
      if (![size.x, size.y, size.z].every(Number.isFinite)) throw new Error('Las coordenadas del modelo no son válidas.');

      this._clearModel();
      this._gltf = gltf;
      this._model = model;
      this._modelName = label;
      this._compileRules();
      this._brushKeys = ['', ...[...this._definitions.keys()].filter(key => key !== 'all' && key !== 'other').slice(0, 31)];
      const usedGeometries = new Set();
      const geometryUse = new Set();
      for (const mesh of meshes) {
        if (geometryUse.has(mesh.geometry)) mesh.geometry = mesh.geometry.clone();
        geometryUse.add(mesh.geometry);
      }
      const counts = new Map();
      for (const mesh of meshes) {
        const name = clean(mesh.name) || 'Malla';
        counts.set(name, (counts.get(name) || 0) + 1);
      }
      const occurrences = new Map();
      for (let index = 0; index < meshes.length; index++) {
        const mesh = meshes[index];
        if (usedGeometries.has(mesh.geometry)) mesh.geometry = mesh.geometry.clone();
        usedGeometries.add(mesh.geometry);
        const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const materialNames = [...new Set(sourceMaterials.filter(Boolean).map(material => clean(material.name)).filter(Boolean))];
        const baseName = clean(mesh.name) || 'Malla';
        const nth = (occurrences.get(baseName) || 0) + 1;
        occurrences.set(baseName, nth);
        let name = baseName;
        if (counts.get(baseName) > 1) {
          const ancestor = clean(mesh.parent && mesh.parent.name);
          name += (ancestor && ancestor !== baseName ? ' · ' + ancestor : '') + ' [' + nth + ']';
        }
        if (!clean(mesh.name) && counts.get(baseName) === 1) name += ' 1';
        const record = {
          id: 'part-' + String(index + 1).padStart(5, '0'), name,
          component: this._classify(mesh, materialNames), materialName: materialNames.join(' · ') || 'Sin nombre de material'
        };
        const materials = sourceMaterials.map(material => {
          if (!material || typeof material.clone !== 'function') return material;
          const clone = material.clone();
          this._installRegionShader(clone);
          this._clonedMaterials.add(clone);
          return { material: clone, original: material, color: material.color ? material.color.clone() : null,
            emissive: material.emissive ? material.emissive.clone() : null, emissiveIntensity: material.emissiveIntensity,
            opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite,
            visible: material.visible };
        });
        mesh.material = Array.isArray(mesh.material) ? materials.map(item => item && item.material || item) : (materials[0] && materials[0].material || materials[0]);
        const part = { record, mesh, materials, originalVisible: mesh.visible };
        this.parts.push(record);
        this._partById.set(record.id, part);
        this._partByMesh.set(mesh, part);
        this._pickables.push(mesh);
        this._prepareBrushMesh(part);
      }
      this.scene.add(model);
      this._bounds.copy(modelBounds);
      this._modelRadius = Math.max(size.length() / 2, .00001);
      this._animations = (gltf.animations || []).filter(clip => clip && clip.duration > 0);
      if (this._animations.length) this._mixer = new this.THREE.AnimationMixer(model);
      this.message.style.display = 'none';
      this._loading = false;
      this._emit('onParts', this._records());
      this.resetCamera();
      this._syncNativeAnimation();
      this._applyHighlights();
      this._emitBrushChange();
      this._updateStatus();
      this._schedule();
    }

    _records() {
      return this.parts.map(part => ({ id: part.id, name: part.name, component: part.component, materialName: part.materialName }));
    }

    _stage() {
      return clamp(Math.floor(Number(this.state.stage) || 0), 0, 3);
    }

    _getActiveKeys() {
      const keys = this._activeKeys;
      keys.clear();
      if(this._focusComponents){for(const key of this._focusComponents)keys.add(key);return keys;}
      if (this.state.mode === 'process') {
        const mapping = (window.CELMA_3D_REGIONS || {})[this.state.id];
        const stage = mapping && mapping.stages && mapping.stages[this._stage()];
        const regions = stage && stage.regions;
        if (Array.isArray(regions)) {
          for (const region of regions) {
            const key = typeof region === 'string' ? region : region && (region.component || region.key);
            if (key) keys.add(key);
          }
        }
        if (!keys.size && this.state.component && this.state.component !== 'all') keys.add(this.state.component);
        const available = key => this._hasBrushComponent(key) || this._regions.some(region => region.component === key) || this.parts.some(part => part.component === key || part.id === key);
        if (![...keys].some(available)) {
          const primary = mapping && mapping.primary || this.state.component;
          if (primary && primary !== 'all' && available(primary)) keys.add(primary);
        }
      } else if (this.state.component && this.state.component !== 'all') keys.add(this.state.component);
      return keys;
    }

    _componentColor(key) {
      const entry = this._definitions.get(key);
      return entry && entry.color || DEFAULT_COLORS[key] || DEFAULT_COLORS.other;
    }

    _installRegionShader(material) {
      const previous = material.onBeforeCompile;
      const previousCacheKey = material.customProgramCacheKey;
      material.onBeforeCompile = (shader, renderer) => {
        if (typeof previous === 'function') previous.call(material, shader, renderer);
        Object.assign(shader.uniforms, this._regionUniforms);
        Object.assign(shader.uniforms, this._brushUniforms);
        shader.vertexShader = `
          varying vec3 celmaWorldPosition;
          attribute float celmaBrushLabel;
          uniform vec3 celmaBrushColors[32];
          uniform float celmaBrushEnabled[32];
          varying vec3 celmaPaintColor;
          varying float celmaPaintMask;
        ` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          int celmaLabelIndex = int(clamp(celmaBrushLabel, 0.0, 31.0));
          celmaPaintMask = celmaBrushEnabled[celmaLabelIndex];
          celmaPaintColor = celmaBrushColors[celmaLabelIndex] * celmaPaintMask;
        `);
        shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `
          #include <worldpos_vertex>
          vec4 celmaWorld = vec4(transformed, 1.0);
          #ifdef USE_BATCHING
            celmaWorld = batchingMatrix * celmaWorld;
          #endif
          #ifdef USE_INSTANCING
            celmaWorld = instanceMatrix * celmaWorld;
          #endif
          celmaWorldPosition = (modelMatrix * celmaWorld).xyz;
        `);
        shader.fragmentShader = `
          varying vec3 celmaWorldPosition;
          varying vec3 celmaPaintColor;
          varying float celmaPaintMask;
          uniform int celmaRegionCount;
          uniform vec4 celmaRegionSeeds[24];
          uniform vec3 celmaRegionColors[24];
          uniform float celmaRegionEnabled[24];
          uniform float celmaRegionMode;
          uniform float celmaRegionContext;
          uniform float celmaRegionPulse;
        ` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
          #include <color_fragment>
          float celmaSurfaceMask = 0.0;
          vec3 celmaSurfaceColor = diffuseColor.rgb;
          for (int celmaIndex = 0; celmaIndex < 24; celmaIndex++) {
            if (celmaIndex < celmaRegionCount && celmaRegionEnabled[celmaIndex] > 0.0) {
              vec4 celmaSeed = celmaRegionSeeds[celmaIndex];
              float celmaDistance = distance(celmaWorldPosition, celmaSeed.xyz);
              float celmaMask = (1.0 - smoothstep(celmaSeed.w * 0.64, celmaSeed.w, celmaDistance)) * celmaRegionEnabled[celmaIndex];
              if (celmaMask > celmaSurfaceMask) {
                celmaSurfaceMask = celmaMask;
                celmaSurfaceColor = celmaRegionColors[celmaIndex];
              }
            }
          }
          if (celmaPaintMask > 0.001) {
            celmaSurfaceColor = celmaPaintColor / max(celmaPaintMask, 0.001);
            celmaSurfaceMask = max(celmaSurfaceMask, celmaPaintMask);
          }
          if (celmaRegionMode > 0.5) {
            if (celmaRegionContext < 0.5 && celmaSurfaceMask < 0.015) discard;
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.20, 0.28), (1.0 - celmaSurfaceMask) * 0.73);
            diffuseColor.a *= mix(0.19, 1.0, celmaSurfaceMask);
          }
          diffuseColor.rgb = mix(diffuseColor.rgb, celmaSurfaceColor, celmaSurfaceMask * 0.82);
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
          #include <emissivemap_fragment>
          totalEmissiveRadiance += celmaSurfaceColor * celmaSurfaceMask * 0.12 * celmaRegionPulse;
        `);
      };
      // Every material shares the same uniform objects; changing a region does
      // not rebuild geometry or force shader compilation on timeline frames.
      material.customProgramCacheKey = () => (typeof previousCacheKey === 'function' ? previousCacheKey.call(material) : '') + '|celma-regions-brush-v2';
      material.needsUpdate = true;
    }

    _syncRegionUniforms(activeKeys, showAll) {
      if (!this._regionUniforms) return;
      const uniforms = this._regionUniforms;
      uniforms.celmaRegionCount.value = this._regions.length;
      const hasActiveRegion = this._regions.some(region => activeKeys.has(region.component) || this._selectedId === region.id) || [...activeKeys].some(key => this._hasBrushComponent(key));
      uniforms.celmaRegionMode.value = hasActiveRegion && !showAll ? 1 : 0;
      uniforms.celmaRegionContext.value = this._contextVisible ? 1 : 0;
      uniforms.celmaRegionPulse.value = 1 + .12 * Math.sin(this.state.progress * Math.PI * 2);
      this._brushUniforms.celmaBrushEnabled.value.fill(0);
      for (let index = 1; index < this._brushKeys.length; index++) {
        this._brushUniforms.celmaBrushColors.value[index].set(this._componentColor(this._brushKeys[index]));
        this._brushUniforms.celmaBrushEnabled.value[index] = showAll || activeKeys.has(this._brushKeys[index]) ? 1 : 0;
      }
      for (let index = 0; index < 24; index++) {
        const region = this._regions[index];
        if (!region) { uniforms.celmaRegionEnabled.value[index] = 0; continue; }
        uniforms.celmaRegionSeeds.value[index].set(region.point[0], region.point[1], region.point[2], region.radius);
        uniforms.celmaRegionColors.value[index].set(this._componentColor(region.component));
        uniforms.celmaRegionEnabled.value[index] = showAll || activeKeys.has(region.component) || this._selectedId === region.id ? 1 : 0;
        const marker = this._regionMarkers.get(region.id);
        if (marker) {
          marker.visible = showAll || this._contextVisible || activeKeys.has(region.component) || this._selectedId === region.id;
          marker.material.color.set(this._selectedId === region.id ? '#f1faff' : this._componentColor(region.component));
          marker.material.opacity = showAll || activeKeys.has(region.component) || this._selectedId === region.id ? .95 : .25;
        }
      }
    }

    _validRegion(input) {
      if (!input || !Array.isArray(input.point) || input.point.length !== 3 || !input.point.every(value => Number.isFinite(Number(value)))) return null;
      const radius = Number(input.radius);
      if (!Number.isFinite(radius) || radius <= 0) return null;
      const component = clean(input.component);
      if (!this._definitions.has(component) || component === 'all' || component === 'other') return null;
      let id = clean(input.id);
      if (!id) {
        do { id = 'region-' + (++this._regionSerial); } while (this._regions.some(region => region.id === id));
      }
      return { id, component, point: input.point.map(Number), radius,
        name: clean(input.name) || (this._definitions.get(component).label || component),
        normal: Array.isArray(input.normal) && input.normal.length === 3 && input.normal.every(value => Number.isFinite(Number(value))) ? input.normal.map(Number) : null };
    }

    _makeRegionMarker(region) {
      if (!this.THREE || !this._markerGroup) return;
      const marker = new this.THREE.Mesh(this._markerGeometry, new this.THREE.MeshBasicMaterial({
        color: this._componentColor(region.component), transparent: true, opacity: .95, depthWrite: false
      }));
      marker.position.set(region.point[0], region.point[1], region.point[2]);
      const radius = this.getRegionScale() * .012;
      marker.scale.setScalar(radius);
      marker.name = 'Anotación: ' + region.name;
      marker.userData.celmaRegionId = region.id;
      if (region.normal) marker.position.addScaledVector(this._normal.fromArray(region.normal).normalize(), radius * .3);
      this._markerGroup.add(marker);
      this._regionMarkers.set(region.id, marker);
    }

    setRegions(regions) {
      if (this._disposed) return false;
      this._clearRegions();
      for (const input of (Array.isArray(regions) ? regions : []).slice(0, 24)) {
        const region = this._validRegion(input);
        if (!region || this._regions.some(existing => existing.id === region.id)) continue;
        this._regions.push(region);
        this._makeRegionMarker(region);
      }
      ++this._regionRevision;
      this._applyHighlights();
      this._updateStatus();
      this._schedule();
      return true;
    }

    addRegion(input) {
      if (this._disposed || !this._model) return null;
      if (this._regions.length >= 24) { this._status('ready', 'El visor admite hasta 24 anotaciones de superficie. Elimina una para añadir otra.'); return null; }
      const region = this._validRegion(input);
      if (!region || this._regions.some(existing => existing.id === region.id)) return null;
      this._regions.push(region);
      this._makeRegionMarker(region);
      ++this._regionRevision;
      this._selectedId = region.id;
      this._applyHighlights();
      this._updateStatus();
      this._schedule();
      return this._copyRegion(region);
    }

    removeRegion(id) {
      if (this._disposed) return false;
      const index = this._regions.findIndex(region => region.id === id);
      if (index < 0) return false;
      this._regions.splice(index, 1);
      const marker = this._regionMarkers.get(id);
      if (marker) { this._markerGroup.remove(marker); marker.material.dispose(); this._regionMarkers.delete(id); }
      if (this._selectedId === id) this._selectedId = '';
      ++this._regionRevision;
      this._applyHighlights();
      this._updateStatus();
      this._schedule();
      return true;
    }

    _copyRegion(region) {
      return { id: region.id, name: region.name, component: region.component, point: region.point.slice(), radius: region.radius,
        normal: region.normal ? region.normal.slice() : null };
    }

    getRegions() { return this._regions.map(region => this._copyRegion(region)); }
    getRegionScale() { return this._modelRadius || 1; }

    getOrganelleState(key) {
      const part=this.parts.find(item=>item.component===key);
      const source=part && this._partById.get(part.id)?.materials[0];
      return {visible:true,opacity:source?.opacity ?? 1,...this._organelleStates.get(key)};
    }

    setOrganelleState(key, next={}) {
      const state=this.getOrganelleState(key);
      if(next.visible!==undefined)state.visible=!!next.visible;
      if(next.opacity!==undefined)state.opacity=clamp(Number(next.opacity)||0,0,1);
      this._organelleStates.set(key,state);this._applyHighlights();this._schedule();
    }

    isolateOrganelles(keys=null) {
      this._isolatedComponents=Array.isArray(keys)?new Set(keys):null;
      this._applyHighlights();this._schedule();
    }

    setScientificFocus(keys=null) {
      this._focusComponents=Array.isArray(keys)?new Set(keys):null;
      this._applyHighlights();this._schedule();
    }

    clearOrganelleOverrides() {
      this._organelleStates.clear();this._isolatedComponents=null;this._focusComponents=null;
      this._applyHighlights();this._schedule();
    }

    _prepareBrushMesh(part) {
      const geometry = part.mesh.geometry;
      const position = geometry.getAttribute('position');
      if (!position || !position.count) return;
      const labels = new Uint8Array(position.count);
      const attribute = new this.THREE.BufferAttribute(labels, 1, false);
      attribute.setUsage(this.THREE.DynamicDrawUsage);
      geometry.setAttribute('celmaBrushLabel', attribute);
      this._brushMeshes.set(part.record.id, { part, labels, attribute, position,
        normals: geometry.getAttribute('normal'), offsets: null, neighbors: null,
        visited: new Uint32Array(position.count), queue: new Uint32Array(position.count), stamp: 0 });
      if (this.libs.MeshBVH && this.libs.acceleratedRaycast && !part.mesh.isSkinnedMesh && !geometry.morphAttributes.position) {
        try {
          geometry.boundsTree = new this.libs.MeshBVH(geometry, { maxLeafTris: 12, indirect: true });
          part.mesh.raycast = this.libs.acceleratedRaycast;
        } catch (error) { /* Standard raycasting remains available for unsupported geometry. */ }
      }
    }

    _buildBrushNeighborhood(resource) {
      if (resource.offsets) return;
      const index = resource.part.mesh.geometry.index;
      const count = resource.position.count;
      const length = index ? index.count : count;
      const vertex = index ? offset => index.getX(offset) : offset => offset;
      const degrees = new Uint32Array(count);
      for (let offset = 0; offset + 2 < length; offset += 3) {
        degrees[vertex(offset)] += 2; degrees[vertex(offset + 1)] += 2; degrees[vertex(offset + 2)] += 2;
      }
      const offsets = new Uint32Array(count + 1);
      for (let i = 0; i < count; i++) offsets[i + 1] = offsets[i] + degrees[i];
      const neighbors = new Uint32Array(offsets[count]);
      const cursor = offsets.slice(0, count);
      for (let offset = 0; offset + 2 < length; offset += 3) {
        const a = vertex(offset), b = vertex(offset + 1), c = vertex(offset + 2);
        neighbors[cursor[a]++] = b; neighbors[cursor[a]++] = c;
        neighbors[cursor[b]++] = a; neighbors[cursor[b]++] = c;
        neighbors[cursor[c]++] = a; neighbors[cursor[c]++] = b;
      }
      resource.offsets = offsets; resource.neighbors = neighbors;
    }

    _hasBrushComponent(key) {
      const label = this._brushKeys.indexOf(key);
      return label > 0 && this._brushCounts[label] > 0;
    }

    _brushHit(clientX, clientY) {
      if (!this._visible || !this._model || this._webglLost) return null;
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      this._mouse.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(this._mouse, this.camera);
      this.raycaster.firstHitOnly = true;
      this._hits.length = 0;
      this.raycaster.intersectObjects(this._pickables, false, this._hits);
      for (const hit of this._hits) {
        const part = this._partByMesh.get(hit.object);
        if (!part || !part.mesh.visible || part.mesh.userData.pickThrough || this.getOrganelleState(part.record.component).opacity<.025) continue;
        let parent = part.mesh.parent;
        while (parent && parent.visible) parent = parent.parent;
        if (!parent) return hit;
      }
      return null;
    }

    _showBrushCursor(clientX, clientY) {
      if (!this._brushCursor || !this._brush.enabled || !this._visible || !this._model || this._brushMultitouch) return;
      const rect = this.container.getBoundingClientRect();
      const distance = this._brushLastDepth || this.camera.position.distanceTo(this.controls.target);
      const pixels = clamp(this._brush.radius * this._height / (Math.tan(this.camera.fov * Math.PI / 360) * Math.max(distance, .00001)), 8, 480);
      this._brushCursorPixels = pixels;
      this._brushCursor.style.display = 'block';
      this._brushCursor.style.left = (clientX - rect.left) + 'px';
      this._brushCursor.style.top = (clientY - rect.top) + 'px';
      this._brushCursor.style.width = pixels + 'px';
      this._brushCursor.style.height = pixels + 'px';
      this._brushCursor.style.borderColor = this._brush.mode === 'erase' ? '#ed758a' : this._componentColor(this._brush.component);
      this._brushCursor.style.setProperty('--brush-color',this._brush.mode === 'erase' ? '#ed758a' : this._componentColor(this._brush.component));
      this._brushCursor.style.borderStyle = this._brush.mode === 'erase' ? 'dashed' : 'solid';
      this._brushCursor.style.background = this._brush.mode === 'erase' ? 'rgba(237,117,138,.07)' : 'transparent';
    }

    _paintBrushAt(clientX, clientY) {
      if (!this._brushStroke || !this._brush.enabled) return;
      const hit = this._brushHit(clientX, clientY);
      if (!hit || !hit.face) return;
      const part = this._partByMesh.get(hit.object);
      const resource = part && this._brushMeshes.get(part.record.id);
      if (!resource) return;
      const label = this._brush.mode === 'erase' ? 0 : this._brushKeys.indexOf(this._brush.component);
      if (label < 0) return;
      this._buildBrushNeighborhood(resource);
      const T = this.THREE;
      const world = new T.Vector3();
      const normal = new T.Vector3();
      const delta = new T.Vector3();
      const normalMatrix = new T.Matrix3().getNormalMatrix(hit.object.matrixWorld);
      const hitNormal = hit.face.normal.clone().applyNormalMatrix(normalMatrix).normalize();
      const viewDirection = this.camera.position.clone().sub(hit.point).normalize();
      const radius = this._brush.radius;
      const radiusSquared = radius * radius;
      // Connected vertices plus facing/depth restrictions keep a stroke on the
      // visible sheet instead of jumping across neighboring, occluded tubes.
      const maxDepth = Math.max(radius * .36, this.getRegionScale() * .002);
      const stamp = resource.stamp = (resource.stamp + 1) >>> 0 || 1;
      if (stamp === 1) resource.visited.fill(0);
      let head = 0, tail = 0;
      for (const seed of [hit.face.a, hit.face.b, hit.face.c]) {
        if (seed < resource.labels.length && resource.visited[seed] !== stamp) { resource.visited[seed] = stamp; resource.queue[tail++] = seed; }
      }
      let changed = false;
      let changes = this._brushStroke.get(part.record.id);
      while (head < tail) {
        const vertex = resource.queue[head++];
        world.fromBufferAttribute(resource.position, vertex).applyMatrix4(hit.object.matrixWorld);
        delta.copy(world).sub(hit.point);
        if (delta.lengthSq() > radiusSquared || Math.abs(delta.dot(hitNormal)) > maxDepth) continue;
        if (resource.normals) {
          normal.fromBufferAttribute(resource.normals, vertex).applyNormalMatrix(normalMatrix).normalize();
          if (normal.dot(hitNormal) < .05 || normal.dot(viewDirection) < -.08) continue;
        }
        const before = resource.labels[vertex];
        if (before !== label) {
          if (!changes) { changes = new Map(); this._brushStroke.set(part.record.id, changes); }
          if (!changes.has(vertex)) changes.set(vertex, before);
          if (before) --this._brushCounts[before];
          if (label) ++this._brushCounts[label];
          resource.labels[vertex] = label;
          changed = true;
        }
        for (let offset = resource.offsets[vertex]; offset < resource.offsets[vertex + 1]; offset++) {
          const neighbor = resource.neighbors[offset];
          if (resource.visited[neighbor] !== stamp) { resource.visited[neighbor] = stamp; resource.queue[tail++] = neighbor; }
        }
      }
      this._brushLastDepth = this.camera.position.distanceTo(hit.point);
      if (changed) { resource.attribute.needsUpdate = true; this._applyHighlights(); this._schedule(); }
    }

    _commitBrushStroke() {
      if (!this._brushStroke) return false;
      const stroke = [];
      for (const [id, changes] of this._brushStroke) {
        const resource = this._brushMeshes.get(id);
        if (!resource) continue;
        const entries = [...changes].filter(([vertex, before]) => resource.labels[vertex] !== before);
        if (!entries.length) continue;
        stroke.push({ id, indices: Uint32Array.from(entries, entry => entry[0]), before: Uint8Array.from(entries, entry => entry[1]), after: Uint8Array.from(entries, entry => resource.labels[entry[0]]) });
      }
      this._brushStroke = null;
      if (stroke.length) {
        this._brushUndo.push(stroke); this._brushRedo.length = 0;
        while (this._brushUndo.length > 40) this._brushUndo.shift();
        this._emitBrushChange(); this._updateStatus();
      }
      return !!stroke.length;
    }

    _cancelBrushStroke() {
      if (!this._brushStroke) return;
      for (const [id, changes] of this._brushStroke) {
        const resource = this._brushMeshes.get(id);
        if (!resource) continue;
        for (const [vertex, before] of changes) this._setBrushLabel(resource, vertex, before);
        resource.attribute.needsUpdate = true;
      }
      this._brushStroke = null; this._applyHighlights(); this._schedule();
    }

    _setBrushLabel(resource, vertex, label) {
      const before = resource.labels[vertex];
      if (before === label) return;
      if (before) --this._brushCounts[before];
      if (label) ++this._brushCounts[label];
      resource.labels[vertex] = label;
    }

    _restoreBrushStroke(stroke, direction) {
      for (const item of stroke) {
        const resource = this._brushMeshes.get(item.id);
        if (!resource) continue;
        for (let index = 0; index < item.indices.length; index++) this._setBrushLabel(resource, item.indices[index], item[direction][index]);
        resource.attribute.needsUpdate = true;
      }
      this._applyHighlights(); this._updateStatus(); this._schedule(); this._emitBrushChange();
    }

    setBrush(next = {}) {
      if (this._disposed) return false;
      this._commitBrushStroke(); this._brushPointer = null;
      if (next.editing !== undefined) this._brush.editing = !!next.editing;
      this._brush.enabled = next.enabled === undefined ? this._brush.enabled : !!next.enabled;
      if (next.mode === 'paint' || next.mode === 'erase') this._brush.mode = next.mode;
      if (next.component && this._brushKeys.includes(next.component)) this._brush.component = next.component;
      if (Number.isFinite(Number(next.radius)) && Number(next.radius) > 0) this._brush.radius = Number(next.radius);
      this._brushMultitouch = false; this._pointers.clear(); this._pointerEvents.clear();
      if (this.controls) this.controls.enabled = this._visible && !this._brush.enabled;
      if (this.renderer) {
        this.renderer.domElement.style.cursor = this._brush.enabled ? 'none' : 'grab';
        this.renderer.domElement.setAttribute('data-brush-mode', this._brush.enabled ? this._brush.mode : 'off');
      }
      if (this._brushCursor) this._brushCursor.style.display = 'none';
      this._applyHighlights(); this._schedule();
      return true;
    }

    undoBrush() {
      this._commitBrushStroke();
      const stroke = this._brushUndo.pop();
      if (!stroke) return false;
      this._brushRedo.push(stroke); this._restoreBrushStroke(stroke, 'before'); return true;
    }

    redoBrush() {
      this._commitBrushStroke();
      const stroke = this._brushRedo.pop();
      if (!stroke) return false;
      this._brushUndo.push(stroke); this._restoreBrushStroke(stroke, 'after'); return true;
    }

    clearBrush() {
      this._commitBrushStroke();
      const stroke = [];
      for (const [id, resource] of this._brushMeshes) {
        const indices = [];
        for (let vertex = 0; vertex < resource.labels.length; vertex++) if (resource.labels[vertex]) indices.push(vertex);
        if (!indices.length) continue;
        stroke.push({ id, indices: Uint32Array.from(indices), before: Uint8Array.from(indices, vertex => resource.labels[vertex]), after: new Uint8Array(indices.length) });
      }
      if (!stroke.length) return false;
      this._brushUndo.push(stroke); this._brushRedo.length = 0;
      while (this._brushUndo.length > 40) this._brushUndo.shift();
      this._restoreBrushStroke(stroke, 'after'); return true;
    }

    getBrushSummary() {
      return this._brushKeys.slice(1).map((component, index) => ({ component, count: this._brushCounts[index + 1] })).filter(item => item.count > 0);
    }

    _emitBrushChange() {
      this._emit('onBrushChange', { summary: this.getBrushSummary(), canUndo: !!this._brushUndo.length, canRedo: !!this._brushRedo.length, hasPaint: this._brushCounts.some(count => count > 0) });
    }

    getBrushData() {
      const meshes = [];
      for (const [id, resource] of this._brushMeshes) {
        if (!resource.labels.some(label => label > 0)) continue;
        const chunks = [];
        for (let offset = 0; offset < resource.labels.length; offset += 32768) chunks.push(String.fromCharCode(...resource.labels.subarray(offset, offset + 32768)));
        meshes.push({ id, count: resource.labels.length, data: btoa(chunks.join('')) });
      }
      return { version: 1, componentKeys: this._brushKeys.slice(), meshes, signature:this._brushSignature() };
    }

    _brushSignature() {
      return [...this._brushMeshes].map(([id,resource]) => {
        const samples=[];
        for(const fraction of [0,.25,.5,.75,1]){
          const index=Math.round((resource.position.count-1)*fraction);
          samples.push(...[resource.position.getX(index),resource.position.getY(index),resource.position.getZ(index)].map(value=>Math.round(value*100000)));
        }
        return {id,count:resource.position.count,samples};
      });
    }

    setBrushData(data) {
      if (!data || data.version !== 1 || !Array.isArray(data.meshes) || !Array.isArray(data.componentKeys) || data.componentKeys.length > 256) return false;
      if(data.signature && JSON.stringify(data.signature)!==JSON.stringify(this._brushSignature()))return false;
      const decoded = [];
      const seen = new Set();
      for (const item of data.meshes) {
        if(seen.has(item && item.id))return false;
        seen.add(item && item.id);
        const resource = this._brushMeshes.get(item && item.id);
        if (!resource || Number(item.count) !== resource.labels.length || typeof item.data !== 'string' || item.data.length > Math.ceil(resource.labels.length / 3) * 4 + 4) return false;
        let bytes;
        try { bytes = atob(item.data); } catch (error) { return false; }
        if (bytes.length !== resource.labels.length) return false;
        const labels = new Uint8Array(bytes.length);
        for (let vertex = 0; vertex < bytes.length; vertex++) {
          const source = bytes.charCodeAt(vertex);
          const mapped = source ? this._brushKeys.indexOf(data.componentKeys[source]) : 0;
          labels[vertex] = mapped > 0 ? mapped : 0;
        }
        decoded.push({ resource, labels });
      }
      this._cancelBrushStroke(); this._brushUndo.length = 0; this._brushRedo.length = 0; this._brushCounts.fill(0);
      for (const resource of this._brushMeshes.values()) { resource.labels.fill(0); resource.attribute.needsUpdate = true; }
      for (const { resource, labels } of decoded) {
        resource.labels.set(labels);
        for (const label of labels) if (label) ++this._brushCounts[label];
      }
      this._applyHighlights(); this._updateStatus(); this._schedule(); this._emitBrushChange(); return true;
    }

    _clearRegions() {
      for (const marker of this._regionMarkers.values()) { this._markerGroup.remove(marker); marker.material.dispose(); }
      this._regionMarkers.clear();
      this._regions.length = 0;
      this._regionSerial = 0;
      this._selectedId = '';
      ++this._regionRevision;
    }

    _applyHighlights() {
      if (!this._model) return;
      const activeKeys = this._getActiveKeys();
      const showAll = !this._focusComponents && (this._brush.enabled || this._brush.editing || this.state.mode !== 'process' && (!this.state.component || this.state.component === 'all'));
      this._syncRegionUniforms(activeKeys, showAll);
      const regionalSurface = [...activeKeys].some(key => this._hasBrushComponent(key)) || this._regions.some(region => activeKeys.has(region.component) || region.id === this._selectedId);
      const hasTarget = regionalSurface || this.parts.some(part => activeKeys.has(part.component) || activeKeys.has(part.id));
      const preserveOriginal = !showAll && !hasTarget && !this._selectedId;
      const pulse = this.state.mode === 'process' ? .09 * Math.sin(this.state.progress * Math.PI * 2) : 0;
      for (const record of this.parts) {
        const part = this._partById.get(record.id);
        const selected = record.id === this._selectedId;
        const active = activeKeys.has(record.component) || activeKeys.has(record.id);
        const override=this._organelleStates.get(record.component);
        part.mesh.visible = part.originalVisible && (this._contextVisible || showAll || preserveOriginal || active || selected || regionalSurface);
        if(override?.visible===false || this._isolatedComponents && !this._isolatedComponents.has(record.component))part.mesh.visible=false;
        for (const item of part.materials) {
          if (!item || !item.material) continue;
          const material = item.material;
          const oldTransparent = material.transparent;
          const oldDepthWrite = material.depthWrite;
          if (item.color && material.color) material.color.copy(item.color);
          if (item.emissive && material.emissive) material.emissive.copy(item.emissive);
          if (item.emissiveIntensity !== undefined) material.emissiveIntensity = item.emissiveIntensity;
          material.opacity = item.opacity;
          material.transparent = item.transparent;
          material.depthWrite = item.depthWrite;
          material.visible = item.visible;
          if (selected || active) {
            this._color.set(selected ? '#edf8ff' : this._componentColor(record.component));
            if (material.color) material.color.lerp(this._color, selected ? .6 : .57 + pulse);
            if (material.emissive) {
              material.emissive.lerp(this._color, selected ? .15 : .09);
              material.emissiveIntensity = Math.max(Number(item.emissiveIntensity) || 0, selected ? .5 : .3);
            }
          } else if (!showAll && !preserveOriginal && !regionalSurface) {
            if (material.color) material.color.lerp(this._color.set('#2d4e68'), .62);
            if (material.emissive) material.emissive.copy(this._black);
            material.opacity = clamp((Number(item.opacity) || 1) * .16, .025, .18);
            material.transparent = true;
            material.depthWrite = false;
          }
          if (regionalSurface && !showAll) {
            material.transparent = true;
            material.depthWrite = false;
          }
          if(override){material.opacity=override.opacity*(item.opacity>0 ? material.opacity/item.opacity : 1);material.transparent=material.opacity<.999 || material.transparent;if(material.transparent)material.depthWrite=false;}
          if (oldTransparent !== material.transparent || oldDepthWrite !== material.depthWrite) material.needsUpdate = true;
        }
      }
    }

    _matchingClip() {
      if (this.state.mode !== 'process' || !this._animations || !this._animations.length) return null;
      const process = (window.CELMA_PROCESSES || []).find(item => item.id === this.state.id);
      const names = new Set([normalize(this.state.id)]);
      if (process && process.title) names.add(normalize(process.title));
      return this._animations.find(clip => names.has(normalize(clip.name))) || null;
    }

    _syncNativeAnimation() {
      if (!this._mixer) return;
      const clip = this._matchingClip();
      if (clip !== this._nativeClip) {
        this._mixer.stopAllAction();
        this._nativeClip = clip;
        this._nativeAction = clip ? this._mixer.clipAction(clip) : null;
        if (this._nativeAction) {
          this._nativeAction.setLoop(this.THREE.LoopOnce, 1);
          this._nativeAction.clampWhenFinished = true;
          this._nativeAction.play();
        }
      }
      if (this._nativeAction) {
        this._nativeAction.enabled = true;
        this._nativeAction.paused = false;
        this._nativeAction.setEffectiveTimeScale(1);
        this._mixer.setTime(this.state.progress * clip.duration);
        this._model.updateMatrixWorld(true);
      }
    }

    _updateStatus() {
      if (!this._model || this._loading) return;
      const count = this.parts.length;
      const painted = this.getBrushSummary();
      const single = count === 1 && !this._regions.length && !painted.length ? ' Una sola malla: usa el pincel para identificar sus estructuras.' : '';
      if (this._brush.enabled) {
        this._status('ready', this._brush.mode === 'erase' ? 'Borrador de etiquetas · arrastra sobre la superficie. La forma del modelo permanece intacta.' : 'Pincel · arrastra sobre la superficie para marcar ' + (this._definitions.get(this._brush.component)?.label || this._brush.component) + '.');
        return;
      }
      if (this.state.mode === 'process') {
        const active = this._getActiveKeys();
        let matched = 0;
        for (const part of this.parts) if (active.has(part.component) || active.has(part.id)) ++matched;
        let regions = 0;
        for (const region of this._regions) if (active.has(region.component)) ++regions;
        if (this._nativeClip) this._status('ready', 'Animación incluida en el GLB: «' + clean(this._nativeClip.name) + '», sincronizada con el recorrido.' + single);
        else if (painted.some(item => active.has(item.component))) this._status('ready', 'Modelo estructural · etiquetas pintadas resaltadas para esta etapa. El color orienta; la geometría conserva la forma del archivo.');
        else if (regions) this._status('ready', 'Modelo estructural · ' + regions + (regions === 1 ? ' zona anotada' : ' zonas anotadas') + ' para esta etapa. El color orienta; la geometría conserva la forma del archivo.');
        else if (matched) this._status('ready', 'Modelo estructural · ' + matched + (matched === 1 ? ' pieza resaltada' : ' piezas resaltadas') + ' para esta etapa. La geometría conserva la forma del archivo.' + single);
        else this._status('ready', 'Modelo estructural · no hay piezas identificadas para esta etapa. Asigna las mallas por su anatomía para resaltarlas.' + single);
      } else {
        let recognized = 0;
        for (const part of this.parts) if (part.component !== 'other') ++recognized;
        this._status('ready', 'Modelo real cargado · ' + count + (count === 1 ? ' malla' : ' mallas') + ' · ' + recognized + ' identificadas por nombre o asignación.' +
          (this._regions.length ? ' ' + this._regions.length + ' anotaciones de superficie.' : single) + (painted.length ? ' ' + painted.length + ' estructuras etiquetadas con el pincel.' : ''));
      }
    }

    update(next = {}) {
      if (this._disposed) return;
      if (['mode', 'id', 'component'].some(key => next[key] !== undefined && next[key] !== this.state[key])) this._selectedId = '';
      Object.assign(this.state, next);
      this.state.progress = clamp(Number(this.state.progress) || 0, 0, 1);
      if (next.stage === undefined && next.progress !== undefined) this.state.stage = Math.min(3, Math.floor(this.state.progress * 4));
      this._syncNativeAnimation();
      this._applyHighlights();
      this._updateStatus();
      this._schedule();
    }

    setVisible(visible) {
      if (this._disposed) return;
      this._visible = !!visible;
      if (!this._visible) { this._commitBrushStroke(); this._brushPointer = null; if (this._brushCursor) this._brushCursor.style.display = 'none'; }
      if (this.controls) this.controls.enabled = this._visible && !this._brush.enabled;
      if (!this._visible && this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
      if (this._visible) { this.resize(); this._schedule(); }
    }

    resize() {
      if (this._disposed || !this.renderer) return;
      const rect = this.container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || this.container.clientWidth || 640));
      const height = Math.max(1, Math.round(rect.height || this.container.clientHeight || 440));
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      if (width !== this._width || height !== this._height || pixelRatio !== this._pixelRatio) {
        this._width = width;
        this._height = height;
        this._pixelRatio = pixelRatio;
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
      this._schedule();
    }

    _frameBounds(bounds, preserveDirection = false) {
      if (!this.camera || !bounds || bounds.isEmpty()) return;
      bounds.getCenter(this._center);
      bounds.getSize(this._size);
      const radius = Math.max(this._size.length() / 2, .00001);
      const verticalFov = this.camera.fov * Math.PI / 180;
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
      const limitingFov = Math.min(verticalFov, horizontalFov);
      let distance = radius / Math.sin(limitingFov / 2) * 1.02;
      if (preserveDirection) this._direction.copy(this.camera.position).sub(this.controls.target).normalize();
      else this._direction.set(...(this._model?.userData.cellModel ? [.7,1.5,1.1] : [1,.55,1.25])).normalize();
      if(this._model?.userData.cellModel){
        const right=new this.THREE.Vector3().crossVectors(new this.THREE.Vector3(0,1,0),this._direction).normalize();
        const up=new this.THREE.Vector3().crossVectors(this._direction,right).normalize();
        distance=0;
        const point=new this.THREE.Vector3();
        const fit=()=>{point.sub(this._center);distance=Math.max(distance,point.dot(this._direction)+Math.max(Math.abs(point.dot(right))/Math.tan(horizontalFov/2),Math.abs(point.dot(up))/Math.tan(verticalFov/2))*1.15);};
        // El contorno aplanado no ocupa las esquinas de su caja. Ajustar a los
        // vértices evita alejar innecesariamente la cámara del fibroblasto.
        if(!preserveDirection)this._model.traverse(node=>{const positions=node.geometry?.attributes?.position;if(positions)for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(node.matrixWorld);fit();}});
        else for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){point.set(x,y,z);fit();}
      }
      this.camera.position.copy(this._center).addScaledVector(this._direction, distance);
      this.camera.near = Math.max(radius / 10000, .000001);
      this.camera.far = Math.max(distance + radius * 40, this.camera.near * 1000);
      this.camera.updateProjectionMatrix();
      this.controls.target.copy(this._center);
      this.controls.minDistance = radius * .02;
      this.controls.maxDistance = distance * 6;
      this.controls.update();
      this._schedule();
    }

    resetCamera() {
      if (this._disposed || !this._model) return;
      this._model.updateMatrixWorld(true);
      this._bounds.setFromObject(this._model);
      this._frameBounds(this._bounds, false);
    }

    focusComponent(key) {
      if (this._disposed || !this._model) return false;
      if (!key || key === 'all') { this.resetCamera(); return true; }
      this._bounds.makeEmpty();
      this._model.updateMatrixWorld(true);
      for (const record of this.parts) {
        if (record.component === key || record.id === key) {
          this._partBounds.setFromObject(this._partById.get(record.id).mesh);
          this._bounds.union(this._partBounds);
        }
      }
      for (const region of this._regions) {
        if (region.component === key || region.id === key) {
          this._regionPoint.fromArray(region.point);
          this._regionExtent.setScalar(region.radius);
          this._regionBox.min.copy(this._regionPoint).sub(this._regionExtent);
          this._regionBox.max.copy(this._regionPoint).add(this._regionExtent);
          this._bounds.union(this._regionBox);
        }
      }
      const brushLabel = this._brushKeys.indexOf(key);
      if (brushLabel > 0 && this._brushCounts[brushLabel]) {
        for (const resource of this._brushMeshes.values()) for (let vertex = 0; vertex < resource.labels.length; vertex++) {
          if (resource.labels[vertex] === brushLabel) this._bounds.expandByPoint(this._regionPoint.fromBufferAttribute(resource.position, vertex).applyMatrix4(resource.part.mesh.matrixWorld));
        }
      }
      if (this._bounds.isEmpty()) {
        this._status('ready', 'No hay mallas identificadas para enfocar esta estructura. Puedes asignarlas en la lista de piezas.');
        return false;
      }
      this._frameBounds(this._bounds, true);
      return true;
    }

    setContextVisible(visible) {
      this._contextVisible = !!visible;
      this._applyHighlights();
      this._schedule();
    }

    assignPart(id, key) {
      if (this._disposed) return false;
      const part = this._partById.get(id);
      if (!part) return false;
      const valid = this._componentDefinitions().some(item => item[0] === key && key !== 'all');
      part.record.component = valid ? key : 'other';
      this._emit('onParts', this._records());
      this._applyHighlights();
      this._updateStatus();
      this._schedule();
      return true;
    }

    selectPart(id) {
      if (this._disposed) return false;
      if (id && !this._partById.has(id) && !this._regions.some(region => region.id === id)) return false;
      this._selectedId = id || '';
      this._applyHighlights();
      this._schedule();
      return true;
    }

    _pick(clientX, clientY) {
      if (!this._visible || !this._model || this._webglLost) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this._mouse.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(this._mouse, this.camera);
      this._hits.length = 0;
      this.raycaster.intersectObjects(this._pickables, false, this._hits);
      for (const hit of this._hits) {
        const part = this._partByMesh.get(hit.object);
        if (!part || !part.mesh.visible || part.mesh.userData.pickThrough || this.getOrganelleState(part.record.component).opacity<.025) continue;
        let parent = part.mesh.parent;
        let parentVisible = true;
        while (parent) { if (!parent.visible) { parentVisible = false; break; } parent = parent.parent; }
        if (!parentVisible) continue;
        if (this.parts.length !== 1 || part.record.component !== 'other') this.selectPart(part.record.id);
        const point = hit.point.toArray();
        let normal = null;
        if (hit.face && hit.face.normal) normal = this._normal.copy(hit.face.normal).applyNormalMatrix(this._normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize().toArray();
        this._emit('onPick', { ...part.record, point, normal });
        return;
      }
    }

    _schedule() {
      if (!this._visible || this._disposed || this._webglLost || !this.renderer || this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = 0;
        if (!this._visible || this._disposed || this._webglLost) return;
        this.renderer.render(this.scene, this.camera);
      });
    }

    _clearModel() {
      if (this._mixer) {
        this._mixer.stopAllAction();
        if (this._model) this._mixer.uncacheRoot(this._model);
      }
      this._mixer = null;
      this._nativeClip = null;
      this._nativeAction = null;
      if (this._model && this.scene) this.scene.remove(this._model);
      if (this._gltf) this._disposeGLTF(this._gltf, this._clonedMaterials, this._partById);
      this._clonedMaterials.clear();
      this._gltf = null;
      this._model = null;
      this._animations = [];
      this.parts = [];
      this._partById.clear();
      this._partByMesh.clear();
      this._pickables.length = 0;
      this._hits.length = 0;
      this._selectedId = '';
      this._organelleStates.clear();this._isolatedComponents=null;this._focusComponents=null;
      this._brushMeshes.clear(); this._brushCounts.fill(0); this._brushUndo.length = 0; this._brushRedo.length = 0;
      this._brushStroke = null; this._brushPointer = null; this._brushMultitouch = false;
      this._pointers.clear(); this._pointerEvents.clear(); this._brushLastDepth = 0;
      if (this._brushCursor) this._brushCursor.style.display = 'none';
      this._clearRegions();
      if (this.renderer && this.renderer.renderLists) this.renderer.renderLists.dispose();
    }

    _disposeGLTF(gltf, clones = new Set(), parts = new Map()) {
      if (!gltf) return;
      const geometries = new Set();
      const materials = new Set(clones);
      const textures = new Set();
      const skeletons = new Set();
      const scenes = new Set(gltf.scenes || []);
      if (gltf.scene) scenes.add(gltf.scene);
      for (const scene of scenes) scene.traverse(node => {
        if (node.geometry) geometries.add(node.geometry);
        if (node.skeleton) skeletons.add(node.skeleton);
        const source = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of source) if (material) materials.add(material);
      });
      for (const part of parts.values()) for (const item of part.materials) if (item && item.original) materials.add(item.original);
      for (const material of materials) {
        for (const value of Object.values(material)) if (value && value.isTexture) textures.add(value);
        if (material.uniforms) for (const uniform of Object.values(material.uniforms)) if (uniform && uniform.value && uniform.value.isTexture) textures.add(uniform.value);
      }
      for (const geometry of geometries) { geometry.boundsTree = null; geometry.dispose(); }
      for (const material of materials) if (typeof material.dispose === 'function') material.dispose();
      for (const texture of textures) {
        texture.dispose();
        if (texture.image && typeof texture.image.close === 'function') texture.image.close();
      }
      for (const skeleton of skeletons) if (typeof skeleton.dispose === 'function') skeleton.dispose();
    }

    dispose() {
      if (this._disposed) return;
      this._disposed = true;
      ++this._loadToken;
      if (this._fetchController) this._fetchController.abort();
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      if (this._observer) this._observer.disconnect();
      this._listeners.forEach(remove => remove());
      this._listeners.length = 0;
      if (this.controls) {
        this.controls.removeEventListener('change', this._onControlsChange);
        this.controls.dispose();
      }
      this._clearModel();
      if (this.dracoLoader) this.dracoLoader.dispose();
      if (this.ktx2Loader) this.ktx2Loader.dispose();
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer.domElement.remove();
      }
      if (this._markerGeometry) this._markerGeometry.dispose();
      if (this._brushCursor) this._brushCursor.remove();
      this.message.remove();
      this.renderer = null;
      this.loader = null;
    }
  }

  window.Celma3DView = Celma3DView;
})();
