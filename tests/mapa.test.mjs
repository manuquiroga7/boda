import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { activarMapas } from '../assets/js/mapa.js';

const html = '<!doctype html><body><div class="mapa"><iframe></iframe><button type="button" class="mapa__activar">Tocá</button></div></body>';

test('tocar el mapa lo activa y quita el cartel', () => {
  const doc = new JSDOM(html).window.document;
  activarMapas(doc);
  const mapa = doc.querySelector('.mapa');
  assert.ok(!mapa.classList.contains('is-activo'));
  doc.querySelector('.mapa__activar').click();
  assert.ok(mapa.classList.contains('is-activo'));
  assert.equal(doc.querySelector('.mapa__activar'), null);
});

test('si no hay mapas en la página no falla', () => {
  const doc = new JSDOM('<!doctype html><body></body>').window.document;
  assert.doesNotThrow(() => activarMapas(doc));
});
