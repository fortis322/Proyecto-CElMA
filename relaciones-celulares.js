/*
 * Relaciones del fibroblasto didáctico. Cada registro define participantes,
 * contexto, mecanismo, visualización y bibliografía de manera independiente.
 *
 * animation.from/to son referencias visuales, no afirmaciones de contacto
 * molecular. Las relaciones espaciales/funcionales no deben dibujarse como
 * enlaces físicos. Las escenas division-inset se muestran fuera del modelo
 * base de interfase. Ninguna animación representa una medición experimental.
 */
window.CELMA_RELATIONS = [
  {
    id: 'mt-vesicle-transport',
    component: 'microtubules',
    title: 'Rutas para las vesículas',
    type: 'transport',
    participants: ['microtubules', 'vesicles', 'centrosome'],
    explanation: 'Los microtúbulos proporcionan rutas polarizadas para transportar cargas mediante motores y adaptadores. En la organización radial representada, la cinesina-1 avanza hacia extremos más, generalmente periféricos, y la dineína citoplasmática-1 hacia extremos menos, generalmente internos. Una misma carga puede cambiar de dirección mediante regulación de sus motores. La animación ilustra un recorrido sobre una ruta; no representa todas las familias de cinesinas ni implica que cualquier vesícula se fusione con cualquier compartimento.',
    context: 'interphase',
    animation: { kind: 'transport', from: 'centrosome', to: 'vesicles', motor: 'kinesin1' },
    sources: [
      { label: 'Reck-Peterson et al. · The Cytoplasmic Dynein Transport Machinery and its Many Cargoes', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6457270/' }
    ]
  },
  {
    id: 'mt-mitochondria-distribution',
    component: 'microtubules',
    title: 'Distribución de las mitocondrias',
    type: 'transport',
    participants: ['microtubules', 'mitochondria'],
    explanation: 'Motores asociados a microtúbulos contribuyen al movimiento y la distribución de mitocondrias. Adaptadores, anclajes y regulación local permiten alternar desplazamientos y pausas; las mitocondrias no están obligadas a moverse continuamente ni en una sola dirección. Aquí se ilustra un desplazamiento periférico con cinesina-1 en el contexto radial elegido. La organización de la red, los puntos de anclaje y otras interacciones celulares también influyen en su ubicación, y no se resuelven molecularmente.',
    context: 'interphase',
    animation: { kind: 'transport', from: 'microtubules', to: 'mitochondria', motor: 'kinesin1' },
    sources: [
      { label: 'Cooper · Microtubule Motors and Movements · NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9833/' }
    ]
  },
  {
    id: 'mt-golgi-positioning',
    component: 'microtubules',
    title: 'El Golgi en su región yuxtanuclear',
    type: 'spatial',
    participants: ['microtubules', 'golgi', 'centrosome'],
    explanation: 'En muchas células de mamífero, el aparato de Golgi ocupa una región próxima al núcleo y al centrosoma. El transporte dependiente de dineína sobre microtúbulos contribuye a reunir membranas del Golgi hacia esa región. El propio Golgi también puede organizar microtúbulos que participan en su arquitectura. El centrosoma no es el único determinante de esta disposición. Las señales visuales representan organización espacial y transporte regulado, no una unión rígida entre Golgi y centrosoma.',
    context: 'interphase',
    animation: { kind: 'flow', from: 'microtubules', to: 'golgi', motor: 'dynein1' },
    sources: [
      { label: 'Yadav y Linstedt · Golgi Positioning', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3101843/' }
    ]
  },
  {
    id: 'mt-reticulum-organization',
    component: 'microtubules',
    title: 'Una red que ayuda a organizar el retículo',
    type: 'functional',
    participants: ['microtubules', 'smoothER', 'roughER'],
    explanation: 'Los túbulos del retículo endoplasmático pueden reorganizarse mediante deslizamiento sobre microtúbulos o por acoplamiento a extremos que crecen. En este último mecanismo, proteínas como STIM1 y EB1 relacionan la membrana del retículo con el extremo del microtúbulo. Estos mecanismos no actúan igual en todos los contextos celulares. La animación resume una extensión local del retículo; no implica que toda cisterna se desplace ni que cada cruce entre ambas redes sea un contacto.',
    context: 'interphase',
    animation: { kind: 'flow', from: 'microtubules', to: 'smoothER' },
    sources: [
      { label: 'Grigoriev et al. · STIM1 is a microtubule plus end tracking protein involved in remodeling of the endoplasmic reticulum', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2600655/' }
    ]
  },
  {
    id: 'mt-mitotic-spindle',
    component: 'microtubules',
    title: 'Durante la división: el huso mitótico',
    type: 'functional',
    participants: ['microtubules', 'centrosome', 'nucleus'],
    explanation: 'Al entrar en mitosis, la red de microtúbulos de interfase se reorganiza y contribuye a formar el huso que participa en la segregación de cromosomas. Su ensamblaje integra nucleación, motores y otras proteínas; no consiste simplemente en alargar la red radial existente. Este esquema se presenta aparte porque el fibroblasto principal está en interfase. Resume un huso bipolar sin reproducir todos sus componentes ni situarlo dentro de una envoltura nuclear intacta.',
    context: 'division-inset',
    animation: { kind: 'spindle', from: 'centrosome', to: 'nucleus' },
    sources: [
      { label: 'Petry · Mechanisms of Mitotic Spindle Assembly', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5016079/' }
    ]
  },
  {
    id: 'actin-cell-morphology',
    component: 'actin',
    title: 'Actina y cambios de forma',
    type: 'mechanical',
    participants: ['actin', 'membrane'],
    explanation: 'La incorporación de subunidades a filamentos y redes de actina puede generar fuerzas que contribuyen a deformar membranas. Cerca de un borde protrusivo, Arp2/3 favorece redes ramificadas cuya organización depende también de reguladores de elongación, capping y recambio. La visualización relaciona crecimiento local con protrusión; no significa que cualquier aumento de actina produzca la misma forma. Las fuerzas, la resistencia de la membrana y la regulación bioquímica se resumen de manera educativa.',
    context: 'interphase',
    animation: { kind: 'branch', from: 'actin', to: 'membrane' },
    sources: [
      { label: 'Nucleation, Stabilization and Disassembly of Branched Actin Networks · Trends in Cell Biology', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9018471/' }
    ]
  },
  {
    id: 'actin-cell-migration',
    component: 'actin',
    title: 'Protrusión, adhesión y migración',
    type: 'mechanical',
    participants: ['actin', 'membrane'],
    explanation: 'En un fibroblasto adherente, la migración integra protrusión del borde, formación de adhesiones al sustrato, generación de tracción y liberación de adhesiones. La actina y la miosina contribuyen a este ciclo, mientras las integrinas y sus adaptadores conectan la red con el exterior. La secuencia visual destaca esas relaciones de forma resumida. No representa una conexión directa entre actina y matriz extracelular ni predice desplazamiento celular a partir de una sola variable.',
    context: 'interphase',
    animation: { kind: 'flow', from: 'actin', to: 'membrane' },
    sources: [
      { label: 'Cooper · Actin, Myosin, and Cell Movement · NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9961/' }
    ]
  },
  {
    id: 'actin-myosin-contraction',
    component: 'actin',
    title: 'Tensión en los haces de actina',
    type: 'mechanical',
    participants: ['actin'],
    explanation: 'La miosina II no muscular utiliza energía de ATP para interactuar con filamentos de actina y contribuir a generar tensión. En haces con orientaciones apropiadas, el deslizamiento relativo puede acortar el conjunto sin acortar cada filamento. Las adhesiones y otras proteínas influyen en cómo se transmite esa fuerza. El movimiento mostrado es una representación del sistema actomiosínico, no una medida de fuerza ni una organización muscular con sarcómeros reproducida dentro del fibroblasto.',
    context: 'interphase',
    animation: { kind: 'pulse', from: 'actin', to: 'actin' },
    sources: [
      { label: 'Svitkina · The Actin Cytoskeleton and Actin-Based Motility', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5749151/' }
    ]
  },
  {
    id: 'actin-peripheral-traffic',
    component: 'actin',
    title: 'Tráfico en la periferia celular',
    type: 'transport',
    participants: ['actin', 'vesicles', 'membrane'],
    explanation: 'Además de las rutas largas sobre microtúbulos, redes de actina próximas a la superficie pueden participar en desplazamientos locales, anclaje y organización de cargas. Algunas miosinas transportadoras, como miembros de la familia V, intervienen en ciertos contextos de tráfico y retención periférica. Este ejemplo muestra un recorrido cortical corto; no atribuye esa función a la miosina II contráctil ni supone que todas las vesículas utilizan el mismo motor, adaptador o destino.',
    context: 'interphase',
    animation: { kind: 'transport', from: 'actin', to: 'vesicles' },
    sources: [
      { label: 'Barlan y Gelfand · Microtubule-Based Transport and the Distribution, Tethering, and Organization of Organelles', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5411697/' }
    ]
  },
  {
    id: 'actin-cytokinesis',
    component: 'actin',
    title: 'Durante la división: el surco de separación',
    type: 'mechanical',
    participants: ['actin', 'membrane'],
    explanation: 'Durante la citocinesis de muchas células animales, actina y miosina II se organizan en un sistema contráctil asociado al surco de división. La coordinación con señales procedentes del aparato mitótico contribuye a situar y regular esta estructura. El esquema representa la constricción de un anillo dinámico de forma simplificada. Se muestra separado del fibroblasto de interfase: no existe un anillo de citocinesis permanente en la célula principal ni se simula aquí una división completa.',
    context: 'division-inset',
    animation: { kind: 'ring', from: 'actin', to: 'membrane' },
    sources: [
      { label: 'Pollard y O’Shaughnessy · Molecular Mechanism of Cytokinesis', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6588489/' }
    ]
  },
  {
    id: 'if-nuclear-mechanics',
    component: 'intermediate',
    title: 'Resistencia y entorno nuclear',
    type: 'mechanical',
    participants: ['intermediate', 'nuclearEnvelope', 'nucleus'],
    explanation: 'La red citoplásmica de vimentina contribuye a la respuesta mecánica celular y puede proteger al núcleo frente a deformaciones intensas. Las conexiones con su envoltura son indirectas y dependen de proteínas de enlace, incluidas plectina y componentes de los complejos LINC, según el contexto. Las láminas nucleares son otra familia de filamentos intermedios. El resaltado representa esta vía mecánica sin dibujar vimentina atravesando membranas ni confundir continuidad funcional con un contacto directo.',
    context: 'interphase',
    animation: { kind: 'pulse', from: 'intermediate', to: 'nuclearEnvelope' },
    sources: [
      { label: 'Intermediate Filaments in Cellular Mechanoresponsiveness: Mediating Cytoskeletal Crosstalk From Membrane to Nucleus and Back', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9035595/' }
    ]
  },
  {
    id: 'if-adhesions-integrity',
    component: 'intermediate',
    title: 'Integridad celular y adhesiones',
    type: 'mechanical',
    participants: ['intermediate', 'membrane'],
    explanation: 'En fibroblastos, plectina puede conectar la red central de vimentina con adhesiones fibrilares y contribuir a transmitir esfuerzos y mantener la arquitectura celular. El vínculo requiere proteínas adaptadoras y no implica que todos los extremos de filamentos estén unidos a cualquier punto de membrana. En tejidos epiteliales, otras redes, como queratinas y sus conexiones a desmosomas, sostienen la integridad tisular. Ese contexto es diferente y no se representa como una unión propia de este fibroblasto.',
    context: 'interphase',
    animation: { kind: 'pulse', from: 'intermediate', to: 'membrane' },
    sources: [
      { label: 'Wiche y Winter · Plectin isoforms as organizers of intermediate filament cytoarchitecture', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3158638/' }
    ]
  }
];
