/*
 * Catálogo científico del modelo didáctico. No procede de una segmentación.
 *
 * Disponibilidad de módulos:
 *   1. Añadir el módulo de estudio y su URL cuando exista.
 *   2. Establecer modules[clave].moduleUrl a esa URL.
 *   3. Cambiar modules[clave].enabled a true.
 * El visor puede leer estos datos sin incorporar condiciones por orgánulo.
 * Mantener enabled:false mientras solo exista la ficha introductoria.
 * La visibilidad de una estructura es independiente de este bloqueo educativo.
 *
 * Las fuentes respaldan las explicaciones, no atribuyen a estos modelos
 * geométricos una reconstrucción experimental ni una escala calibrada.
 */
(function () {
  'use strict';

  const sources = {
    compartments: {
      label: 'Alberts et al. · Compartimentación celular · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK26907/'
    },
    membrane: {
      label: 'Cooper · Membranas celulares · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9928/'
    },
    nucleolus: {
      label: 'Cooper · Nucléolo · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9939/'
    },
    envelope: {
      label: 'Alberts et al. · Transporte nuclear · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK26932/'
    },
    mitochondria: {
      label: 'Cooper · Mitocondrias · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9896/'
    },
    reticulum: {
      label: 'Cooper · Retículo endoplasmático · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9889/'
    },
    reticulumStructure: {
      label: 'English y Voeltz · Estructura y función del RE · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5614462/'
    },
    golgi: {
      label: 'Yadav y Linstedt · Posicionamiento del Golgi · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3101843/'
    },
    ribosomes: {
      label: 'Cooper · Traducción del ARN mensajero · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9849/'
    },
    lysosomes: {
      label: 'Xu y Ren · Fisiología lisosomal · PubMed',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25668017/'
    },
    peroxisomes: {
      label: 'Cooper · Peroxisomas · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9930/'
    },
    endosomes: {
      label: 'Cooper · Endocitosis · NCBI Bookshelf',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK9831/'
    },
    transport: {
      label: 'Barlan y Gelfand · Transporte y organización de orgánulos · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5411697/'
    },
    centrosome: {
      label: 'Arquitectura y función del centrosoma humano · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8465925/'
    },
    microtubules: {
      label: 'Goodson y Jonasson · Microtúbulos y proteínas asociadas · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5983186/'
    },
    actin: {
      label: 'Pollard · Actina y proteínas de unión a actina · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4968159/'
    },
    intermediate: {
      label: 'Wiche y Winter · Plectina y arquitectura de filamentos intermedios · PMC',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3158638/'
    }
  };

  const organelles = [
    {
      id: 'cytoskeleton',
      label: 'Citoesqueleto',
      color: '#50a6d9',
      module: 'cytoskeleton',
      components: ['actin', 'microtubules', 'intermediate'],
      intro: 'Conjunto de redes de actina, microtúbulos y filamentos intermedios que contribuyen a la forma, la resistencia, el movimiento y la organización interna de esta célula.',
      sources: [sources.actin, sources.microtubules, sources.intermediate],
      defaultOpacity: 1,
      schematic: true,
      virtual: true
    },
    {
      id: 'membrane',
      label: 'Membrana plasmática',
      color: '#7db4ef',
      module: 'other',
      intro: 'Bicapa lipídica con proteínas que delimita la célula, regula intercambios y recibe señales. Sus conexiones con el citoesqueleto contribuyen a organizar la superficie celular.',
      sources: [sources.membrane],
      defaultOpacity: 0.16,
      schematic: true
    },
    {
      id: 'nucleus',
      label: 'Núcleo',
      color: '#a3a5eb',
      module: 'nucleus',
      intro: 'Compartimento que alberga la mayor parte del ADN celular y organiza procesos como la transcripción. Su envoltura separa el nucleoplasma del citoplasma durante la interfase.',
      sources: [sources.compartments, sources.envelope],
      defaultOpacity: 0.32,
      schematic: true
    },
    {
      id: 'nucleolus',
      label: 'Nucléolo',
      color: '#7d6dd0',
      module: 'nucleus',
      intro: 'Región nuclear sin membrana donde se produce y procesa gran parte del ARN ribosomal y se ensamblan subunidades ribosómicas. Su número y tamaño varían entre células.',
      sources: [sources.nucleolus],
      defaultOpacity: 0.9,
      schematic: true
    },
    {
      id: 'nuclearEnvelope',
      label: 'Envoltura nuclear',
      color: '#95a9da',
      module: 'nucleus',
      intro: 'Doble membrana atravesada por poros que regulan el intercambio entre núcleo y citoplasma. Su membrana externa se continúa con el retículo endoplasmático; la lámina nuclear es una estructura distinta.',
      sources: [sources.envelope],
      defaultOpacity: 0.22,
      schematic: true
    },
    {
      id: 'mitochondria',
      label: 'Mitocondrias',
      color: '#f2a878',
      module: 'mitochondria',
      intro: 'Orgánulos de doble membrana que participan en metabolismo y transformación de energía. Su membrana interna alberga maquinaria de fosforilación oxidativa; forman estructuras dinámicas, a menudo tubulares.',
      sources: [sources.mitochondria, sources.transport],
      defaultOpacity: 0.88,
      schematic: true
    },
    {
      id: 'roughER',
      label: 'Retículo endoplasmático rugoso',
      color: '#9dc5e0',
      module: 'reticulum',
      intro: 'Dominio del retículo asociado a ribosomas en su cara citosólica. Participa en la síntesis y el procesamiento inicial de proteínas destinadas a secreción y a determinadas membranas.',
      sources: [sources.reticulum],
      defaultOpacity: 0.56,
      schematic: true
    },
    {
      id: 'smoothER',
      label: 'Retículo endoplasmático liso',
      color: '#8bd3d1',
      module: 'reticulum',
      intro: 'Dominios del retículo sin ribosomas adheridos, frecuentemente tubulares. Participan en metabolismo lipídico y manejo de calcio, entre otras funciones que dependen del tipo celular; continúan con el resto del retículo.',
      sources: [sources.reticulum, sources.reticulumStructure],
      defaultOpacity: 0.62,
      schematic: true
    },
    {
      id: 'golgi',
      label: 'Aparato de Golgi',
      color: '#e7b4d1',
      module: 'golgi',
      intro: 'Conjunto de cisternas que modifica y clasifica proteínas y lípidos de la vía secretora. En muchas células de mamífero ocupa una región yuxtanuclear organizada con participación del citoesqueleto.',
      sources: [sources.compartments, sources.golgi],
      defaultOpacity: 0.82,
      schematic: true
    },
    {
      id: 'ribosomes',
      label: 'Ribosomas',
      color: '#6682b7',
      module: 'other',
      intro: 'Complejos de ARN y proteínas que traducen ARN mensajero para sintetizar proteínas. Pueden encontrarse libres en el citosol o asociados al retículo según la proteína que producen.',
      sources: [sources.ribosomes, sources.reticulum],
      defaultOpacity: 0.9,
      schematic: true
    },
    {
      id: 'lysosomes',
      label: 'Lisosomas',
      color: '#d5aadf',
      module: 'other',
      intro: 'Compartimentos del sistema endolisosomal que degradan y reciclan componentes mediante enzimas activas en un entorno ácido. Intercambian material con rutas endocíticas y autofágicas, y también participan en señalización.',
      sources: [sources.lysosomes],
      defaultOpacity: 0.88,
      schematic: true
    },
    {
      id: 'peroxisomes',
      label: 'Peroxisomas',
      color: '#d4c781',
      module: 'other',
      intro: 'Orgánulos que participan en metabolismo lipídico y reacciones oxidativas. Contienen enzimas que producen y transforman peróxido de hidrógeno; sus funciones complementan las de otros compartimentos celulares.',
      sources: [sources.peroxisomes],
      defaultOpacity: 0.88,
      schematic: true
    },
    {
      id: 'endosomes',
      label: 'Endosomas',
      color: '#9ccbb9',
      module: 'other',
      intro: 'Compartimentos que reciben y clasifican material internalizado desde la superficie celular. Pueden dirigirlo hacia reciclaje, transporte o degradación; sus propiedades cambian durante la maduración endosomal.',
      sources: [sources.endosomes],
      defaultOpacity: 0.86,
      schematic: true
    },
    {
      id: 'vesicles',
      label: 'Vesículas de transporte',
      color: '#abd7e2',
      module: 'other',
      intro: 'Pequeños transportadores membranosos que llevan cargas entre compartimentos específicos. Algunos desplazamientos utilizan motores sobre filamentos; la selección de destino y la fusión requieren mecanismos de reconocimiento adicionales.',
      sources: [sources.compartments, sources.transport],
      defaultOpacity: 0.9,
      schematic: true
    },
    {
      id: 'centrosome',
      label: 'Centrosoma',
      color: '#f9cb72',
      module: 'other',
      intro: 'Región próxima al núcleo que contiene centriolos y material pericentriolar. Este material nuclea y organiza parte de la red de microtúbulos; también existen lugares de nucleación no centrosomales.',
      sources: [sources.centrosome, sources.microtubules],
      defaultOpacity: 0.74,
      schematic: true
    },
    {
      id: 'centrioles',
      label: 'Centriolos',
      color: '#d8a55c',
      module: 'other',
      intro: 'Estructuras cilíndricas de microtúbulos con simetría de nueve tripletes que forman parte del centrosoma. La nucleación de su red circundante ocurre principalmente en el material pericentriolar.',
      sources: [sources.centrosome],
      defaultOpacity: 1,
      schematic: true
    },
    {
      id: 'microtubules',
      label: 'Microtúbulos',
      color: '#77a7ff',
      module: 'cytoskeleton',
      intro: 'Polímeros polarizados de tubulina que forman redes dinámicas y rutas para motores moleculares. En este fibroblasto esquemático, gran parte de la red se organiza desde la región centrosomal hacia la periferia.',
      sources: [sources.microtubules, sources.transport],
      defaultOpacity: 1,
      schematic: true
    },
    {
      id: 'actin',
      label: 'Actina / microfilamentos',
      color: '#50ded0',
      module: 'cytoskeleton',
      intro: 'Filamentos polarizados de actina que forman redes corticales y haces. Su ensamblaje y sus interacciones con miosinas y adhesiones contribuyen a cambios de forma, protrusión y generación de fuerzas.',
      sources: [sources.actin],
      defaultOpacity: 1,
      schematic: true
    },
    {
      id: 'intermediate',
      label: 'Filamentos intermedios / vimentina',
      color: '#dfb6fa',
      module: 'cytoskeleton',
      intro: 'La vimentina forma una red de filamentos intermedios característica de células mesenquimales que contribuye a resistencia e integridad. Su conexión con adhesiones y entorno nuclear requiere proteínas de enlace.',
      sources: [sources.intermediate],
      defaultOpacity: 1,
      schematic: true
    }
  ];

  window.CELMA_CELL_CONFIG = {
    id: 'fibroblast-v1',
    modelName: 'Fibroblasto animal · interfase',
    description: 'Modelo didáctico de un fibroblasto adherente y extendido sobre un sustrato, con un núcleo central elevado, periferia delgada y redes del citoesqueleto organizadas en su contexto celular.',
    organism: 'Animal',
    cellType: 'Fibroblasto adherente',
    cellCycle: 'Interfase',
    fidelity: 'Representación científica esquemática; no es la reconstrucción de una célula experimental individual.',
    geometryOrigin: 'Geometrías procedimentales educativas creadas para Celma.',
    simplifications: [
      'Los colores identifican estructuras y no representan su color natural ni un marcador fluorescente.',
      'Se han aumentado grosores y tamaños de filamentos, poros, ribosomas y vesículas para facilitar su observación.',
      'El número de orgánulos y filamentos es representativo y no corresponde a un recuento experimental.',
      'La distribución muestra un contexto de fibroblasto en interfase; otras células y estados presentan organizaciones diferentes.',
      'La red de microtúbulos se resume principalmente como una organización radial centrosomal; existen microtúbulos no centrosomales.',
      'Rugoso y liso son dominios de una red continua de retículo endoplasmático, simplificada mediante cisternas y túbulos.',
      'La vimentina citoplásmica se distingue de las láminas nucleares; las conexiones entre redes y membranas requieren adaptadores.',
      'La geometría no tiene una escala experimental calibrada y no representa un estado mitótico ni citocinético.'
    ],
    modules: {
      cytoskeleton: { enabled: true, label: 'Citoesqueleto', moduleUrl: '#actin-growth' },
      nucleus: { enabled: true, label: 'Núcleo', study: true, moduleUrl: '#organelle-nucleus' },
      mitochondria: { enabled: true, label: 'Mitocondrias', study: true, moduleUrl: '#organelle-mitochondria' },
      reticulum: { enabled: true, label: 'Retículo endoplasmático', study: true, moduleUrl: '#organelle-roughER' },
      golgi: { enabled: true, label: 'Aparato de Golgi', study: true, moduleUrl: '#organelle-golgi' },
      other: { enabled: true, label: 'Estructuras celulares', study: true, moduleUrl: '#organelle-membrane' }
    },
    organelles: organelles
  };

  // Conservar las correspondencias y colores del citoesqueleto ya existentes.
  // Los nombres nuevos no se infieren por color ni por coincidencias ambiguas.
  const components = window.CELMA_3D_COMPONENTS || {};
  organelles.forEach(function (entry) {
    if (!components[entry.id]) {
      components[entry.id] = {
        label: entry.label,
        color: entry.color,
        patterns: []
      };
    }
  });
  window.CELMA_3D_COMPONENTS = components;
}());
