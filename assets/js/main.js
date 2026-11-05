import { content } from './content.js';
import { validateContent } from './validate.js';
import { renderPage } from './render.js';
import { openEnvelope } from './envelope.js';
import { createMusic } from './music.js';

const problems = validateContent(content);
if (problems.length) console.warn('Contenido incompleto:', problems);

const app = document.getElementById('app');
const variant = document.body.dataset.variant || 'general';
const basePath = document.body.dataset.base || '';
app.innerHTML = renderPage(content, variant, basePath);

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
  },
});
