import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const css = readFileSync('assets/css/sections.css', 'utf8');

test('el CSS declara Great Vibes desde un archivo propio del proyecto', () => {
  const face = css.match(/@font-face\s*{[^}]*Great Vibes[^}]*}/);
  assert.ok(face, 'falta @font-face de Great Vibes');
  const url = face[0].match(/url\("\.\.\/fonts\/([^"]+)"\)/);
  assert.ok(url, 'la fuente debe cargarse desde assets/fonts/');
  assert.ok(existsSync(`assets/fonts/${url[1]}`), `no existe assets/fonts/${url[1]}`);
});

test('la fuente es un woff2 válido y liviano', () => {
  const buf = readFileSync('assets/fonts/GreatVibes-Regular.woff2');
  assert.equal(buf.subarray(0, 4).toString('latin1'), 'wOF2');
  assert.ok(statSync('assets/fonts/GreatVibes-Regular.woff2').size < 100 * 1024);
});

test('el versículo usa Great Vibes con una alternativa cursiva', () => {
  const rule = css.match(/\.sec--versiculo p\s*{[^}]*}/)[0];
  assert.match(rule, /font-family:\s*'Great Vibes',\s*cursive/);
});
