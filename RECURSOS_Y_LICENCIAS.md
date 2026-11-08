# Recursos y licencias

Edición del inventario: **1 de noviembre de 2026**. La colección de microscopía se amplió el 1 de noviembre; las referencias OrganUI y la fuente Manrope se documentaron el 23 de octubre. Los permisos se comprueban por activo, independientemente del software de visualización. La revisión microscópica vigente está en [FUENTES_MICROSCOPIA.md](FUENTES_MICROSCOPIA.md).

| Recurso | Origen / autoría | Permiso y procedimiento |
|---|---|---|
| `celula-3d.js`, `modelos/celula-fibroblasto.glb` | Geometría original creada para Celma | [MIT limitada a este modelo](modelos/LICENCIA-CELULA-PROCEDIMENTAL.txt). Curvas/primitivas Three.js → Group → GLTFExporter r180 → GLB 2.0; extras semánticos conservados. Esquema, no reconstrucción experimental |
| `microscopia/imagej-citoesqueleto.jpg` | Colección ImageJ; preparación Molecular Probes; autor individual no identificado | Dominio público/PDM 1.0, [ficha individual](https://commons.wikimedia.org/wiki/File:FluorescentCells.jpg). [Descarga ImageJ](https://imagej.net/ij/images/FluorescentCells.jpg), 57.512 bytes; sin conversión/recorte/recoloración. SHA-1 coincide con la ficha: `137cc6dc5bc2d60de063c282d92c8e5a5d4e7da5` |
| `microscopia/imagej-descripcion.txt` | [Descripción original ImageJ](https://imagej.net/ij/images/FluorescentCells.txt) | Acompañamiento de metadatos/atribución de la muestra anterior, 999 bytes sin cambios; documenta canales, no una reconstrucción |
| GLB anteriores y `modelo-local.js` | Modelo proporcionado por el usuario en el proyecto original | Licencia pública no verificada; no se concede una nueva. Copias compatibles/optimizadas y codificación local heredadas, conservadas como modelo anterior |
| `imagenes/cell.jpg`, `icono.svg`, contenido visual heredado | Incluido en la web entregada por el usuario | Autoría/licencia pública no verificadas en esta ampliación. Conservado; no se presenta como dato científico ni se incluye bajo MIT del nuevo modelo |
| `vendor/` | Three.js y complementos, three-mesh-bvh, Draco, KTX2/Basis y Meshopt | Avisos MIT/Apache-2.0 conservados en `vendor/`; no conceden permisos sobre imágenes o datos científicos |

[microscopia/descargas.json](microscopia/descargas.json) conserva URL, tamaño y SHA-256 de las descargas microscópicas. Ninguna fue un volumen científico masivo.

## Recursos incorporados el 23 de octubre

| Recurso | Origen / autoría | Licencia, conversión y alcance |
|---|---|---|
| `fuentes/Manrope-variable.ttf` | Autores del proyecto Manrope; repositorio oficial Google Fonts | **SIL Open Font License 1.1**, texto en `fuentes/OFL-Manrope.txt`. Archivo original de 164.700 bytes sin modificar; descarga del 23 de octubre. Se aloja localmente y se usa en la portada y el encabezado del explorador, sin petición a Google Fonts. [Procedencia](fuentes/PROCEDENCIA.md) |
| `modelos/referencias/organui-celula.glb` | **OrganUI**, modelo animal genérico | **CC0 1.0**, declarada en la ficha individual, tabla de licencias y `asset.copyright`. Copia intacta de `https://organui.com/models/cell.glb`, 2.670.840 bytes; 15 mallas etiquetadas. Esquemático, no experimental |
| `modelos/referencias/organui-mitocondrias.glb` | OrganUI; extracción para Celma | **CC0 1.0**. Nodo `mitochondria` aislado y recursos no usados eliminados; 115.828 bytes. Sin remallado, recoloración ni ajuste de escala |
| `modelos/referencias/organui-golgi.glb` | OrganUI; extracción para Celma | **CC0 1.0**. Nodo `golgi-apparatus` aislado y limpieza de recursos; 197.344 bytes. No representa mediciones de cisternas |
| `modelos/referencias/organui-centrosoma.glb` | OrganUI; extracción para Celma | **CC0 1.0**. Nodo `centrosome` aislado y limpieza de recursos; 27.160 bytes. Organización esquemática sin resolución molecular |
| Copias OrganUI `-local.js` | Codificación local de los cuatro GLB anteriores | Mismos bytes en base64, misma licencia **CC0 1.0**. La codificación no cambia geometría ni procedencia |
| Iconos y acabado de las medallas | Dibujos SVG y CSS originales de esta ampliación | No derivan de insignias de terceros ni de datos experimentales. No se les atribuye automáticamente la licencia del modelo procedural ni la de OrganUI |

La dedicación CC0 se verifica en la [ficha Cell de OrganUI](https://organui.com/docs/components/cell), la [tabla oficial de licencias](https://organui.com/docs/licences) y los metadatos del GLB original. Se conserva el crédito **OrganUI animal cell schematic model, dedicated to the public domain under CC0 1.0** por transparencia, aunque CC0 no imponga atribución. [Dedicación CC0 y texto legal](https://creativecommons.org/publicdomain/zero/1.0/).

El procedimiento completo, fuentes y límites están en [modelos/referencias/RECURSOS.md](modelos/referencias/RECURSOS.md). `descarga.json` conserva el origen del GLB original y `conversion.json`, las extracciones. `herramientas/preparar-referencias.mjs` usa glTF Transform 4.2.1, ya disponible para desarrollo; no añade una dependencia a la web. El catálogo declarativo es `modelo-referencias.js`.

La galería es una sección separada. Los modelos externos **no reemplazan** el contexto del fibroblasto ni las curvas de sus simulaciones. La célula genérica OrganUI incluye microvellosidades; sus cantidades, colores y tamaños no deben interpretarse como mediciones del fibroblasto. El reencuadre independiente impide deducir escala biológica comparando tamaños en pantalla.

La licencia OFL de Manrope, CC0 de OrganUI y MIT del fibroblasto original son permisos **distintos y limitados a sus recursos**. Ninguno concede una licencia nueva al GLB aportado por el usuario o al conjunto heredado del proyecto.

## Atribuciones que acompañan a las imágenes

- **ImageJ, FluorescentCells**, preparación Molecular Probes; autor individual no identificado. [Descripción](https://imagej.net/ij/images/FluorescentCells.txt) y [dominio público](https://commons.wikimedia.org/wiki/File:FluorescentCells.jpg). Composición original sin modificaciones.

ImageJ documenta endotelio bovino, F-actina con Texas Red-X–faloidina, tubulina con inmunomarcaje BODIPY FL anti-IgG de ratón y ADN con DAPI. No se atribuye modalidad confocal no documentada. Esta muestra forma parte de una colección de doce muestras para diecinueve estructuras. Las fichas completas y los once archivos nuevos se documentan en FUENTES_MICROSCOPIA.md y microscopia/procedencia-coleccion.json. Se retiraron las entradas sin imagen y el PNG Allen/BBBC034 cuyo marcador concreto no estaba confirmado. La muestra no se presenta como el fibroblasto esquemático ni como señal completa de un organelo.

## Cada estructura del modelo

Todas las filas son geometrías **originales esquemáticas** de `celula-3d.js`, con autoría Celma, MIT limitada y exportación conjunta por GLTFExporter. Los enlaces fundamentan la organización biológica, no son fuentes de una malla descargada. Las fichas y fuentes individuales también están en `celula-config.js`.

| Estructura | Representación y fundamento |
|---|---|
| Membrana | Contorno irregular aplanado; [membranas](https://www.ncbi.nlm.nih.gov/books/NBK9928/) |
| Núcleo | Elipsoide excéntrico elevado; [compartimentación](https://www.ncbi.nlm.nih.gov/books/NBK26907/) |
| Nucléolo | Región interna sin membrana; [nucléolo](https://www.ncbi.nlm.nih.gov/books/NBK9939/) |
| Envoltura nuclear | Cubiertas/poros exagerados; [transporte nuclear](https://www.ncbi.nlm.nih.gov/books/NBK26932/) |
| Mitocondrias | Tubos/cápsulas y crestas esquemáticas; [mitocondrias](https://www.ncbi.nlm.nih.gov/books/NBK9896/) |
| RE rugoso | Cisternas perinucleares con ribosomas citosólicos; [RE](https://www.ncbi.nlm.nih.gov/books/NBK9889/) |
| RE liso | Túbulos del RE; [estructura del RE](https://pmc.ncbi.nlm.nih.gov/articles/PMC5614462/) |
| Golgi | Cisternas curvas yuxtanucleares; [posicionamiento](https://pmc.ncbi.nlm.nih.gov/articles/PMC3101843/) |
| Ribosomas | Puntos sobredimensionados; [traducción](https://www.ncbi.nlm.nih.gov/books/NBK9849/) |
| Lisosomas | Compartimentos representativos; [fisiología](https://pubmed.ncbi.nlm.nih.gov/25668017/) |
| Peroxisomas | Cuerpos dispersos; [peroxisomas](https://www.ncbi.nlm.nih.gov/books/NBK9930/) |
| Endosomas | Ejemplos periféricos/internos; [endocitosis](https://www.ncbi.nlm.nih.gov/books/NBK9831/) |
| Vesículas | Cargas representativas; [compartimentación](https://www.ncbi.nlm.nih.gov/books/NBK26907/) |
| Centrosoma | Material pericentriolar yuxtanuclear; [organización](https://pmc.ncbi.nlm.nih.gov/articles/PMC8465925/) |
| Centriolos | Par de cilindros esquemáticos; misma referencia centrosomal |
| MT | Curvas radiales que evitan núcleo; [MT y MAP](https://pmc.ncbi.nlm.nih.gov/articles/PMC5983186/) |
| Actina | Córtex, haces basales y ramas; [actina](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968159/) |
| IF | Red representativa de vimentina; [plectina en fibroblastos](https://pmc.ncbi.nlm.nih.gov/articles/PMC3158638/) |

Colores, grosor, cantidades y posiciones no son mediciones. Continuidad RE/envoltura, reguladores, adaptadores y contactos no se resuelven con precisión ultrastructural. El GLB es una instantánea estática; los motores web calculan las dinámicas.

## Referencias investigadas sin incorporar activos

[Allen Cell datos](https://www.allencell.org/data-downloading.html), [herramientas](https://www.allencell.org/tools-and-resources-overview.html), [IMSC](https://imsc.allencell.org/), [GitHub](https://github.com/AllenCell) y [AWS](https://registry.opendata.aws/allen-cell-imaging-collections/) ofrecen software, volúmenes, segmentaciones o representaciones integradas. En esas referencias Allen no se verificó una malla celular completa reutilizable con licencia individual; esto es independiente de la referencia esquemática OrganUI CC0 incorporada después. No se extrajeron activos de visores ni se dedujeron permisos de datos desde licencias de código. Los [términos Allen Cell](https://www.allencell.org/terms-of-use.html) no se sustituyen por una afirmación genérica de CC BY; BBBC034 sí declara expresamente su licencia individual.

Las estructuras sin imagen documentada se excluyen de la colección de microscopía; no se muestran espacios reservados. El PNG de BBBC034 tampoco forma parte de los activos publicados. No se descargaron ni reconstruyeron volúmenes, mitocondrias, IF o segmentaciones sin comprobar muestra y permisos.

## Ampliación visual y sonora del 1 de noviembre

Los once archivos microscópicos nuevos tienen sus licencias individuales y atribuciones en [FUENTES_MICROSCOPIA.md](FUENTES_MICROSCOPIA.md). Se conservaron los bytes originales. Las fotografías decorativas se presentan con opacidad y máscara CSS; se muestran los créditos al pie del explorador. Los tonos se sintetizan mediante Web Audio: no se incorporan grabaciones ni música externa.
