import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');

test('los datos se acomodan en dos columnas', () => {
  assert.match(css, /\.datos__grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('si queda una celda sola en la última fila, ocupa todo el ancho', () => {
  assert.match(css, /\.dato:last-child:nth-child\(odd\)\s*{[^}]*grid-column:\s*1\s*\/\s*-1/);
});
