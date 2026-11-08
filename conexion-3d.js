(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const components = window.CELMA_3D_COMPONENTS || {};
  const regionsInfo = window.CELMA_3D_REGIONS || {};
  const cellSource='celma-cell:'+ (window.CELMA_CELL_CONFIG?.id || 'fibroblast-v1');
  let modelKind='user',currentReference=null;
  const state = {mode:'map',component:'all',progress:0,stage:0,playing:false};
  let display = '2d', view = null, libraries = null, loaded = false, loading = false;
  let parts = [], picked = null, pendingPoint = null, savedRegions = [], storageKey = '';
  let lastDescription = '', loadToken = 0, restoring = false, loadFailure = '';
  let pendingModelPromise=null,pendingSource=null;
  const assignments = {};
  function node(tag,className,text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function status(text,phase='ready') {
    $('#three-load-status').textContent = text;
    $('#three-load-status').classList.toggle('three-error',phase==='error');
    const errorText=phase==='error'?text:loadFailure;
    $('#three-live-error').hidden=!errorText || display!=='3d';
    $('#three-live-error').textContent=errorText;
    $('#three-state-badge').textContent = phase==='loading' ? 'Abriendo modelo…' : loaded ? 'Modelo 3D abierto' : phase==='error' ? 'Revisar modelo' : 'Modelo por abrir';
  }
  function announce(text) { $('#announcement').textContent = text; }
  function script(src) {
    return new Promise((resolve,reject) => {
      const element = document.createElement('script');
      element.src = src;
      element.onload = resolve;
      element.onerror = () => { element.remove(); reject(new Error('No se pudo cargar el visor 3D. Conserva la carpeta vendor junto a la página.')); };
      document.head.append(element);
    });
  }
  async function ensureViewer() {
    if (view) return view;
    if (!libraries) libraries = (async () => {
      if (!window.Celma3DLibraries) await script('vendor/three-bundle.js');
      if (!window.Celma3DView) await script('visor-3d.js');
    })().catch(error => {libraries=null;throw error;});
    await libraries;
    if (!view) view = new window.Celma3DView($('#three-canvas-host'),{
      background:'transparent',
      onStatus:info => status(info.text,info.phase),
      onError:message => {status(message,'error');announce(message);},
      onParts:newParts => {parts=newParts; if (!restoring) renderParts();},
      onPick:part => {
        if (loading) return;
        if(modelKind==='reference'){document.dispatchEvent(new CustomEvent('celma:reference-pick',{detail:{part}}));return;}
        if(view?._model?.userData.cellModel){document.dispatchEvent(new CustomEvent('celma:organelle-select',{detail:{component:part.component,part}}));return;}
        picked = part;
        if (parts.length === 1 && Array.isArray(part.point)) {
          pendingPoint = part.point;
          $('#region-picked').hidden = false;
          if (state.component !== 'all' && components[state.component]) $('#region-component').value=state.component;
          $('#model-parts').open = true;
          $('#three-selection-text').textContent = 'Zona seleccionada · indica qué estructura representa';
          $('#region-component').focus();
          announce('Zona seleccionada. Elige la estructura y guarda la zona para resaltarla en sus procesos.');
        } else {
          $('#model-picked').hidden = false;
          $('#model-picked-name').textContent = part.name;
          $('#model-picked-component').value = part.component || 'other';
          $('#three-selection-text').textContent = part.name+' · '+(components[part.component]?.label || 'Sin identificar');
          $('#model-parts').open = true;
          announce('Pieza seleccionada: '+part.name);
        }
        $('#three-selection').hidden = false;
        $('#three-selection-dot').style.background = components[part.component]?.color || '#ffffff';
      }
    });
    window.CelmaModelViewer=view;
    if(!view._celmaLabelListener){view.controls?.addEventListener('change',renderModelLabels);view._celmaLabelListener=true;}
    return view;
  }
  function fillOptions(select) {
    select.replaceChildren(...Object.entries(components).filter(([key])=>key!=='all').map(([key,info]) => {
      const option = node('option',null,info.label);
      option.value=key;
      return option;
    }));
  }
  fillOptions($('#model-picked-component'));
  fillOptions($('#region-component'));
  $('#region-component').value='actin';
  function applyDisplay() {
    const is3d = display === '3d';
    $('.scene-shell').classList.toggle('is-3d',is3d);
    $('#cyto-scene').hidden=is3d;
    $('#three-canvas-host').hidden=!is3d;
    $('#three-empty').hidden=!is3d || (loaded && !loading);
    $('#three-tools').hidden=!is3d || !loaded || loading;
    $('#three-note').hidden=!is3d;
    $('#three-scope').hidden=!is3d;
    $('#three-labels').hidden=!is3d || !loaded;
    $('#three-scope').textContent=(modelKind==='cell'?'Modelo educativo original de un fibroblasto adherente en interfase. Proporciones orientativas y filamentos engrosados para facilitar su observación. No es una reconstrucción experimental de Allen.':modelKind==='reference'?(currentReference?.description||'Modelo de referencia externo.')+' '+(currentReference?.scaleNote||''):window.CELMA_MODEL_NOTE || '')+' El esquema 2D conserva los mecanismos animados por etapas.';
    $('#model-parts').hidden=!is3d || !loaded;
    if (!is3d) $('#three-selection').hidden=true;
    $('#three-live-error').hidden=!is3d || !$('#three-live-error').textContent;
    $('#map-hotspots').hidden=is3d || state.mode==='process';
    $('#view-2d').setAttribute('aria-pressed',String(!is3d));
    $('#view-3d').setAttribute('aria-pressed',String(is3d));
    const component=!is3d && state.component==='all' ? 'Citoesqueleto' : components[state.component]?.label || 'Citoesqueleto';
    $('#scene-label').textContent=is3d ? 'MODELO 3D / '+component.toUpperCase() : (state.mode==='map'?'MAPA / ':'')+component.toUpperCase()+(state.mode==='process'?' / EN ACCIÓN':'');
    $('#scene-scale').textContent=is3d?'Modelo 3D · rotación libre':state.mode==='map'?'Vista celular':state.process?.scale || 'Esquema 2D';
    $('.scene-bottomline > span:last-child').textContent=is3d?modelKind==='cell'?'MODELO CELULAR EDUCATIVO · NO A ESCALA':modelKind==='reference'?'MODELO EXTERNO · '+(currentReference?.license||'LICENCIA VERIFICADA'):'MODELO APORTADO POR EL USUARIO':'ESQUEMA 2D · NO A ESCALA';
    if(is3d && state.mode==='map') $('#scene-position').textContent=modelKind==='cell'?'Fibroblasto adherente · interfase':modelKind==='reference'?(currentReference?.label||'Modelo de referencia'):savedRegions.length?savedRegions.length+' zonas señaladas en tu modelo':'Modelo del usuario · zonas por identificar';
    document.dispatchEvent(new CustomEvent('celma:view-display',{detail:{display,loaded,kind:modelKind}}));
    if(is3d) render3DLegend();
    else if($('#scene-legend').dataset.view==='3d') render2DLegend();
    renderModelLabels();
  }
  function renderModelLabels() {
    const layer=$('#three-labels');
    if(display!=='3d' || !loaded || !view?.camera || !view?.THREE){layer.replaceChildren();return;}
    const rect=$('#three-canvas-host').getBoundingClientRect();
    let active=state.mode==='map' && state.component==='all' ? [...Object.keys(components)] : state.mode==='process' ? regionsInfo[state.id]?.stages[state.stage]?.regions || [state.component] : [state.component];
    if(modelKind==='cell' && view._focusComponents)active=[...view._focusComponents];
    else if(modelKind==='cell' && active.length>6)active=innerWidth<650?['microtubules','actin','nucleus']:['microtubules','actin','intermediate','nucleus','mitochondria','golgi'];
    if(modelKind!=='cell' && !savedRegions.some(region=>active.includes(region.component)))active=[state.component];
    view.camera.updateMatrixWorld();
    const labels=[];
    for(const key of [...new Set(active)]){
      const anchors=view._model?.userData.anchors || {};
      const annotationRegions=modelKind==='cell'?[...savedRegions,...Object.entries(anchors).map(([component,point])=>({component,point}))]:savedRegions;
      const candidates=annotationRegions.filter(region=>region.component===key && view.getOrganelleState(key).visible && (!view._isolatedComponents || view._isolatedComponents.has(key))).map(region=>{
        const point=new view.THREE.Vector3(...region.point);
        return {region,distance:point.distanceTo(view.camera.position),projected:point.project(view.camera)};
      }).filter(candidate=>Math.abs(candidate.projected.x)<1 && Math.abs(candidate.projected.y)<1 && candidate.projected.z<1 && candidate.projected.z>-1).sort((a,b)=>a.distance-b.distance);
      if(!candidates.length)continue;
      const projected=candidates[0].projected;
      const label=node('span','three-region-label',components[key]?.label.split(' /')[0] || key);
      label.style.setProperty('--region-color',components[key]?.color || '#ffffff');
      const left=Math.max(88,Math.min(rect.width-88,(projected.x+1)*rect.width/2));
      let top=Math.max(90,Math.min(rect.height-65,(1-projected.y)*rect.height/2));
      while(labels.some(other=>Math.abs(parseFloat(other.style.left)-left)<170 && Math.abs(parseFloat(other.style.top)-top)<32) && top>122)top-=34;
      label.style.left=left+'px';
      label.style.top=top+'px';
      labels.push(label);
    }
    layer.replaceChildren(...labels);
  }
  function legend(entries,type) {
    const container=$('#scene-legend');
    const expected=entries.map(entry=>entry.label).join('');
    if(container.textContent===expected && container.dataset.view===type)return;
    container.dataset.view=type;
    container.replaceChildren(...entries.map(entry=>{const span=node('span','legend-item'),dot=node('i');dot.style.background=entry.color;dot.setAttribute('aria-hidden','true');span.append(dot,document.createTextNode(entry.label));return span;}));
  }
  function render3DLegend() {
    const keys=[...new Set([...savedRegions.map(region=>region.component),...parts.map(part=>part.component)].filter(key=>key!=='other'&&key!=='all'&&components[key]))];
    legend([...keys.map(key=>({label:components[key].label,color:components[key].color})),{label:'Contexto del modelo',color:'#a8bdd5'}],'3d');
  }
  function render2DLegend() {
    legend(state.mode==='process' && state.process ? state.process.legend : ['actin','microtubules','intermediate'].map(key=>({label:components[key].label,color:components[key].color})),'2d');
  }
  function updateDescription(force=false) {
    const key = [state.mode,state.id,state.component,state.stage,loaded,parts.length,savedRegions.length].join('|');
    if (!force && lastDescription===key) return;
    lastDescription=key;
    const info=regionsInfo[state.id];
    const stage=info?.stages[state.stage];
    $('#three-process-title').textContent=state.mode==='process' ? stage?.label || state.process?.title || 'Estructuras implicadas' : 'Recorre el modelo del citoesqueleto';
    const hasTarget=parts.some(part=>part.component===state.component) || savedRegions.some(region=>region.component===state.component);
    let explanation = state.mode==='process' ? stage?.explanation || info?.summary || '' : 'Gira con el dedo o el ratón y acerca la cámara para observar las estructuras. Pulsa una pieza o una zona de su superficie para identificarla.';
    $('#three-process-explanation').textContent=explanation;
    $('#three-state-badge').textContent=loading?'Abriendo modelo…':loaded? savedRegions.length? savedRegions.length+' zonas señaladas':parts.length+' pieza'+(parts.length===1?'':'s') : 'Modelo por abrir';
    $('#model-focus').disabled=!loaded || state.component==='all' || !hasTarget;
  }
  function renderParts() {
    const single=parts.length===1;
    $('#model-part-count').textContent=parts.length===1?'1 pieza / zonas':parts.length+' piezas';
    $('#model-part-description').textContent=single ? 'Este archivo reúne todo el modelo en una sola malla. Señala zonas de su superficie y asígnales una estructura para relacionarlas con los procesos.' : 'Relaciona las piezas con las estructuras celulares para resaltar las que participan en cada proceso. También puedes seleccionarlas en el modelo.';
    $('#region-editor').hidden=!single;
    $('#model-search-wrapper').hidden=single;
    $('#model-part-list').hidden=single;
    if (single) $('#model-picked').hidden=true;
    const query=$('#model-part-search').value.trim().toLocaleLowerCase('es');
    const filtered=parts.filter(part=>(part.name+' '+part.materialName+' '+components[part.component]?.label).toLocaleLowerCase('es').includes(query));
    $('#model-part-list').replaceChildren(...filtered.slice(0,120).map(part => {
      const row=node('div','model-part-row');
      const name=node('div','model-part-name');
      name.append(node('strong',null,part.name),node('small',null,part.materialName || 'Material sin nombre'));
      const select=node('select');
      select.setAttribute('aria-label','Estructura de '+part.name);
      fillOptions(select); select.value=part.component || 'other';
      select.addEventListener('change',()=>assign(part.id,select.value));
      row.append(name,select);
      return row;
    }));
    $('#model-parts-footer').textContent=single?'Las zonas son referencias señaladas sobre el modelo. Puedes eliminar una zona y señalarla de nuevo para cambiar su etiqueta.':filtered.length>120?'Se muestran 120 de '+filtered.length+' piezas. Usa la búsqueda para localizar otras.':parts.filter(part=>part.component!=='other').length+' de '+parts.length+' piezas identificadas.';
    updateDescription(true);
  }
  function remember() {
    try { if(storageKey)localStorage.setItem(storageKey,JSON.stringify({assignments,regions:savedRegions})); } catch {}
  }
  function closeBrush() { view?.setBrush?.({enabled:false,editing:false}); }
  function assign(id,component) {
    if (!view || parts.length===1) return;
    assignments[id]=component;
    view.assignPart(id,component);
    const part=parts.find(part=>part.id===id); if(part)part.component=component;
    remember();renderParts();view.update(state);
    announce('Pieza asignada a '+components[component].label);
  }
  function renderRegions() {
    $('#region-list').replaceChildren(...savedRegions.map((region,index)=>{
      const row=node('div','region-row');
      const dot=node('i','dot'); dot.style.background=components[region.component]?.color || '#9bafc6';
      const label=node('span',null,(index+1)+'. '+(region.name || components[region.component]?.label || 'Zona'));
      const remove=node('button',null,'Eliminar'); remove.type='button';remove.setAttribute('aria-label','Eliminar zona '+(index+1));
      remove.addEventListener('click',()=>{savedRegions=savedRegions.filter(item=>item.id!==region.id);view.setRegions(savedRegions);remember();renderRegions();updateDescription(true);view.update(state);const next=$('#region-list').children[Math.min(index,savedRegions.length-1)]?.querySelector('button');(next || $('#model-parts').querySelector('summary')).focus({preventScroll:true});announce('Zona eliminada.');});
      row.append(dot,label,remove);return row;
    }));
    renderModelLabels();
  }
  async function loadModel(source,options={}) {
    while(pendingModelPromise){if(source===pendingSource)return pendingModelPromise;await pendingModelPromise;}
    if(options.isCurrent && !options.isCurrent())return false;
    pendingSource=source;const task=performLoadModel(source,options);pendingModelPromise=task;
    try{return await task;}finally{if(pendingModelPromise===task){pendingModelPromise=null;pendingSource=null;}}
  }
  async function performLoadModel(source,options={}) {
    if(source!==cellSource && !options.keepWorkspace && window.CelmaWorkspace?.getMode()!=='explore')await window.CelmaWorkspace?.setMode('explore',{keepModel:true});
    const token=++loadToken;
    const wasLoaded=loaded;
    loadFailure='';
    loading=true; applyDisplay();
    $('#choose-model').disabled=true;
    $('#three-empty-title').textContent='Abriendo el modelo…';
    $('#three-empty-description').textContent='Preparando la geometría y las estructuras para la vista 3D.';
    status('Cargando el visor y el modelo.','loading');
    try {
      const renderer=await ensureViewer();
      renderer.setVisible(display==='3d');
      let opened;
      if(source===cellSource){
        if(!window.CelmaCell)await script('celula-3d.js');
        const group=await window.CelmaCell.create(renderer.THREE,{onProgress:info=>status(info.label || 'Organizando la célula…','loading')});
        opened=await renderer.loadObject(group,window.CELMA_CELL_CONFIG?.modelName || 'Célula animal educativa');
      }else opened=await (source instanceof File ? renderer.loadFile(source) : renderer.loadURL(source));
      if (token!==loadToken) return;
      if(opened===false)throw new Error($('#three-load-status').textContent || 'No se pudo abrir el modelo. Selecciona un archivo GLB válido.');
      loaded=true;
      modelKind=source===cellSource?'cell':options.reference?'reference':'user';currentReference=options.reference||null;
      storageKey=options.reference?'celma-reference:'+options.reference.id:'celma-3d:'+ (source instanceof File ? source.name+':'+source.size+':'+source.lastModified : String(source));
      let memory={};try{memory=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
      for(const key of Object.keys(assignments)) delete assignments[key];
      restoring=true;
      Object.assign(assignments,memory.assignments || {});
      for(const part of parts) if(assignments[part.id] && components[assignments[part.id]]) renderer.assignPart(part.id,assignments[part.id]);
      restoring=false;
      const includedModel=source===window.CELMA_MODEL_URL || source instanceof File && ['citoesqueleto.glb','citoesqueleto-compatible.glb'].includes(source.name) && [1468580,10129240,84306044].includes(source.size);
      savedRegions=Array.isArray(memory.regions)?memory.regions:includedModel && Array.isArray(window.CELMA_MODEL_REGIONS)?window.CELMA_MODEL_REGIONS.map(region=>({...region})):[];
      if(renderer.setRegions) renderer.setRegions(savedRegions);
      savedRegions=renderer.getRegions?.() || savedRegions;
      pendingPoint=null; $('#region-picked').hidden=true; $('#three-selection').hidden=true;
      renderer.setContextVisible($('#model-context').checked);
      renderer.update(state);
      renderRegions();renderParts();
      status('Modelo abierto. Puedes girar, acercarte y señalar sus estructuras.');
      announce('Modelo 3D abierto. '+parts.length+' pieza'+(parts.length===1?'':'s')+'.');
      document.dispatchEvent(new CustomEvent('celma:model-ready',{detail:{view:renderer,kind:modelKind,source,parts}}));
    } catch(error) {
      if(token!==loadToken)return;
      loaded=wasLoaded;
      $('#three-empty-title').textContent='Abre el modelo del citoesqueleto';
      $('#three-empty-description').textContent=location.protocol==='file:' ? 'Selecciona el archivo .glb desde tu dispositivo para abrirlo en esta página.' : 'Puedes volver a intentarlo seleccionando el archivo .glb desde tu dispositivo.';
      loadFailure=error?.message || 'No se pudo abrir el modelo. Selecciona un archivo GLB válido.';
      status(loadFailure,'error');
      announce('No se pudo abrir el modelo. La vista 2D sigue disponible.');
    } finally {
      if(token===loadToken) {loading=false;$('#choose-model').disabled=false;closeBrush();applyDisplay();}
    }
  }
  async function switchDisplay(next) {
    if(next==='2d' && window.CelmaWorkspace?.getMode()!=='explore')await window.CelmaWorkspace?.setMode('explore');
    display=next; applyDisplay();
    if(next==='2d')document.dispatchEvent(new Event('celma:redraw2d'));
    if(view) {view.setVisible(next==='3d');if(next==='3d'){view.resize();view.update(state);}}
    updateDescription(true);
    if(next==='3d' && !loaded && !loading) {
      if(window.CELMA_CELL_CONFIG)await loadModel(cellSource);
      else if(window.CELMA_MODEL_URL && location.protocol==='file:') {
        loading=true;applyDisplay();$('#choose-model').disabled=true;status('Abriendo el modelo incluido.','loading');
        try {
          if(!window.CELMA_LOCAL_MODEL_BASE64) await script('modelos/modelo-local.js');
          const encoded=window.CELMA_LOCAL_MODEL_BASE64;
          if(!encoded)throw new Error('No se encontró el modelo incluido.');
          const binary=atob(encoded), bytes=new Uint8Array(binary.length);
          for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);
          await loadModel(new File([bytes],'citoesqueleto.glb',{type:'model/gltf-binary',lastModified:0}));
          delete window.CELMA_LOCAL_MODEL_BASE64;
        }catch(error){loading=false;$('#choose-model').disabled=false;applyDisplay();status('Puedes abrir el modelo .glb con el botón «Abrir modelo».','error');}
      }
      else if(window.CELMA_MODEL_URL) await loadModel(window.CELMA_MODEL_URL);
      else {
        $('#three-empty-title').textContent='Explora tu modelo desde dentro.';
        $('#three-empty-description').textContent='Abre el archivo .glb desde tu dispositivo para girarlo y señalar las estructuras relacionadas con cada proceso.';
        status('Elige el modelo para comenzar.');
      }
    }
  }
  $('#view-2d').addEventListener('click',()=>switchDisplay('2d'));
  $('#view-3d').addEventListener('click',()=>switchDisplay('3d'));
  window.CelmaExplorer3D={open:()=>switchDisplay('3d'),getViewer:()=>view,getKind:()=>modelKind,closeBrush:()=>closeBrush(),loadCell:async()=>{await switchDisplay('3d');if(modelKind!=='cell')await loadModel(cellSource);},loadPrevious:async()=>{
    await switchDisplay('3d');closeBrush();
    if(location.protocol==='file:'){
      try{if(!window.CELMA_LOCAL_MODEL_BASE64)await script('modelos/modelo-local.js');const binary=atob(window.CELMA_LOCAL_MODEL_BASE64),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));await loadModel(new File([bytes],'citoesqueleto.glb',{type:'model/gltf-binary',lastModified:0}));delete window.CELMA_LOCAL_MODEL_BASE64;}catch(error){status('No se pudo abrir el modelo anterior. Puedes elegir su archivo GLB.','error');}
    }else await loadModel(window.CELMA_MODEL_URL);
  }};
  window.CelmaExplorer3D.loadReference=async (reference,{isCurrent=()=>true}={})=>{
    await switchDisplay('3d');if(!isCurrent())return false;closeBrush();let source=reference.src;
    if(location.protocol==='file:' && reference.offlineSrc){await script(reference.offlineSrc);const payload=window.CELMA_REFERENCE_PAYLOAD;delete window.CELMA_REFERENCE_PAYLOAD;if(!payload || payload.id!==reference.id)throw new Error('No se encontró la copia local de este modelo.');const bytes=Uint8Array.from(atob(payload.data),c=>c.charCodeAt(0));source=new File([bytes],payload.fileName||reference.id+'.glb',{type:'model/gltf-binary',lastModified:0});}
    await loadModel(source,{keepWorkspace:true,reference,isCurrent});
    if(!isCurrent())return false;
    if(modelKind!=='reference')throw new Error('No se pudo abrir el modelo de referencia.');
    const structures={'plasma-membrane':'membrane','nuclear-envelope':'nuclearEnvelope',nucleolus:'nucleolus',chromatin:'nucleus','rough-er':'roughER','smooth-er':'smoothER','golgi-apparatus':'golgi',vesicles:'vesicles',lysosomes:'lysosomes',mitochondria:'mitochondria',peroxisomes:'peroxisomes',ribosomes:'ribosomes',centrosome:'centrosome',microtubules:'microtubules'};
    for(const part of [...view.parts]){
      const mesh=view._partById.get(part.id)?.mesh;
      const key=reference.component!=='all'?reference.component:structures[mesh?.userData.structureId || mesh?.name];
      if(components[key] && !assignments[part.id])view.assignPart(part.id,key);
    }
    view.setScientificFocus([...new Set(view.parts.map(part=>part.component))]);view.resetCamera();
    render3DLegend();return true;
  };
  $('#choose-model').addEventListener('click',()=>$('#model-file').click());
  $('#model-change').addEventListener('click',()=>$('#model-file').click());
  $('#model-file').addEventListener('change',()=>{const file=$('#model-file').files?.[0];if(file)loadModel(file);$('#model-file').value='';});
  $('#model-home').addEventListener('click',()=>view?.resetCamera());
  $('#model-focus').addEventListener('click',()=>view?.focusComponent(state.component));
  $('#model-context').addEventListener('change',()=>view?.setContextVisible($('#model-context').checked));
  $('#model-part-search').addEventListener('input',renderParts);
  $('#model-picked-component').addEventListener('change',()=>{if(picked)assign(picked.id,$('#model-picked-component').value);});
  $('#region-radius').addEventListener('input',()=>{$('#region-radius-label').textContent=$('#region-radius').value+' %';});
  $('#region-add').addEventListener('click',()=>{
    if(!pendingPoint || !view?.addRegion)return;
    const component=$('#region-component').value;
    if(component==='other'){announce('Elige una estructura para esta zona.');return;}
    const radius=Number($('#region-radius').value)/100*(view.getRegionScale?.() || 1);
    const region=view.addRegion({component,point:pendingPoint,radius});
    if(region){savedRegions.push(region);remember();renderRegions();updateDescription(true);view.update(state);pendingPoint=null;$('#region-picked').hidden=true;$('#three-selection').hidden=true;$('#region-list').lastElementChild?.querySelector('button')?.focus({preventScroll:true});announce('Zona de '+components[component].label+' guardada. Se resaltará al visitar sus procesos.');}
    else {status('Puedes guardar hasta 24 zonas. Elimina una zona para señalar otra.','error');announce('No se pudo guardar otra zona. Elimina una de las zonas existentes.');}
  });
  document.addEventListener('celma:frame',event=>{
    Object.assign(state,event.detail);applyDisplay();
    if(display==='3d') {view?.update(state);updateDescription();}
  });
  document.addEventListener('visibilitychange',()=>view?.setVisible(display==='3d'&&!document.hidden));
  window.addEventListener('pagehide',event=>{if(!event.persisted)view?.dispose();});
  window.addEventListener('resize',renderModelLabels);
  applyDisplay();
})();
