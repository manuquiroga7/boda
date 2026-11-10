// Duración total de la secuencia (sello, solapa, carta que sale, se despliega, se acerca y se desvanece).
// Debe coincidir con envelope.css.
const DURATION_MS = 6600;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CARTA = { titulo: '¡Llegó la hora!', nombres: 'Emanuel y Belén', fecha: 'Te esperamos' };

// carta: textos de la carta, que viene doblada en dos (titulo y nombres se ven al salir del sobre;
// fecha aparece al desplegarla).
// inertElements: secciones que no deben recibir foco ni lectura mientras el sobre está cerrado.
// focusAfter: elemento que recibe el foco cuando el sobre desaparece.
export function openEnvelope({ root, onOpen, inertElements = [], focusAfter = null, carta = {} }) {
  const body = root.ownerDocument.body;
  const t = { ...CARTA, ...carta };
  root.innerHTML = `
<div class="envelope" role="dialog" aria-modal="true" aria-label="Invitación de boda">
  <div class="env-scene">
    <div class="env-body">
      <div class="env-front"></div>
      <div class="env-flap"></div>
    </div>
    <div class="env-card">
      <div class="pan pan--1">
        <div class="pan__txt">
          <p class="env-titulo">${esc(t.titulo)}</p>
          <p class="env-nombres">${esc(t.nombres)}</p>
        </div>
        <div class="pan pan--2">
          <div class="pan__txt">
            <p class="env-te">Te esperamos</p>
            <p class="env-fecha">${esc(t.fecha)}</p>
          </div>
        </div>
      </div>
    </div>
    <button class="seal" type="button" aria-label="Abrir invitación">&amp;</button>
  </div>
  <p class="env-hint">Toca el sello para abrir</p>
</div>`;
  body.classList.add('is-locked');
  inertElements.forEach((el) => el.setAttribute('inert', ''));

  const envelope = root.querySelector('.envelope');
  const seal = root.querySelector('.seal');
  let opened = false;

  const finish = () => {
    body.classList.remove('is-locked');
    inertElements.forEach((el) => el.removeAttribute('inert'));
    envelope.remove();
    focusAfter?.focus({ preventScroll: true });
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
