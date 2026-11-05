import { content } from './content.js';
import { validateContent } from './validate.js';
import { renderPage } from './render.js';
import { openEnvelope } from './envelope.js';
import { createMusic } from './music.js';
import { initReveal } from './reveal.js';
import { guardImages } from './images.js';

const problems = validateContent(content);
if (problems.length) console.warn('Contenido incompleto:', problems);

const app = document.getElementById('app');
const variant = document.body.dataset.variant || 'general';
const basePath = document.body.dataset.base || '';
app.innerHTML = renderPage(content, variant, basePath);
guardImages(app);

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
  music.toggle();
  syncMute();
});

const envelopeRoot = document.createElement('div');
document.body.prepend(envelopeRoot);
openEnvelope({
  root: envelopeRoot,
  onOpen() {
    music.start().then(syncMute);
    // Las secciones aparecen cuando el sobre empieza a salir (de inmediato con movimiento reducido).
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => initReveal(document), reduced ? 0 : 3400);
  },
});
