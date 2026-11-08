# Implementación celular de Celma

Edición del **1 de noviembre de 2026**. La web mantiene su fondo claro, texto azul y paneles translúcidos. Incluye una célula animal completa **esquemática**, 19 recorridos introductorios, relaciones científicas, un laboratorio con tres motores numéricos, 29 medallas locales, microscopía documentada y una galería separada de modelos externos. El encabezado del explorador presenta **CITOESQUELETO** en mayúsculas con Manrope local, licencia OFL 1.1, y ya no incluye el subtítulo de instrucciones. La herramienta de pincel se retiró de la interfaz.

## Auditoría y respaldo

Se inspeccionaron todos los archivos, dependencias, modelos, animaciones, controles, estilos y almacenamiento antes de programar: [AUDITORIA_TECNICA.md](AUDITORIA_TECNICA.md). No había un repositorio Git operativo. Se creó y comprobó un ZIP completo antes de cambios importantes; queda fuera de esta entrega, en `respaldo/Celma-antes-celula-completa.zip` del espacio de trabajo.

La ampliación celular del 18 de octubre siguió las seis fases: auditoría; célula y catálogo; relaciones; microtúbulos; actina/transporte; microscopía y optimización. El registro histórico de la edición del 23 de octubre menciona el respaldo `/workspace/respaldo/Celma-antes-sandbox-2026-10-23.zip`. La revisión actual parte del proyecto entregado en `Celma-sandbox-medallas.zip`; ese respaldo histórico no forma parte de esta entrega.

## Qué se implementó

### Célula y catálogo

El modelo representa un **fibroblasto adherente y extendido en interfase**. Tiene contorno irregular aplanado, núcleo excéntrico elevado, Golgi/centrosoma yuxtanucleares, RE perinuclear y tubular, mitocondrias citoplásmicas, actina cortical/basal, MT radiales y vimentina central. No se colocaron todos los organelos aleatoriamente en una esfera.

Hay dieciocho componentes físicos: membrana plasmática, núcleo, nucléolo, envoltura nuclear, mitocondrias, RE rugoso, RE liso, Golgi, ribosomas, lisosomas, peroxisomas, endosomas, vesículas, centrosoma, centriolos, MT, actina e IF. Las tres últimas familias se agrupan como Citoesqueleto en el catálogo.

Se puede girar, acercar y desplazar la cámara, seleccionar superficies accesibles o entradas del catálogo, enfocar, ocultar, ajustar opacidad, aislar y restaurar el conjunto. Las cubiertas transparentes dejan pasar los clics hacia el interior; se seleccionan directamente desde el catálogo. Hay etiquetas y fichas científicas introductorias con fuentes.

El catálogo dispone de **19 recorridos introductorios**: los 18 componentes físicos y la entrada conjunta Citoesqueleto. En **Estructuras 3D**, cada recorrido ofrece tres pasos con foco visual, acercamiento, una pregunta conceptual con respuesta explicada y bibliografía. Su contenido está en `organelos-estudio.js`; `celula-config.js` concentra el catálogo y los destinos habilitados. Núcleo, mitocondrias, RE y Golgi ya tienen guía básica; no se describen como módulos inexistentes o bloqueados.

Las **simulaciones avanzadas siguen limitadas al citoesqueleto**: microtúbulos, actina y transporte. Las guías no calculan producción de ATP, expresión génica, síntesis proteica ni otros procesos propios de cada organelo. Un futuro módulo avanzado requiere su motor, interfaz y destino reales; la disponibilidad continúa siendo configurable sin modificar el núcleo del visor.

El modelo nuevo es el predeterminado en 3D. **Modelo anterior** conserva el GLB del usuario; también sigue disponible la importación de otros modelos.

### Relaciones científicas

Doce registros en `relaciones-celulares.js` contienen participantes, tipo, mecanismo, contexto, animación y bibliografía. La navegación usa tarjetas de familia, un dial de conexiones y un carrusel con anterior/siguiente; también admite flechas de teclado sobre el dial y deslizamiento táctil sobre la explicación. Se destacan participantes y se atenúa el contexto, con inicio/pausa/reinicio, velocidad y regreso al conjunto.

Las relaciones distinguen transporte, mecánica, función y organización espacial. Los pulsos no representan contactos moleculares. Vimentina y envoltura se relacionan mediante adaptadores; no se confunden vimentina y láminas nucleares. Huso y citocinesis aparecen en un **esquema de división separado**, manteniendo la célula principal en interfase.

El transporte sigue curvas del modelo. Las relaciones de organización pueden usar señales visuales sin remodelar todos los organelos ni resolver fuerzas. Las proteínas sin malla propia se identifican en la explicación; no se presentan como reconstrucciones experimentales.

### Laboratorio y controles de exploración

El laboratorio abre una **mesa de exploración** en lugar de pedir primero valores numéricos. Se pueden arrastrar ingredientes o seleccionarlos mediante botones, retirarlos, vaciar la mesa y combinar al menos dos elementos. Las tarjetas representan componentes y condiciones; no una reacción química instantánea.

- **Microtúbulos:** tubulina, sitios de nucleación, estabilización, más catástrofes y más rescates. La mesa comienza sin polímeros y sin semillas; hacen falta subunidades y nucleación para iniciar la red.
- **Actina:** monómeros, nucleación primaria, semilla, ramificación Arp2/3, recambio y orientación cortical. Una rama necesita un progenitor; una semilla sin monómeros puede perder longitud.
- **Transporte:** red, vesículas, cinesina-1, dineína citoplasmática-1 e interrupciones. Sin rutas o motores las cargas no se desplazan. **Reparar rutas** conserva la corrida y permite observar si una carga bloqueada continúa hasta su destino.

`sandbox-config.js` transforma cada combinación en parámetros de los mismos motores numéricos. **Combinar selección** reinicia esa condición y calcula una vista tras **6 segundos de simulación**; después puede continuar la reproducción, salvo la preferencia de movimiento reducido. **Avanzar 1 segundo** permite inspeccionar pasos manualmente. El reloj muestra segundos y minutos en una escala didáctica, sin atribuirles equivalencia con el tiempo biológico real. La proyección 2D muestra el estado calculado y **Ver también en la célula 3D** añade la representación en el fibroblasto.

**Ajustes y desafíos** conserva los parámetros mediante controles con nombres y explicaciones sencillos, preguntas guiadas en tarjetas, reproducción, guardado de ajustes y comparación A/B. El cuaderno de observación describe lo que está ocurriendo y propone el siguiente paso. Se retiraron las gráficas y los indicadores de longitud media, cantidad relativa o filamentos presentes de la interfaz. Cambiar a **Mesa de experimentos** vuelve a preparar su condición vacía.

### Tres motores científicos educativos

- **Microtúbulos:** 26 rutas potenciales; crecimiento, acortamiento, catástrofe, rescate y nucleación. Tubulina, elongación, catástrofe, rescate, nucleación y estabilización controlan la dinámica.
- **Actina:** monómeros, nucleación primaria, ramificación desde progenitores, recambio, orientación cortical gradual y semillas iniciales. El límite visual de 96 filamentos es computacional, no una saturación biológica.
- **Transporte:** 26 cargas sobre rutas orientadas de menos a más. Cinesina-1 y dineína citoplasmática-1 tienen sentidos distintos en esta red radial de interfase. Integridad, velocidad y disponibilidad de motores modifican el movimiento. Las cargas se detienen en huecos y continúan al reparar rutas; no saltan segmentos ausentes ni se reciclan automáticamente al llegar.

Todos ofrecen iniciar/pausar, reiniciar, velocidad, parámetros, restaurar referencia, guardar/cargar configuraciones localmente, preguntas guiadas, comparación A/B y fuentes. A/B se recalcula desde el inicio durante **25 segundos de simulación**, con semilla **417** y las mismas reglas de inicialización. Si se cambia una condición inicial, como el número de semillas de actina, esa diferencia forma parte de la condición comparada.

La comparación presenta dos tarjetas con observaciones de A y B y enumera los ajustes que cambiaron. Los motores conservan sus métricas internas e historiales para calcular resultados, verificar medallas y mantener reproducibilidad. La escala normalizada de las ecuaciones se documenta en `MODELOS_CIENTIFICOS.md`; el reloj de la interfaz es una convención de presentación y no una calibración experimental.

La lógica (`simulacion-*.js`), el adaptador 3D (`laboratorio-escena.js`) y los controles/cuaderno (`laboratorio-ui.js`) están separados. La geometría consume longitudes, estados y posiciones calculados; no reproduce clips independientes de los parámetros. El registro admite nuevos motores sin dispersar condiciones en el visor.

El aviso visible figura en los resultados:

> Simulación educativa basada en principios de biología celular. Los resultados representan un modelo simplificado y no sustituyen mediciones experimentales.

Las ecuaciones, coeficientes normalizados, fuentes y límites están en [MODELOS_CIENTIFICOS.md](MODELOS_CIENTIFICOS.md). No se introducen constantes físicas ni conclusiones experimentales inventadas.

### Veintinueve medallas locales

`logros.js` comprueba acciones y estados calculados; `logros-ui.js` y `logros.css` presentan **29 desafíos** en una colección de tarjetas con medalla destacada, progreso y filtros por tema o estado. Los seis temas son exploración, microtúbulos, actina, transporte, método y maestrías. No se utiliza un desplegable para escoger medallas. La presentación respeta la preferencia de movimiento reducido.

Cada medalla muestra su requisito y avance. Las de crecimiento, ramificación y transporte requieren tiempo de simulación y resultados calculados; catástrofes y rescates deben ocurrir en una misma corrida; la reparación exige que la misma carga bloqueada llegue después de reparar sin reiniciar. Los retos de método exigen comparaciones de una sola variable, con semilla y duración comunes de al menos 20 segundos, y comprueban el resultado esperado. Repetir la misma comparación no suma a las colecciones; las maestrías dependen de varios desafíos. La medalla de microscopía requiere tres enfoques observados durante ocho segundos continuos cada uno, además de consultar fuente y licencia.

Se guardan logros y evidencias acumuladas en `localStorage` bajo `celma-medallas-sandbox-v2` cuando el navegador lo permite. Los desbloqueos de la versión anterior no se importan automáticamente, porque cambiaron los requisitos. No hay cuenta, sincronización entre equipos ni certificación académica o experimental. El avance de una corrida no se conserva como una simulación completa al cerrar la página.

### Galería separada de modelos 3D

**Modelos 3D** abre cuatro referencias de **OrganUI** con licencia individual **CC0 1.0**: célula animal, mitocondrias, aparato de Golgi y centrosoma. `modelo-referencias.js` define el catálogo; `modelos-referencia-ui.js` presenta la selección, procedencia, licencia, límites y descarga de cada GLB. Son modelos esquemáticos externos, no datos Allen ni reconstrucciones experimentales.

La célula completa se conserva intacta; los otros tres activos son extracciones de nodos con eliminación de recursos no usados. Sus copias `-local.js` contienen los mismos bytes para apertura local. Se observan en una sección separada y se puede **Volver a la célula de Celma**; no sustituyen las rutas ni el contexto del fibroblasto del laboratorio. El reencuadre de cada archivo no permite comparar tamaños biológicos. Procedimiento y permisos: [modelos/referencias/RECURSOS.md](modelos/referencias/RECURSOS.md).

### Microscopía real

La sección abre la imagen real y permite alternar entre modelo, imagen y comparación con el mismo visor WebGL. Las tarjetas de enfoque sustituyen el selector desplegable. La ficha incluye institución, conjunto, estructura, marcador, técnica documentada, fuente, licencia, atribución y límites.

La muestra ImageJ permite identificar F-actina, señal de tubulina y ADN en una composición multicanal original. Es endotelio bovino, no el fibroblasto del modelo. Al seleccionar una familia se indica el canal que observar; no se recorta ni separa artificialmente la imagen.

La ampliación del 1 de noviembre cubre **19 estructuras mediante 12 muestras documentadas**, con búsqueda, filtros y guías explícitas para las imágenes compartidas. Se retiró la previsualización Allen/BBBC034 porque su página no identifica inequívocamente el canal concreto del PNG; también se retiraron todas las entradas sin imagen verificada. Fuentes, integridad y criterios: [FUENTES_MICROSCOPIA.md](FUENTES_MICROSCOPIA.md).

No se integró un visor volumétrico ni se reconstruyeron mallas desde segmentaciones. Las imágenes estáticas no se presentan como una adquisición 3D.

## Qué se conservó

La presentación del proyecto, título centrado del explorador, navegación al proyecto, paleta blanca/azul, cristal translúcido y animaciones; doce procesos con cuatro etapas 2D; concentración crítica; brújula; reproducción y barra temporal; fragmentos de navegación; ayuda rápida; movimiento reducido; cámara; GLB anterior e importación; y reconocimiento de regiones del modelo.

El pincel y sus controles de edición, borrado, deshacer/rehacer e importación/exportación de marcas ya no forman parte de la interfaz. Los controles del recorrido original reaparecen al volver a Explorador; se ocultan temporalmente durante otras herramientas para evitar instrucciones ajenas al módulo activo.

No se añadieron inicio de sesión, cuenta remota, panel de capas ni el botón de mapa retirado anteriormente. Las nuevas medallas reconocen exploración local del laboratorio. La portada y el nuevo encabezado del explorador usan Manrope alojada en `fuentes/`; el resto del explorador conserva su tipografía del sistema y su estética de cristal claro.

## Recursos e investigación

Se consultaron primero [herramientas Allen Cell](https://www.allencell.org/tools-and-resources-overview.html), [datos](https://www.allencell.org/data-downloading.html), [IMSC](https://imsc.allencell.org/) y [AllenCell GitHub](https://github.com/AllenCell), además del [registro AWS](https://registry.opendata.aws/allen-cell-imaging-collections/).

| Tipo de recurso | Resultado y decisión |
|---|---|
| Mallas GLB/glTF preparadas | En Allen no se verificó una célula completa reutilizable con licencia individual. Se creó el fibroblasto original y se añadieron, en una galería aparte, cuatro referencias OrganUI CC0 verificadas |
| Microscopía volumétrica | OME-TIFF/OME-Zarr y datos multicanal; no equivalen a mallas listas |
| Segmentaciones | Máscaras/anotaciones que requieren escala vóxel, canal, extracción de superficie, suavizado/decimación y revisión |
| Representaciones integradas | Referencia científica como IMSC; no se extrajeron activos sin permisos específicos |
| Software científico | AGAVE, Vol-E, Segmenter y otros; la licencia del código no licencia automáticamente imágenes/datos |

Reconstruir una superficie desde una muestra segmentada es técnicamente viable. No se ejecutó esa conversión: falta seleccionar/verificar muestra, escala, canal y licencia. Combinar organelos medidos en distintas células tampoco daría una célula observada simultáneamente. Se eligió un esquema coherente y explícito.

Los recursos microscópicos incluyen el JPG de ImageJ, su descripción y **once imágenes adicionales**, todas con fichas, licencias, atribuciones y hashes. El PNG de BBBC034 se retiró en la revisión del 28 de octubre. En esta edición se incorporaron además un GLB original de OrganUI y sus tres extractos, sus copias locales, y la fuente Manrope con su licencia. No se descargaron colecciones científicas masivas. Procedencia, permisos y fidelidad: [RECURSOS_Y_LICENCIAS.md](RECURSOS_Y_LICENCIAS.md). Los manifiestos microscópicos están en `microscopia/descargas.json`; los de OrganUI, en `modelos/referencias/descarga.json` y `conversion.json`.

**Ninguna malla nueva se basa en datos experimentales.** La micrografía conservada es una observación real, pero no se usó para calcular la geometría. Todos los organelos y redes 3D son esquemáticos. No hubo descargas masivas de volúmenes ni segmentaciones.

## Rendimiento

Se mantienen HTML/CSS/JavaScript sin framework ni backend y Three.js r180 local. La proyección de la mesa usa Canvas 2D sin nuevas dependencias.

El visor y sus bibliotecas se cargan al abrir 3D. La geometría se construye en siete tandas con progreso y cesión al navegador. El modelo estático suma **45 mallas, 41.283 vértices y 62.152 triángulos**, frente a unos 421.614 triángulos del anterior. Su GLB exportado ocupa **1.663.772 bytes**; la escena inicial usa el constructor progresivo y no necesita descargarlo.

Hay geometrías agrupadas, instancias dinámicas y buffers reutilizados, con animación fuera del modelo pintable/BVH. Se renderiza bajo demanda, se limita DPR a 2, se pausa con la pestaña oculta y se acotan historial a 1.200 muestras y eventos recientes. Las imágenes cargan diferidas; el GLB anterior se abre sólo al solicitarlo. Las cargas se serializan y se protegen cambios rápidos de herramienta. El encuadre usa vértices del contorno aplanado.

No se garantiza una tasa de fotogramas para todo dispositivo. Sin WebGL siguen disponibles los diagramas 2D.

## Ejecutar y probar

1. Descomprimir **todo** el ZIP y mantener juntos archivos/carpetas.
2. Abrir `index.html` y **Iniciar exploración**, o `explorador.html` directamente. Modelos, bibliotecas e imágenes funcionan sin conexión. Las fuentes externas requieren Internet; el guardado depende del navegador.
3. Desarrollo opcional: desde esta carpeta ejecutar `python -m http.server 8000` y abrir `http://localhost:8000/explorador.html`. No se requieren paquetes Python externos.
4. Pruebas numéricas con Node.js: `node pruebas/run.cjs`. Sin npm, navegador, red ni Three.js.

La suite incluye pruebas de reproducibilidad, independencia de fotogramas, controles a cero, ecuaciones, límites, reinicio y muestreo; progenitores/ramas y geometría basal; polaridad de motores, huecos sin teletransporte, reparación, disponibilidad y distancia frente a desplazamiento. `test-sandbox-motores.cjs` y `test-logros.cjs` acompañan a las tres suites originales. Las pruebas de logros se actualizaron para los requisitos de la colección actual.

El registro [pruebas/VERIFICACION.md](pruebas/VERIFICACION.md) conserva las comprobaciones históricas del **23 de octubre** y del 18. Las referencias de ese registro a ocho medallas, gráficas y pincel describen aquellas versiones, no el alcance actual. La apertura directa con `file://` no pudo verificarse en el navegador administrado de esas pruebas; se usó HTTP local.

El navegador administrado usado anteriormente bloqueó `file://` por política; se comprobó entonces mediante HTTP local. La implementación mantiene scripts clásicos y copias locales. Ante restricciones de apertura directa, usar el servidor opcional anterior permite revisar el proyecto sin cambiar su código.

Prueba manual recomendada: recorrer una estructura en sus tres pasos y responder su pregunta; aislarla y restaurar; recorrer el dial y carrusel de Relaciones; combinar tubulina/nucleación, actina/ramificación e interrupción de rutas; reparar la misma corrida y seguir la carga; revisar requisitos y progreso de medallas, comparación A/B y persistencia tras recarga; abrir las cuatro referencias y regresar al fibroblasto; consultar los enfoques y atribuciones de Microscopía real; volver a un proceso 2D. Los resultados son del modelo, no evidencia experimental.

La exportación GLB está incluida. Para regenerarla opcionalmente: `node herramientas/exportar-celula.mjs . /ruta/a/node_modules/three`, con Three.js **0.180.0** y su GLTFExporter. Esa dependencia sólo es necesaria para exportar, no para usar la web ni ejecutar pruebas numéricas.

## Completo y pendiente

**Implementado:** célula esquemática, catálogo configurable, 19 guías de tres pasos con pregunta y fuentes, controles de observación, doce relaciones con dial y carrusel, tres motores y sus visualizaciones, mesa de ingredientes, ajustes/desafíos/comparación/guardado, cuaderno con observaciones, reloj en segundos didácticos, 29 medallas locales, cuatro referencias OrganUI con licencia y doce muestras documentadas para diecinueve estructuras. La colección de microscopía no incluye entradas sin imagen verificada.

**Pendiente deliberado:** simulaciones avanzadas de otros organelos, además de las guías básicas ya disponibles; imágenes específicas verificadas de mitocondrias, IF y demás; reconstrucciones Allen individuales; visor de volúmenes/segmentación; calibración experimental; fuerzas y regulación molecular detalladas; casquete GTP/ATP y proteínas reguladoras resueltas; adaptadores, cambio de ruta, difusión y fusión de cargas. No se presentan como funciones implementadas.

## Interacciones sensoriales

`interfaz-sensorial.js` sintetiza tonos breves por clic y conserva la preferencia de silencio. No inicia audio al cargar. `interfaz-sensorial.css` centra y amplía la navegación, incorpora fotografías semitransparentes y anima el dial; la preferencia de movimiento reducido desactiva su movimiento.
