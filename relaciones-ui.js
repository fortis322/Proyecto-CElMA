/* Relaciones: dial y carrusel de conexiones documentadas. */
(() => {
 'use strict';
 if(!window.CelmaWorkspace||!window.CELMA_RELATIONS)return;
 const $=s=>document.querySelector(s),relations=window.CELMA_RELATIONS;
 const types={transport:'Transporte',mechanical:'Mecánica',functional:'Funcional',spatial:'Espacial'};
 const families={microtubules:['Microtúbulos','Rutas y organización','#287bd0'],actin:['Actina','Forma y movimiento','#168c7b'],intermediate:['Intermedios','Soporte y resistencia','#8860b5']};
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const panel=make('section','cell-feature-panel');panel.id='relations-panel';
 panel.innerHTML='<div class="relation-heading"><div><p class="cell-kicker">CONEXIONES QUE DAN VIDA</p><h2>Ninguna estructura trabaja sola</h2><p>Gira por sus relaciones y descubre qué hacen juntas.</p></div><span aria-hidden="true">↗</span></div><div class="relation-families" role="group" aria-label="Familia de estructuras"></div><div class="relation-discovery"><div class="relation-dial-wrap"><div class="relation-dial" role="group" aria-label="Elegir una relación"><div class="relation-dial-rings" aria-hidden="true"></div><div class="relation-dial-center"><span>EXPLORA</span><strong id="relation-family-name"></strong><small id="relation-family-count"></small></div><div id="relation-dial-buttons"></div></div><p class="relation-dial-hint">Cada punto abre una conexión</p></div><article class="relation-story" aria-live="polite" aria-atomic="true"><div class="relation-story-top"><span class="cell-status" id="relation-type"></span><span id="relation-position"></span></div><h3 id="relation-title"></h3><div id="relation-participants" class="relation-participants"></div><p id="relation-explanation"></p><p id="relation-context" class="relation-context"></p></article></div><div class="relation-carousel"><button type="button" id="relation-prev" aria-label="Relación anterior">←</button><div id="relation-pages" role="group" aria-label="Recorrido de relaciones"></div><button type="button" id="relation-next" aria-label="Relación siguiente">→</button></div><div class="relation-player"><button type="button" id="relation-play" aria-pressed="false">Reproducir conexión</button><button type="button" id="relation-reset">↺ Reiniciar</button><div class="relation-speeds" role="group" aria-label="Velocidad de animación"><button type="button" data-relation-speed="0.5" aria-pressed="false">0,5×</button><button type="button" data-relation-speed="1" aria-pressed="true">1×</button><button type="button" data-relation-speed="2" aria-pressed="false">2×</button></div><button type="button" id="relation-return">Volver al explorador ↗</button></div><div class="cell-sources" id="relation-sources"></div>';
 let family='microtubules',current=null,scene=null,view=null,playing=false,progress=0,speed=1,last=null,raf=null,savedFocus=null,dialAngle=0;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),list=()=>relations.filter(item=>item.component===family);
 function stop(){playing=false;if(raf)cancelAnimationFrame(raf);raf=null;last=null;$('#relation-play').textContent='Reproducir conexión';$('#relation-play').setAttribute('aria-pressed','false');panel.querySelector('.relation-dial').classList.remove('is-playing');}
 function render(){scene?.setProgress(progress);view?._schedule();}
 function tick(now){if(!playing)return;if(last!==null)progress=(progress+Math.min(.1,(now-last)/1000)*speed/8)%1;last=now;render();raf=requestAnimationFrame(tick);}
 function play(){if(playing){stop();return;}playing=true;last=null;$('#relation-play').textContent='Pausar conexión';$('#relation-play').setAttribute('aria-pressed','true');panel.querySelector('.relation-dial').classList.add('is-playing');raf=requestAnimationFrame(tick);}
 function choose(id){
  const relation=relations.find(item=>item.id===id);if(!relation)return;stop();progress=0;current=relation;
  view=window.CelmaExplorer3D.getViewer();
  if(view){if(!scene||scene.view!==view){scene?.dispose();scene=new window.CelmaRelationScene(view);}view.setScientificFocus(relation.participants);scene.show(relation);render();}
  $('#relation-title').textContent=relation.title;$('#relation-explanation').textContent=relation.explanation;$('#relation-type').textContent=types[relation.type];
  $('#relation-context').textContent=relation.context==='division-inset'?'División celular · La animación se muestra aparte del modelo en interfase.':'Los pulsos ayudan a seguir la relación; no representan mediciones ni contactos moleculares observados.';
  $('#relation-position').textContent=String(list().findIndex(item=>item.id===id)+1).padStart(2,'0')+' / '+String(list().length).padStart(2,'0');
  const desired=-list().findIndex(item=>item.id===id)*360/list().length;
  const delta=((desired-dialAngle+540)%360+360)%360-180;dialAngle+=delta;
  panel.querySelector('.relation-dial').style.setProperty('--dial-angle',dialAngle+'deg');
  $('#relation-participants').replaceChildren(...relation.participants.map(key=>make('span',null,window.CELMA_3D_COMPONENTS?.[key]?.label||key)));
  panel.querySelectorAll('[data-relation-id]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.relationId===id)));
  $('#relation-sources').replaceChildren(...relation.sources.map(source=>{const a=make('a',null,source.label+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}));
  if(view&&!motion.matches&&window.CelmaWorkspace.getMode()==='relations')play();
 }
 function options(preferred){
  const entries=list(),info=families[family];panel.style.setProperty('--relation-accent',info[2]);$('#relation-family-name').textContent=info[0];$('#relation-family-count').textContent=entries.length+' conexiones';
  panel.querySelectorAll('[data-relation-family]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.relationFamily===family)));
  $('#relation-dial-buttons').replaceChildren(...entries.map((item,index)=>{const button=make('button','relation-orbit',String(index+1).padStart(2,'0'));button.type='button';button.dataset.relationId=item.id;button.title=item.title;button.setAttribute('aria-label',item.title);const angle=-Math.PI/2+index*Math.PI*2/entries.length;button.style.left=(50+42*Math.cos(angle))+'%';button.style.top=(50+42*Math.sin(angle))+'%';button.addEventListener('click',()=>choose(item.id));return button;}));
  $('#relation-pages').replaceChildren(...entries.map(item=>{const button=make('button','relation-page');button.type='button';button.dataset.relationId=item.id;button.setAttribute('aria-label',item.title);button.title=item.title;button.addEventListener('click',()=>choose(item.id));return button;}));choose(entries.find(item=>item.id===preferred)?.id||entries[0]?.id);
 }
 window.CelmaWorkspace.register({id:'relations',label:'Relaciones',panel,enter:()=>{view=window.CelmaExplorer3D.getViewer();savedFocus=view._focusComponents?[...view._focusComponents]:null;const selected=window.CelmaCellUI.getSelection();if(families[selected])family=selected;options(current?.id);},leave:()=>{stop();scene?.clear();view?.setScientificFocus(savedFocus);}});
 panel.querySelector('.relation-families').replaceChildren(...Object.entries(families).map(([key,info])=>{const button=make('button','relation-family');button.type='button';button.dataset.relationFamily=key;button.style.setProperty('--family-color',info[2]);button.append(make('i'),make('strong',null,info[0]),make('small',null,info[1]));button.addEventListener('click',()=>{family=key;options();});return button;}));
 function move(offset){const entries=list(),index=entries.findIndex(item=>item.id===current?.id);choose(entries[(index+offset+entries.length)%entries.length].id);}
 $('#relation-prev').addEventListener('click',()=>move(-1));$('#relation-next').addEventListener('click',()=>move(1));
 panel.querySelector('.relation-dial').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);panel.querySelector('.relation-orbit[aria-pressed="true"]').focus({preventScroll:true});}});
 panel.querySelectorAll('[data-relation-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.relationSpeed);panel.querySelectorAll('[data-relation-speed]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
 let touchStart=null;const story=panel.querySelector('.relation-story');story.addEventListener('touchstart',event=>{touchStart=event.changedTouches[0];},{passive:true});story.addEventListener('touchend',event=>{if(!touchStart)return;const end=event.changedTouches[0],dx=end.clientX-touchStart.clientX,dy=end.clientY-touchStart.clientY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);touchStart=null;},{passive:true});
 $('#relation-play').addEventListener('click',play);$('#relation-reset').addEventListener('click',()=>{stop();progress=0;render();});$('#relation-return').addEventListener('click',()=>window.CelmaWorkspace.setMode('explore'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});document.addEventListener('celma:model-ready',()=>{scene?.dispose();scene=null;if(window.CelmaWorkspace.getMode()==='relations')options(current?.id);});
 window.CelmaRelations={select:id=>{family=relations.find(item=>item.id===id)?.component||'microtubules';options(id);},getState:()=>({id:current?.id,progress,playing}),pause:stop};options();
})();
