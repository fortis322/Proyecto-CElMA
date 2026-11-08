/* Modelos de terceros con permiso verificado, separados del fibroblasto base. */
(() => {
  'use strict';
  const entries=window.CELMA_REFERENCE_MODELS;if(!entries?.length || !window.CelmaWorkspace)return;
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const panel=make('section','cell-feature-panel reference-panel');panel.id='reference-panel';
  panel.innerHTML='<p class="cell-kicker">BIBLIOTECA DE MODELOS 3D</p><h2>Más formas de observar</h2><p>Abre modelos reutilizables y compáralos con la célula esquemática de Celma. Cada recurso conserva su autoría, licencia y alcance científico.</p><div class="reference-grid" id="reference-grid"></div><div class="reference-context"><h3 id="reference-title"></h3><p id="reference-description"></p><p id="reference-scale"></p><div class="cell-sources" id="reference-sources"></div><p id="reference-selection" role="status"></p></div><div class="cell-actions"><button type="button" id="reference-return">Volver a la célula de Celma</button><a id="reference-download" download>Descargar este GLB</a></div>';
  let current=entries[0],token=0,active=false,opening=null;
  const $=s=>panel.querySelector(s);
  function link(label,url){const a=make('a',null,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function render(){
    $('#reference-title').textContent=current.label;$('#reference-description').textContent=current.description;
    $('#reference-scale').textContent=(current.scientificLevel||'Representación esquemática').replace(/[.\s]+$/,'')+'. '+(current.scaleNote||'La escala se ajusta al encuadre y no es una medición biológica.');
    $('#reference-sources').replaceChildren(make('span',null,'Autoría: '+current.author),link('Fuente original',current.sourceURL),link(current.license,current.licenseURL));
    $('#reference-download').href=current.src;for(const button of $('#reference-grid').children)button.setAttribute('aria-pressed',String(button.dataset.reference===current.id));
  }
  async function choose(id){
    const entry=entries.find(x=>x.id===id);if(!entry)return;current=entry;render();if(!active)return;
    const request=++token;$('#reference-selection').textContent='Abriendo modelo…';
    try{await window.CelmaExplorer3D.loadReference(entry,{isCurrent:()=>active&&request===token});if(request!==token||!active)return;$('#reference-selection').textContent='Modelo abierto. Arrastra para girar, usa la rueda para acercar y el botón derecho para desplazar la cámara.';}
    catch(error){if(request===token)$('#reference-selection').textContent=error.message||'No se pudo abrir este archivo.';}
  }
  $('#reference-grid').replaceChildren(...entries.map(entry=>{const button=make('button','reference-card');button.type='button';button.dataset.reference=entry.id;const icon=make('span','reference-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';button.append(icon,make('strong',null,entry.label),make('small',null,'GLB · '+entry.license));button.addEventListener('click',()=>choose(entry.id));return button;}));
  window.CelmaWorkspace.register({id:'models',label:'Modelos 3D',panel,enter:()=>{active=true;opening=choose(current.id);},leave:()=>{active=false;++token;}});
  $('#reference-return').addEventListener('click',()=>window.CelmaWorkspace.setMode('explore'));
  document.addEventListener('celma:reference-pick',event=>{if(active)$('#reference-selection').textContent='Pieza seleccionada: '+event.detail.part.name+'. Consulta la fuente para el alcance de esta representación.';});
  window.CelmaReferenceLibrary={open:async id=>{if(window.CelmaWorkspace.getMode()==='models')return choose(id||current.id);current=entries.find(item=>item.id===id)||current;await window.CelmaWorkspace.setMode('models');return opening;},select:choose,getState:()=>({id:current.id,active})};
  render();
})();
