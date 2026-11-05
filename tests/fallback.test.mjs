import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { content } from '../assets/js/content.js';
import { guardImages } from '../assets/js/images.js';

for (const file of ['index.html', 'para-ti-k7q2/index.html']) {
  test(`${file} trae un respaldo <noscript> con fecha, hora y lugar del contenido`, () => {
    const html = readFileSync(file, 'utf8');
    const block = html.match(/<noscript>([\s\S]*?)<\/noscript>/);
    assert.ok(block, 'falta <noscript>');
    for (const text of [content.couple.dateText, content.event.time, content.event.placeName, content.event.address]) {
      assert.ok(block[1].includes(text), `el respaldo no incluye: ${text}`);
    }
  });
}

test('una foto que falla se marca como is-broken (sin ícono roto)', () => {
  const dom = new JSDOM('<!doctype html><body><img id="x" src="no-existe.png" alt="foto"></body>');
  const doc = dom.window.document;
  guardImages(doc);
  const img = doc.getElementById('x');
  img.dispatchEvent(new dom.window.Event('error'));
  assert.ok(img.classList.contains('is-broken'));
});

test('una foto que ya había fallado antes de proteger también se marca', () => {
  const dom = new JSDOM('<!doctype html><body><img id="x" alt="foto"></body>');
  const doc = dom.window.document;
  const img = doc.getElementById('x');
  Object.defineProperty(img, 'complete', { value: true });
  Object.defineProperty(img, 'naturalWidth', { value: 0 });
  guardImages(doc);
  assert.ok(img.classList.contains('is-broken'));
});
