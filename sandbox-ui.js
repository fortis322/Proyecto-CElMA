/* Mesa interactiva. Sus combinaciones configuran los motores, no clips grabados. */
(() => {
  'use strict';
  if(!window.CelmaLab || !window.CELMA_SANDBOX)return;
  const $=s=>document.querySelector(s),lab=window.CelmaLab,config=window.CELMA_SANDBOX;
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  function ingredientIcon(id){
    const paths={tubulin:'M8 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm16 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',monomers:'M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z',nucleator:'M16 4v24M4 16h24M8 8l16 16M24 8 8 24M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',stabilizer:'m16 4 10 4v9c0 5-10 11-10 11S6 22 6 17V8l10-4Zm-5 11 4 4 7-8',catastrophe:'M6 7 25 26M15 26h10V16',rescue:'M6 25 25 6M15 6h10v10',seed:'M4 13h24M4 19h24M9 13v6m7-6v6m7-6v6',brancher:'M5 27 27 5M15 17l11 10M9 23l-4-8',turnover:'M25 12a10 10 0 1 0-2 12M25 5v7h-7M6 20l5 3',cortex:'M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM6 17l9-8 11 7M8 23l8-7 9 5',network:'M5 27 15 12 27 5M15 12l10 15M15 12 5 5M5 20l21-5',vesicle:'M16 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 11l3-2',kinesin:'M4 16h24m-9-9 9 9-9 9',dynein:'M28 16H4m9-9-9 9 9 9',break:'M4 11h8m8 0h8M4 21h8m8 0h8M13 12l6 8m0-8-6 8'};
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('fill','none');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[id]||paths.monomers);path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
  }
  const panel=$('#lab-panel'),viewer=$('.viewer'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  panel.querySelector('h2').textContent='Tu laboratorio de descubrimientos';
  panel.querySelector('h2+p').textContent='Elige un sistema, prepara una combinación y observa cómo evoluciona. Cada experimento abre una nueva pregunta.';
  const modeSwitch=make('div','sandbox-mode-switch');
  modeSwitch.innerHTML='<button type="button" id="lab-mode-sandbox" aria-pressed="true">Mesa de experimentos</button><button type="button" id="lab-mode-advanced" aria-pressed="false">Ajustes y desafíos</button>';
  $('.sim-header').before(modeSwitch);
  const advanced=make('div','sandbox-advanced');advanced.id='sandbox-advanced';advanced.hidden=true;
  advanced.append($('.lab-guided'),$('#lab-parameters'));$('#lab-description').after(advanced);
  const bench=make('section','sandbox-bench');bench.setAttribute('aria-label','Mesa para combinar componentes celulares');
  bench.innerHTML='<div class="sandbox-bench-heading"><div><p class="cell-kicker">TU MESA DE EXPLORACIÓN</p><h3 id="sandbox-title"></h3></div><button id="sandbox-clear" type="button">Vaciar mesa</button></div><div class="sandbox-examples" id="sandbox-examples" role="group" aria-label="Ideas para empezar"></div><div class="sandbox-workspace"><div class="sandbox-shelf" id="sandbox-shelf" role="group" aria-label="Elementos disponibles"></div><div class="sandbox-arena" id="sandbox-dropzone"><div class="sandbox-arena-top"><span id="sandbox-state">Sistema en preparación</span><span>PROYECCIÓN 2D · NO A ESCALA</span></div><canvas id="sandbox-canvas" role="img" aria-label="Estado calculado del sandbox"></canvas><div class="sandbox-selection" id="sandbox-selection" role="group" aria-label="Elementos en la mesa"></div><p class="sandbox-drop-hint" id="sandbox-drop-hint">Arrastra elementos aquí, o selecciónalos desde la bandeja.</p></div></div><div class="sandbox-combine-actions"><button type="button" class="primary" id="sandbox-combine" disabled>Combinar selección <span aria-hidden="true">→</span></button><button type="button" id="sandbox-step">Avanzar 1 segundo</button><button type="button" id="sandbox-repair" hidden>Reparar rutas</button><button type="button" id="sandbox-show-cell" aria-pressed="false">Ver también en la célula 3D</button></div><p class="sandbox-explanation" id="sandbox-explanation" role="status">La mesa comienza sin polímeros ni cargas. Elige al menos dos elementos para probar una combinación.</p><p class="sandbox-scope">Combinar prepara el experimento. Pulsa Iniciar para seguir su evolución o avanza un segundo cada vez.</p>';
  advanced.before(bench);
  const colorKey=make('div','sandbox-color-key');$('#sandbox-canvas').after(colorKey);
  let module=lab.getState().module||'microtubules',selection=new Set(),combined=false,appliedSelection='',mode='sandbox',showCell=false,lastSnapshot=null,modelCache=null,curves=[];
  const manager=window.CelmaAchievements.create();window.CelmaLabAchievements=manager;
  const medalContainer=make('div','sandbox-medals');medalContainer.id='sandbox-medals';$('#lab-results').append(medalContainer);window.CelmaAchievementUI.mount(medalContainer,manager);
  const current=()=>config[module];
  function ingredients(){return [...selection];}
  function setCellVisibility(){
    const active=window.CelmaWorkspace.getMode()==='lab';
    if(active){viewer.dataset.labCell=showCell?'shown':'hidden';window.CelmaExplorer3D.getViewer()?.setVisible(showCell);}
    else delete viewer.dataset.labCell;
    $('#sandbox-show-cell').setAttribute('aria-pressed',String(showCell));$('#sandbox-show-cell').textContent=showCell?'Ocultar célula 3D':'Ver también en la célula 3D';
    if(active && showCell)requestAnimationFrame(()=>{const v=window.CelmaExplorer3D.getViewer();v?.resize();v?.resetCamera();});
  }
  function renderSelection(){
    const list=ingredients();
    $('#sandbox-selection').replaceChildren(...list.map(id=>{const item=current().ingredients.find(x=>x.id===id),button=make('button','sandbox-token',item.label+' ×');button.type='button';button.setAttribute('aria-label','Quitar '+item.label);button.addEventListener('click',()=>toggle(id));return button;}));
    for(const button of $('#sandbox-shelf').children)button.setAttribute('aria-pressed',String(selection.has(button.dataset.ingredient)));
    $('#sandbox-combine').disabled=list.length<2;
    const applied=combined && appliedSelection===[...list].sort().join('|');
    $('#sandbox-drop-hint').textContent=applied?'Combinación aplicada. Avanza el tiempo o cambia la selección y vuelve a combinar.':list.length?list.length+' elementos en la mesa. Pulsa Combinar selección para calcular el resultado.':'Arrastra elementos aquí, o selecciónalos desde la bandeja.';
    $('#sandbox-repair').hidden=module!=='transport'||!combined||!selection.has('break');
  }
  function toggle(id){if(!current().ingredients.some(x=>x.id===id))return;selection.has(id)?selection.delete(id):selection.add(id);renderSelection();}
  function prepare(){
    module=lab.getState().module;selection.clear();combined=false;appliedSelection='';
    $('#sandbox-title').textContent=current().label;bench.style.setProperty('--sandbox-accent',current().accent);
    const colors={microtubules:[['#3986da','Estado de crecimiento'],['#d99a53','Acortamiento']],actin:[['#15917f','Filamento'],['#32b59e','Rama'],['#d99a53','Desensamblaje']],transport:[['#18a991','Cinesina-1 (+)'],['#9470c8','Dineína-1 (−)'],['#dda151','Bloqueada'],['#9cafc1','Sin motor']]};colorKey.replaceChildren(...colors[module].map(([color,label])=>{const span=make('span'),dot=make('i');dot.style.background=color;span.append(dot,document.createTextNode(label));return span;}));
    $('#sandbox-shelf').replaceChildren(...current().ingredients.map(item=>{
      const button=make('button','sandbox-ingredient');button.type='button';button.draggable=true;button.dataset.ingredient=item.id;button.title=item.description;button.setAttribute('aria-pressed','false');
      const symbol=make('span','sandbox-symbol');symbol.setAttribute('aria-hidden','true');symbol.append(ingredientIcon(item.id));
      const copy=make('span');copy.append(make('small',null,item.kind),make('strong',null,item.label));button.append(symbol,copy);
      button.addEventListener('click',()=>toggle(item.id));button.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',item.id);event.dataTransfer.effectAllowed='copy';});return button;
    }));
    $('#sandbox-examples').replaceChildren(make('span',null,'Ideas para empezar'),...current().examples.map((example,index)=>{const button=make('button',null,example.label+' →');button.type='button';button.addEventListener('click',()=>exampleAt(index));return button;}));
    renderSelection();$('#sandbox-explanation').textContent='La mesa empieza vacía. Selecciona al menos dos componentes o condiciones y pulsa Combinar selección.';
    lab.configure({parameters:current().empty,reset:true});setCellVisibility();
  }
  function combine(){
    if(selection.size<2)return null;
    const ids=ingredients(),recipe=current().resolve(ids);combined=true;appliedSelection=[...ids].sort().join('|');
    lab.configure({parameters:recipe.parameters,reset:true,action:{type:'combine',recipeId:module+':'+[...ids].sort().join('+'),ingredients:ids}});
    lab.advance(6);$('#sandbox-explanation').textContent='Después de 6 segundos de simulación. '+recipe.explanation;renderSelection();
    if(!reduced.matches && window.CelmaWorkspace.getMode()==='lab')lab.play();return lab.getState().snapshot;
  }
  function exampleAt(index){const example=current().examples[index];if(!example)return;selection=new Set(example.ids);renderSelection();return combine();}
  function repair(){
    if(module!=='transport'||!combined)return;
    const snapshot=lab.getState().snapshot,blocked=snapshot.vesicles.filter(v=>v.state==='blocked').length;
    lab.configure({parameters:{integrity:1,networkAvailability:1},action:{type:'repair'}});
    selection.delete('break');selection.add('network');appliedSelection=[...selection].sort().join('|');renderSelection();
    $('#sandbox-explanation').textContent=blocked?'Se han reparado las rutas en la misma corrida. Las cargas conservan su posición. Avanza el tiempo y observa si las que estaban bloqueadas llegan al destino.':'La red está reparada. Para la medalla Ruta reparada primero debe haber una carga bloqueada y, después de reparar sin reiniciar, esa misma carga debe llegar al destino.';
    if(!reduced.matches)lab.play();
  }
  function setMode(next){
    if(!['sandbox','advanced'].includes(next))return;mode=next;bench.hidden=mode!=='sandbox';advanced.hidden=mode!=='advanced';
    $('#lab-mode-sandbox').setAttribute('aria-pressed',String(mode==='sandbox'));$('#lab-mode-advanced').setAttribute('aria-pressed',String(mode==='advanced'));
    if(mode==='advanced'){showCell=true;setCellVisibility();}
    else {showCell=false;prepare();}
  }
  const canvas=$('#sandbox-canvas'),ctx=canvas.getContext('2d');
  function rebuildCurves(){const view=window.CelmaExplorer3D.getViewer(),model=view?._model;if(modelCache===model)return;modelCache=model;curves=(model?.userData.cellPaths?.microtubules||[]).map(path=>new view.THREE.CatmullRomCurve3(path.map(p=>new view.THREE.Vector3(...p))));}
  function draw(snapshot=lastSnapshot){
    if(!snapshot || !ctx || mode!=='sandbox')return;lastSnapshot=snapshot;rebuildCurves();
    const width=Math.max(220,canvas.clientWidth||600),height=220,dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(width*dpr)||canvas.height!==height*dpr){canvas.width=Math.round(width*dpr);canvas.height=height*dpr;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const point=p=>[22+(p[0]+6.4)/12.8*(width-44),18+(p[2]+3.6)/7.2*(height-36)];
    const path=(curve,a,b,color,lineWidth=2)=>{if(!curve)return;ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();for(let j=0;j<=25;j++){const p=curve.getPointAt(a+(b-a)*j/25),q=point([p.x,p.y,p.z]);j?ctx.lineTo(...q):ctx.moveTo(...q);}ctx.stroke();};
    const circle=(p,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fill();};
    ctx.strokeStyle='#cbdfef';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(width/2,height/2,(width-46)/2,(height-36)/2,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    if(snapshot.module==='microtubules')for(const f of snapshot.filaments){if(f.length<=0)continue;const curve=curves[f.route];path(curve,0,f.length,f.state==='shrinking'?'#d99a53':'#3986da',2.5);if(curve){const p=curve.getPointAt(f.length);circle(point([p.x,p.y,p.z]),2.8,f.state==='shrinking'?'#d99a53':'#3986da');}}
    if(snapshot.module==='actin')for(const f of snapshot.filaments){const a=point(f.origin),b=point(f.origin.map((v,i)=>v+f.direction[i]*f.length));ctx.strokeStyle=f.state==='shrinking'?'#d99a53':f.parentId?'#32b59e':'#15917f';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();circle(b,1.8,ctx.strokeStyle);}
    if(snapshot.module==='transport'){
      for(const route of snapshot.routes){if(route.available===false)continue;const curve=curves[route.id];if(route.intact)path(curve,0,1,'#b1cee9',1.5);else{path(curve,0,route.gapStart,'#a7bdcf',1.5);path(curve,route.gapEnd,1,'#a7bdcf',1.5);for(const f of [route.gapStart,route.gapEnd]){const p=curve?.getPointAt(f);if(p)circle(point([p.x,p.y,p.z]),2.1,'#dfa44c');}}}
      for(const cargo of snapshot.vesicles){const curve=curves[cargo.route];if(!curve)continue;const p=curve.getPointAt(cargo.position),at=point([p.x,p.y,p.z]),color=cargo.state==='blocked'?'#dda151':cargo.state==='waiting'?'#9cafc1':cargo.motor==='dynein1'?'#9470c8':'#18a991';circle(at,4.4,color);if(cargo.state==='running'){const tangent=curve.getTangentAt(cargo.position),sign=cargo.motor==='dynein1'?-1:1,angle=Math.atan2(tangent.z/7.2,tangent.x/12.8)+ (sign<0?Math.PI:0);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(at[0],at[1]);ctx.lineTo(at[0]+Math.cos(angle)*11,at[1]+Math.sin(angle)*11);ctx.stroke();}}
    }
    const count=snapshot.metrics.count;
    if(!count){ctx.fillStyle='#7291aa';ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillText(combined?'Todavía no se han formado estructuras':'¿Qué vas a combinar?',width/2,height/2);}
    $('#sandbox-state').textContent=lab.formatTime(snapshot.time)+' · '+(snapshot.module==='transport'?'Transporte celular':snapshot.module==='actin'?'Red de actina':'Red de microtúbulos');
    canvas.setAttribute('aria-label','Estado calculado de '+module+'. Tiempo '+lab.formatTime(snapshot.time)+' de simulación. '+snapshot.metrics.count+(module==='transport'?' cargas.':' filamentos.'));
  }
  $('#sandbox-combine').addEventListener('click',combine);$('#sandbox-clear').addEventListener('click',prepare);$('#sandbox-step').addEventListener('click',()=>lab.advance(1));$('#sandbox-repair').addEventListener('click',repair);
  $('#sandbox-show-cell').addEventListener('click',()=>{showCell=!showCell;setCellVisibility();});
  $('#lab-mode-sandbox').addEventListener('click',()=>setMode('sandbox'));$('#lab-mode-advanced').addEventListener('click',()=>setMode('advanced'));
  const dropzone=$('#sandbox-dropzone');dropzone.addEventListener('dragover',event=>{event.preventDefault();dropzone.classList.add('is-over');event.dataTransfer.dropEffect='copy';});dropzone.addEventListener('dragleave',()=>dropzone.classList.remove('is-over'));dropzone.addEventListener('drop',event=>{event.preventDefault();dropzone.classList.remove('is-over');const id=event.dataTransfer.getData('text/plain');if(current().ingredients.some(i=>i.id===id)){selection.add(id);renderSelection();}});
  document.addEventListener('celma:lab-frame',event=>{if(!event.detail.active)return;manager.observe(event.detail);lastSnapshot=event.detail.snapshot;draw(lastSnapshot);});
  document.addEventListener('celma:lab-action',event=>{if(!event.detail.active)return;manager.observe(event.detail);if(mode==='sandbox'&&['reference','load'].includes(event.detail.action?.type)){combined=true;appliedSelection='';selection.clear();renderSelection();$('#sandbox-drop-hint').textContent='Se muestran los parámetros '+(event.detail.action.type==='load'?'de tu configuración guardada.':'de referencia.');$('#sandbox-explanation').textContent='La visualización refleja los parámetros '+(event.detail.action.type==='load'?'cargados.':'de referencia.')+' Puedes verlos en Ajustes y desafíos, o preparar otra combinación en la mesa.';}});
  document.addEventListener('celma:lab-module-changed',event=>{if(event.detail.active && mode==='sandbox')prepare();else module=event.detail.module;});
  document.addEventListener('celma:workspace-changed',event=>{if(event.detail.mode==='lab'){if(!combined && mode==='sandbox')prepare();else setCellVisibility();draw(lab.getState().snapshot);}else delete viewer.dataset.labCell;});
  new ResizeObserver(()=>draw()).observe(canvas);
  window.CelmaSandbox={combine,repair,example:exampleAt,toggle,setMode,clear:prepare,getState:()=>({module,selection:ingredients(),combined,mode,showCell,achievements:manager.getState()})};
})();

