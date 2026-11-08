/* Catálogo y fichas: la disponibilidad procede de configuración, no del visor. */
(() => {
  'use strict';
  const config=window.CELMA_CELL_CONFIG,$=s=>document.querySelector(s);
  if(!config)return;
  let view=null,selected='cytoskeleton',isolated=false,kind='user',display='2d',lastExplorerKey='';
  const entries=config.organelles;
  const entry=id=>entries.find(item=>item.id===id);
  const keys=item=>item.components || [item.id];
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const modes=new Map();let activeMode='explore',modeToken=0;
  async function setMode(id,{keepModel=false}={}){
    if(id===activeMode)return;
    const next=modes.get(id);if(!next)return;const token=++modeToken;
    modes.get(activeMode)?.leave?.();activeMode=id;
    $('.viewer').dataset.workspace=id;
    if(view)view._cellFeatureActive=id!=='explore';
    for(const [key,mode] of modes){if(mode.panel)mode.panel.hidden=key!==id;mode.button.setAttribute('aria-pressed',String(key===id));}
    if(id!=='explore'){document.dispatchEvent(new Event('celma:pause'));window.CelmaExplorer3D.closeBrush();await window.CelmaExplorer3D.loadCell();view=window.CelmaExplorer3D.getViewer();view._cellFeatureActive=true;}
    else if(!keepModel && window.CelmaExplorer3D.getKind()==='reference'){await window.CelmaExplorer3D.loadCell();view=window.CelmaExplorer3D.getViewer();}
    if(token!==modeToken || activeMode!==id)return;
    if(id!=='explore'){view?.clearOrganelleOverrides();isolated=false;}
    next.enter?.();document.dispatchEvent(new CustomEvent('celma:workspace-changed',{detail:{mode:id}}));
  }
  function registerMode({id,label,panel,enter,leave}){
    const button=id==='explore'?$('#cell-explore'):make('button',null,label);button.type='button';button.id=id==='explore'?'cell-explore':'cell-mode-'+id;button.setAttribute('aria-pressed',String(id===activeMode));button.addEventListener('click',()=>setMode(id));
    if(id!=='explore')$('#cell-nav').append(button);
    if(panel){panel.hidden=true;$('#cell-feature-panels').append(panel);}
    modes.set(id,{button,panel,enter,leave});return button;
  }
  window.CelmaWorkspace={register:registerMode,setMode,getMode:()=>activeMode};
  $('.scene-shell').before($('#cell-feature-panels'));
  const available=item=>!!config.modules[item.module]?.enabled;
  function catalog(){
    const container=$('#organelle-catalog');
    container.replaceChildren(...entries.filter(item=>!['actin','microtubules','intermediate'].includes(item.id)).map(item=>{
      const button=make('button','catalog-entry');button.type='button';button.dataset.organelle=item.id;button.dataset.available=String(available(item));
      button.setAttribute('aria-pressed',String(selected===item.id));
      const name=make('span'),dot=make('i');dot.style.background=item.color;name.append(dot,document.createTextNode(item.label));
      button.append(name,make('small',null,available(item)?'Disponible':'Próximamente'));
      button.addEventListener('click',()=>select(item.id));return button;
    }));
    const count=entries.filter(item=>!['actin','microtubules','intermediate'].includes(item.id)&&available(item)).length;
    $('.cell-catalog summary span').textContent=String(count).padStart(2,'0')+' disponible'+(count===1?'':'s');
  }
  function update(){
    const item=entry(selected)||entry('cytoskeleton');if(!item)return;
    $('#organelle-inspector').hidden=display!=='3d' || kind!=='cell';
    $('#organelle-title').textContent=item.label;
    $('#organelle-intro').textContent=item.intro;
    const enabled=available(item),module=config.modules[item.module];
    $('#organelle-availability').textContent=enabled?'Disponible':'Próximamente';
    $('#organelle-availability').classList.toggle('available',enabled);
    const state=view?.getOrganelleState(keys(item)[0]) || {visible:true,opacity:item.defaultOpacity ?? 1};
    $('#organelle-visible').checked=state.visible;
    $('#organelle-opacity').value=String(Math.round(state.opacity*100));
    $('#organelle-opacity-value').textContent=Math.round(state.opacity*100)+' %';
    $('#organelle-isolate').setAttribute('aria-pressed',String(isolated));
    $('#organelle-isolate').textContent=isolated?'Volver al contexto':'Aislar';
    const link=$('#organelle-module');link.hidden=!enabled || !module.moduleUrl;
    if(!link.hidden){link.href=module.study?'#organelle-'+item.id:module.moduleUrl;link.textContent=module.study?'Abrir recorrido 3D →':'Estudiar '+module.label.toLowerCase()+' →';}
    $('#organelle-sources').replaceChildren(...(item.sources||[]).map(source=>{const a=make('a',null,source.label);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}));
    document.querySelectorAll('[data-organelle]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.organelle===item.id)));
    $('#cell-model-description').textContent=kind==='cell'?(config.description || 'Fibroblasto adherente · interfase · esquema educativo'):kind==='reference'?'Modelo externo · consulta autoría y licencia en la biblioteca':'Modelo anterior aportado por el usuario · archivo GLB';
  }
  async function select(id,{open=true,focus=true}={}){
    const item=entry(id);if(!item)return;
    if(activeMode!=='explore')await setMode('explore');
    document.dispatchEvent(new Event('celma:pause'));
    selected=id;
    if(open)await window.CelmaExplorer3D.loadCell();
    view=window.CelmaExplorer3D.getViewer();kind=window.CelmaExplorer3D.getKind();
    if(kind!=='cell')return;
    if(isolated)view.isolateOrganelles(keys(item));
    if(focus)view.setScientificFocus(id==='cytoskeleton'?null:keys(item));
    update();
    document.dispatchEvent(new CustomEvent('celma:cell-selection',{detail:{id,item,components:keys(item)}}));
    $('#announcement').textContent=item.label+'. '+(available(item)?'Disponible. ':'Módulo próximamente. ')+item.intro;
  }
  function restore(){isolated=false;view?.clearOrganelleOverrides();view?.resetCamera();update();document.dispatchEvent(new Event('celma:cell-restored'));}
  $('#organelle-visible').addEventListener('change',()=>{const item=entry(selected);for(const key of keys(item))view?.setOrganelleState(key,{visible:$('#organelle-visible').checked});});
  $('#organelle-opacity').addEventListener('input',()=>{const value=Number($('#organelle-opacity').value)/100;for(const key of keys(entry(selected)))view?.setOrganelleState(key,{opacity:value});$('#organelle-opacity-value').textContent=Math.round(value*100)+' %';});
  $('#organelle-isolate').addEventListener('click',()=>{isolated=!isolated;view?.isolateOrganelles(isolated?keys(entry(selected)):null);update();});
  $('#organelle-focus').addEventListener('click',()=>{const item=entry(selected);view?.focusComponent(item.id==='cytoskeleton'?'microtubules':item.id);});
  $('#cell-restore').addEventListener('click',restore);
  $('#cell-model-new').addEventListener('click',()=>window.CelmaExplorer3D.loadCell());
  $('#cell-model-previous').addEventListener('click',()=>window.CelmaExplorer3D.loadPrevious());
  registerMode({id:'explore',label:'Explorador',enter:restore});
  $('#organelle-module').addEventListener('click',event=>{const item=entry(selected);if(config.modules[item.module]?.study && window.CelmaOrganelleStudy){event.preventDefault();window.CelmaOrganelleStudy.open(item.id);}else view?.setScientificFocus(null);});
  document.addEventListener('celma:model-ready',event=>{view=event.detail.view;kind=event.detail.kind;isolated=false;update();});
  document.addEventListener('celma:view-display',event=>{display=event.detail.display;kind=event.detail.kind;$('#organelle-inspector').hidden=display!=='3d'||kind!=='cell';});
  document.addEventListener('celma:organelle-select',event=>select(event.detail.component,{open:false}));
  document.addEventListener('celma:frame',event=>{const key=[event.detail.mode,event.detail.id,event.detail.component].join('|');if(key!==lastExplorerKey && view && kind==='cell'){if(activeMode!=='explore')setMode('explore');selected=event.detail.component==='all'?'cytoskeleton':event.detail.component;view.setScientificFocus(null);update();}lastExplorerKey=key;});
  window.CelmaCellUI={select,restore,getSelection:()=>selected,getEntry:entry};
  catalog();update();
})();
