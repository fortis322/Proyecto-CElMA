/* Presentación de la colección: las condiciones se verifican en logros.js. */
(() => {
  'use strict';
  const paths={
    combine:'M7 8h6v6H7zM19 16h6v6h-6zM12 22h4m-2-2v4M16 11l4 4M19 11l1 4-4-1',
    microtubule:'M10 8c0-2 12-2 12 0v16c0 2-12 2-12 0V8Zm0 0c0 2 12 2 12 0M14 10v12m4-12v12M24 7h4m-2-2v4',
    switch:'M6 11h18l-4-4m4 4-4 4M26 22H8l4-4m-4 4 4 4M11 8v6m10 5v6',
    branch:'M6 25 16 15 25 6M16 15l10 9M11 20l-3-8M20 11l-1-6M21 20l7-1',
    cargo:'M5 23h23M7 26h18M9 23v-5m4 5v-5M19 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM19 17v6M8 12h4m-2-2 2 2-2 2',
    directions:'M5 11h22l-4-4m4 4-4 4M27 23H5l4-4m-4 4 4 4M11 8v6m10 6v6',
    repair:'M5 22h8m6 0h8M5 26h8m6 0h8M13 20l3 4-3 4M19 20l-3 4 3 4M11 9l3 3 7-7M8 5h16v11H8z',
    compare:'M5 26h23M8 24V9m5 15V16m6 8V6m5 18V12M7 5l3-1m7-1 4-1'
  };
  function icon(key){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('fill','none');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[key]||paths.combine);path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
  }
  function make(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function mount(container,manager){
    if(!(container instanceof Element)||!manager?.getState||!manager?.subscribe)throw new TypeError('La colección necesita un contenedor y un gestor de medallas.');
    const definitions=window.CELMA_ACHIEVEMENTS||[],section=make('section','achievement-collection');section.setAttribute('aria-label','Colección de medallas');
    const groups=[['all','Todas'],['exploration','Exploración'],['microtubules','Microtúbulos'],['actin','Actina'],['transport','Transporte'],['method','Método'],['mastery','Maestrías']];
    const header=make('div','achievement-heading'),headingCopy=make('div');
    headingCopy.append(make('p','cell-kicker','TU COLECCIÓN'),make('h3',null,'Cada descubrimiento cuenta'),make('p','achievement-intro',definitions.length+' desafíos para investigar, comparar y volver a intentarlo. Las medallas reconocen un proceso: elegir una tarjeta o mover un control no basta.'));
    const counter=make('div','achievement-counter');counter.setAttribute('aria-label','Progreso de la colección');header.append(headingCopy,counter);
    const toast=make('p','achievement-toast');toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.hidden=true;
    const filters=make('div','achievement-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','Filtrar medallas por tema');
    const stateFilters=make('div','achievement-state-filters');stateFilters.setAttribute('role','group');stateFilters.setAttribute('aria-label','Filtrar por estado');
    const feature=make('div','achievement-feature');feature.setAttribute('aria-label','Desafío elegido');
    const grid=make('div','achievement-grid'),cards=new Map(),groupButtons=new Map(),stateButtons=new Map();
    const empty=make('p','achievement-empty','Todavía no hay medallas en esta selección. Prueba con otro filtro.');empty.hidden=true;
    let chosen='first-combination',group='exploration',filter='all',state=manager.getState(),toastTimer=null;
    function choose(id){chosen=id;renderFeature();for(const [key,item] of cards)item.button.setAttribute('aria-pressed',String(key===chosen));}
    function renderFeature(){
      const definition=definitions.find(item=>item.id===chosen);if(!definition)return;
      const earned=!!state.unlocked[chosen],face=make('div','achievement-medal');face.append(icon(definition.iconKey));
      const copy=make('div','achievement-feature-copy');copy.append(make('span','achievement-feature-label',earned?'DESCUBRIMIENTO CONSEGUIDO':'TU PRÓXIMO DESAFÍO'),make('h4',null,definition.title),make('p',null,definition.requirement));
      const progress=state.progress?.[chosen],hint=earned?(state.persisted?'Guardado en este navegador.':'Conseguido en esta sesión; no se pudo guardar en el navegador.'):(progress?.label||'Prepara la experiencia y sigue los pasos de este desafío.');
      copy.append(make('p','achievement-feature-hint',hint));feature.classList.toggle('is-unlocked',earned);feature.replaceChildren(face,copy);
    }
    for(const [id,label] of groups){const button=make('button',null,label);button.type='button';button.addEventListener('click',()=>{group=id;render();});filters.append(button);groupButtons.set(id,button);}
    for(const [id,label] of [['all','Todas'],['pending','Por descubrir'],['earned','Conseguidas']]){const button=make('button',null,label);button.type='button';button.addEventListener('click',()=>{filter=id;render();});stateFilters.append(button);stateButtons.set(id,button);}
    for(const definition of definitions){
      const card=make('article','achievement-card');card.dataset.achievement=definition.id;card.dataset.group=definition.group;
      const button=make('button','achievement-select');button.type='button';button.setAttribute('aria-pressed',String(chosen===definition.id));button.setAttribute('aria-label','Ver desafío: '+definition.title);
      const face=make('div','achievement-medal');face.setAttribute('aria-hidden','true');face.append(icon(definition.iconKey));
      const badge=make('span','achievement-level',definition.level),status=make('span','achievement-status','Por descubrir'),title=make('h4',null,definition.title);
      const requirement=make('p','achievement-requirement',definition.requirement),hint=make('p','achievement-hint');
      const progress=make('progress','achievement-progress');progress.max=1;progress.value=0;progress.setAttribute('aria-label','Progreso de '+definition.title);
      button.append(face,badge,title,status);button.addEventListener('click',()=>choose(definition.id));card.append(button,requirement,progress,hint);grid.append(card);cards.set(definition.id,{card,button,status,progress,hint,title:definition.title,group:definition.group});
    }
    const note=make('p','achievement-footnote','Los avances completados se guardan en este navegador. Las secuencias en curso empiezan de nuevo al reiniciar una corrida. El reloj usa segundos de simulación; no mide el tiempo real de una célula.');
    section.append(header,toast,feature,filters,stateFilters,grid,empty,note);container.append(section);
    function render(next=state){
      state=next;const count=Object.keys(state.unlocked).length;counter.replaceChildren(make('strong',null,String(count)),make('span',null,'de '+definitions.length+' medallas'));counter.style.setProperty('--earned',String(count/Math.max(1,definitions.length)*360)+'deg');
      for(const [id,button] of groupButtons){button.setAttribute('aria-pressed',String(group===id));const label=groups.find(item=>item[0]===id)[1],total=id==='all'?definitions.length:definitions.filter(item=>item.group===id).length;button.textContent=label+' · '+total;}
      for(const [id,button] of stateButtons)button.setAttribute('aria-pressed',String(filter===id));
      let visible=0;
      for(const [id,item] of cards){
        const earned=!!state.unlocked[id],status=earned?'Conseguida':'Por descubrir';item.card.classList.toggle('is-unlocked',earned);item.status.textContent=status;
        item.card.hidden=(group!=='all'&&item.group!==group)||(filter==='pending'&&earned)||(filter==='earned'&&!earned);if(!item.card.hidden)visible++;
        item.progress.value=earned?1:state.progress?.[id]?.value||0;
        const hint=earned?'Proceso completado.':state.progress?.[id]?.label||'Selecciona la medalla para enfocarte en este desafío.';if(item.hint.textContent!==hint)item.hint.textContent=hint;
      }
      empty.hidden=visible>0;feature.hidden=visible===0;
      if(visible&&cards.get(chosen)?.card.hidden)chosen=[...cards].find(([,item])=>!item.card.hidden)[0];
      for(const [id,item] of cards)item.button.setAttribute('aria-pressed',String(id===chosen));
      renderFeature();
    }
    const unsubscribe=manager.subscribe((next,event)=>{
      render(next);
      if(event?.unlocked?.length){const labels=event.unlocked.map(id=>cards.get(id)?.title).filter(Boolean);if(!labels.length)return;toast.textContent=(labels.length===1?'Nueva medalla: ':'Nuevas medallas: ')+labels.join(' · ');toast.hidden=false;if(toastTimer!==null)clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;toastTimer=null;},6500);}
    });
    const observeMicroscopy=event=>manager.observe({action:{...event.detail,type:'microscopy-observed'}}),sourceMicroscopy=event=>manager.observe({action:{...event.detail,type:'microscopy-source'}});
    document.addEventListener('celma:microscopy-observed',observeMicroscopy);document.addEventListener('celma:microscopy-source',sourceMicroscopy);
    render();return {render,destroy:()=>{unsubscribe();document.removeEventListener('celma:microscopy-observed',observeMicroscopy);document.removeEventListener('celma:microscopy-source',sourceMicroscopy);if(toastTimer!==null)clearTimeout(toastTimer);section.remove();}};
  }
  window.CelmaAchievementUI={mount};
})();
