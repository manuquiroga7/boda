import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const RUTA = 'assets/img/fondo-perla.svg';
const base = readFileSync('assets/css/base.css', 'utf8');
const envelope = readFileSync('assets/css/envelope.css', 'utf8');
const cuantos = (svg, clase) => (svg.match(new RegExp(`class='${clase}'`, 'g')) ?? []).length;

test('existe el mosaico del fondo, liviano y sin filtros', () => {
  assert.ok(existsSync(RUTA));
  assert.ok(statSync(RUTA).size < 30 * 1024);
  const svg = readFileSync(RUTA, 'utf8');
  assert.doesNotMatch(svg, /<filter|feTurbulence/);
  assert.match(svg, /width='400' height='400'/);
});

test('el mosaico conserva las cruces y las fotitos', () => {
  const svg = readFileSync(RUTA, 'utf8');
  assert.ok(cuantos(svg, 'cruz') >= 5, 'faltan cruces');
  assert.ok(cuantos(svg, 'foto') >= 3, 'faltan fotitos');
});

test('el mosaico suma más elementos: palomas, ramitas de olivo, anillos, corazones, flores y destellos', () => {
  const svg = readFileSync(RUTA, 'utf8');
  for (const [clase, minimo] of [['paloma', 2], ['ramita', 2], ['anillos', 2], ['corazon', 3], ['flor', 3], ['destello', 4]]) {
    assert.ok(cuantos(svg, clase) >= minimo, `faltan elementos: ${clase} (hay ${cuantos(svg, clase)}, mínimo ${minimo})`);
  }
});

test('la página usa el mosaico sobre un fondo perla que se mueve con el scroll', () => {
  assert.match(base, /body\s*{[^}]*fondo-perla\.svg/);
  assert.match(base, /background-size:\s*400px 400px/);
  assert.doesNotMatch(base, /background[^;]*\bfixed\b/);
});

test('el sobre del inicio usa el mismo fondo perla para que la transición sea continua', () => {
  assert.match(envelope, /\.envelope\s*{[^}]*fondo-perla\.svg/);
  assert.match(envelope, /background-size:\s*400px 400px/);
});

test('no quedan los colores beige de la mesa anterior en el fondo', () => {
  assert.doesNotMatch(base, /--mesa-1|--mesa-2/);
});
