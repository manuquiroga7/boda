import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountCompare } from '../assets/js/compare.js';

const setup = () => new JSDOM('<!doctype html><body></body>').window.document;

test('el selector muestra A, B y C y marca la portada actual', () => {
  const doc = setup();
  mountCompare(doc, 'b', () => {});
  const botones = [...doc.querySelectorAll('.comparar button')];
  assert.deepEqual(botones.map((b) => b.textContent.trim()), ['A', 'B', 'C']);
  assert.deepEqual(botones.map((b) => b.getAttribute('aria-pressed')), ['false', 'true', 'false']);
});

test('al tocar un botón avisa el estilo y actualiza cuál está marcado', () => {
  const doc = setup();
  const elegidos = [];
  mountCompare(doc, 'a', (e) => elegidos.push(e));
  const [, , c] = doc.querySelectorAll('.comparar button');
  c.click();
  assert.deepEqual(elegidos, ['c']);
  assert.equal(c.getAttribute('aria-pressed'), 'true');
  assert.equal(doc.querySelector('.comparar button').getAttribute('aria-pressed'), 'false');
});
