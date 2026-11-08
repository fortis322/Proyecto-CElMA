# Modelos científicos educativos de Celma

Este documento describe los modelos **implementados** en `celula-3d.js`, `celula-config.js`, `relaciones-celulares.js`, `simulacion-motor.js`, `simulacion-actina.js` y `simulacion-transporte.js`, y su uso mediante `sandbox-config.js` y `sandbox-ui.js`. La bibliografía respalda sus principios biológicos; los coeficientes, las geometrías y las reglas simplificadas no son ajustes a datos experimentales.

> Simulación educativa basada en principios de biología celular. Los resultados representan un modelo simplificado y no sustituyen mediciones experimentales.

## Contexto celular y fidelidad

La referencia es un **fibroblasto animal adherente en interfase**, extendido sobre un sustrato. Tiene un contorno irregular y aplanado, un núcleo elevado, una periferia delgada, Golgi yuxtanuclear, retículo perinuclear y tubular, mitocondrias citoplásmicas, red de microtúbulos principalmente centrosomal, actina cortical/basal y vimentina perinuclear. Es una organización representativa, no una célula animal universal. Los centros organizadores no centrosomales y las diferencias entre tipos celulares no se reproducen por completo. Véanse [Sánchez y Feldman: centros organizadores](https://pmc.ncbi.nlm.nih.gov/articles/PMC5362366/) y [Wiche y Winter: arquitectura de vimentina](https://pmc.ncbi.nlm.nih.gov/articles/PMC3158638/).

La geometría identifica 18 componentes: membrana, núcleo, nucléolo, envoltura nuclear, mitocondrias, RE rugoso, RE liso, Golgi, ribosomas, lisosomas, peroxisomas, endosomas, vesículas, centrosoma, centriolos, microtúbulos, actina y filamentos intermedios. La entrada virtual «Citoesqueleto» agrupa las tres redes, dando **19 entradas del catálogo con guías introductorias**. Las guías se habilitan mediante `CELMA_CELL_CONFIG.modules` y sus destinos `moduleUrl`. Su disponibilidad no significa que todos los orgánulos tengan un simulador completo: la **simulación avanzada sigue limitada al citoesqueleto**, con los tres laboratorios documentados aquí.

Los números de estructuras, posiciones y proporciones son decisiones didácticas. Se exageran filamentos, ribosomas, poros y vesículas; las transparencias y los cortes de algunas mitocondrias facilitan la observación. La envoltura nuclear se señala como doble membrana, pero su representación de superficie no resuelve dos bicapas lipídicas. El RE rugoso y liso representan dominios de una red continua mediante cisternas y túbulos resumidos. Los colores identifican componentes y no son colores naturales ni canales fluorescentes. No se calibra la geometría en micrómetros.

Vimentina citoplásmica y láminas nucleares son familias distintas de filamentos intermedios. Los vínculos entre citoesqueleto y envoltura nuclear requieren adaptadores; no se representa un filamento citoplásmico atravesando ambas membranas. Los esquemas de huso y citocinesis pertenecen al contexto de división y se presentan aparte del modelo de interfase.

Las referencias externas de **OrganUI**, dedicadas a **CC0 1.0**, son modelos geométricos educativos genéricos y se abren por separado. No son datos experimentales ni reconstrucciones de microscopía y no sustituyen las rutas del fibroblasto utilizadas por los motores. Su procedencia, licencia y extracción están documentadas en [modelos/referencias/RECURSOS.md](modelos/referencias/RECURSOS.md).

## Separación entre cálculo y visualización

`CELMA_SIMULATIONS` registra definiciones mediante `register` y crea motores mediante `create(id, parameters, seed)`. Cada motor proporciona `getParameters`, `setParameters`, `step`, `advance`, `snapshot`, `getHistory` y `reset`. Los módulos calculan estados numéricos sin depender del DOM ni de Three.js. La visualización consume esos estados: longitudes, ramas, rutas y posiciones no proceden de animaciones pregrabadas independientes de los controles.

`reset()` conserva los parámetros actuales y restablece tiempo, semilla y estado inicial. Restaurar la referencia en la interfaz crea un motor con los valores predeterminados. Cambiar `initialSeeds` de microtúbulos o actina, o `cargoCount` de transporte, requiere reiniciar. Los demás parámetros actualizan el estado de las siguientes etapas; los cambios de orientación se aplican gradualmente y retirar rutas no cambia instantáneamente la posición de una carga.

### Mesa sandbox: combinar condiciones

El sandbox empieza sin polímeros ni cargas y traduce tarjetas de componentes o condiciones a **parámetros de estos mismos motores**. Los ingredientes representan disponibilidades, sitios, semillas, motores efectivos o condiciones normalizadas; reunir tarjetas **no representa una reacción química**, una estequiometría ni una mezcla experimental instantánea.

Al combinar una selección se crea su condición inicial y se calculan **6 τ** para mostrar una primera vista del estado. Después continúa la reproducción automáticamente cuando está activo el laboratorio, salvo si el usuario tiene activada la preferencia de movimiento reducido. En ese caso la vista calculada queda pausada y puede avanzarse manualmente. Los 6 τ corresponden al tiempo del modelo y no a seis segundos ni a un resultado biológico medido.

Las dependencias se aplican en el cálculo, no solo en los mensajes de la interfaz:

- Microtúbulos: con cero semillas y nucleación cero, añadir solo tubulina no inicia una red. Sin tubulina no hay elongación ni nacimientos; las condiciones de estabilización, catástrofe o rescate no aportan subunidades.
- Actina: la ramificación requiere un filamento progenitor elegible. Sin semillas y sin nucleación primaria no aparece una red por añadir únicamente monómeros y ramificador. Una semilla existente sí puede elongar con monómeros o perder longitud por recambio, según los parámetros.
- Transporte: sin cargas no hay vesículas que desplazar; sin microtúbulos disponibles los motores no mueven sus cargas; con rutas pero sin motores activos, las cargas pendientes esperan. Interrumpir y reparar rutas modifica esa misma corrida sin teletransportar sus vesículas.

Los parámetros avanzados y las preguntas conservan las condiciones de referencia anteriores: 14 microtúbulos iniciales y 26 cargas con red disponible. El sandbox usa condiciones iniciales vacías para que la incorporación de cada elemento sea explícita.

### Tiempo, azar e historial

- Tiempo `τ`, longitudes, disponibilidades, tasas y velocidades están **normalizados**. No equivalen a segundos, micrómetros, concentraciones medidas ni fuerzas.
- Paso de integración fijo `h = 1/60`. `advance(duración)` acumula fracciones de paso y ejecuta pasos completos; la velocidad de reproducción cambia la cantidad de tiempo simulado por tiempo de pantalla, no las ecuaciones.
- En MT y actina, los sorteos dependen de semilla, identidad, paso y tipo de evento mediante una función entera por contador. En transporte se calculan rankings deterministas de rutas, disponibilidad y motores. No se usa el framerate como fuente de azar.
- Para una tasa normalizada `k`, la probabilidad de evento por paso es `1 − exp(−k·h)`. Los eventos son aproximados por pasos discretos; no se resuelven múltiples transiciones del mismo filamento dentro de un paso.
- Historial: una muestra cada `0.25 τ`, máximo 1.200 muestras. Corridas largas conservan una ventana reciente de aproximadamente 300 τ. Los eventos recientes se limitan a 256 por llamada; los contadores acumulados de cada motor son independientes de ese límite.
- La tubulina y la actina soluble se tratan como disponibilidades mantenidas por un **reservorio ideal abierto**. No se calcula conservación global, agotamiento de monómeros, síntesis proteica ni balance metabólico.

## 1. Dinámica de microtúbulos

Archivo: `simulacion-motor.js`; identificador: `microtubules`.

Se simulan **26 rutas potenciales**, con un número inicial configurable mediante **`initialSeeds ∈ [0,26]`**, entero, y **14 filamentos como referencia**. Se distribuyen por las rutas al reiniciar; con cero semillas no se introducen filamentos ocultos. Cada filamento tiene longitud `ℓ ∈ [0,1]`, una ruta y estado `inactive`, `growing` o `shrinking`. El extremo menos está anclado. Las longitudes iniciales son `0.08 + 0.24·u`, con `u` determinado por la semilla. Los nacimientos activan una semilla de longitud `0.003`, una resolución geométrica educativa.

| Control | Símbolo | Rango | Referencia |
|---|---|---:|---:|
| Tubulina disponible | T | 0–2 | 1 |
| Multiplicador de crecimiento | G | 0–2 | 1 |
| Catástrofe relativa | C | 0–2 | 1 |
| Rescate relativo | R | 0–2 | 1 |
| Nucleación relativa | N | 0–2 | 1 |
| Estabilización relativa | S | 0–1 | 0.2 |
| Microtúbulos iniciales (`initialSeeds`) | — | 0–26, entero | 14 |

Ecuaciones implementadas:

```text
v_crecimiento = 0.075 · G · max(T − 0.12, 0)
v_acortamiento = 0.18
k_catástrofe = 0.25 · C · (1 − 0.9 · S)
k_rescate = 0.18 · R
k_nacimiento = 0.18 · N · T / (0.25 + T)
P_evento = 1 − exp(−k_evento · h)
```

Todos los coeficientes son elecciones normalizadas. En particular, `0.12` no es una concentración crítica medida ni universal. En crecimiento se suma `v_crecimiento·h` hasta el límite; en acortamiento se resta `0.18·h` hasta cero. Catástrofe es la transición a acortamiento, y rescate la transición inversa. Llegar al borde no se cuenta como catástrofe. Al llegar a cero el sitio queda inactivo y requiere un nacimiento posterior. La estabilización reduce únicamente la tasa de catástrofe en esta versión.

El estado `growing` no garantiza elongación positiva si falta tubulina o se alcanzó el borde. Con `T=0` no hay elongación ni nacimientos, pero los filamentos presentes no desaparecen de inmediato. Con `initialSeeds=0` y `N=0`, la red permanece vacía aunque haya tubulina. Con `C=0` no hay catástrofes espontáneas; con `R=0` no hay rescates.

Métricas: longitud total, media entre polímeros presentes, número presente, número en cada estado, catástrofes, rescates y nacimientos acumulados. `quantity = Σℓ/26` expresa una fracción de la capacidad visual, no una concentración. Las gráficas muestran longitud, cantidad relativa, evolución de estados y eventos de transición acumulados.

La inspiración experimental es la alternancia estocástica entre elongación y acortamiento y la dependencia de incorporación respecto a tubulina. [Walker et al. (1988)](https://pubmed.ncbi.nlm.nih.gov/3170635/) estudiaron condiciones in vitro con tubulina purificada; sus constantes no se han trasplantado a este fibroblasto. La complejidad omitida se contextualiza en [Goodson y Jonasson (2018)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5983186/).

## 2. Redes de actina

Archivo: `simulacion-actina.js`; identificador: `actin`.

El motor usa **24 sitios primarios**, **6 semillas de referencia**, hasta **96 filamentos visibles** y longitud máxima **1.2**. Las semillas iniciales se pueden elegir entre 0 y 8 y solo cambian el estado al reiniciar. La posición de cada sitio y su longitud inicial, `0.12 + 0.1·u`, dependen de la semilla, no del suministro de monómeros.

| Control | Símbolo | Rango | Referencia |
|---|---|---:|---:|
| Monómeros disponibles | A | 0–2 | 1 |
| Nucleación primaria | N | 0–2 | 1 |
| Ramificación | B | 0–2 | 1 |
| Recambio | D | 0–2 | 1 |
| Organización cortical | O | 0–1 | 0.7 |
| Semillas iniciales | — | 0–8, entero | 6 |

Ecuaciones implementadas:

```text
v_incorporación = 0.055 · A
v_pérdida = 0.018 · D
dℓ/dτ = v_incorporación − v_pérdida
k_raíz = 0.16 · N · A / (0.25 + A), por sitio primario libre
k_rama = 0.08 · B · A / (0.25 + A) · longitud_del_padre
P_evento = 1 − exp(−k_evento · h)
```

Una rama requiere padre presente, longitud paterna mínima `0.18` y sitio geométrico válido. Nace a **70°** respecto al padre, en un punto entre el 25 % y el 75 % de su longitud, y se permiten hasta tres generaciones de ramificación. La semilla de una rama o raíz nueva mide `0.003`. Los sitios, la profundidad y el límite 96 son restricciones educativas y de rendimiento, no saturaciones biológicas.

Las ramas conservan su distancia de anclaje y siguen ese punto del padre cuando cambia la orientación. Si el padre desaparece o pierde el segmento que sostiene una rama, esta y sus descendientes se retiran. Es una simplificación de desensamblaje: no se modelan fragmentos desprendidos ni su posterior difusión o reciclaje.

### Organización espacial simplificada

La red del laboratorio se proyecta sobre el plano basal `Y=0.18`, por debajo de la región nuclear, dentro de la elipse conservadora `(X/5.3)² + (Z/2.8)² ≤ 1`. No pretende resolver todo el córtex tridimensional. La longitud se limita también por la intersección geométrica con ese contorno.

`O` interpola la orientación objetivo de las raíces entre direcciones hacia el interior y tangentes periféricas. Las raíces conservan sus anclas y el ángulo se acerca gradualmente al objetivo mediante `Δángulo = 0.4·h·diferencia_angular`. Las ramas mantienen su ángulo respecto al padre y actualizan sus puntos de anclaje. Es una regla geométrica explícita que permite explorar patrones; no una solución de fuerzas, capping, flujo retrógrado o remodelado molecular.

`corticalFraction` estima la fracción de longitud en una banda periférica, radio elíptico normalizado ≥0.73, mediante cinco muestras por filamento. `quantity = Σℓ/(96·1.2)`. Las métricas incluyen longitud media/total, número, ramas presentes, nacimientos y pérdidas acumuladas; las gráficas distinguen organización, cantidad y recambio.

Con `A=0` no nacen raíces ni ramas, pero las semillas existentes pueden perder longitud por `D`. Con cero semillas y `N=0`, aumentar `B` no crea una red sin padre. Reducir nucleación no elimina instantáneamente filamentos existentes. El modelo resume mecanismos descritos en [Pollard: actina y proteínas asociadas](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968159/), [redes ramificadas](https://pmc.ncbi.nlm.nih.gov/articles/PMC9018471/) y [mecanismos de nucleación](https://pmc.ncbi.nlm.nih.gov/articles/PMC3073586/).

## 3. Transporte intracelular

Archivo: `simulacion-transporte.js`; identificador: `transport`.

Se representan **26 rutas potenciales** y una población inicial configurable mediante **`cargoCount ∈ [0,26]`**, entero, con **26 cargas como referencia**, una por ruta. La presencia de las rutas se controla mediante **`networkAvailability ∈ [0,1]`**, con referencia **1**. La coordenada `s∈[0,1]` va desde el extremo menos interno al extremo más periférico. Se representan específicamente **cinesina-1 hacia más** y **dineína citoplasmática-1 hacia menos**; no se generaliza esa dirección a toda cinesina.

| Control | Rango | Referencia |
|---|---|---|
| Velocidad relativa | 0–2 | 1 |
| Integridad de rutas | 0–1 | 1 |
| Motor efectivo | `mixed`, `kinesin1`, `dynein1` | `mixed` |
| Disponibilidad de motores | 0–1 | 1 |
| Vesículas iniciales (`cargoCount`) | 0–26, entero | 26 |
| Disponibilidad de microtúbulos (`networkAvailability`) | 0–1 | 1 |

```text
ds/dτ = 0.06 · speed · signo
signo = +1 para cinesina-1; −1 para dineína citoplasmática-1
rutas_presentes = round(26 · networkAvailability)
sitios_con_trayecto_íntegro = round(26 · integrity)
sitios_habilitados_para_motor = round(26 · motorAvailability)
```

Los coeficientes no son velocidades en unidades físicas. Presencia de red, integridad y disponibilidad de motores utilizan rankings independientes derivados de la semilla. Disminuir cada control conserva un subconjunto reproducible de sus sitios anteriores; no vuelve a sortear toda la red. Solo una ruta presente e íntegra cuenta como ruta disponible y continua en las métricas. Los motores se habilitan sobre los 26 sitios potenciales: con una población menor puede haber menos cargas activas que sitios habilitados. No se inventan pausas aleatorias ni una fuerza de motor.

La población de referencia contiene trece cargas en `s=0.1` y trece en `s=0.9`, asignadas por la semilla **independientemente del parámetro motor**. En `mixed`, esa población completa utiliza trece motores de cada tipo. Poblaciones menores toman un subconjunto de las rutas y no tienen por qué estar equilibradas. En un modo uniforme algunas cargas parten próximas a su destino: es necesario declararlo para comparar direcciones desde la misma población física inicial. Cambiar `cargoCount` requiere reiniciar; con cero cargas todas las métricas de movimiento son cero y permanecen finitas.

Cada ruta distingue `available` —si existe— de `intact` —si tiene un intervalo roto—. Una ruta ausente bloquea su carga pendiente en cualquier posición, incluso fuera del intervalo de interrupción y aunque tenga un motor activo. Retirarla no traslada la carga; reponerla permite reanudar el transporte si se cumplen las condiciones restantes. Con `networkAvailability=0` no hay movimiento activo sobre la red ausente.

Las rutas interrumpidas tienen un intervalo ausente entre `0.42` y `0.58`. Una carga se detiene en el borde que intentaría cruzar. Si una interrupción aparece cuando la carga ya está dentro del intervalo, conserva exactamente su posición y se bloquea allí; no se traslada al borde. Reparar la ruta permite reanudar movimiento. Una carga que ya está al otro lado puede continuar hacia su destino sin cruzar la brecha.

Estados: `running`, `blocked`, `waiting` y `delivered`. Una carga pendiente sin ruta queda bloqueada; si la ruta existe pero falta actividad motora, espera. Las cargas entregadas conservan su destino aunque se retire la ruta o el motor. No hay reciclaje automático. Cambiar el motor efectivo puede iniciar el trayecto opuesto, conservando la posición; el retorno también requiere una ruta y actividad motora disponibles.

Se distingue desplazamiento firmado, `s(τ)−s(0)`, de distancia recorrida, `Σ|Δs|`. Invertir sentido puede reducir el primero mientras la segunda aumenta. La media de una mezcla bidireccional puede ser casi cero aunque ambas poblaciones se muevan. Las medias se dividen entre el número real de cargas presentes; sin cargas se devuelve cero. Las curvas agrupadas por motor usan el motor actual y conservan la referencia de posición inicial. `quantity = número_de_rutas_presentes_e_íntegras / 26`, no cantidad de polímero ni masa de vesículas.

Referencias: [Reck-Peterson et al.: maquinaria de dineína y cargas](https://pmc.ncbi.nlm.nih.gov/articles/PMC6457270/), [Barlan y Gelfand: transporte y organización de orgánulos](https://pmc.ncbi.nlm.nih.gov/articles/PMC5411697/) y [dineína citoplásmica frente a ciliar](https://pmc.ncbi.nlm.nih.gov/articles/PMC6103457/).

## Comparación A/B y alcance de las conclusiones

La interfaz usa semilla **417** y horizonte **25 τ**. Capturar A guarda sus parámetros, módulo y semilla; comparar crea dos motores nuevos desde el inicio, con A y B, y ejecuta el mismo horizonte. No compara el estado actual de una corrida envejecida con una condición recién creada. El visor muestra B y las gráficas conservan ambas condiciones. La fábrica del motor tiene semilla predeterminada 12345 para uso programático, independiente de la elegida por la interfaz.

Se mantienen semilla, reglas de inicialización, sitios/rutas potenciales y número de pasos. Si se cambia una condición inicial, como número de semillas u orientación cortical, esa diferencia forma parte de la condición comparada; no se afirma que toda coordenada y población sean idénticas bajo cualquier parámetro. En transporte, las posiciones iniciales se mantienen incluso al comparar motores distintos.

Una sola realización de 25 τ no estima una media poblacional ni demuestra significación estadística. No se generan conclusiones experimentales, dosis, unidades calibradas ni predicciones clínicas. Cambiar parámetros estocásticos puede producir trayectorias diferentes sin que una métrica final deba cambiar monótonamente en cada corrida. La comparación no incluye réplicas, intervalos de confianza, sensibilidad global o calibración contra datos.

## Doce relaciones científicas

Los registros declaran participantes, tipo, contexto, explicación, acción visual y bibliografía. Una conexión **de transporte** es una ruta de carga; una **mecánica** supone transmisión de fuerzas, a menudo mediada por adaptadores; una **espacial** señala organización o posicionamiento; una **funcional** relaciona mecanismos. Una línea o un flujo educativo no debe interpretarse automáticamente como contacto molecular directo.

| Registro | Tipo / contexto | Mecanismo resumido y fuente |
|---|---|---|
| `mt-vesicle-transport` | Transporte / interfase | Cargas se desplazan mediante motores específicos sobre MT polarizados. [Reck-Peterson et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6457270/) |
| `mt-mitochondria-distribution` | Transporte / interfase | Motores, regulación y anclajes contribuyen a la distribución mitocondrial. [Cooper: motores de MT](https://www.ncbi.nlm.nih.gov/books/NBK9833/) |
| `mt-golgi-positioning` | Espacial / interfase | MT y dineína contribuyen al Golgi yuxtanuclear; el centrosoma no es su único determinante. [Yadav y Linstedt](https://pmc.ncbi.nlm.nih.gov/articles/PMC3101843/) |
| `mt-reticulum-organization` | Funcional / interfase | Túbulos del RE pueden deslizarse sobre MT o acoplarse a extremos mediante mecanismos como STIM1/EB1. [Grigoriev et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC2600655/) |
| `mt-mitotic-spindle` | Funcional / esquema de división | La red se reorganiza para formar el huso; no se añade un huso permanente a la interfase. [Petry](https://pmc.ncbi.nlm.nih.gov/articles/PMC5016079/) |
| `actin-cell-morphology` | Mecánica / interfase | Redes de actina pueden contribuir a deformación de membranas; intervienen más reguladores y cargas. [Redes ramificadas de actina](https://pmc.ncbi.nlm.nih.gov/articles/PMC9018471/) |
| `actin-cell-migration` | Mecánica / interfase | Protrusión, adhesión, tracción y liberación coordinadas contribuyen a migración del fibroblasto. [Cooper: actina, miosina y movimiento](https://www.ncbi.nlm.nih.gov/books/NBK9961/) |
| `actin-myosin-contraction` | Mecánica / interfase | Miosina II no muscular genera tensión en conjuntos de actina; los filamentos no necesitan acortarse. [Svitkina](https://pmc.ncbi.nlm.nih.gov/articles/PMC5749151/) |
| `actin-peripheral-traffic` | Transporte / interfase | Redes corticales y ciertas miosinas transportadoras participan en tráfico y retención local; no se atribuye a miosina II. [Barlan y Gelfand](https://pmc.ncbi.nlm.nih.gov/articles/PMC5411697/) |
| `actin-cytokinesis` | Mecánica / esquema de división | Sistema actomiosínico dinámico contribuye al surco, mostrado separado de la célula de interfase. [Pollard y O’Shaughnessy](https://pmc.ncbi.nlm.nih.gov/articles/PMC6588489/) |
| `if-nuclear-mechanics` | Mecánica / interfase | Vimentina y conexiones indirectas por adaptadores/LINC relacionan mecánica citoplásmica y nuclear; las láminas son distintas. [IF y mecanorrespuesta](https://pmc.ncbi.nlm.nih.gov/articles/PMC9035595/) |
| `if-adhesions-integrity` | Mecánica / interfase | Plectina puede enlazar vimentina con adhesiones del fibroblasto; queratina/desmosomas son un contexto epitelial diferente. [Wiche y Winter](https://pmc.ncbi.nlm.nih.gov/articles/PMC3158638/) |

## Aspectos no resueltos

Los laboratorios no resuelven estados ATP/ADP o GTP/GDP, casquete GTP, estructura de protofilamentos, isoformas reguladoras, hidrólisis, difusión molecular, fuerzas, elasticidad de filamentos, deformación mecánica calibrada, señalización o consumo energético. Los motores son efectivos; no se calcula competencia entre motores, unión de adaptadores, tráfico colectivo ni intercambio entre rutas. Las relaciones con miosina muestran un mecanismo educativo, sin motor mecanoquímico de miosina ni medida de tensión. Tampoco se ejecuta un ciclo celular completo, huso cuantitativo o división real de la geometría de interfase.

Los límites de capacidad, intervalos de interrupción, semillas y reglas de orientación están declarados para evitar confundir decisiones de implementación con leyes biológicas. La geometría completa y las simulaciones locales tienen niveles de simplificación diferentes: las redes dinámicas del laboratorio no reconstruyen todas las fibras del modelo estático.

## Pruebas numéricas reproducibles

Solo requieren Node.js y sus módulos incluidos. Desde la carpeta del proyecto:

```bash
node pruebas/run.cjs
```

El ejecutor también funciona desde otro directorio usando su ruta. Los archivos de prueba localizan los motores respecto a `__dirname`; no dependen de `/workspace` ni de paquetes instalados.

- `test-simulacion.js`: determinismo, independencia del framerate, tubulina/catástrofe/rescate/nucleación a cero, ecuación de elongación, límites, reinicio e historial acotado.
- `test-laboratorios.js`: convivencia de los tres registros, actina sin monómeros o padre, anclajes y ángulos, contorno, cambio cortical gradual, pérdidas, transporte con brechas, reparación, disponibilidad y comparación de desplazamiento/distancia.
- `test-transporte.cjs`: polaridad, ecuación, población inicial compartida A/B, rankings monotónicos, interrupción sin teletransporte, reversión, conservación de entregas al retirar motores, reinicio y copias de estado independientes.
- `test-sandbox-motores.cjs`: conserva las corridas de referencia anteriores y comprueba semillas y cargas configurables, estados vacíos finitos, motores sin MT inmóviles, retirada/reposición de rutas sin saltos, rankings independientes y condiciones iniciales aplicadas al reiniciar.

Estas verificaciones comprueban coherencia numérica y cumplimiento de las reglas documentadas. No validan el modelo contra un experimento biológico ni sustituyen la revisión visual de la interfaz.
