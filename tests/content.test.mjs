import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../assets/js/content.js';
import { validateContent } from '../assets/js/validate.js';

test('el contenido de ejemplo es válido', () => {
  assert.deepEqual(validateContent(content), []);
});

test('reporta un problema cuando faltan los nombres', () => {
  const c = structuredClone(content);
  delete c.couple.names;
  assert.ok(validateContent(c).some((p) => p.includes('couple.names')));
});

test('el versículo de ejemplo es Eclesiastés 4:12', () => {
  assert.match(content.verse.ref, /Eclesiastés 4:12/);
});

test('reporta un problema cuando faltan las fotos de la pareja', () => {
  const c = structuredClone(content);
  delete c.couple.photos;
  assert.ok(validateContent(c).some((p) => p.includes('couple.photos')));
});

test('reporta un problema cuando una foto de la pareja no tiene alt', () => {
  const c = structuredClone(content);
  c.couple.photos[0].alt = '';
  assert.ok(validateContent(c).some((p) => p.includes('couple.photos[0].alt')));
});

test('alcanza con una foto de la pareja (la portada A y la C usan solo la primera)', () => {
  const c = structuredClone(content);
  c.couple.photos = c.couple.photos.slice(0, 1);
  assert.deepEqual(validateContent(c), []);
});

test('reporta un problema cuando faltan las fotos de la sección de datos', () => {
  const c = structuredClone(content);
  delete c.event.photos;
  assert.ok(validateContent(c).some((p) => p.includes('event.photos')));
});

test('reporta un problema cuando una foto de la sección de datos no tiene alt', () => {
  const c = structuredClone(content);
  c.event.photos[1].alt = '';
  assert.ok(validateContent(c).some((p) => p.includes('event.photos[1].alt')));
});
