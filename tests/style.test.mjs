import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');
const base = readFileSync('assets/css/base.css', 'utf8');

// Reglas de rendimiento: la página scrollea una carta de ~4500 px de alto.
test('no se recorta la carta con clip-path ni se le aplica filter', () => {
  assert.doesNotMatch(css, /clip-path\s*:\s*var\(--borde/);
  const carta = css.match(/\.carta\s*{[^}]*}/)[0];
  assert.doesNotMatch(carta, /filter\s*:/);
});

test('no hay fondos fijos ni mezclas de fondo sobre la carta (provocan repintado al scrollear)', () => {
  assert.doesNotMatch(base, /background[^;]*\bfixed\b/);
  assert.doesNotMatch(css, /background-attachment\s*:\s*fixed/);
  assert.doesNotMatch(css, /background-blend-mode/);
});

test('el marco quemado se dibuja como imagen estática desde --marco', () => {
  assert.match(css, /\.carta::after\s*{[^}]*var\(--marco\)/);
});

test('las plantas se mueven con will-change para no repintar la carta', () => {
  assert.match(css, /\.plant\s*{[^}]*will-change:\s*transform/);
});
