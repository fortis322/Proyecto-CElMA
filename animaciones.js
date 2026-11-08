
const preferenciaMovimiento = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

const botonMovimiento = document.querySelector('.motion-toggle');
let movimientoPausado = preferenciaMovimiento.matches;

function actualizarMovimiento() {
  document.body.classList.toggle('paused', movimientoPausado);
  botonMovimiento.setAttribute('aria-pressed', String(movimientoPausado));

  if (movimientoPausado) {
    botonMovimiento.textContent = 'Activar movimiento';
  } else {
    botonMovimiento.textContent = 'Pausar movimiento';
  }
}

actualizarMovimiento();

botonMovimiento.addEventListener('click', function () {
  movimientoPausado = !movimientoPausado;
  actualizarMovimiento();
});

if ('IntersectionObserver' in window && !preferenciaMovimiento.matches) {
  document.documentElement.classList.add('motion');

  const observador = new IntersectionObserver(
    function (elementos) {
      elementos.forEach(function (elemento) {
        if (elemento.isIntersecting) {
          elemento.target.classList.add('visible');
          observador.unobserve(elemento.target);
        }
      });
    },
    {
      threshold: 0.08
    }
  );

  document.querySelectorAll('.reveal').forEach(function (seccion) {
    observador.observe(seccion);
  });
}
