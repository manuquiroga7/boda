import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edgePoints, buildMarcoSvg, initPaper } from '../assets/js/paper.js';

const OPTS = { inset: 4, jitter: 22, step: 22 };

test('edgePoints devuelve muchos puntos dentro de la caja y respeta el margen mínimo', () => {
  const pts = edgePoints(400, 1200, 1, OPTS);
  assert.ok(pts.length > 100);
  for (const [x, y] of pts) {
    assert.ok(x >= 4 - 1e-6 && x <= 396 + 1e-6, `x fuera de rango: ${x}`);
    assert.ok(y >= 4 - 1e-6 && y <= 1196 + 1e-6, `y fuera de rango: ${y}`);
  }
});

test('edgePoints es muy irregular: usa buena parte del rango de profundidad', () => {
  const pts = edgePoints(400, 3000, 5, OPTS);
  const lefts = pts.filter(([x, y]) => x < 100 && y > 200 && y < 2800).map(([x]) => x);
  assert.ok(Math.max(...lefts) - Math.min(...lefts) > 14, 'el borde izquierdo casi no varía');
});

test('edgePoints es determinista por semilla y cambia con otra', () => {
  const a = edgePoints(400, 900, 7, OPTS);
  assert.deepEqual(a, edgePoints(400, 900, 7, OPTS));
  assert.notDeepEqual(a, edgePoints(400, 900, 8, OPTS));
});

test('edgePoints no rompe con cajas diminutas o vacías', () => {
  assert.ok(edgePoints(0, 0, 1, OPTS).length >= 4);
  assert.ok(edgePoints(10, 10, 1, OPTS).length >= 4);
});

test('buildMarcoSvg es un SVG con el contorno, el borde quemado y la sombra', () => {
  const svg = buildMarcoSvg(380, 2000, 11);
  assert.match(svg, /^<svg /);
  assert.match(svg, /<path id='p'/);
  assert.match(svg, /clipPath/);
  assert.ok((svg.match(/<use /g) ?? []).length >= 10, 'faltan capas de chamuscado/sombra');
});

test('buildMarcoSvg no usa filtros SVG (son caros de dibujar en una imagen tan alta)', () => {
  const svg = buildMarcoSvg(380, 2000, 11);
  assert.doesNotMatch(svg, /<filter|feTurbulence|feGaussianBlur|mask=/);
});

test('buildMarcoSvg ocupa la caja más el margen de la sombra', () => {
  const svg = buildMarcoSvg(380, 2000, 11);
  assert.match(svg, /viewBox='0 0 436 2056'/);
});

test('initPaper fija --marco según el tamaño y se actualiza al cambiar', () => {
  const set = {};
  const el = { offsetWidth: 380, offsetHeight: 2000, style: { setProperty: (k, v) => (set[k] = v) } };
  let trigger;
  function FakeRO(cb) {
    trigger = cb;
    this.observe = () => {};
  }
  initPaper(el, FakeRO);
  assert.match(set['--marco'], /^url\("data:image\/svg\+xml,/);
  const before = set['--marco'];
  el.offsetHeight = 2600;
  trigger();
  assert.notEqual(set['--marco'], before);
});

test('initPaper sin ResizeObserver igual calcula el marco una vez', () => {
  const set = {};
  const el = { offsetWidth: 380, offsetHeight: 1500, style: { setProperty: (k, v) => (set[k] = v) } };
  initPaper(el, undefined);
  assert.match(set['--marco'], /^url\("data:image\/svg\+xml,/);
});
