import { content } from './content.js';
import { validateContent } from './validate.js';
import { renderPage } from './render.js';

const problems = validateContent(content);
if (problems.length) console.warn('Contenido incompleto:', problems);

const app = document.getElementById('app');
const variant = document.body.dataset.variant || 'general';
const basePath = document.body.dataset.base || '';
app.innerHTML = renderPage(content, variant, basePath);
