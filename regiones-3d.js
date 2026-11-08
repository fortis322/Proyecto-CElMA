/*
 * Correspondencias educativas para un modelo GLB aportado por el usuario.
 * Una región identifica una familia estructural, no una posición, un extremo
 * polar, un estado de nucleótido ni una animación del modelo.
 * Los patrones se aplican sin distinguir mayúsculas a nombres de objetos,
 * materiales o antecesores. Nunca se clasifica una estructura por su color.
 */
window.CELMA_3D_COMPONENTS = {
  all: {
    label: 'Modelo completo',
    color: '#dce9f7',
    patterns: []
  },
  actin: {
    label: 'Actina / microfilamentos',
    color: '#50ded0',
    patterns: [
      '(^|[^a-z0-9])(?:actin|actina|microfilament|microfilamento)s?(?=$|[^a-z0-9])'
    ]
  },
  microtubules: {
    label: 'Microtúbulos / tubulina',
    color: '#77a7ff',
    patterns: [
      '(^|[^a-z0-9])(?:microtubule|microt[uú]bulo|tubulin|tubulina)s?(?=$|[^a-z0-9])'
    ]
  },
  intermediate: {
    label: 'Filamentos intermedios',
    color: '#dfb6fa',
    patterns: [
      '(^|[^a-z0-9])intermediate[ _-]+filaments?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])filamentos?[ _-]+intermedios?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])(?:keratin|queratina|vimentin|vimentina|desmin|desmina|neurofilament|neurofilamento)s?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])lamins?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])(?:nuclear[ _-]+lamina|l[aá]mina[ _-]+nuclear)(?=$|[^a-z0-9])'
    ]
  },
  mitochondria: {
    label: 'Mitocondrias',
    color: '#f2a878',
    patterns: [
      '(^|[^a-z0-9])(?:mitochondria|mitochondrion|mitocondria|mitocondrias)(?=$|[^a-z0-9])'
    ]
  },
  myosin: {
    label: 'Miosina',
    color: '#f5a8ce',
    patterns: [
      '(^|[^a-z0-9])(?:myosin|miosin|miosina)s?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])(?:myosin|miosin|miosina)[ _-]*(?:ii|2)(?=$|[^a-z0-9])'
    ]
  },
  adhesion: {
    label: 'Adhesiones / integrinas',
    color: '#f9cb72',
    patterns: [
      '(^|[^a-z0-9])(?:adhesions?|adhesi[oó]n(?:es)?|integrins?|integrinas?)(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])(?:focal[ _-]+adhesions?|adhesi[oó]n(?:es)?[ _-]+focal(?:es)?)(?=$|[^a-z0-9])'
    ]
  },
  kinesin: {
    label: 'Kinesina',
    color: '#a3e6b5',
    patterns: [
      '(^|[^a-z0-9])(?:kinesin|kinesina|quinesina)s?(?=$|[^a-z0-9])'
    ]
  },
  dynein: {
    label: 'Dineína',
    color: '#ffc3b0',
    patterns: [
      '(^|[^a-z0-9])(?:dynein|dine[ií]na)s?(?=$|[^a-z0-9])'
    ]
  },
  centrosome: {
    label: 'Centrosoma / centro organizador',
    color: '#f9cb72',
    patterns: [
      '(^|[^a-z0-9])(?:centrosome|centrosoma)s?(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])mtoc(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])microtubule[ _-]+organi[sz]ing[ _-]+cent(?:er|re)(?=$|[^a-z0-9])',
      '(^|[^a-z0-9])centro[ _-]+organizador[ _-]+de[ _-]+microt[uú]bulos(?=$|[^a-z0-9])'
    ]
  },
  other: {
    label: 'Sin identificar',
    color: '#9bafc6',
    patterns: []
  }
};

window.CELMA_3D_SCOPE = 'El resaltado ofrece una referencia estructural para localizar los participantes de cada proceso. La animación molecular y la asignación de extremos o estados ATP/GTP requieren información específica del modelo.';

window.CELMA_3D_REGIONS = {
  'actin-growth': {
    primary: 'actin',
    title: 'Actina: referencia del ensamblaje',
    summary: 'Explora la actina asociada al ensamblaje, desde las subunidades disponibles hasta la maduración del filamento.',
    stages: [
      { regions: ['actin'], label: 'Monómeros disponibles', explanation: 'La actina se resalta para relacionarla con sus subunidades libres, la G-actina. Su disponibilidad condiciona el ensamblaje.' },
      { regions: ['actin'], label: 'Nucleación', explanation: 'Se destaca la actina como participante del núcleo estable que inicia un filamento. Arp2/3 o las forminas pueden favorecer esta etapa.' },
      { regions: ['actin'], label: 'Elongación', explanation: 'La actina se resalta para relacionarla con la incorporación de subunidades. El extremo (+) suele crecer más rápido.' },
      { regions: ['actin'], label: 'Maduración', explanation: 'La actina es referencia de la maduración del filamento: tras incorporarse, hidroliza ATP y libera fosfato con el tiempo.' }
    ]
  },
  'actin-shrink': {
    primary: 'actin',
    title: 'Actina: referencia del desensamblaje',
    summary: 'Localiza la actina y relaciona su estructura con la pérdida de subunidades, la regulación del recambio y el reciclaje.',
    stages: [
      { regions: ['actin'], label: 'Filamento maduro', explanation: 'Se destaca la actina para estudiar su maduración. Las regiones antiguas de un filamento suelen enriquecerse en actina-ADP.' },
      { regions: ['actin'], label: 'Pérdida de subunidades', explanation: 'El filamento resaltado es la referencia del desensamblaje por los extremos. Hay acortamiento cuando la salida supera la incorporación.' },
      { regions: ['actin'], label: 'Recambio regulado', explanation: 'La actina resaltada es referencia de la red sobre la que actúan reguladores. La cofilina puede favorecer el corte y el desensamblaje.' },
      { regions: ['actin'], label: 'Reciclaje', explanation: 'Se resalta la actina para conectar filamentos y monómeros reciclados. El intercambio de ADP por ATP permite reutilizar las subunidades.' }
    ]
  },
  treadmilling: {
    primary: 'actin',
    title: 'Actina: referencia del treadmilling',
    summary: 'Relaciona la actina con el flujo de subunidades: incorporación por (+), pérdida por (−) y posible longitud media estable.',
    stages: [
      { regions: ['actin'], label: 'Una ventana de concentración', explanation: 'Se destaca la actina para relacionarla con la concentración libre. En el modelo simple, la ventana entre Cc(+) y Cc(−) permite flujos opuestos en los extremos.' },
      { regions: ['actin'], label: 'Entrada por (+)', explanation: 'La actina se resalta como referencia de la incorporación por el extremo (+). En esta ventana de concentración, la entrada supera la salida.' },
      { regions: ['actin'], label: 'Salida por (−)', explanation: 'La actina se mantiene resaltada como referencia de la pérdida por el extremo (−). En esta ventana, la salida supera la incorporación.' },
      { regions: ['actin'], label: 'Longitud casi constante', explanation: 'La actina resaltada conecta con el recambio a longitud media estable. Esa estabilidad requiere tasas netas de entrada y salida equilibradas.' }
    ]
  },
  motility: {
    primary: 'actin',
    title: 'Actina, adhesiones y tracción',
    summary: 'Relaciona actina, adhesiones y miosina con un ciclo de migración sobre un sustrato. Este proceso representa un modo de motilidad con adhesiones.',
    stages: [
      { regions: ['actin'], label: 'Protrusión', explanation: 'Se resalta la actina porque su ensamblaje contribuye a extender la membrana. Una red ramificada puede sostener la protrusión de un lamelipodio.' },
      { regions: ['actin', 'adhesion'], label: 'Adhesión', explanation: 'Actina y adhesiones se destacan como participantes del acoplamiento mecánico al sustrato. Las integrinas y sus adaptadores enlazan ambas estructuras.' },
      { regions: ['actin', 'myosin', 'adhesion'], label: 'Tracción', explanation: 'El resaltado reúne la vía de fuerza: actina, miosina y adhesiones. La miosina II genera fuerzas que pueden transmitirse al sustrato.' },
      { regions: ['actin', 'adhesion'], label: 'Retracción y recambio', explanation: 'Se resaltan actina y adhesiones porque su recambio facilita la migración. La renovación de la red y de sus anclajes permite repetir el ciclo.' }
    ]
  },
  contraction: {
    primary: 'actin',
    title: 'Actina y motores de miosina',
    summary: 'Relaciona actina y miosina con la generación de fuerza. La explicación se centra en miosina II; identificar ese subtipo requiere una anotación específica.',
    stages: [
      { regions: ['actin', 'myosin'], label: 'Actina de polaridad opuesta', explanation: 'Se destacan actina y miosina como participantes del sistema contráctil. Una miosina II bipolar puede conectar filamentos de actina con orientaciones opuestas.' },
      { regions: ['myosin'], label: 'ATP y preparación', explanation: 'La miosina identificada es referencia del ciclo motor. En miosina II, la unión e hidrólisis de ATP permiten reiniciar la interacción con actina.' },
      { regions: ['actin', 'myosin'], label: 'Golpe de fuerza', explanation: 'Actina y miosina se resaltan para relacionar unión y generación de fuerza. La liberación de fosfato se acopla al golpe de fuerza de miosina II.' },
      { regions: ['actin', 'myosin'], label: 'Acortamiento del conjunto', explanation: 'El sistema actina-miosina es referencia del deslizamiento que puede acortar un haz. Cada filamento de actina puede conservar su longitud.' }
    ]
  },
  critical: {
    primary: 'actin',
    title: 'Actina y concentración crítica',
    summary: 'Usa la actina como referencia del balance entre incorporación y salida. Cc y la concentración seleccionada pertenecen al modelo cinético simplificado.',
    stages: [
      { regions: ['actin'], label: 'Balance y monómeros disponibles', explanation: 'Se destaca la actina como referencia del balance k_on × C − k_off. La concentración C elegida se mantiene durante las cuatro fases.' },
      { regions: ['actin'], label: 'Evaluar extremo (+)', explanation: 'La actina es referencia del balance del extremo (+). En el modelo simple, este extremo crece si C supera Cc(+) y se acorta si es menor.' },
      { regions: ['actin'], label: 'Evaluar extremo (−)', explanation: 'La misma referencia estructural permite comparar el segundo umbral. En el modelo, (−) crece si C supera Cc(−) y se acorta si es menor.' },
      { regions: ['actin'], label: 'Resultado del balance', explanation: 'La actina resaltada permite relacionar los dos balances: entre Cc(+) y Cc(−) entra por (+) y sale por (−). La longitud constante exige tasas netas de igual magnitud.' }
    ]
  },
  'micro-growth': {
    primary: 'microtubules',
    title: 'Microtúbulos: referencia del ensamblaje',
    summary: 'Explora la relación entre tubulina, microtúbulos y centros organizadores durante el ensamblaje. La nucleación también puede ocurrir fuera del centrosoma.',
    stages: [
      { regions: ['centrosome', 'microtubules'], label: 'Nucleación', explanation: 'Se destacan microtúbulos y centrosoma para relacionar el tubo con un posible sitio de inicio. Los complejos de γ-tubulina pueden servir de plantilla.' },
      { regions: ['microtubules'], label: 'Dímeros α/β', explanation: 'La tubulina se resalta para relacionarla con los dímeros α/β que forman el tubo. El GTP intercambiable de β participa en la dinámica del polímero.' },
      { regions: ['microtubules'], label: 'Elongación polar', explanation: 'El microtúbulo resaltado sirve de referencia para la adición de dímeros. El extremo (+) suele ser el más dinámico.' },
      { regions: ['microtubules'], label: 'Casquete estabilizador', explanation: 'Se resalta el microtúbulo para relacionarlo con la estabilización terminal. Una región rica en tubulina con GTP contribuye a sostener el crecimiento.' }
    ]
  },
  'micro-shrink': {
    primary: 'microtubules',
    title: 'Microtúbulos: referencia del acortamiento',
    summary: 'Relaciona el microtúbulo con el desensamblaje y la tubulina con el reciclaje de sus subunidades.',
    stages: [
      { regions: ['microtubules'], label: 'Extremo inestable', explanation: 'El microtúbulo se resalta como referencia de la estabilidad terminal. Un extremo con estabilización insuficiente puede entrar en acortamiento.' },
      { regions: ['microtubules'], label: 'Curvatura', explanation: 'Se destaca el microtúbulo para relacionarlo con sus protofilamentos. Durante el desensamblaje, estos pueden curvarse y perder contactos laterales.' },
      { regions: ['microtubules'], label: 'Salida de dímeros', explanation: 'Tubulina y microtúbulos se resaltan como referencias del recambio. La liberación de dímeros α/β acorta el tubo.' },
      { regions: ['microtubules'], label: 'Reciclaje de tubulina', explanation: 'Se destaca la familia tubulina para relacionar polímero y subunidades reutilizables. La β-tubulina soluble puede intercambiar GDP por GTP.' }
    ]
  },
  catastrophe: {
    primary: 'microtubules',
    title: 'Microtúbulos y catástrofe',
    summary: 'Usa el microtúbulo como referencia de la transición desde crecimiento a acortamiento rápido. La frecuencia de catástrofe depende de las condiciones y los reguladores.',
    stages: [
      { regions: ['microtubules'], label: 'Crecimiento', explanation: 'Se destaca el microtúbulo para relacionarlo con la incorporación de tubulina. La adición de dímeros puede mantener un extremo en crecimiento.' },
      { regions: ['microtubules'], label: 'Cambio del balance', explanation: 'El resaltado relaciona el tubo con la estabilidad de su extremo. La incorporación, la hidrólisis y proteínas reguladoras modifican el riesgo de catástrofe.' },
      { regions: ['microtubules'], label: 'Transición', explanation: 'El microtúbulo se resalta como participante de la catástrofe. La pérdida de estabilización del extremo favorece el cambio a acortamiento.' },
      { regions: ['microtubules'], label: 'Acortamiento rápido', explanation: 'Se mantiene resaltado el microtúbulo para estudiar la liberación rápida de dímeros. El proceso puede continuar hasta su desaparición o cambiar mediante un rescate.' }
    ]
  },
  rescue: {
    primary: 'microtubules',
    title: 'Microtúbulos y rescate',
    summary: 'Relaciona el microtúbulo con la recuperación del crecimiento. Existen varios mecanismos de rescate, incluidos efectos de proteínas asociadas y de regiones estabilizadas.',
    stages: [
      { regions: ['microtubules'], label: 'Acortamiento', explanation: 'El microtúbulo se resalta como referencia del estado inicial del rescate. Durante el acortamiento, su extremo pierde tubulina.' },
      { regions: ['microtubules'], label: 'Estabilización local', explanation: 'Se destaca el tubo para relacionarlo con la estabilización de un extremo. Regiones de la red o proteínas asociadas pueden favorecer esta recuperación.' },
      { regions: ['microtubules'], label: 'Reincorporación', explanation: 'Se destaca la tubulina como componente que puede reincorporarse. Si el extremo se estabiliza, la adición de dímeros puede sostener de nuevo el crecimiento.' },
      { regions: ['microtubules'], label: 'Nueva elongación', explanation: 'El microtúbulo se mantiene resaltado como referencia del crecimiento recuperado. La incorporación de tubulina y la estabilización terminal sostienen la elongación.' }
    ]
  },
  transport: {
    primary: 'microtubules',
    title: 'Vías y motores del transporte',
    summary: 'Relaciona las vías de microtúbulos con kinesinas y dineína. La explicación de dirección se centra en kinesina-1 y dineína citoplasmática.',
    stages: [
      { regions: ['kinesin', 'dynein'], label: 'Unión de la carga', explanation: 'Se destacan kinesinas y dineína como motores que pueden asociarse a cargas. Los adaptadores enlazan motores y componentes transportados.' },
      { regions: ['microtubules', 'kinesin', 'dynein'], label: 'Reconocimiento de la vía', explanation: 'Se resaltan microtúbulos y motores para relacionar vía y transporte. La polaridad del microtúbulo define las direcciones (+) y (−).' },
      { regions: ['microtubules', 'kinesin', 'dynein'], label: 'Movimiento con ATP', explanation: 'El resaltado conecta motores y vía con el uso de ATP. La kinesina-1 suele dirigirse a (+) y la dineína citoplasmática a (−); otras kinesinas pueden diferir.' },
      { regions: ['microtubules', 'kinesin', 'dynein'], label: 'Entrega y regulación', explanation: 'Se mantienen resaltados los participantes del transporte para estudiar su regulación. Señales celulares y adaptadores contribuyen a dirigir y entregar las cargas.' }
    ]
  },
  intermediate: {
    primary: 'intermediate',
    title: 'Filamentos intermedios y soporte',
    summary: 'Explora las proteínas identificadas como filamentos intermedios y relaciónalas con una red de resistencia mecánica. Su arquitectura depende de la familia de proteínas.',
    stages: [
      { regions: ['intermediate'], label: 'Dímeros', explanation: 'Se destacan las proteínas de filamentos intermedios para relacionarlas con sus unidades de ensamblaje. Dos cadenas pueden asociarse en un dímero helicoidal.' },
      { regions: ['intermediate'], label: 'Tetrámeros antiparalelos', explanation: 'La familia resaltada es referencia del ensamblaje antiparalelo. La asociación de dímeros con orientaciones opuestas produce unidades sin polaridad global.' },
      { regions: ['intermediate'], label: 'Formación del filamento', explanation: 'Se resaltan los participantes del filamento resistente. La asociación lateral, la unión longitudinal y la compactación contribuyen a su ensamblaje.' },
      { regions: ['intermediate'], label: 'Red de soporte', explanation: 'Los filamentos se resaltan para relacionarlos con la distribución de fuerzas. Una red conectada ayuda a mantener la integridad mecánica de la célula.' }
    ]
  }
};
