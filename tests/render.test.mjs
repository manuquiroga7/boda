import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../assets/js/content.js';
import { renderPage } from '../assets/js/render.js';

const ids = (html) => [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);

test('la variante general trae las secciones en orden y sin "especial"', () => {
  assert.deepEqual(ids(renderPage(content, 'general')), ['portada', 'versiculo', 'historia', 'datos', 'asistencia', 'pdf']);
});

test('la variante especial pone "especial" justo después del versículo', () => {
  assert.deepEqual(ids(renderPage(content, 'especial')), ['portada', 'versiculo', 'especial', 'historia', 'datos', 'asistencia', 'pdf']);
});

test('las fotos de la historia son diferidas y tienen alt', () => {
  const historia = renderPage(content, 'general').match(/<section id="historia"[\s\S]*?<\/section>/)[0];
  const imgs = [...historia.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.equal(imgs.length, content.story.length);
  for (const img of imgs) {
    assert.match(img, /loading="lazy"/);
    assert.match(img, /alt="[^"]+"/);
  }
});

test('el enlace de asistencia es de WhatsApp', () => {
  assert.match(renderPage(content, 'general'), /href="https:\/\/wa\.me\//);
});

test('no hay iframes ni el marcador de galería visible', () => {
  const html = renderPage(content, 'general');
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, /<!-- futuro: galería -->/);
});

test('escapa el texto del contenido', () => {
  const c = structuredClone(content);
  c.couple.names = ['<b>Ana</b>', 'Luis & Co'];
  const html = renderPage(c, 'general');
  assert.doesNotMatch(html, /<b>Ana<\/b>/);
  assert.match(html, /Luis &amp; Co/);
});

test('basePath se antepone a las rutas de assets', () => {
  const html = renderPage(content, 'general', '../');
  assert.match(html, /src="\.\.\/assets\/img\/story\/momento-1\.svg"/);
  assert.match(html, /href="\.\.\/assets\/pdf\/invitacion\.pdf"/);
});

test('las plantas decorativas son aria-hidden, sin alt y con ruta de assets', () => {
  const html = renderPage(content, 'general', '../');
  const plants = [...html.matchAll(/<img [^>]*class="plant[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.ok(plants.length >= 4);
  for (const p of plants) {
    assert.match(p, /alt=""/);
    assert.match(p, /aria-hidden="true"/);
    assert.match(p, /src="\.\.\/assets\/img\/plants\//);
  }
});
