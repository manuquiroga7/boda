import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const RUTA = 'assets/img/fondo-perla.svg';
const base = readFileSync('assets/css/base.css', 'utf8');
const envelope = readFileSync('assets/css/envelope.css', 'utf8');

test('existe el mosaico del fondo, liviano y sin filtros', () => {
  assert.ok(existsSync(RUTA));
  assert.ok(statSync(RUTA).size < 20 * 1024);
  const svg = readFileSync(RUTA, 'utf8');
  assert.doesNotMatch(svg, /<filter|feTurbulence/);
  assert.match(svg, /width='320' height='320'/);
});

test('el mosaico tiene cruces y fotitos', () => {
  const svg = readFileSync(RUTA, 'utf8');
  assert.ok((svg.match(/class='cruz'/g) ?? []).length >= 5, 'faltan cruces');
  assert.ok((svg.match(/class='foto'/g) ?? []).length >= 3, 'faltan fotitos');
});

test('la página usa el mosaico sobre un fondo perla que se mueve con el scroll', () => {
  assert.match(base, /body\s*{[^}]*fondo-perla\.svg/);
  assert.doesNotMatch(base, /background[^;]*\bfixed\b/);
});

test('el sobre del inicio usa el mismo fondo perla para que la transición sea continua', () => {
  assert.match(envelope, /\.envelope\s*{[^}]*fondo-perla\.svg/);
});

test('no quedan los colores beige de la mesa anterior en el fondo', () => {
  assert.doesNotMatch(base, /--mesa-1|--mesa-2/);
});
