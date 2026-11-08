/* Evidencia local de exploración: secuencias y resultados del modelo, nunca clics aislados. */
(function (root) {
  'use strict';
  const VERSION=2,DEFAULT_KEY='celma-medallas-sandbox-v2',MODULES=['microtubules','actin','transport'];
  const definitions=Object.freeze([
    ['first-combination','Primera investigación','exploration','combine','Inicio','Combina componentes y observa durante 8 segundos de simulación una red que cambia o cargas que avanzan.'],
    ['three-labs','Tres formas de explorar','exploration','combine','Ruta','Observa actividad durante 12 segundos en cada laboratorio: microtúbulos, actina y transporte.'],
    ['recipe-collection','Cuaderno de combinaciones','exploration','combine','Reto','Investiga dos combinaciones diferentes por laboratorio. Cada una necesita 12 segundos y actividad calculada.'],
    ['patient-observer','Más allá del primer cambio','exploration','switch','Reto','Sigue una corrida activa durante 30 segundos en cada uno de los tres laboratorios.'],
    ['microtubule-growth','Una red que crece','microtubules','microtubule','Inicio','Observa 12 segundos de una corrida en la que los microtúbulos aumenten claramente su extensión.'],
    ['dynamic-instability','Catástrofe y rescate','microtubules','switch','Reto','En una corrida de al menos 12 segundos, observa tres catástrofes y dos rescates calculados.'],
    ['mt-from-nothing','El comienzo de una red','microtubules','microtubule','Reto','Empieza sin filamentos y observa, durante 12 segundos, la aparición de al menos tres microtúbulos.'],
    ['network-recovery','Volver a crecer','microtubules','repair','Experta','Sin reiniciar: observa una red, retira la tubulina hasta que se acorte y después repón tubulina hasta que vuelva a crecer. Cada etapa debe durar al menos 5 segundos.'],
    ['mt-supply-control','La tubulina importa','microtubules','compare','Método','Compara durante 20 segundos o más dos condiciones que solo cambien en tubulina y confirma mayor extensión con más tubulina.'],
    ['mt-stabilization','Estabilidad a prueba','microtubules','compare','Método','Compara durante 20 segundos o más dos condiciones que solo cambien en estabilización y confirma menos catástrofes al aumentarla.'],
    ['branched-actin','Una red con ramas','actin','branch','Inicio','Observa al menos 12 segundos y encuentra tres ramas de actina con sus filamentos progenitores todavía presentes.'],
    ['actin-parent-control','Primero, un progenitor','actin','branch','Método','Con nucleación primaria desactivada y ramificación activa, compara solo la presencia de semillas iniciales: sin ellas no debe haber ramas; con ellas, sí. Calcula al menos 20 segundos.'],
    ['actin-turnover','Construir y deshacer','actin','switch','Método','Sin monómeros y con semillas, compara solo el recambio durante al menos 20 segundos. Confirma que un recambio mayor deja menos filamento.'],
    ['actin-cortex','Organización cortical','actin','branch','Método','Compara solo la orientación cortical durante al menos 20 segundos y confirma que una orientación mayor concentra más red en la periferia.'],
    ['cargo-in-motion','Un viaje completo','transport','cargo','Inicio','Observa durante al menos 12 segundos una corrida con movimiento y tres cargas que lleguen a su destino.'],
    ['two-directions','Dos sentidos','transport','directions','Reto','Sigue durante 10 segundos cargas de cinesina-1 hacia + y de dineína-1 hacia − en la misma corrida. Ambas deben avanzar claramente.'],
    ['repaired-route','Ruta reparada','transport','repair','Experta','Observa una carga bloqueada, repara su ruta y sigue esa misma carga hasta su destino sin reiniciar. La corrida debe durar al menos 12 segundos.'],
    ['transport-motor','Hace falta un motor','transport','cargo','Método','Compara únicamente la disponibilidad de motores durante al menos 20 segundos: sin motores no hay viaje; con motores, sí.'],
    ['transport-route','Hace falta una vía','transport','repair','Método','Compara únicamente la presencia de red durante al menos 20 segundos: sin rutas no hay viaje; con rutas, sí.'],
    ['transport-direction','Polaridad en contraste','transport','directions','Método','Compara únicamente el motor durante al menos 20 segundos: cinesina-1 y dineína-1 deben producir desplazamientos opuestos.'],
    ['transport-speed','El ritmo del viaje','transport','cargo','Método','Compara únicamente la velocidad durante al menos 20 segundos: una condición detenida y otra activa deben producir recorridos diferentes.'],
    ['fair-comparison','Comparaciones justas','method','compare','Inicio','Completa dos comparaciones diferentes de al menos 20 segundos. En cada una cambia solo una variable, con la misma semilla y duración.'],
    ['single-variable','Una pregunta, una variable','method','compare','Reto','Completa tres comparaciones diferentes de una sola variable repartidas en al menos dos laboratorios. Cada comparación dura 20 segundos o más.'],
    ['comparison-series','Serie de investigación','method','compare','Experta','Completa seis comparaciones diferentes de una sola variable, con al menos dos en cada laboratorio y 20 segundos por condición. Repetir la misma comparación no suma.'],
    ['microscopy-reader','Leer una micrografía','method','microtubule','Reto','Observa tres enfoques de la micrografía verificada durante 8 segundos cada uno y consulta su fuente y su licencia.'],
    ['master-microtubules','Especialista en microtúbulos','mastery','microtubule','Maestría','Consigue Una red que crece, Catástrofe y rescate, La tubulina importa y Estabilidad a prueba.'],
    ['master-actin','Especialista en actina','mastery','branch','Maestría','Consigue Una red con ramas, Primero, un progenitor, Construir y deshacer y Organización cortical.'],
    ['master-transport','Especialista en transporte','mastery','cargo','Maestría','Consigue Un viaje completo, Dos sentidos, Ruta reparada, Hace falta un motor, Hace falta una vía y Polaridad en contraste.'],
    ['integrated-researcher','Investigación integral','mastery','compare','Maestría','Consigue las tres especialidades, Serie de investigación y Leer una micrografía.']
  ].map(([id,title,group,iconKey,level,requirement])=>Object.freeze({id,title,group,iconKey,level,requirement})));
  const ids=new Set(definitions.map(item=>item.id)),finite=value=>typeof value==='number'&&Number.isFinite(value),number=value=>finite(value)?value:0;
  const canonical=value=>JSON.stringify(Object.keys(value||{}).sort().map(key=>[key,value[key]]));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const validSnapshot=s=>!!s&&MODULES.includes(s.module)&&finite(s.time)&&s.time>=0&&finite(s.seed)&&s.parameters&&typeof s.parameters==='object'&&s.metrics&&finite(s.metrics.count)&&s.metrics.count>=0&&(s.module==='transport'?Array.isArray(s.vesicles)&&Array.isArray(s.routes):Array.isArray(s.filaments));
  function create(options={}) {
    let storage=null;try{storage=Object.prototype.hasOwnProperty.call(options,'storage')?options.storage:root.localStorage;}catch{}
    const key=typeof options.key==='string'?options.key:DEFAULT_KEY,listeners=new Set();
    let unlocked={},progress={},current=null,persisted=false,lastNotice='';
    let evidence={recipes:[],comparisons:[],labs:[],longLabs:[],microscopy:{}};
    try {
      const saved=JSON.parse(storage?.getItem(key)||'null');
      if(saved?.version===VERSION){
        for(const [id,record] of Object.entries(saved.unlocked||{}))if(ids.has(id)&&finite(record?.at)&&record.at>=0)unlocked[id]={at:record.at};
        for(const name of ['recipes','comparisons']){
          const seen=new Set();
          evidence[name]=(Array.isArray(saved.evidence?.[name])?saved.evidence[name]:[]).filter(item=>{
            if(!item||!MODULES.includes(item.module)||typeof item.signature!=='string'||item.signature.length>=2500)return false;
            // Older v2 records included the seed. Repeating the same conditions
            // with another seed is a repetition, not a new research question.
            if(name==='comparisons')item.signature=item.signature.replace(/^(microtubules|actin|transport):\d+:/,'$1:');
            const signature=item.module+':'+item.signature;if(seen.has(signature))return false;seen.add(signature);return true;
          }).slice(0,120);
        }
        for(const name of ['labs','longLabs'])evidence[name]=[...new Set((Array.isArray(saved.evidence?.[name])?saved.evidence[name]:[]).filter(item=>MODULES.includes(item)))];
        const entry=saved.evidence?.microscopy?.['imagej-fluorescent-cells'];
        if(entry)evidence.microscopy['imagej-fluorescent-cells']={focus:[...new Set((Array.isArray(entry.focus)?entry.focus:[]).filter(value=>['cytoskeleton','actin','microtubules','nucleus'].includes(value)))],source:entry.source===true,license:entry.license===true};
        persisted=true;
      }
    }catch{}
    function getState(){return {version:VERSION,unlocked:clone(unlocked),progress:clone(progress),persisted};}
    function save(){try{if(storage?.setItem){storage.setItem(key,JSON.stringify({version:VERSION,unlocked,evidence}));persisted=true;}}catch{persisted=false;}}
    function put(id,value,max,label){progress[id]={value:Math.floor(Math.min(1,Math.max(0,value/Math.max(max,1e-9)))*20)/20,max:1,label};}
    function award(id,newIds){if(!unlocked[id]){unlocked[id]={at:Date.now()};newIds.push(id);}}
    function record(name,module,signature){if(!evidence[name].some(item=>item.module===module&&item.signature===signature)&&evidence[name].length<120)evidence[name].push({module,signature});}
    function milestone(id,met,required,newIds){const n=required.filter(item=>met.includes(item)).length;put(id,n,required.length,n+' de '+required.length+' etapas completadas.');if(n===required.length)award(id,newIds);}
    function cumulative(newIds){
      milestone('three-labs',evidence.labs,MODULES,newIds);milestone('patient-observer',evidence.longLabs,MODULES,newIds);
      const recipes=MODULES.reduce((sum,module)=>sum+Math.min(2,evidence.recipes.filter(item=>item.module===module).length),0);
      put('recipe-collection',recipes,6,recipes+' de 6 combinaciones investigadas (dos por laboratorio).');if(recipes===6)award('recipe-collection',newIds);
      const count=evidence.comparisons.length,modules=new Set(evidence.comparisons.map(item=>item.module)).size;
      put('fair-comparison',count,2,Math.min(2,count)+' de 2 comparaciones diferentes.');if(count>=2)award('fair-comparison',newIds);
      put('single-variable',Math.min(count,3)+Math.min(modules,2),5,Math.min(count,3)+'/3 comparaciones · '+Math.min(modules,2)+'/2 laboratorios.');if(count>=3&&modules>=2)award('single-variable',newIds);
      const series=MODULES.reduce((sum,module)=>sum+Math.min(2,evidence.comparisons.filter(item=>item.module===module).length),0);
      put('comparison-series',series,6,series+' de 6 comparaciones (dos por laboratorio).');if(series===6)award('comparison-series',newIds);
      const micro=evidence.microscopy['imagej-fluorescent-cells']||{focus:[]};
      put('microscopy-reader',Math.min(3,micro.focus.length)+Number(!!micro.source)+Number(!!micro.license),5,Math.min(3,micro.focus.length)+'/3 enfoques · fuente '+(micro.source?'consultada':'pendiente')+' · licencia '+(micro.license?'consultada':'pendiente')+'.');
      if(micro.focus.length>=3&&micro.source&&micro.license)award('microscopy-reader',newIds);
      for(const [id,required] of [
        ['master-microtubules',['microtubule-growth','dynamic-instability','mt-supply-control','mt-stabilization']],
        ['master-actin',['branched-actin','actin-parent-control','actin-turnover','actin-cortex']],
        ['master-transport',['cargo-in-motion','two-directions','repaired-route','transport-motor','transport-route','transport-direction']],
        ['integrated-researcher',['master-microtubules','master-actin','master-transport','comparison-series','microscopy-reader']]
      ])milestone(id,Object.keys(unlocked),required,newIds);
    }
    function freshRun(id,s){return {id,module:s.module,start:s.time,last:s.time,initialLength:number(s.metrics.totalLength),initialCount:s.metrics.count,initialDistance:number(s.metrics.distance),initialCatastrophes:number(s.metrics.catastrophes),initialRescues:number(s.metrics.rescues),initialBirths:number(s.metrics.births),recipe:null,previous:new Map(),travel:new Map(),blocked:new Map(),repaired:new Map(),deliveredRepairs:new Set(),recovery:null,lastTubulin:s.parameters.tubulin,suppliedSince:s.parameters.tubulin>0&&s.metrics.count>0?s.time:null};}
    function observe(input={}) {
      const before=JSON.stringify(evidence),newIds=[],s=input.snapshot,action=input.action||{},runId=typeof input.runId==='string'||finite(input.runId)?String(input.runId):null;
      if(validSnapshot(s)&&runId!==null){
        if(!current||current.id!==runId||current.module!==s.module||s.time<current.last-1e-8||action.type==='reset'){current=freshRun(runId,s);progress={};}
        const run=current,m=s.metrics,p=s.parameters,elapsed=s.time-run.start,gain=number(m.totalLength)-run.initialLength;
        const changed=s.module==='transport'?number(m.distance)-run.initialDistance>.1:Math.abs(gain)>.1||number(m.births)-run.initialBirths>=2;
        if(run.recipe&&run.recipe!==s.module+':'+canonical(p))run.recipe=null;
        if(action.type==='combine'&&typeof action.recipeId==='string'&&Array.isArray(action.ingredients)&&new Set(action.ingredients.filter(item=>typeof item==='string'&&item.trim())).size>=2&&elapsed<1e-8)run.recipe=s.module+':'+canonical(p);
        if(run.recipe){put('first-combination',Math.min(elapsed/8,changed?1:0),1,'Observa 8 segundos y espera un cambio visible en la combinación.');if(elapsed>=8&&changed)award('first-combination',newIds);}
        if(elapsed>=12&&changed){if(!evidence.labs.includes(s.module))evidence.labs.push(s.module);if(run.recipe)record('recipes',s.module,run.recipe);}
        if(elapsed>=30&&changed&&!evidence.longLabs.includes(s.module))evidence.longLabs.push(s.module);
        if(s.module==='microtubules'){
          put('microtubule-growth',Math.min(elapsed/12,Math.max(0,gain)/.3),1,'Observa 12 segundos y espera a que la red se extienda.');if(elapsed>=12&&gain>=.3&&m.count>0)award('microtubule-growth',newIds);
          const c=number(m.catastrophes)-run.initialCatastrophes,r=number(m.rescues)-run.initialRescues;
          put('dynamic-instability',Math.min(elapsed/12,c/3,r/2),1,Math.min(3,c)+'/3 catástrofes · '+Math.min(2,r)+'/2 rescates · '+Math.min(12,Math.floor(elapsed))+'/12 s.');if(elapsed>=12&&c>=3&&r>=2)award('dynamic-instability',newIds);
          if(run.initialCount===0){put('mt-from-nothing',Math.min(elapsed/12,(number(m.births)-run.initialBirths)/3),1,'Inicio sin filamentos: observa la formación de una red durante 12 segundos.');if(elapsed>=12&&number(m.births)-run.initialBirths>=3&&m.count>=3)award('mt-from-nothing',newIds);}
          if(p.tubulin>0&&m.count>0&&run.suppliedSince===null)run.suppliedSince=s.time;
          if(p.tubulin===0&&run.lastTubulin>0&&run.suppliedSince!==null&&s.time-run.suppliedSince>=5&&m.count>0&&!run.recovery)run.recovery={stage:'depleting',at:s.time,length:number(m.totalLength)};
          if(p.tubulin===0||m.count===0)run.suppliedSince=null;
          if(run.recovery?.stage==='depleting'&&p.tubulin>0)run.recovery=null;
          if(run.recovery?.stage==='regrowing'&&p.tubulin<.5)run.recovery=null;
          const recovery=run.recovery;
          if(recovery?.stage==='depleting'&&s.time-recovery.at>=5&&p.tubulin===0&&number(m.totalLength)<recovery.length-.2){recovery.stage='depleted';recovery.low=number(m.totalLength);}
          if(recovery?.stage==='depleted'&&p.tubulin>=.5){recovery.stage='regrowing';recovery.at=s.time;recovery.low=number(m.totalLength);}
          if(recovery?.stage==='regrowing'&&s.time-recovery.at>=5&&p.tubulin>=.5&&number(m.totalLength)>recovery.low+.3)award('network-recovery',newIds);
          put('network-recovery',recovery?recovery.stage==='regrowing'?2:1:0,3,recovery?.stage==='regrowing'?'Tubulina repuesta: sigue la red durante 5 segundos hasta que crezca.':recovery?'Espera a que la red se acorte sin tubulina; después repón tubulina.':'Observa una red durante 5 segundos y retira la tubulina sin reiniciar.');
          run.lastTubulin=p.tubulin;
        }
        if(s.module==='actin'){
          const byId=new Map(s.filaments.map(f=>[f.id,f])),branches=s.filaments.filter(f=>f.parentId!=null&&number(f.length)>0&&number(byId.get(f.parentId)?.length)>0).length;
          put('branched-actin',Math.min(elapsed/12,branches/3),1,Math.min(3,branches)+'/3 ramas con progenitor · '+Math.min(12,Math.floor(elapsed))+'/12 s.');if(elapsed>=12&&branches>=3)award('branched-actin',newIds);
        }
        if(s.module==='transport'){
          const routes=new Map(s.routes.map(route=>[route.id,route]));let plus=0,minus=0;
          for(const cargo of s.vesicles){
            if(!cargo||typeof cargo.id!=='string'||!finite(cargo.position))continue;
            const previous=run.previous.get(cargo.id),route=routes.get(cargo.route);
            if(cargo.state==='blocked'&&s.time>run.start)run.blocked.set(cargo.id,{position:cargo.position,route:cargo.route,time:s.time});
            if(action.type==='repair'&&previous?.state==='blocked'&&run.blocked.has(cargo.id)&&route?.intact===true)run.repaired.set(cargo.id,{...run.blocked.get(cargo.id),at:s.time});
            const travel=run.travel.get(cargo.id)||{plus:0,minus:0};
            if(previous&&previous.motor===cargo.motor&&s.time>run.last){const delta=cargo.position-previous.position;if(cargo.motor==='kinesin1'&&delta>0)travel.plus+=delta;if(cargo.motor==='dynein1'&&delta<0)travel.minus-=delta;}
            run.travel.set(cargo.id,travel);plus=Math.max(plus,travel.plus);minus=Math.max(minus,travel.minus);
            const repaired=run.repaired.get(cargo.id);
            if(repaired&&cargo.state==='delivered'&&cargo.route===repaired.route&&s.time>repaired.at&&Math.abs(cargo.position-repaired.position)>.01&&route?.intact===true)run.deliveredRepairs.add(cargo.id);
            run.previous.set(cargo.id,{position:cargo.position,motor:cargo.motor,state:cargo.state});
          }
          const delivered=s.vesicles.filter(c=>c.state==='delivered'&&number(c.distance)>.1).length;
          put('cargo-in-motion',Math.min(elapsed/12,delivered/3),1,Math.min(3,delivered)+'/3 cargas entregadas · '+Math.min(12,Math.floor(elapsed))+'/12 s.');if(elapsed>=12&&delivered>=3&&changed)award('cargo-in-motion',newIds);
          put('two-directions',Math.min(elapsed/10,plus/.15,minus/.15),1,(plus>=.15?'Cinesina observada. ':'Sigue la cinesina. ')+(minus>=.15?'Dineína observada. ':'Sigue la dineína. ')+Math.min(10,Math.floor(elapsed))+'/10 s.');if(elapsed>=10&&plus>=.15&&minus>=.15)award('two-directions',newIds);
          put('repaired-route',run.deliveredRepairs.size?3:run.repaired.size?2:run.blocked.size?1:0,3,run.deliveredRepairs.size?'Carga entregada; completa al menos 12 segundos de observación.':run.repaired.size?'Ruta reparada: sigue a la misma carga hasta el destino.':run.blocked.size?'Carga bloqueada: repara su ruta sin reiniciar.':'Primero observa una carga bloqueada.');if(elapsed>=12&&run.deliveredRepairs.size)award('repaired-route',newIds);
        }
        run.last=s.time;
      }
      if(action.type==='compare'){
        const comparison=action.comparison||action,a=comparison.a,b=comparison.b;
        if(validSnapshot(a)&&validSnapshot(b)&&a.module===b.module&&a.time>=20&&Math.abs(a.time-b.time)<1e-7&&a.seed===b.seed){
          const changed=[...new Set([...Object.keys(a.parameters),...Object.keys(b.parameters)])].filter(key=>a.parameters[key]!==b.parameters[key]);
          const key=changed[0],av=a.parameters[key],bv=b.parameters[key],substantial=typeof av==='number'&&typeof bv==='number'?Math.abs(av-bv)>=.15:typeof av==='string'&&typeof bv==='string';
          if(changed.length===1&&substantial){
            record('comparisons',a.module,a.module+':'+[canonical(a.parameters),canonical(b.parameters)].sort().join('|'));
            const low=av<bv?a:b,high=av<bv?b:a,L=low.metrics,H=high.metrics,lo=low.parameters,hi=high.parameters;
            const conditions={
              'mt-supply-control':a.module==='microtubules'&&key==='tubulin'&&number(H.totalLength)>number(L.totalLength)+.3,
              'mt-stabilization':a.module==='microtubules'&&key==='stabilization'&&number(H.catastrophes)<number(L.catastrophes),
              'actin-parent-control':a.module==='actin'&&key==='initialSeeds'&&lo.initialSeeds===0&&hi.initialSeeds>0&&lo.nucleation===0&&lo.branching>0&&number(L.branches)===0&&number(H.branches)>0,
              'actin-turnover':a.module==='actin'&&key==='turnover'&&lo.monomers===0&&lo.initialSeeds>0&&number(H.totalLength)<number(L.totalLength)-.2,
              'actin-cortex':a.module==='actin'&&key==='cortical'&&number(H.corticalFraction)>number(L.corticalFraction)+.1,
              'transport-motor':a.module==='transport'&&key==='motorAvailability'&&lo.motorAvailability===0&&number(L.distance)===0&&number(H.distance)>.1,
              'transport-route':a.module==='transport'&&key==='networkAvailability'&&lo.networkAvailability===0&&number(L.distance)===0&&number(H.distance)>.1,
              'transport-direction':a.module==='transport'&&key==='motor'&&new Set([av,bv]).has('kinesin1')&&new Set([av,bv]).has('dynein1')&&number((av==='kinesin1'?a:b).metrics.displacement)>.1&&number((av==='dynein1'?a:b).metrics.displacement)<-.1,
              'transport-speed':a.module==='transport'&&key==='speed'&&lo.speed===0&&number(L.distance)===0&&number(H.distance)>.1
            };
            for(const [id,met] of Object.entries(conditions))if(met)award(id,newIds);
          }
        }
      }
      if(['microscopy-observed','microscopy-source'].includes(action.type)&&action.id==='imagej-fluorescent-cells'){
        const entry=evidence.microscopy[action.id]||(evidence.microscopy[action.id]={focus:[],source:false,license:false});
        if(action.type==='microscopy-observed'&&finite(action.elapsedMs)&&action.elapsedMs>=8000&&['cytoskeleton','actin','microtubules','nucleus'].includes(action.focus)&&!entry.focus.includes(action.focus))entry.focus.push(action.focus);
        if(action.type==='microscopy-source'&&['source','license'].includes(action.kind))entry[action.kind]=true;
      }
      cumulative(newIds);if(newIds.length||before!==JSON.stringify(evidence))save();
      const notice=JSON.stringify({unlocked,progress,persisted});if(notice!==lastNotice){lastNotice=notice;for(const listener of listeners){try{listener(getState(),{type:'observe',unlocked:newIds.slice()});}catch{}}}
      return {state:getState(),unlocked:newIds};
    }
    function subscribe(listener){if(typeof listener!=='function')throw new TypeError('subscribe necesita una función.');listeners.add(listener);return()=>listeners.delete(listener);}
    function reset(){unlocked={};progress={};current=null;evidence={recipes:[],comparisons:[],labs:[],longLabs:[],microscopy:{}};save();cumulative([]);lastNotice='';for(const listener of listeners){try{listener(getState(),{type:'reset',unlocked:[]});}catch{}}return getState();}
    cumulative([]);
    return {observe,getState,subscribe,reset};
  }
  root.CELMA_ACHIEVEMENTS=definitions;root.CelmaAchievements={create,definitions,version:VERSION};
})(typeof window!=='undefined'?window:globalThis);
