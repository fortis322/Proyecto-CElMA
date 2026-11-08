/* Recorridos del modelo celular: observación guiada, no simulaciones moleculares.
 * Los mecanismos resumidos se apoyan en las fuentes del catálogo existente.
 */
(() => {
  'use strict';
  const config=window.CELMA_CELL_CONFIG;
  if(!config?.organelles?.length)return;
  const step=(title,text,focus)=>({title,text,focus});
  const quiz=(question,answers,correct,explanation)=>({question,answers,correct,explanation});
  const content={
    cytoskeleton:{
      steps:[
        step('Reconoce tres redes','Actina, microtúbulos y filamentos intermedios forman sistemas distintos. Los colores del modelo ayudan a reconocerlos; sus grosores están aumentados para que puedan verse juntos.',['actin','microtubules','intermediate']),
        step('Sitúa cada organización','En este fibroblasto, la actina aparece en el córtex y en haces basales, muchos microtúbulos se organizan desde una región centrosomal y la vimentina forma una red central. Otros tipos celulares presentan organizaciones diferentes.',['actin','microtubules','intermediate','centrosome']),
        step('Conecta forma y función','Las redes contribuyen a fuerzas, resistencia y organización del transporte. Ninguna familia actúa sola: los mecanismos dependen de motores, adaptadores, anclajes y regulación. Los procesos y el laboratorio permiten explorar estas diferencias.',['actin','microtubules','intermediate','vesicles'])
      ],
      quiz:quiz('¿Qué afirmación describe mejor al citoesqueleto?',['Todas sus redes son tubos idénticos.','Sus tres familias tienen propiedades y funciones diferentes.','Sólo existe durante la división celular.'],1,'Actina, microtúbulos e IF tienen composición y organización diferentes y participan también en células en interfase.'),process:'actin-growth'
    },
    membrane:{
      steps:[
        step('Localiza el límite celular','La membrana plasmática delimita el citoplasma. Aquí se representa como una superficie transparente y aplanada para observar el interior; su transparencia y su contorno son recursos didácticos.',['membrane']),
        step('Piensa en un límite selectivo','La bicapa lipídica y sus proteínas regulan intercambios y reciben señales. La permeabilidad no es igual para todas las sustancias; el modelo no resuelve canales, transportadores ni gradientes.',['membrane']),
        step('Relaciona superficie y soporte','La actina cortical y las proteínas de anclaje contribuyen a organizar la superficie. Una conexión funcional no significa que todos los filamentos contacten directamente con la membrana.',['membrane','actin'])
      ],
      quiz:quiz('¿Cuál es una propiedad de la membrana plasmática?',['Es una pared rígida universal de las células animales.','Deja pasar por igual cualquier molécula.','Su permeabilidad depende de la bicapa y de proteínas específicas.'],2,'La bicapa y las proteínas de membrana permiten un intercambio selectivo; una célula animal no posee una pared celular rígida como la de una planta.')
    },
    nucleus:{
      steps:[
        step('Reconoce un compartimento','El núcleo contiene la mayor parte del ADN del fibroblasto. Su posición elevada y excéntrica permite distinguirlo del citoplasma periférico más delgado. El volumen mostrado es orientativo.',['nucleus']),
        step('Distingue ADN y actividad nuclear','La transcripción y el procesamiento de ARN forman parte de la actividad nuclear. El modelo no representa genes individuales ni permite deducir su expresión a partir del color del núcleo.',['nucleus','nucleolus']),
        step('Observa el intercambio regulado','Durante la interfase, la envoltura separa núcleo y citoplasma y sus poros permiten un intercambio regulado. El soporte alrededor del núcleo implica redes y adaptadores; no son filamentos atravesando libremente la envoltura.',['nucleus','nuclearEnvelope','intermediate'])
      ],
      quiz:quiz('En esta célula en interfase, ¿qué separa nucleoplasma y citoplasma?',['La envoltura nuclear con sus poros.','Una pared de microtúbulos impermeable.','La membrana de una mitocondria.'],0,'La envoltura nuclear delimita el núcleo y contiene poros que regulan el tráfico de moléculas entre ambos compartimentos.')
    },
    nucleolus:{
      steps:[
        step('Encuéntralo dentro del núcleo','El nucléolo es una región nuclear sin membrana propia. La esfera coloreada sólo indica su localización: no debe interpretarse como una vesícula delimitada por una bicapa.',['nucleolus','nucleus']),
        step('Relaciona ARN y ensamblaje','En el nucléolo se produce y procesa gran parte del ARN ribosomal y se ensamblan subunidades ribosómicas. Esto es distinto de traducir proteínas en un ribosoma.',['nucleolus']),
        step('Sigue una relación funcional','Las subunidades ribosómicas maduran y se exportan hacia el citoplasma mediante procesos regulados. La relación nucléolo–ribosomas no significa que el nucléolo sea una fábrica de proteínas terminadas.',['nucleolus','nuclearEnvelope','ribosomes'])
      ],
      quiz:quiz('¿Qué distingue al nucléolo?',['Tiene una doble membrana independiente.','Participa en la formación de subunidades ribosómicas y carece de membrana propia.','Es el compartimento donde se produce todo el ATP celular.'],1,'El nucléolo organiza procesos de biogénesis ribosómica; no está rodeado por una membrana y no sustituye a las mitocondrias.')
    },
    nuclearEnvelope:{
      steps:[
        step('Observa la cubierta nuclear','La envoltura nuclear está formada por dos membranas. La geometría del visor resume esta organización y exagera los poros; no resuelve dos bicapas con detalle molecular.',['nuclearEnvelope','nucleus']),
        step('Comprende el papel de los poros','Los complejos de poro permiten intercambio regulado de proteínas y ARN entre núcleo y citoplasma. No son agujeros por los que cualquier estructura pueda atravesar sin control.',['nuclearEnvelope']),
        step('Reconoce continuidad y soporte','La membrana nuclear externa continúa con el RE. Las láminas nucleares y las redes de vimentina citoplásmica son IF diferentes, conectados al entorno nuclear mediante sistemas de anclaje.',['nuclearEnvelope','roughER','intermediate'])
      ],
      quiz:quiz('¿Con qué estructura continúa la membrana nuclear externa?',['Con el interior de un lisosoma.','Con la membrana interna mitocondrial.','Con el retículo endoplasmático.'],2,'La membrana externa de la envoltura nuclear es continua con el sistema del RE; las otras estructuras pertenecen a compartimentos diferentes.')
    },
    mitochondria:{
      steps:[
        step('Reconoce formas tubulares','Las mitocondrias pueden ser tubulares, ramificadas o más compactas. Los ejemplos distribuidos por el citoplasma no constituyen un recuento real ni una red mitocondrial reconstruida.',['mitochondria']),
        step('Observa dos membranas','La membrana interna forma crestas y alberga maquinaria de fosforilación oxidativa. Algunas superficies se abren didácticamente para mostrar pliegues; no se está observando una mitocondria rota en un experimento.',['mitochondria']),
        step('Relaciona distribución y transporte','Motores, microtúbulos y mecanismos de anclaje contribuyen a la distribución de mitocondrias según el contexto celular. No todas se desplazan simultáneamente ni se mueven sólo por tocar un filamento.',['mitochondria','microtubules'])
      ],
      quiz:quiz('¿Dónde se sitúa la maquinaria de fosforilación oxidativa?',['En la membrana interna mitocondrial.','En el exterior del nucléolo.','Únicamente en los filamentos intermedios.'],0,'La cadena respiratoria y la ATP sintasa se asocian a la membrana interna. El modelo sólo representa su organización general, no calcula producción de ATP.')
    },
    roughER:{
      steps:[
        step('Localiza cisternas perinucleares','El RE rugoso suele incluir cisternas cercanas al núcleo. Forma parte de un sistema de membranas continuo; la representación del visor resume su conectividad y sus dimensiones.',['roughER','nuclearEnvelope']),
        step('Identifica la cara con ribosomas','Los ribosomas asociados se encuentran en la cara citosólica. Sintetizan proteínas que entran en la vía secretora o en determinadas membranas, junto con mecanismos de direccionamiento y translocación.',['roughER','ribosomes']),
        step('Relaciona RE y Golgi','El RE participa en síntesis, plegamiento y control de calidad de proteínas de esta vía. El transporte hacia el Golgi requiere clasificación y portadores; no es un paso indiscriminado de cualquier proteína.',['roughER','golgi','vesicles'])
      ],
      quiz:quiz('¿Dónde se encuentran los ribosomas asociados al RE rugoso?',['En la luz del núcleo.','En su cara citosólica.','Dentro de la membrana interna de las mitocondrias.'],1,'Los ribosomas están en la cara citosólica del RE y se asocian según la traducción y el direccionamiento de las proteínas.')
    },
    smoothER:{
      steps:[
        step('Sigue una red tubular','Los dominios lisos del RE son frecuentemente tubulares y no presentan ribosomas adheridos. Son parte del sistema de RE, no un compartimento aislado que siempre tenga forma esférica.',['smoothER']),
        step('Distingue funciones según el contexto','El metabolismo lipídico y el manejo de calcio son funciones del RE. Su especialización varía con el tipo celular; no se atribuyen al fibroblasto todas las funciones de células musculares o hepáticas.',['smoothER']),
        step('Relaciona continuidad y organización','RE liso y rugoso son dominios de una red continua. La organización de sus túbulos también se relaciona con el citoesqueleto y con otras proteínas que dan forma a membranas.',['smoothER','roughER','microtubules'])
      ],
      quiz:quiz('¿Qué afirmación sobre el RE liso es correcta?',['Es siempre independiente del RE rugoso.','Está recubierto necesariamente de ribosomas.','Puede formar dominios tubulares continuos con el resto del RE.'],2,'Las regiones lisas y rugosas son dominios del sistema de RE; la ausencia de ribosomas adheridos ayuda a distinguir las regiones lisas.')
    },
    golgi:{
      steps:[
        step('Reconoce cisternas apiladas','El Golgi se representa con cisternas curvas cerca del núcleo. Su posición es representativa de muchas células de mamífero; la geometría no mide el número real de cisternas.',['golgi']),
        step('Piensa en modificación y clasificación','Proteínas y lípidos de la vía secretora se modifican y se clasifican a través del Golgi. Las regiones cis y trans tienen identidades diferentes; no todas las cargas siguen el mismo destino.',['golgi','vesicles']),
        step('Observa una organización compartida','Los microtúbulos y motores como la dineína contribuyen al posicionamiento del Golgi en muchos contextos. Esto no convierte al centrosoma en el único requisito de su organización.',['golgi','microtubules','centrosome'])
      ],
      quiz:quiz('¿Cuál es una función principal del Golgi?',['Modificar y clasificar cargas de la vía secretora.','Albergar la mayor parte del ADN de la célula.','Convertir por sí solo actina soluble en microtúbulos.'],0,'El Golgi participa en el procesamiento y la clasificación de proteínas y lípidos; no almacena el genoma nuclear ni ensambla polímeros de tubulina a partir de actina.')
    },
    ribosomes:{
      steps:[
        step('Encuentra complejos pequeños','Los ribosomas se dibujan como puntos sobredimensionados libres y asociados al RE. En esta escala del modelo no se resuelven sus subunidades ni su estructura molecular.',['ribosomes']),
        step('Relaciona ARN y proteína','Un ribosoma traduce ARN mensajero para sintetizar una cadena polipeptídica. Está formado por ARN y proteínas; no es una pequeña vesícula con membrana.',['ribosomes']),
        step('Distingue ubicación y destino','Ribosomas libres y asociados al RE comparten el mecanismo básico de traducción. El direccionamiento de la proteína naciente determina la asociación al RE y los destinos posteriores.',['ribosomes','roughER','nucleolus'])
      ],
      quiz:quiz('¿Qué proceso realizan los ribosomas?',['Transcribir todo el ADN nuclear.','Traducir ARN mensajero para sintetizar proteínas.','Transportar vesículas caminando por microtúbulos.'],1,'Los ribosomas realizan traducción. La transcripción y el transporte por motores son procesos distintos.')
    },
    lysosomes:{
      steps:[
        step('Localiza compartimentos vesiculares','Los lisosomas son compartimentos de tamaño y morfología variables. Las esferas del modelo son ejemplos esquemáticos, no una regla de forma ni un recuento experimental.',['lysosomes']),
        step('Comprende degradación y reciclaje','Su entorno ácido favorece la actividad de enzimas que degradan materiales. El sistema lisosomal también participa en homeostasis y señalización; no se reduce a una bolsa pasiva de residuos.',['lysosomes']),
        step('Sitúalos en una ruta dinámica','El material puede llegar al sistema endolisosomal por endocitosis y otras vías, incluida autofagia. Endosomas y lisosomas son estados y compartimentos relacionados, no sinónimos intercambiables.',['lysosomes','endosomes','vesicles'])
      ],
      quiz:quiz('¿Qué condición favorece muchas actividades degradativas lisosomales?',['Una pared de celulosa.','Ausencia completa de enzimas.','Un entorno luminal ácido.'],2,'La acidificación del lumen contribuye a la actividad de hidrolasas lisosomales. La regulación y el tráfico también son esenciales para su función.')
    },
    peroxisomes:{
      steps:[
        step('Reconoce otro compartimento','Los peroxisomas se representan como pequeños cuerpos dispersos. No deben identificarse sólo por su forma: en microscopía, distinguirlos requiere marcadores y contexto apropiados.',['peroxisomes']),
        step('Relaciona oxidación y metabolismo','Participan en reacciones oxidativas y metabolismo lipídico. Enzimas como la catalasa contribuyen al manejo de peróxido de hidrógeno, sin que eso implique eliminar todos los oxidantes de la célula.',['peroxisomes']),
        step('Distingue cooperación e identidad','Peroxisomas y mitocondrias pueden cooperar en metabolismo lipídico y homeostasis. Siguen siendo orgánulos distintos con organización y mecanismos propios.',['peroxisomes','mitochondria'])
      ],
      quiz:quiz('¿Qué afirmación describe a los peroxisomas?',['Participan en metabolismo lipídico y reacciones oxidativas.','Son el mismo orgánulo que el nucléolo.','Contienen siempre la mayor parte del ADN celular.'],0,'Los peroxisomas participan en metabolismo y reacciones oxidativas, con enzimas que manejan peróxido. No son nucléolos ni el principal compartimento del genoma.')
    },
    endosomes:{
      steps:[
        step('Ubica compartimentos de tráfico','Los endosomas reciben y clasifican material internalizado. El modelo muestra algunos ejemplos periféricos e internos, pero no identifica cada subtipo por una forma universal.',['endosomes']),
        step('Sigue alternativas de destino','Una carga internalizada puede reciclarse hacia la superficie o dirigirse a degradación, entre otras rutas. La clasificación depende de señales y maquinaria específica.',['endosomes','membrane','lysosomes']),
        step('Relaciona desplazamiento y rutas','Motores y redes del citoesqueleto contribuyen al tráfico y posicionamiento de endosomas. La proximidad entre dos compartimentos en el visor no demuestra que se estén fusionando.',['endosomes','microtubules','vesicles'])
      ],
      quiz:quiz('¿Todo material que entra en un endosoma se degrada inmediatamente?',['Sí, sin posibilidad de clasificación.','No; puede seguir rutas de reciclaje o degradación, entre otras.','No, porque un endosoma sólo contiene ADN.'],1,'El sistema endosomal clasifica cargas. Una parte puede reciclarse y otra progresar hacia compartimentos degradativos, dependiendo de sus señales y contexto.')
    },
    vesicles:{
      steps:[
        step('Reconoce portadores de carga','Las vesículas representadas son ejemplos de portadores membranosos. Sus colores, tamaños y número facilitan la lectura y no indican una carga molecular medida.',['vesicles']),
        step('Distingue transporte y destino','El tráfico requiere selección de carga, formación del portador, desplazamiento y reconocimiento del destino. Llegar cerca de una membrana no implica fusionarse automáticamente con ella.',['vesicles','roughER','golgi']),
        step('Explora rutas polarizadas','En esta red radial de interfase, cinesina-1 y dineína citoplasmática-1 representan transporte hacia extremos más y menos, respectivamente. Otros motores y contextos pueden tener propiedades diferentes.',['vesicles','microtubules','centrosome'])
      ],
      quiz:quiz('¿Qué necesita una vesícula para fusionarse con un destino apropiado?',['Tocar cualquier microtúbulo.','Tener siempre un color naranja.','Mecanismos de reconocimiento y fusión específicos.'],2,'La especificidad de destino depende de maquinaria y señales moleculares. El color del esquema y la cercanía geométrica no determinan una fusión real.')
    },
    centrosome:{
      steps:[
        step('Sitúa una región organizadora','El centrosoma aparece próximo al núcleo. En este modelo, la red MT es principalmente radial y centrosomal, una organización representativa que no cubre todos los tipos celulares.',['centrosome','nucleus']),
        step('Distingue centriolos y material pericentriolar','El centrosoma incluye centriolos y material pericentriolar. La nucleación de muchos microtúbulos se relaciona con complejos del material pericentriolar, no con tubos naciendo indiscriminadamente de las paredes centriolares.',['centrosome','centrioles']),
        step('Observa la polaridad de la red','Los extremos menos de muchos MT quedan próximos a la región organizadora y los más se orientan hacia la periferia. Existen redes y centros organizadores no centrosomales que aquí no se reproducen por completo.',['centrosome','microtubules'])
      ],
      quiz:quiz('¿Con qué se relaciona la nucleación de muchos MT centrosomales?',['Con complejos del material pericentriolar.','Con la membrana interna mitocondrial exclusivamente.','Con moléculas de faloidina del marcador microscópico.'],0,'El material pericentriolar alberga maquinaria de nucleación y anclaje. El centrosoma contiene centriolos, pero no toda nucleación corresponde a sus paredes.')
    },
    centrioles:{
      steps:[
        step('Encuentra el par de cilindros','Los centriolos se representan como dos cilindros próximos dentro de la región centrosomal. Su tamaño está exagerado y el visor no resuelve su ultrastructura completa.',['centrioles','centrosome']),
        step('Distingue su arquitectura','Los centriolos animales presentan típicamente una organización de nueve tripletes de microtúbulos. Esa organización estable es diferente de las rutas largas de MT citoplásmicos que cambian de longitud.',['centrioles']),
        step('Relaciona estructura y organización','Los centriolos contribuyen a organizar el centrosoma; el material pericentriolar participa en nucleación y anclaje. El modelo muestra interfase y no simula duplicación centriolar ni formación completa del huso.',['centrioles','centrosome','microtubules'])
      ],
      quiz:quiz('¿Qué organización se asocia típicamente con un centriolo animal?',['Una bicapa de actina soluble.','Nueve tripletes de microtúbulos.','Una pila de cisternas del Golgi.'],1,'La organización de nueve tripletes caracteriza típicamente a los centriolos. No es la misma estructura que una pila del Golgi ni una red cortical de actina.')
    },
    microtubules:{
      steps:[
        step('Reconoce una red de tubulina','Los MT son polímeros polarizados de tubulina. Aquí aparecen como tubos engrosados que recorren el citoplasma y evitan el volumen nuclear.',['microtubules']),
        step('Distingue estados y transiciones','Un MT puede crecer o acortar. Una catástrofe es el cambio hacia acortamiento; un rescate lo devuelve al crecimiento. No deben confundirse estos eventos con cualquier cambio de longitud.',['microtubules','centrosome']),
        step('Relaciona red y transporte','Los motores usan MT como rutas, con polaridad y regulación específicas. El laboratorio calcula longitudes y transporte con parámetros normalizados; no mide constantes del fibroblasto real.',['microtubules','vesicles','mitochondria'])
      ],
      quiz:quiz('¿Qué significa una catástrofe de un microtúbulo?',['Cualquier llegada al borde geométrico.','La formación de una rama de actina.','Una transición desde crecimiento hacia acortamiento.'],2,'La catástrofe es una transición dinámica. En el laboratorio, alcanzar el borde limita la elongación, pero no cuenta por sí solo como una catástrofe.'),process:'micro-growth'
    },
    actin:{
      steps:[
        step('Identifica córtex y haces','Los microfilamentos de actina contribuyen al córtex celular y a haces basales del fibroblasto. El visor exagera su grosor para diferenciarlos de otras redes.',['actin','membrane']),
        step('Relaciona ensamblaje y organización','La disponibilidad de monómeros, la nucleación y las proteínas organizadoras influyen en las redes. La ramificación asociada a Arp2/3 necesita filamentos progenitores y no describe toda la actina celular.',['actin']),
        step('Distingue fuerza y movimiento','Actina y miosinas contribuyen a contracción y movimientos locales; la migración requiere además adhesión y coordinación. Una red más grande no demuestra por sí sola mayor velocidad de migración real.',['actin','membrane','vesicles'])
      ],
      quiz:quiz('Para formar una rama en el modelo didáctico de actina, ¿qué se necesita?',['Un filamento progenitor elegible y monómeros disponibles.','Un lisosoma que se convierta directamente en actina.','Únicamente cambiar el color del visor.'],0,'La ramificación modelada requiere un progenitor y monómeros. Nucleación primaria, elongación y ramificación se representan como reglas distintas.'),process:'actin-growth'
    },
    intermediate:{
      steps:[
        step('Reconoce una red central','El modelo representa vimentina citoplásmica, característica de células mesenquimales como fibroblastos. No todas las células expresan la misma familia de filamentos intermedios.',['intermediate']),
        step('Relaciona estructura y resistencia','Los IF contribuyen a resistencia mecánica e integridad. A diferencia de actina y MT, no constituyen rutas polarizadas con extremos más y menos para motores equivalentes.',['intermediate']),
        step('Distingue redes y adaptadores','La relación con adhesiones y entorno nuclear puede implicar plectina y otros adaptadores. Vimentina citoplásmica y láminas nucleares son proteínas y redes diferentes.',['intermediate','nuclearEnvelope'])
      ],
      quiz:quiz('¿Qué afirmación sobre los filamentos intermedios es correcta?',['Todos son vimentina en cualquier célula.','Contribuyen a integridad mecánica y no forman una ruta polarizada equivalente a los MT.','Son los poros de la envoltura nuclear.'],1,'Existen distintas familias de IF. La vimentina representada contribuye a organización mecánica y se conecta con otras estructuras mediante adaptadores.'),process:'intermediate'
    }
  };
  const studies=config.organelles.map(item=>({id:item.id,title:item.label,components:item.components||[item.id],intro:item.intro,sources:item.sources||[],...content[item.id]})).filter(item=>item.steps?.length===3);
  window.CELMA_ORGANELLE_STUDIES=studies;
  if(!window.CelmaWorkspace)return;
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const panel=make('section','cell-feature-panel organelle-study-panel');panel.id='organelle-study-panel';
  panel.innerHTML='<p class="cell-kicker">RECORRIDOS GUIADOS · MODELO ESQUEMÁTICO</p><h2>Cada estructura tiene una función</h2><p>Elige un organelo y sigue tres pasos para reconocerlo y relacionarlo con el resto de esta célula en interfase.</p><div class="organelle-study-toolbar"><label>Estructura <select id="organelle-study-select"></select></label><span id="organelle-study-position"></span></div><div id="organelle-study-steps" class="organelle-study-steps" role="group" aria-label="Pasos del recorrido"></div><div class="organelle-study-story"><h3 id="organelle-study-title"></h3><p id="organelle-study-text"></p></div><div class="cell-actions"><button type="button" id="organelle-study-previous">Anterior</button><button type="button" id="organelle-study-next">Siguiente</button><button type="button" id="organelle-study-frame">Acercar estructura</button><button type="button" id="organelle-study-return">Volver a la célula completa</button></div>';
  const detail=make('section','organelle-study-detail');detail.id='organelle-study-detail';detail.hidden=true;
  detail.innerHTML='<p class="cell-kicker">COMPRUEBA UNA IDEA</p><h3 id="organelle-study-question"></h3><div id="organelle-study-answers" class="organelle-study-answers" role="group" aria-label="Respuestas a la pregunta conceptual"></div><p id="organelle-study-feedback" role="status" aria-live="polite"></p><a id="organelle-study-process" class="organelle-study-process" hidden>Ver el proceso del citoesqueleto →</a><p class="organelle-study-scope">Los colores, grosores y posiciones son ayudas didácticas. Este recorrido no simula tasas de síntesis, producción de ATP, expresión génica ni otras mediciones del organelo.</p><div class="cell-sources" id="organelle-study-sources"></div>';
  document.querySelector('#scene-legend').after(detail);
  const $=selector=>panel.querySelector(selector)||detail.querySelector(selector);
  let current=studies[0],stepIndex=0,answer=null,active=false,view=null,savedFocus=null;
  function focus({camera=false}={}){
    if(!active||!view)return;
    const keys=current.steps[stepIndex].focus||current.components;
    view.setScientificFocus(keys);
    if(camera)view.focusComponent(current.id==='cytoskeleton'?'microtubules':current.id);
  }
  function renderStep(){
    const entry=current.steps[stepIndex];
    $('#organelle-study-select').value=current.id;
    $('#organelle-study-position').textContent='Paso '+(stepIndex+1)+' de 3';
    $('#organelle-study-title').textContent=entry.title;$('#organelle-study-text').textContent=entry.text;
    $('#organelle-study-previous').disabled=stepIndex===0;$('#organelle-study-next').disabled=stepIndex===2;
    $('#organelle-study-steps').replaceChildren(...current.steps.map((entry,index)=>{const button=make('button',null,(index+1)+'. '+entry.title);button.type='button';button.setAttribute('aria-pressed',String(index===stepIndex));button.addEventListener('click',()=>{stepIndex=index;renderStep();});return button;}));
    focus();
  }
  function renderQuiz(){
    const q=current.quiz;$('#organelle-study-question').textContent=q.question;
    $('#organelle-study-feedback').textContent=answer===null?'Elige una respuesta. Puedes volver al modelo y a las fuentes antes de decidir.':(answer===q.correct?'Correcto. ':'Revisa esta idea. ')+q.explanation;
    $('#organelle-study-feedback').dataset.correct=answer===null?'pending':String(answer===q.correct);
    $('#organelle-study-answers').replaceChildren(...q.answers.map((text,index)=>{const button=make('button',null,text);button.type='button';button.setAttribute('aria-pressed',String(answer===index));button.addEventListener('click',()=>{answer=index;renderQuiz();});return button;}));
    $('#organelle-study-process').hidden=!current.process;
    if(current.process)$('#organelle-study-process').href='#'+current.process;
    $('#organelle-study-sources').replaceChildren(...current.sources.map(source=>{const a=make('a',null,source.label);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}));
  }
  function select(id,{camera=true}={}){
    const entry=studies.find(item=>item.id===id);if(!entry)return false;
    current=entry;stepIndex=0;answer=null;renderStep();renderQuiz();focus({camera});return true;
  }
  window.CelmaWorkspace.register({id:'organelles',label:'Estructuras 3D',panel,enter:()=>{
    active=true;detail.hidden=false;view=window.CelmaExplorer3D.getViewer();savedFocus=view._focusComponents?[...view._focusComponents]:null;
    const selected=window.CelmaCellUI?.getSelection();select(studies.some(item=>item.id===selected)?selected:current.id);
  },leave:()=>{active=false;detail.hidden=true;view?.setScientificFocus(savedFocus);}});
  $('#organelle-study-select').replaceChildren(...studies.map(item=>{const option=make('option',null,item.title);option.value=item.id;return option;}));
  $('#organelle-study-select').addEventListener('change',()=>select($('#organelle-study-select').value));
  $('#organelle-study-previous').addEventListener('click',()=>{stepIndex=Math.max(0,stepIndex-1);renderStep();});
  $('#organelle-study-next').addEventListener('click',()=>{stepIndex=Math.min(2,stepIndex+1);renderStep();});
  $('#organelle-study-frame').addEventListener('click',()=>focus({camera:true}));
  $('#organelle-study-return').addEventListener('click',()=>window.CelmaWorkspace.setMode('explore'));
  document.addEventListener('celma:model-ready',event=>{view=event.detail.view;if(active)focus();});
  window.CelmaOrganelleStudy={
    open:async id=>{if(!studies.some(item=>item.id===id))return false;await window.CelmaWorkspace.setMode('organelles');return select(id);},
    select,getState:()=>({id:current.id,step:stepIndex,answer,correct:answer===null?null:answer===current.quiz.correct,active})
  };
  select(current.id,{camera:false});
})();
