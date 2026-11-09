import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');
const base = readFileSync('assets/css/base.css', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');

test('la carta es una hoja de papel con sombra a los lados (se nota que es una carta)', () => {
  const app = css.match(/#app\s*{[^}]*}/)[0];
  assert.match(app, /background-color:\s*var\(--papel\)/);
  assert.match(app, /box-shadow:/);
  assert.match(app, /inset/);
});

test('no hay borde quemado ni textura antigua', () => {
  assert.doesNotMatch(css, /--marco|--borde-|feDiffuseLighting|background-blend-mode/);
  assert.doesNotMatch(css, /\.carta::after/);
  assert.doesNotMatch(main, /paper\.js|initPaper/);
  assert.equal(existsSync('assets/js/paper.js'), false);
});

// Reglas de rendimiento: la página scrollea una carta de ~4500 px de alto.
test('no se recorta la carta con clip-path ni se le aplica filter', () => {
  assert.doesNotMatch(css, /clip-path/);
  const carta = css.match(/\.carta\s*{[^}]*}/)[0];
  assert.doesNotMatch(carta, /filter\s*:/);
});

test('no hay fondos fijos (provocan repintado al scrollear)', () => {
  assert.doesNotMatch(base, /background[^;]*\bfixed\b/);
  assert.doesNotMatch(css, /background-attachment\s*:\s*fixed/);
});

test('no quedan plantas decorativas', () => {
  assert.doesNotMatch(css, /\.plant|flotar/);
});

test('las fotos entran deslizándose desde los costados, alternando lados, con las fotos de ancho completo', () => {
  assert.match(css, /\.js-reveal \.momento img,\s*\.js-reveal \.banda img\s*{[^}]*translate:\s*var\(--lado/);
  assert.match(css, /\.momento:nth-of-type\(even\) img\s*{\s*--lado:\s*5rem/);
  assert.match(css, /\.js-reveal \.banda\.is-visible img\s*{\s*translate:\s*0 0/);
  // se mueve con 'translate' (no 'transform') y sin efectos pesados
  const bloque = css.slice(css.indexOf('Las fotos entran'), css.indexOf('.js-reveal .is-visible img'));
  assert.doesNotMatch(bloque, /filter|clip-path|transform:/);
});

test('las fotos de datos van de borde a borde y se funden con el papel (sin marcos ni filtros)', () => {
  assert.match(css, /\.banda__velo\s*{[^}]*linear-gradient/);
  assert.match(css, /\.sec--datos\s*{[^}]*max-width:\s*none/);
});
