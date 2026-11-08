/* Activos externos: licencia individual CC0 comprobada en la ficha Cell de OrganUI.
 * El motor de simulación y el fibroblasto principal no dependen de estas referencias.
 */
(() => {
  'use strict';
  const common={author:'OrganUI',sourceURL:'https://organui.com/docs/components/cell',license:'CC0 1.0',licenseURL:'https://creativecommons.org/publicdomain/zero/1.0/',scientificLevel:'Modelo educativo esquemático; no reconstrucción experimental.',scaleNote:'Unidades de escena sin calibración biológica. El visor reencuadra cada referencia; su tamaño en pantalla no indica una escala real.',attribution:'OrganUI animal cell schematic model, dedicated to the public domain under CC0 1.0.'};
  window.CELMA_REFERENCE_MODELS=[
    {...common,id:'organui-cell',label:'Célula animal · OrganUI',component:'all',src:'modelos/referencias/organui-celula.glb',offlineSrc:'modelos/referencias/organui-celula-local.js',description:'Célula animal de referencia con 15 estructuras identificadas por el autor. Es una organización genérica que incluye microvellosidades y no representa el fibroblasto del laboratorio. Se conserva el GLB original sin modificaciones.',bytes:2670840},
    {...common,id:'organui-mitochondria',label:'Mitocondrias · OrganUI',component:'mitochondria',src:'modelos/referencias/organui-mitocondrias.glb',offlineSrc:'modelos/referencias/organui-mitocondrias-local.js',description:'Conjunto de mitocondrias aislado del modelo esquemático externo. La disposición y la forma se conservaron; no son una reconstrucción de microscopía ni un recuento celular real.',bytes:115828},
    {...common,id:'organui-golgi',label:'Aparato de Golgi · OrganUI',component:'golgi',src:'modelos/referencias/organui-golgi.glb',offlineSrc:'modelos/referencias/organui-golgi-local.js',description:'Aparato de Golgi aislado de la célula esquemática de OrganUI. La geometría original se conserva sin ajustar a mediciones de cisternas o transporte.',bytes:197344},
    {...common,id:'organui-centrosome',label:'Centrosoma · OrganUI',component:'centrosome',src:'modelos/referencias/organui-centrosoma.glb',offlineSrc:'modelos/referencias/organui-centrosoma-local.js',description:'Representación externa del centrosoma, aislada para observación. Resume su organización; no permite deducir resolución molecular ni dimensiones biológicas.',bytes:27160}
  ];
})();
