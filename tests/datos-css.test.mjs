import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');

test('los datos se acomodan en dos columnas', () => {
  assert.match(css, /\.datos__grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('si queda una celda sola en la última fila, ocupa todo el ancho', () => {
  assert.match(css, /\.dato:last-child:nth-child\(odd\)[^{]*{[^}]*grid-column:\s*1\s*\/\s*-1/);
});

test('lugar y vestimenta ocupan todo el ancho (uno debajo del otro)', () => {
  assert.match(css, /\.dato--ancho[^{]*{[^}]*grid-column:\s*1\s*\/\s*-1/);
});

test('no hay línea divisora vertical entre las columnas de datos (solo la horizontal)', () => {
  assert.doesNotMatch(css, /\.dato[^{]*{[^}]*border-right\s*:\s*1px/);
  assert.match(css, /\.dato:nth-child\(n\+3\)\s*{[^}]*border-top:\s*1px/);
});
