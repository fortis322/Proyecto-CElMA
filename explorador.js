/* CELMA — navegación y tiempo de los diagramas. Funciona también sin servidor. */
(() => {
  'use strict';
  const processes = window.CELMA_PROCESSES;
  const $ = selector => document.querySelector(selector);
  if (!Array.isArray(processes) || !window.CelmaScene) {
    $('#detail-description').textContent = 'No se pudieron cargar los módulos. Extrae todos los archivos del ZIP y conserva la carpeta completa antes de abrir explorador.html.';
    return;
  }
  const components = {
    all: {name:'Citoesqueleto', color:'#b7d1ec', angle:0, kicker:'EL PUNTO DE PARTIDA', title:'Una célula. Muchas conexiones.', description:'El citoesqueleto es una red dinámica que organiza el interior celular, permite el movimiento y aporta resistencia. Visita cada sistema por separado para entender cómo se construye y qué hace.'},
    actin: {name:'Actina', color:'#50ded0', angle:-90, kicker:'MICROFILAMENTOS / ACTINA', title:'La forma también se mueve.', description:'Los filamentos de actina forman redes y haces, especialmente bajo la membrana. Su ensamblaje y su interacción con la miosina permiten la protrusión, la contracción y los cambios de forma. Elige un proceso de actina para observarlo por etapas.'},
    microtubules: {name:'Microtúbulos', color:'#77a7ff', angle:90, kicker:'MICROTÚBULOS / TUBULINA', title:'Una red que se reorganiza.', description:'Los microtúbulos son tubos de tubulina que cambian entre crecimiento y acortamiento. Organizan el interior de la célula y sirven como vías para motores moleculares. Elige un proceso para explorar su dinámica o su función en el transporte.'},
    intermediate: {name:'Filamentos intermedios', color:'#dfb6fa', angle:180, kicker:'FILAMENTOS INTERMEDIOS / SOPORTE', title:'Resistir también es una función.', description:'Esta familia de filamentos forma redes resistentes que conectan distintas regiones celulares. A diferencia de la actina y los microtúbulos, no tiene extremos de polaridad (+) y (−). Elige su proceso de ensamblaje para ver cómo se forma un cable flexible.'}
  };
  const scene = new window.CelmaScene($('#cyto-scene'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {mode:'map', component:'all', process:null, progress:0, playing:false, speed:1, concentration:1};
  let frame = null;
  let lastTime = null;
  let activeStage = -1;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function announce(text) { $('#announcement').textContent = text; }
  function currentComponent() { return state.mode === 'process' ? state.process.component : state.component; }
  function draw() {
    if (!$('#cyto-scene').hidden) scene.render({mode:state.mode, id:state.process?.id, component:currentComponent(), progress:state.progress, concentration:state.concentration});
    publishState();
  }
  function publishState() {
    const snapshot = {mode:state.mode,id:state.process?.id,process:state.process,component:currentComponent(),progress:state.progress,playing:state.playing,concentration:state.concentration,stage:Math.min(3,Math.floor(state.progress*4))};
    window.CelmaExplorerState = snapshot;
    document.dispatchEvent(new CustomEvent('celma:frame',{detail:snapshot}));
  }
  function renderList() {
    const focusedProcess = document.activeElement?.dataset.process;
    const visible = processes.filter(process => state.component === 'all' || process.component === state.component);
    $('#process-count').textContent = String(visible.length).padStart(2,'0');
    $('#process-list').replaceChildren(...visible.map(process => {
      const button = element('button','process-button');
      button.type = 'button';
      button.dataset.process = process.id;
      button.dataset.component = process.component;
      button.setAttribute('aria-pressed', String(state.mode === 'process' && state.process.id === process.id));
      button.setAttribute('aria-controls','process-detail');
      const icon = element('span','process-icon');
      icon.append(window.CelmaProcessIcon(process.id));
      icon.setAttribute('aria-hidden','true');
      const copy = element('span','process-copy');
      copy.append(element('strong',null,process.title),element('small',null,process.short));
      const arrow = element('span','process-arrow','→');
      arrow.setAttribute('aria-hidden','true');
      button.append(icon,copy,arrow);
      button.addEventListener('click', () => selectProcess(process.id,true));
      return button;
    }));
    document.querySelectorAll('[data-component]').forEach(button => {
      if (button.matches('button[data-component]:not([data-process])')) button.setAttribute('aria-pressed',String(button.dataset.component === state.component));
    });
    if (focusedProcess) {
      Array.from($('#process-list').children).find(button => button.dataset.process === focusedProcess)?.focus({preventScroll:true});
    }
  }
  function renderLegend(entries) {
    $('#scene-legend').replaceChildren(...entries.map(entry => {
      const item = element('span','legend-item');
      const dot = element('i');
      dot.style.backgroundColor = entry.color;
      dot.setAttribute('aria-hidden','true');
      item.append(dot,document.createTextNode(entry.label));
      return item;
    }));
  }
  function updateCompass() {
    const component = currentComponent();
    $('#compass-needle').style.setProperty('--compass-angle', components[component].angle+'deg');
    document.querySelectorAll('[data-destination]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.destination === component)));
  }
  function setCompass(open) {
    $('#compass-panel').hidden = !open;
    $('#compass-toggle').setAttribute('aria-expanded',String(open));
  }
  function showMap(component = state.component, changeHash = true) {
    stop();
    state.mode = 'map';
    state.component = components[component] ? component : 'all';
    state.progress = 0;
    const info = components[state.component];
    $('#scene-route').textContent = 'Célula / '+info.name;
    $('#scene-scale').textContent = 'Vista celular';
    $('#scene-label').textContent = 'MAPA / '+info.name.toUpperCase();
    $('#scene-position').textContent = state.component === 'all' ? 'Una red, tres sistemas de filamentos' : 'Estructura seleccionada: '+info.name;
    $('#detail-kicker').textContent = info.kicker;
    $('#detail-title').textContent = info.title;
    $('#detail-description').textContent = info.description;
    $('#detail-number').textContent = 'MAPA';
    $('#process-controls').hidden = true;
    $('#critical-controls').hidden = true;
    $('#process-detail').hidden = true;
    $('#map-guide').hidden = false;
    $('#map-hotspots').hidden = false;
    $('#cyto-scene').setAttribute('aria-label','Mapa celular: '+info.name);
    $('#canvas-summary').textContent = info.description+' Diagrama didáctico de una célula animal, no a escala.';
    renderLegend(['actin','microtubules','intermediate'].map(key => ({color:components[key].color,label:components[key].name})));
    renderList();
    updateCompass();
    draw();
    if (changeHash) location.hash = 'mapa-'+state.component;
  }
  function selectProcess(id, userAction = false) {
    const process = processes.find(item => item.id === id);
    if (!process) return;
    stop();
    state.mode = 'process';
    state.process = process;
    if (state.component !== 'all' && state.component !== process.component) state.component = process.component;
    state.progress = 0;
    activeStage = -1;
    $('#map-hotspots').hidden = true;
    $('#map-guide').hidden = true;
    $('#process-detail').hidden = false;
    $('#process-controls').hidden = false;
    $('#critical-controls').hidden = process.id !== 'critical';
    $('#scene-route').textContent = 'Célula / '+components[process.component].name+' / Proceso';
    $('#scene-scale').textContent = process.scale;
    $('#scene-label').textContent = components[process.component].name.toUpperCase()+' / EN ACCIÓN';
    $('#detail-kicker').textContent = process.kicker;
    $('#detail-title').textContent = process.title;
    $('#detail-description').textContent = process.description;
    $('#detail-number').textContent = String(processes.indexOf(process)+1).padStart(2,'0')+' / 12';
    $('#process-location').textContent = process.location;
    $('#process-takeaway').textContent = process.takeaway;
    $('#process-notes').textContent = process.notes;
    $('.science-notes').open = false;
    $('#process-source').textContent = process.source.label+' →';
    $('#process-source').href = process.source.url;
    $('#cyto-scene').setAttribute('aria-label','Diagrama animado: '+process.title);
    $('#canvas-summary').textContent = process.description+' '+process.takeaway;
    renderLegend(process.legend);
    $('#stage-rail').replaceChildren(...process.stages.map((stage,index) => {
      const button = element('button','stage-button');
      button.type = 'button';
      button.append(element('span','stage-index',String(index+1).padStart(2,'0')),element('span','stage-name',stage.title));
      button.addEventListener('click', () => setStage(index));
      button.addEventListener('keydown',event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = Math.max(0,Math.min(process.stages.length-1,index+(event.key === 'ArrowRight' ? 1 : -1)));
        setStage(next);
        $('#stage-rail').children[next].focus();
      });
      return button;
    }));
    renderList();
    updateCompass();
    updateTimeline();
    draw();
    if (location.hash !== '#'+process.id) location.hash = process.id;
    if (userAction) {
      announce(process.title+'. '+process.stages.length+' etapas disponibles.');
      if (!reduceMotion.matches) play();
      if (window.innerWidth < 900) $('.scene-toolbar').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'});
    }
  }
  function updateStage() {
    const index = Math.min(state.process.stages.length-1,Math.floor(state.progress*state.process.stages.length));
    if (activeStage === index) return;
    activeStage = index;
    const stage = state.process.stages[index];
    $('#stage-number').textContent = String(index+1).padStart(2,'0');
    $('#stage-heading').textContent = stage.title;
    $('#stage-text').textContent = stage.text;
    $('#scene-position').textContent = 'ETAPA '+(index+1)+' / '+state.process.stages.length+' · '+stage.title;
    Array.from($('#stage-rail').children).forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
    $('#previous-stage').disabled = index === 0;
    $('#next-stage').disabled = index === state.process.stages.length-1;
  }
  function time(seconds) { const rounded = Math.floor(seconds); return Math.floor(rounded/60)+':'+String(rounded%60).padStart(2,'0'); }
  function updateTimeline() {
    if (state.mode !== 'process') return;
    $('#timeline').value = String(Math.round(state.progress*1000));
    $('#timeline').style.setProperty('--progress', (state.progress*100)+'%');
    $('#time-label').textContent = time(state.progress*state.process.duration)+' / '+time(state.process.duration);
    $('#timeline').setAttribute('aria-valuetext',Math.round(state.progress*100)+' % del proceso');
    updateStage();
  }
  function updatePlayButton() {
    $('#play-button').textContent = state.playing ? 'Ⅱ Pausar' : '▶ Reproducir';
    $('#play-button').setAttribute('aria-pressed',String(state.playing));
    publishState();
  }
  function stop() {
    state.playing = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    updatePlayButton();
  }
  function tick(now) {
    if (!state.playing) return;
    if (lastTime !== null) state.progress = Math.min(1,state.progress+Math.min((now-lastTime)/1000,0.1)*state.speed/state.process.duration);
    lastTime = now;
    updateTimeline();
    draw();
    if (state.progress >= 1) { stop(); announce('Proceso completado. Puedes repetirlo o visitar otra estructura.'); return; }
    frame = requestAnimationFrame(tick);
  }
  function play() {
    if (state.mode !== 'process' || state.playing) return;
    if (state.progress >= 1) state.progress = 0;
    state.playing = true;
    lastTime = null;
    updatePlayButton();
    frame = requestAnimationFrame(tick);
  }
  function setStage(index) {
    if (state.mode !== 'process') return;
    stop();
    state.progress = (Math.max(0,Math.min(state.process.stages.length-1,index))+0.5)/state.process.stages.length;
    updateTimeline();
    draw();
    announce('Etapa '+(activeStage+1)+': '+state.process.stages[activeStage].title);
  }
  document.querySelectorAll('[data-component]').forEach(button => button.addEventListener('click', () => { showMap(button.dataset.component); announce('Estructura: '+components[button.dataset.component].name); }));
  document.querySelectorAll('[data-map-component]').forEach(button => button.addEventListener('click', () => { showMap(button.dataset.mapComponent); announce('Estructura: '+components[button.dataset.mapComponent].name+'. Selecciona uno de sus procesos.'); }));
  document.querySelectorAll('[data-destination]').forEach(button => button.addEventListener('click', () => { showMap(button.dataset.destination); setCompass(false); $('#compass-toggle').focus(); announce('Brújula: '+components[button.dataset.destination].name); }));
  $('#compass-toggle').addEventListener('click', () => { const open = $('#compass-panel').hidden; setCompass(open); if (open) $('#compass-close').focus(); });
  $('#compass-close').addEventListener('click', () => { setCompass(false); $('#compass-toggle').focus(); });
  document.addEventListener('keydown',event => { if (event.key === 'Escape' && !$('#compass-panel').hidden) { setCompass(false); $('#compass-toggle').focus(); } });
  $('#play-button').addEventListener('click', () => state.playing ? stop() : play());
  $('#reset-button').addEventListener('click', () => { stop(); state.progress = 0; updateTimeline(); draw(); announce('Proceso reiniciado.'); });
  $('#timeline').addEventListener('input', () => { stop(); state.progress = Number($('#timeline').value)/1000; updateTimeline(); draw(); });
  $('#speed').addEventListener('change', () => { state.speed = Number($('#speed').value); });
  $('#previous-stage').addEventListener('click', () => setStage(activeStage-1));
  $('#next-stage').addEventListener('click', () => setStage(activeStage+1));
  const concentrations = ['Ambos extremos pierden subunidades: la concentración libre está por debajo de sus umbrales.','El extremo (+) crece mientras el extremo (−) pierde subunidades.','Ambos extremos incorporan subunidades: la concentración libre supera sus umbrales.'];
  document.querySelectorAll('[data-concentration]').forEach(button => button.addEventListener('click', () => {
    stop();
    state.concentration = Number(button.dataset.concentration);
    state.progress = 0;
    document.querySelectorAll('[data-concentration]').forEach(option => option.setAttribute('aria-pressed',String(option === button)));
    $('#concentration-description').textContent = concentrations[state.concentration];
    updateTimeline();
    draw();
    announce(concentrations[state.concentration]);
    if (!reduceMotion.matches) play();
  }));
  if ('ResizeObserver' in window) new ResizeObserver(() => { scene.resize(); draw(); }).observe($('.scene-shell'));
  else window.addEventListener('resize', () => { scene.resize(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) stop(); });
  function readRoute() {
    const route = location.hash.slice(1);
    if (['explorador','aprender','ayuda'].includes(route)) return;
    if (route.startsWith('mapa-') && components[route.slice(5)]) {
      if (state.mode !== 'map' || state.component !== route.slice(5)) showMap(route.slice(5),false);
    } else if (processes.some(process => process.id === route)) {
      if (state.mode !== 'process' || state.process.id !== route) selectProcess(route,false);
    } else if (state.mode !== 'map' || state.component !== 'all') showMap('all',false);
  }
  showMap('all',false);
  readRoute();
  window.addEventListener('hashchange',readRoute);
  document.addEventListener('celma:redraw2d',()=>{scene.resize();draw();});
  document.addEventListener('celma:pause',stop);
})();
