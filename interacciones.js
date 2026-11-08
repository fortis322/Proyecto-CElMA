// CELMA — Carrusel y dial circular.
// Recibe document en la web y la raíz de la vista previa en conversación.
function iniciarInteraccionesCelma(raiz) {
  // 1. CARRUSEL DEL CITOESQUELETO
  const carrusel = raiz.querySelector('.cyto-carousel');
  const paneles = Array.from(carrusel.querySelectorAll('.cyto-slide'));
  const opciones = Array.from(carrusel.querySelectorAll('[data-slide]'));
  let indice = 0;

  function mostrarComponente(nuevoIndice, anunciar = true) {
    indice = (nuevoIndice + paneles.length) % paneles.length;

    paneles.forEach((panel, i) => {
      const posicion = (i - indice + paneles.length) % paneles.length;
      panel.dataset.position = String(posicion === 2 ? -1 : posicion);
      panel.removeAttribute('aria-hidden');
    });
    opciones.forEach((opcion, i) => {
      opcion.setAttribute('aria-pressed', String(i === indice));
    });
    if (anunciar) {
      carrusel.querySelector('.carousel-announcement').textContent =
        paneles[indice].querySelector('h3').textContent;
    }
  }

  opciones.forEach((opcion, i) => {
    opcion.addEventListener('click', () => {
      mostrarComponente(i);
    });
  });
  carrusel.querySelector('.carousel-prev').addEventListener('click', () => {
    mostrarComponente(indice - 1);
  });
  carrusel.querySelector('.carousel-next').addEventListener('click', () => {
    mostrarComponente(indice + 1);
  });
  carrusel.addEventListener('keydown', evento => {
    if (evento.key === 'ArrowRight' || evento.key === 'ArrowLeft') {
      evento.preventDefault();
      mostrarComponente(indice + (evento.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // Deslizar con el dedo también cambia la tarjeta.
  let inicioX = 0;
  let inicioY = 0;
  const ventana = carrusel.querySelector('.carousel-window');
  ventana.addEventListener('touchstart', evento => {
    inicioX = evento.touches[0].clientX;
    inicioY = evento.touches[0].clientY;
  }, { passive: true });
  ventana.addEventListener('touchend', evento => {
    const dx = evento.changedTouches[0].clientX - inicioX;
    const dy = evento.changedTouches[0].clientY - inicioY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      mostrarComponente(indice + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
  // Arrastra con el ratón o pulsa una tarjeta lateral.
  let arrastre = null;
  let ignorarClick = false;
  ventana.addEventListener('pointerdown', evento => {
    if (evento.pointerType === 'mouse') {
      arrastre = evento.clientX;
    }
  });
  ventana.addEventListener('pointerup', evento => {
    if (arrastre === null) {
      return;
    }
    const distancia = evento.clientX - arrastre;
    arrastre = null;
    if (Math.abs(distancia) > 45) {
      ignorarClick = true;
      mostrarComponente(indice + (distancia < 0 ? 1 : -1));
      setTimeout(() => {
        ignorarClick = false;
      }, 50);
    }
  });
  ventana.addEventListener('pointerleave', () => {
    arrastre = null;
  });
  paneles.forEach((panel, i) => {
    panel.addEventListener('click', () => {
      if (!ignorarClick && i !== indice) {
        mostrarComponente(i);
      }
    });
  });
  mostrarComponente(0, false);

  // 2. DIAL SEMICIRCULAR DE LA PROPUESTA
  const dial = raiz.querySelector('.proposal-dial');
  const botones = Array.from(dial.querySelectorAll('[data-proposal]'));
  const explicaciones = Array.from(raiz.querySelectorAll('[data-proposal-panel]'));
  let seleccionado = 0;
  let angulo = 0;

  function seleccionarPropuesta(nuevoIndice) {
    const siguiente = (nuevoIndice + botones.length) % botones.length;
    let distancia = siguiente - seleccionado;
    if (distancia > 1) {
      distancia -= 3;
    }
    if (distancia < -1) {
      distancia += 3;
    }
    angulo -= distancia * 120;
    seleccionado = siguiente;
    dial.style.setProperty('--dial-angle', angulo + 'deg');
    dial.style.setProperty('--dial-counter-angle', -angulo + 'deg');
    botones.forEach((boton, i) => {
      boton.setAttribute('aria-pressed', String(i === seleccionado));
      boton.tabIndex = i === seleccionado ? 0 : -1;
      boton.setAttribute('aria-hidden', String(i !== seleccionado));
    });
    explicaciones.forEach((panel, i) => {
      panel.hidden = i !== seleccionado;
    });
  }

  raiz.querySelector('.dial-prev').addEventListener('click', () => {

    seleccionarPropuesta(seleccionado - 1);

  });
  raiz.querySelector('.dial-next').addEventListener('click', () => {
    seleccionarPropuesta(seleccionado + 1);
  });
  seleccionarPropuesta(0);
  botones.forEach((boton, i) => {
    boton.addEventListener('click', () => {
      seleccionarPropuesta(i);
    });
    boton.addEventListener('keydown', evento => {
      if (evento.key === 'ArrowRight' || evento.key === 'ArrowLeft') {
        evento.preventDefault();
        seleccionarPropuesta(seleccionado + (evento.key === 'ArrowRight' ? 1 : -1));
        botones[seleccionado].focus();
      }
    });
  });
}

if (document.querySelector('.cyto-carousel')) {
  iniciarInteraccionesCelma(document);
}
