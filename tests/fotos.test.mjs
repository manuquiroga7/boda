import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { content } from '../assets/js/content.js';

const fotos = [
  ...content.couple.photos.map((f) => ({ donde: 'couple.photos', ...f })),
  ...content.event.photos.map((f) => ({ donde: 'event.photos', ...f })),
];

test('hay fotos cargadas en la portada y "Te esperamos"', () => {
  assert.ok(content.couple.photos.length >= 1);
  assert.equal(content.event.photos.length, 3);
});

for (const f of fotos) {
  test(`foto ${f.src}: existe, es un JPEG liviano y no trae datos de ubicación`, () => {
    assert.ok(existsSync(f.src), `no existe ${f.src}`);
    const buf = readFileSync(f.src);
    assert.equal(buf[0], 0xff, 'no es un JPEG');
    assert.equal(buf[1], 0xd8, 'no es un JPEG');
    assert.ok(statSync(f.src).size <= 300 * 1024, `pesa demasiado: ${Math.round(statSync(f.src).size / 1024)} KB`);
    const texto = buf.toString('latin1');
    assert.ok(!texto.includes('Exif'), 'trae metadatos EXIF (puede incluir la ubicación)');
    assert.ok(!texto.includes('GPS'), 'trae datos GPS');
  });
}

test('ya no se usan las siluetas de ejemplo', () => {
  for (const f of fotos) assert.ok(!f.src.endsWith('.svg'), `sigue la silueta: ${f.src}`);
});

test('cada foto con foco usa el formato "X% Y%"', () => {
  for (const f of fotos) if (f.focus) assert.match(f.focus, /^\d{1,3}% \d{1,3}%$/, f.src);
});

test('ninguna foto se repite entre secciones', () => {
  const rutas = fotos.map((f) => f.src);
  assert.equal(new Set(rutas).size, rutas.length);
});
