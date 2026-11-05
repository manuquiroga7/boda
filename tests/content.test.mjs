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

test('reporta un problema cuando la historia está vacía', () => {
  const c = structuredClone(content);
  c.story = [];
  assert.ok(validateContent(c).some((p) => p.includes('story')));
});

test('reporta un problema cuando una foto no tiene alt', () => {
  const c = structuredClone(content);
  c.story[0].alt = '';
  assert.ok(validateContent(c).some((p) => p.includes('story[0].alt')));
});

test('el versículo de ejemplo es Eclesiastés 4:12', () => {
  assert.match(content.verse.ref, /Eclesiastés 4:12/);
});
