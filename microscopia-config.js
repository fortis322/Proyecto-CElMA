/* Colección de micrografías documentadas; las guías compartidas identifican la misma muestra. */
window.CELMA_MICROSCOPY = {
  "entries": [
    {
      "id": "imagej-fluorescent-cells",
      "label": "Células endoteliales · tres señales fluorescentes",
      "available": true,
      "image": "microscopia/imagej-citoesqueleto.jpg",
      "alt": "Micrografía compuesta de células endoteliales bovinas: filamentos de actina rojos, señal de tubulina verde y ADN nuclear azul.",
      "institution": "ImageJ · preparación de demostración de Molecular Probes. Autor individual no identificado en la ficha.",
      "dataset": "FluorescentCells · ImageJ Sample Images · células endoteliales de arteria pulmonar bovina",
      "structure": "F-actina (rojo), tubulina (verde) y ADN nuclear (azul)",
      "marker": "Texas Red-X–faloidina: F-actina. BODIPY FL anti-IgG de ratón, producido en cabra: inmunomarcaje de tubulina. DAPI: ADN nuclear.",
      "technique": "Microscopía de fluorescencia. Composición de tres canales; la fuente no especifica la modalidad óptica.",
      "source": "ImageJ · descripción original de la muestra",
      "sourceURL": "https://imagej.net/ij/images/FluorescentCells.txt",
      "originalURL": "https://imagej.net/ij/images/FluorescentCells.jpg",
      "license": "Dominio público · PDM 1.0, según la ficha del archivo",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:FluorescentCells.jpg",
      "attribution": "FluorescentCells, colección de muestras de ImageJ. Preparación: Molecular Probes. Autor individual no identificado. Imagen original, sin modificación.",
      "limitations": "Esta muestra es de endotelio bovino; el modelo representa un fibroblasto esquemático. Los colores identifican señales fluorescentes y no son los colores naturales de la célula. El JPG no incorpora una escala calibrada. No es una reconstrucción 3D.",
      "verifiedOn": "2026-10-28",
      "sha256": "9a33cb62580b9d8c5142e5d73f2a585bce5f5100d2de3e9fab84d323c2fdb3dd",
      "focuses": [
        {
          "id": "cytoskeleton",
          "label": "Vista completa",
          "shortLabel": "Tres señales",
          "color": "#7b8ee8",
          "components": [
            "cytoskeleton"
          ],
          "prompt": "Compara la red roja y la red verde alrededor de las zonas azules. Cada color corresponde a un marcador distinto.",
          "signal": "Imagen compuesta · rojo + verde + azul",
          "scope": "Una misma imagen permite relacionar las tres señales. Cambiar de enfoque resalta estructuras en el modelo y orienta la lectura; no separa los canales del JPG."
        },
        {
          "id": "actin",
          "label": "F-actina",
          "shortLabel": "Busca el rojo",
          "color": "#d45570",
          "components": [
            "actin"
          ],
          "prompt": "Sigue los haces rojos alargados y observa cómo recorren las células.",
          "signal": "Señal roja · Texas Red-X–faloidina",
          "scope": "La faloidina revela actina filamentosa (F-actina). Esta señal no representa toda la actina soluble de la célula."
        },
        {
          "id": "microtubules",
          "label": "Microtúbulos",
          "shortLabel": "Busca el verde",
          "color": "#2a966f",
          "components": [
            "microtubules"
          ],
          "prompt": "Localiza la red verde y compárala con los haces rojos. Observa sus recorridos alrededor del núcleo.",
          "signal": "Señal verde · inmunomarcaje de tubulina",
          "scope": "La señal de tubulina se revela con BODIPY FL unido al anticuerpo secundario. Una imagen fija no muestra el crecimiento ni la pérdida de microtúbulos."
        },
        {
          "id": "nucleus",
          "label": "ADN nuclear",
          "shortLabel": "Busca el azul",
          "color": "#4e7bdd",
          "components": [
            "nucleus"
          ],
          "prompt": "Encuentra las zonas azules y observa cómo se organizan las redes roja y verde a su alrededor.",
          "signal": "Señal azul · DAPI",
          "scope": "DAPI marca ADN. No es un marcador específico de la envoltura nuclear ni del nucléolo."
        }
      ]
    },
    {
      "id": "hela-lamp1-vimentin",
      "label": "Lisosomas y vimentina en células HeLa",
      "available": true,
      "image": "microscopia/hela-lamp1-vimentina.jpg",
      "alt": "Micrografía fluorescente de HeLa: señal LAMP1 roja, vimentina verde y ADN azul.",
      "institution": "EnCor Biotechnology · GerryShaw",
      "dataset": "Micrografía de HeLa · 7 de agosto de 2012",
      "structure": "Lisosomas (rojo), filamentos de vimentina (verde) y ADN nuclear (azul)",
      "marker": "Anticuerpos anti-LAMP1 y anti-vimentina. Tinción de ADN azul; la ficha no identifica el colorante.",
      "technique": "Inmunofluorescencia; modalidad óptica no especificada.",
      "source": "GerryShaw · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:HeLa_cells_showin_Lamp1_in_red,_vimentin_in_green_and_DNA_in_blue.jpg",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:HeLa_cells_showin_Lamp1_in_red,_vimentin_in_green_and_DNA_in_blue.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/1/1c/HeLa_cells_showin_Lamp1_in_red%2C_vimentin_in_green_and_DNA_in_blue.jpg",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "attribution": "GerryShaw. HeLa cells showin Lamp1 in red, vimentin in green and DNA in blue.jpg. CC BY-SA 4.0. Archivo sin modificar.",
      "limitations": "La señal identifica marcadores; no delimita todas las membranas. HeLa es una línea tumoral y difiere del fibroblasto del modelo.",
      "verifiedOn": "2026-11-01",
      "sha256": "c98c28ca52de3c6093921ec2694f6767e38e89e13f36591c4913f05e3c55bb8b",
      "caption": "Micrografía fluorescente de HeLa: señal LAMP1 roja, vimentina verde y ADN azul."
    },
    {
      "id": "peroxisomes-rat",
      "label": "Peroxisomas en un cardiomiocito",
      "available": true,
      "image": "microscopia/peroxisomas-fluor.jpg",
      "alt": "Señal fluorescente de peroxisomas en un cardiomiocito neonatal de rata.",
      "institution": "Evgeniy Ukraine",
      "dataset": "Cardiomiocito neonatal de rata · 2016",
      "structure": "Peroxisomas",
      "marker": "SelectFX Alexa Fluor 488 dirigido a PMP70.",
      "technique": "Microscopía de fluorescencia; modalidad óptica no especificada.",
      "source": "Evgeniy Ukraine · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:Peroxisome_.jpg",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:Peroxisome_.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Peroxisome_.jpg",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "attribution": "Evgeniy Ukraine. Peroxisome .jpg. CC BY-SA 4.0. Archivo sin modificar.",
      "limitations": "El marcador revela PMP70. La ficha no aporta una escala calibrada ni un censo completo de peroxisomas.",
      "verifiedOn": "2026-11-01",
      "sha256": "2cc0aa870b3627240a93b47f63b0f24786adf4505d542e5dc7a90c18d2ca8d7c",
      "caption": "Señal fluorescente de peroxisomas en un cardiomiocito neonatal de rata."
    },
    {
      "id": "rough-er-mouse",
      "label": "Retículo rugoso y ribosomas",
      "available": true,
      "image": "microscopia/reticulo-rugoso-tem.png",
      "alt": "Micrografía electrónica de cisternas de retículo rugoso con ribosomas oscuros asociados.",
      "institution": "Regents of University of Michigan Medical School · OpenStax",
      "dataset": "Anatomy & Physiology · figura 3.13(b), edición 2016 · tejido de ratón",
      "structure": "Cisternas del retículo endoplasmático rugoso y ribosomas asociados",
      "marker": "Sin marcador fluorescente. El contraste electrónico no se especifica en la ficha.",
      "technique": "Micrografía electrónica · ampliación original aproximada 110 000×.",
      "source": "OpenStax · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:0313_Endoplasmic_Reticulum_b_labeled.png",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:0313_Endoplasmic_Reticulum_b_labeled.png",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/2/24/0313_Endoplasmic_Reticulum_b_labeled.png",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "attribution": "OpenStax. 0313 Endoplasmic Reticulum b labeled.png. CC BY 3.0. Archivo sin modificar.",
      "limitations": "Las líneas de anotación pertenecen a la fuente. La ampliación impresa no se conserva al redimensionar la imagen.",
      "verifiedOn": "2026-11-01",
      "sha256": "0f28d5334e323e974d21bb380f7d0468999fa6aeccd22d829587aa3e60282150",
      "caption": "Micrografía electrónica de cisternas de retículo rugoso con ribosomas oscuros asociados."
    },
    {
      "id": "smooth-er-mouse",
      "label": "Retículo endoplasmático liso",
      "available": true,
      "image": "microscopia/reticulo-liso-tem.png",
      "alt": "Micrografía electrónica de una región de retículo liso de tejido de ratón.",
      "institution": "Regents of University of Michigan Medical School · OpenStax",
      "dataset": "Anatomy & Physiology · figura 3.13(c), edición 2016 · tejido de ratón",
      "structure": "Retículo endoplasmático liso",
      "marker": "Sin marcador fluorescente. Contraste electrónico no especificado.",
      "technique": "Micrografía electrónica · ampliación original aproximada 110 510×.",
      "source": "OpenStax · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:0313_Endoplasmic_Reticulum_c_labeled.png",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:0313_Endoplasmic_Reticulum_c_labeled.png",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/a/a9/0313_Endoplasmic_Reticulum_c_labeled.png",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "attribution": "OpenStax. 0313 Endoplasmic Reticulum c labeled.png. CC BY 3.0. Archivo sin modificar.",
      "limitations": "Identificación morfológica indicada por la figura original; el campo también contiene otras estructuras.",
      "verifiedOn": "2026-11-01",
      "sha256": "a48b0d8cfeeb6bf557396e184ff88b80d7da5bf29d3e12f8d48cdae68353a749",
      "caption": "Micrografía electrónica de una región de retículo liso de tejido de ratón."
    },
    {
      "id": "golgi-openstax",
      "label": "Cisternas del aparato de Golgi",
      "available": true,
      "image": "microscopia/golgi-tem.png",
      "alt": "Micrografía electrónica del aparato de Golgi, con cisternas apiladas.",
      "institution": "OpenStax",
      "dataset": "Anatomy & Physiology · figura 3.14(b), edición 2016",
      "structure": "Aparato de Golgi",
      "marker": "Sin marcador fluorescente. Preparación y contraste no especificados en la ficha.",
      "technique": "Microscopía electrónica.",
      "source": "OpenStax · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:0314_Golgi_Apparatus_b_en.png",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:0314_Golgi_Apparatus_b_en.png",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/8/8d/0314_Golgi_Apparatus_b_en.png",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "attribution": "OpenStax. 0314 Golgi Apparatus b en.png. CC BY 3.0. Archivo sin modificar.",
      "limitations": "La fuente no identifica aquí el tipo celular ni el contraste. No se infieren esos datos.",
      "verifiedOn": "2026-11-01",
      "sha256": "4d8d35e0dab9f7fadf2ca1a813bd2cf174ebdefd07ce7c1ce04e62b302647ad9",
      "caption": "Micrografía electrónica del aparato de Golgi, con cisternas apiladas."
    },
    {
      "id": "endocytic-hela",
      "label": "Compartimentos de la vía endocítica",
      "available": true,
      "image": "microscopia/endosomas-tem.jpg",
      "alt": "Micrografía electrónica de la vía endocítica de HeLa, con compartimentos E, M y L anotados.",
      "institution": "Matthew R. G. Russell",
      "dataset": "Células HeLa · referencia metodológica Doyotte et al., 2005",
      "structure": "Endosomas tempranos (E), cuerpos multivesiculares (M) y lisosomas (L)",
      "marker": "Anti-EGFR conjugado a oro de 10 nm y transferrina-HRP revelada con DAB.",
      "technique": "Microscopía electrónica de transmisión · Philips EM400.",
      "source": "Matthew R G Russell · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:HeLa_cell_endocytic_pathway_labeled_for_EGFR_and_transferrin.jpg",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:HeLa_cell_endocytic_pathway_labeled_for_EGFR_and_transferrin.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/8/85/HeLa_cell_endocytic_pathway_labeled_for_EGFR_and_transferrin.jpg",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "attribution": "Matthew R G Russell. HeLa cell endocytic pathway labeled for EGFR and transferrin.jpg. CC BY 3.0. Archivo sin modificar.",
      "limitations": "Se muestra una captura tras internalización de EGFR. La barra original es de 500 nm. No representa transporte de vesículas por motores en tiempo real.",
      "verifiedOn": "2026-11-01",
      "sha256": "3fe12a626ee807e891f8baf0d23bcf33d8b9715709775bbee764862686afd636",
      "caption": "Micrografía electrónica de la vía endocítica de HeLa, con compartimentos E, M y L anotados."
    },
    {
      "id": "nucleolus-openstax",
      "label": "Nucléolo y envoltura nuclear",
      "available": true,
      "image": "microscopia/nucleolo-openstax.jpg",
      "alt": "Figura con un esquema nuclear a la izquierda y una micrografía electrónica rotulada a la derecha.",
      "institution": "OpenStax Microbiology",
      "dataset": "Microbiology · figura 3.42 · edición 2016",
      "structure": "Núcleo, nucléolo, envoltura y poros nucleares",
      "marker": "Sin marcador fluorescente. El contraste del panel microscópico no se detalla en la ficha.",
      "technique": "Panel (b): microscopía electrónica de transmisión; panel (a): esquema explicativo.",
      "source": "CNX OpenStax · ficha original",
      "sourceURL": "https://openstax.org/books/microbiology/pages/3-4-unique-characteristics-of-eukaryotic-cells",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:OSC_Microbio_03_04_Nucleolus.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/d/db/OSC_Microbio_03_04_Nucleolus.jpg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "attribution": "CNX OpenStax. OSC Microbio 03 04 Nucleolus.jpg. CC BY 4.0. Archivo sin modificar.",
      "limitations": "Observa la fotografía del panel (b), a la derecha. El panel (a) es un dibujo; no es otra micrografía. Se conserva la composición y su barra de 500 nm.",
      "verifiedOn": "2026-11-01",
      "sha256": "2b7e2ff6e781d6b32032d04530b9cb97c599d43bc5a38da55df0ab77e842aa93",
      "caption": "Figura con un esquema nuclear a la izquierda y una micrografía electrónica rotulada a la derecha."
    },
    {
      "id": "centrosome-idr",
      "label": "Organización del centrosoma humano",
      "available": true,
      "image": "microscopia/centrosoma-sim.jpg",
      "alt": "Miniatura de fluorescencia del estudio de organización del material pericentriolar.",
      "institution": "Lawo et al. · Image Data Resource",
      "dataset": "IDR0021 · imagen 1885209 · células HeLa humanas en interfase",
      "structure": "Material pericentriolar del centrosoma",
      "marker": "PCNT-N1 (pericentrina) y TUBG1-N (γ-tubulina), según las anotaciones del registro IDR.",
      "technique": "3D-SIM reconstruida; proyección de intensidad máxima y alineación.",
      "source": "Lawo et al · ficha original",
      "sourceURL": "https://idr.openmicroscopy.org/webclient/?show=image-1885209",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:Image_Data_Resource_-_idr0021_-_1885209.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/2/27/Image_Data_Resource_-_idr0021_-_1885209.jpg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "attribution": "Lawo et al. · IDR0021, imagen 1885209. CC BY 4.0. Miniatura original sin modificar.",
      "limitations": "Miniatura de 256 × 256 píxeles del registro PCNT_gtub_I_023_SIR_PRJ.dv. Las anotaciones identifican PCNT-N1 (canal 525) y TUBG1-N (canal 615). La miniatura no sustituye los datos originales para medir distancias.",
      "verifiedOn": "2026-11-01",
      "sha256": "e08fb3023039195631e356f3bfbc1ea4fe00cdfcb7ace9a02547e50dc9129fdb",
      "caption": "Miniatura de fluorescencia del estudio de organización del material pericentriolar."
    },
    {
      "id": "centriole-dartmouth",
      "label": "Un centriolo durante la división",
      "available": true,
      "image": "microscopia/centriolo-tem.jpg",
      "alt": "Micrografía electrónica de un centriolo del huso en tejido cerebral embrionario de ratón.",
      "institution": "Louisa Howard y Miguel Marin-Padilla · Dartmouth",
      "dataset": "REMF · cerebro de embrión de ratón de 11,5 días · imagen 80445",
      "structure": "Centriolo del huso y microtúbulos próximos",
      "marker": "Sin marcador fluorescente. Contraste de sección fina no especificado en la ficha.",
      "technique": "Microscopía electrónica de transmisión · JEOL 100CX.",
      "source": "Louisa Howard, Miguel Marin-Padilla · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:Spindle_centriole_-_embryonic_brain_mouse_-_TEM.jpg",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:Spindle_centriole_-_embryonic_brain_mouse_-_TEM.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/1/10/Spindle_centriole_-_embryonic_brain_mouse_-_TEM.jpg",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Spindle_centriole_-_embryonic_brain_mouse_-_TEM.jpg",
      "attribution": "Louisa Howard, Miguel Marin-Padilla. Spindle centriole - embryonic brain mouse - TEM.jpg. Public domain. Archivo sin modificar.",
      "limitations": "Es una sección de una célula mitótica, no una vista completa de ambos centriolos en interfase.",
      "verifiedOn": "2026-11-01",
      "sha256": "92510c1631bb62119dd9b5a37c2f5af679ba5562232da2560c6f556c2cebddf7",
      "caption": "Micrografía electrónica de un centriolo del huso en tejido cerebral embrionario de ratón."
    },
    {
      "id": "mitochondria-endothelium",
      "label": "Mitocondrias de una célula endotelial",
      "available": true,
      "image": "microscopia/mitocondrias-fluor.jpg",
      "alt": "Mitocondrias fluorescentes verdes en una célula endotelial humana.",
      "institution": "David Hackos · Molecular Probes",
      "dataset": "Célula endotelial humana cultivada",
      "structure": "Mitocondrias",
      "marker": "MitoTracker Green FM, 20 nM, incubación de 30 minutos según la descripción.",
      "technique": "Microscopía de fluorescencia.",
      "source": "Molecular Probes Inc. · ficha original",
      "sourceURL": "https://commons.wikimedia.org/wiki/File:Mitochondria_in_cell.jpg",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:Mitochondria_in_cell.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Mitochondria_in_cell.jpg",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "attribution": "David Hackos / Molecular Probes Inc. Mitochondria in cell.jpg. CC BY-SA 3.0. Archivo original sin modificar.",
      "limitations": "La señal del colorante no muestra por sí sola las crestas ni cuantifica la producción de energía.",
      "verifiedOn": "2026-11-01",
      "sha256": "3fc8c25b8d403d6ae7652358ed9e2da28664840ded1a1f473f7ecb18291d75aa",
      "caption": "Mitocondrias fluorescentes verdes en una célula endotelial humana."
    },
    {
      "id": "plasma-membrane-tem",
      "label": "Membrana plasmática y liberación de exosomas",
      "available": true,
      "image": "microscopia/membrana-tem.jpg",
      "alt": "Micrografía electrónica de una célula B con exosomas liberados en su superficie.",
      "institution": "James R. Edgar",
      "dataset": "BMC Biology 14:46 (2016) · célula B transformada por EBV",
      "structure": "Membrana plasmática, cuerpos multivesiculares y exosomas",
      "marker": "Sin marcador fluorescente; contraste electrónico no especificado en la ficha.",
      "technique": "Microscopía electrónica de transmisión.",
      "source": "James R. Edgar · ficha original",
      "sourceURL": "https://doi.org/10.1186/s12915-016-0268-z",
      "provenanceURL": "https://commons.wikimedia.org/wiki/File:A_transmission_electron_micrograph_of_an_Epstein%E2%80%93Barr_virus-transformed_B_cell_displaying_newly_expelled_exosomes_at_the_plasma_membrane.jpg",
      "originalURL": "https://upload.wikimedia.org/wikipedia/commons/9/9e/A_transmission_electron_micrograph_of_an_Epstein%E2%80%93Barr_virus-transformed_B_cell_displaying_newly_expelled_exosomes_at_the_plasma_membrane.jpg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "attribution": "James R. Edgar. A transmission electron micrograph of an Epstein–Barr virus-transformed B cell displaying newly expelled exosomes at the plasma membrane.jpg. CC BY 4.0. Archivo sin modificar.",
      "limitations": "Contexto específico de una célula B transformada. Las flechas señalan exosomas; no son vesículas transportadas sobre microtúbulos.",
      "verifiedOn": "2026-11-01",
      "sha256": "cc710f48939a9bbd3a8f63fae812ca309ec82cbebb1e562e0d9cf51d50568d4b",
      "caption": "Micrografía electrónica de una célula B con exosomas liberados en su superficie."
    }
  ],
  "catalog": [
    {
      "id": "cytoskeleton",
      "label": "Citoesqueleto",
      "shortLabel": "Tres señales",
      "color": "#7b8ee8",
      "components": [
        "cytoskeleton"
      ],
      "prompt": "Compara la red roja y la red verde alrededor de las zonas azules. Cada color corresponde a un marcador distinto.",
      "signal": "Imagen compuesta · rojo + verde + azul",
      "scope": "Una misma imagen permite relacionar las tres señales. Cambiar de enfoque resalta estructuras en el modelo y orienta la lectura; no separa los canales del JPG.",
      "sampleId": "imagej-fluorescent-cells",
      "group": "support"
    },
    {
      "id": "membrane",
      "label": "Membrana plasmática",
      "sampleId": "plasma-membrane-tem",
      "group": "traffic",
      "prompt": "Sigue el límite de la célula y las flechas que señalan exosomas junto a la superficie.",
      "scope": "Una micrografía muestra un corte y un instante; no demuestra por sí sola el mecanismo completo de secreción.",
      "signal": "TEM · membrana y exosomas",
      "color": "#4a82b9",
      "components": [
        "membrane"
      ]
    },
    {
      "id": "nucleus",
      "label": "Núcleo",
      "shortLabel": "Busca el azul",
      "color": "#4e7bdd",
      "components": [
        "nucleus"
      ],
      "prompt": "Encuentra las zonas azules y observa cómo se organizan las redes roja y verde a su alrededor.",
      "signal": "Señal azul · DAPI",
      "scope": "DAPI marca ADN. No es un marcador específico de la envoltura nuclear ni del nucléolo.",
      "sampleId": "imagej-fluorescent-cells",
      "group": "nuclear"
    },
    {
      "id": "nucleolus",
      "label": "Nucléolo",
      "sampleId": "nucleolus-openstax",
      "group": "nuclear",
      "prompt": "En el panel (b), a la derecha, localiza la región oscura rotulada nucleolus.",
      "scope": "El esquema de la izquierda sirve para orientarte. La imagen real está a la derecha.",
      "signal": "Panel (b) · contraste electrónico",
      "color": "#4a82b9",
      "components": [
        "nucleolus"
      ]
    },
    {
      "id": "nuclearEnvelope",
      "label": "Envoltura nuclear",
      "sampleId": "nucleolus-openstax",
      "group": "nuclear",
      "prompt": "En el panel (b), sigue el borde rotulado nuclear envelope y el poro señalado.",
      "scope": "La envoltura y el nucléolo comparten esta fotografía; las tarjetas son dos guías de lectura de la misma muestra.",
      "signal": "Panel (b) · envoltura y poro nuclear",
      "color": "#4a82b9",
      "components": [
        "nuclearEnvelope"
      ]
    },
    {
      "id": "mitochondria",
      "label": "Mitocondrias",
      "sampleId": "mitochondria-endothelium",
      "group": "energy",
      "prompt": "Sigue los perfiles fluorescentes verdes que recorren la célula.",
      "scope": "El marcador revela la distribución mitocondrial, sin resolver su ultraestructura.",
      "signal": "MitoTracker Green FM",
      "color": "#4f9f72",
      "components": [
        "mitochondria"
      ]
    },
    {
      "id": "roughER",
      "label": "Retículo rugoso",
      "sampleId": "rough-er-mouse",
      "group": "traffic",
      "prompt": "Busca las cisternas paralelas y los puntos oscuros sobre sus bordes.",
      "scope": "Los puntos corresponden a ribosomas asociados según la identificación de la figura.",
      "signal": "TEM · cisternas con ribosomas",
      "color": "#4a82b9",
      "components": [
        "roughER"
      ]
    },
    {
      "id": "smoothER",
      "label": "Retículo liso",
      "sampleId": "smooth-er-mouse",
      "group": "traffic",
      "prompt": "Localiza la región indicada por la línea de anotación de la fuente.",
      "scope": "La imagen documenta retículo liso; no es un canal fluorescente ni permite medir su actividad.",
      "signal": "Micrografía electrónica · tejido de ratón",
      "color": "#4a82b9",
      "components": [
        "smoothER"
      ]
    },
    {
      "id": "golgi",
      "label": "Aparato de Golgi",
      "sampleId": "golgi-openstax",
      "group": "traffic",
      "prompt": "Recorre el conjunto de cisternas aplanadas y apiladas.",
      "scope": "La fotografía es estática; no muestra el recorrido temporal de una proteína.",
      "signal": "Microscopía electrónica · Golgi",
      "color": "#4a82b9",
      "components": [
        "golgi"
      ]
    },
    {
      "id": "ribosomes",
      "label": "Ribosomas",
      "sampleId": "rough-er-mouse",
      "group": "traffic",
      "prompt": "Observa los puntos densos asociados a las cisternas del retículo rugoso.",
      "scope": "Es la misma micrografía del retículo rugoso, enfocada en los ribosomas adheridos.",
      "signal": "TEM · ribosomas asociados",
      "color": "#4a82b9",
      "components": [
        "ribosomes"
      ]
    },
    {
      "id": "lysosomes",
      "label": "Lisosomas",
      "sampleId": "hela-lamp1-vimentin",
      "group": "energy",
      "prompt": "Busca los puntos rojos que corresponden al marcador LAMP1.",
      "scope": "La red verde es vimentina y el ADN es azul; no se separan los canales del JPG.",
      "signal": "Rojo · anti-LAMP1",
      "color": "#c96186",
      "components": [
        "lysosomes"
      ]
    },
    {
      "id": "peroxisomes",
      "label": "Peroxisomas",
      "sampleId": "peroxisomes-rat",
      "group": "energy",
      "prompt": "Localiza los focos verdes del marcador de membrana peroxisomal.",
      "scope": "La fotografía procede de un cardiomiocito neonatal de rata.",
      "signal": "PMP70 · Alexa Fluor 488",
      "color": "#4b9b79",
      "components": [
        "peroxisomes"
      ]
    },
    {
      "id": "endosomes",
      "label": "Endosomas",
      "sampleId": "endocytic-hela",
      "group": "traffic",
      "prompt": "Localiza los compartimentos E y compáralos con M y L.",
      "scope": "Las marcas E, M y L fueron añadidas por la fuente. Los marcadores EGFR y transferrina documentan esta vía.",
      "signal": "TEM · EGFR-oro y transferrina-HRP",
      "color": "#4a82b9",
      "components": [
        "endosomes"
      ]
    },
    {
      "id": "vesicles",
      "label": "Vesículas de transporte",
      "sampleId": "endocytic-hela",
      "group": "traffic",
      "prompt": "Observa los compartimentos membranosos de la vía endocítica y los cuerpos multivesiculares.",
      "scope": "Esta guía usa la misma muestra de endosomas como ejemplo de tráfico vesicular; no representa todas las clases de vesículas ni sus motores.",
      "signal": "Ejemplo de compartimentos del tráfico endocítico",
      "color": "#4a82b9",
      "components": [
        "vesicles"
      ]
    },
    {
      "id": "centrosome",
      "label": "Centrosoma",
      "sampleId": "centrosome-idr",
      "group": "support",
      "prompt": "Observa la organización anular de la señal en esta miniatura del estudio IDR.",
      "scope": "La proyección superpone planos de células HeLa en interfase. Compara la distribución de pericentrina y γ-tubulina; esta miniatura no permite medir su separación.",
      "signal": "3D-SIM · pericentrina y γ-tubulina",
      "color": "#b394c5",
      "components": [
        "centrosome"
      ]
    },
    {
      "id": "centrioles",
      "label": "Centriolos",
      "sampleId": "centriole-dartmouth",
      "group": "support",
      "prompt": "Busca la estructura cilíndrica del centriolo y los microtúbulos que la rodean.",
      "scope": "La sección pertenece a una célula en división; compárala con el modelo de interfase teniendo en cuenta ese contexto.",
      "signal": "TEM · cerebro embrionario de ratón",
      "color": "#4a82b9",
      "components": [
        "centrioles"
      ]
    },
    {
      "id": "microtubules",
      "label": "Microtúbulos",
      "shortLabel": "Busca el verde",
      "color": "#2a966f",
      "components": [
        "microtubules"
      ],
      "prompt": "Localiza la red verde y compárala con los haces rojos. Observa sus recorridos alrededor del núcleo.",
      "signal": "Señal verde · inmunomarcaje de tubulina",
      "scope": "La señal de tubulina se revela con BODIPY FL unido al anticuerpo secundario. Una imagen fija no muestra el crecimiento ni la pérdida de microtúbulos.",
      "sampleId": "imagej-fluorescent-cells",
      "group": "support"
    },
    {
      "id": "actin",
      "label": "F-actina",
      "shortLabel": "Busca el rojo",
      "color": "#d45570",
      "components": [
        "actin"
      ],
      "prompt": "Sigue los haces rojos alargados y observa cómo recorren las células.",
      "signal": "Señal roja · Texas Red-X–faloidina",
      "scope": "La faloidina revela actina filamentosa (F-actina). Esta señal no representa toda la actina soluble de la célula.",
      "sampleId": "imagej-fluorescent-cells",
      "group": "support"
    },
    {
      "id": "intermediate",
      "label": "Filamentos intermedios",
      "sampleId": "hela-lamp1-vimentin",
      "group": "support",
      "prompt": "Sigue la red verde de vimentina alrededor de las zonas azules.",
      "scope": "Comparte fotografía con lisosomas; anti-vimentina revela una familia concreta de filamentos intermedios.",
      "signal": "Verde · anti-vimentina",
      "color": "#9b7cba",
      "components": [
        "intermediate"
      ]
    }
  ]
};
