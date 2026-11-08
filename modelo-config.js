/* Modelo aportado por el usuario. Las zonas pueden configurarse desde el visor. */
window.CELMA_MODEL_URL = 'modelos/citoesqueleto.glb';
// Zonas aproximadas según la descripción del usuario: red inferior de actina,
// trama central de filamentos intermedios y recorridos horizontales de microtúbulos.
// Centros situados sobre la geometría. Son referencias editables, no una
// segmentación anatómica de la malla ni una identificación de mitocondrias.
window.CELMA_MODEL_REGIONS = [
  {id:'actina-inferior-1',component:'actin',name:'Actina · red inferior 1',point:[0.286,-0.341,0.710],radius:0.11},
  {id:'actina-inferior-2',component:'actin',name:'Actina · red inferior 2',point:[0.069,-0.380,0.617],radius:0.11},
  {id:'actina-inferior-3',component:'actin',name:'Actina · red inferior 3',point:[0.612,-0.334,0.158],radius:0.11},
  {id:'intermedios-centrales-1',component:'intermediate',name:'Intermedios · trama central 1',point:[0.580,-0.122,0.258],radius:0.12},
  {id:'intermedios-centrales-2',component:'intermediate',name:'Intermedios · trama central 2',point:[-0.533,0.004,0.641],radius:0.12},
  {id:'intermedios-centrales-3',component:'intermediate',name:'Intermedios · trama central 3',point:[0.104,0.053,0.734],radius:0.12},
  {id:'microtubulos-horizontales-1',component:'microtubules',name:'Microtúbulos · recorrido horizontal 1',point:[-0.097572,0.250152,0.385803],radius:0.15},
  {id:'microtubulos-horizontales-2',component:'microtubules',name:'Microtúbulos · recorrido horizontal 2',point:[0.195774,-0.029635,-0.059187],radius:0.15},
  {id:'microtubulos-horizontales-3',component:'microtubules',name:'Microtúbulos · recorrido horizontal 3',point:[0.067992,-0.102773,0.494942],radius:0.15}
];
window.CELMA_MODEL_NOTE = 'Zonas de referencia aproximadas según tu descripción: microtúbulos horizontales, actina en la red inferior y filamentos intermedios en la trama central. Puedes ajustarlas señalando nuevas zonas.';
