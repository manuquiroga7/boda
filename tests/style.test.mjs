import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');

test('la carta no usa filter (no se dibuja bien sobre un elemento tan alto)', () => {
  const carta = css.match(/\.carta\s*{[^}]*}/)[0];
  assert.doesNotMatch(carta, /filter\s*:/);
});

test('la hoja usa recortes irregulares calculados por paper.js', () => {
  assert.match(css, /clip-path:\s*var\(--borde-exterior/);
  assert.match(css, /clip-path:\s*var\(--borde-interior/);
});
