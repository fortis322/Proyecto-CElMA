/* Ingredientes y condiciones didácticas → parámetros de los motores reales. */
(() => {
  'use strict';
  const ingredient=(id,label,symbol,description,kind='Componente')=>({id,label,symbol,description,kind});
  const has=(ids,id)=>ids.includes(id);
  window.CELMA_SANDBOX={
    microtubules:{label:'Construye una red de microtúbulos',accent:'#3988e4',empty:{tubulin:0,nucleation:0,growth:1,catastrophe:.7,rescue:.7,stabilization:0,initialSeeds:0},ingredients:[
      ingredient('tubulin','Tubulina','● ●','Subunidades disponibles para formar el polímero.'),
      ingredient('nucleator','Sitios de nucleación','✳','Representan la nucleación organizada por material pericentriolar.'),
      ingredient('stabilizer','Estabilización','◇','Condición que reduce la tasa de catástrofe.','Condición'),
      ingredient('catastrophe','Más catástrofes','↘','Aumenta transiciones a acortamiento. No corta de inmediato la red.','Condición'),
      ingredient('rescue','Más rescates','↗','Aumenta transiciones de acortamiento a crecimiento.','Condición')
    ],examples:[{label:'Formar microtúbulos',ids:['tubulin','nucleator']},{label:'Estabilizar la red',ids:['tubulin','nucleator','stabilizer']},{label:'Catástrofe y rescate',ids:['tubulin','nucleator','catastrophe','rescue']}],
      resolve(ids){const t=has(ids,'tubulin'),n=has(ids,'nucleator');return {parameters:{...this.empty,tubulin:t?1.2:0,nucleation:n?1.4:0,stabilization:has(ids,'stabilizer')?1:0,catastrophe:has(ids,'catastrophe')?2:.7,rescue:has(ids,'rescue')?2:.7},explanation:!t?'Sin tubulina disponible no hay elongación ni nuevos microtúbulos. Las otras condiciones no aportan subunidades.':!n?'Hay tubulina, pero esta mesa comienza sin filamentos ni sitios activos de nucleación. Añade sitios de nucleación para iniciar la red.':'Tubulina y sitios de nucleación permiten que aparezcan y crezcan microtúbulos. '+(has(ids,'stabilizer')?'La estabilización reduce la probabilidad de catástrofe; no aumenta por sí sola la elongación. ':'')+(has(ids,'catastrophe')?'La catástrofe cambia un filamento a acortamiento; el rescate puede devolverlo al crecimiento. ':'')+'El resultado concreto depende también del tiempo y de las transiciones del modelo.'};}
    },
    actin:{label:'Da forma a una red de actina',accent:'#13a58e',empty:{monomers:0,nucleation:0,branching:0,turnover:.8,cortical:.5,initialSeeds:0},ingredients:[
      ingredient('monomers','Monómeros de actina','●','Subunidades de actina disponibles para elongar.'),
      ingredient('nucleator','Nucleación primaria','✳','Activa sitios donde pueden iniciarse filamentos.'),
      ingredient('seed','Filamento semilla','━','Introduce un filamento inicial; no aporta monómeros solubles.'),
      ingredient('brancher','Ramificación Arp2/3','⑂','Representación simplificada: necesita un filamento progenitor.'),
      ingredient('turnover','Mayor recambio','↘','Aumenta la pérdida de longitud en este modelo.','Condición'),
      ingredient('cortex','Orientación cortical','◯','Orienta gradualmente los filamentos; no calcula fuerzas.','Condición')
    ],examples:[{label:'Iniciar filamentos',ids:['monomers','nucleator']},{label:'Crear ramas',ids:['monomers','nucleator','brancher']},{label:'Desensamblar una semilla',ids:['seed','turnover']}],
      resolve(ids){const a=has(ids,'monomers'),n=has(ids,'nucleator'),seed=has(ids,'seed'),b=has(ids,'brancher');return {parameters:{...this.empty,monomers:a?1.3:0,nucleation:n?1.2:0,branching:b?2:0,turnover:has(ids,'turnover')?2:.8,cortical:has(ids,'cortex')?1:.5,initialSeeds:seed?2:0},explanation:!a?'Sin monómeros no se alargan ni nacen filamentos. '+(seed?'La semilla presente puede perder longitud por recambio.':'Añadir un ramificador no genera por sí solo una red.') :!n&&!seed?'Hay monómeros, pero no hay nucleación primaria ni semilla. Arp2/3 necesita un filamento progenitor elegible para formar una rama.':'Los monómeros permiten elongar filamentos existentes o iniciados por nucleación. '+(b?'Las ramas aparecen únicamente cuando hay un progenitor suficientemente largo; el ángulo cercano a 70° es un esquema de la vía Arp2/3. ':'')+(has(ids,'cortex')?'La organización cortical cambia gradualmente la orientación. ':'')+'El recambio basal continúa actuando.'};}
    },
    transport:{label:'Abre caminos para las vesículas',accent:'#8d6ac9',empty:{speed:1,integrity:1,motor:'mixed',motorAvailability:0,cargoCount:0,networkAvailability:0},ingredients:[
      ingredient('network','Red de microtúbulos','╱╲','Rutas con extremos menos internos y más periféricos.'),
      ingredient('vesicle','Vesículas','●','Cargas representativas que necesitan rutas y motores.'),
      ingredient('kinesin','Cinesina-1','→','Motor representado hacia el extremo más.'),
      ingredient('dynein','Dineína citoplasmática-1','←','Motor representado hacia el extremo menos.'),
      ingredient('break','Interrupción de rutas','╳','Introduce huecos en un subconjunto de rutas.','Condición')
    ],examples:[{label:'Transporte hacia +',ids:['network','vesicle','kinesin']},{label:'Dos sentidos',ids:['network','vesicle','kinesin','dynein']},{label:'Bloquear y reparar',ids:['network','vesicle','kinesin','dynein','break']}],
      resolve(ids){const net=has(ids,'network'),cargo=has(ids,'vesicle'),k=has(ids,'kinesin'),d=has(ids,'dynein');return {parameters:{...this.empty,networkAvailability:net?1:0,cargoCount:cargo?26:0,motorAvailability:k||d?1:0,motor:k&&d?'mixed':d?'dynein1':'kinesin1',integrity:has(ids,'break')?.3:1},explanation:!cargo?'Todavía no hay cargas en el sistema. Añade vesículas para explorar el transporte.':!net?'Hay cargas, pero no hay rutas de microtúbulos disponibles: no pueden desplazarse sobre una red ausente.':!k&&!d?'Las vesículas tienen rutas, pero esperan un motor activo. La red no las transporta por sí sola.':(k&&d?'La mezcla representa cinesina-1 hacia más y dineína citoplasmática-1 hacia menos. ':d?'La dineína citoplasmática-1 mueve cargas hacia el extremo menos. ':'La cinesina-1 mueve cargas hacia el extremo más. ')+(has(ids,'break')?'Las cargas se detienen al alcanzar un hueco. Pulsa Reparar rutas para restaurar la red en esta misma corrida.':'Las rutas continuas permiten el desplazamiento. No se simula fusión de cargas ni el gasto de ATP.')};}
    }
  };
})();
