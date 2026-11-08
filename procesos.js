/* Contenido educativo de CELMA. Los esquemas son didácticos y no están a escala. */
window.CELMA_PROCESSES = [
  {
    id: 'actin-growth',
    component: 'actin',
    title: 'Polimerización de actina',
    short: 'De monómeros libres a un filamento con dos extremos distintos.',
    kicker: 'Actina · ensamblaje',
    description: 'La actina globular (G-actina) forma filamentos polares de actina (F-actina). La nucleación inicia el ensamblaje y la incorporación de monómeros suele ser más rápida en el extremo positivo (+).',
    location: 'Corteza celular y redes próximas a la membrana',
    scale: '≈7 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#50ded0', label: 'Actina / filamento' },
      { color: '#f9cb72', label: 'ATP asociado' }
    ],
    stages: [
      { title: 'Monómeros disponibles', text: 'La G-actina libre puede unirse a ATP. Su concentración y las proteínas reguladoras condicionan el ensamblaje.' },
      { title: 'Nucleación', text: 'Se forma un pequeño núcleo estable, de aproximadamente tres monómeros. En la célula, proteínas como Arp2/3 o las forminas facilitan esta etapa.' },
      { title: 'Elongación', text: 'Se incorporan monómeros a los extremos; el extremo (+), o barbado, suele crecer más rápido. También puede crecer el extremo (−) si las condiciones lo permiten.' },
      { title: 'Maduración', text: 'Después de incorporarse, la actina hidroliza ATP y libera fosfato con el tiempo. El interior más antiguo queda enriquecido en actina-ADP.' }
    ],
    takeaway: 'La polaridad distingue los extremos (+) y (−); no representa una carga eléctrica.',
    notes: 'El esquema separa etapas que se superponen en una célula real. ATP y ADP se unen a la actina; no son subunidades del filamento.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 16
  },
  {
    id: 'actin-shrink',
    component: 'actin',
    title: 'Despolimerización de actina',
    short: 'El filamento pierde subunidades y recicla sus componentes.',
    kicker: 'Actina · desensamblaje',
    description: 'Un filamento se acorta cuando la salida de subunidades supera su incorporación. La concentración de actina libre, el nucleótido y las proteínas reguladoras modifican este balance.',
    location: 'Redes de actina en renovación',
    scale: '≈7 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#50ded0', label: 'Actina / filamento' },
      { color: '#f9cb72', label: 'ATP en monómeros reciclados' }
    ],
    stages: [
      { title: 'Filamento maduro', text: 'Las regiones antiguas contienen más actina-ADP después de la hidrólisis de ATP y la liberación de fosfato.' },
      { title: 'Pérdida de subunidades', text: 'Las subunidades se desprenden de los extremos. Hay acortamiento neto si se incorporan menos monómeros de los que salen.' },
      { title: 'Recambio regulado', text: 'La cofilina puede unirse a regiones enriquecidas en actina-ADP y favorecer el corte y el desensamblaje. Los nuevos extremos cambian la dinámica de la red.' },
      { title: 'Reciclaje', text: 'Los monómeros liberados pueden intercambiar ADP por ATP. Proteínas como la profilina favorecen su reutilización en el ensamblaje.' }
    ],
    takeaway: 'El recambio permite reorganizar la red sin fabricar toda la actina de nuevo.',
    notes: 'Se muestra un extremo que se acorta; ambos extremos pueden perder subunidades. El corte por cofilina también puede generar extremos capaces de crecer, según el contexto.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 14
  },
  {
    id: 'treadmilling',
    component: 'actin',
    title: 'Treadmilling de actina',
    short: 'Entran subunidades por un extremo y salen por el otro.',
    kicker: 'Actina · flujo de subunidades',
    description: 'En determinadas condiciones, la actina se incorpora al extremo (+) mientras se pierde por el extremo (−). Si ambas tasas se equilibran, la longitud media se mantiene aunque las subunidades se renueven.',
    location: 'Filamentos polares de actina',
    scale: '≈7 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#50ded0', label: 'Actina / subunidad marcada' },
      { color: '#f9cb72', label: 'Actina-ATP entrante' }
    ],
    stages: [
      { title: 'Una ventana de concentración', text: 'En el modelo simplificado, la concentración libre está entre las concentraciones críticas de los extremos (+) y (−).' },
      { title: 'Entrada por (+)', text: 'En el extremo (+), la incorporación supera la salida. Entran monómeros de actina, a menudo unidos a ATP.' },
      { title: 'Salida por (−)', text: 'En el extremo (−), la salida supera la incorporación. Las regiones más antiguas suelen estar enriquecidas en actina-ADP.' },
      { title: 'Longitud casi constante', text: 'Cuando las tasas netas se igualan, el filamento conserva aproximadamente su longitud. Una subunidad marcada cambia de posición relativa respecto a los extremos.' }
    ],
    takeaway: 'Una longitud estable puede esconder un recambio continuo de subunidades.',
    notes: 'El treadmilling no implica que el filamento entero se traslade. En células, proteínas que bloquean o cortan extremos alteran este modelo de filamento libre.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 18
  },
  {
    id: 'motility',
    component: 'actin',
    title: 'Motilidad celular',
    short: 'La célula protruye, se adhiere, tracciona y retrae su parte posterior.',
    kicker: 'Actina · migración con adhesiones',
    description: 'En una célula animal que migra sobre un sustrato, la polimerización de actina ayuda a extender el borde delantero. Las adhesiones y la actividad de actina-miosina convierten esa reorganización en desplazamiento.',
    location: 'Borde delantero, adhesiones y parte posterior de la célula',
    scale: 'Escala celular · esquema no a escala',
    legend: [
      { color: '#50ded0', label: 'Red de actina' },
      { color: '#f9cb72', label: 'Adhesiones al sustrato' },
      { color: '#dfb6fa', label: 'Miosina / tracción' }
    ],
    stages: [
      { title: 'Protrusión', text: 'La actina se ensambla cerca de la membrana y contribuye a empujarla. Arp2/3 puede producir la red ramificada de un lamelipodio.' },
      { title: 'Adhesión', text: 'Las integrinas forman conexiones con la matriz extracelular. Proteínas adaptadoras enlazan esas adhesiones con la red de actina.' },
      { title: 'Tracción', text: 'La miosina II usa ATP para generar fuerzas sobre la actina. Las adhesiones transmiten parte de esa fuerza al sustrato y el cuerpo celular avanza.' },
      { title: 'Retracción y recambio', text: 'Se desensamblan adhesiones posteriores y se retrae la parte trasera. El recambio de actina permite repetir el ciclo.' }
    ],
    takeaway: 'La migración emerge de la coordinación entre protrusión, adhesión y fuerza.',
    notes: 'Se ilustra un modo de migración con adhesiones, no todos los modos de motilidad. Estos procesos se solapan y dependen del tipo de célula y su entorno.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 20
  },
  {
    id: 'contraction',
    component: 'actin',
    title: 'Contracción actina-miosina',
    short: 'Motores de miosina deslizan filamentos de actina usando ATP.',
    kicker: 'Actina · generación de fuerza',
    description: 'Los filamentos bipolares de miosina II pueden deslizar filamentos de actina con orientaciones opuestas. La red o el haz se acorta sin que cada filamento de actina tenga que acortarse.',
    location: 'Haces contráctiles, corteza y anillo de citocinesis',
    scale: 'Interacción molecular · esquema no a escala',
    legend: [
      { color: '#50ded0', label: 'Filamentos de actina' },
      { color: '#dfb6fa', label: 'Miosina II' },
      { color: '#f9cb72', label: 'ATP / ciclo del motor' }
    ],
    stages: [
      { title: 'Actina de polaridad opuesta', text: 'Una miosina II bipolar contacta filamentos orientados en sentidos opuestos. Las cabezas motoras tienden a avanzar hacia sus extremos (+).' },
      { title: 'ATP y preparación', text: 'La unión de ATP desprende una cabeza de la actina. La hidrólisis de ATP prepara la cabeza para otro ciclo de interacción.' },
      { title: 'Golpe de fuerza', text: 'La cabeza se une de nuevo y la liberación de fosfato se acopla al golpe de fuerza. La repetición del ciclo produce deslizamiento.' },
      { title: 'Acortamiento del conjunto', text: 'Muchos motores generan fuerza de forma coordinada. El haz se contrae mientras los filamentos de actina conservan aproximadamente su longitud.' }
    ],
    takeaway: 'La contracción es deslizamiento entre filamentos impulsado por motores.',
    notes: 'El esquema representa un haz contráctil simplificado. En músculo los filamentos se organizan en sarcómeros; las redes no musculares tienen otras arquitecturas.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 18
  },
  {
    id: 'critical',
    component: 'actin',
    title: 'Concentración crítica',
    short: 'La disponibilidad de monómeros cambia el balance entre entrada y salida.',
    kicker: 'Actina · balance cinético',
    description: 'En un modelo simple de un extremo, la concentración crítica es Cc = k_off / k_on, donde incorporación y salida se equilibran. Para actina, un modelo habitual con ATP distingue Cc(+) menor que Cc(−), lo que permite una ventana de treadmilling.',
    location: 'Extremos (+) y (−) de un filamento libre',
    scale: 'Modelo conceptual · valores no experimentales',
    legend: [
      { color: '#50ded0', label: 'Actina / incorporación' },
      { color: '#f9cb72', label: 'Monómeros libres' }
    ],
    stages: [
      { title: 'Balance y monómeros disponibles', text: 'La concentración libre C elegida se mantiene durante este recorrido. La tasa neta de cada extremo se aproxima por k_on × C − k_off.' },
      { title: 'Evaluar extremo (+)', text: 'Si C supera Cc(+), este extremo crece; si es menor, se acorta. En C = Cc(+) hay intercambio de subunidades sin crecimiento neto.' },
      { title: 'Evaluar extremo (−)', text: 'Si C supera Cc(−), crece; si es menor, se acorta; si es igual, no cambia de longitud en promedio. Su umbral mayor permite que (−) se acorte mientras (+) crece.' },
      { title: 'Resultado del balance', text: 'Por debajo de ambas Cc los dos extremos se acortan; por encima, ambos crecen. La ventana entre Cc(+) y Cc(−) admite flujo de subunidades, pero la longitud constante exige tasas netas de igual magnitud.' }
    ],
    takeaway: 'Cc expresa un balance de tasas; no es una concentración universal para toda célula.',
    notes: 'k_on y k_off son constantes de asociación y disociación. Cc depende del extremo, el nucleótido y las condiciones; los microtúbulos requieren considerar además el casquete y la inestabilidad dinámica.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 18
  },
  {
    id: 'micro-growth',
    component: 'microtubules',
    title: 'Ensamblaje de microtúbulos',
    short: 'Dímeros de tubulina forman un tubo polar con un extremo en crecimiento.',
    kicker: 'Microtúbulos · nucleación y elongación',
    description: 'Los dímeros de tubulina α/β se organizan en protofilamentos que forman un tubo hueco, normalmente de 13 protofilamentos. La incorporación de tubulina con GTP en β favorece el crecimiento y una región terminal estabilizadora.',
    location: 'Centrosoma y otros sitios de nucleación del citoplasma',
    scale: '≈25 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#77a7ff', label: 'Tubulina α/β / microtúbulo' },
      { color: '#f9cb72', label: 'Región terminal rica en GTP' }
    ],
    stages: [
      { title: 'Nucleación', text: 'Complejos de γ-tubulina pueden servir de plantilla para iniciar el tubo. Muchos microtúbulos se nuclean en el centrosoma, pero también existen otros sitios.' },
      { title: 'Dímeros α/β', text: 'La tubulina soluble llega como dímeros α/β. El GTP intercambiable de la subunidad β participa en la dinámica del polímero.' },
      { title: 'Elongación polar', text: 'Se agregan dímeros al extremo (+), habitualmente más dinámico. El extremo (−) puede permanecer anclado o protegido en un centro organizador.' },
      { title: 'Casquete estabilizador', text: 'Tras incorporarse, el GTP de β se hidroliza. Si la adición mantiene una región terminal estabilizadora rica en GTP, el crecimiento puede continuar.' }
    ],
    takeaway: 'El crecimiento resulta del balance entre incorporación, hidrólisis y estabilización.',
    notes: 'Se dibuja un segmento y no todos los protofilamentos. El GTP de α no se intercambia como el de β; el casquete real tiene una estructura y composición más complejas que una banda uniforme.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 16
  },
  {
    id: 'micro-shrink',
    component: 'microtubules',
    title: 'Desensamblaje de microtúbulos',
    short: 'El tubo se acorta mientras sus protofilamentos se curvan y separan.',
    kicker: 'Microtúbulos · acortamiento',
    description: 'Durante el acortamiento, el extremo pierde dímeros de tubulina y los protofilamentos pueden curvarse hacia afuera. La tubulina liberada se recicla para futuros episodios de ensamblaje.',
    location: 'Extremo de un microtúbulo en acortamiento',
    scale: '≈25 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#77a7ff', label: 'Tubulina / protofilamentos' },
      { color: '#f9cb72', label: 'GTP tras el intercambio' }
    ],
    stages: [
      { title: 'Extremo inestable', text: 'Un extremo sin una región estabilizadora suficiente puede entrar en acortamiento. Gran parte del cuerpo del microtúbulo contiene tubulina con GDP en β.' },
      { title: 'Curvatura', text: 'Los protofilamentos expuestos pueden curvarse y perder contactos laterales. El extremo adquiere una apariencia de fibras que se abren.' },
      { title: 'Salida de dímeros', text: 'Se liberan dímeros α/β y el microtúbulo se acorta. Este desensamblaje puede ser mucho más rápido que el crecimiento.' },
      { title: 'Reciclaje de tubulina', text: 'La β-tubulina soluble puede intercambiar GDP por GTP. Así, los dímeros vuelven a estar disponibles para el ensamblaje.' }
    ],
    takeaway: 'El acortamiento reorganiza rápidamente la red y devuelve tubulina al citoplasma.',
    notes: 'Se muestra el extremo (+); el extremo (−) también puede desensamblarse si no está protegido. La forma del extremo y la velocidad varían con las condiciones y las proteínas asociadas.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 14
  },
  {
    id: 'catastrophe',
    component: 'microtubules',
    title: 'Catástrofe',
    short: 'Un microtúbulo cambia del crecimiento al acortamiento rápido.',
    kicker: 'Microtúbulos · inestabilidad dinámica',
    description: 'La catástrofe es la transición de un microtúbulo desde crecimiento a acortamiento. Se relaciona con la pérdida de estabilización en el extremo, incluida la reducción del casquete asociado a GTP.',
    location: 'Extremo dinámico del microtúbulo',
    scale: '≈25 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#77a7ff', label: 'Cuerpo del microtúbulo' },
      { color: '#f9cb72', label: 'Casquete estabilizador' }
    ],
    stages: [
      { title: 'Crecimiento', text: 'La incorporación de tubulina mantiene un extremo capaz de crecer. Una región terminal rica en GTP contribuye a su estabilidad.' },
      { title: 'Cambio del balance', text: 'La adición, la hidrólisis y la salida de subunidades modifican el extremo. Si disminuye su estabilización, aumenta la probabilidad de una catástrofe.' },
      { title: 'Transición', text: 'El extremo pasa al estado de acortamiento. Los protofilamentos comienzan a curvarse y a separarse.' },
      { title: 'Acortamiento rápido', text: 'Se liberan numerosos dímeros y el microtúbulo retrocede. Más adelante puede desaparecer o experimentar un rescate.' }
    ],
    takeaway: 'Una catástrofe cambia el estado dinámico del extremo; no rompe todo el tubo a la vez.',
    notes: 'La transición es probabilística: no ocurre en un tiempo fijo. La concentración de tubulina, la estructura del extremo y proteínas reguladoras modifican su frecuencia.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 16
  },
  {
    id: 'rescue',
    component: 'microtubules',
    title: 'Rescate',
    short: 'Un microtúbulo que se acorta vuelve a crecer.',
    kicker: 'Microtúbulos · recuperación del crecimiento',
    description: 'El rescate es la transición desde acortamiento a crecimiento. La estabilización del extremo permite que la incorporación de tubulina vuelva a sostener la elongación.',
    location: 'Extremo de un microtúbulo en acortamiento',
    scale: '≈25 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#77a7ff', label: 'Tubulina / microtúbulo' },
      { color: '#f9cb72', label: 'Región estabilizada / nuevo casquete' }
    ],
    stages: [
      { title: 'Acortamiento', text: 'El extremo libera tubulina y el tubo pierde longitud. El proceso puede continuar hasta desensamblar el microtúbulo.' },
      { title: 'Estabilización local', text: 'Regiones de la red o proteínas asociadas pueden favorecer la estabilización del extremo. Algunos rescates se relacionan con regiones que conservan tubulina en estados similares a GTP.' },
      { title: 'Reincorporación', text: 'Dímeros de tubulina con GTP se incorporan al extremo estabilizado. El balance cambia y se reinicia el crecimiento.' },
      { title: 'Nueva elongación', text: 'Se establece de nuevo una región terminal que favorece la estabilidad. El microtúbulo continúa creciendo y puede volver a sufrir una catástrofe.' }
    ],
    takeaway: 'Catástrofe y rescate permiten explorar el espacio mediante ciclos de crecimiento y retroceso.',
    notes: 'Se representa una posibilidad didáctica; el rescate tiene varios mecanismos y no exige siempre una isla de GTP. Su frecuencia depende de la red, el entorno y los reguladores.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 18
  },
  {
    id: 'transport',
    component: 'microtubules',
    title: 'Transporte intracelular',
    short: 'Kinesinas y dineína llevan cargas sobre una vía polar.',
    kicker: 'Microtúbulos · motores moleculares',
    description: 'Los microtúbulos sirven de vías para motores que transportan vesículas y otros componentes celulares. La kinesina-1 suele avanzar hacia (+) y la dineína citoplasmática hacia (−), utilizando ATP.',
    location: 'Citoplasma, entre regiones celulares y orgánulos',
    scale: 'Transporte molecular · esquema no a escala',
    legend: [
      { color: '#77a7ff', label: 'Vía de microtúbulo' },
      { color: '#50ded0', label: 'Kinesina-1 / carga hacia (+)' },
      { color: '#dfb6fa', label: 'Dineína / carga hacia (−)' },
      { color: '#f9cb72', label: 'ATP' }
    ],
    stages: [
      { title: 'Unión de la carga', text: 'Adaptadores enlazan una vesícula u otra carga con los motores. La regulación determina cuándo y dónde se inicia el transporte.' },
      { title: 'Reconocimiento de la vía', text: 'El motor se une al microtúbulo polar. Los extremos (+) y (−) definen la dirección molecular de la vía.' },
      { title: 'Movimiento con ATP', text: 'Ciclos de unión e hidrólisis de ATP impulsan cambios del motor. La kinesina-1 se dirige a (+); la dineína citoplasmática se dirige a (−).' },
      { title: 'Entrega y regulación', text: 'La carga alcanza su destino o cambia su movimiento según las señales. En una misma carga pueden actuar motores de direcciones opuestas.' }
    ],
    takeaway: 'La dirección depende del motor y de la orientación del microtúbulo.',
    notes: 'Se muestran kinesina-1 y dineína citoplasmática. Algunas otras kinesinas se dirigen a (−) o regulan extremos; los microtúbulos no siempre tienen (+) hacia la periferia.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 20
  },
  {
    id: 'intermediate',
    component: 'intermediate',
    title: 'Filamentos intermedios',
    short: 'Una red resistente reparte tensiones y mantiene la integridad celular.',
    kicker: 'Filamentos intermedios · soporte mecánico',
    description: 'Proteínas como las queratinas, la vimentina y las láminas forman filamentos intermedios. Su ensamblaje antiparalelo produce estructuras sin polaridad que contribuyen a la resistencia mecánica de células y tejidos.',
    location: 'Citoplasma, uniones celulares y lámina nuclear',
    scale: '≈10 nm de diámetro · esquema no a escala',
    legend: [
      { color: '#dfb6fa', label: 'Filamentos intermedios' },
      { color: '#f9cb72', label: 'Puntos de conexión / tensión' }
    ],
    stages: [
      { title: 'Dímeros', text: 'Dos proteínas se asocian en un dímero con regiones helicoidales entrelazadas. La proteína concreta depende del tipo celular.' },
      { title: 'Tetrámeros antiparalelos', text: 'Dos dímeros se asocian en orientaciones opuestas. Esta organización elimina la polaridad global de la unidad de ensamblaje.' },
      { title: 'Formación del filamento', text: 'Las unidades se asocian lateralmente y se unen de extremo a extremo. La compactación produce un filamento resistente y flexible.' },
      { title: 'Red de soporte', text: 'La red se conecta con estructuras celulares y reparte cargas mecánicas. Las láminas forman una red de soporte junto a la envoltura nuclear.' }
    ],
    takeaway: 'Sin extremos (+) y (−), estos filamentos priorizan el soporte mecánico.',
    notes: 'Su ensamblaje no requiere la unión e hidrólisis de ATP o GTP como la actina o la tubulina. Son redes reguladas y dinámicas; el esquema general no reproduce todas las variantes de la lámina nuclear.',
    source: { label: 'Cooper · The Cell, 2.ª ed. · Citoesqueleto', url: 'https://www.ncbi.nlm.nih.gov/books/NBK9839/' },
    duration: 16
  }
];
