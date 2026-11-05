import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');

test('el iframe del mapa no recibe toques hasta activarlo, y el contenedor tiene un fondo de respaldo', () => {
  assert.match(css, /\.mapa iframe\s*{[^}]*pointer-events:\s*none/);
  assert.match(css, /\.mapa\.is-activo iframe\s*{[^}]*pointer-events:\s*auto/);
  assert.match(css, /\.mapa\s*{[^}]*map\.svg/);
});
