// Duración total de la secuencia (sello, solapa, carta, salida). Debe coincidir con envelope.css.
const DURATION_MS = 4800;

export function openEnvelope({ root, onOpen }) {
  const body = root.ownerDocument.body;
  root.innerHTML = `
<div class="envelope" role="dialog" aria-label="Invitación de boda">
  <div class="env-scene">
    <div class="env-body">
      <div class="env-card"><span>Nos casamos</span></div>
      <div class="env-front"></div>
      <div class="env-flap"></div>
    </div>
    <button class="seal" type="button" aria-label="Abrir invitación">&amp;</button>
  </div>
  <p class="env-hint">Toca el sello para abrir</p>
</div>`;
  body.classList.add('is-locked');

  const envelope = root.querySelector('.envelope');
  const seal = root.querySelector('.seal');
  let opened = false;

  const finish = () => {
    body.classList.remove('is-locked');
    envelope.remove();
  };

  seal.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    onOpen();
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return finish();
    envelope.classList.add('is-opening');
    setTimeout(finish, DURATION_MS);
  });
}
