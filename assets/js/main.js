import { content } from './content.js';
import { validateContent } from './validate.js';
import { renderPage, renderPortada } from './render.js';
import { mountCompare } from './compare.js';
import { activarMapas } from './mapa.js';
import { iniciarContador } from './countdown.js';
import { iniciarRsvp } from './rsvp.js';
import { openEnvelope } from './envelope.js';
import { createMusic } from './music.js';
import { initReveal } from './reveal.js';
import { guardImages } from './images.js';

const problems = validateContent(content);
if (problems.length) console.warn('Contenido incompleto:', problems);

const app = document.getElementById('app');
const variant = document.body.dataset.variant || 'general';
const basePath = document.body.dataset.base || '';
// Portada con fotos: ?portada=a|b|c elige el estilo; ?comparar=1 muestra un selector para alternar en vivo.
const params = new URLSearchParams(location.search);
const ESTILOS = ['a', 'b', 'c'];
const estilo = ESTILOS.includes(params.get('portada')) ? params.get('portada') : 'c';
app.innerHTML = renderPage(content, variant, basePath, estilo);
guardImages(app);
activarMapas(app);
iniciarContador(app);
iniciarRsvp(app, variant);

// Video de fondo en cámara lenta (velocidad en content.video.speed). Se reaplica al cargar y al reproducir porque algunos navegadores la reinician.
app.querySelectorAll('.banda--video video').forEach((v) => {
  const speed = content.video.speed ?? 1;
  const aplicar = () => { v.playbackRate = speed; };
  aplicar();
  v.addEventListener('loadedmetadata', aplicar);
  v.addEventListener('play', aplicar);
});

// Al volver con el botón atrás el navegador puede restaurar la página a medias: se recarga limpia.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) location.reload();
});

// Siempre empezar arriba, también al recargar o volver atrás.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const music = createMusic(basePath + content.music.src);
const muteBtn = document.getElementById('mute');
const syncMute = () => {
  const muted = music.isMuted();
  muteBtn.setAttribute('aria-pressed', String(muted));
  muteBtn.setAttribute('aria-label', muted ? 'Activar música' : 'Silenciar música');
};
muteBtn.addEventListener('click', () => {
  const done = music.toggle();
  syncMute();
  done.then(syncMute); // si el navegador rechaza el audio, el botón termina en "silenciado"
});

// Al salir de la página (por ejemplo a WhatsApp) la música se pausa; al volver se reanuda.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.suspend();
  else music.resume();
});

const portadaTitle = app.querySelector('#portada h1');
portadaTitle.tabIndex = -1;

if (params.has('comparar')) {
  mountCompare(document, estilo, (nuevo) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = renderPortada(content, nuevo, basePath);
    const seccion = wrap.firstElementChild;
    seccion.classList.add('is-visible');
    document.getElementById('portada').replaceWith(seccion);
    guardImages(seccion);
    seccion.querySelector('h1').tabIndex = -1;
    window.scrollTo(0, 0);
  });
}

const envelopeRoot = document.createElement('div');
document.body.prepend(envelopeRoot);
openEnvelope({
  root: envelopeRoot,
  inertElements: app.querySelectorAll('section'),
  focusAfter: portadaTitle,
  carta: { nombres: content.couple.names.join(' y '), fecha: content.couple.dateText },
  onOpen() {
    music.start().then(syncMute);
    // Las secciones aparecen cuando el sobre empieza a salir (de inmediato con movimiento reducido).
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => initReveal(document), reduced ? 0 : 5600);
    // Con movimiento reducido el video de fondo no se reproduce: queda detenido en su primer cuadro.
    if (reduced) document.querySelectorAll('.banda--video video').forEach((v) => { v.removeAttribute('autoplay'); v.pause?.(); });
  },
});
