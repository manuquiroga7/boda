// El mapa incrustado viene bloqueado: en el celular un mapa a pantalla completa se "come" el scroll.
// Al tocarlo se activa (zoom y movimiento) y desaparece el cartel.
export function activarMapas(doc) {
  doc.querySelectorAll('.mapa').forEach((mapa) => {
    const boton = mapa.querySelector('.mapa__activar');
    boton?.addEventListener('click', () => {
      mapa.classList.add('is-activo');
      boton.remove();
    });
  });
}
