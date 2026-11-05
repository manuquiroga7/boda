import { content } from './content.js';
import { validateContent } from './validate.js';
import { renderPage } from './render.js';
import { openEnvelope } from './envelope.js';

const problems = validateContent(content);
if (problems.length) console.warn('Contenido incompleto:', problems);

const app = document.getElementById('app');
const variant = document.body.dataset.variant || 'general';
const basePath = document.body.dataset.base || '';
app.innerHTML = renderPage(content, variant, basePath);

// Siempre empezar arriba, también al recargar o volver atrás.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const envelopeRoot = document.createElement('div');
document.body.prepend(envelopeRoot);
openEnvelope({ root: envelopeRoot, onOpen() {} });
